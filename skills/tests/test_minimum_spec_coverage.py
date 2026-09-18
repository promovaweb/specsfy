from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATE_SPEC = ROOT / "specsfy-04-validate" / "scripts" / "validate_spec.mjs"

TRACE = ROOT / "specsfy-06-tdd-bdd" / "scripts" / "check_traceability.mjs"


def acceptance(ac_id: str, covers: str) -> str:
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
        "```\n"
    )


class MinimumBddCoverageTests(unittest.TestCase):
    def validate(self, text: str) -> list[str]:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(text, encoding="utf-8")
            result = subprocess.run(["node", str(VALIDATE_SPEC), str(spec), "--allow-draft", "--json"], text=True, capture_output=True, check=False)
            return __import__("json").loads(result.stdout)["errors"]

    def test_requires_three_distinct_bdd_scenarios_for_each_user_story(self) -> None:
        text = (
            "#### US-001 — História\n"
            + acceptance("AC-001", "US-001, FR-001")
            + acceptance("AC-002", "US-001, FR-001")
            + acceptance("AC-003", "US-002, FR-001")
            + "- **FR-001**: Requisito.\n"
        )

        errors = self.validate(text)

        self.assertIn(
            "US-001 possui 2 cenários BDD; mínimo exigido: 3.",
            errors,
        )

    def test_requires_three_distinct_bdd_scenarios_for_each_requirement(self) -> None:
        text = (
            "#### US-001 — História\n"
            + acceptance("AC-001", "US-001, FR-001, NFR-001")
            + acceptance("AC-002", "US-001, FR-001, NFR-001")
            + acceptance("AC-003", "US-001, FR-002, NFR-002")
            + "- **FR-001**: Requisito.\n"
            + "- **FR-002**: Requisito.\n"
            + "- **NFR-001**: Qualidade. **Verificação**: teste.\n"
            + "- **NFR-002**: Qualidade. **Verificação**: teste.\n"
        )

        errors = self.validate(text)

        self.assertIn(
            "FR-001 possui 2 cenários BDD; mínimo exigido: 3.",
            errors,
        )
        self.assertIn(
            "NFR-001 possui 2 cenários BDD; mínimo exigido: 3.",
            errors,
        )

    def test_accepts_three_bdd_scenarios_for_feature_story_and_requirements(self) -> None:
        covers = "US-001, FR-001, NFR-001"
        text = (
            "#### US-001 — História\n"
            + acceptance("AC-001", covers)
            + acceptance("AC-002", covers)
            + acceptance("AC-003", covers)
            + "- **FR-001**: Requisito.\n"
            + "- **NFR-001**: Qualidade. **Verificação**: teste.\n"
        )

        self.assertNotIn("US-001 possui 2 cenários BDD; mínimo exigido: 3.", self.validate(text))


class MinimumTddCoverageTests(unittest.TestCase):
    def test_limits_markers_to_test_files_declared_by_the_current_spec(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            spec_a = root / "specs/complete/0001-feature-a/spec.md"
            spec_b = root / "specs/implementing/0002-feature-b/spec.md"
            test_a = root / "tests/test_feature_a.py"
            test_b = root / "tests/test_feature_b.py"
            spec_a.parent.mkdir(parents=True)
            spec_b.parent.mkdir(parents=True)
            test_a.parent.mkdir(parents=True)
            definitions = (
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "#### AC-002 — Example\n"
                "#### AC-003 — Example\n"
                "- **FR-001**: Example.\n"
                "- **NFR-001**: Example. **Verificação**: teste.\n"
            )
            spec_a.write_text(
                definitions
                + "- [x] T001 [TEST] [TDD] [US-001] Case in tests/test_feature_a.py — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n",
                encoding="utf-8",
            )
            marker = "US-001 FR-001 NFR-001"
            test_a.write_text(
                f"# SPECSFY: {marker} AC-001\n"
                "def test_first(): pass\n",
                encoding="utf-8",
            )
            command = ["node", str(TRACE), str(spec_a), str(root), "--json"]
            before = subprocess.run(
                command, text=True, capture_output=True, check=False
            )
            spec_b.write_text(
                definitions
                + "- [x] T001 [TEST] [TDD] [US-001] Case in tests/test_feature_b.py — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n",
                encoding="utf-8",
            )
            test_b.write_text(
                f"# SPECSFY: {marker} AC-001\n"
                f"# SPECSFY: {marker} AC-002\n"
                f"# SPECSFY: {marker} AC-003\n"
                "# SPECSFY: FR-999\n",
                encoding="utf-8",
            )

            after = subprocess.run(
                command, text=True, capture_output=True, check=False
            )

            self.assertEqual(1, before.returncode)
            self.assertEqual(1, after.returncode)
            original = __import__("json").loads(before.stdout)
            result = __import__("json").loads(after.stdout)
            self.assertEqual("declared-tests", result["scan_scope"])
            self.assertEqual(1, result["files_scanned"])
            self.assertEqual(1, result["feature_cases"])
            self.assertEqual([], result["orphan_markers"])
            self.assertEqual(
                ["tests/test_feature_a.py:1"], result["locations"]["US-001"]
            )
            for key in (
                "files_scanned",
                "feature_cases",
                "case_counts",
                "orphan_markers",
                "locations",
            ):
                self.assertEqual(original[key], result[key])

    def test_requires_three_distinct_tdd_case_markers_per_traceable_item(self) -> None:
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
            test.write_text(
                "# SPECSFY: US-001 FR-001 NFR-001 AC-001\n"
                "def test_first(): pass\n"
                "# SPECSFY: US-001 FR-001 NFR-001 AC-002\n"
                "def test_second(): pass\n",
                encoding="utf-8",
            )

            completed = subprocess.run(
                [
                    "node",
                    str(TRACE),
                    str(spec),
                    str(root),
                    "--json",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(1, completed.returncode)
            self.assertIn('"US-001": 1', completed.stdout)
            self.assertIn('"FR-001": 1', completed.stdout)
            self.assertIn('"NFR-001": 1', completed.stdout)

    def test_accepts_three_distinct_tdd_case_markers_per_traceable_item(self) -> None:
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
            test.write_text(
                "# SPECSFY: US-001 FR-001 NFR-001 AC-001\n"
                "def test_first(): pass\n"
                "# SPECSFY: US-001 FR-001 NFR-001 AC-002\n"
                "def test_second(): pass\n"
                "# SPECSFY: US-001 FR-001 NFR-001 AC-003\n"
                "def test_third(): pass\n",
                encoding="utf-8",
            )

            completed = subprocess.run(
                [
                    "node",
                    str(TRACE),
                    str(spec),
                    str(root),
                    "--json",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(0, completed.returncode, completed.stdout + completed.stderr)
            self.assertIn('"required_cases": 3', completed.stdout)
            self.assertIn('"feature_cases": 3', completed.stdout)

    def test_one_shared_marker_counts_as_one_tdd_case(self) -> None:
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
            test.write_text(
                "# SPECSFY: US-001 FR-001 NFR-001 AC-001 AC-002 AC-003\n"
                "def test_first(): pass\n"
                "def test_second(): pass\n"
                "def test_third(): pass\n",
                encoding="utf-8",
            )

            completed = subprocess.run(
                [
                    "node",
                    str(TRACE),
                    str(spec),
                    str(root),
                    "--json",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(1, completed.returncode)
            self.assertIn('"feature_cases": 1', completed.stdout)


if __name__ == "__main__":
    unittest.main()
