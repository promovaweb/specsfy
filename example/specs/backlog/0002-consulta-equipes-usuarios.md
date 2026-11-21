# Backlog: Consulta de equipes e seus usuários

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0002 |
| Status | Promoted |
| Produto | A esclarecer |
| Épico | A esclarecer |
| Funcionalidade | Consulta de equipes |
| Tipo | Funcionalidade |
| Prioridade | Não priorizado |
| Criado em | 2026-07-25 |
| Spec promovida | `specs/completed/0004-diretorio-global-equipes/spec.md` |

## Ideia original

quro desenvolver uma listagem de equipes, com pagna de detalhe da equipe e a lista de usuarios da equipe com seus respectoivos roles

## Problema percebido

Foi manifestada a necessidade de consultar as equipes e compreender quem faz
parte de cada uma e qual papel cada usuário possui.

## Pessoa afetada ou beneficiada

Todos os usuários autenticados.

## Resultado ou valor esperado

Permitir que qualquer usuário autenticado consulte todas as equipes e, ao
acessar uma delas, visualize seus usuários e respectivos papéis.

## Contexto

Durante o uso autenticado da aplicação, uma pessoa precisa compreender a
composição das equipes e os papéis de seus membros.

## Referências relacionadas

- `README.md` — documentação relacionada sobre equipes, papéis, membros,
  convites e jornadas existentes.
- `specs/backlog/0001-listagem-gestao-usuarios.md` — backlog relacionado sobre
  a consulta geral dos usuários do sistema.

## Comportamento esperado

- Qualquer usuário autenticado acessa uma listagem de todas as equipes.
- A partir da listagem, acessa o detalhe de uma equipe.
- No detalhe, visualiza os usuários pertencentes à equipe e o papel de cada um.

## Regras de negócio

- Cada usuário exibido no detalhe deve estar associado à equipe consultada.
- Os papéis apresentados devem corresponder à participação do usuário naquela
  equipe.
- A pessoa precisa estar autenticada.
- Todo usuário autenticado pode consultar todas as equipes, seus usuários e
  respectivos papéis.

## Critérios de aceitação

- A esclarecer antes de considerar o item refinado.

## Qualidades e operação

- Segurança: exigir autenticação para acessar as listagens e os detalhes.
- Privacidade: os campos de equipe e usuário que podem ser expostos ainda
  precisam ser definidos.
- Desempenho e volume: a avaliar.
- Auditoria e observabilidade: a avaliar.

## Dependências

- Item relacionado: `BACKLOG-0001`, sobre a listagem para gestão geral de
  usuários. A relação ou dependência entre os dois itens ainda não foi
  definida.

## Situações de erro

- A esclarecer.

## Escopo

- Dentro: listagem de equipes; detalhe de uma equipe; listagem dos usuários da
  equipe com seus respectivos papéis.
- Fora: a esclarecer.

## Dúvidas, decisões e riscos

- Quais informações de cada equipe e usuário devem aparecer?
- Quais papéis existem e um usuário pode ter mais de um papel na mesma equipe?
- A pessoa poderá apenas consultar ou também gerenciar equipes, membros e
  papéis?
- Será necessário buscar, filtrar, ordenar ou paginar equipes e usuários?
- A exposição de usuários e papéis exige aprofundar permissões e privacidade
  antes da promoção.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [ ] Permissões, regras e exceções relevantes estão claras.
- [ ] O resultado pode ser verificado objetivamente.
- [ ] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [ ] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Promovido para `specs/completed/0004-diretorio-global-equipes/spec.md` e dividido
na fatia complementar
`specs/completed/0005-detalhe-publico-equipe/spec.md`.
