/**
 * Overview tab: the project at a glance.
 *
 * A dashboard of the specs: the overall progress bar, meters for specs,
 * gates, tasks and checklist items, a line of totals, a bar chart of specs
 * per state, passed gates by kind (definition, plan, delivery), the specs
 * with their three gates and their own progress bar (open ones first), the
 * backlog and inbox, next steps derived from the current state and the MCP
 * block an agent uses to connect. The project root is in the header. It redraws when the project store reloads, which
 * happens only when the project files change. `r` reloads on demand.
 */
import { BoxRenderable, TextRenderable, type Renderable } from "@opentui/core";
import { manifest } from "../../app/manifest.ts";
import type { ProjectOverview, SpecSummary } from "../../core/overview.ts";
import type { SpecFolder } from "../../domain/lifecycle.ts";
import { barCells, barChart, dim, heading, list, meter, panel, segments, spacer, fit, type Segment } from "../components.ts";
import { glyphs, type Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore, StoreState } from "../store.ts";
import { FOLDER_ORDER, folderLabel, gateTone, replaceChildren, stateText } from "./shared.ts";
import type { CliRenderer, ColorInput } from "@opentui/core";

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

/** Gate kinds of a spec, in lifecycle order. */
const GATES = [
  ["Definition", "definition_gate"],
  ["Plan", "plan_gate"],
  ["Delivery", "delivery_gate"],
] as const;

/** Color of a state in the charts. */
function stateColor(theme: Theme, folder: SpecFolder | "legacy"): ColorInput {
  switch (folder) {
    case "draft": return theme.textDim;
    case "defined": return theme.accentSecondary;
    case "planned": return theme.accentSecondary;
    case "in-progress": return theme.warn;
    case "review": return theme.accent;
    case "completed": return theme.ok;
    default: return theme.accent;
  }
}

function ratioColor(theme: Theme, value: number, total: number): ColorInput {
  if (!total) return theme.textDim;
  return value >= total ? theme.ok : theme.accent;
}

/** Sizes of the dashboard for one terminal size. */
export interface OverviewLayout {
  /** Width of the right column (states, gates, guide). */
  side: number;
  overallBar: number;
  meterBar: number;
  stateBar: number;
  gateBar: number;
  perSpecBar: number;
  slug: number;
  specBar: number;
  showSpecState: boolean;
  /** Backlog and guide row, hidden on short terminals (the Backlog tab has it). */
  showBottom: boolean;
}

/** Computes bar and column widths from the terminal size. */
export function overviewLayout(width: number, height: number): OverviewLayout {
  const side = width >= 110 ? 46 : 38;
  const sideInner = side - 4;
  const mainInner = Math.max(20, width - 2 - side - 4);
  const specBar = mainInner >= 80 ? 20 : 10;
  const showSpecState = mainInner >= 80;
  const fixed = 1 + 3 + 2 + specBar + 5 + 14 + (showSpecState ? 12 : 0);
  return {
    side,
    overallBar: Math.max(10, Math.min(52, mainInner - 11 - 6)),
    meterBar: Math.max(8, Math.min(40, mainInner - 11 - 2 - 9 - 5 - 4)),
    stateBar: Math.max(6, sideInner - 12 - 4 - 2),
    gateBar: Math.max(6, sideInner - 11 - 2 - 9 - 5 - 1),
    perSpecBar: Math.max(6, sideInner - 12 - 4 - 6 - 2),
    slug: Math.max(12, Math.min(36, mainInner - fixed)),
    specBar,
    showSpecState,
    showBottom: height >= 38,
  };
}

/** Mean progress of the specs, from 0 to 100; 0 without specs. */
export function overallPercent(overview: ProjectOverview): number {
  if (!overview.specs.length) return 0;
  const mean = overview.specs.reduce((sum, spec) => sum + Math.min(100, Math.max(0, spec.percent)), 0) / overview.specs.length;
  return mean >= 100 ? 100 : Math.floor(mean);
}

/** Overall progress, the four counters as meters and one line of totals. */
function progressPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview, layout: OverviewLayout): Renderable[] {
  const s = overview.summary;
  const overall = overallPercent(overview);
  const { full, empty } = barCells(overall, 100, layout.overallBar);
  const pending = overview.inbox.filter((item) => !item.processed).length;
  const meterOptions = { labelWidth: 11, width: layout.meterBar, countWidth: 9 };
  const nodes: Renderable[] = [
    segments(renderer, [
      ["Overall    ", theme.textStrong],
      [full, overall >= 100 ? theme.ok : theme.accent],
      [empty, theme.textDim],
      [`  ${overall}%`, theme.textStrong],
    ]),
    spacer(renderer),
    meter(renderer, theme, { ...meterOptions, label: "Specs", value: s.completed_specs, total: s.total_specs, color: ratioColor(theme, s.completed_specs, s.total_specs) }),
    meter(renderer, theme, { ...meterOptions, label: "Gates", value: s.passed_gates, total: s.total_gates, color: ratioColor(theme, s.passed_gates, s.total_gates) }),
    meter(renderer, theme, { ...meterOptions, label: "Tasks", value: s.completed_tasks, total: s.total_tasks, color: ratioColor(theme, s.completed_tasks, s.total_tasks) }),
    meter(renderer, theme, { ...meterOptions, label: "Checklist", value: s.completed_task_items, total: s.total_task_items, color: ratioColor(theme, s.completed_task_items, s.total_task_items) }),
    spacer(renderer),
    segments(renderer, [
      [`${s.total_specs} specs`, theme.textStrong],
      [` ${glyphs.bullet} ${s.pending_tasks} pending tasks`, s.pending_tasks ? theme.warn : theme.textDim],
      [` ${glyphs.bullet} ${s.orphan_checklist_items} orphans`, s.orphan_checklist_items ? theme.warn : theme.textDim],
      [` ${glyphs.bullet} ${overview.backlog.length} backlog`, theme.textDim],
      [` ${glyphs.bullet} ${pending} inbox`, pending ? theme.warn : theme.textDim],
    ]),
  ];
  // Without the guide row, the first next step stays visible here.
  if (!layout.showBottom) {
    nodes.push(segments(renderer, [[`${glyphs.arrow} Next: `, theme.accent], [nextSteps(overview)[0] ?? "", theme.text]]));
  }
  return nodes;
}

/** Chart of specs per state, in lifecycle order. */
function statesPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview, layout: OverviewLayout): Renderable[] {
  const items = FOLDER_ORDER
    .filter((folder) => folder !== "legacy" || overview.states.legacy > 0)
    .map((folder) => ({ label: folder === "legacy" ? "Legacy" : folderLabel(folder), value: overview.states[folder], color: stateColor(theme, folder) }));
  return [barChart(renderer, theme, items, { labelWidth: 11, width: layout.stateBar })];
}

/** Passed gates by kind, with the count of pending and failed gates. */
function gatesPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview, layout: OverviewLayout): Renderable[] {
  const total = overview.specs.length;
  const nodes: Renderable[] = GATES.map(([label, key]) => {
    const passed = overview.specs.filter((spec) => /^(passed|approved)$/i.test(spec[key])).length;
    return meter(renderer, theme, { label, labelWidth: 11, value: passed, total, width: layout.gateBar, color: ratioColor(theme, passed, total) });
  });
  const values = overview.specs.flatMap((spec) => GATES.map(([, key]) => gateTone(theme, spec[key]).color));
  const count = (color: ColorInput) => values.filter((value) => value === color).length;
  nodes.push(spacer(renderer));
  nodes.push(segments(renderer, [
    [`${glyphs.ok} ${count(theme.ok)} passed`, theme.ok],
    [`  ${glyphs.warn} ${count(theme.warn)} pending`, count(theme.warn) ? theme.warn : theme.textDim],
    [`  ${glyphs.error} ${count(theme.error)} failed`, count(theme.error) ? theme.error : theme.textDim],
  ]));
  if (count(theme.textDim)) nodes.push(dim(renderer, theme, `${glyphs.pending} ${count(theme.textDim)} missing`));
  nodes.push(spacer(renderer));
  nodes.push(heading(renderer, theme, "Gates passed per spec"));
  const passedPerSpec = overview.specs.map((spec) => GATES.filter(([, key]) => /^(passed|approved)$/i.test(spec[key])).length);
  nodes.push(barChart(renderer, theme, [3, 2, 1, 0].map((passed) => ({
    label: `${passed}/3 gates`,
    value: passedPerSpec.filter((value) => value === passed).length,
    color: passed === 3 ? theme.ok : passed === 0 ? theme.error : theme.warn,
    suffix: " specs",
  })), { labelWidth: 11, width: layout.perSpecBar }));
  return nodes;
}

/** Most specs that fit: open ones first, each with gates, bar and tasks. */
export const SPEC_ROWS = 12;

function specsPanel(renderer: CliRenderer, theme: Theme, overview: ProjectOverview, layout: OverviewLayout): Renderable[] {
  if (!overview.specs.length) return [dim(renderer, theme, "No specs yet. Capture an idea with $specsfy-01-inbox.")];
  const order = (spec: SpecSummary) => FOLDER_ORDER.indexOf(spec.folder);
  const open = overview.specs.filter((spec) => spec.percent < 100).sort((a, b) => order(b) - order(a) || b.percent - a.percent);
  const done = overview.specs.filter((spec) => spec.percent >= 100);
  const rows = [...open, ...done].slice(0, SPEC_ROWS);
  const nodes: Renderable[] = rows.map((spec) => {
    const { full, empty } = barCells(spec.percent, 100, layout.specBar);
    const gates: Segment[] = GATES.map(([, key]) => {
      const tone = gateTone(theme, spec[key]);
      return [tone.text.charAt(0), tone.color];
    });
    return segments(renderer, [
      [fit(spec.slug, layout.slug), spec.percent >= 100 ? theme.text : theme.textStrong],
      [" ", theme.text],
      ...gates,
      ["  ", theme.text],
      [full, spec.percent >= 100 ? theme.ok : theme.accent],
      [empty, theme.textDim],
      [`${String(Math.round(spec.percent)).padStart(4)}%`, theme.textStrong],
      [`  ${spec.completed_tasks}/${spec.total_tasks} tasks`.padEnd(14), theme.text],
      [layout.showSpecState ? fit(spec.folder === "legacy" ? "Legacy" : folderLabel(spec.folder), 12) : "", stateColor(theme, spec.folder)],
    ]);
  });
  if (overview.specs.length > rows.length) nodes.push(dim(renderer, theme, `… and ${overview.specs.length - rows.length} more in the Specs tab`));
  return nodes;
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
      const progress = panel(renderer, theme, { title: "Progress", flexGrow: 1, active: true });
      let layout = overviewLayout(renderer.width, renderer.height);
      const states = panel(renderer, theme, { title: "Specs by state", width: layout.side });
      topRow.add(progress);
      topRow.add(states);
      const middleRow = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1 });
      const specs = panel(renderer, theme, { title: "Specs", flexGrow: 1 });
      const gates = panel(renderer, theme, { title: "Gates", width: layout.side });
      middleRow.add(specs);
      middleRow.add(gates);
      const bottomRow = new BoxRenderable(renderer, { flexDirection: "row", height: 10, flexShrink: 0 });
      const queue = panel(renderer, theme, { title: "Backlog and inbox", flexGrow: 1 });
      const steps = panel(renderer, theme, { title: "Guide", width: layout.side });
      bottomRow.add(queue);
      bottomRow.add(steps);
      rootBox.add(topRow);
      rootBox.add(middleRow);
      rootBox.add(bottomRow);

      for (const box of [progress, states, specs, gates, queue, steps]) box.overflow = "hidden";
      let last = store.state();
      const draw = (state: StoreState) => {
        last = state;
        layout = overviewLayout(renderer.width, renderer.height);
        for (const box of [states, gates, steps]) box.width = layout.side;
        bottomRow.visible = layout.showBottom;
        const snapshot = state.status === "loading" ? undefined : state.snapshot;
        if (!snapshot) {
          replaceChildren(progress, [stateText(renderer, theme, state)]);
          replaceChildren(states, []);
          replaceChildren(specs, []);
          replaceChildren(gates, []);
          replaceChildren(queue, []);
          replaceChildren(steps, []);
          return;
        }
        const overview = snapshot.overview;
        const nodes = progressPanel(renderer, theme, overview, layout);
        if (state.status === "error") nodes.push(stateText(renderer, theme, state));
        replaceChildren(progress, nodes);
        replaceChildren(states, statesPanel(renderer, theme, overview, layout));
        replaceChildren(specs, specsPanel(renderer, theme, overview, layout));
        replaceChildren(gates, gatesPanel(renderer, theme, overview, layout));
        replaceChildren(queue, queuePanel(renderer, theme, overview));
        replaceChildren(steps, stepsPanel(renderer, theme, overview));
      };
      draw(store.state());
      const unsubscribe = store.subscribe(draw);
      const onResize = () => draw(last);
      renderer.on("resize", onResize);
      renderer.once("destroy", () => {
        unsubscribe();
        renderer.off("resize", onResize);
      });
      return rootBox;
    },
    onKey: (name) => {
      if (name !== "r") return false;
      void store.reload();
      return true;
    },
  };
}
