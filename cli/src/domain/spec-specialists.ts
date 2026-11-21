/** Reads specialist declarations, matches spec signals and checks local installs. */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Catalog } from "./catalog.ts";
import { isFile } from "./filesystem.ts";

/** Namespace of installed specialist skill names. */
export const SPECIALIST_PREFIX = "specsfy-specialist-";

function normalizeName(value: string): string | undefined {
  const name = value.trim().replace(/^[`*$]+|[`*]+$/g, "").toLowerCase();
  const slug = name.startsWith(SPECIALIST_PREFIX) ? name.slice(SPECIALIST_PREFIX.length) : name;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? SPECIALIST_PREFIX + slug : undefined;
}

function readSpec(markdown: string): { names: string[]; text: string } {
  const names = new Set<string>();
  const prose: string[] = [];
  let metadata = true;
  let section = 0;
  let specialistPlan = false;
  let specialistTable = false;
  let fence: string | undefined;

  function declare(value: string) {
    const name = normalizeName(value);
    if (name) names.add(name);
  }

  for (const line of markdown.replace(/<!--[^]*?-->/g, "").split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (marker && marker[1]!.startsWith(fence) && !marker[2]!.trim()) fence = undefined;
      continue;
    }
    if (marker) {
      fence = marker[1];
      continue;
    }
    const heading = /^ {0,3}(#{2,6})[ \t]+(.+)$/.exec(line);
    if (heading?.[1] === "##" || heading?.[1] === "###") {
      metadata = false;
      section = heading[1] === "###" ? Number(/^(\d+)\./.exec(heading[2]!)?.[1] ?? 0) : 0;
      specialistPlan = false;
    } else if (heading) {
      specialistPlan = section === 8 && heading[1] === "####" && /^Especialistas\s*#*\s*$/i.test(heading[2]!);
      specialistTable = false;
    }
    const cells = /^\s*\|(.*)\|\s*$/.exec(line)?.[1]?.split("|").map((cell) => cell.trim());
    if (metadata && cells?.[0]?.toLowerCase() === "especialistas") {
      cells[1]?.split(",").forEach(declare);
      continue;
    }
    if (specialistPlan && cells?.[0]?.toLowerCase() === "especialista" && cells[1]?.toLowerCase() === "modo") {
      specialistTable = true;
      continue;
    }
    if (specialistTable && specialistPlan && cells) {
      declare(cells[0] ?? "");
      continue;
    }
    specialistTable = false;

    const taskNote = section === 14 && /^\s*(?:[-*+]\s+)?\**Especialista\**:\**\s+([^\s(]+)/i.exec(line);
    if (taskNote) {
      declare(taskNote[1]!);
      continue;
    }
    prose.push(line);
  }
  return { names: [...names], text: prose.join("\n") };
}

/** Extracts unique, prefixed specialist names from the three declaration locations. */
export function readSpecSpecialists(markdown: string): string[] {
  return readSpec(markdown).names;
}

/** Finds prefixed specialist skills with a SKILL.md under .agents/skills. */
export async function installedSpecSpecialists(project: string): Promise<Set<string>> {
  const directory = join(project, ".agents", "skills");
  const entries = await readdir(directory).catch(() => []);
  const candidates = entries.filter((name) => name.startsWith(SPECIALIST_PREFIX));
  const installed = await Promise.all(candidates.map(async (name) => ({
    name,
    present: await isFile(join(directory, name, "SKILL.md")),
  })));
  return new Set(installed.filter(({ present }) => present).map(({ name }) => name));
}

function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function matchesKeyword(text: string, keyword: string): boolean {
  const tokens = fold(keyword).trim().split(/\s+/u).map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!tokens[0]) return false;
  const phrase = tokens.join("\\s+");
  return new RegExp(`(?<![\\p{L}\\p{N}_])${phrase}(?![\\p{L}\\p{N}_])`, "u").test(text);
}

/** A catalog trigger matched by the spec, with the two independent states. */
export interface SpecialistSuggestion {
  name: string;
  mode?: string;
  signal: string;
  declared: boolean;
  installed: boolean;
}

/**
 * Specialists the project's stack confirms: detected by the catalog markers
 * or named in .specsfy/STACK.md. Technology specialists (entries with
 * detection markers) are suggested only when the stack confirms them.
 */
export async function projectStackSpecialists(project: string, catalog: Catalog): Promise<Set<string>> {
  const confirmed = new Set((await catalog.detect(project)).map((entry) => entry.name));
  let stack = "";
  try {
    stack = fold(await readFile(join(project, ".specsfy", "STACK.md"), "utf8"));
  } catch {
    // No STACK.md yet: detection alone decides.
  }
  for (const entry of catalog.entries) {
    const short = entry.name.replace(/^specsfy-specialist-/u, "");
    if (stack && matchesKeyword(stack, short.replace(/-/gu, " "))) confirmed.add(entry.name);
  }
  return confirmed;
}

/**
 * Finds one suggestion per matched catalog trigger, in catalog order. When
 * `stack` is given, a technology specialist the stack does not confirm is
 * left out unless the spec already declares it.
 */
export function analyzeSpecSpecialists(markdown: string, catalog: Catalog, installed: ReadonlySet<string>, stack?: ReadonlySet<string>) {
  const { names, text } = readSpec(markdown);
  const declared = new Set(names);
  const prose = fold(text);
  const suggestions: SpecialistSuggestion[] = [];
  for (const entry of catalog.entries) {
    const technology = entry.files.length > 0 || entry.dependencies.length > 0;
    if (stack && technology && !stack.has(entry.name) && !declared.has(entry.name)) continue;
    for (const trigger of entry.triggers) {
      if (!trigger.keywords.some((keyword) => matchesKeyword(prose, keyword))) continue;
      suggestions.push({
        name: entry.name,
        ...(trigger.mode ? { mode: trigger.mode } : {}),
        signal: trigger.signal,
        declared: declared.has(entry.name),
        installed: installed.has(entry.name),
      });
    }
  }
  return { names, suggestions };
}
