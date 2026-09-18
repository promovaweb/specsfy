from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "specsfy-04-validate/scripts/verify_repo.mjs"
BASE_SKILLS = (
    "specsfy-01-inbox",
    "specsfy-02-backlog",
    "specsfy-03-specify",
    "specsfy-04-validate",
    "specsfy-05-tasks",
    "specsfy-06-tdd-bdd",
    "specsfy-07-implement",
    "specsfy-update-spec",
    "specsfy-progress",
    "specsfy-interviewer",
    "specsfy-mvp-milestone-interviewer",
    "specsfy-roadmap-milestone-interviewer",
    "specsfy-milestone-governor",
    "specsfy-data-discovery",
)
class VerifyRepositoryTests(unittest.TestCase):
    def create_skill(self, root: Path, name: str) -> None:
        skill = root / ".agents" / "skills" / name
        (skill / "agents").mkdir(parents=True)
        (skill / "SKILL.md").write_text(
            f"---\nname: {name}\ndescription: Skill de teste.\n---\n",
            encoding="utf-8",
        )
        (skill / "agents/openai.yaml").write_text(
            "interface:\n  display_name: Test\n",
            encoding="utf-8",
        )

    def test_skill_check_accepts_base_catalog_with_specialists(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in BASE_SKILLS:
                self.create_skill(root, name)
            for number in range(2):
                self.create_skill(root, f"specsfy-specialist-example-{number}")
            self.create_skill(root, "specsfy-setup")
            self.create_skill(root, "specsfy-documentator")
            for name in ("stack", "rules", "database"):
                self.create_skill(root, f"specsfy-aux-{name}")

            completed = subprocess.run(["node", str(SCRIPT), str(root), "--json"], text=True, capture_output=True, check=False)
            result = json.loads(completed.stdout)["checks"][0]

            self.assertEqual("passed", result["status"])
            self.assertEqual("21 skills válidas", result["detail"])

    def test_skill_check_accepts_source_checkout_catalog(self) -> None:
        completed = subprocess.run(["node", str(SCRIPT), str(ROOT), "--json"], text=True, capture_output=True, check=False)
        result = json.loads(completed.stdout)["checks"][-1]

        self.assertEqual("passed", result["status"])
        self.assertIn("skills válidas", result["detail"])

    def test_uses_node_for_all_internal_validators(self) -> None:
        source = SCRIPT.read_text(encoding="utf-8")
        self.assertIn('["node", scripts.validate, spec, ...', source)
        self.assertNotIn('python3', source.lower())

    def test_draft_spec_uses_non_strict_validation(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in BASE_SKILLS:
                self.create_skill(root, name)
            self.create_skill(root, "specsfy-setup")
            self.create_skill(root, "specsfy-documentator")
            for name in ("stack", "rules", "database"):
                self.create_skill(root, f"specsfy-aux-{name}")

            validator = (
                root
                / ".agents/skills/specsfy-04-validate/scripts/validate_spec.mjs"
            )
            validator.parent.mkdir(parents=True, exist_ok=True)
            validator.write_text(
                'process.exit(process.argv.includes("--allow-draft") ? 0 : 7);\n',
                encoding="utf-8",
            )
            spec = root / "specs/draft/0042-example/spec.md"
            spec.parent.mkdir(parents=True)
            spec.write_text("| Status | Draft |\n", encoding="utf-8")

            completed = subprocess.run(
                ["node", str(SCRIPT), str(root), "--json"],
                text=True,
                capture_output=True,
                check=False,
            )
            payload = json.loads(completed.stdout)
            validation = next(
                check for check in payload["checks"] if check["name"].startswith("spec:")
            )

            self.assertEqual("passed", validation["status"])
            self.assertIn("--allow-draft", validation["command"])


if __name__ == "__main__":
    unittest.main()
