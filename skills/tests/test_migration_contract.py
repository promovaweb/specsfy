from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TASKS = ROOT / "specsfy-05-tasks/scripts/validate_tasks.mjs"
EVIDENCE = ROOT / "specsfy-07-implement/scripts/verify_evidence.mjs"


def run(script: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["node", str(script), *arguments],
        text=True,
        capture_output=True,
        check=False,
    )


def checklist() -> str:
    return (
        "  - [ ] **PREP**: Confirmar baseline.\n"
        "  - [ ] **EXECUTE**: Produzir entrega.\n"
        "  - [ ] **VERIFY**: Executar verificação.\n"
        "  - [ ] **VISUAL**: Não aplicável porque não existe interface.\n"
        "  - [ ] **EVIDENCE**: Registrar resultado.\n"
        "  - [ ] **IMPROVE**: Registrar melhoria.\n"
    )


def spec_with_tasks(tasks: str) -> str:
    return (
        "| Formato | Specsfy/2.0 |\n"
        "| Status | Defined |\n"
        "| Definition Gate | Passed |\n"
        "| Plan Gate | Pending |\n"
        "#### US-001 — Cadastro\n"
        "#### AC-001 — Criação\n"
        "#### AC-002 — Validação\n"
        "#### AC-003 — Falha\n"
        "- **FR-001**: Persistir cliente.\n"
        "- **NFR-001**: Manter integridade.\n"
        "### 14. Tarefas\n"
        + tasks
    )


class MigrationContractTests(unittest.TestCase):
    def test_database_task_requires_planned_migration(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            spec = Path(directory) / "spec.md"
            spec.write_text(
                spec_with_tasks(
                    "- [ ] T004 [CODE] [US-001] Criar tabela de clientes em "
                    "app/Models/Cliente.php — Refs: US-001, FR-001, NFR-001, "
                    "AC-001, AC-002, AC-003 — Depends: none\n" + checklist()
                ),
                encoding="utf-8",
            )

            result = run(TASKS, str(spec), "--allow-draft", "--json")
            errors = json.loads(result.stdout)["errors"]

            self.assertTrue(any("sem uma tarefa [MIGRATION]" in error for error in errors))

    def test_database_read_does_not_require_migration(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            spec = Path(directory) / "spec.md"
            spec.write_text(
                spec_with_tasks(
                    "- [ ] T004 [CODE] [US-001] Consultar clientes no banco em "
                    "app/Queries/ListarClientes.php — Refs: US-001, FR-001, "
                    "NFR-001, AC-001, AC-002, AC-003 — Depends: none\n" + checklist()
                ),
                encoding="utf-8",
            )

            result = run(TASKS, str(spec), "--allow-draft", "--json")
            errors = json.loads(result.stdout)["errors"]

            self.assertFalse(any("sem uma tarefa [MIGRATION]" in error for error in errors))

    def test_migration_task_must_point_to_versioned_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            spec = Path(directory) / "spec.md"
            spec.write_text(
                spec_with_tasks(
                    "- [ ] T004 [CODE] [MIGRATION] [US-001] Criar tabela em "
                    "app/Models/Cliente.php — Refs: US-001, FR-001, NFR-001, "
                    "AC-001, AC-002, AC-003 — Depends: none\n" + checklist()
                ),
                encoding="utf-8",
            )

            result = run(TASKS, str(spec), "--allow-draft", "--json")
            errors = json.loads(result.stdout)["errors"]

            self.assertTrue(any("diretório de migrations" in error for error in errors))

    def test_completed_migration_requires_apply_and_status_commands(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            migration = project / "database/migrations/2026_create_clients.php"
            migration.parent.mkdir(parents=True)
            migration.write_text("<?php // migration\n", encoding="utf-8")
            spec = project / "specs/completed/0001-clientes/spec.md"
            spec.parent.mkdir(parents=True)
            base = (
                "| Evidence Contract | 1 |\n"
                "#### US-001 — Cadastro\n"
                "#### AC-001 — Criação\n"
                "- **FR-001**: Persistir cliente.\n"
                "### 14. Tarefas\n"
                "- [x] T004 [CODE] [MIGRATION] [US-001] Criar tabela em "
                "database/migrations/2026_create_clients.php — Refs: US-001, "
                "FR-001, AC-001 — Depends: none\n"
            )
            incomplete = {
                "task": "T004",
                "refs": ["US-001", "FR-001", "AC-001"],
                "files": ["database/migrations/2026_create_clients.php"],
                "commands": [{"run": "php artisan test", "exit": 0}],
            }
            spec.write_text(
                base + f"  <!-- specsfy:evidence {json.dumps(incomplete)} -->\n",
                encoding="utf-8",
            )

            failed = run(EVIDENCE, str(spec), str(project), "--json")
            failed_errors = json.loads(failed.stdout)["errors"]
            self.assertTrue(any("aplicação da migration ausente" in error for error in failed_errors))
            self.assertTrue(any("conferência da migration ausente" in error for error in failed_errors))

            complete = incomplete | {
                "commands": [
                    {"run": "php artisan migrate --env=testing", "exit": 0},
                    {"run": "php artisan migrate:status --env=testing", "exit": 0},
                ]
            }
            spec.write_text(
                base + f"  <!-- specsfy:evidence {json.dumps(complete)} -->\n",
                encoding="utf-8",
            )
            passed = run(EVIDENCE, str(spec), str(project), "--json")

            self.assertEqual(0, passed.returncode, passed.stdout + passed.stderr)

    def test_delivery_rejects_open_planned_migration(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            spec = project / "spec.md"
            spec.write_text(
                "| Evidence Contract | 1 |\n"
                "#### US-001 — Cadastro\n"
                "#### AC-001 — Criação\n"
                "- **FR-001**: Persistir cliente.\n"
                "### 14. Tarefas\n"
                "- [ ] T004 [CODE] [MIGRATION] [US-001] Criar tabela em "
                "database/migrations/2026_create_clients.php — Refs: US-001, "
                "FR-001, AC-001 — Depends: none\n",
                encoding="utf-8",
            )

            planning = run(EVIDENCE, str(spec), str(project), "--json")
            delivery = run(EVIDENCE, str(spec), str(project), "--json", "--delivery")

            self.assertEqual(0, planning.returncode, planning.stdout + planning.stderr)
            self.assertTrue(
                any(
                    "migration planejada ainda não foi concluída" in error
                    for error in json.loads(delivery.stdout)["errors"]
                )
            )


if __name__ == "__main__":
    unittest.main()
