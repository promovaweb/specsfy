/** Regressions of the lock and of the managed-content protection. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  ensureSkillsLock,
  installedSkillNames,
  readSkillsLock,
} from "../../src/domain/skill-lock.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("skills lock", () => {
  test("creates the minimal official lock and lists names", async () => {
    const project = await temporaryDirectory();
    await ensureSkillsLock(project);
    const payload = JSON.parse(
      await readFile(join(project, "skills-lock.json"), "utf8"),
    ) as unknown;
    expect(payload).toEqual({ version: 1, skills: {} });
    await writeFile(
      join(project, "skills-lock.json"),
      JSON.stringify({ version: 1, skills: { "specsfy-setup": {} } }),
    );
    expect(await installedSkillNames(project)).toEqual(
      new Set(["specsfy-setup"]),
    );
  });

  test("refuses an invalid lock", async () => {
    const project = await temporaryDirectory();
    await writeFile(
      join(project, "skills-lock.json"),
      JSON.stringify({ version: 2, skills: {} }),
    );
    await expect(readSkillsLock(project)).rejects.toThrow("unsupported");
  });

  test("refuses the official root", async () => {
    const project = await temporaryDirectory();
    await mkdir(project, { recursive: true });
    await writeFile(
      join(project, "AGENTS.md"),
      "Este é o monorepo oficial do Specsfy.",
    );
    await expect(ensureSkillsLock(project)).rejects.toThrow(
      "operation refused",
    );
  });
});
