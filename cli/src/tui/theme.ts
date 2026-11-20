/**
 * Specsfy TUI theme.
 *
 * Three palettes, chosen by `tui.theme` in settings.json:
 *
 * - `terminal` (default): inherits the colors of the terminal theme. Every
 *   token is a reference to the terminal palette (ANSI index 0-15) or to the
 *   terminal default foreground and background, never a fixed RGB value. The
 *   terminal paints them with its own theme (Ghostty, Alacritty, Kitty,
 *   Omarchy, Termius, Herdr and any other), so the TUI follows a theme switch
 *   live and keeps the terminal transparency, because the background is the
 *   terminal default background (SGR 49). The Specsfy brand survives as slot
 *   choices: cyan for the turquoise focus and magenta for the violet
 *   selection.
 * - `night` and `day`: the fixed palettes built from the official Specsfy
 *   tokens in `brand/tokens.json`. Turquoise marks focus and the active tab,
 *   violet marks the selected row and petrol marks surfaces and primary
 *   actions. They look the same on every terminal.
 *
 * When the terminal answers the OSC 4/10/11 palette query, `terminalTheme`
 * receives the real colors and only chooses WHICH palette slot fills each
 * role (dim text readable on the background, a visible selection shade,
 * accents with contrast). The result is still made of palette references.
 *
 * Color names follow their role in the interface, not the hue, so switching
 * palettes never touches the screens. States are always named in text next
 * to the color. Colors exist only in this file.
 */
import { RGBA, type CliRenderer, type ColorInput, type TerminalColors } from "@opentui/core";
import { readSettings, getPath } from "../config/settings.ts";

/** Names accepted by `tui.theme`. */
export type ThemeName = "terminal" | "night" | "day";

/** Theme names, the first one is the default. */
export const THEME_NAMES: readonly ThemeName[] = ["terminal", "night", "day"];

export interface Theme {
  name: ThemeName;
  background: ColorInput;
  surface: ColorInput;
  surfaceHigh: ColorInput;
  border: ColorInput;
  borderActive: ColorInput;
  text: ColorInput;
  textDim: ColorInput;
  textStrong: ColorInput;
  accent: ColorInput;
  accentSecondary: ColorInput;
  ok: ColorInput;
  warn: ColorInput;
  error: ColorInput;
  /** Background and text of the selected row (violet). */
  selection: ColorInput;
  selectionText: ColorInput;
  /** Background and text of the active tab (turquoise focus). */
  tabActive: ColorInput;
  tabActiveText: ColorInput;
  /** Background and text of primary actions and highlighted surfaces (petrol). */
  primary: ColorInput;
  primaryText: ColorInput;
  barBackground: ColorInput;
  barText: ColorInput;
  keyBackground: ColorInput;
  keyText: ColorInput;
}

/** ANSI slots of the 16-color palette, by name. */
export const ANSI = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  brightBlack: 8,
  brightRed: 9,
  brightGreen: 10,
  brightYellow: 11,
  brightBlue: 12,
  brightMagenta: 13,
  brightCyan: 14,
  brightWhite: 15,
} as const;

/** Fixed RGB palettes of the Specsfy brand. */
export const themes: Record<"night" | "day", Theme> = {
  night: {
    name: "night",
    background: "#000A0E",
    surface: "#001117",
    surfaceHigh: "#03212A",
    border: "#2D4C58",
    borderActive: "#5EEDE1",
    text: "#F2F8F9",
    textDim: "#869EA8",
    textStrong: "#FFFFFF",
    accent: "#5EEDE1",
    accentSecondary: "#C4B5FD",
    ok: "#6EE7B7",
    warn: "#FCD34D",
    error: "#FCA5A5",
    selection: "#6D28D9",
    selectionText: "#F2F8F9",
    tabActive: "#5EEDE1",
    tabActiveText: "#001117",
    primary: "#15626A",
    primaryText: "#F2F8F9",
    barBackground: "#001117",
    barText: "#B2C6CE",
    keyBackground: "#15626A",
    keyText: "#F2F8F9",
  },
  day: {
    name: "day",
    background: "#FFFFFF",
    surface: "#F2F8F9",
    surfaceHigh: "#E4EBEE",
    border: "#C9D6DC",
    borderActive: "#15626A",
    text: "#001117",
    textDim: "#2D4C58",
    textStrong: "#000A0E",
    accent: "#15626A",
    accentSecondary: "#6D28D9",
    ok: "#047857",
    warn: "#92400E",
    error: "#B91C1C",
    selection: "#6D28D9",
    selectionText: "#FFFFFF",
    tabActive: "#15626A",
    tabActiveText: "#FFFFFF",
    primary: "#15626A",
    primaryText: "#FFFFFF",
    barBackground: "#E4EBEE",
    barText: "#0C2E3A",
    keyBackground: "#15626A",
    keyText: "#FFFFFF",
  },
};

/** Which slot fills each role of the `terminal` theme. `"bg"` and `"fg"` are the terminal defaults. */
export interface TerminalSlots {
  surfaceHigh: number | "bg";
  border: number;
  textDim: number | "fg";
  accent: number;
  accentSecondary: number;
  ok: number;
  warn: number;
  error: number;
  /** Text over the accent block of the key bar, the active tab and primary actions. */
  keyText: number | "fg";
  /** Background of the selected row. */
  selection: number;
  /** Text over the selected row. */
  selectionText: number | "fg";
}

/**
 * Slots of the `terminal` theme. They are the brand of the binary in this
 * theme: cyan carries the turquoise focus and magenta the violet
 * selection, instead of fixed colors, so the TUI keeps inheriting the
 * terminal theme. Used as they are when the terminal does not report its
 * colors.
 */
export const DEFAULT_TERMINAL_SLOTS: Readonly<TerminalSlots> = Object.freeze({
  surfaceHigh: "bg",
  border: ANSI.brightBlack,
  textDim: ANSI.brightBlack,
  accent: ANSI.cyan,
  accentSecondary: ANSI.magenta,
  ok: ANSI.green,
  warn: ANSI.yellow,
  error: ANSI.red,
  keyText: "fg",
  selection: ANSI.magenta,
  selectionText: "fg",
});

/** Parses `#rrggbb` (or `#rgb`) into 0-255 channels; `null` for anything else. */
function parseHex(hex: string | null | undefined): [number, number, number] | null {
  if (!hex) return null;
  let value = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(value)) value = value.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG relative luminance of an sRGB color. */
function luminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colors, from 1 to 21. */
export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Chooses the palette slots from the colors the terminal reported.
 * Without a usable background, foreground and all 16 slots it returns the defaults, so a
 * terminal that ignores the query still gets a correct theme.
 */
export function chooseTerminalSlots(colors?: TerminalColors | null): TerminalSlots {
  const slots: TerminalSlots = { ...DEFAULT_TERMINAL_SLOTS };
  const bg = parseHex(colors?.defaultBackground);
  const fg = parseHex(colors?.defaultForeground);
  if (!colors || !bg || !fg) return slots;
  // A partial response cannot establish contrast for every role. Keep the
  // fallback intact instead of selecting slots whose colors are unknown.
  if (colors.palette.length < 16 || Array.from({ length: 16 }, (_, i) => parseHex(colors.palette[i])).some((color) => !color)) return slots;
  const slot = (index: number) => parseHex(colors.palette[index]);
  const vsBg = (index: number) => {
    const color = slot(index);
    return color ? contrast(color, bg) : 0;
  };

  // Dim text: the first gray readable on the background but quieter than the
  // foreground. Some themes paint bright black equal to the background.
  const fgContrast = contrast(fg, bg);
  const dim = [ANSI.brightBlack, ANSI.white].find((i) => vsBg(i) >= 2.2 && vsBg(i) < fgContrast);
  slots.textDim = dim ?? "fg";

  // Borders may be fainter than dim text, but never invisible.
  slots.border = [ANSI.brightBlack, ANSI.black, ANSI.white].find((i) => vsBg(i) >= 1.35) ?? ANSI.white;

  // Selection shade: close to the background, with the foreground readable on it.
  const shade = [ANSI.black, ANSI.brightBlack].find((i) => {
    const color = slot(i);
    if (!color) return false;
    const c = contrast(color, bg);
    return c >= 1.08 && c <= 2.6 && contrast(fg, color) >= 4;
  });
  slots.surfaceHigh = shade ?? "bg";

  // Accents: keep the configured slot, switch between its normal and bright
  // variant (index ± 8) when the configured one almost disappears here.
  const readable = (configured: number) => {
    const other = configured < 8 ? configured + 8 : configured - 8;
    return vsBg(configured) >= 2.5 || vsBg(other) <= vsBg(configured) ? configured : other;
  };
  slots.accent = readable(DEFAULT_TERMINAL_SLOTS.accent);
  slots.accentSecondary = readable(DEFAULT_TERMINAL_SLOTS.accentSecondary);
  slots.ok = readable(DEFAULT_TERMINAL_SLOTS.ok);
  slots.warn = readable(DEFAULT_TERMINAL_SLOTS.warn);
  slots.error = readable(DEFAULT_TERMINAL_SLOTS.error);

  // Selected row: the violet slot (normal or bright) where text reads best.
  slots.selection = readable(DEFAULT_TERMINAL_SLOTS.selection);

  // Text over a colored block: the candidate with the most contrast. ANSI has
  // no "default background" foreground, so the terminal background color
  // itself is not a candidate.
  const textOver = (block: [number, number, number] | null): number | "fg" => {
    if (!block) return "fg";
    const candidates: Array<[number | "fg", [number, number, number] | null]> = [
      ["fg", fg],
      [ANSI.black, slot(ANSI.black)],
      [ANSI.brightWhite, slot(ANSI.brightWhite)],
    ];
    let best: [number | "fg", number] = ["fg", contrast(fg, block)];
    for (const [name, color] of candidates) {
      if (color && contrast(color, block) > best[1]) best = [name, contrast(color, block)];
    }
    return best[0];
  };
  slots.keyText = textOver(slot(slots.accent));
  slots.selectionText = textOver(slot(slots.selection));
  return slots;
}

/**
 * Builds the `terminal` theme. Every color is a palette reference, so the
 * terminal draws it with its current theme.
 */
export function terminalTheme(colors?: TerminalColors | null): Theme {
  const slots = chooseTerminalSlots(colors);
  const background = RGBA.defaultBackground();
  const foreground = RGBA.defaultForeground();
  const ref = (slot: number | "bg" | "fg") => (slot === "bg" ? RGBA.defaultBackground() : slot === "fg" ? RGBA.defaultForeground() : RGBA.fromIndex(slot));
  return {
    name: "terminal",
    background,
    surface: RGBA.defaultBackground(),
    surfaceHigh: ref(slots.surfaceHigh),
    border: ref(slots.border),
    borderActive: ref(slots.accent),
    text: foreground,
    textDim: ref(slots.textDim),
    textStrong: RGBA.defaultForeground(),
    accent: ref(slots.accent),
    accentSecondary: ref(slots.accentSecondary),
    ok: ref(slots.ok),
    warn: ref(slots.warn),
    error: ref(slots.error),
    selection: ref(slots.selection),
    selectionText: ref(slots.selectionText),
    tabActive: ref(slots.accent),
    tabActiveText: ref(slots.keyText),
    primary: ref(slots.accent),
    primaryText: ref(slots.keyText),
    barBackground: RGBA.defaultBackground(),
    barText: ref(slots.textDim),
    keyBackground: ref(slots.accent),
    keyText: ref(slots.keyText),
  };
}

/** Reads `tui.theme`. Any failure or unknown value gives `terminal`. */
export function themeName(): ThemeName {
  try {
    const name = getPath(readSettings(), "tui.theme");
    if (typeof name === "string" && (THEME_NAMES as readonly string[]).includes(name)) return name as ThemeName;
  } catch {
    // Without readable settings, keep the default theme.
  }
  return "terminal";
}

/** Returns the configured palette without asking the terminal anything. */
export function currentTheme(): Theme {
  const name = themeName();
  return name === "terminal" ? terminalTheme() : themes[name];
}

/**
 * Returns the configured palette, refined by the colors the terminal reports.
 * Only the `terminal` theme asks; the query has a short timeout and any
 * failure keeps the default slots, so a silent terminal never delays or
 * breaks the TUI.
 */
export async function resolveTheme(renderer: CliRenderer, timeoutMs = 300): Promise<Theme> {
  const name = themeName();
  if (name !== "terminal") return themes[name];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // getPalette may reuse an earlier detection with a longer timeout. Bound
    // our wait independently so that query cannot hold up the first frame;
    // the margin lets an answer that lands at the end of its own wait count.
    const colors = await Promise.race([
      renderer.getPalette({ size: 16, timeout: timeoutMs }),
      new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs + 100); }),
    ]);
    return terminalTheme(colors);
  } catch {
    return terminalTheme();
  } finally {
    clearTimeout(timer);
  }
}

/** Glyphs used by the screens; all fit in one cell. */
export const glyphs = {
  bullet: "•",
  arrow: "→",
  ok: "✓",
  warn: "!",
  error: "✗",
  pending: "○",
  running: "…",
  separator: "│",
  block: "▌",
  barFull: "█",
  barEmpty: "░",
};
