#!/usr/bin/env node
/** Renderiza um resumo de entrega para stdout, sem criar uma nova fonte. */

import { readFile } from "node:fs/promises";

function metadata(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`^\\|\\s*${escaped}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "im"));
  return match ? match[1].trim() : "Unknown";
}

function ids(text) {
  return [...new Set([...text.matchAll(/(?:^\s*-\s+\*\*|^#{4,6}\s+)((?:FR|NFR|AC)-\d{3,})\b/gm)].map((match) => match[1]))].sort();
}

function build(text, preview) {
  const gates = {
    definition: metadata(text, "Definition Gate"),
    plan: metadata(text, "Plan Gate"),
    delivery: metadata(text, "Delivery Gate"),
  };
  const tasks = [...text.matchAll(/^-\s+\[([ xX])\]\s+(T\d{3,})\b(.+)$/gm)].map((match) => ({
    id: match[2], complete: match[1].toLowerCase() === "x", summary: match[3].trim(),
  }));
  const risks = text.match(/^####\s+Riscos\s*$\n([\s\S]*?)(?=^####\s+|^###\s+|$)/m);
  const evidence = [...text.matchAll(/^\s*<!--\s*specsfy:evidence\s+(\{.*\})\s*-->\s*$/gm)]
    .flatMap((match) => { try { return [JSON.parse(match[1])]; } catch { return []; } })
    .sort((left, right) => String(left.task ?? "").localeCompare(String(right.task ?? "")));
  return {
    schema_version: 1, preview, status: metadata(text, "Status"), gates,
    delivered_ids: ids(text), tasks, evidence,
    risks_and_rollback: risks ? risks[1].trim() : "",
  };
}

function markdown(payload) {
  const lines = [
    "# Resumo de entrega Specsfy", "", `- Status: ${payload.status}`,
    `- Definition Gate: ${payload.gates.definition}`, `- Plan Gate: ${payload.gates.plan}`,
    `- Delivery Gate: ${payload.gates.delivery}`, "", "## IDs entregues", "",
    payload.delivered_ids.join(", ") || "Nenhum.", "", "## Tarefas", "",
    ...payload.tasks.map((task) => `- [${task.complete ? "x" : " "}] ${task.id}${task.summary}`),
    "", "## Evidências", "",
    ...payload.evidence.map((item) => `- ${item.task ?? "sem task"}: ${(item.commands ?? []).filter((command) => command && typeof command === "object").map((command) => String(command.run ?? "")).join(", ")}`),
    "", "## Riscos e rollback", "", payload.risks_and_rollback || "Nenhum risco/rollback registrado.",
  ];
  return lines.join("\n");
}

function parseArgs(argv) {
  const [spec, ...options] = argv;
  const format = options.includes("--format") ? options[options.indexOf("--format") + 1] : "markdown";
  return { spec, format, preview: options.includes("--preview") };
}

const { spec, format, preview } = parseArgs(process.argv.slice(2));
if (!spec || !["markdown", "json"].includes(format)) {
  console.error("Uso: node render_delivery.mjs <spec> [--format markdown|json] [--preview]");
  process.exitCode = 2;
} else {
  try {
    const payload = build(await readFile(spec, "utf8"), preview);
    const openTasks = payload.tasks.filter((task) => !task.complete).map((task) => task.id);
    if (!preview && (payload.gates.delivery !== "Passed" || openTasks.length > 0)) {
      const error = "resumo final exige Delivery Gate Passed e nenhuma tarefa aberta";
      if (format === "json") console.log(JSON.stringify({ ...payload, result: "failed", errors: [error] }, null, 2));
      else console.error(`ERRO: ${error}`);
      process.exitCode = 1;
    } else {
      const result = { ...payload, result: "passed", errors: [] };
      console.log(format === "json" ? JSON.stringify(result, null, 2) : markdown(result));
    }
  } catch (error) {
    console.error("ERRO: spec inexistente.");
    process.exitCode = 2;
  }
}
