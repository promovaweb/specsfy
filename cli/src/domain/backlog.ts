/**
 * Leitura dos itens de backlog de um projeto consumidor.
 */

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { isFile, resolvePath } from "./filesystem.ts";

const FIELD = /^\*\*([^*]+)\*\*:\s*(.+?)\s*$/;
const TABLE_FIELD = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/;

/** Projeção de um arquivo em `specs/backlog/`. */
export interface BacklogItem {
  slug: string;
  title: string;
  identifier: string;
  status: string;
  path: string;
  content: string;
}

/** Lê todos os backlogs do projeto em ordem estável. */
export async function scanBacklogs(project: string): Promise<BacklogItem[]> {
  const root = resolvePath(project);
  return Promise.all((await backlogPaths(root)).map(parseBacklog));
}

/** Calcula o fingerprint dos caminhos e conteúdos de backlog. */
export async function backlogsFingerprint(project: string): Promise<string> {
  const root = resolvePath(project);
  const digest = createHash("sha256");
  for (const path of await backlogPaths(root)) {
    digest.update(relative(root, path));
    digest.update("\0");
    try {
      digest.update(await readFile(path));
    } catch {
      continue;
    }
    digest.update("\0");
  }
  return digest.digest("hex");
}

async function backlogPaths(root: string): Promise<string[]> {
  const directory = join(root, "specs", "backlog");
  let names: string[];
  try {
    names = await readdir(directory);
  } catch {
    return [];
  }
  const paths = names
    .filter((name) => name.endsWith(".md"))
    .map((name) => join(directory, name));
  const checks = await Promise.all(paths.map(isFile));
  return paths.filter((_, index) => checks[index]).sort();
}

async function parseBacklog(path: string): Promise<BacklogItem> {
  const content = await readFile(path, "utf8");
  const slug = basename(path, ".md");
  let title = slug;
  const fields = new Map<string, string>();
  for (const line of content.split(/\r?\n/u)) {
    if (line.startsWith("# ") && title === slug) {
      title = line.slice(2).trim();
      if (title.toLowerCase().startsWith("backlog:")) {
        title = title.split(":", 2)[1]?.trim() ?? title;
      }
    }
    const match = FIELD.exec(line) ?? TABLE_FIELD.exec(line);
    if (match?.[1] && match[2]) {
      fields.set(match[1].trim().toLowerCase(), match[2].trim());
    }
  }
  return {
    slug,
    title,
    identifier: fields.get("id") ?? slug,
    status: fields.get("status") ?? "Unknown",
    path,
    content,
  };
}
