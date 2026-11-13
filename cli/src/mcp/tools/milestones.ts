/**
 * MCP tools of the milestones (spec 0007): `milestones_sync` (native, same
 * function as `milestones sync`) and `milestones_import_mvp` (script
 * definition of `milestones import-mvp`).
 */
import { z } from "zod";
import { resolveProject } from "../../core/project.ts";
import { registerScriptTools } from "../../engine/script-command.ts";
import { milestonesImportMvpDef, milestonesSync } from "../../cli/commands/milestones.ts";
import { respond } from "./lifecycle.ts";
import type { Registrar } from "../server.ts";

/** Registers the milestones tools. */
export function registerMilestonesTools(registrar: Registrar): void {
  const { server, catalog } = registrar;
  catalog.tools.push({ name: "milestones_sync", description: "Rebuild milestone progress and the specs.md index from the specs." });
  server.registerTool("milestones_sync", {
    title: "Sync milestones",
    description: "Rebuild the derived progress blocks of specs/milestones/<ID>.md and the index in specs.md from the specs and backlog items. Human content outside the blocks is kept.",
    inputSchema: { project: z.string().optional().describe("Project root. Defaults to the nearest directory with specs/, .specsfy/ or skills-lock.json.") },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  }, (input) => respond(() => milestonesSync(resolveProject(input.project))));
  registerScriptTools(registrar, [milestonesImportMvpDef]);
}
