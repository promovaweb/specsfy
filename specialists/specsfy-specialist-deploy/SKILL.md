---
name: specsfy-specialist-deploy
description: Orquestrar release e deploy em servidor com SEMVER, Docker Swarm e Ansible. Use para publicação completa ou preparação desse fluxo.
---

# Deploy

## Quando usar

- Acionar quando a pessoa pedir release ou deploy de uma aplicação em servidor.
- Acionar para preparar um servidor que receberá stacks Docker Swarm via
  Ansible.
- Acionar quando a pessoa pedir para cadastrar, adicionar, substituir ou
  conferir um servidor do ambiente.
- Não executar push, provisionamento ou mudança remota sem alvo e autorização
  explícitos.

## Fluxo

1. Confirmar a raiz do sistema do usuário e acionar
   `$specsfy-specialist-versioning` para ler ou preparar `SEMVER`.
2. Inspecionar `Dockerfile`, Compose, stack e `ansible/` existentes. Comparar
   PHP, extensões, dependências, assets, entrypoint, usuário interno, portas,
   healthcheck e comando do Octane com a aplicação atual. Preservar trechos
   personalizados e apresentar o diff antes de substituir um arquivo sem
   marcações gerenciadas.
3. Executar o gerador somente na primeira preparação, quando todos os destinos
   estiverem ausentes:

   ```bash
   node scripts/scaffold.mjs --project <raiz> --image <registry>/<aplicacao>
   ```

4. Acionar `$specsfy-specialist-debian-server` para levantar as máquinas uma
   por rodada. Registrar hostname, endereço, porta SSH, usuário de conexão e
   papel `manager` ou `worker` em `ansible/inventory.yml`, preservando os hosts
   já cadastrados. Quando chegar uma máquina nova, adicionar somente esse host.
5. Testar todos os hosts declarados antes de qualquer alteração remota. A skill
   executa o utilitário, mas também mostra a forma curta para uso no Herdr:

   ```bash
   ./deploy check-hosts
   ```

6. Localizar apenas chaves públicas `~/.ssh/*.pub` na máquina controladora e
   adicioná-las ao `authorized_keys` do usuário `deploy`. Nunca ler, copiar ou
   transmitir uma chave privada. Manter acessos remotos já cadastrados.
7. Perguntar quais senhas, tokens, chaves e keys a aplicação consome e registrar
   os nomes em `ansible/vault-fields.txt`. Não pedir os valores na conversa. O
   utilitário solicita cada valor com entrada oculta e grava o YAML criptografado:

   ```bash
   ./deploy secrets
   ```

   A repetição mantém os campos existentes e pergunta somente os ausentes.

8. Gerar a referência da imagem com `docker-tag`. Recusar qualquer tag Docker
   diferente do valor presente em `SEMVER`.
9. Acionar `$specsfy-specialist-debian-server` e
   `$specsfy-specialist-docker` para definir o estado do host e do Docker
   Engine.
10. Acionar `$specsfy-specialist-ansible` para criar ou revisar roles
   idempotentes que criam o usuário `deploy`, instalam Docker Engine, configuram
   daemon, firewall, permissões e diretórios da aplicação.
11. Acionar `$specsfy-specialist-docker-swarm` para definir managers, workers,
   redes e stacks. O playbook executa `docker swarm init` somente quando o
   manager ainda não participa de um swarm e usa tokens protegidos para joins.
12. Validar Ansible em syntax check, lint, check mode e duas execuções num alvo
   descartável. Validar a stack com `docker stack config`.
13. Com autorização para o alvo informado, aplicar o playbook, publicar a
   imagem versionada e executar `docker stack deploy` pelo manager.
14. Conferir réplicas, healthchecks, logs, versão e digest. Guardar o comando de
   rollback para a versão anterior.

## Padrões

- `SEMVER` na raiz do sistema do usuário governa imagem, manifesto, tag Git e
  release.
- Gerar `compose.yaml` para desenvolvimento e `stack.yaml` para produção.
  Toda produção usa a stack pelo Docker Swarm; não use Compose como runtime de
  produção.
- Em Laravel, exigir `laravel/octane` e Open Swoole. A imagem instala
  `openswoole`; Compose e stack executam Octane com `--server=swoole`.
- Ansible configura o servidor e o estado do Swarm. Não deixe uma sequência
  manual de comandos SSH como procedimento principal.
- Criar o usuário de serviço `deploy`, adicionar somente esse usuário ao grupo
  `docker` e atribuir a ele os diretórios da aplicação. O grupo concede acesso
  administrativo amplo ao host e não deve incluir contas sem essa função.
- Manter `ansible/inventory.yml` como mapa dos servidores conhecidos. Uma
  inclusão preserva os hosts atuais, testa a nova conexão e só então configura
  o node e seu papel no Swarm.
- Mostrar `./deploy check-hosts`, `./deploy secrets`, `./deploy sync-keys` ou
  `./deploy run` quando a pessoa precisar copiar uma ação para outro painel do
  Herdr. A skill executa esses utilitários sem exigir memorização.
- Em nova chamada, ler novamente a aplicação e reconciliar apenas o que mudou.
  O gerador serve ao primeiro bootstrap e não deve sobrescrever arquivos
  existentes para simular atualização.
- Use módulos idempotentes e `community.docker`; comandos necessários para
  iniciar ou integrar o swarm precisam de condições baseadas no estado atual.
- Mantenha managers em número ímpar e restrinja as portas do Swarm aos nodes
  autorizados.
- Publique uma imagem uma vez e promova o mesmo digest entre ambientes.
- Senhas, tokens e chaves entram em um Ansible Vault criado por prompt seguro.
  O Ansible transforma os valores descriptografados em Docker Secrets com
  `no_log: true`; a stack guarda apenas nomes e mounts externos.

## Antipadrões

- Usar `latest` ou outra tag que não reproduza `SEMVER`.
- Executar `docker swarm init` em toda rodada do playbook.
- Expor token de join em log, variável aberta ou arquivo commitado.
- Guardar senha, token ou chave no `stack.yaml`, em variável aberta ou na
  imagem.
- Conceder `sudo` irrestrito ao usuário `deploy` sem necessidade
  confirmada.
- Fazer build no servidor ou recompilar uma imagem para cada ambiente.
- Considerar o deploy concluído apenas porque o comando retornou código zero.

## Validação

- Executar `current`, `docker-tag` e `verify-docker-tag` pela skill de
  versionamento.
- Confirmar que `deploy` existe, pertence ao grupo `docker`, acessa o daemon e é
  owner dos diretórios da aplicação.
- Confirmar Docker Engine ativo, manager alcançável e swarm em estado `active`.
- Executar o playbook duas vezes; a segunda rodada deve terminar sem mudanças.
- Comparar a imagem de cada serviço com `SEMVER` e com o digest publicado.
- Observar a convergência e ensaiar rollback em ambiente compatível.

## Skills relacionadas

- `$specsfy-specialist-versioning` governa a versão do sistema do usuário.
- `$specsfy-specialist-debian-server` define o estado base do host.
- `$specsfy-specialist-docker` prepara e publica a imagem.
- `$specsfy-specialist-ansible` automatiza o servidor e o cluster.
- `$specsfy-specialist-docker-swarm` governa serviços, rollout e rollback.
- `$specsfy-specialist-delivery-engineering` governa pipeline e promoção entre
  ambientes quando esses componentes fizerem parte da entrega.

Leia [references/standards.md](references/standards.md) antes de criar ou
alterar o playbook de provisionamento e deploy.
