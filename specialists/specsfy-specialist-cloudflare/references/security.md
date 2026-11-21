# WAF, rate limiting, Access e Tunnel

## Escolher o controle

| Objetivo | Controle | Não resolve |
| --- | --- | --- |
| Bloquear padrão de ataque conhecido | Regras gerenciadas da WAF | Abuso de volume legítimo |
| Bloquear requisição específica | Regra personalizada | Ataque distribuído com assinatura variável |
| Conter abuso de volume | Rate limiting | Ataque lento e distribuído abaixo do limite |
| Restringir acesso por identidade | Zero Trust Access | Tráfego de máquina sem identidade |
| Expor serviço sem IP público | Tunnel | Autorização dentro da aplicação |
| Autenticar a Cloudflare perante a origem | Authenticated Origin Pulls (mTLS) | Autorização de usuário final |

## WAF

Regra personalizada usa a linguagem de expressão do produto:

```text
(http.request.uri.path contains "/wp-login.php"
  or http.request.uri.path contains "/xmlrpc.php")
and ip.src.country ne "BR"
```

```text
http.host eq "admin.example.com"
and not ip.src in {203.0.113.0/24 198.51.100.10}
```

- A ação `log` em regras personalizadas exige Enterprise. Quando disponível,
  observe disparos antes de bloquear. Nos demais planos, restrinja a expressão
  ao hostname de staging, teste a ação com requisições legítimas e de controle
  e confira os eventos disponíveis no plano e as respostas HTTP.
- Regras gerenciadas cobrem família de ataque conhecida e recebem atualização do
  provedor. Ajuste por exceção documentada, não desligando o conjunto.
- Ordem importa: regra de `skip` pode desativar avaliação posterior. Registre o
  motivo de cada exceção.
- Campos comuns: `ip.src`, `ip.src.country`, `http.host`,
  `http.request.method`, `http.request.uri.path`, `http.request.headers[...]`,
  `http.user_agent`.
- Não confie em cabeçalho que o cliente controla, como `X-Forwarded-For`, para
  decisão de segurança. `ip.src` no edge é o valor confiável.
- Regra que bloqueia caminho de API precisa considerar cliente legítimo que usa
  o mesmo caminho. Inclua esse cliente no teste antes de bloquear.

## Rate limiting

```text
http.host eq "staging-api.example.com"
and http.request.method eq "POST"
and http.request.uri.path eq "/api/login"
```

- A expressão seleciona quais requisições entram na regra. As características
  de contagem definem quais delas compartilham o contador. Caminho e método no
  filtro reduzem a população, mas clientes atrás do mesmo NAT continuam
  compartilhando a cota quando a característica é IP.
- Confira as [características disponíveis no plano](https://developers.cloudflare.com/waf/rate-limiting-rules/parameters/).
  Quando houver suporte, avalie um identificador de cliente adequado ao
  contrato. Um cabeçalho arbitrário controlado pelo cliente muda a contagem.
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
- `cf.bot_management.score lt 30` requer Bot Management. Avalie o limiar em
  staging antes de usar `managed_challenge` em formulário público.
- Verificado como bot conhecido não significa bloqueio automático: monitor de
  disponibilidade e crawler legítimo também são bot.
- Turnstile entrega um token no formulário. Antes de aceitar o envio, valide o
  token no servidor com POST para
  `https://challenges.cloudflare.com/turnstile/v0/siteverify`, enviando
  `secret` e `response`. Exija `success: true` e confira `hostname` e
  `action` quando esperados. Rejeite falha, token expirado ou reutilizado.
  Veja a [validação Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
- Bloqueio por user agent é frágil: o cliente escolhe o valor. Use como sinal
  combinado, nunca como única regra.

## Zero Trust Access

- Aplicação protege hostname, caminho ou domínio inteiro.
- Política tem `include`, `require` e `exclude` com identidade, grupo, domínio de
  e-mail, país, IP ou service token.
- `require` soma condição; `include` é alternativa. Política só com `include`
  amplo deixa passar mais do que o esperado.
- Para uma rota de máquina, crie política com ação `Service Auth` e regra
  `Include` que selecione o service token específico. O cliente envia
  `CF-Access-Client-Id` e `CF-Access-Client-Secret`. Confira que a chamada
  autorizada chega ao serviço sem login interativo.
- Restrinja rotas administrativas à identidade e sessão previstas. Defina
  separadamente as rotas de máquina e as públicas conforme o contrato. Se um
  provedor de webhook não puder enviar os cabeçalhos do Access, exponha apenas
  a rota necessária em hostname ou caminho dedicado e valide a assinatura
  do provedor na aplicação. Confira aliases e caminhos alternativos do painel.
- Guarde o token no cofre e teste requisições sem credencial e com token de
  outra política. Veja [service tokens](https://developers.cloudflare.com/cloudflare-one/access-controls/service-credentials/service-tokens/).

## Tunnel

### Tunnel gerenciado localmente

Na conta e zona de destino, execute `cloudflared tunnel login` e
`cloudflared tunnel create app-prod`. Copie a credencial JSON gerada para
`/etc/cloudflared/`, com permissão de leitura restrita ao usuário do
`cloudflared`. Substitua o UUID ilustrativo no YAML e no nome do arquivo
pelo UUID real retornado pelo comando. Os serviços `app` e `admin` precisam
ser resolvíveis e atingíveis a partir do processo `cloudflared`.

Salve como `/etc/cloudflared/config.yml`:

```yaml
tunnel: 33333333-3333-4333-8333-333333333333
credentials-file: /etc/cloudflared/33333333-3333-4333-8333-333333333333.json

ingress:
  - hostname: app.example.com
    service: http://app:8080
  - hostname: admin.example.com
    service: http://admin:8080
  - service: http_status:404
```

Valide o arquivo e confira qual regra atende cada URL, incluindo a regra
final obrigatória que captura o restante. Crie a rota DNS de cada hostname
com a credencial de conta do `tunnel login` ou faça isso pelo painel DNS.

```bash
cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate
cloudflared tunnel --config /etc/cloudflared/config.yml ingress rule https://app.example.com/
cloudflared tunnel --config /etc/cloudflared/config.yml ingress rule https://admin.example.com/
cloudflared tunnel --config /etc/cloudflared/config.yml ingress rule https://other.example.com/
cloudflared tunnel route dns app-prod app.example.com
cloudflared tunnel route dns app-prod admin.example.com
cloudflared tunnel --config /etc/cloudflared/config.yml run app-prod
```

Configure também o serviço para usar esse arquivo. Confira a
[criação local](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)
e a
[configuração de ingress](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/configuration-file/).

### Tunnel gerenciado remotamente

Crie o Tunnel no painel, associe cada hostname público ao serviço de origem
e execute `cloudflared tunnel run --token-file /run/secrets/cloudflare_tunnel_token`
com versão que suporte a flag. Guarde o token como segredo e administre as
rotas no painel. Essa implantação usa token e configuração remota. A
implantação local usa UUID, JSON de credencial e configuração local.

Em ambos os casos, o conector abre conexões de saída. Garanta que a aplicação
fique sem porta pública. Teste a conectividade do Tunnel e a resposta de cada
serviço separadamente. A autorização da aplicação continua necessária.

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

- Validação do WAF em staging com requisições controladas. Confira eventos
  disponíveis e, em Enterprise, observe a ação `log` pela janela definida.
- Teste de bloqueio com requisição controlada, confirmando status, corpo e
  ausência de efeito em cliente legítimo.
- Teste de rate limiting com laço controlado, verificando bloqueio e recuperação
  após a janela.
- `curl -i` no hostname protegido sem credencial, confirmando desafio do Access.
- `curl -i` no mesmo hostname com service token, confirmando acesso.
- Valide o arquivo local de ingress e use `ingress rule` para testar cada rota.
  Faça uma requisição pública real antes de retirar o caminho anterior.
- Confirme o firewall e a ausência de porta pública quando usar Tunnel. Se
  houver IP público de origem, teste de uma rede externa com
  `curl --connect-timeout 5 --resolve app.example.com:443:203.0.113.10 https://app.example.com/`,
  substituindo hostname e IP. Assim Host e SNI identificam o vhost correto.
  Compare com o acesso legítimo via borda e confirme a recusa no firewall ou
  na autenticação de cliente. Teste também IPv6 e outras portas expostas, se
  existirem.
- Não declare borda protegida sem essas evidências; painel sem disparo é
  configuração não testada.
