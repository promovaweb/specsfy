/**
 * Physical lifecycle of specs in consumer projects.
 *
 * The folder expresses the operational state. The `Status` field in
 * `spec.md` is a verifiable mirror, kept by the same transition operation.
 * Failures are `AppError`s so every mode maps them to the same exit code:
 * unknown spec is NOT_FOUND, an invalid transition or effort is USAGE.
 */

import { mkdir, readFile, readdir, rename } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { AppError, error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { isFile, pathExists, resolvePath, writeTextAtomic } from "./filesystem.ts";

export const SPEC_FOLDERS = [
  "draft",
  "defined",
  "planned",
  "in-progress",
  "review",
  "completed",
] as const;

export type SpecFolder = (typeof SPEC_FOLDERS)[number];

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

/** Lists spec paths of every layout the framework accepts. */
export async function scanSpecPaths(project: string): Promise<string[]> {
  return findSpecPaths(resolvePath(project));
}

/** Locates a single spec, in the current or the legacy layout. */
export async function resolveSpec(project: string, identifier: string): Promise<ResolvedSpec> {
  const root = resolvePath(project);
  const matches = (await findSpecPaths(root)).filter(
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
 * Moves a spec between adjacent states and updates its mirrored Status.
 * An invalid transition throws USAGE with the accepted destinations in
 * `details.accepted`.
 */
export async function transitionSpec(
  project: string,
  identifier: string,
  to: SpecFolder,
): Promise<SpecTransition> {
  assertFolder(to);
  const spec = await resolveSpec(project, identifier);
  if (!NEXT_FOLDERS[spec.folder].includes(to)) {
    throw error.usage(
      `Invalid transition: ${spec.folder} to ${to}. Accepted from ${spec.folder}: ${NEXT_FOLDERS[spec.folder].join(", ")}.`,
      { from: spec.folder, to, accepted: [...NEXT_FOLDERS[spec.folder]] },
    );
  }
  const status = STATUS_BY_FOLDER[to];
  const content = await readFile(spec.path, "utf8");
  const updated = updateResearchPaths(
    updateStatus(content, status),
    spec.folder,
    to,
    identifier,
  );
  const targetDirectory = join(resolvePath(project), "specs", to, identifier);
  if (spec.directory !== targetDirectory) {
    if (await pathExists(targetDirectory)) {
      throw new AppError(ExitCode.GENERIC_ERROR, `The destination already holds a spec: ${targetDirectory}`);
    }
    await mkdir(dirname(targetDirectory), { recursive: true });
    await writeTextAtomic(spec.path, updated);
    await rename(spec.directory, targetDirectory);
  } else {
    await writeTextAtomic(spec.path, updated);
  }
  return {
    identifier,
    from: spec.folder,
    to,
    folder: to,
    path: join(targetDirectory, "spec.md"),
    directory: targetDirectory,
    status,
  };
}

/** Migrates specs from both legacy layouts to the current state folders. */
export async function migrateSpecs(project: string): Promise<SpecTransition[]> {
  const root = resolvePath(project);
  const legacy = await findLegacySpecPaths(root);
  const results: SpecTransition[] = [];
  for (const path of legacy) {
    const identifier = basename(dirname(path));
    const content = await readFile(path, "utf8");
    const status = readStatus(content);
    const to = status ? FOLDER_BY_STATUS.get(status.toLowerCase()) : undefined;
    if (!to) {
      throw error.usage(`Invalid Status to migrate ${identifier}: ${status ?? "missing"}`);
    }
    const sourceDirectory = dirname(path);
    const targetDirectory = join(root, "specs", to, identifier);
    if (await pathExists(targetDirectory)) {
      throw new AppError(ExitCode.GENERIC_ERROR, `The destination already holds a spec: ${targetDirectory}`);
    }
    await writeTextAtomic(path, updateStatus(content, STATUS_BY_FOLDER[to]));
    await mkdir(dirname(targetDirectory), { recursive: true });
    await rename(sourceDirectory, targetDirectory);
    results.push({
      identifier,
      from: folderFromLegacyStatus(status!),
      to,
      folder: to,
      path: join(targetDirectory, "spec.md"),
      directory: targetDirectory,
      status: STATUS_BY_FOLDER[to],
    });
  }
  return results;
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

async function findSpecPaths(root: string): Promise<string[]> {
  const current = await Promise.all(
    SPEC_FOLDERS.map(async (folder) => listSpecPaths(join(root, "specs", folder))),
  );
  return [...current.flat(), ...(await findLegacySpecPaths(root))].sort();
}

async function findLegacySpecPaths(root: string): Promise<string[]> {
  const parents = [join(root, "specs", "specs")];
  const directPaths: string[] = [];
  const direct = join(root, "specs");
  try {
    for (const entry of await readdir(direct, { withFileTypes: true })) {
      if (entry.isDirectory() && !SPEC_FOLDERS.includes(entry.name as SpecFolder) &&
        !["inbox", "backlog", "specs"].includes(entry.name)) {
        const path = join(direct, entry.name, "spec.md");
        if (await isFile(path)) directPaths.push(path);
      }
    }
  } catch {
    return [];
  }
  return [...directPaths, ...(await Promise.all(parents.map(listSpecPaths))).flat()].sort();
}

async function listSpecPaths(parent: string): Promise<string[]> {
  try {
    const entries = await readdir(parent, { withFileTypes: true });
    const candidates = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(parent, entry.name, "spec.md"));
    const available = await Promise.all(candidates.map(async (path) => ({ path, ok: await isFile(path) })));
    return available.filter((entry) => entry.ok).map((entry) => entry.path);
  } catch {
    return [];
  }
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

/** Keeps the research index aligned with the physical folder after a transition. */
function updateResearchPaths(
  content: string,
  from: SpecFolder,
  to: SpecFolder,
  identifier: string,
): string {
  if (from === to) return content;
  const source = `specs/${from}/${identifier}/research/`;
  const target = `specs/${to}/${identifier}/research/`;
  return content.replaceAll(source, target);
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

function folderFromLegacyStatus(status: string): SpecFolder {
  return FOLDER_BY_STATUS.get(status.toLowerCase()) ?? "draft";
}

function assertFolder(folder: string): asserts folder is SpecFolder {
  if (!SPEC_FOLDERS.includes(folder as SpecFolder)) {
    throw error.usage(`Invalid state folder: ${folder}. Accepted: ${SPEC_FOLDERS.join(", ")}.`);
  }
}
