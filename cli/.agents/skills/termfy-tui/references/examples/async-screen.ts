/** Exemplo de consulta injetada, recarga e cleanup nas duas saídas da tela. */
import { TextRenderable } from "@opentui/core";
import { panel } from "../../src/tui/components.ts";
import type { Screen } from "../../src/tui/screen.ts";
import { createLatestTask } from "./latest-task.ts";

/** O serviço recebe AbortSignal; a UI nunca apresenta o erro bruto da API. */
export function createStatusScreen(load: (signal: AbortSignal) => Promise<string>): Screen {
  let message: TextRenderable | undefined;
  const task = createLatestTask(load, (state) => {
    if (!message) return;
    if (state.status === "loading") message.content = "Loading...";
    if (state.status === "error") message.content = "Unable to load. Press r to retry.";
    if (state.status === "ready") message.content = state.value || "No results";
  });
  return {
    id: "service-status", title: "Status", description: "Service status",
    keys: [{ key: "r", action: "reload" }],
    mount: ({ renderer, theme }) => {
      const root = panel(renderer, theme, { title: "Service status", flexGrow: 1 });
      message = new TextRenderable(renderer, {
        content: "Ready to load", fg: theme.text, wrapMode: "word",
      });
      root.add(message);
      // O host atual não chama onLeave ao destruir o renderer.
      renderer.once("destroy", () => { task.stop(); message = undefined; });
      return root;
    },
    onEnter: () => { task.activate(); void task.run(); },
    onLeave: () => task.stop(),
    onKey: (name) => {
      if (name !== "r") return false;
      void task.run();
      return true;
    },
  };
}
