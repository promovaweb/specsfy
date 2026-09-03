#!/usr/bin/env node

/** Gera Compose, stack Swarm e automação Ansible para o sistema do usuário. */

import { chmod, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

const STABLE_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const SUPPORTED_PROXIES = new Set(["cloudflare-tunnel", "external"]);

/** Analisa os argumentos obrigatórios do gerador. */
function parseArguments(values) {
  let project;
  let image;
  let proxy = "cloudflare-tunnel";
  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === "--project") project = values[index + 1];
    if (values[index] === "--image") image = values[index + 1];
    if (values[index] === "--proxy") proxy = values[index + 1];
  }
  if (!project || !image) throw new Error("Informe --project e --image.");
  if (image.includes("@") || image.split("/").at(-1).includes(":")) {
    throw new Error("Informe --image sem tag ou digest.");
  }
  if (!SUPPORTED_PROXIES.has(proxy)) {
    throw new Error("Informe --proxy cloudflare-tunnel ou --proxy external.");
  }
  return { image, project: resolve(project), proxy };
}

/** Informa se o caminho já existe. */
async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

/** Escreve todos os arquivos somente após confirmar que nenhum será sobrescrito. */
async function writeScaffold(project, files) {
  for (const relative of Object.keys(files)) {
    if (await exists(resolve(project, relative))) {
      throw new Error(`Arquivo existente não foi alterado: ${relative}`);
    }
  }
  for (const [relative, content] of Object.entries(files)) {
    const destination = resolve(project, relative);
    let rendered = content.replace(
      'base_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)',
      'base_dir=$(dirname -- "$0")\nbase_dir=$(cd "$base_dir" && pwd)',
    ).replace(
      "        shell: /usr/sbin/nologin\n\n    - name: Criar diretório da aplicação",
      "        shell: /bin/bash\n        password_lock: true\n\n" +
        "    - name: Sincronizar chaves públicas do controlador\n" +
        "      ansible.builtin.import_tasks: keys.yml\n\n" +
        "    - name: Criar diretório da aplicação",
    ).replace(
      "  check)\n    require_inventory\n    exec ansible all -i \"$inventory\" -m ping",
      "  check|check-hosts)\n    require_inventory\n" +
        "    exec python3 \"$base_dir/ansible/check-hosts.py\" --inventory \"$inventory\"",
    ).replace(
      "  keys)\n",
      "  keys|sync-keys)\n",
    ).replace(
      "  keys|sync-keys)\n    require_inventory\n" +
        "    exec ansible-playbook",
      "  keys|sync-keys)\n    require_inventory\n" +
        "    python3 \"$base_dir/ansible/check-hosts.py\" --inventory \"$inventory\"\n" +
        "    exec ansible-playbook",
    ).replace(
      "    ansible all -i \"$inventory\" -m ping\n" +
        "    exec ansible-playbook",
      "    python3 \"$base_dir/ansible/check-hosts.py\" --inventory \"$inventory\"\n" +
        "    exec ansible-playbook",
    ).replace(
      "Uso: ./deploy {check|secrets|keys|run}",
      "Uso: ./deploy {check-hosts|secrets|sync-keys|run}",
    ).replaceAll(
      "grupo de serviço app",
      "grupo de serviço deploy",
    ).replaceAll(
      "usuário de serviço app",
      "usuário de serviço deploy",
    ).replaceAll(
      "        name: app\n",
      '        name: "{{ deploy_user }}"\n',
    ).replaceAll(
      "        group: app\n",
      '        group: "{{ deploy_user }}"\n',
    ).replaceAll(
      "        owner: app\n",
      '        owner: "{{ deploy_user }}"\n',
    );
    if (relative === "ansible/sync-keys.yml") {
      rendered = rendered.replace(
        "        groups: docker\n        append: true\n",
        "",
      );
    }
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, rendered, { encoding: "utf8", flag: "wx" });
    if (relative.endsWith(".sh") || relative === "deploy") {
      await chmod(destination, 0o755);
    }
  }
}

/** Monta os arquivos com a versão lida da raiz confirmada. */
function buildFiles(image, version, checkHosts, proxy) {
  const taggedImage = `${image}:${version}`;
  const usesCloudflare = proxy === "cloudflare-tunnel";
  const cloudflareService = usesCloudflare
    ? `\n  cloudflared:\n    image: cloudflare/cloudflared:2026.8.3\n    command: ["tunnel", "--no-autoupdate", "run", "--token-file", "/run/secrets/cloudflare_tunnel_token"]\n    networks:\n      - app\n    secrets:\n      - cloudflare_tunnel_token\n    deploy:\n      replicas: 2\n      update_config:\n        order: start-first\n        failure_action: rollback\n      rollback_config:\n        order: stop-first\n      restart_policy:\n        condition: on-failure\n`
    : "";
  const cloudflareSecret = usesCloudflare
    ? `  cloudflare_tunnel_token:\n    external: true\n`
    : "";
  const cloudflareVaultField = usesCloudflare ? "vault_cloudflare_tunnel_token\n" : "";
  const cloudflareSecretName = usesCloudflare ? "  - cloudflare_tunnel_token\n" : "";
  return {
    "deploy": `#!/bin/sh\nset -eu\n\nbase_dir=$(dirname -- "$0")\nbase_dir=$(cd "$base_dir" && pwd)\ninventory="\${ANSIBLE_INVENTORY:-$base_dir/ansible/inventory.yml}"\n\nrequire_inventory() {\n  if [ ! -f "$inventory" ]; then\n    printf 'Inventário ausente: %s\\n' "$inventory" >&2\n    printf 'Peça à skill de deploy para cadastrar os servidores.\\n' >&2\n    exit 1\n  fi\n}\n\ncase "\${1:-}" in\n  secrets)\n    exec "$base_dir/ansible/create-vault.sh"\n    ;;\n  check)\n    require_inventory\n    exec ansible all -i "$inventory" -m ping\n    ;;\n  keys)\n    require_inventory\n    exec ansible-playbook -i "$inventory" "$base_dir/ansible/sync-keys.yml"\n    ;;\n  run)\n    require_inventory\n    ansible all -i "$inventory" -m ping\n    exec ansible-playbook -i "$inventory" "$base_dir/ansible/deploy.yml" --ask-vault-pass\n    ;;\n  *)\n    printf 'Uso: ./deploy {check|secrets|keys|run}\\n' >&2\n    exit 2\n    ;;\nesac\n`,
    "Dockerfile": `FROM composer:2 AS vendor\nWORKDIR /app\nCOPY composer.json composer.lock ./\nRUN composer install --no-dev --prefer-dist --no-interaction --no-scripts\n\nFROM php:8.4-cli-bookworm AS runtime\nRUN pecl install openswoole \\\n    && docker-php-ext-enable openswoole\nWORKDIR /app\nRUN groupadd --gid 1000 app \\\n    && useradd --uid 1000 --gid app --create-home --shell /usr/sbin/nologin app\nCOPY --chown=app:app . .\nCOPY --from=vendor --chown=app:app /app/vendor ./vendor\nRUN chmod 0755 docker/entrypoint.sh\nUSER app\nEXPOSE 8000\nENTRYPOINT ["docker/entrypoint.sh"]\nCMD ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8000"]\n`,
    ".dockerignore": `.git\n.env\nnode_modules\nstorage/logs/*\ntests\n`,
    "docker/entrypoint.sh": `#!/bin/sh\nset -eu\n\nfor secret_file in /run/secrets/*; do\n  [ -f "$secret_file" ] || continue\n  secret_name=$(basename "$secret_file" | tr '[:lower:]' '[:upper:]')\n  secret_value=$(cat "$secret_file")\n  export "$secret_name=$secret_value"\ndone\n\nexec "$@"\n`,
    "compose.yaml": `services:\n  app:\n    build: .\n    image: ${taggedImage}\n    command: ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8000"]\n    ports:\n      - "8000:8000"\n    env_file:\n      - .env\n    healthcheck:\n      test: ["CMD", "php", "artisan", "octane:status"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n`,
    "stack.yaml": `services:\n  app:\n    image: ${taggedImage}\n    command: ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8000"]\n    networks:\n      - app\n    secrets:\n      - app_key\n      - db_password\n    deploy:\n      replicas: 2\n      update_config:\n        order: start-first\n        failure_action: rollback\n      rollback_config:\n        order: stop-first\n      restart_policy:\n        condition: on-failure\n${cloudflareService}\nnetworks:\n  app:\n    driver: overlay\n\nsecrets:\n  app_key:\n    external: true\n  db_password:\n    external: true\n${cloudflareSecret}`,
    "ansible/requirements.yml": `collections:\n  - name: community.docker\n    version: ">=4.0.0,<5.0.0"\n  - name: ansible.posix\n    version: ">=2.0.0,<3.0.0"\n`,
    "ansible/create-vault.sh": `#!/bin/sh\nset -eu\n\nbase_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)\nfields_file="$base_dir/vault-fields.txt"\nvault_file="$base_dir/group_vars/all/vault.yml"\npassword_file=$(mktemp)\nmissing_file=$(mktemp)\ntrap 'rm -f -- "$password_file" "$missing_file"' EXIT HUP INT TERM\numask 077\nmkdir -p "$(dirname -- "$vault_file")"\ntouch "$vault_file"\n\nwhile IFS= read -r field || [ -n "$field" ]; do\n  case "$field" in\n    vault_[a-z0-9_]*) ;;\n    *) printf 'Nome de variável inválido: %s\\n' "$field" >&2; exit 1 ;;\n  esac\n  if ! grep -q "^\${field}:" "$vault_file"; then\n    printf '%s\\n' "$field" >> "$missing_file"\n  fi\ndone < "$fields_file"\n\nif [ ! -s "$missing_file" ]; then\n  printf 'Vault já contém todos os campos: %s\\n' "$vault_file"\n  exit 0\nfi\n\npython3 -c 'import getpass; print(getpass.getpass("Senha do Ansible Vault: "))' > "$password_file"\nwhile IFS= read -r field; do\n  value=$(FIELD_NAME="$field" python3 -c 'import getpass, os; print(getpass.getpass(f"Valor de {os.environ[\"FIELD_NAME\"]}: "))')\n  if [ -z "$value" ]; then\n    printf 'O valor de %s não pode ficar vazio.\\n' "$field" >&2\n    exit 1\n  fi\n  printf '%s' "$value" | ansible-vault encrypt_string \\\n    --vault-password-file "$password_file" \\\n    --stdin-name "$field" >> "$vault_file"\n  printf '\\n' >> "$vault_file"\ndone < "$missing_file"\n\nprintf 'Vault atualizado: %s\\n' "$vault_file"\n`,
    "ansible/vault-fields.txt": `vault_app_key\nvault_db_password\n${cloudflareVaultField}`,
    "ansible/check-hosts.py": checkHosts,
    "ansible/secrets.yml": `---\n- name: Confirmar valor protegido para cada Docker Secret\n  ansible.builtin.assert:\n    that:\n      - "lookup('ansible.builtin.vars', 'vault_' + item, default='') | length > 0"\n    fail_msg: "Cadastre vault_{{ item }} com ansible/create-vault.sh"\n  loop: "{{ app_secret_names }}"\n  no_log: true\n\n- name: Criar Docker Secrets externos\n  community.docker.docker_secret:\n    name: "{{ item }}"\n    data: "{{ lookup('ansible.builtin.vars', 'vault_' + item) }}"\n    state: present\n  loop: "{{ app_secret_names }}"\n  no_log: true\n`,
    "ansible/keys.yml": `---\n- name: Localizar chaves públicas SSH no controlador\n  ansible.builtin.set_fact:\n    local_ssh_public_key_files: "{{ query('ansible.builtin.fileglob', local_ssh_public_key_pattern) }}"\n\n- name: Confirmar que existe uma chave pública local\n  ansible.builtin.assert:\n    that:\n      - local_ssh_public_key_files | length > 0\n    fail_msg: "Nenhuma chave pública encontrada em {{ local_ssh_public_key_pattern }}"\n\n- name: Autorizar chaves públicas locais para o usuário deploy\n  ansible.posix.authorized_key:\n    user: "{{ deploy_user }}"\n    key: "{{ lookup('ansible.builtin.file', item) }}"\n    state: present\n    exclusive: false\n    manage_dir: true\n  loop: "{{ local_ssh_public_key_files }}"\n  no_log: true\n`,
    "ansible/sync-keys.yml": `---\n- name: Sincronizar chaves públicas locais\n  hosts: all\n  become: true\n  tasks:\n    - name: Manter grupo de serviço deploy\n      ansible.builtin.group:\n        name: "{{ deploy_user }}"\n        state: present\n\n    - name: Manter usuário deploy apto a receber acesso SSH por chave\n      ansible.builtin.user:\n        name: "{{ deploy_user }}"\n        group: "{{ deploy_user }}"\n        groups: docker\n        append: true\n        create_home: true\n        shell: /bin/bash\n        password_lock: true\n\n    - name: Sincronizar chaves públicas sem remover acessos existentes\n      ansible.builtin.import_tasks: keys.yml\n`,
    "ansible/inventory.example.yml": `all:\n  children:\n    swarm_managers:\n      hosts:\n        app01:\n          ansible_host: 192.0.2.10\n          ansible_port: 22\n          ansible_user: root\n    swarm_workers:\n      hosts:\n        app02:\n          ansible_host: 192.0.2.11\n          ansible_port: 22\n          ansible_user: root\n`,
    "ansible/group_vars/all.yml": `deploy_user: deploy\napp_root: /opt/apps/app\napp_stack_name: app\napp_image: "${image}"\napp_version: "${version}"\nswarm_advertise_addr: "{{ ansible_default_ipv4.address }}"\nlocal_ssh_public_key_pattern: "{{ lookup('ansible.builtin.env', 'HOME') }}/.ssh/*.pub"\napp_secret_names:\n  - app_key\n  - db_password\n${cloudflareSecretName}`,
    "ansible/templates/stack.yaml.j2": `services:\n  app:\n    image: "{{ app_image }}:{{ app_version }}"\n    command: ["php", "artisan", "octane:start", "--server=swoole", "--host=0.0.0.0", "--port=8000"]\n    networks:\n      - app\n    secrets:\n      - app_key\n      - db_password\n    deploy:\n      replicas: 2\n      update_config:\n        order: start-first\n        failure_action: rollback\n      rollback_config:\n        order: stop-first\n      restart_policy:\n        condition: on-failure\n${cloudflareService}\nnetworks:\n  app:\n    driver: overlay\nsecrets:\n  app_key:\n    external: true\n  db_password:\n    external: true\n${cloudflareSecret}`,
  };
}

/** Executa o gerador. */
async function main() {
  const { image, project, proxy } = parseArguments(process.argv.slice(2));
  const version = (await readFile(resolve(project, "SEMVER"), "utf8")).trim();
  if (!STABLE_SEMVER.test(version)) throw new Error(`SEMVER inválido: ${version}`);
  const checkHosts = await readFile(
    new URL("../assets/check-hosts.py", import.meta.url),
    "utf8",
  );
  const files = buildFiles(image, version, checkHosts, proxy);
  files["ansible/deploy.yml"] = await readFile(
    new URL("../assets/deploy.yml", import.meta.url),
    "utf8",
  );
  await writeScaffold(project, files);
  process.stdout.write(`${Object.keys(files).length} arquivos gerados para ${image}:${version}.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
