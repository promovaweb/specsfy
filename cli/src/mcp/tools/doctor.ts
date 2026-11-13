/**
 * Exposes read-only environment diagnostics through MCP. With `project`,
 * the tool adds the same project checks as `doctor --project` (Git, skills
 * CLI, skills-lock.json, GitHub token source and the daily release check).
 */
import { z } from "zod";
import { AppError } from "../../app/errors.ts";
import { collectDoctorChecks, collectProjectChecks } from "../../cli/commands/doctor.ts";
import { frameworkProject } from "../../cli/commands/framework.ts";
import type { Registrar } from "../server.ts";

/** Registers diagnostics using the same collectors as the CLI. */
export function registerDoctorTools({ server, catalog }: Registrar): void {
  const description = "Diagnose runtime, terminal and configuration health; with project, also Git, skills CLI, lock, GitHub token and release check. Returns checks and ok without credential values or file changes.";
  catalog.tools.push({ name: "doctor", description });
  server.registerTool("doctor", {
    title: "Environment diagnostics", description,
    inputSchema: { project: z.string().optional().describe("Project root to check as well; used as given.") },
    annotations: { readOnlyHint: true },
  }, async (input) => {
    const data = collectDoctorChecks();
    if (input.project) {
      try {
        data.checks.push(...(await collectProjectChecks(frameworkProject(input.project))));
      } catch (e) {
        return { content: [{ type: "text", text: JSON.stringify(e instanceof AppError ? e.toJSON() : { message: String(e) }) }], isError: true };
      }
      data.ok = data.checks.every((check) => check.status !== "fail");
    }
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: data, isError: !data.ok };
  });
}
