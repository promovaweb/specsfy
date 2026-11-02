---
name: specsfy-data-discovery
description: Converse em linguagem cotidiana quando o produto precisar guardar informações, sugira formatos adequados e registre respostas confirmadas em `.specsfy/DATABASE.md`.
---

# Descobrir as informações que o sistema precisa guardar

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Converse em Português do Brasil sobre informações do sistema sem pedir que a
pessoa descreva banco de dados, tabela, campo, chave ou relacionamento. Use
palavras do próprio produto:
o que será lembrado, quem usa, o que muda e quando deixa de ser necessário.

## Preparar a conversa

1. Leia a Inbox, a descoberta de `MVP.md`, o backlog, a spec ou o pedido que
   originou a descoberta.
2. Leia `PROJECT.md` e `.specsfy/DATABASE.md` quando existirem. Separe o que
   já foi confirmado do que ainda precisa de conversa.
3. Procure somente informações que o sistema precise guardar, consultar,
   comparar, mostrar, compartilhar, corrigir ou apagar. Não pergunte sobre
   dados que não alteram a jornada ou a operação.
4. Preserve fontes e formulações da pessoa. Uma hipótese não vira conteúdo
   confirmado no arquivo de dados.

## Perguntar sem linguagem técnica

Em cada rodada, escolha uma informação aplicável de maior impacto ainda não
confirmada e siga o contrato central. Mantenha uma lista das informações a
guardar ausentes ou ambíguas. Depois de cada resposta, atualize a lista e
pergunte sobre a próxima até que todas estejam confirmadas, adiadas ou
encerradas, respeitando o máximo de oito perguntas por área. Prefira perguntas
como estas, ajustadas ao contexto:

- "O que você precisa lembrar sobre cada pedido, pessoa ou atendimento?"
- "Quem pode ver ou mudar essa informação?"
- "O que precisa continuar ligado quando uma pessoa fizer mais de um pedido?"
- "Quando essa informação muda, deixa de valer ou precisa ser apagada?"
- "Que informação não pode aparecer para outras pessoas?"

Evite explicar a mecânica interna. Se a pessoa usar termos técnicos, confirme
o efeito no trabalho dela antes de registrar a resposta.

## Sugerir como cada informação será registrada

Depois de entender a finalidade, proponha uma forma simples de registrar cada
informação e peça confirmação. Escolha a sugestão pelo uso esperado, sem citar
tecnologias ou partes internas do sistema:

- texto curto para nomes, títulos e códigos lidos rapidamente;
- texto livre para observações e descrições maiores;
- número para quantidades, medidas e contagens;
- valor em dinheiro para preços, cobranças e descontos;
- data ou horário para agendamentos, prazos e acontecimentos;
- escolha entre opções para situação, categoria ou prioridade;
- sim ou não para confirmações;
- arquivo ou imagem para comprovantes e anexos.

Apresente a sugestão como hipótese do produto, explique seu motivo em uma
frase e pergunte se ela representa o uso real. Registre o `formato sugerido`
somente depois da confirmação. Quando uma mesma informação tiver usos
distintos, registre cada uso separadamente.

## Registrar o que foi confirmado

Depois de uma resposta confirmada, entregue o contexto para o script abaixo.
Use um nome do domínio e frases curtas compreensíveis para quem opera o
produto.

```bash
node .agents/skills/specsfy-data-discovery/scripts/\
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

Registre somente respostas confirmadas na seção `Informações a guardar
confirmadas`. Mantenha essa seção separada do que foi observado no código. Não
altere o trecho detectado automaticamente e não copie dados reais, credenciais
ou informações pessoais sensíveis.

## Handoffs

- No backlog, faça esta descoberta antes de declarar o brief pronto quando a
  jornada depender de informações guardadas.
- Durante a descoberta do MVP, preserve `MVP.md` como fonte e carregue esta
  skill para cada informação a guardar ausente ou ambígua em um backlog
  importado.
- Na especificação, carregue esta skill se a fonte de dados não explicar o que
  a jornada precisa lembrar ou quem pode consultar cada informação.
- A Inbox não faz perguntas. Ela apenas preserva sinais para esta etapa.

## Limites

- Não escolher tecnologia, estrutura interna ou implementação.
- Não criar backlog, spec, tarefas, testes ou código.
- Não preencher lacunas por inferência.
- Não registrar conteúdo sensível.
