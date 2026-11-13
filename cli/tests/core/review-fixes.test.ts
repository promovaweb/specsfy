/**
 * Regressions found in the independent review of the Bun rewrite: paths that
 * escaped the project through spec identifiers, skill names and
 * attestations, the npm upgrade scope, a stale GitHub token and the
 * launcher served by get.specsfy.dev.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveSpecPath } from "../../src/core/project.ts";
import { projectFile } from "../../src/engine/script-command.ts";
import { isSpecsfySkillName } from "../../src/domain/installer.ts";
import { fetchLatestVersion, upgradeLauncher, upgradeWithNpm } from "../../src/domain/updater.ts";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "specsfy-review-"));
  mkdirSync(join(dir, "specs", "draft", "0001-safe"), { recursive: true });
  writeFileSync(join(dir, "specs", "draft", "0001-safe", "spec.md"), "# safe\n");
  writeFileSync(join(dir, "secret.txt"), "- [ ] T001 not a spec\n");
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

async function code(promise: Promise<unknown>): Promise<number> {
  try {
    await promise;
  } catch (e) {
    return (e as AppError).code;
  }
  return 0;
}

describe("paths stay inside the project", () => {
  test("a spec identifier cannot reach files outside specs/", async () => {
    expect(await code(resolveSpecPath(dir, "/etc/hostname"))).toBe(ExitCode.NOT_FOUND);
    expect(await code(resolveSpecPath(dir, "secret.txt"))).toBe(ExitCode.NOT_FOUND);
    expect(await code(resolveSpecPath(dir, "../../etc/passwd"))).toBe(ExitCode.NOT_FOUND);
    expect(await resolveSpecPath(dir, "specs/draft/0001-safe/spec.md")).toBe(join(dir, "specs", "draft", "0001-safe", "spec.md"));
  });

  test("attestation files must be inside the project", () => {
    expect(projectFile(dir, ".specsfy/attestation.json", "attestation")).toBe(join(dir, ".specsfy", "attestation.json"));
    expect(() => projectFile(dir, "/tmp/elsewhere.json", "attestation")).toThrow(AppError);
    expect(() => projectFile(dir, "../outside.json", "attestation")).toThrow(AppError);
  });

  test("skill names with path segments are not Specsfy skills", () => {
    expect(isSpecsfySkillName("specsfy-specialist-laravel")).toBe(true);
    expect(isSpecsfySkillName("specsfy-specialist-x/../../victim")).toBe(false);
    expect(isSpecsfySkillName("specsfy-aux-stack/..")).toBe(false);
  });
});

describe("updates", () => {
  test("a project install of the npm wrapper is never upgraded globally", async () => {
    expect(await code(upgradeWithNpm("local"))).toBe(ExitCode.USAGE);
    expect(await code(upgradeWithNpm("npx"))).toBe(0);
  });

  test("a rejected token falls back to the anonymous release check", async () => {
    const calls: Array<Record<string, string>> = [];
    const fetcher = async (_url: string | URL | Request, init?: RequestInit) => {
      calls.push((init?.headers ?? {}) as Record<string, string>);
      return calls.length === 1 ? new Response("bad credentials", { status: 401 }) : Response.json({ tag_name: "v9.9.9" });
    };
    const previous = process.env.GH_TOKEN;
    process.env.GH_TOKEN = "stale";
    try {
      expect(await fetchLatestVersion("0.27.0", fetcher)).toBe("9.9.9");
    } finally {
      if (previous === undefined) delete process.env.GH_TOKEN;
      else process.env.GH_TOKEN = previous;
    }
    expect(calls).toHaveLength(2);
    expect(JSON.stringify(calls[1])).not.toContain("stale");
  });

  test("the launcher is replaced only by one that declares the new version", async () => {
    const launcher = join(dir, "specsfy");
    writeFileSync(launcher, 'const version = "0.27.0";\n');
    const serve = (body: string) => async () => new Response(body, { status: 200 });
    expect(await code(upgradeLauncher(launcher, "0.28.0", serve('const version = "0.27.0";\n')))).toBe(ExitCode.NETWORK_OR_API);
    await upgradeLauncher(launcher, "0.28.0", serve('#!/usr/bin/env node\nconst version = "0.28.0";\n'));
    expect(readFileSync(launcher, "utf8")).toContain('const version = "0.28.0";');
  });
});
