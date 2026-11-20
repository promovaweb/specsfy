/**
 * Smoke test of the compiled binary, the last step of `bun run validate`.
 *
 * `bun test` runs the TypeScript sources; the binary is bundled by
 * `bun build --compile` and can behave differently (the 0.32.0 release
 * started with `invalid skills inventory: not an object` only once
 * compiled). This script runs `dist/<bin>` itself, with no network:
 *
 * - `--version` prints the version of package.json;
 * - `--skill tui` prints the embedded documentation;
 * - `mcp --list` lists the tools;
 * - `doctor --json` answers with the checks (exit 0 or 3);
 * - `install` materializes the framework in a temporary project from this
 *   repository (a local clone) through the embedded `skills` CLI;
 * - `update --check` then reports the project in sync with the inventory.
 *
 * Usage: bun run smoke (after bun run build).
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { manifest } from "../src/app/manifest.ts";

const CLI = resolve(import.meta.dir, "..");
const REPOSITORY = resolve(CLI, "..");
const binary = join(CLI, "dist", process.platform === "win32" ? `${manifest.bin}.exe` : manifest.bin);

if (!existsSync(binary)) {
  console.error(`${binary} not found. Run: bun run build`);
  process.exit(1);
}

const root = mkdtempSync(join(tmpdir(), "specsfy-smoke-"));
const home = join(root, "home");
const project = join(root, "project");
mkdirSync(home);
mkdirSync(project);
writeFileSync(join(home, "settings.json"), JSON.stringify({ catalog: { repository: REPOSITORY }, update: { check: false } }));

/** Runs the binary and returns exit code and output. */
function run(args: string[]): { code: number; stdout: string; stderr: string } {
  const result = Bun.spawnSync([binary, ...args], {
    cwd: root,
    env: { ...process.env, [`${manifest.envPrefix}_HOME`]: home, NO_COLOR: "1" },
    stdout: "pipe",
    stderr: "pipe",
  });
  return { code: result.exitCode ?? 1, stdout: result.stdout.toString(), stderr: result.stderr.toString() };
}

const failures: string[] = [];
/** Records one check; prints ✓ or ✗ with the output on failure. */
function check(name: string, ok: boolean, detail: () => string): void {
  if (ok) console.log(`✓ ${name}`);
  else {
    failures.push(name);
    console.error(`✗ ${name}\n${detail()}`);
  }
}

try {
  const version = run(["--version"]);
  check("--version", version.code === 0 && version.stdout.includes(manifest.version), () => version.stdout + version.stderr);

  const skill = run(["--skill", "tui"]);
  check("--skill tui", skill.code === 0 && skill.stdout.includes("TUI"), () => skill.stderr);

  const tools = run(["mcp", "--list"]);
  check("mcp --list", tools.code === 0 && tools.stdout.includes("framework_update"), () => tools.stdout + tools.stderr);

  const doctor = run(["doctor", "--json"]);
  check("doctor --json", [0, 3].includes(doctor.code) && doctor.stdout.includes('"checks"'), () => doctor.stdout + doctor.stderr);

  const install = run(["install", "--latest", "--project", project, "--json"]);
  check("install from this repository", install.code === 0 && existsSync(join(project, ".agents", "skills", "specsfy-setup", "SKILL.md")), () => install.stdout + install.stderr);

  const update = run(["update", "--check", "--latest", "--project", project, "--json"]);
  check("update --check after install", update.code === 0 && update.stdout.includes('"in_sync": true'), () => update.stdout + update.stderr);
} finally {
  rmSync(root, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`The compiled binary failed ${failures.length} smoke check(s).`);
  process.exit(1);
}
console.log(`✓ dist/${manifest.bin} passed the smoke test`);
