# WAF, rate limiting, Access e Tunnel

## Escolher o controle

| Objetivo | Controle | Não resolve |
| --- | --- | --- |
| Bloquear padrão de ataque conhecido | Regras gerenciadas da WAF | Abuso de volume legítimo |
| Bloquear requisição específica | Regra personalizada | Ataque distribuído com assinatura variável |
| Conter abuso de volume | Rate limiting | Ataque lento e distribuído abaixo do limite |
| Restringir acesso por identidade | Zero Trust Access | Tráfego de máquina sem identidade |
| Expor serviço sem IP público | Tunnel | Autorização dentro da aplicação |
| Autenticar origem | Authenticated Origin Pulls ou mTLS | Autorização de usuário final |

## WAF

Regra personalizada usa a linguagem de expressão do produto:

```text
(http.request.uri.path contains "/wp-login.php"
  or http.request.uri.path contains "/xmlrpc.php")
and ip.geoip.country ne "BR"
```

```text
http.host eq "admin.example.com"
and not ip.src in {203.0.113.0/24 198.51.100.10}
```

- Ação: `block`, `managed_challenge`, `js_challenge`, `log` ou `skip`. Regra nova
  começa em `log`.
- Regras gerenciadas cobrem família de ataque conhecida e recebem atualização do
  provedor. Ajuste por exceção documentada, não desligando o conjunto.
- Ordem importa: regra de `skip` pode desativar avaliação posterior. Registre o
  motivo de cada exceção.
- Campos comuns: `ip.src`, `ip.geoip.country`, `http.host`,
  `http.request.method`, `http.request.uri.path`, `http.request.headers[...]`,
  `http.user_agent`, `cf.threat_score`.
- Não confie em cabeçalho que o cliente controla, como `X-Forwarded-For`, para
  decisão de segurança. `ip.src` no edge é o valor confiável.
- Regra que bloqueia caminho de API precisa considerar cliente legítimo que usa
  o mesmo caminho. Amostra de log antes de bloquear evita surpresa.

## Rate limiting

```text
http.request.method eq "POST"
and http.request.uri.path eq "/api/login"
```

- Característica de contagem define o que agrupa: IP, cabeçalho de API key,
  caminho, cookie de sessão.
- Contagem por IP sozinho pune escritório atrás de NAT. Combine com caminho e
  método, ou com credencial quando existir.
- Janela e tempo de mitigação são declarados. Mitigação curta reduz bloqueio de
  cliente legítimo; longa aumenta contenção de abuso.
- Resposta de bloqueio informa status e corpo previsível para o cliente tratar.
- Rate limit em webhook de terceiro precisa de exceção ou de limite maior, senão
  a integração falha em pico legítimo.
- Não aplique regra ampla em `/*` sem medir tráfego real: asset estático e imagem
  consomem a mesma cota da API.

## Bot

- Bot score varia de 1 a 99; quanto menor, mais suspeito. O valor é sinal, não
  veredito.
- `cf.bot_management.score lt 30` com `managed_challenge` é ponto de partida
  comum em formulário público.
- Verificado como bot conhecido não significa bloqueio automático: monitor de
  disponibilidade e crawler legítimo também são bot.
- Turnstile resolve desafio em formulário próprio, sem exigir página inteira de
  desafio.
- Bloqueio por user agent é frágil: o cliente escolhe o valor. Use como sinal
  combinado, nunca como única regra.

## Zero Trust Access

- Aplicação protege hostname, caminho ou domínio inteiro.
- Política tem `include`, `require` e `exclude` com identidade, grupo, domínio de
  e-mail, país, IP ou service token.
- `require` soma condição; `include` é alternativa. Política só com `include`
  amplo deixa passar mais do que o esperado.
- Service token autentica máquina sem navegador, com `CF-Access-Client-Id` e
  `CF-Access-Client-Secret`. Token em log é credencial vazada.
- Sessão tem duração. Painel administrativo não usa sessão de dias sem reavaliar
  dispositivo.
- Todo hostname do mesmo serviço precisa da mesma política. Painel protegido com
  API aberta no mesmo domínio é acesso contornado.

## Tunnel

```yaml
tunnel: app-prod
credentials-file: /etc/cloudflared/app-prod.json

ingress:
  - hostname: app.example.com
    service: http://app:8080
  - hostname: admin.example.com
    service: http://admin:8080
  - service: http_status:404
```

```bash
cloudflared tunnel ingress validate
cloudflared tunnel run app-prod
cloudflared tunnel --loglevel debug run app-prod
```

- Última regra sem `hostname` captura o resto. Sem ela, hostname não declarado
  recebe erro genérico ou é servido pelo primeiro destino.
- `cloudflared` abre conexão de saída e dispensa porta de entrada na origem. Não
  publique a aplicação no host ao mesmo tempo.
- Token do túnel em Docker vai por arquivo ou variável protegida, nunca no
  `compose.yml` versionado.
- Healthcheck do túnel e do serviço de origem são diferentes: túnel conectado não
  prova aplicação respondendo.
- Túnel com credencial em arquivo exige permissão restrita e rotação definida.
- Aplicação atrás do túnel ainda precisa de autenticação e autorização próprias.
  Tunnel não é controle de acesso de usuário.

## Origem protegida

- Authenticated Origin Pulls usa certificado de cliente entre Cloudflare e
  origem, com validação no servidor.
- mTLS com CA própria permite regra por certificado e rotação controlada.
- Firewall da origem aceita apenas faixa da Cloudflare quando o proxy está
  ligado. Faixa publicada muda, então prefira autenticação de origem a lista de
  IP.
- Cabeçalho secreto sozinho não é autenticação forte: quem descobre o valor
  reproduz.

## Token de API

- Token é criado por escopo: zona específica, permissão específica, validade
  definida.
- Token global só em operação manual e auditada, nunca em pipeline.
- Guarde em secret do repositório ou cofre, com rotação e registro de quem usa.
- `wrangler` aceita `CLOUDFLARE_API_TOKEN`; confirme a conta com `wrangler whoami`
  antes de qualquer comando que escreve.

## Validação

- Regra em `log` por janela declarada, com contagem de disparo e amostra de
  requisição legítima que seria afetada.
- Teste de bloqueio com requisição controlada, confirmando status, corpo e
  ausência de efeito em cliente legítimo.
- Teste de rate limiting com laço controlado, verificando bloqueio e recuperação
  após a janela.
- `curl -i` no hostname protegido sem credencial, confirmando desafio do Access.
- `curl -i` no mesmo hostname com service token, confirmando acesso.
- `cloudflared tunnel ingress validate` e `cloudflared tunnel --loglevel debug`
  antes de remover o acesso antigo.
- `curl -I` na origem por IP público, confirmando que ela não responde fora da
  Cloudflare.
- Não declare borda protegida sem essas evidências; painel sem disparo é
  configuração não testada.
