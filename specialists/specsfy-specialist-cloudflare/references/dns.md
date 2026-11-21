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
- `TTL` automático de 300 segundos em registro proxiado é o padrão. Valor baixo
  ajuda transição, alto reduz consulta; o proxy já responde pelo nome de borda.

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

- Full (strict) é o padrão: a origem tem certificado válido para o nome.
- Certificado de origem emitido pela Cloudflare tem validade de anos e é
  instalado no servidor de origem, não no painel.
- Certificado de CA própria exige instalar a CA no pacote de confiança da
  origem quando a validação é estrita.
- `Always Use HTTPS` redireciona HTTP para HTTPS na borda. Sem Full (strict),
  isso só troca o trecho visível.
- Certificate Transparency e CAA limitam emissão indevida.
- Certificado expirado na origem com Full (strict) retorna erro 526. Monitore a
  data de expiração como serviço crítico.

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

1. Liste CNAME da zona:

```bash
dig +short app.example.com CNAME
dig +short status.example.com CNAME
```

2. Confirme se o destino ainda pertence ao projeto.
3. Remova registro que aponta para serviço desativado. Enquanto o CNAME existir,
   quem registrar o nome de destino controla o conteúdo servido no seu
   subdomínio.
4. Revise também registro `A` para IP que saiu do inventário.

## CAA e DNSSEC

```bash
dig example.com CAA +short
dig example.com DNSKEY +short
dig example.com DS +short
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
- DNSSEC assina a zona. Ative só com o DS publicado no registrador e confirme a
  cadeia antes de considerar concluído.
- Chave de DNSSEC perdida ou removida sem atualizar o DS derruba a resolução do
  domínio inteiro.

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
- Em migração de origem, mude o registro com TTL baixo antes, valide, e só depois
  remova o destino antigo.
