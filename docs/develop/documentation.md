# Documentação oficial do monorepo

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | descritivo |
| Escopo | manutenção da documentação do próprio Specsfy |
| Autoridade | fluxo da skill local e fontes executáveis prevalecem |

## Papel

Explicar como reconciliar os módulos do monorepo e publicar os dois percursos
oficiais: `docs/user/` e `docs/develop/`.

## Como usar

Acione `$specsfy-monorepo-documentator` somente na raiz de
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy). A skill confirma
o remoto e a raiz Git única antes de coletar evidências:

<!-- markdownlint-disable MD013 -->
```bash
python3 -B \
  .agents/skills/specsfy-monorepo-documentator/scripts/collect_monorepo_evidence.py \
  --workspace .
```
<!-- markdownlint-enable MD013 -->

O coletor é somente leitura. Ele registra remoto, branch, commit, estado Git,
quantidade de arquivos rastreados e fontes estruturais disponíveis em cada
módulo. Um checkout parcial, outro remoto ou um projeto consumidor é recusado.

## Documentação técnica

Decisões transversais ficam em `docs/develop/context/`: finalidade,
vocabulário, arquitetura, módulos, dependências, stack, dados, fluxos e testes.
A separação de públicos e as regras de atualização são normativas no
[contexto documental](context/documentation.md).

## Guias para usuários

Jornadas públicas ficam em `docs/user/`: método, instalação, primeiro projeto,
uma página por skill base, CLI, contexto persistente e especialistas.

## Ebook do percurso do usuário

`ebook/` publica todo o percurso `docs/user/` em PDF e EPUB, sem criar uma
segunda fonte editorial. `VERSION` na raiz controla a edição com SemVer e
`docs/user/reading-order.txt` declara a ordem pedagógica única, compartilhada
pelo portal e pelo ebook.

O guia `docs/user/cli.md` explica o percurso visual. A referência
`docs/user/cli-reference.md` cobre cada comando e subcomando registrado na
implementação, com parâmetros, efeitos, saídas, recusas e cinco exemplos.

Todo o texto do ebook e do PDF é escrito em Português do Brasil. O pipeline
exige `lang: "pt-BR"` nos metadados e `lang="pt-BR"` no template HTML; termos
técnicos em inglês permanecem somente quando forem a forma usada pelo
ecossistema.

Na raiz:

```bash
make ebook
make verify-ebook
```

O build gera os dois artefatos versionados e `ebook/build.json`. O manifesto
registra o digest recursivo das páginas, imagens e fontes de build, além dos
hashes do PDF e EPUB. Depois de validar a edição vigente, o pipeline conserva
as cinco versões SemVer mais recentes e remove PDF e EPUB das anteriores. A
regressão executa a mesma verificação. Portanto, toda mudança em `docs/user/`
precisa reconstruir o ebook na mesma entrega.

As tabelas `## Classificação` são metadados das fontes Markdown. O pipeline
extrai seus campos para `document_metadata` no manifesto e remove somente sua
representação visual do PDF, do EPUB e de seus sumários.

O pipeline converte links entre páginas de `docs/user/` em navegação entre
capítulos. Links para destinos que não fazem parte do percurso permanecem como
texto sem ação no PDF e no EPUB. A verificação rejeita links clicáveis externos
e destinos internos ausentes, mantendo os dois formatos autocontidos.

O sistema visual deriva de `brand/`: logo oficial, Inter no corpo, Manrope em
títulos, preto, branco, neutros e estilos de código, tabela e navegação. O
pipeline incorpora as fontes mantidas pelo sistema de marca. Os artefatos
publicados e o controle de edição vivem em `ebook/`.

## Evidência e publicação

- Confirme cada afirmação na fonte do módulo.
- Use links relativos entre arquivos do monorepo.
- Publique orientação de uso em `docs/user/` e contexto técnico em
  `docs/develop/`.
- Após alterar `docs/user/`, ajuste a edição e execute `make ebook`.
- Execute testes focais dos módulos, a regressão integrada e revise o diff único.

## Cobertura obrigatória de conceitos públicos

O Specsfy não introduz uma capacidade pública somente com entrada no catálogo,
opção de CLI ou alteração de template. Cada conceito visível para quem usa o
framework precisa de explicação navegável no percurso de usuário e, quando há
implementação correspondente, de contexto técnico no percurso de desenvolvimento.

Para cada campo, estado, gate, comando, métrica, template, skill ou integração,
a documentação precisa explicar finalidade, uso e não uso, entradas, saídas,
artefatos alterados, pré-condições, limites, falhas, exemplo, resultado
observável, fonte executável e forma de verificação.

`docs/user/method-reference.md` é a referência central para Effort, estados,
gates, transições, IDs, rastreabilidade, pesquisa, tarefas e progresso. Uma
mudança nesses contratos atualiza essa página, os guias de jornada afetados,
`reading-order.txt`, a edição do ebook e o contexto técnico correspondente.

Na revisão, compare alterações em `skills/`, `cli/`, templates e testes com os
dois percursos. Se a documentação não permitir entender, aplicar e conferir o
resultado de um item, o trabalho ainda não está pronto.

A skill local vive em
[`/.agents/skills/specsfy-monorepo-documentator`](../../.agents/skills/specsfy-monorepo-documentator/)
e não integra o catálogo instalado em consumidores. A skill
[`specsfy-documentator`](../../skills/specsfy-documentator/) reconstrói
`<projeto>/docs/` de uma aplicação consumidora.

`$specsfy-release-cli` também é local ao módulo
[`cli/`](../../cli/), em
[`cli/.agents/skills/specsfy-release-cli/`](../../cli/.agents/skills/specsfy-release-cli/).
Ela versiona os artefatos em `cli/`,
cria uma tag no commit do monorepo e publica a seção correspondente do
`cli/CHANGELOG.md` no GitHub Release.

## Atualize quando

- a topologia, automação documental ou percurso público mudar.

## Não use para

- documentar uma aplicação consumidora.
- substituir specs ou fontes executáveis.

## Fonte da verdade e precedência

Fontes executáveis de cada módulo prevalecem.
`docs/develop/context/` governa decisões transversais e `docs/user/` explica
interfaces públicas.
`VERSION` na raiz é a fonte única para todo o Specsfy. CLI, skills,
especialistas, ebook, tag e GitHub Release usam o mesmo SemVer. `make
verify-version` encerra com erro quando uma projeção publicada diverge. Hub e
website mantêm versões independentes.
