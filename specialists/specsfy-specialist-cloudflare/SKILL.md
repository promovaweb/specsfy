---
name: specsfy-specialist-cloudflare
description: Configurar e diagnosticar DNS, Workers e segurança de borda na Cloudflare com proxy, TLS e política explícitos. Use no modo dns para registro, zona, proxy laranja, SSL/TLS, certificado de origem, regra de redirecionamento, CAA e CNAME pendente; no modo workers para projeto com wrangler, bindings KV, D1, R2 e Pages, ambiente, rota, domínio, migração de banco e limite de runtime; no modo security para WAF, rate limiting, bot, Zero Trust e Access, Tunnel, origem protegida e token de API. Não use para o framework Next.js (`$specsfy-specialist-nextjs`), para release e posicionamento de imagem (`$specsfy-specialist-delivery`), para o host Debian que serve a origem (`$specsfy-specialist-server`) nem para ameaça de aplicação fora do edge (`$specsfy-specialist-application-security`).
---

# Cloudflare

Cobre a camada de borda que resolve nome, executa código e filtra tráfego. O modo
dns decide zona, registro, proxy e TLS; o modo workers decide projeto, binding e
deploy de código na borda; o modo security decide regra de bloqueio, limite de
requisição e acesso privado.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Criar ou revisar registro DNS, zona, proxy laranja, modo SSL/TLS, certificado de origem, redirecionamento, DNSSEC, CAA ou CNAME que aponta para serviço removido | dns | [Zona, proxy, TLS e regras](references/dns.md) |
| Criar Worker, configurar `wrangler`, binding KV, D1, R2, Queues ou Durable Objects, Pages, rota, ambiente, segredo, `compatibility_date` ou diagnosticar limite e log na borda | workers | [Workers, wrangler e bindings](references/workers.md) |
| Configurar WAF, regra gerenciada, rate limiting, bot, Zero Trust, Access, Tunnel, origem autenticada ou token de API | security | [WAF, Access e Tunnel](references/security.md) |

Não use para:

- Framework Next.js, rota, cache de framework e fronteira server/client. Use
  `$specsfy-specialist-nextjs`; aqui o trabalho é a camada que publica o build.
- Release, versionamento de artefato, ordem de publicação e rollback. Use
  `$specsfy-specialist-delivery`.
- Estado do host Debian, systemd, nftables e serviço que responde na origem. Use
  `$specsfy-specialist-server`.
- Modelo de ameaça, autorização de aplicação e segredo fora do edge. Use
  `$specsfy-specialist-application-security` e traga só a política de borda
  correspondente.

Combine com `$specsfy-specialist-docker` quando o `cloudflared` roda em
container, com `$specsfy-specialist-typescript` quando o Worker for TypeScript
tipado e com `$specsfy-specialist-observability` quando o sinal de borda entrar
no SLO do serviço.

## No Specsfy

1. Antes de agir, leia a spec aberta, cujo caminho vem da skill que chamou ou
   de `specsfy status`. Leia a linha `| Especialistas |` da tabela de
   metadados, a subseção `#### Especialistas` em `### 8. Plano técnico` e a
   seção que a fase está escrevendo. Leia também `.specsfy/STACK.md` e
   `.specsfy/RULES.md`, e `.specsfy/DATABASE.md` quando o modo tocar D1.
   - Fonte de entrada por fase: em `specsfy-02-backlog`, sem spec, leia e
     registre no item de `specs/backlog/`; em specify e validate, leia a spec
     aberta (linha `| Especialistas |`, subseção `#### Especialistas`, seção
     em escrita) e escreva nela; em `specsfy-06-implement`, siga a tarefa
     indicada. Só `specsfy-05-tasks` escreve a seção 14: aqui apenas se indica
     o que a tarefa deve prever, sem criar tarefa.
2. Siga o modo indicado na spec ou na tarefa, no formato
   `Especialista: $specsfy-specialist-cloudflare (dns)`, `(workers)` ou
   `(security)`. Sem indicação, identifique a conta, a zona e o ambiente antes de
   propor mudança.
3. Devolva a conclusão para a seção da spec ou para a tarefa que a fase está
   escrevendo; não abra arquivo paralelo. Se faltar informação, registre como
   dúvida aberta da spec.
4. Não mude o estado da spec nem marque gate: isso pertence a
   `$specsfy-03-specify`, `$specsfy-04-validate`, `$specsfy-05-tasks` e
   `$specsfy-06-implement`.
5. Registre na spec o nome do registro ou da rota, o modo de proxy, o modo
   SSL/TLS, a política de acesso, o `compatibility_date` e o comando de deploy
   usado. A zona e o ambiente fazem parte da mudança, não são detalhe da
   conversa.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e descubra conta,
   zona, domínio raiz, ambiente, plano contratado e o que responde na origem
   antes de recomendar.
2. Classifique o pedido: dns para nome e TLS, workers para código e binding,
   security para filtro e acesso.
3. Verifique o estado atual com consulta real (`dig`, `curl -I`, `wrangler
   whoami`, `wrangler deployments list`) em vez de assumir o painel.
4. Faça a mudança na ordem que não derruba o serviço: nome antes de proxy, proxy
   antes de regra, regra em log antes de bloqueio.
5. Valide com as comprovações da seção Validação e só então entregue o texto
   para a spec, com o efeito colateral declarado.

### Modo dns

1. Liste os registros existentes da zona e identifique o registro que aponta para
   cada origem, incluindo CNAME para serviço de terceiro.
2. Decida proxy por tipo de tráfego: HTTP e HTTPS podem ser proxiados; SMTP, SSH
   e protocolo não HTTP usam DNS only.
3. Configure SSL/TLS em Full (strict) com certificado de origem válido. Flexible
   cria laço de redirecionamento e tráfego em claro entre Cloudflare e origem.
4. Aplique redirecionamento e cabeçalho no lugar certo: regra de redirecionamento
   para URL, Transform Rule para cabeçalho, HSTS só depois de confirmar HTTPS em
   todos os subdomínios.
5. Confirme CAA, DNSSEC e registro órfão. Detalhe de cada tipo e comando em
   [references/dns.md](references/dns.md).

### Modo workers

1. Inspecione `wrangler.jsonc` ou `wrangler.toml`, `package.json`, o ambiente
   declarado e o binding usado por cada handler.
2. Fixe `compatibility_date` e só mude com teste. Data antiga esconde mudança de
   runtime, data futura antecipa comportamento não testado.
3. Separe `vars` de segredo. Segredo entra por `wrangler secret put` e nunca no
   arquivo versionado.
4. Declare binding por ambiente e confirme que o recurso existe na conta certa:
   KV, D1, R2, Queue, Durable Object e service binding têm identificador próprio.
5. Valide localmente, faça deploy em versão, acompanhe log em `wrangler tail` e
   só então promova a rota. Limites, migração de D1 e Pages em
   [references/workers.md](references/workers.md).

### Modo security

1. Identifique o ativo: site público, painel administrativo, API, webhook ou
   serviço interno exposto por Tunnel.
2. Escolha o controle pelo objetivo: regra de WAF para requisição maliciosa,
   rate limiting para abuso de volume, Access para acesso restrito, Tunnel para
   serviço sem IP público.
3. Escreva a expressão com os campos reais e teste em ação de log antes de
   bloquear.
4. Defina resposta e observabilidade: status, página, contador e alerta quando a
   regra dispara.
5. Garanta que existe um caminho de administração fora da regra e que o token de
   API tem escopo mínimo. Sintaxe e política em
   [references/security.md](references/security.md).

## Padrões

- SSL/TLS em Full (strict) com certificado de origem válido. Flexible nunca é
  escolha para produção, porque o trecho Cloudflare até a origem viaja em claro.
- Registro que não é HTTP nem HTTPS fica em DNS only. Proxiar protocolo não
  suportado quebra o serviço de forma silenciosa.
- CNAME que aponta para serviço removido é risco de tomada de subdomínio. Revise
  registro órfão e remova antes de perder o controle do destino.
- CAA restringe quem emite certificado para a zona. Sem CAA, qualquer CA pública
  pode emitir para o seu domínio.
- Toda variável sensível do Worker é segredo, nunca `vars`. `vars` aparece no
  painel e no arquivo versionado.
- `compatibility_date` é fixada e revisada com teste, não herdada do exemplo do
  tutorial.
- Binding declarado por ambiente e conferido com o recurso real. Apontar KV de
  produção em ambiente de teste mistura dado.
- WAF e rate limiting entram primeiro em ação de log, com prazo de observação,
  depois em bloqueio. Regra sem observação derruba cliente legítimo.
- Rate limiting conta por característica que identifica o abuso, como IP, caminho
  e método, não por URL inteira com query string variável.
- Cloudflare Tunnel dispensa porta de entrada aberta na origem. O token do túnel
  é segredo, e o `cloudflared` roda com ele por arquivo ou variável protegida.
- Zero Trust Access na frente de painel, wiki interna e endpoint administrativo,
  com política por identidade e grupo, mais service token para máquina.
- Token de API tem escopo mínimo, validade e rotação. Token global em CI é acesso
  total à conta em um arquivo.

## Antipadrões

- Modo Flexible com redirecionamento para HTTPS: o visitante entra em HTTPS, o
  edge busca a origem em HTTP e o redirecionamento da origem devolve laço.
- Wildcard DNS apontando para IP interno ou serviço sem autenticação: expõe
  origem que não deveria ser pública.
- CNAME para provedor que saiu do ar: terceiro pode registrar o destino e servir
  conteúdo no seu subdomínio.
- Segredo em `vars` do `wrangler` ou em `NEXT_PUBLIC_*`: valor visível no bundle e
  no painel.
- Rate limit aplicado em `/*` com contagem por IP único: bloqueia escritório
  inteiro atrás de NAT e não contém bot distribuído.
- WAF em ação de bloqueio sem período de log: a primeira evidência de falso
  positivo é reclamação de cliente.
- Access configurado apenas em um hostname, com outro nome do mesmo serviço
  aberto: a política protege a porta da frente e deixa a lateral livre.
- `cloudflared` com token no `docker-compose.yml` versionado.
- D1 usado como banco de escrita concorrente intensa sem revisar limite e padrão
  de acesso.

## Validação

- `dig +short <nome>` e `dig <nome> CAA` confirmando registro e restrição de
  autoridade certificadora.
- `curl -sI https://<host>` conferindo status, `server: cloudflare`, `cf-ray` e
  ausência de redirecionamento em laço.
- `curl -sv` mostrando TLS válido e versão mínima aplicada, sem certificado
  expirado.
- `wrangler deploy --dry-run` para conferir bundle e binding antes de publicar,
  `wrangler tail` durante o teste e `wrangler deployments list` depois.
- Teste local do Worker com o runtime de teste da Cloudflare, cobrindo binding e
  resposta de erro.
- Regra de WAF com ação de log observada por um período declarado, com contagem
  de disparo e amostra de requisição.
- Teste de rate limiting com laço controlado, confirmando o status de bloqueio e
  a recuperação depois da janela.
- `cloudflared tunnel ingress validate` e `cloudflared tunnel --loglevel debug`
  confirmando conexão e rota antes de desligar o acesso antigo.
- `curl -i` no endpoint administrativo sem credencial, confirmando que Access
  devolve desafio e não conteúdo.
- Não declare zona segura, Worker saudável ou túnel estável sem essas evidências;
  painel verde não substitui requisição real.

## Skills relacionadas

- `$specsfy-specialist-delivery` coordena release, artefato e ordem de
  publicação; este especialista entrega a zona, a rota e a política de borda que
  a entrega consome.
- `$specsfy-specialist-docker` cuida da imagem e do Compose que executam
  `cloudflared` e serviços de origem; a configuração do túnel fica aqui.
- `$specsfy-specialist-server` define o host Debian e o serviço que responde na
  origem; aqui se decide como a borda alcança esse host.
- `$specsfy-specialist-nextjs` decide rota, cache e runtime do framework; aqui se
  decide Pages, Worker, domínio e binding de publicação.
- `$specsfy-specialist-typescript` define tipo e configuração do código do
  Worker; o comportamento de runtime e binding continua aqui.
- `$specsfy-specialist-observability` define SLO, métrica e alerta; este
  especialista entrega os sinais de borda que entram neles.
- `$specsfy-specialist-application-security` define ameaça e autorização da
  aplicação; WAF, Access e Tunnel materializam a parte que vive no edge.
- `$specsfy-specialist-n8n` configura a instância e o webhook que ficam atrás do
  Tunnel ou do Worker; a política de borda continua aqui.

Leia [references/standards.md](references/standards.md) para o índice dos modos,
as regras comuns e as fontes oficiais, [references/dns.md](references/dns.md) para
zona, proxy, TLS e regra, [references/workers.md](references/workers.md) para
projeto, binding, deploy e limite e [references/security.md](references/security.md)
para WAF, rate limiting, Access e Tunnel.
