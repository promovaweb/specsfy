#!/usr/bin/env node
/** Seleciona tarefas prontas na seção 14 do spec.md integrado. */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

/** A próxima tarefa só é elegível após cumprir todas as etapas nesta ordem. */
const CHECKLIST_KEYS = ["PREP", "EXECUTE", "VERIFY", "VISUAL", "EVIDENCE", "IMPROVE"];
const metadata = (text, key) => text.match(new RegExp(`^\\|\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "im"))?.[1].trim();

function taskSection(text) {
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!heading || heading[2].replace(/^\d+\.\s+/, "").trim().toLowerCase() !== "tarefas") continue;
    const level = heading[1].length;
    const body = [];
    for (const line of lines.slice(index + 1)) {
      const next = line.match(/^(#{1,6})\s+/);
      if (next && next[1].length <= level) break;
      body.push(line);
    }
    return { body, start: index + 1 };
  }
  return null;
}

function parse(text) {
  const errors = [];
  if (metadata(text, "Formato") !== "Specsfy/2.0") errors.push("spec.md não declara Formato | Specsfy/2.0 no cabeçalho.");
  if (metadata(text, "Definition Gate") !== "Passed") errors.push("Definition Gate precisa estar Passed.");
  if (metadata(text, "Plan Gate") !== "Passed") errors.push("Plan Gate precisa estar Passed.");
  if (!["Planned", "Implementing", "Reviewing", "Complete"].includes(metadata(text, "Status"))) errors.push("Status precisa ser Planned, Implementing, Reviewing ou Complete.");
  const section = taskSection(text);
  if (!section) return { tasks: [], errors: [...errors, "Seção 14. Tarefas ausente."] };
  const tasks = []; let active;
  section.body.forEach((line, index) => {
    const task = line.match(/^\s*-\s+\[([ xX])\]\s+(T\d{3,})\s+(.+)$/);
    if (task) {
      const dependency = task[3].match(/\s+[—-]\s+Depends:\s*(.+?)\s*$/);
      const depends = !dependency ? (errors.push(`${task[2]} não declara Depends.`), []) : dependency[1].trim().toLowerCase() === "none" ? [] : [...dependency[1].matchAll(/\bT\d{3,}\b/g)].map((item) => item[0]);
      active = { id: task[2], complete: task[1].toLowerCase() === "x", depends: new Set(depends), line: line.trim(), line_number: section.start + index + 1, checklist: [] };
      tasks.push(active); return;
    }
    if (/^#{1,6}\s+/.test(line)) { active = undefined; return; }
    const item = line.match(/^\s{2,}-\s+\[([ xX])\]\s+\*\*(PREP|EXECUTE|VERIFY|VISUAL|EVIDENCE|IMPROVE)\*\*:\s+(.+?)\s*$/);
    if (item && active) active.checklist.push({ key: item[2], complete: item[1].toLowerCase() === "x", text: item[3].trim(), line_number: section.start + index + 1 });
    else if (/^\s{2,}-\s+\[[ xX]\]\s+/.test(line) && active) errors.push(`${active.id} possui item de checklist fora do formato canônico.`);
  });
  if (new Set(tasks.map((task) => task.id)).size !== tasks.length) errors.push("A seção 14 contém IDs de tarefa duplicados.");
  for (const task of tasks) {
    const keys = task.checklist.map((item) => item.key);
    if (keys.join("|") !== CHECKLIST_KEYS.join("|")) errors.push(`${task.id} deve declarar checklist canônico ${CHECKLIST_KEYS.join(", ")} nessa ordem.`);
    const open = task.checklist.filter((item) => !item.complete).map((item) => item.key);
    if (task.complete && open.length) errors.push(`${task.id} está concluída com checklist aberto: ${open.join(", ")}.`);
    if (!task.complete && !open.length) errors.push(`${task.id} está aberta, mas seu checklist está concluído.`);
  }
  return { tasks, errors };
}

const args = process.argv.slice(2); const spec = args.find((item) => !item.startsWith("--")); const all = args.includes("--all"); const json = args.includes("--json");
if (!spec || !existsSync(spec)) { console.error(`ERRO: arquivo não encontrado: ${spec ? resolve(spec) : ""}`); process.exitCode = 2; }
else {
  const text = await readFile(spec, "utf8"); const { tasks, errors } = parse(text);
  if (!tasks.length) errors.push("Nenhuma tarefa encontrada na seção 14.");
  const status = metadata(text, "Status");
  if (tasks.length && tasks.every((task) => task.complete)) {
    if (metadata(text, "Delivery Gate") !== "Passed") errors.push("Todas as tarefas estão concluídas, mas Delivery Gate precisa estar Passed.");
    if (status !== "Complete") errors.push("Todas as tarefas estão concluídas, mas Status precisa estar Complete.");
  } else if (status === "Complete") errors.push("Status Complete é inválido enquanto existirem tarefas abertas.");
  const byId = new Map(tasks.map((task) => [task.id, task]));
  for (const task of tasks) {
    const unknown = [...task.depends].filter((id) => !byId.has(id));
    if (unknown.length) errors.push(`${task.id} depende de IDs inexistentes: ${unknown.sort().join(", ")}.`);
    const waiting = [...task.depends].filter((id) => byId.has(id) && !byId.get(id).complete);
    if (task.checklist.some((item) => item.complete) && waiting.length) errors.push(`${task.id} possui progresso em checklist enquanto aguarda ${waiting.sort().join(", ")}.`);
  }
  if (errors.length) { errors.forEach((error) => console.error(`ERRO: ${error}`)); process.exitCode = 2; }
  else {
    const completed = new Set(tasks.filter((task) => task.complete).map((task) => task.id));
    const open = tasks.filter((task) => !task.complete); const ready = open.filter((task) => [...task.depends].every((id) => completed.has(id)));
    const selected = all ? ready : ready.slice(0, 1);
    const blocked = open.filter((task) => !ready.includes(task)).map((task) => ({ id: task.id, waiting_for: [...task.depends].filter((id) => !completed.has(id)).sort(), line_number: task.line_number }));
    const view = (task) => { const next = task.checklist.find((item) => !item.complete); return { id: task.id, line_number: task.line_number, line: task.line, progress: { complete: task.checklist.filter((item) => item.complete).length, total: task.checklist.length }, next_item: next ? { key: next.key, line_number: next.line_number, text: next.text } : null }; };
    const result = { state: !open.length ? "complete" : ready.length ? "ready" : "blocked", ready: selected.map(view), blocked, complete_count: completed.size, total_count: tasks.length };
    if (json) console.log(JSON.stringify(result, null, 2));
    else { console.log(`Estado: ${result.state} (${completed.size}/${tasks.length} concluídas)`); selected.forEach((task) => { const next = task.checklist.find((item) => !item.complete); console.log(`PRÓXIMA: linha ${task.line_number}: ${task.line}`); console.log(`Progresso: ${task.checklist.filter((item) => item.complete).length}/${task.checklist.length}`); if (next) console.log(`PRÓXIMO ITEM: ${task.id} ${next.key} (linha ${next.line_number}): ${next.text}`); }); blocked.forEach((task) => console.log(`BLOQUEADA: ${task.id} aguarda ${task.waiting_for.join(", ")}`)); }
    process.exitCode = result.state === "blocked" ? 1 : 0;
  }
}
