from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATE_SPEC = ROOT / "specsfy-04-validate" / "scripts" / "validate_spec.mjs"

SECTIONS = [
    "Problema e resultado",
    "Research e esclarecimentos",
    "Escopo e atores",
    "Princípios e restrições do projeto",
    "Histórias de usuário",
    "Cenários BDD de aceite",
    "Requisitos",
    "Plano técnico",
    "Modelo de dados",
    "Interfaces e contratos",
    "Estratégia TDD",
    "Plano de testes e rastreabilidade",
    "Validações",
    "Tarefas",
    "Ordem de execução",
    "Dependências, riscos e suposições",
    "Decisões",
    "Definition of Done",
]

HEADER = (
    "# Especificação integrada: Exemplo\n\n"
    "| Campo | Valor |\n"
    "| --- | --- |\n"
    "| Formato | Specsfy/2.0 |\n"
    "| ID | SPEC-0001 |\n"
    "| Slug | 0001-exemplo |\n"
    "| Status | Defined |\n"
    "| Definition Gate | Passed |\n"
    "| Plan Gate | Pending |\n"
    "| Delivery Gate | Pending |\n\n"
)


def acceptance(ac_id: str) -> str:
    covers = "US-001, FR-001, NFR-001"
    tags = " ".join(f"@{item}" for item in covers.split(", "))
    return (
        f"#### {ac_id} — Contexto {ac_id}\n\n"
        f"**Cobre**: {covers}\n\n"
        "```gherkin\n"
        f"{tags} @{ac_id}\n"
        "Feature: Cobertura contextual\n\n"
        f"  Scenario: Exemplo {ac_id}\n"
        "    Given um estado conhecido\n"
        "    When uma ação acontece\n"
        "    Then um resultado é observado\n"
        "```\n\n"
    )


def spec(body: str = "") -> str:
    text = HEADER
    for index, title in enumerate(SECTIONS, start=1):
        text += f"### {index}. {title}\n\n"
        if title == "Histórias de usuário":
            text += "#### US-001 — História\n\n"
        if title == "Cenários BDD de aceite":
            text += "".join(acceptance(f"AC-00{item}") for item in (1, 2, 3))
        if title == "Requisitos":
            text += "- **FR-001**: O sistema deve responder.\n"
            text += "- **NFR-001**: Responde em um segundo. **Verificação**: medição.\n\n"
    return text + body


class UnresolvedMarkerTests(unittest.TestCase):
    def errors(self, text: str) -> list[str]:
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "spec.md"
            path.write_text(text, encoding="utf-8")
            result = subprocess.run(
                ["node", str(VALIDATE_SPEC), str(path), "--json"],
                text=True,
                capture_output=True,
                check=False,
            )
            return json.loads(result.stdout)["errors"]

    def test_baseline_spec_has_no_errors(self) -> None:
        self.assertEqual(self.errors(spec()), [])

    def test_portuguese_word_todo_is_not_a_marker(self) -> None:
        """`todo` é palavra comum em português e não pode reprovar a spec."""
        for phrase in ("A regra vale em todo caso.", "Todo ator recebe o aviso.", "Cobre todos os estados."):
            with self.subTest(phrase=phrase):
                self.assertEqual(self.errors(spec(phrase + "\n")), [])

    def test_uppercase_markers_still_fail(self) -> None:
        for marker in ("TODO: revisar", "TBD", "FIXME agora", "[NEEDS CLARIFICATION: escopo]"):
            with self.subTest(marker=marker):
                self.assertIn("Marcadores não resolvidos.", self.errors(spec(marker + "\n")))


if __name__ == "__main__":
    unittest.main()
