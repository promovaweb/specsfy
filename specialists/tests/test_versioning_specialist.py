"""Comportamento executável do especialista de versionamento."""

from __future__ import annotations

import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "specsfy-specialist-versioning" / "scripts" / "semver.mjs"


class VersioningSpecialistTests(unittest.TestCase):
    def run_script(self, project: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["node", str(SCRIPT), *arguments, "--project", str(project)],
            text=True,
            capture_output=True,
            check=False,
        )

    def test_initializes_and_reads_the_root_semver_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            initialized = self.run_script(project, "init", "--initial", "1.2.3")
            current = self.run_script(project, "current")

            self.assertEqual(0, initialized.returncode, initialized.stderr)
            self.assertEqual("1.2.3\n", (project / "SEMVER").read_text())
            self.assertEqual("1.2.3", current.stdout.strip())

    def test_bumps_patch_minor_and_major_in_sequence(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "SEMVER").write_text("1.2.3\n", encoding="utf-8")

            for level, expected in (("patch", "1.2.4"), ("minor", "1.3.0"), ("major", "2.0.0")):
                result = self.run_script(project, "bump", level)
                self.assertEqual(0, result.returncode, result.stderr)
                self.assertEqual(expected, result.stdout.strip())

            self.assertEqual("2.0.0\n", (project / "SEMVER").read_text())

    def test_rejects_invalid_versions_without_changing_the_file(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            semver = project / "SEMVER"
            semver.write_text("latest\n", encoding="utf-8")

            result = self.run_script(project, "bump", "patch")

            self.assertNotEqual(0, result.returncode)
            self.assertEqual("latest\n", semver.read_text(encoding="utf-8"))

    def test_verifies_an_expected_version(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "SEMVER").write_text("3.4.5\n", encoding="utf-8")

            accepted = self.run_script(project, "verify", "3.4.5")
            refused = self.run_script(project, "verify", "3.4.4")

            self.assertEqual(0, accepted.returncode, accepted.stderr)
            self.assertNotEqual(0, refused.returncode)


if __name__ == "__main__":
    unittest.main()
