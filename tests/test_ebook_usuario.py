from __future__ import annotations

import json
import posixpath
import re
import struct
import subprocess
import tempfile
import unittest
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
EBOOK_ROOT = ROOT / "ebook"
PIPELINE_ROOT = ROOT / ".ebook"
WORKFLOW = ROOT / ".github" / "workflows" / "specsfy.yml"


class UserEbookTests(unittest.TestCase):
    def test_ci_installs_ebook_inspection_dependencies(self) -> None:
        workflow = WORKFLOW.read_text(encoding="utf-8")
        dependency_step = "sudo apt-get install -y libxml2-utils poppler-utils"
        tests_step = (
            "python3 -B -m unittest discover -s tests -p 'test_*.py'"
        )

        self.assertIn(dependency_step, workflow)
        self.assertLess(workflow.index(dependency_step), workflow.index(tests_step))

    def test_portable_guide_requires_brazilian_portuguese(self) -> None:
        metadata = (PIPELINE_ROOT / "metadata.yaml").read_text(encoding="utf-8")
        template = (PIPELINE_ROOT / "template.html").read_text(encoding="utf-8")
        build = (PIPELINE_ROOT / "build-ebook.sh").read_text(encoding="utf-8")
        readme = (EBOOK_ROOT / "README.md").read_text(encoding="utf-8")

        self.assertIn('lang: "pt-BR"', metadata)
        self.assertIn('<html lang="pt-BR">', template)
        self.assertIn("Português do Brasil", readme)
        self.assertIn("deve declarar lang:", build)
        self.assertIn('deve declarar lang="pt-BR"', build)

    def test_portable_guide_does_not_identify_itself_as_the_repository(
        self,
    ) -> None:
        metadata = (PIPELINE_ROOT / "metadata.yaml").read_text(
            encoding="utf-8"
        )
        template = (PIPELINE_ROOT / "template.html").read_text(
            encoding="utf-8"
        )
        readme = (EBOOK_ROOT / "README.md").read_text(encoding="utf-8")

        self.assertIn('identifier: "urn:specsfy:guia-do-usuario"', metadata)
        self.assertNotIn("github.com/promovaweb/specsfy", metadata)
        self.assertNotIn("Fonte editorial: docs/user/", template)
        self.assertIn("experiência autocontida", readme)
        self.assertIn("citação nominal", readme)
        self.assertIn("online-only", readme)

    def test_retention_keeps_only_the_five_latest_editions(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            ebook_root = Path(directory)
            for version in (
                "1.0.0",
                "1.1.0",
                "1.2.0",
                "2.0.0",
                "2.0.1",
                "2.1.0",
            ):
                stem = f"Specsfy-Guia-do-Usuario-v{version}"
                (ebook_root / f"{stem}.pdf").write_bytes(b"pdf")
                (ebook_root / f"{stem}.epub").write_bytes(b"epub")
            unrelated = ebook_root / "README.md"
            unrelated.write_text("preservar", encoding="utf-8")

            prune = subprocess.run(
                [
                    "python3",
                    str(PIPELINE_ROOT / "prune-editions.py"),
                    "--ebook-root",
                    str(ebook_root),
                    "--keep",
                    "5",
                ],
                cwd=ROOT,
                text=True,
                capture_output=True,
            )

            self.assertEqual(0, prune.returncode, prune.stderr)
            self.assertFalse(
                (
                    ebook_root
                    / "Specsfy-Guia-do-Usuario-v1.0.0.pdf"
                ).exists()
            )
            self.assertFalse(
                (
                    ebook_root
                    / "Specsfy-Guia-do-Usuario-v1.0.0.epub"
                ).exists()
            )
            self.assertEqual(
                10,
                len(
                    list(
                        ebook_root.glob(
                            "Specsfy-Guia-do-Usuario-v*.*"
                        )
                    )
                ),
            )
            self.assertEqual(
                "preservar",
                unrelated.read_text(encoding="utf-8"),
            )

    def test_build_applies_retention_after_integrity_check(self) -> None:
        build = (PIPELINE_ROOT / "build-ebook.sh").read_text(
            encoding="utf-8"
        )
        retention_call = (
            'check_manifest\n'
            'python3 "$RETENTION_SCRIPT" \\\n'
            '  --ebook-root "$EBOOK_ROOT" \\\n'
            '  --keep 5 \\\n'
            '  --protect-version "$VERSION"'
        )
        self.assertIn(retention_call, build)

    def test_semver_controls_versioned_pdf_and_epub(self) -> None:
        version = (EBOOK_ROOT / "VERSION").read_text(
            encoding="utf-8"
        ).strip()
        self.assertRegex(
            version,
            r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$",
        )
        stem = f"Specsfy-Guia-do-Usuario-v{version}"
        self.assertTrue((EBOOK_ROOT / f"{stem}.pdf").is_file())
        self.assertTrue((EBOOK_ROOT / f"{stem}.epub").is_file())

    def test_editorial_order_includes_every_user_page_once(self) -> None:
        ordered_sources = [
            line
            for line in (ROOT / "docs" / "user" / "reading-order.txt").read_text(
                encoding="utf-8"
            ).splitlines()
            if line and not line.startswith("#")
        ]
        user_pages = {
            path.relative_to(ROOT).as_posix()
            for path in (ROOT / "docs" / "user").rglob("*.md")
        }
        self.assertEqual(user_pages, set(ordered_sources))
        self.assertEqual(len(user_pages), len(ordered_sources))

    def test_deploy_chapter_connects_semver_to_the_runtime(self) -> None:
        chapter = (ROOT / "docs" / "user" / "deploy.md").read_text(encoding="utf-8")
        order = (ROOT / "docs" / "user" / "reading-order.txt").read_text(
            encoding="utf-8"
        )
        for term in (
            "SEMVER",
            "specsfy-specialist-versioning",
            "Docker",
            "Ansible",
            "Docker Swarm",
            "rollback",
        ):
            self.assertIn(term, chapter)
        self.assertIn("docs/user/deploy.md", order)

    def test_build_manifest_proves_sources_and_artifacts_are_current(
        self,
    ) -> None:
        check = subprocess.run(
            [str(PIPELINE_ROOT / "build-ebook.sh"), "--check"],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )
        self.assertEqual(0, check.returncode, check.stderr)

        manifest = json.loads(
            (EBOOK_ROOT / "build.json").read_text(encoding="utf-8")
        )
        self.assertRegex(manifest["source_sha256"], r"^[0-9a-f]{64}$")
        self.assertEqual({"pdf", "epub"}, set(manifest["artifacts"]))
        for artifact in manifest["artifacts"].values():
            self.assertRegex(artifact["sha256"], r"^[0-9a-f]{64}$")
        installation_metadata = manifest["document_metadata"][
            "docs/user/installation.md"
        ]
        self.assertEqual(
            {"natureza", "escopo", "autoridade"},
            set(installation_metadata),
        )

    def test_makefile_tracks_recursive_docs_and_exposes_ebook_target(
        self,
    ) -> None:
        makefile = (ROOT / "Makefile").read_text(encoding="utf-8")
        for evidence in (
            ".PHONY: brand-guide ebook verify-ebook",
            "EBOOK_DOC_SOURCES",
            "find docs/user -type f",
            ".ebook/extract-document-metadata.py",
            ".ebook/prune-editions.py",
            ".ebook/strip-document-metadata.lua",
            "ebook:",
            "./.ebook/build-ebook.sh",
            "verify-ebook:",
            "./.ebook/build-ebook.sh --check",
        ):
            self.assertIn(evidence, makefile)

    def test_visual_sources_reuse_the_brand_system(self) -> None:
        sources = "\n".join(
            path.read_text(encoding="utf-8")
            for path in (
                PIPELINE_ROOT / "pdf.css",
                PIPELINE_ROOT / "epub.css",
                PIPELINE_ROOT / "template.html",
                PIPELINE_ROOT / "metadata.yaml",
            )
        )
        for evidence in (
            "brand/logo/icon.svg",
            "IBM Plex Sans",
            "IBM Plex Mono",
            "#000000",
            "#FFFFFF",
            "Especifique. Comprove. Entregue.",
        ):
            self.assertIn(evidence, sources)

    def test_reading_formats_omit_document_classification_frontmatter(
        self,
    ) -> None:
        classified_pages = [
            path
            for path in (ROOT / "docs" / "user").rglob("*.md")
            if "## Classificação" in path.read_text(encoding="utf-8")
        ]
        self.assertTrue(classified_pages)

        version = (EBOOK_ROOT / "VERSION").read_text(
            encoding="utf-8"
        ).strip()
        stem = EBOOK_ROOT / f"Specsfy-Guia-do-Usuario-v{version}"
        pdf_text = subprocess.run(
            ["pdftotext", f"{stem}.pdf", "-"],
            check=True,
            text=True,
            capture_output=True,
        ).stdout
        self.assertNotIn("Classificação", pdf_text)

        with zipfile.ZipFile(f"{stem}.epub") as archive:
            epub_text = "\n".join(
                archive.read(name).decode("utf-8")
                for name in archive.namelist()
                if name.endswith(".xhtml")
            )
        self.assertNotIn("Classificação", epub_text)

    def test_portable_guide_omits_online_download_directions(self) -> None:
        version = (EBOOK_ROOT / "VERSION").read_text(
            encoding="utf-8"
        ).strip()
        stem = EBOOK_ROOT / f"Specsfy-Guia-do-Usuario-v{version}"
        pdf_text = subprocess.run(
            ["pdftotext", f"{stem}.pdf", "-"],
            check=True,
            text=True,
            capture_output=True,
        ).stdout
        with zipfile.ZipFile(f"{stem}.epub") as archive:
            epub_text = "\n".join(
                archive.read(name).decode("utf-8")
                for name in archive.namelist()
                if name.endswith(".xhtml")
            )

        for text in (pdf_text, epub_text):
            self.assertNotIn("Leia online ou como ebook", text)
            self.assertNotIn("pasta do ebook", text)

    def test_epub_is_well_formed_and_contains_navigation(self) -> None:
        version = (EBOOK_ROOT / "VERSION").read_text(
            encoding="utf-8"
        ).strip()
        epub = EBOOK_ROOT / f"Specsfy-Guia-do-Usuario-v{version}.epub"
        with zipfile.ZipFile(epub) as archive:
            self.assertEqual(
                b"application/epub+zip",
                archive.read("mimetype"),
            )
            names = set(archive.namelist())
            self.assertIn("META-INF/container.xml", names)
            self.assertTrue(
                any(name.endswith("nav.xhtml") for name in names)
            )
            for name in names:
                if name.endswith((".xhtml", ".opf", ".ncx", ".xml")):
                    with self.subTest(epub_entry=name):
                        ET.fromstring(archive.read(name))
            package = ET.fromstring(archive.read("EPUB/content.opf"))
            namespace = {"opf": "http://www.idpf.org/2007/opf"}
            cover = next(
                item
                for item in package.findall(".//opf:item", namespace)
                if "cover-image" in item.attrib.get("properties", "")
            )
            cover_data = archive.read(f"EPUB/{cover.attrib['href']}")
            self.assertEqual(b"\x89PNG\r\n\x1a\n", cover_data[:8])
            self.assertEqual(
                (1600, 2560),
                struct.unpack(">II", cover_data[16:24]),
            )
            title = package.find(
                ".//{http://purl.org/dc/elements/1.1/}title"
            )
            self.assertIsNotNone(title)
            self.assertIn(f"v{version}", title.text or "")
            identifier = package.find(
                ".//{http://purl.org/dc/elements/1.1/}identifier"
            )
            self.assertIsNotNone(identifier)
            self.assertEqual(
                "urn:specsfy:guia-do-usuario",
                identifier.text,
            )

    def test_pdf_and_epub_links_stay_inside_the_ebook(self) -> None:
        version = (EBOOK_ROOT / "VERSION").read_text(
            encoding="utf-8"
        ).strip()
        stem = EBOOK_ROOT / f"Specsfy-Guia-do-Usuario-v{version}"

        pdf_xml = subprocess.run(
            [
                "pdftohtml",
                "-xml",
                "-hidden",
                "-i",
                f"{stem}.pdf",
                "-stdout",
            ],
            check=True,
            text=True,
            capture_output=True,
        ).stdout
        pdf_document = ET.fromstring(pdf_xml)
        pdf_pages = {
            node.attrib["number"]
            for node in pdf_document.iter()
            if node.tag == "page" and "number" in node.attrib
        }
        pdf_links = [
            node.attrib["href"]
            for node in pdf_document.iter()
            if "href" in node.attrib
        ]
        self.assertTrue(pdf_links)
        for target in pdf_links:
            with self.subTest(pdf_target=target):
                parsed = urlsplit(target)
                self.assertFalse(parsed.scheme)
                self.assertFalse(parsed.netloc)
                if parsed.fragment:
                    self.assertIn(parsed.fragment, pdf_pages)

        with zipfile.ZipFile(f"{stem}.epub") as archive:
            documents = {}
            for name in archive.namelist():
                if name.endswith((".xhtml", ".html")):
                    documents[name] = ET.fromstring(archive.read(name))
            ids = {
                name: {
                    node.attrib["id"]
                    for node in document.iter()
                    if "id" in node.attrib
                }
                for name, document in documents.items()
            }
            links = [
                (name, node.attrib["href"])
                for name, document in documents.items()
                for node in document.iter()
                if node.tag.endswith("}a") and "href" in node.attrib
            ]

        self.assertTrue(links)
        for source, target in links:
            with self.subTest(epub_source=source, epub_target=target):
                parsed = urlsplit(target)
                self.assertFalse(parsed.scheme)
                self.assertFalse(parsed.netloc)
                target_name = source
                if parsed.path:
                    target_name = posixpath.normpath(
                        posixpath.join(
                            posixpath.dirname(source),
                            parsed.path,
                        )
                    )
                    self.assertIn(target_name, documents)
                if parsed.fragment:
                    self.assertIn(parsed.fragment, ids[target_name])

    def test_method_explains_the_user_journey_and_technical_proofs(
        self,
    ) -> None:
        method = (ROOT / "docs" / "user" / "method.md").read_text(
            encoding="utf-8"
        )
        for heading in (
            "### Escolha o destino da ideia",
            "### Ato I — Definir o que precisa mudar",
            "### Ato II — Planejar e preparar o RED",
            "### Ato III — Entregar e conferir o resultado",
        ):
            self.assertIn(heading, method)
        for label in (
            "**Objetivo:**",
            "**Sua participação:**",
            "**Prova técnica:**",
        ):
            self.assertGreaterEqual(method.count(label), 3)
        for term in (
            "Uma **ideia**",
            "O **backlog**",
            "A **spec**",
            "Um **gate**",
            "BDD",
            "TDD",
            "Se a necessidade mudar",
        ):
            self.assertIn(term, method)


if __name__ == "__main__":
    unittest.main()
