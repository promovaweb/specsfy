# Workers, wrangler e bindings

## Configuração de projeto

```jsonc
{
  "name": "app-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-10-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true },
  "vars": { "APP_ENV": "production" },
  "kv_namespaces": [
    { "binding": "CACHE", "id": "<id-de-producao>" }
  ],
  "d1_databases": [
    { "binding": "DB", "database_name": "app", "database_id": "<id>" }
  ],
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "app-media" }
  ],
  "routes": [
    { "pattern": "api.example.com/*", "zone_name": "example.com" }
  ]
}
```

- `wrangler.toml` faz o mesmo papel. Escolha um formato por projeto e não
  mantenha os dois.
- `compatibility_date` define o comportamento do runtime. Fixe a data, suba com
  teste e registre a mudança no changelog do projeto.
- `compatibility_flags` habilita comportamento específico, como `nodejs_compat`.
  Flag que não é necessária amplia superfície de mudança.
- `main` aponta o entrypoint real. Build que gera arquivo em `dist/` precisa de
  `main` coerente com o artefato publicado.
- Ambiente separado:

```jsonc
{
  "env": {
    "staging": {
      "vars": { "APP_ENV": "staging" },
      "kv_namespaces": [{ "binding": "CACHE", "id": "<id-de-staging>" }],
      "routes": [{ "pattern": "staging-api.example.com/*", "zone_name": "example.com" }]
    }
  }
}
```

## Comandos

```bash
npx wrangler dev
npx wrangler deploy --dry-run --outdir=dist
npx wrangler deploy --env staging
npx wrangler tail --env staging
npx wrangler deployments list
npx wrangler rollback <version-id>
```

- `--dry-run` monta o bundle sem publicar e revela binding e arquivo não
  resolvido antes do deploy.
- `wrangler dev` roda local com runtime simulado; `--remote` usa recurso real, com
  efeito em dado de verdade.
- `wrangler tail` mostra requisição e `console.log` em tempo real, filtrado por
  status e amostra.
- Deploy cria versão. `wrangler versions` e deploy gradual permitem dividir
  tráfego antes de promover.
- Rollback devolve versão anterior, mas não desfaz migração de banco nem escrita
  em storage. Compatibilidade de dado continua sendo decisão do projeto.

## Segredo e variável

```bash
npx wrangler secret put STRIPE_KEY --env production
npx wrangler secret list --env production
```

- `vars` é visível no painel e no arquivo. Nunca guarde token, senha ou chave.
- Segredo é por ambiente. Segredo de produção não aparece em staging nem em
  preview.
- Segredo publicado não volta a ser lido pela API; rotacione e atualize o
  consumidor quando houver suspeita.
- `.dev.vars` guarda segredo local e fica no `.gitignore`.
- Código que imprime `env` no log vaza segredo. Revise `console.log` antes de
  publicar.

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

```bash
npx wrangler d1 create app
npx wrangler d1 migrations create app add_invoice
npx wrangler d1 migrations apply app --local
npx wrangler d1 migrations apply app --remote --env staging
npx wrangler d1 execute app --remote --command "SELECT COUNT(*) FROM invoice"
```

- `--local` usa banco de desenvolvimento em Miniflare; `--remote` toca o banco
  real.
- Migração aplicada não é revertida por rollback de Worker. Escreva migração
  compatível com as duas versões durante a janela de deploy.
- Índice e plano importam como em qualquer SQL: use `EXPLAIN QUERY PLAN` antes de
  aceitar consulta pesada.
- Escrita concorrente intensa em D1 pede revisão de desenho; a arquitetura
  concentra escrita e não substitui banco transacional de alto volume.

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
- Erro 1101 e 1102 indicam exceção no Worker; o log correspondente é a evidência,
  não o status.
