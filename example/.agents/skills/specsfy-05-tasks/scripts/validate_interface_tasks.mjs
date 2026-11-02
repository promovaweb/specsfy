#!/usr/bin/env node
/** Valida a fase de interface exigida para specs com tela usada por pessoas. */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const input = process.argv.slice(2).find((argument) => !argument.startsWith("--"));

if (!input || !existsSync(input)) {
  console.error(`ERRO: Arquivo não encontrado: ${input ?? ""}`);
  process.exitCode = 1;
} else {
  const text = await readFile(input, "utf8");
  const hasInterface = /^\|\s*Interface para pessoas\s*\|\s*Sim\b/im.test(text);
  const errors = [];

  if (hasInterface) {
    const taskStart = text.search(/^###\s+14\.\s+Tarefas[ \t]*$/im);
    const taskTail = taskStart < 0 ? "" : text.slice(taskStart);
    const taskEnd = taskTail.search(/^###\s+15\.\s+/im);
    const tasks = taskTail.slice(0, taskEnd < 0 ? undefined : taskEnd);
    const screens = text.match(/^####\s+Telas e responsabilidades[ \t]*$([\s\S]*?)(?=^####|^###)/im)?.[1] ?? "";
    const blocks = text.match(/^####\s+Blocos React e componentes selecionados[ \t]*$([\s\S]*?)(?=^####|^###)/im)?.[1] ?? "";
    const screenCount = [...screens.matchAll(/^\s*-\s+.+$/gm)].length;
    const phase = tasks.match(/^####\s+Fase de interface[ \t]*$([\s\S]*?)(?=^####|^###|(?![\s\S]))/im)?.[1];
    const taskCount = phase ? [...phase.matchAll(/^\s*-\s+\[[ xX]\]\s+T\d{3,}\b/gm)].length : 0;

    if (!phase) errors.push("Interface para pessoas exige a subseção 'Fase de interface' na seção 14.");
    if (!taskCount) errors.push("Fase de interface exige ao menos uma tarefa de tela, formulário ou interação.");
    if (!blocks.trim()) errors.push("Interface para pessoas exige a lista de blocos React e componentes selecionados na seção 10.");
    if (phase && !phase.includes("INTERFACE.md")) errors.push("Fase de interface deve atualizar INTERFACE.md com os blocos e componentes usados.");
    if (screenCount && taskCount < screenCount) {
      errors.push(`Fase de interface possui ${taskCount} tarefa(s) para ${screenCount} tela(s) registrada(s).`);
    }
  }

  errors.forEach((error) => console.error(`ERRO: ${error}`));
  if (!errors.length) console.log("Interface nas tarefas: OK");
  process.exitCode = errors.length ? 1 : 0;
}
