/**
 * Overview dashboard: overall percent, meters, charts of states and gates,
 * and the spec rows, mounted on the `example/` project.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { projectOverview } from "../src/core/overview.ts";
import { overallPercent } from "../src/tui/screens/overview.ts";
import { barCells, percentOf } from "../src/tui/components.ts";
import { EXAMPLE, isolateHome, mount } from "./tui/helpers.ts";

let restore: () => void;
beforeAll(() => { restore = isolateHome(); });
afterAll(() => restore());

describe("chart helpers", () => {
  test("barCells fills by ratio and keeps the width", () => {
    expect(barCells(5, 10, 10)).toEqual({ full: "█████", empty: "░░░░░" });
    expect(barCells(3, 0, 4)).toEqual({ full: "", empty: "░░░░" });
    expect(barCells(12, 10, 4).full).toBe("████");
  });

  test("percentOf never rounds an incomplete ratio up to 100", () => {
    expect(percentOf(199, 200)).toBe(99);
    expect(percentOf(200, 200)).toBe(100);
    expect(percentOf(1, 0)).toBe(0);
  });
});

describe("overview dashboard", () => {
  test("overall percent is the mean of the specs", async () => {
    const overview = await projectOverview(EXAMPLE);
    const mean = overview.specs.reduce((sum, spec) => sum + spec.percent, 0) / overview.specs.length;
    expect(overallPercent(overview)).toBe(mean >= 100 ? 100 : Math.floor(mean));
    expect(overallPercent({ ...overview, specs: [] })).toBe(0);
  });

  test("shows meters, state chart, gates and spec rows", async () => {
    const tui = await mount({ project: EXAMPLE, initialTab: "overview", width: 140, height: 40 });
    try {
      const frame = await tui.waitFor("Gates passed per spec");
      for (const text of ["Overall", "Specs by state", "Checklist", "Definition", "Delivery", "3/3 gates", "0006-produtos", "Next steps"]) {
        expect(frame).toContain(text);
      }
      const overview = await projectOverview(EXAMPLE);
      const s = overview.summary;
      expect(frame).toContain(`${s.completed_specs}/${s.total_specs}`);
      expect(frame).toContain(`${s.passed_gates}/${s.total_gates}`);
      expect(frame).toContain(`${overallPercent(overview)}%`);
      // Open specs come before the complete ones.
      const open = overview.specs.find((spec) => spec.percent < 100);
      const done = overview.specs.find((spec) => spec.percent >= 100);
      if (open && done) expect(frame.indexOf(open.slug)).toBeLessThan(frame.indexOf(done.slug));
    } finally {
      await tui.close();
    }
  });
});
