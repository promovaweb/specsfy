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

Leia ao escolher o menor nível que prova uma regra ou ao alterar runners e
gates.
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
- Steps Node.js para comportamento observável descrito em Gherkin.
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
npm ci --ignore-scripts
npm test
npm run validate:skills
```

Essa regressão executa contratos de integração, skills e especialistas. Os
testes usam fontes e projetos temporários, sem instalar o framework na raiz.
Os comandos `npm run test:integration`, `npm run test:skills` e
`npm run test:specialists` selecionam cada conjunto. Os cenários Gherkin deste
monorepo são executados pelos respectivos arquivos `.test.mjs` e steps Node.

Skills alteradas também passam pelo validador a partir da raiz
`skills/`:

```bash
node ../scripts/validate-skills.mjs specsfy-<nome>
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
o monorepo, compara o status da raiz antes e depois e usa um diretório
temporário
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
npm run test:specialists

cd cli
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

## Regressões de issues e pull requests

A suíte `skills/tests/github-regressions.test.mjs` executa os scripts Node.js em
consumidores temporários. Ela confere o resultado do comando e os arquivos
produzidos, incluindo a preservação de conteúdo humano durante atualizações.
Execute-a a partir da raiz:

```bash
node --test skills/tests/github-regressions.test.mjs
```

O teste `cli/tests/installer-real-cli.test.ts` usa a dependência `skills`
instalada
pelo lock do CLI para materializar especialistas de uma origem local. Ele
compara
os fingerprints e repete a instalação para conferir a idempotência. O teste de
restauração em `installer.test.ts` simula uma falha após a gravação dos arquivos
e confere a recuperação das instruções e dos locks anteriores.

Os testes de resolução do Windows injetam a plataforma e os nomes dos arquivos.
Eles exercitam caminhos com espaços e preservação de argumentos no processo
Node.js. A execução nativa no Windows continua necessária para conferir o
comportamento do sistema operacional.

A reprodução do verificador de migrations usa um processo Node.js como
substituto
do PHP. A resposta simulada distingue migrations aplicadas das pendentes e cobre
a falha da consulta. Esse teste não confirma uma conexão Laravel. O verificador
consulta `migrate:status` somente após conferir o banco separado e exige uma
resposta reconhecida para desconsiderar uma migration histórica.

### Contrato de comportamento

As reproduções verificam cinco comportamentos do consumidor:

- A falha de materialização restaura instruções, skills e locks anteriores.
- Os IDs de testes de outra spec não alteram a cobertura da spec selecionada.
- A atualização da stack preserva células com pipe escapado e é idempotente.
- A verificação global respeita Draft e mantém os outros estados estritos.
- A consulta de migrations só permite desconsiderar uma remoção histórica quando
  confirma que ela já foi aplicada. Saída vazia mantém a recusa histórica, e
  falha na consulta mantém o estado pendente.

## CI de preparação de versão

Branches `release/**` executam o mesmo workflow da `main` para conferir a
revisão antes da tag. O job do CLI depende dos jobs integrados, de skills e do
exemplo. A GitHub Release, restrita a tags, só ocorre depois desses jobs. O
npm é publicado depois, pela máquina local. O CI não publica no npm. Os
testes Node de regressão também são executados no job integrado.
