/** Contratos do diagnóstico executado antes de setup e atualização. */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { delimiter, join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  assertPrerequisites,
  checkPrerequisites,
  nodeVersionSupported,
  resolveNpxSkillsCommand,
} from "../../src/domain/prerequisites.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("pré-requisitos", () => {
  test("exige Node.js 22.20 ou mais recente", () => {
    expect(nodeVersionSupported("22.19.9")).toBe(false);
    expect(nodeVersionSupported("22.20.0")).toBe(true);
    expect(nodeVersionSupported("24.1.0")).toBe(true);
  });

  test("exige npx e registra todos os requisitos do setup", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "bin");
    const project = join(root, "project");
    await mkdir(bin);
    await mkdir(project);
    for (const name of ["git", "npm", "npx"]) {
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
      join(bin, "npx"),
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
      command: [npx, "skills"],
    });
    expect(() => assertPrerequisites(checks)).toThrow(
      /Node\.js 22\.20.*Git.*npm.*projeto/s,
    );
  });

  test("exige npx quando o PATH não o disponibiliza", async () => {
    const root = await temporaryDirectory();
    expect(await resolveNpxSkillsCommand("", undefined, join(root, "specsfy"))).toBeUndefined();
  });
  test("detecta git.exe e npm.cmd em um PATH Windows com espaços", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "Program Files", "bin");
    await mkdir(bin, { recursive: true });
    for (const name of ["git.exe", "npm.cmd"]) {
      await writeFile(join(bin, name), "fixture");
    }
    const checks = await checkPrerequisites(root, {
      path: bin,
      nodeVersion: "22.20.0",
      platform: "win32",
      pathext: ".COM;.EXE;.BAT;.CMD",
    });
    expect(checks.find(({ name }) => name === "git")?.command).toEqual([join(bin, "git.exe")]);
    expect(checks.find(({ name }) => name === "npm")?.command).toEqual([join(bin, "npm.cmd")]);
  });

  test("não aceita um diretório chamado git como executável", async () => {
    const root = await temporaryDirectory();
    await mkdir(join(root, "git"));
    const checks = await checkPrerequisites(root, { path: root });
    expect(checks.find(({ name }) => name === "git")?.ok).toBe(false);
  });

  test("chama npx-cli.js com Node e preserva argumentos sem shell", async () => {
    const root = await temporaryDirectory();
    const bin = join(root, "Node com espaços & símbolos");
    const entrypoint = join(bin, "node_modules", "npm", "bin", "npx-cli.js");
    await mkdir(join(entrypoint, ".."), { recursive: true });
    await writeFile(join(bin, "npx.cmd"), "fixture batch");
    await writeFile(join(bin, "npx"), "fixture sh");
    await writeFile(entrypoint, "console.log(JSON.stringify(process.argv.slice(2)));\n");
    const command = await resolveNpxSkillsCommand(bin, undefined, "", "win32", ".EXE;.CMD");
    expect(command).toEqual([process.execPath, entrypoint, "skills"]);
    const payload = "caminho & echo inesperado";
    const result = await promisify(execFile)(command![0]!, [...command!.slice(1), payload]);
    expect(JSON.parse(result.stdout)).toEqual(["skills", payload]);
    await expect(resolveNpxSkillsCommand("", join(bin, "npx.cmd"), "", "win32"))
      .resolves.toEqual(command);
  });

  test("não aprova shim Windows sem entrypoint executável pelo Node", async () => {
    const root = await temporaryDirectory();
    await writeFile(join(root, "npx.cmd"), "fixture batch");
    await expect(resolveNpxSkillsCommand(root, undefined, "", "win32", ".CMD"))
      .resolves.toBeUndefined();
  });

  test("considera múltiplos diretórios Windows e PATHEXT sem configuração", async () => {
    const root = await temporaryDirectory();
    const first = join(root, "primeiro");
    const second = join(root, "segundo");
    await mkdir(first); await mkdir(second);
    await writeFile(join(first, "git.exe"), "fixture");
    await writeFile(join(second, "npm.CmD"), "fixture");
    const checks = await checkPrerequisites(root, {
      path: first + ";" + second,
      platform: "win32",
      pathext: ".COM;.EXE;.BAT;.CMD",
    });
    expect(checks.find(({ name }) => name === "git")?.command).toEqual([join(first, "git.exe")]);
    expect(checks.find(({ name }) => name === "npm")?.command).toEqual([join(second, "npm.CmD")]);
  });

  test("preserva a exigência de permissão e nomes POSIX", async () => {
    const root = await temporaryDirectory();
    await writeFile(join(root, "git.exe"), "fixture");
    await writeFile(join(root, "git"), "fixture");
    await chmod(join(root, "git.exe"), 0o755);
    await chmod(join(root, "git"), 0o644);
    const checks = await checkPrerequisites(root, { path: root, platform: "linux" });
    expect(checks.find(({ name }) => name === "git")?.ok).toBe(false);
  });

});
