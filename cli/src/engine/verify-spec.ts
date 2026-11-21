/** Runs the per-state repository checks for one spec without scanning other specs. */
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, join, relative, sep } from "node:path";
import { writeTextAtomic } from "../domain/filesystem.ts";
import { readHeaderField } from "../domain/spec-header.ts";
import { skillsRuntimeDir, withNodeShim, type ScriptRun } from "./runner.ts";

interface ScopeOptions {
  project: string;
  spec: string;
  boundary: string;
  timeoutSeconds: number;
  maxOutputBytes: number;
  attestation?: string;
}

interface ScopedCheck {
  name: string;
  command: string[];
  code: number;
  status: "passed" | "failed" | "timed_out";
  detail: string;
  timed_out: boolean;
  truncated: boolean;
}

const POLICY_SCRIPTS = {
  spec: "specsfy-04-validate/scripts/validate_spec.mjs",
  tasks: "specsfy-05-tasks/scripts/validate_tasks.mjs",
  trace: "specsfy-06-implement/scripts/check_traceability.mjs",
  acceptance: "specsfy-06-implement/scripts/verify_acceptance.mjs",
  evidence: "specsfy-06-implement/scripts/verify_evidence.mjs",
  research: "specsfy-03-specify/scripts/load_research.mjs",
};

function runCheck(name: string, command: string[], options: ScopeOptions): Promise<ScopedCheck> {
  const env = withNodeShim({ ...process.env, BUN_BE_BUN: "1", NO_COLOR: "1", PYTHONDONTWRITEBYTECODE: "1" });
  return new Promise((resolve, reject) => {
    const child = spawn("node", command.slice(1), { cwd: options.project, env, stdio: ["ignore", "pipe", "pipe"] });
    const chunks: Buffer[] = [];
    let bytes = 0;
    let truncated = false;
    let timed_out = false;
    const capture = (chunk: Buffer) => {
      const remaining = options.maxOutputBytes - bytes;
      if (chunk.length > remaining) truncated = true;
      const kept = chunk.subarray(0, remaining);
      if (kept.length) chunks.push(kept);
      bytes += kept.length;
    };
    child.stdout.on("data", capture);
    child.stderr.on("data", capture);
    const timer = setTimeout(() => {
      timed_out = true;
      child.kill("SIGKILL");
    }, options.timeoutSeconds * 1000);
    child.once("error", (cause) => {
      clearTimeout(timer);
      reject(cause);
    });
    child.once("close", (exit) => {
      clearTimeout(timer);
      const code = timed_out ? 124 : exit ?? 1;
      const status = timed_out ? "timed_out" : code === 0 ? "passed" : "failed";
      const detail = Buffer.concat(chunks).toString("utf8").trim() + (truncated ? "\n...[truncated]" : "");
      resolve({ name, command, code, status, detail, timed_out, truncated });
    });
  });
}

/** Applies the same spec, tasks and delivery gate selection as verify_repo. */
export async function verifyOneSpec(options: ScopeOptions): Promise<ScriptRun> {
  const { project, spec, boundary, timeoutSeconds, maxOutputBytes, attestation } = options;
  const markdown = await readFile(spec, "utf8");
  const status = readHeaderField(markdown, "Status");
  const evidence = readHeaderField(markdown, "Evidence Contract") === "1";
  const slug = basename(dirname(spec));
  const checks: ScopedCheck[] = [];
  const digest = createHash("sha256").update(JSON.stringify({ boundary, timeoutSeconds, maxOutputBytes }));
  const check = async (name: keyof typeof POLICY_SCRIPTS, ...args: string[]) => {
    const script = POLICY_SCRIPTS[name];
    const installed = join(project, ".agents", "skills", script);
    const path = existsSync(installed) ? installed : join(skillsRuntimeDir(), script);
    const command = ["node", path, spec, ...args];
    digest.update(JSON.stringify(command)).update(await readFile(path));
    checks.push(await runCheck(`${name}:${slug}`, command, options));
  };

  await check("spec", ...(status === "Draft" ? ["--allow-draft"] : []));
  if (status && ["Planned", "Implementing", "Reviewing", "Complete"].includes(status)) await check("tasks");
  if (status === "Complete") {
    await check("trace", project, "--kinds", "US,FR,NFR,AC", ...(evidence ? ["--full-chain"] : []));
    if (evidence) {
      await check("acceptance", project, "--json");
      await check("evidence", project);
      await check("research", project);
    }
  }

  const passed = checks.every(({ code }) => code === 0);
  const revision = spawnSync("git", ["rev-parse", "HEAD"], { cwd: project, encoding: "utf8" });
  const commit = revision.stdout?.trim();
  const payload = {
    schema_version: 2,
    boundary,
    spec: relative(project, spec).split(sep).join("/"),
    commit_sha: commit && /^[0-9a-f]{40}$/u.test(commit) ? commit : null,
    policy_digest: digest.digest("hex"),
    result: passed ? "passed" : "failed",
    checks,
    evidence_bindings: [],
    canaries: [],
    errors: [],
  };
  const stdout = JSON.stringify(payload, null, 2) + "\n";
  if (attestation) await writeTextAtomic(attestation, stdout);
  return { script: "verify --spec", args: [spec], code: passed ? 0 : 1, stdout, stderr: "", json: payload };
}
