from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VERIFY_EVIDENCE = ROOT / "specsfy-07-implement" / "scripts" / "verify_evidence.mjs"

SPEC = """# Especificação integrada: Exemplo

| Campo | Valor |
| --- | --- |
| Formato | Specsfy/2.0 |
| Status | Implementing |
| Definition Gate | Passed |
| Plan Gate | Passed |
| Delivery Gate | In Progress |
| Evidence Contract | 1 |

### 7. Requisitos

#### Funcionais

- **FR-001**: O sistema deve responder.

### 14. Tarefas

- [x] T001 [CODE] Implementar em src/servico.ts — Refs: FR-001 — Depends: none
  - [x] **PREP**: Confirmar escopo.
  - [x] **EXECUTE**: Implementar.
  - [x] **VERIFY**: Rodar teste focal.
  - [x] **EVIDENCE**: Registrar comando.
  - [x] **IMPROVE**: Nenhuma necessária.
  <!-- specsfy:evidence {"task":"T001","refs":["FR-001"],"files":["src/servico.ts"],"commands":[{"run":"npm test","exit":0}]} -->
"""


class EvidencePathTests(unittest.TestCase):
    """O arquivo citado na evidência vive dentro da raiz e precisa ser aceito.

    A checagem de contenção não pode depender do separador de caminho da
    plataforma: no Windows `resolve()` devolve `\\`, e comparar com `raiz + "/"`
    reprova todo arquivo válido como inseguro.
    """

    def run_verifier(self, root: Path, spec: Path) -> dict:
        result = subprocess.run(
            ["node", str(VERIFY_EVIDENCE), str(spec), str(root), "--json"],
            text=True,
            capture_output=True,
            check=False,
        )
        return json.loads(result.stdout) if result.stdout else {"errors": [result.stderr]}

    def test_accepts_file_inside_the_root(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "src").mkdir()
            (root / "src" / "servico.ts").write_text("export const servico = () => true;\n", encoding="utf-8")
            spec = root / "spec.md"
            spec.write_text(SPEC, encoding="utf-8")

            self.assertEqual(self.run_verifier(root, spec)["errors"], [])

    def test_rejects_file_outside_the_root(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "projeto"
            (root / "src").mkdir(parents=True)
            (root / "src" / "servico.ts").write_text("export const servico = () => true;\n", encoding="utf-8")
            spec = root / "spec.md"
            spec.write_text(SPEC.replace('"src/servico.ts"', '"../fora.ts"'), encoding="utf-8")
            (Path(temporary) / "fora.ts").write_text("export const fora = true;\n", encoding="utf-8")

            errors = self.run_verifier(root, spec)["errors"]
            self.assertTrue(any("inseguro" in message for message in errors), errors)


if __name__ == "__main__":
    unittest.main()
