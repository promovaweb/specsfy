#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
WORKSPACE_DIRECTORY="$(cd -- "${SCRIPT_DIRECTORY}/.." && pwd -P)"
readonly SCRIPT_DIRECTORY WORKSPACE_DIRECTORY
readonly LOCAL_CLI_DIRECTORY="${WORKSPACE_DIRECTORY}/cli"
readonly NPM_CLI_SOURCE="@promovaweb/specsfy@latest"

usage() {
    cat <<'EOF'
Uso: ./scripts/install-cli.sh [--npm]

Instala ou atualiza o executável specsfy para o usuário atual com npm.

Sem argumentos:
  instala o checkout local disponível em cli/.

--npm:
  instala a versão estável publicada no registro npm.

Este script instala somente o CLI. Ele não instala skills e não cria arquivos
de projeto no monorepo oficial do Specsfy.

Download público do executável: get.specsfy.dev
EOF
}

cli_source="${LOCAL_CLI_DIRECTORY}"
case "${1:-}" in
    "")
        ;;
    --npm)
        cli_source="${NPM_CLI_SOURCE}"
        ;;
    -h|--help)
        usage
        exit 0
        ;;
    *)
        printf 'erro: argumento desconhecido: %s\n\n' "$1" >&2
        usage >&2
        exit 2
        ;;
esac

if (( $# > 1 )); then
    printf 'erro: informe no máximo um argumento\n\n' >&2
    usage >&2
    exit 2
fi

if ! command -v npm >/dev/null 2>&1; then
    printf '%s\n' \
        'erro: npm não foi encontrado no PATH.' \
        'Instale o Node.js 22.20 ou superior e tente novamente.' \
        >&2
    exit 1
fi

if [[ "${cli_source}" == "${LOCAL_CLI_DIRECTORY}" ]]; then
    if [[ ! -f "${LOCAL_CLI_DIRECTORY}/package.json" ]]; then
        printf 'erro: checkout do CLI não encontrado em %s\n' \
            "${LOCAL_CLI_DIRECTORY}" >&2
        printf '%s\n' \
            'Clone https://github.com/promovaweb/specsfy.git ou use --npm.' \
            >&2
        exit 1
    fi
fi

printf 'Instalando Specsfy CLI de %s\n' "${cli_source}"
npm install --global --force "${cli_source}"

npm_prefix="$(npm prefix --global)"
bin_directory="${npm_prefix}/bin"
specsfy_executable="${bin_directory}/specsfy"
if [[ ! -x "${specsfy_executable}" ]]; then
    printf 'erro: npm concluiu, mas o executável não foi encontrado em %s\n' \
        "${specsfy_executable}" >&2
    exit 1
fi

installed_version="$("${specsfy_executable}" --version)"
printf 'Instalação concluída: %s\n' "${installed_version}"
printf 'Executável: %s\n' "${specsfy_executable}"

case ":${PATH}:" in
    *":${bin_directory}:"*)
        ;;
    *)
        printf 'Aviso: adicione %s ao PATH para executar specsfy diretamente.\n' \
            "${bin_directory}" >&2
        ;;
esac
