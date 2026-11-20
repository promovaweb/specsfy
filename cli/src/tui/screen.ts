/**
 * Contract of a TUI screen (tab).
 *
 * Each screen lives in `screens/<id>.ts`, exports a `Screen` object and is
 * registered in `screens/index.ts`. The screen receives the renderer and the
 * theme on mount and returns the root renderable of its content. `onEnter`
 * and `onLeave` start and stop timers or subscriptions. The stub in
 * `template/screen/` shows the minimal skeleton.
 */
import type { CliRenderer, Renderable } from "@opentui/core";
import type { Theme } from "./theme.ts";

export interface ScreenContext {
  renderer: CliRenderer;
  theme: Theme;
  /** Switches the active tab by id. */
  goTo: (id: string) => void;
  /** Closes the TUI. */
  quit: () => void;
  /**
   * Asks for one line of text in the key bar. `onSubmit` receives the
   * trimmed text on Enter; Esc or an empty line cancels without calling it.
   */
  prompt: (label: string, onSubmit: (text: string) => void) => void;
}

export interface Screen {
  /** Stable identifier, used by `tui.initialTab` and `--tab`. */
  id: string;
  /** Short tab title. */
  title: string;
  /** Line shown under the tabs when the tab is focused. */
  description: string;
  /** Screen-specific key hints, shown in the bottom bar. */
  keys?: ReadonlyArray<{ key: string; action: string }>;
  /** Builds the content. Called once. */
  mount: (ctx: ScreenContext) => Renderable;
  /** Called when the tab is shown. */
  onEnter?: (ctx: ScreenContext) => void;
  /** Called when the tab is hidden. */
  onLeave?: (ctx: ScreenContext) => void;
  /** Keys handled by the screen itself. Returns `true` when consumed. */
  onKey?: (name: string, ctx: ScreenContext) => boolean;
  /**
   * Screens with a list implement it to support `/`: the host collects the
   * typed query and calls it on every change; an empty query clears it.
   */
  filter?: (query: string) => void;
}
