# Lentes de revisão especializadas

Use as três lentes depois da validação estrutural e antes de promover um gate.
Elas produzem achados; não alteram requisitos nem tomam decisões pelo usuário.

## Produto e engenharia (`PROD`)

- finalidade, valor e métrica continuam coerentes;
- escopo e solução não escondem uma necessidade diferente;
- falhas, limites e custo operacional possuem comportamento observável;
- o plano é implementável sem hipótese material não confirmada.

## Arquitetura (`ARCH`)

- princípios da seção 4 aparecem no desenho das seções 8–10;
- caminhos e fronteiras declarados correspondem ao repositório;
- dependências não atravessam camadas ou ownership sem decisão;
- dados, contratos, rollback e compatibilidade estão decididos;
- a implementação não introduz deriva em relação ao plano aprovado.

## Segurança (`SEC`)

A profundidade é proporcional a dinheiro, autorização, privacidade,
irreversibilidade e superfície externa. Verifique:

- autenticação, autorização por recurso e isolamento;
- classificação, retenção, logs e exposição de dados;
- fronteiras de confiança, validação de entrada e output encoding;
- segredos, dependências, abuso, rate limit e disponibilidade;
- auditoria, revogação, rollback e resposta a falha.

## Contrato do achado

Registre na seção 13:

```text
- **FIND-ARCH-001** [P1] [Open] descrição — Refs: FR-001 — Evidence: path:line — Effect: efeito — Suggestion: correção
```

- Lenses: `PROD`, `ARCH`, `SEC`.
- Severidades: `P1`, `P2`, `P3`.
- Estados: `Open`, `Resolved`, `Accepted`.
- IDs são únicos; `Refs` devem existir na spec e `Evidence` deve apontar para
  arquivo local existente dentro da raiz do projeto.
- `P1 Open` bloqueia o gate.
- `Accepted` exige decisão registrada; `Resolved` exige evidência da correção.

Valide com:

```bash
node .agents/skills/specsfy-04-validate/scripts/review_findings.mjs \
  specs/<estado>/<NNNN>-<slug>/spec.md
```
