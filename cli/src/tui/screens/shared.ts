/**
 * Helpers shared by the Specsfy screens: swapping a panel's content after a
 * reload, naming gate and spec states with a color and a word, and the
 * empty and loading texts every screen shows the same way.
 */
import { TextRenderable, type BoxRenderable, type CliRenderer, type Renderable } from "@opentui/core";
import type { SpecFolder } from "../../domain/lifecycle.ts";
import { SPEC_FOLDERS } from "../../domain/lifecycle.ts";
import type { SpecSummary } from "../../core/overview.ts";
import type { StoreState } from "../store.ts";
import { glyphs, type Theme } from "../theme.ts";

/** Removes every child of `box` and adds `nodes`, destroying the old ones. */
export function replaceChildren(box: BoxRenderable, nodes: Renderable[]): void {
  for (const child of box.getChildren()) {
    box.remove(child);
    child.destroyRecursively();
  }
  for (const node of nodes) box.add(node);
}

/** Glyph, word and color of a gate value such as `Passed` or `Pending`. */
export function gateTone(theme: Theme, value: string): { text: string; color: string } {
  const normalized = value.trim().toLowerCase();
  if (normalized === "passed" || normalized === "approved") return { text: `${glyphs.ok} ${value}`, color: theme.ok };
  if (normalized === "failed" || normalized === "rejected" || normalized === "blocked") return { text: `${glyphs.error} ${value}`, color: theme.error };
  if (normalized === "missing" || normalized === "unknown") return { text: `${glyphs.pending} ${value}`, color: theme.textDim };
  return { text: `${glyphs.warn} ${value}`, color: theme.warn };
}

/** Human label of a state folder. */
export function folderLabel(folder: SpecFolder | "legacy"): string {
  if (folder === "legacy") return "Legacy (specs/specs)";
  if (folder === "in-progress") return "In progress";
  return folder.charAt(0).toUpperCase() + folder.slice(1);
}

/** State folders in lifecycle order, followed by `legacy`. */
export const FOLDER_ORDER: ReadonlyArray<SpecFolder | "legacy"> = [...SPEC_FOLDERS, "legacy"];

/** Groups specs by folder in lifecycle order, skipping empty folders. */
export function specsByFolder(specs: SpecSummary[]): Array<{ folder: SpecFolder | "legacy"; specs: SpecSummary[] }> {
  return FOLDER_ORDER.map((folder) => ({ folder, specs: specs.filter((spec) => spec.folder === folder) })).filter((group) => group.specs.length > 0);
}

/** One-line text of a store state that has no snapshot yet. */
export function stateText(renderer: CliRenderer, theme: Theme, state: StoreState): TextRenderable {
  if (state.status === "loading") return new TextRenderable(renderer, { content: "Loading project…", fg: theme.textDim });
  if (state.status === "error") return new TextRenderable(renderer, { content: `Unable to load the project: ${state.message}`, fg: theme.error, wrapMode: "word" });
  return new TextRenderable(renderer, { content: "Ready", fg: theme.ok });
}

/** Status line text for the top of a screen. */
export function storeStatus(state: StoreState): string {
  if (state.status === "loading") return "Loading…";
  if (state.status === "error") return `Error: ${state.message}`;
  return `Updated ${state.snapshot.loadedAt.toLocaleTimeString()}`;
}
