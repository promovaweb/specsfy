/**
 * Declarative bridge between the framework scripts and the three modes.
 *
 * A `ScriptCommandDef` says which embedded script runs, which parameters it
 * takes and how the project root reaches it. From one definition the module
 * builds the CLI `Command` (`toCommand`) and the MCP tool
 * (`registerScriptTools`), so commands and tools never drift apart.
 *
 * Parameters of kind `spec` accept the identifiers of `resolveSpecPath`
 * (number, folder name, slug or path) and reach the script as the absolute
 * path of `spec.md`. Every command takes `--project <dir>`; the script runs
 * with that directory as its working directory.
 *
 * Exit mapping: 0 is SUCCESS; for a gate, any other code is GATE_FAILED;
 * code 2 from a script is USAGE; anything else is GENERIC_ERROR. The JSON
 * printed by the script, when present, is returned under `data.result`.
 */
import { z } from "zod";
import { ExitCode } from "../app/exit-codes.ts";
import type { Command, Context, OptionDefinition, ArgumentDefinition, Result } from "../cli/registry.ts";
import type { Registrar } from "../mcp/server.ts";
import { resolveProject, resolveSpecPath } from "../core/project.ts";
import { runScript, type ScriptRun } from "./runner.ts";

/** How a parameter is passed to the script. */
export type ScriptParamKind = "spec" | "positional" | "flag" | "option" | "list";

/** One parameter of a script-backed command. */
export interface ScriptParam {
  /** CLI name: positional name, or long option without hyphens. */
  name: string;
  kind: ScriptParamKind;
  description: string;
  required?: boolean;
  /** Closed list of accepted values. */
  values?: readonly string[];
  /** Name of the flag the script reads, when different from `--<name>`. */
  scriptFlag?: string;
  /** For `list`: values are joined with commas; otherwise repeated after the flag. */
  join?: boolean;
  /** Placeholder shown in help for options. */
  placeholder?: string;
}

/** How the project root is handed to the script. */
export type ProjectMode =
  /** First positional argument. */
  | "positional"
  /** Positional argument right after the spec path. */
  | "after-spec"
  /** `--project <dir>`. */
  | "project-flag"
  /** `--root <dir>`. */
  | "root-flag"
  /** Only as the working directory. */
  | "cwd";

/** Definition of a command backed by an embedded script. */
export interface ScriptCommandDef {
  /** Subcommand name, e.g. `spec` in `gate spec`. */
  name: string;
  /** MCP tool name, in snake_case. */
  tool: string;
  description: string;
  longDescription?: string;
  /** Path inside the skills tree. */
  script: string;
  project: ProjectMode;
  params: readonly ScriptParam[];
  /** The script accepts `--json`; the binary passes it to get structured data. */
  json?: boolean;
  /** `read` never changes files; `write` changes files in the project. */
  effect: "read" | "write";
  /** A gate maps any failure to GATE_FAILED. */
  gate?: boolean;
  examples?: readonly string[];
}

const PROJECT_OPTION: OptionDefinition = {
  name: "--project",
  argument: { name: "dir" },
  description: "Project root. Defaults to the nearest directory above the current one with specs/, .specsfy/ or skills-lock.json.",
};

/** Shared `--project` option for project commands. */
export const projectOption = PROJECT_OPTION;

/** Builds the argument vector of the script from resolved values. */
async function buildArgv(def: ScriptCommandDef, project: string, values: Record<string, unknown>): Promise<string[]> {
  const positional: string[] = [];
  const flags: string[] = [];
  let specPath: string | undefined;
  for (const param of def.params) {
    const value = values[param.name];
    if (value === undefined || value === false || value === "") continue;
    const flag = param.scriptFlag ?? `--${param.name}`;
    switch (param.kind) {
      case "spec":
        specPath = await resolveSpecPath(project, String(value));
        positional.push(specPath);
        break;
      case "positional":
        if (Array.isArray(value)) positional.push(...value.map(String));
        else positional.push(String(value));
        break;
      case "flag":
        if (value === true || value === "true") flags.push(flag);
        break;
      case "option":
        flags.push(flag, String(value));
        break;
      case "list": {
        const items = Array.isArray(value) ? value.map(String) : String(value).split(",").map((x) => x.trim()).filter(Boolean);
        if (!items.length) break;
        if (param.join) flags.push(flag, items.join(","));
        else flags.push(flag, ...items);
        break;
      }
    }
  }
  if (def.project === "positional") positional.unshift(project);
  if (def.project === "after-spec") {
    const index = specPath ? positional.indexOf(specPath) + 1 : 0;
    positional.splice(index, 0, project);
  }
  if (def.project === "project-flag") flags.push("--project", project);
  if (def.project === "root-flag") flags.push("--root", project);
  if (def.json) flags.push("--json");
  return [...positional, ...flags];
}

/** Maps the script exit code to the binary's exit code. */
function mapCode(def: ScriptCommandDef, run: ScriptRun): ExitCode {
  if (run.code === 0) return ExitCode.SUCCESS;
  if (def.gate) return ExitCode.GATE_FAILED;
  if (run.code === 2) return ExitCode.USAGE;
  return ExitCode.GENERIC_ERROR;
}

/** Public result shape of a script-backed command. */
export interface ScriptCommandData {
  project: string;
  script: string;
  exitCode: number;
  ok: boolean;
  result: unknown;
  stderr: string;
}

/** Runs a definition with already collected values. Shared by CLI and MCP. */
export async function executeScriptCommand(def: ScriptCommandDef, values: Record<string, unknown>, projectOptionValue?: string | boolean): Promise<{ data: ScriptCommandData; run: ScriptRun; code: ExitCode }> {
  const project = resolveProject(projectOptionValue);
  const argv = await buildArgv(def, project, values);
  const run = await runScript(def.script, argv, { cwd: project });
  const code = mapCode(def, run);
  const data: ScriptCommandData = {
    project,
    script: def.script,
    exitCode: run.code,
    ok: run.code === 0,
    result: run.json ?? run.stdout.trim(),
    stderr: run.stderr.trim(),
  };
  return { data, run, code };
}

/** CLI `Command` for a definition. */
export function toCommand(def: ScriptCommandDef): Command {
  const args: ArgumentDefinition[] = [];
  const options: OptionDefinition[] = [];
  for (const param of def.params) {
    if (param.kind === "spec" || param.kind === "positional") {
      args.push({ name: param.name, description: param.description, required: param.required, values: param.values });
    } else if (param.kind === "flag") {
      options.push({ name: `--${param.name}`, description: param.description });
    } else {
      options.push({
        name: `--${param.name}`,
        description: param.description + (param.kind === "list" ? " Comma-separated list." : ""),
        argument: { name: param.placeholder ?? (param.kind === "list" ? "items" : "value"), values: param.values },
      });
    }
  }
  options.push(PROJECT_OPTION);
  return {
    name: def.name,
    description: def.description,
    longDescription: def.longDescription,
    arguments: args,
    options,
    examples: def.examples,
    exitCodes: def.gate ? [ExitCode.GATE_FAILED, ExitCode.NOT_FOUND] : [ExitCode.NOT_FOUND],
    run: async (ctx: Context): Promise<Result> => {
      const values: Record<string, unknown> = {};
      let index = 0;
      for (const param of def.params) {
        if (param.kind === "spec" || param.kind === "positional") values[param.name] = ctx.args[index++];
        else values[param.name] = ctx.options[param.name];
      }
      const missing = def.params.find((param) => param.required && (values[param.name] === undefined || values[param.name] === ""));
      if (missing) {
        const { error } = await import("../app/errors.ts");
        throw error.usage(`Missing required ${missing.kind === "spec" || missing.kind === "positional" ? "argument" : "option"}: ${missing.name}`);
      }
      const { data, run, code } = await executeScriptCommand(def, values, ctx.options.project);
      const text = () => [run.stdout.trimEnd(), run.stderr.trimEnd()].filter(Boolean).join("\n");
      return { data, text, code };
    },
  };
}

/** Zod schema of the MCP input for a definition. */
function inputSchema(def: ScriptCommandDef): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const param of def.params) {
    let schema: z.ZodTypeAny;
    if (param.kind === "flag") schema = z.boolean();
    else if (param.kind === "list") schema = z.array(z.string());
    else if (param.values?.length) schema = z.enum(param.values as [string, ...string[]]);
    else schema = z.string().min(1);
    schema = schema.describe(param.description);
    shape[param.name] = param.required ? schema : schema.optional();
  }
  shape.project = z.string().optional().describe(PROJECT_OPTION.description);
  return shape;
}

/** Registers one MCP tool per definition. */
export function registerScriptTools({ server, catalog }: Registrar, defs: readonly ScriptCommandDef[]): void {
  for (const def of defs) {
    catalog.tools.push({ name: def.tool, description: def.description });
    server.registerTool(
      def.tool,
      {
        title: def.description,
        description: `${def.description} Runs ${def.script} from the embedded framework.${def.gate ? " A failed gate returns isError with the findings." : ""}`,
        inputSchema: inputSchema(def),
        annotations: { readOnlyHint: def.effect === "read", destructiveHint: false, idempotentHint: def.effect === "read" },
      },
      async (input: Record<string, unknown>) => {
        const { data } = await executeScriptCommand(def, input, input.project as string | undefined);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
          structuredContent: data as unknown as Record<string, unknown>,
          isError: !data.ok,
        };
      },
    );
  }
}
