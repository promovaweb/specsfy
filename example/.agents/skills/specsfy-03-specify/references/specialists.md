# Especialistas para especificação

Compare os sinais com o escopo da mudança e a stack confirmada no projeto.
Combine especialistas quando os sinais se somarem. Por exemplo, uma migration
ativa `modeling` em `data` e o especialista do banco aplicável, como `postgres`
ou `supabase`. Um deploy que muda o host combina `delivery` com `server`.
Use `padrão` para skills sem modos nomeados.

| Sinal na demanda, na spec ou no código | Especialista | Modo |
| --- | --- | --- |
| Login, autorização, dado sensível ou entrada externa | `application-security` | `padrão` |
| Nova tabela, migration, entidades persistidas ou cardinalidade | `modeling` | `data` |
| Domínio, vocabulário, invariantes e transições de negócio | `modeling` | `domain` |
| Novo schema ou migration em PostgreSQL, SQL, índice ou concorrência | `postgres` | `padrão` |
| Migration no Supabase, Auth, RLS, Storage, Realtime ou Edge Functions | `supabase` | `padrão` |
| Cache, fila, sessão, TTL ou locks Redis/Valkey | `redis` | `padrão` |
| Endpoint, contrato HTTP ou OpenAPI | `architecture` | `web-api` |
| Arquitetura, fronteiras de módulos ou dependências entre serviços | `architecture` | `system` |
| Tela, CRUD ou formulário que exige definir composição visual e estados | `interface` | `ui` |
| Tela, CRUD ou formulário que altera padrões, defaults ou tokens do design system | `interface` | `system` |
| Descoberta da interface existente, stack e telas afetadas | `interface` | `discovery` |
| Jornada, fluxo de informação, menus ou navegação | `interface` | `ux` |
| Teclado, foco, contraste ou leitor de tela | `interface` | `accessibility` |
| Componente visual React, escolha ou reaproveitamento de blocos | `ui-components` | `components` |
| Composições ou registry ReUI | `ui-components` | `reui` |
| Primitives ou registry shadcn/ui | `ui-components` | `shadcn` |
| React em Laravel ou SPA, composição, hooks ou estado em React | `react` | `padrão` |
| Rota, cache, runtime ou fronteira server/client no Next.js | `nextjs` | `padrão` |
| Contrato de tipos, erro do compilador ou configuração TypeScript | `typescript` | `padrão` |
| Tailwind CSS, utilitários, variantes ou tema | `tailwind-css` | `padrão` |
| Domínio, HTTP, Eloquent, filas ou testes Laravel | `laravel` | `app` |
| Novo pacote Composer para Laravel ou pacote recebido por URL GitHub | `laravel` | `packages` |
| Dockerfile, imagem, Compose ou ambiente Docker local | `docker` | `compose` |
| Stack Docker Swarm | `docker` | `swarm` |
| Servidor Debian, serviços systemd, rede ou configuração do host | `server` | `debian` |
| Inventário ou playbook Ansible | `server` | `ansible` |
| Relatório de servidor somente leitura | `server` | `report` |
| Deploy, rollout, rollback ou inventário de entrega | `delivery` | `deploy` |
| Versão de release, arquivo SEMVER ou tag da imagem | `delivery` | `versioning` |
| Pipeline de build, testes ou publicação | `delivery` | `ci-cd` |
| Branches, integração, merge ou ciclo Gitflow | `git` | `gitflow` |
| Conflito de merge ou rebase | `git` | `conflicts` |
| Logs, métricas, traces, alertas ou SLO | `observability` | `signals` |
| Lentidão, orçamento de performance ou teste de carga | `observability` | `performance` |
| Dúvida técnica ou alternativas que exigem comparar fontes | `research` | `sources` |
| Alternativa incerta que exige um protótipo descartável | `research` | `prototype` |
| Revisão de PR, diff ou segunda opinião sobre código existente | `code-review` | `padrão` |
| Bug, regressão observada ou falha intermitente | `debugging` | `padrão` |

Confirme os sinais do backlog na demanda e no projeto. Registre nomes curtos
únicos, separados por vírgula, na linha `Especialistas` do cabeçalho. Em
`#### Especialistas` na seção 8, use uma linha por especialista e modo,
com o sinal concreto e as fases em que a skill será carregada. Use
`specify`, `tasks`, `implement` e `validate`, separados por vírgula quando
houver mais de uma fase. Carregue o especialista antes de escrever a seção
que depende dele e incorpore as exigências aplicáveis. Sem indicação, deixe o
campo e a tabela vazios.

O nome curto identifica a skill `specsfy-specialist-<nome>`. Leia seu
`Quando usar` para confirmar escopo e modo. Se já estiver instalada, anuncie a
transição automática e carregue a skill na mesma conversa. Se estiver ausente,
informe o motivo, proponha o comando abaixo e peça autorização específica.
Após a autorização, instale no projeto consumidor e retome na mesma conversa.
Registre a pendência e prossiga com o que puder enquanto ela estiver aberta.

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-<nome> --agent universal --copy --full-depth
```
