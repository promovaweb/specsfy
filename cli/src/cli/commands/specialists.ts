/** Specialist suggestions from one registered CLI and MCP definition. */
import { readFile } from "node:fs/promises";
import { relative, sep } from "node:path";
import { error } from "../../app/errors.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { manifest } from "../../app/manifest.ts";
import { resolveSpecPath } from "../../core/project.ts";
import { Catalog } from "../../domain/catalog.ts";
import { analyzeSpecSpecialists, projectStackSpecialists, installedSpecSpecialists } from "../../domain/spec-specialists.ts";
import { toCommand, type NativeProjectCommandDef } from "../../engine/script-command.ts";
import { frameworkSettings } from "./framework.ts";

/** Loads the configured analysis catalog, falling back without blocking a spec read. */
export async function loadSpecCatalog(): Promise<{ catalog: Catalog; catalogWarning?: string }> {
  try {
    return { catalog: await Catalog.forSpecAnalysis(frameworkSettings().repository) };
  } catch {
    return {
      catalog: Catalog.embedded(),
      catalogWarning: "Could not load the configured specialist catalog. Using the embedded catalog.",
    };
  }
}

/** One definition provides both CLI spellings and the MCP tool. */
export const specialistSuggestDef: NativeProjectCommandDef = {
  name: "suggest",
  tool: "specialists_suggest",
  description: "Suggest specialists based on signals in a spec.",
  longDescription: "Matches catalog keywords and reports the mode, signal, declaration and installation for each suggestion.",
  params: [{ name: "spec", kind: "spec", description: "Spec ID, slug, folder name or path.", required: true }],
  effect: "read",
  exitCodes: [ExitCode.NOT_FOUND],
  examples: [`${manifest.bin} specialists suggest 0001`, `${manifest.bin} specialists suggest recover-password --json`],
  async execute(project, values) {
    const path = await resolveSpecPath(project, String(values.spec));
    const markdown = await readFile(path, "utf8").catch(() => {
      throw error.notFound(`Could not read spec: ${path}`);
    });
    const [{ catalog, catalogWarning }, installed] = await Promise.all([
      loadSpecCatalog(),
      installedSpecSpecialists(project),
    ]);
    const { suggestions } = analyzeSpecSpecialists(markdown, catalog, installed, await projectStackSpecialists(project, catalog));
    return {
      data: { project, spec: relative(project, path).split(sep).join("/"), suggestions, ...(catalogWarning ? { catalogWarning } : {}) },
      text: () => suggestions.map(({ name, mode, signal, declared, installed }) =>
        `${name}${mode ? ` (${mode})` : ""} <- ${signal} [${declared ? "declared" : "not declared"}, ${installed ? "installed" : "not installed"}]`
      ).join("\n") || "No specialist suggestions.",
      warning: catalogWarning ? `WARNING: ${catalogWarning}` : undefined,
    };
  },
};

/** Shared command for the specialists and skills groups. */
export const specialistSuggestCommand = toCommand(specialistSuggestDef);
