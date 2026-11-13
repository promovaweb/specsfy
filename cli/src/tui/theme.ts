/**
 * Specsfy TUI theme.
 *
 * Two palettes: `night` (default) and `day`, both built from the official
 * Specsfy tokens in `brand/tokens.json`. Turquoise marks focus and the active
 * tab, violet marks the selected row and petrol marks surfaces and primary
 * actions. Color names follow their role in the interface, not the hue, so
 * switching palettes never touches the screens. States are always named in
 * text next to the color. The choice comes from `tui.theme` in settings.json.
 */
import { readSettings, getPath } from "../config/settings.ts";

export interface Theme {
  name: string;
  background: string;
  surface: string;
  surfaceHigh: string;
  border: string;
  borderActive: string;
  text: string;
  textDim: string;
  textStrong: string;
  accent: string;
  accentSecondary: string;
  ok: string;
  warn: string;
  error: string;
  /** Background and text of the selected row (violet). */
  selection: string;
  selectionText: string;
  /** Background and text of the active tab (turquoise focus). */
  tabActive: string;
  tabActiveText: string;
  /** Background and text of primary actions and highlighted surfaces (petrol). */
  primary: string;
  primaryText: string;
  barBackground: string;
  barText: string;
  keyBackground: string;
  keyText: string;
}

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

/** Reads `tui.theme` and returns the palette. Any failure falls back to `night`. */
export function currentTheme(): Theme {
  try {
    const name = getPath(readSettings(), "tui.theme");
    if (name === "day") return themes.day;
  } catch {
    // Without readable settings, keep the default palette.
  }
  return themes.night;
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
