/** Mounts the TUI on the OpenTUI test renderer and checks the host by frame. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createTestRenderer, type TestRendererSetup } from "@opentui/core/testing";
import { manifest } from "../src/app/manifest.ts";
import { mountTui } from "../src/tui/index.ts";
import { EXAMPLE, fakeServices, isolateHome } from "./tui/helpers.ts";

let restoreHome: () => void;
let setup: TestRendererSetup;
let closed: Promise<void>;

async function waitFor(text: string): Promise<string> {
  for (let i = 0; i < 200; i++) {
    await setup.renderOnce();
    const frame = setup.captureCharFrame();
    if (frame.includes(text)) return frame;
    await Bun.sleep(20);
  }
  throw new Error(`Timed out waiting for ${text}`);
}

beforeAll(async () => {
  restoreHome = isolateHome();
  setup = await createTestRenderer({ width: 120, height: 32 });
  closed = mountTui(setup.renderer, { project: EXAMPLE, services: fakeServices() });
  await setup.renderOnce();
});

afterAll(async () => {
  await closed.catch(() => undefined);
  restoreHome();
});

describe("tui", () => {
  test("opens on the Overview tab with header, panels and key bar", async () => {
    const frame = await waitFor("Next steps");
    expect(frame).toContain(manifest.title);
    expect(frame).toContain(`v${manifest.version}`);
    expect(frame).toContain(EXAMPLE);
    for (const title of ["Overview", "Specs", "Backlog", "Gates", "Tests", "Skills", "About"]) expect(frame).toContain(title);
    expect(frame).toContain("Project");
    expect(frame).toContain("quit");
  });

  test("key 7 goes to About and ? opens the help", async () => {
    setup.mockInput.pressKey("7");
    let frame = await waitFor("Credits");
    expect(frame).toContain("OpenTUI");
    setup.mockInput.pressKey("?");
    frame = await waitFor("Keys");
    expect(frame).toContain("previous / next tab");
    setup.mockInput.pressKey("?");
    await setup.renderOnce();
  });

  test("Tab moves to the next tab, wrapping to the first", async () => {
    setup.mockInput.pressKey("TAB");
    await waitFor("16/18 passed");
  });

  test("q destroys the renderer", async () => {
    setup.mockInput.pressKey("q");
    await closed;
    expect(setup.renderer.isDestroyed).toBe(true);
  });
});
