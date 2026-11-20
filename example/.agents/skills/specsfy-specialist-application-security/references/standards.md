# Padrões e referências de segurança

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

## Segurança de API (OWASP API Security Top 10, categorias recorrentes)

- **Broken Object Level Authorization (BOLA/IDOR)**: falha mais comum em
  APIs — todo endpoint que recebe um ID de objeto deve revalidar que o ator
  autenticado tem direito sobre aquele objeto específico, não apenas sobre
  a operação em geral.
- **Broken Authentication**: tokens sem expiração adequada, refresh token
  sem rotação, endpoints de autenticação sem rate limit contra força bruta.
- **Excessive Data Exposure / falta de filtragem no output**: retornar o
  objeto interno completo e deixar o cliente decidir o que exibir expõe
  campo sensível que a UI nunca deveria ter recebido.
- **Rate limiting ausente ou só por IP**: permite abuso de recurso caro
  (busca, exportação, envio de e-mail) por ator autenticado que rotaciona
  IP ou está atrás de NAT compartilhado.

## Supply chain e dependências

- Analisar dependências com ferramenta de SCA (Software Composition
  Analysis) integrada ao pipeline, não apenas manualmente antes de release.
- Verificar secrets vazados no histórico do repositório com scanner
  dedicado, incluindo commits antigos, não só o estado atual.
- Preferir SBOM gerado no build e, quando o projeto adotar, proveniência de
  build (SLSA) para rastrear a origem de um artefato publicado.

## Comandos de verificação (exemplos por ecossistema)

```bash
# Dependências vulneráveis (SCA) — escolha conforme o ecossistema do projeto
npm audit --audit-level=high
pip-audit
trivy fs .

# Secrets vazados no histórico completo do repositório, não só no HEAD
gitleaks detect --source . --log-opts="--all"

# SAST genérico com regras da comunidade
semgrep --config=auto .
```

Trate esses comandos como ponto de partida: confirme qual scanner o
projeto já usa (arquivo de config, CI existente) antes de sugerir uma
ferramenta nova, e nunca declare "sem vulnerabilidade" só porque um scanner
não encontrou nada — scanners têm falso negativo, sobretudo para lógica de
autorização específica do domínio.

## Fontes primárias

- OWASP ASVS (checklist de verificação por nível de rigor): https://owasp.org/www-project-application-security-verification-standard/
- OWASP Cheat Sheet Series (guia prático por tópico): https://cheatsheetseries.owasp.org/
- OWASP API Security Top 10: https://owasp.org/API-Security/
- OWASP Top 10 (aplicações web): https://owasp.org/www-project-top-ten/
- OWASP Threat Modeling (incluindo STRIDE): https://owasp.org/www-community/Threat_Modeling
- NIST SSDF (ciclo de vida de desenvolvimento seguro): https://csrc.nist.gov/Projects/ssdf
- NIST Digital Identity Guidelines: https://pages.nist.gov/800-63-4/
- OpenSSF (supply chain e boas práticas): https://openssf.org/
