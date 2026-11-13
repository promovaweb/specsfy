/**
 * Specialist catalog and detection of the project's technologies.
 *
 * The catalog is `specialists/catalog.json` of the framework repository
 * (setting `catalog.repository`). For GitHub repositories it is read through
 * the contents API with the token of `github.ts`; for any other Git URL it
 * comes from a shallow clone. `SPECSFY_SPECIALISTS_CATALOG` points to a local
 * file and skips the network. Failures are `AppError` with the exit code of
 * their family (USAGE, NOT_FOUND, CREDENTIALS, NETWORK_OR_API).
 */

import { execFile, spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { AppError, error as appError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { apiHeaders } from "./github.ts";
import { isFile, pathExists, resolvePath } from "./filesystem.ts";

const execFileAsync = promisify(execFile);

/** Default framework repository, same as the `catalog.repository` setting default. */
export const DEFAULT_REPOSITORY = "https://github.com/promovaweb/specsfy";

/** Path of the catalog inside the framework repository. */
export const CATALOG_PATH = "specialists/catalog.json";

export const DEFAULT_CATALOG_URL = catalogApiUrl(DEFAULT_REPOSITORY)!;

/** Normalized entry of the specialist catalog. */
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

/**
 * GitHub contents API URL of the catalog for a GitHub repository URL
 * (`https://github.com/<owner>/<repo>[.git]`), or undefined for other hosts.
 */
export function catalogApiUrl(repository: string): string | undefined {
  const match = /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/.exec(repository.trim());
  if (!match) return undefined;
  return `https://api.github.com/repos/${match[1]}/${match[2]}/contents/${CATALOG_PATH}?ref=main`;
}

/** Validated catalog with dependency resolution between specialists. */
export class Catalog {
  readonly entries: CatalogEntryValue[];
  readonly #byName: Map<string, CatalogEntryValue>;

  constructor(entries: CatalogEntryValue[]) {
    this.entries = [...entries].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    this.#byName = new Map(entries.map((entry) => [entry.name, entry]));
  }

  /** Builds the catalog from the public JSON schema. */
  static fromPayload(payload: unknown): Catalog {
    if (
      !payload ||
      typeof payload !== "object" ||
      (payload as Partial<CatalogPayload>).schema_version !== 1 ||
      !Array.isArray((payload as Partial<CatalogPayload>).skills)
    ) {
      throw new AppError(ExitCode.NETWORK_OR_API, "unsupported catalog version");
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

  /** Reads the catalog from a local file. */
  static async fromPath(path: string): Promise<Catalog> {
    let text: string;
    try {
      text = await readFile(resolvePath(path), "utf8");
    } catch {
      throw appError.notFound(`catalog file not found: ${path}`);
    }
    return Catalog.fromPayload(JSON.parse(text));
  }

  /**
   * Fetches the catalog of a framework repository, or reads the file named
   * by SPECSFY_SPECIALISTS_CATALOG.
   */
  static async fetch(repository = DEFAULT_REPOSITORY): Promise<Catalog> {
    const override = process.env.SPECSFY_SPECIALISTS_CATALOG;
    if (override) return Catalog.fromPath(override);
    const url = catalogApiUrl(repository);
    if (!url) return Catalog.fromClone(repository);
    let response: Response;
    try {
      response = await fetch(url, {
        headers: await apiHeaders("specsfy-cli", "application/vnd.github.raw+json"),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (e) {
      throw appError.network(`could not reach the specialist catalog: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (!response.ok) {
      if ([401, 403, 404].includes(response.status)) {
        throw appError.credentials(
          "specialist catalog unavailable; save a GitHub token with " +
            "`specsfy credentials set github.token`, set GH_TOKEN or run `gh auth login`",
          { status: response.status },
        );
      }
      throw appError.network(`catalog request failed: HTTP ${response.status}`, { status: response.status });
    }
    return Catalog.fromPayload((await response.json()) as unknown);
  }

  /** Reads the catalog from a shallow clone of a non-GitHub repository. */
  static async fromClone(repository: string): Promise<Catalog> {
    const temporary = await mkdtemp(join(tmpdir(), "specsfy-catalog-"));
    try {
      try {
        await execFileAsync("git", ["clone", "--depth", "1", repository, join(temporary, "checkout")]);
      } catch (e) {
        const detail = String((e as { stderr?: unknown }).stderr ?? "").trim();
        throw appError.network(`could not clone ${repository}${detail ? `: ${detail}` : ""}`);
      }
      return await Catalog.fromPath(join(temporary, "checkout", CATALOG_PATH));
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  }

  /** Requires an existing skill in the specialist namespace. */
  require(name: string): CatalogEntryValue {
    if (!name.startsWith("specsfy-specialist-")) {
      throw appError.usage(
        `specialist skills must use the specsfy-specialist- prefix: ${name}`,
        { name },
      );
    }
    const entry = this.#byName.get(name);
    if (!entry) throw appError.notFound(`skill not found in the catalog: ${name}`, { name });
    return entry;
  }

  /** Resolves requirements in topological order and rejects cycles. */
  resolve(names: string[]): CatalogEntryValue[] {
    const resolved: CatalogEntryValue[] = [];
    const completed = new Set<string>();
    const active = new Set<string>();
    const visit = (name: string): void => {
      if (completed.has(name)) return;
      if (active.has(name)) {
        throw new AppError(ExitCode.GENERIC_ERROR, `circular dependency between specialists: ${name}`);
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

  /** Detects technologies at the root and in subprojects, honoring Git ignores. */
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

/** Visits subprojects without following symlinks, skill installs or dependencies. */
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
