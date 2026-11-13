/**
 * Read model of a Specsfy project.
 *
 * Collects specs, progress, backlog and inbox in one structure used by
 * `status`, `specs list`, `specs show`, the MCP tools and the TUI. Nothing
 * here writes files.
 */
import { readFile } from "node:fs/promises";
import { basename, dirname, relative } from "node:path";
import { SPEC_FOLDERS, type SpecFolder } from "../domain/lifecycle.ts";
import { scanSpecs, serializeSpec, summarizeSpecs, type ProgressSummary, type SpecProgress } from "../domain/progress.ts";
import { scanBacklogs } from "../domain/backlog.ts";
import { scanInboxCaptures } from "../domain/inbox.ts";
import { resolveSpecPath } from "./project.ts";

/** Folder (state) of a spec path, or `legacy` for `specs/specs/<slug>/`. */
export function folderOf(path: string): SpecFolder | "legacy" {
  const parent = basename(dirname(dirname(path)));
  return (SPEC_FOLDERS as readonly string[]).includes(parent) ? (parent as SpecFolder) : "legacy";
}

/** Public projection of a spec, without the raw Markdown. */
export type SpecSummary = Omit<SpecProgress, "content"> & { folder: SpecFolder | "legacy"; relativePath: string };

function summarize(project: string, spec: SpecProgress): SpecSummary {
  return { ...serializeSpec(spec), folder: folderOf(spec.path), relativePath: relative(project, spec.path) };
}

/** Lists specs, optionally filtered by state folder. */
export async function listSpecs(project: string, state?: string): Promise<SpecSummary[]> {
  const specs = (await scanSpecs(project)).map((spec) => summarize(project, spec));
  return state ? specs.filter((spec) => spec.folder === state) : specs;
}

/** Overall picture of the project. */
export interface ProjectOverview {
  root: string;
  summary: ProgressSummary;
  states: Record<SpecFolder | "legacy", number>;
  specs: SpecSummary[];
  backlog: Array<{ identifier: string; title: string; status: string; path: string }>;
  inbox: Array<{ name: string; status: string; processed: boolean; path: string }>;
}

/** Builds the overview used by `status`, `project_status` and the TUI. */
export async function projectOverview(project: string): Promise<ProjectOverview> {
  const raw = await scanSpecs(project);
  const specs = raw.map((spec) => summarize(project, spec));
  const states = Object.fromEntries([...SPEC_FOLDERS, "legacy"].map((folder) => [folder, 0])) as ProjectOverview["states"];
  for (const spec of specs) states[spec.folder] += 1;
  const backlog = (await scanBacklogs(project)).map((item) => ({
    identifier: item.identifier,
    title: item.title,
    status: item.status,
    path: relative(project, item.path),
  }));
  const inbox = (await scanInboxCaptures(project)).map((item) => ({
    name: item.name,
    status: item.status,
    processed: item.processed,
    path: relative(project, item.path),
  }));
  return { root: project, summary: summarizeSpecs(raw), states, specs, backlog, inbox };
}

/** Detail of one spec, with the Markdown when asked. */
export async function specDetail(project: string, identifier: string, withContent = false): Promise<SpecSummary & { content?: string }> {
  const path = await resolveSpecPath(project, identifier);
  const spec = (await scanSpecs(project)).find((item) => item.path === path);
  if (!spec) {
    const content = await readFile(path, "utf8");
    return { ...summarize(project, { ...emptySpec(path), content }), ...(withContent ? { content } : {}) };
  }
  return { ...summarize(project, spec), ...(withContent ? { content: spec.content } : {}) };
}

function emptySpec(path: string): SpecProgress {
  return {
    slug: basename(dirname(path)), title: basename(dirname(path)), path, content: "", status: "Unknown", effort: null,
    execution_profile: "unknown", definition_gate: "Missing", plan_gate: "Missing", delivery_gate: "Missing",
    passed_gates: 0, total_gates: 3, completed_tasks: 0, pending_tasks: 0, total_tasks: 0, completed_items: 0,
    pending_items: 0, total_items: 0, completed_task_items: 0, pending_task_items: 0, total_task_items: 0,
    completed_other_items: 0, pending_other_items: 0, total_other_items: 0, orphan_checklist_lines: [], percent: 0,
  };
}
