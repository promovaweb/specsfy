# Convenções de engenharia

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | padrões transversais |
| Autoridade | organização, nomenclatura e erros |

## Papel

Tornar código, documentos, testes e automação previsíveis.

## Como usar

Consulte antes de criar arquivos, escolher nomes ou definir tratamento de erro.

## Organização

- Metodologia vive em `skills/`. Especialistas vivem em `specialists/`.
- CLI e TUI vivem em `cli/`. Guias oficiais vivem em `docs/user/` e documentação
  técnica em `docs/develop/`.
- Tutorial detalhado vive em `specsfy/`. Identidade vive em `brand/`.
- Aplicação interna e documentação operacional vivem em `example/`.
- Specs consumidoras vivem em
  `<projeto>/specs/<estado>/<NNNN>-<slug>/spec.md`.
- A raiz oficial não cria specs nem instala skills consumidoras.
- Contratos integrados vivem em `tests/`.
- Testes focais rodam com o módulo correspondente como diretório de trabalho.

## Convenções do monorepo

- Execute Git na raiz e revise o diff integrado.
- Centralize exclusões no `.gitignore` da raiz, prefixando regras específicas
  com o caminho do módulo.
- Mantenha todos os módulos coerentes no mesmo PR.
- Use links relativos entre módulos.
- Links públicos usam `https://github.com/promovaweb/specsfy`.
- Não crie `.gitmodules`, gitlinks ou raízes Git internas.
- Não copie fonte normativa para facilitar navegação. Publique um link.

## Disciplina documental

- Toda criação ou alteração atualiza a documentação aplicável na mesma entrega.
- A [topologia documental](../documentation.md) determina público, destino,
  linguagem e quando os dois percursos precisam mudar juntos.
- Contextos explicam decisões. Não copiam inventários de versões, rotas ou
  schemas.
- Documentação gerada para consumidores pertence a `<projeto>/docs/`.
- `example/README.md` não substitui os guias oficiais em `docs/user/`.

## Nomenclatura e erros

- Diretórios e slugs usam kebab-case.
- IDs usam `US`, `FR`, `NFR`, `AC`, `DEC` e `T`.
- Scripts retornam código diferente de zero para contrato inválido.
- Mensagens identificam caminho, regra violada e correção possível.
- Falha de ambiente não conta como RED.
- Nenhum validador corrige requisito material silenciosamente.

## Atualize quando

- uma convenção transversal ou sua automação mudar.

## Não use para

- impor estilo não verificável.
- substituir instruções específicas de um módulo.

## Fonte da verdade e precedência

Este documento governa convenções. Formatadores, validadores e testes fornecem
evidência executável.
