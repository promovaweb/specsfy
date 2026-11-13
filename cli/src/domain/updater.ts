/**
 * Verificação consentida de versões e atualização do pacote ou executável.
 */

import { execFile } from "node:child_process";
import {
  chmod,
  lstat,
  mkdir,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { apiHeaders } from "./github.ts";
import { isFile, readJson, writeTextAtomic } from "./filesystem.ts";

const execFileAsync = promisify(execFile);

/** Fetch signature accepted by the update checks; tests pass plain functions. */
export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export const TAGS_API_URL =
  "https://api.github.com/repos/promovaweb/specsfy/tags?per_page=100";
export const NPM_REGISTRY_URL =
  "https://registry.npmjs.org/@promovaweb%2fspecsfy/latest";
export const EXECUTABLE_DOWNLOAD_URL = "https://get.specsfy.dev";
export const NPM_PACKAGE_NAME = "@promovaweb/specsfy";
export const DEFAULT_CHECK_INTERVAL_SECONDS = 86_400;
const EXECUTABLE_DOWNLOAD_TIMEOUT_MS = 15_000;
const SEMANTIC_TAG = /^v?(\d+)\.(\d+)\.(\d+)$/;
const COMMIT_SHA = /^[0-9a-f]{40,64}$/;

/** Versão estável mais recente que supera a versão em execução. */
export interface UpdateInfo {
  current_version: string;
  latest_version: string;
  tag: string;
  commit_sha?: string;
}

/** Dependências substituíveis para testar o aviso sem rede ou disco global. */
export interface StartupUpdateOptions {
  cachePath?: string;
  now?: number;
  fetcher?: FetchLike;
  upgrade?: (version: string) => Promise<UpgradeTarget>;
}

interface GlobalConfig {
  schema_version: 1;
  settings: Record<string, unknown> & {
    check_updates_on_startup: boolean;
    check_interval_seconds: number;
  };
  cache: Record<string, unknown>;
  [key: string]: unknown;
}

export type UpgradeTarget = "npm" | "executable";

/** Retorna o caminho global do cache do CLI. */
export function globalConfigPath(home = homedir()): string {
  return join(home, ".specsfy", "cli.json");
}

/** Cria ou normaliza o cache global com permissão privada. */
export async function ensureGlobalConfig(
  path = globalConfigPath(),
): Promise<GlobalConfig> {
  const raw = (await isFile(path)) ? await readJson(path) : {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`configuração global inválida em ${path}`);
  }
  const payload = raw as Record<string, unknown>;
  payload.schema_version = 1;
  if (
    payload.settings !== undefined &&
    (!payload.settings ||
      typeof payload.settings !== "object" ||
      Array.isArray(payload.settings))
  ) {
    throw new Error(`settings inválido em ${path}`);
  }
  if (
    payload.cache !== undefined &&
    (!payload.cache ||
      typeof payload.cache !== "object" ||
      Array.isArray(payload.cache))
  ) {
    throw new Error(`cache inválido em ${path}`);
  }
  const settings = (payload.settings as Record<string, unknown> | undefined) ?? {};
  const cache = (payload.cache as Record<string, unknown> | undefined) ?? {};
  settings.check_updates_on_startup ??= true;
  settings.check_interval_seconds ??= DEFAULT_CHECK_INTERVAL_SECONDS;
  payload.settings = settings;
  payload.cache = cache;
  await writeGlobalConfig(path, payload as GlobalConfig);
  return payload as GlobalConfig;
}

/** Consulta a versão publicada e retorna somente atualização distribuída. */
export async function checkForUpdate(
  currentVersion: string,
  options: {
    cachePath?: string;
    now?: number;
    force?: boolean;
    fetcher?: FetchLike;
  } = {},
): Promise<UpdateInfo | undefined> {
  const target = options.cachePath ?? globalConfigPath();
  const payload = await ensureGlobalConfig(target);
  const { settings, cache } = payload;
  if (settings.check_updates_on_startup === false && !options.force) return undefined;
  const timestamp = options.now ?? Date.now() / 1000;
  const checkedAt = cache.last_checked_at;
  const interval = settings.check_interval_seconds;
  if (
    !options.force &&
    typeof checkedAt === "number" &&
    typeof interval === "number" &&
    interval > 0 &&
    timestamp - checkedAt < interval &&
    typeof cache.latest_distribution_version === "string"
  ) {
    return cachedUpdate(currentVersion, cache, {
      force: Boolean(options.force),
      now: timestamp,
      interval,
    });
  }
  const fetcher = options.fetcher ?? fetch;
  try {
    const registryHeaders: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": `specsfy-cli/${currentVersion}`,
    };
    if (typeof cache.registry_etag === "string" && cache.registry_etag) {
      registryHeaders["If-None-Match"] = cache.registry_etag;
    }
    const registryResponse = await fetcher(NPM_REGISTRY_URL, {
      headers: registryHeaders,
      signal: AbortSignal.timeout(4_000),
    });
    let publishedVersion: string;
    if (registryResponse.status === 304) {
      const cachedVersion = cache.latest_distribution_version;
      if (typeof cachedVersion !== "string") {
        throw new Error("cache do registro npm sem versão publicada");
      }
      publishedVersion = cachedVersion;
    } else {
      if (!registryResponse.ok) throw new Error(`HTTP ${registryResponse.status}`);
      publishedVersion = latestPublishedVersion(
        (await registryResponse.json()) as unknown,
      );
      const registryEtag = registryResponse.headers.get("etag");
      if (registryEtag) cache.registry_etag = registryEtag;
    }

    let taggedVersion: ReturnType<typeof latestSemanticTag>;
    try {
      const headers = await apiHeaders(`specsfy-cli/${currentVersion}`);
      if (typeof cache.etag === "string" && cache.etag) {
        headers["If-None-Match"] = cache.etag;
      }
      const tagResponse = await fetcher(TAGS_API_URL, {
        headers,
        signal: AbortSignal.timeout(4_000),
      });
      if (tagResponse.status === 304) {
        taggedVersion = cachedTag(cache);
      } else if (tagResponse.ok) {
        taggedVersion = latestSemanticTag((await tagResponse.json()) as unknown);
        const tagEtag = tagResponse.headers.get("etag");
        if (tagEtag) cache.etag = tagEtag;
      }
    } catch {
      taggedVersion = cachedTag(cache);
    }

    cache.last_checked_at = timestamp;
    delete cache.last_error;
    cache.latest_distribution_version = publishedVersion;
    cache.latest_version = publishedVersion;
    cache.latest_tag =
      taggedVersion?.version === publishedVersion
        ? taggedVersion.tag
        : `v${publishedVersion}`;
    if (taggedVersion?.version === publishedVersion) {
      cache.latest_commit = taggedVersion.commit;
    } else {
      delete cache.latest_commit;
    }
    await writeGlobalConfig(target, payload);
    return cachedUpdate(currentVersion, cache, {
      force: Boolean(options.force),
      now: timestamp,
      interval,
    });
  } catch (error) {
    cache.last_checked_at = timestamp;
    cache.last_error = error instanceof Error ? error.message : String(error);
    await writeGlobalConfig(target, payload);
    return cachedUpdate(currentVersion, cache, {
      force: Boolean(options.force),
      now: timestamp,
      interval,
    });
  }
}

/** Comando público usado para atualizar a instalação global. */
export function npmUpgradeArguments(): string[] {
  return ["install", "--global", `${NPM_PACKAGE_NAME}@latest`];
}

/** Atualiza o pacote pelo npm encontrado no PATH. */
export async function upgradeWithNpm(): Promise<void> {
  await execFileAsync("npm", npmUpgradeArguments(), { encoding: "utf8" });
}

/** Retorna a entrada quando o CLI está rodando como executável avulso. */
export function standaloneExecutablePath(
  argv = process.argv,
): string | undefined {
  const entry = argv[1];
  if (!entry || extname(entry)) return undefined;
  return resolve(entry);
}

/** Baixa, valida e substitui atomicamente o executável avulso em uso. */
export async function upgradeWithExecutable(
  executablePath: string,
  expectedVersion: string,
  fetcher: FetchLike = fetch,
): Promise<void> {
  const response = await fetcher(EXECUTABLE_DOWNLOAD_URL, {
    headers: { "User-Agent": `specsfy-cli/${expectedVersion}` },
    signal: AbortSignal.timeout(EXECUTABLE_DOWNLOAD_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const target = await executableReplacementPath(executablePath);
  const temporary = join(
    dirname(target),
    `.${basename(target)}.${process.pid}.tmp`,
  );
  try {
    await writeFile(temporary, Buffer.from(await response.arrayBuffer()), {
      mode: 0o755,
    });
    await chmod(temporary, 0o755);
    const result = await execFileAsync(temporary, ["--version"], {
      encoding: "utf8",
    });
    if (result.stdout.trim() !== expectedVersion) {
      throw new Error(
        `executável baixado informa ${result.stdout.trim() || "versão vazia"}; esperado ${expectedVersion}`,
      );
    }
    await rename(temporary, target);
    await chmod(target, 0o755);
  } finally {
    await rm(temporary, { force: true });
  }
}

/** Atualiza a instalação real detectada no processo atual. */
export async function upgradeCurrentInstallation(
  expectedVersion: string,
  options: {
    executablePath?: string;
    fetcher?: FetchLike;
  } = {},
): Promise<UpgradeTarget> {
  const executablePath = options.executablePath ?? standaloneExecutablePath();
  if (executablePath) {
    await upgradeWithExecutable(
      executablePath,
      expectedVersion,
      options.fetcher ?? fetch,
    );
    return "executable";
  }
  await upgradeWithNpm();
  return "npm";
}

/** Registra o adiamento da mesma versão até o próximo intervalo de consulta. */
export async function deferStartupUpdate(
  version: string,
  options: { cachePath?: string; now?: number } = {},
): Promise<void> {
  const target = options.cachePath ?? globalConfigPath();
  const payload = await ensureGlobalConfig(target);
  payload.cache.startup_snoozed_version = version;
  payload.cache.startup_snoozed_at = options.now ?? Date.now() / 1000;
  await writeGlobalConfig(target, payload);
}

/** Remove o adiamento anterior depois de uma atualização concluída. */
export async function clearStartupUpdateDeferral(
  path = globalConfigPath(),
): Promise<void> {
  const payload = await ensureGlobalConfig(path);
  delete payload.cache.startup_snoozed_version;
  delete payload.cache.startup_snoozed_at;
  await writeGlobalConfig(path, payload);
}

/** Conduz o prompt de consentimento e informa se o processo deve encerrar. */
export async function offerStartupUpdate(
  currentVersion: string,
  ask: (prompt: string) => Promise<string>,
  output: (line: string) => void = console.log,
  options: StartupUpdateOptions = {},
): Promise<boolean> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) return false;
  let update: UpdateInfo | undefined;
  try {
    update = await checkForUpdate(currentVersion, {
      ...(options.cachePath === undefined ? {} : { cachePath: options.cachePath }),
      ...(options.now === undefined ? {} : { now: options.now }),
      ...(options.fetcher === undefined ? {} : { fetcher: options.fetcher }),
    });
  } catch (error) {
    output(
      `Aviso: não foi possível verificar atualizações: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return false;
  }
  if (!update) return false;
  output(
    `Uma nova versão do Specsfy CLI está disponível: ` +
      `${update.current_version} → ${update.latest_version}.`,
  );
  const answer = (await ask("Deseja atualizar agora? [s/N] ")).trim().toLowerCase();
  if (!["s", "sim", "y", "yes"].includes(answer)) {
    await rememberStartupDeferral(
      update.latest_version,
      {
        ...(options.cachePath === undefined
          ? {}
          : { cachePath: options.cachePath }),
        ...(options.now === undefined ? {} : { now: options.now }),
      },
      output,
    );
    output("Atualização adiada. Abrindo a aplicação normalmente.");
    return false;
  }
  let target: UpgradeTarget;
  try {
    target = await (options.upgrade ?? upgradeCurrentInstallation)(
      update.latest_version,
    );
  } catch (error) {
    await rememberStartupDeferral(
      update.latest_version,
      {
        ...(options.cachePath === undefined
          ? {}
          : { cachePath: options.cachePath }),
        ...(options.now === undefined ? {} : { now: options.now }),
      },
      output,
    );
    output(
      `Falha ao atualizar: ${
        error instanceof Error ? error.message : String(error)
      }. Abrindo normalmente.`,
    );
    return false;
  }
  await clearStartupUpdateDeferral(options.cachePath);
  output(
    `${target === "executable" ? "O executável" : "O npm"} atualizou o Specsfy CLI para ${update.latest_version}. ` +
      "O CLI será fechado; abra-o novamente para usar a nova versão.",
  );
  return true;
}

/** Resolve o alvo real quando a instalação foi exposta por um link simbólico. */
async function executableReplacementPath(path: string): Promise<string> {
  try {
    if ((await lstat(path)).isSymbolicLink()) return await realpath(path);
  } catch {
    // A validação do executável baixado produzirá o erro acionável ao final.
  }
  return path;
}

/** Evita que uma falha secundária de cache impeça a abertura normal do CLI. */
async function rememberStartupDeferral(
  version: string,
  options: { cachePath?: string; now?: number },
  output: (line: string) => void,
): Promise<void> {
  try {
    await deferStartupUpdate(version, options);
  } catch (error) {
    output(
      `Aviso: não foi possível registrar o adiamento da atualização: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function writeGlobalConfig(
  path: string,
  payload: GlobalConfig,
): Promise<void> {
  const directory = dirname(path);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if (basename(directory) === ".specsfy") await chmod(directory, 0o700);
  await writeTextAtomic(path, `${JSON.stringify(payload, null, 2)}\n`, 0o600);
  await chmod(path, 0o600);
}

function latestSemanticTag(
  tags: unknown,
): { version: string; tag: string; commit: string } | undefined {
  if (!Array.isArray(tags)) throw new Error("resposta de tags inválida");
  const candidates: Array<{
    tuple: [number, number, number];
    version: string;
    tag: string;
    commit: string;
  }> = [];
  for (const item of tags) {
    if (!item || typeof item !== "object") continue;
    const value = item as Record<string, unknown>;
    const match = typeof value.name === "string" ? SEMANTIC_TAG.exec(value.name) : null;
    const commit =
      value.commit && typeof value.commit === "object"
        ? (value.commit as Record<string, unknown>).sha
        : undefined;
    if (!match || typeof commit !== "string" || !COMMIT_SHA.test(commit)) continue;
    const tuple = [
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    ] as [number, number, number];
    candidates.push({
      tuple,
      version: tuple.join("."),
      tag: value.name as string,
      commit,
    });
  }
  candidates.sort((left, right) => compareVersions(right.tuple, left.tuple));
  return candidates[0];
}

/** Extrai a versão estável realmente publicada no registro npm. */
function latestPublishedVersion(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("resposta de versão publicada inválida");
  }
  const version = (payload as Record<string, unknown>).version;
  if (typeof version !== "string" || !SEMANTIC_TAG.test(version)) {
    throw new Error("versão publicada inválida");
  }
  return versionTuple(version).join(".");
}

/** Recupera a tag em cache quando a API do GitHub responde com 304. */
function cachedTag(
  cache: Record<string, unknown>,
): { version: string; tag: string; commit: string } | undefined {
  const version = cache.latest_version;
  const tag = cache.latest_tag;
  const commit = cache.latest_commit;
  if (
    typeof version !== "string" ||
    typeof tag !== "string" ||
    typeof commit !== "string" ||
    !COMMIT_SHA.test(commit)
  ) {
    return undefined;
  }
  return { version, tag, commit };
}

function cachedUpdate(
  currentVersion: string,
  cache: Record<string, unknown>,
  options: { force: boolean; now: number; interval: unknown },
): UpdateInfo | undefined {
  const latest = cache.latest_version;
  const tag = cache.latest_tag;
  const commit = cache.latest_commit;
  if (
    typeof latest !== "string" ||
    typeof tag !== "string" ||
    cache.latest_distribution_version !== latest
  ) {
    return undefined;
  }
  if (
    !options.force &&
    cache.startup_snoozed_version === latest &&
    typeof cache.startup_snoozed_at === "number" &&
    typeof options.interval === "number" &&
    options.interval > 0 &&
    options.now - cache.startup_snoozed_at < options.interval
  ) {
    return undefined;
  }
  const currentTuple = versionTuple(currentVersion);
  const latestTuple = versionTuple(latest);
  const tagTuple = versionTuple(tag);
  if (
    compareVersions(latestTuple, currentTuple) <= 0 ||
    compareVersions(tagTuple, latestTuple) !== 0
  ) {
    return undefined;
  }
  const update: UpdateInfo = {
    current_version: currentVersion,
    latest_version: latest,
    tag,
  };
  if (typeof commit === "string" && COMMIT_SHA.test(commit)) {
    update.commit_sha = commit;
  }
  return update;
}

function versionTuple(version: string): [number, number, number] {
  const match = SEMANTIC_TAG.exec(version);
  if (!match) throw new Error(`versão semântica inválida: ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(
  left: [number, number, number],
  right: [number, number, number],
): number {
  for (let index = 0; index < 3; index += 1) {
    const difference = left[index]! - right[index]!;
    if (difference) return difference;
  }
  return 0;
}
