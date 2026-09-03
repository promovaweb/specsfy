from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VALIDATE_SPEC = ROOT / "specsfy-04-validate" / "scripts" / "validate_spec.mjs"
VALIDATE_INTERFACE_TASKS = ROOT / "specsfy-05-tasks" / "scripts" / "validate_interface_tasks.mjs"
INSPECT_INTERFACE = ROOT / "specsfy-setup" / "scripts" / "inspect_interface.mjs"
INSPECT_PROJECT = ROOT / "specsfy-setup" / "scripts" / "inspect_project.mjs"


class InterfaceContractTests(unittest.TestCase):
    def validate(self, text: str) -> list[str]:
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(text, encoding="utf-8")
            completed = subprocess.run(
                ["node", str(VALIDATE_SPEC), str(spec), "--allow-draft", "--json"],
                text=True,
                capture_output=True,
                check=False,
            )
            return json.loads(completed.stdout)["errors"]

    def interface(self, content: str) -> str:
        return (
            "| Interface para pessoas | Sim |\n\n"
            "### 10. Interfaces e contratos\n\n"
            "#### Interface para pessoas\n\n"
            "- Há uma interface para pessoas.\n\n"
            + content
        )

    def test_rejects_interface_without_all_required_parts(self) -> None:
        errors = self.validate(
            self.interface("#### Telas e responsabilidades\n\n- Cadastro de clientes.\n")
        )

        self.assertIn(
            "Interface para pessoas: heading obrigatório ausente: Stack e convenções de interface.",
            errors,
        )
        self.assertIn(
            "Interface para pessoas: heading obrigatório ausente: Fluxo de informação e navegação.",
            errors,
        )
        self.assertIn(
            "Interface para pessoas: heading obrigatório ausente: Formulários e ações.",
            errors,
        )

    def test_allows_interface_to_remain_open_while_the_spec_is_draft(self) -> None:
        errors = self.validate("| Status | Draft |\n| Interface para pessoas | A definir |\n")

        self.assertNotIn("Interface para pessoas deve começar com Sim, Não ou Nao.", errors)

        errors = self.validate(
            "| Status | Draft |\n| Interface para pessoas | Pendente: o MVP não informa. |\n"
        )
        self.assertNotIn("Interface para pessoas deve começar com Sim, Não ou Nao.", errors)

    def test_accepts_a_complete_interface_description(self) -> None:
        content = """#### Telas e responsabilidades

- Lista de clientes permite localizar e iniciar cadastro.

#### Stack e convenções de interface

- React, Tailwind e os componentes existentes em src/components seguem package.json.

#### Fluxo de informação e navegação

- A lista abre o cadastro, salva e retorna com o novo cliente visível.

#### Menus e navegação principal

- O menu principal tem os itens Clientes, com destino para /clientes, e Novo cliente, com destino para o painel de cadastro.

#### Formulários e ações

- Nome e e-mail são campos obrigatórios; o cadastro abre em painel lateral.

#### Composição e disposição

- Filtros ficam acima da tabela e a ação principal fica no cabeçalho.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Componente ou composição | Origem |
| --- | --- | --- | --- |
| Lista de clientes | ClientList | Data Grid | ReUI |

#### Estados e acessibilidade

- Há loading, vazio, erro, sucesso, foco inicial e navegação por teclado.

#### Revisão visual durante o desenvolvimento

- A conferência durante o desenvolvimento verifica bordas, espaçamentos,
  margens, padding e tipografia nos estados e viewports relevantes.
"""

        errors = self.validate(self.interface(content))

        self.assertFalse(
            [error for error in errors if error.startswith("Interface para pessoas:")],
            errors,
        )

    def test_requires_visual_and_crud_contracts_when_datagrid_is_declared(self) -> None:
        content = """#### Telas e responsabilidades

- A tela de CRUD lista registros.

#### Stack e convenções de interface

- React e componentes existentes.

#### Fluxo de informação e navegação

- A lista leva ao detalhe.

#### Menus e navegação principal

- O menu tem o item Registros, com destino para /registros.

#### Formulários e ações

- O formulário valida os campos.

#### Composição e disposição

- O DataGrid ocupa a área principal.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Componente ou composição | Origem |
| --- | --- | --- | --- |
| Lista | RecordList | DataGrid | local |

#### Estados e acessibilidade

- Há loading, vazio, erro e teclado.

#### Revisão visual durante o desenvolvimento

- A revisão confere bordas.

#### Contrato CRUD

- O PageHeader reutilizado mostra ID e permite editar.
"""

        errors = self.validate(self.interface(content))

        self.assertIn(
            "Interface para pessoas: Revisão visual durante o desenvolvimento precisa conferir bordas, espaçamentos, margens, padding e tipografia.",
            errors,
        )
        self.assertIn(
            "Interface para pessoas: Contrato CRUD precisa declarar PageHeader, DataGrid, ID, editar e apagar.",
            errors,
        )

    def test_rejects_interface_without_menu_mapping(self) -> None:
        content = """#### Interface para pessoas

- Há uma interface para pessoas.

#### Stack e convenções de interface

- React e componentes existentes.

#### Telas e responsabilidades

- Lista de clientes.

#### Fluxo de informação e navegação

- A lista leva ao cadastro.

#### Formulários e ações

- O cadastro valida nome.

#### Composição e disposição

- A tabela fica acima das ações.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Componente ou composição | Origem |
| --- | --- | --- | --- |
| Lista | ClientList | Data Grid | ReUI |

#### Estados e acessibilidade

- Loading, vazio, erro e teclado.
"""

        errors = self.validate(self.interface(content))

        self.assertIn(
            "Interface para pessoas: heading obrigatório ausente: Menus e navegação principal.",
            errors,
        )

    def test_accepts_explicit_direct_navigation_without_menu(self) -> None:
        content = """#### Interface para pessoas

- Há uma interface para pessoas.

#### Stack e convenções de interface

- React e componentes existentes.

#### Telas e responsabilidades

- A tela inicial permite consultar o resultado.

#### Fluxo de informação e navegação

- Não há menu; a pessoa chega à tela por uma rota direta e segue pelos links contextuais.

#### Menus e navegação principal

- Não há menu principal; a rota direta e os links de tela são suficientes para a navegação.

#### Formulários e ações

- Não há formulário.

#### Composição e disposição

- O conteúdo ocupa a área principal.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Componente ou composição | Origem |
| --- | --- | --- | --- |
| Inicial | Result | Card | Próprio |

#### Estados e acessibilidade

- Loading, vazio, erro e teclado.
"""

        errors = self.validate(self.interface(content))

        self.assertNotIn(
            "Interface para pessoas: Menus e navegação principal precisa mapear menus, itens e destinos, ou declarar por que não há menu.",
            errors,
        )

    def test_core_skills_require_interface_discovery_and_delivery(self) -> None:
        sources = {
            name: (ROOT / name / "SKILL.md").read_text(encoding="utf-8")
            for name in (
                "specsfy-02-backlog",
                "specsfy-03-specify",
                "specsfy-04-validate",
                "specsfy-05-tasks",
                "specsfy-07-implement",
            )
        }

        self.assertIn("telas, fluxo de informação", sources["specsfy-02-backlog"])
        self.assertIn("menus e navegação principal", sources["specsfy-02-backlog"])
        self.assertIn("stack e as telas existentes", sources["specsfy-02-backlog"])
        self.assertIn("Interface para pessoas: Sim", sources["specsfy-03-specify"])
        self.assertIn("menus e navegação principal", sources["specsfy-03-specify"])
        self.assertIn("telas, menus e navegação principal", sources["specsfy-05-tasks"])
        self.assertIn("menus e navegação principal", sources["specsfy-05-tasks"])
        self.assertIn("menus e navegação principal", sources["specsfy-04-validate"])
        self.assertIn("menus e navegação principal", sources["specsfy-07-implement"])
        self.assertIn("CRUD somente como API", sources["specsfy-07-implement"])

    def test_screen_work_requires_the_ui_component_specialist(self) -> None:
        tasks = (ROOT / "specsfy-05-tasks" / "SKILL.md").read_text(encoding="utf-8")
        implement = (ROOT / "specsfy-07-implement" / "SKILL.md").read_text(encoding="utf-8")
        task_template = (ROOT / "templates" / "Tasks.md").read_text(encoding="utf-8")
        interface_experience = (
            ROOT.parent
            / "specialists"
            / "specsfy-specialist-interface-experience"
            / "SKILL.md"
        ).read_text(encoding="utf-8")

        specialist = "$specsfy-specialist-react-ui-components"
        self.assertIn(specialist, tasks)
        self.assertIn(specialist, implement)
        self.assertIn(specialist, task_template)
        self.assertIn(specialist, interface_experience)
        self.assertIn("antes de escrever JSX ou TSX", implement)
        self.assertIn("não implemente a tela", implement)

    def test_requires_an_interface_phase_when_the_spec_declares_screens(self) -> None:
        base = """| Interface para pessoas | Sim |

### 10. Interfaces e contratos

#### Telas e responsabilidades

- Lista de clientes.

#### Blocos React e componentes selecionados

| Tela | Bloco React | Componente ou composição | Origem |
| --- | --- | --- | --- |
| Lista de clientes | ClientList | Data Grid | ReUI |

### 14. Tarefas

#### Fase de interface

- [ ] T001 [CODE] Criar a lista em src/clients/List.tsx e atualizar INTERFACE.md — Refs: FR-001 — Depends: none

### 15. Ordem de execução
"""
        with tempfile.TemporaryDirectory() as temporary:
            spec = Path(temporary) / "spec.md"
            spec.write_text(base, encoding="utf-8")
            complete = subprocess.run(["node", str(VALIDATE_INTERFACE_TASKS), str(spec)], text=True, capture_output=True, check=False)
            self.assertEqual(0, complete.returncode, complete.stderr)

            spec.write_text(base.replace("#### Fase de interface\n\n- [ ] T001 [CODE] Criar a lista em src/clients/List.tsx e atualizar INTERFACE.md — Refs: FR-001 — Depends: none\n\n", ""), encoding="utf-8")
            incomplete = subprocess.run(["node", str(VALIDATE_INTERFACE_TASKS), str(spec)], text=True, capture_output=True, check=False)
            self.assertEqual(1, incomplete.returncode)
            self.assertIn("Fase de interface", incomplete.stderr)

    def test_inspects_the_existing_interface_stack_before_discovery(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            (project / "package.json").write_text(
                '{"dependencies":{"next":"1","react":"1","tailwindcss":"1","react-hook-form":"1"}}',
                encoding="utf-8",
            )
            (project / "components.json").write_text("{}", encoding="utf-8")
            (project / "src/app/clientes").mkdir(parents=True)
            (project / "src/components").mkdir(parents=True)
            (project / "src/app/clientes/page.tsx").write_text("export default function Page() {}", encoding="utf-8")
            (project / "src/components/ClientForm.tsx").write_text("export function ClientForm() {}", encoding="utf-8")

            complete = subprocess.run(["node", str(INSPECT_INTERFACE), "--project", str(project)], text=True, capture_output=True, check=False)

            self.assertEqual(0, complete.returncode, complete.stderr)
            report = json.loads(complete.stdout)
            self.assertIn("next", report["frameworks"])
            self.assertIn("tailwindcss", report["styling"])
            self.assertIn("shadcn/ui", report["components"])
            self.assertIn("src/app/clientes/page.tsx", report["current_routes"])
            self.assertIn("src/components/ClientForm.tsx", report["current_components"])

    def test_setup_maps_all_relevant_sources_before_discovery(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            project = Path(temporary)
            (project / "src/app").mkdir(parents=True)
            (project / "database/migrations").mkdir(parents=True)
            (project / "tests").mkdir()
            (project / "docs").mkdir()
            (project / "AGENTS.md").write_text("# Instruções\n", encoding="utf-8")
            (project / "package.json").write_text('{"dependencies":{"react":"1"}}', encoding="utf-8")
            (project / "src/app/page.tsx").write_text("export default function Page() {}", encoding="utf-8")
            (project / "database/migrations/001.sql").write_text("create table clientes ();", encoding="utf-8")
            (project / "tests/clientes.test.ts").write_text("test('clientes', () => {});", encoding="utf-8")
            (project / "docs/arquitetura.md").write_text("# Arquitetura\n", encoding="utf-8")

            complete = subprocess.run(["node", str(INSPECT_PROJECT), "--project", str(project)], text=True, capture_output=True, check=False)

            self.assertEqual(0, complete.returncode, complete.stderr)
            report = json.loads(complete.stdout)
            self.assertIn("AGENTS.md", report["source_groups"]["instructions"])
            self.assertIn("src/app/page.tsx", report["source_groups"]["application"])
            self.assertIn("database/migrations/001.sql", report["source_groups"]["persistence"])
            self.assertIn("tests/clientes.test.ts", report["source_groups"]["tests"])
            self.assertIn("docs/arquitetura.md", report["source_groups"]["documentation"])

    def test_setup_installs_only_specialists_detected_from_stack(self) -> None:
        setup = (ROOT / "specsfy-setup" / "SKILL.md").read_text(encoding="utf-8")

        self.assertIn("specsfy skills detect --project <raiz>", setup)
        self.assertIn("npx skills add https://github.com/promovaweb/specsfy", setup)
        self.assertIn("specsfy-specialist-data-modeling", setup)
        self.assertIn("specsfy-specialist-domain-modeling", setup)
        self.assertIn("specsfy-specialist-software-architecture", setup)
        self.assertIn("specsfy-specialist-react-ui-components", setup)
        self.assertIn("specsfy-specialist-reui", setup)
        self.assertIn("## Stack e especialistas instalados pelo setup", setup)

    def test_setup_discovers_crud_menus_and_rebuilds_system_documentation(self) -> None:
        setup = (ROOT / "specsfy-setup" / "SKILL.md").read_text(encoding="utf-8")
        normalized = " ".join(setup.split())

        self.assertIn("## Cobertura funcional obrigatória no setup", setup)
        self.assertIn("criar, consultar, editar e apagar", normalized)
        self.assertIn("menus do sistema", normalized)
        self.assertIn("confirme com a pessoa", normalized)
        self.assertIn("todo o sistema existente", normalized)
        self.assertIn("em toda execução completa do setup", normalized.casefold())
        self.assertIn("$specsfy-documentator", normalized)

    def test_laravel_projects_require_octane_as_the_application_server(self) -> None:
        sources = (
            ROOT / "Spec.md",
            ROOT / "templates" / "Spec.md",
            ROOT / "specsfy-setup" / "SKILL.md",
            ROOT.parent / "specialists" / "specsfy-specialist-laravel" / "SKILL.md",
        )

        for source in sources:
            with self.subTest(source=source):
                content = source.read_text(encoding="utf-8")
                self.assertIn("Laravel Octane", content)
                self.assertIn("obrigatório", content)
                self.assertIn("laravel/octane", content)
                self.assertIn("Open Swoole", content)

    def test_reui_specialist_documents_free_registry_setup(self) -> None:
        reui = (ROOT.parent / "specialists" / "specsfy-specialist-reui" / "SKILL.md").read_text(encoding="utf-8")
        setup = (ROOT.parent / "specialists" / "specsfy-specialist-reui" / "references" / "setup.md").read_text(encoding="utf-8")

        self.assertIn("componentes gratuitos", reui)
        self.assertIn("references/setup.md", reui)
        self.assertIn("npx shadcn@latest add", setup)
        self.assertIn("Laravel", setup)
        self.assertIn("@reui", setup)
        self.assertIn("starter kit React oficial", setup)
        self.assertIn("Form Requests", setup)

    def test_reui_is_the_crud_base_for_compatible_interfaces(self) -> None:
        reui = (ROOT.parent / "specialists" / "specsfy-specialist-reui" / "SKILL.md").read_text(encoding="utf-8")
        catalog = (ROOT.parent / "specialists" / "specsfy-specialist-reui" / "references" / "catalog-free.md").read_text(encoding="utf-8")

        self.assertIn("Todo CRUD com interface React e Tailwind usa ReUI", reui)
        self.assertIn("## Mapa obrigatório para CRUDs", catalog)
        self.assertIn("Data Grid", catalog)
        self.assertIn("Filters", catalog)
        families = (ROOT.parent / "specialists" / "specsfy-specialist-reui" / "references" / "components-free.md").read_text(encoding="utf-8")
        self.assertIn("# Componentes gratuitos ReUI", families)
        self.assertIn("Comércio", families)
        self.assertIn("Planejamento", families)


if __name__ == "__main__":
    unittest.main()
