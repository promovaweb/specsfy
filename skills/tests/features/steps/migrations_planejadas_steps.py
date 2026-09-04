from behave import given, then, when
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]


@given("os validadores de tarefas e comprovação do Specsfy")
def given_migration_validators(context) -> None:
    context.tasks_validator = (
        ROOT / "specsfy-05-tasks/scripts/validate_tasks.mjs"
    ).read_text(encoding="utf-8")
    context.evidence_validator = (
        ROOT / "specsfy-07-implement/scripts/verify_evidence.mjs"
    ).read_text(encoding="utf-8")


@when("o contrato de migrations planejadas é inspecionado")
def when_migration_contract_is_inspected(context) -> None:
    context.migration_contract = (
        context.tasks_validator + "\n" + context.evidence_validator
    )


@then("toda tarefa ligada ao banco exige uma tarefa MIGRATION")
def then_database_tasks_require_migration(context) -> None:
    assert "DATABASE_TASK" in context.tasks_validator
    assert "sem uma tarefa [MIGRATION]" in context.tasks_validator
    assert "MIGRATION_PATH" in context.tasks_validator


@then("a conclusão exige arquivo aplicação e consulta de estado")
def then_completion_requires_migration_proof(context) -> None:
    assert "migration não aparece nos arquivos produzidos" in context.evidence_validator
    assert "comando de aplicação da migration ausente" in context.evidence_validator
    assert "comando de conferência da migration ausente" in context.evidence_validator
