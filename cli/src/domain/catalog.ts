/**
 * Catálogo de especialistas e detecção de tecnologias do projeto.
 */

import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { apiHeaders } from "./github.ts";
import { isFile, pathExists, resolvePath } from "./filesystem.ts";

export const DEFAULT_CATALOG_URL =
  "https://api.github.com/repos/promovaweb/specsfy/contents/specialists/catalog.json?ref=main";

/** Entrada normalizada do catálogo de especialistas. */
export interface CatalogEntryValue {
  name: string;
  description: string;
  category: string;
  tags: string[];
  files: string[];
  dependencies: string[];
  requires: string[];
}

interface CatalogPayload {
  schema_version: number;
  skills: Array<{
    name: string;
    description: string;
    category: string;
    tags?: string[];
    requires?: string[];
    detect?: { files?: string[]; dependencies?: string[] };
  }>;
}

/** Catálogo validado com resolução de dependências entre especialistas. */
export class Catalog {
  readonly entries: CatalogEntryValue[];
  readonly #byName: Map<string, CatalogEntryValue>;

  constructor(entries: CatalogEntryValue[]) {
    this.entries = [...entries].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    this.#byName = new Map(entries.map((entry) => [entry.name, entry]));
  }

  /** Constrói o catálogo a partir do schema JSON público. */
  static fromPayload(payload: unknown): Catalog {
    if (
      !payload ||
      typeof payload !== "object" ||
      (payload as Partial<CatalogPayload>).schema_version !== 1 ||
      !Array.isArray((payload as Partial<CatalogPayload>).skills)
    ) {
      throw new Error("versão de catálogo não suportada");
    }
    const source = payload as CatalogPayload;
    return new Catalog(
      source.skills.map((value) => ({
        name: value.name,
        description: value.description,
        category: value.category,
        tags: value.tags ?? [],
        files: value.detect?.files ?? [],
        dependencies: value.detect?.dependencies ?? [],
        requires: value.requires ?? [],
      })),
    );
  }

  /** Lê o catálogo de um arquivo local. */
  static async fromPath(path: string): Promise<Catalog> {
    return Catalog.fromPayload(JSON.parse(await readFile(resolvePath(path), "utf8")));
  }

  /** Obtém o catálogo remoto ou usa o override de ambiente. */
  static async fetch(url = DEFAULT_CATALOG_URL): Promise<Catalog> {
    const override = process.env.SPECSFY_SPECIALISTS_CATALOG;
    if (override) return Catalog.fromPath(override);
    const response = await fetch(url, {
      headers: await apiHeaders(
        "specsfy-cli",
        "application/vnd.github.raw+json",
      ),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      if ([401, 403, 404].includes(response.status)) {
        throw new Error(
          "catálogo de especialistas indisponível; autentique o GitHub " +
            "com `gh auth login` ou defina GH_TOKEN",
        );
      }
      throw new Error(`falha ao consultar catálogo: HTTP ${response.status}`);
    }
    return Catalog.fromPayload((await response.json()) as unknown);
  }

  /** Exige uma skill existente com o namespace de especialistas. */
  require(name: string): CatalogEntryValue {
    if (!name.startsWith("specsfy-specialist-")) {
      throw new Error(
        "a skill especialista deve usar o prefixo specsfy-specialist-",
      );
    }
    const entry = this.#byName.get(name);
    if (!entry) throw new Error(`skill não encontrada no catálogo: ${name}`);
    return entry;
  }

  /** Resolve requisitos em ordem topológica e rejeita ciclos. */
  resolve(names: string[]): CatalogEntryValue[] {
    const resolved: CatalogEntryValue[] = [];
    const completed = new Set<string>();
    const active = new Set<string>();
    const visit = (name: string): void => {
      if (completed.has(name)) return;
      if (active.has(name)) {
        throw new Error(`dependência circular entre especialistas: ${name}`);
      }
      const entry = this.require(name);
      active.add(name);
      for (const required of entry.requires) visit(required);
      active.delete(name);
      completed.add(name);
      resolved.push(entry);
    };
    for (const name of names) visit(name);
    return resolved;
  }

  /** Detecta tecnologias na raiz e nos subprojetos, respeitando exclusões Git. */
  async detect(project: string): Promise<CatalogEntryValue[]> {
    const root = resolvePath(project);
    const roots = await detectionRoots(root);
    const dependencies = new Set((await Promise.all(roots.map(readDependencies))).flatMap((items) => [...items]));
    const detected: CatalogEntryValue[] = [];
    for (const entry of this.entries) {
      const matches = await Promise.all(
        roots.flatMap((directory) => entry.files.map((marker) => pathExists(join(directory, marker)))),
      );
      if (
        matches.some(Boolean) ||
        entry.dependencies.some((dependency) => dependencies.has(dependency))
      ) {
        detected.push(entry);
      }
    }
    return detected;
  }
}

async function readDependencies(project: string): Promise<Set<string>> {
  const dependencies = new Set<string>();
  for (const filename of ["package.json", "composer.json"]) {
    const path = join(project, filename);
    if (!(await isFile(path))) continue;
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(await readFile(path, "utf8")) as Record<string, unknown>;
    } catch {
      continue;
    }
    for (const key of [
      "dependencies",
      "devDependencies",
      "require",
      "require-dev",
      "peerDependencies",
    ]) {
      const value = payload[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        for (const dependency of Object.keys(value)) dependencies.add(dependency);
      }
    }
  }
  return dependencies;
}

/** Visita subprojetos sem seguir symlinks, instalações de skills ou dependências. */
async function detectionRoots(project: string): Promise<string[]> {
  const roots: string[] = [project];
  const ignored = new Set([".git", ".agents", ".claude", ".specify", ".venv", "venv", "node_modules", "vendor", "dist", "build", "coverage", "__pycache__"]);
  const visit = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || ignored.has(entry.name) || entry.name.startsWith("venv_")) continue;
      const child = join(directory, entry.name);
      if (spawnSync("git", ["check-ignore", "--quiet", "--", child], { cwd: directory }).status === 0) continue;
      roots.push(child);
      await visit(child);
    }
  };
  await visit(project);
  return roots;
}
