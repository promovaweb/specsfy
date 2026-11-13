/**
 * Skills tab: installed and available Specsfy skills, with install, remove
 * and update actions.
 *
 * The list joins the framework skills, the specialist catalog and any
 * Specsfy skill installed outside the catalog, grouped by category, each
 * row naming its state in text (installed or available). The catalog is
 * downloaded the first time the tab opens, without blocking the interface;
 * `c` downloads it again. `i` installs the selected skill (specialists
 * bring their requirements), `x` removes it and `u` updates every installed
 * Specsfy skill. Every action asks for confirmation first: `y` confirms,
 * `n` or Esc cancels without changing anything. Only one action runs at a
 * time, and the project store reloads afterwards.
 */
import { BoxRenderable, TextRenderable, type CliRenderer, type Renderable } from "@opentui/core";
import type { Catalog, CatalogEntryValue } from "../../domain/catalog.ts";
import { AUXILIARY_SKILLS, DOCUMENTATION_SKILLS, FRAMEWORK_SKILLS } from "../../domain/installer.ts";
import { selectList, panel, keyValueTable, dim, fit, type SelectItem } from "../components.ts";
import { glyphs, type Theme } from "../theme.ts";
import type { Screen } from "../screen.ts";
import type { ProjectStore, StoreState } from "../store.ts";
import { errorMessage } from "../store.ts";
import { replaceChildren } from "./shared.ts";

/** Descriptions of the framework skills, used when the catalog has none. */
export const FRAMEWORK_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "specsfy-01-inbox": "Captures and pre-processes ideas without asking questions.",
  "specsfy-02-backlog": "Refines captures, reduces ambiguity and prioritizes the backlog.",
  "specsfy-03-specify": "Writes and evolves the normative specification.",
  "specsfy-04-validate": "Reviews quality and runs the gates.",
  "specsfy-05-tasks": "Breaks the work into traceable tasks.",
  "specsfy-06-tdd-bdd": "BDD, TDD and requirement traceability.",
  "specsfy-07-implement": "Disciplined execution and delivery evidence.",
  "specsfy-update-spec": "Handles late requests and reopens the affected gates.",
  "specsfy-progress": "Reads and follows the project progress.",
  "specsfy-setup": "Prepares and reconciles the persistent project context.",
  "specsfy-aux-stack": "Maps and keeps the observed technical stack.",
  "specsfy-aux-rules": "Records explicit rules without erasing the current ones.",
  "specsfy-aux-database": "Keeps the full tabular map of the persistence layer.",
  "specsfy-documentator": "Rebuilds the complete technical documentation.",
};

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  base: "Framework",
  auxiliary: "Auxiliary",
  documentation: "Documentation",
  installed: "Other installed",
};

/** One skill shown in the tab. */
export interface SkillOption {
  name: string;
  description: string;
  category: string;
  installed: boolean;
  entry?: CatalogEntryValue;
}

function isSpecsfySkill(name: string): boolean {
  return name.startsWith("specsfy-");
}

/** Builds the options from the framework list, the catalog and the lock. */
export function buildSkillOptions(entries: readonly CatalogEntryValue[], installed: Set<string>): SkillOption[] {
  const options: SkillOption[] = FRAMEWORK_SKILLS.map((name) => ({
    name,
    description: FRAMEWORK_DESCRIPTIONS[name] ?? "Specsfy framework skill.",
    category: (AUXILIARY_SKILLS as readonly string[]).includes(name) || name === "specsfy-setup"
      ? "auxiliary"
      : (DOCUMENTATION_SKILLS as readonly string[]).includes(name) ? "documentation" : "base",
    installed: installed.has(name),
  }));
  const known = new Set<string>(FRAMEWORK_SKILLS);
  for (const entry of entries) {
    if (known.has(entry.name)) continue;
    known.add(entry.name);
    options.push({ name: entry.name, description: entry.description, category: entry.category, installed: installed.has(entry.name), entry });
  }
  for (const name of [...installed].sort()) {
    if (!known.has(name) && isSpecsfySkill(name)) {
      options.push({ name, description: "Specsfy skill installed outside the current catalog.", category: "installed", installed: true });
    }
  }
  const order = ["base", "auxiliary", "documentation"];
  const rank = (category: string) => {
    const index = order.indexOf(category);
    if (index >= 0) return index;
    return category === "installed" ? 1000 : 100;
  };
  return options.sort((a, b) => rank(a.category) - rank(b.category) || a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

/** Human label of a category. */
export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}

/** List rows grouped by category. */
export function skillItems(theme: Theme, options: SkillOption[]): SelectItem[] {
  const items: SelectItem[] = [];
  let category = "";
  for (const option of options) {
    if (option.category !== category) {
      category = option.category;
      const count = options.filter((candidate) => candidate.category === category).length;
      items.push({ id: `header:${category}`, label: `${categoryLabel(category)} · ${count}`, header: true });
    }
    items.push({
      id: option.name,
      label: `${option.installed ? `${glyphs.ok} installed` : `${glyphs.pending} available`}  ${fit(option.name, 40)}`,
      color: option.installed ? theme.ok : theme.text,
    });
  }
  return items;
}

type CatalogState = { status: "idle" } | { status: "loading" } | { status: "ready"; catalog: Catalog } | { status: "error"; message: string };

interface PendingAction {
  label: string;
  run: () => Promise<string[]>;
  done: (changed: string[]) => string;
}

function detailRows(renderer: CliRenderer, theme: Theme, option: SkillOption | undefined): Renderable[] {
  if (!option) return [dim(renderer, theme, "No skill selected.")];
  const rows: Array<[string, string, string?]> = [
    ["Skill", option.name, theme.textStrong],
    ["State", option.installed ? `${glyphs.ok} installed` : `${glyphs.pending} available`, option.installed ? theme.ok : theme.textDim],
    ["Category", categoryLabel(option.category)],
  ];
  if (option.entry?.tags.length) rows.push(["Tags", option.entry.tags.join(", ")]);
  if (option.entry?.requires.length) rows.push(["Requires", option.entry.requires.join(", "), theme.accentSecondary]);
  return [
    keyValueTable(renderer, theme, rows),
    new TextRenderable(renderer, { content: option.description, fg: theme.text, wrapMode: "word" }),
    new TextRenderable(renderer, {
      content: option.installed ? "x removes this skill · u updates every installed skill" : "i installs this skill",
      fg: theme.accent,
    }),
  ];
}

/** Creates the Skills screen. */
export function createSkillsScreen(store: ProjectStore): Screen {
  let catalog: CatalogState = { status: "idle" };
  let pending: PendingAction | undefined;
  let busy = false;
  let message = "";
  let list: ReturnType<typeof selectList> | undefined;
  let api: {
    loadCatalog: () => void;
    redraw: () => void;
    selected: () => SkillOption | undefined;
    installed: () => Set<string>;
  } | undefined;

  const ask = (action: PendingAction) => {
    if (busy) {
      message = "Another skill action is running. Wait for it to finish.";
      api?.redraw();
      return;
    }
    pending = action;
    api?.redraw();
  };

  const confirm = () => {
    const action = pending;
    pending = undefined;
    if (!action || busy) return;
    busy = true;
    message = `${glyphs.running} ${action.label}…`;
    api?.redraw();
    action.run().then(
      (changed) => { message = `${glyphs.ok} ${action.done(changed)}`; },
      (error) => { message = `${glyphs.error} ${errorMessage(error)}`; },
    ).finally(() => {
      busy = false;
      api?.redraw();
      void store.reload();
    });
  };

  return {
    id: "skills",
    title: "Skills",
    description: "Installed and available skills",
    keys: [
      { key: "↑/↓", action: "skill" },
      { key: "i", action: "install" },
      { key: "x", action: "remove" },
      { key: "u", action: "update all" },
      { key: "c", action: "catalog" },
    ],
    mount: ({ renderer, theme }) => {
      const rootBox = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1 });
      const body = new BoxRenderable(renderer, { flexDirection: "row", flexGrow: 1, minHeight: 0 });
      const right = new BoxRenderable(renderer, { flexDirection: "column", flexGrow: 1, minWidth: 0 });
      const detail = panel(renderer, theme, { title: "Detail", flexGrow: 1 });
      const status = panel(renderer, theme, { title: "Status" });
      status.flexShrink = 0;
      const confirmBar = new BoxRenderable(renderer, { height: 1, flexShrink: 0, flexDirection: "row", backgroundColor: theme.primary, paddingLeft: 1 });
      const confirmText = new TextRenderable(renderer, { content: "", fg: theme.primaryText, bg: theme.primary, wrapMode: "none" });
      confirmBar.add(confirmText);
      let options: SkillOption[] = [];
      let installed = new Set<string>();
      let lockError: string | undefined;
      let disposed = false;

      const selected = () => options.find((option) => option.name === list?.selected()?.id);

      const redraw = () => {
        if (disposed) return;
        const entries = catalog.status === "ready" ? catalog.catalog.entries : [];
        options = buildSkillOptions(entries, installed);
        list?.setItems(skillItems(theme, options));
        replaceChildren(detail, detailRows(renderer, theme, selected()));
        const catalogValue = catalog.status === "ready"
          ? `${entries.length} specialist(s)`
          : catalog.status === "loading" ? `${glyphs.running} loading`
            : catalog.status === "error" ? `unavailable: ${catalog.message}` : "not loaded (c loads it)";
        const lines: Renderable[] = [
          keyValueTable(renderer, theme, [
            ["Project", store.project, theme.textStrong],
            ["Installed", `${[...installed].filter(isSpecsfySkill).length} Specsfy skill(s) in skills-lock.json`],
            ["Catalog", catalogValue, catalog.status === "error" ? theme.warn : theme.text],
          ]),
        ];
        if (lockError) lines.push(new TextRenderable(renderer, { content: `${glyphs.warn} ${lockError}`, fg: theme.warn, wrapMode: "word" }));
        if (message) lines.push(new TextRenderable(renderer, { content: message, fg: message.startsWith(glyphs.error) ? theme.error : message.startsWith(glyphs.ok) ? theme.ok : theme.warn, wrapMode: "word" }));
        replaceChildren(status, lines);
        if (pending) {
          confirmText.content = `${pending.label}? Press y to confirm, n or Esc to cancel.`;
          confirmBar.visible = true;
        } else {
          confirmText.content = "";
          confirmBar.visible = false;
        }
      };

      const loadCatalog = () => {
        if (catalog.status === "loading") return;
        catalog = { status: "loading" };
        redraw();
        store.services.loadCatalog().then(
          (loaded) => { catalog = { status: "ready", catalog: loaded }; },
          (error) => { catalog = { status: "error", message: errorMessage(error) }; },
        ).finally(() => redraw());
      };

      list = selectList(renderer, theme, { title: "Skills", emptyText: "No skills", active: true, width: 60, onChange: () => {
        if (!disposed) replaceChildren(detail, detailRows(renderer, theme, selected()));
      } });
      body.add(list.box);
      right.add(status);
      right.add(detail);
      body.add(right);
      rootBox.add(body);
      rootBox.add(confirmBar);

      const draw = (state: StoreState) => {
        if (state.status === "loading" || !state.snapshot) {
          if (state.status === "error") message = `${glyphs.error} Unable to load the project: ${state.message}`;
          redraw();
          return;
        }
        installed = state.snapshot.installed;
        lockError = state.snapshot.lockError;
        redraw();
      };
      api = { loadCatalog, redraw, selected, installed: () => installed };
      draw(store.state());
      const unsubscribe = store.subscribe(draw);
      renderer.once("destroy", () => { disposed = true; unsubscribe(); list = undefined; api = undefined; });
      return rootBox;
    },
    onEnter: () => {
      if (catalog.status === "idle") api?.loadCatalog();
    },
    onKey: (name) => {
      if (pending) {
        if (name === "y") confirm();
        else if (name === "n" || name === "escape") { pending = undefined; message = "Cancelled. Nothing changed."; api?.redraw(); }
        return true;
      }
      const option = api?.selected();
      switch (name) {
        case "up": case "k": list?.move(-1); return true;
        case "down": case "j": list?.move(1); return true;
        case "c": api?.loadCatalog(); return true;
        case "i":
          if (!option) return true;
          if (option.installed) { message = `${option.name} is already installed.`; api?.redraw(); return true; }
          ask({
            label: `Install ${option.name}`,
            run: () => store.services.installSkills(store.project, [option.name], catalog.status === "ready" ? catalog.catalog : undefined),
            done: (changed) => (changed.length ? `Installed: ${changed.join(", ")}` : `${option.name} was already up to date.`),
          });
          return true;
        case "x":
          if (!option) return true;
          if (!option.installed) { message = `${option.name} is not installed.`; api?.redraw(); return true; }
          ask({
            label: `Remove ${option.name}`,
            run: () => store.services.removeSkills(store.project, [option.name]),
            done: (changed) => (changed.length ? `Removed: ${changed.join(", ")}` : `${option.name} was not removed.`),
          });
          return true;
        case "u":
          ask({
            label: "Update every installed Specsfy skill",
            run: () => store.services.updateSkills(store.project),
            done: (changed) => (changed.length ? `Updated ${changed.length} skill(s).` : "Every installed skill is up to date."),
          });
          return true;
        default:
          return false;
      }
    },
  };
}
