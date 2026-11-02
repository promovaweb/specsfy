#!/usr/bin/env node
/** Registra uma captura sem interação em `specs/inbox/`. */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const UNKNOWN = "Não identificado no texto original.";
const sourceTemplate = resolve(dirname(fileURLToPath(import.meta.url)), "../../templates/Inbox.md");

function fail(message) { throw new Error(message); }

function parseArgs(argv) {
  const values = {
    summary: UNKNOWN,
    problem: UNKNOWN,
    people: UNKNOWN,
    value: UNKNOWN,
    signals: UNKNOWN,
    risks: UNKNOWN,
    directions: UNKNOWN,
    review: "Revisar as lacunas antes da promoção.",
    session: "Captura avulsa.",
    turn: "Não se aplica.",
    sources: "Nenhuma fonte contextual consultada.",
    data: UNKNOWN,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) fail(`argumento inválido: ${key}`);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--")) fail(`valor ausente para ${key}`);
    values[key.slice(2)] = value;
    index += 1;
  }
  for (const key of ["input", "title"]) if (!values[key]) fail(`--${key} é obrigatório`);
  return values;
}

function required(value, field) {
  const normalized = value?.trim();
  if (!normalized) fail(`${field} não pode ficar vazio`);
  return normalized;
}

function title(value) {
  const normalized = required(value, "o título");
  if (/\r|\n/u.test(normalized)) fail("o título deve ocupar uma única linha");
  return normalized;
}

function slug(value, humanTitle) {
  const result = value === undefined
    ? humanTitle.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "")
    : value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(result)) fail("slug inválido; utilize caracteres ASCII em kebab-case");
  return result;
}

async function resolveTemplate(root) {
  for (const path of [join(root, ".specsfy/templates/custom/Inbox.md"), join(root, ".specsfy/templates/Inbox.md"), sourceTemplate]) {
    try { return await readFile(path, "utf8"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
  fail("template não encontrado; execute specsfy install para publicar .specsfy/templates/Inbox.md");
}

function timestamp(now) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function render(template, values) {
  let result = template;
  for (const [token, value] of Object.entries(values)) {
    if (!result.includes(token)) fail(`token obrigatório ausente: ${token}`);
    result = result.replaceAll(token, value);
  }
  const unresolved = [...new Set(result.match(/\{\{[A-Z0-9_]+\}\}/gu) ?? [])];
  if (unresolved.length) fail(`tokens não preenchidos: ${unresolved.join(", ")}`);
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root ?? process.cwd());
  const originalInput = required(args.input, "o texto original");
  const humanTitle = title(args.title);
  const destinationRoot = join(root, "specs", "inbox");
  await mkdir(destinationRoot, { recursive: true });
  const now = new Date();
  const prefix = timestamp(now);
  const slugValue = slug(args.slug, humanTitle);
  let suffix = "";
  for (let index = 2;; index += 1) {
    const candidate = join(destinationRoot, `${prefix}-${slugValue}${suffix}.md`);
    try {
      await writeFile(candidate, render(await resolveTemplate(root), {
        "{{INBOX_NAME}}": humanTitle,
        "{{INBOX_SLUG}}": slugValue,
        "{{CAPTURED_AT}}": now.toISOString().replace(/\.\d{3}Z$/u, "Z"),
        "{{DISCOVERY_SESSION}}": required(args.session, "a sessão de descoberta"),
        "{{CONVERSATION_TURN}}": required(args.turn, "o turno da conversa"),
        "{{ORIGINAL_INPUT_SHA256}}": createHash("sha256").update(originalInput).digest("hex"),
        "{{ORIGINAL_INPUT}}": originalInput,
        "{{CONSULTED_SOURCES}}": required(args.sources, "as fontes contextuais consultadas"),
        "{{SUMMARY}}": required(args.summary, "o resumo"),
        "{{PROBLEM_OR_OPPORTUNITY}}": required(args.problem, "o problema ou oportunidade"),
        "{{AFFECTED_PEOPLE}}": required(args.people, "as pessoas afetadas"),
        "{{EXPECTED_VALUE}}": required(args.value, "o valor esperado"),
        "{{EXTRACTED_SIGNALS}}": required(args.signals, "os sinais extraídos"),
        "{{DATA_SIGNALS}}": required(args.data, "os sinais sobre informações a guardar"),
        "{{RISKS_AND_DEPENDENCIES}}": required(args.risks, "os riscos e dependências"),
        "{{FUTURE_DIRECTIONS}}": required(args.directions, "as direções futuras"),
        "{{FUTURE_REVIEW}}": required(args.review, "os pontos a revisar"),
      }), { encoding: "utf8", flag: "wx" });
      console.log(resolve(candidate));
      return;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      suffix = `-${index}`;
    }
  }
}

main().catch((error) => {
  console.error(`erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
