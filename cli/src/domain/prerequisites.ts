/** Diagnóstico compartilhado pelos fluxos de setup, update e upgrade. */

import { constants } from "node:fs";
import { access, readdir, stat } from "node:fs/promises";
import { delimiter, dirname, extname, join, resolve } from "node:path";

const MINIMUM_NODE_VERSION = [22, 20, 0] as const;

export interface PrerequisiteCheck {
  name: "node" | "git" | "skills" | "npm" | "project";
  ok: boolean;
  detail: string;
  command?: string[] | undefined;
}

interface CheckOptions {
  path?: string;
  nodeVersion?: string;
  npxOverride?: string;
  skillsLauncher?: string;
  platform?: NodeJS.Platform;
  pathext?: string;
}

/** Informa se a versão do runtime satisfaz o contrato do pacote. */
export function nodeVersionSupported(version: string): boolean {
  const parts = version.split(".").map(Number);
  if (parts.length < 2 || parts.some((part) => !Number.isInteger(part))) return false;
  for (let index = 0; index < MINIMUM_NODE_VERSION.length; index += 1) {
    const difference = (parts[index] ?? 0) - MINIMUM_NODE_VERSION[index]!;
    if (difference) return difference > 0;
  }
  return true;
}

/**
 * Resolve o `npx` que chama a CLI oficial `skills` sob demanda.
 *
 * Toda materialização do Specsfy passa por `npx skills add`, para usar a
 * versão publicada e tornar o comando apresentado à pessoa explícito.
 */
export async function resolveNpxSkillsCommand(
  path = process.env.PATH ?? "",
  override = process.env.SPECSFY_NPX_COMMAND,
  _launcher = process.argv[1],
  platform: NodeJS.Platform = process.platform,
  pathext = process.env.PATHEXT,
): Promise<string[] | undefined> {
  if (override) {
    const executable = resolve(override);
    return (await isExecutable(executable, platform))
      ? npxCommand(executable, platform)
      : undefined;
  }
  const npx = await findExecutable("npx", path, platform, pathext);
  return npx ? npxCommand(npx, platform) : undefined;
}

/** Verifica todos os recursos usados pelos comandos de instalação e atualização. */
export async function checkPrerequisites(
  project: string,
  options: CheckOptions = {},
): Promise<PrerequisiteCheck[]> {
  const path = options.path ?? process.env.PATH ?? "";
  const nodeVersion = options.nodeVersion ?? process.versions.node;
  const platform = options.platform ?? process.platform;
  const pathext = options.pathext ?? process.env.PATHEXT;
  const git = await findExecutable("git", path, platform, pathext);
  const npm = await findExecutable("npm", path, platform, pathext);
  const skills = await resolveNpxSkillsCommand(
    path,
    options.npxOverride ?? process.env.SPECSFY_NPX_COMMAND,
    options.skillsLauncher ?? process.argv[1],
    platform,
    pathext,
  );
  const target = resolve(project);
  let projectOk = false;
  try {
    projectOk = (await stat(target)).isDirectory();
    if (projectOk) await access(target, constants.R_OK | constants.W_OK);
  } catch {
    projectOk = false;
  }

  return [
    {
      name: "node",
      ok: nodeVersionSupported(nodeVersion),
      detail: `Node.js 22.20 ou mais recente; versão atual: ${nodeVersion}`,
    },
    {
      name: "git",
      ok: Boolean(git),
      detail: git ? `Git encontrado em ${git}` : "Git não encontrado no PATH",
      command: git ? [git] : undefined,
    },
    {
      name: "skills",
      ok: Boolean(skills),
      detail: skills
        ? `instalação de skills disponível por ${skills.join(" ")}`
        : "npx não encontrado; instale o npm e disponibilize `npx` no PATH",
      command: skills,
    },
    {
      name: "npm",
      ok: Boolean(npm),
      detail: npm ? `npm encontrado em ${npm}` : "npm não encontrado no PATH",
      command: npm ? [npm] : undefined,
    },
    {
      name: "project",
      ok: projectOk,
      detail: projectOk
        ? `projeto legível e gravável em ${target}`
        : `projeto ausente, inválido ou sem permissão de escrita: ${target}`,
    },
  ];
}

/** Interrompe o fluxo com todas as correções necessárias em uma única mensagem. */
export function assertPrerequisites(
  checks: PrerequisiteCheck[],
  required: PrerequisiteCheck["name"][] = checks.map(({ name }) => name),
): void {
  const selected = new Set(required);
  const failures = checks.filter(({ name, ok }) => selected.has(name) && !ok);
  if (!failures.length) return;
  throw new Error(
    "pré-requisitos ausentes:\n" +
      failures.map(({ detail }) => `- ${detail}`).join("\n"),
  );
}

/** Localiza arquivos de comandos, incluindo PATHEXT e caixa Windows. */
async function findExecutable(
  name: string,
  path: string,
  platform: NodeJS.Platform = process.platform,
  pathext = process.env.PATHEXT,
): Promise<string | undefined> {
  const windows = platform === "win32";
  const extensions = windows
    ? [...(pathext ?? ".COM;.EXE;.BAT;.CMD").split(";").map((value) => value.trim()).filter((value) => /^\.[a-z0-9]+$/i.test(value)), ""]
    : [""];
  for (const item of path.split(windows ? ";" : delimiter)) {
    const directory = windows ? item.replace(/^"(.*)"$/, "$1") : item;
    if (!directory) continue;
    // A listagem preserva a caixa real mesmo nos testes Windows executados em Linux.
    let entries: string[] = [];
    if (windows) {
      try { entries = await readdir(directory); } catch { continue; }
    }
    for (const extension of extensions) {
      const filename = name + extension;
      const actual = windows
        ? entries.find((entry) => entry.toLowerCase() === filename.toLowerCase())
        : filename;
      if (!actual) continue;
      const executable = join(directory, actual);
      if (await isExecutable(executable, platform)) return executable;
    }
  }
  return undefined;
}

/** Executa o entrypoint do npm pelo Node para evitar shims batch e shell. */
async function npxCommand(executable: string, platform: NodeJS.Platform): Promise<string[] | undefined> {
  if (platform !== "win32" || /\.(exe|com)$/i.test(extname(executable))) {
    return [executable, "skills"];
  }
  const entrypoint = join(dirname(executable), "node_modules", "npm", "bin", "npx-cli.js");
  try {
    await access(entrypoint, constants.R_OK);
    if ((await stat(entrypoint)).isFile()) return [process.execPath, entrypoint, "skills"];
  } catch {
    // Sem o entrypoint, o diagnóstico não pode aprovar um shim que execFile rejeita.
  }
  return undefined;
}

async function isExecutable(path: string, platform: NodeJS.Platform = process.platform): Promise<boolean> {
  try {
    if (!(await stat(path)).isFile()) return false;
    await access(path, platform === "win32" ? constants.F_OK : constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
