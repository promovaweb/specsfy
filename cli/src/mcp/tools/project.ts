/**
 * Read-only project tools (spec 0001): `project_status`, `specs_list`,
 * `spec_get`, `backlog_list`, `inbox_list` and `scripts_list`. They call the
 * same read model as `status`, `specs list` and `specs show`.
 */
import { z } from "zod";
import { SPEC_FOLDERS } from "../../domain/lifecycle.ts";
import { scanInboxCaptures } from "../../domain/inbox.ts";
import { listSpecs, projectOverview, specDetail } from "../../core/overview.ts";
import { resolveProject } from "../../core/project.ts";
import { embeddedScripts } from "../../engine/runner.ts";
import { AppError } from "../../app/errors.ts";
import type { Registrar } from "../server.ts";

const project = z.string().optional().describe("Project root. Defaults to the nearest directory with specs/, .specsfy/ or skills-lock.json.");

/** Wraps a handler so domain errors come back as tool errors. */
function respond<T>(fn: () => Promise<T>) {
  return fn().then(
    (data) => ({ content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data as Record<string, unknown> }),
    (e: unknown) => ({
      content: [{ type: "text" as const, text: JSON.stringify(e instanceof AppError ? e.toJSON() : { message: String(e) }) }],
      isError: true,
    }),
  );
}

export function registerProjectTools({ server, catalog }: Registrar): void {
  const read = { readOnlyHint: true, idempotentHint: true };

  catalog.tools.push({ name: "project_status", description: "Project overview: specs by state, progress, gates, backlog and inbox." });
  server.registerTool("project_status", {
    title: "Project status",
    description: "Project overview: specs by state, progress summary, gates, backlog and inbox. Call it first to orient yourself.",
    inputSchema: { project },
    annotations: read,
  }, (input) => respond(() => projectOverview(resolveProject(input.project))));

  catalog.tools.push({ name: "specs_list", description: "List specs with state, gates and task progress." });
  server.registerTool("specs_list", {
    title: "List specs",
    description: "List specs with state folder, gates and task progress, optionally filtered by state.",
    inputSchema: { state: z.enum([...SPEC_FOLDERS, "legacy"] as [string, ...string[]]).optional().describe("State folder."), project },
    annotations: read,
  }, (input) => respond(async () => {
    const specs = await listSpecs(resolveProject(input.project), input.state);
    return { count: specs.length, specs };
  }));

  catalog.tools.push({ name: "spec_get", description: "One spec with metadata, gates, tasks and optionally the Markdown." });
  server.registerTool("spec_get", {
    title: "Read a spec",
    description: "One spec by number, folder name, slug or path, with metadata, gates, tasks and, when content is true, the Markdown.",
    inputSchema: { spec: z.string().min(1).describe("Spec number, folder name, slug or path."), content: z.boolean().optional().describe("Include the Markdown."), project },
    annotations: read,
  }, (input) => respond(() => specDetail(resolveProject(input.project), input.spec, Boolean(input.content))));

  catalog.tools.push({ name: "backlog_list", description: "Backlog items in specs/backlog/." });
  server.registerTool("backlog_list", {
    title: "List backlog",
    description: "Backlog items in specs/backlog/ with identifier, title and status.",
    inputSchema: { project },
    annotations: read,
  }, (input) => respond(async () => {
    const { backlog } = await projectOverview(resolveProject(input.project));
    return { count: backlog.length, backlog };
  }));

  catalog.tools.push({ name: "inbox_list", description: "Captures in specs/inbox/." });
  server.registerTool("inbox_list", {
    title: "List inbox",
    description: "Captures in specs/inbox/; all=true includes specs/inbox/processed/.",
    inputSchema: { all: z.boolean().optional().describe("Include processed captures."), project },
    annotations: read,
  }, (input) => respond(async () => {
    const inbox = await scanInboxCaptures(resolveProject(input.project), { includeProcessed: Boolean(input.all) });
    return { count: inbox.length, inbox };
  }));

  catalog.tools.push({ name: "scripts_list", description: "Framework scripts embedded in the binary." });
  server.registerTool("scripts_list", {
    title: "List embedded scripts",
    description: "Framework scripts embedded in the binary, usable through the CLI command scripts run.",
    inputSchema: {},
    annotations: read,
  }, () => respond(async () => ({ scripts: embeddedScripts() })));
}
