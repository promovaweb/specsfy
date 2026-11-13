/**
 * MCP tools of the project context (spec 0005): `context_setup`,
 * `context_inspect`, `context_interface`, `context_monitor`,
 * `context_stack`, `context_rule`, `context_database`, `context_data` and
 * `context_usage`. They come from the same script definitions as the
 * `context` commands.
 */
import { registerScriptTools } from "../../engine/script-command.ts";
import { contextScriptDefs } from "../../cli/commands/context.ts";
import type { Registrar } from "../server.ts";

/** Registers the context tools. */
export function registerContextTools(registrar: Registrar): void {
  registerScriptTools(registrar, contextScriptDefs);
}
