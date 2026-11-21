# Especialistas no refinamento

Compare os sinais com o escopo da mudança e a stack confirmada no projeto.
Combine especialistas quando os sinais se somarem. Por exemplo, uma migration
ativa `modeling` em `data` e o especialista do banco aplicável, como `postgres`
ou `supabase`. Um deploy que muda o host combina `delivery` com `server`.
Use `padrão` para skills sem modos nomeados.

<!-- specsfy:signals:start -->
Especialistas de tecnologia (`postgres`, `supabase`, `redis`, `laravel`, `react`, `nextjs`, `typescript`, `tailwind-css`, `docker`) só entram quando o `.specsfy/STACK.md` ou os manifests confirmam a tecnologia; sem essa confirmação, use o especialista de conceito (`modeling`, `architecture`, `interface`). Um sinal pode puxar mais de um especialista.

Exemplo combinado em Laravel com Inertia: para autorização por equipe × papel × operação, aplique `application-security`, `laravel/app`, `interface/ux` e `testing/pest`. Verifique em Pest HTTP a capacidade de criar exposta à UI e as decisões no GET do formulário e no POST. No reenvio de um código normalizado, use `modeling/data` e `laravel/app` para garantir unicidade por equipe e `architecture/web-api` para definir o erro de campo no fluxo Inertia. Em Pest, prove que equipes distintas podem usar o mesmo código e que repetir o POST na mesma equipe após um resultado incerto exibe o erro sem duplicar a gravação.

| Sinal na demanda, na spec ou no código | Especialista | Modo |
| --- | --- | --- |
| Login, autorização, dado sensível ou entrada externa | `application-security` | `padrão` |
| Papel por equipe, dono do recurso ou isolamento entre tenants | `application-security` | `padrão` |
| Permissão por papel e operação na equipe | `application-security` | `padrão` |
| Nova tabela, migration, entidades persistidas ou cardinalidade | `modeling` | `data` |
| Domínio, vocabulário, invariantes e transições de negócio | `modeling` | `domain` |
| Janela de validade, vencimento ou vigência | `modeling` | `domain` |
| Validade por data civil com relógio controlado, fuso e inclusão do último dia | `modeling` | `domain` |
| Limite de uso configurado ou cota persistida | `modeling` | `data` |
| Consumo de limite ou resgate concorrente com regra de negócio | `modeling` | `domain` |
| Consumo de limite ou resgate concorrente com atualização atômica | `modeling` | `data` |
| Unicidade normalizada por equipe | `modeling` | `data` |
| Valor monetário, percentual ou desconto | `modeling` | `domain` |
| Schema, migration, índice ou concorrência com PostgreSQL confirmado no STACK.md | `postgres` | `padrão` |
| Supabase confirmado no STACK.md: migration, Auth, RLS, Storage, Realtime ou Edge Functions | `supabase` | `padrão` |
| Cache, fila, sessão, TTL ou locks Redis/Valkey | `redis` | `padrão` |
| Endpoint, contrato HTTP ou OpenAPI | `architecture` | `web-api` |
| Arquitetura, fronteiras de módulos ou dependências entre serviços | `architecture` | `system` |
| Tela, CRUD ou formulário que exige definir composição visual e estados | `interface` | `ui` |
| Tela, CRUD ou formulário que aplica, define ou altera defaults de SaaS, CRUD ou design system | `interface` | `system` |
| Descoberta da interface existente, stack e telas afetadas | `interface` | `discovery` |
| Jornada, fluxo de informação, menus ou navegação | `interface` | `ux` |
| Teclado, foco, contraste ou leitor de tela | `interface` | `accessibility` |
| Lista, cadastro ou outro subconjunto de CRUD | `interface` | `ux` |
| Componente visual React, escolha ou reaproveitamento de blocos | `ui-components` | `components` |
| Composições ou registry ReUI | `ui-components` | `reui` |
| Primitives ou registry shadcn/ui | `ui-components` | `shadcn` |
| React em Laravel ou SPA, composição, hooks ou estado em React | `react` | `padrão` |
| Rota, cache, runtime ou fronteira server/client no Next.js | `nextjs` | `padrão` |
| Contrato de tipos, erro do compilador ou configuração TypeScript | `typescript` | `padrão` |
| Tailwind CSS, utilitários, variantes ou tema | `tailwind-css` | `padrão` |
| Domínio, HTTP, Eloquent, filas ou testes Laravel | `laravel` | `app` |
| Novo pacote Composer para Laravel ou pacote recebido por URL GitHub | `laravel` | `packages` |
| Servidor MCP com o pacote laravel/mcp | `laravel` | `mcp` |
| Dockerfile, imagem, Compose ou ambiente Docker local | `docker` | `compose` |
| Stack Docker Swarm | `docker` | `swarm` |
| Reverse proxy, Traefik, roteamento por domínio ou certificado TLS automático | `docker` | `proxy` |
| Servidor Debian, serviços systemd, rede ou configuração do host | `server` | `debian` |
| Inventário ou playbook Ansible | `server` | `ansible` |
| Relatório de servidor somente leitura | `server` | `report` |
| Pipeline de deploy automático do teste à produção | `delivery` | `pipeline` |
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
| Schema, migration ou índice com MySQL confirmado no STACK.md | `mysql` | `schema` |
| Query lenta, EXPLAIN, lock ou deadlock em MySQL | `mysql` | `queries` |
| Backup, replicação ou upgrade de MySQL | `mysql` | `operation` |
| Coleção, documento ou schema validation em MongoDB | `mongodb` | `modeling` |
| Aggregation pipeline, índice ou explain em MongoDB | `mongodb` | `queries` |
| Replica set, backup ou transação em MongoDB | `mongodb` | `operation` |
| DNS, proxy, certificado ou regra na Cloudflare | `cloudflare` | `dns` |
| Worker, wrangler, KV, D1, R2 ou Pages | `cloudflare` | `workers` |
| WAF, rate limiting, Access, Zero Trust ou Tunnel | `cloudflare` | `security` |
| Workflow, nó, expressão ou credencial do n8n | `n8n` | `workflows` |
| Instalar ou operar n8n em Docker, queue mode ou variáveis de ambiente | `n8n` | `self-hosting` |
| Webhook ou API do n8n como contrato com o sistema | `n8n` | `integration` |
| Teste Pest ou PHPUnit, factory, dataset ou banco de teste em Laravel | `testing` | `pest` |
| Validade por data civil com relógio controlado em testes Laravel | `testing` | `pest` |
| Teste automatizado de navegador com stack compatível ou decisão explícita de instalar Playwright | `testing` | `playwright` |
| Teste unitário ou de componente em TypeScript ou React | `testing` | `vitest` |
| Servidor MCP, tool, resource ou prompt MCP por HTTP | `mcp` | `protocol` |
| Descoberta OAuth do servidor MCP (RFC 9728) | `mcp` | `protocol` |
| Servidor MCP em Laravel com laravel/mcp ou Mcp::web | `mcp` | `laravel` |
| Rota MCP no App Router do Next.js | `mcp` | `nextjs` |
<!-- specsfy:signals:end -->

Ao refinar o item, registre em `## Especialistas prováveis` o nome curto, o
modo e o sinal observado para cada indicação. Leve essa lista para
`specify` como pista a confirmar. Carregue durante o refinamento os
especialistas necessários para resolver a área em discussão.

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
