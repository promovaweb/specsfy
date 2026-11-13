/**
 * Specs tab: specs grouped by state on the left, detail of the selected one
 * on the right.
 *
 * The detail shows title, state, the three gates (named in text and color),
 * tasks, checklist and progress, followed by the spec Markdown in a
 * scrollable view. Up/Down (or j/k) change the selection, PgUp/PgDn scroll
 * the Markdown, `g` opens the Gates tab on the selected spec and `r`
 * reloads. The selection survives automatic reloads because it is kept by
 * spec path.
 */
import { BoxRenderable, type CliRenderer, type Renderable } from "@opentui/core";
import type { SpecSummary } from "../../core/overview.ts";
import { selectList, markdownView, markdownStyle, panel, keyValueTable, progressBar, fit, dim, type SelectItem } from "../components.ts";
import type { Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore, StoreState } from "../store.ts";
import { errorMessage } from "../store.ts";
import { folderLabel, gateTone, replaceChildren, specsByFolder, stateText } from "./shared.ts";

/** Selection shared between the Specs and Gates tabs. */
export interface SpecFocus {
  /** Absolute path of the spec selected last. */
  spec?: string;
}

/** List rows of the specs, grouped by state folder. */
export function specItems(theme: Theme, specs: SpecSummary[]): SelectItem[] {
  const items: SelectItem[] = [];
  for (const group of specsByFolder(specs)) {
    items.push({ id: `header:${group.folder}`, label: `${folderLabel(group.folder)} · ${group.specs.length}`, header: true });
    for (const spec of group.specs) {
      const complete = spec.passed_gates === spec.total_gates && spec.total_gates > 0;
      items.push({
        id: spec.path,
        label: `${fit(spec.slug, 30)} ${spec.passed_gates}/${spec.total_gates} ${String(spec.percent).padStart(3)}%`,
        color: complete ? theme.ok : theme.text,
      });
    }
  }
  return items;
}

function detailRows(renderer: CliRenderer, theme: Theme, spec: SpecSummary): Renderable[] {
  const gate = (value: string) => gateTone(theme, value);
  const definition = gate(spec.definition_gate);
  const plan = gate(spec.plan_gate);
  const delivery = gate(spec.delivery_gate);
  return [
    keyValueTable(renderer, theme, [
      ["Title", spec.title, theme.textStrong],
      ["State", `${folderLabel(spec.folder)} · status ${spec.status}`],
      ["Definition gate", definition.text, definition.color],
      ["Plan gate", plan.text, plan.color],
      ["Delivery gate", delivery.text, delivery.color],
      ["Tasks", `${spec.completed_tasks}/${spec.total_tasks} done · ${spec.pending_tasks} pending`],
      ["Checklist", `${spec.completed_task_items}/${spec.total_task_items} task items · ${spec.total_other_items} other`],
      ["Orphan items", spec.orphan_checklist_lines.length ? `lines ${spec.orphan_checklist_lines.join(", ")}` : "none", spec.orphan_checklist_lines.length ? theme.warn : theme.text],
      ["Progress", progressBar(spec.percent, 20), theme.accent],
      ["File", spec.relativePath, theme.textDim],
    ]),
  ];
}

/** Creates the Specs screen. */
export function createSpecsScreen(store: ProjectStore, focus: SpecFocus): Screen {
  let list: ReturnType<typeof selectList> | undefined;
  let reader: ReturnType<typeof markdownView> | undefined;
  return {
    id: "specs",
    title: "Specs",
    description: "Specs by state with gates, tasks and the Markdown",
    keys: [
      { key: "↑/↓", action: "spec" },
      { key: "PgUp/PgDn", action: "scroll" },
      { key: "g", action: "gates" },
      { key: "r", action: "reload" },
    ],
    mount: ({ renderer, theme }) => {
      const rootBox = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      const right = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1, minWidth: 0 });
      const detail = panel(renderer, theme, { title: "Detail" });
      detail.flexShrink = 0;
      const style = markdownStyle(renderer, theme);
      reader = markdownView(renderer, theme, { title: "spec.md", style });
      let specs: SpecSummary[] = [];
      let generation = 0;

      const showSpec = (item: SelectItem | undefined) => {
        const spec = specs.find((candidate) => candidate.path === item?.id);
        const mine = ++generation;
        if (!spec) {
          const state = store.state();
          replaceChildren(detail, state.status === "ready" ? [dim(renderer, theme, "No spec selected.")] : [stateText(renderer, theme, state)]);
          reader?.setTitle("spec.md");
          reader?.setMarkdown(specs.length ? "" : "No specs yet. Create one with `$specsfy-03-specify`.");
          return;
        }
        focus.spec = spec.path;
        replaceChildren(detail, detailRows(renderer, theme, spec));
        reader?.setTitle(spec.relativePath);
        store.services.readText(spec.path).then(
          (content) => { if (mine === generation) reader?.setMarkdown(content); },
          (error) => { if (mine === generation) reader?.setMarkdown(`Unable to read the spec: ${errorMessage(error)}`); },
        );
      };

      list = selectList(renderer, theme, { title: "Specs", emptyText: "No specs found", active: true, width: 46, onChange: showSpec });
      rootBox.add(list.box);
      right.add(detail);
      right.add(reader.box);
      rootBox.add(right);

      const draw = (state: StoreState) => {
        if (state.status === "loading" || !state.snapshot) {
          list?.setItems([]);
          replaceChildren(detail, [stateText(renderer, theme, state)]);
          return;
        }
        specs = state.snapshot.overview.specs;
        const wanted = focus.spec;
        list?.setItems(specItems(theme, specs));
        if (wanted) list?.selectId(wanted);
        showSpec(list?.selected());
      };
      draw(store.state());
      const unsubscribe = store.subscribe(draw);
      renderer.once("destroy", () => { unsubscribe(); generation += 1; style.destroy(); list = undefined; reader = undefined; });
      return rootBox;
    },
    onEnter: () => {
      if (focus.spec) list?.selectId(focus.spec);
    },
    onKey: (name, ctx) => {
      switch (name) {
        case "up": case "k": list?.move(-1); return true;
        case "down": case "j": list?.move(1); return true;
        case "pageup": reader?.scroll(-10); return true;
        case "pagedown": case "space": reader?.scroll(10); return true;
        case "g": ctx.goTo("gates"); return true;
        case "r": void store.reload(); return true;
        default: return false;
      }
    },
  };
}
