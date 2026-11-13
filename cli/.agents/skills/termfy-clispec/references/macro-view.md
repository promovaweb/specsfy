# Visão macro e specs iniciais

## Purpose

Três a seis frases. Comece pelo problema da pessoa, não pelo binário.
Diga quem sente o problema, o que muda com o binário e, quando houver,
com quais serviços ele conversa e o que guarda localmente.

```markdown
## Purpose

Quem opera a loja consulta pedidos abrindo o painel web várias vezes por
dia. O binário traz pedidos, status e exportação para o terminal e para o
CI, usando a API da loja com um token guardado no cofre. Ele não guarda
pedidos localmente.
```

## Audiences

Tabela com público, modo e necessidade. Use os modos do starter kit: TUI,
CLI texto, CLI `--json` e MCP.

```markdown
| Público | Modo | Necessidade |
| --- | --- | --- |
| operador da loja | TUI e CLI texto | ver pedidos abertos e o status de cada um |
| CI | CLI `--json` | exportar os pedidos do dia |
| agente | MCP | responder perguntas sobre pedidos |
```

## Out of scope

Lista curta, com o que fica fora e, quando ajudar, o motivo.

```markdown
## Out of scope

- Criar, editar ou cancelar pedidos: o binário só lê.
- Várias lojas na mesma instalação.
```

## Notes

Uma linha datada por escolha relevante ou dúvida aberta. A seção existe
mesmo vazia.

## Specs iniciais

Cada capacidade entregável vira uma spec. Uma boa spec inicial:

- entrega algo que a pessoa consegue testar com um comando;
- cabe em uma rodada de implementação (um recurso com seus commands,
  tools e tela, ou uma integração);
- depende só das specs anteriores da lista.

Ordem recomendada: a integração ou a configuração que as outras usam, a
capacidade que resolve o problema principal, as demais por valor para a
pessoa. Slugs em kebab-case, em inglês (`shop-client`, `orders-list`,
`orders-export`); títulos no idioma da pessoa.

Proponha a lista à pessoa com a ordem recomendada e pergunte se o recorte
faz sentido antes de criar os arquivos. Para cada spec aprovada, grave
`specs/NNNN-slug.md` com o próximo número livre, `Status: draft` e as
seções de `../../termfy-spec/references/spec-contract.md`, e acrescente a
linha ao índice `## Specs` do `CLISPEC.md`.
