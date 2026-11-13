/**
 * Projeção de milestones para projetos consumidores do Specsfy.
 *
 * A fonte normativa continua distribuída: cada spec e cada item de backlog
 * declara seus vínculos, enquanto este módulo mantém os blocos derivados de
 * `specs.md` e de `specs/milestones/<ID>.md`. Conteúdo humano fora dos blocos
 * delimitados nunca é substituído.
 */

import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { pathExists, resolvePath, writeTextAtomic } from "./filesystem.ts";
import { scanSpecPaths } from "./lifecycle.ts";

const TABLE_FIELD = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/u;
const BOLD_FIELD = /^\*\*([^*]+?)\*\*:\s*(.+?)\s*$/u;
const START = "<!-- specsfy:milestone-progress:start -->";
const END = "<!-- specsfy:milestone-progress:end -->";
const INDEX_START = "<!-- specsfy:specs-index:start -->";
const INDEX_END = "<!-- specsfy:specs-index:end -->";

/** Estado agregado exposto para CLI, agentes e automações locais. */
export interface MilestoneProgress {
  id: string;
  path: string;
  total_specs: number;
  completed_specs: number;
  backlog_items: number;
  percent: number;
}

/** Resultado de uma sincronização local e determinística. */
export interface MilestoneSyncResult {
  index_path: string;
  milestones: MilestoneProgress[];
}

interface LinkedRecord {
  slug: string;
  title: string;
  status: string;
  milestones: string[];
}

/**
 * Reconstrói as projeções de milestones a partir do backlog e das specs.
 *
 * O comando pode criar o esqueleto de um marco citado por uma spec. A condição
 * de saída permanece pendente até ser confirmada pela entrevista de MVP ou de
 * roadmap, portanto a sincronização não inventa requisito de produto.
 */
export async function syncMilestones(project: string): Promise<MilestoneSyncResult> {
  const root = resolvePath(project);
  const [specs, backlog] = await Promise.all([scanLinkedSpecs(root), scanBacklog(root)]);
  const ids = [...new Set([...specs, ...backlog].flatMap((record) => record.milestones))]
    .sort(compareMilestone);
  const milestones: MilestoneProgress[] = [];

  for (const id of ids) {
    const linkedSpecs = specs.filter((spec) => spec.milestones.includes(id));
    const linkedBacklog = backlog.filter((item) => item.milestones.includes(id));
    const completedSpecs = linkedSpecs.filter(isComplete).length;
    const path = join(root, "specs", "milestones", `${id}.md`);
    const progress: MilestoneProgress = {
      id,
      path,
      total_specs: linkedSpecs.length,
      completed_specs: completedSpecs,
      backlog_items: linkedBacklog.length,
      percent: linkedSpecs.length ? Math.round((completedSpecs * 100) / linkedSpecs.length) : 0,
    };
    await writeMilestone(path, progress, linkedSpecs, linkedBacklog);
    milestones.push(progress);
  }

  const indexPath = join(root, "specs.md");
  await writeSpecsIndex(indexPath, specs, milestones);
  return { index_path: indexPath, milestones };
}

async function scanLinkedSpecs(project: string): Promise<LinkedRecord[]> {
  const paths = await scanSpecPaths(project);
  return Promise.all(paths.map(async (path) => recordFromFile(path)));
}

async function scanBacklog(project: string): Promise<LinkedRecord[]> {
  const directory = join(project, "specs", "backlog");
  if (!(await pathExists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  return Promise.all(entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => recordFromFile(join(directory, entry.name))));
}

async function recordFromFile(path: string): Promise<LinkedRecord> {
  const content = await readFile(path, "utf8");
  const fields = fieldsFrom(content);
  return {
    slug: basename(path, ".md") === "spec" ? basename(dirname(path)) : basename(path, ".md"),
    title: content.match(/^#\s+(.+?)\s*$/mu)?.[1]?.trim() ?? basename(path, ".md"),
    status: fields.get("status") ?? "Unknown",
    milestones: parseMilestones(fields.get("milestones") ?? fields.get("milestone")),
  };
}

function fieldsFrom(content: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of content.split(/\r?\n/u)) {
    const field = TABLE_FIELD.exec(line) ?? BOLD_FIELD.exec(line);
    if (field?.[1] && field[2]) fields.set(field[1].trim().toLowerCase(), field[2].trim());
  }
  return fields;
}

function parseMilestones(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(/[;,]/u).map((item) => item.trim().toUpperCase())
    .filter((item) => /^M\d{2,}(?:-[a-z0-9-]+)?$/iu.test(item)))].sort(compareMilestone);
}

function isComplete(record: LinkedRecord): boolean {
  return record.status.trim().toLowerCase() === "complete";
}

async function writeMilestone(
  path: string,
  progress: MilestoneProgress,
  specs: LinkedRecord[],
  backlog: LinkedRecord[],
): Promise<void> {
  const current = (await pathExists(path)) ? await readFile(path, "utf8") : milestoneSkeleton(progress.id);
  const body = [
    START,
    "## Progresso derivado",
    "",
    `- ${progress.completed_specs} de ${progress.total_specs} specs concluídas (${progress.percent}%).`,
    `- ${progress.backlog_items} itens de backlog relacionados.`,
    "",
    "### Specs vinculadas",
    "",
    ...(specs.length ? specs.map((spec) => `- ${spec.slug} — ${spec.title} (${spec.status})`) : ["- Nenhuma spec vinculada."]),
    "",
    "### Backlog relacionado",
    "",
    ...(backlog.length ? backlog.map((item) => `- ${item.slug} — ${item.title}`) : ["- Nenhum item de backlog relacionado."]),
    END,
    "",
  ].join("\n");
  await writeTextAtomic(path, replaceBlock(current, START, END, body));
}

async function writeSpecsIndex(
  path: string,
  specs: LinkedRecord[],
  milestones: MilestoneProgress[],
): Promise<void> {
  const current = (await pathExists(path)) ? await readFile(path, "utf8") : "# Índice de specs\n\n";
  const rows = specs.map((spec, index) =>
    `| ${String(index + 1).padStart(2, "0")} | ${spec.slug} | ${spec.status} | ${spec.milestones.join(", ") || "—"} |`,
  );
  const body = [
    INDEX_START,
    "## Sequência e estado",
    "",
    "| Ordem | Spec | Estado | Milestones |",
    "| --- | --- | --- | --- |",
    ...(rows.length ? rows : ["| — | Nenhuma spec | — | — |"]),
    "",
    "## Marcos",
    "",
    ...(milestones.length
      ? milestones.map((milestone) => `- ${milestone.id}: ${milestone.completed_specs}/${milestone.total_specs} specs concluídas (${milestone.percent}%).`)
      : ["- Nenhuma milestone vinculada ainda."]),
    INDEX_END,
    "",
  ].join("\n");
  await writeTextAtomic(path, replaceBlock(current, INDEX_START, INDEX_END, body));
}

function milestoneSkeleton(id: string): string {
  return `# ${id}\n\n## Objetivo\n\nA confirmar na entrevista.\n\n## Condição de saída\n\nA confirmar na entrevista.\n\n## Fora de escopo\n\nA confirmar na entrevista.\n\n`;
}

function replaceBlock(current: string, start: string, end: string, next: string): string {
  const begin = current.indexOf(start);
  const finish = current.indexOf(end);
  if (begin >= 0 && finish >= begin) return `${current.slice(0, begin)}${next}${current.slice(finish + end.length).replace(/^\r?\n/u, "")}`;
  const separator = current.endsWith("\n\n") ? "" : current.endsWith("\n") ? "\n" : "\n\n";
  return `${current}${separator}${next}`;
}

function compareMilestone(left: string, right: string): number {
  return left.localeCompare(right, "pt-BR", { numeric: true });
}
