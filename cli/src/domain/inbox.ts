/**
 * Exit of a capture from the active queue in `specs/inbox/`.
 *
 * A capture stays in the active queue while part of the request has no
 * destination. When specs with `Definition Gate: Passed` cover the whole
 * request, it moves to `specs/inbox/processed/` with the original text
 * intact, the mirrored `Status` and updated links. Judging coverage belongs
 * to the person or the agent; this module only performs the move when the
 * gate allows it. The metadata values written to the file (`Capturada`,
 * `Processada`, `Spec derivada`) follow the framework templates.
 *
 * Failures are `AppError`s: no spec given is USAGE, a missing capture is
 * NOT_FOUND and a spec without the Definition Gate passed is GATE_FAILED.
 */

import { mkdir, readFile, readdir, rename } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { AppError, error } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { isFile, pathExists, resolvePath, writeTextAtomic } from "./filesystem.ts";
import { resolveSpec, SPEC_FOLDERS, type ResolvedSpec } from "./lifecycle.ts";

export const INBOX_FOLDER = "inbox";
export const INBOX_PROCESSED_FOLDER = "processed";

const STATUS_CAPTURED = "Capturada";
const STATUS_PROCESSED = "Processada";
const FIELD_STATUS = "Status";
const FIELD_SPEC = "Spec derivada";
const FIELD_PROCESSED_AT = "Processada em";
const EMPTY_VALUES = new Set(["", "nenhuma", "nenhum", "—", "-"]);

const TABLE_ROW = /^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/u;

/** Projection of a file in `specs/inbox/` or `specs/inbox/processed/`. */
export interface InboxCapture {
  name: string;
  path: string;
  status: string;
  processed: boolean;
}

/** Options of the capture scan. */
export interface ScanInboxOptions {
  includeProcessed?: boolean;
}

/** Options that make processing reproducible in automations. */
export interface ProcessInboxOptions {
  processedAt?: string;
}

/** Result of moving a capture out of the active queue. */
export interface InboxProcessing {
  name: string;
  from: string;
  to: string;
  path: string;
  status: string;
  specs: Array<Pick<ResolvedSpec, "identifier" | "folder"> & { path: string }>;
  updated_references: string[];
}

/** Lists captures in a stable order: active first, processed after. */
export async function scanInboxCaptures(
  project: string,
  options: ScanInboxOptions = {},
): Promise<InboxCapture[]> {
  const root = resolvePath(project);
  const active = await listCaptures(join(root, "specs", INBOX_FOLDER), false);
  if (!options.includeProcessed) return active;
  const processed = await listCaptures(
    join(root, "specs", INBOX_FOLDER, INBOX_PROCESSED_FOLDER),
    true,
  );
  return [...active, ...processed];
}

/**
 * Moves a capture to `specs/inbox/processed/` when every given spec has the
 * Definition Gate passed. Keeps the original text, records the derived specs
 * and updates the references in `specs/`.
 */
export async function processInboxCapture(
  project: string,
  capture: string,
  specIdentifiers: readonly string[],
  options: ProcessInboxOptions = {},
): Promise<InboxProcessing> {
  const root = resolvePath(project);
  const identifiers = [...new Set(specIdentifiers.map((value) => value.trim()).filter(Boolean))];
  if (!identifiers.length) {
    throw error.usage("Provide at least one spec with --spec <id> that covers the capture");
  }

  const name = captureName(capture);
  const source = join(root, "specs", INBOX_FOLDER, name);
  if (!(await isFile(source))) {
    throw error.notFound(`Capture not found in the active queue: specs/${INBOX_FOLDER}/${name}`);
  }

  const specs: ResolvedSpec[] = [];
  for (const identifier of identifiers) {
    const spec = await resolveSpec(root, identifier);
    await assertDefinitionGatePassed(spec);
    specs.push(spec);
  }

  const targetDirectory = join(root, "specs", INBOX_FOLDER, INBOX_PROCESSED_FOLDER);
  const target = join(targetDirectory, name);
  if (await pathExists(target)) {
    throw new AppError(ExitCode.GENERIC_ERROR, `The destination already holds a capture with this name: ${relative(root, target)}`);
  }

  const specPaths = specs.map((spec) => toPosix(relative(root, spec.path)));
  const processedAt = options.processedAt ?? new Date().toISOString().replace(/\.\d{3}Z$/u, "Z");
  let content = await readFile(source, "utf8");
  content = upsertTableRow(content, FIELD_STATUS, STATUS_PROCESSED);
  content = upsertTableRow(content, FIELD_SPEC, mergeValues(readTableRow(content, FIELD_SPEC), specPaths));
  content = upsertTableRow(content, FIELD_PROCESSED_AT, processedAt, FIELD_SPEC);

  const from = toPosix(relative(root, source));
  const to = toPosix(relative(root, target));
  const updatedReferences = await rewriteReferences(root, name);

  await mkdir(targetDirectory, { recursive: true });
  await writeTextAtomic(source, content);
  await rename(source, target);

  return {
    name,
    from,
    to,
    path: target,
    status: STATUS_PROCESSED,
    specs: specs.map((spec, index) => ({
      identifier: spec.identifier,
      folder: spec.folder,
      path: specPaths[index]!,
    })),
    updated_references: updatedReferences,
  };
}

/**
 * Requires the three signals of an approved definition: folder other than
 * `draft`, `Status` other than Draft and `Definition Gate: Passed` written in
 * the spec. None of them is inferred from the others.
 */
async function assertDefinitionGatePassed(spec: ResolvedSpec): Promise<void> {
  const content = await readFile(spec.path, "utf8");
  const gate = readHeaderField(content, "Definition Gate");
  const status = readHeaderField(content, "Status");
  const draft = spec.folder === "draft" || !status || status.toLowerCase() === "draft";
  if (draft || gate?.toLowerCase() !== "passed") {
    throw new AppError(
      ExitCode.GATE_FAILED,
      `Spec ${spec.identifier} does not have the Definition Gate passed yet ` +
        `(folder ${spec.folder}, status ${status ?? "missing"}, gate ${gate ?? "missing"}); ` +
        "the capture stays in the active queue",
      { spec: spec.identifier, folder: spec.folder, status: status ?? null, gate: gate ?? null },
    );
  }
}

/** Reads only the first table before the sections, ignoring fenced examples. */
function readHeaderField(content: string, field: string): string | undefined {
  const matches: string[] = [];
  let inTable = false;
  let fence: { marker: string; length: number } | undefined;
  for (const line of content.split(/\r?\n/u)) {
    const delimiter = /^\s{0,3}(`{3,}|~{3,})(.*)$/u.exec(line);
    if (delimiter) {
      if (!fence) fence = { marker: delimiter[1]![0]!, length: delimiter[1]!.length };
      else if (delimiter[1]![0] === fence.marker && delimiter[1]!.length >= fence.length && !delimiter[2]!.trim()) fence = undefined;
      continue;
    }
    if (fence) continue;
    if (/^\s{0,3}#{2,6}\s/u.test(line)) break;
    const row = TABLE_ROW.exec(line);
    if (!row) {
      if (inTable) break;
      continue;
    }
    inTable = true;
    if (row[1]!.trim().toLowerCase() === field.toLowerCase()) matches.push(row[2]!.trim());
  }
  return matches.length === 1 ? matches[0] : undefined;
}

async function listCaptures(directory: string, processed: boolean): Promise<InboxCapture[]> {
  let names: string[];
  try {
    names = await readdir(directory);
  } catch {
    return [];
  }
  const paths = names.filter((name) => name.endsWith(".md")).sort().map((name) => join(directory, name));
  const checks = await Promise.all(paths.map(isFile));
  const captures: InboxCapture[] = [];
  for (const [index, path] of paths.entries()) {
    if (!checks[index]) continue;
    const content = await readFile(path, "utf8");
    captures.push({
      name: basename(path),
      path,
      status: readTableRow(content, FIELD_STATUS) ?? (processed ? STATUS_PROCESSED : STATUS_CAPTURED),
      processed,
    });
  }
  return captures;
}

async function rewriteReferences(root: string, name: string): Promise<string[]> {
  const files = [
    ...(await listMarkdown(join(root, "specs", "backlog"))),
    ...(await listSpecFiles(root)),
  ];
  const pattern = new RegExp(
    `${escapeRegExp(INBOX_FOLDER)}/(?!${escapeRegExp(INBOX_PROCESSED_FOLDER)}/)${escapeRegExp(name)}`,
    "gu",
  );
  const replacement = `${INBOX_FOLDER}/${INBOX_PROCESSED_FOLDER}/${name}`;
  const updated: string[] = [];
  for (const path of files) {
    const content = await readFile(path, "utf8");
    if (!pattern.test(content)) continue;
    pattern.lastIndex = 0;
    await writeTextAtomic(path, content.replace(pattern, replacement));
    updated.push(toPosix(relative(root, path)));
  }
  return updated.sort();
}

async function listSpecFiles(root: string): Promise<string[]> {
  const paths: string[] = [];
  for (const folder of [...SPEC_FOLDERS, "specs"]) {
    const parent = join(root, "specs", folder);
    let entries;
    try {
      entries = await readdir(parent, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const path = join(parent, entry.name, "spec.md");
      if (await isFile(path)) paths.push(path);
    }
  }
  return paths.sort();
}

async function listMarkdown(directory: string): Promise<string[]> {
  try {
    const names = await readdir(directory);
    const paths = names.filter((name) => name.endsWith(".md")).sort().map((name) => join(directory, name));
    const checks = await Promise.all(paths.map(isFile));
    return paths.filter((_, index) => checks[index]);
  } catch {
    return [];
  }
}

function captureName(capture: string): string {
  const name = basename(capture.trim());
  if (!name.endsWith(".md")) {
    throw error.usage(`Invalid capture: ${capture}; give the .md file in specs/${INBOX_FOLDER}/`);
  }
  return name;
}

function readTableRow(content: string, field: string): string | undefined {
  const wanted = field.toLowerCase();
  for (const line of content.split(/\r?\n/u)) {
    const match = TABLE_ROW.exec(line);
    if (match?.[1]?.trim().toLowerCase() === wanted) return match[2]?.trim() ?? "";
  }
  return undefined;
}

/**
 * Updates a row of the metadata table or inserts it after `afterField` (or
 * at the end of the first table), leaving the rest of the file untouched.
 */
function upsertTableRow(content: string, field: string, value: string, afterField?: string): string {
  const lines = content.split(/\r?\n/u);
  const wanted = field.toLowerCase();
  let firstTableEnd = -1;
  let anchor = -1;
  for (const [index, line] of lines.entries()) {
    const match = TABLE_ROW.exec(line);
    if (!match) {
      if (firstTableEnd !== -1) break;
      continue;
    }
    const key = match[1]!.trim().toLowerCase();
    if (key === wanted) {
      lines[index] = `| ${field} | ${value} |`;
      return lines.join("\n");
    }
    firstTableEnd = index;
    if (afterField && key === afterField.toLowerCase()) anchor = index;
  }
  const row = `| ${field} | ${value} |`;
  if (anchor !== -1) {
    lines.splice(anchor + 1, 0, row);
  } else if (firstTableEnd !== -1) {
    lines.splice(firstTableEnd + 1, 0, row);
  } else {
    const newline = content.endsWith("\n") ? "" : "\n";
    return `${content}${newline}\n| Metadado | Valor |\n| --- | --- |\n${row}\n`;
  }
  return lines.join("\n");
}

function mergeValues(current: string | undefined, additions: readonly string[]): string {
  const existing = (current ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => !EMPTY_VALUES.has(value.toLowerCase()));
  return [...new Set([...existing, ...additions])].join(", ");
}

function toPosix(path: string): string {
  return path.split("\\").join("/");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
