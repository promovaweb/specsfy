/**
 * Gates tab: runs the framework gates against the selected spec.
 *
 * The left list is the same grouped list of the Specs tab. Enter runs every
 * gate of `gateDefinitions` (from `src/cli/commands/gates.ts`) in order,
 * through `executeScriptCommand`, and the right side names each gate as
 * pending, running, passed or failed, followed by the output of each run.
 * The runs are asynchronous: the interface keeps responding, the person may
 * change tabs, and results are kept per spec for the session. A second
 * Enter while gates run is ignored. With no gates registered in the build,
 * the tab says so instead of offering a run.
 */
import { BoxRenderable, TextRenderable, type Renderable } from "@opentui/core";
import type { SpecSummary } from "../../core/overview.ts";
import type { ScriptCommandDef } from "../../engine/script-command.ts";
import { selectList, scrollText, panel, dim, fit, type SelectItem } from "../components.ts";
import { glyphs, type Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore, StoreState } from "../store.ts";
import { errorMessage } from "../store.ts";
import { replaceChildren } from "./shared.ts";
import { specItems, type SpecFocus } from "./specs.ts";

type GateState = "pending" | "running" | "passed" | "failed";

interface GateResult {
  state: GateState;
  output: string;
}

/** Glyph, word and color of a gate run state. */
export function gateStateTone(theme: Theme, state: GateState): { text: string; color: string } {
  switch (state) {
    case "passed": return { text: `${glyphs.ok} passed`, color: theme.ok };
    case "failed": return { text: `${glyphs.error} failed`, color: theme.error };
    case "running": return { text: `${glyphs.running} running`, color: theme.warn };
    default: return { text: `${glyphs.pending} pending`, color: theme.textDim };
  }
}

/** Creates the Gates screen. */
export function createGatesScreen(store: ProjectStore, focus: SpecFocus): Screen {
  let list: ReturnType<typeof selectList> | undefined;
  let output: ReturnType<typeof scrollText> | undefined;
  let run: (() => void) | undefined;
  const results = new Map<string, Map<string, GateResult>>();
  let runningSpec: string | undefined;
  let disposed = false;

  return {
    id: "gates",
    title: "Gates",
    description: "Run the framework gates on a spec",
    keys: [
      { key: "↑/↓", action: "spec" },
      { key: "Enter", action: "run gates" },
      { key: "PgUp/PgDn", action: "scroll" },
    ],
    mount: ({ renderer, theme }) => {
      const defs = (): readonly ScriptCommandDef[] => store.services.gates();
      const rootBox = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      const right = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1, minWidth: 0 });
      const summary = panel(renderer, theme, { title: "Gates" });
      summary.flexShrink = 0;
      output = scrollText(renderer, theme, { title: "Output" });
      let specs: SpecSummary[] = [];

      const current = (): SpecSummary | undefined => specs.find((spec) => spec.path === list?.selected()?.id);

      const drawGates = () => {
        const spec = current();
        const gates = defs();
        if (!gates.length) {
          replaceChildren(summary, [
            new TextRenderable(renderer, { content: `${glyphs.warn} No gates are registered in this build.`, fg: theme.warn }),
            dim(renderer, theme, "Gates appear here once the gate commands are available."),
          ]);
          output?.setText("Nothing to run.", theme.textDim);
          return;
        }
        if (!spec) {
          replaceChildren(summary, [dim(renderer, theme, specs.length ? "Select a spec." : "No specs to check.")]);
          output?.setText("");
          return;
        }
        const map = results.get(spec.path);
        const header = runningSpec === spec.path
          ? `Running the gates of ${spec.slug}…`
          : map ? `Last run on ${spec.slug}. Enter runs again.` : `Enter runs ${gates.length} gate(s) on ${spec.slug}.`;
        const rows: Renderable[] = [new TextRenderable(renderer, { content: header, fg: theme.textStrong })];
        for (const def of gates) {
          const result = map?.get(def.name) ?? { state: "pending" as const, output: "" };
          const tone = gateStateTone(theme, result.state);
          const row = new BoxRenderable(renderer, { flexDirection: "row", height: 1 });
          row.add(new TextRenderable(renderer, { content: fit(`gate ${def.name}`, 22), fg: theme.text }));
          row.add(new TextRenderable(renderer, { content: fit(tone.text, 12), fg: tone.color }));
          row.add(new TextRenderable(renderer, { content: def.description, fg: theme.textDim, wrapMode: "none" }));
          rows.push(row);
        }
        replaceChildren(summary, rows);
        const text = map
          ? gates.map((def) => {
            const result = map.get(def.name);
            if (!result || result.state === "pending") return "";
            return `── gate ${def.name}: ${gateStateTone(theme, result.state).text}\n${result.output}`;
          }).filter(Boolean).join("\n\n")
          : "";
        output?.setText(text || "No output yet.", text ? theme.text : theme.textDim);
      };

      run = () => {
        const spec = current();
        const gates = [...defs()];
        if (!spec || !gates.length || runningSpec) return;
        runningSpec = spec.path;
        const map = new Map<string, GateResult>(gates.map((def) => [def.name, { state: "pending", output: "" }]));
        results.set(spec.path, map);
        drawGates();
        void (async () => {
          for (const def of gates) {
            if (disposed) return;
            map.set(def.name, { state: "running", output: "" });
            drawGates();
            try {
              const outcome = await store.services.runGate(def, spec.path, store.project);
              map.set(def.name, { state: outcome.ok ? "passed" : "failed", output: outcome.output });
            } catch (error) {
              map.set(def.name, { state: "failed", output: `Unable to run the gate: ${errorMessage(error)}` });
            }
            if (!disposed) drawGates();
          }
          runningSpec = undefined;
          if (!disposed) drawGates();
        })();
      };

      list = selectList(renderer, theme, { title: "Specs", emptyText: "No specs found", active: true, width: 46, onChange: (item: SelectItem | undefined) => {
        if (item) focus.spec = item.id;
        drawGates();
      } });
      rootBox.add(list.box);
      right.add(summary);
      right.add(output.box);
      rootBox.add(right);

      const draw = (state: StoreState) => {
        if (state.status === "loading" || !state.snapshot) {
          list?.setItems([]);
          replaceChildren(summary, [dim(renderer, theme, state.status === "error" ? `Unable to load the project: ${state.message}` : "Loading project…")]);
          return;
        }
        specs = state.snapshot.overview.specs;
        const wanted = focus.spec;
        list?.setItems(specItems(theme, specs));
        if (wanted) list?.selectId(wanted);
        drawGates();
      };
      draw(store.state());
      const unsubscribe = store.subscribe(draw);
      renderer.once("destroy", () => { disposed = true; unsubscribe(); list = undefined; output = undefined; run = undefined; });
      return rootBox;
    },
    onEnter: () => {
      if (focus.spec) list?.selectId(focus.spec);
    },
    onKey: (name) => {
      switch (name) {
        case "up": case "k": list?.move(-1); return true;
        case "down": case "j": list?.move(1); return true;
        case "return": case "enter": run?.(); return true;
        case "pageup": output?.scroll(-10); return true;
        case "pagedown": case "space": output?.scroll(10); return true;
        default: return false;
      }
    },
  };
}
