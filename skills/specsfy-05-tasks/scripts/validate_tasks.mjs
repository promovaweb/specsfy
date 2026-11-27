#!/usr/bin/env node
/** Valida tarefas embutidas na seção 14 da spec integrada. */
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { parseGateTasks } from "./parse_tasks.mjs";
/** Mantém a ordem do checklist e a cobertura mínima de casos TDD. */
const KEYS = ["PREP", "EXECUTE", "VERIFY", "VISUAL", "EVIDENCE", "IMPROVE"], MIN = 3;
/** Reconhece alterações estruturais que exigem migration no plano. */
const SCHEMA_VERBS = "criar|alterar|adicionar|remover|renomear|modificar|excluir";
const SCHEMA_TARGETS = "schema|tabela|coluna|campo\\s+persistente|model\\s+persistente|índice|indice|chave\\s+estrangeira|foreign\\s+key|constraint|relação\\s+persistente";
/** Delimita palavras com letras Unicode; `\b` trata letras acentuadas como separadores. */
const word = (alternatives) => `(?<![\\p{L}\\p{N}_])(?:${alternatives})(?![\\p{L}\\p{N}_])`;
const SCHEMA_CHANGE_TASK = new RegExp(`${word(SCHEMA_VERBS)}.*${word(SCHEMA_TARGETS)}|${word(SCHEMA_TARGETS)}.*${word(SCHEMA_VERBS)}`, "iu");
/** Aceita os diretórios versionados usados pelos frameworks cobertos. */
const MIGRATION_PATH = /(?:^|[\s`])(?:database\/migrations|migrations|prisma\/migrations|supabase\/migrations|alembic\/versions)\/[\w./-]+/i;
const args = process.argv.slice(2);
const projectFlag = args.indexOf("--project");
const project = projectFlag < 0 ? undefined : args[projectFlag + 1];
const specInput = args.find((arg, index) => !arg.startsWith("--") && (projectFlag < 0 || index !== projectFlag + 1));
const draft = args.includes("--allow-draft"), json = args.includes("--json");

function projectRoot(path) {
  if (project) return resolve(project);
  for (let directory = dirname(path); ; directory = dirname(directory)) {
    if (statSync(resolve(directory, ".specsfy"), { throwIfNoEntry: false })?.isDirectory()) return directory;
    if (basename(directory) === "specs" && basename(dirname(directory)) !== "specs") return dirname(directory);
    if (dirname(directory) === directory) return null;
  }
}

function verifyEvidence(path, status, errors) {
  const root = projectRoot(path);
  if (!root) {
    errors.push("Raiz da spec não encontrada. Use --project <raiz> para o Evidence Contract 1.");
    return;
  }
  const verifier = resolve(root, ".agents/skills/specsfy-06-implement/scripts/verify_evidence.mjs");
  if (!existsSync(verifier)) {
    errors.push("Evidence Contract 1 exige verify_evidence.mjs.");
    return;
  }
  const verifierArgs = [verifier, path, root, "--json"];
  if (["Reviewing", "Complete"].includes(status)) verifierArgs.push("--delivery");
  const run = spawnSync("node", verifierArgs, { cwd: root, encoding: "utf8" });
  if (run.status === 1) {
    try {
      JSON.parse(run.stdout).errors?.forEach((message) => errors.push(`Evidência material: ${message}`));
    } catch {
      errors.push("verify_evidence.mjs retornou JSON inválido.");
    }
  } else if (run.status !== 0) {
    errors.push(`Falha ao executar verify_evidence.mjs: ${run.error?.message || run.stderr?.trim() || `exit ${run.status}`}`);
  }
}
const metadata = (text, key) => text.match(new RegExp(`^\\|\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "im"))?.[1]?.trim(); const ids = (text, kind) => new Set([...text.matchAll(kind === "US" || kind === "AC" ? new RegExp(`^#{4,6}\\s+(${kind}-\\d{3,})\\b`, "gm") : new RegExp(`^\\s*-\\s+\\*\\*(${kind}-\\d{3,})\\*\\*\\s*:`, "gm"))].map((match) => match[1]));
if (projectFlag >= 0 && (!project || project.startsWith("--"))) { console.error("ERRO: --project exige uma raiz."); process.exitCode = 1; } else if (!specInput || !existsSync(specInput)) { console.error(`ERRO: Arquivo não encontrado: ${specInput ?? ""}`); process.exitCode = 1; } else { const path = resolve(specInput), text = await readFile(path, "utf8"), errors = [], warnings = []; const format = metadata(text, "Formato"), definition = metadata(text, "Definition Gate"), plan = metadata(text, "Plan Gate"), status = metadata(text, "Status"); if (format !== "Specsfy/2.0") errors.push("spec.md não declara Formato | Specsfy/2.0 no cabeçalho."); if (definition !== "Passed") errors.push("Definition Gate precisa estar Passed antes de validar tarefas."); if (!["Defined", "Planned", "Implementing", "Reviewing", "Complete"].includes(status)) errors.push("Status precisa ser Defined, Planned, Implementing, Reviewing ou Complete."); if (!["Pending", "Failed", "Passed"].includes(plan)) errors.push("Plan Gate deve ser Pending, Failed ou Passed."); else if (plan !== "Passed" && !draft) errors.push("Plan Gate precisa estar Passed para validação estrita."); const tasks = parseGateTasks(text, errors); const specIds = new Set([...["US", "AC", "FR", "NFR"].flatMap((kind) => [...ids(text, kind)])]); if (!tasks.length) errors.push("Nenhuma tarefa TNNN foi encontrada na seção 14."); const byId = new Map(); tasks.forEach((task) => { if (byId.has(task.id)) errors.push(`IDs de tarefa duplicados: ${task.id}.`); byId.set(task.id, task); }); const covered = new Set(); const allowed = new Set(["P", "TEST", "TDD", "CODE", "DOC", "OPS", "MIGRATION", ...ids(text, "US")]); const ancestors = (task, found = new Set()) => { task.depends.forEach((id) => { if (!found.has(id) && byId.has(id)) { found.add(id); ancestors(byId.get(id), found); } }); return found; };
/** Aceita justificativa explícita de ausência de interface; demais tarefas passam pelos cinco checks visuais. */
for (const task of tasks) { const list = task.checklist.map((item) => item.key); if (list.join("|") !== KEYS.join("|")) errors.push(`${task.id} deve declarar checklist canônico ${KEYS.join(", ")} nessa ordem.`); const visual = task.checklist.find((item) => item.key === "VISUAL"); if (!visual) errors.push(`${task.id} exige a etapa VISUAL antes de EVIDENCE.`); else { const notApplicable = /n(?:ão|ao)\s+aplic(?:ável|avel)/i.test(visual.text); const visualChecks = [[/bord(?:a|as)/i, "bordas"], [/espaç|spacing/i, "espaçamentos"], [/marg(?:em|ens)|margin/i, "margens"], [/padding/i, "padding"], [/tipograf|font/i, "tipografia"]]; const missing = notApplicable ? [] : visualChecks.filter(([pattern]) => !pattern.test(visual.text)).map(([, label]) => label); if (missing.length) errors.push(`${task.id} deve conferir ${missing.join(", ")} no item VISUAL.`); } const open = task.checklist.filter((item) => !item.complete).map((item) => item.key); if (task.complete && open.length) errors.push(`${task.id} está concluída com itens de checklist abertos: ${open.join(", ")}.`); if (!task.complete && task.checklist.length && !open.length) errors.push(`${task.id} está aberta, mas todos os itens do checklist estão concluídos.`); const badTags = [...task.tags].filter((tag) => !allowed.has(tag)); if (badTags.length) errors.push(`${task.id} possui tags inválidas: ${badTags.sort().join(", ")}.`); if (["TEST", "CODE", "DOC", "OPS"].filter((tag) => task.tags.has(tag)).length !== 1) errors.push(`${task.id} deve possuir exatamente uma tag de tipo.`); if (task.tags.has("TDD") && !task.tags.has("TEST")) errors.push(`${task.id} usa TDD sem a tag TEST.`); if (task.tags.has("MIGRATION") && !task.tags.has("CODE") && !task.tags.has("OPS")) errors.push(`${task.id} usa MIGRATION sem a tag CODE ou OPS.`); if (task.tags.has("MIGRATION") && !MIGRATION_PATH.test(task.raw)) errors.push(`${task.id} deve apontar um arquivo versionado em um diretório de migrations.`); if (!/(?:[\w.-]+\/)+[\w.-]+|\b[\w.-]+\.(?:cs|feature|go|html|java|js|jsx|json|kt|md|php|py|rb|rs|sql|swift|ts|tsx|vue|yaml|yml)\b/i.test(task.raw)) errors.push(`${task.id} não declara caminho de arquivo exato.`); if (!task.refs.size) errors.push(`${task.id} não possui referência de especificação.`); const unknown = [...task.refs].filter((id) => !specIds.has(id)); if (unknown.length) errors.push(`${task.id} referencia IDs inexistentes: ${unknown.sort().join(", ")}.`); task.refs.forEach((id) => { if (specIds.has(id)) covered.add(id); }); const absent = [...task.depends].filter((id) => !byId.has(id)); if (absent.length) errors.push(`${task.id} depende de tarefas inexistentes: ${absent.sort().join(", ")}.`); if (task.depends.has(task.id)) errors.push(`${task.id} depende de si mesma.`); const unfinished = [...task.depends].filter((id) => byId.has(id) && !byId.get(id).complete); if (task.complete && unfinished.length) errors.push(`${task.id} está concluída com dependências abertas: ${unfinished.sort().join(", ")}.`); if (task.checklist.some((item) => item.complete) && unfinished.length) errors.push(`${task.id} possui progresso em checklist enquanto dependências estão abertas: ${unfinished.sort().join(", ")}.`); }
const schemaChangeTasks = tasks.filter((task) => !task.tags.has("TEST") && !task.tags.has("DOC") && SCHEMA_CHANGE_TASK.test(task.raw)); const migrationTasks = tasks.filter((task) => task.tags.has("MIGRATION")); if (schemaChangeTasks.length && !migrationTasks.length) errors.push(`O plano possui alteração estrutural de banco (${schemaChangeTasks.map((task) => task.id).join(", ")}) sem uma tarefa [MIGRATION].`);
const testTasks = tasks.filter((task) => task.tags.has("TEST"));
const codeTasks = tasks.filter((task) => task.tags.has("CODE"));
const dependencies = new Map(tasks.map((task) => [task.id, ancestors(task)]));
const sharesRefs = (left, right) => [...left.refs].some((id) => right.refs.has(id));
const explicitTdd = tasks.some((task) => task.tags.has("TDD"));
const tdd = testTasks.filter((task) => {
  if (/\.feature\b/i.test(task.description)) return false;
  if (explicitTdd) return task.tags.has("TDD");
  return /\btests?[\/_.]|\btest[_./]|\bspec[_./]/i.test(task.description) &&
    codeTasks.some((code) => dependencies.get(code.id).has(task.id) &&
      !dependencies.get(task.id).has(code.id) && sharesRefs(code, task));
});
const regression = testTasks.filter((task) => explicitTdd
  ? !task.tags.has("TDD")
  : !tdd.includes(task) && codeTasks.some((code) => dependencies.get(task.id).has(code.id)));
const primaryAc = (task) => [...task.refs].find((id) => id.startsWith("AC-"));
const acceptanceIds = ids(text, "AC");
const representedAcs = (predecessors) => new Set(predecessors.map(primaryAc).filter((id) => acceptanceIds.has(id)));
const required = [...specIds].filter((id) => !covered.has(id));
if (required.length) errors.push(`IDs da especificação sem tarefa: ${required.sort().join(", ")}.`);
const featureAcs = representedAcs(tdd);
for (const id of acceptanceIds) {
  if (!featureAcs.has(id)) errors.push(`${id} não possui tarefa TDD informada pelo BDD da spec.`);
}
if (featureAcs.size < MIN) errors.push(`A feature possui ${featureAcs.size} predecessor(es) TDD; mínimo exigido: ${MIN}.`);
for (const kind of ["US", "FR", "NFR"]) {
  for (const id of ids(text, kind)) {
    const count = representedAcs(tdd.filter((task) => task.refs.has(id))).size;
    if (count < MIN) errors.push(`${id} possui ${count} predecessor(es) TDD; mínimo exigido: ${MIN}.`);
  }
}
for (const task of codeTasks) {
  const matching = tdd.filter((candidate) =>
    dependencies.get(task.id).has(candidate.id) && sharesRefs(candidate, task));
  const count = representedAcs(matching).size;
  if (!count) errors.push(`${task.id} é CODE sem predecessor TDD cobrindo os mesmos IDs.`);
  else if (count < MIN) errors.push(`${task.id} possui ${count} predecessor(es) TDD rastreáveis; mínimo exigido: ${MIN}.`);
  if (plan === "Passed") {
    for (const candidate of matching.filter((item) => !item.complete)) {
      errors.push(`Plan Gate exige predecessor TDD ${candidate.id} concluído antes de ${task.id}.`);
    }
  }
}
const contract = metadata(text, "Evidence Contract");
if (contract === "1") verifyEvidence(path, status, errors);
else if (contract) errors.push(`Evidence Contract não suportado: ${contract}.`);
const result = { errors, warnings, status: plan, counts: { total: tasks.length, complete: tasks.filter((task) => task.complete).length, tdd: tdd.length, regression: regression.length, code: codeTasks.length, checklist_items: tasks.reduce((sum, task) => sum + task.checklist.length, 0), checklist_complete: tasks.reduce((sum, task) => sum + task.checklist.filter((item) => item.complete).length, 0), covered_spec_ids: covered.size, required_spec_ids: specIds.size } }; if (json) console.log(JSON.stringify(result, null, 2)); else { if (Object.keys(result.counts).length) console.log(`Contagens: ${Object.entries(result.counts).map(([key, value]) => `${key}=${value}`).join(" ")}`); errors.forEach((message) => console.log(`ERRO: ${message}`)); warnings.forEach((message) => console.log(`AVISO: ${message}`)); console.log(errors.length ? "RESULTADO: NOT READY" : plan !== "Passed" ? "RESULTADO: VALID DRAFT" : "RESULTADO: READY"); } process.exitCode = errors.length ? 1 : 0; }
