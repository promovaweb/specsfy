/**
 * MCP tools of the spec lifecycle (spec 0003).
 *
 * Script-backed tools (`inbox_capture`, `backlog_start`, `spec_create`,
 * `spec_research`, `spec_change_analyze`, `task_next`, `delivery_render`)
 * come from the same definitions as the CLI commands. Native tools
 * (`inbox_process`, `spec_transition`, `spec_effort`, `specs_migrate`,
 * `task_check`) call `lifecycleActions`, the implementation behind
 * `inbox process`, `specs transition`, `specs effort`, `specs migrate` and
 * `tasks check`. Domain errors come back as `isError` with the AppError JSON
 * (code, name, message, details).
 */
import { z } from "zod";
import { AppError } from "../../app/errors.ts";
import { SPEC_FOLDERS } from "../../domain/lifecycle.ts";
import { resolveProject } from "../../core/project.ts";
import { registerScriptTools } from "../../engine/script-command.ts";
import { lifecycleActions, lifecycleScriptDefs } from "../../cli/commands/lifecycle.ts";
import type { Registrar } from "../server.ts";

const project = z.string().optional().describe("Project root. Defaults to the nearest directory with specs/, .specsfy/ or skills-lock.json.");
const spec = z.string().min(1).describe("Spec number, folder name, slug or path.");

/** Wraps a handler so domain errors come back as tool errors. */
export function respond<T>(fn: () => Promise<T>) {
  return fn().then(
    (data) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data as Record<string, unknown> }),
    (e: unknown) => ({
      content: [{ type: "text" as const, text: JSON.stringify(e instanceof AppError ? e.toJSON() : { message: e instanceof Error ? e.message : String(e) }) }],
      isError: true,
    }),
  );
}

/** Registers the lifecycle tools. */
export function registerLifecycleTools(registrar: Registrar): void {
  const { server, catalog } = registrar;
  registerScriptTools(registrar, lifecycleScriptDefs);
  const write = { readOnlyHint: false, destructiveHint: false, idempotentHint: false };

  catalog.tools.push({ name: "inbox_process", description: "Move a capture to specs/inbox/processed/ once specs with the Definition Gate passed cover it." });
  server.registerTool("inbox_process", {
    title: "Process an inbox capture",
    description:
      "Move a capture out of the active queue in specs/inbox/ to specs/inbox/processed/, recording the derived specs and updating references. " +
      "Every spec must have the Definition Gate passed; otherwise the tool fails with GATE_FAILED and nothing moves.",
    inputSchema: {
      capture: z.string().min(1).describe("Capture file in specs/inbox/, by name or path."),
      specs: z.array(z.string().min(1)).min(1).describe("Specs that cover the whole capture."),
      project,
    },
    annotations: write,
  }, (input) => respond(() => lifecycleActions.process(resolveProject(input.project), input.capture, input.specs)));

  catalog.tools.push({ name: "spec_transition", description: "Move a spec to an adjacent state folder and mirror its Status." });
  server.registerTool("spec_transition", {
    title: "Transition a spec",
    description:
      `Move a spec to another state folder (${SPEC_FOLDERS.join(" → ")}) and mirror its Status. Only adjacent states are accepted; ` +
      "an invalid transition fails with USAGE and details.accepted lists the valid destinations. Milestones are synced afterwards.",
    inputSchema: { spec, state: z.enum(SPEC_FOLDERS as unknown as [string, ...string[]]).describe("Destination state folder."), project },
    annotations: write,
  }, (input) => respond(() => lifecycleActions.transition(resolveProject(input.project), input.spec, input.state)));

  catalog.tools.push({ name: "spec_effort", description: "Record the effort (1 to 10) of a spec with a rationale." });
  server.registerTool("spec_effort", {
    title: "Record spec effort",
    description: "Record the estimated effort of a spec (integer 1 to 10) with a rationale, appended to the effort history in spec.md.",
    inputSchema: {
      spec,
      effort: z.number().int().min(1).max(10).describe("Integer from 1 to 10."),
      reason: z.string().min(1).describe("Rationale of the estimate."),
      project,
    },
    annotations: write,
  }, (input) => respond(() => lifecycleActions.effort(resolveProject(input.project), input.spec, input.effort, input.reason)));

  catalog.tools.push({ name: "specs_migrate", description: "Move legacy specs to the state folders by their Status." });
  server.registerTool("specs_migrate", {
    title: "Migrate legacy specs",
    description: "Move specs from the legacy layouts (specs/<slug>/, specs/specs/<slug>/) to the state folders according to their Status.",
    inputSchema: { project },
    annotations: write,
  }, (input) => respond(() => lifecycleActions.migrate(resolveProject(input.project))));

  catalog.tools.push({ name: "task_check", description: "Mark or unmark a task, or an item of its checklist, in spec.md." });
  server.registerTool("task_check", {
    title: "Check a task",
    description:
      "Mark (or with undo=true unmark) the checkbox of a task (T001) or of one item of its checklist in spec.md. " +
      "item is a checklist key (PREP, EXECUTE, VERIFY, VISUAL, EVIDENCE, IMPROVE) or its 1-based position. Fails with NOT_FOUND when the task or item does not exist.",
    inputSchema: {
      spec,
      task: z.string().min(1).describe("Task ID, such as T001."),
      item: z.string().optional().describe("Checklist key or 1-based position. Omit to change the task line."),
      undo: z.boolean().optional().describe("Unmark instead of mark."),
      project,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  }, (input) => respond(() => lifecycleActions.check(resolveProject(input.project), input.spec, input.task, input.item, Boolean(input.undo))));
}
