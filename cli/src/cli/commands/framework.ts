/**
 * Framework install and update commands (specs 0002 and 0011).
 *
 * Top level: `install`, `update` and `upgrade`. Group `skills`: `list`,
 * `detect`, `install`, `remove` and `update`. They keep parity with the
 * previous Node CLI on top of `src/domain/installer.ts`, `catalog.ts`,
 * `skill-lock.ts`, `prerequisites.ts`, `github.ts` and `updater.ts`.
 *
 * The framework repository comes from the `catalog.repository` setting and
 * the agent targets of `skills add` from `skills.agents`. An explicit
 * `--project` is used as given (an empty folder is a valid install target);
 * without it the nearest project above the current directory is used.
 *
 * The functions exported here are the single implementation: the MCP tools
 * in `src/mcp/tools/framework.ts` call them with the same arguments.
 */
import { existsSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { manifest } from "../../app/manifest.ts";
import { error } from "../../app/errors.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { readSettings, getPath } from "../../config/settings.ts";
import { resolveProject } from "../../core/project.ts";
import { projectOption } from "../../engine/script-command.ts";
import { Catalog, DEFAULT_REPOSITORY, type CatalogEntryValue } from "../../domain/catalog.ts";
import { FRAMEWORK_SKILLS, isSpecsfySkillName, SkillInstaller } from "../../domain/installer.ts";
import { assertPrerequisites, checkPrerequisites } from "../../domain/prerequisites.ts";
import { compareVersions, upgrade, type UpgradeResult } from "../../domain/updater.ts";
import { color } from "../format.ts";
import type { Command, Context } from "../registry.ts";

const bin = manifest.bin;

/** Repository and agent targets from settings.json. */
export function frameworkSettings(): { repository: string; agents: string } {
  const settings = readSettings();
  const repository = String(getPath(settings, "catalog.repository") ?? "").trim() || DEFAULT_REPOSITORY;
  const agents = String(getPath(settings, "skills.agents") ?? "").trim() || "universal";
  return { repository, agents };
}

/**
 * Directory a framework command acts on: an explicit `--project` as given
 * (it must exist), otherwise the nearest project root or the current
 * directory.
 */
export function frameworkProject(option?: string | boolean): string {
  if (typeof option === "string" && option.trim() !== "") {
    const path = resolve(option);
    if (!existsSync(path) || !statSync(path).isDirectory()) throw error.notFound(`Project directory not found: ${path}`);
    return path;
  }
  return resolveProject();
}

/** Splits comma-separated values and removes blanks and duplicates. */
export function splitNames(value: unknown): string[] {
  const items = Array.isArray(value) ? value.map(String) : typeof value === "string" ? value.split(",") : [];
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

async function installer(project: string, force: boolean): Promise<SkillInstaller> {
  assertPrerequisites(await checkPrerequisites(project), ["git", "skills", "project"]);
  const { repository, agents } = frameworkSettings();
  return SkillInstaller.create(project, force, { repository, agents });
}

const rel = (project: string, paths: string[]) => paths.map((path) => relative(project, path) || ".");

/** Public shape of a catalog entry in `--json` and MCP. */
export interface CatalogItem {
  name: string;
  description: string;
  category: string;
  tags: string[];
  requires: string[];
}

const item = ({ name, description, category, tags, requires }: CatalogEntryValue): CatalogItem => ({ name, description, category, tags, requires });

/** Data of `install`. */
export interface InstallData {
  project: string;
  /** Files and skill folders written, relative to the project. */
  installed: string[];
  /** Framework skills that were already current. */
  skipped: string[];
  /** Specialists requested, detected and required, in install order. */
  specialists: string[];
}

/** Installs the framework and, optionally, specialists. */
export async function installFramework(
  projectOptionValue: string | boolean | undefined,
  options: { detected?: boolean; specialists?: string[]; force?: boolean },
): Promise<InstallData> {
  const project = frameworkProject(projectOptionValue);
  const requested = splitNames(options.specialists ?? []);
  for (const name of requested) {
    if (!name.startsWith("specsfy-specialist-")) throw error.usage(`specialist skills must use the specsfy-specialist- prefix: ${name}`, { name });
  }
  const target = await installer(project, Boolean(options.force));
  const changed = await target.installBase();
  let specialists: string[] = [];
  if (options.detected || requested.length) {
    const catalog = await Catalog.fetch(target.repository);
    const names = [...requested];
    if (options.detected) names.push(...(await catalog.detect(project)).map((entry) => entry.name));
    specialists = catalog.resolve([...new Set(names)]).map((entry) => entry.name);
    if (specialists.length) changed.push(...(await target.installSpecialists(specialists)));
  }
  const installed = rel(project, changed);
  const skipped = FRAMEWORK_SKILLS.filter((name) => !installed.includes(join(".agents", "skills", name)));
  return { project, installed, skipped, specialists };
}

/** Data of `update` and `skills update`. */
export interface UpdateData {
  project: string;
  /** Files and skill folders rewritten, relative to the project. */
  updated: string[];
}

/** Updates every Specsfy skill already registered in the project. */
export async function updateFramework(projectOptionValue: string | boolean | undefined, options: { force?: boolean }): Promise<UpdateData> {
  const project = frameworkProject(projectOptionValue);
  const target = await installer(project, Boolean(options.force));
  return { project, updated: rel(project, await target.updateAll()) };
}

/** Lists the specialist catalog. */
export async function listCatalog(): Promise<{ count: number; skills: CatalogItem[] }> {
  const skills = (await Catalog.fetch(frameworkSettings().repository)).entries.map(item);
  return { count: skills.length, skills };
}

/** Detects the specialists that match the project's technologies. */
export async function detectSpecialists(projectOptionValue?: string | boolean): Promise<{ project: string; count: number; skills: CatalogItem[] }> {
  const project = frameworkProject(projectOptionValue);
  const catalog = await Catalog.fetch(frameworkSettings().repository);
  const skills = (await catalog.detect(project)).map(item);
  return { project, count: skills.length, skills };
}

/** Installs specialists and their requirements. */
export async function installSpecialists(
  projectOptionValue: string | boolean | undefined,
  names: string[],
  options: { force?: boolean },
): Promise<{ project: string; installed: string[]; specialists: string[] }> {
  const project = frameworkProject(projectOptionValue);
  const requested = splitNames(names);
  if (!requested.length) throw error.usage("Provide at least one specialist name.");
  for (const name of requested) {
    if (!name.startsWith("specsfy-specialist-")) throw error.usage(`specialist skills must use the specsfy-specialist- prefix: ${name}`, { name });
  }
  const target = await installer(project, Boolean(options.force));
  const catalog = await Catalog.fetch(target.repository);
  const specialists = catalog.resolve(requested).map((entry) => entry.name);
  return { project, installed: rel(project, await target.installSpecialists(specialists)), specialists };
}

/** Removes Specsfy skills; names outside the Specsfy namespace are USAGE. */
export async function removeSkills(
  projectOptionValue: string | boolean | undefined,
  names: string[],
  options: { force?: boolean },
): Promise<{ project: string; removed: string[] }> {
  const project = frameworkProject(projectOptionValue);
  const requested = splitNames(names);
  if (!requested.length) throw error.usage("Provide at least one skill name.");
  const external = requested.filter((name) => !isSpecsfySkillName(name));
  if (external.length) throw error.usage(`not a Specsfy skill name: ${external.join(", ")}`, { names: external });
  const target = await installer(project, Boolean(options.force));
  return { project, removed: rel(project, await target.remove(requested)) };
}

/** Checks the latest release and, without `check`, replaces the binary. */
export async function upgradeBinary(check: boolean): Promise<UpgradeResult> {
  return upgrade(manifest.version, { check });
}

const forceOption = { name: "--force", description: "Replace managed files and skills that have local changes." };

const pathsText = (paths: string[], empty: string) => () => (paths.length ? paths.join("\n") : empty);

const catalogText = (skills: CatalogItem[], empty: string) => () =>
  skills.length ? skills.map((skill) => `${skill.name.padEnd(44)} ${color.dim(skill.description)}`).join("\n") : empty;

const namesArgument = { name: "names", description: "Skill names.", required: true, variadic: true } as const;

const installCommand: Command = {
  name: "install",
  description: "Install the Specsfy framework in the project: base skills, .specsfy/ and the managed blocks of AGENTS.md and CLAUDE.md.",
  longDescription:
    "Idempotent: a second run changes nothing. Files under .specsfy/templates/custom/ are never touched, and managed files with local changes " +
    "stop the install unless --force is given. Skills are materialized with the official skills CLI, run on the Bun runtime embedded in the binary.",
  options: [
    { name: "--detected", description: "Also install the specialists detected from the project's files and dependencies." },
    { name: "--specialist", argument: { name: "name" }, description: "Specialist to install with its requirements. Comma-separated list." },
    forceOption,
    projectOption,
  ],
  exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${bin} install`, `${bin} install --detected --json`, `${bin} install --specialist specsfy-specialist-laravel --project ../app`],
  run: async (ctx: Context) => {
    const data = await installFramework(ctx.options.project, {
      detected: Boolean(ctx.options.detected),
      specialists: splitNames(ctx.options.specialist),
      force: Boolean(ctx.options.force),
    });
    return { data, text: pathsText(data.installed, "Specsfy is already installed and up to date.") };
  },
};

const updateRun = async (ctx: Context) => {
  const data = await updateFramework(ctx.options.project, { force: Boolean(ctx.options.force) });
  return { data, text: pathsText(data.updated, "Specsfy skills are already up to date.") };
};

const updateCommand: Command = {
  name: "update",
  description: "Update the installed Specsfy skills, framework files and specialists that have no local changes.",
  options: [forceOption, projectOption],
  exitCodes: [ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${bin} update`, `${bin} update --force --json`],
  run: updateRun,
};

const upgradeCommand: Command = {
  name: "upgrade",
  description: "Upgrade the specsfy binary to the latest GitHub Release; --check only reports the versions.",
  longDescription:
    "A standalone binary downloads the executable of its platform, verifies SHA256SUMS and replaces itself. " +
    "When started by the npm wrapper @promovaweb/specsfy, npm updates the wrapper instead. Running from source refuses with USAGE.",
  options: [{ name: "--check", description: "Only compare the running version with the latest release." }],
  exitCodes: [ExitCode.NETWORK_OR_API, ExitCode.PERMISSION],
  examples: [`${bin} upgrade --check`, `${bin} upgrade`, `${bin} upgrade --check --json`],
  run: async (ctx: Context) => {
    const result = await upgradeBinary(Boolean(ctx.options.check));
    const data = { current: result.current, latest: result.latest, upgraded: result.upgraded };
    const text = result.upgraded
      ? `Upgraded ${bin} ${result.current} → ${result.latest}${result.method === "npm" ? " through npm" : result.path ? ` at ${result.path}` : ""}.`
      : compareVersions(result.latest, result.current) <= 0
        ? `${bin} ${result.current} is up to date.`
        : `${bin} ${result.latest} is available (running ${result.current}). Run "${bin} upgrade".`;
    return { data, text };
  },
};

export const frameworkTopLevelCommands: Command[] = [installCommand, updateCommand, upgradeCommand];

const skillsList: Command = {
  name: "list",
  description: "List the specialist catalog of the framework repository.",
  exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API],
  examples: [`${bin} skills list`, `${bin} skills list --json`],
  run: async () => {
    const data = await listCatalog();
    return { data, text: catalogText(data.skills, "The catalog is empty.") };
  },
};

const skillsDetect: Command = {
  name: "detect",
  description: "Detect the specialists that match the project's files and dependencies.",
  options: [projectOption],
  exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND],
  examples: [`${bin} skills detect`, `${bin} skills detect --project ../app --json`],
  run: async (ctx: Context) => {
    const data = await detectSpecialists(ctx.options.project);
    return { data, text: catalogText(data.skills, "No specialist matches this project.") };
  },
};

const skillsInstall: Command = {
  name: "install",
  description: "Install specialists from the catalog, with their requirements.",
  arguments: [namesArgument],
  options: [forceOption, projectOption],
  exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${bin} skills install specsfy-specialist-laravel`, `${bin} skills install specsfy-specialist-react specsfy-specialist-nextjs --json`],
  run: async (ctx: Context) => {
    const data = await installSpecialists(ctx.options.project, ctx.args, { force: Boolean(ctx.options.force) });
    return { data, text: pathsText(data.installed, `Already installed: ${data.specialists.join(", ")}.`) };
  },
};

const skillsRemove: Command = {
  name: "remove",
  description: "Remove Specsfy skills from the project; skills outside the Specsfy namespace are refused.",
  arguments: [namesArgument],
  options: [{ name: "--force", description: "Remove skills even when they have local changes." }, projectOption],
  exitCodes: [ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${bin} skills remove specsfy-specialist-react`],
  run: async (ctx: Context) => {
    const data = await removeSkills(ctx.options.project, ctx.args, { force: Boolean(ctx.options.force) });
    return { data, text: pathsText(data.removed, "Nothing to remove.") };
  },
};

const skillsUpdate: Command = {
  name: "update",
  description: "Update every installed Specsfy skill; same as the top-level update.",
  options: [forceOption, projectOption],
  exitCodes: [ExitCode.NETWORK_OR_API, ExitCode.NOT_FOUND, ExitCode.PERMISSION],
  examples: [`${bin} skills update`],
  run: updateRun,
};

export const skillsCommands: Command[] = [skillsList, skillsDetect, skillsInstall, skillsRemove, skillsUpdate];
