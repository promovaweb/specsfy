/** Contracts of the prerequisites checked before install, update and doctor --project. */
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { describe, expect, test } from "bun:test";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import {
  assertPrerequisites,
  checkPrerequisites,
  isCompiledBinary,
  resolveSkillsCommand,
  SKILLS_PACKAGE,
} from "../../src/domain/prerequisites.ts";
import { temporaryDirectory } from "./helpers.ts";

async function executable(directory: string, name: string): Promise<string> {
  const path = join(directory, name);
  await writeFile(path, "#!/bin/sh\nexit 0\n");
  await chmod(path, 0o755);
  return path;
}

describe("prerequisites", () => {
  test("checks git, the skills CLI and the project, without Node.js", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "bin");
    const project = join(root, "project");
    await mkdir(bin);
    await mkdir(project);
    await executable(bin, "git");
    const checks = await checkPrerequisites(project, { path: [bin, process.env.PATH ?? ""].join(delimiter) });
    expect(checks.map(({ name }) => name)).toEqual(["git", "skills", "project"]);
    expect(checks.every(({ ok }) => ok)).toBe(true);
  });

  test("the embedded Bun runtime runs the pinned skills package", async () => {
    const command = await resolveSkillsCommand({});
    expect(command).toEqual({
      command: [process.execPath, "x", "--bun", SKILLS_PACKAGE],
      env: { BUN_BE_BUN: "1" },
      source: "self",
    });
    expect(SKILLS_PACKAGE).toMatch(/^skills@\d+\.\d+\.\d+$/);
  });

  test("SPECSFY_SKILLS_CLI and SPECSFY_NPX_COMMAND override the runtime", async () => {
    const root = await temporaryDirectory();
    const skills = await executable(root, "skills");
    const npx = await executable(root, "npx");
    expect(await resolveSkillsCommand({ SPECSFY_SKILLS_CLI: skills, SPECSFY_NPX_COMMAND: npx })).toEqual({ command: [skills], source: "override" });
    expect(await resolveSkillsCommand({ SPECSFY_NPX_COMMAND: npx })).toEqual({ command: [npx, "skills"], source: "npx" });
    expect(await resolveSkillsCommand({ SPECSFY_NPX_COMMAND: join(root, "missing") })).toBeUndefined();
  });

  test("detects compiled executables by their embedded entry point", () => {
    expect(isCompiledBinary("/$bunfs/root/specsfy")).toBe(true);
    expect(isCompiledBinary("B:\\~BUN\\root\\specsfy.exe")).toBe(true);
    expect(isCompiledBinary("/home/me/specsfy/cli/src/main.ts")).toBe(false);
  });

  test("aggregates actionable failures; a missing project is NOT_FOUND", async () => {
    const root = await temporaryDirectory();
    const checks = await checkPrerequisites(join(root, "missing"), { path: root });
    expect(checks.find(({ name }) => name === "git")?.ok).toBe(false);
    try {
      assertPrerequisites(checks);
      throw new Error("expected failure");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe(ExitCode.NOT_FOUND);
      expect((e as AppError).message).toMatch(/Git.*project directory not found/s);
    }
    expect(() => assertPrerequisites(checks, ["skills"])).not.toThrow();
  });

  test("a read-only project is PERMISSION", async () => {
    if (process.getuid?.() === 0) return;
    const root = await temporaryDirectory();
    const project = join(root, "project");
    await mkdir(project);
    await chmod(project, 0o500);
    try {
      const checks = await checkPrerequisites(project, { path: root });
      expect(() => assertPrerequisites(checks, ["project"])).toThrow(expect.objectContaining({ code: ExitCode.PERMISSION }));
    } finally {
      await chmod(project, 0o700);
    }
  });

  test("detects git.exe in a Windows PATH with spaces", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "Program Files", "bin");
    await mkdir(bin, { recursive: true });
    await writeFile(join(bin, "git.exe"), "fixture");
    const checks = await checkPrerequisites(root, { path: bin, platform: "win32", pathext: ".COM;.EXE;.BAT;.CMD" });
    expect(checks.find(({ name }) => name === "git")?.command).toEqual([join(bin, "git.exe")]);
  });

  test("does not accept a directory named git as an executable", async () => {
    const root = await temporaryDirectory();
    await mkdir(join(root, "git"));
    const checks = await checkPrerequisites(root, { path: root });
    expect(checks.find(({ name }) => name === "git")?.ok).toBe(false);
  });

  test("keeps the POSIX permission requirement", async () => {
    const root = await temporaryDirectory();
    await writeFile(join(root, "git"), "fixture");
    await chmod(join(root, "git"), 0o644);
    const checks = await checkPrerequisites(root, { path: root, platform: "linux" });
    expect(checks.find(({ name }) => name === "git")?.ok).toBe(false);
  });
});
