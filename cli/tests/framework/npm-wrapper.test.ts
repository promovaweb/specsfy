/**
 * npm wrapper (spec 0011): downloads the platform binary from a local
 * release mirror, verifies SHA256SUMS, caches it and mirrors argv, stdio and
 * exit code. The wrapper is plain CommonJS; Bun runs it here like Node would.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const NPM = join(import.meta.dir, "..", "..", "npm");
const pkg = JSON.parse(readFileSync(join(NPM, "package.json"), "utf8")) as { version: string; name: string; bin: Record<string, string>; dependencies?: unknown };
const cliPkg = JSON.parse(readFileSync(join(NPM, "..", "package.json"), "utf8")) as { version: string };
const wrapper = require(join(NPM, "bin", "specsfy.cjs")) as { assetName: (p?: string, a?: string) => string };

let dir: string;
let server: ReturnType<typeof Bun.serve>;
let requests = 0;
let checksum = "";
const binary = "#!/bin/sh\necho \"args:$*\"\necho \"wrapper:$SPECSFY_NPM_WRAPPER\"\nread line\necho \"stdin:$line\"\nexit 3\n";

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "specsfy-npm-"));
  const asset = wrapper.assetName();
  checksum = createHash("sha256").update(binary).digest("hex");
  server = Bun.serve({
    port: 0,
    fetch(request) {
      requests += 1;
      const path = new URL(request.url).pathname;
      if (path === `/v${pkg.version}/SHA256SUMS`) return new Response(`${checksum}  ${asset}\n`);
      if (path === `/v${pkg.version}/${asset}`) return new Response(binary);
      return new Response("missing", { status: 404 });
    },
  });
});

afterAll(() => {
  server.stop(true);
  rmSync(dir, { recursive: true, force: true });
});

async function runWrapper(env: Record<string, string>) {
  const proc = Bun.spawn([process.execPath, join(NPM, "bin", "specsfy.cjs"), "status", "--json"], {
    env: { ...(process.env as Record<string, string>), ...env },
    stdin: new Response("hello\n"),
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, stdout, stderr };
}

describe("npm wrapper", () => {
  test("package is versioned with the CLI, has no dependencies and exposes the bin", () => {
    expect(pkg.name).toBe("@promovaweb/specsfy");
    expect(pkg.version).toBe(cliPkg.version);
    expect(pkg.dependencies).toBeUndefined();
    expect(pkg.bin).toEqual({ specsfy: "bin/specsfy.cjs" });
    expect(wrapper.assetName("win32", "x64")).toBe("specsfy-windows-x64.exe");
    expect(() => wrapper.assetName("sunos", "x64")).toThrow("no prebuilt");
  });

  test.skipIf(process.platform === "win32")("downloads once, then mirrors argv, stdin and exit code", async () => {
    const env = { SPECSFY_DOWNLOAD_URL: `http://localhost:${server.port}`, SPECSFY_CACHE_DIR: join(dir, "cache") };
    const first = await runWrapper(env);
    expect(first.code).toBe(3);
    expect(first.stdout).toBe("args:status --json\nwrapper:1\nstdin:hello\n");
    expect(existsSync(join(dir, "cache", `v${pkg.version}`, wrapper.assetName()))).toBe(true);
    const count = requests;
    const second = await runWrapper(env);
    expect(second.code).toBe(3);
    expect(requests).toBe(count);
  });

  test.skipIf(process.platform === "win32")("refuses a binary whose checksum does not match", async () => {
    const saved = checksum;
    checksum = "0".repeat(64);
    try {
      const r = await runWrapper({ SPECSFY_DOWNLOAD_URL: `http://localhost:${server.port}`, SPECSFY_CACHE_DIR: join(dir, "other") });
      expect(r.code).toBe(5);
      expect(r.stderr).toContain("checksum mismatch");
      expect(existsSync(join(dir, "other", `v${pkg.version}`, wrapper.assetName()))).toBe(false);
    } finally {
      checksum = saved;
    }
  });
});
