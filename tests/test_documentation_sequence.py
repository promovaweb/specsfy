from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
USER_ROOT = ROOT / "docs" / "user"
PEDAGOGICAL_ORDER = (
    "docs/user/README.md",
    "docs/user/method.md",
    "docs/user/method-reference.md",
    "docs/user/installation.md",
    "docs/user/getting-started.md",
    "docs/user/inbox.md",
    "docs/user/backlog.md",
    "docs/user/milestones.md",
    "docs/user/skills/README.md",
    "docs/user/skills/specsfy-01-inbox.md",
    "docs/user/skills/specsfy-02-backlog.md",
    "docs/user/skills/specsfy-03-specify.md",
    "docs/user/skills/specsfy-04-validate.md",
    "docs/user/skills/specsfy-05-tasks.md",
    "docs/user/skills/specsfy-06-tdd-bdd.md",
    "docs/user/skills/specsfy-07-implement.md",
    "docs/user/skills/specsfy-update-spec.md",
    "docs/user/skills/specsfy-progress.md",
    "docs/user/skills/specsfy-interviewer.md",
    "docs/user/skills/specsfy-mvp-milestone-interviewer.md",
    "docs/user/skills/specsfy-data-discovery.md",
    "docs/user/skills/specsfy-roadmap-milestone-interviewer.md",
    "docs/user/skills/specsfy-milestone-governor.md",
    "docs/user/cli.md",
    "docs/user/cli-reference.md",
    "docs/user/project-context.md",
    "docs/user/design-system.md",
    "docs/user/system-documentation.md",
    "docs/user/update-spec.md",
    "docs/user/specialists.md",
    "docs/user/deploy.md",
    "docs/user/advanced-usage.md",
    "docs/user/laravel.md",
    "docs/user/astro.md",
    "docs/user/nextjs.md",
    "docs/user/credits.md",
)


def reading_order() -> tuple[str, ...]:
    return tuple(
        line
        for line in (USER_ROOT / "reading-order.txt").read_text(
            encoding="utf-8"
        ).splitlines()
        if line and not line.startswith("#")
    )


class DocumentationSequenceTests(unittest.TestCase):
    def test_reading_order_is_complete_and_pedagogical(self) -> None:
        self.assertEqual(PEDAGOGICAL_ORDER, reading_order())
        markdown_pages = {
            path.relative_to(ROOT).as_posix()
            for path in USER_ROOT.rglob("*.md")
        }
        self.assertEqual(markdown_pages, set(reading_order()))

    def test_user_portal_teaches_the_same_sequence(self) -> None:
        portal = (USER_ROOT / "README.md").read_text(encoding="utf-8")
        stages = (
            "## Percurso pedagógico",
            "### 1. Entenda a metodologia",
            "### 2. Instale o Specsfy",
            "### 3. Faça a primeira entrega",
            "### 4. Aprofunde o fluxo base",
            "### 5. Opere o projeto no dia a dia",
            "### 6. Avance quando precisar",
        )
        positions = [portal.index(stage) for stage in stages]
        self.assertEqual(positions, sorted(positions))
        for relative in reading_order()[1:]:
            link = relative.removeprefix("docs/user/")
            self.assertIn(f"]({link})", portal)

    def test_ebook_consumes_the_user_owned_order(self) -> None:
        build_script = (ROOT / ".ebook" / "build-ebook.sh").read_text(
            encoding="utf-8"
        )
        makefile = (ROOT / "Makefile").read_text(encoding="utf-8")
        ebook_readme = (ROOT / "ebook" / "README.md").read_text(
            encoding="utf-8"
        )
        self.assertIn(
            'ORDER_FILE="$DOCS_ROOT/reading-order.txt"',
            build_script,
        )
        self.assertIn("docs/user/reading-order.txt", makefile)
        self.assertIn(
            "../docs/user/reading-order.txt",
            ebook_readme,
        )


if __name__ == "__main__":
    unittest.main()
