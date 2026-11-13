/** Regressões da descoberta da integração entre Specsfy e ClickUpfy. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { clickUpfyHandoff, hasClickUpfySkill } from "../../src/domain/clickupfy.ts";
import { temporaryDirectory } from "./helpers.ts";

async function createSpec(project: string): Promise<string> {
  const path = join(project, "specs", "planned", "0001-integracao", "spec.md");
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, "# Integração\n\n| ClickUp Task | task-123 |\n");
  return path;
}

describe("handoff do ClickUpfy", () => {
  test("detecta a skill atual instalada no projeto", async () => {
    const project = await temporaryDirectory();
    const userHome = await temporaryDirectory();
    const specPath = await createSpec(project);
    await mkdir(
      join(project, ".codex", "skills", "clickup-issue-implement"),
      { recursive: true },
    );
    await writeFile(
      join(project, ".codex", "skills", "clickup-issue-implement", "SKILL.md"),
      "# ClickUp Issue Implement\n",
    );

    await expect(hasClickUpfySkill(project, userHome)).resolves.toBe(true);
    await expect(clickUpfyHandoff(project, specPath, "transition")).resolves.toEqual({
      available: true,
      task_id: "task-123",
      action: "transition",
    });
  });

  test("detecta a skill atual instalada globalmente", async () => {
    const project = await temporaryDirectory();
    const userHome = await temporaryDirectory();
    await mkdir(
      join(userHome, ".codex", "skills", "clickup-issue-implement"),
      { recursive: true },
    );
    await writeFile(
      join(userHome, ".codex", "skills", "clickup-issue-implement", "SKILL.md"),
      "# ClickUp Issue Implement\n",
    );

    await expect(hasClickUpfySkill(project, userHome)).resolves.toBe(true);
  });

  test("mantém compatibilidade com a instalação legada do projeto", async () => {
    const project = await temporaryDirectory();
    const userHome = await temporaryDirectory();
    await mkdir(
      join(project, ".agents", "skills", "clickupfy-executar-tarefa"),
      { recursive: true },
    );
    await writeFile(
      join(project, ".agents", "skills", "clickupfy-executar-tarefa", "SKILL.md"),
      "# ClickUpfy legado\n",
    );

    await expect(hasClickUpfySkill(project, userHome)).resolves.toBe(true);
  });

  test("não anuncia o handoff quando nenhuma skill está instalada", async () => {
    const project = await temporaryDirectory();
    const userHome = await temporaryDirectory();
    const specPath = await createSpec(project);

    await expect(hasClickUpfySkill(project, userHome)).resolves.toBe(false);
    await expect(clickUpfyHandoff(project, specPath, "effort")).resolves.toEqual({
      available: false,
      task_id: "task-123",
      action: "effort",
    });
  });
});
