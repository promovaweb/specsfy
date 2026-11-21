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
  let section = "";
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
      section = heading[1] === "###" ? fold(heading[2]!.replace(/^\d+\.[ \t]+/u, "").trim()) : "";
      specialistPlan = false;
    } else if (heading) {
      specialistPlan = section === "plano tecnico" && heading[1] === "####" && /^Especialistas\s*#*\s*$/i.test(heading[2]!);
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

    const taskNote = section === "tarefas" && /^\s*(?:[-*+]\s+)?\**Especialista\**:\**\s+([^\s(]+)/i.exec(line);
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

function keywordPattern(keyword: string): string | undefined {
  const tokens = fold(keyword).trim().split(/\s+/u).map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!tokens[0]) return undefined;
  return `(?<![\\p{L}\\p{N}_])${tokens.join("\\s+")}(?![\\p{L}\\p{N}_])`;
}

function matchesKeyword(text: string, keyword: string): boolean {
  const pattern = keywordPattern(keyword);
  return pattern !== undefined && new RegExp(pattern, "u").test(text);
}

function stackDeclarations(markdown: string): Array<{ technology: string; line: string }> {
  const declarations: Array<{ technology: string; line: string }> = [];
  let excludedLevel = 0;
  let technologyColumn = -1;
  let fence: string | undefined;
  for (const raw of markdown.replace(/<!--[^]*?-->/gu, "").split(/\r?\n/u)) {
    const line = fold(raw.trim());
    const marker = /^(`{3,}|~{3,})(.*)$/u.exec(line);
    if (fence) {
      if (marker && marker[1]!.startsWith(fence) && !marker[2]!.trim()) fence = undefined;
      continue;
    }
    if (marker) {
      fence = marker[1];
      continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/u.exec(line);
    if (heading) {
      const level = heading[1]!.length;
      if (excludedLevel && level <= excludedLevel) excludedLevel = 0;
      if (!excludedLevel && /\b(?:pendencias?|ausencias?|alternativas?|a confirmar|nao adotad[ao]s?)\b/u.test(heading[2]!)) {
        excludedLevel = level;
      }
      technologyColumn = -1;
      continue;
    }
    if (excludedLevel) continue;
    const text = line.replace(/[`*]/gu, "");
    if (text.startsWith("|")) {
      const cells = text.replace(/^\||\|$/gu, "").split(/(?<!\\)\|/u).map((cell) => cell.trim());
      const header = cells.findIndex((cell) => /^tecnologias?$/u.test(cell));
      if (header >= 0) {
        technologyColumn = header;
        continue;
      }
      const technology = cells[technologyColumn >= 0 ? technologyColumn : 0];
      if (technology) declarations.push({ technology, line: text });
      continue;
    }
    technologyColumn = -1;
    if (text) declarations.push({ technology: text, line: text });
  }
  return declarations;
}

function declaresAlias(declarations: ReturnType<typeof stackDeclarations>, alias: string): boolean {
  const pattern = keywordPattern(alias);
  if (!pattern) return false;
  const technology = new RegExp(pattern, "u");
  const negative = new RegExp(
    `\\b(?:sem|nao usa(?:mos|do|da)?|nao adota(?:mos|do|da)?|ausencia de)\\s+${pattern}|` +
    `${pattern}\\s*[:|(–-]\\s*(?:pendente|ausente|a confirmar|a instalar|nao (?:usad[ao]|adotad[ao]|instalad[ao]))\\b`,
    "u",
  );
  return declarations.some((row) => technology.test(row.technology) && !negative.test(row.line));
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
 * or declared in .specsfy/STACK.md. A failed scan leaves declarations available.
 */
export async function projectStackSpecialists(project: string, catalog: Catalog): Promise<{
  stack: Set<string>;
  stackWarning?: string;
}> {
  const stack = new Set<string>();
  let stackWarning: string | undefined;
  try {
    for (const entry of await catalog.detect(project)) stack.add(entry.name);
  } catch {
    stackWarning = "Could not detect the project stack. Using declarations in .specsfy/STACK.md when available.";
  }
  const markdown = await readFile(join(project, ".specsfy", "STACK.md"), "utf8").catch(() => "");
  const declarations = stackDeclarations(markdown);
  for (const entry of catalog.entries) {
    if (entry.stack && entry.aliases.some((alias) => declaresAlias(declarations, alias))) stack.add(entry.name);
  }
  return { stack, stackWarning };
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
    if (stack && entry.stack && !stack.has(entry.name) && !declared.has(entry.name)) continue;
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
