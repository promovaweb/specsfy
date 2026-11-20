/** Verifies terminal palette references, contrast, configuration and TUI mounting. */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RGBA, type CliRenderer, type TerminalColors } from "@opentui/core";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../src/config/paths.ts";
import { writeSettings } from "../src/config/settings.ts";
import { mount } from "./tui/helpers.ts";
import { chooseTerminalSlots, contrast, DEFAULT_TERMINAL_SLOTS, resolveTheme, terminalTheme, themeName, themes, type Theme } from "../src/tui/theme.ts";

/** Builds an OSC response with only palette and default colors populated. */
function palette(colors: string[], foreground: string, background: string): TerminalColors {
  return {
    palette: colors, defaultForeground: foreground, defaultBackground: background,
    cursorColor: null, mouseForeground: null, mouseBackground: null,
    tekForeground: null, tekBackground: null, highlightBackground: null, highlightForeground: null,
  };
}

// Official terminal exports, in ANSI slot order (0-15).
// https://github.com/folke/tokyonight.nvim/blob/main/extras/alacritty/tokyonight_night.toml
const tokyo = palette([
  "#15161e", "#f7768e", "#9ece6a", "#e0af68", "#7aa2f7", "#bb9af7", "#7dcfff", "#a9b1d6",
  "#414868", "#ff899d", "#9fe044", "#faba4a", "#8db0ff", "#c7a9ff", "#a4daff", "#c0caf5",
], "#c0caf5", "#1a1b26");
// https://github.com/altercation/solarized/blob/master/xresources/solarized
const solarizedDark = palette([
  "#073642", "#dc322f", "#859900", "#b58900", "#268bd2", "#d33682", "#2aa198", "#eee8d5",
  "#002b36", "#cb4b16", "#586e75", "#657b83", "#839496", "#6c71c4", "#93a1a1", "#fdf6e3",
], "#839496", "#002b36");
// Light mode uses the alternative S_base definitions in the same official export.
const solarizedLight = palette([
  "#eee8d5", "#dc322f", "#859900", "#b58900", "#268bd2", "#d33682", "#2aa198", "#073642",
  "#fdf6e3", "#cb4b16", "#93a1a1", "#839496", "#657b83", "#6c71c4", "#586e75", "#002b36",
], "#657b83", "#fdf6e3");
// https://github.com/morhetz/gruvbox-contrib/blob/master/st/gruvbox-dark.h
const gruvbox = palette([
  "#282828", "#cc241d", "#98971a", "#d79921", "#458588", "#b16286", "#689d6a", "#a89984",
  "#928374", "#fb4934", "#b8bb26", "#fabd2f", "#83a598", "#d3869b", "#8ec07c", "#ebdbb2",
], "#ebdbb2", "#282828");

/** Converts a fixture's full hex color to RGB channels for contrast assertions. */
function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)) as [number, number, number];
}

/** Asserts every color remains a terminal reference, including refined themes. */
function expectReferences(theme: Theme): void {
  for (const [name, color] of Object.entries(theme)) {
    if (name === "name") continue;
    expect(color).toBeInstanceOf(RGBA);
    const reference = color as RGBA;
    expect(["indexed", "default"]).toContain(reference.intent);
    if (reference.intent === "indexed") {
      expect(Number.isInteger(reference.slot)).toBe(true);
      expect(reference.slot!).toBeGreaterThanOrEqual(0);
      expect(reference.slot!).toBeLessThanOrEqual(15);
    }
  }
}

describe("terminal palette", () => {
  test("uses only references and preserves default surfaces without a response", () => {
    const theme = terminalTheme();
    expectReferences(theme);
    expect((theme.background as RGBA).intent).toBe("default");
    expect((theme.surface as RGBA).intent).toBe("default");
    // Specsfy brand: turquoise focus on cyan, violet selection on magenta.
    expect((theme.accent as RGBA).slot).toBe(6);
    expect((theme.tabActive as RGBA).slot).toBe(6);
    expect((theme.selection as RGBA).slot).toBe(5);
  });

  for (const [name, colors] of Object.entries({ tokyo, solarizedDark, gruvbox, solarizedLight })) {
    test(`${name} selects readable roles within the ANSI palette`, () => {
      const slots = chooseTerminalSlots(colors);
      const bg = rgb(colors.defaultBackground!);
      const fg = rgb(colors.defaultForeground!);
      const color = (slot: number | "fg" | "bg") => slot === "fg" ? fg : slot === "bg" ? bg : rgb(colors.palette[slot]!);
      expectReferences(terminalTheme(colors));
      expect(contrast(color(slots.textDim), bg)).toBeGreaterThanOrEqual(2.2);
      expect(contrast(color(slots.border), bg)).toBeGreaterThanOrEqual(1.35);
      for (const role of ["accent", "accentSecondary", "ok", "warn", "error"] as const) {
        expect(contrast(color(slots[role]), bg)).toBeGreaterThanOrEqual(2.5);
      }
      // A 16-color palette cannot always provide 4.5:1 on its blue block.
      // Require 3:1 and the best contrast among the supported neutral candidates.
      const keyContrast = contrast(color(slots.keyText), color(slots.accent));
      expect(keyContrast).toBeGreaterThanOrEqual(3);
      for (const candidate of ["fg", 0, 15] as const) {
        expect(keyContrast).toBeGreaterThanOrEqual(contrast(color(candidate), color(slots.accent)));
      }
      // The violet selection keeps the best neutral text over its block.
      expect(contrast(color(slots.selection), bg)).toBeGreaterThanOrEqual(2.5);
      const selectionContrast = contrast(color(slots.selectionText), color(slots.selection));
      for (const candidate of ["fg", 0, 15] as const) {
        expect(selectionContrast).toBeGreaterThanOrEqual(contrast(color(candidate), color(slots.selection)));
      }
      if (slots.surfaceHigh !== "bg") {
        expect(contrast(color(slots.surfaceHigh), bg)).toBeGreaterThanOrEqual(1.08);
        expect(contrast(color(slots.surfaceHigh), bg)).toBeLessThanOrEqual(2.6);
        expect(contrast(fg, color(slots.surfaceHigh))).toBeGreaterThanOrEqual(4);
      }
      if (name === "solarizedDark") expect(slots.textDim).not.toBe(8);
      if (name === "gruvbox") expect(slots.surfaceHigh).not.toBe(0);
    });
  }

  test("returns defaults for null, partial and invalid responses", () => {
    const invalid = [
      undefined, null, palette([], "#ffffff", "#000000"),
      { ...tokyo, defaultForeground: null }, { ...tokyo, defaultBackground: "#xyz" },
      { ...tokyo, palette: tokyo.palette.slice(0, 8) },
      { ...tokyo, palette: tokyo.palette.map((value, i) => i === 8 ? null : value) },
      { ...tokyo, palette: tokyo.palette.map((value, i) => i === 4 ? "#nothex" : value) },
    ];
    for (const colors of invalid) expect(chooseTerminalSlots(colors)).toEqual(DEFAULT_TERMINAL_SLOTS);
  });

  test("contrast is symmetric with known black and white endpoints", () => {
    expect(contrast([0, 0, 0], [255, 255, 255])).toBe(21);
    expect(contrast([255, 255, 255], [0, 0, 0])).toBe(21);
    expect(contrast([32, 64, 96], [32, 64, 96])).toBe(1);
  });
});

describe("theme resolution", () => {
  let directory: string;
  let previous: Map<string, string | undefined>;
  beforeEach(() => {
    previous = new Map([HOME_VARIABLE, MASTER_KEY_VARIABLE].map((key) => [key, process.env[key]]));
    directory = mkdtempSync(join(tmpdir(), "specsfy-theme-"));
    process.env[HOME_VARIABLE] = directory;
    delete process.env[MASTER_KEY_VARIABLE];
  });
  afterEach(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  });

  test("a rejected palette query keeps default references", async () => {
    const getPalette = mock(async () => { throw new Error("Unsupported OSC query"); });
    expect(await resolveTheme({ getPalette } as unknown as CliRenderer)).toEqual(terminalTheme());
    expect(getPalette).toHaveBeenCalledWith({ size: 16, timeout: 300 });
  });

  test("a palette response refines the slots", async () => {
    const getPalette = mock(async () => solarizedDark);
    const theme = await resolveTheme({ getPalette } as unknown as CliRenderer);
    expect(theme).toEqual(terminalTheme(solarizedDark));
    expect(theme.textDim).not.toEqual(terminalTheme().textDim);
    expect(getPalette).toHaveBeenCalledTimes(1);
  });

  test("a pending palette query cannot hold up mounting beyond the timeout", async () => {
    const getPalette = mock(() => new Promise<TerminalColors>(() => {}));
    // The outer deadline bounds this regression test without leaving a timer behind.
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        resolveTheme({ getPalette } as unknown as CliRenderer, 10),
        new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), 200); }),
      ]);
      expect(result).toEqual(terminalTheme());
    } finally {
      clearTimeout(timer);
    }
  });

  for (const name of ["night", "day"] as const) {
    test(`${name} skips the terminal query`, async () => {
      writeSettings({ tui: { theme: name } });
      const getPalette = mock(async () => tokyo);
      expect(await resolveTheme({ getPalette } as unknown as CliRenderer)).toBe(themes[name]);
      expect(getPalette).not.toHaveBeenCalled();
    });
  }

  test("unknown settings fall back to terminal", () => {
    writeSettings({ tui: { theme: "unknown" } });
    expect(themeName()).toBe("terminal");
  });

  test("terminal is the default theme", () => {
    expect(themeName()).toBe("terminal");
  });

  test("mounts terminal references and displays Overview", async () => {
    const tui = await mount({ initialTab: "overview", theme: terminalTheme(tokyo) });
    try {
      expect(await tui.waitFor("Overview")).toContain("Overview");
    } finally {
      await tui.close();
    }
  });
});
