#!/usr/bin/env node
/** Registra informações confirmadas da conversa sem alterar a parte detectada do mapa de dados. */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const START = "<!-- specsfy:conversation-data:start -->";
const END = "<!-- specsfy:conversation-data:end -->";

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
  for (const field of ["nome", "para-que-serve", "o-que-guardar", "formato-sugerido", "ligacoes", "acesso", "ciclo-de-vida", "fontes"]) {
    if (!values[field]?.trim()) fail(`--${field} é obrigatório`);
  }
  return values;
}

function safe(value) {
  return value.trim().replaceAll("|", "\\|").replaceAll(/\r?\n/gu, " ");
}

function withSuggestedFormat(row) {
  const cells = row.split("|").slice(1, -1).map((cell) => cell.trim());
  if (cells.length !== 7) return row;
  return `| ${[...cells.slice(0, 3), "A confirmar", ...cells.slice(3)].join(" | ")} |`;
}

function block(values, rows) {
  const next = `| ${[values.nome, values["para-que-serve"], values["o-que-guardar"], values["formato-sugerido"], values.ligacoes, values.acesso, values["ciclo-de-vida"], values.fontes].map(safe).join(" | ")} |`;
  const name = safe(values.nome);
  const kept = rows
    .filter((row) => !row.startsWith(`| ${name} |`))
    .map(withSuggestedFormat);
  return [
    START,
    "## Informações a guardar confirmadas",
    "",
    "| Informação | Para que serve | O que guardar | Formato sugerido | Ligações | Quem usa | Quando muda ou sai | Fontes |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...kept,
    next,
    END,
  ].join("\n");
}

async function main() {
  const values = parseArgs(process.argv.slice(2));
  const project = resolve(values.project ?? process.cwd());
  const target = join(project, ".specsfy", "DATABASE.md");
  let current = "# Banco de dados\n";
  try { current = await readFile(target, "utf8"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  const currentBlock = current.match(new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`));
  const rows = currentBlock?.[0].split(/\r?\n/gu).filter((line) => line.startsWith("| ") && !line.startsWith("| Informação ") && !line.startsWith("| ---")) ?? [];
  const nextBlock = block(values, rows);
  const next = currentBlock ? current.replace(currentBlock[0], nextBlock) : `${current.trimEnd()}\n\n${nextBlock}\n`;
  await mkdir(join(project, ".specsfy"), { recursive: true });
  await writeFile(target, next, "utf8");
  console.log(target);
}

main().catch((error) => {
  console.error(`erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
