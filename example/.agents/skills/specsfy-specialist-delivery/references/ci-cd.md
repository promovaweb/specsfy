# Padrões do modo ci-cd

## Etapas mínimas de pipeline

1. **Validação**: lint, type-check e verificação de formatação — falha rápida
   e barata.
2. **Build**: a partir de lockfile, produzindo um artefato versionado.
3. **Testes**: unitários e de integração contra o artefato ou código
   construído, nunca contra "o que está na máquina do desenvolvedor".
4. **Análise**: SAST, dependência vulnerável, SBOM.
5. **Empacotamento**: gerar o artefato final imutável (imagem com digest,
   pacote versionado) uma única vez.
6. **Promoção**: mover a mesma referência imutável entre ambientes, sem
   rebuild, com aprovação quando o ambiente exigir.

- Cache acelera etapas (dependências, camadas de imagem) mas nunca substitui
  lockfile nem verificação de integridade — cache desatualizado não pode
  mudar o resultado do build, só sua velocidade.
- Proteja contextos de execução vindos de PR de fork externo: não
  disponibilize secrets de ambiente protegido a esse contexto, e trate
  `pull_request_target` (ou equivalente) com o cuidado extra que ele exige,
  já que roda com permissões do repositório base.
- Use `concurrency`/lock por ambiente para impedir dois deploys simultâneos
  do mesmo serviço, e `environments` com proteção (aprovação manual,
  branch restrita) para produção.

## Comparação de estratégias de release

| Estratégia | Como funciona | Exige | Rollback |
|---|---|---|---|
| Rolling | Substitui instâncias em lotes | Compatibilidade entre versão antiga e nova coexistindo | Reverter lote a lote; mais lento |
| Blue/green | Ambiente novo completo (green) recebe tráfego só depois de validado; blue fica de standby | Dobro de capacidade temporária, roteamento que troca atomicamente | Instantâneo: volta o roteamento para blue |
| Canary | Fração pequena do tráfego vai para a versão nova, aumenta gradualmente | Métricas por versão e critério automático de promoção/abort | Interrompe o aumento e drena o canary |
| Feature flag | Código novo já está em produção, mas inativo até a flag ligar | Owner, expiração definida e comportamento seguro quando a flag está off | Desligar a flag, sem precisar reverter deploy |

Nenhuma estratégia substitui as outras — combine-as: deploy rolling do
binário com a funcionalidade nova atrás de uma flag, depois canary da flag
por segmento de usuário.

## Migrations e compatibilidade

- **Expand**: adicionar coluna/tabela nova sem remover a antiga; a versão
  antiga da aplicação continua funcionando.
- **Migrate**: fazer a aplicação nova escrever/ler a partir do novo formato
  enquanto ambas as versões coexistem no rollout.
- **Contract**: remover a coluna/tabela antiga somente depois que nenhuma
  versão em produção (incluindo qualquer possível rollback) depende dela.
- Rollback de **código** (voltar ao binário anterior) e rollback de **dados**
  (reverter uma migration) têm janelas de decisão diferentes — planeje o
  contract sempre em um deploy separado, depois de confirmar que o rollback
  de código não será mais necessário.

## Supply chain

- SBOM (Software Bill of Materials) documenta as dependências exatas do
  artefato publicado; gere no momento do build, não retroativamente.
- Proveniência/attestation (ex.: SLSA) liga o artefato final ao commit, ao
  pipeline e às entradas que o produziram, permitindo verificar que o binário
  em produção veio do processo esperado.
- Fixe actions/dependências de pipeline por hash de commit (não por tag
  móvel) e monitore com uma ferramenta de score de higiene de supply chain
  (ex.: OpenSSF Scorecard) quando o projeto adotar.

## Privilégio, promoção e auditoria

- Use menor privilégio e credenciais temporárias (OIDC/STS) em vez de secret
  estático de longa duração; um job que builda não recebe a credencial que
  publica em produção.
- Mantenha ambientes reproduzíveis por infraestrutura como código, com
  configuração de ambiente fora do artefato (env vars, secret manager).
- Exija smoke check funcional e observabilidade ativa antes de considerar o
  rollout concluído; "o deploy terminou sem erro" não é o mesmo que "o serviço
  está saudável".
- Preserve trilha auditável de quem promoveu o quê, quando e com qual aprovação,
  sem registrar segredo em log ou artefato de auditoria.

## Fontes primárias

- GitHub Actions: https://docs.github.com/actions
- OpenID Connect para credenciais temporárias: https://docs.github.com/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect
- SLSA (proveniência de build): https://slsa.dev/spec/
- OpenSSF Scorecard: https://securityscorecards.dev/
- OCI Distribution Spec (formato de artefato de imagem): https://github.com/opencontainers/distribution-spec
- OWASP Top 10 CI/CD Security Risks: https://owasp.org/www-project-top-10-ci-cd-security-risks/
- Trunk-Based Development (estratégia de branch compatível com CD contínuo): https://trunkbaseddevelopment.com/
- Martin Fowler, Feature Toggles: https://martinfowler.com/articles/feature-toggles.html
