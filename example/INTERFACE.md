# Interface do exemplo

As páginas do diretório usam o layout autenticado e a navegação por links
Inertia. Os itens Users e Teams ficam no [menu lateral](resources/js/components/app-sidebar.tsx).

| Tela | Componentes e estados |
| --- | --- |
| [Lista de usuários](resources/js/pages/directory/users/index.tsx) | `Head`, tabela HTML, `Link` de perfil e `Button` para paginação. `Input` e `Label` compõem a busca. A página exibe uma mensagem quando a lista está vazia. |
| [Perfil de usuário](resources/js/pages/directory/users/show.tsx) | `Head`, resumo público, cartões com nome e papel por equipe, `Link` para a equipe e mensagem de lista vazia. |
| [Lista de equipes](resources/js/pages/directory/teams/index.tsx) | `Head`, tabela HTML, `Link` de equipe, `Button` para paginação e mensagem de lista vazia. |
| [Detalhe de equipe](resources/js/pages/directory/teams/show.tsx) | `Head`, resumo, tabela de membros com rótulos de papel, `Link` para cada perfil e mensagem de lista vazia. |
