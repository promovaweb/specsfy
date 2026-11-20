# Padrões e referências de prototipação

## Fidelidade por tipo de pergunta

- **Pergunta de estado/lógica** ("essa máquina de estados cobre todas as
  transições?"): terminal ou teste executável que torne as transições e
  invariantes visíveis passo a passo — não precisa de UI nenhuma.
- **Pergunta de integração** ("essa API de terceiro se comporta como
  documentado sob nossa carga?"): spike isolado contra sandbox, ambiente de
  teste do provedor ou fake controlado, nunca contra produção do terceiro
  sem autorização.
- **Pergunta de estrutura de UI** ("esse fluxo de telas resolve a tarefa do
  usuário?"): wireframe navegável com conteúdo realista — fidelidade visual
  baixa, fidelidade de fluxo alta.
- **Pergunta de direção visual** ("qual estilo comunica melhor a marca?"):
  duas ou mais alternativas deliberadamente distintas entre si, nunca
  variações sutis da mesma ideia — variações sutis não discriminam
  preferência real.
- **Pergunta de viabilidade de performance** ("esse mecanismo aguenta a
  carga esperada?"): benchmark mínimo com workload representativo da
  produção real (volume, concorrência, tamanho de payload), não um teste
  sintético arbitrário.

Escolher a fidelidade mais alta que a pergunta não exige é desperdício;
escolher mais baixa que a pergunta exige produz uma resposta que não se
sustenta.

## O que muda entre protótipo e produção

O protótipo deliberadamente pula, até prova em contrário: tratamento de
erro completo, autenticação/autorização real, observabilidade, cobertura de
teste, acessibilidade, compatibilidade entre navegadores/dispositivos e
hardening de segurança. Nenhum desses pode ser assumido como "já resolvido"
só porque o protótipo funcionou — cada um exige o trabalho normal de
produção antes do artefato virar produção.

## Formato de saída do protótipo

Pergunta → Hipótese → Setup (o que foi real, o que foi simulado) →
Observação (evidência coletada, não impressão) → Decisão (aceita, rejeitada,
inconclusiva) → Limitações (o que não foi testado) → Próximo passo (quem
decide o quê a partir daqui).

O relatório do protótipo nunca vira uma fonte normativa concorrente com a
spec do projeto — o aprendizado é incorporado à spec, ADR ou backlog, e o
relatório em si pode ser descartado junto com o código.

## Fontes oficiais e primárias

- GOV.UK Service Manual — Making prototypes: https://www.gov.uk/service-manual/design/making-prototypes
- W3C WAI — Planning and Managing: https://www.w3.org/WAI/planning/
- Martin Fowler — Technical Debt (custo de herdar código de protótipo): https://martinfowler.com/bliki/TechnicalDebt.html
- Scaled Agile Framework — Spikes: https://framework.scaledagile.com/spikes
