# Topologia e públicos da documentação

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | organização e separação de públicos em `docs/` |
| Autoridade | destino, linguagem e sincronização da documentação oficial |

## Papel

Definir onde cada tipo de documentação oficial pertence e impedir que conteúdo
para usuários finais seja misturado com contexto de implementação.

## Como usar

Leia antes de criar, mover ou reclassificar um documento e sempre que uma
mudança do framework exigir decidir qual percurso atualizar.

## Topologia canônica

Na primeira camada, `docs/` possui exatamente:

```text
docs/
├── README.md
├── user/
└── develop/
```

`docs/README.md` apenas apresenta os públicos e encaminha para o percurso
adequado. Conteúdo temático não pertence diretamente à raiz de `docs/`.

## Percurso do usuário

`docs/user/` orienta quem usa o Specsfy em um projeto consumidor:

- escreva em linguagem simples e explique cada termo antes de depender dele.
- use exemplos fáceis de adaptar, com pedido, etapas e resultado esperado.
- cubra a jornada completa, do método e da instalação ao acompanhamento e à
  mudança tardia.
- mantenha o guia geral em `docs/user/README.md`.
- mantenha a sequência pedagógica em `docs/user/reading-order.txt`: metodologia,
  instalação, primeira entrega, fluxo base, operação e uso avançado.
- mantenha uma página por skill base em `docs/user/skills/`, sincronizada com a
  interface executável correspondente.
- apresente comportamento público sem expor detalhes internos desnecessários.

## Percurso de desenvolvimento

`docs/develop/` fornece contexto técnico para agentes e humanos contribuírem,
implementarem ou modificarem o framework:

- documente metodologia, arquitetura, ownership, dependências e convenções.
- explique skills, CLI, testes, validações e fluxo de contribuição.
- mantenha decisões vigentes em `docs/develop/context/`.
- preserve motivação histórica em `docs/develop/decisions/`.
- derive afirmações de código, testes, manifests, configurações ou outra fonte
  proprietária.

## Regra de atualização

- Mudança apenas na experiência ou interface pública: atualize `docs/user/`.
- Mudança apenas na implementação, arquitetura ou contribuição: atualize
  `docs/develop/`.
- Mudança que afeta o uso e a implementação: atualize ambos os percursos na
  mesma entrega.
- Nova skill base ou alteração material de uma skill base: atualize sua página
  de usuário e o contexto técnico aplicável.
- Nova capacidade, campo, estado, gate, comando, métrica, template ou regra de
  transição: documente finalidade, fonte normativa, entrada, saída, limites,
  falhas esperadas, exemplo e forma de verificação antes de publicar. Quando a
  mudança for visível para quem usa o framework, atualize a referência do
  método e o guia de usuário correspondente. Quando também alterar a execução,
  atualize o percurso de desenvolvimento no mesmo diff.
- Uma menção em lista, catálogo ou changelog não explica uma capacidade. A
  pessoa precisa conseguir entender para que serve, quando usar, quando não
  usar, quais dados muda e como confirmar o resultado sem consultar o código.
- Qualquer alteração em `docs/user/`, inclusive imagens: atualize a edição em
  `VERSION` na raiz conforme SemVer e reconstrua PDF, EPUB e `ebook/build.json`
  com `make ebook`.
- O build conserva somente as cinco edições SemVer mais recentes em `ebook/`.
  A retenção remove apenas PDF e EPUB com o nome canônico e ocorre depois da
  verificação da edição vigente.
- Mudança na jornada: atualize juntos `docs/user/README.md` e
  `docs/user/reading-order.txt`. O ebook deve consumir essa mesma ordem.
- Tabelas `## Classificação` permanecem nas fontes Markdown. O ebook pode
  extrair seus valores, mas não deve exibir o cabeçalho nem a tabela.
- Links clicáveis do ebook apontam somente para capítulos e âncoras do próprio
  artefato. O ebook explica método, etapas e procedimentos no próprio texto,
  sem encaminhar a pessoa ao repositório ou à documentação online para obter o
  conteúdo. Caminhos de arquivos necessários à execução e citações nominais de
  fontes podem permanecer legíveis, sem ação de navegação.
- Se uma seção for exclusiva do portal, como links para baixar o próprio PDF ou
  EPUB, envolva-a em `::: {.online-only}`. O filtro do ebook a omite; conteúdo
  necessário à jornada deve continuar no capítulo portátil.
- Movimento de arquivo: atualize roteadores, links, imagens, testes e referências
  no mesmo diff.

## Fonte da verdade e precedência

O [`AGENTS.md` da raiz](../../../AGENTS.md) governa o processo de trabalho. Este
contexto governa a classificação documental. As fontes executáveis de cada
módulo comprovam o estado implementado. A documentação deriva delas e não as
substitui.

O [padrão da skill documental](../../../.agents/skills/specsfy-monorepo-documentator/references/documentation-standard.md)
detalha a reconciliação operacional dos dois percursos.

## Atualize quando

- um público, destino, regra de linguagem ou critério de sincronização mudar.
- a primeira camada de `docs/` ou a responsabilidade de um percurso mudar.

## Não use para

- documentar uma feature consumidora.
- copiar inventários de código, rotas, schemas ou manifests.
- manter planos, tarefas ou pesquisa temporária.
