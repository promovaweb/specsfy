# Segurança de Aplicações

O especialista Segurança de Aplicações orienta o agente na modelagem de ameaças
e na revisão de segurança de aplicações e APIs. A revisão percorre a
autenticação e a autorização, as entradas externas, as dependências e os
segredos. A proteção declarada só vale com um teste que comprove o controle.

## Quando usar

- A mudança cria ou altera um limite de confiança, uma identidade, uma entrada
  externa (upload, URL, query, desserialização) ou dados sensíveis.
- Uma nova funcionalidade abre superfície de ataque, como um endpoint público,
  uma integração ou um novo tipo de usuário, com a modelagem de ameaças
  ainda no planejamento.
- O acesso por linha ou por tenant depende do banco. Combine com os
  especialistas PostgreSQL ou Supabase.

Credenciais de pipeline e de deploy ficam com o especialista Engenharia de
Entrega. Este guia trata da aplicação e das informações que ela guarda.

## Como ele trabalha

1. Levanta ativos, atores, limites de confiança, entradas externas e efeitos
   de cada operação.
2. Define as ameaças plausíveis e o impacto de cada uma. O agente escolhe os
   controles depois dessa etapa e evita defesas para ameaças inexistentes no
   sistema.
3. Verifica autenticação, autorização por objeto e separação de tenants em
   toda operação que lê ou altera registros.
4. Valida cada entrada pelo tipo, pelo tamanho e pelo destino esperado.
   Também protege operações de escrita contra replay e CSRF.
5. Revisa segredos, criptografia em trânsito e em repouso, sessões,
   dependências vulneráveis e a configuração de produção.
6. Cria testes positivos para o fluxo autorizado e testes negativos para o
   fluxo não autorizado.
7. Registra a exposição que permanece, o responsável, o sinal de
   observabilidade associado e o plano de resposta.

## Padrões aplicados

- O acesso começa negado e cada identidade recebe o menor privilégio
  necessário.
- A autorização acontece no servidor, em cada operação e em cada objeto. Um ID
  vindo do cliente passa por nova conferência de propriedade e tenant.
- Upload, URL informada, template com conteúdo externo, query dinâmica e
  desserialização são tratados como entradas hostis por padrão.
- A criptografia usa bibliotecas estabelecidas. Segredos, tokens e senhas
  ficam fora dos logs, inclusive em debug.
- Credenciais são rotacionadas, com preferência por tokens de curta duração.
- O rate limit considera o usuário, a API key ou o tenant, além do IP.
- Cada vulnerabilidade corrigida ganha um teste de regressão.

## Erros que ele evita

- Proteger a rota `/admin/*` e esquecer o objeto acessado dentro dela, o que
  permite trocar o ID na URL e ler registros de outro tenant (IDOR).
- Validar a entrada somente no navegador.
- Confiar no `Content-Type` ou na extensão informados pelo cliente para tratar
  um upload.
- Registrar no log o payload completo de uma requisição com token.
- Anunciar uma vulnerabilidade como corrigida sem um teste negativo do vetor
  original.

## Como conferir o resultado

- Testes negativos para acesso sem autenticação, com identidade errada, com
  tenant errado e com replay de uma requisição já processada.
- Análise de dependências vulneráveis e varredura de segredos com as
  ferramentas do projeto, dentro do fluxo normal de entrega.
- Headers de segurança (`Content-Security-Policy`,
  `Strict-Transport-Security`), cookies com `HttpOnly`, `Secure` e `SameSite`
  e CORS restrito às origens necessárias.
- Comprovação de cada controle declarado e registro da exposição restante.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-application-security \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Servidor](server.md) e [Docker](docker.md) aplicam o hardening do host e do
  runtime.
- [Laravel](laravel.md) e [Next.js](nextjs.md) implementam as superfícies da
  aplicação.
- [Code Review](code-review.md) faz a revisão ampla da mudança.
- [Observabilidade](observability.md) registra sinais de abuso sem expor
  informações sensíveis.
- [PostgreSQL](postgres.md) e [Supabase](supabase.md) modelam o acesso por
  linha e por tenant.
- [Entrega](delivery.md) protege credenciais de pipeline e a cadeia de
  suprimentos.
- [Arquitetura](architecture.md) revisa a exposição que vem do contrato HTTP.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-application-security/SKILL.md),
com checklist de ameaças por limite de confiança, ASVS e cadeia de
suprimentos no arquivo de referência da mesma pasta.
