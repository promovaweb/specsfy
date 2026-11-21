# Zona, proxy, TLS e regras

## Registro por tipo

| Tipo | Uso | Aceita proxy | Cuidado |
| --- | --- | --- | --- |
| `A` | Nome para IPv4 | sim, em HTTP/HTTPS | IP volátil quebra ao trocar de servidor |
| `AAAA` | Nome para IPv6 | sim, em HTTP/HTTPS | Origem sem IPv6 configurado responde erro |
| `CNAME` | Nome para outro nome | sim, em HTTP/HTTPS | Destino removido abre tomada de subdomínio |
| `MX` | Recebimento de correio | não | Prioridade define ordem de entrega |
| `TXT` | Verificação e política | não | SPF, DKIM e DMARC vivem aqui |
| `SRV` | Serviço com porta e prioridade | não | Usado por SIP, XMPP e federação |
| `CAA` | Autoridade certificadora permitida | não | Sem CAA, qualquer CA pública emite |
| `NS` | Delegação de zona | não | Mudança propaga pela cadeia |

- No apex do domínio, `CNAME` é achatado (flattening) pela Cloudflare. O
  resultado é registro `A`/`AAAA` na resposta, mantendo o nome canônico na
  configuração.
- Registro proxiado usa TTL Auto, fixo em 300 s na maioria dos planos.
  Confirme se a configuração do plano permite alterar esse TTL.

## Proxy ligado e desligado

Proxiado (nuvem laranja):

- Tráfego passa pela borda, recebe cache, WAF, rate limiting e ocultação de IP de
  origem.
- Certificado de borda é da Cloudflare, e o modo SSL/TLS decide como a origem é
  alcançada.
- `cf-ray` e `server: cloudflare` aparecem na resposta.

DNS only (nuvem cinza):

- O nome resolve direto para o destino declarado.
- Não há cache, regra ou ocultação de origem.
- Obrigatório para protocolo não HTTP.

Critério de decisão:

| Tráfego | Proxy | Motivo |
| --- | --- | --- |
| Site e API HTTP/HTTPS | ligado | Cache, TLS, WAF e origem oculta |
| WebSocket | ligado | Suportado no plano atual |
| SMTP, IMAP, SSH, banco | desligado | Protocolo não HTTP não passa pelo proxy |
| Serviço interno | desligado e privado, ou Tunnel | Não expor porta na internet |

## TLS e certificado

```bash
dig +short app.example.com A
curl -sI https://app.example.com
curl -sv https://app.example.com 2>&1 | grep -E "subject|issuer|expire"
```

- Confira o modo efetivo da zona. Full (strict) é a recomendação do especialista
  (regra da casa). Strict (SSL-Only Origin Pull) exige HTTPS validado até a origem
  mesmo quando o visitante chega por HTTP.
- Na borda, confira a cobertura do certificado para cada hostname, inclusive
  nomes com mais de um nível de subdomínio. O certificado instalado na origem
  vale para o trecho entre a Cloudflare e o servidor.
- Na origem, instale certificado de servidor válido para o nome. Use CA pública
  aceita ou Cloudflare Origin CA. Para CA privada, configure o Custom Origin
  Trust Store da Cloudflare, quando disponível. Validação estrita pode retornar
  526 se o certificado da origem expirar.
- Para a origem exigir autenticação da Cloudflare por certificado de cliente,
  configure AOP e habilite a verificação no servidor.
- `Always Use HTTPS` redireciona HTTP para HTTPS na borda. Confira separadamente
  TLS até a origem. Use Certificate Transparency para monitorar emissão e CAA
  para restringir as CAs autorizadas.

## Redirecionamento e cabeçalho

- Redirect Rule trata URL: origem, destino, status (`301` permanente, `302`
  temporário) e preservação de caminho e query.
- Bulk Redirect serve lista grande de URL antiga para nova, com controle de
  versão da lista.
- Transform Rule altera cabeçalho de requisição ou resposta, como
  `X-Frame-Options` e `Content-Security-Policy`.
- Regra de página (Page Rule) ainda existe, mas o conjunto atual é Redirect,
  Transform, Cache e Configuration Rule. Escolha pelo efeito, não pelo nome
  antigo.
- Cuidado com laço: origem que redireciona para HTTPS somada a `Always Use HTTPS`
  e modo Flexible produz `ERR_TOO_MANY_REDIRECTS`.

## Tomada de subdomínio

1. Liste registros e destinos no painel DNS ou pela
   [API de registros da zona](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/list/),
   percorrendo todas as páginas.
2. Compare CNAMEs e IPs com o inventário de recursos da equipe e do provedor.
   Retire o registro antes de liberar um destino desativado.
3. Use `dig` para verificar a resposta pública. Proxy ou flattening pode
   devolver A/AAAA sem revelar o CNAME configurado.

## CAA e DNSSEC

```bash
dig example.com CAA +short
dig +dnssec example.com DNSKEY
dig +dnssec example.com DS
delv example.com A
```

- CAA mínimo:

```text
example.com. CAA 0 issue "letsencrypt.org"
example.com. CAA 0 issue "pki.goog"
example.com. CAA 0 iodef "mailto:security@example.com"
```

- Incluir as CAs que emitem para a zona, incluindo a que a Cloudflare usa em
  Universal SSL, quando aplicável. CAA errado bloqueia renovação e o certificado
  expira sem aviso.
- Para ativar, habilite a assinatura na Cloudflare, obtenha o DS gerado e
  publique esse DS no registrador. Se a publicação for automática, aguarde.
  Compare DS e DNSKEY e confirme a cadeia com um resolvedor validador.
- Para migrar com DNSSEC ativo, use o
  [procedimento oficial](https://developers.cloudflare.com/dns/dnssec/) de
  multi-signer se o provedor atual aceitar DNSKEY externa. Na migração sem
  multi-signer, remova o DS antigo no registrador mantendo a assinatura e os
  nameservers antigos. Espere expirar o TTL do DS na zona pai e confirme sua
  retirada antes de trocar os nameservers. Após expirar também o TTL dos NS
  antigos, habilite DNSSEC na Cloudflare e publique o novo DS.
- Para desativar, retire primeiro o DS (ou siga o fluxo do Cloudflare Registrar),
  mantenha a assinatura durante todo o TTL do DS na zona pai e só depois
  desligue a assinatura. Um DS órfão ou em cache pode causar `SERVFAIL`.

## Verificação de mudança

```bash
dig +trace example.com
dig @1.1.1.1 example.com A
dig @8.8.8.8 example.com A
```

- Compare resposta de resolvedor público com o esperado. Cache antigo pode
  sustentar registro removido por tempo igual ao TTL anterior.
- Confirme status HTTP, cabeçalho de cache (`cf-cache-status`) e `cf-ray` em
  requisição real.
- Teste subdomínio, apex e `www` separadamente. Regra aplicada a um não alcança o
  outro.
- Em migração de origem, baixe o TTL com antecedência se o registro e o plano
  permitirem. Aguarde o TTL anterior antes da troca e valide a resposta antes
  de retirar o destino antigo.
