"""Comportamento executável do especialista de deploy."""

from __future__ import annotations

import subprocess
import shutil
import tempfile
import unittest
import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "specsfy-specialist-deploy" / "scripts" / "scaffold.mjs"
CHECK_HOSTS = ROOT / "specsfy-specialist-deploy" / "assets" / "check-hosts.py"


class DeploySpecialistTests(unittest.TestCase):
    def test_check_hosts_maps_inventory_roles_and_ping_states(self) -> None:
        spec = importlib.util.spec_from_file_location("check_hosts", CHECK_HOSTS)
        self.assertIsNotNone(spec)
        self.assertIsNotNone(spec.loader)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        inventory = {
            "swarm_managers": {"hosts": ["app01"]},
            "swarm_workers": {"hosts": ["app02"]},
            "_meta": {"hostvars": {}},
        }

        self.assertEqual(["app01", "app02"], module.inventory_hosts(inventory))
        self.assertEqual("manager", module.role_for("app01", inventory))
        self.assertEqual("worker", module.role_for("app02", inventory))
        self.assertEqual(
            {"app01": "conectado", "app02": "inacessível"},
            module.connection_states(
                "app01 | SUCCESS => {}\napp02 | UNREACHABLE! => {}\n"
            ),
        )

    def test_generates_compose_swarm_stack_and_complete_ansible_flow(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "SEMVER").write_text("2.3.4\n", encoding="utf-8")

            result = subprocess.run(
                [
                    "node",
                    str(SCRIPT),
                    "--project",
                    str(project),
                    "--image",
                    "registry.example/equipe/app",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(0, result.returncode, result.stderr)
            expected = (
                "deploy",
                "Dockerfile",
                ".dockerignore",
                "docker/entrypoint.sh",
                "compose.yaml",
                "stack.yaml",
                "ansible/deploy.yml",
                "ansible/requirements.yml",
                "ansible/secrets.yml",
                "ansible/keys.yml",
                "ansible/sync-keys.yml",
                "ansible/inventory.example.yml",
                "ansible/group_vars/all.yml",
                "ansible/vault-fields.txt",
                "ansible/create-vault.sh",
                "ansible/check-hosts.py",
                "ansible/templates/stack.yaml.j2",
            )
            for relative in expected:
                self.assertTrue((project / relative).is_file(), relative)

            compose = (project / "compose.yaml").read_text(encoding="utf-8")
            dockerfile = (project / "Dockerfile").read_text(encoding="utf-8")
            stack = (project / "stack.yaml").read_text(encoding="utf-8")
            playbook = "\n".join(
                (project / relative).read_text(encoding="utf-8")
                for relative in ("ansible/deploy.yml", "ansible/secrets.yml")
            )
            variables = (project / "ansible/group_vars/all.yml").read_text(
                encoding="utf-8"
            )

            self.assertIn("octane:start", compose)
            self.assertIn("--server=swoole", compose)
            self.assertIn("pecl install openswoole", dockerfile)
            self.assertIn("registry.example/equipe/app:2.3.4", stack)
            self.assertIn("community.docker.docker_swarm", playbook)
            self.assertIn('hosts: "swarm_managers[0]"', playbook)
            self.assertIn('hosts: "swarm_managers[1:]"', playbook)
            self.assertIn("hosts: swarm_workers", playbook)
            self.assertIn("swarm_join_tokens.Manager", playbook)
            self.assertIn("swarm_join_tokens.Worker", playbook)
            self.assertIn("community.docker.docker_secret", playbook)
            self.assertIn("vault_", playbook)
            self.assertIn("community.docker.docker_stack", playbook)
            self.assertIn("no_log: true", playbook)
            self.assertIn("deploy_user", playbook)
            self.assertIn("ansible.builtin.import_tasks: keys.yml", playbook)
            self.assertIn("deploy_user: deploy", variables)
            self.assertIn("app_version: \"2.3.4\"", variables)
            self.assertIn("external: true", stack)
            self.assertNotIn("DB_PASSWORD=", stack)
            self.assertNotIn("password: \"", stack.casefold())
            deploy_utility = (project / "deploy").read_text(encoding="utf-8")
            self.assertIn("check-hosts.py", deploy_utility)
            self.assertIn("check-hosts)", deploy_utility)
            self.assertGreaterEqual(deploy_utility.count("check-hosts.py"), 3)
            self.assertIn('"$base_dir/ansible/create-vault.sh"', deploy_utility)
            self.assertIn("sync-keys.yml", deploy_utility)
            self.assertIn("deploy.yml", deploy_utility)
            keys = (project / "ansible/keys.yml").read_text(encoding="utf-8")
            self.assertIn("query('ansible.builtin.fileglob'", keys)
            self.assertIn("ansible.posix.authorized_key", keys)
            self.assertIn("exclusive: false", keys)
            self.assertNotIn("id_rsa\n", keys)
            check_hosts = (project / "ansible/check-hosts.py").read_text(
                encoding="utf-8"
            )
            for heading in ("SERVIDOR", "ENDEREÇO", "PORTA", "USUÁRIO", "PAPEL", "ESTADO"):
                self.assertIn(heading, check_hosts)
            self.assertIn("ansible-inventory", check_hosts)
            self.assertIn('"ping"', check_hosts)
            vault_utility = (project / "ansible/create-vault.sh").read_text(
                encoding="utf-8"
            )
            self.assertIn("encrypt_string", vault_utility)
            self.assertIn("vault-fields.txt", vault_utility)
            self.assertIn("getpass", vault_utility)
            self.assertIn('grep -q "^${field}:"', vault_utility)
            self.assertNotIn(': > "$vault_file"', vault_utility)

            shellcheck = shutil.which("shellcheck")
            self.assertIsNotNone(shellcheck)
            checked = subprocess.run(
                [
                    shellcheck,
                    str(project / "docker/entrypoint.sh"),
                    str(project / "ansible/create-vault.sh"),
                    str(project / "deploy"),
                ],
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(0, checked.returncode, checked.stderr)

    def test_check_hosts_prints_inventory_table_for_a_reachable_host(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "SEMVER").write_text("2.3.4\n", encoding="utf-8")
            generated = subprocess.run(
                [
                    "node",
                    str(SCRIPT),
                    "--project",
                    str(project),
                    "--image",
                    "registry.example/equipe/app",
                ],
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(0, generated.returncode, generated.stderr)
            (project / "ansible/inventory.yml").write_text(
                "all:\n"
                "  children:\n"
                "    swarm_managers:\n"
                "      hosts:\n"
                "        local:\n"
                "          ansible_connection: local\n"
                "          ansible_host: 127.0.0.1\n"
                "          ansible_user: tester\n",
                encoding="utf-8",
            )

            checked = subprocess.run(
                [str(project / "deploy"), "check-hosts"],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(0, checked.returncode, checked.stderr)
            self.assertIn("SERVIDOR", checked.stdout)
            self.assertIn("127.0.0.1", checked.stdout)
            self.assertIn("manager", checked.stdout)
            self.assertIn("conectado", checked.stdout)

    def test_refuses_to_overwrite_existing_deploy_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "SEMVER").write_text("2.3.4\n", encoding="utf-8")
            (project / "compose.yaml").write_text("conteudo humano\n", encoding="utf-8")

            result = subprocess.run(
                [
                    "node",
                    str(SCRIPT),
                    "--project",
                    str(project),
                    "--image",
                    "registry.example/equipe/app",
                ],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertNotEqual(0, result.returncode)
            self.assertEqual(
                "conteudo humano\n",
                (project / "compose.yaml").read_text(encoding="utf-8"),
            )

    def test_vault_utility_preserves_fields_already_encrypted(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory)
            (project / "SEMVER").write_text("2.3.4\n", encoding="utf-8")
            generated = subprocess.run(
                [
                    "node",
                    str(SCRIPT),
                    "--project",
                    str(project),
                    "--image",
                    "registry.example/equipe/app",
                ],
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(0, generated.returncode, generated.stderr)
            vault = project / "ansible/group_vars/all/vault.yml"
            vault.parent.mkdir(parents=True, exist_ok=True)
            original = (
                "vault_app_key: !vault |\n  $ANSIBLE_VAULT;1.1;AES256\n"
                "vault_db_password: !vault |\n  $ANSIBLE_VAULT;1.1;AES256\n"
            )
            vault.write_text(original, encoding="utf-8")

            repeated = subprocess.run(
                [str(project / "ansible/create-vault.sh")],
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(0, repeated.returncode, repeated.stderr)
            self.assertIn("já contém todos os campos", repeated.stdout)
            self.assertEqual(original, vault.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
