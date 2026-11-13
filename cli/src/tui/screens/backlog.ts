/**
 * Backlog tab: backlog items and inbox captures on the left, Markdown
 * preview of the selected file on the right.
 *
 * Backlog items come from `specs/backlog/`, captures from `specs/inbox/`
 * (processed captures are listed dimmed, with their state in text). Up/Down
 * (or j/k) change the selection, PgUp/PgDn scroll the preview and `r`
 * reloads. The selection is kept by file path across automatic reloads.
 */
import { BoxRenderable } from "@opentui/core";
import type { ProjectOverview } from "../../core/overview.ts";
import { selectList, markdownView, markdownStyle, fit, type SelectItem } from "../components.ts";
import type { Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore, StoreState } from "../store.ts";
import { errorMessage } from "../store.ts";
import { projectFile } from "../services.ts";

/** List rows of the backlog and the inbox. */
export function backlogItems(theme: Theme, overview: ProjectOverview): SelectItem[] {
  const items: SelectItem[] = [{ id: "header:backlog", label: `Backlog · ${overview.backlog.length}`, header: true }];
  for (const item of overview.backlog) {
    items.push({ id: item.path, label: `${fit(item.title, 26)} [${item.status}]`, color: /promoted|done/i.test(item.status) ? theme.textDim : theme.text });
  }
  if (!overview.backlog.length) items.push({ id: "empty:backlog", label: "  (empty)", header: true });
  items.push({ id: "header:inbox", label: `Inbox · ${overview.inbox.length}`, header: true });
  for (const item of overview.inbox) {
    items.push({ id: item.path, label: `${fit(item.name, 26)} [${item.processed ? "processed" : item.status}]`, color: item.processed ? theme.textDim : theme.text });
  }
  if (!overview.inbox.length) items.push({ id: "empty:inbox", label: "  (empty)", header: true });
  return items;
}

/** Creates the Backlog screen. */
export function createBacklogScreen(store: ProjectStore): Screen {
  let list: ReturnType<typeof selectList> | undefined;
  let reader: ReturnType<typeof markdownView> | undefined;
  return {
    id: "backlog",
    title: "Backlog",
    description: "Backlog items and inbox captures with preview",
    keys: [
      { key: "↑/↓", action: "item" },
      { key: "PgUp/PgDn", action: "scroll" },
      { key: "r", action: "reload" },
    ],
    mount: ({ renderer, theme }) => {
      const rootBox = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      const style = markdownStyle(renderer, theme);
      reader = markdownView(renderer, theme, { title: "Preview", style });
      let generation = 0;

      const preview = (item: SelectItem | undefined) => {
        const mine = ++generation;
        if (!item) {
          reader?.setTitle("Preview");
          reader?.setMarkdown("Nothing to preview. Capture ideas with `$specsfy-01-inbox` and refine them with `$specsfy-02-backlog`.");
          return;
        }
        reader?.setTitle(item.id);
        store.services.readText(projectFile(store.project, item.id)).then(
          (content) => { if (mine === generation) reader?.setMarkdown(content); },
          (error) => { if (mine === generation) reader?.setMarkdown(`Unable to read the file: ${errorMessage(error)}`); },
        );
      };

      list = selectList(renderer, theme, { title: "Backlog and inbox", emptyText: "Loading…", active: true, width: 46, onChange: preview });
      rootBox.add(list.box);
      rootBox.add(reader.box);

      const draw = (state: StoreState) => {
        if (state.status === "loading" || !state.snapshot) {
          list?.setItems([]);
          reader?.setMarkdown(state.status === "error" ? `Unable to load the project: ${state.message}` : "Loading project…");
          return;
        }
        list?.setItems(backlogItems(theme, state.snapshot.overview));
        if (!list?.selected()) preview(undefined);
      };
      draw(store.state());
      const unsubscribe = store.subscribe(draw);
      renderer.once("destroy", () => { unsubscribe(); generation += 1; style.destroy(); list = undefined; reader = undefined; });
      return rootBox;
    },
    onKey: (name) => {
      switch (name) {
        case "up": case "k": list?.move(-1); return true;
        case "down": case "j": list?.move(1); return true;
        case "pageup": reader?.scroll(-10); return true;
        case "pagedown": case "space": reader?.scroll(10); return true;
        case "r": void store.reload(); return true;
        default: return false;
      }
    },
  };
}
