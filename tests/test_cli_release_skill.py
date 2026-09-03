from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "cli" / ".agents" / "skills" / "specsfy-release-cli"
SCRIPT = SKILL / "scripts" / "release_changelog.py"
CLAUDE_SKILL = ROOT / "cli" / ".claude" / "skills" / "specsfy-release-cli"


class CliReleaseSkillTests(unittest.TestCase):
    def make_cli_fixture(self, root: Path) -> Path:
        cli = root / "cli"
        (root / "VERSION").write_text("0.6.0\n", encoding="utf-8")
        (cli / "src").mkdir(parents=True)
        (cli / "package.json").write_text(
            json.dumps(
                {
                    "name": "@promovaweb/specsfy",
                    "version": "0.6.0",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        (cli / "src" / "version.ts").write_text(
            'export const VERSION = "0.6.0";\n',
            encoding="utf-8",
        )
        (cli / "CHANGELOG.md").write_text(
            "# Changelog\n\n"
            "Todas as mudanças relevantes do Specsfy CLI são registradas aqui.\n\n"
            "## [Unreleased]\n\n"
            "## [0.6.0] - 2026-07-01\n\n"
            "- Primeira versão registrada.\n",
            encoding="utf-8",
        )
        return cli

    def run_script(
        self,
        *arguments: str,
        cwd: Path | None = None,
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["python3", "-B", str(SCRIPT), *arguments],
            cwd=cwd or ROOT,
            text=True,
            capture_output=True,
            check=False,
        )

    def test_skill_pertence_ao_cli_e_nao_ao_framework(self) -> None:
        self.assertTrue((SKILL / "SKILL.md").is_file())
        self.assertTrue(CLAUDE_SKILL.is_symlink())
        self.assertEqual(SKILL.resolve(), CLAUDE_SKILL.resolve())
        self.assertFalse(
            (ROOT / ".agents" / "skills" / "specsfy-release-cli").exists()
        )
        self.assertFalse((ROOT / "skills" / "specsfy-release-cli").exists())

    def test_prepare_updates_versions_and_promotes_release_notes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cli = self.make_cli_fixture(root)
            notes = root / "notes.md"
            notes.write_text(
                "### Added\n\n- Publicação automatizada.\n\n"
                "### Fixed\n\n- Notas consistentes.\n",
                encoding="utf-8",
            )

            result = self.run_script(
                "prepare",
                "--cli",
                str(cli),
                "--version",
                "0.7.0",
                "--date",
                "2026-07-27",
                "--notes-file",
                str(notes),
            )

            self.assertEqual(0, result.returncode, result.stderr)
            self.assertEqual(
                "0.7.0",
                json.loads(
                    (cli / "package.json").read_text(encoding="utf-8")
                )["version"],
            )
            self.assertEqual(
                "0.7.0",
                (root / "VERSION").read_text(encoding="utf-8").strip(),
            )
            self.assertIn(
                'VERSION = "0.7.0"',
                (cli / "src" / "version.ts").read_text(encoding="utf-8"),
            )
            changelog = (cli / "CHANGELOG.md").read_text(encoding="utf-8")
            self.assertIn("## [Unreleased]\n\n## [0.7.0] - 2026-07-27", changelog)
            self.assertIn("### Added\n\n- Publicação automatizada.", changelog)

            extracted = root / "release-notes.md"
            extract_result = self.run_script(
                "extract",
                "--changelog",
                str(cli / "CHANGELOG.md"),
                "--version",
                "0.7.0",
                "--output",
                str(extracted),
            )
            self.assertEqual(0, extract_result.returncode, extract_result.stderr)
            self.assertEqual(
                notes.read_text(encoding="utf-8"),
                extracted.read_text(encoding="utf-8"),
            )

            release_json = root / "release.json"
            release_json.write_text(
                json.dumps({"body": extracted.read_text(encoding="utf-8")}),
                encoding="utf-8",
            )
            verify_result = self.run_script(
                "verify",
                "--changelog",
                str(cli / "CHANGELOG.md"),
                "--version",
                "0.7.0",
                "--release-json",
                str(release_json),
            )
            self.assertEqual(0, verify_result.returncode, verify_result.stderr)

            release_json.write_text(
                json.dumps({"body": "notas divergentes\n"}),
                encoding="utf-8",
            )
            mismatch_result = self.run_script(
                "verify",
                "--changelog",
                str(cli / "CHANGELOG.md"),
                "--version",
                "0.7.0",
                "--release-json",
                str(release_json),
            )
            self.assertNotEqual(0, mismatch_result.returncode)
            self.assertIn("diverge", mismatch_result.stderr)

    def test_prepare_rejects_non_increasing_or_unstable_versions(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cli = self.make_cli_fixture(root)
            notes = root / "notes.md"
            notes.write_text("- Mudança.\n", encoding="utf-8")

            for version in ("0.6.0", "0.5.9", "0.7.0-rc.1", "latest"):
                with self.subTest(version=version):
                    result = self.run_script(
                        "prepare",
                        "--cli",
                        str(cli),
                        "--version",
                        version,
                        "--date",
                        "2026-07-27",
                        "--notes-file",
                        str(notes),
                    )
                    self.assertNotEqual(0, result.returncode)

    def test_skill_contract_publishes_one_release_atomically_and_resumably(
        self,
    ) -> None:
        skill = (SKILL / "SKILL.md").read_text(encoding="utf-8")

        for evidence in (
            "git remote get-url origin",
            "git status --porcelain",
            "git fetch origin main --tags",
            "git rev-parse HEAD",
            "git rev-parse origin/main",
            "npm ci",
            "npm test",
            "npm run build:executable",
            "npm publish",
            "git tag -a",
            "git push --atomic origin main",
            "gh release create",
            "--notes-file",
            "gh release view",
            "release_changelog.py verify",
            "git ls-remote origin",
            "gh run list",
        ):
            self.assertIn(evidence, skill)

        self.assertIn("release_changelog.py extract", skill)
        self.assertIn("não recriar", skill)
        self.assertIn("cli/", skill)

    def test_workspace_and_cli_document_the_release_ownership(self) -> None:
        workspace_agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        workspace_readme = (ROOT / "README.md").read_text(encoding="utf-8")
        cli_agents = (ROOT / "cli" / "AGENTS.md").read_text(encoding="utf-8")
        cli_readme = (ROOT / "cli" / "README.md").read_text(encoding="utf-8")
        modules = (
            ROOT / "docs" / "develop" / "context" / "architecture" / "modules.md"
        ).read_text(encoding="utf-8")
        dependencies = (
            ROOT / "docs" / "develop" / "context" / "architecture" / "dependencies.md"
        ).read_text(encoding="utf-8")
        flow = (
            ROOT / "docs" / "develop" / "context" / "flows" / "cli-release.md"
        ).read_text(encoding="utf-8")

        for source in (workspace_agents, workspace_readme, modules):
            self.assertIn("specsfy-release-cli", source)
            self.assertIn("cli/.agents/skills/specsfy-release-cli", source)
        for source in (cli_agents, cli_readme, dependencies, flow):
            self.assertIn("CHANGELOG.md", source)
            self.assertIn("GitHub Release", source)
        self.assertTrue((ROOT / "cli" / "CHANGELOG.md").is_file())


if __name__ == "__main__":
    unittest.main()
