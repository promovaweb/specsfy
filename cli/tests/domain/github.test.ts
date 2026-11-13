/** Regressions of GitHub authentication: vault first, then variables, then gh. */
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { apiHeaders, githubToken, resolveGithubToken } from "../../src/domain/github.ts";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE, paths } from "../../src/config/paths.ts";
import { setCredential } from "../../src/config/credentials.ts";
import { temporaryDirectory } from "./helpers.ts";

const NAMES = ["GH_TOKEN", "GITHUB_TOKEN", "PATH", HOME_VARIABLE, MASTER_KEY_VARIABLE] as const;

describe("GitHub authentication", () => {
  const original = Object.fromEntries(NAMES.map((name) => [name, process.env[name]]));

  beforeEach(async () => {
    process.env[HOME_VARIABLE] = await temporaryDirectory();
    delete process.env[MASTER_KEY_VARIABLE];
  });

  afterEach(() => {
    for (const name of NAMES) restoreEnvironment(name, original[name]);
  });

  test("prefers the vault credential over the variables", async () => {
    setCredential("github.token", "from-vault");
    process.env.GH_TOKEN = "primary";
    expect(await resolveGithubToken()).toEqual({ token: "from-vault", source: "vault" });
  });

  test("an unreadable vault counts as no token", async () => {
    await mkdir(paths.base(), { recursive: true });
    await writeFile(paths.credentials(), "not json");
    process.env.GH_TOKEN = "primary";
    expect(await resolveGithubToken()).toEqual({ token: "primary", source: "GH_TOKEN" });
  });

  test("prefers GH_TOKEN and never exposes the other credential", async () => {
    process.env.GH_TOKEN = "primary";
    process.env.GITHUB_TOKEN = "secondary";
    expect(await githubToken()).toBe("primary");
    expect(await apiHeaders("specsfy-test")).toMatchObject({
      Authorization: "Bearer primary",
      "User-Agent": "specsfy-test",
    });
  });

  test("falls back to the gh session", async () => {
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    const root = await temporaryDirectory();
    const gh = join(root, "gh");
    await writeFile(gh, "#!/bin/sh\nprintf 'gh-session\\n'\n");
    await chmod(gh, 0o755);
    process.env.PATH = root;
    expect(await resolveGithubToken()).toEqual({ token: "gh-session", source: "gh" });
  });

  test("keeps the request public when there is no credential", async () => {
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    const root = await temporaryDirectory();
    process.env.PATH = root;
    expect(await githubToken()).toBeUndefined();
    expect(await apiHeaders("specsfy-test")).not.toHaveProperty("Authorization");
  });
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
