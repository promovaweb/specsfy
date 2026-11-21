# Cloudflare

O especialista Cloudflare orienta o agente em três camadas da borda. O modo
**DNS** decide zona, registro, proxy, TLS e regra de redirecionamento. O modo
**Workers** decide projeto, binding, ambiente, publicação e limite de runtime. O
modo **Segurança** decide WAF, rate limiting, Zero Trust, Access e Tunnel.

A lógica comum: mudança de borda é feita na ordem que mantém o serviço no ar,
regra nova começa observando e a origem nunca fica exposta por acidente.

## Quando usar

- Você vai criar ou revisar registro DNS, ativar proxy, corrigir modo SSL/TLS,
  instalar certificado de origem, configurar CAA ou DNSSEC.
- Existe redirecionamento em laço, domínio não resolve ou subdomínio aponta para
  serviço que saiu do ar.
- Você vai criar Worker, configurar `wrangler`, binding KV, D1, R2, Queues ou
  Durable Objects, rota, ambiente e segredo.
- Uma publicação em Pages ou Worker falhou, estourou limite ou precisa de rollback
  de versão.
- Você vai configurar WAF, rate limiting, bot, Access, Tunnel ou origem
  autenticada.
- Você precisa revisar token de API e escopo de acesso à conta.

O agente confirma conta, zona, ambiente e o que responde na origem antes de
recomendar. O mesmo nome pode existir em zonas diferentes, e token de outra conta
publica no lugar errado sem erro visível.

## Como ele trabalha

1. Descobre conta, zona, domínio raiz, ambiente, plano e estado da origem.
2. Classifica o pedido em DNS, Workers ou Segurança.
3. Lê o estado atual com comando real, não com suposição do painel.
4. Aplica na ordem que preserva o serviço: nome antes de proxy, TLS antes de
   HSTS, regra em log antes de bloqueio.
5. Valida com requisição real e só então entrega o texto para a spec.

## DNS

O modo DNS resolve nome e transporte.

- Proxy ligado só em HTTP e HTTPS. Correio, SSH e banco ficam em DNS only.
- Full (strict) com certificado de origem válido é o padrão. Flexible deixa o
  trecho até a origem em claro e cria laço com redirecionamento.
- Registro no apex com CNAME é achatado pela Cloudflare.
- TTL automático de 300 segundos vale em registro proxiado.
- CNAME para serviço removido abre tomada de subdomínio e precisa ser excluído.
- CAA restringe quem emite certificado e evita emissão indevida.
- DNSSEC só entra com DS publicado no registrador e cadeia conferida.
- Redirecionamento usa Redirect Rule, cabeçalho usa Transform Rule.

Os tipos de registro, a tabela de proxy, o comando de verificação e o exemplo de
CAA estão em
[dns.md](../../../specialists/specsfy-specialist-cloudflare/references/dns.md).

## Workers

O modo Workers publica código na borda.

- `compatibility_date` é fixa e revisada com teste.
- `vars` não guarda segredo. Segredo entra por `wrangler secret put` e é por
  ambiente.
- Binding aponta recurso da conta certa: KV, D1, R2, Queue, Durable Object e
  service binding têm identificador próprio.
- KV é cache e configuração com consistência eventual, não fonte de verdade
  transacional.
- D1 tem migração versionada e escrita concentrada, o que muda o desenho de
  aplicação de escrita intensa.
- R2 serve objeto grande sem cobrança de egress.
- Pages e Worker com assets resolvem casos diferentes de publicação.
- `wrangler deploy --dry-run` revela binding e bundle antes de publicar.
- `wrangler tail` é inspeção pontual, não histórico de log.

A configuração de exemplo, a tabela de binding, os limites e o fluxo de D1 estão
em
[workers.md](../../../specialists/specsfy-specialist-cloudflare/references/workers.md).

## Segurança

O modo Segurança filtra tráfego e protege acesso.

- WAF personalizada começa em ação de log, com janela de observação declarada.
- Regra gerenciada é ajustada por exceção documentada, não desligada.
- Rate limiting conta por característica que identifica abuso, não por IP sozinho
  nem por URL inteira.
- Bot score é sinal combinado, nunca veredito isolado.
- Access protege todo hostname do serviço, não só o painel.
- Service token autentica máquina e é tratado como credencial.
- Tunnel dispensa porta pública na origem, com `ingress` e regra final de captura.
- Origem aceita apenas tráfego autenticado da Cloudflare.
- Token de API tem escopo mínimo e conta confirmada por `wrangler whoami`.

As expressões de WAF, o exemplo de túnel, a política de Access e o teste de
bloqueio estão em
[security.md](../../../specialists/specsfy-specialist-cloudflare/references/security.md).

## Erros que ele evita

- Modo Flexible em produção.
- Wildcard DNS para IP interno.
- CNAME pendente para serviço desativado.
- Segredo em `vars` ou em `NEXT_PUBLIC_*`.
- `compatibility_date` herdada de tutorial.
- Binding de produção usado em staging.
- Rate limit em `/*` contando só IP.
- WAF em bloqueio sem período de log.
- Access só no hostname principal.
- Token do túnel no Compose versionado.
- Token global de API em pipeline.

## Como conferir o resultado

- `dig` e `dig CAA` confirmando registro e autoridade.
- `curl -sI` conferindo status, `cf-ray` e ausência de laço.
- `curl -sv` confirmando TLS válido e versão mínima.
- `wrangler deploy --dry-run` antes de publicar e `wrangler deployments list`
  depois.
- Teste local do Worker cobrindo binding e erro.
- Regra em log com contagem de disparo e amostra de falso positivo avaliada.
- Laço controlado confirmando bloqueio e recuperação do rate limiting.
- `cloudflared tunnel ingress validate` e teste de conectividade.
- Endpoint administrativo devolvendo desafio do Access sem credencial.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-cloudflare --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Delivery](delivery.md) coordena release, artefato e ordem de publicação.
- [Docker](docker.md) cuida da imagem e do Compose que executam o `cloudflared`.
- [Server](server.md) define o host Debian que responde na origem.
- [Next.js](nextjs.md) decide rota, cache e runtime do framework.
- [TypeScript](typescript.md) define tipo e configuração do código do Worker.
- [Observabilidade](observability.md) define SLO, métrica e alerta de borda.
- [Segurança de Aplicações](application-security.md) define ameaça e autorização
  que a política de borda materializa.
- [n8n](n8n.md) configura a instância e o webhook que ficam atrás do Tunnel.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-cloudflare/SKILL.md),
com o índice e as regras comuns em
[standards.md](../../../specialists/specsfy-specialist-cloudflare/references/standards.md),
a zona em
[dns.md](../../../specialists/specsfy-specialist-cloudflare/references/dns.md),
o Worker em
[workers.md](../../../specialists/specsfy-specialist-cloudflare/references/workers.md)
e a política de borda em
[security.md](../../../specialists/specsfy-specialist-cloudflare/references/security.md).
