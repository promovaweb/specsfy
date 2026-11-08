# Documentação técnica do sistema

`$specsfy-documentator` reconstrói a visão técnica de uma aplicação em
`<projeto>/docs/` e o inventário de dependências em
`<projeto>/.specsfy/PACKAGES.md`. Esses arquivos explicam o código e os pacotes
do projeto consumidor e não se confundem com a documentação oficial da
metodologia Specsfy.

## O que esta documentação explica

A documentação reconstruída responde como a aplicação está montada no momento da
varredura. Ela não tenta substituir a spec de uma entrega e não cria uma segunda
lista de tarefas. Use a spec para entender por que uma mudança existe, quais
requisitos ela atende e quais testes a comprovam. Use o diretório docs/ do
projeto consumidor para entender a aplicação como um todo antes de alterar um
módulo.

Essa separação evita dois problemas comuns. O primeiro é usar uma documentação
de arquitetura para aprovar comportamento que nunca foi definido. O segundo é
copiar toda a arquitetura dentro de cada spec e deixá-la envelhecer depois da
próxima mudança. A spec aponta apenas o contexto necessário para sua entrega,
enquanto a documentação técnica volta a ser construída a partir do código,
manifests, schemas, migrations e testes atuais.

## O que é gerado e o que é preservado

A skill reconstrói somente blocos identificados pelo marcador
specsfy:documentator. Texto humano escrito fora desses blocos permanece no
arquivo. Isso permite acrescentar uma explicação de negócio, uma observação de
suporte ou uma escolha editorial sem que a próxima varredura a apague.

O conteúdo gerado descreve somente o que as fontes locais sustentam. Quando a
skill encontra uma convenção, ela pode registrá-la como observação encontrada,
mas não a apresenta como escolha humana confirmada. Escolhas explícitas do
projeto continuam em PROJECT.md, RULES.md, na spec aplicável ou em um ADR,
conforme o alcance da escolha.

Execute `$specsfy-documentator` livremente para documentar um sistema legado ou
atualizar sua visão técnica. Depois de cada tarefa de código concluída por
`$specsfy-07-implement`, a transição para o documentador é obrigatória. A
implementação só continua quando `docs/` representar o código atual.

A skill lê o código completo e as fontes que descrevem a aplicação. Isso inclui
os manifests, as migrations, as rotas e os testes, além das informações
permanentes do projeto. Cada execução reconstrói blocos delimitados nos
seguintes arquivos e preserva o texto humano externo:

| Arquivo no consumidor | Conteúdo |
| --- | --- |
| `docs/README.md` | portal e ordem de leitura |
| `docs/architecture.md` | componentes, dependências e UML Mermaid |
| `docs/application.md` | módulos e implementações observadas |
| `docs/database.md` | entidades, campos, relações e `erDiagram` |
| `docs/flows.md` | rotas, `flowchart` e `sequenceDiagram` |
| `docs/testing.md` | runners, comandos, inventário e resumo |
| `docs/frontend.md` | views, páginas, componentes, React e Tailwind |
| `docs/packages.md` | runtime, framework, nativos, integrados e terceiros |
| `docs/packages/README.md` | índice Laravel de pacotes Composer diretos e fichas de uso |
| `docs/packages/<vendor>-<nome>.md` | instalação, configuração, uso local e testes de um pacote |
| `docs/integrations.md` | serviços externos e nomes de configuração |
| `docs/decisions.md` | escolhas explícitas e suas fontes |
| `.specsfy/PACKAGES.md` | pacotes npm e Composer, versão, finalidade e fonte |

## Como ler cada documento

O portal docs/README.md oferece uma ordem de leitura. architecture.md mostra a
visão dos componentes e suas dependências. application.md aproxima essa visão do
código, apontando módulos e implementações encontradas. database.md separa
entidades, campos, relações e a origem dessas informações. flows.md mostra a
passagem entre rotas, handlers, serviços e integrações para que um fluxo possa
ser conferido de ponta a ponta.

testing.md não promete cobertura que o repositório não mostra. Ele identifica os
runners, os comandos disponíveis, arquivos de teste e o resumo observado.
frontend.md só aparece com as superfícies que o projeto contém, como views,
páginas, componentes, React ou Tailwind. integrations.md lista serviços e nomes
seguros de configuração, jamais o valor de uma variável. decisions.md conserva
escolhas que possuem fonte explícita, distinguindo uma escolha registrada de
uma inferência do código.

PACKAGES.md tem outro papel: tornar as dependências auditáveis. Ele lista o
gerenciador, escopo, nome, versão, finalidade e fonte encontrada localmente. A
finalidade pode estar ausente nos metadados. Nessa situação, o documento declara
a ausência em vez de completar a coluna por suposição.

## Procedimento depois de uma mudança

Depois de uma tarefa de código, a implementação chama o documentador. Você
também pode executá-lo para iniciar a documentação de um sistema legado ou
reconciliar uma alteração feita fora do fluxo:

    node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs \
      --project .

Leia primeiro o portal, o arquivo diretamente relacionado à alteração e o
resultado das seções geradas. Quando alguma relação, pacote ou integração não
corresponder ao que o código demonstra, corrija a fonte que permite a inferência
ou registre a limitação. Não edite o bloco gerado para alterar uma conclusão
que a próxima execução voltará a produzir.

Em seguida, execute o modo de conferência. Ele não escreve arquivos: compara a
projeção atual com os blocos publicados.

    node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs \
      --project . --check

O resultado aprovado mostra que a documentação corresponde às fontes atuais. Um
resultado pendente indica que a aplicação, a persistência ou as dependências
mudaram sem nova reconstrução, ou que a saída publicada foi modificada.

## Situações que impedem a conclusão

O monitor de contexto e o modo check participam do Delivery Gate. A entrega não
termina quando existe uma das condições abaixo:

- código da aplicação alterado sem reconstruir docs/;
- migration, schema ou modelo persistente alterado sem atualizar o mapa de
  dados e os documentos reconstruídos;
- manifest ou lockfile alterado sem atualizar PACKAGES.md;
- documentação gerada que não corresponde ao estado atual das fontes;
- inclusão de segredo, valor de ambiente ou dado de produção em um documento.

Quando a aplicação mudou mas sua finalidade, capacidades e limites não mudaram,
registre essa avaliação na tarefa e use o reconhecimento permitido pelo monitor.
Esse reconhecimento não dispensa a reconstrução de documentação técnica nem
serve para ocultar uma mudança documental real.

Em Laravel, o inventário acompanha a requisição pelas rotas, controllers e
services, relaciona Eloquent e migrations e registra os testes Pest ou PHPUnit.
Em projetos Node, Next.js, React ou Astro, a documentação mostra páginas,
endpoints, componentes e scripts, além do runner observado no repositório.

Cada pacote recebe a versão e a referência do repositório no GitHub. Quando
essa origem não puder ser confirmada localmente, a documentação publica uma
busca identificada como tal, em vez de inventar uma URL.

O arquivo `.specsfy/PACKAGES.md` percorre todos os manifests npm e Composer do
projeto e inclui também as dependências transitivas registradas em
`package-lock.json` e `composer.lock`. A finalidade vem da descrição presente
no lockfile, no pacote instalado ou no catálogo conhecido do documentador.
Quando nenhuma dessas fontes existir, o arquivo declara que a finalidade não
foi descrita nos metadados locais.

Depois da reconstrução, a própria skill executa o modo `--check`. O comando
compara os blocos gerados com o estado atual e falha quando `docs/` está
desatualizado:

    node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs \
      --project . --check

O monitor do setup também retorna `PENDING` quando o código da aplicação, a
persistência ou as dependências mudaram sem uma nova reconstrução de `docs/`.
Mudanças em manifests ou lockfiles exigem ainda a atualização de
`.specsfy/PACKAGES.md`. Esse estado impede a conclusão da tarefa e do Delivery
Gate.

O código, os testes, os manifests, os schemas e as migrations comprovam o
estado implementado. A spec governa o comportamento da mudança, enquanto
`PROJECT.md` e `.specsfy/` preservam informações válidas para o sistema
inteiro. Os arquivos em `<projeto>/docs/` podem ser reconstruídos dessas fontes
e não devem copiar segredos, valores de ambiente, registros de produção ou
código integral.
