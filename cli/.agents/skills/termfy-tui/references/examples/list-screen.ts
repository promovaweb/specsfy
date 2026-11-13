/** Exemplo de seleção com ativação explícita e estado vazio. */
import { BoxRenderable, TextRenderable } from "@opentui/core";
import { listPanel } from "../../src/tui/components.ts";
import type { Screen } from "../../src/tui/screen.ts";

/** Cada aplicação recebe seleção e renderables próprios. */
export function createFilesScreen(files: readonly string[]): Screen {
  let items: ReturnType<typeof listPanel> | undefined;
  return {
    id: "files", title: "Files", description: "Select a file",
    keys: [{ key: "↑/↓ j/k", action: "move" }, { key: "Enter", action: "open" }],
    mount: ({ renderer, theme }) => {
      const root = new BoxRenderable(renderer, {
        flexDirection: "column", flexGrow: 1, minHeight: 0,
      });
      const status = new TextRenderable(renderer, {
        content: files.length ? "Choose a file" : "No files found",
        height: 1, flexShrink: 0, fg: theme.textDim, wrapMode: "none",
      });
      items = listPanel(renderer, theme, {
        title: "Files", items: [...files],
        onSelect: (index) => {
          const file = files[index];
          if (file !== undefined) status.content = `Opened: ${file}`;
        },
      });
      root.add(items.box);
      root.add(status);
      return root;
    },
    onKey: (name) => {
      if (!items) return false;
      if (name === "up" || name === "k") { items.move(-1); return true; }
      if (name === "down" || name === "j") { items.move(1); return true; }
      if (name === "return" || name === "enter") {
        if (items.selected() >= 0) items.select(items.selected());
        return true;
      }
      return false;
    },
  };
}
