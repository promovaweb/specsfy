/**
 * Context tab: the persistent context files of the project.
 *
 * Lists the documents that `$specsfy-setup` maintains (PROJECT.md, the
 * design system, the interface map and the files of `.specsfy/`), marking
 * which exist, with a preview of the selected one. Read only: the documents
 * change through the setup skill or `specsfy context`.
 */
import { BoxRenderable } from "@opentui/core";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { markdownStyle, markdownView, selectList, type SelectItem, listWidth } from "../components.ts";
import { glyphs, type Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore } from "../store.ts";
import { errorMessage } from "../store.ts";

/** Context documents in reading order, with what each one holds. */
export const CONTEXT_FILES: ReadonlyArray<{ path: string; about: string }> = [
  { path: "PROJECT.md", about: "product, people and scope" },
  { path: "DESIGNSYSTEM.MD", about: "design system" },
  { path: "INTERFACE.md", about: "screens, routes and components" },
  { path: ".specsfy/STACK.md", about: "stack and evidence" },
  { path: ".specsfy/RULES.md", about: "confirmed rules" },
  { path: ".specsfy/DATABASE.md", about: "persistence and data map" },
  { path: ".specsfy/PACKAGES.md", about: "npm and Composer packages" },
  { path: ".specsfy/USER-PROFILE.md", about: "how to talk to the person" },
];

async function exists(path: string): Promise<boolean> {
  return access(path).then(() => true, () => false);
}

/** One row per context document, marked present or missing. */
async function contextItems(theme: Theme, project: string): Promise<SelectItem[]> {
  return Promise.all(CONTEXT_FILES.map(async ({ path, about }) => {
    const present = await exists(join(project, path));
    return {
      id: path,
      label: `${present ? glyphs.ok : glyphs.pending} ${path.padEnd(25)} ${about}`,
      color: present ? theme.text : theme.textDim,
    };
  }));
}

/** Creates the Context screen. */
export function createContextScreen(store: ProjectStore): Screen {
  let list: ReturnType<typeof selectList> | undefined;
  let reader: ReturnType<typeof markdownView> | undefined;
  return {
    id: "context",
    title: "Context",
    description: "Persistent context files of the project",
    keys: [
      { key: "↑/↓", action: "file" },
      { key: "PgUp/PgDn", action: "scroll" },
    ],
    mount: ({ renderer, theme }) => {
      const rootBox = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      const style = markdownStyle(renderer, theme);
      reader = markdownView(renderer, theme, { title: "Preview", style });
      let generation = 0;
      const preview = (item: SelectItem | undefined) => {
        const mine = ++generation;
        if (!item) return;
        reader?.setTitle(item.id);
        store.services.readText(join(store.project, item.id)).then(
          (content) => { if (mine === generation) reader?.setMarkdown(content); },
          (error) => {
            if (mine !== generation) return;
            const missing = (error as NodeJS.ErrnoException).code === "ENOENT";
            reader?.setMarkdown(missing ? `\`${item.id}\` does not exist yet. Create it with \`$specsfy-setup\` or \`specsfy context setup\`.` : `Unable to read the file: ${errorMessage(error)}`);
          },
        );
      };
      list = selectList(renderer, theme, { title: "Context", emptyText: "Loading…", active: true, width: listWidth(renderer, 60), onChange: preview });
      rootBox.add(list.box);
      rootBox.add(reader.box);
      const refresh = () => void contextItems(theme, store.project).then((items) => list?.setItems(items));
      refresh();
      const unsubscribe = store.subscribe(() => refresh());
      renderer.once("destroy", () => { unsubscribe(); generation += 1; style.destroy(); list = undefined; reader = undefined; });
      return rootBox;
    },
    filter: (query) => list?.setFilter(query),
    onKey: (name) => {
      switch (name) {
        case "up": case "k": list?.move(-1); return true;
        case "down": case "j": list?.move(1); return true;
        case "pageup": reader?.scroll(-10); return true;
        case "pagedown": reader?.scroll(10); return true;
        default: return false;
      }
    },
  };
}
