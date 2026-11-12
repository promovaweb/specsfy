/** Regressões do lock e da proteção de conteúdo gerenciado. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  ensureSkillsLock,
  installedSkillNames,
  readSkillsLock,
} from "../src/skill-lock.js";
import { temporaryDirectory } from "./helpers.js";

describe("lock de skills", () => {
  test("cria o lock oficial mínimo e lista nomes", async () => {
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

  test("lê o lock na versão 2 gravada pelo gerenciador skills", async () => {
    const project = await temporaryDirectory();
    await writeFile(
      join(project, "skills-lock.json"),
      JSON.stringify({
        version: 2,
        skills: {
          "specsfy-setup": {
            source: "skills",
            sourceType: "local",
            computedHash: "abc",
            installMode: "copy",
          },
        },
      }),
    );
    expect(await installedSkillNames(project, false)).toEqual(
      new Set(["specsfy-setup"]),
    );
  });

  test("recusa versão de lock desconhecida", async () => {
    const project = await temporaryDirectory();
    await writeFile(
      join(project, "skills-lock.json"),
      JSON.stringify({ version: 3, skills: {} }),
    );
    await expect(readSkillsLock(project)).rejects.toThrow("não suportada");
  });

  test("recusa a raiz oficial", async () => {
    const project = await temporaryDirectory();
    await mkdir(project, { recursive: true });
    await writeFile(
      join(project, "AGENTS.md"),
      "Este é o monorepo oficial do Specsfy.",
    );
    await expect(ensureSkillsLock(project)).rejects.toThrow(
      "operação recusada",
    );
  });
});
