/** Renders every Specsfy screen with the `example/` project and with an empty project. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { SCREEN_IDS, createScreens } from "../../src/tui/screens/index.ts";
import { SETTINGS_SCHEMA } from "../../src/config/settings.ts";
import { createProjectStore } from "../../src/tui/store.ts";
import { themes } from "../../src/tui/theme.ts";
import { put, validSpec } from "../gates/helpers.ts";
import { EXAMPLE, emptyProject, fakeServices, isolateHome, mount } from "./helpers.ts";

let restoreHome: () => void;
beforeAll(() => { restoreHome = isolateHome(); });
afterAll(() => restoreHome());

const exampleStatus = () => execFileSync("git", ["status", "--porcelain", "--", EXAMPLE], { encoding: "utf8" });

describe("screen registry", () => {
  test("ids match the tui.initialTab setting and are unique", () => {
    const ids = createScreens(createProjectStore(EXAMPLE, fakeServices())).map((screen) => screen.id);
    expect(ids).toEqual([...SCREEN_IDS]);
    const setting = SETTINGS_SCHEMA.find((entry) => entry.key === "tui.initialTab");
    expect(setting?.values).toEqual([...SCREEN_IDS]);
  });
});

test("the Specs preview marks missing specialist installs and preserves the narrow footer", async () => {
  const project = emptyProject();
  put(project.path, "specs/defined/0001-lista/spec.md", validSpec({ Especialistas: "interface, laravel" }));
  put(project.path, ".agents/skills/specsfy-specialist-interface/SKILL.md", "# Installed");
  const tui = await mount({ project: project.path, initialTab: "specs", width: 80, height: 24 });
  try {
    const frame = await tui.waitFor("laravel (!)", 1000);
    expect(frame).toMatch(/Especialistas +interface, laravel \(!\)/);
    expect(frame).toContain("quit");
  } finally {
    await tui.close();
    project.cleanup();
  }
});

describe("example project", () => {
  const before = exampleStatus();
  afterAll(() => expect(exampleStatus()).toBe(before));

  const expectations: Record<string, string[]> = {
    overview: ["Progress", "5/6", "16/18", "Completed", "Gates passed per spec", "Next: Plan the tasks of 0006-produtos", "0006-produtos"],
    specs: ["Defined · 1", "Completed · 5", "> 0006-produtos", "Definition gate", "Especificação integrada"],
    backlog: ["Backlog · 2", "Inbox · 0", "BACKLOG-0001"],
    gates: ["No gates are registered in this build.", "0006-produtos"],
    tests: ["Not run in this session.", "No output yet."],
    milestones: ["No milestones yet"],
    context: ["PROJECT.md", ".specsfy/STACK.md"],
    skills: ["Framework · 9", "✓ installed", "specsfy-01-inbox", "Catalog", "1 specialist(s)"],
    about: ["Credits", "OpenTUI"],
  };

  for (const id of SCREEN_IDS) {
    test(`${id} renders`, async () => {
      const tui = await mount({ project: EXAMPLE, initialTab: id });
      try {
        const wanted = expectations[id]!;
        await tui.waitFor(wanted[wanted.length - 1]!);
        const frame = tui.frame();
        for (const text of wanted) expect(frame).toContain(text);
        expect(frame).toContain("quit");
      } finally {
        await tui.close();
      }
    });
  }

  test("digits walk every tab and q quits", async () => {
    const tui = await mount({ project: EXAMPLE });
    try {
      await tui.waitFor("16/18");
      await tui.press("2");
      await tui.waitFor("Delivery gate");
      await tui.press("3");
      await tui.waitFor("Backlog · 2");
      await tui.press("4");
      await tui.waitFor("No milestones yet");
      await tui.press("5");
      await tui.waitFor("PROJECT.md");
      await tui.press("6");
      await tui.waitFor("No gates are registered");
      await tui.press("7");
      await tui.waitFor("Not run in this session.");
      await tui.press("8");
      await tui.waitFor("specsfy-01-inbox");
      await tui.press("9");
      await tui.waitFor("Credits");
      tui.setup.mockInput.pressKey("q");
      await tui.closed;
      expect(tui.setup.renderer.isDestroyed).toBe(true);
    } finally {
      await tui.close();
    }
  });

  test("specs: j moves the selection and the detail follows; g opens Gates on it", async () => {
    const tui = await mount({ project: EXAMPLE, initialTab: "specs" });
    try {
      // Defined comes before Completed, so 0006 opens selected; j and k walk.
      await tui.waitFor("> 0006-produtos");
      await tui.press("j");
      await tui.waitFor("> 0001-diretorio-global-usuarios");
      await tui.press("k");
      await tui.waitFor("> 0006-produtos");
      await tui.waitFor("Cadastro e gestão de produtos");
      expect(tui.frame()).toContain("! Pending");
      const beforeScroll = tui.frame();
      const afterScroll = await tui.press("\u001b[6~");
      expect(afterScroll).not.toBe(beforeScroll);
      expect(afterScroll).toContain("> 0006-produtos");
      await tui.press("g");
      const frame = await tui.waitFor("No gates are registered");
      expect(frame).toContain("> 0006-produtos");
    } finally {
      await tui.close();
    }
  });

  test("day theme and 80x24 still render the overview", async () => {
    const tui = await mount({ project: EXAMPLE, theme: themes.day, width: 80, height: 24 });
    try {
      const frame = await tui.waitFor("5/6");
      expect(frame).toContain("Overview");
      // Nine tabs do not fit 80 columns: the bar scrolls to the selected one.
      await tui.press("9");
      expect(await tui.waitFor("Credits")).toContain("About");
    } finally {
      await tui.close();
    }
  });
});

describe("empty project", () => {
  let project: ReturnType<typeof emptyProject>;
  beforeAll(() => { project = emptyProject(); });
  afterAll(() => project.cleanup());

  const expectations: Record<string, string> = {
    overview: "Capture an idea with $specsfy-01-inbox",
    specs: "No specs found",
    backlog: "Backlog · 0",
    milestones: "No milestones yet",
    context: "PROJECT.md",
    gates: "No gates are registered in this build.",
    tests: "Not run in this session.",
    skills: "○ available",
    about: "Credits",
  };

  for (const id of SCREEN_IDS) {
    test(`${id} renders`, async () => {
      const tui = await mount({ project: project.path, initialTab: id });
      try {
        await tui.waitFor(expectations[id]!);
      } finally {
        await tui.close();
      }
    });
  }

  test("reading the project creates no files", async () => {
    const { readdirSync } = await import("node:fs");
    expect(readdirSync(project.path)).toEqual(["specs"]);
  });
});
