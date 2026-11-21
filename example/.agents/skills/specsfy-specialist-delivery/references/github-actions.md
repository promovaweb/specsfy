# GitHub Actions no modo ci-cd

## Workflows, eventos e jobs

- Versione workflows YAML diretamente em `.github/workflows/`. Declare em
  `on:` os eventos e filtros de branches, tags ou caminhos que acionam cada
  workflow. Use `pull_request` para validar mudanças, `push` filtrado para
  publicar a partir de uma referência confiável, `workflow_dispatch` para
  execução manual e `schedule` para rotinas da branch padrão.
- Defina `runs-on` e `steps` para cada job. Jobs podem rodar em paralelo por
  padrão. Use `needs` para ordenar verificação, build e promoção. Use
  `strategy.matrix` para cobrir versões e plataformas suportadas, com
  `include` ou `exclude` quando houver exceções. Ajuste `fail-fast` e
  `max-parallel` conforme o custo e a necessidade de observar todas as falhas.
- Trate dados de PR e branches como entrada não confiável. Passe valores
  externos como variáveis de ambiente e use aspas no shell. Não execute
  código de PR não confiável em `pull_request_target`, que pode receber
  os privilégios do repositório base.

## Cache, artefatos e promoção

- Use `actions/cache` ou o cache da action de setup para dependências
  recuperáveis. Inclua sistema, runtime e hash do lockfile na chave quando
  afetarem a compatibilidade. O pipeline precisa funcionar com cache vazio.
  Mantenha tokens e arquivos de credenciais fora dos caminhos de cache.
- Use `actions/upload-artifact` e `actions/download-artifact` para relatórios
  e arquivos produzidos pelo workflow. Dê nomes distintos às saídas de
  cada célula da matriz e defina retenção. Escolha versões compatíveis
  com GitHub.com ou com a versão do GitHub Enterprise Server instalada.
- Promova o pacote publicado ou a imagem pelo digest produzido no build.
  Para arquivos transferidos entre jobs, confira a referência e a
  integridade esperadas antes da promoção.

## Ambientes, aprovação e credenciais

- Configure previamente o ambiente em Settings e associe o job de deploy
  com `environment: production`. Restrinja branches/tags autorizadas e
  configure revisores obrigatórios e bloqueio de autoaprovação conforme
  o plano e a visibilidade do repositório. O job aguarda as regras de proteção
  antes de executar ou acessar os secrets do ambiente. Digitar um nome novo
  no workflow pode criar um ambiente sem essas proteções.
- Declare `permissions: { contents: read }` no workflow quando precisar
  somente ler o repositório e eleve permissões apenas nos jobs que precisarem
  delas. Ao declarar permissões, os escopos não citados ficam com `none`.
  Para build e deploy separados, conceda escrita no registry só ao job que
  publica e acesso ao destino de deploy só ao job que promove.
- Prefira OIDC quando o destino permitir. No job de autenticação, conceda
  `id-token: write` e restrinja no provedor a relação de confiança por
  repositório, referência ou ambiente, além da audiência aplicável. Essa
  permissão permite solicitar o token OIDC. As permissões no destino vêm da
  identidade que o provedor concede. Para valores que ainda exigem segredo,
  use o escopo de ambiente ou repositório apropriado e evite logs e artefatos
  que os possam conter.
- Fixe actions externas por SHA completo de commit, verificando que o commit
  pertence ao repositório esperado. Registre a versão legível em comentário e
  revise atualizações antes de trocar o SHA.

## Reuso e concorrência

- Declare `on: workflow_call`, entradas tipadas, saídas e secrets no workflow
  reutilizável. Chame-o no nível do job com `jobs.<id>.uses`. Para outro
  repositório, use `owner/repo/.github/workflows/arquivo.yml@<SHA-completo>`.
  Passe somente os secrets necessários. Secrets de ambiente ficam no job que
  declara `environment`, pois `workflow_call` não permite passar o ambiente
  como regra de proteção. Workflows chamados não elevam as permissões que
  receberam do chamador.
- Separe grupos de `concurrency` de CI e de deploy. Na CI, use um grupo por
  workflow e referência, com `cancel-in-progress: true` para dispensar
  verificações obsoletas quando isso for desejado. Em deploy, use uma chave
  estável por serviço e ambiente, compartilhada entre workflows que escrevem
  no mesmo destino, e preserve o job em execução. No comportamento padrão,
  um novo pendente substitui o pendente anterior. No GitHub.com, use
  `queue: max` se precisar enfileirar múltiplas promoções (até 100 pendentes)
  e mantenha `cancel-in-progress: false`. Confirme suporte na versão efetiva
  do GitHub Enterprise Server. Para destinos compartilhados por vários
  repositórios, coordene o lock no próprio destino.

## Verificação

Confirme quais eventos disparam a CI ou o deploy, incluindo PR de fork.
Exercite cache vazio, matriz com erro e transferência do artefato por
referência imutável. Verifique que um job sem aprovação não acessa secrets
do ambiente, que o provedor recusa identidades fora da política OIDC e que
duas promoções concorrentes se comportam como planejado. Registre commit,
digest, execução, aprovação e teste funcional da versão promovida.

As fontes oficiais estão em [standards.md](standards.md#fontes-oficiais).
