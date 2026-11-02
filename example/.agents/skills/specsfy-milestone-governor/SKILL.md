---
name: specsfy-milestone-governor
description: Use para projetar o estado dos milestones a partir de specs e backlog, identificar vínculos ausentes, sugerir ajustes e atualizar somente os blocos derivados. Não use para inventar objetivos de produto, alterar condições de saída confirmadas ou concluir marcos sem validação humana.
---

# Governar milestones a partir das fontes do projeto

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `perguntas`.
Antes de formular qualquer pergunta, leia e aplique o
`Contrato de perguntas numeradas` de `.specsfy/Spec.md`.

Leia `specs.md`, `specs/milestones/`, `specs/backlog/` e as specs existentes.
Milestone, spec e backlog possuem responsabilidades distintas: o marco descreve
um estado demonstrável; a spec define uma capacidade; o backlog registra
trabalho ainda refinável.

## Projetar o estado atual

Execute:

```bash
specsfy milestones sync --project .
```

O comando atualiza somente blocos marcados em `specs.md` e nos arquivos de
milestone. Ele calcula specs completas pelo `Status: Complete` e mostra itens
de backlog sem usá-los para fechar o marco.

## Analisar e sugerir

Depois da projeção, procure por:

- spec ou backlog ligado a um marco inexistente;
- milestone sem condição de saída confirmada;
- spec sem milestone quando sua finalidade já for conhecida;
- dependência que torna a ordem atual incoerente;
- conjunto de specs que parece formar um novo estado demonstrável.

Explique a sugestão, o material que a sustenta e o efeito no mapa. Peça
confirmação antes de mudar relações estruturais. Para falta de descoberta do
MVP, encaminhe a conversa para `$specsfy-mvp-milestone-interviewer`; para
evolução posterior, use `$specsfy-roadmap-milestone-interviewer`.

## Concluir um marco

Uma milestone só pode ser declarada concluída quando suas specs necessárias
estiverem completas e a pessoa responsável confirmar a condição de saída por
uma demonstração, teste de aceite ou outra verificação registrada. O comando
de sincronização informa progresso; ele não substitui essa confirmação.

## Limites

- Não alterar texto humano fora dos blocos gerados.
- Não mover specs, editar gates, tarefas ou código.
- Não usar uma lista de tarefas fechadas como aceite da milestone.
