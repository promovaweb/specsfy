/**
 * Read-only project commands (spec 0001): `status`, `specs list`,
 * `specs show`, `progress`, `backlog list` and `inbox list`, plus
 * `scripts list` and `scripts run`, the escape hatch that runs any script
 * embedded from the framework.
 *
 * Every command resolves the project with `--project` or by walking up from
 * the current directory. The MCP tools in `src/mcp/tools/project.ts` call
 * the same functions.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { SPEC_FOLDERS } from "../../domain/lifecycle.ts";
import { specsFingerprint } from "../../domain/progress.ts";
import { listSpecs, projectOverview, specDetail, type ProjectOverview, type SpecSummary } from "../../core/overview.ts";
import { resolveProject } from "../../core/project.ts";
import { embeddedScripts, runScript } from "../../engine/runner.ts";
import { projectOption } from "../../engine/script-command.ts";
import { readSettings, getPath } from "../../config/settings.ts";
import { blocks, color, section, table } from "../format.ts";
import type { Command, Context } from "../registry.ts";

const bin = manifest.bin;

/** `12/20 (60%)` style counter. */
function ratio(done: number, total: number): string {
  return `${done}/${total}${total ? ` (${Math.round((done / total) * 100)}%)` : ""}`;
}

/** One line per spec, used by `status` and `specs list`. */
export function specLine(spec: SpecSummary): string {
  const gates = `${spec.passed_gates}/${spec.total_gates}`;
  const tasks = ratio(spec.completed_tasks, spec.total_tasks);
  return `${spec.slug.padEnd(36)} ${spec.folder.padEnd(12)} gates ${gates}  tasks ${tasks}`;
}

/** Text rendering of the overview. */
export function renderOverview(o: ProjectOverview): string {
  const s = o.summary;
  const states = SPEC_FOLDERS.map((folder) => `${folder} ${o.states[folder]}`).join(" · ");
  return blocks(
    `${color.strong("Project")} ${o.root}`,
    section("Progress") + "\n" + table([
      ["Specs", `${s.completed_specs}/${s.total_specs} complete`],
      ["Tasks", ratio(s.completed_tasks, s.total_tasks)],
      ["Checklist", ratio(s.completed_task_items, s.total_task_items)],
      ["Gates", ratio(s.passed_gates, s.total_gates)],
      ["States", states + (o.states.legacy ? ` · legacy ${o.states.legacy}` : "")],
      ["Backlog", String(o.backlog.length)],
      ["Inbox", String(o.inbox.filter((item) => !item.processed).length)],
    ]),
    o.specs.length ? section("Specs") + "\n" + o.specs.map((spec) => `  ${specLine(spec)}`).join("\n") : `No specs yet. Capture an idea with "${bin} inbox capture".`,
  );
}

export const statusCommand: Command = {
  name: "status",
  description: "Show the project overview: specs by state, progress, gates, backlog and inbox.",
  options: [projectOption],
  examples: [`${bin} status`, `${bin} status --json`, `${bin} status --project ../app`],
  run: async (ctx) => {
    const data = await projectOverview(resolveProject(ctx.options.project));
    return { data, text: () => renderOverview(data) };
  },
};

const specsList: Command = {
  name: "list",
  description: "List specs with state, gates and task progress.",
  options: [
    { name: "--state", argument: { name: "state", values: [...SPEC_FOLDERS, "legacy"] }, description: "Show only specs in this state folder." },
    projectOption,
  ],
  examples: [`${bin} specs list`, `${bin} specs list --state in-progress --json`],
  run: async (ctx) => {
    const specs = await listSpecs(resolveProject(ctx.options.project), ctx.options.state as string | undefined);
    return { data: { count: specs.length, specs }, text: () => (specs.length ? specs.map(specLine).join("\n") : "No specs found.") };
  },
};

const specsShow: Command = {
  name: "show",
  description: "Show one spec: metadata, gates, tasks and, with --content, the Markdown.",
  arguments: [{ name: "spec", description: "Spec number, folder name, slug or path.", required: true }],
  options: [{ name: "--content", description: "Include the spec Markdown." }, projectOption],
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${bin} specs show 0001`, `${bin} specs show recover-password --content`],
  run: async (ctx) => {
    const spec = await specDetail(resolveProject(ctx.options.project), ctx.args[0]!, Boolean(ctx.options.content));
    return {
      data: spec,
      text: () => blocks(
        `${color.strong(spec.title)} ${color.dim(spec.relativePath)}`,
        table([
          ["State", `${spec.folder} (${spec.status})`],
          ["Effort", spec.effort === null ? "not set" : `${spec.effort}/10 (${spec.execution_profile})`],
          ["Definition gate", spec.definition_gate],
          ["Plan gate", spec.plan_gate],
          ["Delivery gate", spec.delivery_gate],
          ["Tasks", ratio(spec.completed_tasks, spec.total_tasks)],
          ["Checklist", ratio(spec.completed_task_items, spec.total_task_items)],
        ]),
        spec.content,
      ),
    };
  },
};

export const specsReadCommands = [specsList, specsShow];

/** Seconds between progress refreshes, from `tui.watchInterval`. */
export function watchInterval(): number {
  const value = Number(getPath(readSettings(), "tui.watchInterval"));
  return Number.isFinite(value) && value >= 0.1 ? value : 0.75;
}

async function progressData(project: string, spec?: string) {
  const overview = await projectOverview(project);
  if (!spec) return overview;
  const detail = await specDetail(project, spec);
  return { ...overview, specs: overview.specs.filter((item) => item.path === detail.path) };
}

export const progressCommand: Command = {
  name: "progress",
  description: "Report progress of every spec or of one spec; --watch keeps refreshing on changes.",
  options: [
    { name: "--spec", argument: { name: "spec" }, description: "Only this spec (number, folder name, slug or path)." },
    { name: "--watch", description: "Refresh when spec files change, until Ctrl+C. With --json, prints one JSON line per change." },
    projectOption,
  ],
  exitCodes: [ExitCode.NOT_FOUND, ExitCode.INTERRUPTED],
  examples: [`${bin} progress`, `${bin} progress --spec 0001 --json`, `${bin} progress --watch`],
  run: async (ctx: Context) => {
    const project = resolveProject(ctx.options.project);
    const spec = ctx.options.spec as string | undefined;
    if (!ctx.options.watch) {
      const data = await progressData(project, spec);
      return { data, text: () => renderOverview(data) };
    }
    let last = "";
    const tick = async () => {
      const fingerprint = await specsFingerprint(project);
      if (fingerprint === last) return;
      last = fingerprint;
      const data = await progressData(project, spec);
      if (ctx.json) ctx.stdout(JSON.stringify({ ok: true, command: `${bin} progress`, data }));
      else ctx.stdout(`\x1b[2J\x1b[H${renderOverview(data)}\n${color.dim(`watching every ${watchInterval()}s · Ctrl+C to stop`)}`);
    };
    await tick();
    await new Promise<void>(() => { setInterval(() => { void tick(); }, watchInterval() * 1000); });
    return { data: null, text: "" };
  },
};

const backlogList: Command = {
  name: "list",
  description: "List backlog items in specs/backlog/.",
  options: [projectOption],
  examples: [`${bin} backlog list`, `${bin} backlog list --json`],
  run: async (ctx) => {
    const { backlog } = await projectOverview(resolveProject(ctx.options.project));
    return { data: { count: backlog.length, backlog }, text: () => (backlog.length ? backlog.map((item) => `${item.identifier.padEnd(32)} ${item.status.padEnd(14)} ${item.title}`).join("\n") : "Backlog is empty.") };
  },
};

const inboxList: Command = {
  name: "list",
  description: "List captures in specs/inbox/; --all includes processed ones.",
  options: [{ name: "--all", description: "Include captures in specs/inbox/processed/." }, projectOption],
  examples: [`${bin} inbox list`, `${bin} inbox list --all --json`],
  run: async (ctx) => {
    const { scanInboxCaptures } = await import("../../domain/inbox.ts");
    const project = resolveProject(ctx.options.project);
    const inbox = (await scanInboxCaptures(project, { includeProcessed: Boolean(ctx.options.all) })).map((item) => ({ ...item, path: item.path.replace(`${project}/`, "") }));
    return { data: { count: inbox.length, inbox }, text: () => (inbox.length ? inbox.map((item) => `${item.name.padEnd(40)} ${item.status}`).join("\n") : "Inbox is empty.") };
  },
};

export const backlogReadCommands = [backlogList];
export const inboxReadCommands = [inboxList];

const scriptsList: Command = {
  name: "list",
  description: "List the framework scripts embedded in the binary.",
  examples: [`${bin} scripts list`],
  run: () => {
    const scripts = embeddedScripts().map((path) => path.replace("/scripts/", "/").replace(/\.mjs$/, ""));
    return { data: { count: scripts.length, scripts }, text: scripts.join("\n") };
  },
};

const scriptsRun: Command = {
  name: "run",
  description: "Run an embedded framework script by name, passing the remaining arguments unchanged.",
  longDescription:
    "Use the name printed by `scripts list` (`specsfy-04-validate/validate_spec`). Arguments after `--` reach the script as given. " +
    "Prefer the dedicated commands (`gate`, `specs`, `tasks`, `context`) when one exists: they resolve spec identifiers and map exit codes.",
  arguments: [
    { name: "script", description: "Script name from `scripts list`.", required: true },
    { name: "args", description: "Arguments for the script.", variadic: true },
  ],
  options: [projectOption],
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${bin} scripts run specsfy-progress/progress -- . --json`],
  run: async (ctx) => {
    const [name, ...args] = ctx.args;
    const script = name!.includes("/scripts/") ? name! : `${name!.replace(/\/(?=[^/]+$)/, "/scripts/")}${name!.endsWith(".mjs") ? "" : ".mjs"}`;
    const project = resolveProject(ctx.options.project);
    const run = await runScript(script, args, { cwd: project });
    return {
      data: { script, exitCode: run.code, ok: run.code === 0, result: run.json ?? run.stdout.trim(), stderr: run.stderr.trim() },
      text: () => [run.stdout.trimEnd(), run.stderr.trimEnd()].filter(Boolean).join("\n"),
      code: run.code === 0 ? ExitCode.SUCCESS : run.code === 2 ? ExitCode.USAGE : ExitCode.GENERIC_ERROR,
    };
  },
};

export const scriptsCommand: Command = {
  name: "scripts",
  description: "List and run the framework scripts embedded in the binary.",
  subcommands: [scriptsList, scriptsRun],
};
