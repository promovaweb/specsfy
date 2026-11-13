/**
 * Project context commands (spec 0005).
 *
 * `context setup|inspect|interface|monitor|stack|rule|database|data|usage`
 * pass their parameters to the scripts of `specsfy-setup`,
 * `specsfy-aux-stack`, `specsfy-aux-rules`, `specsfy-aux-database`,
 * `specsfy-data-discovery` and `specsfy-progress/analyze_context`. The
 * definitions are shared with the MCP tools in `src/mcp/tools/context.ts`.
 *
 * `context monitor --check` exits with GATE_FAILED (10) when context
 * documents are pending for the changed paths.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { toCommand, type ScriptCommandDef } from "../../engine/script-command.ts";
import type { Command } from "../registry.ts";

const bin = manifest.bin;

export const contextSetupDef: ScriptCommandDef = {
  name: "setup",
  tool: "context_setup",
  description: "Create the minimum project context (PROJECT.md, .specsfy/STACK.md, RULES.md, DATABASE.md...) without overwriting existing files.",
  longDescription: "Also writes the Specsfy block in AGENTS.md and CLAUDE.md. Prints the paths it created or changed.",
  script: "specsfy-setup/scripts/setup_context.mjs",
  project: "project-flag",
  effect: "write",
  params: [],
  examples: [`${bin} context setup`, `${bin} context setup --project ../app --json`],
};

export const contextInspectDef: ScriptCommandDef = {
  name: "inspect",
  tool: "context_inspect",
  description: "Summarize the relevant sources of the project by group (instructions, manifests, routes, persistence, tests...) without changing files.",
  script: "specsfy-setup/scripts/inspect_project.mjs",
  project: "project-flag",
  effect: "read",
  params: [],
  examples: [`${bin} context inspect --json`],
};

export const contextInterfaceDef: ScriptCommandDef = {
  name: "interface",
  tool: "context_interface",
  description: "Summarize the interface stack (frameworks, routing, styling, components, forms, tests) and the current routes and components.",
  script: "specsfy-setup/scripts/inspect_interface.mjs",
  project: "project-flag",
  effect: "read",
  params: [],
  examples: [`${bin} context interface --json`],
};

export const contextMonitorDef: ScriptCommandDef = {
  name: "monitor",
  tool: "context_monitor",
  description: "Point out the context documents that need review for the changed files (Git diff or --paths).",
  longDescription:
    "Without --paths the changed paths come from Git (diff, staged and untracked) in the project or its direct child repositories. " +
    "With --check, pending documents exit with code 10.",
  script: "specsfy-setup/scripts/monitor_context.mjs",
  // The script reads every argument after --paths as a path, so the root goes as the working directory.
  project: "cwd",
  json: true,
  effect: "read",
  params: [
    { name: "check", kind: "flag", description: "Fail (exit code 10) when a context document is pending." },
    { name: "acknowledge-project-no-change", kind: "flag", description: "Record that the application change needs no PROJECT.md update." },
    { name: "acknowledge-rules-no-change", kind: "flag", description: "Record that the convention change needs no RULES.md update." },
    { name: "paths", kind: "list", description: "Changed paths to inspect instead of the Git diff.", placeholder: "paths" },
  ],
  examples: [`${bin} context monitor`, `${bin} context monitor --check --json`, `${bin} context monitor --paths composer.json,database/migrations/x.php`],
};

export const contextStackDef: ScriptCommandDef = {
  name: "stack",
  tool: "context_stack",
  description: "Update the detected stack block in .specsfy/STACK.md, keeping human rows and notes.",
  script: "specsfy-aux-stack/scripts/update_stack.mjs",
  project: "project-flag",
  effect: "write",
  params: [],
  examples: [`${bin} context stack`],
};

export const contextRuleDef: ScriptCommandDef = {
  name: "rule",
  tool: "context_rule",
  description: "Append a confirmed rule to a section of .specsfy/RULES.md without changing the rest of the document.",
  script: "specsfy-aux-rules/scripts/add_rule.mjs",
  project: "project-flag",
  effect: "write",
  params: [
    { name: "section", kind: "option", required: true, description: "Section heading (without ##); created when missing.", placeholder: "title" },
    { name: "rule", kind: "option", required: true, description: "Rule text, one line.", placeholder: "text" },
  ],
  examples: [`${bin} context rule --section "Testes" --rule "Every endpoint has a feature test."`],
};

export const contextDatabaseDef: ScriptCommandDef = {
  name: "database",
  tool: "context_database",
  description: "Update the detected structures block in .specsfy/DATABASE.md from migrations, SQL and Prisma schemas.",
  script: "specsfy-aux-database/scripts/update_database.mjs",
  project: "project-flag",
  effect: "write",
  params: [],
  examples: [`${bin} context database`],
};

export const contextDataDef: ScriptCommandDef = {
  name: "data",
  tool: "context_data",
  description: "Record information confirmed in conversation in the data map of .specsfy/DATABASE.md, one row per information name.",
  longDescription: "A row with the same --name is replaced. The detected part of the data map is left untouched.",
  script: "specsfy-data-discovery/scripts/registrar_dados_conversados.mjs",
  project: "project-flag",
  effect: "write",
  params: [
    { name: "name", kind: "option", required: true, scriptFlag: "--nome", description: "Information name.", placeholder: "text" },
    { name: "purpose", kind: "option", required: true, scriptFlag: "--para-que-serve", description: "What it is for.", placeholder: "text" },
    { name: "store", kind: "option", required: true, scriptFlag: "--o-que-guardar", description: "What to keep.", placeholder: "text" },
    { name: "format", kind: "option", required: true, scriptFlag: "--formato-sugerido", description: "Suggested format.", placeholder: "text" },
    { name: "links", kind: "option", required: true, scriptFlag: "--ligacoes", description: "Links to other information.", placeholder: "text" },
    { name: "access", kind: "option", required: true, scriptFlag: "--acesso", description: "Who uses it.", placeholder: "text" },
    { name: "lifecycle", kind: "option", required: true, scriptFlag: "--ciclo-de-vida", description: "When it changes or is removed.", placeholder: "text" },
    { name: "sources", kind: "option", required: true, scriptFlag: "--fontes", description: "Sources of the confirmation.", placeholder: "text" },
  ],
  examples: [`${bin} context data --name Pedido --purpose "..." --store "..." --format "..." --links "..." --access "..." --lifecycle "..." --sources "..."`],
};

export const contextUsageDef: ScriptCommandDef = {
  name: "usage",
  tool: "context_usage",
  description: "Estimate the context size of a spec by section, or ingest measured token usage from a JSON file.",
  script: "specsfy-progress/scripts/analyze_context.mjs",
  project: "cwd",
  json: true,
  effect: "read",
  params: [
    { name: "spec", kind: "spec", required: true, description: "Spec number, folder name, slug or path." },
    { name: "usage-json", kind: "option", description: "JSON file with input_tokens and output_tokens measured by the agent.", placeholder: "file" },
    { name: "compare", kind: "option", description: "Baseline to compare with: another spec file, or another usage JSON with --usage-json.", placeholder: "file" },
  ],
  examples: [`${bin} context usage 0001 --json`],
};

/** Script definitions of this spec, in tool registration order. */
export const contextScriptDefs: readonly ScriptCommandDef[] = [
  contextSetupDef,
  contextInspectDef,
  contextInterfaceDef,
  contextMonitorDef,
  contextStackDef,
  contextRuleDef,
  contextDatabaseDef,
  contextDataDef,
  contextUsageDef,
];

/**
 * Command whose failure becomes GATE_FAILED when `--<option>` is given.
 * Used by `context monitor --check` and `docs build --check`.
 */
export function gateWhenOption(def: ScriptCommandDef, option: string): Command {
  const base = toCommand(def);
  return {
    ...base,
    exitCodes: [ExitCode.GATE_FAILED, ...(base.exitCodes ?? [])],
    run: async (ctx) => {
      const result = await base.run!(ctx);
      if (ctx.options[option] && result.code !== undefined && result.code !== ExitCode.SUCCESS && result.code !== ExitCode.USAGE) {
        return { ...result, code: ExitCode.GATE_FAILED };
      }
      return result;
    },
  };
}

export const contextCommands: Command[] = contextScriptDefs.map((def) => (def === contextMonitorDef ? gateWhenOption(def, "check") : toCommand(def)));
