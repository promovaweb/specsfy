/** Contratos do ciclo de vida físico das especificações. */
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  migrateSpecs,
  resolveSpec,
  transitionSpec,
  updateSpecEffort,
} from "../../src/domain/lifecycle.ts";
import { temporaryDirectory } from "./helpers.ts";

async function createSpec(
  project: string,
  relativePath: string,
  status: string,
): Promise<string> {
  const path = join(project, relativePath, "spec.md");
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(
    path,
    `# Login social\n\n| Status | ${status} |\n| Effort | 4 |\n`,
  );
  return path;
}

describe("ciclo de vida das specs", () => {
  test("move a spec, espelha Status e preserva o pacote", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/planned/0042-login-social", "Planned");
    const result = await transitionSpec(project, "0042-login-social", "in-progress");

    expect(result).toMatchObject({
      from: "planned",
      to: "in-progress",
      status: "Implementing",
    });
    const target = join(project, "specs/in-progress/0042-login-social/spec.md");
    expect(await readFile(target, "utf8")).toContain("| Status | Implementing |");
    await expect(resolveSpec(project, "0042-login-social")).resolves.toMatchObject({
      folder: "in-progress",
      path: target,
    });
  });

  test("atualiza caminhos de research qualificados pelo estado", async () => {
    const project = await temporaryDirectory();
    const identifier = "0042-login-social";
    const source = await createSpec(
      project,
      `specs/planned/${identifier}`,
      "Planned",
    );
    const research = join(source, "..", "research", "R-001-provider.md");
    await mkdir(join(research, ".."), { recursive: true });
    await writeFile(research, "# Provider\n");
    await writeFile(
      source,
      `${await readFile(source, "utf8")}\n#### Artefatos de pesquisa armazenados\n\n- \`specs/planned/${identifier}/research/R-001-provider.md\`\n`,
    );

    await transitionSpec(project, identifier, "in-progress");

    const target = join(project, "specs/in-progress", identifier, "spec.md");
    const content = await readFile(target, "utf8");
    expect(content).toContain(
      `specs/in-progress/${identifier}/research/R-001-provider.md`,
    );
    expect(content).not.toContain(
      `specs/planned/${identifier}/research/R-001-provider.md`,
    );
    await expect(
      readFile(join(project, "specs/in-progress", identifier, "research/R-001-provider.md"), "utf8"),
    ).resolves.toBe("# Provider\n");
  });

  test("retargets only promoted backlog cells that point to the moved spec", async () => {
    const project = await temporaryDirectory();
    const identifier = "0042-login-social";
    const previous = `specs/planned/${identifier}/spec.md`;
    const target = `specs/in-progress/${identifier}/spec.md`;
    await createSpec(project, `specs/planned/${identifier}`, "Planned");
    const backlog = join(project, "specs/backlog");
    await mkdir(backlog, { recursive: true });
    const fixtures = [
      ["quoted.md", `# Backlog\r\n| Spec promovida |  \`${previous}\`  |\r\n| Referência | ${previous} |\r\n`,
        `# Backlog\r\n| Spec promovida |  \`${target}\`  |\r\n| Referência | ${previous} |\r\n`],
      ["plain.md", `| Spec promovida | ${previous} |\n`, `| Spec promovida | ${target} |\n`],
      ["normalized.md", `| Spec promovida | \`specs/planned/../planned/${identifier}/spec.md\` |\n`,
        `| Spec promovida | \`${target}\` |\n`],
      ["link.md", `| Spec promovida | [Ver \\| spec](<../planned/${identifier}/spec.md#login> "Login") |\n`,
        `| Spec promovida | [Ver \\| spec](<../in-progress/${identifier}/spec.md#login> "Login") |\n`],
      ["external.md", `| Spec promovida | [Ver spec](https://example.com/${previous}) |\n`,
        `| Spec promovida | [Ver spec](https://example.com/${previous}) |\n`],
      ["other.md", "| Spec promovida | specs/planned/0043-other/spec.md |\n", "| Spec promovida | specs/planned/0043-other/spec.md |\n"],
    ] as const;
    for (const [file, before] of fixtures) await writeFile(join(backlog, file), before);

    await transitionSpec(project, identifier, "in-progress");

    for (const [file, , after] of fixtures) expect(await readFile(join(backlog, file), "utf8")).toBe(after);
  });

  test("serializes state resolution through backlog writes for concurrent transitions", async () => {
    const project = await temporaryDirectory();
    const identifier = "0042-login-social";
    await createSpec(project, `specs/planned/${identifier}`, "Planned");
    const backlog = join(project, "specs/backlog");
    await mkdir(backlog);
    const item = join(backlog, "item.md");
    await writeFile(item, `| Spec promovida | specs/planned/${identifier}/spec.md |\n`);

    const results = await Promise.all([
      transitionSpec(project, identifier, "in-progress"),
      transitionSpec(project, identifier, "in-progress"),
    ]);

    expect(results.map(({ from }) => from).sort()).toEqual(["in-progress", "planned"]);
    expect(await readFile(item, "utf8")).toBe(`| Spec promovida | specs/in-progress/${identifier}/spec.md |\n`);
  });

  test("repairs backlinks after an interrupted move when retrying the same state", async () => {
    const project = await temporaryDirectory();
    const identifier = "0042-login-social";
    const previous = `specs/planned/${identifier}`;
    const current = `specs/in-progress/${identifier}`;
    await createSpec(project, previous, "Planned");
    const backlog = join(project, "specs/backlog");
    await mkdir(backlog);
    await mkdir(join(project, "specs/in-progress"));
    await rename(join(project, previous), join(project, current));
    const item = join(backlog, "item.md");
    await writeFile(item, `| Spec promovida | [Ver](../planned/${identifier}/spec.md) |\n`);
    const legacy = join(backlog, "legacy.md");
    await writeFile(legacy, `| Spec promovida | specs/specs/${identifier}/spec.md |\n`);

    for (let attempt = 0; attempt < 2; attempt++) {
      await transitionSpec(project, identifier, "in-progress");
      expect(await readFile(item, "utf8")).toBe(`| Spec promovida | [Ver](../in-progress/${identifier}/spec.md) |\n`);
      expect(await readFile(legacy, "utf8")).toBe(`| Spec promovida | ${current}/spec.md |\n`);
    }
  });

  test("destino ocupado preserva o conteúdo da spec de origem", async () => {
    const project = await temporaryDirectory();
    const source = await createSpec(project, "specs/planned/0042-login-social", "Planned");
    await mkdir(join(project, "specs/in-progress/0042-login-social"), { recursive: true });
    const before = await readFile(source, "utf8");
    await expect(transitionSpec(project, "0042-login-social", "in-progress")).rejects.toThrow();
    expect(await readFile(source, "utf8")).toBe(before);
  });

  test("reabre spec concluída desde o Ato I", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/completed/0042-login-social", "Complete");

    const result = await transitionSpec(project, "0042-login-social", "draft");

    expect(result).toMatchObject({
      from: "completed",
      to: "draft",
      status: "Draft",
    });
    const target = join(project, "specs/draft/0042-login-social/spec.md");
    expect(await readFile(target, "utf8")).toContain("| Status | Draft |");
  });

  test("restores the spec and earlier backlinks when a backlog write fails", async () => {
    const project = await temporaryDirectory();
    const identifier = "0042-login-social";
    const source = await createSpec(project, `specs/planned/${identifier}`, "Planned");
    const original = await readFile(source, "utf8");
    const backlog = join(project, "specs/backlog");
    await mkdir(backlog, { recursive: true });
    const content = `| Spec promovida | specs/planned/${identifier}/spec.md |\n`;
    const first = join(backlog, "first.md");
    const second = join(backlog, "second.md");
    await writeFile(first, content);
    await writeFile(second, content);
    await mkdir(join(backlog, `.second.md.${process.pid}.tmp`));

    await expect(transitionSpec(project, identifier, "in-progress")).rejects.toThrow();

    expect(await readFile(source, "utf8")).toBe(original);
    expect(await readFile(first, "utf8")).toBe(content);
    expect(await readFile(second, "utf8")).toBe(content);
    await expect(resolveSpec(project, identifier)).resolves.toMatchObject({ folder: "planned" });
  });

  test("reabre spec concluída somente desde o Ato II", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/completed/0042-login-social", "Complete");

    const result = await transitionSpec(project, "0042-login-social", "defined");

    expect(result).toMatchObject({
      from: "completed",
      to: "defined",
      status: "Defined",
    });
    const target = join(project, "specs/defined/0042-login-social/spec.md");
    expect(await readFile(target, "utf8")).toContain("| Status | Defined |");
  });

  test("spec concluída não pula diretamente para planned", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/completed/0042-login-social", "Complete");

    await expect(
      transitionSpec(project, "0042-login-social", "planned"),
    ).rejects.toThrow("completed to planned");
  });

  test("recusa transições que pulam estados", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/draft/0042-login-social", "Draft");

    await expect(
      transitionSpec(project, "0042-login-social", "completed"),
    ).rejects.toThrow("draft to completed");
  });

  test("migra a estrutura anterior para a pasta correspondente ao Status", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/specs/0042-login-social", "Complete");
    const backlog = join(project, "specs/backlog");
    await mkdir(backlog);
    const item = join(backlog, "item.md");
    await writeFile(item, "| Spec promovida | [Spec](../specs/0042-login-social/spec.md) |\n");

    await expect(migrateSpecs(project)).resolves.toEqual([
      expect.objectContaining({
        identifier: "0042-login-social",
        to: "completed",
      }),
    ]);
    await expect(
      readFile(join(project, "specs/completed/0042-login-social/spec.md"), "utf8"),
    ).resolves.toContain("| Status | Complete |");
    expect(await readFile(item, "utf8")).toBe("| Spec promovida | [Spec](../completed/0042-login-social/spec.md) |\n");
  });

  for (const legacy of ["specs/specs", "specs"]) {
    test(`#34: migração de ${legacy}/ reescreve o índice de research para a pasta de estado`, async () => {
      const project = await temporaryDirectory();
      const identifier = "0042-login-social";
      const source = await createSpec(project, `${legacy}/${identifier}`, "Planned");
      await mkdir(join(source, "..", "research"), { recursive: true });
      await writeFile(join(source, "..", "research", "R-001-provider.md"), "# Provider\n");
      await writeFile(
        source,
        `${await readFile(source, "utf8")}\n#### Artefatos de pesquisa armazenados\n\n- \`${legacy}/${identifier}/research/R-001-provider.md\`\n`,
      );

      await migrateSpecs(project);

      const content = await readFile(join(project, "specs/planned", identifier, "spec.md"), "utf8");
      expect(content).toContain(`specs/planned/${identifier}/research/R-001-provider.md`);
      expect(content).not.toContain(`\`${legacy}/${identifier}/research/`);
    });
  }

  test("atualiza esforço entre 1 e 10 com justificativa e histórico", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/draft/0042-login-social", "Draft");

    await updateSpecEffort(project, "0042-login-social", 7, "Integração externa descoberta.", {
      updatedAt: "2026-08-08T14:00:00.000Z",
    });

    const content = await readFile(
      join(project, "specs/draft/0042-login-social/spec.md"),
      "utf8",
    );
    expect(content).toContain("| Effort | 7 |");
    expect(content).toContain("| Effort updated at | 2026-08-08T14:00:00.000Z |");
    expect(content).toContain("| Effort rationale | Integração externa descoberta. |");
    expect(content).toContain("- 2026-08-08T14:00:00.000Z: 4 → 7. Integração externa descoberta.");
    await expect(
      updateSpecEffort(project, "0042-login-social", 11, "Fora da faixa."),
    ).rejects.toThrow("between 1 and 10");
  });
});
