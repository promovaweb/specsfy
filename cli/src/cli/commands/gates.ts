/**
 * Gate commands (spec 0004): gate subcommands and top-level verify.
 *
 * `gateDefinitions` lists the script definitions of every gate, in the
 * order the TUI shows them; `gateCommands` and the MCP tools are built from
 * it.
 */
import type { Command } from "../registry.ts";
import type { ScriptCommandDef } from "../../engine/script-command.ts";

export const gateDefinitions: ScriptCommandDef[] = [];
export const gateCommands: Command[] = [];
export const gateTopLevelCommands: Command[] = [];
