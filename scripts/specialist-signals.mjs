#!/usr/bin/env node
/**
 * Writes the table of specialist signals into the references of the base
 * skills from specialists/catalog.json.
 *
 * Each base skill is installed on its own, so every skill that calls
 * specialists carries its own copy of the table (signal in the demand, the
 * spec or the code -> specialist -> mode). The single source is the
 * `triggers` list of each catalog entry. The table lives between the markers
 * `<!-- specsfy:signals:start -->` and `<!-- specsfy:signals:end -->`.
 *
 *   node scripts/specialist-signals.mjs          rewrites the tables
 *   node scripts/specialist-signals.mjs --check  exits 1 when a copy differs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const START = "<!-- specsfy:signals:start -->";
const END = "<!-- specsfy:signals:end -->";
const PREFIX = "specsfy-specialist-";

/** References of the base skills that carry the table. */
export const SIGNAL_FILES = [
  "skills/specsfy-02-backlog/references/specialists.md",
  "skills/specsfy-03-specify/references/specialists.md",
  "skills/specsfy-04-validate/references/specialists.md",
  "skills/specsfy-05-tasks/references/specialists.md",
  "skills/specsfy-06-implement/references/specialists-implement.md",
  "skills/specsfy-06-implement/references/specialists-tests.md",
  "skills/specsfy-update-spec/references/specialists.md",
];

/** Markdown table built from the catalog triggers, in catalog order. */
export function signalsTable(catalog) {
  const rows = catalog.skills.flatMap((entry) =>
    (entry.triggers ?? []).map((trigger) => `| ${trigger.signal} | \`${entry.name.slice(PREFIX.length)}\` | \`${trigger.mode ?? "padrão"}\` |`),
  );
  return [
    "Especialistas de tecnologia (`postgres`, `supabase`, `redis`, `laravel`, `react`, `nextjs`, `typescript`, `tailwind-css`, `docker`) só entram quando o `.specsfy/STACK.md` ou os manifests confirmam a tecnologia; sem essa confirmação, use o especialista de conceito (`modeling`, `architecture`, `interface`). Um sinal pode puxar mais de um especialista.",
    "",
    "Exemplo combinado em Laravel com Inertia: para autorização por equipe × papel × operação, aplique `application-security`, `laravel/app`, `interface/ux` e `testing/pest`. Verifique em Pest HTTP a capacidade de criar exposta à UI e as decisões no GET do formulário e no POST. No reenvio de um código normalizado, use `modeling/data` e `laravel/app` para garantir unicidade por equipe e `architecture/web-api` para definir o erro de campo no fluxo Inertia. Em Pest, prove que equipes distintas podem usar o mesmo código e que repetir o POST na mesma equipe após um resultado incerto exibe o erro sem duplicar a gravação.",
    "",
    "| Sinal na demanda, na spec ou no código | Especialista | Modo |",
    "| --- | --- | --- |",
    ...rows,
  ].join("\n");
}

/** Replaces the marked block, or the first signal table on the first run. */
export function withTable(text, table, path = "signal table") {
  const block = `${START}\n${table}\n${END}`;
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start >= 0 || end >= 0) {
    if (start < 0 || end < start || text.lastIndexOf(START) !== start || text.lastIndexOf(END) !== end) {
      throw new Error(`${path}: expected exactly one start marker followed by one end marker`);
    }
    return text.slice(0, start) + block + text.slice(end + END.length);
  }
  const match = /^\| Sinal na demanda[^\n]*\n(?:\|[^\n]*\n?)*/mu.exec(text);
  if (!match) throw new Error(`${path}: no signal table and no markers`);
  return text.replace(match[0], () => `${block}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes("--check");
  const table = signalsTable(JSON.parse(readFileSync(join(ROOT, "specialists", "catalog.json"), "utf8")));
  const changes = [];
  try {
    for (const path of SIGNAL_FILES) {
      const file = join(ROOT, path);
      const current = readFileSync(file, "utf8");
      const next = withTable(current, table, path);
      if (next !== current) changes.push({ path, file, next });
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!check) for (const { file, next } of changes) writeFileSync(file, next);
  const stale = changes.map(({ path }) => path);
  if (check && stale.length) {
    console.error(`Signal tables out of date (run node scripts/specialist-signals.mjs):\n${stale.map((path) => `  ${path}`).join("\n")}`);
    process.exit(1);
  }
  console.log(check ? `✓ ${SIGNAL_FILES.length} signal tables match specialists/catalog.json` : `✓ ${stale.length} signal table(s) written`);
}
