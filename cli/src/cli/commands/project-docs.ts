/**
 * Project documentation commands (spec 0008).
 *
 * `docs build` passes the project root to `build_documentation.mjs`
 * (skill `specsfy-documentator`), which rebuilds `docs/*.md` and
 * `.specsfy/PACKAGES.md` keeping human content. With `--check` nothing is
 * written and outdated documentation exits with GATE_FAILED (10).
 */
import { manifest } from "../../app/manifest.ts";
import type { ScriptCommandDef } from "../../engine/script-command.ts";
import { gateWhenOption } from "./context.ts";
import type { Command } from "../registry.ts";

const bin = manifest.bin;

export const docsBuildDef: ScriptCommandDef = {
  name: "build",
  tool: "docs_build",
  description: "Rebuild the project documentation in docs/ and .specsfy/PACKAGES.md; --check only verifies it is up to date.",
  longDescription: "Generated sections are merged with the human text of each file. With --check, outdated files are listed on stderr and the exit code is 10.",
  script: "specsfy-documentator/scripts/build_documentation.mjs",
  project: "project-flag",
  effect: "write",
  params: [{ name: "check", kind: "flag", description: "Write nothing; exit with code 10 when the documentation is outdated." }],
  examples: [`${bin} docs build`, `${bin} docs build --check`],
};

export const projectDocsCommands: Command[] = [gateWhenOption(docsBuildDef, "check")];
