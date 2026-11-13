/**
 * The `node` shim of the runner: when it is added to the PATH, that it runs
 * scripts with the binary acting as Bun, and the `.agents/skills` fallback.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chmodSync, rmSync } from "node:fs";
import { delimiter, join } from "node:path";
import { HOME_VARIABLE } from "../../src/config/paths.ts";
import { ensureNodeShim, withNodeShim } from "../../src/engine/runner.ts";
import { put, temporary } from "./helpers.ts";

let home: string;
let previousHome: string | undefined;

beforeAll(() => {
  home = temporary("specsfy-shim-home-");
  previousHome = process.env[HOME_VARIABLE];
  process.env[HOME_VARIABLE] = home;
});
afterAll(() => {
  if (previousHome === undefined) delete process.env[HOME_VARIABLE];
  else process.env[HOME_VARIABLE] = previousHome;
  rmSync(home, { recursive: true, force: true });
});

describe("withNodeShim", () => {
  test("never leaves the PATH alone", () => {
    const env = { PATH: "" };
    expect(withNodeShim(env, "never")).toBe(env);
  });

  test("auto keeps an existing node and adds the shim when it is missing", () => {
    const fake = temporary("specsfy-shim-node-");
    const node = put(fake, process.platform === "win32" ? "node.exe" : "node", "#!/bin/sh\n");
    chmodSync(node, 0o755);
    expect(withNodeShim({ PATH: fake }, "auto").PATH).toBe(fake);
    const empty = temporary("specsfy-shim-empty-");
    expect(withNodeShim({ PATH: empty }, "auto").PATH).toBe(`${ensureNodeShim()}${delimiter}${empty}`);
    rmSync(fake, { recursive: true, force: true });
    rmSync(empty, { recursive: true, force: true });
  });

  test("always adds the shim even when node exists", () => {
    const path = withNodeShim({ PATH: process.env.PATH ?? "" }, "always").PATH!;
    expect(path.startsWith(ensureNodeShim() + delimiter)).toBe(true);
  });
});

describe.skipIf(process.platform === "win32")("POSIX shim", () => {
  test("runs a script with the binary acting as Bun", async () => {
    const dir = temporary("specsfy-shim-script-");
    const script = put(dir, "hello.mjs", "console.log(`hello ${process.argv[2]}`);\n");
    const proc = Bun.spawn([join(ensureNodeShim(), "node"), script, "world"], { stdout: "pipe", stderr: "pipe" });
    expect((await new Response(proc.stdout).text()).trim()).toBe("hello world");
    expect(await proc.exited).toBe(0);
    rmSync(dir, { recursive: true, force: true });
  });

  test("falls back to SPECSFY_SKILLS_DIR for a missing .agents/skills script", async () => {
    const project = temporary("specsfy-shim-project-");
    const skills = temporary("specsfy-shim-skills-");
    put(skills, "specsfy-demo/scripts/run.mjs", "console.log('embedded ' + process.argv.slice(2).join(' '));\n");
    const missing = join(project, ".agents", "skills", "specsfy-demo", "scripts", "run.mjs");
    const proc = Bun.spawn([join(ensureNodeShim(), "node"), missing, "a", "b"], {
      env: { ...process.env, SPECSFY_SKILLS_DIR: skills },
      stdout: "pipe",
      stderr: "pipe",
    });
    expect((await new Response(proc.stdout).text()).trim()).toBe("embedded a b");
    expect(await proc.exited).toBe(0);
    rmSync(project, { recursive: true, force: true });
    rmSync(skills, { recursive: true, force: true });
  });
});
