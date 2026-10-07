# Inbox

`specs/inbox/` recebe entradas antes de qualquer refinamento ou definição de
produto. A captura é deliberadamente rápida. O agente guarda o texto sem fazer
perguntas e sem transformá-lo em compromisso de entrega.

## Capturar

```text
Use $specsfy-01-inbox para guardar esta entrada:
quero permitir que a pessoa continue um formulário em outro dispositivo.
```

O agente grava a captura em `specs/inbox/` com data, hora e um nome derivado
do conteúdo:

```text
specs/inbox/AAAA-MM-DD-HHMMSS-<slug>.md
```

Data e hora evitam uma fila numerada artificial e preservam a ordem real de
chegada. Se duas capturas tiverem o mesmo nome no mesmo segundo, o Specsfy
adiciona um sufixo sem sobrescrever a anterior.

## O que o arquivo organiza

- metadados e integridade do texto original.
- texto original completo.
- resumo processado.
- problema ou oportunidade.
- pessoas e valor percebidos.
- sinais de escopo, regras ou solução.
- dependências, falhas possíveis e direções futuras.
- pontos a revisar no futuro.
- rastreabilidade para backlog ou spec derivados.

Declarações, inferências e lacunas permanecem identificadas. Um campo sem base
no texto aparece como não identificado, em vez de receber uma resposta
inventada.

Quando o texto indicar que o sistema precisa guardar, consultar, compartilhar
ou apagar informações, a Inbox registra o sinal sem perguntar. No backlog,
`$specsfy-data-discovery` conversa sobre essas informações antes de o item ser
considerado pronto.

O texto será versionado no Git. Não inclua senhas, tokens, chaves privadas ou
dados pessoais sensíveis. Se o agente detectar um segredo evidente, ele não
grava a captura e orienta você a remover o conteúdo sensível antes de reenviar.

## Inbox, backlog e spec

```text
captura sem perguntas → backlog refinável → spec normativa
```

- `specs/inbox/` preserva o input e funciona como fila ativa.
- `specs/inbox/processed/` guarda as capturas já cobertas por specs aprovadas.
- `specs/backlog/` organiza algo escolhido para refinamento.
- `specs/<estado>/<NNNN>-<slug>/spec.md` governa comportamento e entrega.

Uma captura pode permanecer na Inbox pelo tempo que for preciso. Quando quiser
avançar, use `$specsfy-02-backlog` com o caminho do arquivo.

## Quando a captura sai da Inbox

Virar backlog ou spec em Draft não retira a captura da fila ativa: enquanto
qualquer parte do pedido estiver sem definição aprovada, ela continua em
`specs/inbox/`, e a leitura da pasta mostra o que ainda precisa de tratamento.

A saída acontece em um único momento: quando `$specsfy-04-validate` aprova o
Definition Gate de uma spec e confirma que essa spec, sozinha ou com outras já
aprovadas, cobre o pedido inteiro. A validação então executa:

```bash
specsfy inbox process 2026-07-28-143205-avisar-clientes.md --spec 0007-avisos-de-atraso
```

O comando move o arquivo para `specs/inbox/processed/`, com o mesmo nome, e:

- troca `Status: Capturada` por `Status: Processada`;
- registra as specs que absorveram o pedido em `Spec derivada` e a data em
  `Processada em`;
- atualiza os links para a captura no backlog e nas specs;
- preserva o texto original e a análise inicial sem alteração.

```text
specs/inbox/                       ← capturas pendentes
specs/inbox/processed/             ← capturas integralmente cobertas por specs aprovadas
```

Nada é apagado. Capturas processadas continuam valendo como histórico e
entram na busca por duplicatas do backlog. Se uma parte do pedido ficou de
fora, a captura permanece na fila ativa e a validação informa o que resta
encaminhar.

## Sessões de descoberta do MVP

`$specsfy-mvp-milestone-interviewer` pode usar Inboxes para capturar respostas
novas durante a conversa. Isso não se aplica à importação de `MVP.md`: nela a
skill cria `M01` e seleciona somente requisitos de desenvolvimento para gerar
backlog e spec Draft diretamente. Os temas de negócio e produto permanecem no
`MVP.md`, sem Inbox. O backlog reaproveita as respostas declaradas no trecho
técnico e pergunta somente o que permanece ausente, ambíguo ou contraditório
antes de uma promoção. `BRAND.md`, quando existir, orienta as perguntas, mas
não é copiado para as capturas.
Se o projeto estiver em um submódulo Git, a skill procura os dois arquivos na
raiz do Hub somente quando eles não existirem no projeto.

## Templates instalados

O CLI mantém em `.specsfy/templates/` os modelos usados para criar entradas,
backlogs, specs e informações permanentes do projeto:

```text
Inbox.md
Backlog.md
Spec.md
Tasks.md
Project.md
Stack.md
Rules.md
Database.md
```

Para personalizar um modelo, copie somente o arquivo desejado para
`.specsfy/templates/custom/` e preserve o mesmo nome. A versão em `custom/`
tem precedência sobre a cópia padrão. O instalador protege alterações locais nos
templates gerenciados, mas `--force` pode substituí-los. O conteúdo de
`custom/` nunca é gerenciado nem sobrescrito.
