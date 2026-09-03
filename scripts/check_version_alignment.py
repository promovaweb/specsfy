#!/usr/bin/env python3
"""Confere a versão única dos artefatos publicáveis do Specsfy."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SEMVER = re.compile(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$")


def json_version(path: Path, key: str = "version") -> str:
    """Lê uma versão textual de um documento JSON."""
    value = json.loads(path.read_text(encoding="utf-8")).get(key)
    if not isinstance(value, str):
        raise ValueError(f"{path.relative_to(ROOT)} não declara {key}")
    return value


def main() -> int:
    """Compara todas as projeções publicáveis com VERSION."""
    expected = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
    if SEMVER.fullmatch(expected) is None:
        print("erro: VERSION não contém uma versão SemVer estável", file=sys.stderr)
        return 2

    source = (ROOT / "cli/src/version.ts").read_text(encoding="utf-8")
    source_match = re.search(r'export const VERSION = "([^\"]+)";', source)
    if source_match is None:
        print("erro: cli/src/version.ts não declara VERSION", file=sys.stderr)
        return 2

    checks = {
        "cli/package.json": json_version(ROOT / "cli/package.json"),
        "cli/package-lock.json": json_version(ROOT / "cli/package-lock.json"),
        "cli/package-lock.json#packages[empty]": json.loads(
            (ROOT / "cli/package-lock.json").read_text(encoding="utf-8")
        )["packages"][""]["version"],
        "cli/src/version.ts": source_match.group(1),
        "cli/bin/specsfy.build.json": json_version(
            ROOT / "cli/bin/specsfy.build.json"
        ),
        "ebook/build.json": json_version(ROOT / "ebook/build.json"),
    }
    failures = [
        f"{path}: {value} (esperado {expected})"
        for path, value in checks.items()
        if value != expected
    ]
    ebook = json.loads((ROOT / "ebook/build.json").read_text(encoding="utf-8"))
    expected_edition = f"v{expected}"
    if ebook.get("edition") != expected_edition:
        failures.append(
            f"ebook/build.json#edition: {ebook.get('edition')} "
            f"(esperado {expected_edition})"
        )
    for extension in ("pdf", "epub"):
        expected_file = f"Specsfy-Guia-do-Usuario-v{expected}.{extension}"
        declared = ebook.get("artifacts", {}).get(extension, {}).get("file")
        if declared != expected_file or not (ROOT / "ebook" / expected_file).is_file():
            failures.append(f"ebook/{expected_file}: artefato atual ausente ou divergente")

    if failures:
        print("Versões do Specsfy fora de sincronia:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    print(f"Versão única do Specsfy confirmada: {expected}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
