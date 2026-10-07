from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from shutil import copy2

from behave import given, then, when


ROOT = Path(__file__).resolve().parents[3]
MVP_IMPORTER = (
    ROOT / "specsfy-mvp-milestone-interviewer" / "scripts" / "importar_mvp.mjs"
)


def run_git(*args: str, cwd: Path) -> None:
    subprocess.run(
        ["git", *args], cwd=cwd, text=True, capture_output=True, check=True
    )
FRAMEWORK_TEMPLATE_NAMES = (
    "Inbox.md",
    "Backlog.md",
    "Spec.md",
    "Tasks.md",
    "Project.md",
    "Stack.md",
    "Rules.md",
    "Database.md",
    "UserProfile.md",
)


def temporary_project(context) -> Path:
    temporary = tempfile.TemporaryDirectory()
    context.add_cleanup(temporary.cleanup)
    return Path(temporary.name)


@given("um projeto consumidor inicializado para a Inbox")
def given_consumer_initialized_for_inbox(context) -> None:
    context.project = temporary_project(context)
    templates = context.project / ".specsfy" / "templates"
    templates.mkdir(parents=True)
    (templates / "Inbox.md").write_text(
        (ROOT / "templates" / "Inbox.md").read_text(encoding="utf-8"),
        encoding="utf-8",
    )
    context.skill = (
        ROOT / "specsfy-01-inbox" / "SKILL.md"
    ).read_text(encoding="utf-8")


@when("o agente recebe somente o texto da entrada")
def when_agent_receives_inbox_text(context) -> None:
    context.original = (
        "Quero avisar clientes quando uma entrega atrasar, talvez por e-mail."
    )
    context.result = subprocess.run(
        [
            "node",
            str(ROOT / "specsfy-01-inbox" / "scripts" / "capturar_inbox.mjs"),
            "--input",
            context.original,
            "--title",
            "Avisar clientes sobre atrasos",
            "--summary",
            "Notificar clientes afetados por atrasos.",
            "--problem",
            "Clientes ficam sem contexto quando a entrega atrasa.",
            "--people",
            "Clientes com entrega em andamento.",
            "--value",
            "Reduzir incerteza durante atrasos.",
            "--signals",
            "Canal sugerido: e-mail.",
            "--review",
            "Definir gatilho e conteúdo.",
            "--root",
            str(context.project),
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    assert context.result.returncode == 0, context.result.stderr
    context.created = Path(context.result.stdout.strip())


@then("ele não faz perguntas nem solicita confirmação")
def then_does_not_ask_questions(context) -> None:
    normalized = " ".join(context.skill.casefold().split())
    assert "não faça perguntas" in normalized
    assert "não peça confirmação" in normalized


@then("cria specs/inbox/data-hora-slug.md a partir do template instalado")
def then_creates_timestamped_inbox_entry(context) -> None:
    assert context.created.parent == context.project / "specs" / "inbox"
    assert context.created.name.endswith("-avisar-clientes-sobre-atrasos.md")
    assert context.created.is_file()


@then("preserva o texto original e separa análise, inferências e pontos a revisar")
def then_preserves_and_separates_analysis(context) -> None:
    content = context.created.read_text(encoding="utf-8")
    for expected in (
        context.original,
        "## Análise inicial",
        "**Inferência:**",
        "## Pontos a revisar no futuro",
    ):
        assert expected in content


@then("não cria backlog, spec, tarefas ou código")
def then_creates_only_the_inbox_entry(context) -> None:
    assert not (context.project / "specs" / "backlog").exists()
    assert not (context.project / "specs" / "specs").exists()
    assert set((context.project / "specs").rglob("*")) == {
        context.project / "specs" / "inbox",
        context.created,
    }


@given("uma instalação base do Specsfy")
def given_base_installation(context) -> None:
    context.project = temporary_project(context)


@when("o CLI publica os arquivos estruturais no projeto consumidor")
def when_cli_publishes_structural_files(context) -> None:
    destination = context.project / ".specsfy" / "templates"
    destination.mkdir(parents=True)
    context.changed = []
    for name in FRAMEWORK_TEMPLATE_NAMES:
        target = destination / name
        copy2(ROOT / "templates" / name, target)
        context.changed.append(target)
    (destination / "custom").mkdir()


@then(
    ".specsfy/templates contém Inbox.md, Backlog.md, Spec.md, Tasks.md, "
    "Project.md, Stack.md, Rules.md, Database.md e UserProfile.md"
)
def then_all_framework_templates_are_installed(context) -> None:
    installed = context.project / ".specsfy" / "templates"
    assert set(FRAMEWORK_TEMPLATE_NAMES) == {
        path.name for path in installed.iterdir() if path.is_file()
    }
    assert all(
        installed / name in context.changed
        for name in FRAMEWORK_TEMPLATE_NAMES
    )


@then("cria .specsfy/templates/custom sem gerenciar seu conteúdo")
def then_custom_template_directory_is_unmanaged(context) -> None:
    custom = context.project / ".specsfy" / "templates" / "custom"
    assert custom.is_dir()
    assert custom not in context.changed


@given("um projeto consumidor com MVP.md e BRAND.md na raiz")
def given_consumer_with_mvp_and_brand(context) -> None:
    context.project = temporary_project(context)
    (context.project / "MVP.md").write_text(
        "# Produto\n\n## Cadastro de clientes\n\nO sistema deve permitir cadastrar clientes.\n",
        encoding="utf-8",
    )
    (context.project / "BRAND.md").write_text(
        "# Marca\n\nLinguagem clara para equipes de atendimento.\n",
        encoding="utf-8",
    )
    context.mvp_skill = (
        ROOT / "specsfy-mvp-milestone-interviewer" / "SKILL.md"
    ).read_text(encoding="utf-8")


@when("o entrevistador de MVP inicia a descoberta")
def when_mvp_interviewer_starts(context) -> None:
    context.result = subprocess.run(
        ["node", str(MVP_IMPORTER), "--root", str(context.project)],
        text=True,
        capture_output=True,
        check=False,
    )
    assert context.result.returncode == 0, context.result.stderr
    context.imported = json.loads(context.result.stdout)


@then("ele importa MVP.md como a Milestone 1.0 sem sobrescrever uma existente")
def then_imports_first_milestone(context) -> None:
    milestone = context.project / "specs/milestones/M01.md"
    assert milestone.is_file()
    assert "# Milestone 1.0" in milestone.read_text(encoding="utf-8")
    assert "não sobrescreva a milestone 1.0" in context.mvp_skill.casefold()


@then("cria backlog e spec Draft apenas para cada requisito de desenvolvimento")
def then_registers_only_development_backlogs(context) -> None:
    items = context.imported["items"]
    assert items
    assert not (context.project / "specs/inbox").exists()
    assert all(item["backlog"] for item in items)
    assert all(item["spec"] for item in items)
    assert all((context.project / item["backlog"]).is_file() for item in items)
    assert all((context.project / item["spec"]).is_file() for item in items)


@then("entrevista cada backlog antes de qualquer promoção")
def then_interviews_each_backlog_before_promotion(context) -> None:
    normalized = " ".join(context.mvp_skill.split()).casefold()
    assert "entrevistar cada backlog" in normalized
    assert "somente avança quando cada etapa tiver resultado confirmado" in normalized
    for item in context.imported["items"]:
        if item["backlog"]:
            content = (context.project / item["backlog"]).read_text(encoding="utf-8")
            assert "$specsfy-02-backlog" in content


@given("um projeto consumidor instalado como submódulo Git de um Hub")
def given_consumer_submodule_of_hub(context) -> None:
    temporary_root = Path(tempfile.mkdtemp(prefix="specsfy-hub-"))
    context.add_cleanup(shutil.rmtree, temporary_root, ignore_errors=True)
    context.parent = temporary_root / "hub"
    source = temporary_root / "consumer-source"
    context.parent.mkdir()
    source.mkdir()
    run_git("init", cwd=source)
    run_git("config", "user.email", "tests@example.com", cwd=source)
    run_git("config", "user.name", "Specsfy tests", cwd=source)
    (source / "README.md").write_text("# Consumidor\n", encoding="utf-8")
    run_git("add", "README.md", cwd=source)
    run_git("commit", "-m", "init consumidor", cwd=source)
    run_git("init", cwd=context.parent)
    run_git("config", "user.email", "tests@example.com", cwd=context.parent)
    run_git("config", "user.name", "Specsfy tests", cwd=context.parent)
    run_git("-c", "protocol.file.allow=always", "submodule", "add", str(source), "consumer", cwd=context.parent)
    run_git("commit", "-m", "adiciona consumidor", cwd=context.parent)
    context.project = context.parent / "consumer"


@given("MVP.md e BRAND.md estão somente na raiz do Hub")
def given_mvp_and_brand_only_in_hub(context) -> None:
    (context.parent / "MVP.md").write_text(
        "# Produto\n\n## Consultar clientes\n\nO sistema deve consultar clientes.\n",
        encoding="utf-8",
    )
    (context.parent / "BRAND.md").write_text(
        "# Marca\n\nComunicação direta.\n",
        encoding="utf-8",
    )
    run_git("add", "MVP.md", "BRAND.md", cwd=context.parent)
    run_git("commit", "-m", "adiciona contexto do hub", cwd=context.parent)
    context.mvp_skill = (
        ROOT / "specsfy-mvp-milestone-interviewer" / "SKILL.md"
    ).read_text(encoding="utf-8")


@then("ele consulta os arquivos da raiz do Hub")
def then_consults_hub_context(context) -> None:
    normalized = " ".join(context.mvp_skill.split()).casefold()
    assert "superprojeto" in normalized
    assert "mvp.md" in normalized
    assert "brand.md" in normalized


@then("importa o MVP como a Milestone 1.0 sem criar Inboxes no projeto consumidor")
def then_imports_hub_mvp_into_consumer(context) -> None:
    milestone = context.project / "specs/milestones/M01.md"
    assert milestone.is_file()
    assert "MVP.md" in milestone.read_text(encoding="utf-8")
    assert not (context.project / "specs/inbox").exists()


@given("o contrato central e as skills de inbox, backlog, especificação e validação")
def given_contract_and_inbox_lifecycle_skills(context) -> None:
    context.contract = (ROOT / "Spec.md").read_text(encoding="utf-8")
    context.lifecycle_skills = {
        name: (ROOT / name / "SKILL.md").read_text(encoding="utf-8")
        for name in (
            "specsfy-01-inbox",
            "specsfy-02-backlog",
            "specsfy-03-specify",
            "specsfy-04-validate",
        )
    }


@when("a saída da Inbox é inspecionada")
def when_inbox_exit_is_inspected(context) -> None:
    context.normalized = {
        name: " ".join(text.split()).casefold()
        for name, text in context.lifecycle_skills.items()
    }


@then("a estrutura canônica declara specs/inbox/processed/")
def then_canonical_structure_declares_processed(context) -> None:
    assert "│   ├── processed/" in context.contract
    assert "`specs/inbox/processed/`" in context.contract


@then("a captura permanece na Inbox até o Definition Gate das specs que a cobrem")
def then_capture_stays_until_definition_gate(context) -> None:
    for name in ("specsfy-01-inbox", "specsfy-03-specify"):
        assert "`specs/inbox/processed/`" in context.lifecycle_skills[name], name
        assert "definition gate" in context.normalized[name], name
    assert "não mover" in context.normalized["specsfy-01-inbox"]


@then("só a validação move a captura, pelo CLI, depois de specsfy transition para defined")
def then_only_validation_moves_the_capture(context) -> None:
    validate = context.lifecycle_skills["specsfy-04-validate"]
    transition = validate.index("`specsfy transition <id> defined`")
    process = validate.index("`specsfy inbox process <captura> --spec <id>`")
    assert transition < process
    assert "parte do pedido" in context.normalized["specsfy-04-validate"]
    assert "`specsfy inbox process`" not in context.lifecycle_skills["specsfy-02-backlog"]


@then("a busca por duplicatas do backlog inclui as capturas processadas")
def then_backlog_search_includes_processed(context) -> None:
    backlog = context.lifecycle_skills["specsfy-02-backlog"]
    assert "`specs/inbox/processed/*.md`" in backlog
    assert "não alterar, mover nem apagar entradas de inbox" in context.normalized["specsfy-02-backlog"]
