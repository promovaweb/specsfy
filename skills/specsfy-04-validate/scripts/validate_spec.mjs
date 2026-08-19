#!/usr/bin/env node
/** Valida o contrato estrutural Specsfy/2.0. */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith("--"));
const draft = args.includes("--allow-draft");
const asJson = args.includes("--json");
const sections = ["Problema e resultado", "Research e esclarecimentos", "Escopo e atores", "Princípios e restrições do projeto", "Histórias de usuário", "Cenários BDD de aceite", "Requisitos", "Plano técnico", "Modelo de dados", "Interfaces e contratos", "Estratégia TDD", "Plano de testes e rastreabilidade", "Validações", "Tarefas", "Ordem de execução", "Dependências, riscos e suposições", "Decisões", "Definition of Done"];
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const field = (body, key) => body.match(new RegExp(`^\\|\\s*${escape(key)}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "im"))?.[1]?.trim();
const identifiers = (body, kind) => [...new Set([...body.matchAll(new RegExp(`\\b${kind}-\\d{3,}\\b`, "g"))].map((match) => match[0]))];

function minimumBddErrors(body) {
  const covered = new Map();
  const matches = [...body.matchAll(/^####\s+(AC-\d{3,})\b/gm)];
  for (const [index, match] of matches.entries()) {
    const chunk = body.slice(match.index, matches[index + 1]?.index);
    const ids = chunk.match(/\*\*Cobre\*\*:\s*([^\n]+)/i)?.[1]?.match(/\b(?:US|FR|NFR)-\d{3,}\b/g) ?? [];
    for (const id of ids) covered.set(id, new Set([...(covered.get(id) ?? []), match[1]]));
  }
  const errors = [];
  for (const kind of ["US", "FR", "NFR"]) for (const id of identifiers(body, kind)) {
    const count = covered.get(id)?.size ?? 0;
    if (count < 3) errors.push(`${id} possui ${count} cenários BDD; mínimo exigido: 3.`);
  }
  return errors;
}

if (!input || !existsSync(input)) {
  console.error(`ERRO: Arquivo não encontrado: ${input ?? ""}`);
  process.exitCode = 1;
} else {
  const path = resolve(input);
  const body = await readFile(path, "utf8");
  const errors = [];
  const warnings = [];
  const status = field(body, "Status");
  const slug = field(body, "Slug");
  const gates = { definition: field(body, "Definition Gate"), plan: field(body, "Plan Gate"), delivery: field(body, "Delivery Gate") };
  if (field(body, "Formato") !== "Specsfy/2.0") errors.push("O cabeçalho tabular deve declarar Formato como Specsfy/2.0.");
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push("Slug deve ser kebab-case na linha Slug do cabeçalho.");
  if (!['Draft', 'Defined', 'Planned', 'Implementing', 'Reviewing', 'Complete'].includes(status)) errors.push("Status deve ser Draft, Defined, Planned, Implementing, Reviewing ou Complete.");
  if (!draft && (status === "Draft" || gates.definition !== "Passed")) errors.push("Definition Gate precisa estar Passed para validação estrita.");
  for (const name of ["definition", "plan"]) if (!['Pending', 'Failed', 'Passed'].includes(gates[name])) errors.push(`${name} Gate inválido.`);
  if (!['Pending', 'In Progress', 'Failed', 'Passed'].includes(gates.delivery)) errors.push("Delivery Gate inválido.");
  for (const title of sections) if (!new RegExp(`^###\\s+(?:\\d+\\.\\s+)?${escape(title)}\\s*$`, "im").test(body)) errors.push(`Heading obrigatório ausente: ${title}.`);
  const ids = Object.fromEntries(["US", "FR", "NFR", "AC", "DEC"].map((kind) => [kind, identifiers(body, kind)]));
  for (const kind of ["US", "FR", "NFR", "AC"]) if (!ids[kind].length) errors.push(`Nenhuma definição ${kind}-NNN encontrada.`);
  errors.push(...minimumBddErrors(body));
  if (status === "Complete" && /^\s*-\s+\[ \]\s+T\d{3,}/m.test(body)) errors.push("Status Complete não permite tarefas abertas na seção 14.");
  // Sem o flag `i`: marcador é convenção maiúscula, e em português `todo` é palavra comum.
  if (/\b(?:TODO|TBD|FIXME)\b|\[NEEDS CLARIFICATION/m.test(body) && !(status === "Draft" && draft)) errors.push("Marcadores não resolvidos.");
  const result = { path, format: field(body, "Formato"), slug, status, gates, counts: Object.fromEntries(Object.entries(ids).map(([key, value]) => [key, value.length])), errors, warnings };
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else { console.log(`Spec: ${path}`); errors.forEach((error) => console.log(`ERRO: ${error}`)); console.log(errors.length ? "RESULTADO: NOT READY" : status === "Draft" ? "RESULTADO: VALID DRAFT" : "RESULTADO: READY"); }
  process.exitCode = errors.length ? 1 : 0;
}
