# Criar a especificação com `specsfy-03-specify`

Esta skill cria a fonte única da entrega no arquivo `spec.md`. Ao abrir esse
arquivo, você encontra a descoberta usada como base para os requisitos, os
comportamentos que orientam o plano e a ligação entre tarefas, testes e
evidências. Essa concentração evita que arquivos paralelos apresentem versões
diferentes da mesma entrega.

## Quando usar

Use para promover um backlog refinado ou criar uma spec nova ainda em
estado Draft. Para mudar uma spec que já foi definida, use update-spec.

Se precisar confirmar arquivo, síntese ou próximo passo, a skill apresenta
uma pergunta numerada. Ela inclui três ou mais respostas sugeridas,
`Escrever outra resposta`, `Gere outras opções` e `Avançar` desde a primeira
rodada.

## Como descrever a tarefa

Quando a ideia já tiver sido refinada no backlog, informe o caminho do item:

```text
Use $specsfy-03-specify para promover
specs/backlog/0003-idioma-da-interface.md.
```

Quando o refinamento do backlog tiver produzido um brief na conversa, peça a criação com
base nas definições registradas:

```text
Use $specsfy-03-specify para criar uma especificação para recuperação de senha
com base nas definições desta conversa.
```

## Exemplo passo a passo

1. A skill confirma a raiz do projeto e o próximo número disponível.
2. Ela lê as instruções, o brief e as evidências necessárias.
3. Cria o pacote:

```text
specs/<estado>/0004-recuperar-senha/
├── spec.md
└── research/        # somente quando houver pesquisa externa
```

Em seguida, ela preenche o Ato I com requisitos e cenários, mantém as escolhas
ainda abertas claramente marcadas e executa os validadores. Um resultado
incompleto permanece pendente em vez de receber uma aprovação sem evidência.
Quando falta uma escolha material, a skill entrega a conversa ao ciclo de
refinamento do backlog e retoma depois. Ao escolher `avançar`, a spec pode registrar o
brief parcial, mas permanece Draft com o Definition Gate pendente. A mesma
o refinamento não é reaberto imediatamente nessa retomada.

Os arquivos em `research/` apoiam as escolhas registradas, mas não substituem
o texto normativo de `spec.md`. Quando houver divergência, a entrega e seus
validadores devem seguir a spec.

## O que esperar

- formato `Specsfy/2.0`.
- IDs rastreáveis para histórias, requisitos e condições de aceite.
- cenários que cobrem sucesso, variação e falha.
- para interfaces, telas, fluxo de informação, menus e navegação principal,
  formulários, composição, estados e acessibilidade na seção 10.
- a stack e as telas atuais analisadas, com o que será preservado e alterado.
- uma única fonte normativa.
- status Draft ou Defined conforme a evidência real.

## Erros comuns

- criar `plan.md`, `tasks.md` ou `research.md`.
- copiar uma fonte externa como requisito sem confirmação.
- aprovar gates com campos incompletos.
- misturar várias entregas grandes na mesma spec.
- descrever um CRUD apenas com API, serviço ou banco, sem a experiência que a
  pessoa precisa usar.

## Próximo passo

Use [`specsfy-04-validate`](specsfy-04-validate.md) para provar que a
definição está pronta. Quando falta uma escolha importante, a transição volta
para o [`specsfy-02-backlog`](specsfy-02-backlog.md).
