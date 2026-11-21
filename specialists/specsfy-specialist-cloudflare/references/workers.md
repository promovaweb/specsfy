# Workers, wrangler e bindings

## Configuração de projeto

Neste exemplo, produção fica na raiz e staging em `env.staging`. Use o Wrangler
local do projeto, com versão no `package.json` e no lockfile. A referência em
20/11/2026 é 4.166.0. Em um projeto novo, `npm install -D -E wrangler@4.166.0`
fixa essa versão. Em projeto existente, use a versão do lockfile e rode
`npm ci`. Os comandos usam `npm exec --no` para impedir instalação automática.

Salve como `wrangler.jsonc` e troque os IDs, nomes e domínios de exemplo pelos
recursos provisionados na conta. Crie os bancos, buckets e namespaces de cada
ambiente antes da integração remota.

```jsonc
{
  "name": "app-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-10-01",
  "observability": { "enabled": true },
  "vars": { "APP_ENV": "production" },
  "kv_namespaces": [
    { "binding": "CACHE", "id": "11111111111111111111111111111111" }
  ],
  "d1_databases": [
    { "binding": "DB", "database_name": "app", "database_id": "11111111-1111-4111-8111-111111111111" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "app-media" }
  ],
  "routes": [
    { "pattern": "api.example.com/*", "zone_name": "example.com" }
  ],
  "env": {
    "staging": {
      "vars": { "APP_ENV": "staging" },
      "kv_namespaces": [
        { "binding": "CACHE", "id": "22222222222222222222222222222222" }
      ],
      "d1_databases": [
        { "binding": "DB", "database_name": "app-staging", "database_id": "22222222-2222-4222-8222-222222222222" }
      ],
      "r2_buckets": [
        { "binding": "MEDIA", "bucket_name": "app-media-staging" }
      ],
      "routes": [
        { "pattern": "staging-api.example.com/*", "zone_name": "example.com" }
      ]
    }
  }
}
```

Para um projeto de exemplo, salve como `src/index.ts`:

```typescript
export default {
  fetch(): Response {
    return Response.json({ ok: true });
  },
};
```

- Use um formato por projeto (`wrangler.jsonc` ou `wrangler.toml`). Aponte
  `main` para o entrypoint real e revise `compatibility_date` com teste.
- `vars` e bindings de KV, D1 e R2 precisam ser declarados em cada ambiente.
- Para uma [Worker Route](https://developers.cloudflare.com/workers/configuration/routing/routes/),
  cada hostname precisa de registro DNS proxiado existente. Se o Worker for a
  própria origem, use
  [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
  com padrão de hostname exato, por exemplo
  `{ "pattern": "api.example.com", "custom_domain": true }`.

## Comandos

Staging, sempre com `--env staging`. Use terminais separados para `dev` e `tail`.
Rode o rollback só se precisar reverter e informe uma versão do mesmo ambiente
em `VERSION_ID`, consultada em `versions list`.

```bash
npm exec --no -- wrangler dev --env staging
npm exec --no -- wrangler deploy --env staging --dry-run --outdir dist/staging
npm exec --no -- wrangler deploy --env staging
npm exec --no -- wrangler tail --env staging
npm exec --no -- wrangler deployments list --env staging
npm exec --no -- wrangler versions list --env staging
npm exec --no -- wrangler rollback "${VERSION_ID:?}" --env staging
```

Para aplicar a mesma sequência em produção, troque `--env staging` por
`--env=""` em todos os comandos para selecionar explicitamente a raiz. Use
`dist/production` no dry-run e selecione um ID de versão da raiz. Confirme conta, Worker e destino antes de
escrever. Rollback de código preserva as alterações já feitas em banco e storage.

- Dry-run monta o bundle e verifica a configuração local. Para comprovar conta,
  permissões e funcionamento de cada binding, rode integração com recursos reais
  de staging e dados descartáveis.
- `wrangler dev` usa runtime local. Para conectar só um binding ao recurso real
  de staging, use `remote: true` no binding quando suportado. `wrangler dev
  --remote` executa o Worker inteiro na infraestrutura remota.
- `wrangler tail` acompanha requisições e logs em tempo real. Deploy gradual
  divide tráfego entre versões do mesmo Worker.

## Segredo e variável

A primeira dupla aponta para produção na raiz com `--env=""`. A segunda aponta
para staging. Informe o valor pelo prompt de `secret put`.

```bash
npm exec --no -- wrangler secret put STRIPE_KEY --env=""
npm exec --no -- wrangler secret list --env=""
npm exec --no -- wrangler secret put STRIPE_KEY --env staging
npm exec --no -- wrangler secret list --env staging
```

- Guarde segredo local em `.dev.vars` ou `.dev.vars.staging` e exclua os
  arquivos do Git. `vars` serve a valores públicos de configuração.
- Restrinja segredos ao ambiente e rotacione quando houver suspeita de vazamento.
  Revise logs para garantir que o código preserva os valores.

## Bindings

| Binding | Natureza | Consistência e limite |
| --- | --- | --- |
| KV | Chave-valor distribuído | Eventual, pode levar até 60 s para propagar; valor com teto de tamanho |
| D1 | SQL compatível com SQLite | Escrita concentrada em uma região; limite por banco |
| R2 | Objeto compatível com S3 | Sem cobrança de egress; ideal para arquivo grande |
| Queues | Fila com entrega | Produtor e consumidor separados; retry e dead letter próprios |
| Durable Objects | Estado com coordenação | Um objeto por chave, serializa acesso |
| Service binding | Chamada Worker para Worker | Sem passar pela internet pública |
| Hyperdrive | Pool para banco externo | Reduz latência de conexão a Postgres/MySQL |
| Workers AI | Inferência | Limite por modelo e por conta |

- KV é cache e configuração, não fonte de verdade transacional. Leitura após
  escrita pode devolver valor antigo.
- D1: migração versionada, aplicada com `wrangler d1 migrations apply`, e teste
  em banco de staging antes de produção.
- R2: objeto público usa domínio customizado ou Worker na frente. Bucket privado
  exige assinatura ou Worker autenticado.
- Service binding prefere-se a `fetch` para Worker interno: não depende de DNS
  público e não expõe rota.
- Binding aponta identificador de conta. Copiar configuração entre contas exige
  trocar o identificador, não só o nome.

## D1

Use o binding `DB` declarado na configuração. Crie a migração uma vez,
usando staging para selecionar a configuração:

```bash
npm exec --no -- wrangler d1 migrations create DB create_invoice --env staging
```

No arquivo SQL gerado em `migrations/`, escreva:

```sql
CREATE TABLE invoice (id INTEGER PRIMARY KEY);
```

Depois aplique e consulte a mesma base em cada etapa. Os comandos remotos
exigem bancos provisionados e credencial para a conta correta.

```bash
npm exec --no -- wrangler d1 migrations apply DB --local --env staging
npm exec --no -- wrangler d1 execute DB --local --env staging --command 'SELECT COUNT(*) FROM invoice'
npm exec --no -- wrangler d1 migrations apply DB --remote --env staging
npm exec --no -- wrangler d1 execute DB --remote --env staging --command 'SELECT COUNT(*) FROM invoice'
```

Para promover a migração a produção, repita os dois comandos remotos com
`--env=""` no lugar de `--env staging`. O binding então aponta para `app`.

- `--local` seleciona Miniflare e `--remote` seleciona o recurso provisionado.
- Mantenha a migração compatível com as duas versões durante a janela de deploy.
  Rollback do Worker preserva o schema já migrado.
- Use `EXPLAIN QUERY PLAN` para avaliar consulta pesada. Escrita concorrente
  intensa pede revisão do desenho, pois o D1 concentra as escritas por banco.

## Pages

- Pages publica site estático com build próprio e Functions no mesmo projeto.
- `pages_build_output_dir` no `wrangler.toml` ou configuração no painel define a
  saída.
- Preview de pull request tem URL própria e variável de ambiente própria. Segredo
  de produção não deve estar disponível em preview.
- Functions usam a mesma API de runtime do Worker, com binding declarado no
  projeto.
- Projeto que precisa de controle total de rota e binding migra para Worker com
  assets estáticos; os dois modelos não compartilham todo recurso.

## Limites que mudam desenho

| Limite | Efeito no código |
| --- | --- |
| CPU por invocação | Cálculo pesado sai para fila, Durable Object ou serviço externo |
| Memória do isolate | Arquivo grande é processado em fluxo, não carregado inteiro |
| Subrequisição por invocação | Laço de `fetch` precisa de limite e de tratamento de erro |
| Tamanho de resposta | Streaming em vez de acumular corpo |
| Tempo de build no Pages | Build longo sai do fluxo de publicação |

Confirme o número vigente na página oficial de limites. Plano e limite mudam com
frequência maior que o ciclo de vida do projeto.

## Teste e observabilidade

- Teste local com o runtime de teste da Cloudflare, cobrindo binding e resposta
  de erro, não só caminho felizmente válido.
- Teste de integração com recurso real em conta de staging, com dado descartável.
- `observability.enabled` liga log estruturado; `wrangler tail` serve para
  inspeção pontual, não para histórico.
- Métrica de Worker mostra requisição, erro, CPU e duração. Alerta sem ação
  definida é ruído.
- Erro 1101 indica exceção JavaScript. Erro 1102 indica que o Worker excedeu
  o limite de CPU. Confira a execução nos logs e métricas.
