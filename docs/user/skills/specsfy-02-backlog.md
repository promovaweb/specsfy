# Refinar uma entrada com `specsfy-02-backlog`

Esta skill transforma uma entrada da Inbox em backlog refinável. Ela procura
itens parecidos, registra o contexto inicial e, quando necessário, conduz uma
pergunta prioritária por vez até produzir um brief pronto para especificar.

## Quando usar

Use quando quiser organizar uma captura em `specs/inbox/`, avaliar uma
oportunidade ou fechar lacunas sobre público, finalidade, regras de negócio,
limites, privacidade, falhas e resultado esperado. Para apenas guardar o texto
sem perguntas, use `specsfy-01-inbox`.

Não use para planejar tarefas, escrever testes ou iniciar código, pois um item
de backlog ainda não passou pelos gates que autorizam essas etapas.

## Como descrever a tarefa

Descreva a entrada e o destino esperado na mesma mensagem. A skill usará esse
texto para criar um item reconhecível em `specs/backlog/`, sem tratá-lo como
autorização para implementar. Por exemplo:

```text
Use $specsfy-02-backlog para refinar esta entrada:
permitir que a pessoa escolha o idioma da interface.
```

Quando houver itens parecidos em `specs/backlog/`, inclua a situação que
diferencia esta entrada das demais. Com isso, a skill atualiza o item correto
e a manter visíveis as definições que continuam abertas:

```text
Anote no backlog: clientes internacionais não entendem os e-mails atuais.
Ainda não decidimos quais idiomas serão oferecidos.
```

## Exemplo passo a passo

1. Você apresenta a entrada ou aponta o arquivo da Inbox.
2. O agente também pode ler a origem em `specs/inbox/`.
3. Ele procura itens semelhantes em `specs/backlog/` e nas specs.
4. Ele pergunta uma lacuna material por vez.
5. Você responde: “o problema afeta e-mails e a interface”.
6. A skill cria o item com `.specsfy/templates/custom/Backlog.md` quando
   presente ou com `.specsfy/templates/Backlog.md`:

```text
specs/backlog/0003-idioma-da-interface.md
```

O item registra problema, público, resultado esperado e dúvidas abertas,
continua sendo backlog e não autoriza implementação.

Quando a entrega incluir interface, o refinamento também pergunta somente o
que ainda não foi dito sobre telas, fluxo de informação, menus e navegação
principal, formulário, padrão de abertura da ação e disposição dos elementos.
Você pode solicitar alternativas para
uma página, painel lateral ou modal. As respostas ficam registradas em texto
para orientar a spec.

Antes disso, o agente analisa o sistema existente. Rotas, telas, componentes,
conteúdo, permissões, estados, testes e stack indicam o que deve ser preservado
e evitam sugestões incompatíveis com o projeto.

## Como o ciclo termina

O refinamento faz no máximo oito perguntas por área, com exatamente uma
pergunta numerada em cada rodada. Ela oferece três ou mais opções numeradas, `Escrever
outra resposta`, `Gere outras opções` e `Avançar`. Ao escolher outras opções,
o agente mantém a pergunta e apresenta sugestões diferentes. O agente
reconsidera a solicitação e as respostas antes de montar a próxima rodada.

Ao chegar a oito perguntas, o agente resume o que foi confirmado e o que ficou
aberto. Ele só continua quando você solicita explicitamente mais perguntas e
informa
quantas quer responder.

`Avançar` existe desde a primeira rodada. Na rodada seguinte, você escolhe se
quer encerrar definitivamente as perguntas daquela área, responder depois ou
voltar a responder agora. O encerramento fica registrado e é respeitado até
você reabrir a área. O adiamento preserva os pontos para retomada. Quando ainda
houver lacunas aplicáveis, a spec permanece `Status: Draft` e o
`Definition Gate: Pending`.

Quando você autorizar a skill a decidir, ela registra a opção recomendada como
`Escolha delegada`, com a fonte da autorização e até onde a escolha vale.
Respostas diretas suas e evidências do projeto ficam em seus próprios registros.

## O que esperar

- perguntas adaptadas ao caso, agrupadas em rodadas numeradas.
- preservação das suas palavras.
- indicação de duplicatas ou relações.
- distinção entre fato, suposição e escolha confirmada.
- um brief pronto para especificar.
- um caminho claro para retomar depois.
- nenhuma `spec.md` criada automaticamente sem promoção.

## Erros comuns

- transformar o backlog em uma especificação completa.
- inventar solução técnica quando o problema ainda está aberto.
- criar um segundo item sem procurar duplicatas.
- tratar o item como aprovação para implementar.
- responder categorias como um formulário fixo.
- esconder uma dúvida para encurtar a conversa.

## Próximo passo

Quando o backlog estiver claro, use
[`specsfy-03-specify`](specsfy-03-specify.md). Se ainda houver uma escolha
material aberta, continue o ciclo nesta mesma skill.
