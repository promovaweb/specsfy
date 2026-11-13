/** Regressões da autenticação e dos headers do GitHub. */
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "bun:test";
import { apiHeaders, githubToken } from "../../src/domain/github.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("autenticação GitHub", () => {
  const original = {
    GH_TOKEN: process.env.GH_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    PATH: process.env.PATH,
  };

  afterEach(() => {
    restoreEnvironment("GH_TOKEN", original.GH_TOKEN);
    restoreEnvironment("GITHUB_TOKEN", original.GITHUB_TOKEN);
    restoreEnvironment("PATH", original.PATH);
  });

  test("prefere GH_TOKEN e nunca expõe outra credencial", async () => {
    process.env.GH_TOKEN = "principal";
    process.env.GITHUB_TOKEN = "secundário";
    expect(await githubToken()).toBe("principal");
    expect(await apiHeaders("specsfy-test")).toMatchObject({
      Authorization: "Bearer principal",
      "User-Agent": "specsfy-test",
    });
  });

  test("usa a sessão do gh como fallback", async () => {
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    const root = await temporaryDirectory();
    const gh = join(root, "gh");
    await writeFile(gh, "#!/bin/sh\nprintf 'sessao-gh\\n'\n");
    await chmod(gh, 0o755);
    process.env.PATH = root;
    expect(await githubToken()).toBe("sessao-gh");
  });

  test("mantém request público quando não existe credencial", async () => {
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;
    const root = await temporaryDirectory();
    await mkdir(root, { recursive: true });
    process.env.PATH = root;
    expect(await githubToken()).toBeUndefined();
    expect(await apiHeaders("specsfy-test")).not.toHaveProperty("Authorization");
  });
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
