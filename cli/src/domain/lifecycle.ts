/**
 * Physical lifecycle of specs in consumer projects.
 *
 * The folder expresses the operational state. The `Status` field in
 * `spec.md` is a verifiable mirror, kept by the same transition operation.
 * Failures are `AppError`s so every mode maps them to the same exit code:
 * unknown spec is NOT_FOUND, an invalid transition or effort is USAGE.
 */

import { Database } from "bun:sqlite";
import { createHash } from "node:crypto";
import { mkdir, readFile, realpath, rename } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { AppError, error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { scanBacklogs } from "./backlog.ts";
import { clickUpfyHandoff, type ClickUpfyHandoff } from "./clickupfy.ts";
import { pathExists, resolvePath, writeTextAtomic } from "./filesystem.ts";
import { syncMilestones } from "./milestones.ts";
import { findLegacySpecPaths, resolveSpecPath, scanSpecPaths, SPEC_FOLDERS, type SpecFolder } from "./spec-paths.ts";

export { SPEC_FOLDERS, type SpecFolder } from "./spec-paths.ts";

const STATUS_BY_FOLDER: Record<SpecFolder, string> = {
  draft: "Draft",
  defined: "Defined",
  planned: "Planned",
  "in-progress": "Implementing",
  review: "Reviewing",
  completed: "Complete",
};

const FOLDER_BY_STATUS = new Map(
  Object.entries(STATUS_BY_FOLDER).map(([folder, status]) => [
    status.toLowerCase(),
    folder as SpecFolder,
  ]),
);

const NEXT_FOLDERS: Record<SpecFolder, readonly SpecFolder[]> = {
  draft: ["draft", "defined"],
  defined: ["draft", "defined", "planned"],
  planned: ["defined", "planned", "in-progress"],
  "in-progress": ["planned", "in-progress", "review"],
  review: ["in-progress", "review", "completed"],
  completed: ["draft", "defined", "completed"],
};

/** States a spec in `folder` may move to, excluding staying where it is. */
export function nextFolders(folder: SpecFolder): SpecFolder[] {
  return NEXT_FOLDERS[folder].filter((candidate) => candidate !== folder);
}

const TABLE_STATUS = /^(\|\s*Status\s*\|\s*)([^|]*)(\|\s*)$/imu;
const BOLD_STATUS = /^(\*\*Status\*\*:\s*)(.+?)\s*$/imu;
const TABLE_FIELD = (field: string) => new RegExp(
  `^(\\|\\s*${escapeRegExp(field)}\\s*\\|\\s*)([^|]*)(\\|\\s*)$`,
  "imu",
);

/** Spec package located by its stable identifier. */
export interface ResolvedSpec {
  identifier: string;
  folder: SpecFolder;
  path: string;
  directory: string;
  status: string;
}

/** Result of a physical state change. */
export interface SpecTransition extends ResolvedSpec {
  from: SpecFolder;
  to: SpecFolder;
}

/** Options that make the effort update reproducible in automations. */
export interface EffortUpdateOptions {
  updatedAt?: string;
}

/** Locates a single spec, in the current or the legacy layout. */
export async function resolveSpec(project: string, identifier: string): Promise<ResolvedSpec> {
  const root = resolvePath(project);
  const matches = (await scanSpecPaths(root)).filter(
    (path) => basename(dirname(path)) === identifier,
  );
  if (!matches.length) throw error.notFound(`Spec not found: ${identifier}`);
  if (matches.length > 1) {
    throw error.usage(`More than one spec has the identifier ${identifier}`);
  }
  const path = matches[0]!;
  const content = await readFile(path, "utf8");
  const folder = folderFromPath(root, path, content);
  return {
    identifier,
    folder,
    path,
    directory: dirname(path),
    status: readStatus(content) ?? STATUS_BY_FOLDER[folder],
  };
}

/**
 * Resolves a spec selector, moves the spec, and updates its Status, backlinks and milestones.
 * An invalid transition throws USAGE with the accepted destinations in
 * `details.accepted`.
 */
export async function transitionSpec(
  project: string,
  selector: string,
  to: SpecFolder,
): Promise<SpecTransition & { clickupfy: ClickUpfyHandoff }> {
  assertFolder(to);
  const root = resolvePath(project);
  return withProjectTransitionLock(root, async () => {
    const identifier = basename(dirname(await resolveSpecPath(root, selector)));
    const spec = await resolveSpec(root, identifier);
    if (!NEXT_FOLDERS[spec.folder].includes(to)) {
      throw error.usage(
        `Invalid transition: ${spec.folder} to ${to}. Accepted from ${spec.folder}: ${NEXT_FOLDERS[spec.folder].join(", ")}.`,
        { from: spec.folder, to, accepted: [...NEXT_FOLDERS[spec.folder]] },
      );
    }
    const result = await relocateSpec(root, spec, to);
    await syncMilestones(root);
    return { ...result, clickupfy: await clickUpfyHandoff(root, result.path, "transition") };
  });
}

async function withProjectTransitionLock<T>(root: string, operation: () => Promise<T>): Promise<T> {
  // Resolving a selector and updating the derived index both scan the whole project.
  const key = createHash("sha256").update(await realpath(root)).digest("hex");
  const directory = join(tmpdir(), `specsfy-transitions-${process.getuid?.() ?? "user"}`);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const lock = new Database(join(directory, key));
  // SQLite coordinates processes on the same file and releases the lock on process exit.
  // The empty lock file stays in place so waiting processes always use the same inode.
  try {
    lock.exec("PRAGMA busy_timeout = 0");
    const deadline = Date.now() + 30_000;
    for (;;) {
      try {
        lock.exec("BEGIN IMMEDIATE");
        break;
      } catch (cause) {
        if ((cause as { code?: string }).code !== "SQLITE_BUSY") throw cause;
        if (Date.now() >= deadline) throw new Error(`Timed out waiting for the transition lock in ${root}`, { cause });
        await Bun.sleep(25);
      }
    }
    return await operation();
  } finally {
    lock.close();
  }
}

function specLocations(root: string, identifier: string): string[] {
  return [...SPEC_FOLDERS, "specs", ""].map((folder) => join(root, "specs", folder, identifier, "spec.md"));
}

function portableRelative(from: string, to: string): string {
  return relative(from, to).split(sep).join("/");
}

async function relocateSpec(root: string, spec: ResolvedSpec, to: SpecFolder): Promise<SpecTransition> {
  const { identifier } = spec;
  const status = STATUS_BY_FOLDER[to];
  const targetDirectory = join(root, "specs", to, identifier);
  const targetPath = join(targetDirectory, "spec.md");
  const moves = spec.directory !== targetDirectory;
  if (moves && await pathExists(targetDirectory)) {
    throw new AppError(ExitCode.GENERIC_ERROR, `The destination already holds a spec: ${targetDirectory}`);
  }
  const content = await readFile(spec.path, "utf8");
  const locations = specLocations(root, identifier);
  const targetResearch = portableRelative(root, targetDirectory) + "/research/";
  const updated = locations.reduce((markdown, path) =>
    markdown.replaceAll(portableRelative(root, dirname(path)) + "/research/", targetResearch),
    updateStatus(content, status),
  );
  const sources = new Set(locations.filter((path) => path !== targetPath));
  const backlinks = (await scanBacklogs(root)).map(({ path, content }) => ({
    path, content, updated: updatePromotedPath(root, path, content, sources, targetPath),
  })).filter((item) => item.updated !== item.content);

  if (moves) {
    await mkdir(dirname(targetDirectory), { recursive: true });
    await rename(spec.directory, targetDirectory);
  }
  const written: typeof backlinks = [];
  let statusWritten = false;
  try {
    if (updated !== content) {
      await writeTextAtomic(targetPath, updated);
      statusWritten = true;
    }
    for (const item of backlinks) {
      if (await readFile(item.path, "utf8") !== item.content) {
        throw new Error(`Backlog item changed during the transition: ${item.path}`);
      }
      await writeTextAtomic(item.path, item.updated);
      written.push(item);
    }
  } catch (cause) {
    const rollback = await Promise.allSettled([
      ...written.map(async (item) => {
        const current = await readFile(item.path, "utf8");
        const restored = current === item.updated ? item.content :
          updatePromotedPath(root, item.path, current, new Set([targetPath]), spec.path);
        if (current !== restored) await writeTextAtomic(item.path, restored);
      }),
      (async () => {
        if (statusWritten) await writeTextAtomic(targetPath, content);
        if (moves) await rename(targetDirectory, spec.directory);
      })(),
    ]);
    const failures = rollback.flatMap((result) => result.status === "rejected" ? [result.reason] : []);
    if (failures.length) throw new AggregateError([cause, ...failures], `Transition rollback failed: ${[cause, ...failures].join("; ")}`);
    throw cause;
  }

  return { identifier, from: spec.folder, to, folder: to, path: targetPath, directory: targetDirectory, status };
}

function updatePromotedPath(root: string, backlogPath: string, content: string, sources: ReadonlySet<string>, target: string): string {
  return content.replace(
    /^( {0,3}\|[ \t]*Spec promovida[ \t]*\|[ \t]*)((?:\\\||[^|\r\n])*?)([ \t]*\|[ \t]*)(?=\r?$)/gim,
    (row, before: string, cell: string, after: string) => {
      const quoted = /^(`+)(.*?)\1$/u.exec(cell);
      const link = quoted ? undefined : /^(\[(?:\\.|[^\]\\])*\]\([ \t]*)(<[^>]+>|[^\s)]+)(.*\))$/u.exec(cell);
      const value = quoted?.[2] ?? link?.[2] ?? cell;
      const bracketed = link && value.startsWith("<");
      const destination = bracketed ? value.slice(1, -1) : value;
      const suffix = link ? /[?#].*$/u.exec(destination)?.[0] ?? "" : "";
      let path = destination.slice(0, destination.length - suffix.length).replaceAll("\\", "/");
      if (link) {
        if (/^(?:[a-z][a-z\d+.-]*:|\/)/iu.test(path)) return row;
        try {
          path = decodeURI(path);
        } catch {
          return row;
        }
      }
      const base = link ? dirname(backlogPath) : root;
      if (!sources.has(resolve(base, path))) return row;
      const next = isAbsolute(path) ? target.split(sep).join("/") : portableRelative(base, target);
      const formatted = path.startsWith("./") ? "./" + next : next;
      if (link) {
        const href = encodeURI(formatted) + suffix;
        return before + link[1] + (bracketed ? `<${href}>` : href) + link[3] + after;
      }
      const ticks = quoted?.[1] ?? "";
      return before + ticks + formatted + ticks + after;
    },
  );
}

/** Migrates specs from both legacy layouts to the current state folders. */
export async function migrateSpecs(project: string): Promise<SpecTransition[]> {
  const root = resolvePath(project);
  return withProjectTransitionLock(root, async () => {
    const results: SpecTransition[] = [];
    for (const path of await findLegacySpecPaths(root)) {
      const identifier = basename(dirname(path));
      const spec = await resolveSpec(root, identifier);
      if (spec.path !== path) continue;
      const status = readStatus(await readFile(path, "utf8"));
      const to = status ? FOLDER_BY_STATUS.get(status.toLowerCase()) : undefined;
      if (!to) {
        throw error.usage(`Invalid Status to migrate ${identifier}: ${status ?? "missing"}`);
      }
      results.push(await relocateSpec(root, spec, to));
    }
    if (results.length) await syncMilestones(root);
    return results;
  });
}

/** Updates the estimated effort and keeps a traceable rationale. */
export async function updateSpecEffort(
  project: string,
  identifier: string,
  effort: number,
  rationale: string,
  options: EffortUpdateOptions = {},
): Promise<ResolvedSpec & { effort: number }> {
  if (!Number.isInteger(effort) || effort < 1 || effort > 10) {
    throw error.usage("Effort must be an integer between 1 and 10");
  }
  const normalizedRationale = rationale.trim().replace(/\s+/gu, " ");
  if (!normalizedRationale) throw error.usage("Provide the effort rationale");
  const spec = await resolveSpec(project, identifier);
  const content = await readFile(spec.path, "utf8");
  const previous = readTableField(content, "Effort") ?? "não informado";
  const updatedAt = options.updatedAt ?? new Date().toISOString();
  let updated = setTableField(content, "Effort", String(effort));
  updated = setTableField(updated, "Effort updated at", updatedAt);
  updated = setTableField(updated, "Effort rationale", normalizedRationale);
  updated = appendEffortHistory(updated, updatedAt, previous, effort, normalizedRationale);
  await writeTextAtomic(spec.path, updated);
  return { ...spec, effort };
}

/** Status expected for each folder, for scripts and interfaces. */
export function statusForFolder(folder: SpecFolder): string {
  assertFolder(folder);
  return STATUS_BY_FOLDER[folder];
}

function folderFromPath(root: string, path: string, content?: string): SpecFolder {
  const folder = path.slice(join(root, "specs").length).split(/[\\/]/u)[1];
  if (folder && SPEC_FOLDERS.includes(folder as SpecFolder)) return folder as SpecFolder;
  const status = content ? readStatus(content) : undefined;
  if (status && FOLDER_BY_STATUS.has(status.toLowerCase())) {
    return FOLDER_BY_STATUS.get(status.toLowerCase())!;
  }
  return "draft";
}

function readStatus(content: string): string | undefined {
  for (const line of content.split(/\r?\n/u)) {
    const table = TABLE_STATUS.exec(line);
    if (table?.[2]?.trim()) return table[2].trim();
    const bold = BOLD_STATUS.exec(line);
    if (bold?.[2]?.trim()) return bold[2].trim();
  }
  return undefined;
}

function updateStatus(content: string, status: string): string {
  if (TABLE_STATUS.test(content)) {
    return content.replace(TABLE_STATUS, `$1${status} $3`);
  }
  if (BOLD_STATUS.test(content)) {
    return content.replace(BOLD_STATUS, `$1${status}`);
  }
  const newline = content.endsWith("\n") ? "" : "\n";
  return `${content}${newline}\n| Status | ${status} |\n`;
}

function readTableField(content: string, field: string): string | undefined {
  const expression = TABLE_FIELD(field);
  for (const line of content.split(/\r?\n/u)) {
    const match = expression.exec(line);
    if (match?.[2]?.trim()) return match[2].trim();
  }
  return undefined;
}

function setTableField(content: string, field: string, value: string): string {
  const expression = TABLE_FIELD(field);
  if (expression.test(content)) return content.replace(expression, `$1${value} $3`);
  const newline = content.endsWith("\n") ? "" : "\n";
  return `${content}${newline}| ${field} | ${value} |\n`;
}

function appendEffortHistory(
  content: string,
  updatedAt: string,
  previous: string,
  effort: number,
  rationale: string,
): string {
  const line = `- ${updatedAt}: ${previous} → ${effort}. ${rationale}`;
  const heading = "## Effort history";
  if (content.includes(heading)) {
    return content.replace(heading, `${heading}\n\n${line}`);
  }
  const newline = content.endsWith("\n") ? "" : "\n";
  return `${content}${newline}\n${heading}\n\n${line}\n`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function assertFolder(folder: string): asserts folder is SpecFolder {
  if (!SPEC_FOLDERS.includes(folder as SpecFolder)) {
    throw error.usage(`Invalid state folder: ${folder}. Accepted: ${SPEC_FOLDERS.join(", ")}.`);
  }
}
