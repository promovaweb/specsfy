/** Contratos do diagnóstico executado antes de setup e atualização. */
import { chmod, mkdir, symlink, writeFile } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  assertPrerequisites,
  checkPrerequisites,
  nodeVersionSupported,
  resolveSkillsCommand,
} from "../src/prerequisites.js";
import { temporaryDirectory } from "./helpers.js";

describe("pré-requisitos", () => {
  test("exige Node.js 22.20 ou mais recente", () => {
    expect(nodeVersionSupported("22.19.9")).toBe(false);
    expect(nodeVersionSupported("22.20.0")).toBe(true);
    expect(nodeVersionSupported("24.1.0")).toBe(true);
  });

  test("aceita skills instalado e registra todos os requisitos do setup", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "bin");
    const project = join(root, "project");
    await mkdir(bin);
    await mkdir(project);
    for (const name of ["git", "npm", "skills"]) {
      const executable = join(bin, name);
      await writeFile(executable, "#!/bin/sh\nexit 0\n");
      await chmod(executable, 0o755);
    }

    const checks = await checkPrerequisites(project, {
      path: [bin, process.env.PATH ?? ""].join(delimiter),
      nodeVersion: "22.20.0",
    });

    expect(checks.map(({ name }) => name)).toEqual([
      "node",
      "git",
      "skills",
      "npm",
      "project",
    ]);
    expect(checks.every(({ ok }) => ok)).toBe(true);
    expect(checks.find(({ name }) => name === "skills")?.detail).toContain(
      join(bin, "skills"),
    );
  });

  test("aceita npx como fallback e agrega falhas acionáveis", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "bin");
    await mkdir(bin);
    const npx = join(bin, "npx");
    await writeFile(npx, "#!/bin/sh\nexit 0\n");
    await chmod(npx, 0o755);

    const checks = await checkPrerequisites(join(root, "ausente"), {
      path: bin,
      nodeVersion: "20.0.0",
      skillsLauncher: "",
    });

    expect(checks.find(({ name }) => name === "skills")).toMatchObject({
      ok: true,
      command: [npx, "--yes", "skills"],
    });
    expect(() => assertPrerequisites(checks)).toThrow(
      /Node\.js 22\.20.*Git.*npm.*projeto/s,
    );
  });

  test("usa o skills incluído no pacote quando o PATH está reduzido", async () => {
    const root = await temporaryDirectory();
    const launcher = join(root, "package", "bin", "specsfy.cjs");
    const linkedLauncher = join(root, "global", "bin", "specsfy");
    const skills = join(
      root,
      "package",
      "node_modules",
      "skills",
      "bin",
      "cli.mjs",
    );
    await mkdir(join(skills, ".."), { recursive: true });
    await mkdir(join(launcher, ".."), { recursive: true });
    await mkdir(join(linkedLauncher, ".."), { recursive: true });
    await writeFile(launcher, "#!/usr/bin/env node\n");
    await symlink(launcher, linkedLauncher);
    await writeFile(skills, "#!/usr/bin/env node\n");
    await writeFile(
      join(root, "package", "node_modules", "skills", "package.json"),
      JSON.stringify({ name: "skills", version: "1.5.22", type: "module" }),
    );

    expect(await resolveSkillsCommand("", undefined, linkedLauncher)).toEqual([
      process.execPath,
      skills,
    ]);
  });
  test("encontra executáveis com extensão do PATHEXT no Windows", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "bin");
    const project = join(root, "project");
    await mkdir(bin);
    await mkdir(project);
    for (const name of ["git.EXE", "skills.CMD", "npm"]) {
      const executable = join(bin, name);
      await writeFile(executable, "#!/bin/sh\nexit 0\n");
      await chmod(executable, 0o755);
    }

    const checks = await checkPrerequisites(project, {
      path: bin,
      nodeVersion: "22.20.0",
      platform: "win32",
      pathext: ".COM;.EXE;.BAT;.CMD",
    });

    expect(checks.every(({ ok }) => ok)).toBe(true);
    expect(checks.find(({ name }) => name === "git")?.command).toEqual([
      join(bin, "git.EXE"),
    ]);
    expect(checks.find(({ name }) => name === "skills")?.command).toEqual([
      join(bin, "skills.CMD"),
    ]);
    expect(checks.find(({ name }) => name === "npm")?.command).toEqual([
      join(bin, "npm"),
    ]);
  });

  test("não aceita sufixo do Windows em plataforma POSIX", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "bin");
    await mkdir(bin);
    const executable = join(bin, "git.EXE");
    await writeFile(executable, "#!/bin/sh\nexit 0\n");
    await chmod(executable, 0o755);

    const checks = await checkPrerequisites(root, {
      path: bin,
      nodeVersion: "22.20.0",
      platform: "linux",
      skillsLauncher: "",
    });

    expect(checks.find(({ name }) => name === "git")).toMatchObject({
      ok: false,
    });
  });
});
