---
name: specsfy-setup
description: Prepara, reconcilia e monitora o contexto persistente de um projeto Specsfy (PROJECT.md, DESIGNSYSTEM.MD, INTERFACE.md, STACK, RULES, DATABASE, PACKAGES e USER-PROFILE), confere a proteção do banco de testes, instala os especialistas detectados e preserva projetos com GitHub Spec Kit. Use no início de qualquer skill Specsfy, quando o projeto ainda não tiver contexto, quando o monitor apontar PENDING ou quando a pessoa pedir para configurar o Specsfy. Não use para registrar ideias (specsfy-01-inbox), refinar backlog (specsfy-02-backlog) nem para manter só stack, regras ou banco (specsfy-aux-stack, specsfy-aux-rules, specsfy-aux-database).
---

# Preparar contexto do projeto

Garanta que o projeto tem um contexto persistente correto antes de qualquer
outra skill trabalhar. O setup lê o sistema existente, cria apenas os arquivos
de contexto ausentes, atualiza somente blocos reservados e encaminha lacunas
para as skills responsáveis. Ele não cria telas, rotas, persistência nem specs.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

## Escolher o caminho

| Situação | Caminho |
| --- | --- |
| A raiz já foi confirmada nesta conversa e o setup completo já rodou | Caminho curto |
| Primeira execução na conversa, contexto ausente ou pedido explícito de configuração | Caminho completo |
| O monitor retornou `PENDING` | Caminho curto com a correção indicada |

### Caminho curto

Use quando outra skill carrega o setup ou quando há handoff automático.

1. Reutilize a raiz confirmada, sem perguntar de novo.
   Nas execuções obrigatórias seguintes da mesma conversa, a confirmação
   inicial continua válida.
2. Execute o monitor:

   ```bash
   node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
     --project <raiz> --check
   ```

3. Em Laravel, execute também `check_database_safety.mjs --project <raiz>`
   (seção `Proteção do banco durante o setup`).
4. Se tudo estiver atual, devolva o controle à skill chamadora. Se houver
   `PENDING`, resolva pela tabela de handoffs da seção `Monitorar e resolver
   pendências` e repita o monitor.

### Caminho completo

Siga as etapas na ordem. As leituras dentro de uma mesma etapa podem ser feitas
em paralelo; as etapas dependem do resultado da anterior.

1. **Confirmar a raiz.** Se a pessoa já informou um caminho, resolva-o para
   caminho absoluto e repita-o. Se não informou, ofereça exatamente estas
   opções numeradas e aguarde: `1. Usar o diretório atual.`,
   `2. Usar um subdiretório do Hub.` e `3. Informar outro caminho.`. Não deduza
   o destino pela raiz Git. Em um Hub, execute no subdiretório escolhido ou
   passe `--project <raiz>` e `--root <raiz>` aos scripts; contexto, specs,
   testes e código ficam dentro dessa raiz, nunca no diretório pai.
2. **Ler o projeto.** Leia em paralelo `AGENTS.md`, `CLAUDE.md` e as instruções
   locais. Depois execute
   `node .agents/skills/specsfy-setup/scripts/inspect_project.mjs --project <raiz>`
   e leia as fontes na ordem retornada: instruções, manifests, configuração,
   aplicação, rotas, persistência, integrações, interface, testes e
   documentação. Em base grande, leia por grupos e diga quais fontes foram
   lidas. Só proponha stack ou escreva algo depois de entender o sistema atual
   e registrar o que será preservado; não ter lido uma fonte não autoriza
   substituir suas convenções.
3. **Consultar referências quando couber.** Leia
   [as diretrizes publicáveis](references/framework-instructions.md) para
   auditar o bloco reservado nos arquivos de agentes. Quando
   `.specify/memory/constitution.md` existir, leia
   [a compatibilidade com GitHub Spec Kit](references/github-spec-kit.md).
4. **Diagnosticar o ambiente.** Execute `specsfy doctor --project <raiz>` e
   corrija cada requisito ausente (Node.js, Git, npm, acesso ao projeto e
   `npx`) antes de continuar.
5. **Reconciliar o contexto.** Execute
   `node .agents/skills/specsfy-setup/scripts/setup_context.mjs --project <raiz>`.
   Detalhes na seção `Arquivos de contexto`.
6. **Proteger o banco.** Em Laravel, rode a conferência da seção
   `Proteção do banco durante o setup`.
7. **Inspecionar o resultado.** Abra os arquivos gerados, incluindo
   `.specsfy/USER-PROFILE.md` e `.specsfy/PACKAGES.md` quando existir, e a
   fonte de stack usada pelo script. Com `.specsfy/SPECKIT.md`, abra a
   constituição e cada fonte original listada. Antes de qualquer descoberta de
   interface, execute
   `node .agents/skills/specsfy-setup/scripts/inspect_interface.mjs --project <raiz>`
   e abra as rotas, componentes e telas relacionados ao pedido. A saída orienta
   a leitura; não substitui as fontes.
8. **Conversar sobre lacunas.** Siga as seções `Perfil de conhecimento e
   memória de respostas` e `Roteiro adaptativo do setup`.
9. **Instalar especialistas.** Siga a seção `Stack e especialistas instalados
   pelo setup`.
10. **Completar stack, regras e dados.** Anuncie o handoff e carregue
    `$specsfy-aux-stack`, `$specsfy-aux-rules` ou `$specsfy-aux-database`,
    conforme a lacuna.
11. **Documentar.** Em toda execução completa do setup, carregue
    `$specsfy-documentator` depois das auxiliares (seção `Cobertura funcional
    obrigatória no setup`).
12. **Gitflow, somente sob pedido.** Quando a pessoa pedir ou indicar
    explicitamente Gitflow (ver [references/gitflow.md](references/gitflow.md)),
    anuncie o handoff, carregue `$specsfy-specialist-gitflow` e registre a
    convenção de branches confirmada em `RULES.md` via `$specsfy-aux-rules`.
    Uma branch `develop` ou outro sinal implícito no repositório não é pedido.
13. **Fechar.** Execute o monitor novamente e resolva todo `PENDING`.

## Pronto quando

- A raiz está confirmada e todos os comandos usaram essa raiz.
- `monitor_context.mjs --check` não retorna `PENDING`.
- Em Laravel, `check_database_safety.mjs` retornou `SAFE`.
- Os arquivos de contexto existem, nenhum arquivo existente foi substituído e
  os blocos reservados estão atualizados sem duplicação.
- O núcleo e os especialistas detectados foram instalados ou a falha foi
  relatada com a saída do comando.
- Na execução completa, `docs/` e `.specsfy/PACKAGES.md` foram reconstruídos
  pelo `$specsfy-documentator`.
- Repetir o setup com as mesmas entradas não altera nada.

## Arquivos de contexto

O `setup_context.mjs` renderiza `PROJECT.md`, `STACK.md`, `RULES.md`,
`DATABASE.md`, `INTERFACE.md`, `DESIGNSYSTEM.MD` e `.specsfy/USER-PROFILE.md`
a partir de `.specsfy/templates/custom/<Nome>.md` quando existir; caso
contrário, usa os gerenciados `.specsfy/templates/Project.md`, `Stack.md`,
`Rules.md`, `Database.md`, `Interface.md`, `DESIGNSYSTEM.MD` e
`UserProfile.md`. O script não mantém modelos paralelos embutidos. Quando
detecta GitHub Spec Kit, o mesmo comando lê a constituição e todos os arquivos
regulares em `specs/` e atualiza o bloco gerenciado de `.specsfy/SPECKIT.md`.

- `PROJECT.md`, `INTERFACE.md` e `DESIGNSYSTEM.MD` ficam na raiz. O
  `DESIGNSYSTEM.MD` nasce com defaults de interface comuns e só é criado
  quando ainda não existe.
- `STACK.md`, `RULES.md`, `DATABASE.md`, `PACKAGES.md`, `USER-PROFILE.md` e a
  projeção opcional `SPECKIT.md` ficam em `.specsfy/`.
- Esses documentos são contexto derivado do projeto, não spec, gate nem
  autorização de implementação.
- Nunca substitua um arquivo de contexto existente, mesmo incompleto: ele pode
  conter decisões humanas. Em `AGENTS.md`, `CLAUDE.md` e
  `.specsfy/SPECKIT.md`, atualize somente o bloco delimitado do framework.
  Nunca cabe ao setup escrever, mover, renomear ou remover arquivos em
  `.specify/` e `specs/`, porque pertencem ao Spec Kit e às specs existentes.
- Em projeto com mais de um framework, registre todas as fontes observadas, sem
  escolher um único stack em silêncio. Sem framework identificado, crie o
  modelo genérico e declare a confirmação como pendente.
- O setup inicial não cria `SEMVER`, `Dockerfile`, `compose.yaml`,
  `stack.yaml`, `deploy` nem `ansible/`. Versionamento e deploy começam só
  quando a pessoa pedir; nesse caso, anuncie o handoff para
  `$specsfy-specialist-deploy`.
- Toda execução é idempotente: com as mesmas entradas, não altera arquivos já
  reconciliados, não duplica blocos e não inicia outra etapa.

## Perfil de conhecimento e memória de respostas

O setup conduz uma conversa adaptativa curta. Não aplica questionário fixo e
não pergunta novamente algo já confirmado.

Antes de qualquer pergunta, leia em paralelo:

1. `.specsfy/USER-PROFILE.md`, quando existir;
2. a conversa atual e as respostas já dadas;
3. `PROJECT.md`, `DESIGNSYSTEM.MD`, `.specsfy/STACK.md`,
   `.specsfy/RULES.md`, `.specsfy/DATABASE.md` e `.specsfy/PACKAGES.md`;
4. `AGENTS.md`, `CLAUDE.md`, `.specsfy/SPECKIT.md` e as fontes listadas por
   ele, quando existirem;
5. Inbox, backlog e specs aplicáveis, sem alterar esses arquivos.

Monte um mapa de assuntos respondidos. Uma declaração explícita da pessoa ou
uma informação inequívoca nas fontes responde ao assunto, mesmo com outras
palavras. Pergunte somente por lacuna, conflito ou informação que mudou desde
a última confirmação.

Quando o nível geral ainda não estiver no perfil nem na conversa, faça esta
primeira rodada:

```text
Pergunta 1. Como você prefere receber as orientações deste setup?
1. Iniciante: explique os termos técnicos e o efeito de cada escolha antes de prosseguir.
2. Intermediário: conheço os fundamentos e prefiro explicações curtas junto das escolhas.
3. Experiente: posso responder com detalhes de stack, arquitetura, comandos e integrações.
4. Escrever outra resposta
5. Gere outras opções
6. Avançar
```

Normalize a resposta para `iniciante`, `intermediário` ou `experiente` e grave
em `.specsfy/USER-PROFILE.md` com fonte e data. Com nível já confirmado, use-o
sem perguntar. Se conversa e perfil divergirem, faça uma única pergunta para
resolver o conflito e registre a atualização.

| Nível | Como perguntar |
| --- | --- |
| `iniciante` | explique o termo técnico na própria pergunta, diga por que a resposta é necessária e o efeito prático de cada opção |
| `intermediário` | use o nome técnico e acrescente explicação curta só quando a escolha puder confundir |
| `experiente` | pergunte direto por versões, fronteiras de framework, autenticação, persistência, testes, observabilidade, deploy e contratos de integração ainda abertos |

O nível ajusta a linguagem e não autoriza presumir respostas. Se a pessoa
mostrar experiência diferente em uma área, adapte só aquela área. Depois de
cada resposta, registre área, assunto, resposta, fonte, data e alcance no
perfil, retire o assunto do mapa de lacunas e só então escolha a próxima
pergunta, dentro do limite de oito perguntas por área.

## Roteiro adaptativo do setup

Depois de confirmar a raiz e ler o projeto, escolha o primeiro assunto
necessário ainda sem resposta confirmada:

1. objetivo do produto e resultado principal;
2. pessoas usuárias, equipes e papéis;
3. acesso, autenticação e permissões;
4. dados principais, relações e tempo de retenção;
5. telas, navegação e estados da interface;
6. testes, observabilidade e deploy;
7. integrações externas e serviços dependentes.

Se a fonte já responde com clareza, registre a origem no perfil e passe ao
próximo. Se duas fontes divergem, pergunte só pela diferença. Com todos os
assuntos aplicáveis confirmados, avise que o setup segue para a reconciliação
dos arquivos, sem criar perguntas artificiais.

## Cobertura funcional obrigatória no setup

Durante a leitura do produto, relacione cada entidade de negócio às ações que a
pessoa precisa executar. Quando a jornada exigir administrar registros,
confirme a cobertura de criar, consultar, editar e apagar. Não force CRUD para
dados somente de leitura, históricos imutáveis, eventos ou informações mantidas
por integração. Se as fontes não mostrarem quais ações são necessárias,
confirme com a pessoa em uma rodada do contrato numerado antes de registrar.

Para cada tela de uso recorrente, identifique como a pessoa chega até ela pelos
menus do sistema e registre o item, o destino, a permissão e o comportamento
responsivo em `INTERFACE.md`. Rota técnica, callback ou etapa acessada só por
redirecionamento pode ficar fora do menu quando a jornada comprovar o acesso.
Se não estiver claro se a tela recebe link ou em qual menu aparece, confirme
com a pessoa em uma única rodada.

O setup registra essas necessidades no contexto e encaminha mudança de
comportamento para backlog e spec. A implementação posterior cobre o CRUD e os
links confirmados, com tarefas e testes próprios.

Em toda execução completa do setup, carregue `$specsfy-documentator` depois de
reconciliar contextos e especialistas. Reconstrua a documentação técnica de
todo o sistema existente em `docs/` e `.specsfy/PACKAGES.md`, mesmo sem mudança
recente em aplicação, persistência ou dependências. Preserve texto humano fora
dos blocos gerenciados e resolva qualquer `PENDING` antes de encerrar. Quando
aplicação, persistência ou dependências mudarem durante outra etapa, o
documentador roda de novo ao fim da implementação.

## Proteção do banco durante o setup

Quando o projeto tiver `artisan`, execute:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz>
```

Esta regra é inegociável, porque um teste no banco errado apaga dados reais:

- Exija `.env.testing` com `APP_ENV=testing` e destino de banco declarado de
  forma explícita, diferente do banco de desenvolvimento indicado no `.env`.
  Valor ausente faria o Laravel herdar a configuração de desenvolvimento e não
  é aceito. O script não mostra credenciais nem valores de conexão.
- `PENDING` impede qualquer teste focal, suíte ou regressão. Corrija o
  ambiente, repita a conferência e continue só após `SAFE`. Nenhum teste roda
  no banco de desenvolvimento, nem para diagnóstico.
- `IGNORED` indica comando ou configuração capaz de apagar estruturas ou
  registros, como `migrate:fresh`. Ignore o comando e não ofereça opção para
  forçar sua execução.

## Monitorar e resolver pendências

Execute `monitor_context.mjs --project <raiz> --check` no início e no fim de
cada mudança. Não contorne um `PENDING`: atualize o documento indicado e rode o
monitor de novo.

| Pendência | Responsável |
| --- | --- |
| stack | `$specsfy-aux-stack` |
| regras confirmadas | `$specsfy-aux-rules` |
| persistência | `$specsfy-aux-database` |
| `PACKAGES.md` ausente ou desatualizado, `docs/` desatualizado | `$specsfy-documentator` |

Para mudança de aplicação sem impacto material na história ou finalidade,
registre essa avaliação nas fontes da tarefa e repita com
`--acknowledge-project-no-change`. Para regras, use
`--acknowledge-rules-no-change` com a mesma disciplina. O reconhecimento serve
para registrar uma avaliação, não para ocultar mudança documental real.

## Stack e especialistas instalados pelo setup

Depois de ler a stack:

1. Instale o núcleo essencial do Specsfy (tabela abaixo).
2. Execute `specsfy skills detect --project <raiz>`.
3. Mostre a tabela de correspondência com o núcleo e os especialistas
   detectados e avise quais serão instalados. Ao iniciar o setup, a pessoa já
   autorizou essa instalação. Instale apenas o núcleo e os detectados, sem
   especialistas genéricos extras:

   ```bash
   npx skills add https://github.com/promovaweb/specsfy \
     --skill <especialista-detectado> --agent universal --copy -y --full-depth
   ```

4. Carregue os especialistas instalados necessários à etapa atual.
5. Se o comando falhar, informe nome, saída e a continuação possível. Não
   substitua a instalação por cópia manual. Especialistas instalados
   manualmente continuam válidos: não os remova nem reinstale sem necessidade.

| Stack observada | Especialista instalado |
| --- | --- |
| Laravel | `specsfy-specialist-laravel` |
| Pacote Laravel recebido por URL GitHub | `specsfy-specialist-laravel-package-manager` |
| Supabase | `specsfy-specialist-supabase` |
| PostgreSQL | `specsfy-specialist-postgres` |
| Redis | `specsfy-specialist-redis` |
| React | `specsfy-specialist-react` e `specsfy-specialist-react-ui-components` |
| Astro | `specsfy-specialist-astro` |
| Next.js | `specsfy-specialist-nextjs` |
| TypeScript | `specsfy-specialist-typescript` |
| Tailwind CSS | `specsfy-specialist-tailwind-css` |
| shadcn/ui | `specsfy-specialist-shadcn-ui` |
| Docker ou Compose | `specsfy-specialist-docker` |
| Release ou deploy completo | `specsfy-specialist-deploy` |
| Docker Swarm | `specsfy-specialist-docker-swarm` |
| Ansible | `specsfy-specialist-ansible` |
| OpenAPI | `specsfy-specialist-web-api-design` |
| OpenTelemetry ou Prometheus | `specsfy-specialist-observability` |
| CI/CD | `specsfy-specialist-delivery-engineering` |

| Núcleo instalado em todo setup | Finalidade |
| --- | --- |
| `specsfy-specialist-data-modeling` | dados, entidades, relações e ciclo de vida |
| `specsfy-specialist-domain-modeling` | linguagem, regras e limites de domínio |
| `specsfy-specialist-software-architecture` | módulos, dependências e estrutura técnica |
| `specsfy-specialist-reui` | base ReUI para interfaces e CRUDs React/Tailwind |
| `specsfy-specialist-shadcn-ui` | primitives, tema e registry para o ReUI |

Em todo projeto Laravel com React, shadcn/ui e ReUI são instalados juntos:
shadcn/ui prepara a base e ReUI cria CRUDs e interfaces sobre ela. Depois da
instalação, registre em `INTERFACE.md` que telas React são compostas por
componentes. Cada nova tela consulta esse mapa, reutiliza o que existe e
registra componentes próprios, primitives shadcn/ui e composições ReUI com
arquivos e consumidores reais.

Para toda aplicação Laravel, Laravel Octane com Open Swoole é obrigatório.
Confira `laravel/octane` em `composer.json` e `composer.lock`, a extensão
`openswoole` na imagem e `--server=swoole` no runtime. Registre a combinação em
`.specsfy/STACK.md` e encaminhe a instalação ou correção ausente para uma spec
antes de aprovar o setup.
