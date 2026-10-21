/**
 * Saída de uma captura da fila ativa de `specs/inbox/`.
 *
 * Uma captura permanece na fila ativa enquanto houver parte do pedido sem
 * destino. Quando specs com `Definition Gate: Passed` cobrem todo o pedido,
 * ela passa para `specs/inbox/processed/`, com o texto original intacto, o
 * `Status` espelhado e os vínculos atualizados. Julgar a cobertura pertence à
 * pessoa ou ao agente; este módulo só executa a mudança quando o gate permite.
 */

import { mkdir, readFile, readdir, rename } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { isFile, pathExists, resolvePath, writeTextAtomic } from "./filesystem.js";
import { resolveSpec, SPEC_FOLDERS, type ResolvedSpec } from "./lifecycle.js";

export const INBOX_FOLDER = "inbox";
export const INBOX_PROCESSED_FOLDER = "processed";

const STATUS_CAPTURED = "Capturada";
const STATUS_PROCESSED = "Processada";
const FIELD_STATUS = "Status";
const FIELD_SPEC = "Spec derivada";
const FIELD_PROCESSED_AT = "Processada em";
const EMPTY_VALUES = new Set(["", "nenhuma", "nenhum", "—", "-"]);

const TABLE_ROW = /^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/u;

/** Projeção de um arquivo em `specs/inbox/` ou `specs/inbox/processed/`. */
export interface InboxCapture {
  name: string;
  path: string;
  status: string;
  processed: boolean;
}

/** Opções da varredura de capturas. */
export interface ScanInboxOptions {
  includeProcessed?: boolean;
}

/** Opções que tornam o processamento reproduzível em automações. */
export interface ProcessInboxOptions {
  processedAt?: string;
}

/** Resultado da saída de uma captura da fila ativa. */
export interface InboxProcessing {
  name: string;
  from: string;
  to: string;
  path: string;
  status: string;
  specs: Array<Pick<ResolvedSpec, "identifier" | "folder"> & { path: string }>;
  updated_references: string[];
}

/** Lista as capturas em ordem estável; ativas primeiro, processadas depois. */
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
 * Move uma captura para `specs/inbox/processed/` quando todas as specs
 * indicadas têm o Definition Gate aprovado. Preserva o texto original,
 * registra as specs derivadas e atualiza as referências em `specs/`.
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
    throw new Error("informe ao menos uma spec com --spec <id> que cubra a captura");
  }

  const name = captureName(capture);
  const source = join(root, "specs", INBOX_FOLDER, name);
  if (!(await isFile(source))) {
    throw new Error(`captura não encontrada na fila ativa: specs/${INBOX_FOLDER}/${name}`);
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
    throw new Error(`o destino já contém uma captura com esse nome: ${relative(root, target)}`);
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
 * Exige os três sinais da definição aprovada: pasta fora de `draft`, `Status`
 * diferente de Draft e `Definition Gate: Passed` escrito na spec. Nenhum deles
 * é inferido a partir dos outros.
 */
async function assertDefinitionGatePassed(spec: ResolvedSpec): Promise<void> {
  const content = await readFile(spec.path, "utf8");
  const gate = readTableRow(content, "Definition Gate");
  const draft = spec.folder === "draft" || spec.status.toLowerCase() === "draft";
  if (draft || gate?.toLowerCase() !== "passed") {
    throw new Error(
      `a spec ${spec.identifier} ainda não tem Definition Gate aprovado ` +
        `(pasta ${spec.folder}, status ${spec.status}, gate ${gate ?? "ausente"}); ` +
        "a captura permanece na fila ativa",
    );
  }
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
    throw new Error(`captura inválida: ${capture}; informe o arquivo .md de specs/${INBOX_FOLDER}/`);
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
 * Atualiza uma linha da tabela de metadados ou a insere após `afterField`
 * (ou ao fim da primeira tabela), sem tocar no restante do arquivo.
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
