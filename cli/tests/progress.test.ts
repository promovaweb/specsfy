/** Regressões da projeção de progresso das especificações. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  scanSpecs,
  serializeSpec,
  specsFingerprint,
  summarizeSpecs,
} from "../src/progress.js";
import { temporaryDirectory } from "./helpers.js";

const NEWLINE = String.fromCharCode(10);
const FENCE = "```";

describe("progresso das specs", () => {
  test("lê layouts canônico e legado e consolida checklists", async () => {
    const project = await temporaryDirectory();
    const canonical = join(project, "specs/specs/0001-dashboard/spec.md");
    const legacy = join(project, "specs/0002-login/spec.md");
    await mkdir(join(canonical, ".."), { recursive: true });
    await mkdir(join(legacy, ".."), { recursive: true });
    await writeFile(
      canonical,
      "# Dashboard\n\n**Status**: Implementing\n\n" +
        "**Definition Gate**: Passed\n\n| Effort | 6 |\n\n- [x] T001 Feita\n- [ ] T002 Pendente\n",
    );
    await writeFile(
      legacy,
      "# Login\n\n| Status | Complete |\n" +
        "| Definition Gate | Passed |\n| Plan Gate | Passed |\n" +
        "| Delivery Gate | Passed |\n",
    );

    const specs = await scanSpecs(project);
    const summary = summarizeSpecs(specs);

    expect(specs.map((spec) => spec.slug)).toEqual([
      "0002-login",
      "0001-dashboard",
    ]);
    expect(summary).toMatchObject({
      total_specs: 2,
      completed_specs: 1,
      completed_tasks: 1,
      pending_tasks: 1,
      total_tasks: 2,
      completed_items: 1,
      total_items: 2,
      percent: 50,
    });
    expect(serializeSpec(specs[0]!)).not.toHaveProperty("content");
    expect(specs.find((spec) => spec.slug === "0001-dashboard")).toMatchObject({
      effort: 6,
      execution_profile: "standard",
    });
  });

  test("não conta item de checklist dentro de bloco de código", async () => {
    const project = await temporaryDirectory();
    const spec = join(project, "specs/draft/0003-exemplo/spec.md");
    await mkdir(join(spec, ".."), { recursive: true });
    await writeFile(
      spec,
      "# Exemplo" +
        NEWLINE.repeat(2) +
        "| Status | Implementing |" +
        NEWLINE +
        "| Definition Gate | Passed |" +
        NEWLINE.repeat(2) +
        // O template mostra o formato do checklist dentro de uma cerca. Essas
        // linhas não são trabalho: ninguém pode marcá-las sem destruir o
        // exemplo, e contá-las deixa qualquer spec presa abaixo de 100%.
        FENCE +
        NEWLINE +
        "  - [ ] **PREP**: Confirmar escopo." +
        NEWLINE +
        "  - [ ] **EXECUTE**: Produzir a entrega." +
        NEWLINE +
        FENCE +
        NEWLINE.repeat(2) +
        "- [x] T001 Feita" +
        NEWLINE,
    );

    const [projected] = await scanSpecs(project);

    expect(projected?.totalItems).toBe(1);
    expect(projected?.completedItems).toBe(1);
  });

  test("usa gates quando a spec não possui checklist", async () => {
    const project = await temporaryDirectory();
    const path = join(project, "specs/specs/0001-api/spec.md");
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(
      path,
      "# API\n\n**Definition Gate**: Passed\n**Plan Gate**: Passed\n",
    );

    const [spec] = await scanSpecs(project);

    expect(spec?.percent).toBe(67);
    expect(summarizeSpecs([spec!]).percent).toBe(67);
  });

  test("inclui cada pasta de estado no progresso", async () => {
    const project = await temporaryDirectory();
    const paths = [
      "specs/draft/0001-ideia/spec.md",
      "specs/review/0002-revisao/spec.md",
      "specs/completed/0003-entrega/spec.md",
    ];
    for (const path of paths) {
      await mkdir(join(project, path, ".."), { recursive: true });
      await writeFile(join(project, path), "# Spec\n\n| Status | Draft |\n");
    }

    expect((await scanSpecs(project)).map((spec) => spec.slug)).toEqual([
      "0003-entrega",
      "0001-ideia",
      "0002-revisao",
    ]);
  });

  test("fingerprint muda com o conteúdo", async () => {
    const project = await temporaryDirectory();
    const path = join(project, "specs/specs/0001-api/spec.md");
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, "# API\n- [ ] T001\n");
    const before = await specsFingerprint(project);
    await writeFile(path, "# API\n- [x] T001\n");
    expect(await specsFingerprint(project)).not.toBe(before);
  });
});
