# Estratégia de testes

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | estratégia transversal de verificação |
| Autoridade | níveis, comandos e evidência de testes |

## Papel

Definir níveis de teste, comandos canônicos e evidências necessárias para
demonstrar comportamento sem duplicar cenários de cada spec.

## Como usar

Leia ao escolher o menor nível que prova uma regra ou ao alterar runners e gates.
Os IDs e cenários concretos permanecem na spec da fatia.

## Atualize quando

- um runner ou comando canônico mudar.
- a estratégia RED-GREEN-REFACTOR mudar.
- uma nova classe de verificação transversal for adotada.

## Não use para

- listar todos os testes existentes.
- escrever condições de aceite de feature.
- considerar erro de fixture ou ambiente como RED válido.

## Fonte da verdade e precedência

Specs definem o comportamento. Arquivos em `tests/` materializam o contrato. A
execução fornece evidência. Este contexto define somente a estratégia
transversal.

## Pirâmide de testes

- Unidade para regra pura e transformação.
- Integração ou contrato para limites reais.
- Behave para comportamento observável descrito em Gherkin.
- Regressão completa antes de concluir o Delivery Gate.
- Verificação manual somente quando o resultado não puder ser automatizado,
  com justificativa.
- Revisão visual durante o desenvolvimento para toda tarefa que possa alterar
  a interface, mesmo sem pedido específico. Ela confere bordas, espaçamentos,
  margens, padding, tipografia, alinhamento, largura, overflow, foco, zoom e
  conteúdo curto ou longo nos viewports e estados aplicáveis.

## Cobertura mínima de contexto

- Cada feature, história `US`, requisito funcional `FR` e requisito não
  funcional `NFR` possui pelo menos três cenários BDD `AC` distintos.
- Um `AC` é considerado para um item somente quando declara seu ID em
  `**Cobre**`. Os
  três cenários devem acrescentar contexto, como caminho feliz, regra ou
  variação crítica e falha ou limite material.
- Cada feature, `US`, `FR` e `NFR` possui pelo menos três casos TDD executáveis.
  Cada `AC` possui ao menos um caso TDD.
- O `Plan Gate` exige três tarefas predecessoras TDD distintas por feature,
  `US`, `FR` e `NFR`. Cada tarefa deriva um `AC`. O `Delivery Gate` confirma os
  casos realmente materializados nos arquivos de teste.
- Cada caso TDD declara `SPECSFY:` junto à própria definição. Um marcador
  compartilhado por um arquivo é considerado como somente um caso, ainda que
  existam vários testes no arquivo.
- A tarefa `[TEST] [TDD]` declara o caminho do arquivo executável. A auditoria
  usa somente os arquivos declarados pela spec, isolando IDs locais que se
  repetem em outras specs. Na compatibilidade com specs legadas sem tarefas
  TDD, o resultado identifica `scan_scope: repository-fallback` e emite um
  aviso de escopo.
- O Gherkin permanece como referência na `spec.md`. Ele não cria nem executa
  uma segunda suíte `.feature`.

## Proteção obrigatória do banco

Nenhuma suíte de um projeto Laravel pode começar enquanto o ambiente de teste
não estiver comprovadamente separado. O setup exige `.env.testing`,
`APP_ENV=testing` e `DB_DATABASE` ou `DB_URL` explícito e diferente do `.env`.
Antes de cada comando, execute:

```bash
node .agents/skills/specsfy-setup/scripts/check_database_safety.mjs \
  --project . --command "<comando>"
```

Somente `SAFE` permite executar. `PENDING` encerra a etapa. `IGNORED` descarta
comandos e aliases destrutivos. O fluxo não usa `RefreshDatabase`,
`DatabaseMigrations`, resets, rollback amplo ou migrations destrutivas; casos
Laravel usam `DatabaseTransactions`, factories e limpeza limitada ao que o
próprio teste criou.

## Comandos de verificação

Os contratos integrados são executados no workspace
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy):

```bash
python3 -B -m unittest discover -s tests -p 'test_*.py'
uv run --quiet --with behave behave tests/features --no-capture
```

Essa regressão não carrega nem executa as skills do projeto. A suíte própria das
skills roda separadamente, a partir da raiz `skills/`.

Skills alteradas também passam pelo validador a partir da raiz
`skills/`:

```bash
uv run --quiet --with pyyaml python \
  /home/luizeof/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  specsfy-<nome>
```

O contrato de `specsfy-update-spec` comprova catálogo e metadata,
roteamento de pedidos tardios e a classificação determinística de mudanças de
definição, plano e evidência. A regressão integrada confirma a mesma entrada no
CLI, na documentação oficial e na porta pública.

O documentador possui fixtures focais para Laravel/Pest e
Node/Next/React/Tailwind/Vitest. Elas comprovam a topologia, os diagramas
Mermaid, o inventário retroativo, os links de pacotes, a criação de
`.specsfy/PACKAGES.md` com dependências diretas e transitivas, a preservação de
conteúdo humano e a detecção de documentação desatualizada por `--check`.

O documentador exclusivo do projeto possui contrato que executa o coletor sobre
o monorepo, compara o status da raiz antes e depois e usa um diretório temporário
inválido para provar a recusa fora do checkout oficial. Ele também
comprova a separação entre documentação oficial do Specsfy e documentação
gerada em projetos consumidores.

A skill local de release do CLI possui contrato focal em
`promovaweb/specsfy`. O teste usa um checkout temporário sem rede para
comprovar versão crescente, promoção do changelog e extração byte a byte das
notas destinadas ao GitHub Release. A publicação real continua condicionada à
regressão do owner `cli/`.

Validadores focais permanecem documentados no `AGENTS.md` do módulo responsável
e na spec executada.

Especialistas executam contratos e validação de metadata em
`specialists/`. O CLI mantém testes unitários, montagem da TUI e build:

```bash
cd specialists
python3 -B -m unittest discover -s tests -p 'test_*.py'
uv run --quiet --with behave behave tests/features --no-capture

cd ../cli
npm ci
npm run build:executable
npm run check
```

`specsfy test --project <consumidor>` é uma porta de entrada para executar e
observar o runner detectado no projeto selecionado. Ele não substitui os
comandos canônicos de regressão de cada módulo.

A aplicação interna `example/` possui regressão própria no owner
`example/`:

```bash
cd example
php artisan test --compact
npm run lint:check
npm run format:check
npm run types:check
npm run build
```

`composer ci:check` agrega as verificações declaradas pelos manifests do
aplicativo. O CI de `example/` também valida sua documentação, rotas e
comandos. Esses contratos não substituem a suíte Pest do produto.

## Evidência

- Registre o RED antes de alterar o artefato derivado.
- Associe BDD e TDD aos mesmos IDs.
- Registre um marcador `SPECSFY:` por caso TDD para que a quantidade mínima seja
  verificável.
- Registre comando, exit code e causa observada.
- Execute novamente após GREEN e refactor.
- Não avance gate ou checkbox sem resultado atual.
- O checklist de implementação registra `VISUAL` entre `VERIFY` e `EVIDENCE`,
  com método, viewports, estados, ajustes e resultado; tarefas sem interface
  registram o motivo concreto da não aplicação.
- Mudança em `example/` atualiza seus testes e sua documentação aplicável na
  mesma entrega.
- Em mudança transversal, registre os comandos focais, a regressão integrada e
  o status Git único.
