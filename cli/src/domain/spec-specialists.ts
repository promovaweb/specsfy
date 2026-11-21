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

interface SourceLine {
  line: number;
  text: string;
  prose: string;
  heading: string;
  taskTags: string;
}

function modeKey(value?: string): string {
  const mode = fold(value ?? "").replace(/[`*]/gu, "").trim();
  return mode === "padrao" || mode === "default" || mode === "-" || mode === "—" ? "" : mode;
}

function readSpec(markdown: string) {
  const names = new Set<string>();
  const pairs = new Set<string>();
  const lines: SourceLine[] = [];
  let metadata = true;
  let section = "";
  let subsection = "";
  let excludedLevel = 0;
  let specialistPlanLevel = 0;
  let specialistTable = false;
  let taskTags = "";
  let fence: string | undefined;

  function declare(value: string, mode?: string) {
    const name = normalizeName(value);
    if (!name) return;
    names.add(name);
    pairs.add(`${name}/${modeKey(mode)}`);
  }

  const original = markdown.split(/\r?\n/u);
  const withoutComments = markdown.replace(/<!--[^]*?-->/gu, (comment) => comment.replace(/[^\r\n]/gu, " "));
  const source = withoutComments.split(/\r?\n/u);
  for (const [index, line] of source.entries()) {
    const marker = /^\s*(`{3,}|~{3,})(.*)$/u.exec(line);
    if (fence) {
      if (marker && marker[1]!.startsWith(fence) && !marker[2]!.trim()) fence = undefined;
      continue;
    }
    if (marker) {
      fence = marker[1];
      continue;
    }
    const heading = /^ {0,3}(#{2,6})[ \t]+(.+)$/u.exec(line);
    if (heading) {
      metadata = false;
      const level = heading[1]!.length;
      const title = fold(heading[2]!.replace(/^\d+\.[ \t]+|\s+#+$/gu, "").trim());
      if (excludedLevel && level <= excludedLevel) excludedLevel = 0;
      if (/\b(?:fora (?:d[eo] )?escopo|out of scope)\b/u.test(title)) excludedLevel ||= level;
      if (level <= 3) {
        section = title;
        subsection = title;
        taskTags = "";
      } else {
        subsection = title;
      }
      if (specialistPlanLevel && level <= specialistPlanLevel) specialistPlanLevel = 0;
      if (section === "plano tecnico" && title === "especialistas") specialistPlanLevel = level;
      specialistTable = false;
    }
    if (excludedLevel) continue;
    const cells = /^\s*\|(.*)\|\s*$/u.exec(line)?.[1]?.split(/(?<!\\)\|/u).map((cell) => cell.trim());
    if (metadata && cells?.[0]?.toLowerCase() === "especialistas") {
      cells[1]?.split(",").forEach((name) => declare(name));
      continue;
    }
    if (specialistPlanLevel && cells?.[0]?.toLowerCase() === "especialista" && cells[1]?.toLowerCase() === "modo") {
      specialistTable = true;
      continue;
    }
    if (specialistTable && cells) {
      declare(cells[0] ?? "", cells[1]);
      if (cells[2] && !/^[-:\s]+$/u.test(cells[2])) {
        lines.push({ line: index + 1, text: original[index]!, prose: cells[2], heading: subsection, taskTags });
      }
      continue;
    }
    specialistTable = false;

    if (section === "tarefas") {
      if (heading) taskTags = "";
      const task = /^\s*[-*+]\s+\[[ xX]\]\s+T\d+\b\s+((?:\[[^\]]+\]\s+)+)/u.exec(line);
      if (task) taskTags = task[1]!;
      const annotation = /^\s*(?:[-*+]\s+)?\**Especialista\**:\**\s+(.+)$/iu.exec(line);
      if (annotation) {
        const pair = /^([`*$\w-]+)(?:\s*\(([^)]+)\))?/u.exec(annotation[1]!);
        if (pair) declare(pair[1]!, pair[2]);
        continue;
      }
    }
    const tableHeader = cells && /^\s*\|[|:\s-]+\|\s*$/u.test(source[index + 1] ?? "");
    if (line.trim() && !tableHeader) lines.push({ line: index + 1, text: original[index]!, prose: line, heading: subsection, taskTags });
  }
  return { names: [...names], pairs, lines };
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

/** A matched catalog signal with its first affirmative occurrence. */
export interface SpecialistSignal {
  signal: string;
  evidence: { line: number; text: string };
}

/** One specialist/mode pair, with independent declaration and installation states. */
export interface SpecialistSuggestion {
  name: string;
  mode?: string;
  /** First signal, retained for consumers of the original response. */
  signal: string;
  signals: SpecialistSignal[];
  declared: boolean;
  installed: boolean;
}

/** Renders grouped signals and evidence on one text line. */
export function formatSpecialistSignals(signals: readonly SpecialistSignal[]): string {
  return signals.map(({ signal, evidence }) =>
    `${signal} (line ${evidence.line}: ${evidence.text.trim().replace(/\r?\n\s*/gu, " ")})`
  ).join("; ");
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

function affirmativeClauses(text: string): string[] {
  return fold(text.replace(/[`*]/gu, ""))
    .split(/(?<=[.!?;])[ \t]+|[, \t]+\b(?:mas|porem|contudo|but)\b\s+/u)
    .filter((clause) => !/\b(?:fora (?:d[eo] )?escopo|out of scope|nao sera(?:o)? (?:implementad[ao]s?|usad[ao]s?|adotad[ao]s?))\b/u.test(clause))
    .map((clause) => clause.split(/\b(?:sem|nao(?!\s+(?:so|apenas)\b)|nenhum[ao]s?|nem|without|will not)\s+/u, 1)[0]!.trim());
}

function matchSignal(source: SourceLine, text: string, name: string, mode: string, patterns: readonly RegExp[]): boolean {
  if (name === "debugging" && /\bregressao\b/u.test(text) &&
    !/\bregressao\s+(?:observad[ao]s?|detectad[ao]s?|reproduzid[ao]s?|ocorreu|introduzid[ao]s?)\b/u.test(text) &&
    !/\b(?:bug|falha intermitente|erro em producao)\b/u.test(text)) return false;
  if (name === "delivery" && mode === "deploy") {
    const conditional = /\b(?:pre-condicao|antes d[eo]|eventual|condicao (?:futura|de entrega))\b/u.test(text);
    const actualDeploy = /\b(?:executar|realizar|efetuar)\s+(?:o\s+)?deploy\b/u.test(text);
    if (conditional && !actualDeploy) return false;
    if (/\bproducao\b/u.test(text) &&
      !/\b(?:deploy|rollout|rollback|publicar|implantar|publicacao|implantacao)\b/u.test(text)) return false;
  }
  if (name === "delivery" && mode === "versioning" && /\bversao resolvida\b/u.test(text) &&
    !/\b(?:semver|tag de release|changelog)\b/u.test(text)) return false;
  if (name === "observability" && mode === "signals" &&
    /\b(?:metricas d[eo] (?:sucesso|aceite)|criterios de aceite)\b/u.test(`${source.heading} ${text}`) &&
    !/\b(?:observabilidade|tracing|slo|alertas)\b/u.test(text)) return false;

  if (patterns.some((pattern) => pattern.test(text))) return true;
  switch (`${name}/${mode}`) {
    case "architecture/web-api":
      return /\b(?:contratos? (?:web )?inertia|(?:operacoes|respostas|rotas|contratos?)\b[^.;]*\b(?:inertia\s*\/\s*http|http\s*inertia)|inertia\s*\/\s*http)\b/u.test(text);
    case "interface/discovery":
      return /\b(?:descoberta (?:d[aeo] )?(?:interface|telas?)|inventario\b[^.;]*\b(?:shell|telas?)|interface existente)\b/u.test(text);
    case "ui-components/components":
      return /\b(?:componentes?|blocos?|telas?|paginas?|composicao)\s+(?:visua(?:l|is)\s+)?react\b/u.test(text) ||
        (/\[CODE\]/u.test(source.taskTags) && /\b(?:react|[\w/-]+\.tsx)\b/u.test(text));
    default:
      return false;
  }
}

function findEvidence(lines: readonly SourceLine[], name: string, mode: string, patterns: readonly RegExp[]) {
  for (const [index, source] of lines.entries()) {
    const matches = (text: string) => affirmativeClauses(text).some((clause) => matchSignal(source, clause, name, mode, patterns));
    if (matches(source.prose)) return { line: source.line, text: source.text };
    const next = lines[index + 1];
    if (next?.line === source.line + 1 && /^\s+\S/u.test(next.prose) &&
      !/^\s*[-*+|#]/u.test(next.prose) && !matches(next.prose) &&
      matches(`${source.prose} ${next.prose.trim()}`)) {
      return { line: source.line, text: `${source.text}\n${next.text}` };
    }
  }
  return undefined;
}

/** Finds one suggestion per specialist and mode, in catalog order. */
export function analyzeSpecSpecialists(markdown: string, catalog: Catalog, installed: ReadonlySet<string>, stack?: ReadonlySet<string>) {
  const { names, pairs, lines } = readSpec(markdown);
  const suggestions: SpecialistSuggestion[] = [];
  for (const entry of catalog.entries) {
    const shortName = entry.name.slice(SPECIALIST_PREFIX.length);
    const modes = new Map<string, SpecialistSuggestion>();
    for (const trigger of entry.triggers) {
      const mode = modeKey(trigger.mode);
      const declared = pairs.has(`${entry.name}/${mode}`);
      if (stack && entry.stack && !stack.has(entry.name) && !declared) continue;
      const patterns = trigger.keywords.flatMap((keyword) => {
        const pattern = keywordPattern(keyword);
        return pattern ? [new RegExp(pattern, "u")] : [];
      });
      const evidence = findEvidence(lines, shortName, mode, patterns);
      if (!evidence) continue;
      const match = { signal: trigger.signal, evidence };
      const existing = modes.get(mode);
      if (existing) {
        if (!existing.signals.some(({ signal }) => signal === trigger.signal)) existing.signals.push(match);
      } else {
        modes.set(mode, {
          name: entry.name,
          ...(trigger.mode ? { mode: trigger.mode } : {}),
          signal: trigger.signal,
          signals: [match],
          declared,
          installed: installed.has(entry.name),
        });
      }
    }
    suggestions.push(...modes.values());
  }
  return { names, suggestions };
}
