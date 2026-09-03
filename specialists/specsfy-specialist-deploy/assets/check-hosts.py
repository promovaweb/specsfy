#!/usr/bin/env python3
"""Exibe os hosts do inventário e testa cada conexão pelo Ansible."""

from __future__ import annotations

import argparse
import json
import subprocess


def execute(command: list[str]) -> subprocess.CompletedProcess[str]:
    """Executa um comando do Ansible sem interpretar pelo shell."""
    return subprocess.run(command, text=True, capture_output=True, check=False)


def inventory_hosts(data: dict) -> list[str]:
    """Reúne os hosts declarados diretamente nos grupos do inventário."""
    return sorted(
        {
            host
            for group in data.values()
            if isinstance(group, dict)
            for host in group.get("hosts", [])
        }
    )


def connection_states(output: str) -> dict[str, str]:
    """Converte a saída compacta do módulo ping em estados legíveis."""
    states: dict[str, str] = {}
    for line in output.splitlines():
        if " | " not in line:
            continue
        host, result = line.split(" | ", 1)
        states[host] = (
            "conectado" if result.startswith("SUCCESS") else "inacessível"
        )
    return states


def role_for(host: str, data: dict) -> str:
    """Obtém o papel do host pelos grupos de managers e workers."""
    if host in data.get("swarm_managers", {}).get("hosts", []):
        return "manager"
    if host in data.get("swarm_workers", {}).get("hosts", []):
        return "worker"
    return "não definido"


def main() -> int:
    """Carrega o inventário, testa os hosts e imprime uma tabela."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--inventory", required=True)
    args = parser.parse_args()

    loaded = execute(["ansible-inventory", "-i", args.inventory, "--list"])
    if loaded.returncode != 0:
        print(loaded.stderr.strip())
        return loaded.returncode

    data = json.loads(loaded.stdout)
    hosts = inventory_hosts(data)
    tested = execute(
        ["ansible", "all", "-i", args.inventory, "-m", "ping", "-o"]
    )
    states = connection_states(tested.stdout + "\n" + tested.stderr)
    hostvars = data.get("_meta", {}).get("hostvars", {})
    headings = (
        "SERVIDOR",
        "ENDEREÇO",
        "PORTA",
        "USUÁRIO",
        "PAPEL",
        "ESTADO",
    )
    rows = []
    for host in hosts:
        variables = hostvars.get(host, {})
        rows.append(
            (
                host,
                str(variables.get("ansible_host", host)),
                str(variables.get("ansible_port", 22)),
                str(variables.get("ansible_user", "-")),
                role_for(host, data),
                states.get(host, "inacessível"),
            )
        )

    widths = [
        max(len(headings[index]), *(len(row[index]) for row in rows))
        for index in range(len(headings))
    ]
    print(
        "  ".join(
            value.ljust(widths[index]) for index, value in enumerate(headings)
        )
    )
    print("  ".join("-" * width for width in widths))
    for row in rows:
        print(
            "  ".join(
                value.ljust(widths[index]) for index, value in enumerate(row)
            )
        )

    return 0 if hosts and all(row[-1] == "conectado" for row in rows) else 1


if __name__ == "__main__":
    raise SystemExit(main())
