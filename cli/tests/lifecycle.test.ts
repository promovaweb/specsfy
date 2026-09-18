/** Contratos do ciclo de vida físico das especificações. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  migrateSpecs,
  resolveSpec,
  transitionSpec,
  updateSpecEffort,
} from "../src/lifecycle.js";
import { temporaryDirectory } from "./helpers.js";

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

  test("recusa transições que pulam estados", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/draft/0042-login-social", "Draft");

    await expect(
      transitionSpec(project, "0042-login-social", "completed"),
    ).rejects.toThrow("draft para completed");
  });

  test("migra a estrutura anterior para a pasta correspondente ao Status", async () => {
    const project = await temporaryDirectory();
    await createSpec(project, "specs/specs/0042-login-social", "Complete");

    await expect(migrateSpecs(project)).resolves.toEqual([
      expect.objectContaining({
        identifier: "0042-login-social",
        to: "completed",
      }),
    ]);
    await expect(
      readFile(join(project, "specs/completed/0042-login-social/spec.md"), "utf8"),
    ).resolves.toContain("| Status | Complete |");
  });

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
    ).rejects.toThrow("entre 1 e 10");
  });
});
