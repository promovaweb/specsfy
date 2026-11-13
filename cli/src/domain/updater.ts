/**
 * Version check and self-upgrade of the compiled `specsfy` binary.
 *
 * The latest version is the tag of the latest GitHub Release of
 * promovaweb/specsfy (`releases/latest`, authenticated with the token of
 * `github.ts` when there is one). Each release carries one executable per
 * platform, `specsfy-<os>-<arch>[.exe]`, plus `SHA256SUMS`, built by the
 * `cli-release.yml` workflow from `scripts/build.ts --all`.
 *
 * How `upgrade` replaces the installation depends on how it runs:
 *
 * - `npm`: the npm wrapper `@promovaweb/specsfy` started the binary (it sets
 *   `SPECSFY_NPM_WRAPPER=1`); npm updates the wrapper, which then downloads
 *   the binary of the new version on its next run;
 * - `binary`: a standalone executable; the asset of this platform is
 *   downloaded from `<download base>/v<version>/<asset>`, checked against
 *   `SHA256SUMS` and `--version`, and swapped atomically;
 * - `source`: `bun run src/main.ts`; nothing to replace, so upgrade refuses.
 *
 * The download base defaults to the GitHub Releases download URL;
 * `SPECSFY_DOWNLOAD_URL` points to a mirror with the same layout (for
 * example get.specsfy.dev). The daily check is cached in
 * `~/.specsfy/update.json` and is disabled by the `update.check` setting.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, lstat, mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { promisify } from "node:util";
import { AppError, error as appError } from "../app/errors.ts";
import { ExitCode } from "../app/exit-codes.ts";
import { paths } from "../config/paths.ts";
import { apiHeaders } from "./github.ts";
import { isCompiledBinary } from "./prerequisites.ts";
import { writeTextAtomic } from "./filesystem.ts";

const execFileAsync = promisify(execFile);

/** Fetch signature accepted by the update functions; tests pass plain functions. */
export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export const RELEASES_API_URL = "https://api.github.com/repos/promovaweb/specsfy/releases/latest";
export const DEFAULT_DOWNLOAD_BASE_URL = "https://github.com/promovaweb/specsfy/releases/download";
export const NPM_PACKAGE_NAME = "@promovaweb/specsfy";
export const CHECK_INTERVAL_SECONDS = 86_400;
const SEMVER = /^v?(\d+)\.(\d+)\.(\d+)$/;
const REQUEST_TIMEOUT_MS = 10_000;
const DOWNLOAD_TIMEOUT_MS = 120_000;

/** How the running binary was installed. */
export type InstallationKind = "npm" | "launcher" | "binary" | "source";

/** Short URL that serves `cli/bin/specsfy` of the main branch, the Node.js launcher. */
export const LAUNCHER_URL = "https://get.specsfy.dev";

/** Result of a version check. */
export interface UpdateCheck {
  current: string;
  latest: string;
  /** True when `latest` is newer than `current`. */
  available: boolean;
}

/** Normalizes `v1.2.3` or `1.2.3` to a tuple; throws for anything else. */
export function versionTuple(version: string): [number, number, number] {
  const match = SEMVER.exec(version.trim());
  if (!match) throw new AppError(ExitCode.NETWORK_OR_API, `invalid semantic version: ${version}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Compares two versions; positive when `left` is newer. */
export function compareVersions(left: string, right: string): number {
  const a = versionTuple(left);
  const b = versionTuple(right);
  for (let index = 0; index < 3; index += 1) {
    const difference = a[index]! - b[index]!;
    if (difference) return difference;
  }
  return 0;
}

/** Release asset name for a platform, as produced by `scripts/build.ts --all`. */
export function assetName(platform: NodeJS.Platform = process.platform, arch: string = process.arch): string {
  const os = platform === "win32" ? "windows" : platform;
  const supported = ["linux-x64", "linux-arm64", "darwin-x64", "darwin-arm64", "windows-x64"];
  const target = `${os}-${arch}`;
  if (!supported.includes(target)) throw appError.usage(`no prebuilt specsfy binary for ${target}`, { target });
  return `specsfy-${target}${os === "windows" ? ".exe" : ""}`;
}

/** Base URL of release downloads, honoring SPECSFY_DOWNLOAD_URL. */
export function downloadBaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  return (env.SPECSFY_DOWNLOAD_URL?.trim() || DEFAULT_DOWNLOAD_BASE_URL).replace(/\/+$/, "");
}

/** URL of one file of a release. */
export function releaseFileUrl(version: string, file: string, base = downloadBaseUrl()): string {
  return `${base}/v${versionTuple(version).join(".")}/${file}`;
}

/** Detects how the running process was installed. */
export function installationKind(env: NodeJS.ProcessEnv = process.env, main = Bun.main): InstallationKind {
  if (env.SPECSFY_LAUNCHER) return "launcher";
  if (env.SPECSFY_NPM_WRAPPER === "1") return "npm";
  return isCompiledBinary(main) ? "binary" : "source";
}

/** Asks GitHub for the latest release version. Network failures are NETWORK_OR_API. */
export async function fetchLatestVersion(currentVersion: string, fetcher: FetchLike = fetch): Promise<string> {
  let response: Response;
  try {
    response = await fetcher(RELEASES_API_URL, {
      headers: await apiHeaders(`specsfy-cli/${currentVersion}`),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (e) {
    throw appError.network(`could not reach GitHub Releases: ${e instanceof Error ? e.message : String(e)}`);
  }
  // The repository is public: a stale or revoked token must not block the check.
  if (response.status === 401) {
    try {
      response = await fetcher(RELEASES_API_URL, { headers: { "User-Agent": `specsfy-cli/${currentVersion}`, Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (e) {
      throw appError.network(`could not reach GitHub Releases: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (!response.ok) throw appError.network(`GitHub Releases answered HTTP ${response.status}`, { status: response.status });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw appError.network("GitHub Releases returned invalid JSON");
  }
  const tag = payload && typeof payload === "object" ? (payload as Record<string, unknown>).tag_name : undefined;
  if (typeof tag !== "string" || !SEMVER.test(tag)) throw appError.network("the latest release has no semantic version tag");
  return versionTuple(tag).join(".");
}

/** Checks for a newer release, always over the network. */
export async function checkForUpdate(currentVersion: string, fetcher: FetchLike = fetch): Promise<UpdateCheck> {
  const latest = await fetchLatestVersion(currentVersion, fetcher);
  return { current: currentVersion, latest, available: compareVersions(latest, currentVersion) > 0 };
}

/** Path of the daily check cache. */
export function updateCachePath(): string {
  return join(paths.base(), "update.json");
}

/**
 * Daily check used by the TUI and doctor: reuses the cached answer for a
 * day, never throws and returns undefined when `enabled` is false or the
 * network fails without a cached answer.
 */
export async function dailyUpdateCheck(
  currentVersion: string,
  options: { enabled: boolean; fetcher?: FetchLike; now?: number; cachePath?: string },
): Promise<UpdateCheck | undefined> {
  if (!options.enabled) return undefined;
  const path = options.cachePath ?? updateCachePath();
  const now = options.now ?? Date.now() / 1000;
  let cache: { checked_at?: number; latest?: string } = {};
  try {
    cache = JSON.parse(await readFile(path, "utf8")) as typeof cache;
  } catch {
    cache = {};
  }
  const fresh = typeof cache.checked_at === "number" && now - cache.checked_at < CHECK_INTERVAL_SECONDS && typeof cache.latest === "string";
  let latest = fresh ? cache.latest : undefined;
  if (!latest) {
    try {
      latest = await fetchLatestVersion(currentVersion, options.fetcher);
      try {
        await mkdir(dirname(path), { recursive: true, mode: 0o700 });
        await writeTextAtomic(path, `${JSON.stringify({ checked_at: now, latest }, null, 2)}\n`, 0o600);
      } catch {
        // A read-only home only loses the cache; the check result is still valid.
      }
    } catch {
      latest = typeof cache.latest === "string" ? cache.latest : undefined;
    }
  }
  if (!latest) return undefined;
  try {
    return { current: currentVersion, latest, available: compareVersions(latest, currentVersion) > 0 };
  } catch {
    return undefined;
  }
}

/** Arguments of the npm command that updates the wrapper. */
export function npmUpgradeArguments(): string[] {
  return ["install", "--global", `${NPM_PACKAGE_NAME}@latest`];
}

/**
 * Updates the npm wrapper with the npm found in PATH. Only a global install
 * is updated in place; a project install or npx gets the command to run, so
 * the upgrade never adds a global package the person did not have.
 */
export async function upgradeWithNpm(scope = process.env.SPECSFY_NPM_SCOPE ?? "global"): Promise<void> {
  if (scope === "npx") return;
  if (scope === "local") {
    throw new AppError(ExitCode.USAGE, `specsfy is installed in this project: run npm install ${NPM_PACKAGE_NAME}@latest there.`);
  }
  try {
    await execFileAsync(process.platform === "win32" ? "npm.cmd" : "npm", npmUpgradeArguments(), { encoding: "utf8", shell: process.platform === "win32" });
  } catch (e) {
    const detail = String((e as { stderr?: unknown }).stderr ?? (e as Error).message ?? "").trim();
    throw new AppError(ExitCode.GENERIC_ERROR, `npm could not update ${NPM_PACKAGE_NAME}; run: npm ${npmUpgradeArguments().join(" ")}${detail ? `\n${detail}` : ""}`);
  }
}

/** Parses a `SHA256SUMS` file into `{ file: hash }`. */
export function parseChecksums(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^([0-9a-f]{64})\s+\*?(.+)$/i.exec(line.trim());
    if (match) result[match[2]!.trim()] = match[1]!.toLowerCase();
  }
  return result;
}

async function download(url: string, version: string, fetcher: FetchLike): Promise<Response> {
  let response: Response;
  try {
    response = await fetcher(url, { headers: { "User-Agent": `specsfy-cli/${version}` }, signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS), redirect: "follow" });
  } catch (e) {
    throw appError.network(`download failed: ${url}: ${e instanceof Error ? e.message : String(e)}`);
  }
  if (!response.ok) throw appError.network(`download failed: ${url}: HTTP ${response.status}`, { status: response.status });
  return response;
}

/**
 * Downloads the asset of this platform for `version`, verifies its SHA-256
 * against the release `SHA256SUMS` and its `--version` output, then swaps
 * it into `executablePath` (following a symlink to the real file). On
 * Windows the running file is renamed to `<name>.old` first.
 */
export async function upgradeBinary(
  executablePath: string,
  version: string,
  options: { fetcher?: FetchLike; base?: string; platform?: NodeJS.Platform; arch?: string; verify?: boolean } = {},
): Promise<string> {
  const fetcher = options.fetcher ?? fetch;
  const platform = options.platform ?? process.platform;
  const asset = assetName(platform, options.arch ?? process.arch);
  const base = options.base ?? downloadBaseUrl();
  const sums = parseChecksums(await (await download(releaseFileUrl(version, "SHA256SUMS", base), version, fetcher)).text());
  const expected = sums[asset];
  if (!expected) throw appError.network(`SHA256SUMS of v${version} does not list ${asset}`);
  const bytes = Buffer.from(await (await download(releaseFileUrl(version, asset, base), version, fetcher)).arrayBuffer());
  const actual = createHash("sha256").update(bytes).digest("hex");
  if (actual !== expected) throw appError.network(`checksum mismatch for ${asset}: expected ${expected}, got ${actual}`);

  const target = await replacementPath(executablePath);
  const temporary = join(dirname(target), `.${basename(target)}.${process.pid}.tmp`);
  try {
    try {
      await writeFile(temporary, bytes, { mode: 0o755 });
      await chmod(temporary, 0o755);
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === "EACCES" || code === "EPERM") throw appError.permission(`cannot write next to ${target}; rerun with permission to replace it`);
      throw e;
    }
    if (options.verify !== false) {
      const result = await execFileAsync(temporary, ["--version"], { encoding: "utf8" });
      if (!result.stdout.includes(version)) {
        throw new AppError(ExitCode.GENERIC_ERROR, `downloaded binary reports "${result.stdout.trim() || "nothing"}"; expected ${version}`);
      }
    }
    if (platform === "win32") {
      await rm(`${target}.old`, { force: true });
      await rename(target, `${target}.old`).catch(() => undefined);
    }
    await rename(temporary, target);
    return target;
  } finally {
    await rm(temporary, { force: true });
  }
}

/**
 * Replaces the Node.js launcher installed from `get.specsfy.dev` with the
 * current one. The new launcher must declare the expected version; it
 * downloads its own binary on the next run.
 */
export async function upgradeLauncher(launcherPath: string, version: string, fetcher: FetchLike = fetch, url = LAUNCHER_URL): Promise<string> {
  const text = await (await download(url, version, fetcher)).text();
  if (!text.includes(`const version = "${version}";`)) {
    throw appError.network(`${url} does not serve the launcher of v${version} yet; try again after the release finishes`);
  }
  const target = await replacementPath(launcherPath);
  const temporary = join(dirname(target), `.${basename(target)}.${process.pid}.tmp`);
  try {
    try {
      await writeFile(temporary, text, { mode: 0o755 });
      await chmod(temporary, 0o755);
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      if (code === "EACCES" || code === "EPERM") throw appError.permission(`cannot write next to ${target}; rerun with permission to replace it`);
      throw e;
    }
    await rename(temporary, target);
    return target;
  } finally {
    await rm(temporary, { force: true });
  }
}

/** Result of `upgrade`. */
export interface UpgradeResult {
  current: string;
  latest: string;
  upgraded: boolean;
  /** How the installation was replaced, when it was. */
  method?: InstallationKind;
  /** Executable that was replaced, for standalone binaries. */
  path?: string;
}

/**
 * Checks the latest release and, unless `check` is true, replaces the
 * running installation. Up-to-date installations return `upgraded: false`.
 */
export async function upgrade(
  currentVersion: string,
  options: { check?: boolean; fetcher?: FetchLike; kind?: InstallationKind; executablePath?: string; base?: string } = {},
): Promise<UpgradeResult> {
  const update = await checkForUpdate(currentVersion, options.fetcher);
  const base: UpgradeResult = { current: update.current, latest: update.latest, upgraded: false };
  if (options.check || !update.available) return base;
  const kind = options.kind ?? installationKind();
  if (kind === "source") {
    throw appError.usage("running from source: update the checkout with git pull instead of upgrade", { current: currentVersion, latest: update.latest });
  }
  if (kind === "npm") {
    await upgradeWithNpm();
    return { ...base, upgraded: true, method: "npm" };
  }
  if (kind === "launcher") {
    const path = await upgradeLauncher(process.env.SPECSFY_LAUNCHER!, update.latest, options.fetcher);
    return { ...base, upgraded: true, method: "launcher", path };
  }
  const path = await upgradeBinary(options.executablePath ?? process.execPath, update.latest, {
    ...(options.fetcher ? { fetcher: options.fetcher } : {}),
    ...(options.base ? { base: options.base } : {}),
  });
  return { ...base, upgraded: true, method: "binary", path };
}

/** Resolves the real file when the installation is exposed through a symlink. */
async function replacementPath(path: string): Promise<string> {
  try {
    if ((await lstat(path)).isSymbolicLink()) return await realpath(path);
  } catch {
    // The replacement itself raises the actionable error.
  }
  return path;
}
