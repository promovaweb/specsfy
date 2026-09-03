from __future__ import annotations

import json
import re
from pathlib import Path

from behave import given, then


ROOT = Path(__file__).resolve().parents[3]
STACK = {
    "specsfy-specialist-laravel",
    "specsfy-specialist-supabase",
    "specsfy-specialist-postgres",
    "specsfy-specialist-redis",
    "specsfy-specialist-docker-swarm",
    "specsfy-specialist-ansible",
    "specsfy-specialist-debian-server",
    "specsfy-specialist-react",
    "specsfy-specialist-astro",
    "specsfy-specialist-nextjs",
}
DESIGN = {
    "specsfy-specialist-design-system",
    "specsfy-specialist-shadcn-ui",
    "specsfy-specialist-ui-design",
    "specsfy-specialist-ux-design",
    "specsfy-specialist-web-accessibility",
}


@given("o catálogo versionado de especialistas")
def given_catalog(context) -> None:
    context.catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
    context.names = {entry["name"] for entry in context.catalog["skills"]}


@then("todas as skills usam o prefixo specsfy-specialist-")
def then_all_are_namespaced(context) -> None:
    assert context.names
    assert all(name.startswith("specsfy-specialist-") for name in context.names)


@then(
    "Laravel, Supabase, Postgres, Redis, Docker Swarm, Ansible, Debian Server, React, Astro e Nextjs estão disponíveis"
)
def then_stack_is_available(context) -> None:
    assert STACK <= context.names


@then("Shadcn, UI, UX e acessibilidade estão disponíveis separadamente")
def then_design_is_available(context) -> None:
    assert DESIGN <= context.names


@given("uma skill especialista do catálogo")
def given_each_skill(context) -> None:
    given_catalog(context)
    context.skills = [ROOT / name for name in context.names]


@then("seu nome, diretório e prompt padrão coincidem")
def then_metadata_agrees(context) -> None:
    for skill in context.skills:
        content = (skill / "SKILL.md").read_text(encoding="utf-8")
        match = re.search(r"^name:\s*(.+)$", content, re.MULTILINE)
        assert match and match.group(1).strip() == skill.name
        metadata = (skill / "agents/openai.yaml").read_text(encoding="utf-8")
        assert f"${skill.name}" in metadata


@then("ela segue o template técnico completo")
def then_skill_follows_the_complete_template(context) -> None:
    for skill in context.skills:
        content = (skill / "SKILL.md").read_text(encoding="utf-8")
        for heading in (
            "## Quando usar",
            "## Fluxo",
            "## Padrões",
            "## Antipadrões",
            "## Validação",
            "## Skills relacionadas",
        ):
            assert heading in content
        assert "[references/standards.md](references/standards.md)" in content


@then("ela publica referências técnicas com fontes primárias")
def then_skill_has_primary_technical_references(context) -> None:
    for skill in context.skills:
        standards = skill / "references" / "standards.md"
        assert standards.is_file()
        assert "https://" in standards.read_text(encoding="utf-8")


@given("o template de autoria de especialistas")
def given_specialist_authoring_template(context) -> None:
    context.template = (ROOT / "templates/SKILL.template.md").read_text(
        encoding="utf-8"
    )
    context.guide = (ROOT / "templates/GUIDE.md").read_text(encoding="utf-8")


@then("o template define todas as seções obrigatórias")
def then_template_has_all_required_sections(context) -> None:
    for heading in (
        "## Quando usar",
        "## Fluxo",
        "## Padrões",
        "## Antipadrões",
        "## Validação",
        "## Skills relacionadas",
    ):
        assert heading in context.template
    assert "references/standards.md" in context.template


@then("o guia define a qualidade do corpo e das referências")
def then_guide_covers_body_and_references(context) -> None:
    assert "## Padrão de qualidade por seção" in context.guide
    assert "## Estrutura de `references/`" in context.guide


@then("toda skill relacionada declara a fronteira recíproca")
def then_related_skills_are_reciprocal(context) -> None:
    contents = {
        skill.name: (skill / "SKILL.md").read_text(encoding="utf-8")
        for skill in context.skills
    }
    for source, content in contents.items():
        related = content.partition("## Skills relacionadas")[2]
        targets = set(
            re.findall(r"\$?(specsfy-specialist-[a-z0-9-]+)", related)
        )
        for target in targets & contents.keys():
            assert source in contents[target], f"{source} -> {target}"


@given("todos os arquivos publicados no catálogo")
def given_all_files(context) -> None:
    context.files = [path for path in ROOT.rglob("*") if path.is_file()]


@then("nenhuma referência ao repositório auditado permanece")
def then_no_origin_reference(context) -> None:
    forbidden = (
        "matt" + "pocock",
        "matt" + " pocock",
        "matt" + "-pocock",
        "ai" + "hero",
    )
    for path in context.files:
        if ".git" in path.parts:
            continue
        try:
            content = path.read_text(encoding="utf-8").lower()
        except UnicodeDecodeError:
            continue
        assert not any(value in content for value in forbidden), path


@then("a skill de componentes React e a skill de UI orientam uso conjunto")
def then_react_components_and_ui_are_paired(context) -> None:
    component_name = "specsfy-specialist-react-ui-components"
    design_system_name = "specsfy-specialist-design-system"
    ui_name = "specsfy-specialist-ui-design"
    assert {component_name, design_system_name, ui_name} <= context.names
    component_content = (ROOT / component_name / "SKILL.md").read_text(
        encoding="utf-8"
    )
    ui_content = (ROOT / ui_name / "SKILL.md").read_text(encoding="utf-8")
    component_entry = next(
        entry
        for entry in context.catalog["skills"]
        if entry["name"] == component_name
    )
    assert f"${ui_name}" in component_content
    assert f"${design_system_name}" in component_content
    assert f"${component_name}" in ui_content
    assert component_entry["requires"] == [design_system_name, ui_name]


@then("as famílias de componentes React estão disponíveis como assets copiáveis")
def then_react_component_assets_are_available(context) -> None:
    assets = (
        ROOT
        / "specsfy-specialist-react-ui-components"
        / "assets"
        / "components"
    )
    components = list(assets.glob("*/*.tsx"))
    assert len(components) == 231
    assert len({component.parent.name for component in components}) == 11


@then("o gestor de pacotes Laravel está disponível")
def then_laravel_package_manager_is_available(context) -> None:
    name = "specsfy-specialist-laravel-package-manager"
    assert name in context.names
    assert (ROOT / name / "SKILL.md").is_file()
    assert (ROOT / name / "agents/openai.yaml").is_file()
    assert (ROOT / name / "references/standards.md").is_file()


@then("ele define instalação e documentação em docs/packages")
def then_package_manager_documents_the_package_context(context) -> None:
    content = (
        ROOT
        / "specsfy-specialist-laravel-package-manager"
        / "SKILL.md"
    ).read_text(encoding="utf-8")
    assert "URL do GitHub" in content
    assert "composer require" in content
    assert "docs/packages/README.md" in content
    assert "docs/packages/" in content


@then("specify e implement consultam os pacotes já instalados")
def then_base_skills_consult_existing_packages(context) -> None:
    for path in (
        ROOT / "../skills/specsfy-03-specify/SKILL.md",
        ROOT / "../skills/specsfy-07-implement/SKILL.md",
    ):
        content = path.read_text(encoding="utf-8")
        assert "specsfy-specialist-laravel-package-manager" in content
        assert ".specsfy/PACKAGES.md" in content
