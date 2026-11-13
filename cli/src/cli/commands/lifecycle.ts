/**
 * Spec lifecycle commands (spec 0003).
 *
 * Script-backed: `inbox capture` (capturar_inbox), `backlog start`
 * (iniciar_backlog), `specs new` (iniciar_spec), `specs research`
 * (load_research), `specs change` (analyze_change), `tasks next`
 * (next_task) and `tasks delivery` (render_delivery). Each one is a
 * `ScriptCommandDef`, shared with the MCP tools in
 * `src/mcp/tools/lifecycle.ts`.
 *
 * Native, over `src/domain/`: `specs transition`, `specs effort`,
 * `specs migrate`, `inbox process` and `tasks check`. The functions in
 * `lifecycleActions` are the single implementation used by the CLI and by
 * the MCP tools. A transition outside the method order exits with USAGE (2)
 * and lists the accepted destinations; an unknown task or item exits with
 * NOT_FOUND (6).
 */
import { readFile } from "node:fs/promises";
import { basename, dirname, relative } from "node:path";
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { resolveProject, resolveSpecPath } from "../../core/project.ts";
import { migrateSpecs, SPEC_FOLDERS, transitionSpec, updateSpecEffort, type SpecFolder, type SpecTransition } from "../../domain/lifecycle.ts";
import { processInboxCapture } from "../../domain/inbox.ts";
import { syncMilestones } from "../../domain/milestones.ts";
import { setTaskCheck } from "../../domain/progress.ts";
import { clickUpfyHandoff, type ClickUpfyHandoff } from "../../domain/clickupfy.ts";
import { writeTextAtomic } from "../../domain/filesystem.ts";
import { projectOption, toCommand, type ScriptCommandDef } from "../../engine/script-command.ts";
import type { Command, Context } from "../registry.ts";

const bin = manifest.bin;
const SPEC_ARG = "Spec number, folder name, slug or path.";

/** `inbox capture`: records a capture in `specs/inbox/` without interaction. */
export const inboxCaptureDef: ScriptCommandDef = {
  name: "capture",
  tool: "inbox_capture",
  description: "Record a capture in specs/inbox/ from the original text, without interaction.",
  longDescription:
    "The original text is kept verbatim with its SHA-256. Fields left out are written as \"not identified in the original text\" " +
    "so the capture can be reviewed later. Prints the path of the new file.",
  script: "specsfy-01-inbox/scripts/capturar_inbox.mjs",
  project: "root-flag",
  effect: "write",
  params: [
    { name: "input", kind: "option", required: true, description: "Original text of the request, kept verbatim.", placeholder: "text" },
    { name: "title", kind: "option", required: true, description: "One-line title of the capture.", placeholder: "title" },
    { name: "slug", kind: "option", description: "ASCII kebab-case slug. Defaults to the slug of the title.", placeholder: "slug" },
    { name: "summary", kind: "option", description: "Short summary of the request.", placeholder: "text" },
    { name: "problem", kind: "option", description: "Problem or opportunity.", placeholder: "text" },
    { name: "people", kind: "option", description: "People affected.", placeholder: "text" },
    { name: "value", kind: "option", description: "Expected value.", placeholder: "text" },
    { name: "signals", kind: "option", description: "Signals extracted from the text.", placeholder: "text" },
    { name: "data", kind: "option", description: "Signals about information the system must keep.", placeholder: "text" },
    { name: "risks", kind: "option", description: "Risks and dependencies.", placeholder: "text" },
    { name: "directions", kind: "option", description: "Future directions.", placeholder: "text" },
    { name: "review", kind: "option", description: "Points to review before promotion.", placeholder: "text" },
    { name: "session", kind: "option", description: "Discovery session the capture came from.", placeholder: "text" },
    { name: "turn", kind: "option", description: "Conversation turn the capture came from.", placeholder: "text" },
    { name: "sources", kind: "option", description: "Context sources consulted.", placeholder: "text" },
  ],
  examples: [`${bin} inbox capture --title "Export orders" --input "Customers want to export their orders as CSV" --json`],
};

/** `backlog start`: creates a numbered backlog item. */
export const backlogStartDef: ScriptCommandDef = {
  name: "start",
  tool: "backlog_start",
  description: "Create a numbered backlog item in specs/backlog/ without promoting a spec.",
  script: "specsfy-02-backlog/scripts/iniciar_backlog.mjs",
  project: "root-flag",
  effect: "write",
  params: [
    { name: "title", kind: "option", required: true, description: "One-line title of the item.", placeholder: "title" },
    { name: "idea", kind: "option", required: true, description: "Original idea.", placeholder: "text" },
    { name: "problem", kind: "option", required: true, description: "Perceived problem.", placeholder: "text" },
    { name: "person", kind: "option", required: true, description: "Person affected or benefited.", placeholder: "text" },
    { name: "result", kind: "option", required: true, description: "Expected result or value.", placeholder: "text" },
    { name: "context", kind: "option", required: true, description: "Context of the idea.", placeholder: "text" },
    { name: "slug", kind: "option", description: "ASCII kebab-case slug. Defaults to the slug of the title.", placeholder: "slug" },
  ],
  examples: [`${bin} backlog start --title "Export orders" --idea "..." --problem "..." --person "..." --result "..." --context "..."`],
};

/** `specs new`: creates a spec in `specs/draft/` from the installed template. */
export const specCreateDef: ScriptCommandDef = {
  name: "new",
  tool: "spec_create",
  description: "Create a spec in specs/draft/ with the next number, from the installed template.",
  script: "specsfy-03-specify/scripts/iniciar_spec.mjs",
  project: "root-flag",
  effect: "write",
  params: [
    { name: "title", kind: "option", required: true, description: "One-line title of the spec.", placeholder: "title" },
    { name: "slug", kind: "option", description: "ASCII kebab-case slug. Defaults to the slug of the title.", placeholder: "slug" },
  ],
  examples: [`${bin} specs new --title "Recover password" --json`],
};

/** `specs research`: lists and loads the research indexed by a spec. */
export const specResearchDef: ScriptCommandDef = {
  name: "research",
  tool: "spec_research",
  description: "List and load the local research indexed by a spec and check its claims.",
  script: "specsfy-03-specify/scripts/load_research.mjs",
  project: "cwd",
  json: true,
  effect: "read",
  params: [
    { name: "spec", kind: "spec", required: true, description: SPEC_ARG },
    { name: "emit-content", kind: "flag", description: "Include the content of each artifact." },
    { name: "max-bytes", kind: "option", description: "Maximum bytes read per artifact (default 65536).", placeholder: "bytes" },
  ],
  examples: [`${bin} specs research 0001 --json`, `${bin} specs research 0001 --emit-content --json`],
};

/** `specs change`: impact of the worktree spec against a Git revision. */
export const specChangeDef: ScriptCommandDef = {
  name: "change",
  tool: "spec_change_analyze",
  description: "Analyze the impact between the spec in Git and the worktree version: changed IDs, sections and gates to reopen.",
  script: "specsfy-update-spec/scripts/analyze_change.mjs",
  project: "cwd",
  json: true,
  effect: "read",
  params: [
    { name: "spec", kind: "spec", required: true, description: SPEC_ARG },
    { name: "base", kind: "option", description: "Git revision to compare with (default HEAD).", placeholder: "rev" },
    { name: "mode", kind: "option", values: ["impact", "changelog"], description: "impact (default) or changelog." },
  ],
  examples: [`${bin} specs change 0001 --json`, `${bin} specs change 0001 --base main --mode changelog`],
};

/** `tasks next`: next ready task of section 14. */
export const taskNextDef: ScriptCommandDef = {
  name: "next",
  tool: "task_next",
  description: "Show the next ready task of a spec, with its next checklist item; --all lists every ready task.",
  longDescription: "Exit code 1 means every open task is blocked by dependencies; 2 means the spec is not ready for implementation (gates, Status or task format).",
  script: "specsfy-07-implement/scripts/next_task.mjs",
  project: "cwd",
  json: true,
  effect: "read",
  params: [
    { name: "spec", kind: "spec", required: true, description: SPEC_ARG },
    { name: "all", kind: "flag", description: "List every ready task instead of the first." },
  ],
  examples: [`${bin} tasks next 0001`, `${bin} tasks next 0001 --all --json`],
};

/** `tasks delivery`: delivery summary of a spec. */
export const deliveryRenderDef: ScriptCommandDef = {
  name: "delivery",
  tool: "delivery_render",
  description: "Render the delivery summary of a spec: gates, delivered IDs, tasks, evidence and rollback.",
  longDescription:
    "Without --preview the summary requires Delivery Gate Passed and no open task. With --json and no --format, the CLI asks the script for JSON. " +
    "Over MCP, pass format json for structured data.",
  script: "specsfy-07-implement/scripts/render_delivery.mjs",
  project: "cwd",
  effect: "read",
  params: [
    { name: "spec", kind: "spec", required: true, description: SPEC_ARG },
    { name: "format", kind: "option", values: ["markdown", "json"], description: "markdown (default) or json." },
    { name: "preview", kind: "flag", description: "Render even with open tasks or Delivery Gate not passed." },
  ],
  examples: [`${bin} tasks delivery 0001`, `${bin} tasks delivery 0001 --preview --json`],
};

/** Script definitions of this spec, in tool registration order. */
export const lifecycleScriptDefs: readonly ScriptCommandDef[] = [
  inboxCaptureDef,
  backlogStartDef,
  specCreateDef,
  specResearchDef,
  specChangeDef,
  taskNextDef,
  deliveryRenderDef,
];

/** Folder name of a spec identifier, resolved with `resolveSpecPath`. */
export async function specIdentifier(project: string, spec: string): Promise<string> {
  return basename(dirname(await resolveSpecPath(project, spec)));
}

/** Transition data returned by `specs transition` and `spec_transition`. */
export type TransitionData = SpecTransition & { relativePath: string; clickupfy: ClickUpfyHandoff };

/** Native lifecycle operations, shared by the CLI and the MCP tools. */
export const lifecycleActions = {
  /** Moves a spec to another state folder and syncs milestones. */
  async transition(project: string, spec: string, to: string): Promise<TransitionData> {
    if (!(SPEC_FOLDERS as readonly string[]).includes(to)) {
      throw error.usage(`Invalid state: ${to}. Accepted: ${SPEC_FOLDERS.join(", ")}.`, { accepted: [...SPEC_FOLDERS] });
    }
    const identifier = await specIdentifier(project, spec);
    const result = await transitionSpec(project, identifier, to as SpecFolder);
    await syncMilestones(project);
    return { ...result, relativePath: relative(project, result.path), clickupfy: await clickUpfyHandoff(project, result.path, "transition") };
  },

  /** Records the effort (1 to 10) of a spec with its rationale. */
  async effort(project: string, spec: string, effort: string | number, reason: string | undefined) {
    if (!reason || !reason.trim()) throw error.usage("Missing required option: --reason");
    const value = typeof effort === "number" ? effort : /^\d+$/.test(effort.trim()) ? Number(effort) : Number.NaN;
    const identifier = await specIdentifier(project, spec);
    const result = await updateSpecEffort(project, identifier, value, reason);
    return { ...result, relativePath: relative(project, result.path), clickupfy: await clickUpfyHandoff(project, result.path, "effort") };
  },

  /** Moves legacy specs (`specs/<slug>/`, `specs/specs/<slug>/`) to state folders. */
  async migrate(project: string) {
    const migrated = await migrateSpecs(project);
    if (migrated.length) await syncMilestones(project);
    return { count: migrated.length, migrated: migrated.map((item) => ({ ...item, relativePath: relative(project, item.path) })) };
  },

  /** Moves a capture to specs/inbox/processed/ once the given specs cover it. */
  async process(project: string, capture: string, specs: readonly string[]) {
    const identifiers = await Promise.all(specs.map((spec) => specIdentifier(project, spec)));
    return processInboxCapture(project, capture, identifiers);
  },

  /** Marks or unmarks a task, or an item of its checklist, in spec.md. */
  async check(project: string, spec: string, task: string, item: string | undefined, undo: boolean) {
    const path = await resolveSpecPath(project, spec);
    const content = await readFile(path, "utf8");
    const result = setTaskCheck(content, task, item, !undo);
    if (result.changed) await writeTextAtomic(path, result.content);
    const { content: _content, ...data } = result;
    return { spec: basename(dirname(path)), path: relative(project, path), ...data };
  },
};

/** Splits `a,b` and repeated values into a clean list. */
function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(list);
  if (typeof value !== "string") return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function transitionText(data: { identifier: string; from: string; to: string; status: string; clickupfy: ClickUpfyHandoff }): string {
  const lines = [`${data.identifier}\t${data.from} → ${data.to}\t${data.status}`];
  if (data.clickupfy.available && data.clickupfy.task_id) lines.push(`ClickUpfy\tforward ${data.clickupfy.action} to task ${data.clickupfy.task_id}`);
  return lines.join("\n");
}

const specsTransition: Command = {
  name: "transition",
  description: "Move a spec to another state folder and mirror its Status; only adjacent states of the method are accepted.",
  longDescription:
    `Order: ${SPEC_FOLDERS.join(" → ")}. From each state the spec may stay, go one step forward or one step back; completed may reopen to draft or defined. ` +
    "An invalid transition exits with code 2 and lists the accepted destinations. Milestones are synced afterwards.",
  arguments: [
    { name: "spec", description: SPEC_ARG, required: true },
    { name: "state", description: "Destination state folder.", required: true, values: SPEC_FOLDERS },
  ],
  options: [projectOption],
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${bin} specs transition 0001 defined`, `${bin} specs transition recover-password in-progress --json`],
  run: async (ctx) => {
    const data = await lifecycleActions.transition(resolveProject(ctx.options.project), ctx.args[0]!, ctx.args[1]!);
    return { data, text: () => transitionText(data) };
  },
};

const specsEffort: Command = {
  name: "effort",
  description: "Record the estimated effort of a spec (integer 1 to 10) with a rationale.",
  arguments: [
    { name: "spec", description: SPEC_ARG, required: true },
    { name: "effort", description: "Integer from 1 to 10.", required: true },
  ],
  options: [{ name: "--reason", argument: { name: "text" }, description: "Rationale of the estimate. Required." }, projectOption],
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${bin} specs effort 0001 5 --reason "Two integrations and a migration"`],
  run: async (ctx) => {
    const data = await lifecycleActions.effort(resolveProject(ctx.options.project), ctx.args[0]!, ctx.args[1]!, ctx.options.reason as string | undefined);
    return {
      data,
      text: () => [`${data.identifier}\tEffort ${data.effort}/10`, ...(data.clickupfy.available && data.clickupfy.task_id ? [`ClickUpfy\tforward effort to task ${data.clickupfy.task_id}`] : [])].join("\n"),
    };
  },
};

const specsMigrate: Command = {
  name: "migrate",
  description: "Move specs from the legacy layouts (specs/<slug>/, specs/specs/<slug>/) to the state folders, by their Status.",
  options: [projectOption],
  examples: [`${bin} specs migrate`, `${bin} specs migrate --json`],
  run: async (ctx) => {
    const data = await lifecycleActions.migrate(resolveProject(ctx.options.project));
    return { data, text: () => (data.count ? data.migrated.map((item) => `${item.identifier}\t→ ${item.to}\t${item.status}`).join("\n") : "No legacy spec to migrate.") };
  },
};

const inboxProcess: Command = {
  name: "process",
  description: "Move a capture out of the active inbox queue once specs with the Definition Gate passed cover it.",
  longDescription:
    "The capture moves to specs/inbox/processed/ with its original text intact, Status Processada and the derived specs recorded; " +
    "references in specs/ and specs/backlog/ are updated. A spec without the Definition Gate passed exits with code 10.",
  arguments: [{ name: "capture", description: "Capture file in specs/inbox/, by name or path.", required: true }],
  options: [
    { name: "--spec", argument: { name: "ids" }, description: "Spec(s) that cover the capture, comma-separated. Required." },
    projectOption,
  ],
  exitCodes: [ExitCode.NOT_FOUND, ExitCode.GATE_FAILED],
  examples: [`${bin} inbox process 2026-11-13-101500-export-orders.md --spec 0004,0005`],
  run: async (ctx) => {
    const specs = list(ctx.options.spec);
    if (!specs.length) throw error.usage("Missing required option: --spec");
    const data = await lifecycleActions.process(resolveProject(ctx.options.project), ctx.args[0]!, specs);
    return {
      data,
      text: () => [
        `${data.name}\t${data.from} → ${data.to}\t${data.status}`,
        ...data.specs.map((spec) => `Spec\t${spec.identifier}\t${spec.path}`),
        ...data.updated_references.map((path) => `Reference\t${path}`),
      ].join("\n"),
    };
  },
};

const tasksCheck: Command = {
  name: "check",
  description: "Mark (or with --undo unmark) a task or one item of its checklist in spec.md.",
  longDescription:
    "<task> is the task ID (T001). [item] is a checklist key (PREP, EXECUTE, VERIFY, VISUAL, EVIDENCE, IMPROVE) or the 1-based position of the item under the task; " +
    "without it the task line itself is changed. A task or item that does not exist exits with code 6.",
  arguments: [
    { name: "spec", description: SPEC_ARG, required: true },
    { name: "task", description: "Task ID, such as T001.", required: true },
    { name: "item", description: "Checklist key or 1-based position." },
  ],
  options: [{ name: "--undo", description: "Unmark instead of mark." }, projectOption],
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${bin} tasks check 0001 T001 PREP`, `${bin} tasks check 0001 T001`, `${bin} tasks check 0001 T001 EXECUTE --undo --json`],
  run: async (ctx: Context) => {
    const data = await lifecycleActions.check(resolveProject(ctx.options.project), ctx.args[0]!, ctx.args[1]!, ctx.args[2], Boolean(ctx.options.undo));
    return {
      data,
      text: () => `${data.spec}\t${data.task}${data.item ? ` ${data.item}` : ""}\t${data.checked ? "[x]" : "[ ]"}${data.changed ? "" : " (unchanged)"}\tline ${data.line_number}`,
    };
  },
};

/** `tasks delivery`: with `--json` and no `--format`, asks the script for JSON. */
function deliveryCommand(): Command {
  const base = toCommand(deliveryRenderDef);
  return {
    ...base,
    run: (ctx) => base.run!(ctx.json && ctx.options.format === undefined ? { ...ctx, options: { ...ctx.options, format: "json" } } : ctx),
  };
}

export const specsWriteCommands: Command[] = [
  toCommand(specCreateDef),
  specsTransition,
  specsEffort,
  specsMigrate,
  toCommand(specResearchDef),
  toCommand(specChangeDef),
];
export const inboxWriteCommands: Command[] = [toCommand(inboxCaptureDef), inboxProcess];
export const backlogWriteCommands: Command[] = [toCommand(backlogStartDef)];
export const tasksCommands: Command[] = [toCommand(taskNextDef), tasksCheck, deliveryCommand()];
