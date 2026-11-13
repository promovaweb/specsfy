/**
 * Runs the framework scripts embedded in the binary.
 *
 * The skills tree (`skills.gen.ts`) is written once per version to
 * `~/.specsfy/runtime/<version>-<digest>/skills/`, keeping the layout the
 * scripts expect. Each run spawns the binary itself with `BUN_BE_BUN=1`, so
 * the compiled executable behaves as the Bun runtime and executes the
 * `.mjs` file: no Node.js is needed on the machine. In development,
 * `process.execPath` is already `bun` and the variable is harmless.
 *
 * Callers receive stdout, stderr, the exit code and, when the script prints
 * JSON, the parsed value. A script that exits with a non-zero code is not an
 * exception here: the command decides how to map it.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { manifest } from "../app/manifest.ts";
import { error } from "../app/errors.ts";
import { baseDir } from "../config/paths.ts";
import { SKILL_FILES } from "./skills.gen.ts";

/** Result of one script execution. */
export interface ScriptRun {
  /** Script path inside the skills tree, e.g. `specsfy-04-validate/scripts/validate_spec.mjs`. */
  script: string;
  args: string[];
  code: number;
  stdout: string;
  stderr: string;
  /** Parsed stdout when it is a JSON document. */
  json?: unknown;
}

let cachedRoot: string | undefined;

/** Short digest of the embedded tree, so a new build never reuses stale files. */
function treeDigest(): string {
  const hash = createHash("sha256");
  for (const [path, content] of Object.entries(SKILL_FILES)) hash.update(path).update("\0").update(content).update("\0");
  return hash.digest("hex").slice(0, 12);
}

/**
 * Writes the embedded skills tree to disk when needed and returns the
 * directory that mirrors `skills/`. `SPECSFY_SKILLS_DIR` points to an
 * existing tree instead, used by the framework's own tests.
 */
export function skillsRuntimeDir(): string {
  const override = process.env.SPECSFY_SKILLS_DIR;
  if (override && override.trim() !== "") return override;
  if (cachedRoot) return cachedRoot;
  const root = join(baseDir(), "runtime", `${manifest.version}-${treeDigest()}`, "skills");
  const marker = join(root, ".complete");
  if (!existsSync(marker)) {
    for (const [path, content] of Object.entries(SKILL_FILES)) {
      const target = join(root, path);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content, { mode: path.endsWith(".mjs") ? 0o755 : 0o644 });
    }
    writeFileSync(marker, `${new Date().toISOString()}\n`);
  }
  cachedRoot = root;
  return root;
}

/** Lists the embedded scripts as `skill/scripts/file.mjs`. */
export function embeddedScripts(): string[] {
  return Object.keys(SKILL_FILES).filter((path) => /\/scripts\/[^/]+\.mjs$/.test(path)).sort();
}

/** Options of `runScript`. */
export interface RunOptions {
  /** Working directory of the script. Defaults to the current directory. */
  cwd?: string;
  /** Extra environment variables. */
  env?: Record<string, string>;
  /** Text written to the script's stdin. */
  input?: string;
}

/** Runs one embedded script and collects its output. */
export async function runScript(script: string, args: string[], options: RunOptions = {}): Promise<ScriptRun> {
  if (!(script in SKILL_FILES)) throw error.notFound(`Embedded script not found: ${script}`);
  const path = join(skillsRuntimeDir(), script);
  const child = Bun.spawn([process.execPath, path, ...args], {
    cwd: options.cwd ?? process.cwd(),
    env: { ...process.env, ...options.env, BUN_BE_BUN: "1", NO_COLOR: "1" },
    stdin: options.input === undefined ? "ignore" : new Blob([options.input]),
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  const run: ScriptRun = { script, args, code, stdout, stderr };
  const trimmed = stdout.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try { run.json = JSON.parse(trimmed); } catch { /* plain text that starts with a brace */ }
  }
  return run;
}
