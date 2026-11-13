/**
 * Project test commands (spec 0006): top-level `test`.
 *
 * Runs the consumer project's suite through `src/domain/project-testing.ts`:
 * detects the runner (Pest in Laravel), requires a separate test database in
 * `.env.testing` and only then spawns PHP. Without that proof the command
 * exits with GATE_FAILED (10) before PHP starts; without a known runner,
 * NOT_FOUND (6). Otherwise the runner exit code maps to SUCCESS or
 * GENERIC_ERROR and the real code stays in `data.exitCode`.
 *
 * In text mode the output streams live; with `--json` it is collected and
 * returned under `data.output`. The MCP tool `project_test` calls the same
 * `runProjectTestSuite`.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { resolveProject } from "../../core/project.ts";
import { runProjectTests } from "../../domain/project-testing.ts";
import { projectOption } from "../../engine/script-command.ts";
import type { Command } from "../registry.ts";

const bin = manifest.bin;

/** Result of `test`, under `data` in `--json`. */
export interface ProjectTestData {
  project: string;
  /** Runner label, e.g. `Laravel Pest`. */
  runner: string;
  /** Command line that ran, e.g. `php artisan test`. */
  command: string;
  /** Real exit code of the runner. */
  exitCode: number;
  durationMs: number;
  /** Summary lines (tests, assertions, duration) when the runner printed them. */
  summary: string[];
  /** Every output line of the runner. */
  output: string[];
}

/**
 * Runs the project suite with the database guard. `emit` receives each
 * output line as it arrives. Throws `AppError` NOT_FOUND or GATE_FAILED.
 */
export async function runProjectTestSuite(projectOptionValue: string | boolean | undefined, emit: (line: string) => void = () => {}): Promise<{ data: ProjectTestData; code: ExitCode }> {
  const project = resolveProject(projectOptionValue);
  const run = await runProjectTests(project, emit);
  const data: ProjectTestData = {
    project,
    runner: run.command.label,
    command: run.command.display,
    exitCode: run.exit_code,
    durationMs: Math.round(run.duration_seconds * 1000),
    summary: run.summary_lines,
    output: run.output,
  };
  return { data, code: run.exit_code === 0 ? ExitCode.SUCCESS : ExitCode.GENERIC_ERROR };
}

const testCommand: Command = {
  name: "test",
  description: "Run the project test suite.",
  longDescription:
    "Detects the runner (Pest in Laravel), requires .env.testing with APP_ENV=testing and a database separate from .env, and streams the output. " +
    "Without that proof it exits with 10 before PHP starts; without a known runner it exits with 6. A failing suite exits with 1 and keeps the runner code in data.exitCode.",
  options: [projectOption],
  exitCodes: [ExitCode.GATE_FAILED, ExitCode.NOT_FOUND],
  examples: [`${bin} test`, `${bin} test --json`, `${bin} test --project ../app`],
  run: async (ctx) => {
    const emit = ctx.json ? () => {} : (line: string) => ctx.stdout(line || " ");
    const { data, code } = await runProjectTestSuite(ctx.options.project, emit);
    const seconds = (data.durationMs / 1000).toFixed(2);
    return { data, text: `${data.runner}: exit ${data.exitCode} in ${seconds}s`, code };
  },
};

/** Top-level testing commands: `test`. */
export const testingTopLevelCommands: Command[] = [testCommand];
