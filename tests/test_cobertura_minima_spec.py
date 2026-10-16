from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"
VALIDATE = SKILLS / "specsfy-04-validate/scripts/validate_spec.mjs"
TRACE = SKILLS / "specsfy-06-tdd-bdd/scripts/check_traceability.mjs"


def ac(ac_id: str, covers: str) -> str:
    return f"#### {ac_id} — Exemplo\n\n**Cobre**: {covers}\n"


class MinimumCoverageIntegrationTests(unittest.TestCase):
    def validate(self, text: str) -> list[str]:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(text, encoding="utf-8")
            result = subprocess.run(["node", str(VALIDATE), str(spec), "--allow-draft", "--json"], text=True, capture_output=True, check=False)
            return json.loads(result.stdout)["errors"]

    def test_definition_contract_counts_three_distinct_acs_per_item(self) -> None:
        covers = "US-001, FR-001, NFR-001"
        valid = (
            "#### US-001 — História\n"
            + ac("AC-001", covers)
            + ac("AC-002", covers)
            + ac("AC-003", covers)
            + "- **FR-001**: Requisito.\n"
            + "- **NFR-001**: Qualidade. **Verificação**: teste.\n"
        )
        invalid = valid.replace("US-001, FR-001, NFR-001", "US-002, FR-002", 1)

        self.assertNotIn("US-001 possui 2 cenários BDD; mínimo exigido: 3.", self.validate(valid))
        self.assertIn(
            "US-001 possui 2 cenários BDD; mínimo exigido: 3.",
            self.validate(invalid),
        )

    def test_traceability_contract_counts_one_marker_per_tdd_case(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            spec = root / "specs/specs/0001-example/spec.md"
            test = root / "tests/test_example.py"
            spec.parent.mkdir(parents=True)
            test.parent.mkdir(parents=True)
            spec.write_text(
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "#### AC-002 — Example\n"
                "#### AC-003 — Example\n"
                "- **FR-001**: Example.\n"
                "- **NFR-001**: Example. **Verificação**: teste.\n",
                encoding="utf-8",
            )
            marker = "US-001 FR-001 NFR-001"
            test.write_text(
                f"# SPECSFY: {marker} AC-001\n"
                "def test_first(): pass\n"
                f"# SPECSFY: {marker} AC-002\n"
                "def test_second(): pass\n",
                encoding="utf-8",
            )
            command = [
                "node",
                str(TRACE),
                str(spec),
                str(root),
                "--json",
            ]

            red = subprocess.run(command, text=True, capture_output=True, check=False)
            self.assertEqual(1, red.returncode)
            self.assertIn('"feature_cases_missing": 1', red.stdout)

            with test.open("a", encoding="utf-8") as stream:
                stream.write(
                    f"# SPECSFY: {marker} AC-003\n"
                    "def test_third(): pass\n"
                )
            green = subprocess.run(
                command, text=True, capture_output=True, check=False
            )

            self.assertEqual(0, green.returncode, green.stdout + green.stderr)


    def test_traceability_scans_mjs_and_cjs_test_files(self) -> None:
        """Um pacote Node sem `"type": "module"` precisa usar `.mjs` para ESM."""
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            spec = root / "specs/specs/0001-example/spec.md"
            test = root / "tests/example.test.mjs"
            spec.parent.mkdir(parents=True)
            test.parent.mkdir(parents=True)
            spec.write_text(
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "#### AC-002 — Example\n"
                "#### AC-003 — Example\n"
                "- **FR-001**: Example.\n"
                "- **NFR-001**: Example. **Verificação**: teste.\n",
                encoding="utf-8",
            )
            marker = "US-001 FR-001 NFR-001"
            test.write_text(
                f"// SPECSFY: {marker} AC-001\n"
                "test('first', () => {});\n"
                f"// SPECSFY: {marker} AC-002\n"
                "test('second', () => {});\n"
                f"// SPECSFY: {marker} AC-003\n"
                "test('third', () => {});\n",
                encoding="utf-8",
            )

            result = subprocess.run(
                ["node", str(TRACE), str(spec), str(root), "--json"],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(0, result.returncode, result.stdout + result.stderr)
            self.assertIn('"files_scanned": 1', result.stdout)

    def test_pending_markers_ignore_the_portuguese_word_todo(self) -> None:
        """`todo` é palavra comum em pt-BR e não pode ser lida como marcador."""
        portuguese = (
            "#### US-001 — História\n"
            "- **PR-001**: todo texto visível é escrito em Português do Brasil.\n"
        )
        marker = portuguese + "- **FR-002**: TODO definir o comportamento.\n"

        self.assertNotIn("Marcadores não resolvidos.", self.validate(portuguese))
        self.assertIn("Marcadores não resolvidos.", self.validate(marker))

    def test_template_framework_and_docs_publish_same_minimum(self) -> None:
        template = (SKILLS / "templates/Spec.md").read_text(encoding="utf-8")
        framework = (SKILLS / "Spec.md").read_text(encoding="utf-8")
        testing = (
            ROOT / "docs/develop/context/engineering/testing.md"
        ).read_text(encoding="utf-8")

        for acceptance_id in ("AC-001", "AC-002", "AC-003"):
            self.assertIn(acceptance_id, template)
        for source in (framework, testing):
            self.assertIn("três", source)
            self.assertIn("SPECSFY:", source)


if __name__ == "__main__":
    unittest.main()
