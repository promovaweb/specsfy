# Guia de padronização dos especialistas

Este guia rege como preencher [SKILL.template.md](SKILL.template.md) e como
estruturar `references/` para qualquer skill em `specsfy-specialist-*`.

## Quando criar um modo

Consulte o [catálogo](../catalog.json) antes de criar um especialista. Adicione
um modo ao especialista existente quando o assunto estiver no mesmo domínio
ou quando for uma peça pequena que sempre acompanha o fluxo dele. Use o modo
para explicitar o gatilho, as referências e os passos próprios dessa tarefa.
Crie um especialista quando a responsabilidade puder ser acionada de forma
independente, com gatilhos e um fluxo próprios.

O especialista de [interface](../specsfy-specialist-interface/SKILL.md)
reúne `discovery`, `system`, `ux`, `ui` e `accessibility`, que atendem etapas
do trabalho de interface. O de
[componentes de UI](../specsfy-specialist-ui-components/SKILL.md) reúne
`components`, `reui` e `shadcn`, que orientam a seleção e a adaptação de
componentes na mesma stack.

Ao absorver um especialista publicado, registre seu nome antigo como chave de
`renamed` em [skills/inventory.json](../../skills/inventory.json) e use o nome
completo do especialista que o absorveu como valor. Por exemplo,
`specsfy-specialist-reui` aponta para `specsfy-specialist-ui-components`.
O `specsfy update` usa esse mapa para migrar a instalação nos projetos
consumidores. O site gera automaticamente o redirecionamento HTTP 301 da
página antiga para a do especialista que a substituiu.

## Contrato de frontmatter

- `name` é `specsfy-specialist-<responsabilidade>`, igual ao nome da pasta e à
  referência `$name` em `agents/openai.yaml`.
- Na `description`, comece com verbo no infinitivo e domínio. Se houver vários
  modos, cite o nome e o escopo de cada um. Depois indique quando usar e
  encaminhe os casos fora do escopo à skill responsável. Use gatilhos
  concretos, como schemas, SQL, `EXPLAIN` e migrations em Postgres. O limite
  é de 1024 caracteres, sem `<` ou `>`.

## Corpo obrigatório

Mantenha as seis seções do template. Os testes do catálogo verificam os
títulos e o link para `references/standards.md` no corpo da skill.

A seção `## No Specsfy` vem logo depois de `Quando usar` e não substitui as
seis: ela liga o especialista ao método em 4 a 6 itens, com o último próprio do
domínio.

## Padrão de qualidade por seção

- **Quando usar** — use a tabela `| Situação | Modo | Abra |` para associar
  cada gatilho observável ao modo e às referências que a tarefa pede. Em
  especialistas de um único modo, omita a coluna `Modo`. Na lista
  `Não use para`, indique os casos adjacentes e a skill responsável por cada
  um. Indique quando combinar skills se a tarefa atravessar suas fronteiras.
- **Fluxo** — escreva de 5 a 8 passos no fluxo principal, cada um com uma ação
  verificável. O primeiro passo geralmente consulta `references/standards.md`
  e descobre o estado real do projeto (versão, volume, configuração) antes de
  recomendar. Use `### Modo <nome>` somente quando houver passos próprios do
  modo e mantenha os passos comuns no fluxo principal. Para um único modo,
  escreva todos os passos diretamente em `## Fluxo`. Evite instruções que só
  reafirmam o título da skill, como "planeje a arquitetura com cuidado".
- **Padrões**: cada item deve ser checável olhando artefato, log ou saída de
  comando — nunca uma aspiração. Prefira números e limiares quando o domínio
  os define (ex.: "zoom 200%, reflow 400%").
- **Antipadrões** — escreva de 2 a 5 itens com um sintoma observável e a
  explicação técnica da falha. Por exemplo, criar um índice para uma coluna
  isolada sem avaliar o predicado do `WHERE` pode deixar a consulta crítica
  sem um índice aplicável.
- **Validação**: passos que produzem evidência, idealmente com o comando ou
  ferramenta real do ecossistema (ex.: `EXPLAIN (ANALYZE, BUFFERS)`, `axe`,
  `k6`). Termine sempre proibindo linguagem absoluta sem evidência.
- **Skills relacionadas**: toda fronteira ambígua com outra skill do catálogo
  precisa de uma linha aqui, nos dois sentidos (a skill B também cita a skill
  A). Não duplique o conteúdo da skill vizinha — aponte a fronteira.

## Estrutura de `references/`

- `references/standards.md` é obrigatório. Reúna nele as regras comuns, o
  índice de referências por modo e a lista de fontes oficiais. Vincule-o por
  `[references/standards.md](references/standards.md)` no corpo. Em um
  especialista de modo único, o arquivo pode concentrar as decisões de
  modelagem, tabelas de trade-off, thresholds e comandos de diagnóstico.
- Nomeie a referência principal como `references/<modo>.md` quando um
  arquivo cobrir o modo inteiro, como `references/discovery.md`. Se o modo
  precisar de vários arquivos, use `<modo>-<assunto>.md`, como `reui-setup.md`
  e `shadcn-primitives.md`. Use o mesmo nome curto do modo na `description`,
  na tabela de acionamento, no índice e na subseção do fluxo, quando houver.
- Divida em arquivos adicionais quando o domínio tiver mais de um tipo de
  conteúdo de referência — catálogo de opções, checklist de revisão, matriz de
  decisão, fluxo de conversa. Exemplo real:
  `specsfy-specialist-ui-components/references/` separa `catalog.md`
  (o que existe), `composition-map.md` (como compor), `conversation-flow.md`
  (como decidir com a pessoa) e `interface-quality-checklist.md` (como
  validar). Cada arquivo novo precisa ser linkado no ponto do `SKILL.md` em
  que ele se aplica — nunca deixe um arquivo órfão sem link.
- Referências citam fontes oficiais (RFC, manual do projeto, W3C/WCAG, docs do
  framework) com URLs HTTPS estáveis. Use documentação primária como fonte
  normativa. Nunca copie de catálogos de terceiros nem cite a origem auditada
  do próprio catálogo.
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
