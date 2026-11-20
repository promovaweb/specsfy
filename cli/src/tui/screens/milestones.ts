/**
 * Milestones tab: the milestones of `specs/milestones/` with their Markdown.
 *
 * Each `<ID>.md` file is a row; the preview shows the whole file, including
 * the progress block that `specsfy milestones sync` derives from specs and
 * backlog. `s` rebuilds those blocks after confirmation, the same as the
 * command, and reloads. Nothing else is written.
 */
import { BoxRenderable } from "@opentui/core";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { actionBar, markdownStyle, markdownView, selectList, type SelectItem, listWidth } from "../components.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore } from "../store.ts";
import { errorMessage } from "../store.ts";
import { syncMilestones } from "../../domain/milestones.ts";

const FOLDER = join("specs", "milestones");

/** Lists `specs/milestones/*.md` as list rows, in name order. */
async function milestoneItems(project: string, read: (path: string) => Promise<string>): Promise<SelectItem[]> {
  let names: string[];
  try {
    names = (await readdir(join(project, FOLDER))).filter((name) => name.endsWith(".md")).sort();
  } catch {
    return [];
  }
  return Promise.all(names.map(async (name) => {
    const path = join(FOLDER, name);
    const content = await read(join(project, path)).catch(() => "");
    const title = /^#\s+(.+)$/mu.exec(content)?.[1]?.trim() ?? name.replace(/\.md$/u, "");
    const percent = /(\d+(?:[.,]\d+)?)\s*%/u.exec(content.split("specsfy:milestone-progress:start")[1] ?? "")?.[1];
    return { id: path, label: `${title}${percent ? `  ${percent}%` : ""}` };
  }));
}

/** Creates the Milestones screen. */
export function createMilestonesScreen(store: ProjectStore): Screen {
  let list: ReturnType<typeof selectList> | undefined;
  let reader: ReturnType<typeof markdownView> | undefined;
  let actions: ReturnType<typeof actionBar> | undefined;
  let refresh: () => void = () => {};
  return {
    id: "milestones",
    title: "Milestones",
    description: "Milestones of specs/milestones/ with their progress",
    keys: [
      { key: "↑/↓", action: "milestone" },
      { key: "PgUp/PgDn", action: "scroll" },
      { key: "s", action: "sync" },
    ],
    mount: ({ renderer, theme }) => {
      const screenBox = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1 });
      const rootBox = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      actions = actionBar(renderer, theme);
      const style = markdownStyle(renderer, theme);
      reader = markdownView(renderer, theme, { title: "Milestone", style });
      let generation = 0;
      const preview = (item: SelectItem | undefined) => {
        const mine = ++generation;
        if (!item) {
          reader?.setTitle("Milestone");
          reader?.setMarkdown("No milestones in specs/milestones/. Plan them with `$specsfy-milestones`.");
          return;
        }
        reader?.setTitle(item.id);
        store.services.readText(join(store.project, item.id)).then(
          // The HTML markers of the derived block are for tools, not for reading.
          (content) => { if (mine === generation) reader?.setMarkdown(content.replace(/<!--[\s\S]*?-->\n?/gu, "")); },
          (error) => { if (mine === generation) reader?.setMarkdown(`Unable to read the file: ${errorMessage(error)}`); },
        );
      };
      list = selectList(renderer, theme, { title: "Milestones", emptyText: "No milestones yet", active: true, width: listWidth(renderer, 46), onChange: preview });
      rootBox.add(list.box);
      rootBox.add(reader.box);
      screenBox.add(rootBox);
      screenBox.add(actions.box);
      refresh = () => {
        void milestoneItems(store.project, store.services.readText).then((items) => {
          list?.setItems(items);
          if (!list?.selected()) preview(undefined);
        });
      };
      refresh();
      const unsubscribe = store.subscribe(() => refresh());
      renderer.once("destroy", () => { unsubscribe(); generation += 1; style.destroy(); list = undefined; reader = undefined; actions = undefined; });
      return screenBox;
    },
    filter: (query) => list?.setFilter(query),
    onKey: (name) => {
      if (actions?.handleKey(name)) return true;
      switch (name) {
        case "up": case "k": list?.move(-1); return true;
        case "down": case "j": list?.move(1); return true;
        case "pageup": reader?.scroll(-10); return true;
        case "pagedown": reader?.scroll(10); return true;
        case "s":
          actions?.ask("Rebuild the progress of every milestone from specs and backlog", () => {
            actions?.message("Syncing…");
            syncMilestones(store.project).then(
              (result) => { actions?.message(`${result.milestones.length} milestone(s) synced`, "ok"); refresh(); },
              (error) => actions?.message(errorMessage(error), "error"),
            );
          });
          return true;
        default: return false;
      }
    },
  };
}
