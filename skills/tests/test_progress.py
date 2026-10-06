from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PROGRESS = ROOT / "specsfy-progress" / "scripts" / "progress.mjs"


class ProgressTests(unittest.TestCase):
    def test_filters_a_spec_by_slug_with_platform_native_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for slug in ("0001-first", "0002-second"):
                spec = root / "specs" / "draft" / slug / "spec.md"
                spec.parent.mkdir(parents=True)
                spec.write_text(
                    "| Campo | Valor |\n"
                    "| --- | --- |\n"
                    "| Formato | Specsfy/2.0 |\n"
                    f"| Slug | {slug} |\n"
                    "| Status | Draft |\n"
                    "| Effort | 1 |\n"
                    "| Definition Gate | Pending |\n"
                    "| Plan Gate | Pending |\n"
                    "| Delivery Gate | Pending |\n",
                    encoding="utf-8",
                )

            completed = subprocess.run(
                [
                    "node",
                    str(PROGRESS),
                    str(root),
                    "--slug",
                    "0002-second",
                    "--json",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(
                0,
                completed.returncode,
                completed.stdout + completed.stderr,
            )
            report = json.loads(completed.stdout)
            self.assertEqual(
                ["0002-second"],
                [spec["slug"] for spec in report["specs"]],
            )


if __name__ == "__main__":
    unittest.main()
