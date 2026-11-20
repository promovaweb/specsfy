/**
 * TUI assembly.
 *
 * Screen layout:
 *
 *   ┌ header: title, version and project root ───────────────────────────┐
 *   │ tabs (TabSelect)                                                   │
 *   │ active tab content (flexGrow)                                      │
 *   └ status bar: available keys ────────────────────────────────────────┘
 *
 * Global keys: Left/Right or [ ] switch tabs, 1..9 jump to the tab with
 * that number, Tab moves forward, q or Esc quit, ? toggles the help box.
 * Each screen adds its own keys to the bottom bar. The host owns the
 * project store: it starts polling after the first tab is shown and stops
 * it when the renderer is destroyed. The renderer is destroyed on every
 * exit path to hand the terminal back.
 */
import {
  BoxRenderable,
  TabSelectRenderable,
  TabSelectRenderableEvents,
  TextRenderable,
  TextAttributes,
  createCliRenderer,
  type CliRenderer,
  type KeyEvent,
  type Renderable,
} from "@opentui/core";
import { manifest } from "../app/manifest.ts";
import { readSettings, getPath } from "../config/settings.ts";
import { glyphs, currentTheme, resolveTheme, type Theme } from "./theme.ts";
import { createScreens } from "./screens/index.ts";
import { resolveProject } from "../core/project.ts";
import { defaultServices, type TuiServices } from "./services.ts";
import { createProjectStore, type ProjectStore } from "./store.ts";
import type { ScreenContext, Screen } from "./screen.ts";

export interface TuiOptions {
  /** Tab id to open first; defaults to `tui.initialTab`. */
  initialTab?: string;
  /** Project root (already resolved or a `--project` value); defaults to the nearest project. */
  project?: string;
  /** Services used by the screens; tests replace slow or remote parts. */
  services?: TuiServices;
  /** Screens to show instead of the default set (tests and derived tools). */
  screens?: Screen[];
  /** Store to use instead of creating one (tests). */
  store?: ProjectStore;
}

function defaultInitialTab(screens: readonly Screen[]): string {
  try {
    const value = getPath(readSettings(), "tui.initialTab");
    if (typeof value === "string") return value;
  } catch {
    // Without settings, use the first tab.
  }
  return screens[0]?.id ?? "overview";
}

function keyBar(renderer: CliRenderer, theme: Theme, pairs: ReadonlyArray<{ key: string; action: string }>): BoxRenderable {
  const bar = new BoxRenderable(renderer, {
    height: 1,
    flexDirection: "row",
    backgroundColor: theme.barBackground,
    paddingLeft: 1,
    gap: 2,
  });
  for (const { key, action } of pairs) {
    const item = new BoxRenderable(renderer, { flexDirection: "row" });
    item.add(new TextRenderable(renderer, { content: ` ${key} `, fg: theme.keyText, bg: theme.keyBackground, selectable: false }));
    item.add(new TextRenderable(renderer, { content: ` ${action}`, fg: theme.barText, selectable: false }));
    bar.add(item);
  }
  return bar;
}

/**
 * Opens the TUI on a real terminal and returns only when the user quits.
 * With the `terminal` theme, the palette query runs before mounting so the
 * first frame already uses the slots chosen for the terminal colors.
 */
export async function startTui(options: TuiOptions = {}): Promise<void> {
  const renderer = await createCliRenderer({ exitOnCtrlC: true, backgroundColor: currentTheme().background, targetFps: 30 });
  const theme = await resolveTheme(renderer);
  await mountTui(renderer, options, theme);
}

/**
 * Mounts the interface on an existing renderer and returns when it is
 * destroyed. Separated from `startTui` so tests can use the renderer from
 * `@opentui/core/testing` and capture frames without a real terminal.
 */
export async function mountTui(renderer: CliRenderer, options: TuiOptions = {}, theme: Theme = currentTheme()): Promise<void> {
  const closed = new Promise<void>((resolve) => renderer.once("destroy", () => resolve()));
  const store = options.store ?? createProjectStore(resolveProject(options.project), options.services ?? defaultServices());
  const screens: readonly Screen[] = options.screens ?? createScreens(store);
  const quit = () => renderer.destroy();

  const app = new BoxRenderable(renderer, {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: theme.background,
  });

  const header = new BoxRenderable(renderer, {
    height: 1,
    flexDirection: "row",
    paddingLeft: 1,
    paddingRight: 1,
    gap: 2,
  });
  const brand = new BoxRenderable(renderer, { flexDirection: "row", flexShrink: 0 });
  brand.add(new TextRenderable(renderer, { content: `${glyphs.block} `, fg: theme.accent, selectable: false }));
  brand.add(new TextRenderable(renderer, { content: manifest.title, fg: theme.textStrong, attributes: TextAttributes.BOLD }));
  brand.add(new TextRenderable(renderer, { content: ` v${manifest.version}`, fg: theme.textDim }));
  header.add(brand);
  header.add(
    new TextRenderable(renderer, {
      content: `${glyphs.separator}  ${store.project}`,
      fg: theme.textDim,
      wrapMode: "none",
      flexGrow: 1,
      flexShrink: 1,
      minWidth: 0,
      height: 1,
    }),
  );
  header.add(
    new TextRenderable(renderer, {
      content: `${process.platform}-${process.arch} ${glyphs.bullet} Bun ${Bun.version}`,
      fg: theme.textDim,
      flexShrink: 0,
      wrapMode: "none",
    }),
  );
  app.add(header);

  const rule = new BoxRenderable(renderer, { height: 1, paddingLeft: 1, paddingRight: 1 });
  rule.add(new TextRenderable(renderer, { content: "─".repeat(400), fg: theme.border, wrapMode: "none", height: 1, selectable: false }));
  app.add(rule);

  // Every tab has the same width with its title centered, so the gaps
  // between titles look even; the selected tab is marked by its background
  // only (no underline row, which rendered as a dashed line one column off).
  // TabSelect keeps two cells of padding and cuts longer names with "…",
  // so the centering works on the inner width and never pads the end.
  // Up to three cells of air on each side, but never wider than the
  // terminal can show for all tabs (80 columns fit seven tabs of 11).
  const longest = Math.max(...screens.map((s) => s.title.length));
  const tabWidth = Math.max(longest + 2, Math.min(longest + 6, Math.floor((renderer.width - 2) / screens.length)));
  const centered = (title: string) => `${" ".repeat(Math.floor((tabWidth - 2 - title.length) / 2))}${title}`;
  const tabs = new TabSelectRenderable(renderer, {
    width: "100%",
    height: 1,
    tabWidth,
    showUnderline: false,
    options: screens.map((s) => ({ name: centered(s.title), description: s.description })),
    backgroundColor: theme.background,
    textColor: theme.textDim,
    focusedBackgroundColor: theme.background,
    focusedTextColor: theme.textDim,
    selectedBackgroundColor: theme.tabActive,
    selectedTextColor: theme.tabActiveText,
    selectedDescriptionColor: theme.textDim,
    showDescription: false,
    showScrollArrows: false,
    wrapSelection: true,
  });
  app.add(tabs);

  const content = new BoxRenderable(renderer, { flexGrow: 1, flexDirection: "column", paddingLeft: 1, paddingRight: 1 });
  app.add(content);

  const globalKeys = [
    { key: "←/→", action: "tab" },
    { key: "1-9", action: "go" },
    { key: "?", action: "help" },
    { key: "q", action: "quit" },
  ];
  let footer = keyBar(renderer, theme, globalKeys);
  app.add(footer);
  renderer.root.add(app);

  const mounted = new Map<string, Renderable>();
  let active: Screen | undefined;
  let helpVisible = false;
  let helpBox: BoxRenderable | undefined;

  const context: ScreenContext = {
    renderer,
    theme,
    goTo: (id) => {
      const index = screens.findIndex((s) => s.id === id);
      if (index >= 0) tabs.setSelectedIndex(index);
    },
    quit,
    prompt: (label, onSubmit) => {
      typing = { label, value: "", onSubmit };
      if (active) refreshFooter(active);
    },
  };

  // Typing modes. Filter (`/`): printable keys go to the query, which the
  // screen applies on every change; Enter keeps it, Esc clears it. Prompt
  // (`ctx.prompt`): the text goes to the screen on Enter; Esc cancels. In
  // both, no global key fires while typing.
  let filtering = false;
  let query = "";
  let typing: { label: string; value: string; onSubmit: (text: string) => void } | undefined;
  const filterKeys = [
    { key: "type", action: "filter" },
    { key: "Enter", action: "keep" },
    { key: "Esc", action: "clear" },
  ];
  const promptKeys = [
    { key: "Enter", action: "confirm" },
    { key: "Esc", action: "cancel" },
  ];
  const refreshFooter = (screen: Screen) => {
    app.remove(footer);
    const own = [...(screen.keys ?? []), ...(screen.filter ? [{ key: "/", action: "filter" }] : [])];
    footer = keyBar(
      renderer,
      theme,
      typing
        ? [{ key: `${typing.label}: ${typing.value}▏`, action: "" }, ...promptKeys]
        : filtering
          ? [{ key: `/${query}`, action: "" }, ...filterKeys]
          : [...own, ...globalKeys],
    );
    app.add(footer);
  };
  const setQuery = (next: string) => {
    query = next;
    active?.filter?.(query);
    if (active) refreshFooter(active);
  };
  /** Printable text of a key press, or undefined for control keys. */
  const printable = (key: KeyEvent): string | undefined => {
    const text = key.sequence ?? "";
    return !key.ctrl && !key.meta && text.length === 1 && text >= " " ? text : undefined;
  };
  /** Handles a key in prompt mode; returns true when consumed. */
  const promptKey = (key: KeyEvent): boolean => {
    if (!typing) return false;
    const current = typing;
    if (key.name === "escape") typing = undefined;
    else if (key.name === "return" || key.name === "enter") {
      typing = undefined;
      const text = current.value.trim();
      if (text) current.onSubmit(text);
    } else if (key.name === "backspace") current.value = current.value.slice(0, -1);
    else {
      const text = printable(key);
      if (text) current.value += text;
    }
    if (active) refreshFooter(active);
    return true;
  };
  /** Handles a key in filter mode; returns true when consumed. */
  const filterKey = (key: KeyEvent): boolean => {
    if (!filtering) return false;
    if (key.name === "escape") {
      filtering = false;
      setQuery("");
      return true;
    }
    if (key.name === "return" || key.name === "enter") {
      filtering = false;
      if (active) refreshFooter(active);
      return true;
    }
    if (key.name === "backspace") {
      setQuery(query.slice(0, -1));
      return true;
    }
    if (["up", "down", "pageup", "pagedown"].includes(key.name)) return false;
    const text = printable(key);
    if (text) setQuery(query + text);
    return true;
  };

  const show = (index: number) => {
    const screen = screens[index];
    if (!screen || screen === active) return;
    if (active) {
      if (query) active.filter?.("");
      filtering = false;
      query = "";
      typing = undefined;
      active.onLeave?.(context);
      const previous = mounted.get(active.id);
      if (previous) content.remove(previous);
    }
    let node = mounted.get(screen.id);
    if (!node) {
      node = screen.mount(context);
      mounted.set(screen.id, node);
    }
    content.add(node);
    active = screen;
    screen.onEnter?.(context);
    refreshFooter(screen);
  };

  const toggleHelp = () => {
    helpVisible = !helpVisible;
    if (helpVisible) {
      helpBox = new BoxRenderable(renderer, {
        position: "absolute",
        right: 2,
        top: 4,
        width: 46,
        flexDirection: "column",
        borderStyle: "rounded",
        borderColor: theme.borderActive,
        backgroundColor: theme.surfaceHigh,
        title: " Keys ",
        titleColor: theme.accent,
        paddingLeft: 1,
        paddingRight: 1,
        zIndex: 10,
      });
      const rows: Array<[string, string]> = [
        ["←  →  [  ]", "previous / next tab"],
        ["Tab", "next tab"],
        ["1 … 9", "go to the tab with that number"],
        ["?", "show or hide this help"],
        ["q  Esc  Ctrl+C", "quit"],
        ["↑ ↓  PgUp PgDn", "move or scroll in a tab"],
      ];
      for (const [k, v] of rows) {
        const row = new BoxRenderable(renderer, { flexDirection: "row" });
        row.add(new TextRenderable(renderer, { content: k.padEnd(16), fg: theme.accent }));
        row.add(new TextRenderable(renderer, { content: v, fg: theme.text }));
        helpBox.add(row);
      }
      renderer.root.add(helpBox);
    } else if (helpBox) {
      renderer.root.remove(helpBox);
      helpBox = undefined;
    }
  };

  tabs.on(TabSelectRenderableEvents.SELECTION_CHANGED, (index: number) => show(index));
  tabs.on(TabSelectRenderableEvents.ITEM_SELECTED, (index: number) => show(index));

  const onKey = (key: KeyEvent) => {
    if (promptKey(key)) return;
    if (filterKey(key)) return;
    if (key.name === "/" || key.sequence === "/") {
      if (active?.filter) {
        filtering = true;
        refreshFooter(active);
        return;
      }
    }
    if (active?.onKey?.(key.name, context)) return;
    switch (key.name) {
      case "q":
      case "escape":
        quit();
        return;
      case "?":
        toggleHelp();
        return;
      case "tab":
        tabs.setSelectedIndex((tabs.getSelectedIndex() + 1) % screens.length);
        return;
      default:
        break;
    }
    if (/^[1-9]$/.test(key.name)) {
      const index = Number(key.name) - 1;
      if (index < screens.length) tabs.setSelectedIndex(index);
    }
  };
  renderer.keyInput.on("keypress", onKey);
  renderer.once("destroy", () => {
    renderer.keyInput.off("keypress", onKey);
    store.stop();
  });

  const initial = options.initialTab ?? defaultInitialTab(screens);
  const initialIndex = Math.max(0, screens.findIndex((s) => s.id === initial));
  tabs.focus();
  tabs.setSelectedIndex(initialIndex);
  show(initialIndex);
  store.start();

  await closed;
}
