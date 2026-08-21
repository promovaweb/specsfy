/**
 * Projeção de progresso das especificações Markdown.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename, dirname, relative } from "node:path";
import { resolvePath } from "./filesystem.js";
import { scanSpecPaths } from "./lifecycle.js";

const FIELD = /^\*\*([^*]+)\*\*:\s*(.+?)\s*$/;
const TABLE_FIELD = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/;
const CHECKLIST_ITEM = /^\s*[-*+]\s*\[([ xX])\]\s+(.+?)\s*$/;
const TASK_ID = /^(?:\*\*|`)?T\d+\b/i;
const GATE_NAMES = ["definition gate", "plan gate", "delivery gate"] as const;

/** Métricas e conteúdo de uma especificação. */
export interface SpecProgress {
  slug: string;
  title: string;
  path: string;
  content: string;
  status: string;
  effort: number | null;
  execution_profile: "light" | "standard" | "high" | "maximum" | "unknown";
  definition_gate: string;
  plan_gate: string;
  delivery_gate: string;
  passed_gates: number;
  total_gates: number;
  completed_tasks: number;
  pending_tasks: number;
  total_tasks: number;
  completed_items: number;
  pending_items: number;
  total_items: number;
  percent: number;
}

/** Totais consolidados de uma coleção de specs. */
export interface ProgressSummary {
  total_specs: number;
  completed_specs: number;
  completed_tasks: number;
  pending_tasks: number;
  total_tasks: number;
  completed_items: number;
  pending_items: number;
  total_items: number;
  passed_gates: number;
  total_gates: number;
  percent: number;
}

/** Lê specs no layout canônico e no layout legado. */
export async function scanSpecs(project: string): Promise<SpecProgress[]> {
  const root = resolvePath(project);
  return Promise.all((await scanSpecPaths(root)).map(parseSpec));
}

/** Consolida as métricas das specs fornecidas. */
export function summarizeSpecs(specs: SpecProgress[]): ProgressSummary {
  const completedItems = sum(specs, "completed_items");
  const totalItems = sum(specs, "total_items");
  const completedTasks = sum(specs, "completed_tasks");
  const totalTasks = sum(specs, "total_tasks");
  const passedGates = sum(specs, "passed_gates");
  const totalGates = sum(specs, "total_gates");
  return {
    total_specs: specs.length,
    completed_specs: specs.filter((spec) => spec.status.toLowerCase() === "complete")
      .length,
    completed_tasks: completedTasks,
    pending_tasks: totalTasks - completedTasks,
    total_tasks: totalTasks,
    completed_items: completedItems,
    pending_items: totalItems - completedItems,
    total_items: totalItems,
    passed_gates: passedGates,
    total_gates: totalGates,
    percent: ratio(
      totalItems ? completedItems : passedGates,
      totalItems ? totalItems : totalGates,
    ),
  };
}

/** Calcula o fingerprint dos caminhos e conteúdos de spec. */
export async function specsFingerprint(project: string): Promise<string> {
  const root = resolvePath(project);
  const digest = createHash("sha256");
  for (const path of await scanSpecPaths(root)) {
    digest.update(relative(root, path));
    digest.update("\0");
    try {
      digest.update(await readFile(path));
    } catch {
      continue;
    }
    digest.update("\0");
  }
  return digest.digest("hex");
}

/** Remove o conteúdo bruto antes de serializar a resposta pública. */
export function serializeSpec(spec: SpecProgress): Omit<SpecProgress, "content"> {
  const { content: _content, ...serialized } = spec;
  return serialized;
}

async function parseSpec(path: string): Promise<SpecProgress> {
  const content = await readFile(path, "utf8");
  const slug = basename(dirname(path));
  let title = slug;
  let completedTasks = 0;
  let totalTasks = 0;
  let completedItems = 0;
  let totalItems = 0;
  let insideFence = false;
  const fields = new Map<string, string>();
  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trimStart();
    if (
      trimmed.startsWith("```") ||
      trimmed.startsWith("~~~")
    ) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;
    if (line.startsWith("# ") && title === slug) title = line.slice(2).trim();
    const field = FIELD.exec(line) ?? TABLE_FIELD.exec(line);
    if (field?.[1] && field[2]) {
      fields.set(field[1].trim().toLowerCase(), field[2].trim());
    }
    const item = CHECKLIST_ITEM.exec(line);
    if (!item) continue;
    const done = item[1]?.toLowerCase() === "x";
    totalItems += 1;
    completedItems += Number(done);
    if (TASK_ID.test(item[2] ?? "")) {
      totalTasks += 1;
      completedTasks += Number(done);
    }
  }
  const passedGates = GATE_NAMES.filter(
    (name) => fields.get(name)?.toLowerCase() === "passed",
  ).length;
  const totalGates = GATE_NAMES.length;
  return {
    slug,
    title,
    path,
    content,
    status: fields.get("status") ?? "Unknown",
    effort: parsedEffort(fields.get("effort")),
    execution_profile: effortProfile(parsedEffort(fields.get("effort"))),
    definition_gate: fields.get("definition gate") ?? "Unknown",
    plan_gate: fields.get("plan gate") ?? "Unknown",
    delivery_gate: fields.get("delivery gate") ?? "Unknown",
    passed_gates: passedGates,
    total_gates: totalGates,
    completed_tasks: completedTasks,
    pending_tasks: totalTasks - completedTasks,
    total_tasks: totalTasks,
    completed_items: completedItems,
    pending_items: totalItems - completedItems,
    total_items: totalItems,
    percent: ratio(
      totalItems ? completedItems : passedGates,
      totalItems ? totalItems : totalGates,
    ),
  };
}

function parsedEffort(value: string | undefined): number | null {
  if (!value || !/^\d+$/u.test(value)) return null;
  const effort = Number(value);
  return effort >= 1 && effort <= 10 ? effort : null;
}

function effortProfile(
  effort: number | null,
): "light" | "standard" | "high" | "maximum" | "unknown" {
  if (effort === null) return "unknown";
  if (effort <= 2) return "light";
  if (effort <= 6) return "standard";
  if (effort <= 8) return "high";
  return "maximum";
}

function sum(
  specs: SpecProgress[],
  key:
    | "completed_items"
    | "total_items"
    | "completed_tasks"
    | "total_tasks"
    | "passed_gates"
    | "total_gates",
): number {
  return specs.reduce((total, spec) => total + spec[key], 0);
}

function ratio(completed: number, total: number): number {
  if (!total) return 0;
  const value = (completed * 100) / total;
  const floor = Math.floor(value);
  const fraction = value - floor;
  if (fraction !== 0.5) return Math.round(value);
  return floor % 2 === 0 ? floor : floor + 1;
}
