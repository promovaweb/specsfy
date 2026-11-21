# Changelog

Todas as mudanças relevantes do Specsfy CLI são registradas neste arquivo.

## [Unreleased]

## [0.40.1] - 2026-11-20

### Corrigido

Achados de uma revisão independente da 0.40.0 (Codex):

- Planos de tarefas aprovados antes da tag `[TDD]` voltaram a passar no
  `gate tasks` e no `verify`: uma tarefa `[TEST]` que precede o código
  conta como TDD. O mínimo TDD passa a contar critérios de aceite distintos.
- O research recusa claim inválido, qualquer que seja a criticidade, e só
  aceita índice vazio quando nenhum claim exige evidência.
- O Contrato CRUD declara, por operação, o controle de interface e a tarefa
  que o implementa. Uma negação ("não haverá botão") não conta, e a ordem
  das palavras não importa.
- O catálogo ganhou `stack: true` (especialista que exige a tecnologia
  confirmada), `aliases` (nomes como aparecem no `STACK.md`, por exemplo
  "PostgreSQL" e "Next.js") e `detect.images` (imagem num arquivo Compose,
  usada pelo n8n). Interface e arquitetura voltam a ser sugeridos sem
  ferramenta instalada. "Sem Redis" no `STACK.md` não confirma o Redis. O
  Laravel só é confirmado por `artisan` ou `laravel/framework`.
- O `verify` calcula a stack uma vez e transforma falha de detecção em
  aviso, sem perder a resposta do gate.
- O `specs transition` serializa a transição por spec, corrige backlinks
  antigos de forma idempotente e compara caminhos resolvidos, inclusive em
  links Markdown.
- Os parsers reconhecem `### Plano técnico` e `### Tarefas` sem número.
- O `signals --check` falha quando falta um dos marcadores da tabela.
- No site, o build da 3.106.12 falhava com os 301 que têm âncora acentuada.
  A correção saiu no website 3.106.13.

## [0.40.0] - 2026-11-20

### Adicionado

- Seis especialistas novos:
  - `mcp`: servidores MCP por HTTP, com os modos protocol, laravel (pacote
    `laravel/mcp`) e nextjs;
  - `mysql`, com os modos schema, queries e operation;
  - `mongodb`, com os modos modeling, queries e operation;
  - `cloudflare`, com os modos dns, workers e security;
  - `n8n`, com os modos workflows, self-hosting e integration;
  - `testing`, com os modos pest, playwright e vitest.
- O `laravel` ganhou o modo `mcp`, o `docker` ganhou o modo `proxy`
  (Traefik) e o `delivery` ganhou a referência de GitHub Actions no modo
  ci-cd.
- `specsfy specialists suggest <spec>` (também `skills suggest`) e a tool
  MCP `specialists_suggest`. O comando lê a spec, procura os sinais do
  catálogo e lista o especialista e o modo sugeridos. Para cada um, informa se
  já está declarado na spec e se está instalado. Um especialista de tecnologia
  só aparece quando a stack do projeto o confirma, pela detecção do catálogo
  ou pelo `.specsfy/STACK.md`.
- O `specsfy verify` avisa quando a spec declara um especialista que não
  existe ou não está instalado, e quando um sinal casado fica sem
  especialista declarado.
- A prévia da spec na TUI mostra a linha "Especialistas".

### Alterado

- Os sinais de cada especialista passaram a viver no `catalog.json`, em
  `triggers` (sinal, modo e palavras-chave) e `modes` (nome, título da seção
  no guia e o especialista antigo absorvido). As 7 tabelas de sinais das skills
  base são geradas pelo `scripts/specialist-signals.mjs` (`npm run signals`),
  e um teste falha se uma cópia divergir. Entraram sinais novos: validade, cota
  de uso, valor monetário, papel por equipe e CRUD parcial. O `postgres` e o
  `supabase` só entram com a tecnologia confirmada no `STACK.md`.
- Os 21 especialistas foram revisados contra a documentação oficial atual.
  Entre as mudanças: React 19.3, Next.js 16.4, TypeScript 7, Tailwind CSS 4.3,
  shadcn CLI v4, PostgreSQL 19, Redis 8.10, OWASP Top 10:2025, ASVS 5.0 e
  OpenAPI 3.2.1.
- Correções vindas de um ensaio de ponta a ponta do método:
  - os gates encontram a raiz do projeto sem `.git`;
  - um teste de regressão deixou de contar como TDD;
  - o Contrato CRUD declara as `Operações:` incluídas, e o validador só
    cobra essas;
  - o research aceita índice vazio quando a spec declara que não usa fonte
    externa;
  - o `specs transition` atualiza o vínculo "Spec promovida" no backlog;
  - o `05-tasks` pode atualizar a lista de especialistas;
  - entrou um protocolo para escolhas delegadas;
  - a seção "No Specsfy" diz de onde o especialista lê em cada fase.
- Octane com Open Swoole e ReUI ausentes viraram pendência de stack, cobrada
  antes do deploy, em vez de travar o setup (decisão do Luiz).
- No site, os 301 dos especialistas agrupados apontam para a seção do modo,
  por exemplo `/docs/specsfy/especialistas/delivery/#versionamento`.

## [0.39.0] - 2026-11-20

### Alterado

- Os especialistas foram agrupados: de 38 para 21. Os pequenos e os que
  dividiam o mesmo assunto viraram modos de um único especialista, com
  references, scripts e assets mesclados. Os 11 agrupamentos:
  - `laravel` absorveu `laravel-package-manager`;
  - `ui-components` juntou `react-ui-components`, `reui` e `shadcn-ui`;
  - `interface` juntou `interface-experience`, `design-system`,
    `ui-design`, `ux-design` e `web-accessibility`;
  - `modeling` juntou `domain-modeling` e `data-modeling`;
  - `architecture` juntou `software-architecture` e `web-api-design`;
  - `docker` absorveu `docker-swarm`;
  - `server` juntou `debian-server`, `ansible` e `server-report`;
  - `delivery` juntou `deploy`, `versioning` e `delivery-engineering`;
  - `git` juntou `gitflow` e `merge-conflict-resolution`;
  - `observability` absorveu `performance-engineering`;
  - `research` juntou `technical-research` e `prototyping`.

  Continuam como estão `react`, `nextjs`, `postgres`, `supabase`,
  `redis`, `typescript`, `tailwind-css`, `application-security`,
  `code-review` e `debugging`.
- Todo especialista tem, no `SKILL.md`, um guia "Quando usar": uma tabela
  que liga cada situação ao modo e ao reference a abrir, e uma lista "Não use
  para", que aponta o especialista certo para cada caso.
- O catálogo soma a detecção dos especialistas agrupados. As dependências
  passaram para os nomes novos: o `delivery` depende de `server` e
  `docker`.
- Os 25 nomes antigos estão em `renamed` no inventário, e o
  `specsfy update` troca os instalados pelo especialista que os absorveu.
- Os especialistas entram no fluxo das specs. A spec ganha a linha
  `Especialistas` na tabela de metadados e a subseção `#### Especialistas`
  no Plano técnico, que lista especialista, modo, sinal e fases. Cada fase
  chama o especialista conforme a demanda:
  - o `specsfy-02-backlog` anota os especialistas prováveis;
  - o `specsfy-03-specify` preenche a lista pela tabela de sinais e carrega o
    especialista antes de escrever a seção que depende dele;
  - o `specsfy-05-tasks` marca `Especialista:` em cada tarefa;
  - o `specsfy-06-implement` carrega os especialistas da spec e da tarefa;
  - o `specsfy-04-validate` confere se foram instalados e aplicados;
  - o `specsfy-update-spec` mantém a lista em dia.
- Todo especialista ganhou a seção "No Specsfy": ler a spec aberta, o
  `STACK.md` e o `RULES.md`, seguir o modo indicado, devolver as conclusões
  para a seção da spec ou para a tarefa e nunca mudar o estado da spec.
- No site, a página de cada especialista antigo responde 301 para a página
  do especialista novo. A etapa do site do `scripts/release.mjs` gera esses
  301 sozinha, a partir do `renamed`.

## [0.38.0] - 2026-11-20

### Removido

- O especialista `specsfy-specialist-astro` saiu do catálogo, junto com os
  guias `docs/user/astro.md` e `docs/user/specialists/astro.md`. Ele passa a
  constar em `retired` no inventário, e o `specsfy update` o remove dos
  projetos onde estiver instalado. As menções a ele nos outros especialistas
  e nos docs saíram; as que falam do Astro como framework continuam.

### Alterado

- A etapa do site do `scripts/release.mjs` agora também trata remoções. Uma
  página cuja fonte saiu do repositório é apagada do site. Se não houver 301
  cadastrado para o endereço, ele ganha um 410 em `src/config/gone.mjs`.

## [0.37.0] - 2026-11-20

### Adicionado

- A TUI avisa quando uma versão nova do `specsfy` é instalada com ela
  aberta. O processo aberto não recarrega o próprio código. A cada 30 s a
  TUI confere a data do executável em uso e do `specsfy` do PATH; se algum
  mudou, ela pergunta a versão instalada. Quando a versão é diferente, o
  cabeçalho mostra `• vX.Y.Z installed: press q and reopen`. No invólucro
  npm, essa consulta já baixa o binário novo, e reabrir fica imediato.

## [0.36.2] - 2026-11-20

### Corrigido

- A sitespec que a etapa do site gera tinha um valor com dois-pontos sem
  aspas, o que quebrava o frontmatter. Os valores de texto passam a ir entre
  aspas, e a etapa valida a sitespec com o `astrofy` antes de commitar.

## [0.36.1] - 2026-11-20

### Alterado

- Publicação sempre sincronizada: dentro do Hub, `scripts/release.mjs
  --publish` publica o Specsfy e em seguida atualiza o site
  (`/docs/specsfy/` sincronizado, ebook e imagens no R2, sitespec, release
  do website e conferência em produção) e o Hub (gitlinks do specsfy e do
  website, versão, changelog e release). `--no-site` e `--no-hub` pulam
  essas etapas.

## [0.36.0] - 2026-11-20

### Adicionado

- `scripts/release.mjs --hub`: depois da publicação, atualiza o Hub da
  Promovaweb com o gitlink novo, a versão, o changelog (gerado dos itens da
  seção da versão), a tag e a GitHub Release, sem tocar em arquivos não
  commitados de outras pessoas.
- TUI: Enter numa spec da Overview abre a spec na aba Specs; `u` desfaz o
  último item marcado e `e` registra o esforço (aba Specs); `p` processa a
  captura selecionada do inbox e `b` cria um item de backlog (aba Backlog);
  `v` roda o `specsfy verify` do projeto (aba Gates).
- Mouse na TUI: clique seleciona itens de lista e abre abas; a roda rola.

### Alterado

- A aba Skills usa a mesma barra de ações das outras telas.
- A barra de teclas se ajusta à largura: as teclas globais encolhem para
  `? help` e `q quit` e, se faltar espaço, as dicas da tela são cortadas
  do fim. As listas ocupam até 40% da largura em terminais estreitos.
- O `example/` passa a usar as pastas de estado: as specs 0001 a 0005 em
  `specs/completed/` e a 0006 em `specs/defined/`. Os testes que dependiam
  do layout antigo foram ajustados, e o teste da migração monta o próprio
  caso legado.

## [0.35.1] - 2026-11-20

### Corrigido

- O teste do filtro `/` falhava às vezes no CI: a prévia do Markdown da spec
  selecionada antes carrega de forma assíncrona e ainda citava o nome dela.
  O teste passa a conferir só a coluna da lista.

## [0.35.0] - 2026-11-20

### Adicionado

- Ações na TUI, sempre pelas mesmas funções do CLI e com confirmação:
  `t` muda o estado da spec selecionada (estados vizinhos numerados e `y`
  para confirmar), `Espaço` marca o próximo item de checklist da primeira
  tarefa pronta, `n` cria uma spec em `specs/draft/` pedindo o título na
  barra de teclas, e `c`, na aba Backlog, registra uma captura no inbox. O
  resultado aparece no rodapé da tela e o projeto recarrega.
- Aba Milestones: os milestones de `specs/milestones/` com a porcentagem do
  progresso derivado e a prévia do Markdown; `s` sincroniza, como
  `specsfy milestones sync`.
- Aba Context: os documentos de contexto do projeto (PROJECT.md, design
  system, interface e os arquivos de `.specsfy/`), marcando os que existem,
  com prévia.
- Painel Doctor na aba About, com as checagens locais de `specsfy doctor`.
- `actionBar` e `ctx.prompt` para telas que executam ações.

### Alterado

- A TUI passa de 7 para 9 abas; `--tab` e `tui.initialTab` aceitam
  `milestones` e `context`. Em terminais estreitos, a barra de abas rola
  até a aba selecionada.
- Na aba Specs, `Espaço` deixa de rolar o Markdown (`PgUp`/`PgDn`
  continuam). O painel Standards da aba About deu lugar ao Doctor.
- O projeto de demonstração do showcase ganhou milestones e arquivos de
  contexto; o showcase passa a ter 20 prints.

## [0.34.1] - 2026-11-20

### Corrigido

- O `showcase:check` falhava fora da máquina que gerou os prints: num
  caminho longo (CI, worktree), o cabeçalho da TUI cortava o caminho do
  projeto antes da troca por `~/projects/loja-online`. O projeto de
  demonstração passa a ser montado num caminho curto e fixo, a captura espera
  o fim de qualquer carregamento e a verificação mostra a primeira linha
  diferente. A 0.34.0 não teve binários publicados por causa dessa falha;
  esta é a primeira versão com o filtro `/`, as abas novas, o smoke do
  binário, o script de release e o projeto de demonstração.

## [0.34.0] - 2026-11-20

### Adicionado

- Filtro `/` nas listas da TUI (Specs, Backlog, Gates e Skills): o texto
  digitado filtra pelo rótulo, sem diferenciar maiúsculas nem acentos, e o
  título da lista mostra a consulta. Enter mantém o filtro, Esc limpa, e as
  teclas globais não disparam enquanto se digita.
- `bun run smoke`, último passo do `bun run validate`: roda o binário
  compilado sem rede (`--version`, `--skill`, `mcp --list`, `doctor`,
  `install` a partir do próprio repositório e `update --check`), para pegar
  antes da tag uma falha que só aparece no binário, como a da 0.32.0.
- `scripts/release.mjs` (`npm run release -- X.Y.Z`): prepara a versão,
  os arquivos gerados, o ebook, o showcase e roda todas as validações; com
  `--publish`, commita, cria a tag, espera o CI, confere os binários e
  publica o wrapper npm.
- Projeto de demonstração do showcase em `cli/tests/fixtures/showcase-project/`
  (`bun run demo:build`), uma loja online com specs em todos os estados,
  backlog e inbox. Os prints de `docs/user/assets/showcase/` passam a usá-lo.

### Alterado

- Abas da TUI com largura igual e título centralizado, ajustadas à largura do
  terminal; a aba ativa é marcada só pelo fundo, sem a linha de sublinhado.
- Overview: as specs abertas vêm antes das concluídas (estado Completed) e o
  gráfico de gates por spec diz "1 spec" no singular; o guia mostra os dois
  primeiros próximos passos sem cortar o texto.

### Corrigido

- Os testes do ciclo de vida copiavam o `example/` inteiro, com
  `node_modules` e `vendor`, e às vezes estouravam o tempo do
  `beforeAll`. A cópia deixa essas pastas de fora.

## [0.33.1] - 2026-11-20

### Corrigido

- `specsfy-05-tasks` recupera, na seção `Ver o progresso`, as regras que
  saíram com a `specsfy-progress`: pendência `PENDING` do monitor de
  contexto e `docs/` ausente ou desatualizado também impedem o avanço, e o
  agente encaminha pelo estado observado (`specsfy-update-spec`,
  `specsfy-02-backlog`, `specsfy-03-specify` ou a próxima skill que o
  progresso indicar).

## [0.33.0] - 2026-11-20

### Alterado

- As skills do framework passam de 19 para 11. O ciclo fica
  `01-inbox` → `02-backlog` → `03-specify` → `04-validate` →
  `05-tasks` → `06-implement`, com `specsfy-setup`,
  `specsfy-update-spec`, `specsfy-interviewer`, `specsfy-milestones` e
  `specsfy-documentator` ao lado. Nas skills que reúnem mais de um
  assunto, o `SKILL.md` escolhe o modo pelo pedido e o texto de cada modo
  fica em `references/<modo>.md`:
  - `specsfy-setup` ganha os modos `stack`, `rules`, `database` e
    `data-discovery`, no lugar de `specsfy-aux-stack`,
    `specsfy-aux-rules`, `specsfy-aux-database` e
    `specsfy-data-discovery`.
  - `specsfy-06-implement` reúne `specsfy-06-tdd-bdd` (modo `tests`) e
    `specsfy-07-implement` (modo `implement`).
  - `specsfy-milestones` reúne `specsfy-mvp-milestone-interviewer`
    (modo `mvp`), `specsfy-roadmap-milestone-interviewer` (modo
    `roadmap`) e `specsfy-milestone-governor` (modo `sync`).
- Os scripts das skills reunidas mudam de pasta junto com elas; os commands
  do CLI e as tools MCP continuam com os mesmos nomes.

### Removido

- `specsfy-progress`. O command `specsfy progress` e a tool MCP
  `project_status` mostram o mesmo progresso. Os scripts dela passam a
  `specsfy-05-tasks` (`progress.mjs`, `parse_tasks.mjs`) e
  `specsfy-setup` (`analyze_context.mjs`).

### Migração

- Rode `specsfy update` em cada projeto. O inventário registra os nomes
  antigos em `renamed` e `retired`: o update instala as skills novas e
  remove as antigas. Skill antiga com alteração sua é mantida e listada em
  `kept`; revise e rode `specsfy update --force` para concluir.
  `specsfy update --check` mostra o plano antes.

## [0.32.1] - 2026-11-20

### Corrigido

- O binário compilado lia o inventário de skills por dois caminhos de
  importação e, no build de release, podia receber texto no lugar do objeto,
  falhando ao iniciar com `invalid skills inventory: not an object`. O
  inventário passa a ser lido só da árvore de skills embutida. A 0.32.0 não
  teve binários publicados por causa dessa falha; esta é a primeira versão
  com o `update` pelo inventário.

## [0.32.0] - 2026-11-20

### Adicionado

- `skills/inventory.json`, a lista única das skills do framework, dos nomes
  trocados (`renamed`) e das skills aposentadas (`retired`). O binário
  embute o inventário da própria versão.
- `specsfy update --check` mostra o que seria instalado, atualizado ou
  removido sem escrever nada e sai com código 10 quando o projeto difere do
  inventário. `--latest`, em `update` e `install`, usa a branch padrão
  do repositório do framework.
- Check `inventory` em `doctor --project` e linha `Inventory` na aba
  Skills da TUI, que avisam sem rede quando as skills do projeto diferem do
  inventário do binário. O `upgrade` lembra de rodar `update` nos
  projetos.

### Alterado

- `specsfy update` (e `skills update`, tool `framework_update`) passa a
  reconciliar o projeto com o inventário: instala as skills do framework que
  faltam, atualiza as que mudaram, remove as renomeadas e as aposentadas e
  atualiza os especialistas instalados, pelo CLI `skills`. Antes ele só
  atualizava o que já estava instalado. O `--json` ganha `check`,
  `in_sync` e `plan`.
- Skill com alteração local deixa de interromper o `update`: ela é mantida
  e listada em `kept`, e o restante é atualizado. `--force` continua
  substituindo.
- `install`, `update` e a aba Skills baixam as skills da tag `v<versão>`
  do binário, para que skills e inventário sejam da mesma revisão. Sem essa
  tag no repositório, vale a branch padrão.

## [0.31.1] - 2026-11-20

### Corrigido

- Abrir a TUI: READMEs (raiz, `specsfy/`, `cli/`, `skills/` e o do pacote
  npm), guias e referência deixam claro que `specsfy` sem argumentos, na
  pasta do projeto, já abre a TUI. `specsfy tui` aparece só para
  `--project` e `--tab`. As teclas de saída citadas são as reais: `q`,
  `Esc` ou `Ctrl+C`, no lugar de `Ctrl+Q`.
- Documentação de usuário alinhada ao binário: o executável não precisa de
  Node.js nem de `npx` (o CLI de skills roda no runtime embutido; só o
  wrapper npm e o launcher de `get.specsfy.dev` usam Node 18 ou superior);
  `--specialist` e `--spec` recebem lista separada por vírgula; tópicos
  válidos de `skill`; `tasks delivery --format markdown|json`; sem
  `gate tasks --delivery`; `context monitor --check` sai com 10;
  `credentials rotate-key` e `get --reveal`; `doctor --project` confere o
  CLI de skills; exit codes de `test`; abas, teclas e tema da TUI como são
  hoje (sem botão **Aplicar**, ações confirmadas com `y`, `c` baixa o
  catálogo de novo, `g` abre a aba Gates).
- Documentação de desenvolvimento (`docs/develop/`) descreve o CLI atual em
  Bun, OpenTUI e MCP, no lugar do CLI antigo em Node, Commander e
  neo-blessed: arquitetura, pacotes, stack, testes, contribuição,
  atualização do binário e privacidade. As ferramentas da raiz aparecem como
  Node.js e `node:test`, sem as referências a Python, Behave e `uv`.
- `cli/docs/tui.md` documenta os componentes de gráfico e as cores reais da
  lista com seleção.

## [0.31.0] - 2026-11-20

### Adicionado

- Overview da TUI como painel de estatísticas das specs: barra de progresso
  geral (média das specs), medidores de specs completas, gates aprovados,
  tarefas e itens de checklist, gráfico de specs por estado, gates aprovados
  por tipo e por spec, e a lista das specs com os três gates, barra própria,
  tarefas e estado, com as abertas primeiro. As barras acompanham a largura
  do terminal; com menos de 38 linhas, o backlog e o guia saem da Overview e o
  primeiro próximo passo aparece em `Progress`.
- Showcase da TUI em `docs/user/assets/showcase/`: prints de todas as telas
  (Overview, Specs, Backlog, Gates, Tests, Skills, About e o help de teclas),
  nos temas `night` e `day`, gerados a partir do projeto `example/`.
  `bun run showcase` atualiza as imagens das telas que mudaram e
  `bun run showcase:check`, agora parte do `validate`, falha quando uma
  tela muda sem atualizar os prints.

### Alterado

- As imagens de `docs/user/assets/cli/` usadas pelo guia do CLI, pelo site e
  pelos READMEs saem do showcase e mostram a TUI atual, no lugar dos prints
  da 0.8.0. O texto do percurso visual em `docs/user/cli.md` acompanha as
  telas de hoje.

## [0.30.0] - 2026-11-20

### Adicionado

- Tema `terminal` na TUI, agora o padrão de `tui.theme`. Cada cor é uma
  referência à paleta ANSI ou ao texto e fundo padrão do terminal, sem RGB
  fixo, então a TUI segue o tema do terminal (Ghostty, Alacritty, Kitty,
  Omarchy, Termius, Herdr e outros), acompanha a troca de tema com a TUI
  aberta e mantém a transparência do terminal. Ao abrir, a TUI consulta a
  paleta (OSC 4, 10 e 11, espera de 300 ms) e escolhe os slots por contraste.
  O turquesa da marca vira o ciano do terminal e o violeta da seleção vira o
  magenta. `night` e `day` continuam como paletas fixas da marca. O método
  é o mesmo do Termfy Starter Kit.

## [0.29.5] - 2026-11-20

### Corrigido

- No Windows, um `npx.cmd` ou outro `.cmd`/`.bat` informado em
  `SPECSFY_NPX_COMMAND` ou `SPECSFY_SKILLS_CLI` passa a rodar pelo `cmd.exe`,
  com o caminho e os argumentos escapados. `specsfy install` e
  `specsfy update` deixam de falhar com `EINVAL`, recusa do Node desde a
  CVE-2024-27980, e com caminhos que têm espaço, como `C:\Program Files`.
  Relato da issue #29.
- `specsfy specs migrate` reescreve o índice de research do layout anterior
  (`specs/specs/<id>/` e `specs/<id>/`) para a pasta de estado. Antes, o
  `load_research.mjs` recusava como inseguro um artefato que o próprio comando
  tinha movido. A transição entre estados já fazia isso. Issue #34.
- `verify_acceptance.mjs` e `registrar_dados_conversados.mjs` dividem a
  tabela só nos pipes sem escape. Um comando como `npm test \| tee log` não
  desloca mais a evidência do AC, e uma linha antiga com `\|` em
  `.specsfy/DATABASE.md` ganha a coluna de formato sugerido. Completa a
  issue #43, que já valia para o `update_stack.mjs`.
- `inspect_project.mjs` lê cada arquivo pelo caminho real depois de
  normalizar o separador do Windows. Testes, aplicação e rotas em subpastas
  voltam a ser classificados no Windows. Issue #48.

## [0.29.4] - 2026-11-20

### Corrigido

- `specsfy update`, `specsfy doctor` e a TUI leem o `skills-lock.json` na
  versão 2, gravada pelo gerenciador `skills` a partir da 1.9. Um projeto
  recém-instalado deixa de ser recusado com "unsupported lock version".
  Versões desconhecidas continuam recusadas. Contribuição de Lucas Fuad na
  PR #56.
- A proteção do banco em `$specsfy-setup` compara o destino normalizado.
  `DB_URL` é decomposta em driver, host, porta e banco, com os parâmetros da
  query aplicados por último, como no Laravel. Aliases de driver, hosts locais e
  portas padrão são equivalentes. Um `.env.testing` que aponta para o banco de
  desenvolvimento escrito de outra forma passa a ser recusado. URLs sem banco
  nos dois arquivos contam como o mesmo banco padrão. Contribuição de Lucas
  Fuad na PR #55, com os dois casos apontados na revisão.
- `load_research.mjs` lê a seção de research inteira. Antes, só o primeiro
  artefato e o primeiro claim eram lidos, e um claim `critical` refutado na
  segunda linha passava. Só conta como artefato o caminho que abre um item da
  lista, e a orientação do template mantida na seção não é lida como
  artefato.
- Os scripts de inbox, backlog, spec, setup, descoberta de dados e importação
  do MVP inserem o texto do usuário de forma literal. Sequências como `$&`,
  ``$` `` e `$'` deixam de ser interpretadas como padrões de substituição.
- `analyze_change.mjs` aceita uma spec aberta por link simbólico do
  repositório, como `/tmp` e `/var` no macOS.
- `check_traceability.mjs` ignora `.claude/`, onde o Claude Code cria
  worktrees com cópias dos testes.
- Contribuições de Lucas Fuad na PR #54.

### Validação

- `npm test` na raiz: 493 testes, 11 novos, com RED observado no 0.29.3.
- CLI: `bun run validate`, com typecheck, testes, OpenCLI, docs e build.
- `npm run validate:skills`, `npm run test:example` e `make verify-version`.
- O lock na versão 2 foi reproduzido com o gerenciador `skills` 1.9.0.

### Atualização

- Atualize o CLI com `npm install -g @promovaweb/specsfy@0.29.4` e as skills
  do projeto com `specsfy update`, preservando alterações locais.

## [0.29.3] - 2026-11-15

### Alterado

- Skills `specsfy-06-tdd-bdd`, `specsfy-07-implement` e `specsfy-interviewer` e o contrato `skills/Spec.md` descrevem o status da tarefa remota no ClickUp pelo trabalho real do agente: próxima etapa até um agente atuar, `em andamento` só durante a execução, volta para próxima etapa com comentário ao parar sem concluir, `revisar` na entrega e `pronto` ou `concluido` só por ordem humana.
- Documentação do método, dos casos de uso e do entrevistador alinhada à mesma regra.

## [0.29.2] - 2026-11-14

### Corrigido

- Revisada a redação do guia do usuário em `docs/user/`, com explicações mais precisas e correções de linguagem.
- Atualizados os formatos portáteis da documentação a partir das fontes revisadas.

## [0.29.1] - 2026-11-13

### Corrigido

- A tag `v0.29.0` não gerou GitHub Release: o job `binaries` reprovou porque
  `cli/docs/opencli.json` ainda declarava a versão 0.28.1. Esta versão publica
  o mesmo conteúdo da 0.29.0 com a descrição OpenCLI regenerada.
- A skill `specsfy-release-cli` e o `CONTRIBUTING.md` passam a regenerar
  `cli/docs/opencli.json` com `bun run opencli` e a rodar `bun run validate`,
  o mesmo gate do workflow de release, antes do commit da versão.

### Adicionado

- Os três capítulos novos do guia do usuário e do ebook, anunciados na 0.29.0,
  chegam ao público nesta versão: casos de uso, exemplos completos e
  referência rápida.

## [0.29.0] - 2026-11-13

### Adicionado

- O guia do usuário ganhou três capítulos, também no ebook:
  `docs/user/use-cases.md`, com nove receitas por situação (ideia na Inbox,
  bug com teste de regressão, CRUD com interface, MVP, mudança depois da
  definição, banco de dados, projeto existente, acompanhamento e retomada);
  `docs/user/examples.md`, com os arquivos de uma entrega real da aplicação de
  `example/`, do texto original à evidência dos testes, e mensagens prontas
  para cada etapa; e `docs/user/reference.md`, com arquivos, estados, gates,
  Effort, identificadores, checklist, skills, comandos do CLI, proteções,
  glossário e referências externas.

### Corrigido

- O portal do guia do usuário apontava para a edição v1.8.0 do ebook e agora
  usa os aliases permanentes `ebook-specsfy.pdf` e `ebook-specsfy.epub`.
- As edições v1.7.20 a v1.9.0 do ebook, anteriores ao reinício da numeração em
  0.x, foram removidas. A retenção mantinha esses arquivos porque o SemVer
  deles é maior que o da edição vigente.

## [0.28.1] - 2026-11-13

### Alterado

- A publicação no npm passa a ser feita só pela máquina local; o workflow de
  release não publica mais no npm.
- O `CLI Release` (`.github/workflows/cli-release.yml`) perde o job `npm` e
  continua compilando os cinco binários, gerando o `SHA256SUMS` e criando a
  GitHub Release. O workflow não usa mais `NPM_TOKEN` nem `id-token: write`.
- A skill `specsfy-release-cli`, o `CONTRIBUTING.md`, o `cli/docs/release.md`,
  os `AGENTS.md` e os fluxos de `docs/develop/` descrevem a publicação local:
  `npm pack` em `cli/npm/` no commit da tag, `npm publish <tgz> --access public`
  e conferência com `npm view @promovaweb/specsfy version license`.

## [0.28.0] - 2026-11-13

### Alterado

- A partir desta versão, o projeto é distribuído sob a GNU AGPL 3.0 (SPDX
  `AGPL-3.0-only`); versões anteriores continuam sob a licença com que foram
  publicadas.
- O texto oficial e integral da AGPL 3.0 está no `LICENSE` da raiz, que não
  existia, e substitui a MIT em `cli/LICENSE`, `cli/npm/LICENSE` e
  `specialists/LICENSE`.
- O campo `license` de `package.json`, `package-lock.json`,
  `cli/package.json` e `cli/npm/package.json` passa a `AGPL-3.0-only`. O
  `specsfy about` e o `cli/docs/opencli.json` mostram a nova licença.
- O `README.md` ganhou o badge de licença e a seção Licença, que também entra
  no `cli/npm/README.md` do pacote npm. A licença não concede o uso do nome e
  do logo do Specsfy nem da marca Promovaweb (AGPL 3.0, seção 7, item e).
- O `CONTRIBUTING.md` registra que as contribuições entram sob a mesma
  licença do projeto.

## [0.27.3] - 2026-11-13

### Documentação

- A tabela de códigos de saída de `docs/user/cli-reference.md` passa a seguir
  `cli/src/app/exit-codes.ts`, a mesma fonte do `specsfy --help`. O código `7`
  é permissão negada no sistema de arquivos, e projeto ou spec ausente sai com
  `6`. A tabela ganhou a coluna com o nome de cada código e o `130` de
  interrupção.
- A descrição do `specsfy doctor` em `docs/user/cli-reference.md` e em
  `docs/user/cli.md` informa o código real de uma checagem reprovada, `3`, no
  lugar de `1`. A tabela resumida do `README.md` da raiz ganhou a linha do `3`.

## [0.27.2] - 2026-11-13

### Documentação

- O `README.md` da raiz foi reorganizado para quem usa o Specsfy. Ele abre
  com o logo, a ligação com a Promovaweb, os badges, o banner do Discord e os
  links de documentação, planos e changelog. Depois traz instalação, primeiros
  passos, uso, MCP, códigos de saída, os repositórios usados e a licença MIT
  do CLI.
- O novo `CONTRIBUTING.md` reúne o que antes ficava no README para quem
  contribui: ambiente, organização dos módulos, fluxo BDD e TDD, validação,
  documentação, commits e release.
- O tutorial em `specsfy/README.md` ganhou o mesmo cabeçalho e as seções de
  comunidade e da Promovaweb.
- O `.markdownlint.json` da raiz libera o HTML do cabeçalho.

## [0.27.1] - 2026-11-13

### Corrigido

- O validador de skills do framework (`npm run validate:skills`) deixa de
  conferir as skills `termfy*` instaladas em `cli/.agents/skills/` pelo
  `npx skills`. Elas seguem o contrato do repositório Termfy e têm o hash
  conferido em `cli/skills-lock.json`; a descrição de `termfy-database`
  derrubava o workflow `CLI Release` da 0.27.0.

### Observações

- A tag `v0.27.0` não chegou a gerar GitHub Release nem pacote npm, porque o
  workflow parou antes da compilação. A 0.27.1 é a primeira versão publicada
  do CLI em Bun e traz todas as mudanças descritas na seção 0.27.0.

## [0.27.0] - 2026-11-13

### Alterado

- O CLI foi reescrito em Bun sobre o Termfy e passa a ser um binário
  compilado para Linux (x64 e arm64), macOS (x64 e arm64) e Windows (x64),
  sem Node.js nem Bun na máquina. Os executáveis e o `SHA256SUMS` saem em cada
  GitHub Release; o pacote npm `@promovaweb/specsfy` vira um wrapper que baixa
  o binário da plataforma na primeira execução, e `scripts/install-cli.sh`
  instala o binário direto.
- O binário carrega a árvore `skills/` e executa os scripts das skills com o
  próprio runtime. As skills base passam a indicar o command do `specsfy` e a
  tool MCP equivalente, e mantêm os scripts `.mjs` como alternativa.
- `transition`, `effort` e `migrate` passam para `specs transition`,
  `specs effort` e `specs migrate`. Os nomes antigos continuam aceitos como
  aliases ocultos.
- Saída `--json` em envelope `{ ok, command, data }`, com `ok: false` e `code`
  quando o exit code não é 0. Gates reprovados saem com o exit code 10
  (`GATE_FAILED`).
  Scripts que liam o JSON direto, como o `progress --json` da 0.26, passam a
  ler o campo `data`.
- `config show`, `config set --watch-interval` e `progress --interval`
  continuam aceitos, e o `watch_interval` de `.specsfy/config.json` segue
  valendo para o `progress --watch`.
- O token do GitHub vem da credencial cifrada `github.token`, de `GH_TOKEN`,
  de `GITHUB_TOKEN` ou de `gh auth token`, nesta ordem. `upgrade` troca o
  binário a partir da última release, conferindo o `SHA256SUMS`.

### Adicionado

- Servidor MCP (`specsfy mcp`) com tools para ler o projeto
  (`project_status`, `specs_list`, `spec_get`), mover o trabalho pelo método
  (`spec_transition`, `spec_effort`, `task_check`, `inbox_capture`,
  `inbox_process`), rodar gates (`gate_*`, `verify`), testes
  (`project_test`), contexto, milestones, documentação e gerenciar skills.
- Commands `status`, `specs list|show|new|research|change`,
  `tasks next|check|delivery`, `inbox list|capture`, `backlog list|start`,
  `gate spec|tasks|interface|trace|acceptance|evidence|findings|database`,
  `verify`, `context setup|inspect|interface|monitor|stack|rule|database|data|usage`,
  `milestones import-mvp`, `docs build`, `scripts list|run`.
- `<spec>` aceita número, nome da pasta, slug ou caminho, e todo command de
  projeto acha a raiz subindo a partir da pasta atual ou usa `--project`.
- TUI com as abas Overview, Specs, Backlog, Gates, Tests, Skills e About,
  atualizada sozinha quando os arquivos das specs mudam.
- Documentação embutida (`specsfy --skill`), descrição OpenCLI
  (`specsfy --opencli`), settings em `~/.specsfy/settings.json` e
  `CLISPEC.md` com as specs 0001 a 0011 do binário.

### Corrigido

- `skills remove` volta a tirar a entrada do `skills-lock.json`.
- Saídas grandes deixam de ser cortadas quando o stdout é um pipe.
- Identificadores de spec, nomes de skill e o `--attestation` ficam presos ao
  projeto: nenhum command ou tool MCP lê, grava ou remove arquivos fora dele.
- Gates que executam código do projeto (`gate tasks`, `gate evidence`,
  `gate database`) deixam de se anunciar como só leitura no MCP.
- Um token do GitHub vencido não impede mais a checagem de versão.
- O `upgrade` de uma instalação npm local ou via `npx` não instala o pacote
  globalmente.

### Observações

- A primeira execução pelo npm ou pelo `get.specsfy.dev` baixa o binário da
  plataforma, com cerca de 125 MB.
- Não há build para musl; em Alpine, use uma imagem com glibc.

## [0.26.2] - 2026-11-11

### Corrigido

- O manifesto do ebook volta a refletir as fontes atuais. A 0.26.1 alterou
  `.ebook/build-ebook.sh`, que também entra no `source_sha256`, sem regenerar o
  ebook; o CI da tag v0.26.1 falhou e o pacote não chegou ao npm. A 0.26.2
  regenera a edição e substitui a 0.26.1.
- A validação da ordem de leitura em `build-ebook.sh` também ordena com
  `LC_ALL=C`.

## [0.26.1] - 2026-11-11

### Corrigido

- O hash das fontes do ebook (`source_sha256` em `ebook/build.json`) deixa de
  depender do idioma do sistema. `build-ebook.sh` ordena `docs/user/` com
  `LC_ALL=C`, e o manifesto gerado numa máquina em `en_US.UTF-8` passa na
  verificação do CI, que roda com a ordenação C. Com isso, o job da tag volta a
  publicar `@promovaweb/specsfy` no npm.

## [0.26.0] - 2026-11-11

### Alterado

- As 19 skills base foram reescritas para agentes atuais da OpenAI e da
  Anthropic. Cada `SKILL.md` abre com o objetivo, declara `Pronto quando`,
  separa leituras paralelas de passos sequenciais e descreve na `description`
  quando usar e quando não usar a skill. A ênfase excessiva deu lugar a
  instruções com motivo, e trechos duplicados do `Spec.md` viraram referências.
  Os prompts de `agents/openai.yaml` ficaram mais específicos.
- `Spec.md` ganhou a seção `Compatibilidade entre agentes`, com a leitura de
  `$<nome>` no Codex, no Claude Code e nos demais agentes, e a regra dos
  caminhos de script.

### Corrigido

- Os estados canônicos em `Spec.md`, `skills/README.md` e
  `quality-gates.md` passam a incluir `Reviewing`.
- Listas numeradas que reiniciavam depois de blocos de código em
  `specsfy-02-backlog`, `specsfy-03-specify`, `specsfy-04-validate` e
  `specsfy-07-implement` voltaram a ter sequência contínua.
- `specsfy-05-tasks` lista `[MIGRATION]` entre as tags aceitas pelo
  `validate_tasks.mjs`.
- Skills auxiliares, `specsfy-setup` e `specsfy-documentator` citam scripts com
  o caminho completo `.agents/skills/<skill>/scripts/`.
- `specsfy-mvp-milestone-interviewer` usa o formato canônico de transição e
  oferece `Gere outras opções` em cada rodada.
- `$specsfy-documentator` respeita o `.gitignore` do projeto. Dentro de um
  repositório Git, `build_documentation.mjs` lê a lista de
  `git ls-files --cached --others --exclude-standard` e mantém a lista fixa de
  pastas como reserva fora do Git. Saídas de build e de teste, como `.astro/`
  e `.teste/` de projetos Astro, deixam de entrar em `docs/application.md` e
  `docs/frontend.md`, e o `--check` não acusa documentação desatualizada a cada
  build de teste. Contribuição de Lucas Fuad na PR #53.

## [0.25.0] - 2026-11-02

### Adicionado

- `specsfy inbox process <captura.md>` arquiva capturas em `inbox/processed/`
  depois de conferir todas as specs relacionadas e atualizar suas referências.
  O comando exige `Definition Gate: Passed` e `Status` explícitos na tabela
  inicial. Recusa Draft, aprovação ausente e tabelas de exemplo no corpo.
  Contribuição de Fabio Righetti na PR #44, adaptada com testes em Node.js e
  verificação adicional do cabeçalho da spec.
- `.specsfy/migrations.json` aceita padrões `apply` e `status` para reconhecer
  comprovantes de runners de migrations próprios, preservando os padrões
  nativos e recusando configuração inválida. Corrige a issue #52, de
  @sandrolborges. A verificação não executa migrations.

### Corrigido

- O progresso considera somente o ciclo canônico de cada task. Checkboxes
  residuais aparecem com seus números de linha, sem reduzir o progresso das
  tasks concluídas. Corrige a issue #51, de @ricardolrm.
- Os testes de arquivamento recusam aprovação em exemplos, em tabelas do corpo
  e em specs sem Status escrito. Falhas de pré-validação preservam a captura.
- O exemplo Laravel recebe as skills canônicas atuais, seus scripts Node.js e
  os registros do instalador. O ESLint ignora as dependências instaladas.

### Alterado

- Scripts de regressão, validação de skills, versão, release, documentação,
  geração de PDF/EPUB e utilitários de deploy usam Node.js. Os arquivos Python
  do workspace foram removidos, incluindo as cópias instaladas no exemplo.
- O CI executa as suítes Node.js de integração, skills e especialistas, além
  das verificações nativas do CLI e da aplicação Laravel. Um teste impede a
  reintrodução de arquivos Python e de etapas Python nos workflows.
- PDFs usam Chromium, Playwright e Paged.js, com dependências fixadas em
  `.ebook/package-lock.json`. O manual de marca e o ebook foram recompilados.
- Os utilitários de vault e hosts usam Node.js e continuam chamando o Ansible
  externo. O cancelamento aguarda o processo filho antes de remover arquivos
  temporários de credenciais.

### Atualização

- Requer Node.js 22.20 ou superior. Atualize o CLI com
  `npm install -g @promovaweb/specsfy@0.25.0` e atualize as skills do projeto
  pelo instalador, preservando alterações locais.
- Para contribuir: execute `npm ci --ignore-scripts` na raiz e use `npm test`,
  `npm run validate:skills` e os comandos documentados dos módulos. Os antigos
  comandos Python foram substituídos pelas entradas Node.js.
- Para compilar PDFs: instale as dependências de `.ebook/` e o Chromium do
  Playwright. O Ansible continua sendo uma dependência externa das operações
  de deploy; não é instalado pelo workspace.

### Validação

- Regressão integrada em Node.js; testes, typecheck, build e empacotamento do
  CLI; verificações nativas da aplicação Laravel; contratos de skills;
  ShellCheck e sintaxe Bash; integridade do ebook e alinhamento de versões.
- Os testes de deploy usam processos substitutos para verificar argumentos,
  permissões, limpeza e cancelamento. Não comprovam criptografia real do
  Ansible nem conexão com servidores de produção.

## [0.24.3] - 2026-10-20

### Corrigido

- Corrige a procura de executáveis pelo PATHEXT no Windows e chama o entrypoint JavaScript do npx pelo Node, preservando argumentos com espaços.
- Restaura regras, templates, skills e locks gerenciados quando o instalador delegado falha.
- Detecta stacks e arquivos de aplicação em subprojetos, excluindo dependências, skills instaladas e ambientes virtuais.
- Preserva linhas com pipes escapados nas tabelas da stack.
- Reconhece palavras Unicode nos validadores para aceitar palavras como MÉTODO e identificar alterações de índice que exigem migration.
- Inclui testes .mjs e .cjs e limita a rastreabilidade aos testes declarados pela spec, sem selecionar arquivos com o mesmo sufixo.
- Respeita specs Draft na verificação do repositório e aceita o título atual da seção de dependências no exemplo canônico.
- Atualiza caminhos de research nas transições, permite reabrir specs concluídas e preserva a origem quando o destino está ocupado.
- Corrige caminhos com espaços e a procura da raiz de projetos nos validadores.
- Consulta o estado das migrations no banco de teste separado para distinguir operações históricas já executadas de operações pendentes.
- Corrige a documentação gerada para excluir skills e dependências, reconhecer PHPUnit e identificar diagramas genéricos como exemplos.
- Alinha o Node da CI ao mínimo 22.20.0 do CLI e atualiza as actions com SHAs fixos.

### Validação

- 121 testes do CLI, typecheck, build, executável e empacotamento local.
- 20 testes de regressão em Node.js para as skills.
- Windows validado por injeção de plataforma. A confirmação em Windows nativo e a integração com Laravel real permanecem pendentes.
- Os testes integrados do projeto serão conferidos na CI antes da publicação da tag. Python não foi executado neste workspace.

### Atualização

- Atualize o CLI com `npm install --global @promovaweb/specsfy@0.24.3` e confirme `specsfy --version`.
- As skills já instaladas em projetos consumidores precisam ser atualizadas separadamente. Execute `specsfy skills update --help` e preserve customizações locais antes de atualizar.
- Os relatos permanecem abertos para confirmação dos autores no ambiente original.

### Contribuições aproveitadas

- Adapta contribuições dos PRs #7, #9, #12, #19, #22, #32, #38, #39, #40, #49 e #50, com testes e ajustes adicionais. A relação de autores e SHAs originais acompanha o commit desta versão.

## [0.24.2] - 2026-10-20

### Corrigido

- Recompila o executável do CLI e seu manifesto para corresponder à versão pública do Specsfy.
- Mantém o catálogo de relatório de servidor e suas referências recíprocas.

## [0.24.1] - 2026-10-20

### Corrigido

- Inclui o novo especialista no conjunto esperado pelos testes do catálogo.
- Completa as referências recíprocas entre o relatório de servidor e os especialistas de plataforma e diagnóstico.

## [0.24.0] - 2026-10-20

### Adicionado

- Adiciona o especialista de relatório de servidor com coleta somente leitura por Ansible, diagnóstico Docker e Swarm e relatórios por host.
- Registra o especialista no catálogo para instalação pelo CLI.

## [0.23.0] - 2026-09-15

### Adicionado

- Mantém o deploy manual e adiciona `./deploy run --non-interactive` para
  execução por agentes com fontes externas da senha do Ansible Vault.
- Inclui `./deploy configure-vault` com entrada oculta, armazenamento fora do
  Git, permissões restritas e confirmação antes de substituir a senha.
- Aceita arquivos, scripts de cofre, Vault IDs e configuração nativa do Ansible.
- Reaproveita a fonte externa no cadastro de segredos e verifica a
  descriptografia local antes de conectar aos servidores.
- Documenta configuração, troca, remoção e migração de projetos existentes,
  com testes de terminal e Ansible em alvo local descartável.

### Migração

- Projetos existentes devem incorporar as mudanças em `deploy`,
  `ansible/create-vault.sh` e `ansible/check-hosts.py`, além do novo
  `ansible/vault.py`, preservando suas personalizações. Depois, execute
  `./deploy configure-vault` no terminal humano para preparar a fonte local.

### Validação

- 113 testes integrados, 38 testes de especialistas e 106 testes do CLI.
- 54 cenários BDD integrados e 12 cenários dos especialistas.
- ShellCheck, validação das skills, `make verify-ebook` e `make verify-version`.

## [0.22.2] - 2026-09-04

### Corrigido

- Publica o reforço que impede o Delivery Gate quando uma migration planejada
  permanece aberta.
- Limita a exigência automática de migration às mudanças estruturais do banco.
- Reconstrói o manifesto do executável depois da atualização completa da
  versão.

### Validação

- `cd cli && npm run check`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `make verify-ebook`
- `make verify-version`

## [0.22.1] - 2026-09-04

### Corrigido

- Limita a exigência automática de migration a mudanças que criam ou alteram
  a estrutura do banco.
- Impede o Delivery Gate quando uma tarefa `[MIGRATION]` planejada permanece
  aberta.
- Mantém a conferência do arquivo versionado, da aplicação no banco de teste e
  da consulta posterior do estado.

### Validação

- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --quiet --with behave behave skills/tests/features --no-capture`
- `make verify-ebook`
- `make verify-version`

## [0.22.0] - 2026-09-04

### Adicionado

- Exige uma tarefa `[MIGRATION]` quando o plano altera banco de dados,
  schema, tabela, coluna, índice, relação ou modelo persistente.
- Confere o arquivo versionado, a aplicação no banco de teste e a consulta do
  estado antes de aceitar a conclusão da migration.
- Inclui testes unitários e cenários BDD para impedir planos e entregas sem a
  migration necessária.

### Alterado

- Alinha planejamento, implementação, validação, Laravel, PostgreSQL e
  modelagem de dados ao mesmo contrato de migrations.
- Documenta o fluxo nos guias do usuário, na referência técnica e no ebook.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --quiet --with behave behave skills/tests/features --no-capture`
- `make verify-ebook`
- `make verify-version`

## [0.21.0] - 2026-09-03

### Adicionado

- Adota Cloudflare Tunnel como ingresso padrão das stacks Docker Swarm.
- Executa `cloudflared` na rede overlay da aplicação e entrega o token por
  Docker Secret criado a partir do Ansible Vault.
- Permite escolher outro proxy com `--proxy external`.

### Alterado

- Documenta o fluxo do túnel no guia do usuário, no capítulo de deploy e na
  referência técnica das skills.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.20.1] - 2026-09-03

### Corrigido

- Renomeia o capítulo de deploy para “Como funciona o Deploy da aplicação”.
- Mantém o título alinhado no guia do usuário, ebook e website.
- Garante que o setup inicial não crie `SEMVER` nem arquivos de deploy sem um
  pedido explícito do usuário.
- Confirma por teste que repetir o setup com as mesmas entradas não altera o
  projeto consumidor.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.20.0] - 2026-09-03

### Adicionado

- Define `VERSION` na raiz como fonte única para todo o ecossistema Specsfy.
- Inclui uma verificação automática entre CLI, ebook, manifests e artefatos.
- Publica a documentação completa do deploy com Docker Swarm, Ansible,
  Laravel Octane e Open Swoole.

### Alterado

- Alinha framework, CLI, skills, especialistas e ebook na versão `0.20.0`.
- Mantém Hub e website em ciclos de versão independentes.

### Segurança

- Documenta Ansible Vault e Docker Secrets como meios obrigatórios para
  valores sensíveis usados no deploy.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.13.0] - 2026-09-03

### Adicionado

- Cria o especialista orquestrador de deploy para coordenar versionamento,
  Laravel, Docker, Docker Swarm, Debian Server e Ansible pela mesma conversa.
- Gera `Dockerfile`, Compose local, stack de produção, playbooks multi-host e
  utilitários curtos para conexões, chaves públicas, Vault e deploy.
- Publica o capítulo operacional de servidores e deploy no guia do usuário e
  no ebook `v1.9.0`.

### Alterado

- Torna Laravel Octane com Open Swoole o runtime obrigatório das aplicações
  Laravel atendidas pelo Specsfy.
- Adota `deploy` como usuário operacional do servidor e mantém `app` como
  usuário interno do container.
- Faz o arquivo `SEMVER` governar a tag da imagem e a versão usada no deploy.

### Segurança

- Mantém valores sensíveis no Ansible Vault e os converte em Docker Secrets
  externos sem gravar senhas na stack.
- Sincroniza somente chaves públicas locais e preserva acessos SSH existentes.

### Validação

- `python3 -B -m unittest discover -s specialists/tests -p 'test_*.py'`
- `uv run --with behave behave specialists/tests/features`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --with behave behave skills/tests/features`
- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `make verify-ebook`
- `ansible-playbook ansible/deploy.yml --syntax-check`

## [0.12.0] - 2026-09-03

### Adicionado

- Adiciona o especialista de versionamento para criar, consultar, incrementar
  e conferir o arquivo `SEMVER` na raiz do projeto consumidor.
- Adiciona o especialista de Debian Server e amplia o fluxo de deploy com
  Docker, Docker Swarm, Ansible e engenharia de entrega.
- Publica o capítulo "Da versão ao servidor" no guia do usuário e inclui a
  edição `v1.8.0` do ebook em PDF e EPUB.

### Alterado

- Faz Ansible, Docker Swarm e engenharia de entrega carregarem o especialista
  de versionamento durante a preparação do deploy.
- Faz Docker consultar `SEMVER` quando a imagem representar uma release.

### Validação

- `python3 -B -m unittest discover -s specialists/tests -p 'test_*.py'`
- `uv run --quiet --with behave==1.3.3 behave specialists/tests/features --no-capture`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `cd skills && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `make verify-ebook`

## [0.11.2] - 2026-08-31

### Corrigido

- Declara no especialista de componentes React a relação recíproca com o
  especialista de experiência de interface.
- Restaura os contratos Python e BDD do catálogo de especialistas após a
  publicação do roteamento obrigatório para componentes de UI.

### Validação

- `cd specialists && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd specialists && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `cd skills && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd skills && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`

## [0.11.1] - 2026-08-31

### Adicionado

- Exige `specsfy-specialist-react-ui-components` no planejamento e na
  implementação de telas React antes da escrita de JSX ou TSX.
- Faz o setup instalar o especialista de componentes quando React for
  detectado no projeto.
- Adiciona um contrato automatizado para manter o roteamento presente nas
  skills, nos templates e no especialista de experiência de interface.

### Documentação

- Atualiza os guias de tarefas, implementação e especialistas com a sequência
  de seleção, reaproveitamento e adaptação de componentes.
- Reconstrói o guia do usuário em PDF e EPUB com as fontes documentais atuais.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave behave tests/features --no-capture`
- `cd skills && node specsfy-04-validate/scripts/verify_repo.mjs . --boundary local`
- `make verify-ebook`

## [0.11.0] - 2026-08-30

### Adicionado

- Verifica durante o setup que projetos Laravel possuem `.env.testing` com
  banco explícito e separado do ambiente de desenvolvimento.
- Inclui um gate reutilizável que inspeciona comandos diretos, aliases de
  Composer e npm, traits de teste e o método `up` das migrations antes da
  execução.
- Faz o setup confirmar cobertura de CRUD, caminhos de menu e reconstrução da
  documentação técnica do sistema existente.

### Corrigido

- Suspende testes no CLI, na TUI e nas skills de TDD e implementação quando o
  ambiente de teste não está comprovadamente separado.
- Recusa resets, wipes, drops, truncates, `RefreshDatabase` e
  `DatabaseMigrations`, sem permitir execução forçada.
- Atualiza a aplicação de exemplo para usar SQLite exclusivo de teste,
  migrations de avanço inspecionadas e `DatabaseTransactions`.

### Documentação

- Publica as regras de proteção no guia Laravel, na referência do CLI, nas
  páginas das skills, na documentação técnica e no ebook `v1.7.20`.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `cd skills && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd specialists && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `node skills/specsfy-setup/scripts/check_database_safety.mjs --project example --command 'composer test'`
- `composer --working-dir=example test`
- `make verify-ebook`

## [0.10.5] - 2026-08-27

## Correções

- Alinha os testes automatizados da importação de `MVP.md` ao fluxo atual: somente requisitos desenvolvíveis criam backlog e spec Draft; a milestone mantém proveniência e triagem, sem Inboxes ou cópia de contexto de negócio.

## Validação

- Testes unitários e cenários BDD da biblioteca de skills executados com sucesso.

## [0.10.4] - 2026-08-27

## Corrigido

- Importa do `MVP.md` somente requisitos de desenvolvimento, criando backlogs
  e specs Draft sem gerar Inboxes automáticas.
- Mantém contexto de negócio, público, métricas e posicionamento no arquivo de
  origem, enquanto `M01` registra apenas a proveniência e a triagem.

## Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave behave tests/features --no-capture`
- `make verify-ebook`

## [0.10.3] - 2026-08-27

### Adicionado

- Expande o contrato de Design System, a composição de interfaces e os
  especialistas disponíveis, com documentação, testes e templates alinhados.
- Publica o guia do usuário do Specsfy na edição `v1.7.18`.

## [0.10.2] - 2026-08-24

### Corrigido

- Atualiza o cenário BDD de composição React para reconhecer o Design System
  como requisito do especialista de componentes e inclui essa skill no grupo
  de interface do catálogo.
- Mantém testes unitários, cenários BDD, metadados e requisitos do catálogo
  alinhados com o conjunto publicado de especialistas.

## [0.10.1] - 2026-08-24

### Corrigido

- Alinha o catálogo, os metadados e o contrato de qualidade do especialista de
  Design System, incluindo seus padrões de referência e os requisitos dos
  componentes de interface.
- Mantém a suíte de especialistas compatível com o catálogo publicado e
  recompõe o executável com a versão `0.10.1`.

## [0.10.0] - 2026-08-24

### Adicionado

- Cria o template `UserProfile.md` e faz `$specsfy-setup` materializar
  `.specsfy/USER-PROFILE.md` para registrar o nível de conhecimento, respostas
  confirmadas, fonte, data e alcance.
- Adapta as perguntas do setup ao nível `iniciante`, `intermediário` ou
  `experiente`, consultando a conversa e os arquivos do projeto para não
  repetir assuntos já respondidos.
- Define defaults de interface para CRUD, dashboard, Breadcrumb, navegação por
  equipe e formulários responsivos em duas colunas, com documentação e
  especialistas correspondentes.

### Corrigido

- Torna as linhas do DataGrid clicáveis por inteiro, preservando ações internas
  e a navegação por teclado.
- Reaproveita o Breadcrumb existente em aplicações Laravel e garante a equipe
  atual no contexto das telas autenticadas.
- Atualiza o CLI, os templates, os testes, a documentação e o ebook para o
  fluxo de contexto e interface publicado nesta versão.

## [0.9.3] - 2026-08-23

### Corrigido

- Corrige o modal de leitura de specs: `Esc` e o botão **Fechar Esc** encerram a visualização, removem seus controles da pilha de foco e devolvem a seleção à lista de origem.
- Mantém `Tab` e `Shift+Tab` no conteúdo do modal e no fechamento, sem levar o foco para controles ocultos atrás da visualização.
- Adiciona regressões com byte Escape de TTY, foco após o fechamento e controle de mouse, além de atualizar os guias e o ebook.

## [0.9.2] - 2026-08-22

- Evita repetir a mesma oferta de atualização depois de uma recusa ou falha,
  respeitando o intervalo configurado e mantendo `specsfy upgrade` como
  consulta forçada.
- Atualiza corretamente executáveis avulsos expostos por symlink, substituindo
  o arquivo real sem remover o caminho usado no `PATH`.
- Adiciona regressões para adiamento, bypass explícito, fluxo de inicialização
  e atualização de symlink.

## [0.9.1] - 2026-08-22

- Corrige a navegação da TUI, o foco após fechar telas, o fechamento por
  `Ctrl+Q` e a atualização de painéis durante a execução de testes.
- Preserva seleções de skills durante refresh e impede que operações
  assíncronas devolvam a pessoa para uma aba antiga.
- Faz o updater comparar a versão publicada no npm, evita avisos repetidos e
  atualiza executáveis avulsos com validação e substituição atômica.
- Completa a importação de MVP com defaults óbvios, pendências explícitas,
  backlogs somente para desenvolvimento e specs derivadas desses backlogs.

## [0.9.0] - 2026-08-21

- Adiciona especialistas essenciais ao setup e amplia o catálogo de
  especialistas do Specsfy.
- Torna a descoberta de MVP contextual e preserva seu resultado em inboxes.
- Suporta projetos em subdiretórios do Hub e padroniza interfaces React com
  ReUI.
- Publica aliases estáveis do ebook e amplia o contexto auxiliar do CLI.

## [0.8.1] - 2026-08-13

- Inclui o pacote oficial `skills` como dependência do CLI e o localiza mesmo
  quando um launcher inicia o Specsfy com um `PATH` reduzido.
- Alinha o requisito mínimo ao Node.js 22.20 exigido pelo materializador.
- Adiciona `specsfy setup` como alias de `specsfy install`, com o mesmo
  diagnóstico de Node.js, Git, projeto e materializador de skills.
- Adiciona `specsfy doctor` e executa o mesmo diagnóstico antes do setup para
  conferir Node.js, Git, npm, projeto e disponibilidade do `skills` ou `npx`.
- Adiciona `specsfy update` para atualizar todas as skills Specsfy instaladas e
  preserva `specsfy skills update` como comando compatível.
- Adiciona `specsfy upgrade` para consultar uma versão estável mais recente e
  atualizar o próprio CLI pelo pacote oficial do npm sem fazer downgrade.
- Documenta separadamente instalação, atualização das skills e atualização do
  CLI nos guias, na referência de comandos, no ebook e no site.

## [0.8.0] - 2026-08-12

- Adiciona os comandos `transition`, `migrate` e `effort` para manter pasta,
  status e estimativa das specs pela mesma interface, com saída JSON e
  integração opcional com o ClickUpfy.
- Adiciona `milestones sync` para projetar o progresso dos milestones em
  `specs.md` e `specs/milestones/`, preservando o conteúdo escrito pelo
  usuário.
- Passa a ler o ciclo de vida em `specs/<estado>/`, mantém compatibilidade com
  o layout anterior e inclui Effort e perfil de execução no progresso.
- Amplia o bootstrap com as skills de entrevista e governança de milestones e
  mantém a instalação protegida por fingerprints.
- Reorganiza a paleta escura da TUI com cores semânticas e contraste verificado
  para texto, foco, seleção, bordas, campos, botões e barras de rolagem.
- Atualiza capturas, documentação de usuário e desenvolvimento, referência de
  comandos, ebook e publicação dos guias no site da Promovaweb.

## [0.7.0] - 2026-07-30

- Migra o CLI e a TUI de Python para Node.js 22, com instalação global por
  `@promovaweb/specsfy`.
- Mantém as seis abas da TUI e adiciona execução do Pest com resumo e saída
  rolável.
- Corrige os atalhos de controle interpretados pelo `neo-blessed` e evita o
  encerramento da TUI durante a atualização da saída dos testes.
- Adiciona o fluxo de release com changelog, commit, tag anotada, GitHub
  Actions, publicação npm e GitHub Release vinculados à mesma versão.
- Atualiza o instalador, o catálogo de especialistas e a documentação do
  usuário para os comandos do CLI em Node.js.

- Autentica catálogo e verificação de tags em repositórios privados com
  `GH_TOKEN`, `GITHUB_TOKEN` ou a sessão do GitHub CLI.
- Torna o fingerprint do executável estável entre permissões equivalentes do
  Git e ambientes locais/CI.
` deixam de ser interpretadas como padrões de substituição.
- `analyze_change.mjs` aceita uma spec aberta por link simbólico do
  repositório, como `/tmp` e `/var` no macOS.
- `check_traceability.mjs` ignora `.claude/`, onde o Claude Code cria
  worktrees com cópias dos testes.
- Contribuições de Lucas Fuad na PR #54.

## [0.29.3] - 2026-11-15

### Alterado

- Skills `specsfy-06-tdd-bdd`, `specsfy-07-implement` e `specsfy-interviewer` e o contrato `skills/Spec.md` descrevem o status da tarefa remota no ClickUp pelo trabalho real do agente: próxima etapa até um agente atuar, `em andamento` só durante a execução, volta para próxima etapa com comentário ao parar sem concluir, `revisar` na entrega e `pronto` ou `concluido` só por ordem humana.
- Documentação do método, dos casos de uso e do entrevistador alinhada à mesma regra.

## [0.29.2] - 2026-11-14

### Corrigido

- Revisada a redação do guia do usuário em `docs/user/`, com explicações mais precisas e correções de linguagem.
- Atualizados os formatos portáteis da documentação a partir das fontes revisadas.

## [0.29.1] - 2026-11-13

### Corrigido

- A tag `v0.29.0` não gerou GitHub Release: o job `binaries` reprovou porque
  `cli/docs/opencli.json` ainda declarava a versão 0.28.1. Esta versão publica
  o mesmo conteúdo da 0.29.0 com a descrição OpenCLI regenerada.
- A skill `specsfy-release-cli` e o `CONTRIBUTING.md` passam a regenerar
  `cli/docs/opencli.json` com `bun run opencli` e a rodar `bun run validate`,
  o mesmo gate do workflow de release, antes do commit da versão.

### Adicionado

- Os três capítulos novos do guia do usuário e do ebook, anunciados na 0.29.0,
  chegam ao público nesta versão: casos de uso, exemplos completos e
  referência rápida.

## [0.29.0] - 2026-11-13

### Adicionado

- O guia do usuário ganhou três capítulos, também no ebook:
  `docs/user/use-cases.md`, com nove receitas por situação (ideia na Inbox,
  bug com teste de regressão, CRUD com interface, MVP, mudança depois da
  definição, banco de dados, projeto existente, acompanhamento e retomada);
  `docs/user/examples.md`, com os arquivos de uma entrega real da aplicação de
  `example/`, do texto original à evidência dos testes, e mensagens prontas
  para cada etapa; e `docs/user/reference.md`, com arquivos, estados, gates,
  Effort, identificadores, checklist, skills, comandos do CLI, proteções,
  glossário e referências externas.

### Corrigido

- O portal do guia do usuário apontava para a edição v1.8.0 do ebook e agora
  usa os aliases permanentes `ebook-specsfy.pdf` e `ebook-specsfy.epub`.
- As edições v1.7.20 a v1.9.0 do ebook, anteriores ao reinício da numeração em
  0.x, foram removidas. A retenção mantinha esses arquivos porque o SemVer
  deles é maior que o da edição vigente.

## [0.28.1] - 2026-11-13

### Alterado

- A publicação no npm passa a ser feita só pela máquina local; o workflow de
  release não publica mais no npm.
- O `CLI Release` (`.github/workflows/cli-release.yml`) perde o job `npm` e
  continua compilando os cinco binários, gerando o `SHA256SUMS` e criando a
  GitHub Release. O workflow não usa mais `NPM_TOKEN` nem `id-token: write`.
- A skill `specsfy-release-cli`, o `CONTRIBUTING.md`, o `cli/docs/release.md`,
  os `AGENTS.md` e os fluxos de `docs/develop/` descrevem a publicação local:
  `npm pack` em `cli/npm/` no commit da tag, `npm publish <tgz> --access public`
  e conferência com `npm view @promovaweb/specsfy version license`.

## [0.28.0] - 2026-11-13

### Alterado

- A partir desta versão, o projeto é distribuído sob a GNU AGPL 3.0 (SPDX
  `AGPL-3.0-only`); versões anteriores continuam sob a licença com que foram
  publicadas.
- O texto oficial e integral da AGPL 3.0 está no `LICENSE` da raiz, que não
  existia, e substitui a MIT em `cli/LICENSE`, `cli/npm/LICENSE` e
  `specialists/LICENSE`.
- O campo `license` de `package.json`, `package-lock.json`,
  `cli/package.json` e `cli/npm/package.json` passa a `AGPL-3.0-only`. O
  `specsfy about` e o `cli/docs/opencli.json` mostram a nova licença.
- O `README.md` ganhou o badge de licença e a seção Licença, que também entra
  no `cli/npm/README.md` do pacote npm. A licença não concede o uso do nome e
  do logo do Specsfy nem da marca Promovaweb (AGPL 3.0, seção 7, item e).
- O `CONTRIBUTING.md` registra que as contribuições entram sob a mesma
  licença do projeto.

## [0.27.3] - 2026-11-13

### Documentação

- A tabela de códigos de saída de `docs/user/cli-reference.md` passa a seguir
  `cli/src/app/exit-codes.ts`, a mesma fonte do `specsfy --help`. O código `7`
  é permissão negada no sistema de arquivos, e projeto ou spec ausente sai com
  `6`. A tabela ganhou a coluna com o nome de cada código e o `130` de
  interrupção.
- A descrição do `specsfy doctor` em `docs/user/cli-reference.md` e em
  `docs/user/cli.md` informa o código real de uma checagem reprovada, `3`, no
  lugar de `1`. A tabela resumida do `README.md` da raiz ganhou a linha do `3`.

## [0.27.2] - 2026-11-13

### Documentação

- O `README.md` da raiz foi reorganizado para quem usa o Specsfy. Ele abre
  com o logo, a ligação com a Promovaweb, os badges, o banner do Discord e os
  links de documentação, planos e changelog. Depois traz instalação, primeiros
  passos, uso, MCP, códigos de saída, os repositórios usados e a licença MIT
  do CLI.
- O novo `CONTRIBUTING.md` reúne o que antes ficava no README para quem
  contribui: ambiente, organização dos módulos, fluxo BDD e TDD, validação,
  documentação, commits e release.
- O tutorial em `specsfy/README.md` ganhou o mesmo cabeçalho e as seções de
  comunidade e da Promovaweb.
- O `.markdownlint.json` da raiz libera o HTML do cabeçalho.

## [0.27.1] - 2026-11-13

### Corrigido

- O validador de skills do framework (`npm run validate:skills`) deixa de
  conferir as skills `termfy*` instaladas em `cli/.agents/skills/` pelo
  `npx skills`. Elas seguem o contrato do repositório Termfy e têm o hash
  conferido em `cli/skills-lock.json`; a descrição de `termfy-database`
  derrubava o workflow `CLI Release` da 0.27.0.

### Observações

- A tag `v0.27.0` não chegou a gerar GitHub Release nem pacote npm, porque o
  workflow parou antes da compilação. A 0.27.1 é a primeira versão publicada
  do CLI em Bun e traz todas as mudanças descritas na seção 0.27.0.

## [0.27.0] - 2026-11-13

### Alterado

- O CLI foi reescrito em Bun sobre o Termfy e passa a ser um binário
  compilado para Linux (x64 e arm64), macOS (x64 e arm64) e Windows (x64),
  sem Node.js nem Bun na máquina. Os executáveis e o `SHA256SUMS` saem em cada
  GitHub Release; o pacote npm `@promovaweb/specsfy` vira um wrapper que baixa
  o binário da plataforma na primeira execução, e `scripts/install-cli.sh`
  instala o binário direto.
- O binário carrega a árvore `skills/` e executa os scripts das skills com o
  próprio runtime. As skills base passam a indicar o command do `specsfy` e a
  tool MCP equivalente, e mantêm os scripts `.mjs` como alternativa.
- `transition`, `effort` e `migrate` passam para `specs transition`,
  `specs effort` e `specs migrate`. Os nomes antigos continuam aceitos como
  aliases ocultos.
- Saída `--json` em envelope `{ ok, command, data }`, com `ok: false` e `code`
  quando o exit code não é 0. Gates reprovados saem com o exit code 10
  (`GATE_FAILED`).
  Scripts que liam o JSON direto, como o `progress --json` da 0.26, passam a
  ler o campo `data`.
- `config show`, `config set --watch-interval` e `progress --interval`
  continuam aceitos, e o `watch_interval` de `.specsfy/config.json` segue
  valendo para o `progress --watch`.
- O token do GitHub vem da credencial cifrada `github.token`, de `GH_TOKEN`,
  de `GITHUB_TOKEN` ou de `gh auth token`, nesta ordem. `upgrade` troca o
  binário a partir da última release, conferindo o `SHA256SUMS`.

### Adicionado

- Servidor MCP (`specsfy mcp`) com tools para ler o projeto
  (`project_status`, `specs_list`, `spec_get`), mover o trabalho pelo método
  (`spec_transition`, `spec_effort`, `task_check`, `inbox_capture`,
  `inbox_process`), rodar gates (`gate_*`, `verify`), testes
  (`project_test`), contexto, milestones, documentação e gerenciar skills.
- Commands `status`, `specs list|show|new|research|change`,
  `tasks next|check|delivery`, `inbox list|capture`, `backlog list|start`,
  `gate spec|tasks|interface|trace|acceptance|evidence|findings|database`,
  `verify`, `context setup|inspect|interface|monitor|stack|rule|database|data|usage`,
  `milestones import-mvp`, `docs build`, `scripts list|run`.
- `<spec>` aceita número, nome da pasta, slug ou caminho, e todo command de
  projeto acha a raiz subindo a partir da pasta atual ou usa `--project`.
- TUI com as abas Overview, Specs, Backlog, Gates, Tests, Skills e About,
  atualizada sozinha quando os arquivos das specs mudam.
- Documentação embutida (`specsfy --skill`), descrição OpenCLI
  (`specsfy --opencli`), settings em `~/.specsfy/settings.json` e
  `CLISPEC.md` com as specs 0001 a 0011 do binário.

### Corrigido

- `skills remove` volta a tirar a entrada do `skills-lock.json`.
- Saídas grandes deixam de ser cortadas quando o stdout é um pipe.
- Identificadores de spec, nomes de skill e o `--attestation` ficam presos ao
  projeto: nenhum command ou tool MCP lê, grava ou remove arquivos fora dele.
- Gates que executam código do projeto (`gate tasks`, `gate evidence`,
  `gate database`) deixam de se anunciar como só leitura no MCP.
- Um token do GitHub vencido não impede mais a checagem de versão.
- O `upgrade` de uma instalação npm local ou via `npx` não instala o pacote
  globalmente.

### Observações

- A primeira execução pelo npm ou pelo `get.specsfy.dev` baixa o binário da
  plataforma, com cerca de 125 MB.
- Não há build para musl; em Alpine, use uma imagem com glibc.

## [0.26.2] - 2026-11-11

### Corrigido

- O manifesto do ebook volta a refletir as fontes atuais. A 0.26.1 alterou
  `.ebook/build-ebook.sh`, que também entra no `source_sha256`, sem regenerar o
  ebook; o CI da tag v0.26.1 falhou e o pacote não chegou ao npm. A 0.26.2
  regenera a edição e substitui a 0.26.1.
- A validação da ordem de leitura em `build-ebook.sh` também ordena com
  `LC_ALL=C`.

## [0.26.1] - 2026-11-11

### Corrigido

- O hash das fontes do ebook (`source_sha256` em `ebook/build.json`) deixa de
  depender do idioma do sistema. `build-ebook.sh` ordena `docs/user/` com
  `LC_ALL=C`, e o manifesto gerado numa máquina em `en_US.UTF-8` passa na
  verificação do CI, que roda com a ordenação C. Com isso, o job da tag volta a
  publicar `@promovaweb/specsfy` no npm.

## [0.26.0] - 2026-11-11

### Alterado

- As 19 skills base foram reescritas para agentes atuais da OpenAI e da
  Anthropic. Cada `SKILL.md` abre com o objetivo, declara `Pronto quando`,
  separa leituras paralelas de passos sequenciais e descreve na `description`
  quando usar e quando não usar a skill. A ênfase excessiva deu lugar a
  instruções com motivo, e trechos duplicados do `Spec.md` viraram referências.
  Os prompts de `agents/openai.yaml` ficaram mais específicos.
- `Spec.md` ganhou a seção `Compatibilidade entre agentes`, com a leitura de
  `$<nome>` no Codex, no Claude Code e nos demais agentes, e a regra dos
  caminhos de script.

### Corrigido

- Os estados canônicos em `Spec.md`, `skills/README.md` e
  `quality-gates.md` passam a incluir `Reviewing`.
- Listas numeradas que reiniciavam depois de blocos de código em
  `specsfy-02-backlog`, `specsfy-03-specify`, `specsfy-04-validate` e
  `specsfy-07-implement` voltaram a ter sequência contínua.
- `specsfy-05-tasks` lista `[MIGRATION]` entre as tags aceitas pelo
  `validate_tasks.mjs`.
- Skills auxiliares, `specsfy-setup` e `specsfy-documentator` citam scripts com
  o caminho completo `.agents/skills/<skill>/scripts/`.
- `specsfy-mvp-milestone-interviewer` usa o formato canônico de transição e
  oferece `Gere outras opções` em cada rodada.
- `$specsfy-documentator` respeita o `.gitignore` do projeto. Dentro de um
  repositório Git, `build_documentation.mjs` lê a lista de
  `git ls-files --cached --others --exclude-standard` e mantém a lista fixa de
  pastas como reserva fora do Git. Saídas de build e de teste, como `.astro/`
  e `.teste/` de projetos Astro, deixam de entrar em `docs/application.md` e
  `docs/frontend.md`, e o `--check` não acusa documentação desatualizada a cada
  build de teste. Contribuição de Lucas Fuad na PR #53.

## [0.25.0] - 2026-11-02

### Adicionado

- `specsfy inbox process <captura.md>` arquiva capturas em `inbox/processed/`
  depois de conferir todas as specs relacionadas e atualizar suas referências.
  O comando exige `Definition Gate: Passed` e `Status` explícitos na tabela
  inicial. Recusa Draft, aprovação ausente e tabelas de exemplo no corpo.
  Contribuição de Fabio Righetti na PR #44, adaptada com testes em Node.js e
  verificação adicional do cabeçalho da spec.
- `.specsfy/migrations.json` aceita padrões `apply` e `status` para reconhecer
  comprovantes de runners de migrations próprios, preservando os padrões
  nativos e recusando configuração inválida. Corrige a issue #52, de
  @sandrolborges. A verificação não executa migrations.

### Corrigido

- O progresso considera somente o ciclo canônico de cada task. Checkboxes
  residuais aparecem com seus números de linha, sem reduzir o progresso das
  tasks concluídas. Corrige a issue #51, de @ricardolrm.
- Os testes de arquivamento recusam aprovação em exemplos, em tabelas do corpo
  e em specs sem Status escrito. Falhas de pré-validação preservam a captura.
- O exemplo Laravel recebe as skills canônicas atuais, seus scripts Node.js e
  os registros do instalador. O ESLint ignora as dependências instaladas.

### Alterado

- Scripts de regressão, validação de skills, versão, release, documentação,
  geração de PDF/EPUB e utilitários de deploy usam Node.js. Os arquivos Python
  do workspace foram removidos, incluindo as cópias instaladas no exemplo.
- O CI executa as suítes Node.js de integração, skills e especialistas, além
  das verificações nativas do CLI e da aplicação Laravel. Um teste impede a
  reintrodução de arquivos Python e de etapas Python nos workflows.
- PDFs usam Chromium, Playwright e Paged.js, com dependências fixadas em
  `.ebook/package-lock.json`. O manual de marca e o ebook foram recompilados.
- Os utilitários de vault e hosts usam Node.js e continuam chamando o Ansible
  externo. O cancelamento aguarda o processo filho antes de remover arquivos
  temporários de credenciais.

### Atualização

- Requer Node.js 22.20 ou superior. Atualize o CLI com
  `npm install -g @promovaweb/specsfy@0.25.0` e atualize as skills do projeto
  pelo instalador, preservando alterações locais.
- Para contribuir: execute `npm ci --ignore-scripts` na raiz e use `npm test`,
  `npm run validate:skills` e os comandos documentados dos módulos. Os antigos
  comandos Python foram substituídos pelas entradas Node.js.
- Para compilar PDFs: instale as dependências de `.ebook/` e o Chromium do
  Playwright. O Ansible continua sendo uma dependência externa das operações
  de deploy; não é instalado pelo workspace.

### Validação

- Regressão integrada em Node.js; testes, typecheck, build e empacotamento do
  CLI; verificações nativas da aplicação Laravel; contratos de skills;
  ShellCheck e sintaxe Bash; integridade do ebook e alinhamento de versões.
- Os testes de deploy usam processos substitutos para verificar argumentos,
  permissões, limpeza e cancelamento. Não comprovam criptografia real do
  Ansible nem conexão com servidores de produção.

## [0.24.3] - 2026-10-20

### Corrigido

- Corrige a procura de executáveis pelo PATHEXT no Windows e chama o entrypoint JavaScript do npx pelo Node, preservando argumentos com espaços.
- Restaura regras, templates, skills e locks gerenciados quando o instalador delegado falha.
- Detecta stacks e arquivos de aplicação em subprojetos, excluindo dependências, skills instaladas e ambientes virtuais.
- Preserva linhas com pipes escapados nas tabelas da stack.
- Reconhece palavras Unicode nos validadores para aceitar palavras como MÉTODO e identificar alterações de índice que exigem migration.
- Inclui testes .mjs e .cjs e limita a rastreabilidade aos testes declarados pela spec, sem selecionar arquivos com o mesmo sufixo.
- Respeita specs Draft na verificação do repositório e aceita o título atual da seção de dependências no exemplo canônico.
- Atualiza caminhos de research nas transições, permite reabrir specs concluídas e preserva a origem quando o destino está ocupado.
- Corrige caminhos com espaços e a procura da raiz de projetos nos validadores.
- Consulta o estado das migrations no banco de teste separado para distinguir operações históricas já executadas de operações pendentes.
- Corrige a documentação gerada para excluir skills e dependências, reconhecer PHPUnit e identificar diagramas genéricos como exemplos.
- Alinha o Node da CI ao mínimo 22.20.0 do CLI e atualiza as actions com SHAs fixos.

### Validação

- 121 testes do CLI, typecheck, build, executável e empacotamento local.
- 20 testes de regressão em Node.js para as skills.
- Windows validado por injeção de plataforma. A confirmação em Windows nativo e a integração com Laravel real permanecem pendentes.
- Os testes integrados do projeto serão conferidos na CI antes da publicação da tag. Python não foi executado neste workspace.

### Atualização

- Atualize o CLI com `npm install --global @promovaweb/specsfy@0.24.3` e confirme `specsfy --version`.
- As skills já instaladas em projetos consumidores precisam ser atualizadas separadamente. Execute `specsfy skills update --help` e preserve customizações locais antes de atualizar.
- Os relatos permanecem abertos para confirmação dos autores no ambiente original.

### Contribuições aproveitadas

- Adapta contribuições dos PRs #7, #9, #12, #19, #22, #32, #38, #39, #40, #49 e #50, com testes e ajustes adicionais. A relação de autores e SHAs originais acompanha o commit desta versão.

## [0.24.2] - 2026-10-20

### Corrigido

- Recompila o executável do CLI e seu manifesto para corresponder à versão pública do Specsfy.
- Mantém o catálogo de relatório de servidor e suas referências recíprocas.

## [0.24.1] - 2026-10-20

### Corrigido

- Inclui o novo especialista no conjunto esperado pelos testes do catálogo.
- Completa as referências recíprocas entre o relatório de servidor e os especialistas de plataforma e diagnóstico.

## [0.24.0] - 2026-10-20

### Adicionado

- Adiciona o especialista de relatório de servidor com coleta somente leitura por Ansible, diagnóstico Docker e Swarm e relatórios por host.
- Registra o especialista no catálogo para instalação pelo CLI.

## [0.23.0] - 2026-09-15

### Adicionado

- Mantém o deploy manual e adiciona `./deploy run --non-interactive` para
  execução por agentes com fontes externas da senha do Ansible Vault.
- Inclui `./deploy configure-vault` com entrada oculta, armazenamento fora do
  Git, permissões restritas e confirmação antes de substituir a senha.
- Aceita arquivos, scripts de cofre, Vault IDs e configuração nativa do Ansible.
- Reaproveita a fonte externa no cadastro de segredos e verifica a
  descriptografia local antes de conectar aos servidores.
- Documenta configuração, troca, remoção e migração de projetos existentes,
  com testes de terminal e Ansible em alvo local descartável.

### Migração

- Projetos existentes devem incorporar as mudanças em `deploy`,
  `ansible/create-vault.sh` e `ansible/check-hosts.py`, além do novo
  `ansible/vault.py`, preservando suas personalizações. Depois, execute
  `./deploy configure-vault` no terminal humano para preparar a fonte local.

### Validação

- 113 testes integrados, 38 testes de especialistas e 106 testes do CLI.
- 54 cenários BDD integrados e 12 cenários dos especialistas.
- ShellCheck, validação das skills, `make verify-ebook` e `make verify-version`.

## [0.22.2] - 2026-09-04

### Corrigido

- Publica o reforço que impede o Delivery Gate quando uma migration planejada
  permanece aberta.
- Limita a exigência automática de migration às mudanças estruturais do banco.
- Reconstrói o manifesto do executável depois da atualização completa da
  versão.

### Validação

- `cd cli && npm run check`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `make verify-ebook`
- `make verify-version`

## [0.22.1] - 2026-09-04

### Corrigido

- Limita a exigência automática de migration a mudanças que criam ou alteram
  a estrutura do banco.
- Impede o Delivery Gate quando uma tarefa `[MIGRATION]` planejada permanece
  aberta.
- Mantém a conferência do arquivo versionado, da aplicação no banco de teste e
  da consulta posterior do estado.

### Validação

- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --quiet --with behave behave skills/tests/features --no-capture`
- `make verify-ebook`
- `make verify-version`

## [0.22.0] - 2026-09-04

### Adicionado

- Exige uma tarefa `[MIGRATION]` quando o plano altera banco de dados,
  schema, tabela, coluna, índice, relação ou modelo persistente.
- Confere o arquivo versionado, a aplicação no banco de teste e a consulta do
  estado antes de aceitar a conclusão da migration.
- Inclui testes unitários e cenários BDD para impedir planos e entregas sem a
  migration necessária.

### Alterado

- Alinha planejamento, implementação, validação, Laravel, PostgreSQL e
  modelagem de dados ao mesmo contrato de migrations.
- Documenta o fluxo nos guias do usuário, na referência técnica e no ebook.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --quiet --with behave behave skills/tests/features --no-capture`
- `make verify-ebook`
- `make verify-version`

## [0.21.0] - 2026-09-03

### Adicionado

- Adota Cloudflare Tunnel como ingresso padrão das stacks Docker Swarm.
- Executa `cloudflared` na rede overlay da aplicação e entrega o token por
  Docker Secret criado a partir do Ansible Vault.
- Permite escolher outro proxy com `--proxy external`.

### Alterado

- Documenta o fluxo do túnel no guia do usuário, no capítulo de deploy e na
  referência técnica das skills.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.20.1] - 2026-09-03

### Corrigido

- Renomeia o capítulo de deploy para “Como funciona o Deploy da aplicação”.
- Mantém o título alinhado no guia do usuário, ebook e website.
- Garante que o setup inicial não crie `SEMVER` nem arquivos de deploy sem um
  pedido explícito do usuário.
- Confirma por teste que repetir o setup com as mesmas entradas não altera o
  projeto consumidor.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.20.0] - 2026-09-03

### Adicionado

- Define `VERSION` na raiz como fonte única para todo o ecossistema Specsfy.
- Inclui uma verificação automática entre CLI, ebook, manifests e artefatos.
- Publica a documentação completa do deploy com Docker Swarm, Ansible,
  Laravel Octane e Open Swoole.

### Alterado

- Alinha framework, CLI, skills, especialistas e ebook na versão `0.20.0`.
- Mantém Hub e website em ciclos de versão independentes.

### Segurança

- Documenta Ansible Vault e Docker Secrets como meios obrigatórios para
  valores sensíveis usados no deploy.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `make verify-ebook`
- `make verify-version`

## [0.13.0] - 2026-09-03

### Adicionado

- Cria o especialista orquestrador de deploy para coordenar versionamento,
  Laravel, Docker, Docker Swarm, Debian Server e Ansible pela mesma conversa.
- Gera `Dockerfile`, Compose local, stack de produção, playbooks multi-host e
  utilitários curtos para conexões, chaves públicas, Vault e deploy.
- Publica o capítulo operacional de servidores e deploy no guia do usuário e
  no ebook `v1.9.0`.

### Alterado

- Torna Laravel Octane com Open Swoole o runtime obrigatório das aplicações
  Laravel atendidas pelo Specsfy.
- Adota `deploy` como usuário operacional do servidor e mantém `app` como
  usuário interno do container.
- Faz o arquivo `SEMVER` governar a tag da imagem e a versão usada no deploy.

### Segurança

- Mantém valores sensíveis no Ansible Vault e os converte em Docker Secrets
  externos sem gravar senhas na stack.
- Sincroniza somente chaves públicas locais e preserva acessos SSH existentes.

### Validação

- `python3 -B -m unittest discover -s specialists/tests -p 'test_*.py'`
- `uv run --with behave behave specialists/tests/features`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `PYTHONPATH=skills uv run --with behave behave skills/tests/features`
- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `make verify-ebook`
- `ansible-playbook ansible/deploy.yml --syntax-check`

## [0.12.0] - 2026-09-03

### Adicionado

- Adiciona o especialista de versionamento para criar, consultar, incrementar
  e conferir o arquivo `SEMVER` na raiz do projeto consumidor.
- Adiciona o especialista de Debian Server e amplia o fluxo de deploy com
  Docker, Docker Swarm, Ansible e engenharia de entrega.
- Publica o capítulo "Da versão ao servidor" no guia do usuário e inclui a
  edição `v1.8.0` do ebook em PDF e EPUB.

### Alterado

- Faz Ansible, Docker Swarm e engenharia de entrega carregarem o especialista
  de versionamento durante a preparação do deploy.
- Faz Docker consultar `SEMVER` quando a imagem representar uma release.

### Validação

- `python3 -B -m unittest discover -s specialists/tests -p 'test_*.py'`
- `uv run --quiet --with behave==1.3.3 behave specialists/tests/features --no-capture`
- `python3 -B -m unittest discover -s skills/tests -p 'test_*.py'`
- `cd skills && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `make verify-ebook`

## [0.11.2] - 2026-08-31

### Corrigido

- Declara no especialista de componentes React a relação recíproca com o
  especialista de experiência de interface.
- Restaura os contratos Python e BDD do catálogo de especialistas após a
  publicação do roteamento obrigatório para componentes de UI.

### Validação

- `cd specialists && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd specialists && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `cd skills && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd skills && uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`

## [0.11.1] - 2026-08-31

### Adicionado

- Exige `specsfy-specialist-react-ui-components` no planejamento e na
  implementação de telas React antes da escrita de JSX ou TSX.
- Faz o setup instalar o especialista de componentes quando React for
  detectado no projeto.
- Adiciona um contrato automatizado para manter o roteamento presente nas
  skills, nos templates e no especialista de experiência de interface.

### Documentação

- Atualiza os guias de tarefas, implementação e especialistas com a sequência
  de seleção, reaproveitamento e adaptação de componentes.
- Reconstrói o guia do usuário em PDF e EPUB com as fontes documentais atuais.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave behave tests/features --no-capture`
- `cd skills && node specsfy-04-validate/scripts/verify_repo.mjs . --boundary local`
- `make verify-ebook`

## [0.11.0] - 2026-08-30

### Adicionado

- Verifica durante o setup que projetos Laravel possuem `.env.testing` com
  banco explícito e separado do ambiente de desenvolvimento.
- Inclui um gate reutilizável que inspeciona comandos diretos, aliases de
  Composer e npm, traits de teste e o método `up` das migrations antes da
  execução.
- Faz o setup confirmar cobertura de CRUD, caminhos de menu e reconstrução da
  documentação técnica do sistema existente.

### Corrigido

- Suspende testes no CLI, na TUI e nas skills de TDD e implementação quando o
  ambiente de teste não está comprovadamente separado.
- Recusa resets, wipes, drops, truncates, `RefreshDatabase` e
  `DatabaseMigrations`, sem permitir execução forçada.
- Atualiza a aplicação de exemplo para usar SQLite exclusivo de teste,
  migrations de avanço inspecionadas e `DatabaseTransactions`.

### Documentação

- Publica as regras de proteção no guia Laravel, na referência do CLI, nas
  páginas das skills, na documentação técnica e no ebook `v1.7.20`.

### Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave==1.3.3 behave tests/features --no-capture`
- `cd skills && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd specialists && python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `cd cli && npm run check`
- `node skills/specsfy-setup/scripts/check_database_safety.mjs --project example --command 'composer test'`
- `composer --working-dir=example test`
- `make verify-ebook`

## [0.10.5] - 2026-08-27

## Correções

- Alinha os testes automatizados da importação de `MVP.md` ao fluxo atual: somente requisitos desenvolvíveis criam backlog e spec Draft; a milestone mantém proveniência e triagem, sem Inboxes ou cópia de contexto de negócio.

## Validação

- Testes unitários e cenários BDD da biblioteca de skills executados com sucesso.

## [0.10.4] - 2026-08-27

## Corrigido

- Importa do `MVP.md` somente requisitos de desenvolvimento, criando backlogs
  e specs Draft sem gerar Inboxes automáticas.
- Mantém contexto de negócio, público, métricas e posicionamento no arquivo de
  origem, enquanto `M01` registra apenas a proveniência e a triagem.

## Validação

- `python3 -B -m unittest discover -s tests -p 'test_*.py'`
- `uv run --quiet --with behave behave tests/features --no-capture`
- `make verify-ebook`

## [0.10.3] - 2026-08-27

### Adicionado

- Expande o contrato de Design System, a composição de interfaces e os
  especialistas disponíveis, com documentação, testes e templates alinhados.
- Publica o guia do usuário do Specsfy na edição `v1.7.18`.

## [0.10.2] - 2026-08-24

### Corrigido

- Atualiza o cenário BDD de composição React para reconhecer o Design System
  como requisito do especialista de componentes e inclui essa skill no grupo
  de interface do catálogo.
- Mantém testes unitários, cenários BDD, metadados e requisitos do catálogo
  alinhados com o conjunto publicado de especialistas.

## [0.10.1] - 2026-08-24

### Corrigido

- Alinha o catálogo, os metadados e o contrato de qualidade do especialista de
  Design System, incluindo seus padrões de referência e os requisitos dos
  componentes de interface.
- Mantém a suíte de especialistas compatível com o catálogo publicado e
  recompõe o executável com a versão `0.10.1`.

## [0.10.0] - 2026-08-24

### Adicionado

- Cria o template `UserProfile.md` e faz `$specsfy-setup` materializar
  `.specsfy/USER-PROFILE.md` para registrar o nível de conhecimento, respostas
  confirmadas, fonte, data e alcance.
- Adapta as perguntas do setup ao nível `iniciante`, `intermediário` ou
  `experiente`, consultando a conversa e os arquivos do projeto para não
  repetir assuntos já respondidos.
- Define defaults de interface para CRUD, dashboard, Breadcrumb, navegação por
  equipe e formulários responsivos em duas colunas, com documentação e
  especialistas correspondentes.

### Corrigido

- Torna as linhas do DataGrid clicáveis por inteiro, preservando ações internas
  e a navegação por teclado.
- Reaproveita o Breadcrumb existente em aplicações Laravel e garante a equipe
  atual no contexto das telas autenticadas.
- Atualiza o CLI, os templates, os testes, a documentação e o ebook para o
  fluxo de contexto e interface publicado nesta versão.

## [0.9.3] - 2026-08-23

### Corrigido

- Corrige o modal de leitura de specs: `Esc` e o botão **Fechar Esc** encerram a visualização, removem seus controles da pilha de foco e devolvem a seleção à lista de origem.
- Mantém `Tab` e `Shift+Tab` no conteúdo do modal e no fechamento, sem levar o foco para controles ocultos atrás da visualização.
- Adiciona regressões com byte Escape de TTY, foco após o fechamento e controle de mouse, além de atualizar os guias e o ebook.

## [0.9.2] - 2026-08-22

- Evita repetir a mesma oferta de atualização depois de uma recusa ou falha,
  respeitando o intervalo configurado e mantendo `specsfy upgrade` como
  consulta forçada.
- Atualiza corretamente executáveis avulsos expostos por symlink, substituindo
  o arquivo real sem remover o caminho usado no `PATH`.
- Adiciona regressões para adiamento, bypass explícito, fluxo de inicialização
  e atualização de symlink.

## [0.9.1] - 2026-08-22

- Corrige a navegação da TUI, o foco após fechar telas, o fechamento por
  `Ctrl+Q` e a atualização de painéis durante a execução de testes.
- Preserva seleções de skills durante refresh e impede que operações
  assíncronas devolvam a pessoa para uma aba antiga.
- Faz o updater comparar a versão publicada no npm, evita avisos repetidos e
  atualiza executáveis avulsos com validação e substituição atômica.
- Completa a importação de MVP com defaults óbvios, pendências explícitas,
  backlogs somente para desenvolvimento e specs derivadas desses backlogs.

## [0.9.0] - 2026-08-21

- Adiciona especialistas essenciais ao setup e amplia o catálogo de
  especialistas do Specsfy.
- Torna a descoberta de MVP contextual e preserva seu resultado em inboxes.
- Suporta projetos em subdiretórios do Hub e padroniza interfaces React com
  ReUI.
- Publica aliases estáveis do ebook e amplia o contexto auxiliar do CLI.

## [0.8.1] - 2026-08-13

- Inclui o pacote oficial `skills` como dependência do CLI e o localiza mesmo
  quando um launcher inicia o Specsfy com um `PATH` reduzido.
- Alinha o requisito mínimo ao Node.js 22.20 exigido pelo materializador.
- Adiciona `specsfy setup` como alias de `specsfy install`, com o mesmo
  diagnóstico de Node.js, Git, projeto e materializador de skills.
- Adiciona `specsfy doctor` e executa o mesmo diagnóstico antes do setup para
  conferir Node.js, Git, npm, projeto e disponibilidade do `skills` ou `npx`.
- Adiciona `specsfy update` para atualizar todas as skills Specsfy instaladas e
  preserva `specsfy skills update` como comando compatível.
- Adiciona `specsfy upgrade` para consultar uma versão estável mais recente e
  atualizar o próprio CLI pelo pacote oficial do npm sem fazer downgrade.
- Documenta separadamente instalação, atualização das skills e atualização do
  CLI nos guias, na referência de comandos, no ebook e no site.

## [0.8.0] - 2026-08-12

- Adiciona os comandos `transition`, `migrate` e `effort` para manter pasta,
  status e estimativa das specs pela mesma interface, com saída JSON e
  integração opcional com o ClickUpfy.
- Adiciona `milestones sync` para projetar o progresso dos milestones em
  `specs.md` e `specs/milestones/`, preservando o conteúdo escrito pelo
  usuário.
- Passa a ler o ciclo de vida em `specs/<estado>/`, mantém compatibilidade com
  o layout anterior e inclui Effort e perfil de execução no progresso.
- Amplia o bootstrap com as skills de entrevista e governança de milestones e
  mantém a instalação protegida por fingerprints.
- Reorganiza a paleta escura da TUI com cores semânticas e contraste verificado
  para texto, foco, seleção, bordas, campos, botões e barras de rolagem.
- Atualiza capturas, documentação de usuário e desenvolvimento, referência de
  comandos, ebook e publicação dos guias no site da Promovaweb.

## [0.7.0] - 2026-07-30

- Migra o CLI e a TUI de Python para Node.js 22, com instalação global por
  `@promovaweb/specsfy`.
- Mantém as seis abas da TUI e adiciona execução do Pest com resumo e saída
  rolável.
- Corrige os atalhos de controle interpretados pelo `neo-blessed` e evita o
  encerramento da TUI durante a atualização da saída dos testes.
- Adiciona o fluxo de release com changelog, commit, tag anotada, GitHub
  Actions, publicação npm e GitHub Release vinculados à mesma versão.
- Atualiza o instalador, o catálogo de especialistas e a documentação do
  usuário para os comandos do CLI em Node.js.

- Autentica catálogo e verificação de tags em repositórios privados com
  `GH_TOKEN`, `GITHUB_TOKEN` ou a sessão do GitHub CLI.
- Torna o fingerprint do executável estável entre permissões equivalentes do
  Git e ambientes locais/CI.
