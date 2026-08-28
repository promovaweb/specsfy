/** Regressões da regra de marcadores não resolvidos do specsfy-04-validate. */
import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { temporaryDirectory } from "./helpers.js";

const script = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../skills/specsfy-04-validate/scripts/validate_spec.mjs",
);

const ERRO = "Marcadores não resolvidos.";

/** Cabeçalho mínimo: a regra de marcadores roda mesmo com outros erros. */
function spec(corpo: string): string {
  return [
    "# Especificação integrada: teste",
    "",
    "| Campo | Valor |",
    "| --- | --- |",
    "| Formato | Specsfy/2.0 |",
    "| ID | SPEC-0001 |",
    "| Slug | 0001-teste |",
    "| Status | Defined |",
    "| Definition Gate | Passed |",
    "| Plan Gate | Pending |",
    "| Delivery Gate | Pending |",
    "",
    corpo,
    "",
  ].join("\n");
}

async function validar(corpo: string): Promise<string> {
  const arquivo = join(await temporaryDirectory(), "spec.md");
  await writeFile(arquivo, spec(corpo), "utf8");
  try {
    return execFileSync("node", [script, arquivo], { encoding: "utf8" });
  } catch (error) {
    // O validador sai com código 1 quando há erros; a saída é o que interessa.
    return String((error as { stdout?: string }).stdout ?? "");
  }
}

describe("marcadores não resolvidos", () => {
  test("acusa TODO, TBD, FIXME e NEEDS CLARIFICATION", async () => {
    for (const marcador of ["TODO", "TBD", "FIXME", "[NEEDS CLARIFICATION: x]"]) {
      expect(await validar(`- ${marcador} resolver isto`)).toContain(ERRO);
    }
  });

  test("não acusa a palavra portuguesa todo", async () => {
    expect(await validar("- A captura é obrigatória em todo documento.")).not.toContain(ERRO);
  });

  test("não acusa todo dentro de método, onde o acento cria fronteira de palavra", async () => {
    // `\b` do JavaScript quebra em caractere não-ASCII: o `é` de "Método" abre
    // fronteira antes de "todo". A linha vem do próprio template gerenciado,
    // então toda spec em português nascia reprovando a validação estrita.
    expect(await validar("- [Método/rota ou evento, autenticação, request.]")).not.toContain(ERRO);
  });

  test("não acusa outras palavras acentuadas que terminam em todo", async () => {
    expect(await validar("- O símbolo e o método são úteis; o critério, também.")).not.toContain(ERRO);
  });
});
