/**
 * Milestone commands (spec 0007).
 *
 * `milestones sync` is native: it rebuilds the derived blocks of
 * `specs/milestones/<ID>.md` and `specs.md` from the specs and backlog items
 * (`src/domain/milestones.ts`). `milestones import-mvp` passes the project
 * root to `importar_mvp.mjs`, which turns the development themes of
 * `MVP.md` into backlog items, Draft specs and milestone M01.
 */
import { relative } from "node:path";
import { manifest } from "../../app/manifest.ts";
import { resolveProject } from "../../core/project.ts";
import { syncMilestones } from "../../domain/milestones.ts";
import { projectOption, toCommand, type ScriptCommandDef } from "../../engine/script-command.ts";
import type { Command } from "../registry.ts";

const bin = manifest.bin;

export const milestonesImportMvpDef: ScriptCommandDef = {
  name: "import-mvp",
  tool: "milestones_import_mvp",
  description: "Import the development requirements of MVP.md as backlog items, Draft specs and milestone M01.",
  longDescription:
    "Reads MVP.md from the project or its Git superproject. Business context stays in MVP.md; gaps stay pending and no gate is passed. " +
    "Returns the milestone path and the created items.",
  script: "specsfy-mvp-milestone-interviewer/scripts/importar_mvp.mjs",
  project: "root-flag",
  effect: "write",
  params: [],
  examples: [`${bin} milestones import-mvp --json`],
};

/** Milestone sync with paths relative to the project, shared with MCP. */
export async function milestonesSync(project: string) {
  const result = await syncMilestones(project);
  return {
    index_path: relative(project, result.index_path),
    count: result.milestones.length,
    milestones: result.milestones.map((milestone) => ({ ...milestone, path: relative(project, milestone.path) })),
  };
}

const milestonesSyncCommand: Command = {
  name: "sync",
  description: "Rebuild the progress of specs/milestones/ and the index in specs.md from the specs and backlog.",
  longDescription: "Only the delimited derived blocks are rewritten; human content outside them is kept. A milestone cited by a spec but missing gets a skeleton.",
  options: [projectOption],
  examples: [`${bin} milestones sync`, `${bin} milestones sync --json`],
  run: async (ctx) => {
    const data = await milestonesSync(resolveProject(ctx.options.project));
    return {
      data,
      text: () => (data.count
        ? data.milestones.map((m) => `${m.id.padEnd(12)} ${m.completed_specs}/${m.total_specs} specs (${m.percent}%)  backlog ${m.backlog_items}`).join("\n")
        : `No milestone linked yet. Index updated: ${data.index_path}`),
    };
  },
};

export const milestonesCommands: Command[] = [milestonesSyncCommand, toCommand(milestonesImportMvpDef)];
