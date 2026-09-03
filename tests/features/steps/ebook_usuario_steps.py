import json
import posixpath
import re
import subprocess
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit

from behave import given, then, when


ROOT = Path(__file__).resolve().parents[3]
EBOOK_ROOT = ROOT / "ebook"


@given("o percurso completo de documentação do usuário")
def given_user_documentation(context) -> None:
    context.user_pages = sorted((ROOT / "docs" / "user").rglob("*.md"))


@given("o arquivo de versão do ebook")
def given_ebook_version(context) -> None:
    context.version_path = ROOT / "VERSION"


@given("seis edições portáteis em um diretório temporário")
def given_six_portable_editions(context) -> None:
    context.retention_directory = tempfile.TemporaryDirectory()
    context.retention_root = Path(context.retention_directory.name)
    context.retention_versions = (
        "1.0.0",
        "1.1.0",
        "1.2.0",
        "2.0.0",
        "2.0.1",
        "2.1.0",
    )
    for version in context.retention_versions:
        stem = f"Specsfy-Guia-do-Usuario-v{version}"
        (context.retention_root / f"{stem}.pdf").write_bytes(b"pdf")
        (context.retention_root / f"{stem}.epub").write_bytes(b"epub")
    context.unrelated_artifact = context.retention_root / "README.md"
    context.unrelated_artifact.write_text("preservar", encoding="utf-8")


@given("o manifesto verificável do ebook")
def given_ebook_manifest(context) -> None:
    context.manifest_path = EBOOK_ROOT / "build.json"


@given("as fontes visuais do ebook")
def given_ebook_visual_sources(context) -> None:
    context.visual_sources = (
        ROOT / ".ebook" / "pdf.css",
        ROOT / ".ebook" / "epub.css",
        ROOT / ".ebook" / "template.html",
    )


@given("a ordem canônica de leitura do usuário")
def given_canonical_reading_order(context) -> None:
    context.reading_order_path = (
        ROOT / "docs" / "user" / "reading-order.txt"
    )


@given("páginas do usuário com classificação documental")
def given_classified_user_pages(context) -> None:
    context.classified_pages = [
        path
        for path in (ROOT / "docs" / "user").rglob("*.md")
        if "## Classificação" in path.read_text(encoding="utf-8")
    ]


@given("os artefatos portáteis do guia")
def given_portable_guide_artifacts(context) -> None:
    context.version = (ROOT / "VERSION").read_text(
        encoding="utf-8"
    ).strip()
    context.stem = (
        EBOOK_ROOT / f"Specsfy-Guia-do-Usuario-v{context.version}"
    )


@given("o capítulo público da metodologia")
def given_public_method_chapter(context) -> None:
    context.method_path = ROOT / "docs" / "user" / "method.md"


@when("o contrato editorial do ebook é inspecionado")
def when_editorial_contract_is_inspected(context) -> None:
    context.version = (ROOT / "VERSION").read_text(
        encoding="utf-8"
    ).strip()
    context.manifest = json.loads(
        (EBOOK_ROOT / "build.json").read_text(encoding="utf-8")
    )
    context.order = [
        line
        for line in (ROOT / "docs" / "user" / "reading-order.txt").read_text(
            encoding="utf-8"
        ).splitlines()
        if line and not line.startswith("#")
    ]


@when("a integridade das fontes e dos artefatos é calculada")
def when_integrity_is_calculated(context) -> None:
    context.check = subprocess.run(
        [str(ROOT / ".ebook" / "build-ebook.sh"), "--check"],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )
    context.manifest = json.loads(
        context.manifest_path.read_text(encoding="utf-8")
    )


@when("a retenção do ebook é executada")
def when_ebook_retention_runs(context) -> None:
    context.retention = subprocess.run(
        [
            "python3",
            str(ROOT / ".ebook" / "prune-editions.py"),
            "--ebook-root",
            str(context.retention_root),
            "--keep",
            "5",
        ],
        cwd=ROOT,
        text=True,
        capture_output=True,
    )


@when("o percurso pedagógico é inspecionado")
def when_pedagogical_path_is_inspected(context) -> None:
    context.reading_order = [
        line
        for line in context.reading_order_path.read_text(
            encoding="utf-8"
        ).splitlines()
        if line and not line.startswith("#")
    ]
    context.user_portal = (ROOT / "docs" / "user" / "README.md").read_text(
        encoding="utf-8"
    )
    context.build_script = (
        ROOT / ".ebook" / "build-ebook.sh"
    ).read_text(encoding="utf-8")


@when("os formatos de leitura são inspecionados")
def when_reading_formats_are_inspected(context) -> None:
    context.version = (ROOT / "VERSION").read_text(
        encoding="utf-8"
    ).strip()
    stem = EBOOK_ROOT / f"Specsfy-Guia-do-Usuario-v{context.version}"
    context.pdf_text = subprocess.run(
        ["pdftotext", f"{stem}.pdf", "-"],
        check=True,
        text=True,
        capture_output=True,
    ).stdout
    with zipfile.ZipFile(f"{stem}.epub") as archive:
        context.epub_text = "\n".join(
            archive.read(name).decode("utf-8")
            for name in archive.namelist()
            if name.endswith(".xhtml")
        )


@when("os links do PDF e EPUB são inspecionados")
def when_portable_links_are_inspected(context) -> None:
    pdf_xml = subprocess.run(
        [
            "pdftohtml",
            "-xml",
            "-hidden",
            "-i",
            f"{context.stem}.pdf",
            "-stdout",
        ],
        check=True,
        text=True,
        capture_output=True,
    ).stdout
    pdf_document = ET.fromstring(pdf_xml)
    context.pdf_pages = {
        node.attrib["number"]
        for node in pdf_document.iter()
        if node.tag == "page" and "number" in node.attrib
    }
    context.pdf_links = [
        node.attrib["href"]
        for node in pdf_document.iter()
        if "href" in node.attrib
    ]

    context.epub_links = []
    context.epub_ids = {}
    with zipfile.ZipFile(f"{context.stem}.epub") as archive:
        for name in archive.namelist():
            if not name.endswith((".xhtml", ".html")):
                continue
            document = ET.fromstring(archive.read(name))
            context.epub_ids[name] = {
                node.attrib["id"]
                for node in document.iter()
                if "id" in node.attrib
            }
            for node in document.iter():
                if node.tag.endswith("}a") and "href" in node.attrib:
                    context.epub_links.append((name, node.attrib["href"]))


@when("a explicação do método é inspecionada")
def when_method_explanation_is_inspected(context) -> None:
    context.method = context.method_path.read_text(encoding="utf-8")


@then("PDF e EPUB versionados existem na pasta ebook")
def then_versioned_artifacts_exist(context) -> None:
    stem = f"Specsfy-Guia-do-Usuario-v{context.version}"
    assert (EBOOK_ROOT / f"{stem}.pdf").is_file()
    assert (EBOOK_ROOT / f"{stem}.epub").is_file()


@then("todas as páginas do usuário aparecem na ordem editorial")
def then_all_user_pages_are_ordered(context) -> None:
    expected = {
        path.relative_to(ROOT).as_posix() for path in context.user_pages
    }
    assert set(context.order) == expected
    assert len(context.order) == len(expected)


@then("a edição usa uma versão SemVer válida")
def then_version_is_semver(context) -> None:
    assert re.fullmatch(
        r"(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)",
        context.version,
    )


@then("os metadados dos artefatos usam a mesma versão")
def then_metadata_uses_version(context) -> None:
    assert context.manifest["version"] == context.version
    assert context.manifest["edition"] == f"v{context.version}"


@then("o digest cobre recursivamente os docs do usuário")
def then_digest_covers_user_docs(context) -> None:
    assert context.check.returncode == 0, context.check.stderr
    sources = set(context.manifest["sources"])
    expected = {
        path.relative_to(ROOT).as_posix()
        for path in (ROOT / "docs" / "user").rglob("*")
        if path.is_file()
    }
    assert expected <= sources
    assert re.fullmatch(r"[0-9a-f]{64}", context.manifest["source_sha256"])


@then("os hashes do PDF e EPUB correspondem ao manifesto")
def then_artifact_hashes_match(context) -> None:
    assert context.check.returncode == 0, context.check.stderr
    assert set(context.manifest["artifacts"]) == {"pdf", "epub"}
    for artifact in context.manifest["artifacts"].values():
        assert re.fullmatch(r"[0-9a-f]{64}", artifact["sha256"])


@then("logo tipografia cores e templates derivam do manual da marca")
def then_visual_system_matches_brand(context) -> None:
    combined = "\n".join(
        path.read_text(encoding="utf-8")
        for path in context.visual_sources
    )
    for evidence in (
        "brand/logo/icon.svg",
        "IBM Plex Sans",
        "IBM Plex Mono",
        "#000000",
        "#FFFFFF",
    ):
        assert evidence in combined


@then(
    "metodologia instalação primeiro uso fluxo base operação e avançado "
    "aparecem nessa ordem"
)
def then_pedagogical_stages_are_ordered(context) -> None:
    milestones = (
        "docs/user/method.md",
        "docs/user/installation.md",
        "docs/user/getting-started.md",
        "docs/user/skills/README.md",
        "docs/user/cli.md",
        "docs/user/advanced-usage.md",
    )
    positions = [context.reading_order.index(item) for item in milestones]
    assert positions == sorted(positions)


@then("o portal e o ebook usam a mesma sequência")
def then_portal_and_ebook_share_sequence(context) -> None:
    assert "## Percurso pedagógico" in context.user_portal
    assert "docs/user/reading-order.txt" in context.build_script
    for relative in context.reading_order[1:]:
        link = relative.removeprefix("docs/user/")
        assert f"]({link})" in context.user_portal


@then("o Markdown preserva a classificação")
def then_markdown_preserves_classification(context) -> None:
    assert context.classified_pages
    assert all(
        "## Classificação" in path.read_text(encoding="utf-8")
        for path in context.classified_pages
    )


@then("PDF e EPUB omitem o frontmatter de classificação")
def then_reading_formats_omit_classification(context) -> None:
    assert "Classificação" not in context.pdf_text
    assert "Classificação" not in context.epub_text
    manifest = json.loads((EBOOK_ROOT / "build.json").read_text(encoding="utf-8"))
    assert manifest["document_metadata"]["docs/user/installation.md"]


@then("todos os links clicáveis permanecem dentro do próprio formato")
def then_all_links_stay_inside_format(context) -> None:
    assert context.pdf_links
    assert context.epub_links
    for target in context.pdf_links:
        parsed = urlsplit(target)
        assert not parsed.scheme and not parsed.netloc, target
        if parsed.fragment:
            assert parsed.fragment in context.pdf_pages, target
    for _, target in context.epub_links:
        parsed = urlsplit(target)
        assert not parsed.scheme and not parsed.netloc, target


@then("os destinos internos do EPUB existem")
def then_epub_internal_targets_exist(context) -> None:
    for source, target in context.epub_links:
        parsed = urlsplit(target)
        target_name = source
        if parsed.path:
            target_name = posixpath.normpath(
                posixpath.join(posixpath.dirname(source), parsed.path)
            )
            assert target_name in context.epub_ids, (source, target)
        if parsed.fragment:
            assert parsed.fragment in context.epub_ids[target_name], (
                source,
                target,
            )


@then("somente as cinco versões SemVer mais recentes permanecem")
def then_only_latest_five_editions_remain(context) -> None:
    assert context.retention.returncode == 0, context.retention.stderr
    remaining = {
        path.name
        for path in context.retention_root.glob(
            "Specsfy-Guia-do-Usuario-v*.*"
        )
    }
    expected_versions = set(context.retention_versions[1:])
    assert len(remaining) == 10
    for version in expected_versions:
        stem = f"Specsfy-Guia-do-Usuario-v{version}"
        assert f"{stem}.pdf" in remaining
        assert f"{stem}.epub" in remaining


@then("arquivos que não representam edições são preservados")
def then_unrelated_files_are_preserved(context) -> None:
    assert context.unrelated_artifact.read_text(
        encoding="utf-8"
    ) == "preservar"
    context.retention_directory.cleanup()


@then("cada etapa explica objetivo participação do usuário e prova técnica")
def then_each_stage_is_explained(context) -> None:
    for heading in (
        "### Escolha o destino da ideia",
        "### Ato I — Definir o que precisa mudar",
        "### Ato II — Planejar e preparar o RED",
        "### Ato III — Entregar e conferir o resultado",
    ):
        assert heading in context.method
    for evidence in (
        "**Objetivo:**",
        "**Sua participação:**",
        "**Prova técnica:**",
    ):
        assert context.method.count(evidence) >= 3


@then(
    "ideia backlog spec gates BDD TDD e mudança tardia são explicados "
    "em linguagem simples"
)
def then_method_terms_are_explained(context) -> None:
    for evidence in (
        "Uma **ideia**",
        "O **backlog**",
        "A **spec**",
        "Um **gate**",
        "BDD",
        "TDD",
        "Se a necessidade mudar",
    ):
        assert evidence in context.method
