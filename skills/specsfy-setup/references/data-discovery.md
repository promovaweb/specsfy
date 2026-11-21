# Descobrir as informações que o sistema precisa guardar

Descubra, com a pessoa e nas palavras dela, o que o sistema precisa lembrar,
quem usa cada informação e quando ela muda ou deixa de valer. O resultado é um
registro confirmado em `.specsfy/DATABASE.md` que backlog e spec usam como
contexto.

Referência do modo `data-discovery` de `$specsfy-setup`. Mapear o banco já
existente no código é trabalho do modo `database`. Este modo não escolhe
tecnologia nem modela tabelas.

## Preparação obrigatória

Antes de executar este modo, siga o modo `setup` de `$specsfy-setup` na
raiz do projeto, pelo caminho curto quando o contexto já foi reconciliado
nesta conversa. Em handoff automático, repita o caminho curto antes desta
etapa. Reutilize a raiz confirmada na conversa e não prossiga se o setup
apontar uma pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Converse em Português do Brasil sem pedir que a pessoa descreva banco de
dados, tabela, campo, chave ou relacionamento. Use as palavras do produto: o
que será lembrado, quem usa, o que muda e quando deixa de ser necessário.

## Pronto quando

- Cada informação a guardar aplicável está confirmada, decidida por escolha
  delegada, adiada ou encerrada pela pessoa, dentro do limite de oito perguntas por área.
- Cada resposta confirmada foi gravada pelo comando na seção
  `Informações a guardar confirmadas` de `.specsfy/DATABASE.md`, com fontes.
- Nenhuma hipótese, dado real, credencial ou informação pessoal sensível foi
  gravada.
- O controle voltou à skill que chamou esta descoberta.

## Preparar a conversa

1. Leia em paralelo a origem da descoberta (Inbox, `MVP.md`, backlog, spec ou
   pedido), `PROJECT.md` e `.specsfy/DATABASE.md` quando existirem.
2. Consulte respostas confirmadas, escolhas delegadas e evidências. Separe
   o que já tem decisão aplicável do que ainda precisa de conversa.
3. Considere só informações que o sistema precise guardar, consultar,
   comparar, mostrar, compartilhar, corrigir ou apagar. Dado que não altera a
   jornada nem a operação fica fora da conversa.
4. Preserve fontes e formulações da pessoa. Hipótese não entra no arquivo como
   conteúdo confirmado.

## Perguntar sem linguagem técnica

Mantenha uma lista das informações a guardar ausentes ou ambíguas. Em cada
rodada, escolha a de maior impacto ainda não confirmada. Depois de cada
resposta, atualize a lista e siga para a próxima. Ajuste ao contexto perguntas
como:

- "O que você precisa lembrar sobre cada pedido, pessoa ou atendimento?"
- "Quem pode ver ou mudar essa informação?"
- "O que precisa continuar ligado quando uma pessoa fizer mais de um pedido?"
- "Quando essa informação muda, deixa de valer ou precisa ser apagada?"
- "Que informação não pode aparecer para outras pessoas?"

Não explique a mecânica interna. Se a pessoa usar termos técnicos, confirme o
efeito no trabalho dela antes de registrar.

## Sugerir como cada informação será registrada

Depois de entender a finalidade, proponha uma forma simples de registro,
escolhida pelo uso esperado e sem citar tecnologia:

| Uso | Sugestão |
| --- | --- |
| nomes, títulos e códigos lidos rapidamente | texto curto |
| observações e descrições maiores | texto livre |
| quantidades, medidas e contagens | número |
| preços, cobranças e descontos | valor em dinheiro |
| agendamentos, prazos e acontecimentos | data ou horário |
| situação, categoria ou prioridade | escolha entre opções |
| confirmações | sim ou não |
| comprovantes e anexos | arquivo ou imagem |

Apresente a sugestão como hipótese, explique o motivo em uma frase e pergunte
se ela representa o uso real. Registre o `formato sugerido` depois da
confirmação ou siga o protocolo de escolha delegada quando houver autorização
expressa. Uma informação com usos distintos gera um registro por uso.

## Registrar o que foi confirmado

Depois de cada resposta confirmada, execute `specsfy context data` com nome
do domínio e frases curtas que quem opera o produto entenda. O comando exige
os oito campos com valores não vazios: `--name`, `--purpose`, `--store`,
`--format`, `--links`, `--access`, `--lifecycle` e `--sources`.
`--project` indica a raiz quando precisar explicitá-la.

```bash
specsfy context data \
  --project <raiz> \
  --name "<informação do produto>" \
  --purpose "<finalidade>" \
  --store "<informações necessárias>" \
  --format "<forma confirmada de registrar>" \
  --links "<o que permanece ligado a quê>" \
  --access "<quem consulta ou altera>" \
  --lifecycle "<quando muda, deixa de valer ou é apagado>" \
  --sources "<caminhos de Inbox, backlog, MVP ou spec>"
```

Pelo MCP, use a tool `context_data`. Sem o binário instalado, rode o script
equivalente:

```bash
node .agents/skills/specsfy-setup/scripts/\
registrar_dados_conversados.mjs \
  --project <raiz> \
  --nome "<informação do produto>" \
  --para-que-serve "<finalidade>" \
  --o-que-guardar "<informações necessárias>" \
  --formato-sugerido "<forma confirmada de registrar>" \
  --ligacoes "<o que permanece ligado a quê>" \
  --acesso "<quem consulta ou altera>" \
  --ciclo-de-vida "<quando muda, deixa de valer ou é apagado>" \
  --fontes "<caminhos de Inbox, backlog, MVP ou spec>"
```

Na seção `Informações a guardar confirmadas`, atribua à pessoa somente respostas
confirmadas e inclua suas fontes. Se um campo obrigatório depender de escolha autorizada
por delegação, use uma indicação explícita na célula, por exemplo
`--format "Depende de escolha delegada (ver Escolhas delegadas)"`. Para um
campo ainda em aberto e fora do alcance da delegação, use `A confirmar`.
Em `--sources`, cite as fontes das informações confirmadas.

Quando a pessoa delegar a escolha, registre em `### Escolhas delegadas` de
`.specsfy/DATABASE.md` a decisão ou pendência, o campo, a fonte da autorização
e seu alcance. Atribua a escolha ao agente no exercício dessa autorização.
Preserve o trecho detectado automaticamente pelo modo `database`.

## Handoffs

| Origem | Quando chamar este modo |
| --- | --- |
| `$specsfy-02-backlog` | antes de declarar o brief pronto, se a jornada depender de informações guardadas |
| `$specsfy-milestones` (modo `mvp`) | para cada informação a guardar ausente ou ambígua em um backlog importado, preservando `MVP.md` como fonte |
| `$specsfy-03-specify` | quando a fonte de dados não explicar o que a jornada precisa lembrar ou quem consulta cada informação |
| `$specsfy-01-inbox` | nunca chama: a Inbox não pergunta, só preserva sinais para esta etapa |

## Limites

- Não escolher tecnologia, estrutura interna ou implementação.
- Não criar backlog, spec, tarefas, testes ou código.
- Não preencher lacunas por inferência.
- Não registrar conteúdo sensível.
