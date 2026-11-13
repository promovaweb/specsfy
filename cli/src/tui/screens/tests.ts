/**
 * Tests tab: runs the project test suite and shows the summary and output.
 *
 * Enter runs `runProjectTests` from `src/domain/project-testing.ts`, the
 * same function behind `specsfy test`, including the test database
 * protection: when `.env.testing` is missing or points to the development
 * database, the run stops before spawning PHP and the tab shows why. The
 * output streams into a scrollable view that follows the end until the
 * person scrolls up, keeping at most `MAX_LINES` lines. The run is
 * asynchronous and survives tab changes; quitting the TUI aborts it.
 */
import { BoxRenderable, TextRenderable } from "@opentui/core";
import type { TestRun } from "../../domain/project-testing.ts";
import { scrollText, panel, keyValueTable, dim } from "../components.ts";
import { glyphs } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore } from "../store.ts";
import { errorMessage } from "../store.ts";
import { replaceChildren } from "./shared.ts";

/** Output lines kept in memory; older lines are dropped. */
export const MAX_LINES = 2000;

type TestState =
  | { status: "idle" }
  | { status: "running"; startedAt: number }
  | { status: "done"; run: TestRun }
  | { status: "error"; message: string };

/** Creates the Tests screen. */
export function createTestsScreen(store: ProjectStore): Screen {
  let state: TestState = { status: "idle" };
  let lines: string[] = [];
  let dropped = 0;
  let controller: AbortController | undefined;
  let start: (() => void) | undefined;
  let output: ReturnType<typeof scrollText> | undefined;

  return {
    id: "tests",
    title: "Tests",
    description: "Run the project test suite",
    keys: [
      { key: "Enter", action: "run tests" },
      { key: "PgUp/PgDn", action: "scroll" },
    ],
    mount: ({ renderer, theme }) => {
      const rootBox = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1 });
      const summary = panel(renderer, theme, { title: "Summary", active: true });
      summary.flexShrink = 0;
      output = scrollText(renderer, theme, { title: "Output", follow: true });
      rootBox.add(summary);
      rootBox.add(output.box);
      let flushTimer: ReturnType<typeof setTimeout> | undefined;
      let disposed = false;

      const drawOutput = () => {
        flushTimer = undefined;
        if (disposed) return;
        const head = dropped ? [`… ${dropped} earlier line(s) dropped`] : [];
        const text = [...head, ...lines].join("\n");
        output?.setText(text || "No output yet.", text ? theme.text : theme.textDim);
      };
      const scheduleOutput = () => {
        flushTimer ??= setTimeout(drawOutput, 50);
      };

      const drawSummary = () => {
        if (disposed) return;
        switch (state.status) {
          case "idle":
            replaceChildren(summary, [
              new TextRenderable(renderer, { content: `${glyphs.pending} Not run in this session.`, fg: theme.textDim }),
              dim(renderer, theme, "Enter runs the suite (Laravel with Pest). The run stops first when .env.testing does not declare a separate database."),
            ]);
            break;
          case "running":
            replaceChildren(summary, [new TextRenderable(renderer, { content: `${glyphs.running} Running the project tests…`, fg: theme.warn })]);
            break;
          case "error":
            replaceChildren(summary, [
              new TextRenderable(renderer, { content: `${glyphs.error} Tests did not run`, fg: theme.error }),
              new TextRenderable(renderer, { content: state.message, fg: theme.text, wrapMode: "word" }),
            ]);
            break;
          case "done": {
            const passed = state.run.exit_code === 0;
            replaceChildren(summary, [
              new TextRenderable(renderer, { content: passed ? `${glyphs.ok} Tests passed` : `${glyphs.error} Tests failed`, fg: passed ? theme.ok : theme.error }),
              keyValueTable(renderer, theme, [
                ["Runner", state.run.command.label],
                ["Command", state.run.command.display],
                ["Duration", `${state.run.duration_seconds.toFixed(2)}s`],
                ["Exit code", String(state.run.exit_code), passed ? theme.ok : theme.error],
              ]),
              ...state.run.summary_lines.slice(-6).map((line) => dim(renderer, theme, line)),
            ]);
            break;
          }
        }
      };

      start = () => {
        if (state.status === "running") return;
        lines = [];
        dropped = 0;
        controller = new AbortController();
        const signal = controller.signal;
        state = { status: "running", startedAt: Date.now() };
        drawSummary();
        drawOutput();
        store.services.runTests(store.project, (line) => {
          lines.push(line);
          if (lines.length > MAX_LINES) {
            dropped += lines.length - MAX_LINES;
            lines.splice(0, lines.length - MAX_LINES);
          }
          scheduleOutput();
        }, signal).then(
          (run) => { if (!signal.aborted) state = { status: "done", run }; },
          (error) => { if (!signal.aborted) state = { status: "error", message: errorMessage(error) }; },
        ).finally(() => {
          if (signal.aborted) return;
          controller = undefined;
          drawSummary();
          drawOutput();
        });
      };

      drawSummary();
      drawOutput();
      renderer.once("destroy", () => {
        disposed = true;
        controller?.abort();
        if (flushTimer) clearTimeout(flushTimer);
        start = undefined;
        output = undefined;
      });
      return rootBox;
    },
    onKey: (name) => {
      switch (name) {
        case "return": case "enter": start?.(); return true;
        case "pageup": output?.scroll(-10); return true;
        case "pagedown": case "space": output?.scroll(10); return true;
        default: return false;
      }
    },
  };
}
