/**
 * MCP tool of the project documentation (spec 0008): `docs_build`, from the
 * same script definition as `docs build`. With check=true a failure means
 * the documentation is outdated.
 */
import { registerScriptTools } from "../../engine/script-command.ts";
import { docsBuildDef } from "../../cli/commands/project-docs.ts";
import type { Registrar } from "../server.ts";

/** Registers the project-docs tool. */
export function registerProjectDocsTools(registrar: Registrar): void {
  registerScriptTools(registrar, [docsBuildDef]);
}
