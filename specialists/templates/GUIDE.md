# Guia de padronização dos especialistas

Este guia rege como preencher [SKILL.template.md](SKILL.template.md) e como
estruturar `references/` para qualquer skill em `specsfy-specialist-*`. Ele
existe para que cada especialista chegue ao mesmo nível técnico, não apenas à
mesma forma visual.

## Contrato de frontmatter

- `name` é `specsfy-specialist-<responsabilidade>`, igual ao nome da pasta e à
  referência `$name` em `agents/openai.yaml`.
- `description` segue o padrão: **verbo(s) + domínio** → **quando usar** →
  **quando não usar ou skill vizinha**. Escreva gatilhos concretos ("schemas,
  SQL, EXPLAIN, migrations em Postgres"), nunca abstratos ("boas práticas de
  banco"). Máximo de 1024 caracteres, sem `<` ou `>`.

## Corpo obrigatório

Os testes do catálogo (`tests/test_catalogo_especialistas.py`) exigem os
títulos `## Fluxo`, `## Padrões`, `## Validação` e a string `references/` no
corpo. O template acrescenta duas seções não obrigatórias pelos testes, mas
obrigatórias por este guia, porque elevam a utilidade técnica real:

- **Quando usar** — critério de acionamento e de não acionamento. Sem essa
  seção, duas skills adjacentes (ex.: `ui-design` e `react-ui-components`,
  `docker` e `docker-swarm`) competem pelo mesmo pedido e o agente escolhe por
  adivinhação.
- **Antipadrões** — smells observáveis, não avisos genéricos. Um antipadrão
  bom nomeia o sintoma que aparece no código ou no comportamento do sistema
  ("índice criado por coluna isolada, sem olhar o predicado do WHERE"), não um
  conselho vago ("cuidado com índices ruins").

## Padrão de qualidade por seção

- **Fluxo**: 5 a 8 passos, cada um uma ação verificável. Rejeite passos que só
  reafirmam o título da skill ("planeje a arquitetura com cuidado"). O
  primeiro passo quase sempre descobre o estado real do projeto (versão,
  volume, configuração) antes de recomendar.
- **Padrões**: cada item deve ser checável olhando artefato, log ou saída de
  comando — nunca uma aspiração. Prefira números e limiares quando o domínio
  os define (ex.: "zoom 200%, reflow 400%").
- **Antipadrões**: 2 a 5 itens, cada um com o porquê técnico da falha, não
  apenas a proibição.
- **Validação**: passos que produzem evidência, idealmente com o comando ou
  ferramenta real do ecossistema (ex.: `EXPLAIN (ANALYZE, BUFFERS)`, `axe`,
  `k6`). Termine sempre proibindo linguagem absoluta sem evidência.
- **Skills relacionadas**: toda fronteira ambígua com outra skill do catálogo
  precisa de uma linha aqui, nos dois sentidos (a skill B também cita a skill
  A). Não duplique o conteúdo da skill vizinha — aponte a fronteira.

## Estrutura de `references/`

- `references/standards.md` é o mínimo: decisões de modelagem específicas do
  domínio, tabelas de trade-off, thresholds, comandos de diagnóstico e uma
  lista de **fontes oficiais** (documentação primária do projeto/padrão, não
  posts de terceiros). Vinculado por `[references/standards.md](references/standards.md)`
  no corpo.
- Divida em arquivos adicionais quando o domínio tiver mais de um tipo de
  conteúdo de referência — catálogo de opções, checklist de revisão, matriz de
  decisão, fluxo de conversa. Exemplo real:
  `specsfy-specialist-react-ui-components/references/` separa `catalog.md`
  (o que existe), `composition-map.md` (como compor), `conversation-flow.md`
  (como decidir com a pessoa) e `interface-quality-checklist.md` (como
  validar). Cada arquivo novo precisa ser linkado no ponto do `SKILL.md` em
  que ele se aplica — nunca deixe um arquivo órfão sem link.
- Referências citam fonte oficial (RFC, manual do projeto, W3C/WCAG, docs do
  framework) com URL estável. Nunca copie de catálogos de terceiros nem cite a
  origem auditada do próprio catálogo.
- Conteúdo de referência deve ser específico o bastante para resolver uma
  decisão real (ex.: quando usar `GIN` vs `BRIN`, não "escolha o índice
  certo"). Se uma frase serviria em qualquer stack, ela não pertence à
  referência.

## Processo de atualização

1. Leia a skill atual e identifique lacunas contra este guia.
2. Reescreva `SKILL.md` seguindo `SKILL.template.md`, preservando `name` e a
   intenção da `description` original, mas elevando a precisão.
3. Expanda ou crie `references/*.md` com conteúdo tecnicamente denso e
   verificável — tabelas, thresholds, comandos, fontes oficiais.
4. Atualize `Skills relacionadas` nas duas pontas quando criar uma nova
   fronteira.
5. Rode a suíte do catálogo antes de considerar concluído:

```bash
npm run test:specialists
node scripts/validate-skills.mjs \
  specialists/specsfy-specialist-<nome>
```
