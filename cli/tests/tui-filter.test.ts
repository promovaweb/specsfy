/**
 * Filter of the TUI lists: `/` opens the query, typed text narrows the
 * list by label (case and accents ignored), Enter keeps it and Esc clears
 * it. Global keys do not fire while typing.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { filterItems, type SelectItem } from "../src/tui/components.ts";
import { EXAMPLE, isolateHome, mount } from "./tui/helpers.ts";

let restore: () => void;
beforeAll(() => { restore = isolateHome(); });
afterAll(() => restore());

describe("filterItems", () => {
  const items: SelectItem[] = [
    { id: "h1", label: "Draft · 2", header: true },
    { id: "a", label: "0001-cadastro-usuários" },
    { id: "b", label: "0002-busca" },
    { id: "h2", label: "Review · 1", header: true },
    { id: "c", label: "0003-relatórios" },
  ];

  test("keeps matching rows with their header, ignoring case and accents", () => {
    expect(filterItems(items, "USUARIOS").map((item) => item.id)).toEqual(["h1", "a"]);
    expect(filterItems(items, "rel").map((item) => item.id)).toEqual(["h2", "c"]);
  });

  test("an empty query keeps everything and no match returns nothing", () => {
    expect(filterItems(items, "  ")).toHaveLength(items.length);
    expect(filterItems(items, "zzz")).toEqual([]);
  });
});

describe("filter mode", () => {
  test("/ narrows the specs list, Enter keeps it and Esc clears it", async () => {
    const tui = await mount({ project: EXAMPLE, initialTab: "specs", width: 140, height: 40 });
    try {
      await tui.waitFor("0001-diretorio-global-usuarios");
      expect(tui.frame()).toContain("/  filter");
      await tui.press("/");
      for (const key of "0006") await tui.press(key);
      let frame = await tui.waitFor("Specs · /0006");
      // Only the list column counts: the Markdown preview of the previously
      // selected spec loads asynchronously and may still name it for a moment.
      const listRows = (text: string) => text.split("\n").map((line) => line.slice(0, 48)).join("\n");
      expect(listRows(frame)).toContain("0006-produtos");
      expect(listRows(frame)).not.toContain("0001-diretorio-global-usuarios");
      expect(frame).toContain("Specsfy");
      await tui.press("RETURN");
      frame = tui.frame();
      expect(frame).toContain("Specs · /0006");
      await tui.press("/");
      await tui.press("ESCAPE");
      frame = await tui.waitFor(/│ [ >] 0001-diretorio-global-usuarios/);
      expect(frame).not.toContain("· /0006");
    } finally {
      await tui.close();
    }
  });

  test("digits and q typed in the filter do not switch tabs or quit", async () => {
    const tui = await mount({ project: EXAMPLE, initialTab: "specs", width: 140, height: 40 });
    try {
      await tui.waitFor("0001-diretorio-global-usuarios");
      await tui.press("/");
      for (const key of "q7") await tui.press(key);
      const frame = await tui.waitFor("Specs · /q7");
      expect(frame).toContain("Nothing matches");
      expect(tui.setup.renderer.isDestroyed).toBe(false);
    } finally {
      await tui.close();
    }
  });
});
