# Padrões comuns e referências de entrega

Revisado em 2026-11-20 contra: SemVer 2.0.0, SLSA 1.2, GitHub Actions no GitHub.com, Ansible 14 (ansible-core 2.21), community.docker 5.4.0, Docker Engine 29.10.0, Laravel Octane e Cloudflare Tunnel (cloudflared 2025.4.0+ para --token-file).

Reúne as regras que valem para deploy, versioning, ci-cd e pipeline e
serve de índice para a referência de cada um.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| deploy | [deploy.md](deploy.md) e [vault.md](vault.md) | estado do servidor pela automação, hosts, imagem, secrets e ordem operacional |
| versioning | [versioning.md](versioning.md) | `SEMVER`, incremento, correspondência entre artefatos e ordem de publicação |
| ci-cd | [ci-cd.md](ci-cd.md) e [github-actions.md](github-actions.md) | etapas de pipeline, estratégias de release, migrations, supply chain e GitHub Actions |
| pipeline | [pipeline.md](pipeline.md) | workflow de testes, build Docker, promoção e rollback via Ansible |

## Autorização e alcance

- Push, provisionamento, promoção e qualquer mudança remota exigem alvo definido
  e autorização explícita. A preparação local pode criar ou atualizar `SEMVER`.
- Registrar no artefato da entrega o commit, a versão, o digest, os ambientes
  alcançados e os comandos de reversão.
- Não considerar a entrega concluída porque o comando retornou código zero.

## Versão e artefato

- `SEMVER` na raiz é a fonte da versão preparada. Tags Git, anotações OCI,
  changelog, referência da stack e nome do artefato reproduzem o mesmo valor.
- O artefato é construído uma vez, identificado por digest, e promovido entre
  ambientes sem recompilação. Imagem, tag e número publicados não são
  substituídos.
- A tag Git e a GitHub Release vêm depois do artefato disponível no registry.

## Segredos

- Senha do Vault pertence ao terminal humano. O agente executa com fonte já
  configurada e nunca pede, lê ou imprime a senha na conversa.
- Valores descriptografados viram Docker Secrets com `no_log: true`; a stack
  guarda apenas nomes e mounts externos.
- A trilha de auditoria registra promoção e aprovação sem expor segredo.

## Comprovação

- Automação só é idempotente quando duas execuções consecutivas no mesmo alvo
  terminam com a segunda sem `changed`.
- Rollout termina com smoke check funcional e sinal de saúde observado, não com
  ausência de erro no log.
- Rollback ensaiado em ambiente representativo antes da primeira execução em
  produção.

## Fontes oficiais

- [Semantic Versioning 2.0.0](https://semver.org/)
- [OCI image annotations](https://github.com/opencontainers/image-spec/blob/main/annotations.md)
- [Docker Engine no Debian](https://docs.docker.com/engine/install/debian/)
- [Docker Swarm](https://docs.docker.com/engine/swarm/)
- [Módulos community.docker](https://docs.ansible.com/ansible/latest/collections/community/docker/)
- [Senhas do Ansible Vault](https://docs.ansible.com/projects/ansible/latest/vault_guide/vault_managing_passwords.html)
- [GitHub Actions](https://docs.github.com/actions)
- [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)
- [Workflow syntax, incluindo permissões e concorrência](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [Uso seguro de GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use)
- [Ambientes, proteções e aprovação](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- [OIDC e credenciais temporárias](https://docs.github.com/en/actions/concepts/security/openid-connect)
- [Workflows reutilizáveis](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [Cache de dependências](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching)
- [Artefatos e retenção](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Concorrência](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency)
- [SLSA 1.2](https://slsa.dev/spec/v1.2/)
- [Laravel Octane e servidores suportados](https://laravel.com/docs/octane)
- [Cloudflare Tunnel — token-file](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/configure-tunnels/run-parameters/#token-file)
- [Docker Engine 29](https://docs.docker.com/engine/release-notes/29/)
- [Ansible — releases e manutenção](https://docs.ansible.com/projects/ansible/latest/reference_appendices/release_and_maintenance.html)
- [Changelog do GitHub Actions sobre queue: max](https://github.blog/changelog/2026-05-07-github-actions-concurrency-groups-now-allow-larger-queues/)
