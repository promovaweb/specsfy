/** Diagnóstico compartilhado pelos fluxos de setup, update e upgrade. */

import { constants } from "node:fs";
import { access, realpath, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { delimiter, join, resolve } from "node:path";

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
  skillsOverride?: string;
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
 * Resolve o comando oficial `skills` sem depender apenas do PATH do processo.
 *
 * A instalação incluída no pacote cobre launchers gráficos e chamadas por
 * caminho absoluto, que podem omitir o diretório global do npm no PATH.
 */
export async function resolveSkillsCommand(
  path = process.env.PATH ?? "",
  override = process.env.SPECSFY_SKILLS_CLI,
  launcher = process.argv[1],
  platform: NodeJS.Platform = process.platform,
  pathext = process.env.PATHEXT,
): Promise<string[] | undefined> {
  if (override) {
    const executable = resolve(override);
    return (await isExecutable(executable)) ? [executable] : undefined;
  }
  const skills = await findExecutable("skills", path, platform, pathext);
  if (skills) return [skills];
  const packaged = await resolvePackagedSkills(launcher);
  if (packaged) return [process.execPath, packaged];
  const npx = await findExecutable("npx", path, platform, pathext);
  return npx ? [npx, "--yes", "skills"] : undefined;
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
  const skills = await resolveSkillsCommand(
    path,
    options.skillsOverride ?? process.env.SPECSFY_SKILLS_CLI,
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
        ? `skills CLI disponível por ${skills.join(" ")}`
        : "skills CLI ausente; reinstale `@promovaweb/specsfy` pelo npm ou " +
          "disponibilize `skills` ou `npx` no PATH",
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

async function findExecutable(
  name: string,
  path: string,
  platform: NodeJS.Platform = process.platform,
  pathext = process.env.PATHEXT,
): Promise<string | undefined> {
  for (const directory of path.split(delimiter)) {
    if (!directory) continue;
    for (const extension of executableExtensions(platform, pathext)) {
      const executable = join(directory, `${name}${extension}`);
      if (await isExecutable(executable)) return executable;
    }
  }
  return undefined;
}

/**
 * Sufixos que tornam um arquivo executável na plataforma corrente.
 *
 * No Windows um comando do PATH é um arquivo com extensão declarada em
 * `PATHEXT`; procurar apenas pelo nome nunca encontra `git.exe`.
 */
function executableExtensions(platform: NodeJS.Platform, pathext: string | undefined): string[] {
  if (platform !== "win32") return [""];
  const declared = (pathext ?? ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
  return ["", ...declared];
}

/** Localiza a dependência `skills` a partir do launcher instalado do Specsfy. */
async function resolvePackagedSkills(
  launcher: string | undefined,
): Promise<string | undefined> {
  if (!launcher) return undefined;
  try {
    const require = createRequire(await realpath(resolve(launcher)));
    const executable = require.resolve("skills/bin/cli.mjs");
    await access(executable, constants.R_OK);
    return executable;
  } catch {
    return undefined;
  }
}

async function isExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
