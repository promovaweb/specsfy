from __future__ import annotations

import subprocess
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TRACE = ROOT / "specsfy-06-tdd-bdd/scripts/check_traceability.mjs"
TASKS = ROOT / "specsfy-05-tasks/scripts/validate_tasks.mjs"
NEXT_TASK = ROOT / "specsfy-07-implement/scripts/next_task.mjs"
def run_node(script: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["node", str(script), *arguments], text=True, capture_output=True, check=False)


def validate_tasks(spec: Path) -> dict:
    result = run_node(TASKS, str(spec), "--allow-draft", "--json")
    return json.loads(result.stdout)


def task_checklist(complete: bool) -> str:
    marker = "x" if complete else " "
    return (
        f"  - [{marker}] **PREP**: Confirmar baseline.\n"
        f"  - [{marker}] **EXECUTE**: Produzir entrega.\n"
        f"  - [{marker}] **VERIFY**: Observar RED valido.\n"
        f"  - [{marker}] **VISUAL**: Nao aplicavel porque a tarefa nao altera interface.\n"
        f"  - [{marker}] **EVIDENCE**: Registrar RED valido.\n"
        f"  - [{marker}] **IMPROVE**: Revisar aprendizado.\n"
    )


def incremental_spec(initial_code_complete: bool = False, future_tdd_complete: bool = False) -> str:
    initial = task_checklist(True)
    open_checklist = task_checklist(False)
    initial_code = task_checklist(initial_code_complete)
    future_tdd = task_checklist(future_tdd_complete)
    return "".join((
        "| Campo | Valor |\n| --- | --- |\n"
        "| Formato | Specsfy/2.0 |\n| Status | Planned |\n"
        "| Definition Gate | Passed |\n| Plan Gate | Passed |\n"
        "#### US-001 — Exemplo\n"
        "#### AC-001 — Caminho feliz\n#### AC-002 — Limite\n#### AC-003 — Falha\n#### AC-004 — Regra dependente\n"
        "- **FR-001**: Comportamento observavel.\n"
        "- **NFR-001**: Qualidade. **Verificacao**: teste.\n"
        "### 14. Tarefas\n"
        "- [x] T001 [TEST] [TDD] [US-001] RED inicial em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n",
        initial,
        "- [x] T002 [TEST] [TDD] [US-001] RED de limite inicial em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none\n",
        initial,
        "- [x] T003 [TEST] [TDD] [US-001] RED de falha inicial em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: none\n",
        initial,
        f"- [{'x' if initial_code_complete else ' '}] T011 [CODE] [US-001] GREEN da primeira fatia em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003\n",
        initial_code,
        f"- [{'x' if future_tdd_complete else ' '}] T004 [TEST] [TDD] [US-001] RED dependente em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-004 — Depends: T011\n",
        future_tdd,
        "- [ ] T012 [CODE] [US-001] GREEN da segunda fatia em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-004 — Depends: T004\n",
        open_checklist,
    ))


class BddRunnerTests(unittest.TestCase):
    def test_tdd_marker_covers_acceptance_informed_by_bdd(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            spec = root / "specs/specs/0001-example/spec.md"
            test = root / "tests/Feature/ExampleAcceptanceTest.php"
            spec.parent.mkdir(parents=True)
            test.parent.mkdir(parents=True)
            spec.write_text(
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "- **FR-001**: Example.\n",
                encoding="utf-8",
            )
            test.write_text(
                "<?php\n"
                "// SPECSFY: US-001 FR-001 AC-001\n"
                "test('given state when action then result', function () {});\n"
                "// SPECSFY: US-001 FR-001 AC-001\n"
                "test('given boundary when action then result', function () {});\n"
                "// SPECSFY: US-001 FR-001 AC-001\n"
                "test('given failure when action then result', function () {});\n",
                encoding="utf-8",
            )

            completed = subprocess.run(
                [
                    "node",
                    str(TRACE),
                    str(spec),
                    str(root),
                    "--kinds",
                    "FR,AC",
                    "--json",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(0, completed.returncode, completed.stdout + completed.stderr)
            self.assertIn('"covered": 2', completed.stdout)
            self.assertIn("tests/Feature/ExampleAcceptanceTest.php", completed.stdout)

    def test_feature_file_is_reference_only_and_does_not_cover_acceptance(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            spec = root / "specs/specs/0001-example/spec.md"
            feature = root / "tests/features/example.feature"
            spec.parent.mkdir(parents=True)
            feature.parent.mkdir(parents=True)
            spec.write_text(
                "#### AC-001 — Example\n"
                "- **FR-001**: Example.\n",
                encoding="utf-8",
            )
            feature.write_text(
                "@FR-001 @AC-001\n"
                "Feature: Example\n"
                "  Scenario: Example\n"
                "    Given state\n"
                "    When action\n"
                "    Then result\n",
                encoding="utf-8",
            )

            completed = subprocess.run(
                [
                    "node",
                    str(TRACE),
                    str(spec),
                    str(root),
                    "--kinds",
                    "FR,AC",
                    "--json",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(1, completed.returncode)
            self.assertIn('"covered": 0', completed.stdout)

    def test_three_pest_tdd_tasks_are_the_test_predecessors(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            checklist = (
                "  - [ ] **PREP**: Confirmar baseline.\n"
                "  - [ ] **EXECUTE**: Produzir teste.\n"
                "  - [ ] **VERIFY**: Observar RED.\n"
                "  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; Não aplicável porque a tarefa só produz teste.\n"
                "  - [ ] **EVIDENCE**: Registrar resultado.\n"
                "  - [ ] **IMPROVE**: Revisar aprendizado.\n"
            )
            spec.write_text(
                "| Campo | Valor |\n"
                "| --- | --- |\n"
                "| Formato | Specsfy/2.0 |\n"
                "| Status | Defined |\n"
                "| Definition Gate | Passed |\n"
                "| Plan Gate | Pending |\n"
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "#### AC-002 — Boundary\n"
                "#### AC-003 — Failure\n"
                "- **FR-001**: Example.\n"
                "- **NFR-001**: Example. **Verificação**: Pest.\n"
                "### 14. Tarefas\n"
                "- [ ] T001 [TEST] [TDD] [US-001] Derivar caso feliz em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n"
                + checklist
                + "- [ ] T002 [TEST] [TDD] [US-001] Derivar caso limite em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none\n"
                + checklist
                + "- [ ] T003 [TEST] [TDD] [US-001] Derivar caso de falha em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: none\n"
                + checklist
                + "- [ ] T004 [CODE] [US-001] Implementar em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001, T002, T003\n"
                + checklist,
                encoding="utf-8",
            )

            result = validate_tasks(spec)

            self.assertEqual([], result["errors"])
            self.assertEqual(3, result["counts"]["tdd"])

    def test_tasks_require_visual_review_before_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            checklist = (
                "  - [ ] **PREP**: Confirmar baseline.\n"
                "  - [ ] **EXECUTE**: Produzir entrega.\n"
                "  - [ ] **VERIFY**: Executar verificação.\n"
                "  - [ ] **EVIDENCE**: Registrar resultado.\n"
                "  - [ ] **IMPROVE**: Revisar aprendizado.\n"
            )
            spec.write_text(
                "| Formato | Specsfy/2.0 |\n"
                "| Status | Defined |\n"
                "| Definition Gate | Passed |\n"
                "| Plan Gate | Pending |\n"
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "#### AC-002 — Boundary\n"
                "#### AC-003 — Failure\n"
                "- **FR-001**: Example.\n"
                "- **NFR-001**: Example.\n"
                "### 14. Tarefas\n"
                "- [ ] T001 [TEST] [TDD] [US-001] Caso feliz em tests/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n"
                + checklist
                + "- [ ] T002 [TEST] [TDD] [US-001] Caso limite em tests/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-002 — Depends: none\n"
                + checklist
                + "- [ ] T003 [TEST] [TDD] [US-001] Caso de falha em tests/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-003 — Depends: none\n"
                + checklist,
                encoding="utf-8",
            )

            result = validate_tasks(spec)

            self.assertTrue(
                any("VISUAL" in error for error in result["errors"]),
                result["errors"],
            )

    def test_plan_rejects_fewer_than_three_tdd_predecessors(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            checklist = (
                "  - [ ] **PREP**: Confirmar baseline.\n"
                "  - [ ] **EXECUTE**: Produzir teste.\n"
                "  - [ ] **VERIFY**: Observar RED.\n"
                "  - [ ] **VISUAL**: Conferir bordas, espaçamentos, margens, padding e tipografia; Não aplicável porque a tarefa só produz teste.\n"
                "  - [ ] **EVIDENCE**: Registrar resultado.\n"
                "  - [ ] **IMPROVE**: Revisar aprendizado.\n"
            )
            spec.write_text(
                "| Campo | Valor |\n"
                "| --- | --- |\n"
                "| Formato | Specsfy/2.0 |\n"
                "| Status | Defined |\n"
                "| Definition Gate | Passed |\n"
                "| Plan Gate | Pending |\n"
                "#### US-001 — Example\n"
                "#### AC-001 — Example\n"
                "#### AC-002 — Boundary\n"
                "#### AC-003 — Failure\n"
                "- **FR-001**: Example.\n"
                "- **NFR-001**: Example. **Verificação**: Pest.\n"
                "### 14. Tarefas\n"
                "- [ ] T001 [TEST] [TDD] [US-001] Derivar teste em tests/Feature/ExampleTest.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: none\n"
                + checklist
                + "- [ ] T002 [CODE] [US-001] Implementar em app/Example.php — Refs: US-001, FR-001, NFR-001, AC-001, AC-002, AC-003 — Depends: T001\n"
                + checklist,
                encoding="utf-8",
            )

            result = validate_tasks(spec)

            self.assertIn(
                "A feature possui 1 predecessor(es) TDD; mínimo exigido: 3.",
                result["errors"],
            )
            self.assertIn(
                "US-001 possui 1 predecessor(es) TDD; mínimo exigido: 3.",
                result["errors"],
            )

    def test_plan_gate_allows_a_future_tdd_causally_blocked_by_first_code_slice(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(incremental_spec(), encoding="utf-8")

            result = validate_tasks(spec)

            self.assertEqual([], result["errors"])

            next_task = run_node(NEXT_TASK, str(spec), "--json")
            payload = json.loads(next_task.stdout)
            self.assertEqual(0, next_task.returncode, next_task.stdout + next_task.stderr)
            self.assertEqual("T011", payload["ready"][0]["id"])
            self.assertEqual([{"id": "T004", "waiting_for": ["T011"], "line_number": payload["blocked"][0]["line_number"]}], payload["blocked"][:1])

    def test_future_tdd_becomes_ready_only_after_its_causal_code_completes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(incremental_spec(initial_code_complete=True), encoding="utf-8")

            after_first_green = run_node(NEXT_TASK, str(spec), "--json")
            after_first_payload = json.loads(after_first_green.stdout)
            self.assertEqual(0, after_first_green.returncode, after_first_green.stdout + after_first_green.stderr)
            self.assertEqual("T004", after_first_payload["ready"][0]["id"])

            spec.write_text(incremental_spec(initial_code_complete=True, future_tdd_complete=True), encoding="utf-8")
            self.assertEqual([], validate_tasks(spec)["errors"])
            after_dependent_red = run_node(NEXT_TASK, str(spec), "--json")
            after_red_payload = json.loads(after_dependent_red.stdout)
            self.assertEqual(0, after_dependent_red.returncode, after_dependent_red.stdout + after_dependent_red.stderr)
            self.assertEqual("T012", after_red_payload["ready"][0]["id"])

    def test_rejects_pending_tdd_without_a_causal_code_predecessor(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(incremental_spec().replace("Depends: T011\n", "Depends: none\n"), encoding="utf-8")

            result = validate_tasks(spec)

            self.assertTrue(any("T004" in error and "causal" in error for error in result["errors"]), result["errors"])

    def test_rejects_circular_causal_dependencies(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(
                incremental_spec().replace("Depends: T001, T002, T003\n", "Depends: T001, T002, T003, T004\n"),
                encoding="utf-8",
            )

            result = validate_tasks(spec)

            self.assertTrue(any("circular" in error.lower() for error in result["errors"]), result["errors"])

    def test_rejects_code_without_its_own_tdd_predecessor(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(incremental_spec().replace("Depends: T004\n", "Depends: none\n"), encoding="utf-8")

            result = validate_tasks(spec)

            self.assertTrue(any("T012 é CODE sem predecessor TDD" in error for error in result["errors"]), result["errors"])

    def test_rejects_completed_tdd_without_completed_red_evidence(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(
                incremental_spec().replace(
                    "  - [x] **EVIDENCE**: Registrar RED valido.\n",
                    "  - [ ] **EVIDENCE**: Registrar RED valido.\n",
                    1,
                ),
                encoding="utf-8",
            )

            result = validate_tasks(spec)

            self.assertTrue(any("T001 está concluída com itens de checklist abertos: EVIDENCE" in error for error in result["errors"]), result["errors"])

    def test_feature_path_is_not_a_tdd_task(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(
                "| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n| Status | Defined |\n| Definition Gate | Passed |\n| Plan Gate | Pending |\n"
                "#### US-001 — Example\n#### AC-001 — Example\n- **FR-001**: Example.\n- **NFR-001**: Example. **Verificação**: teste.\n"
                "### 14. Tarefas\n- [ ] T001 [TEST] [US-001] Referenciar cenário em specs/example.feature — Refs: US-001, FR-001, NFR-001, AC-001 — Depends: none\n",
                encoding="utf-8",
            )
            result = validate_tasks(spec)
            self.assertIn("A feature possui 0 predecessor(es) TDD; mínimo exigido: 3.", result["errors"])


if __name__ == "__main__":
    unittest.main()
