from __future__ import annotations

import json
import subprocess
import tempfile
from pathlib import Path

from behave import given, then, when


ROOT = Path(__file__).resolve().parents[3]
CLI = ROOT / "cli" / "bin" / "specsfy"
CAPTURE = "2026-07-28-143205-avisar-clientes-sobre-atrasos.md"
ORIGINAL = "Quero avisar clientes quando uma entrega atrasar, talvez por e-mail."
CAPTURE_CONTENT = (
    "# Inbox: Avisar clientes sobre atrasos\n\n"
    "| Metadado | Valor |\n| --- | --- |\n"
    "| Status | Capturada |\n"
    "| Capturada em | 2026-07-28T14:32:05Z |\n"
    "| Spec derivada | Nenhuma |\n\n"
    f"## Texto original\n\n{ORIGINAL}\n"
)


def prepare_project(context, folder: str, gate: str) -> None:
    temporary = tempfile.TemporaryDirectory()
    context.add_cleanup(temporary.cleanup)
    context.project = Path(temporary.name)
    inbox = context.project / "specs" / "inbox"
    inbox.mkdir(parents=True)
    (inbox / CAPTURE).write_text(CAPTURE_CONTENT, encoding="utf-8")
    context.spec = context.project / "specs" / folder / "0007-avisos-de-atraso" / "spec.md"
    context.spec.parent.mkdir(parents=True)
    context.spec.write_text(
        "# Especificação: Avisos de atraso\n\n| Campo | Valor |\n| --- | --- |\n"
        f"| Status | {'Defined' if gate == 'Passed' else 'Draft'} |\n"
        f"| Definition Gate | {gate} |\n\n"
        f"Origem: specs/inbox/{CAPTURE}\n",
        encoding="utf-8",
    )


def run_process(context) -> None:
    context.result = subprocess.run(
        [
            str(CLI), "inbox", "process", CAPTURE,
            "--spec", "0007-avisos-de-atraso",
            "--project", str(context.project), "--json",
        ],
        text=True,
        capture_output=True,
        check=False,
    )


@given("uma captura na Inbox referenciada por uma spec com Definition Gate aprovado")
def given_capture_with_approved_spec(context) -> None:
    prepare_project(context, "defined", "Passed")


@given("uma captura na Inbox referenciada por uma spec em Draft")
def given_capture_with_draft_spec(context) -> None:
    prepare_project(context, "draft", "Pending")


@when("o CLI processa a captura indicando essa spec")
def when_cli_processes_capture(context) -> None:
    run_process(context)
    assert context.result.returncode == 0, context.result.stderr
    context.payload = json.loads(context.result.stdout)


@when("o CLI tenta processar a captura indicando essa spec")
def when_cli_tries_to_process_capture(context) -> None:
    run_process(context)


@then("a captura passa para specs/inbox/processed/ com Status Processada")
def then_capture_is_processed(context) -> None:
    moved = context.project / "specs" / "inbox" / "processed" / CAPTURE
    assert moved.is_file()
    assert not (context.project / "specs" / "inbox" / CAPTURE).exists()
    assert context.payload["status"] == "Processada"
    assert context.payload["to"] == f"specs/inbox/processed/{CAPTURE}"
    assert "| Status | Processada |" in moved.read_text(encoding="utf-8")


@then("o texto original é preservado e a spec derivada fica registrada")
def then_original_text_and_spec_are_registered(context) -> None:
    content = (context.project / "specs" / "inbox" / "processed" / CAPTURE).read_text(
        encoding="utf-8"
    )
    assert ORIGINAL in content
    assert "| Spec derivada | specs/defined/0007-avisos-de-atraso/spec.md |" in content
    assert "| Processada em | " in content


@then("as referências à captura na spec apontam para o novo caminho")
def then_spec_references_follow_the_capture(context) -> None:
    content = context.spec.read_text(encoding="utf-8")
    assert f"specs/inbox/processed/{CAPTURE}" in content
    assert f"specs/inbox/{CAPTURE}" not in content
    assert context.payload["updated_references"] == [
        "specs/defined/0007-avisos-de-atraso/spec.md"
    ]


@then("o comando recusa citando o Definition Gate")
def then_command_refuses_pending_gate(context) -> None:
    assert context.result.returncode == 1, context.result.stdout
    assert "Definition Gate" in context.result.stderr


@then("a captura continua em specs/inbox/ sem alteração")
def then_capture_stays_in_inbox(context) -> None:
    original = context.project / "specs" / "inbox" / CAPTURE
    assert original.read_text(encoding="utf-8") == CAPTURE_CONTENT
    assert not (context.project / "specs" / "inbox" / "processed").exists()
