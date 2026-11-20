/**
 * More TUI actions on a writable copy of the demo project: undo of the last
 * marked item (`u`), effort (`e`), backlog item (`b`), processing an inbox
 * capture (`p`), Enter on an Overview spec, project verify (`v`) and mouse
 * clicks on list rows and tabs.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EXAMPLE, fakeServices, isolateHome, mount } from "./tui/helpers.ts";

const DEMO = join(import.meta.dir, "fixtures", "showcase-project");
let restore: () => void;
let project: string;

beforeAll(() => {
  restore = isolateHome();
  project = join(mkdtempSync(join(tmpdir(), "specsfy-actions-more-")), "loja");
  cpSync(DEMO, project, { recursive: true });
  cpSync(join(EXAMPLE, ".specsfy"), join(project, ".specsfy"), { recursive: true });
});
afterAll(() => {
  restore();
  rmSync(join(project, ".."), { recursive: true, force: true });
});

/** Mounts the TUI on the copy and filters the specs list down to `slug`. */
async function onSpec(slug: string) {
  const tui = await mount({ project, initialTab: "specs", width: 140, height: 40 });
  await tui.waitFor("0001-catalogo-de-produtos");
  await tui.press("/");
  for (const key of slug) await tui.press(key);
  await tui.press("RETURN");
  await tui.waitFor(`> ${slug}`);
  return tui;
}

describe("specs", () => {
  test("u undoes the item marked with Space", async () => {
    const tui = await onSpec("0005-avaliacoes-de-produtos");
    const file = join(project, "specs", "in-progress", "0005-avaliacoes-de-produtos", "spec.md");
    const before = readFileSync(file, "utf8");
    try {
      await tui.press("u");
      await tui.waitFor("Nothing to undo");
      await tui.press(" ");
      await tui.press("y");
      await tui.waitFor("marked (u undoes)", 15_000);
      expect(readFileSync(file, "utf8")).not.toBe(before);
      await tui.press("u");
      await tui.waitFor("Unmark T002 PREP of 0005-avaliacoes-de-produtos? Press y");
      await tui.press("y");
      await tui.waitFor("T002 PREP unmarked", 15_000);
      expect(readFileSync(file, "utf8")).toBe(before);
    } finally {
      await tui.close();
    }
  }, 30_000);

  test("e records the effort after two prompts and rejects a bad number", async () => {
    const tui = await onSpec("0006-rastreio-de-pedidos");
    const file = join(project, "specs", "planned", "0006-rastreio-de-pedidos", "spec.md");
    try {
      await tui.press("e");
      for (const key of "11") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor("Effort must be an integer from 1 to 10.");
      await tui.press("e");
      await tui.press("5");
      await tui.press("RETURN");
      await tui.waitFor("Why this effort:");
      for (const key of "duas integracoes") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor("effort 5/10", 15_000);
      expect(readFileSync(file, "utf8")).toMatch(/Effort[^\n]*5/u);
    } finally {
      await tui.close();
    }
  }, 30_000);
});

describe("backlog", () => {
  test("b creates a backlog item and p processes the pending capture", async () => {
    const tui = await mount({ project, initialTab: "backlog", width: 140, height: 40 });
    try {
      await tui.waitFor("BACKLOG-0001");
      await tui.press("b");
      for (const key of "Cashback") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor("The idea, in one line:");
      for (const key of "devolver parte do valor") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor('Backlog item "Cashback" created', 15_000);
      expect(readdirSync(join(project, "specs", "backlog")).some((name) => name.includes("cashback"))).toBe(true);

      await tui.press("/");
      for (const key of "assinatura") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor("> 2026-11-19-assinatura");
      await tui.press("p");
      for (const key of "0007") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor("processed, covered by 0007", 15_000);
      expect(existsSync(join(project, "specs", "inbox", "processed", "2026-11-19-assinatura-mensal.md"))).toBe(true);
    } finally {
      await tui.close();
    }
  }, 40_000);
});

describe("navigation", () => {
  test("Enter on an Overview spec opens it in the Specs tab", async () => {
    const tui = await mount({ project, initialTab: "overview", width: 140, height: 40 });
    try {
      await tui.waitFor("Gates passed per spec");
      await tui.press("j");
      await tui.press("RETURN");
      const frame = await tui.waitFor("Detail");
      expect(frame).toMatch(/> 000\d-/u);
      expect(frame).toContain("Definition gate");
    } finally {
      await tui.close();
    }
  });

  test("v runs the project verify and shows its report", async () => {
    const services = fakeServices({ verify: async () => ({ ok: false, exitCode: 10, output: "policy report here" }) });
    const tui = await mount({ project, initialTab: "gates", width: 140, height: 40, services });
    try {
      // fakeServices registers no gates; verify does not depend on them.
      await tui.waitFor("No gates are registered");
      await tui.press("v");
      const frame = await tui.waitFor("policy report here");
      expect(frame).toContain("verify failed (exit 10)");
    } finally {
      await tui.close();
    }
  });

  test("a click selects a list row and a tab", async () => {
    const tui = await mount({ project, initialTab: "specs", width: 140, height: 40 });
    try {
      const frame = await tui.waitFor("0001-catalogo-de-produtos");
      const lines = frame.split("\n");
      const row = lines.findIndex((line) => line.includes("0001-catalogo-de-produtos"));
      await tui.setup.mockMouse.click(10, row);
      await tui.waitFor("> 0001-catalogo-de-produtos");
      const tabs = lines.findIndex((line) => line.includes("Milestones"));
      await tui.setup.mockMouse.click(lines[tabs]!.indexOf("Milestones") + 2, tabs);
      await tui.waitFor("M01 · MVP da loja");
    } finally {
      await tui.close();
    }
  });
});
