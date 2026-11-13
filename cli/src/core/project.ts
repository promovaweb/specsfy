/**
 * Project resolution shared by the CLI, the MCP server and the TUI.
 *
 * A Specsfy project is a directory with `specs/`, `.specsfy/` or a
 * `skills-lock.json`. `findProjectRoot` walks up from the given directory
 * until it finds one, so commands work from any subfolder. A Hub that keeps
 * several Git repositories as children is still one project when the root
 * holds `specs/` or `.specsfy/`.
 *
 * `resolveSpecPath` accepts the forms people and agents use: the folder
 * name (`0001-recover-password`), the number (`0001` or `1`), the slug
 * without the number (`recover-password`) or a path to `spec.md` or to its
 * folder.
 */
import { existsSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { error } from "../app/errors.ts";
import { scanSpecPaths } from "../domain/lifecycle.ts";

/** Markers that identify a project root, in priority order. */
export const PROJECT_MARKERS = ["specs", ".specsfy", "skills-lock.json"] as const;

/** Returns the first ancestor (inclusive) that holds a project marker. */
export function findProjectRoot(start: string = process.cwd()): string | undefined {
  let current = resolve(start);
  for (;;) {
    if (PROJECT_MARKERS.some((marker) => existsSync(join(current, marker)))) return current;
    const parent = dirname(current);
    if (parent === current) return undefined;
    current = parent;
  }
}

/**
 * Resolves the project directory of a command. An explicit `--project`
 * must exist; without it, the nearest root above the current directory is
 * used, falling back to the current directory itself.
 */
export function resolveProject(option?: string | boolean): string {
  if (typeof option === "string" && option.trim() !== "") {
    const path = resolve(option);
    if (!existsSync(path) || !statSync(path).isDirectory()) throw error.notFound(`Project directory not found: ${path}`);
    return findProjectRoot(path) ?? path;
  }
  return findProjectRoot() ?? process.cwd();
}

/** Short form of a spec folder name, used in matches: `0001-slug` → `{ number: 1, slug: "slug" }`. */
function parseFolderName(name: string): { number?: number; slug: string } {
  const match = /^(\d+)-(.+)$/.exec(name);
  return match ? { number: Number(match[1]), slug: match[2]! } : { slug: name };
}

/** Resolves a spec identifier to the absolute path of its `spec.md`. */
export async function resolveSpecPath(project: string, identifier: string): Promise<string> {
  const value = identifier.trim();
  if (!value) throw error.usage("Provide a spec identifier: folder name, number, slug or path.");
  const direct = resolve(project, value);
  if (existsSync(direct)) {
    if (statSync(direct).isDirectory() && existsSync(join(direct, "spec.md"))) return join(direct, "spec.md");
    if (statSync(direct).isFile()) return direct;
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
