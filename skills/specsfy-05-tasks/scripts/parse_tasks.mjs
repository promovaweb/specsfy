/** Projeta tarefas e checklists, separando anotações sem alterar a spec. */
export function parseTasks(text) {
  const tasks = [], orphans = [], others = [];
  let active = null, fence = null;
  const hasSection = /^#{1,6}\s+14\.\s+Tarefas\s*$/mu.test(text);
  let inTasks = !hasSection;
  for (const [index, line] of text.split(/\r?\n/u).entries()) {
    const delimiter = /^\s{0,3}(`{3,}|~{3,})/u.exec(line)?.[1];
    if (delimiter) {
      if (!fence) fence = delimiter;
      else if (delimiter[0] === fence[0] && delimiter.length >= fence.length && line.trim() === delimiter) fence = null;
      continue;
    }
    if (fence) continue;
    if (/^#{1,6}\s/u.test(line)) {
      active = null;
      if (hasSection && /^#{1,6}\s+\d+\./u.test(line)) inTasks = /^#{1,6}\s+14\.\s+Tarefas\s*$/u.test(line);
    }
    const task = inTasks && /^\s*- \[([ xX])\] (T\d{3,})\s+(.+?)[—-] Refs:\s*(.+?)\s+[—-] Depends:\s*(.+?)\s*$/u.exec(line);
    const indent = line.length - line.trimStart().length;
    if (task) {
      active = { complete: task[1].toLowerCase() === 'x', id: task[2], depends: task[5].toLowerCase() === 'none' ? [] : [...task[5].matchAll(/\bT\d{3,}\b/g)].map(item => item[0]), checklist: [], indent };
      tasks.push(active);
      continue;
    }
    const item = /^\s*[-*+]\s*\[([ xX])\]\s+(.+?)\s*$/u.exec(line);
    if (!item) continue;
    const cycle = /^\*\*(PREP|EXECUTE|VERIFY|VISUAL|EVIDENCE|IMPROVE)\*\*:\s*(.*)$/u.exec(item[2]);
    const complete = item[1].toLowerCase() === 'x';
    if (cycle && inTasks && active && indent > active.indent) active.checklist.push({ name: cycle[1], description: cycle[2], complete });
    else { others.push({ complete, line: index + 1 }); if (cycle) orphans.push(index + 1); }
    if (active && indent <= active.indent) active = null;
  }
  return { tasks, orphans, others };
}

/** Lê tarefas e checklists da seção 14 para os gates de spec e de tarefas. */
function taskSection(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => /^#{1,6}\s+(?:14\.\s+)?Tarefas\s*$/i.test(line));
  if (start < 0) return null;
  const level = lines[start].match(/^#+/)[0].length;
  const closingHeading = new RegExp(`^#{1,${level}}\\s`);
  const end = lines.findIndex((line, index) => index > start && closingHeading.test(line));
  return { lines: lines.slice(start + 1, end < 0 ? undefined : end), start };
}

export function parseGateTasks(text, errors = []) {
  const section = taskSection(text);
  if (!section) {
    errors.push("Seção rígida 14. Tarefas ausente.");
    return [];
  }

  const tasks = [];
  let active;
  for (const [offset, raw] of section.lines.entries()) {
    const line = section.start + offset + 2;
    const task = raw.match(/^\s*-\s+\[([ xX])\]\s+(T\d{3,})\s+(.+)$/);
    if (task) {
      const [, checked, id, content] = task;
      const contract = content.match(/\s+[—-]\s+Refs:\s*(.*?)\s+[—-]\s+Depends:\s*(.+?)\s*$/);
      if (!contract) errors.push(`Linha ${line} (${id}) não segue '— Refs: ... — Depends: ...'.`);
      const prefix = content.match(/^(?:\[[A-Z]+(?:-\d{3,})?\][ \t]+)+/)?.[0] ?? "";
      active = {
        id,
        complete: checked.toLowerCase() === "x",
        raw,
        description: content.slice(prefix.length, contract?.index),
        tags: new Set([...prefix.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1])),
        refs: new Set(contract?.[1].match(/\b(?:US|AC|FR|NFR)-\d{3,}\b/g)),
        depends: new Set(contract?.[2].match(/\bT\d{3,}\b/g)),
        line,
        checklist: [],
      };
      tasks.push(active);
      continue;
    }

    const checklist = raw.match(/^\s{2,}-\s+\[([ xX])\]\s+\*\*(PREP|EXECUTE|VERIFY|VISUAL|EVIDENCE|IMPROVE)\*\*:\s+(.+?)\s*$/);
    if (checklist && active) {
      active.checklist.push({ key: checklist[2], complete: checklist[1].toLowerCase() === "x", text: checklist[3], line });
    } else if (/^\s{2,}-\s+\[[ xX]\]\s+/.test(raw) && active) {
      errors.push(`Linha ${line} (${active.id}) possui item de checklist fora do formato canônico.`);
    }
  }
  return tasks;
}
