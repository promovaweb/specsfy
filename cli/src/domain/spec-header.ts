/** Reads canonical metadata from the first table of a spec. */
const HEADER_ROW = /^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/u;

/** Reads only the first table before the sections, ignoring fenced examples. */
export function readHeaderField(content: string, field: string): string | undefined {
  const matches: string[] = [];
  let inTable = false;
  let fence: { marker: string; length: number } | undefined;
  for (const line of content.split(/\r?\n/u)) {
    const delimiter = /^\s{0,3}(`{3,}|~{3,})(.*)$/u.exec(line);
    if (delimiter) {
      if (!fence) fence = { marker: delimiter[1]![0]!, length: delimiter[1]!.length };
      else if (delimiter[1]![0] === fence.marker && delimiter[1]!.length >= fence.length && !delimiter[2]!.trim()) fence = undefined;
      continue;
    }
    if (fence) continue;
    if (/^\s{0,3}#{2,6}\s/u.test(line)) break;
    const row = HEADER_ROW.exec(line);
    if (!row) {
      if (inTable) break;
      continue;
    }
    inTable = true;
    if (row[1]!.trim().toLowerCase() === field.toLowerCase()) matches.push(row[2]!.trim());
  }
  return matches.length === 1 ? matches[0] : undefined;
}

