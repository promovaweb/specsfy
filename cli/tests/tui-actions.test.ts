/**
 * Actions of the TUI on a writable copy of the demo project: move a spec
 * (`t`), mark the next checklist item (Space), create a spec (`n`) and
 * capture an idea in the inbox (`c`). Every write asks first or comes from
 * an explicit Enter, and the project reloads afterwards.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EXAMPLE, isolateHome, mount } from "./tui/helpers.ts";

const DEMO = join(import.meta.dir, "fixtures", "showcase-project");
let restore: () => void;
let project: string;

beforeAll(() => {
  restore = isolateHome();
  project = join(mkdtempSync(join(tmpdir(), "specsfy-actions-")), "loja");
  cpSync(DEMO, project, { recursive: true });
  // `specs new` needs the installed framework templates.
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

describe("specs actions", () => {
  test("t offers the adjacent states and moves the spec after y", async () => {
    const tui = await onSpec("0004-cupons-de-desconto");
    try {
      await tui.press("t");
      let frame = await tui.waitFor("Move 0004-cupons-de-desconto to:");
      expect(frame).toContain("1 Planned");
      expect(frame).toContain("2 Review");
      await tui.press("2");
      await tui.waitFor("Move 0004-cupons-de-desconto to Review? Press y");
      await tui.press("y");
      frame = await tui.waitFor("in-progress → review");
      expect(existsSync(join(project, "specs", "review", "0004-cupons-de-desconto", "spec.md"))).toBe(true);
      expect(readFileSync(join(project, "specs", "review", "0004-cupons-de-desconto", "spec.md"), "utf8")).toContain("| Status | Reviewing |");
    } finally {
      await tui.close();
    }
  }, 20_000);

  test("n cancels with Esc and creates a draft spec with Enter", async () => {
    const tui = await onSpec("0008-programa-de-fidelidade");
    try {
      await tui.press("n");
      await tui.waitFor("Title of the new spec:");
      await tui.press("ESCAPE");
      expect(readdirSync(join(project, "specs", "draft"))).toEqual(["0008-programa-de-fidelidade"]);
      await tui.press("n");
      for (const key of "Relatorio de vendas") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor('Spec "Relatorio de vendas" created', 15_000);
      expect(readdirSync(join(project, "specs", "draft")).some((name) => name.endsWith("relatorio-de-vendas"))).toBe(true);
    } finally {
      await tui.close();
    }
  }, 30_000);

  test("Space marks the next checklist item after y, and n cancels", async () => {
    const tui = await onSpec("0005-avaliacoes-de-produtos");
    const file = join(project, "specs", "in-progress", "0005-avaliacoes-de-produtos", "spec.md");
    const before = readFileSync(file, "utf8");
    try {
      await tui.press(" ");
      await tui.waitFor("Mark the next checklist item of 0005-avaliacoes-de-produtos? Press y");
      await tui.press("n");
      await tui.waitFor("Cancelled. Nothing changed.");
      expect(readFileSync(file, "utf8")).toBe(before);
      await tui.press(" ");
      await tui.press("y");
      await tui.waitFor("T002 PREP marked", 15_000);
      expect(readFileSync(file, "utf8")).not.toBe(before);
      expect(readFileSync(file, "utf8")).toContain("  - [x] **PREP**: Contrato Inertia");
    } finally {
      await tui.close();
    }
  }, 30_000);
});

describe("backlog actions", () => {
  test("c records a capture in specs/inbox/", async () => {
    const tui = await mount({ project, initialTab: "backlog", width: 140, height: 40 });
    try {
      await tui.waitFor("BACKLOG-0001");
      await tui.press("c");
      await tui.waitFor("Capture an idea:");
      for (const key of "Cashback em compras") await tui.press(key);
      await tui.press("RETURN");
      await tui.waitFor("Captured in specs/inbox/: Cashback em compras", 15_000);
      expect(readdirSync(join(project, "specs", "inbox")).some((name) => name.includes("cashback"))).toBe(true);
    } finally {
      await tui.close();
    }
  }, 30_000);
});
