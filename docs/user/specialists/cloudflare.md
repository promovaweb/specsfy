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

## No Specsfy

**Fonte de entrada por fase**

- Em backlog, leia o item em `specs/backlog/`. A fase registra ali o resultado.
- Em specify e validate, use a spec aberta indicada pela fase.
- Em tasks, o especialista sugere modos e a fase sincroniza essa escolha com
  o plano. A seção 14 é escrita por `specsfy-05-tasks`.
- Em implement, siga a tarefa e o passo carregado. No modo tests, a fase
  conclui o checklist em `prepare`.

Quando houver spec, leia a spec aberta, confira o modo indicado e entregue as
evidências à fase responsável pelo registro.

## Fluxo

1. Descobre conta, zona, domínio raiz, ambiente, plano e estado da origem.
2. Classifica o pedido em DNS, Workers ou Segurança.
3. Lê o estado atual com comando real, não com suposição do painel.
4. Prepara nome e TLS antes da publicação, verifica HTTPS antes de habilitar
   HSTS e testa regras em staging antes de bloquear tráfego.
5. Valida com requisição real e só então entrega o texto para a spec.

## DNS

O modo DNS resolve nome e transporte.

- Proxy ligado só em HTTP e HTTPS. Correio, SSH e banco ficam em DNS only.
- Confira o modo efetivo da zona. Full (strict) é a recomendação de produção
  (regra da casa). Strict (SSL-Only Origin Pull) exige HTTPS validado até a
  origem mesmo quando o visitante usa HTTP.
- Confira a cobertura do certificado de borda em cada hostname público. Em
  setup completo, Universal SSL cobre o domínio raiz e o primeiro nível. Para
  nomes mais profundos, confira a opção de certificado na borda.
- O certificado de servidor autentica a origem. Para uma CA privada,
  configure o Custom Origin Trust Store da Cloudflare quando disponível.
  O certificado de cliente autentica a Cloudflare perante a origem. Para
  exigir esse certificado, configure AOP e a verificação no servidor.
- Consulte CNAMEs no painel ou na API para achar destinos desativados. Com
  proxy ou flattening, `dig` pode mostrar só A/AAAA. Registro proxiado usa
  TTL Auto, fixo em 300 s na maioria dos planos.
- CAA restringe quais autoridades podem emitir certificados.
- Para ativar DNSSEC, habilite a assinatura na Cloudflare, publique o DS gerado
  no registrador e valide a cadeia. Em migração sem multi-signer ou ao desativar,
  retire primeiro o DS antigo e aguarde expirar o TTL antes de trocar os
  nameservers ou desligar a assinatura.
- Redirecionamento usa Redirect Rule, cabeçalho usa Transform Rule.

Os tipos de registro, a tabela de proxy, o comando de verificação e o exemplo de
CAA estão em
[dns.md](../../../specialists/specsfy-specialist-cloudflare/references/dns.md).

## Workers

O modo Workers publica código na borda.

- `compatibility_date` é fixa e revisada com teste.
- `vars` não guarda segredo. Segredo entra por `wrangler secret put` e é por
  ambiente.
- Confira a versão local do Wrangler no lockfile e mantenha a seleção de
  ambiente nos comandos. Declare recursos de KV, D1 e R2 separadamente em cada
  ambiente.
- Worker Route exige DNS proxiado existente. Quando o Worker for a própria
  origem, use Custom Domain.
- KV é cache e configuração com consistência eventual, não fonte de verdade
  transacional.
- D1 tem migração versionada e escrita concentrada, o que muda o desenho de
  aplicação de escrita intensa.
- R2 serve objeto grande sem cobrança de egress.
- Pages e Worker com assets resolvem casos diferentes de publicação.
- `wrangler deploy --dry-run` valida configuração local e gera o bundle.
  Integração em staging verifica conta, acesso e comportamento dos bindings.
  Use `remote: true` no binding quando suportado para conectar só aquele
  recurso ao Worker local.
- Use `wrangler tail` para inspeção pontual. O erro 1101 indica exceção
  JavaScript. O erro 1102 indica que o Worker excedeu o limite de CPU.

A configuração de exemplo, a tabela de binding, os limites e o fluxo de D1 estão
em
[workers.md](../../../specialists/specsfy-specialist-cloudflare/references/workers.md).

## Segurança

O modo Segurança filtra tráfego e protege acesso.

- Ação Log em regras personalizadas de WAF exige Enterprise. Nos demais
  planos, teste o bloqueio ou desafio em staging, com expressão restrita e os
  eventos disponíveis.
- Caminho e método filtram as requisições avaliadas pelo rate limiting.
  Clientes atrás do mesmo NAT continuam dividindo a cota por IP. Consulte
  as características de contagem do plano.
- Bot score exige Bot Management. Turnstile exige validação Siteverify no
  servidor antes de aceitar o formulário.
- Proteja painel e rotas administrativas por identidade. Rotas de máquina
  usam política `Service Auth` que seleciona o token. Para webhooks de
  terceiros sem os cabeçalhos do Access, limite a rota pública e valide a
  assinatura do provedor na aplicação.
- No Tunnel local, use o UUID e a credencial do túnel, crie DNS para cada
  hostname e mantenha a regra final de captura. No remoto, configure as rotas
  no painel e execute o conector com token protegido.

As expressões de WAF, o exemplo de túnel, a política de Access e o teste de
bloqueio estão em
[security.md](../../../specialists/specsfy-specialist-cloudflare/references/security.md).

## Padrões

- Prepare a reversão de registros, regras e versões antes da publicação.
- Guarde segredos do Worker e do Tunnel no cofre e restrinja o token de API
  à conta, à zona e à permissão necessárias.
- Confira cada hostname e ambiente com tráfego de teste antes da promoção.

## Antipadrões

- Modo Flexible em produção.
- Wildcard DNS para IP interno.
- CNAME pendente para serviço desativado.
- Segredo em `vars` ou em `NEXT_PUBLIC_*`.
- `compatibility_date` herdada de tutorial.
- Binding de produção usado em staging.
- Rate limit em `/*` contando só IP.
- WAF em bloqueio antes de testar requisições legítimas.
- Access só no hostname principal.
- Token do túnel no Compose versionado.
- Token global de API em pipeline.

## Validação

- Consulte o inventário da zona e valide a resposta DNS pública, CAA e a
  cadeia DNSSEC.
- Confira TLS, status HTTP, `cf-ray` e possíveis redirecionamentos em laço.
- Rode dry-run, teste local e integração com recursos reais de staging. Use o
  mesmo ambiente no deploy, tail e listagem de versões.
- Confira WAF em staging com eventos disponíveis e teste a recuperação após a
  janela de rate limiting.
- Valide ingress e a regra de cada URL no Tunnel local. Confira conectividade
  pública e isolamento da origem. Se houver IP público, teste acesso direto
  preservando hostname e SNI e confirme a recusa.
- Teste Access sem credencial e com service token autorizado. Se usar
  Turnstile, confira que o servidor rejeita token inválido.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-cloudflare --agent universal --copy --full-depth
```

## Skills relacionadas

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
