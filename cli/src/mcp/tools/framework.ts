/**
 * MCP tools of the framework commands (specs 0002 and 0011):
 * `skills_list`, `skills_detect`, `framework_install`, `framework_update`,
 * `skills_install`, `skills_remove` and `update_check`.
 *
 * Each tool calls the same function as its CLI command in
 * `src/cli/commands/framework.ts`, so results and errors match. Domain
 * errors come back as `isError` with the `AppError` JSON (code, name,
 * message). `update_check` only reports versions; replacing the binary is
 * left to the `upgrade` command.
 */
import { z } from "zod";
import { manifest } from "../../app/manifest.ts";
import { AppError } from "../../app/errors.ts";
import {
  detectSpecialists,
  installFramework,
  installSpecialists,
  listCatalog,
  removeSkills,
  updateFramework,
} from "../../cli/commands/framework.ts";
import { checkForUpdate } from "../../domain/updater.ts";
import type { Registrar } from "../server.ts";

const project = z.string().optional().describe("Project root. An explicit path is used as given; defaults to the nearest directory with specs/, .specsfy/ or skills-lock.json.");
const force = z.boolean().optional().describe("Replace or remove managed files and skills that have local changes.");
const names = z.array(z.string().min(1)).min(1);

/** Wraps a handler so domain errors come back as tool errors. */
function respond<T>(fn: () => Promise<T>) {
  return fn().then(
    (data) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data as Record<string, unknown> }),
    (e: unknown) => ({
      content: [{ type: "text" as const, text: JSON.stringify(e instanceof AppError ? e.toJSON() : { message: e instanceof Error ? e.message : String(e) }) }],
      isError: true,
    }),
  );
}

/** Registers the framework tools. */
export function registerFrameworkTools({ server, catalog }: Registrar): void {
  const network = { readOnlyHint: true, idempotentHint: true, openWorldHint: true };
  const write = { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true };

  catalog.tools.push({ name: "skills_list", description: "List the specialist catalog of the framework repository." });
  server.registerTool("skills_list", {
    title: "List specialists",
    description: "List the specialist catalog (name, description, category, tags, requires) of the repository in the catalog.repository setting.",
    inputSchema: {},
    annotations: network,
  }, () => respond(() => listCatalog()));

  catalog.tools.push({ name: "skills_detect", description: "Detect the specialists that match the project." });
  server.registerTool("skills_detect", {
    title: "Detect specialists",
    description: "Detect the specialists whose marker files or dependencies exist in the project and its subprojects. Read-only.",
    inputSchema: { project },
    annotations: network,
  }, (input) => respond(() => detectSpecialists(input.project)));

  catalog.tools.push({ name: "framework_install", description: "Install the Specsfy framework in the project." });
  server.registerTool("framework_install", {
    title: "Install the Specsfy framework",
    description:
      "Install base skills, .specsfy/ and the managed blocks of AGENTS.md and CLAUDE.md; optionally specialists. Idempotent; " +
      "files with local changes stop the install unless force is true. Returns installed, skipped and specialists.",
    inputSchema: {
      detected: z.boolean().optional().describe("Also install the detected specialists."),
      specialists: z.array(z.string().min(1)).optional().describe("Specialists to install with their requirements."),
      force,
      project,
    },
    annotations: write,
  }, (input) => respond(() => installFramework(input.project, { detected: input.detected, specialists: input.specialists, force: input.force })));

  catalog.tools.push({ name: "framework_update", description: "Update the installed Specsfy skills." });
  server.registerTool("framework_update", {
    title: "Update Specsfy skills",
    description: "Update every installed Specsfy skill, framework file and specialist without local changes. Returns the updated paths.",
    inputSchema: { force, project },
    annotations: write,
  }, (input) => respond(() => updateFramework(input.project, { force: input.force })));

  catalog.tools.push({ name: "skills_install", description: "Install specialists with their requirements." });
  server.registerTool("skills_install", {
    title: "Install specialists",
    description: "Install specialists from the catalog (specsfy-specialist-*), resolving their requirements first.",
    inputSchema: { names: names.describe("Specialist names."), force, project },
    annotations: write,
  }, (input) => respond(() => installSpecialists(input.project, input.names, { force: input.force })));

  catalog.tools.push({ name: "skills_remove", description: "Remove Specsfy skills from the project." });
  server.registerTool("skills_remove", {
    title: "Remove skills",
    description: "Remove Specsfy skills (framework, auxiliary or specialist) from the project. Names outside the Specsfy namespace are refused with USAGE.",
    inputSchema: { names: names.describe("Skill names."), force, project },
    annotations: { ...write, destructiveHint: true },
  }, (input) => respond(() => removeSkills(input.project, input.names, { force: input.force })));

  catalog.tools.push({ name: "update_check", description: "Compare the running version with the latest release." });
  server.registerTool("update_check", {
    title: "Check for a newer release",
    description: `Compare ${manifest.bin} ${manifest.version} with the latest GitHub Release. Returns current, latest and available; changes nothing.`,
    inputSchema: {},
    annotations: network,
  }, () => respond(() => checkForUpdate(manifest.version)));
}
