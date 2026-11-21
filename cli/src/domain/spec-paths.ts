/** Discovers spec layouts and resolves public spec selectors to file paths. */
import { existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { error } from "../app/errors.ts";
import { isFile, resolvePath } from "./filesystem.ts";

export const SPEC_FOLDERS = [
  "draft",
  "defined",
  "planned",
  "in-progress",
  "review",
  "completed",
] as const;

export type SpecFolder = (typeof SPEC_FOLDERS)[number];

/** Lists spec paths of every layout the framework accepts. */
export async function scanSpecPaths(project: string): Promise<string[]> {
  return findSpecPaths(resolvePath(project));
}

/** Short form of a spec folder name, used in matches: `0001-slug` → `{ number: 1, slug: "slug" }`. */
function parseFolderName(name: string): { number?: number; slug: string } {
  const match = /^(\d+)-(.+)$/.exec(name);
  return match ? { number: Number(match[1]), slug: match[2]! } : { slug: name };
}

/** True when `path` is `root` itself or lies inside it. */
export function isInside(root: string, path: string): boolean {
  const rel = relative(resolve(root), resolve(path));
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

/**
 * Resolves a spec identifier to the absolute path of its `spec.md`. A path
 * form must point to a `spec.md` (or its folder) inside the project's
 * `specs/`; anything else is NOT_FOUND, so MCP tools never read or write
 * files elsewhere on the disk.
 */
export async function resolveSpecPath(project: string, identifier: string): Promise<string> {
  const value = identifier.trim();
  if (!value) throw error.usage("Provide a spec identifier: folder name, number, slug or path.");
  const direct = resolve(project, value);
  if (existsSync(direct) && isInside(join(project, "specs"), direct)) {
    if (statSync(direct).isDirectory() && existsSync(join(direct, "spec.md"))) return join(direct, "spec.md");
    if (statSync(direct).isFile() && basename(direct) === "spec.md") return direct;
  }
  const paths = await scanSpecPaths(project);
  const byFolder = paths.filter((path) => basename(dirname(path)) === value);
  if (byFolder.length === 1) return byFolder[0]!;
  const wanted = parseFolderName(value);
  const numeric = /^\d+$/.test(value) ? Number(value) : undefined;
  const matches = paths.filter((path) => {
    const folder = parseFolderName(basename(dirname(path)));
    if (numeric !== undefined) return folder.number === numeric;
    return folder.slug === wanted.slug && (wanted.number === undefined || folder.number === wanted.number);
  });
  if (matches.length === 1) return matches[0]!;
  if (matches.length > 1) {
    throw error.usage(`More than one spec matches "${value}". Use the full folder name.`, {
      matches: matches.map((path) => basename(dirname(path))),
    });
  }
  throw error.notFound(`Spec not found: ${value}`, { project });
}

async function findSpecPaths(root: string): Promise<string[]> {
  const current = await Promise.all(
    SPEC_FOLDERS.map(async (folder) => listSpecPaths(join(root, "specs", folder))),
  );
  return [...current.flat(), ...(await findLegacySpecPaths(root))].sort();
}

/** Lists specs in either legacy layout. */
export async function findLegacySpecPaths(root: string): Promise<string[]> {
  const parents = [join(root, "specs", "specs")];
  const directPaths: string[] = [];
  const direct = join(root, "specs");
  try {
    for (const entry of await readdir(direct, { withFileTypes: true })) {
      if (entry.isDirectory() && !SPEC_FOLDERS.includes(entry.name as SpecFolder) &&
        !["inbox", "backlog", "specs"].includes(entry.name)) {
        const path = join(direct, entry.name, "spec.md");
        if (await isFile(path)) directPaths.push(path);
      }
    }
  } catch {
    return [];
  }
  return [...directPaths, ...(await Promise.all(parents.map(listSpecPaths))).flat()].sort();
}

async function listSpecPaths(parent: string): Promise<string[]> {
  try {
    const entries = await readdir(parent, { withFileTypes: true });
    const candidates = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(parent, entry.name, "spec.md"));
    const available = await Promise.all(candidates.map(async (path) => ({ path, ok: await isFile(path) })));
    return available.filter((entry) => entry.ok).map((entry) => entry.path);
  } catch {
    return [];
  }
}
