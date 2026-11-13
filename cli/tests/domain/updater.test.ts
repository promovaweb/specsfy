/** Regressions of the release check, the daily cache and the binary swap. */
import { createHash } from "node:crypto";
import { chmod, readFile, stat, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import {
  assetName,
  checkForUpdate,
  compareVersions,
  dailyUpdateCheck,
  DEFAULT_DOWNLOAD_BASE_URL,
  downloadBaseUrl,
  installationKind,
  npmUpgradeArguments,
  parseChecksums,
  RELEASES_API_URL,
  releaseFileUrl,
  upgrade,
  upgradeBinary,
  type FetchLike,
} from "../../src/domain/updater.ts";
import { temporaryDirectory } from "./helpers.ts";

const latestRelease = (tag: string): FetchLike => async (url) => {
  expect(String(url)).toBe(RELEASES_API_URL);
  return Response.json({ tag_name: tag });
};

describe("updater", () => {
  test("compares versions and names the asset of each platform", () => {
    expect(compareVersions("0.27.0", "0.26.9")).toBeGreaterThan(0);
    expect(compareVersions("v1.0.0", "1.0.0")).toBe(0);
    expect(assetName("linux", "x64")).toBe("specsfy-linux-x64");
    expect(assetName("darwin", "arm64")).toBe("specsfy-darwin-arm64");
    expect(assetName("win32", "x64")).toBe("specsfy-windows-x64.exe");
    expect(() => assetName("freebsd", "x64")).toThrow(AppError);
  });

  test("builds release URLs from GitHub or SPECSFY_DOWNLOAD_URL", () => {
    expect(downloadBaseUrl({})).toBe(DEFAULT_DOWNLOAD_BASE_URL);
    expect(downloadBaseUrl({ SPECSFY_DOWNLOAD_URL: "https://get.specsfy.dev/" })).toBe("https://get.specsfy.dev");
    expect(releaseFileUrl("1.2.3", "SHA256SUMS", "https://get.specsfy.dev")).toBe("https://get.specsfy.dev/v1.2.3/SHA256SUMS");
  });

  test("detects npm wrapper, compiled binary and source runs", () => {
    expect(installationKind({ SPECSFY_NPM_WRAPPER: "1" }, "/$bunfs/root/specsfy")).toBe("npm");
    expect(installationKind({}, "/$bunfs/root/specsfy")).toBe("binary");
    expect(installationKind({}, "/repo/cli/src/main.ts")).toBe("source");
    expect(npmUpgradeArguments()).toEqual(["install", "--global", "@promovaweb/specsfy@latest"]);
  });

  test("upgrade --check returns latest without changing anything", async () => {
    expect(await upgrade("0.26.2", { check: true, fetcher: latestRelease("v0.27.0") })).toEqual({ current: "0.26.2", latest: "0.27.0", upgraded: false });
    expect(await checkForUpdate("0.27.0", latestRelease("v0.27.0"))).toEqual({ current: "0.27.0", latest: "0.27.0", available: false });
  });

  test("network failures are NETWORK_OR_API", async () => {
    const offline: FetchLike = async () => { throw new TypeError("fetch failed"); };
    await expect(upgrade("0.26.2", { check: true, fetcher: offline })).rejects.toMatchObject({ code: ExitCode.NETWORK_OR_API });
    const missing: FetchLike = async () => new Response("{}", { status: 404 });
    await expect(checkForUpdate("0.26.2", missing)).rejects.toMatchObject({ code: ExitCode.NETWORK_OR_API });
  });

  test("an up-to-date installation is not upgraded; source runs refuse", async () => {
    expect(await upgrade("0.27.0", { fetcher: latestRelease("v0.27.0"), kind: "binary" })).toMatchObject({ upgraded: false });
    await expect(upgrade("0.26.0", { fetcher: latestRelease("v0.27.0"), kind: "source" })).rejects.toMatchObject({ code: ExitCode.USAGE });
  });

  test("the daily check is cached, disabled by the setting and never throws", async () => {
    const root = await temporaryDirectory();
    const cachePath = join(root, "update.json");
    let calls = 0;
    const fetcher: FetchLike = async () => { calls += 1; return Response.json({ tag_name: "v0.30.0" }); };
    expect(await dailyUpdateCheck("0.26.2", { enabled: false, fetcher, cachePath })).toBeUndefined();
    expect(await dailyUpdateCheck("0.26.2", { enabled: true, fetcher, cachePath, now: 1000 })).toEqual({ current: "0.26.2", latest: "0.30.0", available: true });
    expect(await dailyUpdateCheck("0.26.2", { enabled: true, fetcher, cachePath, now: 2000 })).toMatchObject({ latest: "0.30.0" });
    expect(calls).toBe(1);
    expect((await stat(cachePath)).mode & 0o777).toBe(0o600);
    const offline: FetchLike = async () => { throw new Error("offline"); };
    expect(await dailyUpdateCheck("0.26.2", { enabled: true, fetcher: offline, cachePath, now: 1000 + 90_000 })).toMatchObject({ latest: "0.30.0" });
    expect(await dailyUpdateCheck("0.26.2", { enabled: true, fetcher: offline, cachePath: join(root, "none.json") })).toBeUndefined();
  });

  test("swaps the binary after checking SHA256SUMS and --version, through a symlink", async () => {
    const root = await temporaryDirectory();
    const real = join(root, "specsfy-real");
    const link = join(root, "specsfy");
    await writeFile(real, "#!/bin/sh\necho 'specsfy 0.26.2'\n");
    await chmod(real, 0o755);
    await symlink(real, link);
    const binary = Buffer.from("#!/bin/sh\necho 'specsfy 0.27.0'\n");
    const asset = assetName("linux", "x64");
    const sums = `${createHash("sha256").update(binary).digest("hex")}  ${asset}\n`;
    const fetcher: FetchLike = async (url) => {
      const text = String(url);
      if (text.endsWith("/v0.27.0/SHA256SUMS")) return new Response(sums);
      if (text.endsWith(`/v0.27.0/${asset}`)) return new Response(binary);
      return new Response("", { status: 404 });
    };
    const target = await upgradeBinary(link, "0.27.0", { fetcher, base: "https://mirror.test", platform: "linux", arch: "x64" });
    expect(target).toBe(real);
    expect(await readFile(real, "utf8")).toContain("0.27.0");
    expect((await stat(real)).mode & 0o111).not.toBe(0);
  });

  test("refuses a binary whose checksum does not match", async () => {
    const root = await temporaryDirectory();
    const path = join(root, "specsfy");
    await writeFile(path, "old");
    const asset = assetName("linux", "x64");
    const fetcher: FetchLike = async (url) =>
      String(url).endsWith("SHA256SUMS") ? new Response(`${"0".repeat(64)}  ${asset}\n`) : new Response("tampered");
    await expect(upgradeBinary(path, "0.27.0", { fetcher, base: "https://mirror.test", platform: "linux", arch: "x64" })).rejects.toMatchObject({ code: ExitCode.NETWORK_OR_API });
    expect(await readFile(path, "utf8")).toBe("old");
  });

  test("parses sha256sum output, including binary mode markers", () => {
    expect(parseChecksums(`${"a".repeat(64)}  specsfy-linux-x64\n${"b".repeat(64)} *specsfy-windows-x64.exe\n`)).toEqual({
      "specsfy-linux-x64": "a".repeat(64),
      "specsfy-windows-x64.exe": "b".repeat(64),
    });
  });
});
