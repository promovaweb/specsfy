/**
 * Read-only environment diagnostics shared by CLI and MCP.
 *
 * Without a project, `doctor` checks runtime, terminal, settings, key
 * source and vault. With `--project <dir>` (spec 0002) it adds the checks
 * the framework commands need: Git, the skills CLI, the project folder,
 * `skills-lock.json`, a GitHub token (source only, never the value) and,
 * when the `update.check` setting is on, the cached daily release check.
 */
import { statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { paths } from "../../config/paths.ts";
import { getMasterKey, masterKeySource } from "../../config/crypto.ts";
import { readVault } from "../../config/credentials.ts";
import { readSettings, getPath } from "../../config/settings.ts";
import { checkPrerequisites } from "../../domain/prerequisites.ts";
import { LOCK_FILENAME, readSkillsLock } from "../../domain/skill-lock.ts";
import { resolveGithubToken } from "../../domain/github.ts";
import { dailyUpdateCheck } from "../../domain/updater.ts";
import { projectOption } from "../../engine/script-command.ts";
import { frameworkProject } from "./framework.ts";
import type { Command } from "../registry.ts";

export interface DoctorCheck {
  name: string;
  status: "ok" | "warn" | "fail";
  detail: string;
}

/** Collects independent checks without writing files or exposing secrets. */
export function collectDoctorChecks(runtime = { version: Bun.version, stdin: Boolean(process.stdin.isTTY), stdout: Boolean(process.stdout.isTTY) }) {
  const checks: DoctorCheck[] = [];
  const add = (name: string, status: DoctorCheck["status"], detail: string) => checks.push({ name, status, detail });
  add("bun", Bun.semver.satisfies(runtime.version, ">=1.4.4") ? "ok" : "fail", `${runtime.version}; minimum 1.4.4`);
  for (const stream of ["stdin", "stdout"] as const) add(stream, runtime[stream] ? "ok" : "warn", runtime[stream] ? "TTY available" : "Not a TTY");
  const inspect = (name: string, path: string, check: () => void, detail: string) => {
    try {
      statSync(path);
    } catch (e) {
      add(name, (e as NodeJS.ErrnoException).code === "ENOENT" ? "warn" : "fail", (e as NodeJS.ErrnoException).code === "ENOENT" ? "Not created" : "Cannot access file");
      return;
    }
    try { check(); add(name, "ok", detail); }
    catch { add(name, "fail", "Unreadable, invalid or incorrectly configured"); }
  };
  inspect("directory", paths.base(), () => {
    const stat = statSync(paths.base());
    if (!stat.isDirectory() || (stat.mode & 0o777) !== 0o700) throw new Error("Invalid directory mode");
  }, "Directory exists; mode 0700");
  inspect("settings", paths.settings(), () => {
    const data: unknown = JSON.parse(readFileSync(paths.settings(), "utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Expected object");
  }, "Readable JSON object");
  const source = masterKeySource();
  try {
    if (source !== "none") getMasterKey(false);
    add("master-key", source === "none" ? "warn" : "ok", source);
  } catch { add("master-key", "fail", `${source}; unavailable or invalid`); }
  inspect("credentials", paths.credentials(), () => { readVault(); }, "Vault decrypted successfully");
  add("binary", "ok", `${manifest.bin} ${manifest.version}`);
  add("platform", "ok", `${process.platform}-${process.arch}`);
  return { checks, ok: checks.every((check) => check.status !== "fail") };
}

/** Options of the project checks; tests replace the network parts. */
export interface ProjectCheckOptions {
  /** PATH used to find Git. */
  path?: string;
  /** Overrides the `update.check` setting. */
  updateCheck?: boolean;
  /** Daily check implementation. */
  checkUpdate?: typeof dailyUpdateCheck;
}

/** Checks a project for the framework commands, without writing files or exposing the token. */
export async function collectProjectChecks(project: string, options: ProjectCheckOptions = {}): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];
  const add = (name: string, status: DoctorCheck["status"], detail: string) => checks.push({ name, status, detail });
  for (const check of await checkPrerequisites(project, options.path === undefined ? {} : { path: options.path })) {
    add(check.name, check.ok ? "ok" : "fail", check.detail);
  }
  try {
    statSync(join(project, LOCK_FILENAME));
    try {
      const lock = await readSkillsLock(project);
      const count = Object.keys(lock.skills).length;
      add("lock", "ok", `${LOCK_FILENAME} lists ${count} skill${count === 1 ? "" : "s"}`);
    } catch (e) {
      add("lock", "fail", e instanceof Error ? e.message : String(e));
    }
  } catch {
    add("lock", "warn", `${LOCK_FILENAME} not found; run "${manifest.bin} install"`);
  }
  const token = await resolveGithubToken();
  add("github-token", token ? "ok" : "warn", token ? `found (${token.source})` : `none; catalog requests are anonymous. Save one with "${manifest.bin} credentials set github.token"`);
  let enabled = options.updateCheck;
  if (enabled === undefined) {
    try { enabled = getPath(readSettings(), "update.check") !== false; } catch { enabled = false; }
  }
  if (enabled) {
    const update = await (options.checkUpdate ?? dailyUpdateCheck)(manifest.version, { enabled: true });
    if (!update) add("update", "warn", "could not check the latest release");
    else if (update.available) add("update", "warn", `${update.latest} available (running ${update.current}); run "${manifest.bin} upgrade"`);
    else add("update", "ok", `${update.current} is the latest release`);
  }
  return checks;
}

export const doctorCommand: Command = {
  name: "doctor",
  description: "Check runtime, terminal, settings, key source and vault readability without changing files; --project adds the project checks.",
  options: [{ ...projectOption, description: "Also check this project: Git, skills CLI, skills-lock.json, GitHub token and the daily release check." }],
  exitCodes: [ExitCode.CONFIG, ExitCode.NOT_FOUND],
  run: async (ctx) => {
    const data = collectDoctorChecks();
    const option = ctx.options?.project;
    if (typeof option === "string" && option.trim() !== "") {
      const project = frameworkProject(option);
      data.checks.push(...(await collectProjectChecks(project)));
      data.ok = data.checks.every((check) => check.status !== "fail");
    }
    const marks = { ok: "✓", warn: "!", fail: "✗" };
    return { data, text: data.checks.map((c) => `${marks[c.status]} ${c.name}: ${c.detail}`).join("\n"), code: data.ok ? ExitCode.SUCCESS : ExitCode.CONFIG };
  },
};
