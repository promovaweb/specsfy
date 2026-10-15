from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATE_SPEC = ROOT / "specsfy-04-validate" / "scripts" / "validate_spec.mjs"
MARKERS = "Marcadores não resolvidos."


class UnresolvedMarkerTests(unittest.TestCase):
    def errors(self, content: str) -> list[str]:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(
                "| Campo | Valor |\n| --- | --- |\n| Status | Defined |\n\n" + content,
                encoding="utf-8",
            )
            result = subprocess.run(["node", str(VALIDATE_SPEC), str(spec), "--json"], text=True, capture_output=True, check=False)
            return json.loads(result.stdout)["errors"]

    def test_accepts_portuguese_words_that_contain_marker_letters(self) -> None:
        for text in (
            "Todo texto visível fica em português.",
            "O cabeçalho aparece em todo o site.",
            "Todos os links usam o mesmo método.",
            "O método e a métrica são registrados.",
            "Fluxo de ação todo-poderoso.",
        ):
            with self.subTest(text=text):
                self.assertNotIn(MARKERS, self.errors(text))

    def test_rejects_uppercase_markers(self) -> None:
        for text in ("TODO: definir o fluxo.", "Prazo: TBD.", "FIXME revisar", "(TODO)", "é TODO"):
            with self.subTest(text=text):
                self.assertIn(MARKERS, self.errors(text))

    def test_rejects_needs_clarification_in_any_case(self) -> None:
        for text in ("[NEEDS CLARIFICATION: prazo]", "[needs clarification: prazo]"):
            with self.subTest(text=text):
                self.assertIn(MARKERS, self.errors(text))


if __name__ == "__main__":
    unittest.main()
