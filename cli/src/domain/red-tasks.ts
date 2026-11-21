/** Selects TDD preparation work before the Plan Gate passes. */
import { error } from "../app/errors.ts";
import { parseTasks } from "./progress.ts";
import { readHeaderField } from "./spec-header.ts";

const TDD_TAGS = /^T\d{3,}\s+((?:\[[^\]]+\]\s+)+)/u;
const DEPENDS = /\s+[—-]\s+Depends:\s*(.+?)\s*$/u;

/** Finds the first open TDD test with completed dependencies in section order. */
export function nextRedTask(content: string) {
  if (readHeaderField(content, "Formato") !== "Specsfy/2.0" ||
    readHeaderField(content, "Status") !== "Defined" ||
    readHeaderField(content, "Definition Gate") !== "Passed" ||
    readHeaderField(content, "Plan Gate") !== "Pending") {
    throw error.usage("--phase red requires a Specsfy/2.0 spec in Defined with Definition Gate Passed and Plan Gate Pending.");
  }

  const section = /^ {0,3}#{1,6}[ \t]+(?:14\.[ \t]+)?Tarefas[ \t]*\r?$/mu.exec(content);
  if (!section) throw error.usage("Section 14 (Tarefas) is missing from the spec.");
  const tasks = parseTasks(content, true);
  if (!tasks.length) throw error.usage("No tasks found in section 14.");
  const byId = new Map(tasks.map((task) => [task.id, task]));
  if (byId.size !== tasks.length) throw error.usage("Duplicate task IDs in section 14.");
  const tdd = tasks.filter(({ text }) => {
    const tags = TDD_TAGS.exec(text)?.[1];
    return tags?.includes("[TEST]") && tags.includes("[TDD]");
  });
  const open = tdd.filter((task) => !task.checked);
  const blocked: Array<{ id: string; waiting_for: string[]; line_number: number }> = [];
  const ready = [];
  const lines = content.split(/\r?\n/u);
  for (const task of open) {
    const depends = DEPENDS.exec(task.text)?.[1];
    if (!depends || !/^(?:none|T\d{3,}(?:\s*,\s*T\d{3,})*)$/iu.test(depends)) {
      throw error.usage(`${task.id} must declare Depends: none or a comma-separated list of task IDs.`);
    }
    const ids = depends.toLowerCase() === "none" ? [] : depends.toUpperCase().split(/\s*,\s*/u);
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length) throw error.usage(`${task.id} depends on unknown task IDs: ${missing.join(", ")}.`);
    const waiting = ids.filter((id) => !byId.get(id)!.checked).sort();
    if (waiting.length) {
      blocked.push({ id: task.id, waiting_for: waiting, line_number: task.line_number });
    } else if (!ready.length) {
      const next = task.items.find((item) => !item.checked);
      ready.push({
        id: task.id,
        line_number: task.line_number,
        line: lines[task.line_number - 1]!.trim(),
        progress: { complete: task.items.filter((item) => item.checked).length, total: task.items.length },
        next_item: next ? { key: next.key, line_number: next.line_number, text: next.text.replace(/^\*\*[A-Z]+\*\*:\s*/u, "") } : null,
      });
    }
  }
  return {
    state: !open.length ? "complete" : ready.length ? "ready" : "blocked",
    ready,
    blocked,
    complete_count: tdd.length - open.length,
    total_count: tdd.length,
  };
}
