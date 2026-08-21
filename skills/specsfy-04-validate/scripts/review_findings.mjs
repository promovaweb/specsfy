#!/usr/bin/env node
/** Valida findings de produto, arquitetura e segurança registrados na spec. */

import { lstat, readFile, realpath } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { existsSync } from "node:fs";

const finding = /^-\s+\*\*(FIND-(PROD|ARCH|SEC)-\d{3,})\*\*\s+\[(P[123])\]\s+\[(Open|Resolved|Accepted)\]\s+(.+?)\s+—\s+Refs:\s+(.+?)\s+—\s+Evidence:\s+(.+?)\s+—\s+Effect:\s+(.+?)\s+—\s+Suggestion:\s+(.+?)\s*$/gmu;
const defined = /^(?:####\s+((?:US|AC)-\d{3,})\b|-\s+\*\*((?:FR|NFR)-\d{3,})\*\*\s*:)/gmu;

function argumentsMap(argv) {
  const values = { json: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--json") { values.json = true; continue; }
    if (argv[index]?.startsWith("--")) { values[argv[index].slice(2)] = argv[index + 1]; index += 1; continue; }
    if (!values.spec) values.spec = argv[index]; else throw new Error(`argumento inválido: ${argv[index]}`);
  }
  if (!values.spec) throw new Error("informe o caminho da spec");
  return values;
}

async function safeEvidence(root, locator) {
  const pathText = locator.trim().replace(/(?::\d+|#.+)$/u, "");
  if (locator.includes("://") || locator.startsWith("manual:")) return false;
  const target = resolve(root, pathText);
  if (relative(root, target).startsWith("..")) return false;
  try {
    const information = await lstat(target);
    if (information.isSymbolicLink() || !information.isFile()) return false;
    return !relative(root, await realpath(target)).startsWith("..");
  } catch { return false; }
}

async function analyze(text, root) {
  const findings = [];
  for (const match of text.matchAll(finding)) {
    findings.push({ id: match[1], lens: match[2].toLowerCase(), severity: match[3], status: match[4], description: match[5], refs: match[6], evidence: match[7], effect: match[8], suggestion: match[9] });
  }
  const declarations = new Set([...text.matchAll(/^\s*-\s+\*\*(FIND-(?:PROD|ARCH|SEC)-\d{3,})\*\*/gmu)].map((match) => match[1]));
  const parsed = new Set(findings.map((item) => item.id));
  const errors = [...declarations].filter((item) => !parsed.has(item)).sort().map((item) => `${item}: formato inválido`);
  const counts = new Map();
  for (const item of findings) counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
  for (const [id, count] of [...counts].sort()) if (count > 1) errors.push(`${id}: ID duplicado`);
  const definitions = new Set([...text.matchAll(defined)].flatMap((match) => [match[1], match[2]]).filter(Boolean));
  for (const item of findings) {
    const refs = [...new Set(item.refs.match(/\b(?:US|FR|NFR|AC)-\d{3,}\b/gu) ?? [])].sort();
    const invalid = refs.filter((reference) => !definitions.has(reference));
    if (!refs.length) errors.push(`${item.id}: refs ausentes`);
    else if (invalid.length) errors.push(`${item.id}: refs inexistentes: ${invalid.join(", ")}`);
    if (root && !(await safeEvidence(root, item.evidence))) errors.push(`${item.id}: evidence local inexistente ou insegura: ${item.evidence}`);
  }
  const blocking = findings.filter((item) => item.severity === "P1" && item.status === "Open").map((item) => item.id);
  return { schema_version: 1, result: !errors.length && !blocking.length ? "passed" : "failed", findings, blocking, errors };
}

try {
  const args = argumentsMap(process.argv.slice(2));
  const spec = resolve(args.spec);
  const text = await readFile(spec, "utf8");
  const root = args.root ? resolve(args.root) : (() => { let cursor = dirname(spec); while (dirname(cursor) !== cursor) { if (existsSync(resolve(cursor, ".git"))) return cursor; cursor = dirname(cursor); } return resolve(dirname(spec), "../.."); })();
  const payload = await analyze(text, root);
  if (args.json) console.log(JSON.stringify(payload, null, 2));
  else {
    console.log(`Reviews: ${payload.result.toUpperCase()}`);
    payload.findings.forEach((item) => console.log(`- ${item.id} [${item.severity}] [${item.status}]`));
    payload.blocking.forEach((item) => console.log(`BLOCKER: ${item}`));
    payload.errors.forEach((item) => console.log(`ERRO: ${item}`));
  }
  process.exitCode = payload.result === "passed" ? 0 : 1;
} catch (error) {
  console.error(`ERRO: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 2;
}
