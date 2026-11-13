/** Regressões da configuração persistente do projeto. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  DEFAULT_WATCH_INTERVAL,
  loadConfig,
  updateConfig,
} from "../../src/domain/config.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("configuração", () => {
  test("aplica padrão e preserva campos desconhecidos", async () => {
    const project = await temporaryDirectory();
    expect((await loadConfig(project)).watch_interval).toBe(
      DEFAULT_WATCH_INTERVAL,
    );
    await mkdir(join(project, ".specsfy"), { recursive: true });
    await writeFile(
      join(project, ".specsfy/config.json"),
      JSON.stringify({ schema_version: 1, extension: true }),
    );

    await updateConfig(project, 0.5);

    const payload = JSON.parse(
      await readFile(join(project, ".specsfy/config.json"), "utf8"),
    ) as Record<string, unknown>;
    expect(payload).toMatchObject({
      schema_version: 1,
      extension: true,
      watch_interval: 0.5,
    });
  });

  test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "recusa intervalo inválido %s",
    async (value) => {
      const project = await temporaryDirectory();
      await expect(updateConfig(project, value)).rejects.toThrow(
        "número finito maior que zero",
      );
    },
  );
});
