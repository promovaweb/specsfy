/**
 * Configuração persistente por projeto.
 */

import { join } from "node:path";
import { isFile, readJson, resolvePath, writeTextAtomic } from "./filesystem.ts";

export const DEFAULT_WATCH_INTERVAL = 0.75;

/** Configuração efetiva do projeto. */
export interface ProjectConfig {
  project: string;
  watch_interval: number;
}

type ConfigPayload = Record<string, unknown> & {
  schema_version?: number;
  watch_interval?: number;
};

/** Carrega a configuração e aplica os valores padrão. */
export async function loadConfig(project: string): Promise<ProjectConfig> {
  const root = resolvePath(project);
  const payload = await readPayload(root);
  const interval = Number(payload.watch_interval ?? DEFAULT_WATCH_INTERVAL);
  validateInterval(interval);
  return { project: root, watch_interval: interval };
}

/** Atualiza o intervalo preservando campos desconhecidos. */
export async function updateConfig(
  project: string,
  watchInterval: number,
): Promise<ProjectConfig> {
  const root = resolvePath(project);
  validateInterval(watchInterval);
  const payload = await readPayload(root);
  payload.schema_version = 1;
  payload.watch_interval = watchInterval;
  await writeTextAtomic(
    join(root, ".specsfy", "config.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  return { project: root, watch_interval: watchInterval };
}

async function readPayload(project: string): Promise<ConfigPayload> {
  const path = join(project, ".specsfy", "config.json");
  if (!(await isFile(path))) return { schema_version: 1 };
  const payload = await readJson(path);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error(`configuração inválida: ${path}`);
  }
  const value = payload as ConfigPayload;
  if ((value.schema_version ?? 1) !== 1) {
    throw new Error("versão de configuração não suportada");
  }
  return value;
}

function validateInterval(interval: number): void {
  if (!Number.isFinite(interval) || interval <= 0) {
    throw new Error("watch interval deve ser um número finito maior que zero");
  }
}
