/**
 * Contrato do `skills-lock.json` gerado pelo gerenciador oficial de skills.
 */

import { stat } from "node:fs/promises";
import { join } from "node:path";
import {
  isFile,
  readJson,
  resolvePath,
  writeTextAtomic,
} from "./filesystem.js";

export const LOCK_FILENAME = "skills-lock.json";

/** Versões do lock lidas pelo CLI; o gerenciador `skills` grava a 2 desde que passou a registrar a origem de cada skill. */
const SUPPORTED_LOCK_VERSIONS: ReadonlySet<unknown> = new Set([1, 2]);

/** Estrutura mínima compatível com o CLI `skills`. */
export interface SkillsLock {
  version: 1 | 2;
  skills: Record<string, unknown>;
  [key: string]: unknown;
}

/** Cria um lock vazio em memória. */
export function emptySkillsLock(): SkillsLock {
  return { version: 1, skills: {} };
}

/** Lê o lock ou materializa a estrutura mínima quando ele não existe. */
export async function ensureSkillsLock(project: string): Promise<SkillsLock> {
  const root = resolvePath(project);
  await assertConsumerProject(root);
  const path = join(root, LOCK_FILENAME);
  if (!(await isFile(path))) {
    await writeTextAtomic(path, `${JSON.stringify(emptySkillsLock(), null, 2)}\n`);
  }
  return readSkillsLock(root);
}

/** Lê e valida o lock oficial sem criá-lo. */
export async function readSkillsLock(project: string): Promise<SkillsLock> {
  const root = resolvePath(project);
  const path = join(root, LOCK_FILENAME);
  if (!(await isFile(path))) return emptySkillsLock();
  let payload: unknown;
  try {
    payload = await readJson(path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`lock inválido: ${path}: ${message}`);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(`lock inválido: ${path}`);
  }
  const lock = payload as Partial<SkillsLock>;
  if (!SUPPORTED_LOCK_VERSIONS.has(lock.version)) {
    throw new Error(`versão de lock não suportada em ${path}`);
  }
  if (!lock.skills || typeof lock.skills !== "object" || Array.isArray(lock.skills)) {
    throw new Error(`campo skills inválido em ${path}`);
  }
  return lock as SkillsLock;
}

/** Retorna os nomes registrados no lock. */
export async function installedSkillNames(
  project: string,
  create = true,
): Promise<Set<string>> {
  const payload = create
    ? await ensureSkillsLock(project)
    : await readSkillsLock(project);
  return new Set(Object.keys(payload.skills));
}

/** Retorna um fingerprint barato do lock para polling da TUI. */
export async function skillsLockFingerprint(project: string): Promise<string> {
  const path = join(resolvePath(project), LOCK_FILENAME);
  if (!(await isFile(path))) return "missing";
  try {
    const metadata = await stat(path, { bigint: true });
    return `${metadata.mtimeNs}:${metadata.size}`;
  } catch {
    return "unreadable";
  }
}

/** Impede instalação na raiz oficial do monorepo Specsfy. */
export async function assertConsumerProject(project: string): Promise<void> {
  const path = join(resolvePath(project), "AGENTS.md");
  if (!(await isFile(path))) return;
  const { readFile } = await import("node:fs/promises");
  const content = (await readFile(path, "utf8")).toLowerCase();
  if (
    content.includes("monorepo oficial do specsfy") ||
    content.includes("workspace specsfy dev")
  ) {
    throw new Error("operação recusada no monorepo oficial do Specsfy");
  }
}
