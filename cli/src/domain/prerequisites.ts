/**
 * Prerequisites shared by install, update, skills and doctor --project.
 *
 * The binary runs without Node.js. Node only mattered to the old CLI because
 * skills were materialized with `npx skills`. Now the skills CLI runs on the
 * Bun runtime embedded in the binary itself: the binary re-executes itself
 * with `BUN_BE_BUN=1` (`<binary> x --bun skills@<version> ...`), which works
 * with no Node.js or npx on the machine. `SPECSFY_SKILLS_CLI` (an executable
 * that behaves as `skills`) and `SPECSFY_NPX_COMMAND` (an `npx`-like
 * executable, called as `<npx> skills ...`) override that runtime.
 */

import { constants } from "node:fs";
import { access, readdir, stat } from "node:fs/promises";
import { delimiter, join, resolve } from "node:path";
import pkg from "../../package.json" with { type: "json" };
import { AppError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";

/** Pinned version of the official skills CLI, from package.json. */
export const SKILLS_VERSION: string = (pkg as { devDependencies?: Record<string, string> }).devDependencies?.skills ?? "latest";

/** Package spec handed to `bun x`. */
export const SKILLS_PACKAGE = `skills@${SKILLS_VERSION}`;

/** One prerequisite and whether it is satisfied. */
export interface PrerequisiteCheck {
  name: "git" | "skills" | "project";
  ok: boolean;
  detail: string;
  command?: string[] | undefined;
  /** For `project`: why it failed. */
  reason?: "missing" | "permission";
}

/** How to run the official skills CLI. */
export interface SkillsCommand {
  /** Executable followed by the arguments that precede `add`/`remove`. */
  command: string[];
  /** Extra environment for the child process. */
  env?: Record<string, string>;
  /** `override` (SPECSFY_SKILLS_CLI), `npx` (SPECSFY_NPX_COMMAND) or `self` (embedded Bun). */
  source: "override" | "npx" | "self";
}

interface CheckOptions {
  path?: string;
  platform?: NodeJS.Platform;
  pathext?: string;
}

/** True when running as a `bun build --compile` executable. */
export function isCompiledBinary(main = Bun.main): boolean {
  return main.startsWith("/$bunfs/") || /^[A-Za-z]:\\~BUN\\/.test(main);
}

/** The binary itself (or the bun running the sources) as the skills runtime. */
export function selfSkillsCommand(): SkillsCommand {
  return {
    command: [process.execPath, "x", "--bun", SKILLS_PACKAGE],
    env: { BUN_BE_BUN: "1" },
    source: "self",
  };
}

/**
 * Resolves how to call the skills CLI: SPECSFY_SKILLS_CLI, then
 * SPECSFY_NPX_COMMAND, then the embedded Bun runtime. Returns undefined
 * when an override is set but is not an executable file.
 */
export async function resolveSkillsCommand(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
): Promise<SkillsCommand | undefined> {
  const direct = env.SPECSFY_SKILLS_CLI?.trim();
  if (direct) {
    const executable = resolve(direct);
    return (await isExecutable(executable, platform)) ? { command: [executable], source: "override" } : undefined;
  }
  const npx = env.SPECSFY_NPX_COMMAND?.trim();
  if (npx) {
    const executable = resolve(npx);
    return (await isExecutable(executable, platform)) ? { command: [executable, "skills"], source: "npx" } : undefined;
  }
  return selfSkillsCommand();
}

/** Human description of a skills command, without environment values. */
export function describeSkillsCommand(command: SkillsCommand): string {
  if (command.source === "self") return `${SKILLS_PACKAGE} on the embedded Bun runtime (${command.command[0]} x --bun)`;
  return command.command.join(" ");
}

/** Checks every resource used by the install and update commands. */
export async function checkPrerequisites(
  project: string,
  options: CheckOptions = {},
): Promise<PrerequisiteCheck[]> {
  const path = options.path ?? process.env.PATH ?? "";
  const platform = options.platform ?? process.platform;
  const pathext = options.pathext ?? process.env.PATHEXT;
  const git = await findExecutable("git", path, platform, pathext);
  const skills = await resolveSkillsCommand(process.env, platform);
  const target = resolve(project);
  let reason: PrerequisiteCheck["reason"];
  try {
    if (!(await stat(target)).isDirectory()) reason = "missing";
    else {
      try { await access(target, constants.R_OK | constants.W_OK); }
      catch { reason = "permission"; }
    }
  } catch {
    reason = "missing";
  }

  return [
    {
      name: "git",
      ok: Boolean(git),
      detail: git ? `Git found at ${git}` : "Git not found in PATH; install Git to download the framework",
      command: git ? [git] : undefined,
    },
    {
      name: "skills",
      ok: Boolean(skills),
      detail: skills
        ? `skills CLI available through ${describeSkillsCommand(skills)}`
        : "SPECSFY_SKILLS_CLI or SPECSFY_NPX_COMMAND points to a file that is not executable",
      command: skills?.command,
    },
    {
      name: "project",
      ok: !reason,
      detail: !reason
        ? `project readable and writable at ${target}`
        : reason === "missing"
          ? `project directory not found: ${target}`
          : `project is not readable and writable: ${target}`,
      ...(reason ? { reason } : {}),
    },
  ];
}

/**
 * Stops the flow with every needed fix in a single message. A missing
 * project is NOT_FOUND, a read-only project is PERMISSION, anything else
 * is GENERIC_ERROR.
 */
export function assertPrerequisites(
  checks: PrerequisiteCheck[],
  required: PrerequisiteCheck["name"][] = checks.map(({ name }) => name),
): void {
  const selected = new Set(required);
  const failures = checks.filter(({ name, ok }) => selected.has(name) && !ok);
  if (!failures.length) return;
  const project = failures.find(({ name }) => name === "project");
  const code = project?.reason === "permission"
    ? ExitCode.PERMISSION
    : project?.reason === "missing"
      ? ExitCode.NOT_FOUND
      : ExitCode.GENERIC_ERROR;
  throw new AppError(
    code,
    "missing prerequisites:\n" + failures.map(({ detail }) => `- ${detail}`).join("\n"),
    { failed: failures.map(({ name }) => name) },
  );
}

/** Finds executables in PATH, honoring PATHEXT and Windows case. */
export async function findExecutable(
  name: string,
  path: string,
  platform: NodeJS.Platform = process.platform,
  pathext = process.env.PATHEXT,
): Promise<string | undefined> {
  const windows = platform === "win32";
  const extensions = windows
    ? [...(pathext ?? ".COM;.EXE;.BAT;.CMD").split(";").map((value) => value.trim()).filter((value) => /^\.[a-z0-9]+$/i.test(value)), ""]
    : [""];
  for (const item of path.split(windows ? ";" : delimiter)) {
    const directory = windows ? item.replace(/^"(.*)"$/, "$1") : item;
    if (!directory) continue;
    // Listing keeps the real case, even in Windows tests run on Linux.
    let entries: string[] = [];
    if (windows) {
      try { entries = await readdir(directory); } catch { continue; }
    }
    for (const extension of extensions) {
      const filename = name + extension;
      const actual = windows
        ? entries.find((entry) => entry.toLowerCase() === filename.toLowerCase())
        : filename;
      if (!actual) continue;
      const executable = join(directory, actual);
      if (await isExecutable(executable, platform)) return executable;
    }
  }
  return undefined;
}

async function isExecutable(path: string, platform: NodeJS.Platform = process.platform): Promise<boolean> {
  try {
    if (!(await stat(path)).isFile()) return false;
    await access(path, platform === "win32" ? constants.F_OK : constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
