/**
 * Contract of the `skills-lock.json` written by the official skills manager.
 *
 * Failures are `AppError`: an invalid lock is GENERIC_ERROR and running in
 * the official Specsfy monorepo is USAGE.
 */

import { stat } from "node:fs/promises";
import { join } from "node:path";
import {
  isFile,
  readJson,
  resolvePath,
  writeTextAtomic,
} from "./filesystem.ts";
import { AppError, error as appError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";

export const LOCK_FILENAME = "skills-lock.json";

/** Minimal structure compatible with the `skills` CLI. */
export interface SkillsLock {
  version: 1;
  skills: Record<string, unknown>;
  [key: string]: unknown;
}

/** Creates an empty lock in memory. */
export function emptySkillsLock(): SkillsLock {
  return { version: 1, skills: {} };
}

/** Reads the lock or writes the minimal structure when it does not exist. */
export async function ensureSkillsLock(project: string): Promise<SkillsLock> {
  const root = resolvePath(project);
  await assertConsumerProject(root);
  const path = join(root, LOCK_FILENAME);
  if (!(await isFile(path))) {
    await writeTextAtomic(path, `${JSON.stringify(emptySkillsLock(), null, 2)}\n`);
  }
  return readSkillsLock(root);
}

/** Reads and validates the official lock without creating it. */
export async function readSkillsLock(project: string): Promise<SkillsLock> {
  const root = resolvePath(project);
  const path = join(root, LOCK_FILENAME);
  if (!(await isFile(path))) return emptySkillsLock();
  let payload: unknown;
  try {
    payload = await readJson(path);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw invalidLock(`invalid lock: ${path}: ${message}`);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw invalidLock(`invalid lock: ${path}`);
  }
  const lock = payload as Partial<SkillsLock>;
  if (lock.version !== 1) {
    throw invalidLock(`unsupported lock version in ${path}`);
  }
  if (!lock.skills || typeof lock.skills !== "object" || Array.isArray(lock.skills)) {
    throw invalidLock(`invalid skills field in ${path}`);
  }
  return lock as SkillsLock;
}

/** Returns the names registered in the lock. */
export async function installedSkillNames(
  project: string,
  create = true,
): Promise<Set<string>> {
  const payload = create
    ? await ensureSkillsLock(project)
    : await readSkillsLock(project);
  return new Set(Object.keys(payload.skills));
}

/** Returns a cheap fingerprint of the lock for TUI polling. */
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

/** Refuses to install in the root of the official Specsfy monorepo. */
export async function assertConsumerProject(project: string): Promise<void> {
  const path = join(resolvePath(project), "AGENTS.md");
  if (!(await isFile(path))) return;
  const { readFile } = await import("node:fs/promises");
  const content = (await readFile(path, "utf8")).toLowerCase();
  if (
    content.includes("monorepo oficial do specsfy") ||
    content.includes("workspace specsfy dev")
  ) {
    throw appError.usage("operation refused in the official Specsfy monorepo");
  }
}

function invalidLock(message: string): AppError {
  return new AppError(ExitCode.GENERIC_ERROR, message);
}
