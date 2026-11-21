#!/bin/sh
# Encaminha ações de deploy e preserva os comandos manuais existentes.
set -eu

base_dir=$(dirname -- "$0")
base_dir=$(cd "$base_dir" && pwd)
inventory="${ANSIBLE_INVENTORY:-$base_dir/ansible/inventory.yml}"
action=${1:-}
if [ "$#" -gt 0 ]; then shift; fi

require_inventory() {
  if [ ! -f "$inventory" ]; then
    printf 'Inventário ausente: %s\n' "$inventory" >&2
    exit 1
  fi
}

case "$action" in
  configure-vault|run)
    exec node "$base_dir/ansible/vault.mjs" "$action" "$@"
    ;;
  secrets)
    exec "$base_dir/ansible/create-vault.sh" "$@"
    ;;
  check|check-hosts)
    require_inventory
    exec node "$base_dir/ansible/check-hosts.mjs" --inventory "$inventory" "$@"
    ;;
  keys|sync-keys)
    require_inventory
    node "$base_dir/ansible/check-hosts.mjs" --inventory "$inventory"
    exec ansible-playbook -i "$inventory" "$base_dir/ansible/sync-keys.yml" "$@"
    ;;
  *)
    printf 'Uso: ./deploy {check-hosts|secrets|sync-keys|configure-vault|run}\n' >&2
    printf 'Deploy pela IA: ./deploy run --non-interactive\n' >&2
    exit 2
    ;;
esac
