/**
 * Inventory of the framework skills.
 *
 * `skills/inventory.json` in the framework repository is the single list of
 * what a project with Specsfy must have: the framework skills with their
 * category, the names that were renamed (old name to the skill that replaced
 * it) and the names that were retired without a replacement. The binary
 * embeds the inventory of its own version; `update` reads the one in the
 * checkout it installs from, so skills and inventory always come from the
 * same revision.
 *
 * Nothing here touches the network or writes files.
 */
import { join } from "node:path";
import { SKILL_FILES } from "../engine/skills.gen.ts";
import { isFile, readJson } from "./filesystem.ts";
import { AppError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";

export const INVENTORY_FILENAME = "inventory.json";

/** Group of a framework skill in the TUI and in the docs. */
export type SkillCategory = "base" | "auxiliary" | "documentation";

/** Validated inventory. */
export interface Inventory {
  /** Framework skills in install order, mapped to their category. */
  skills: Readonly<Record<string, SkillCategory>>;
  /** Old skill name mapped to the skill that replaced it. */
  renamed: Readonly<Record<string, string>>;
  /** Skills removed from the framework without a replacement. */
  retired: readonly string[];
}

const NAME = /^specsfy-[a-z0-9][a-z0-9-]*$/;
const CATEGORIES: ReadonlySet<string> = new Set(["base", "auxiliary", "documentation"]);

function invalid(message: string): AppError {
  return new AppError(ExitCode.GENERIC_ERROR, `invalid skills inventory: ${message}`);
}

/** Validates a parsed `inventory.json`. */
export function parseInventory(payload: unknown): Inventory {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw invalid("not an object");
  const raw = payload as Record<string, unknown>;
  if (raw.schema_version !== 1) throw invalid(`unsupported schema_version ${String(raw.schema_version)}`);
  const skills: Record<string, SkillCategory> = {};
  if (!raw.skills || typeof raw.skills !== "object" || Array.isArray(raw.skills)) throw invalid("skills must be an object");
  for (const [name, category] of Object.entries(raw.skills)) {
    if (!NAME.test(name)) throw invalid(`bad skill name ${name}`);
    if (typeof category !== "string" || !CATEGORIES.has(category)) throw invalid(`bad category for ${name}`);
    skills[name] = category as SkillCategory;
  }
  if (!Object.keys(skills).length) throw invalid("skills is empty");
  const renamed: Record<string, string> = {};
  const rawRenamed = raw.renamed ?? {};
  if (typeof rawRenamed !== "object" || Array.isArray(rawRenamed)) throw invalid("renamed must be an object");
  for (const [from, to] of Object.entries(rawRenamed as Record<string, unknown>)) {
    if (!NAME.test(from) || typeof to !== "string" || !NAME.test(to)) throw invalid(`bad rename ${from}`);
    if (from in skills) throw invalid(`${from} is both a current and a renamed skill`);
    if (!(to in skills) && !to.startsWith("specsfy-specialist-")) throw invalid(`${from} is renamed to the unknown skill ${to}`);
    renamed[from] = to;
  }
  const rawRetired = raw.retired ?? [];
  if (!Array.isArray(rawRetired)) throw invalid("retired must be an array");
  const retired: string[] = [];
  for (const name of rawRetired) {
    if (typeof name !== "string" || !NAME.test(name)) throw invalid(`bad retired name ${String(name)}`);
    if (name in skills || name in renamed) throw invalid(`${name} is retired and also current or renamed`);
    retired.push(name);
  }
  return { skills, renamed, retired };
}

/**
 * Inventory of the framework version this binary was built from. It is read
 * from the embedded skills tree, the only import of the file: importing the
 * same path again as JSON lets the bundler pick either loader, and a
 * compiled binary can then receive text where an object is expected.
 */
function embeddedInventory(): Inventory {
  const text: unknown = SKILL_FILES[INVENTORY_FILENAME];
  if (text === undefined) throw invalid("not embedded in the binary; run: bun run embed");
  return parseInventory(typeof text === "string" ? JSON.parse(text) : text);
}

export const EMBEDDED_INVENTORY: Inventory = embeddedInventory();

/**
 * Reads the inventory of a `skills/` checkout. A source without the file
 * (a release older than the inventory, or a custom repository) falls back
 * to the inventory embedded in the binary.
 */
export async function readInventory(skillsDirectory: string): Promise<Inventory> {
  const path = join(skillsDirectory, INVENTORY_FILENAME);
  if (!(await isFile(path))) return EMBEDDED_INVENTORY;
  return parseInventory(await readJson(path));
}

/** Names of the framework skills, in install order. */
export function frameworkSkillNames(inventory: Inventory = EMBEDDED_INVENTORY): string[] {
  return Object.keys(inventory.skills);
}

/** What separates the skills of a project from the inventory, by name only. */
export interface InventoryDrift {
  /** True when the project has at least one framework skill, current or old. */
  framework: boolean;
  /** Framework skills that are not installed. */
  missing: string[];
  /** Installed skills that were renamed, with their replacement. */
  renamed: Array<{ from: string; to: string }>;
  /** Installed skills that were retired. */
  retired: string[];
}

/**
 * Compares installed skill names with the inventory without reading any
 * skill content. A project without the framework has no drift: `install`
 * is the command for it, not `update`.
 */
export function inventoryDrift(installed: Iterable<string>, inventory: Inventory = EMBEDDED_INVENTORY): InventoryDrift {
  const names = new Set(installed);
  const current = frameworkSkillNames(inventory);
  const renamed = Object.entries(inventory.renamed)
    .filter(([from]) => names.has(from))
    .map(([from, to]) => ({ from, to }));
  const retired = inventory.retired.filter((name) => names.has(name));
  const framework = current.some((name) => names.has(name)) || renamed.length > 0 || retired.length > 0;
  return {
    framework,
    missing: framework ? current.filter((name) => !names.has(name)) : [],
    renamed,
    retired: [...retired],
  };
}

/** True when the names match the inventory. */
export function inSync(drift: InventoryDrift): boolean {
  return !drift.missing.length && !drift.renamed.length && !drift.retired.length;
}
