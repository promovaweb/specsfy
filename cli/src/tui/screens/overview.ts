/**
 * Overview tab: the project at a glance.
 *
 * Shows the project root, the progress summary (specs, gates, tasks and
 * checklist with a progress bar), the count of specs per state, the backlog
 * and inbox, next steps derived from the current state and the MCP block an
 * agent uses to connect. It redraws when the project store reloads, which
 * happens only when the project files change. `r` reloads on demand.
 */
import { BoxRenderable, TextRenderable, type Renderable } from "@opentui/core";
import { manifest } from "../../app/manifest.ts";
import type { ProjectOverview } from "../../core/overview.ts";
import { spacer, list, panel, dim, keyValueTable, heading, progressBar } from "../components.ts";
import { glyphs, type Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore, StoreState } from "../store.ts";
import { FOLDER_ORDER, folderLabel, replaceChildren, stateText } from "./shared.ts";
import type { CliRenderer } from "@opentui/core";

/** Next steps suggested from the project state, at most five. */
export function nextSteps(overview: ProjectOverview): string[] {
  const steps: string[] = [];
  const pendingInbox = overview.inbox.filter((item) => !item.processed).length;
  if (!overview.specs.length && !overview.backlog.length && !pendingInbox) {
    steps.push("Capture an idea with $specsfy-01-inbox");
    steps.push(`Or install the framework: ${manifest.bin} install`);
  }
  if (pendingInbox) steps.push(`Process ${pendingInbox} inbox capture(s) with $specsfy-02-backlog`);
  const openBacklog = overview.backlog.filter((item) => !/promoted|done|discarded/i.test(item.status)).length;
  if (openBacklog) steps.push(`Turn ${openBacklog} backlog item(s) into specs with $specsfy-03-specify`);
  for (const spec of overview.specs) {
    if (steps.length >= 5) break;
    if (spec.definition_gate !== "Passed") steps.push(`Validate ${spec.slug} with $specsfy-04-validate`);
    else if (spec.plan_gate !== "Passed") steps.push(`Plan the tasks of ${spec.slug} with $specsfy-05-tasks`);
    else if (spec.delivery_gate !== "Passed" || spec.pending_tasks > 0) steps.push(`Implement ${spec.slug} with $specsfy-07-implement`);
  }
  if (!steps.length) steps.push("Every spec has passed its gates. Capture the next idea with $specsfy-01-inbox");
  return steps.slice(0, 5);
}

function progressPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview): Renderable[] {
  const s = overview.summary;
  return [
    keyValueTable(renderer, theme, [
      ["Root", overview.root, theme.textStrong],
      ["Specs", `${s.completed_specs}/${s.total_specs} complete`],
      ["Gates", `${s.passed_gates}/${s.total_gates} passed`, s.passed_gates === s.total_gates && s.total_gates ? theme.ok : theme.warn],
      ["Tasks", `${s.completed_tasks}/${s.total_tasks} done · ${s.pending_tasks} pending`],
      ["Checklist", `${s.completed_task_items}/${s.total_task_items} task items · ${s.total_other_items} other`],
      ["Orphan items", String(s.orphan_checklist_items), s.orphan_checklist_items ? theme.warn : theme.text],
    ]),
    new TextRenderable(renderer, { content: `Progress  ${progressBar(s.percent, 24)}`, fg: theme.accent }),
  ];
}

function statesPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview): Renderable[] {
  const rows: Array<[string, string, string?]> = FOLDER_ORDER
    .filter((folder) => folder !== "legacy" || overview.states.legacy > 0)
    .map((folder) => [folderLabel(folder), String(overview.states[folder]), overview.states[folder] ? theme.textStrong : theme.textDim]);
  return [keyValueTable(renderer, theme, rows)];
}

function queuePanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview): Renderable[] {
  const pending = overview.inbox.filter((item) => !item.processed);
  const nodes: Renderable[] = [
    heading(renderer, theme, `Backlog · ${overview.backlog.length}`),
  ];
  if (overview.backlog.length) {
    nodes.push(list(renderer, theme, overview.backlog.slice(0, 5).map((item) => `${item.identifier}  ${item.title}  [${item.status}]`)));
    if (overview.backlog.length > 5) nodes.push(dim(renderer, theme, `… and ${overview.backlog.length - 5} more in the Backlog tab`));
  } else nodes.push(dim(renderer, theme, "No backlog items in specs/backlog/."));
  nodes.push(spacer(renderer));
  nodes.push(heading(renderer, theme, `Inbox · ${pending.length} pending of ${overview.inbox.length}`));
  if (pending.length) nodes.push(list(renderer, theme, pending.slice(0, 5).map((item) => `${item.name}  [${item.status}]`)));
  else nodes.push(dim(renderer, theme, "No pending captures in specs/inbox/."));
  return nodes;
}

function stepsPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview): Renderable[] {
  return [
    heading(renderer, theme, "Next steps"),
    list(renderer, theme, nextSteps(overview), glyphs.arrow),
    spacer(renderer),
    heading(renderer, theme, "For agents (MCP)"),
    dim(renderer, theme, `{ "command": "${manifest.bin}", "args": ["mcp"] }`),
    dim(renderer, theme, `${manifest.bin} mcp --list  lists the tools`),
  ];
}

/** Creates the Overview screen bound to a project store. */
export function createOverviewScreen(store: ProjectStore): Screen {
  return {
    id: "overview",
    title: "Overview",
    description: "Project progress, states, backlog and next steps",
    keys: [{ key: "r", action: "reload" }],
    mount: ({ renderer, theme }) => {
      const rootBox = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1 });
      const topRow = new BoxRenderable(renderer, { flexDirection: "row", flexShrink: 0 });
      const progress = panel(renderer, theme, { title: "Project", flexGrow: 1, active: true });
      const states = panel(renderer, theme, { title: "States", width: 34 });
      topRow.add(progress);
      topRow.add(states);
      const bottomRow = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      const queue = panel(renderer, theme, { title: "Backlog and inbox", flexGrow: 1 });
      const steps = panel(renderer, theme, { title: "Guide", width: 58 });
      bottomRow.add(queue);
      bottomRow.add(steps);
      rootBox.add(topRow);
      rootBox.add(bottomRow);

      const draw = (state: StoreState) => {
        const snapshot = state.status === "loading" ? undefined : state.snapshot;
        if (!snapshot) {
          replaceChildren(progress, [stateText(renderer, theme, state)]);
          replaceChildren(states, []);
          replaceChildren(queue, []);
          replaceChildren(steps, []);
          return;
        }
        const overview = snapshot.overview;
        const nodes = progressPanel(renderer, theme, overview);
        if (state.status === "error") nodes.push(stateText(renderer, theme, state));
        replaceChildren(progress, nodes);
        replaceChildren(states, statesPanel(renderer, theme, overview));
        replaceChildren(queue, queuePanel(renderer, theme, overview));
        replaceChildren(steps, stepsPanel(renderer, theme, overview));
      };
      draw(store.state());
      const unsubscribe = store.subscribe(draw);
      renderer.once("destroy", unsubscribe);
      return rootBox;
    },
    onKey: (name) => {
      if (name !== "r") return false;
      void store.reload();
      return true;
    },
  };
}
