---
name: specsfy-setup
description: Preparar e monitorar os contextos do projeto, incluindo a constituição e as specs preservadas de projetos com GitHub Spec Kit.
---

# Preparar contexto do projeto

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

## Perfil de conhecimento e memória de respostas

O setup conduz uma conversa adaptativa curta. Ele não aplica um questionário
fixo nem pergunta novamente algo que já esteja confirmado.

Antes de formular qualquer pergunta, leia, nesta ordem:

1. `.specsfy/USER-PROFILE.md`, quando existir;
2. a conversa atual e as respostas já dadas;
3. `PROJECT.md`, `DESIGNSYSTEM.MD`, `.specsfy/STACK.md`,
   `.specsfy/RULES.md`, `.specsfy/DATABASE.md` e `.specsfy/PACKAGES.md`;
4. `AGENTS.md`, `CLAUDE.md`, `.specsfy/SPECKIT.md` e as fontes relacionadas
   listadas por ele, quando existirem;
5. Inbox, backlog e specs aplicáveis, sem alterar esses arquivos.

Monte mentalmente um mapa de assuntos respondidos. Uma declaração explícita da
pessoa ou uma informação inequívoca nas fontes responde ao assunto, mesmo que
use palavras diferentes da pergunta. Não peça confirmação, escolha ou
reformulação de algo já claro. Pergunte somente por lacuna, conflito ou
informação que mudou desde a última confirmação.

Quando o nível geral ainda não estiver registrado no perfil nem na conversa,
faça esta primeira rodada:

```text
Pergunta 1. Como você prefere receber as orientações deste setup?
1. Iniciante: explique os termos técnicos e o efeito de cada escolha antes de prosseguir.
2. Intermediário: conheço os fundamentos e prefiro explicações curtas junto das escolhas.
3. Experiente: posso responder com detalhes de stack, arquitetura, comandos e integrações.
4. Escrever outra resposta
5. Gere outras opções
6. Avançar
```

Normalize a resposta para `iniciante`, `intermediário` ou `experiente` e grave-a
em `.specsfy/USER-PROFILE.md`, com a fonte e a data. Se o perfil já tiver um
nível confirmado, use-o sem perguntar. Se a conversa ou o perfil apresentarem
níveis diferentes, faça somente uma pergunta para resolver esse conflito e
registre a atualização.

Adapte a profundidade por rodada:

- `iniciante`: explique cada termo técnico na própria pergunta, diga por que a
  informação é necessária e descreva o efeito prático das opções;
- `intermediário`: use os nomes técnicos conhecidos e acrescente uma explicação
  curta somente quando a escolha puder ser confundida;
- `experiente`: pergunte diretamente por versões, fronteiras de framework,
  autenticação, persistência, testes, interface, deploy ou integrações quando
  esse assunto ainda estiver aberto.

O nível ajusta a linguagem, não autoriza presumir respostas. Se a pessoa
demonstrar experiência diferente por área, adapte aquela área sem alterar o
nível geral sem confirmação. Depois de cada resposta, atualize o perfil, retire
o assunto do mapa de lacunas e só então selecione a próxima pergunta. Respeite
o limite de oito perguntas por área e o restante do contrato numerado.

## Roteiro adaptativo do setup

Depois de confirmar o diretório e ler o projeto, selecione o primeiro assunto
necessário ainda sem resposta confirmada:

1. objetivo do produto e resultado principal;
2. pessoas usuárias, equipes e papéis;
3. acesso, autenticação e permissões;
4. dados principais, relações e tempo de retenção;
5. telas, navegação e estados da interface;
6. testes, observabilidade e deploy;
7. integrações externas e serviços dependentes.

Consulte o mapa de assuntos antes de cada rodada. Se a fonte já informar o
assunto com clareza, registre a origem no perfil e passe ao próximo. Se duas
fontes divergirem, pergunte somente para resolver a diferença. Se todos os
assuntos aplicáveis estiverem confirmados, informe que o setup seguirá para a
reconciliação dos arquivos e não crie perguntas artificiais.

Adapte a formulação ao nível confirmado. Para iniciantes, explique o termo na
pergunta, diga por que a resposta será usada e mostre o efeito prático de cada
opção. Para pessoas intermediárias, use o nome técnico e uma explicação breve.
Para pessoas experientes, pergunte diretamente por versões, fronteiras de
framework, estratégia de autenticação, persistência, testes, observabilidade,
deploy e contratos de integração ainda ausentes.

Cada rodada apresenta uma pergunta, opções numeradas, `Escrever outra resposta`,
`Gere outras opções` e `Avançar`, conforme o contrato de `.specsfy/Spec.md`.
Após a resposta, normalize o conteúdo, registre área, assunto, resposta, fonte,
data e alcance em `.specsfy/USER-PROFILE.md`, e só então avance.

## Cobertura funcional obrigatória no setup

Durante a leitura do produto, relacione cada entidade de negócio às ações que a
pessoa precisa executar. Quando a jornada exigir administrar registros,
confirme a cobertura de criar, consultar, editar e apagar. Não force um CRUD
para dados somente de leitura, históricos imutáveis, eventos ou informações
mantidas por uma integração. Se as fontes não mostrarem quais ações são
necessárias, confirme com a pessoa por meio de uma rodada do contrato numerado
antes de registrar a cobertura.

Para cada tela de uso recorrente, identifique como a pessoa chega até ela pelos
menus do sistema e registre o item, o destino, a permissão e o comportamento
responsivo em `INTERFACE.md`. Uma rota técnica, callback ou etapa acessada
somente por redirecionamento pode ficar fora do menu quando a própria jornada
comprovar esse acesso. Se não estiver claro se a tela recebe um link ou em qual
menu ela aparece, confirme com a pessoa em uma única rodada antes de seguir.

O setup registra essas necessidades no contexto persistente e encaminha
qualquer mudança de comportamento para o backlog e a spec. Ele não cria telas,
rotas ou persistência por conta própria. A implementação posterior deve cobrir
o CRUD e os links confirmados, com tarefas e testes próprios.

Em toda execução completa do setup, carregue `$specsfy-documentator` depois de
reconciliar os contextos e especialistas. Reconstrua a documentação técnica de
todo o sistema existente em `docs/` e `.specsfy/PACKAGES.md`, mesmo quando não
houver mudança recente em aplicação, persistência ou dependências. Preserve
texto humano fora dos blocos gerenciados e resolva qualquer resultado
`PENDING` antes de encerrar.

## Proteção do banco durante o setup

Quando o projeto tiver `artisan`, execute durante o setup:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project <raiz>
```

Exija `.env.testing` com `APP_ENV=testing` e um destino de banco declarado de
forma explícita. O banco de teste precisa ser diferente do banco indicado no
`.env`; não aceite valor ausente que faça o Laravel herdar a configuração de
desenvolvimento. O script não mostra credenciais nem valores de conexão.

Um resultado `PENDING` impede qualquer teste focal, suíte ou regressão. Corrija
o ambiente de testes, execute a conferência novamente e só continue após
`SAFE`. Nunca rode um teste usando o banco de desenvolvimento, nem mesmo para
diagnóstico. Um resultado `IGNORED` indica comando ou configuração capaz de
apagar estruturas ou registros; não execute o comando e não ofereça uma opção
para forçar sua execução.

1. Antes de ler ou escrever, confirme o diretório do projeto. Na primeira
   execução da conversa, se a pessoa já informou um caminho, resolva-o para um
   caminho absoluto e repita-o. Quando ela não informou, ofereça exatamente
   estas opções numeradas e aguarde a resposta: `1. Usar o diretório atual.`,
   `2. Usar um subdiretório do Hub.` e `3. Informar outro caminho.`. Não deduza
   o destino pela raiz Git. Nas execuções obrigatórias seguintes da mesma
   conversa, reutilize a raiz confirmada sem repetir a pergunta.
2. Use a raiz confirmada em cada comando posterior. Ao trabalhar em um Hub,
   execute no subdiretório escolhido ou passe `--project <raiz>` e
   `--root <raiz>` para scripts de contexto e specs. Não crie contexto, specs,
   testes ou código no diretório pai.
3. Ler `AGENTS.md`, `CLAUDE.md` e instruções locais da raiz confirmada antes de
   escrever. Em seguida, executar `node scripts/inspect_project.mjs --project
   <raiz>`. Ler as fontes listadas, na ordem retornada: instruções, manifests,
   configuração, aplicação, rotas, persistência, integrações, interface, testes
   e documentação. Não comece descoberta, sugestão de stack ou escrita até
   entender o sistema atual e registrar o que será preservado.
4. Ler [as diretrizes publicáveis](references/framework-instructions.md) quando
   precisar auditar o bloco reservado em arquivos de agentes.
   Quando `.specify/memory/constitution.md` existir, ler também
   [a compatibilidade com GitHub Spec Kit](references/github-spec-kit.md).
5. Executar `specsfy doctor --project <raiz>` e corrigir cada requisito
   ausente antes de preparar o contexto. O diagnóstico confere Node.js, Git,
   npm, acesso ao projeto e o `npx`.
6. Executar `node scripts/setup_context.mjs --project <raiz>`.
   Renderizar `PROJECT.md`, `STACK.md`, `RULES.md`, `DATABASE.md`,
   `INTERFACE.md`, `DESIGNSYSTEM.MD` e `.specsfy/USER-PROFILE.md` a partir de
   `.specsfy/templates/custom/<Nome>.md` quando existir ou dos arquivos
   gerenciados `.specsfy/templates/Project.md`, `Stack.md`, `Rules.md`,
   `Database.md`, `Interface.md`, `DESIGNSYSTEM.MD` e `UserProfile.md` caso
   contrário; não manter
   modelos paralelos embutidos no script. O `DESIGNSYSTEM.MD` fica na raiz do
   projeto, nasce com defaults de interface comuns e é criado somente quando
   ainda não existir. O mesmo comando deve ler a constituição e todos os arquivos
   regulares em `specs/` quando detectar GitHub Spec Kit, depois atualizar o
   bloco gerenciado de `.specsfy/SPECKIT.md`.
7. No início e no fim de cada mudança, executar:

   ```bash
   node scripts/monitor_context.mjs --project <raiz> --check
   ```

   Em Laravel, executar também `check_database_safety.mjs --project <raiz>` e
   manter toda execução de testes suspensa até o resultado `SAFE`.

8. Inspecionar os arquivos iniciais, incluindo `.specsfy/USER-PROFILE.md`, e
   `.specsfy/PACKAGES.md` quando
   gerado e a fonte de stack usada pelo script. Quando `.specsfy/SPECKIT.md`
   existir, abrir a constituição e cada fonte original listada na projeção.
   Antes de qualquer descoberta de interface, executar também
   `node scripts/inspect_interface.mjs --project <raiz>` e abrir as rotas,
   componentes e telas atuais relacionados ao pedido. A saída orienta a
   análise, mas não substitui a leitura das fontes do sistema. A leitura geral
   do projeto inclui regras de autorização, papéis, dados, integrações, rotas,
   telas, componentes, estados, testes e documentos existentes que apareçam no
   relatório. Quando a base for grande, prossiga por grupos e informe quais
   fontes foram lidas antes de propor qualquer alteração; não trate a ausência
   de leitura como permissão para substituir convenções.
9. Nunca substituir um arquivo de contexto existente, mesmo com conteúdo
   incompleto. Em `AGENTS.md`, `CLAUDE.md` e `.specsfy/SPECKIT.md`, atualizar
   somente o bloco delimitado do framework e preservar tudo fora dele. Nunca
   escrever, mover, renomear ou remover arquivos em `.specify/` e `specs/`.
10. Depois de ler a stack, instale primeiro o núcleo essencial do Specsfy:
   `specsfy-specialist-data-modeling`,
   `specsfy-specialist-domain-modeling` e
   `specsfy-specialist-software-architecture`, `specsfy-specialist-shadcn-ui`
   e `specsfy-specialist-reui`.
   Em seguida, executar
   `specsfy skills detect --project <raiz>`. Apresente a tabela de
   correspondência abaixo com o núcleo e os especialistas detectados, avisando
   quais serão instalados. A pessoa já autorizou este comportamento ao iniciar
   o setup; instale o núcleo e cada especialista detectado no projeto
   consumidor, sem incluir outros especialistas genéricos, sempre por:

   ```bash
   npx skills add https://github.com/promovaweb/specsfy \
     --skill <especialista-detectado> --agent universal --copy -y --full-depth
   ```

   Depois da instalação, carregue os especialistas instalados que forem
   necessários à etapa atual. Se o comando falhar, informe o nome, a saída e a
   continuação possível; não substitua a instalação por cópia manual.
   Especialistas instalados manualmente continuam válidos: não os remova nem
   tente reinstalá-los sem necessidade.
11. Para completar ou corrigir stack, regras ou dados, anunciar o handoff e
   carregar respectivamente `$specsfy-aux-stack`, `$specsfy-aux-rules` ou
   `$specsfy-aux-database`.
12. Em toda execução completa do setup, carregar `$specsfy-documentator`
   depois das auxiliares e reconstruir `docs/` e `.specsfy/PACKAGES.md` a
   partir de todo o projeto. Quando aplicação, persistência ou dependências
   mudar durante outra etapa, repetir o documentador ao fim da implementação.
13. Somente quando a pessoa solicitar ou indicar explicitamente o uso de
   Gitflow para o projeto (ver [references/gitflow.md](references/gitflow.md)),
   anunciar o handoff, carregar `$specsfy-specialist-gitflow` e registrar a
   convenção de branches confirmada em `RULES.md` via `$specsfy-aux-rules`.
   Nunca propor, presumir ou aplicar Gitflow a partir da estrutura de
   branches do repositório, da presença de uma branch `develop` ou de
   qualquer outro sinal implícito.

Não contornar um resultado `PENDING`. Atualizar o documento indicado e executar
o monitor novamente. Para mudança de aplicação sem impacto material na história
ou finalidade, registrar essa avaliação nas fontes da tarefa e repetir com
`--acknowledge-project-no-change`. Aplicar a mesma disciplina a regras com
`--acknowledge-rules-no-change`; nunca usar o reconhecimento para ocultar uma
mudança documental real.

Manter `PROJECT.md`, `INTERFACE.md` e `DESIGNSYSTEM.MD` na raiz. Manter
`STACK.md`, `RULES.md`, `DATABASE.md`, `PACKAGES.md`, `USER-PROFILE.md` e a
projeção opcional `SPECKIT.md` em `.specsfy/`. Tratar esses
documentos como contexto derivado do projeto, não como spec, gate ou
autorização de implementação.

Em projeto com mais de um framework, registrar todas as fontes observadas;
não escolher silenciosamente um único stack. Se nenhum framework for
identificado, criar o modelo genérico e declarar que a confirmação está
pendente.

## Stack e especialistas instalados pelo setup

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

Para todo projeto Laravel com React, o setup instala shadcn/ui e ReUI juntos.
Não trate essa dupla como opcional: shadcn/ui prepara a base e ReUI cria CRUDs
e interfaces sobre ela.

Para toda aplicação Laravel, Laravel Octane com Open Swoole é obrigatório.
Confira `laravel/octane` em `composer.json` e `composer.lock`, a extensão
`openswoole` na imagem e `--server=swoole` no runtime. Registre essa combinação
em `.specsfy/STACK.md` e encaminhe a instalação ou correção ausente para uma
spec antes de aprovar o setup.

Depois de instalar a dupla, o setup registra em `INTERFACE.md` que telas React
são compostas por componentes. Cada nova tela deve consultar o mapa, reutilizar
o que já existe e registrar componentes próprios, primitives shadcn/ui e
composições ReUI com arquivos e consumidores reais.
