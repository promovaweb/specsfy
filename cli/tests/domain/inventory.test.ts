/**
 * Skills inventory: validation of `skills/inventory.json`, agreement with
 * the folders of the framework repository and the name-only drift used by
 * `doctor` and the TUI.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { EMBEDDED_INVENTORY, frameworkSkillNames, inSync, inventoryDrift, parseInventory } from "../../src/domain/inventory.ts";

const SKILLS = join(import.meta.dir, "..", "..", "..", "skills");
const raw = () => JSON.parse(readFileSync(join(SKILLS, "inventory.json"), "utf8"));

describe("inventory file", () => {
  test("lists exactly the skill folders of the framework", () => {
    const folders = readdirSync(SKILLS, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(SKILLS, entry.name, "SKILL.md")))
      .map((entry) => entry.name)
      .sort();
    expect(frameworkSkillNames().sort()).toEqual(folders);
  });

  test("renamed and retired names have no folder left", () => {
    for (const name of [...Object.keys(EMBEDDED_INVENTORY.renamed), ...EMBEDDED_INVENTORY.retired]) {
      expect(existsSync(join(SKILLS, name))).toBe(false);
    }
  });

  test("a rename must point to a current skill or to a specialist", () => {
    const chained = raw();
    chained.renamed["specsfy-older"] = "specsfy-gone";
    expect(() => parseInventory(chained)).toThrow("renamed to the unknown skill specsfy-gone");
    const specialist = raw();
    specialist.renamed["specsfy-older"] = "specsfy-specialist-x";
    expect(parseInventory(specialist).renamed["specsfy-older"]).toBe("specsfy-specialist-x");
  });

  test("a name cannot be current and old at the same time", () => {
    const both = raw();
    both.retired.push("specsfy-setup");
    expect(() => parseInventory(both)).toThrow("specsfy-setup is retired and also current or renamed");
    const renamed = raw();
    renamed.renamed["specsfy-setup"] = "specsfy-01-inbox";
    expect(() => parseInventory(renamed)).toThrow("both a current and a renamed skill");
  });

  test("rejects other schema versions, categories and names", () => {
    expect(() => parseInventory({ ...raw(), schema_version: 2 })).toThrow("unsupported schema_version");
    expect(() => parseInventory({ ...raw(), skills: { "specsfy-x": "other" } })).toThrow("bad category");
    expect(() => parseInventory({ ...raw(), skills: { "../x": "base" } })).toThrow("bad skill name");
    expect(() => parseInventory([])).toThrow("not an object");
  });
});

describe("inventoryDrift", () => {
  const inventory = parseInventory({
    schema_version: 1,
    skills: { "specsfy-a": "base", "specsfy-b": "auxiliary" },
    renamed: { "specsfy-old": "specsfy-a" },
    retired: ["specsfy-dead"],
  });

  test("a project without the framework has no drift", () => {
    const drift = inventoryDrift(["other-skill", "specsfy-specialist-x"], inventory);
    expect(drift).toEqual({ framework: false, missing: [], renamed: [], retired: [] });
    expect(inSync(drift)).toBe(true);
  });

  test("reports missing, renamed and retired names", () => {
    const drift = inventoryDrift(["specsfy-a", "specsfy-old", "specsfy-dead"], inventory);
    expect(drift).toEqual({
      framework: true,
      missing: ["specsfy-b"],
      renamed: [{ from: "specsfy-old", to: "specsfy-a" }],
      retired: ["specsfy-dead"],
    });
    expect(inSync(drift)).toBe(false);
  });

  test("only old names still count as a framework install", () => {
    expect(inventoryDrift(["specsfy-old"], inventory).missing).toEqual(["specsfy-a", "specsfy-b"]);
  });

  test("the full set is in sync", () => {
    expect(inSync(inventoryDrift(["specsfy-a", "specsfy-b"], inventory))).toBe(true);
  });
});
