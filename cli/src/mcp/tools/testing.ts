/**
 * MCP tools of the testing commands (spec 0006): `project_test`, which runs
 * the project suite through the same `runProjectTestSuite` as `test`. A
 * failing suite returns isError with the output; a missing database proof
 * or runner returns the `AppError` (GATE_FAILED or NOT_FOUND).
 */
import { z } from "zod";
import { AppError } from "../../app/errors.ts";
import { runProjectTestSuite } from "../../cli/commands/testing.ts";
import type { Registrar } from "../server.ts";

/** Registers `project_test`. */
export function registerTestingTools({ server, catalog }: Registrar): void {
  catalog.tools.push({ name: "project_test", description: "Run the project test suite with the separate test database guard." });
  server.registerTool(
    "project_test",
    {
      title: "Run the project test suite",
      description:
        "Runs the project test suite (Pest in Laravel) after checking that .env.testing points to a separate database. " +
        "Returns { runner, command, exitCode, durationMs, summary, output }. Without the database proof it returns error code 10 before PHP starts; without a known runner, code 6.",
      inputSchema: {
        project: z.string().optional().describe("Project root. Defaults to the nearest directory with specs/, .specsfy/ or skills-lock.json."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (input) => {
      try {
        const { data } = await runProjectTestSuite(input.project);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
          structuredContent: data as unknown as Record<string, unknown>,
          isError: data.exitCode !== 0,
        };
      } catch (e) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify(e instanceof AppError ? e.toJSON() : { message: e instanceof Error ? e.message : String(e) }) }],
          isError: true,
        };
      }
    },
  );
}
