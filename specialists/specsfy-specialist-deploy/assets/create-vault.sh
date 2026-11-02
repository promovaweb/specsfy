#!/bin/sh
# Cadastra campos ausentes sem revelar valores ou a senha do Vault.
set -eu
base_dir=$(dirname -- "$0")
base_dir=$(cd "$base_dir" && pwd)
exec node "$base_dir/vault.mjs" secrets "$@"
