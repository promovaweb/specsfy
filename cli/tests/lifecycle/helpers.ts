/**
 * Shared helpers of the lifecycle suites: a disposable copy of `example/`
 * (never the original) and a CLI runner in a subprocess with an isolated
 * data directory and the repository skills tree.
 */
import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { HOME_VARIABLE } from "../../src/config/paths.ts";

export const CLI_DIR = join(import.meta.dir, "..", "..");
export const EXAMPLE_DIR = join(CLI_DIR, "..", "example");
export const SKILLS_DIR = join(CLI_DIR, "..", "skills");

/**
 * Installed dependencies and build output of `example/`. They hold hundreds
 * of megabytes the commands under test never read, and copying them made
 * `beforeAll` hit its time limit now and then.
 */
const HEAVY_FOLDERS = new Set(["node_modules", "vendor", ".git", "public/build", "storage/framework", "storage/logs"]);

/** Copies `example/` to a new temporary directory and returns the copy. */
export function copyExample(): string {
  const root = mkdtempSync(join(tmpdir(), "specsfy-lifecycle-"));
  const project = join(root, "project");
  cpSync(EXAMPLE_DIR, project, {
    recursive: true,
    filter: (source) => !HEAVY_FOLDERS.has(relative(EXAMPLE_DIR, source).split(sep).join("/")),
  });
  return project;
}

/** Removes the temporary root created by `copyExample`. */
export function removeCopy(project: string): void {
  rmSync(join(project, ".."), { recursive: true, force: true });
}

/** Environment of the CLI subprocess and the MCP server. */
export function cliEnv(home: string): Record<string, string> {
  return { ...(process.env as Record<string, string>), [HOME_VARIABLE]: home, SPECSFY_SKILLS_DIR: SKILLS_DIR, NO_COLOR: "1" };
}

/** Runs the CLI and parses stdout as JSON when `--json` is given. */
export async function runCli(args: string[], home: string) {
  const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args], { cwd: CLI_DIR, env: cliEnv(home), stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  const code = await proc.exited;
  let json: any;
  try { json = JSON.parse(stdout); } catch { json = undefined; }
  return { code, stdout, stderr, json };
}
