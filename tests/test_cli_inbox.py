from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "cli" / "bin" / "specsfy"
CAPTURE = "2026-07-28-143205-avisar-clientes-sobre-atrasos.md"

CAPTURE_CONTENT = """# Inbox: Avisar clientes sobre atrasos

| Metadado | Valor |
| --- | --- |
| Status | Capturada |
| Capturada em | 2026-07-28T14:32:05Z |
| Slug | avisar-clientes-sobre-atrasos |
| Backlog derivado | Nenhum |
| Spec derivada | Nenhuma |

## Texto original

Quero avisar clientes quando uma entrega atrasar, talvez por e-mail.
"""


def write_spec(root: Path, folder: str, identifier: str, gate: str) -> Path:
    path = root / "specs" / folder / identifier / "spec.md"
    path.parent.mkdir(parents=True)
    path.write_text(
        "# Especificação: Avisos de atraso\n\n"
        "| Campo | Valor |\n| --- | --- |\n"
        "| Formato | Specsfy/2.0 |\n"
        f"| Status | {'Defined' if gate == 'Passed' else 'Draft'} |\n"
        f"| Definition Gate | {gate} |\n\n"
        f"Origem: specs/inbox/{CAPTURE}\n",
        encoding="utf-8",
    )
    return path


class CliInboxContractTests(unittest.TestCase):
    def test_processes_a_capture_covered_by_an_approved_spec(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "specs" / "inbox").mkdir(parents=True)
            (root / "specs" / "inbox" / CAPTURE).write_text(CAPTURE_CONTENT, encoding="utf-8")
            spec = write_spec(root, "defined", "0007-avisos-de-atraso", "Passed")

            result = subprocess.run(
                [
                    str(CLI), "inbox", "process", CAPTURE,
                    "--spec", "0007-avisos-de-atraso",
                    "--project", str(root), "--json",
                ],
                text=True,
                capture_output=True,
                check=True,
            )
            payload = json.loads(result.stdout)

            self.assertEqual("Processada", payload["status"])
            self.assertEqual(f"specs/inbox/processed/{CAPTURE}", payload["to"])
            self.assertEqual(["specs/defined/0007-avisos-de-atraso/spec.md"], payload["updated_references"])
            moved = root / "specs" / "inbox" / "processed" / CAPTURE
            self.assertTrue(moved.is_file())
            self.assertFalse((root / "specs" / "inbox" / CAPTURE).exists())
            content = moved.read_text(encoding="utf-8")
            self.assertIn("| Status | Processada |", content)
            self.assertIn("| Spec derivada | specs/defined/0007-avisos-de-atraso/spec.md |", content)
            self.assertIn("| Processada em | ", content)
            self.assertIn("Quero avisar clientes quando uma entrega atrasar", content)
            self.assertIn(f"specs/inbox/processed/{CAPTURE}", spec.read_text(encoding="utf-8"))

    def test_keeps_a_capture_active_when_the_definition_gate_is_pending(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "specs" / "inbox").mkdir(parents=True)
            (root / "specs" / "inbox" / CAPTURE).write_text(CAPTURE_CONTENT, encoding="utf-8")
            write_spec(root, "draft", "0007-avisos-de-atraso", "Pending")

            result = subprocess.run(
                [
                    str(CLI), "inbox", "process", CAPTURE,
                    "--spec", "0007-avisos-de-atraso",
                    "--project", str(root),
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(1, result.returncode)
            self.assertIn("Definition Gate", result.stderr)
            self.assertTrue((root / "specs" / "inbox" / CAPTURE).is_file())
            self.assertFalse((root / "specs" / "inbox" / "processed").exists())


if __name__ == "__main__":
    unittest.main()
