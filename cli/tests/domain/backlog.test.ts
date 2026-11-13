/** Regressões da leitura e projeção dos itens de backlog. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { backlogsFingerprint, scanBacklogs } from "../../src/domain/backlog.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("backlogs", () => {
  test("lê título e metadados nos dois formatos", async () => {
    const project = await temporaryDirectory();
    const root = join(project, "specs/backlog");
    await mkdir(root, { recursive: true });
    await writeFile(
      join(root, "0001-primeiro.md"),
      "# Backlog: Primeiro\n\n**ID**: BACKLOG-0001\n**Status**: Captured\n",
    );
    await writeFile(
      join(root, "0002-segundo.md"),
      "# Segundo\n\n| ID | BACKLOG-0002 |\n| Status | Refining |\n",
    );

    const items = await scanBacklogs(project);

    expect(items.map(({ title, identifier, status }) => ({
      title,
      identifier,
      status,
    }))).toEqual([
      { title: "Primeiro", identifier: "BACKLOG-0001", status: "Captured" },
      { title: "Segundo", identifier: "BACKLOG-0002", status: "Refining" },
    ]);
    expect(await backlogsFingerprint(project)).toHaveLength(64);
  });
});
