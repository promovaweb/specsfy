# Padrões e referências de segurança

Revisado em 2026-11-20 contra: OWASP ASVS 5.0.0 (publicada em 30/05/2025),
OWASP Top 10:2025, OWASP API Security Top 10:2023, OWASP Cheat Sheet Series,
NIST SP 800-63-4 (final de julho de 2025), NIST SSDF (SP 800-218), SLSA v1.2,
OpenSSF, gitleaks 8.2x ou posterior (comandos `git`/`dir`) e Semgrep CLI atual.

## Threat modeling: perguntas por categoria (STRIDE)

| Categoria | Pergunta central | Controle típico |
|---|---|---|
| Spoofing | O ator é quem afirma ser? | Autenticação forte, MFA |
| Tampering | O dado foi alterado em trânsito ou repouso? | Integridade, assinatura, constraints de banco |
| Repudiation | É possível provar quem fez o quê? | Log auditável, não repudiável |
| Information disclosure | Um ator vê dado que não deveria? | Autorização por objeto, minimização de dado |
| Denial of service | Um ator pode indisponibilizar o serviço? | Rate limit por ator/recurso, timeout, backpressure |
| Elevation of privilege | Um ator ganha permissão além da concedida? | Autorização no servidor, negar por padrão |

Use como checklist ao desenhar uma feature nova: para cada trust boundary
identificado, pergunte as seis categorias antes de implementar o controle.

## Checklist por boundary

- **Identidade**: emissão, expiração, revogação e recuperação de credencial;
  MFA para operações de alto risco; nunca reutilizar identificador de sessão
  após elevação de privilégio (login, troca de senha) sem regenerar o token.
  Rotacione segredo estático por compromisso, troca de tecnologia ou política
  do provedor, não por calendário cego: para senha memorizada, NIST SP 800-63B
  e OWASP não recomendam troca periódica obrigatória, que empurra o usuário
  para padrões previsíveis.
- **Autorização**: verificar função, objeto específico, tenant, campo e
  ação — autorização por rota sozinha não cobre IDOR; toda referência a
  objeto vinda do cliente precisa de checagem de propriedade no servidor.
- **Entrada**: validar tamanho, formato, encoding e destino esperado;
  considerar o custo de processar a entrada (proteção contra payload que
  força processamento caro, como decompression bomb ou regex catastrófico).
- **Dados**: classificar por sensibilidade, minimizar coleta e retenção,
  definir backup e exclusão compatíveis com a classificação — dado que não
  existe não pode vazar.
- **Operação**: gestão de secrets com rotação, logs sem dado sensível,
  alertas de segurança com owner, patching de dependência em cadência
  definida, plano de resposta a incidente sem cultura de culpa individual.

## Aplicação web (OWASP Top 10:2025, categorias que mudaram)

- **A01 Broken Access Control**, **A02 Security Misconfiguration** e **A04
  Cryptographic Failures** continuam no topo da lista e cobrem o que a
  verificação por boundary já trata.
- **A03 Software Supply Chain Failures** entrou como categoria própria: a
  cadeia de dependência, build e distribuição passa a ser superfície de ataque
  de primeira linha, não apêndice de operação.
- **A05 Injection** concentra XSS (CWE-79, alta frequência e impacto menor por
  caso) e SQL injection (baixa frequência e alto impacto), além de NoSQL,
  comando de sistema, ORM, LDAP e expression language. A regra não muda:
  separar dado de comando e codificar conforme o contexto de saída. Injeção de
  prompt em aplicação com LLM é tratada em separado, no OWASP LLM Top 10
  (LLM01:2025).
- **A09 Security Logging and Alerting Failures**: log sem sinal não prova nada;
  o que falha é o alerta e a resposta, não só o registro.
- **A10 Mishandling of Exceptional Conditions**: erro mal tratado vira bypass,
  falha aberta ou vazamento. Toda exceção precisa de resultado definido e testado.

## Segurança de API (OWASP API Security Top 10:2023)

- **API1:2023 Broken Object Level Authorization (BOLA/IDOR)**: falha mais
  comum em APIs — todo endpoint que recebe um ID de objeto deve revalidar que o
  ator autenticado tem direito sobre aquele objeto específico, não apenas sobre
  a operação em geral.
- **API2:2023 Broken Authentication**: tokens sem expiração adequada, refresh
  token sem rotação, endpoints de autenticação sem rate limit contra força
  bruta.
- **API3:2023 Broken Object Property Level Authorization**: reúne exposição
  excessiva de dado e mass assignment. Retornar o objeto interno completo e
  deixar o cliente decidir o que exibir expõe campo sensível que a UI nunca
  deveria ter recebido; aceitar o objeto inteiro do cliente permite alterar
  campo que o ator não pode mudar.
- **API4:2023 Unrestricted Resource Consumption**: falta de limite por ator,
  recurso e operação permite abuso de busca, exportação ou envio de e-mail por
  quem está autenticado e troca de IP ou está atrás de NAT compartilhado.
- **API5:2023 Broken Function Level Authorization** e **API6:2023 Unrestricted
  Access to Sensitive Business Flows**: papel sem permissão alcança função
  administrativa, e fluxo de negócio sensível (compra, reserva, cadastro) pode
  ser automatizado em escala.
- **API7:2023 Server Side Request Forgery**, **API9:2023 Improper Inventory
  Management** e **API10:2023 Unsafe Consumption of APIs**: URL fornecida pelo
  usuário alcança rede interna, versão antiga de endpoint continua exposta sem
  dono, e dado de terceiro é consumido sem validar contrato e origem.

## Supply chain e dependências

- Analisar dependências com ferramenta de SCA (Software Composition
  Analysis) integrada ao pipeline, não apenas manualmente antes de release.
- Verificar secrets vazados no histórico do repositório com scanner
  dedicado, incluindo commits antigos, não só o estado atual.
- Gerar SBOM no build (CycloneDX ou SPDX) e, quando o projeto adotar,
  proveniência de build no SLSA (especificação vigente v1.2, trilhas Build e
  Source) para rastrear a origem de um artefato publicado.
- Tratar dependência e ação de CI como código executável de terceiro: versão
  fixada, origem verificada e atualização com revisão de changelog.

## Comandos de verificação (exemplos por ecossistema)

```bash
# Dependências vulneráveis (SCA) — escolha conforme o ecossistema do projeto
npm audit --audit-level=high
pip-audit
trivy fs --scanners vuln,secret,misconfig .

# Secrets vazados no histórico completo do repositório, não só no HEAD
# (gitleaks 8.19+ substituiu `detect`/`protect` por `git`, `dir` e `stdin`)
gitleaks git --log-opts="--all" .

# SAST genérico com regras da comunidade
semgrep scan --config auto .
```

O gitleaks está em manutenção: recebe correções de segurança e não recebe
recurso novo. Manter o binário atualizado e conferir as regras antes de confiar
no resultado. Trate esses comandos como ponto de partida: confirme qual scanner
o projeto já usa (arquivo de config, CI existente) antes de sugerir uma
ferramenta nova, e nunca declare "sem vulnerabilidade" só porque um scanner
não encontrou nada — scanners têm falso negativo, sobretudo para lógica de
autorização específica do domínio.

## Fontes primárias

- OWASP ASVS 5.0.0 (checklist de verificação por nível de rigor; os capítulos
  foram reorganizados na versão 5, então cite o requisito com o prefixo da
  versão, como `v5.0.0-1.2.5`):
  https://owasp.org/www-project-application-security-verification-standard/
- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP LLM Top 10 (aplicações com modelo de linguagem):
  https://genai.owasp.org/llm-top-10/
- OWASP API Security Top 10:2023: https://owasp.org/API-Security/
- OWASP Cheat Sheet Series (guia prático por tópico):
  https://cheatsheetseries.owasp.org/
- OWASP Threat Modeling (incluindo STRIDE):
  https://owasp.org/www-community/Threat_Modeling
- Threat Modeling Manifesto: https://threatmodelingmanifesto.org/
- NIST SSDF (SP 800-218): https://csrc.nist.gov/Projects/ssdf
- NIST Digital Identity Guidelines, SP 800-63-4 (final, 2025):
  https://pages.nist.gov/800-63-4/
- SLSA v1.2: https://slsa.dev/spec/v1.2/
- OpenSSF (supply chain e boas práticas): https://openssf.org/
- gitleaks (detecção de secret): https://github.com/gitleaks/gitleaks
- Semgrep CLI: https://semgrep.dev/docs/cli-reference
