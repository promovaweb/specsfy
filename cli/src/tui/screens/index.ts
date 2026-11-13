/**
 * TUI screen registry, in tab order.
 *
 * `createScreens` builds a fresh set of screens for one TUI instance, bound
 * to the project store, so two mounts (or two tests) never share selection
 * or renderables. `SCREEN_IDS` lists the stable ids accepted by
 * `tui.initialTab` and `tui --tab`. To add a tab: create
 * `screens/<id>.ts`, append it here and to `SCREEN_IDS`, and update the
 * setting and the command option.
 */
import { aboutScreen } from "./about.ts";
import { createOverviewScreen } from "./overview.ts";
import { createSpecsScreen, type SpecFocus } from "./specs.ts";
import { createBacklogScreen } from "./backlog.ts";
import { createGatesScreen } from "./gates.ts";
import { createTestsScreen } from "./tests.ts";
import { createSkillsScreen } from "./skills.ts";
import { createProjectStore, type ProjectStore } from "../store.ts";
import { defaultServices } from "../services.ts";
import type { Screen } from "../screen.ts";

/** Stable tab ids, in tab order. */
export const SCREEN_IDS = ["overview", "specs", "backlog", "gates", "tests", "skills", "about"] as const;

/** Builds the screens of one TUI instance. */
export function createScreens(store: ProjectStore): Screen[] {
  const focus: SpecFocus = {};
  return [
    createOverviewScreen(store),
    createSpecsScreen(store, focus),
    createBacklogScreen(store),
    createGatesScreen(store, focus),
    createTestsScreen(store),
    createSkillsScreen(store),
    aboutScreen,
  ];
}

/**
 * Default screen set bound to an idle store (never started, so it reads
 * nothing). Used by `scripts/check-docs.ts` to list ids and titles;
 * `mountTui` always builds its own set with `createScreens`.
 */
export const screens: readonly Screen[] = createScreens(createProjectStore(process.cwd(), defaultServices()));
