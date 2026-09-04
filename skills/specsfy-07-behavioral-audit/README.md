# specsfy-07-behavioral-audit

Gate complementar — roda **depois** do `specsfy-06-tdd-bdd/check_traceability.mjs`
e **antes** de marcar `Delivery Gate: Passed`.

## Por quê

Os gates 04/05/06 confirmam *cobertura documental*: cada FR/AC tem pelo menos
N testes com o marcador `SPECSFY:` apontando pra ele. Isso nunca checou se o
teste prova o comportamento certo. Nesta sessão de revisão isso deixou passar,
sem nenhum gate acusar:

- healthcheck com `|| exit 0` (nunca falha de verdade) — NFR-001 "coberto"
- criptografia simétrica AES onde a spec exigia GPG assimétrico — FR-004 "coberto"
- resposta de SEFAZ (`cStat 100`) hardcoded dentro do serviço, sem client de
  transporte real — 3 gates `READY`
- fallback silencioso de backup sem criptografia se a chave GPG estivesse
  ausente — nenhum GAP acusado
- testes de Auth/Settings inteiros deletados numa faxina de "scaffold legado"
  — suíte continuou "100% verde"

Todos esses só apareceram pedindo o diff/output bruto na mão. Este script
tenta automatizar a primeira triagem disso.

## O que faz

1. Lê a spec, extrai os requisitos (`**FR-XXX**: texto...`) e marca como
   **sensível** qualquer um cujo texto bata com uma lista de palavras-chave
   (segurança, dinheiro/fiscal, prazo legal, integração externa,
   infraestrutura crítica — ver `SENSITIVE_KEYWORDS` no script).
2. Varre os arquivos de teste do diretório informado, associa cada método ou closure
   de teste (PHPUnit e Pest) aos IDs no seu bloco `SPECSFY:`.
3. Para cada requisito sensível, verifica se pelo menos um teste vinculado
   exercita um "caminho triste" (exceção, status 4xx/5xx, `assertFalse`,
   `toThrow`, validação de erro) e se os testes não são apenas checagens rasas
   (`assertFileExists`, `assertTrue(true)`, poucas asserções).
4. Emite `RESULTADO: PASS` ou `RESULTADO: WARNINGS` — **nunca bloqueia
   sozinho**. É sinal pra revisão humana (ou de outro agente), não um gate
   duro como os 04/05/06.

## Uso

```bash
node .agents/skills/specsfy-07-behavioral-audit/scripts/behavioral_audit.mjs \
  specs/completed/0006-emissao-fiscal-direta-nfe-nfce-nfse/spec.md \
  tests/Feature/Fiscal \
  --min-sad-path 1
