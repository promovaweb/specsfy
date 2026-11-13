/** Regressões da projeção de progresso das especificações. */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  scanSpecs,
  serializeSpec,
  specsFingerprint,
  summarizeSpecs,
} from "../../src/domain/progress.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("progresso das specs", () => {
  test("#51 separa resíduos do percentual e aponta suas linhas", async () => {
    const project = await temporaryDirectory();
    const path = join(project, "specs/completed/0001-concluida/spec.md");
    await mkdir(join(path, ".."), { recursive: true });
    const keys = ["PREP", "EXECUTE", "VERIFY", "VISUAL", "EVIDENCE", "IMPROVE"];
    const block = (done: boolean) => keys.map(key => `  - [${done ? "x" : " "}] **${key}**: Conferir.\n`).join("");
    await writeFile(path, "| Status | Complete |\n### 14. Tarefas\n" + block(false).repeat(9) + "- [x] T001 [DOC] Documentar docs/teste.md — Refs: FR-001 — Depends: none\n" + block(true) + "### 15. Evidências\n- [ ] Anotação externa\n");
    const [spec] = await scanSpecs(project);
    expect(spec).toMatchObject({ completed_task_items: 7, total_task_items: 7, total_other_items: 55, pending_other_items: 55, percent: 100 });
    expect(spec!.orphan_checklist_lines).toHaveLength(54);
    expect(summarizeSpecs([spec!])).toMatchObject({ total_task_items: 7, total_other_items: 55, orphan_checklist_items: 54, percent: 100 });
  });

  test("#51 ignora checkboxes de código e não adota checklist de outra seção", async () => {
    const project = await temporaryDirectory();
    const path = join(project, "specs/draft/0001-exemplo/spec.md");
    await mkdir(join(path, ".."), { recursive: true });
    await writeFile(path, "### 14. Tarefas\n- [x] T001 Completa\n```markdown\n- [ ] T002 Exemplo\n```\n### 15. Evidências\n  - [ ] **PREP**: Rascunho.\n");
    const [spec] = await scanSpecs(project);
    expect(spec).toMatchObject({ total_tasks: 1, total_task_items: 1, total_other_items: 1, percent: 100 });
    expect(spec!.orphan_checklist_lines).toEqual([7]);
  });
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
