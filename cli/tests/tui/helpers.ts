/**
 * Helpers of the TUI screen tests: an isolated data directory, an empty
 * project, fake services for the slow or remote parts (catalog, gates,
 * tests, `npx skills`) and a mount that waits for text in the frame.
 */
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createTestRenderer, type TestRendererSetup } from "@opentui/core/testing";
import { HOME_VARIABLE } from "../../src/config/paths.ts";
import { Catalog } from "../../src/domain/catalog.ts";
import { mountTui, type TuiOptions } from "../../src/tui/index.ts";
import { defaultServices, type TuiServices } from "../../src/tui/services.ts";
import { themes, type Theme } from "../../src/tui/theme.ts";

/** The `example/` project at the repository root, used read-only. */
export const EXAMPLE = resolve(import.meta.dir, "../../../example");

/** Creates a temporary data directory and points the binary at it. */
export function isolateHome(): () => void {
  const dir = mkdtempSync(join(tmpdir(), "specsfy-tui-home-"));
  const previous = process.env[HOME_VARIABLE];
  process.env[HOME_VARIABLE] = dir;
  return () => {
    if (previous === undefined) delete process.env[HOME_VARIABLE];
    else process.env[HOME_VARIABLE] = previous;
    rmSync(dir, { recursive: true, force: true });
  };
}

/** Creates an empty project (only `specs/`) and returns its path and cleanup. */
export function emptyProject(): { path: string; cleanup: () => void } {
  const path = mkdtempSync(join(tmpdir(), "specsfy-tui-project-"));
  mkdirSync(join(path, "specs"));
  return { path, cleanup: () => rmSync(path, { recursive: true, force: true }) };
}

/** Small specialist catalog, so no test reaches the network. */
export function fakeCatalog(): Catalog {
  return Catalog.fromPayload({
    schema_version: 1,
    skills: [
      { name: "specsfy-specialist-zz-test", description: "Test specialist.", category: "quality", tags: ["test"] },
    ],
  });
}

/** Real reads with fake catalog, tests, gates and skill actions. */
export function fakeServices(overrides: Partial<TuiServices> = {}): TuiServices {
  const real = defaultServices();
  return {
    ...real,
    gates: () => [],
    loadCatalog: async () => fakeCatalog(),
    runTests: async () => { throw new Error("tests disabled in this suite"); },
    runGate: async () => ({ ok: true, exitCode: 0, output: "ok" }),
    installSkills: async () => [],
    removeSkills: async () => [],
    updateSkills: async () => [],
    ...overrides,
  };
}

/** Mounted TUI on the test renderer. */
export interface MountedTui {
  setup: TestRendererSetup;
  closed: Promise<void>;
  frame: () => string;
  /** Renders until `text` appears (string or pattern) or fails after `timeout` ms. */
  waitFor: (text: string | RegExp, timeout?: number) => Promise<string>;
  press: (key: string) => Promise<string>;
  close: () => Promise<void>;
}

/** Mounts the TUI on a test renderer with fake services by default. */
export async function mount(options: TuiOptions & { width?: number; height?: number; theme?: Theme } = {}): Promise<MountedTui> {
  const setup = await createTestRenderer({ width: options.width ?? 120, height: options.height ?? 34 });
  const closed = mountTui(setup.renderer, { services: fakeServices(), ...options }, options.theme ?? themes.night);
  const frame = () => setup.captureCharFrame();
  const waitFor = async (text: string | RegExp, timeout = 4000) => {
    const deadline = Date.now() + timeout;
    for (;;) {
      await setup.renderOnce();
      const current = frame();
      if (typeof text === "string" ? current.includes(text) : text.test(current)) return current;
      if (Date.now() > deadline) throw new Error(`Timed out waiting for ${String(text)}. Last frame:\n${current}`);
      await Bun.sleep(20);
    }
  };
  const press = async (key: string) => {
    setup.mockInput.pressKey(key);
    await setup.renderOnce();
    return frame();
  };
  const close = async () => {
    if (!setup.renderer.isDestroyed) setup.renderer.destroy();
    await closed;
  };
  return { setup, closed, frame, waitFor, press, close };
}
