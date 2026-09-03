from __future__ import annotations

import hashlib
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SETUP = ROOT / "specsfy-setup" / "scripts" / "setup_context.mjs"
STACK = ROOT / "specsfy-aux-stack" / "scripts" / "update_stack.mjs"
RULES = ROOT / "specsfy-aux-rules" / "scripts" / "add_rule.mjs"
DATABASE = ROOT / "specsfy-aux-database" / "scripts" / "update_database.mjs"
DATA_DISCOVERY = ROOT / "specsfy-data-discovery" / "scripts" / "registrar_dados_conversados.mjs"
MONITOR = ROOT / "specsfy-setup" / "scripts" / "monitor_context.mjs"


def run_script(script: Path, *arguments: str) -> subprocess.CompletedProcess[str]:
    command = ["node", str(script)] if script.suffix == ".mjs" else ["python3", "-B", str(script)]
    return subprocess.run(
        [*command, *arguments],
        text=True,
        capture_output=True,
        check=False,
    )


class AuxiliaryContextTests(unittest.TestCase):
    def test_routes_data_discovery_from_product_entry_points(self) -> None:
        entry_points = (
            ROOT / "specsfy-01-inbox" / "SKILL.md",
            ROOT / "specsfy-02-backlog" / "SKILL.md",
            ROOT / "specsfy-mvp-milestone-interviewer" / "SKILL.md",
            ROOT / "specsfy-03-specify" / "SKILL.md",
        )

        for entry_point in entry_points:
            with self.subTest(entry_point=entry_point.parent.name):
                content = entry_point.read_text(encoding="utf-8")
                self.assertIn("$specsfy-data-discovery", content)
                self.assertIn("DATABASE.md", content)

    def test_records_confirmed_data_in_plain_language_without_touching_inventory(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            database = project / ".specsfy" / "DATABASE.md"
            database.parent.mkdir()
            database.write_text(
                "# Banco de dados\n\n## Inventário detectado\n\nFonte do código.\n",
                encoding="utf-8",
            )

            result = run_script(
                DATA_DISCOVERY,
                "--project",
                str(project),
                "--nome",
                "Pedido",
                "--para-que-serve",
                "Acompanhar o que cada cliente pediu.",
                "--o-que-guardar",
                "cliente, itens escolhidos, endereço de entrega e situação",
                "--formato-sugerido",
                "escolha entre opções para a situação e texto livre para observações",
                "--ligacoes",
                "Um pedido pertence a um cliente.",
                "--acesso",
                "A equipe de atendimento consulta; o cliente vê somente os próprios pedidos.",
                "--ciclo-de-vida",
                "Manter enquanto houver atendimento e apagar conforme a regra aprovada.",
                "--fontes",
                "specs/inbox/2026-08-20-120000-pedidos.md",
            )

            self.assertEqual(0, result.returncode, result.stderr)
            content = database.read_text(encoding="utf-8")
            self.assertIn("## Informações a guardar confirmadas", content)
            self.assertIn("| Informação | Para que serve | O que guardar | Formato sugerido |", content)
            self.assertIn("Pedido", content)
            self.assertIn("cliente, itens escolhidos", content)
            self.assertIn("escolha entre opções para a situação", content)
            self.assertIn("Fonte do código.", content)

    def test_setup_renders_all_context_files_from_central_templates(self) -> None:
        setup = SETUP.read_text(encoding="utf-8")
        for name in (
            "Project.md",
            "Stack.md",
            "Rules.md",
            "Database.md",
            "UserProfile.md",
        ):
            with self.subTest(template=name):
                self.assertTrue((ROOT / "templates" / name).is_file())
                self.assertIn(f'join(project, ".specsfy", "templates", name)', setup)

    def test_setup_creates_and_preserves_user_profile(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)

            first = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, first.returncode, first.stderr)
            profile = project / ".specsfy/USER-PROFILE.md"
            self.assertTrue(profile.is_file())
            profile.write_text(
                profile.read_text(encoding="utf-8").replace(
                    "| Nível atual | A confirmar |",
                    "| Nível atual | experiente |",
                ),
                encoding="utf-8",
            )
            before = profile.read_text(encoding="utf-8")

            second = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, second.returncode, second.stderr)
            self.assertEqual(before, profile.read_text(encoding="utf-8"))

    def test_setup_keeps_the_user_selected_subdirectory_as_project_root(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            hub = Path(directory)
            project = hub / "apps" / "portal"
            project.mkdir(parents=True)

            result = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, result.returncode, result.stderr)
            self.assertTrue((project / "PROJECT.md").is_file())
            self.assertTrue((project / ".specsfy" / "STACK.md").is_file())
            for deploy_path in (
                "SEMVER",
                "Dockerfile",
                "compose.yaml",
                "stack.yaml",
                "deploy",
                "ansible",
            ):
                self.assertFalse((project / deploy_path).exists(), deploy_path)
            self.assertFalse((hub / "PROJECT.md").exists())
            self.assertFalse((hub / "specs").exists())
            snapshot = {
                path.relative_to(project): path.read_bytes()
                for path in project.rglob("*")
                if path.is_file()
            }
            repeated = run_script(SETUP, "--project", str(project))
            self.assertEqual(0, repeated.returncode, repeated.stderr)
            self.assertEqual("", repeated.stdout)
            self.assertEqual(
                snapshot,
                {
                    path.relative_to(project): path.read_bytes()
                    for path in project.rglob("*")
                    if path.is_file()
                },
            )
            agents = (project / "AGENTS.md").read_text(encoding="utf-8")
            normalized = " ".join(agents.casefold().split())
            self.assertIn("diretório do projeto", normalized)
            self.assertIn("não promova", normalized)

    def test_monitor_requires_stack_and_database_docs_in_same_change(self) -> None:
        paths = [
            "package.json",
            "database/migrations/2026_07_27_create_orders.php",
        ]
        result = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--paths",
            *paths,
        )
        self.assertEqual(1, result.returncode)
        self.assertIn(".specsfy/STACK.md", result.stdout)
        self.assertIn(".specsfy/DATABASE.md", result.stdout)
        self.assertIn(".specsfy/PACKAGES.md", result.stdout)

        documented = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--paths",
            *paths,
            ".specsfy/STACK.md",
            ".specsfy/DATABASE.md",
            ".specsfy/PACKAGES.md",
            "docs/database.md",
        )
        self.assertEqual(0, documented.returncode, documented.stdout)

    def test_monitor_requires_package_inventory_for_manifest_changes(self) -> None:
        pending = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--json",
            "--paths",
            "package.json",
            ".specsfy/STACK.md",
        )

        self.assertEqual(1, pending.returncode)
        self.assertIn('"document": ".specsfy/PACKAGES.md"', pending.stdout)
        self.assertIn('"skill": "specsfy-documentator"', pending.stdout)

        current = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--paths",
            "package.json",
            ".specsfy/STACK.md",
            ".specsfy/PACKAGES.md",
            "docs/packages.md",
        )
        self.assertEqual(0, current.returncode, current.stdout)

    def test_monitor_requires_project_review_for_application_changes(self) -> None:
        pending = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--json",
            "--paths",
            "app/Http/Controllers/OrdersController.php",
        )
        self.assertEqual(1, pending.returncode)
        self.assertIn('"project_review_required": true', pending.stdout)

        acknowledged = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--acknowledge-project-no-change",
            "--paths",
            "app/Http/Controllers/OrdersController.php",
            "docs/application.md",
        )
        self.assertEqual(0, acknowledged.returncode, acknowledged.stdout)

    def test_monitor_reads_changed_and_untracked_paths_from_git(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            initialized = subprocess.run(
                ["git", "init", "--quiet"],
                cwd=project,
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(0, initialized.returncode, initialized.stderr)
            (project / "package.json").write_text("{}", encoding="utf-8")

            pending = run_script(
                MONITOR,
                "--project",
                str(project),
                "--check",
            )
            self.assertEqual(1, pending.returncode)
            self.assertIn(".specsfy/STACK.md", pending.stdout)

            stack = project / ".specsfy" / "STACK.md"
            stack.parent.mkdir()
            stack.write_text("# Stack\n", encoding="utf-8")
            (project / ".specsfy" / "PACKAGES.md").write_text(
                "# Pacotes\n",
                encoding="utf-8",
            )
            docs = project / "docs"
            docs.mkdir()
            (docs / "packages.md").write_text("# Pacotes\n", encoding="utf-8")
            current = run_script(
                MONITOR,
                "--project",
                str(project),
                "--check",
            )
            self.assertEqual(0, current.returncode, current.stdout)

    def test_monitor_recognizes_next_astro_and_generic_data_paths(self) -> None:
        result = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--json",
            "--paths",
            "src/pages/index.astro",
            "src/db/schema.ts",
            "lib/orders.ts",
        )
        self.assertEqual(1, result.returncode)
        self.assertIn('"project_review_required": true', result.stdout)
        self.assertIn(".specsfy/DATABASE.md", result.stdout)
        self.assertIn("specsfy-documentator", result.stdout)

    def test_monitor_requires_system_docs_for_application_and_database(self) -> None:
        pending = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--json",
            "--acknowledge-project-no-change",
            "--paths",
            "app/Models/Order.php",
            ".specsfy/DATABASE.md",
        )
        self.assertEqual(1, pending.returncode)
        self.assertIn('"documentation_review_required": true', pending.stdout)
        self.assertIn('"skill": "specsfy-documentator"', pending.stdout)

        current = run_script(
            MONITOR,
            "--project",
            "/tmp/project",
            "--check",
            "--acknowledge-project-no-change",
            "--paths",
            "app/Models/Order.php",
            ".specsfy/DATABASE.md",
            "docs/application.md",
            "docs/database.md",
        )
        self.assertEqual(0, current.returncode, current.stdout)

    def test_delivery_skill_enforces_context_monitor_handoffs(self) -> None:
        workflow_skills = (
            ROOT / "specsfy-05-tasks" / "SKILL.md",
            ROOT / "specsfy-07-implement" / "SKILL.md",
            ROOT / "specsfy-progress" / "SKILL.md",
        )
        framework = (ROOT / "Spec.md").read_text(encoding="utf-8")
        for path in workflow_skills:
            self.assertIn("monitor_context.mjs", path.read_text(encoding="utf-8"))
        for text in (
            workflow_skills[1].read_text(encoding="utf-8"),
            framework,
        ):
            self.assertIn("monitor_context.mjs", text)
            self.assertIn("$specsfy-aux-stack", text)
            self.assertIn("$specsfy-aux-database", text)

    def test_setup_creates_stack_aware_context_and_is_idempotent(self) -> None:
        fixtures = {
            "laravel": (
                "composer.json",
                '{"require":{"laravel/framework":"^12.0"}}',
                "Laravel",
                "database/migrations",
            ),
            "next": (
                "package.json",
                '{"dependencies":{"next":"^16.0","react":"^19.0"}}',
                "Next.js",
                "Server Components",
            ),
            "astro": (
                "package.json",
                '{"dependencies":{"astro":"^5.0"}}',
                "Astro",
                "ilhas",
            ),
        }
        for name, (manifest, payload, expected, tailored_hint) in fixtures.items():
            with self.subTest(stack=name), tempfile.TemporaryDirectory() as directory:
                project = Path(directory)
                (project / manifest).write_text(payload, encoding="utf-8")
                rules = project / ".specsfy" / "RULES.md"
                rules.parent.mkdir()
                rules.write_text(
                    "# Regras do sistema\n\n- Regra humana intocável.\n",
                    encoding="utf-8",
                )
                (project / "AGENTS.md").write_text(
                    "# Instruções humanas\n\nPreservar agentes locais.\n",
                    encoding="utf-8",
                )
                (project / "CLAUDE.md").write_text(
                    "# Claude local\n\nPreservar Claude local.\n",
                    encoding="utf-8",
                )

                first = run_script(SETUP, "--project", str(project))
                self.assertEqual(0, first.returncode, first.stderr)
                expected_paths = (
                    project / "PROJECT.md",
                    project / ".specsfy/STACK.md",
                    rules,
                    project / ".specsfy/DATABASE.md",
                    project / ".specsfy/USER-PROFILE.md",
                )
                for path in expected_paths:
                    self.assertTrue(path.is_file(), path)
                self.assertIn(
                    expected,
                    (project / ".specsfy/STACK.md").read_text(encoding="utf-8"),
                )
                combined_models = "\n".join(
                    path.read_text(encoding="utf-8")
                    for path in (
                        project / "PROJECT.md",
                        rules,
                        project / ".specsfy/DATABASE.md",
                    )
                )
                self.assertIn(tailored_hint, combined_models)
                self.assertIn("Regra humana intocável.", rules.read_text(encoding="utf-8"))
                agents = (project / "AGENTS.md").read_text(encoding="utf-8")
                claude = (project / "CLAUDE.md").read_text(encoding="utf-8")
                self.assertIn("Preservar agentes locais.", agents)
                self.assertIn("Preservar Claude local.", claude)
                self.assertIn("<!-- specsfy:framework:start -->", agents)
                self.assertIn("`.specsfy/STACK.md`", agents)
                self.assertIn("<!-- specsfy:framework:start -->", claude)
                self.assertIn("@.specsfy/Spec.md", claude)
                state = {
                    path: path.read_text(encoding="utf-8")
                    for path in (*expected_paths, project / "AGENTS.md", project / "CLAUDE.md")
                }

                second = run_script(SETUP, "--project", str(project))
                self.assertEqual(0, second.returncode, second.stderr)
                self.assertEqual(
                    state,
                    {path: path.read_text(encoding="utf-8") for path in state},
                )

    def test_setup_adapts_github_spec_kit_context_without_changing_sources(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            constitution = project / ".specify/memory/constitution.md"
            feature = project / "specs/001-checkout"
            contracts = feature / "contracts"
            constitution.parent.mkdir(parents=True)
            contracts.mkdir(parents=True)
            sources = {
                constitution: b"# Constituicao do projeto\n\n## I. Qualidade\n",
                feature / "spec.md": b"# Checkout recorrente\n\n## Requisitos\n",
                feature / "plan.md": b"# Plano do checkout\n",
                feature / "tasks.md": b"# Tarefas do checkout\n",
                contracts / "openapi.yaml": b"openapi: 3.1.0\n",
                feature / "fixture.bin": b"\x00\x01spec-kit\xff",
            }
            for path, content in sources.items():
                path.write_bytes(content)

            first = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, first.returncode, first.stderr)
            bridge = project / ".specsfy/SPECKIT.md"
            self.assertTrue(bridge.is_file())
            projection = bridge.read_text(encoding="utf-8")
            for path, content in sources.items():
                relative = path.relative_to(project).as_posix()
                with self.subTest(source=relative):
                    self.assertIn(f"`{relative}`", projection)
                    self.assertIn(hashlib.sha256(content).hexdigest(), projection)
                    self.assertEqual(content, path.read_bytes())
            self.assertIn("Checkout recorrente", projection)
            self.assertIn("| Constituição |", projection)
            self.assertIn("arquivo binário", projection)
            agents = (project / "AGENTS.md").read_text(encoding="utf-8")
            self.assertIn("`.specsfy/SPECKIT.md`", agents)
            self.assertIn("`.specify/memory/constitution.md`", agents)

            human_note = "# Nota local\n\nPreservar esta observacao.\n\n"
            bridge.write_text(human_note + projection, encoding="utf-8")
            changed_spec = b"# Checkout recorrente\n\n## Requisitos revistos\n"
            (feature / "spec.md").write_bytes(changed_spec)

            second = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, second.returncode, second.stderr)
            refreshed = bridge.read_text(encoding="utf-8")
            self.assertTrue(refreshed.startswith(human_note))
            self.assertIn(hashlib.sha256(changed_spec).hexdigest(), refreshed)
            self.assertEqual(1, refreshed.count("<!-- specsfy:speckit:start -->"))
            self.assertEqual(1, refreshed.count("<!-- specsfy:speckit:end -->"))
            self.assertEqual(changed_spec, (feature / "spec.md").read_bytes())
            for path, content in sources.items():
                if path != feature / "spec.md":
                    self.assertEqual(content, path.read_bytes())

    def test_setup_does_not_create_spec_kit_projection_without_constitution(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            feature = project / "specs/001-native"
            feature.mkdir(parents=True)
            (feature / "spec.md").write_text("# Spec nativa\n", encoding="utf-8")

            result = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, result.returncode, result.stderr)
            self.assertFalse((project / ".specsfy/SPECKIT.md").exists())

    def test_setup_prefers_custom_context_template(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            custom = project / ".specsfy/templates/custom"
            custom.mkdir(parents=True)
            source = (ROOT / "templates/Project.md").read_text(encoding="utf-8")
            (custom / "Project.md").write_text(
                source.replace(
                    "# Projeto",
                    "# Contexto customizado do projeto",
                ),
                encoding="utf-8",
            )

            result = run_script(SETUP, "--project", str(project))

            self.assertEqual(0, result.returncode, result.stderr)
            project_context = (project / "PROJECT.md").read_text(encoding="utf-8")
            self.assertIn("# Contexto customizado do projeto", project_context)

    def test_setup_reference_matches_publishable_agents_block(self) -> None:
        reference = (
            ROOT
            / "specsfy-setup"
            / "references"
            / "framework-instructions.md"
        ).read_text(encoding="utf-8")
        agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
        start = "<!-- specsfy:framework:start -->"
        end = "<!-- specsfy:framework:end -->"
        published = start + agents.split(start, 1)[1].split(end, 1)[0] + end
        referenced = start + reference.split(start, 1)[1].split(end, 1)[0] + end
        self.assertEqual(referenced.strip(), published.strip())

    def test_stack_update_preserves_user_content_and_adds_observed_stack(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "package.json").write_text(
                '{"dependencies":{"next":"^16.0","react":"^19.0"}}',
                encoding="utf-8",
            )
            target = project / ".specsfy" / "STACK.md"
            target.parent.mkdir()
            target.write_text(
                "# Stack\n\n## Inventário detectado\n\n"
                "<!-- specsfy:stack:start -->\n"
                "| Camada | Tecnologia | Evidência |\n"
                "| --- | --- | --- |\n"
                "| Serviço | Busca proprietária | Decisão humana |\n"
                "<!-- specsfy:stack:end -->\n\n"
                "## Decisão humana\n\nUsar arquitetura hexagonal.\n",
                encoding="utf-8",
            )

            result = run_script(STACK, "--project", str(project))

            self.assertEqual(0, result.returncode, result.stderr)
            content = target.read_text(encoding="utf-8")
            self.assertIn("Usar arquitetura hexagonal.", content)
            self.assertIn("| Serviço | Busca proprietária | Decisão humana |", content)
            self.assertIn("| Framework | Next.js |", content)
            self.assertIn("| Biblioteca | React |", content)

    def test_rule_helper_appends_without_replacing_or_duplicating(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            target = project / ".specsfy" / "RULES.md"
            target.parent.mkdir()
            target.write_text(
                "# Regras\n\n## Segurança\n\n- Nunca registrar tokens.\n",
                encoding="utf-8",
            )

            for _ in range(2):
                result = run_script(
                    RULES,
                    "--project",
                    str(project),
                    "--section",
                    "Segurança",
                    "--rule",
                    "Validar todo input externo.",
                )
                self.assertEqual(0, result.returncode, result.stderr)

            content = target.read_text(encoding="utf-8")
            self.assertIn("Nunca registrar tokens.", content)
            self.assertEqual(1, content.count("Validar todo input externo."))

    def test_database_update_maps_laravel_migration_and_preserves_notes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            migrations = project / "database" / "migrations"
            migrations.mkdir(parents=True)
            (project / ".env.example").write_text(
                "DB_CONNECTION=pgsql\nDB_PASSWORD=do-not-copy\n",
                encoding="utf-8",
            )
            (migrations / "2026_07_27_000000_create_orders_table.php").write_text(
                "<?php\nSchema::create('orders', function (Blueprint $table) {\n"
                "    $table->id();\n"
                "    $table->foreignId('user_id');\n"
                "    $table->decimal('total', 10, 2);\n"
                "});\n",
                encoding="utf-8",
            )
            target = project / ".specsfy" / "DATABASE.md"
            target.parent.mkdir()
            target.write_text(
                "# Banco de dados\n\n## Decisões\n\nPedidos usam soft delete.\n",
                encoding="utf-8",
            )

            result = run_script(DATABASE, "--project", str(project))

            self.assertEqual(0, result.returncode, result.stderr)
            content = target.read_text(encoding="utf-8")
            self.assertIn("Pedidos usam soft delete.", content)
            self.assertIn("| orders |", content)
            self.assertIn("user_id", content)
            self.assertIn("total", content)
            self.assertIn("2026_07_27_000000_create_orders_table.php", content)
            self.assertIn("| Principal | PostgreSQL | `.env.example` (`DB_CONNECTION`) |", content)
            self.assertNotIn("do-not-copy", content)


if __name__ == "__main__":
    unittest.main()
