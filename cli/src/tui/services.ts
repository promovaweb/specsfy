/**
 * Services the TUI screens call: project reads, gates, tests and skills.
 *
 * Every function here delegates to the same modules the CLI and the MCP
 * server use (`src/core/overview.ts`, `src/engine/script-command.ts`,
 * `src/domain/*`), so the three surfaces never tell different stories. The
 * screens receive a `TuiServices` object instead of importing the modules
 * directly, which lets tests replace the slow or remote parts (catalog
 * download, `php artisan test`, `npx skills`) with fakes.
 *
 * Reads never write files: the installed skills come from
 * `readSkillsLock`, not from `ensureSkillsLock`, so opening the TUI on a
 * read-only project leaves it untouched. Only the confirmed skill actions
 * write, through `SkillInstaller`.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { projectOverview, type ProjectOverview } from "../core/overview.ts";
import { gateDefinitions } from "../cli/commands/gates.ts";
import { executeScriptCommand, type ScriptCommandDef } from "../engine/script-command.ts";
import { runProjectTests, type TestRun } from "../domain/project-testing.ts";
import { Catalog } from "../domain/catalog.ts";
import { FRAMEWORK_SKILLS, SkillInstaller } from "../domain/installer.ts";
import { readSkillsLock, skillsLockFingerprint } from "../domain/skill-lock.ts";
import { specsFingerprint } from "../domain/progress.ts";
import { backlogsFingerprint } from "../domain/backlog.ts";
import { scanInboxCaptures } from "../domain/inbox.ts";

/** Outcome of one gate run, ready to show. */
export interface GateRun {
  ok: boolean;
  exitCode: number;
  /** Script output (structured result or stdout) followed by stderr. */
  output: string;
}

/** Operations used by the screens. */
export interface TuiServices {
  /** Project read model (specs, states, backlog, inbox). */
  overview(project: string): Promise<ProjectOverview>;
  /** Raw text of a project file (spec, backlog item, inbox capture). */
  readText(path: string): Promise<string>;
  /** Names registered in `skills-lock.json`, without creating it. */
  installedSkills(project: string): Promise<Set<string>>;
  /** Cheap combined fingerprint of specs, backlog, inbox and the lock. */
  fingerprint(project: string): Promise<string>;
  /** Gate definitions, in the order the Gates tab shows them. */
  gates(): readonly ScriptCommandDef[];
  /** Runs one gate against a spec (absolute path of `spec.md`). */
  runGate(def: ScriptCommandDef, specPath: string, project: string): Promise<GateRun>;
  /** Runs the project test suite, with the test database protection. */
  runTests(project: string, emit: (line: string) => void, signal: AbortSignal): Promise<TestRun>;
  /** Specialist catalog (remote, or `SPECSFY_SPECIALISTS_CATALOG`). */
  loadCatalog(): Promise<Catalog>;
  /** Installs skills (framework or specialists with their requirements). */
  installSkills(project: string, names: string[], catalog?: Catalog): Promise<string[]>;
  /** Removes Specsfy skills. */
  removeSkills(project: string, names: string[]): Promise<string[]>;
  /** Updates every installed Specsfy skill. */
  updateSkills(project: string): Promise<string[]>;
}

/** Formats the result of a script run as readable text. */
export function formatScriptOutput(result: unknown, stderr: string): string {
  const body = typeof result === "string" ? result : result === undefined || result === null ? "" : JSON.stringify(result, null, 2);
  return [body.trimEnd(), stderr.trimEnd()].filter(Boolean).join("\n") || "(no output)";
}

/**
 * Runs a gate with the spec as its only value. The definition's `spec`
 * parameter receives the path; definitions that need other required values
 * cannot run from the TUI and report that instead of guessing.
 */
async function runGate(def: ScriptCommandDef, specPath: string, project: string): Promise<GateRun> {
  const values: Record<string, unknown> = {};
  for (const param of def.params) {
    if (param.kind === "spec") values[param.name] = specPath;
    else if (param.required) {
      return { ok: false, exitCode: -1, output: `This gate needs "${param.name}"; run it with the CLI.` };
    }
  }
  const { data } = await executeScriptCommand(def, values, project);
  return { ok: data.ok, exitCode: data.exitCode, output: formatScriptOutput(data.result, data.stderr) };
}

/** Installs a mix of framework and specialist skills. */
async function installSkills(project: string, names: string[], catalog?: Catalog): Promise<string[]> {
  const framework = new Set<string>(FRAMEWORK_SKILLS);
  const base = names.filter((name) => framework.has(name));
  const specialists = names.filter((name) => name.startsWith("specsfy-specialist-"));
  const installer = await SkillInstaller.create(project);
  const changed: string[] = [];
  if (base.length) changed.push(...(await installer.installBaseSelection(base)));
  if (specialists.length) {
    const source = catalog ?? (await Catalog.fetch());
    const installed = (await readSkillsLock(project)).skills;
    const resolved = source.resolve(specialists).map((entry) => entry.name).filter((name) => !(name in installed) || specialists.includes(name));
    changed.push(...(await installer.installSpecialists(resolved)));
  }
  return changed;
}

/** Real services, backed by the shared modules. */
export function defaultServices(): TuiServices {
  return {
    overview: projectOverview,
    readText: (path) => readFile(path, "utf8"),
    installedSkills: async (project) => new Set(Object.keys((await readSkillsLock(project)).skills)),
    fingerprint: async (project) => {
      const [specs, backlog, lock, inbox] = await Promise.all([
        specsFingerprint(project),
        backlogsFingerprint(project),
        skillsLockFingerprint(project),
        scanInboxCaptures(project).then((items) => items.map((item) => `${item.name}:${item.status}:${item.processed}`).join("|")).catch(() => ""),
      ]);
      return [specs, backlog, lock, inbox].join("\n");
    },
    gates: () => gateDefinitions,
    runGate,
    runTests: (project, emit, signal) => runProjectTests(project, emit, signal),
    loadCatalog: () => Catalog.fetch(),
    installSkills,
    removeSkills: async (project, names) => (await SkillInstaller.create(project)).remove(names),
    updateSkills: async (project) => (await SkillInstaller.create(project)).updateAll(),
  };
}

/** Absolute path of a project-relative file. */
export function projectFile(project: string, relativePath: string): string {
  return join(project, relativePath);
}
