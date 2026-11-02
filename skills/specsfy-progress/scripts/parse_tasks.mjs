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
