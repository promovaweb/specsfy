/** Regressões da consulta, do cache e da atualização pelo npm. */
import {
  lstat,
  mkdir,
  readFile,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test, mock } from "bun:test";
import {
  checkForUpdate,
  clearStartupUpdateDeferral,
  deferStartupUpdate,
  ensureGlobalConfig,
  EXECUTABLE_DOWNLOAD_URL,
  NPM_REGISTRY_URL,
  npmUpgradeArguments,
  offerStartupUpdate,
  standaloneExecutablePath,
  upgradeWithExecutable,
} from "../../src/domain/updater.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("atualizador", () => {
  test("cria cache privado e mantém as configurações padrão", async () => {
    const root = await temporaryDirectory();
    const path = join(root, ".specsfy/cli.json");

    const payload = await ensureGlobalConfig(path);

    expect(payload.schema_version).toBe(1);
    expect(payload.settings).toMatchObject({
      check_updates_on_startup: true,
      check_interval_seconds: 86400,
    });
    expect((await stat(path)).mode & 0o777).toBe(0o600);
  });

  test("seleciona a maior tag estável e armazena ETag e commit", async () => {
    const root = await temporaryDirectory();
    const path = join(root, ".specsfy/cli.json");
    const fetcher = mock(async (url: string | URL | Request | URL) =>
      url === NPM_REGISTRY_URL
        ? new Response(JSON.stringify({ version: "0.8.0" }), {
            status: 200,
          })
        : new Response(
            JSON.stringify([
              { name: "v0.7.0", commit: { sha: "7".repeat(40) } },
              { name: "v0.8.0", commit: { sha: "8".repeat(40) } },
              { name: "v0.9.0-beta.1", commit: { sha: "9".repeat(40) } },
            ]),
            { status: 200, headers: { etag: '"tags-v1"' } },
          ),
    );

    const update = await checkForUpdate("0.6.0", {
      cachePath: path,
      now: 1000,
      fetcher,
    });

    expect(update).toEqual({
      current_version: "0.6.0",
      latest_version: "0.8.0",
      tag: "v0.8.0",
      commit_sha: "8".repeat(40),
    });
    const payload = JSON.parse(await readFile(path, "utf8")) as {
      cache: Record<string, unknown>;
    };
    expect(payload.cache.etag).toBe('"tags-v1"');
  });

  test("reutiliza cache recente e preserva chaves desconhecidas", async () => {
    const root = await temporaryDirectory();
    const path = join(root, "cli.json");
    await writeFile(
      path,
      JSON.stringify({
        schema_version: 1,
        settings: {
          check_updates_on_startup: true,
          check_interval_seconds: 86400,
          custom: "preservar",
        },
        cache: {
          last_checked_at: 900,
          latest_version: "0.7.0",
          latest_distribution_version: "0.7.0",
          latest_tag: "v0.7.0",
          latest_commit: "7".repeat(40),
        },
      }),
    );
    const fetcher = mock();

    expect(
      await checkForUpdate("0.6.0", {
        cachePath: path,
        now: 1000,
        fetcher,
      }),
    ).toMatchObject({ latest_version: "0.7.0" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(await readFile(path, "utf8")).toContain("preservar");
  });

  test("não repete o aviso depois de adiar a mesma versão", async () => {
    const root = await temporaryDirectory();
    const path = join(root, "cli.json");
    const fetcher = mock(async (url: string | URL | Request | URL) =>
      url === NPM_REGISTRY_URL
        ? new Response(JSON.stringify({ version: "0.9.0" }), { status: 200 })
        : new Response(
            JSON.stringify([
              { name: "v0.9.0", commit: { sha: "9".repeat(40) } },
            ]),
            { status: 200 },
          ),
    );

    const update = await checkForUpdate("0.8.0", {
      cachePath: path,
      now: 1_000,
      fetcher,
    });
    expect(update?.latest_version).toBe("0.9.0");

    await deferStartupUpdate("0.9.0", { cachePath: path, now: 1_001 });
    expect(
      await checkForUpdate("0.8.0", {
        cachePath: path,
        now: 1_002,
        fetcher,
      }),
    ).toBeUndefined();
    expect(
      await checkForUpdate("0.8.0", {
        cachePath: path,
        now: 1_002,
        force: true,
        fetcher,
      }),
    ).toMatchObject({ latest_version: "0.9.0" });
    expect(
      await checkForUpdate("0.8.0", {
        cachePath: path,
        now: 87_402,
        fetcher,
      }),
    ).toMatchObject({ latest_version: "0.9.0" });

    await clearStartupUpdateDeferral(path);
    const cache = JSON.parse(await readFile(path, "utf8")) as {
      cache: Record<string, unknown>;
    };
    expect(cache.cache).not.toHaveProperty("startup_snoozed_version");
  });

  test("a oferta de inicialização pergunta uma vez e depois abre normalmente", async () => {
    const root = await temporaryDirectory();
    const path = join(root, "cli.json");
    const fetcher = mock(async (url: string | URL | Request | URL) =>
      url === NPM_REGISTRY_URL
        ? new Response(JSON.stringify({ version: "0.9.0" }), { status: 200 })
        : new Response(
            JSON.stringify([
              { name: "v0.9.0", commit: { sha: "9".repeat(40) } },
            ]),
            { status: 200 },
          ),
    );
    const inputDescriptor = Object.getOwnPropertyDescriptor(
      process.stdin,
      "isTTY",
    );
    const outputDescriptor = Object.getOwnPropertyDescriptor(
      process.stdout,
      "isTTY",
    );
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });
    try {
      const ask = mock(async () => "n");
      const output = mock();
      expect(
        await offerStartupUpdate("0.8.0", ask, output, {
          cachePath: path,
          now: 1_000,
          fetcher,
        }),
      ).toBe(false);
      expect(
        await offerStartupUpdate("0.8.0", ask, output, {
          cachePath: path,
          now: 1_001,
          fetcher,
        }),
      ).toBe(false);
      expect(ask).toHaveBeenCalledOnce();
      expect(output).toHaveBeenCalledWith(
        "Atualização adiada. Abrindo a aplicação normalmente.",
      );
    } finally {
      if (inputDescriptor) {
        Object.defineProperty(process.stdin, "isTTY", inputDescriptor);
      } else {
        delete (process.stdin as { isTTY?: boolean }).isTTY;
      }
      if (outputDescriptor) {
        Object.defineProperty(process.stdout, "isTTY", outputDescriptor);
      } else {
        delete (process.stdout as { isTTY?: boolean }).isTTY;
      }
    }
  });

  test("usa o pacote npm oficial no upgrade", () => {
    expect(npmUpgradeArguments()).toEqual([
      "install",
      "--global",
      "@promovaweb/specsfy@latest",
    ]);
  });

  test("reconhece executável avulso pela entrada sem extensão", () => {
    expect(standaloneExecutablePath(["node", "/usr/local/bin/specsfy"])).toBe(
      "/usr/local/bin/specsfy",
    );
    expect(standaloneExecutablePath(["node", "/usr/local/bin/specsfy.cjs"])).toBe(
      undefined,
    );
  });

  test("substitui o executável avulso somente após validar a versão baixada", async () => {
    const root = await temporaryDirectory();
    const executable = join(root, "specsfy");
    const downloaded = Buffer.from(
      "#!/usr/bin/env node\n" +
        'if (process.argv[2] === "--version") console.log("0.9.0");\n',
    );
    const fetcher = mock(async (url: string | URL | Request | URL) => {
      expect(url).toBe(EXECUTABLE_DOWNLOAD_URL);
      return new Response(downloaded, { status: 200 });
    });

    await upgradeWithExecutable(executable, "0.9.0", fetcher);

    expect(await readFile(executable)).toEqual(downloaded);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  test("atualiza o arquivo apontado sem remover o symlink do executável", async () => {
    const root = await temporaryDirectory();
    const target = join(root, "releases/specsfy");
    const link = join(root, "bin/specsfy");
    await mkdir(join(root, "releases"), { recursive: true });
    await mkdir(join(root, "bin"), { recursive: true });
    await writeFile(target, "#!/usr/bin/env node\nconsole.log(\"0.8.0\")\n", {
      mode: 0o755,
    });
    await symlink(target, link);
    const downloaded = Buffer.from(
      "#!/usr/bin/env node\n" +
        'if (process.argv[2] === "--version") console.log("0.9.0");\n',
    );

    await upgradeWithExecutable(
      link,
      "0.9.0",
      async () => new Response(downloaded, { status: 200 }),
    );

    expect((await lstat(link)).isSymbolicLink()).toBe(true);
    expect(await readFile(target)).toEqual(downloaded);
  });

  test("não oferece downgrade quando a versão local é mais recente", async () => {
    const root = await temporaryDirectory();
    const fetcher = mock(async (url: string | URL | Request | URL) =>
      url === NPM_REGISTRY_URL
        ? new Response(JSON.stringify({ version: "0.8.0" }), { status: 200 })
        : new Response(
            JSON.stringify([
              { name: "v0.8.0", commit: { sha: "8".repeat(40) } },
            ]),
            { status: 200 },
          ),
    );

    expect(
      await checkForUpdate("0.8.1", {
        cachePath: join(root, "cli.json"),
        force: true,
        fetcher,
      }),
    ).toBeUndefined();
  });

  test("ignora tag não publicada para não repetir o aviso de atualização", async () => {
    const root = await temporaryDirectory();
    const fetcher = mock(async (url: string | URL | Request | URL) =>
      url === NPM_REGISTRY_URL
        ? new Response(JSON.stringify({ version: "0.8.1" }), { status: 200 })
        : new Response(
            JSON.stringify([
              { name: "v0.9.0", commit: { sha: "9".repeat(40) } },
            ]),
            { status: 200 },
          ),
    );

    expect(
      await checkForUpdate("0.8.1", {
        cachePath: join(root, "cli.json"),
        force: true,
        fetcher,
      }),
    ).toBeUndefined();
  });
});
