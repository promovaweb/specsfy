---
name: specsfy-specialist-application-security
description: "Modelar ameaças e revisar segurança de aplicações, APIs, autenticação, autorização, dados, dependências, secrets e infraestrutura. Use para mudanças com trust boundaries, identidade, entrada externa, dados sensíveis ou revisão de segurança; use também para threat modeling antes de uma feature com nova superfície de ataque; não declare segurança sem evidência, e para hardening de pipeline/credenciais de deploy use `$specsfy-specialist-delivery-engineering`."
---

# Segurança de aplicações

## Quando usar

- Acionar quando a mudança introduz ou toca trust boundary, identidade,
  entrada externa (upload, URL, query, deserialize) ou dado sensível.
- Acionar também antes de desenhar uma feature com superfície de ataque nova
  (novo endpoint público, nova integração, novo tipo de usuário) para fazer
  threat modeling preventivo.
- Não acionar como substituto de revisão de credenciais de pipeline/deploy —
  usar `$specsfy-specialist-delivery-engineering` para isso; aqui o foco é a
  aplicação e seus dados, não a esteira de entrega.
- Combinar com `$specsfy-specialist-postgres`/`$specsfy-specialist-supabase`
  quando o risco envolve modelagem de acesso a dado por linha ou tenant.

## Fluxo

1. Mapear ativos, atores, trust boundaries, entradas externas e efeitos
   (o que muda de estado) antes de pensar em controle.
2. Definir ameaças plausíveis e seu impacto real antes de escolher
   controles — não implementar defesa para uma ameaça que não existe no
   contexto do sistema.
3. Verificar autenticação, autorização por objeto (não só por rota) e
   separação de tenants em toda operação que lê ou muta dado.
4. Validar toda entrada pelo tipo, tamanho e destino esperado; normalizar
   saída conforme o contexto de renderização; proteger operações mutáveis
   contra replay e CSRF quando aplicável.
5. Revisar gestão de secrets, criptografia em trânsito e em repouso,
   ciclo de vida de sessão, dependências vulneráveis e configuração de
   produção.
6. Materializar testes positivos (fluxo autorizado funciona) e negativos
   (fluxo não autorizado falha) nos boundaries críticos identificados.
7. Registrar risco residual, owner, sinal de observabilidade associado e
   plano de resposta — nenhum sistema fica "100% seguro", apenas com risco
   conhecido e monitorado.

## Padrões

- Negar por padrão e conceder o menor privilégio necessário para cada
  identidade e operação.
- Autorizar no servidor em toda operação e em todo objeto acessado — nunca
  confiar em uma verificação apenas client-side ou em um ID de objeto vindo
  do cliente sem revalidar propriedade/tenant.
- Tratar upload de arquivo, URL fornecida pelo usuário, template
  renderizado com dado externo, query dinâmica e deserialização de dado
  externo como entradas hostis por padrão.
- Não implementar criptografia própria; usar primitivas e bibliotecas
  estabelecidas. Nunca logar segredo, token, senha ou dado sensível, mesmo
  em ambiente de debug.
- Rotacionar credenciais periodicamente e preferir identidade temporária
  (tokens de curta duração, STS/OIDC) a segredo estático de longa duração.
- Mitigar abuso com limites por ator e por recurso (rate limit por usuário/
  API key/tenant), não apenas por IP — um IP compartilhado (NAT, proxy)
  penaliza usuários legítimos e um atacante distribuído contorna limite
  só por IP.
- Ao corrigir uma vulnerabilidade, corrigir a causa raiz e adicionar teste
  de regressão, sem divulgar detalhe de exploração além do necessário para
  quem precisa corrigir ou validar.

## Antipadrões

- Verificar autorização apenas pela rota (`/admin/*` protegido) sem verificar
  o objeto específico acessado dentro da rota: um usuário autenticado como
  tenant A consegue acessar `/api/orders/123` de um tenant B só trocando o
  ID na URL (IDOR — Insecure Direct Object Reference).
- Validar entrada só no client (JavaScript no navegador) sem revalidar no
  servidor: qualquer requisição direta à API contorna completamente a
  validação client-side.
- Confiar em `Content-Type` ou extensão de arquivo declarados pelo cliente
  para decidir como processar um upload: permite disfarçar um arquivo
  malicioso como um tipo inofensivo.
- Guardar segredo de aplicação (chave de API, senha de banco) em variável de
  ambiente sem controle de acesso ao processo/log, ou logar o payload
  completo de uma requisição que contém token de autenticação — o segredo
  vaza por um canal indireto mesmo com o "cofre" correto na origem.
- Anunciar "sistema seguro" ou "vulnerabilidade corrigida" sem teste
  negativo específico comprovando que o vetor original não funciona mais.

## Validação

- Casos de teste negativos: acesso sem autenticação, com identidade errada,
  com tenant errado e replay de uma requisição já processada — todos devem
  falhar de forma controlada.
- Análise de dependências vulneráveis e varredura de secrets vazados com as
  ferramentas já adotadas pelo projeto, rodada como parte do fluxo normal,
  não apenas manualmente antes de um release grande.
- Configuração segura de produção: headers de segurança (ex.:
  `Content-Security-Policy`, `Strict-Transport-Security`), atributos de
  cookie (`HttpOnly`, `Secure`, `SameSite`) e política de CORS restrita à
  origem realmente necessária.
- Evidência concreta de cada controle reivindicado e do risco residual que
  permanece — nunca declarar algo "seguro" em linguagem absoluta sem o teste
  que comprova.

## Skills relacionadas

- `$specsfy-specialist-ansible` e `$specsfy-specialist-docker` implementam
  hardening de host, container e runtime; esta skill define ameaça, privilégio
  e controle que a configuração precisa provar.
- `$specsfy-specialist-laravel`, `$specsfy-specialist-nextjs` e
  `$specsfy-specialist-shadcn-ui` implementam superfícies de aplicação;
  autorização, validação server-side e exposição de dados permanecem aqui.
- `$specsfy-specialist-code-review` aplica a revisão ampla e
  `$specsfy-specialist-observability` registra sinais de abuso sem vazar dados
  sensíveis.
- `$specsfy-specialist-postgres` e `$specsfy-specialist-supabase` para
  modelagem de autorização por linha/tenant no nível de dado (RLS,
  constraints).
- `$specsfy-specialist-rls-review` para atacar e provar o isolamento entre
  tenants dentro do banco, depois que a modelagem de autorização por linha
  estiver escrita.
- `$specsfy-specialist-delivery-engineering` para hardening de credenciais
  de pipeline, assinatura de artefato e supply chain.
- `$specsfy-specialist-web-api-design` quando o risco nasce do desenho do
  contrato de API (verbos, versionamento, exposição de campo sensível).

Leia [references/standards.md](references/standards.md) para checklist de
threat modeling por boundary, ASVS, segurança de API e supply chain, com
fontes primárias.
