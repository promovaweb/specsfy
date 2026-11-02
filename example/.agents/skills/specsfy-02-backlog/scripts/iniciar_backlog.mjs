#!/usr/bin/env node
/** Cria um item de backlog numerado sem promover uma spec. */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceTemplate = resolve(dirname(fileURLToPath(import.meta.url)), "../../templates/Backlog.md");

function fail(message) { throw new Error(message); }
function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--")) fail(`argumento inválido: ${key}`);
    if (value === undefined || value.startsWith("--")) fail(`valor ausente para ${key}`);
    values[key.slice(2)] = value;
    index += 1;
  }
  for (const field of ["title", "idea", "problem", "person", "result", "context"]) if (values[field] === undefined) fail(`--${field} é obrigatório`);
  return values;
}
function required(value, field) { const result = value?.trim(); if (!result) fail(`${field} não pode ficar vazio`); return result; }
function normalizedTitle(value) { const result = required(value, "o título"); if (/\r|\n/u.test(result)) fail("o título deve ocupar uma única linha"); return result; }
function slug(value, title) {
  const result = value === undefined ? title.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "") : value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(result)) fail("slug inválido; utilize caracteres ASCII em kebab-case");
  return result;
}
async function template(root) {
  for (const path of [join(root, ".specsfy/templates/custom/Backlog.md"), join(root, ".specsfy/templates/Backlog.md"), sourceTemplate]) {
    try { return await readFile(path, "utf8"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
  fail("modelo não encontrado; reinstale o framework");
}
function render(content, values) {
  let result = content;
  for (const [token, value] of Object.entries(values)) {
    if (!result.includes(token)) fail(`token obrigatório ausente: ${token}`);
    result = result.replaceAll(token, value);
  }
  const unresolved = [...new Set(result.match(/\{\{[A-Z0-9_]+\}\}/gu) ?? [])];
  if (unresolved.length) fail(`tokens não preenchidos: ${unresolved.join(", ")}`);
  return result;
}
async function nextNumber(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return Math.max(0, ...entries.filter((entry) => entry.isFile()).map((entry) => Number(/^(\d{4})-.*\.md$/u.exec(entry.name)?.[1] ?? 0))) + 1;
  } catch (error) { if (error?.code === "ENOENT") return 1; throw error; }
}
async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root ?? process.cwd());
  const title = normalizedTitle(args.title);
  const values = {
    idea: required(args.idea, "a ideia original"),
    problem: required(args.problem, "o problema percebido"),
    person: required(args.person, "a pessoa afetada ou beneficiada"),
    result: required(args.result, "o resultado ou valor esperado"),
    context: required(args.context, "o contexto"),
  };
  const backlog = join(root, "specs", "backlog");
  await mkdir(backlog, { recursive: true });
  const content = await template(root);
  for (;;) {
    const number = await nextNumber(backlog);
    if (number > 9999) fail("a sequência de backlog atingiu 9999");
    const destination = join(backlog, `${String(number).padStart(4, "0")}-${slug(args.slug, title)}.md`);
    try {
      await writeFile(destination, render(content, {
        "{{BACKLOG_ID}}": `BACKLOG-${String(number).padStart(4, "0")}`,
        "{{BACKLOG_NAME}}": title,
        "{{CURRENT_DATE}}": new Date().toISOString().slice(0, 10),
        "{{ORIGINAL_IDEA}}": values.idea,
        "{{PERCEIVED_PROBLEM}}": values.problem,
        "{{AFFECTED_PERSON}}": values.person,
        "{{EXPECTED_RESULT}}": values.result,
        "{{IDEA_CONTEXT}}": values.context,
      }), { encoding: "utf8", flag: "wx" });
      console.log(resolve(destination));
      return;
    } catch (error) { if (error?.code !== "EEXIST") throw error; }
  }
}
main().catch((error) => { console.error(`erro: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
