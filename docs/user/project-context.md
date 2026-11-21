<!-- markdownlint-disable MD013 -->

# Informações permanentes do projeto

O Specsfy separa a descrição durável do sistema das especificações de cada
mudança. O arquivo `PROJECT.md` explica a finalidade da aplicação, enquanto
cinco documentos em `.specsfy/` registram a stack, as instruções confirmadas,
a persistência observada no código, os pacotes instalados e o perfil de
interação do setup.
As orientações gerais de interface ficam em `DESIGNSYSTEM.MD`, na raiz do
projeto. Elas seguem um ciclo próprio com a skill especialista de interface.

Execute `$specsfy-setup` depois de instalar o framework. Depois disso, o
framework a executa obrigatoriamente antes de iniciar cada skill, inclusive em
transições automáticas, para verificar e reconciliar os contextos iniciais e os
blocos reservados de agentes. Na mesma conversa, a raiz confirmada é
reaproveitada sem perguntar de novo. A skill detecta Laravel, Next.js e Astro
pelos manifests e sugere o modelo correspondente.
`$specsfy-documentator` acrescenta e atualiza `PACKAGES.md`. Juntas, as skills
mantêm esta estrutura:

```text
<projeto>/
├── PROJECT.md
├── DESIGNSYSTEM.MD
├── docs/
│   └── packages/
│       ├── README.md
│       └── <vendor>-<nome>.md
└── .specsfy/
    ├── STACK.md
    ├── RULES.md
    ├── DATABASE.md
    ├── PACKAGES.md
    ├── USER-PROFILE.md
    └── SPECKIT.md      # somente quando GitHub Spec Kit for detectado
```

O setup também reserva blocos delimitados para as diretrizes do Specsfy em
`AGENTS.md` e `CLAUDE.md`. O conteúdo fora desses blocos pertence a você e é
preservado em todas as execuções. A referência publicável das diretrizes vive em
[`specsfy-setup`](../../skills/specsfy-setup/).

| Arquivo | Conteúdo | Skill mantenedora |
| --- | --- | --- |
| `PROJECT.md` | finalidade e capacidades | `$specsfy-setup` cria o modelo |
| `.specsfy/STACK.md` | stack e evidências | `$specsfy-setup` (modo `stack`) |
| `.specsfy/RULES.md` | diretrizes explícitas confirmadas | `$specsfy-setup` (modo `rules`) |
| `.specsfy/DATABASE.md` | persistência e relações | `$specsfy-setup` (modo `database`) |
| `.specsfy/PACKAGES.md` | pacotes npm e Composer com finalidade | `$specsfy-documentator` |
| `docs/packages/README.md` | índice dos pacotes Composer diretos e links para fichas de uso | `$specsfy-specialist-laravel` |
| `docs/packages/<vendor>-<nome>.md` | instalação, configuração, uso local e testes do pacote | `$specsfy-specialist-laravel` |
| `.specsfy/USER-PROFILE.md` | nível de conhecimento, respostas confirmadas e fontes do setup | `$specsfy-setup` |
| `.specsfy/SPECKIT.md` | constituição e fontes preservadas do GitHub Spec Kit | `$specsfy-setup` |
| `DESIGNSYSTEM.MD` | defaults comuns de interface, CRUD, dashboards, estados e exceções | `$specsfy-setup` cria; `$specsfy-specialist-interface` mantém |

Os modelos ficam em `.specsfy/templates/Project.md`, `Stack.md`, `Rules.md`,
`Database.md` e `UserProfile.md`, junto dos demais templates do framework. Para
personalizar um deles, mantenha o mesmo nome em
`.specsfy/templates/custom/`; essa cópia tem precedência e não é alterada pelo
CLI.

Durante o setup, `.specsfy/USER-PROFILE.md` guarda o nível de conhecimento
confirmado e as respostas já fornecidas. O agente consulta esse arquivo, a
conversa e as fontes do projeto antes de perguntar. Assuntos já respondidos
ficam fora da próxima rodada; perguntas técnicas recebem mais contexto para
iniciantes e podem usar versões, arquitetura e integrações diretamente para
usuários experientes.

O setup também verifica como você administra cada informação principal do
produto. Quando a jornada precisa de cadastro e manutenção, ele confirma as
ações de criar, consultar, editar e apagar. Informações somente de leitura,
históricos imutáveis e conteúdos mantidos por integrações não recebem um CRUD sem
necessidade. Se o código e os documentos não deixarem essa necessidade clara,
o setup pergunta antes de registrar a cobertura.

Para cada tela de uso recorrente, o setup identifica o caminho pelos menus do
sistema. Ele registra item, destino, permissão e comportamento responsivo em
`INTERFACE.md`. Rotas técnicas e etapas abertas apenas por redirecionamento
podem ficar fora do menu. Quando o destino ou a presença do link estiverem
abertos, você escolhe em uma pergunta numerada antes da continuação.

Ao terminar a preparação dos contextos e especialistas, o setup executa
`$specsfy-documentator`. Essa etapa reconstrói a documentação técnica de todo o
sistema existente em `docs/` e atualiza `.specsfy/PACKAGES.md`, mesmo quando a
execução não começou por uma alteração recente no código.

## Conversar sobre os dados

Use `$specsfy-setup` no modo `data-discovery` quando uma jornada depender de
informações que o sistema precisa guardar, exibir, alterar ou apagar. A
conversa usa palavras do seu produto e grava suas confirmações e escolhas
delegadas em `.specsfy/DATABASE.md`.

### Quando usar

Use no planejamento quando ainda faltar explicar o que o produto precisa
guardar, quais papéis consultam cada informação e quando ela perde a
utilidade. A conversa também cabe durante o backlog, depois de uma Inbox,
durante a descoberta de `MVP.md` ou antes de consolidar uma spec, quando ainda
não está claro o que cada reserva, cliente, atendimento ou outro item do
produto precisa guardar.

### Como descrever a tarefa

```text
Use $specsfy-setup no modo data-discovery para entender o que nosso sistema
precisa guardar sobre cada reserva, quais papéis consultam essas informações e
quando elas perdem a utilidade.
```

### O que esperar

Cada resposta confirmada aparece na seção `Informações a guardar confirmadas`
de `.specsfy/DATABASE.md`. Ela informa para que a informação serve, o que deve
ser guardado, o formato sugerido, o que fica ligado, os papéis que a usam e
quando ela muda ou sai do sistema. A sugestão de formato, como texto curto,
data, valor em dinheiro ou escolha entre opções, só é gravada depois que você
confirmar que ela atende ao uso real. Se você autorizar a skill a decidir,
a opção vai em `Escolhas delegadas`, com a fonte da autorização e seu alcance.

### Erros comuns

- tentar escolher a tecnologia antes de explicar a necessidade do produto;
- tratar uma suposição como informação confirmada;
- copiar dados pessoais de clientes, senhas ou chaves para a conversa;
- pular a conversa quando a jornada depende de informações guardadas.

Volte ao `$specsfy-02-backlog` para concluir o refinamento ou ao
`$specsfy-03-specify` para consolidar a fonte normativa da entrega.

## Projeto existente com GitHub Spec Kit

O setup reconhece o GitHub Spec Kit pela constituição em
`.specify/memory/constitution.md`. Quando ela existe, a skill lê a constituição
e todos os arquivos regulares dentro de `specs/`, inclusive specs, planos,
tarefas, contratos e anexos. O resultado aparece em `.specsfy/SPECKIT.md` como
uma lista de caminhos, títulos, tipos e fingerprints SHA-256.

Abra as fontes listadas antes de trabalhar na feature correspondente. A
constituição continua governando o projeto e os artefatos do GitHub Spec Kit
permanecem nos caminhos originais. O setup não escreve, move, converte ou
remove arquivos de `.specify/` e `specs/`.

Você pode acrescentar notas próprias fora do bloco
`specsfy:speckit` em `.specsfy/SPECKIT.md`. Uma nova execução atualiza somente
o bloco delimitado. Se a constituição divergir de `.specsfy/RULES.md`, preserve
os dois textos e resolva a divergência antes de alterar a feature.

Execute `$specsfy-setup` no modo `stack` após alterar frameworks, runtimes,
ferramentas estruturais ou persistência. Execute `$specsfy-setup` no modo
`database` toda vez que criar ou alterar banco, schema, tabela, coleção, model
persistente, campo, relação, índice ou migration. Use `$specsfy-setup` no modo
`rules` para formular e acrescentar uma diretriz confirmada em
`.specsfy/RULES.md` sem duplicar ou apagar as anteriores.

## Pendências de stack em Laravel

O setup registra em `Pendências de stack` de `.specsfy/STACK.md` o que
falta comprovar ou instalar para Laravel Octane com Open Swoole ou, quando
houver React, para shadcn/ui com ReUI. Com a pendência registrada e as demais
verificações aprovadas, o setup pode terminar. O plano inclui a instalação ou
configuração como pré-condição do deploy.

## Monitoramento durante mudanças

O monitor é executado pelas skills no início e no fim de uma mudança. Ele lê os
arquivos staged, unstaged e untracked do Git para descobrir qual documento
precisa ser revisto, mas não permanece como daemon em segundo plano:

```bash
node .agents/skills/specsfy-setup/scripts/monitor_context.mjs \
  --project . --check
```

Em uma cópia sem Git, `BASELINE` informa que o monitor não pôde comparar os
arquivos. Compare a cópia com a origem e informe os caminhos alterados com
`specsfy context monitor --project . --check --paths caminho1,caminho2`.
Passe os caminhos como argumentos separados ao rodar o script com Node.
Se a comparação confirmar que nada mudou, use `--paths '[]'`. A verificação
termina em `CURRENT` quando os caminhos conhecidos não geram pendências.

| Sinal observado | Obrigação |
| --- | --- |
| manifest, lockfile ou configuração | `$specsfy-setup` no modo `stack` revisa `STACK.md` |
| manifest ou lockfile npm/Composer | `$specsfy-documentator` reconstrói `PACKAGES.md` e `docs/` |
| schema, model ou migration | `$specsfy-setup` no modo `database` revisa `DATABASE.md` |
| código da aplicação | revisar `PROJECT.md` |
| aplicação ou persistência | `$specsfy-documentator` reconstrói `docs/` e `PACKAGES.md` |
| instrução ou convenção | `$specsfy-setup` no modo `rules` revisa `RULES.md` |

`PENDING` impede a conclusão da tarefa e do Delivery Gate. Quando uma mudança
de aplicação não altera história, finalidade, capacidades ou limites, registre
essa avaliação na evidência da tarefa e execute novamente com
`--acknowledge-project-no-change`. Para uma revisão do `RULES.md` sem diretriz
nova,
use `--acknowledge-rules-no-change` somente depois de registrar a justificativa.
Veja a topologia e o `--check` no guia de
[documentação técnica do sistema](system-documentation.md).

## Preservação e atualização

- O setup cria um arquivo de informações somente quando ele ainda não existe.
  Isso inclui `DESIGNSYSTEM.MD` e `.specsfy/USER-PROFILE.md`: os templates
  iniciais apresentam padrões comuns de interface, CRUD, dashboard e registro
  da conversa. Os arquivos continuam humanos e qualquer conteúdo existente é
  preservado.
- Os modos `stack`, `rules` e `database` da `$specsfy-setup` atualizam apenas
  blocos detectados delimitados e preservam seções humanas.
- Uma nova varredura não autoriza remover silenciosamente uma definição
  humana.
- `DATABASE.md` usa tabelas Markdown para facilitar mapeamento e comparação.
- `PACKAGES.md` deriva de manifests, lockfiles e metadados locais, preservando
  texto humano fora do bloco gerado.
- Valores sensíveis não são lidos nem registrados. Cite somente nomes seguros
  de variáveis e caminhos das fontes.

O estado implementado é comprovado pelas fontes do próprio projeto. Os
manifests e lockfiles mostram a stack, enquanto schemas e migrations mostram a
persistência. Os documentos resumem essas evidências e as definições
humanas que precisam permanecer entre mudanças. Eles não substituem a
`spec.md`, não registram gates e não devem copiar segredos, valores de `.env`
ou registros de produção.
