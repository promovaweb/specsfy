#!/usr/bin/env node
/** Lista e carrega somente research local indexado pela especificação. */
import { existsSync, lstatSync, realpathSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { basename, dirname, relative, resolve, sep } from "node:path";

const args = process.argv.slice(2); const specInput = args.find((arg) => !arg.startsWith("--")); const json = args.includes("--json"); const emit = args.includes("--emit-content"); const maxBytes = Number(args.includes("--max-bytes") ? args[args.indexOf("--max-bytes") + 1] : 65536);
const inside = (path, root) => path === root || path.startsWith(`${root}${sep}`);
const slugify = (value) => value.normalize("NFKC").toLocaleLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/[\s-]+/gu, "-").replace(/^-+|-+$/gu, "");
function section(text, title) { return text.match(new RegExp(`^####\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$\\n([\\s\\S]*?)(?=^####\\s+|^###\\s+|(?![\\s\\S]))`, "m"))?.[1] ?? ""; }
async function files(path) { if (!existsSync(path)) return []; const stat = lstatSync(path); if (!stat.isDirectory()) return [path]; const children = await readdir(path, { withFileTypes: true }); return (await Promise.all(children.map((entry) => files(resolve(path, entry.name))))).flat(); }
async function anchors(path) { try { const text = await readFile(path, "utf8"); const counts = new Map(); return new Set([...text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map((match) => { const base = slugify(match[1]); const count = counts.get(base) ?? 0; counts.set(base, count + 1); return count ? `${base}-${count}` : base; })); } catch { return new Set(); } }
function projectRoot(spec) {
  for (let directory = dirname(spec); ; directory = dirname(directory)) {
    if (statSync(resolve(directory, ".specsfy"), { throwIfNoEntry: false })?.isDirectory()) return directory;
    if (basename(directory) === "specs" && basename(dirname(directory)) !== "specs") return dirname(directory);
    if (dirname(directory) === directory) return process.cwd();
  }
}

function researchIndex(text, errors) {
  const index = section(text, "Artefatos de pesquisa armazenados");
  const paths = new Set();
  for (const line of index.split(/\r?\n/)) {
    const entry = line.match(/^[ \t]*[-*]\s+(.+)$/)?.[1];
    if (!entry) continue;
    const path = entry.match(/^`([^`]+)`/)?.[1];
    if (path && /(?:^|\/)research\//.test(path)) paths.add(path);
    else if (entry.startsWith("`") || /\bresearch\/[^\s`]+/.test(entry)) {
      errors.push(`entrada inválida no índice de research: ${entry}`);
    }
  }
  const noExternal = /^[ \t]*(?:[-*] +)?(?:Nenhum artefato externo|Nenhuma fonte externa|(?:Sem|Não há) fontes? externas?)(?:[.;:]|[ \t]*$)/im.test(index);
  return { paths: [...paths].sort(), noExternal };
}

function safeResearchPath(candidate, research) {
  return inside(candidate, research) && existsSync(candidate) && realpathSync(candidate) === candidate;
}

if (!specInput || !existsSync(specInput) || !Number.isInteger(maxBytes) || maxBytes <= 0) { console.error("ERRO: spec inexistente ou max-bytes inválido."); process.exitCode = 2; }
else {
  const spec = realpathSync(resolve(specInput));
  const text = await readFile(spec, "utf8");
  const root = projectRoot(spec);
  const research = resolve(dirname(spec), "research");
  const errors = [];
  const artifacts = [];
  const seen = new Set();
  const { paths: indexed, noExternal } = researchIndex(text, errors);
  for (const raw of indexed) {
    const candidate = resolve(raw.startsWith("research/") || raw.startsWith("./research/") ? dirname(spec) : root, raw);
    if (!safeResearchPath(candidate, research)) {
      errors.push(`caminho inseguro ou symlink: ${raw}`);
      continue;
    }
    const entries = await files(candidate);
    if (!entries.length) errors.push(`entrada do índice sem artefatos: ${raw}`);
    for (const path of entries) {
      if (seen.has(path)) continue;
      seen.add(path);
      if (!safeResearchPath(path, research) || !lstatSync(path).isFile()) {
        errors.push(`artefato inexistente ou inseguro: ${path}`);
        continue;
      }
      const size = statSync(path).size;
      const item = { path: relative(root, path).replaceAll("\\", "/"), bytes: size, truncated: size > maxBytes };
      if (emit) {
        const buffer = await readFile(path);
        try {
          item.content = new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, maxBytes));
        } catch {
          errors.push(`artefato não textual: ${item.path}`);
          item.content = "";
        }
      }
      artifacts.push(item);
    }
  }
  const claims = [];
  const budgets = [];
  const claimPattern = /^-\s+\*\*(R-\d{3,})\*\*\s+\[(critical|high|medium|low)\]\s+(.+?)\s+[—-]\s+Verdict:\s+(verified|refuted|unverifiable)\s+[—-]\s+Confidence:\s+(high|medium|low)\s+[—-]\s+Evidence:\s+(\S+)\s+[—-]\s+Budget:\s+(\d+\/\d+)\.?[ \t]*$/i;
  let hasClaim = false;
  for (const line of section(text, "Researchs executados").split(/\r?\n/)) {
    const candidate = line.trim().match(/^(?:[-*+]\s+)?(?:\*{1,2}|`)?(R-[\w-]+)(?:\*{1,2}|`)?[ \t]*(.*)$/i);
    if (!candidate) continue;
    const [, id, content] = candidate;
    // A notação "R-NNN: pergunta → conclusão" também é usada para pesquisa local.
    if (content.startsWith(":") && !/^:\s*\[(?:critical|high|medium|low)\]|\b(?:Verdict|Confidence|Evidence|Budget):/i.test(content)) continue;
    hasClaim = true;
    const match = line.trim().match(claimPattern);
    if (!match) {
      errors.push(`${id}: claim não segue o contrato ResearchClaim`);
      continue;
    }
    const [, claimId, criticality, statement, verdict, confidence, locator, budget] = match;
    const claim = { id: claimId, criticality: criticality.toLowerCase(), claim: statement,
      verdict: verdict.toLowerCase(), confidence: confidence.toLowerCase(), evidence: locator, budget };
    claims.push(claim);
    const [file, anchor] = claim.evidence.split("#");
    const evidence = resolve(dirname(spec), file);
    if (!safeResearchPath(evidence, research) || !lstatSync(evidence).isFile()) {
      errors.push(`${claim.id}: evidence local inexistente ou insegura: ${file}`);
    } else if (anchor && !(await anchors(evidence)).has(anchor)) {
      errors.push(`${claim.id}: âncora inexistente na evidence: #${anchor}`);
    }
    const [used, limit] = claim.budget.split("/").map(Number);
    budgets.push([used, limit]);
    if (!limit || used > limit) errors.push(`${claim.id}: orçamento ${!limit ? "inválido" : "excedido"} (${used}/${limit})`);
  }
  const counts = new Map();
  for (const claim of claims) {
    counts.set(claim.id, (counts.get(claim.id) ?? 0) + 1);
    if (claim.criticality === "critical" && claim.verdict !== "verified") {
      errors.push(`${claim.id}: critical claim não verificado (${claim.verdict})`);
    }
  }
  for (const [id, count] of counts) if (count > 1) errors.push(`${id}: ID duplicado`);
  const limits = new Set(budgets.map(([, limit]) => limit));
  const total = budgets.reduce((sum, [used]) => sum + used, 0);
  if (limits.size > 1) errors.push("claims possuem limites de orçamento divergentes");
  else if (budgets.length && total > budgets[0][1]) errors.push(`orçamento total excedido (${total}/${budgets[0][1]})`);
  if (!indexed.length && (!noExternal || hasClaim)) errors.push("nenhum artefato de research indexado");
  const payload = { schema_version: 1, result: errors.length ? "failed" : "passed", artifacts, claims, errors };
  if (json) console.log(JSON.stringify(payload, null, 2)); else { console.log(`Research: ${payload.result.toUpperCase()}`); artifacts.forEach((item) => console.log(`- ${item.path}: ${item.bytes} bytes${item.truncated ? " (truncado)" : ""}`)); errors.forEach((error) => console.log(`ERRO: ${error}`)); } process.exitCode = payload.result === "passed" ? 0 : 1;
}
