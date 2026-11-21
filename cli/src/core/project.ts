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
import { dirname, join, resolve } from "node:path";
import { error } from "../app/errors.ts";
export { isInside, resolveSpecPath } from "../domain/spec-paths.ts";

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
