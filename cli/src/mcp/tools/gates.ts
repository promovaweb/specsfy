/**
 * MCP tools of the gates (spec 0004): one tool per gate definition
 * (`gate_spec`, `gate_tasks`, `gate_interface`, `gate_trace`,
 * `gate_acceptance`, `gate_evidence`, `gate_findings`, `gate_database`) and
 * `verify`, which calls the same `runVerify` as the CLI command. A failed
 * gate or policy returns `isError` with the findings in the payload.
 */
import { z } from "zod";
import { AppError } from "../../app/errors.ts";
import { gateDefinitions, runVerify, VERIFY_BOUNDARIES } from "../../cli/commands/gates.ts";
import { registerScriptTools } from "../../engine/script-command.ts";
import type { Registrar } from "../server.ts";

/** Registers the gate tools and `verify`. */
export function registerGatesTools(registrar: Registrar): void {
  registerScriptTools(registrar, gateDefinitions);
  const { server, catalog } = registrar;
  catalog.tools.push({ name: "verify", description: "Run the whole Specsfy policy on the project (CI entry point)." });
  server.registerTool(
    "verify",
    {
      title: "Run the whole Specsfy policy on the project (CI entry point).",
      description:
        "Runs verify_repo: validates every spec by status and the skills contract, and returns the attestation payload under result " +
        "(result.result is passed or failed, result.checks lists each check). Uses .agents/skills/ of the project or, when missing, the embedded scripts. A failed policy returns isError.",
      inputSchema: {
        boundary: z.enum(VERIFY_BOUNDARIES).optional().describe("Verification boundary. Default: local."),
        attestation: z.string().min(1).optional().describe("Write the attestation JSON to this file, relative to the project root."),
        "timeout-seconds": z.number().int().positive().optional().describe("Time limit of each check. Default: setting gate.timeoutSeconds."),
        "max-output-bytes": z.number().int().nonnegative().optional().describe("Output kept per check. Default: 65536."),
        "self-test": z.boolean().optional().describe("Exercise the policy and its canaries without checking the specs."),
        project: z.string().optional().describe("Project root. Defaults to the nearest directory with specs/, .specsfy/ or skills-lock.json."),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    async (input) => {
      try {
        const { data } = await runVerify({
          project: input.project,
          boundary: input.boundary,
          attestation: input.attestation,
          timeoutSeconds: input["timeout-seconds"],
          maxOutputBytes: input["max-output-bytes"],
          selfTest: input["self-test"],
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
          structuredContent: data as unknown as Record<string, unknown>,
          isError: !data.ok,
        };
      } catch (e) {
        return {
          content: [{ type: "text" as const, text: JSON.stringify(e instanceof AppError ? e.toJSON() : { message: String(e) }) }],
          isError: true,
        };
      }
    },
  );
}
