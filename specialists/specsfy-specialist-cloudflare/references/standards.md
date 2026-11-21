# Padrões e referências Cloudflare

Reúne as regras que valem para DNS, Workers e segurança de borda, o índice das
referências por modo e as fontes oficiais.

Revisado em 2026-11-20 contra: documentação oficial em
`developers.cloudflare.com` (página de Workers com `dateModified` de
2026-10-08), referência do `wrangler`, limites de Workers, KV, D1 e R2, e
documentação de WAF, Zero Trust e Tunnel.

## Estado antes de mudança

```bash
npm exec --no -- wrangler whoami
npm exec --no -- wrangler deployments list --env staging
dig +short app.example.com
curl -sI https://app.example.com
```

- Conta e zona são parte da decisão. O mesmo nome pode existir em zonas
  diferentes com dono diferente.
- `wrangler whoami` mostra a conta autenticada. Token de CI de outra conta
  publica no lugar errado sem erro visível.
- Plano contratado muda limite, recurso e suporte. Não presuma recurso de plano
  superior.
- Domínio raiz, subdomínio e ambiente (produção, staging, preview) precisam estar
  nomeados na spec antes da primeira alteração.

## Índice dos modos

| Modo | Abre | Conteúdo |
| --- | --- | --- |
| dns | [dns.md](dns.md) | zona, registro, proxy, SSL/TLS, certificado de origem, redirecionamento, CAA e DNSSEC |
| workers | [workers.md](workers.md) | `wrangler`, binding, ambiente, rota, Pages, D1, KV, R2, deploy e log |
| security | [security.md](security.md) | WAF, rate limiting, bot, Access, Zero Trust, Tunnel e token |

## Regras comuns

- Toda mudança tem ambiente declarado e caminho de reversão. Regra publicada sem
  forma de desfazer é incidente esperando hora.
- Segredo nunca entra em arquivo versionado, em `vars`, em `NEXT_PUBLIC_*` ou em
  `console.log`. Segredo vive em secret do Worker, secret do repositório ou
  cofre.
- Token de API tem escopo mínimo, conta correta, validade e rotação. Token global
  em pipeline é acesso administrativo à conta inteira.
- Alteração de DNS e de proxy é feita na ordem que mantém o serviço no ar: nome
  antes de proxy, TLS antes de HSTS e regra validada em staging antes de bloqueio.
- Toda métrica de borda informa a janela e a origem do dado. Painel sem janela
  declarada não serve como prova.
- Recurso de borda tem limite publicado. Confirme o limite vigente na página
  oficial antes de dimensionar, porque plano e limite mudam.
- Mudança em recurso de dados (D1, KV, R2) tem plano de migração e de reversão
  próprio, independente do código do Worker.

## Limites que entram na decisão

| Recurso | Limite que muda desenho | Consequência |
| --- | --- | --- |
| Worker CPU | Tempo de CPU por invocação, conforme plano | Cálculo pesado precisa sair para fila ou serviço |
| Worker memória | 128 MB por isolate | Processamento de arquivo grande não cabe |
| Subrequisição | Quantidade por invocação | Laço de `fetch` estoura e falha em produção |
| KV | Consistência eventual e valor com limite de tamanho | Leitura recém-escrita pode não aparecer |
| D1 | Tamanho por banco e concorrência de escrita | Escrita intensa pede fila ou outro banco |
| R2 | Sem cobrança de egress, com limite de operação | Ótimo para objeto grande e leitura pública |
| Pages | Build e função com limite de execução | Build longo precisa sair do fluxo do Pages |

Consulte o número atual em
[limites de Workers](https://developers.cloudflare.com/workers/platform/limits/),
na página de cada produto. Número copiado de tutorial envelhece.

## Proxy e TLS

| Modo SSL/TLS | Tráfego Cloudflare para origem | Quando usar |
| --- | --- | --- |
| Off | sem HTTPS | nunca em produção |
| Flexible | HTTP em claro | legado sem suporte a TLS, com risco aceito e registrado |
| Full | HTTPS sem validar certificado | transição, com prazo |
| Full (strict) | HTTPS validado para solicitações HTTPS | recomendação de produção (regra da casa) |
| Strict (SSL-Only Origin Pull) | HTTPS validado mesmo quando o visitante usa HTTP | origem que só aceita HTTPS |

- Proxy laranja só para HTTP e HTTPS. Correio, SSH e protocolo binário ficam em
  DNS only.
- Confira o modo TLS efetivo da zona, inclusive seleção automática e regras que
  o substituem por hostname.
- O certificado de borda autentica a Cloudflare para o visitante. No setup
  completo, Universal SSL cobre o domínio raiz e o primeiro nível. Para
  hostnames mais profundos, confirme cobertura com certificado avançado ou
  personalizado na borda. Em setup parcial a cobertura segue outras regras.
- O certificado de servidor autentica a origem para a Cloudflare. Use uma CA
  pública aceita ou Origin CA. Para CA privada, confirme disponibilidade e
  configure a confiança no Custom Origin Trust Store da Cloudflare.
- O certificado de cliente autentica a Cloudflare para a origem. Use
  Authenticated Origin Pulls (AOP) e exija a verificação no servidor. Com o
  certificado compartilhado, a origem autentica a rede Cloudflare. Para
  restringir à sua implantação, use certificado de cliente próprio.
- Ative HSTS depois de verificar HTTPS em todos os subdomínios que a política
  inclui. Um `max-age` longo demora a reverter.

## Mudança segura

1. Registrar estado atual: registro, modo de proxy, modo TLS, regra existente.
2. Aplicar em ambiente de teste ou em uma rota específica.
3. Observar requisição real, log e métrica por janela declarada.
4. Promover para produção.
5. Manter o caminho de reversão aberto até o fim da janela de observação.

## Fontes oficiais

- Documentação Cloudflare: https://developers.cloudflare.com/
- DNS: https://developers.cloudflare.com/dns/
- Criar registro: https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/
- Status de proxy: https://developers.cloudflare.com/dns/proxy-status/
- SSL/TLS: https://developers.cloudflare.com/ssl/
- Modos SSL: https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/
- AOP: https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/
- CA de origem privada: https://developers.cloudflare.com/ssl/origin-configuration/custom-origin-trust-store/
- Cobertura Universal SSL: https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/
- Certificados de borda: https://developers.cloudflare.com/ssl/edge-certificates/
- Regras: https://developers.cloudflare.com/rules/
- Workers: https://developers.cloudflare.com/workers/
- Wrangler: https://developers.cloudflare.com/workers/wrangler/
- Configuração do Wrangler: https://developers.cloudflare.com/workers/wrangler/configuration/
- Bindings: https://developers.cloudflare.com/workers/runtime-apis/bindings/
- Limites de Workers: https://developers.cloudflare.com/workers/platform/limits/
- Logs de Workers: https://developers.cloudflare.com/workers/observability/logs/
- Teste de Workers: https://developers.cloudflare.com/workers/testing/
- KV: https://developers.cloudflare.com/kv/
- Como o KV funciona: https://developers.cloudflare.com/kv/concepts/how-kv-works/
- D1: https://developers.cloudflare.com/d1/
- Limites do D1: https://developers.cloudflare.com/d1/platform/limits/
- R2: https://developers.cloudflare.com/r2/
- Limites do R2: https://developers.cloudflare.com/r2/platform/limits/
- Pages: https://developers.cloudflare.com/pages/
- Pages Functions: https://developers.cloudflare.com/pages/functions/
- WAF: https://developers.cloudflare.com/waf/
- Regras personalizadas: https://developers.cloudflare.com/waf/custom-rules/
- Rate limiting: https://developers.cloudflare.com/waf/rate-limiting-rules/
- Parâmetros de rate limiting: https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/
- Zero Trust: https://developers.cloudflare.com/cloudflare-one/
- Políticas de Access: https://developers.cloudflare.com/cloudflare-one/access-controls/policies/
- Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Configurar túnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/configure-tunnels/
