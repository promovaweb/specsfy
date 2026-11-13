/** Contratos do mapa de milestones e da projeção derivada de specs e backlog. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { syncMilestones } from "../../src/domain/milestones.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("milestones", () => {
  test("cria o índice do projeto e mantém o progresso a partir das specs", async () => {
    const project = await temporaryDirectory();
    const specPath = join(project, "specs", "completed", "0001-acesso", "spec.md");
    await mkdir(join(specPath, ".."), { recursive: true });
    await writeFile(
      specPath,
      "# Acesso\n\n| Status | Complete |\n| Milestones | M01 |\n" +
        "\n- [x] T001 Pronta\n",
    );

    const result = await syncMilestones(project);

    expect(result.milestones).toEqual([
      expect.objectContaining({ id: "M01", total_specs: 1, completed_specs: 1, percent: 100 }),
    ]);
    const index = await readFile(join(project, "specs.md"), "utf8");
    expect(index).toContain("<!-- specsfy:specs-index:start -->");
    expect(index).toContain("0001-acesso");
    expect(index).toContain("M01");
    const milestone = await readFile(join(project, "specs", "milestones", "M01.md"), "utf8");
    expect(milestone).toContain("<!-- specsfy:milestone-progress:start -->");
    expect(milestone).toContain("1 de 1 specs concluídas");
  });

  test("mantém texto humano e inclui backlog sem contá-lo como entrega", async () => {
    const project = await temporaryDirectory();
    const milestonePath = join(project, "specs", "milestones", "M02.md");
    await mkdir(join(milestonePath, ".."), { recursive: true });
    await writeFile(
      milestonePath,
      "# M02 — Conversão\n\n## Condição de saída\n\nA jornada funciona.\n",
    );
    const backlogPath = join(project, "specs", "backlog", "0002-formulario.md");
    await mkdir(join(backlogPath, ".."), { recursive: true });
    await writeFile(backlogPath, "# Formulário\n\n| Milestones | M02 |\n");

    const result = await syncMilestones(project);

    expect(result.milestones[0]).toMatchObject({ id: "M02", total_specs: 0, backlog_items: 1 });
    const milestone = await readFile(milestonePath, "utf8");
    expect(milestone).toContain("A jornada funciona.");
    expect(milestone).toContain("0002-formulario");
    expect(milestone).toContain("0 de 0 specs concluídas");
  });
});
