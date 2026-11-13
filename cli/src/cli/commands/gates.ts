/**
 * Gate commands (spec 0004): `gate spec|tasks|interface|trace|acceptance|
 * evidence|findings|database` and the top-level `verify`.
 *
 * `gateDefinitions` lists the script definitions of every gate, in the
 * order the TUI shows them; `gateCommands` and the MCP tools are built from
 * it. Every gate maps a failing script to GATE_FAILED (10).
 *
 * `verify` runs `verify_repo.mjs`, the whole policy and the CI entry point.
 * That script spawns `node` on the scripts in `<project>/.agents/skills/`.
 * `runVerify` passes `SPECSFY_SKILLS_DIR` (the embedded skills tree) and a
 * `node` shim on the PATH: always when the project has no `.agents/skills/`
 * (so the shim can fall back to the embedded scripts), otherwise only when
 * Node.js is missing. The MCP tool `verify` calls the same function.
 *
 * Paths given to `--attestation` are resolved against the project root,
 * which is the working directory of every script.
 */
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { getPath, readSettings } from "../../config/settings.ts";
import { resolveProject } from "../../core/project.ts";
import { runScript, skillsRuntimeDir, type ScriptRun } from "../../engine/runner.ts";
import { projectOption, toCommand, type ScriptCommandDef, type ScriptParam } from "../../engine/script-command.ts";
import type { Command } from "../registry.ts";

const bin = manifest.bin;

const specParam: ScriptParam = { name: "spec", kind: "spec", description: "Spec number, folder name, slug or path.", required: true };
const allowDraftParam: ScriptParam = { name: "allow-draft", kind: "flag", description: "Accept a spec in Draft and do not require the gate to be Passed." };
const attestationParam: ScriptParam = {
  name: "attestation",
  kind: "option",
  placeholder: "file",
  description: "Attestation JSON written by verify --attestation, relative to the project root.",
};

/** Script definitions of the gates, in display order. */
export const gateDefinitions: ScriptCommandDef[] = [
  {
    name: "spec",
    tool: "gate_spec",
    description: "Validate the structure of a spec (Specsfy/2.0 contract).",
    longDescription: "Checks the header, the mandatory sections, US/FR/NFR/AC identifiers, the minimum of three BDD scenarios per item, unresolved markers and the interface contract. Without --allow-draft the Definition Gate must be Passed.",
    script: "specsfy-04-validate/scripts/validate_spec.mjs",
    project: "cwd",
    params: [specParam, allowDraftParam],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate spec 0001`, `${bin} gate spec recover-password --allow-draft --json`],
  },
  {
    name: "tasks",
    tool: "gate_tasks",
    description: "Validate the tasks in section 14 of a spec.",
    longDescription: "Checks the task contract (Refs, Depends, tags, canonical checklist), TDD predecessors, coverage of every spec ID and migrations for schema changes. Without --allow-draft the Plan Gate must be Passed. With Evidence Contract 1 it also runs verify_evidence, adding --delivery by itself for specs in Reviewing or Complete.",
    script: "specsfy-05-tasks/scripts/validate_tasks.mjs",
    project: "cwd",
    params: [specParam, allowDraftParam],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate tasks 0001`, `${bin} gate tasks 0001 --allow-draft --json`],
  },
  {
    name: "interface",
    tool: "gate_interface",
    description: "Validate the interface phase of the tasks of a spec with a human interface.",
    longDescription: "For specs with \"Interface para pessoas: Sim\", requires the interface phase in section 14, at least one task per screen, the selected React blocks and an INTERFACE.md update. Specs without a human interface pass. The script has no JSON output: data.result is its text and data.stderr lists the problems.",
    script: "specsfy-05-tasks/scripts/validate_interface_tasks.mjs",
    project: "cwd",
    params: [specParam],
    effect: "read",
    gate: true,
    examples: [`${bin} gate interface 0001`],
  },
  {
    name: "trace",
    tool: "gate_trace",
    description: "Check traceability between the spec IDs and the test markers.",
    longDescription: "Looks for SPECSFY: or @ID markers in the test files declared by [TEST] [TDD] tasks (or in the whole project, for legacy specs) and requires the minimum number of test cases per ID. --full-chain also requires a task and an evidence record per ID.",
    script: "specsfy-06-tdd-bdd/scripts/check_traceability.mjs",
    project: "after-spec",
    params: [
      specParam,
      { name: "kinds", kind: "list", join: true, description: "ID kinds to require: US, FR, NFR, AC. Default: US,FR,NFR,AC.", placeholder: "kinds" },
      { name: "full-chain", kind: "flag", description: "Also require a task and an evidence record for each ID." },
      { name: "minimum-tests", kind: "option", placeholder: "n", description: "Minimum test cases per US, FR and NFR (AC needs 1). Default: 3." },
    ],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate trace 0001`, `${bin} gate trace 0001 --kinds US,AC --full-chain --json`],
  },
  {
    name: "acceptance",
    tool: "gate_acceptance",
    description: "Verify that every acceptance criterion (AC) of a spec has a passing result.",
    longDescription: "Reads the acceptance results recorded in the spec and, with --attestation, checks the AC coverage attested by verify.",
    script: "specsfy-06-tdd-bdd/scripts/verify_acceptance.mjs",
    project: "after-spec",
    params: [specParam, attestationParam],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate acceptance 0001`, `${bin} gate acceptance 0001 --attestation .specsfy/attestation.json --json`],
  },
  {
    name: "evidence",
    tool: "gate_evidence",
    description: "Verify the material evidence of the tasks of a spec (Evidence Contract 1).",
    longDescription: "Checks the specsfy:evidence records of each task: files, commands and migrations. Specs without Evidence Contract pass in legacy mode. --delivery also refuses planned migrations still open; --attestation binds the check to a verify attestation of the current commit.",
    script: "specsfy-07-implement/scripts/verify_evidence.mjs",
    project: "after-spec",
    params: [
      specParam,
      { name: "delivery", kind: "flag", description: "Delivery mode: open [MIGRATION] tasks fail." },
      { name: "task", kind: "option", placeholder: "id", description: "Check only this task, e.g. T003." },
      attestationParam,
    ],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate evidence 0001`, `${bin} gate evidence 0001 --delivery --json`, `${bin} gate evidence 0001 --task T003`],
  },
  {
    name: "findings",
    tool: "gate_findings",
    description: "Validate the product, architecture and security findings recorded in a spec.",
    longDescription: "Checks the format of each FIND-PROD/ARCH/SEC entry, its references and its local evidence. An open P1 finding fails the gate.",
    script: "specsfy-04-validate/scripts/review_findings.mjs",
    project: "root-flag",
    params: [specParam],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate findings 0001`, `${bin} gate findings 0001 --json`],
  },
  {
    name: "database",
    tool: "gate_database",
    description: "Check that tests use a separate database and that a command cannot wipe data.",
    longDescription: "Inspects .env and .env.testing (and migrate:status in Laravel) and, with --command, refuses commands or package scripts that drop structures or records. The script status \"ignored\" (exit 3) also fails the gate.",
    script: "specsfy-setup/scripts/check_database_safety.mjs",
    project: "project-flag",
    params: [{ name: "command", kind: "option", placeholder: "command", description: "Command line to check before running it, e.g. \"php artisan test\"." }],
    json: true,
    effect: "read",
    gate: true,
    examples: [`${bin} gate database`, `${bin} gate database --command "php artisan migrate:fresh" --json`],
  },
];

/** `gate <name>` subcommands. */
export const gateCommands: Command[] = gateDefinitions.map(toCommand);

/** Script run by `verify`. */
export const VERIFY_SCRIPT = "specsfy-04-validate/scripts/verify_repo.mjs";

/** Accepted values of `--boundary`. */
export const VERIFY_BOUNDARIES = ["local", "git", "ci"] as const;

/** Options of `runVerify`, already parsed. */
export interface VerifyOptions {
  project?: string | boolean;
  boundary?: string;
  attestation?: string;
  timeoutSeconds?: number | string;
  maxOutputBytes?: number | string;
  selfTest?: boolean;
}

/** Result of `verify`, under `data` in `--json`. */
export interface VerifyData {
  project: string;
  script: string;
  boundary: string;
  timeoutSeconds: number;
  /** `project` when `.agents/skills/` exists, otherwise `embedded` (shim fallback). */
  skillsSource: "project" | "embedded";
  exitCode: number;
  ok: boolean;
  /** Payload of verify_repo (`schema_version`, `result`, `checks`, `canaries`...). */
  result: unknown;
  stderr: string;
}

/** `gate.timeoutSeconds` from settings, falling back to 300. */
export function defaultGateTimeout(): number {
  try {
    const value = Number(getPath(readSettings(), "gate.timeoutSeconds"));
    if (Number.isFinite(value) && value > 0) return value;
  } catch { /* invalid settings fall back to the default */ }
  return 300;
}

/** Parses a numeric option, raising USAGE when it is out of range. */
function numberOption(name: string, value: number | string | undefined, minimum: number): number | undefined {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) throw error.usage(`--${name} must be an integer >= ${minimum}.`);
  return parsed;
}

/**
 * Runs `verify_repo.mjs` on the project with the embedded skills as
 * fallback and a `node` shim when needed. Shared by the CLI and MCP.
 */
export async function runVerify(options: VerifyOptions): Promise<{ data: VerifyData; run: ScriptRun; code: ExitCode }> {
  const project = resolveProject(options.project);
  const boundary = options.boundary ?? "local";
  if (!(VERIFY_BOUNDARIES as readonly string[]).includes(boundary)) throw error.usage(`--boundary must be one of: ${VERIFY_BOUNDARIES.join(", ")}.`);
  const timeoutSeconds = numberOption("timeout-seconds", options.timeoutSeconds, 1) ?? defaultGateTimeout();
  const maxOutputBytes = numberOption("max-output-bytes", options.maxOutputBytes, 0);
  const argv = [project, "--boundary", boundary, "--timeout-seconds", String(timeoutSeconds), "--json"];
  if (maxOutputBytes !== undefined) argv.push("--max-output-bytes", String(maxOutputBytes));
  if (options.attestation) argv.push("--attestation", resolve(project, options.attestation));
  if (options.selfTest) argv.push("--self-test");
  const projectSkills = existsSync(join(project, ".agents", "skills"));
  const run = await runScript(VERIFY_SCRIPT, argv, {
    cwd: project,
    env: { SPECSFY_SKILLS_DIR: skillsRuntimeDir() },
    nodeShim: projectSkills ? "auto" : "always",
  });
  const code = run.code === 0 ? ExitCode.SUCCESS : run.code === 2 ? ExitCode.USAGE : ExitCode.GATE_FAILED;
  const data: VerifyData = {
    project,
    script: VERIFY_SCRIPT,
    boundary,
    timeoutSeconds,
    skillsSource: projectSkills ? "project" : "embedded",
    exitCode: run.code,
    ok: run.code === 0,
    result: run.json ?? run.stdout.trim(),
    stderr: run.stderr.trim(),
  };
  return { data, run, code };
}

interface VerifyCheck { name: string; status: string; code: number; detail?: string }
interface VerifyPayload { result: string; boundary: string; checks?: VerifyCheck[]; canaries?: Array<{ name: string; passed: boolean }> }

/** Text rendering of a verify payload, close to the script's own text mode. */
export function renderVerify(data: VerifyData): string {
  const payload = data.result as VerifyPayload | string;
  if (typeof payload !== "object" || payload === null) return [String(payload), data.stderr].filter(Boolean).join("\n");
  const lines = [`Specsfy verify: ${String(payload.result).toUpperCase()}`, `Boundary: ${payload.boundary}`];
  if (data.skillsSource === "embedded") lines.push("Skills: .agents/skills/ not found; spec checks used the embedded scripts.");
  for (const check of payload.checks ?? []) {
    lines.push(`- ${check.status.toUpperCase()} ${check.name} (exit ${check.code})`);
    if (check.status !== "passed" && check.detail) lines.push(...check.detail.split("\n").slice(0, 20).map((line) => `    ${line}`));
  }
  for (const canary of payload.canaries ?? []) lines.push(`- ${canary.passed ? "PASS" : "FAIL"} canary:${canary.name}`);
  if (data.stderr) lines.push(data.stderr);
  return lines.join("\n");
}

const verifyCommand: Command = {
  name: "verify",
  description: "Run the whole Specsfy policy on the project: the CI entry point.",
  longDescription:
    "Runs verify_repo: validates every spec by status (spec, tasks, traceability, acceptance, evidence and research for complete specs with Evidence Contract 1) and the skills contract, and returns the attestation payload. " +
    "The checks use the scripts in .agents/skills/ of the project; when that folder is missing they fall back to the scripts embedded in the binary, and the skills check fails. Node.js is not required. " +
    "Exit code 10 means the policy failed.",
  options: [
    { name: "--boundary", argument: { name: "boundary", values: VERIFY_BOUNDARIES }, description: "Verification boundary recorded in the attestation. Default: local." },
    { name: "--attestation", argument: { name: "file" }, description: "Write the attestation JSON to this file, relative to the project root." },
    { name: "--timeout-seconds", argument: { name: "seconds" }, description: "Time limit of each check. Default: setting gate.timeoutSeconds (300)." },
    { name: "--max-output-bytes", argument: { name: "bytes" }, description: "Output kept per check. Default: 65536." },
    { name: "--self-test", description: "Exercise the policy and its canaries without checking the specs." },
    projectOption,
  ],
  exitCodes: [ExitCode.GATE_FAILED, ExitCode.NOT_FOUND],
  examples: [`${bin} verify`, `${bin} verify --boundary ci --attestation .specsfy/attestation.json --json`, `${bin} verify --self-test --json`],
  run: async (ctx) => {
    const { data, code } = await runVerify({
      project: ctx.options.project,
      boundary: ctx.options.boundary as string | undefined,
      attestation: ctx.options.attestation as string | undefined,
      timeoutSeconds: ctx.options["timeout-seconds"] as string | undefined,
      maxOutputBytes: ctx.options["max-output-bytes"] as string | undefined,
      selfTest: Boolean(ctx.options["self-test"]),
    });
    return { data, text: () => renderVerify(data), code };
  },
};

/** Top-level gate commands: `verify`. */
export const gateTopLevelCommands: Command[] = [verifyCommand];
