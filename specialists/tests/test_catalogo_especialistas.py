"""Contratos do catálogo e das instruções dos especialistas técnicos."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_SKILLS = {
    "specsfy-specialist-ansible",
    "specsfy-specialist-application-security",
    "specsfy-specialist-astro",
    "specsfy-specialist-code-review",
    "specsfy-specialist-debugging",
    "specsfy-specialist-delivery-engineering",
    "specsfy-specialist-docker",
    "specsfy-specialist-docker-swarm",
    "specsfy-specialist-domain-modeling",
    "specsfy-specialist-gitflow",
    "specsfy-specialist-laravel",
    "specsfy-specialist-merge-conflict-resolution",
    "specsfy-specialist-nextjs",
    "specsfy-specialist-observability",
    "specsfy-specialist-performance-engineering",
    "specsfy-specialist-postgres",
    "specsfy-specialist-prototyping",
    "specsfy-specialist-react",
    "specsfy-specialist-react-ui-components",
    "specsfy-specialist-redis",
    "specsfy-specialist-rls-review",
    "specsfy-specialist-shadcn-ui",
    "specsfy-specialist-software-architecture",
    "specsfy-specialist-supabase",
    "specsfy-specialist-tailwind-css",
    "specsfy-specialist-technical-research",
    "specsfy-specialist-typescript",
    "specsfy-specialist-ui-design",
    "specsfy-specialist-ux-design",
    "specsfy-specialist-web-accessibility",
    "specsfy-specialist-web-api-design",
}
FORBIDDEN_ORIGINS = (
    "matt" + "pocock",
    "matt" + " pocock",
    "matt" + "-pocock",
    "ai" + "hero",
)


class SpecialistCatalogTests(unittest.TestCase):
    def test_catalog_has_the_complete_namespaced_set(self) -> None:
        catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
        names = {entry["name"] for entry in catalog["skills"]}
        self.assertEqual(EXPECTED_SKILLS, names)

        directories = {
            path.parent.name
            for path in ROOT.glob("*/SKILL.md")
            if path.parent.name.startswith("specsfy-")
        }
        self.assertEqual(EXPECTED_SKILLS, directories)

    def test_display_names_use_the_specialist_pattern(self) -> None:
        for name in sorted(EXPECTED_SKILLS):
            with self.subTest(skill=name):
                metadata = (ROOT / name / "agents/openai.yaml").read_text(encoding="utf-8")
                self.assertIn('display_name: "Specsfy - Especialista - ', metadata)

    def test_each_specialist_is_complete_and_self_consistent(self) -> None:
        for name in sorted(EXPECTED_SKILLS):
            with self.subTest(skill=name):
                skill = ROOT / name
                content = (skill / "SKILL.md").read_text(encoding="utf-8")
                metadata = (skill / "agents/openai.yaml").read_text(encoding="utf-8")
                references = skill / "references"

                match = re.search(r"^name:\s*(.+)$", content, re.MULTILINE)
                self.assertIsNotNone(match)
                self.assertEqual(name, match.group(1).strip())
                self.assertIn(f"${name}", metadata)
                for heading in (
                    "## Quando usar",
                    "## Fluxo",
                    "## Padrões",
                    "## Antipadrões",
                    "## Validação",
                    "## Skills relacionadas",
                ):
                    self.assertIn(heading, content)
                self.assertIn(
                    "[references/standards.md](references/standards.md)",
                    content,
                )
                self.assertTrue(references.is_dir())
                standards = references / "standards.md"
                self.assertTrue(standards.is_file())
                self.assertRegex(
                    standards.read_text(encoding="utf-8"),
                    r"https://",
                )

    def test_repository_publishes_the_specialist_authoring_standard(self) -> None:
        template = (ROOT / "templates/SKILL.template.md").read_text(
            encoding="utf-8"
        )
        guide = (ROOT / "templates/GUIDE.md").read_text(encoding="utf-8")

        for heading in (
            "## Quando usar",
            "## Fluxo",
            "## Padrões",
            "## Antipadrões",
            "## Validação",
            "## Skills relacionadas",
        ):
            self.assertIn(heading, template)
        self.assertIn("references/standards.md", template)
        self.assertIn("## Estrutura de `references/`", guide)
        self.assertIn("## Padrão de qualidade por seção", guide)

    def test_related_skill_boundaries_are_reciprocal(self) -> None:
        contents = {
            name: (ROOT / name / "SKILL.md").read_text(encoding="utf-8")
            for name in EXPECTED_SKILLS
        }

        for source, content in sorted(contents.items()):
            related = content.partition("## Skills relacionadas")[2]
            targets = set(
                re.findall(r"\$?(specsfy-specialist-[a-z0-9-]+)", related)
            )
            for target in sorted(targets & EXPECTED_SKILLS):
                with self.subTest(source=source, target=target):
                    self.assertIn(source, contents[target])

    def test_catalog_has_detection_and_installation_metadata(self) -> None:
        catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
        for entry in catalog["skills"]:
            with self.subTest(skill=entry.get("name")):
                self.assertTrue(entry["description"])
                self.assertTrue(entry["category"])
                self.assertTrue(entry["tags"])
                self.assertIn("detect", entry)
                self.assertIsInstance(entry["detect"]["files"], list)
                self.assertIsInstance(entry["detect"]["dependencies"], list)
                self.assertIsInstance(entry.get("requires", []), list)
                for required_name in entry.get("requires", []):
                    self.assertIn(required_name, EXPECTED_SKILLS)

    def test_react_ui_components_are_paired_with_ui_design(self) -> None:
        component_skill = ROOT / "specsfy-specialist-react-ui-components"
        component_content = (component_skill / "SKILL.md").read_text(encoding="utf-8")
        ui_content = (
            ROOT / "specsfy-specialist-ui-design" / "SKILL.md"
        ).read_text(encoding="utf-8")

        self.assertIn("$specsfy-specialist-ui-design", component_content)
        self.assertIn("$specsfy-specialist-react-ui-components", ui_content)
        catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
        component_entry = next(
            entry
            for entry in catalog["skills"]
            if entry["name"] == "specsfy-specialist-react-ui-components"
        )
        self.assertEqual(
            ["specsfy-specialist-ui-design"],
            component_entry["requires"],
        )

        component_files = list(
            (component_skill / "assets" / "components").glob("*/*.tsx")
        )
        self.assertEqual(231, len(component_files))
        self.assertEqual(
            {
                "actions-feedback",
                "data-display",
                "forms",
                "hero",
                "layout-navigation",
                "marketing-company",
                "marketing-content",
                "marketing-conversion",
                "marketing-features",
                "marketing-proof",
                "typography",
            },
            {path.parent.name for path in component_files},
        )

    def test_react_and_shadcn_identify_the_project_primitive_base(self) -> None:
        react = (ROOT / "specsfy-specialist-react" / "SKILL.md").read_text(
            encoding="utf-8"
        )
        shadcn = (ROOT / "specsfy-specialist-shadcn-ui" / "SKILL.md").read_text(
            encoding="utf-8"
        )
        primitives = (
            ROOT
            / "specsfy-specialist-shadcn-ui"
            / "references"
            / "primitives.md"
        )

        self.assertIn("$specsfy-specialist-shadcn-ui", react)
        self.assertIn("base de primitives", react.lower())
        self.assertIn("Base UI", shadcn)
        self.assertIn("Radix", shadcn)
        self.assertIn("[references/primitives.md](references/primitives.md)", shadcn)
        self.assertTrue(primitives.is_file())
        primitive_content = primitives.read_text(encoding="utf-8")
        for marker in (
            "@base-ui/react",
            "radix-ui",
            "@radix-ui/react-",
            "react-aria-components",
        ):
            self.assertIn(marker, primitive_content)
        self.assertIn("não comprova que o componente usa Base UI", primitive_content)

    def test_repository_contains_no_reference_to_the_audited_origin(self) -> None:
        for path in ROOT.rglob("*"):
            if not path.is_file() or ".git" in path.parts:
                continue
            try:
                content = path.read_text(encoding="utf-8").lower()
            except UnicodeDecodeError:
                continue
            with self.subTest(path=path.relative_to(ROOT)):
                for forbidden in FORBIDDEN_ORIGINS:
                    self.assertNotIn(forbidden, content)


if __name__ == "__main__":
    unittest.main()
