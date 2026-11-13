/** Integração opcional com ClickUpfy, sem substituir a spec local. */
import { access, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface ClickUpfyHandoff {
  available: boolean;
  task_id?: string;
  action?: "transition" | "effort";
}

/** Detecta a skill instalada e lê o vínculo de tarefa do metadado da spec. */
export async function clickUpfyHandoff(
  project: string,
  specPath: string,
  action: "transition" | "effort",
): Promise<ClickUpfyHandoff> {
  const available = await hasClickUpfySkill(project);
  const content = await readFile(specPath, "utf8");
  const task = content.match(/^\|\s*ClickUp Task\s*\|\s*([^|]+?)\s*\|\s*$/imu)?.[1]?.trim();
  return task ? { available, task_id: task, action } : { available };
}

/**
 * Verifica as instalações atual e legada do ClickUpfy.
 *
 * A versão atual usa `clickup-issue-implement` em `.codex/skills`, com
 * instalação local ou global. A pasta `.agents/skills` permanece como
 * compatibilidade para projetos que ainda usam a integração anterior.
 */
export async function hasClickUpfySkill(
  project: string,
  userHome = homedir(),
): Promise<boolean> {
  const candidates = [
    join(project, ".codex", "skills", "clickup-issue-implement", "SKILL.md"),
    join(userHome, ".codex", "skills", "clickup-issue-implement", "SKILL.md"),
    join(project, ".agents", "skills", "clickupfy-executar-tarefa", "SKILL.md"),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return true;
    } catch {
      // A ausência de uma candidata apenas leva à próxima instalação possível.
    }
  }

  return false;
}
