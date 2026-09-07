from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "specsfy-08-operational-audit" / "SKILL.md"
OPENAI = ROOT / "specsfy-08-operational-audit" / "agents/openai.yaml"


class OperationalAuditSkillTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.contract = SKILL.read_text(encoding="utf-8")
        cls.metadata = OPENAI.read_text(encoding="utf-8")

    def test_skill_declares_post_feature_scope_and_read_only_boundary(self) -> None:
        self.assertIn("name: specsfy-08-operational-audit", self.contract)
        self.assertIn("depois que a SPEC estiver concluída", self.contract)
        self.assertIn("não execute nenhuma ação operacional", self.contract.lower())
        self.assertIn("Passo 0 — delimitar o escopo da SPEC", self.contract)

    def test_skill_requires_causality_before_operational_debt(self) -> None:
        self.assertIn("Regra de causalidade", self.contract)
        self.assertIn("a SPEC criou ou alterou algo que exige essa ação", self.contract)
        self.assertIn("INCERTO — PROCESSO NÃO DOCUMENTADO", self.contract)
        self.assertIn("Não duplicar causas", self.contract)

    def test_skill_separates_global_debt_from_feature_debt(self) -> None:
        self.assertIn("PENDÊNCIAS GLOBAIS NÃO CRIADAS PELA SPEC", self.contract)
        self.assertIn("não entram na contagem da feature", self.contract)

    def test_skill_exposes_discovery_metadata(self) -> None:
        self.assertIn('display_name: "Specsfy - 08 - Auditoria operacional"', self.metadata)
        self.assertIn("$specsfy-08-operational-audit", self.metadata)


if __name__ == "__main__":
    unittest.main()
