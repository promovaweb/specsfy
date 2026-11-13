/**
 * Exercises the actions of the Gates, Tests and Skills tabs with fake
 * services, plus one real gate run through `executeScriptCommand`.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import type { ScriptCommandDef } from "../../src/engine/script-command.ts";
import type { TestRun } from "../../src/domain/project-testing.ts";
import { defaultServices } from "../../src/tui/services.ts";
import { EXAMPLE, fakeServices, isolateHome, mount } from "./helpers.ts";

let restoreHome: () => void;
beforeAll(() => { restoreHome = isolateHome(); });
afterAll(() => restoreHome());

/** Gate definition shaped like the ones in `src/cli/commands/gates.ts`. */
function gateDef(name: string, script = "specsfy-04-validate/scripts/validate_spec.mjs"): ScriptCommandDef {
  return {
    name, tool: `gate_${name}`, description: `${name} gate`, script, project: "cwd", json: true, effect: "read", gate: true,
    params: [{ name: "spec", kind: "spec", description: "Spec", required: true }],
  };
}

describe("gates", () => {
  test("Enter runs every gate in order and names passed and failed", async () => {
    const calls: string[] = [];
    let release: () => void = () => undefined;
    const held = new Promise<void>((resolve) => { release = resolve; });
    const services = fakeServices({
      gates: () => [gateDef("spec"), gateDef("tasks")],
      runGate: async (def, specPath) => {
        calls.push(`${def.name}:${specPath}`);
        if (def.name === "spec") { await held; return { ok: true, exitCode: 0, output: "spec looks fine" }; }
        return { ok: false, exitCode: 1, output: "missing tasks section" };
      },
    });
    const tui = await mount({ project: EXAMPLE, initialTab: "gates", services });
    try {
      await tui.waitFor("Enter runs 2 gate(s) on 0001-diretorio-global-usuarios");
      await tui.press("RETURN");
      await tui.waitFor("… running");
      await tui.press("RETURN");
      await tui.press("j");
      expect(calls).toHaveLength(1);
      await tui.press("k");
      release();
      const frame = await tui.waitFor("✗ failed");
      expect(frame).toContain("✓ passed");
      expect(frame).toContain("spec looks fine");
      expect(frame).toContain("missing tasks section");
      expect(calls).toEqual([
        `spec:${join(EXAMPLE, "specs/specs/0001-diretorio-global-usuarios/spec.md")}`,
        `tasks:${join(EXAMPLE, "specs/specs/0001-diretorio-global-usuarios/spec.md")}`,
      ]);
    } finally {
      await tui.close();
    }
  });

  test("the real service runs an embedded gate script on the example spec", async () => {
    const run = await defaultServices().runGate(gateDef("spec"), join(EXAMPLE, "specs/specs/0001-diretorio-global-usuarios/spec.md"), EXAMPLE);
    expect(typeof run.ok).toBe("boolean");
    expect(run.exitCode).toBeGreaterThanOrEqual(0);
    expect(run.output.length).toBeGreaterThan(0);
  });

  test("a gate that needs another required value is reported, not guessed", async () => {
    const def = gateDef("trace");
    def.params = [...def.params, { name: "boundary", kind: "option", description: "Boundary", required: true }];
    const run = await defaultServices().runGate(def, "/nowhere/spec.md", EXAMPLE);
    expect(run.ok).toBe(false);
    expect(run.output).toContain("boundary");
  });
});

describe("tests", () => {
  test("Enter streams the output and shows the summary of a passing run", async () => {
    const services = fakeServices({
      runTests: async (_project, emit) => {
        emit("PASS  Tests\\Feature\\UserTest");
        emit("Tests:  3 passed");
        const run: TestRun = {
          command: { label: "Laravel Pest", argv: ["php", "artisan", "test"], cwd: EXAMPLE, display: "php artisan test" },
          exit_code: 0, duration_seconds: 1.5, summary_lines: ["Tests:  3 passed"],
        };
        return run;
      },
    });
    const tui = await mount({ project: EXAMPLE, initialTab: "tests", services });
    try {
      await tui.waitFor("Not run in this session.");
      await tui.press("RETURN");
      const frame = await tui.waitFor("✓ Tests passed");
      expect(frame).toContain("php artisan test");
      expect(frame).toContain("1.50s");
      await tui.waitFor("PASS  Tests\\Feature\\UserTest");
    } finally {
      await tui.close();
    }
  });

  test("a suspended run shows why it did not start", async () => {
    const services = fakeServices({ runTests: async () => { throw new Error("tests suspended: create .env.testing with a separate database"); } });
    const tui = await mount({ project: EXAMPLE, initialTab: "tests", services });
    try {
      await tui.waitFor("Not run in this session.");
      await tui.press("RETURN");
      const frame = await tui.waitFor("✗ Tests did not run");
      expect(frame).toContain(".env.testing");
    } finally {
      await tui.close();
    }
  });

  test("quitting during a run aborts it", async () => {
    let aborted = false;
    const services = fakeServices({
      runTests: (_project, _emit, signal) => new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => { aborted = true; reject(new Error("aborted")); });
      }),
    });
    const tui = await mount({ project: EXAMPLE, initialTab: "tests", services });
    await tui.waitFor("Not run in this session.");
    await tui.press("RETURN");
    await tui.waitFor("Running the project tests");
    tui.setup.mockInput.pressKey("q");
    await tui.closed;
    expect(aborted).toBe(true);
  });
});

describe("skills", () => {
  test("install asks for confirmation; n cancels and y runs once", async () => {
    const installs: string[][] = [];
    const services = fakeServices({ installSkills: async (_project, names) => { installs.push(names); return names; } });
    const tui = await mount({ project: EXAMPLE, initialTab: "skills", services, height: 40 });
    try {
      await tui.waitFor("specsfy-specialist-zz-test");
      let frame = tui.frame();
      while (!/> ○ available {2}specsfy-specialist-zz-test/.test(frame)) {
        frame = await tui.press("j");
      }
      await tui.press("i");
      await tui.waitFor("Install specsfy-specialist-zz-test? Press y to confirm");
      await tui.press("q");
      expect(tui.setup.renderer.isDestroyed).toBe(false);
      await tui.press("n");
      await tui.waitFor("Cancelled. Nothing changed.");
      expect(installs).toHaveLength(0);
      await tui.press("i");
      await tui.waitFor("Press y to confirm");
      await tui.press("y");
      await tui.waitFor("✓ Installed: specsfy-specialist-zz-test");
      expect(installs).toEqual([["specsfy-specialist-zz-test"]]);
    } finally {
      await tui.close();
    }
  });

  test("remove and update also need y", async () => {
    const removed: string[][] = [];
    let updates = 0;
    const services = fakeServices({
      removeSkills: async (_project, names) => { removed.push(names); return names; },
      updateSkills: async () => { updates += 1; return []; },
    });
    const tui = await mount({ project: EXAMPLE, initialTab: "skills", services });
    try {
      await tui.waitFor("> ✓ installed  specsfy-01-inbox");
      await tui.press("x");
      await tui.waitFor("Remove specsfy-01-inbox? Press y to confirm");
      await tui.press("ESCAPE");
      expect(tui.setup.renderer.isDestroyed).toBe(false);
      expect(removed).toHaveLength(0);
      await tui.press("x");
      await tui.press("y");
      await tui.waitFor("✓ Removed: specsfy-01-inbox");
      await tui.press("u");
      await tui.waitFor("Update every installed Specsfy skill? Press y");
      await tui.press("y");
      await tui.waitFor("Every installed skill is up to date.");
      expect(removed).toEqual([["specsfy-01-inbox"]]);
      expect(updates).toBe(1);
    } finally {
      await tui.close();
    }
  });

  test("an unavailable catalog keeps the framework skills listed", async () => {
    const services = fakeServices({ loadCatalog: async () => { throw new Error("catalog offline"); } });
    const tui = await mount({ project: EXAMPLE, initialTab: "skills", services });
    try {
      const frame = await tui.waitFor("unavailable: catalog offline");
      expect(frame).toContain("specsfy-01-inbox");
    } finally {
      await tui.close();
    }
  });
});
