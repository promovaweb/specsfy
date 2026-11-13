/**
 * Utilitários compartilhados de filesystem.
 *
 * Centraliza resolução de caminhos, escrita atômica e varreduras pequenas
 * usadas pelo CLI sem esconder operações destrutivas.
 */

import { constants } from "node:fs";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

/** Expande `~` e retorna um caminho absoluto normalizado. */
export function resolvePath(value: string): string {
  const expanded =
    value === "~"
      ? homedir()
      : value.startsWith("~/")
        ? join(homedir(), value.slice(2))
        : value;
  return isAbsolute(expanded) ? resolve(expanded) : resolve(process.cwd(), expanded);
}

/** Informa se um caminho existe, sem propagar a ausência como erro. */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/** Informa se um caminho existente é um arquivo regular. */
export async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** Escreve texto UTF-8 por arquivo temporário no mesmo diretório. */
export async function writeTextAtomic(
  target: string,
  content: string,
  mode?: number,
): Promise<void> {
  await mkdir(dirname(target), { recursive: true });
  const temporary = join(
    dirname(target),
    `.${basename(target) || "arquivo"}.${process.pid}.tmp`,
  );
  await writeFile(temporary, content, { encoding: "utf8", mode });
  await rename(temporary, target);
}

/** Lê JSON e mantém o tipo como desconhecido até a validação do chamador. */
export async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

/** Lista arquivos recursivamente em ordem estável. */
export async function listFiles(root: string): Promise<string[]> {
  if (!(await pathExists(root))) {
    return [];
  }
  const output: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      output.push(...(await listFiles(path)));
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      output.push(path);
    }
  }
  return output.sort();
}
