#!/usr/bin/env python3

"""Remove edições antigas do ebook sem atingir outros arquivos."""

from __future__ import annotations

import argparse
import re
from collections import defaultdict
from pathlib import Path


ARTIFACT_PATTERN = re.compile(
    r"Specsfy-Guia-do-Usuario-v"
    r"(?P<major>0|[1-9]\d*)\."
    r"(?P<minor>0|[1-9]\d*)\."
    r"(?P<patch>0|[1-9]\d*)\."
    r"(?P<format>pdf|epub)"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Mantém somente as edições SemVer mais recentes do ebook."
        )
    )
    parser.add_argument(
        "--ebook-root",
        type=Path,
        required=True,
        help="Diretório que contém os artefatos versionados.",
    )
    parser.add_argument(
        "--keep",
        type=int,
        default=5,
        help="Quantidade de edições distintas que devem permanecer.",
    )
    parser.add_argument(
        "--protect-version",
        help=(
            "Versão vigente que não pode ser removida pela retenção."
        ),
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    ebook_root = args.ebook_root.resolve()
    if not ebook_root.is_dir():
        raise SystemExit(
            f"Erro: diretório do ebook ausente: {ebook_root}"
        )
    if args.keep < 1:
        raise SystemExit("Erro: --keep deve ser maior que zero.")

    artifacts_by_version: dict[
        tuple[int, int, int], list[Path]
    ] = defaultdict(list)
    for artifact in ebook_root.iterdir():
        match = ARTIFACT_PATTERN.fullmatch(artifact.name)
        if match is None or not artifact.is_file():
            continue
        version = (
            int(match.group("major")),
            int(match.group("minor")),
            int(match.group("patch")),
        )
        artifacts_by_version[version].append(artifact)

    versions = sorted(artifacts_by_version, reverse=True)
    retained_versions = versions[: args.keep]
    if args.protect_version:
        protected = tuple(
            int(part) for part in args.protect_version.split(".")
        )
        if protected in versions and protected not in retained_versions:
            retained_versions = retained_versions[: args.keep - 1] + [protected]

    removed_versions = [
        version for version in versions if version not in retained_versions
    ]

    removed_files = 0
    for version in removed_versions:
        for artifact in artifacts_by_version[version]:
            artifact.unlink()
            removed_files += 1

    print(
        "Retenção do ebook: "
        f"{len(retained_versions)} edição(ões) mantida(s), "
        f"{len(removed_versions)} removida(s) "
        f"({removed_files} arquivo(s))."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
