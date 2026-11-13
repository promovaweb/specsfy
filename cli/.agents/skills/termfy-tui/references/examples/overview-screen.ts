/** Exemplo de painel informativo com valores injetados e tema do Termfy. */
import { BoxRenderable } from "@opentui/core";
import { panel, keyValueTable } from "../../src/tui/components.ts";
import type { Screen } from "../../src/tui/screen.ts";

/** Cria uma aba independente; a leitura do serviço fica fora da montagem. */
export function createOverviewScreen(values: Array<[string, string]>): Screen {
  return {
    id: "service-overview",
    title: "Service",
    description: "Service configuration",
    mount: ({ renderer, theme }) => {
      const root = new BoxRenderable(renderer, {
        flexDirection: "column", flexGrow: 1, minHeight: 0,
      });
      const details = panel(renderer, theme, { title: "Service", flexGrow: 1 });
      details.add(keyValueTable(renderer, theme,
        values.length ? values : [["Status", "No configuration"]]));
      root.add(details);
      return root;
    },
    onKey: () => false,
  };
}
