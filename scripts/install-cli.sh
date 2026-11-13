#!/usr/bin/env bash
# Instala o binário specsfy da plataforma atual a partir do GitHub Release.
#
# Baixa specsfy-<os>-<arch>[.exe] e o SHA256SUMS da release, confere o
# SHA-256, grava o executável no diretório de destino e confirma a versão.
# Não precisa de Node.js nem de Bun. Não instala skills e não cria arquivos
# de projeto.

set -euo pipefail

readonly REPOSITORY="promovaweb/specsfy"
readonly DEFAULT_BASE="https://github.com/${REPOSITORY}/releases/download"
readonly DEFAULT_API="https://api.github.com/repos/${REPOSITORY}/releases/latest"

usage() {
    cat <<'EOF'
Uso: ./scripts/install-cli.sh [--version X.Y.Z] [--dir DIRETORIO]

Instala ou atualiza o executável specsfy para o usuário atual, baixando o
binário da plataforma no GitHub Release e conferindo o SHA256SUMS.

--version X.Y.Z  versão a instalar; sem ela, a última release publicada.
--dir DIRETORIO  destino do executável; padrão: ~/.local/bin.

Variáveis:
  SPECSFY_VERSION       mesma função de --version.
  SPECSFY_INSTALL_DIR   mesma função de --dir.
  SPECSFY_DOWNLOAD_URL  base com o layout <base>/v<versão>/<arquivo>
                        (padrão: GitHub Releases).
  SPECSFY_RELEASES_API  endereço que responde a última release com tag_name.

Este script instala somente o CLI. Ele não instala skills e não cria arquivos
de projeto. Com npm disponível, a alternativa é:
  npm install -g @promovaweb/specsfy
EOF
}

fail() {
    printf 'erro: %s\n' "$1" >&2
    exit "${2:-1}"
}

version="${SPECSFY_VERSION:-}"
install_dir="${SPECSFY_INSTALL_DIR:-${HOME}/.local/bin}"
while (( $# > 0 )); do
    case "$1" in
        --version)
            (( $# >= 2 )) || fail 'informe a versão depois de --version' 2
            version="$2"
            shift 2
            ;;
        --dir)
            (( $# >= 2 )) || fail 'informe o diretório depois de --dir' 2
            install_dir="$2"
            shift 2
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
done

case "$(uname -s)" in
    Linux) os="linux" ;;
    Darwin) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*) os="windows" ;;
    *) fail "sistema sem binário publicado: $(uname -s)" ;;
esac
case "$(uname -m)" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) fail "arquitetura sem binário publicado: $(uname -m)" ;;
esac
if [[ "${os}" == "windows" && "${arch}" != "x64" ]]; then
    fail "arquitetura sem binário publicado no Windows: ${arch}"
fi
extension=""
[[ "${os}" == "windows" ]] && extension=".exe"
asset="specsfy-${os}-${arch}${extension}"

command -v curl >/dev/null 2>&1 || fail 'curl não foi encontrado no PATH.'
fetch() {
    curl --fail --silent --show-error --location --retry 2 --output "$2" "$1"
}

if [[ -z "${version}" ]]; then
    metadata="$(curl --fail --silent --show-error --location \
        --header 'Accept: application/vnd.github+json' \
        "${SPECSFY_RELEASES_API:-${DEFAULT_API}}")" \
        || fail 'não foi possível consultar a última release.' 5
    version="$(printf '%s' "${metadata}" \
        | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"v\{0,1\}\([0-9][0-9.]*\)".*/\1/p' \
        | head -n 1)"
    [[ -n "${version}" ]] || fail 'a última release não informa uma versão.' 5
fi
version="${version#v}"
[[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "versão inválida: ${version}" 2

base="${SPECSFY_DOWNLOAD_URL:-${DEFAULT_BASE}}"
base="${base%/}"
workdir="$(mktemp -d)"
trap 'rm -rf "${workdir}"' EXIT

printf 'Baixando %s v%s\n' "${asset}" "${version}"
fetch "${base}/v${version}/SHA256SUMS" "${workdir}/SHA256SUMS" \
    || fail "SHA256SUMS da v${version} indisponível." 5
fetch "${base}/v${version}/${asset}" "${workdir}/${asset}" \
    || fail "${asset} da v${version} indisponível." 5

expected="$(awk -v name="${asset}" '{ file = $2; sub(/^\*/, "", file); if (file == name) print $1 }' \
    "${workdir}/SHA256SUMS" | head -n 1)"
[[ -n "${expected}" ]] || fail "SHA256SUMS da v${version} não lista ${asset}."
if command -v sha256sum >/dev/null 2>&1; then
    actual="$(sha256sum "${workdir}/${asset}" | awk '{ print $1 }')"
elif command -v shasum >/dev/null 2>&1; then
    actual="$(shasum -a 256 "${workdir}/${asset}" | awk '{ print $1 }')"
else
    fail 'sha256sum ou shasum não foi encontrado no PATH.'
fi
[[ "${actual}" == "${expected}" ]] \
    || fail "checksum divergente para ${asset}: esperado ${expected}, obtido ${actual}."

mkdir -p "${install_dir}"
target="${install_dir}/specsfy${extension}"
chmod 755 "${workdir}/${asset}"
mv -f "${workdir}/${asset}" "${target}"

installed_version="$("${target}" --version)"
printf 'Instalação concluída: %s\n' "${installed_version}"
printf 'Executável: %s\n' "${target}"

case ":${PATH}:" in
    *":${install_dir}:"*)
        ;;
    *)
        printf 'Aviso: adicione %s ao PATH para executar specsfy diretamente.\n' \
            "${install_dir}" >&2
        ;;
esac
