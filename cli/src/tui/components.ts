/**
 * Visual components shared by the screens.
 *
 * `panel` creates a box with a rounded border and a title. `keyValueRow`
 * builds "label  value" with a dimmed label. `list` stacks items with a
 * marker. `listPanel` and `selectList` are keyboard lists (the second keeps
 * the selection by id when its items change); `scrollText` and
 * `markdownView` are scrollable readers for command output and Markdown.
 * Everything receives the theme so screens never hard-code colors.
 */
import {
  ScrollBoxRenderable,
  BoxRenderable,
  TextRenderable,
  TextAttributes,
  MarkdownRenderable,
  SyntaxStyle,
  RGBA,
  type CliRenderer,
} from "@opentui/core";
import { glyphs, type Theme } from "./theme.ts";

/** Creates a themed bordered panel. */
export function panel(
  renderer: CliRenderer,
  theme: Theme,
  options: { title: string; flexGrow?: number; width?: number | "auto" | `${number}%`; height?: number | "auto" | `${number}%`; active?: boolean },
): BoxRenderable {
  return new BoxRenderable(renderer, {
    flexGrow: options.flexGrow,
    width: options.width,
    height: options.height,
    flexDirection: "column",
    borderStyle: "rounded",
    borderColor: options.active ? theme.borderActive : theme.border,
    title: ` ${options.title} `,
    titleColor: options.active ? theme.accent : theme.textDim,
    backgroundColor: theme.surface,
    paddingLeft: 1,
    paddingRight: 1,
  });
}

/** Creates one aligned key/value row. */
export function keyValueRow(
  renderer: CliRenderer,
  theme: Theme,
  key: string,
  value: string,
  keyWidth: number,
  valueColor?: string,
): BoxRenderable {
  const row = new BoxRenderable(renderer, { flexDirection: "row", height: 1 });
  row.add(new TextRenderable(renderer, { content: key.padEnd(keyWidth), fg: theme.textDim, selectable: false, flexShrink: 0 }));
  row.add(new TextRenderable(renderer, { content: "  ", flexShrink: 0 }));
  row.add(new TextRenderable(renderer, { content: value, fg: valueColor ?? theme.text, wrapMode: "none" }));
  return row;
}

/** Creates aligned key/value rows. */
export function keyValueTable(renderer: CliRenderer, theme: Theme, pairs: Array<[string, string, string?]>): BoxRenderable {
  const box = new BoxRenderable(renderer, { flexDirection: "column" });
  const width = Math.max(...pairs.map(([k]) => k.length));
  for (const [k, v, c] of pairs) box.add(keyValueRow(renderer, theme, k, v, width, c));
  return box;
}

/** Creates a strong heading. */
export function heading(renderer: CliRenderer, theme: Theme, text: string): TextRenderable {
  return new TextRenderable(renderer, { content: text, fg: theme.textStrong, attributes: TextAttributes.BOLD });
}

/** Creates secondary text. */
export function dim(renderer: CliRenderer, theme: Theme, text: string): TextRenderable {
  return new TextRenderable(renderer, { content: text, fg: theme.textDim });
}

/** Creates a static bulleted list. */
export function list(renderer: CliRenderer, theme: Theme, items: string[], marker = glyphs.bullet): BoxRenderable {
  const box = new BoxRenderable(renderer, { flexDirection: "column" });
  for (const item of items) {
    const row = new BoxRenderable(renderer, { flexDirection: "row" });
    row.add(new TextRenderable(renderer, { content: `${marker} `, fg: theme.accent }));
    row.add(new TextRenderable(renderer, { content: item, fg: theme.text }));
    box.add(row);
  }
  return box;
}

/** Creates vertical spacing. */
export function spacer(renderer: CliRenderer, height = 1): BoxRenderable {
  return new BoxRenderable(renderer, { height });
}

/**
 * Creates a scrollable selection list. move changes the highlight silently;
 * select highlights and activates an item. Empty lists return selected() = -1.
 * Screens may forward keys to box.handleKeyPress or call move/select in onKey.
 */
export function listPanel(renderer: CliRenderer, theme: Theme, options: {
  title: string;
  items: string[];
  onSelect?: (index: number) => void;
}) {
  const box = new ScrollBoxRenderable(renderer, {
    title: ` ${options.title} `, titleColor: theme.accent,
    borderStyle: "rounded", borderColor: theme.borderActive,
    backgroundColor: theme.surface, paddingLeft: 1, paddingRight: 1,
    flexGrow: 1, minHeight: 0, scrollY: true, scrollX: false,
    contentOptions: { flexDirection: "column" },
  });
  let index = options.items.length ? 0 : -1;
  const rows = options.items.map((item) => {
    const row = new TextRenderable(renderer, { content: item, height: 1, flexShrink: 0, wrapMode: "none", fg: theme.text });
    box.add(row);
    return row;
  });
  const highlight = (next: number) => {
    if (!rows.length || !Number.isFinite(next)) return;
    index = Math.max(0, Math.min(rows.length - 1, Math.trunc(next)));
    rows.forEach((row, i) => {
      row.content = `${i === index ? ">" : " "} ${options.items[i]}`;
      row.fg = i === index ? theme.selectionText : theme.text;
      row.bg = i === index ? theme.selection : theme.surface;
    });
    box.scrollChildIntoView(rows[index]!);
  };
  const select = (next: number) => {
    if (!rows.length || !Number.isFinite(next)) return;
    highlight(next);
    options.onSelect?.(index);
  };
  const move = (delta: number) => highlight(index + delta);
  box.handleKeyPress = (key) => {
    if (key.name === "up" || key.name === "k") { move(-1); return true; }
    if (key.name === "down" || key.name === "j") { move(1); return true; }
    if (key.name === "return" || key.name === "enter") { select(index); return true; }
    return false;
  };
  highlight(index);
  return { box, select, selected: () => index, move };
}

/** One row of `selectList`. Headers are shown but never selected. */
export interface SelectItem {
  /** Stable identifier; the selection follows it across `setItems`. */
  id: string;
  label: string;
  header?: boolean;
  /** Foreground of the row when it is not selected. */
  color?: string;
}

/**
 * Creates a scrollable list whose items can be replaced without rebuilding
 * the screen. The selection is kept by id when the items change, so an
 * automatic reload never activates a different object. Headers group rows
 * (for example, by spec state) and are skipped by `move`. `onChange` fires
 * when the selected id changes, including the first selection.
 */
export function selectList(renderer: CliRenderer, theme: Theme, options: {
  title: string;
  emptyText: string;
  active?: boolean;
  width?: number | `${number}%`;
  flexGrow?: number;
  onChange?: (item: SelectItem | undefined) => void;
}) {
  const box = new ScrollBoxRenderable(renderer, {
    title: ` ${options.title} `, titleColor: options.active ? theme.accent : theme.textDim,
    borderStyle: "rounded", borderColor: options.active ? theme.borderActive : theme.border,
    backgroundColor: theme.surface, paddingLeft: 1, paddingRight: 1,
    width: options.width, flexGrow: options.flexGrow, flexShrink: options.width ? 0 : 1,
    minHeight: 0, minWidth: 0, scrollY: true, scrollX: false,
    contentOptions: { flexDirection: "column" },
  });
  let items: SelectItem[] = [];
  let rows: TextRenderable[] = [];
  let index = -1;
  let lastId: string | undefined;

  const paint = () => {
    rows.forEach((row, i) => {
      const item = items[i]!;
      const selected = i === index;
      if (item.header) {
        row.content = item.label;
        row.fg = theme.textStrong;
        row.bg = theme.surface;
        row.attributes = TextAttributes.BOLD;
        return;
      }
      row.content = `${selected ? ">" : " "} ${item.label}`;
      row.fg = selected ? theme.selectionText : item.color ?? theme.text;
      row.bg = selected ? theme.selection : theme.surface;
    });
    const row = rows[index];
    if (row) box.scrollChildIntoView(row);
  };
  const notify = () => {
    const item = index >= 0 ? items[index] : undefined;
    if (item?.id === lastId) return;
    lastId = item?.id;
    options.onChange?.(item);
  };
  const firstSelectable = (from: number, step: 1 | -1): number => {
    for (let i = from; i >= 0 && i < items.length; i += step) if (!items[i]!.header) return i;
    return -1;
  };
  const setItems = (next: SelectItem[]) => {
    const keep = index >= 0 ? items[index]?.id : undefined;
    for (const row of rows) { box.remove(row); row.destroy(); }
    items = next;
    const list = items.length ? items : [{ id: "", label: options.emptyText, header: true }];
    rows = list.map((item) => {
      const row = new TextRenderable(renderer, { content: item.label, height: 1, flexShrink: 0, wrapMode: "none", fg: theme.text });
      box.add(row);
      return row;
    });
    if (!items.length) {
      rows[0]!.fg = theme.textDim;
      index = -1;
    } else {
      const kept = keep === undefined ? -1 : items.findIndex((item) => item.id === keep && !item.header);
      index = kept >= 0 ? kept : firstSelectable(Math.min(Math.max(index, 0), items.length - 1), 1);
      if (index < 0) index = firstSelectable(items.length - 1, -1);
    }
    if (items.length) paint();
    notify();
  };
  const move = (delta: number) => {
    if (index < 0) return;
    const step = delta > 0 ? 1 : -1;
    let target = index;
    for (let moved = 0; moved < Math.abs(delta); moved++) {
      const next = firstSelectable(target + step, step);
      if (next < 0) break;
      target = next;
    }
    if (target === index) return;
    index = target;
    paint();
    notify();
  };
  const selectId = (id: string) => {
    const found = items.findIndex((item) => item.id === id && !item.header);
    if (found < 0) return;
    index = found;
    paint();
    notify();
  };
  setItems([]);
  return { box, setItems, move, selectId, selected: (): SelectItem | undefined => (index >= 0 ? items[index] : undefined) };
}

/**
 * Creates a bordered, scrollable block of plain text, used for command
 * output. `follow` keeps the view at the end while lines arrive, unless the
 * person scrolled up to read earlier lines.
 */
export function scrollText(renderer: CliRenderer, theme: Theme, options: { title: string; flexGrow?: number; follow?: boolean }) {
  const box = new ScrollBoxRenderable(renderer, {
    title: ` ${options.title} `, titleColor: theme.textDim,
    borderStyle: "rounded", borderColor: theme.border,
    backgroundColor: theme.surface, paddingLeft: 1, paddingRight: 1,
    flexGrow: options.flexGrow ?? 1, minHeight: 0, minWidth: 0, scrollY: true, scrollX: false,
    stickyScroll: options.follow ?? false, stickyStart: options.follow ? "bottom" : undefined,
    contentOptions: { flexDirection: "column" },
  });
  const text = new TextRenderable(renderer, { content: "", fg: theme.text, wrapMode: "char", width: "100%" });
  box.add(text);
  return {
    box,
    text,
    setText: (content: string, color?: string) => {
      text.content = content;
      text.fg = color ?? theme.text;
    },
    setTitle: (title: string) => { box.title = ` ${title} `; },
    scroll: (delta: number) => box.scrollBy(delta),
  };
}

/** Syntax style of the Markdown views, derived from the theme. */
export function markdownStyle(renderer: CliRenderer, theme: Theme): SyntaxStyle {
  const color = (hex: string) => RGBA.fromHex(hex);
  return SyntaxStyle.fromStyles({
    "markup.heading": { fg: color(theme.accent), bold: true },
    "markup.heading.1": { fg: color(theme.accent), bold: true },
    "markup.heading.2": { fg: color(theme.accent), bold: true },
    "markup.heading.3": { fg: color(theme.accentSecondary), bold: true },
    "markup.strong": { fg: color(theme.textStrong), bold: true },
    "markup.italic": { fg: color(theme.text), italic: true },
    "markup.list": { fg: color(theme.accentSecondary) },
    "markup.raw": { fg: color(theme.ok) },
    "markup.link": { fg: color(theme.accentSecondary), underline: true },
    "markup.link.url": { fg: color(theme.textDim) },
    "markup.quote": { fg: color(theme.textDim), italic: true },
    conceal: { fg: color(theme.textDim) },
    default: { fg: color(theme.text) },
  }, renderer.nativeScene);
}

/**
 * Creates a bordered, scrollable Markdown view. `setMarkdown` replaces the
 * document and returns to the top; `scroll` moves the reading position.
 */
export function markdownView(renderer: CliRenderer, theme: Theme, options: { title: string; flexGrow?: number; style: SyntaxStyle }) {
  const box = new ScrollBoxRenderable(renderer, {
    title: ` ${options.title} `, titleColor: theme.textDim,
    borderStyle: "rounded", borderColor: theme.border,
    backgroundColor: theme.surface, paddingLeft: 1, paddingRight: 1,
    flexGrow: options.flexGrow ?? 1, minHeight: 0, minWidth: 0, scrollY: true, scrollX: false,
    contentOptions: { flexDirection: "column" },
  });
  const markdown = new MarkdownRenderable(renderer, {
    content: "", syntaxStyle: options.style, conceal: true, width: "100%",
    tableOptions: { style: "grid", borderStyle: "rounded", borderColor: theme.border, wrapMode: "word" },
  });
  box.add(markdown);
  let current = "";
  return {
    box,
    setMarkdown: (content: string) => {
      if (content === current) return;
      current = content;
      markdown.content = content;
      box.scrollTo(0);
    },
    setTitle: (title: string) => { box.title = ` ${title} `; },
    scroll: (delta: number) => box.scrollBy(delta),
  };
}

/** Text progress bar such as `█████░░░░░ 50%`. */
export function progressBar(percent: number, width = 20): string {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  const full = Math.round((value / 100) * width);
  return `${glyphs.barFull.repeat(full)}${glyphs.barEmpty.repeat(width - full)} ${value}%`;
}

/** Fits a label into a fixed number of cells, cutting with an ellipsis. */
export function fit(text: string, width: number): string {
  if (width <= 0) return "";
  if (text.length <= width) return text.padEnd(width);
  return `${text.slice(0, Math.max(0, width - 1))}…`;
}
