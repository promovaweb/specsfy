#!/usr/bin/env node
/** Acrescenta uma regra confirmada sem alterar o restante do documento. */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

function argument(name) {
  const index = process.argv.indexOf(`--${name}`);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value || value.startsWith("--")) throw new Error(`--${name} é obrigatório`);
  return value;
}

function addRule(content, section, rule) {
  const normalized = rule.trim().replace(/^-\s*/u, "");
  if (!normalized) throw new Error("a regra não pode estar vazia");
  if (content.toLocaleLowerCase("pt-BR").includes(normalized.toLocaleLowerCase("pt-BR"))) return content;
  const source = content.trim() ? content : "# Regras do sistema\n";
  const heading = `## ${section.trim()}`;
  const expression = new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*$`, "imu");
  const match = expression.exec(source);
  const line = `- ${normalized}`;
  if (!match) return `${source.trimEnd()}\n\n${heading}\n\n${line}\n`;
  const remainder = source.slice(match.index + match[0].length);
  const next = /^##\s+/mu.exec(remainder);
  const insertion = next ? match.index + match[0].length + next.index : source.length;
  return `${source.slice(0, insertion).trimEnd()}\n\n${line}\n${source.slice(insertion).trimStart() ? `\n${source.slice(insertion).trimStart()}` : ""}`;
}

try {
  const project = resolve(argument("project"));
  const section = argument("section");
  const rule = argument("rule");
  const target = join(project, ".specsfy", "RULES.md");
  let existing = "";
  try { existing = await readFile(target, "utf8"); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  const updated = addRule(existing, section, rule);
  if (updated !== existing) {
    await mkdir(join(project, ".specsfy"), { recursive: true });
    await writeFile(target, updated, "utf8");
    console.log(target);
  }
} catch (error) {
  console.error(`erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
