/** Contratos da saída de uma captura da fila ativa da Inbox. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { processInboxCapture, scanInboxCaptures } from "../src/inbox.js";
import { temporaryDirectory } from "./helpers.js";

const CAPTURE = "2026-07-28-143205-avisar-clientes-sobre-atrasos.md";

const CAPTURE_CONTENT = `# Inbox: Avisar clientes sobre atrasos

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-07-28T14:32:05Z |
| Slug | avisar-clientes-sobre-atrasos |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

Quero avisar clientes quando uma entrega atrasar, talvez por e-mail.
`;

async function write(project: string, relativePath: string, content: string): Promise<string> {
  const path = join(project, relativePath);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, content, "utf8");
  return path;
}

async function createSpec(
  project: string,
  folder: string,
  identifier: string,
  gate: string,
): Promise<string> {
  return write(
    project,
    `specs/${folder}/${identifier}/spec.md`,
    `# Especificação: Avisos de atraso\n\n| Campo | Valor |\n| --- | --- |\n` +
      `| Status | Defined |\n| Definition Gate | ${gate} |\n\n` +
      `Origem: specs/inbox/${CAPTURE}\n`,
  );
}

describe("saída da Inbox para processed", () => {
  test("move a captura coberta por spec aprovada e preserva texto e vínculos", async () => {
    const project = await temporaryDirectory();
    await write(project, `specs/inbox/${CAPTURE}`, CAPTURE_CONTENT);
    await write(project, "specs/inbox/2026-08-01-090000-outra-ideia.md", "# Inbox: Outra\n");
    await createSpec(project, "defined", "0007-avisos-de-atraso", "Passed");
    await write(
      project,
      "specs/backlog/0003-avisos-de-atraso.md",
      `# Backlog: Avisos\n\n- specs/inbox/${CAPTURE} (origem)\n`,
    );

    const result = await processInboxCapture(
      project,
      CAPTURE,
      ["0007-avisos-de-atraso"],
      { processedAt: "2026-08-02T10:00:00Z" },
    );

    expect(result).toMatchObject({
      name: CAPTURE,
      from: `specs/inbox/${CAPTURE}`,
      to: `specs/inbox/processed/${CAPTURE}`,
      status: "Processada",
    });
    expect(result.specs).toEqual([
      expect.objectContaining({ identifier: "0007-avisos-de-atraso", folder: "defined" }),
    ]);
    expect(result.updated_references.sort()).toEqual([
      "specs/backlog/0003-avisos-de-atraso.md",
      "specs/defined/0007-avisos-de-atraso/spec.md",
    ]);

    const moved = await readFile(join(project, "specs/inbox/processed", CAPTURE), "utf8");
    expect(moved).toContain("| Status | Processada |");
    expect(moved).toContain("| Spec derivada | specs/defined/0007-avisos-de-atraso/spec.md |");
    expect(moved).toContain("| Processada em | 2026-08-02T10:00:00Z |");
    expect(moved).toContain("Quero avisar clientes quando uma entrega atrasar, talvez por e-mail.");
    expect(moved.indexOf("| Processada em |")).toBeLessThan(moved.indexOf("## Texto original"));

    const spec = await readFile(
      join(project, "specs/defined/0007-avisos-de-atraso/spec.md"),
      "utf8",
    );
    expect(spec).toContain(`specs/inbox/processed/${CAPTURE}`);
    expect(spec).not.toContain(`specs/inbox/${CAPTURE}`);
    const backlog = await readFile(join(project, "specs/backlog/0003-avisos-de-atraso.md"), "utf8");
    expect(backlog).toContain(`specs/inbox/processed/${CAPTURE}`);

    const active = await scanInboxCaptures(project);
    expect(active.map((capture) => capture.name)).toEqual([
      "2026-08-01-090000-outra-ideia.md",
    ]);
    const all = await scanInboxCaptures(project, { includeProcessed: true });
    expect(all.map((capture) => [capture.name, capture.processed, capture.status])).toEqual([
      ["2026-08-01-090000-outra-ideia.md", false, "Capturada"],
      [CAPTURE, true, "Processada"],
    ]);
  });

  test("aceita o caminho relativo da captura e várias specs", async () => {
    const project = await temporaryDirectory();
    await write(project, `specs/inbox/${CAPTURE}`, CAPTURE_CONTENT);
    await createSpec(project, "defined", "0007-avisos-por-email", "Passed");
    await createSpec(project, "planned", "0008-avisos-por-sms", "Passed");

    const result = await processInboxCapture(
      project,
      `specs/inbox/${CAPTURE}`,
      ["0007-avisos-por-email", "0008-avisos-por-sms"],
    );

    expect(result.specs.map((spec) => spec.identifier)).toEqual([
      "0007-avisos-por-email",
      "0008-avisos-por-sms",
    ]);
    const moved = await readFile(join(project, "specs/inbox/processed", CAPTURE), "utf8");
    expect(moved).toContain(
      "| Spec derivada | specs/defined/0007-avisos-por-email/spec.md, " +
        "specs/planned/0008-avisos-por-sms/spec.md |",
    );
    expect(moved).toMatch(/\| Processada em \| \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z \|/u);
  });

  test("recusa spec em draft ou com Definition Gate pendente", async () => {
    const project = await temporaryDirectory();
    await write(project, `specs/inbox/${CAPTURE}`, CAPTURE_CONTENT);
    await createSpec(project, "draft", "0007-em-draft", "Pending");
    await createSpec(project, "defined", "0008-gate-pendente", "Pending");

    await expect(
      processInboxCapture(project, CAPTURE, ["0007-em-draft"]),
    ).rejects.toThrow("Definition Gate");
    await expect(
      processInboxCapture(project, CAPTURE, ["0008-gate-pendente"]),
    ).rejects.toThrow("Definition Gate");
    await expect(
      readFile(join(project, "specs/inbox", CAPTURE), "utf8"),
    ).resolves.toContain("| Status | Capturada |");
    expect(await scanInboxCaptures(project, { includeProcessed: true })).toHaveLength(1);
  });

  test("recusa Draft e gate implícito mesmo quando outro sinal parece aprovado", async () => {
    const project = await temporaryDirectory();
    await write(project, `specs/inbox/${CAPTURE}`, CAPTURE_CONTENT);
    await createSpec(project, "defined", "0006-aprovada", "Passed");
    await createSpec(project, "draft", "0007-draft-com-gate", "Passed");
    await write(
      project,
      "specs/defined/0008-status-draft/spec.md",
      "# Especificação\n\n| Campo | Valor |\n| --- | --- |\n" +
        "| Status | Draft |\n| Definition Gate | Passed |\n",
    );
    await write(
      project,
      "specs/defined/0009-sem-gate/spec.md",
      "# Especificação\n\n| Campo | Valor |\n| --- | --- |\n| Status | Defined |\n",
    );
    await write(
      project,
      "specs/specs/0010-legado-em-draft/spec.md",
      "# Especificação\n\n| Campo | Valor |\n| --- | --- |\n" +
        "| Status | Draft |\n| Definition Gate | Passed |\n",
    );

    for (const identifier of [
      "0007-draft-com-gate",
      "0008-status-draft",
      "0009-sem-gate",
      "0010-legado-em-draft",
    ]) {
      await expect(
        processInboxCapture(project, CAPTURE, [identifier]),
      ).rejects.toThrow("Definition Gate");
    }
    await expect(
      processInboxCapture(project, CAPTURE, ["0006-aprovada", "0007-draft-com-gate"]),
    ).rejects.toThrow("0007-draft-com-gate");

    await expect(
      readFile(join(project, "specs/inbox", CAPTURE), "utf8"),
    ).resolves.toBe(CAPTURE_CONTENT);
    await expect(
      readFile(join(project, "specs/defined/0006-aprovada/spec.md"), "utf8"),
    ).resolves.toContain(`Origem: specs/inbox/${CAPTURE}`);
    expect(await scanInboxCaptures(project, { includeProcessed: true })).toHaveLength(1);
  });

  test("exige ao menos uma spec e uma captura existente na fila ativa", async () => {
    const project = await temporaryDirectory();
    await write(project, `specs/inbox/${CAPTURE}`, CAPTURE_CONTENT);
    await createSpec(project, "defined", "0007-avisos-de-atraso", "Passed");

    await expect(processInboxCapture(project, CAPTURE, [])).rejects.toThrow("spec");
    await expect(
      processInboxCapture(project, "2026-01-01-000000-inexistente.md", ["0007-avisos-de-atraso"]),
    ).rejects.toThrow("captura não encontrada");
    await expect(
      processInboxCapture(project, CAPTURE, ["0099-inexistente"]),
    ).rejects.toThrow("spec não encontrada");
  });

  test("nunca sobrescreve uma captura já processada com o mesmo nome", async () => {
    const project = await temporaryDirectory();
    await write(project, `specs/inbox/${CAPTURE}`, CAPTURE_CONTENT);
    await write(project, `specs/inbox/processed/${CAPTURE}`, "# Inbox: já processada\n");
    await createSpec(project, "defined", "0007-avisos-de-atraso", "Passed");

    await expect(
      processInboxCapture(project, CAPTURE, ["0007-avisos-de-atraso"]),
    ).rejects.toThrow("já contém");
    await expect(
      readFile(join(project, "specs/inbox/processed", CAPTURE), "utf8"),
    ).resolves.toBe("# Inbox: já processada\n");
  });
});
