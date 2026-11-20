# Padrão da documentação oficial

O módulo `docs/` possui exatamente dois percursos canônicos:

```text
docs/
├── README.md
├── user/
└── develop/
```

`docs/README.md` apenas apresenta e roteia os públicos. Conteúdo temático
pertence a um dos dois percursos.

## Usuário

`docs/user/` é a documentação do usuário final. Use linguagem simples,
explique termos antes de usá-los e mostre pedidos e resultados fáceis de
adaptar. O leitor não precisa conhecer a implementação do framework.
Comece pela ação que a pessoa quer concluir e pelo resultado que ela deve
observar. Preserve detalhes técnicos quando ajudarem a executar, verificar,
resolver falhas ou tomar uma decisão; mova inventários e manutenção interna
para `docs/develop/`.

| Jornada | Guia |
| --- | --- |
| visão geral completa | `docs/user/README.md` |
| método e conceitos | `docs/user/method.md` |
| instalação | `docs/user/installation.md` |
| primeira entrega | `docs/user/getting-started.md` |
| caixa de entrada sem perguntas | `docs/user/inbox.md` |
| índice das skills base | `docs/user/skills/README.md` |
| aprofundamento de cada skill base | `docs/user/skills/specsfy-base-*.md` |
| CLI e TUI | `docs/user/cli.md` |
| referência completa do CLI | `docs/user/cli-reference.md` |
| mudança posterior | `docs/user/update-spec.md` |
| contexto persistente | `docs/user/project-context.md` |
| documentação do sistema gerada | `docs/user/system-documentation.md` |
| especialistas | `docs/user/specialists.md` |
| automação avançada | `docs/user/advanced-usage.md` |
| guias por framework | `docs/user/laravel.md` e `nextjs.md` |

O download público do CLI usa a URL canônica `get.specsfy.dev`.
Referências ao GitHub continuam sendo usadas para origem, contribuição e
detalhes técnicos do monorepo. O guia de instalação começa diretamente pelo
download do CLI e não exige checkout ou preparação do monorepo.

`docs/user/reading-order.txt` é a fonte única da sequência pedagógica usada
pelo portal e pelo ebook: método, instalação, primeira entrega, fluxo base,
operação cotidiana e recursos avançados. Uma mudança de percurso atualiza esse
arquivo e `docs/user/README.md` no mesmo diff.

As tabelas `## Classificação` são frontmatter documental das fontes Markdown.
Elas permanecem disponíveis para extração estruturada, mas o pipeline do ebook
não as exibe no PDF, EPUB ou sumários.

O ebook é uma experiência autocontida. Links entre páginas de `docs/user/`
viram navegação interna entre capítulos; referências externas permanecem
legíveis como texto e não abrem destinos fora do PDF ou EPUB. A validação deve
rejeitar links externos ativos e âncoras internas ausentes.

Todo o conteúdo editorial do ebook e do PDF deve ser escrito em Português do
Brasil. Metadados e template declaram `pt-BR`; termos técnicos em inglês só
permanecem quando essa for a forma usada pelo ecossistema.

O pipeline mantém no diretório `ebook/` somente as cinco edições SemVer mais
recentes. A retenção ocorre após validar a edição vigente e remove apenas os
pares PDF e EPUB que seguem o nome canônico.

Cada página de skill base inclui:

- quando usar e quando não usar;
- como descrever a tarefa em linguagem natural;
- exemplo passo a passo;
- resultado esperado;
- erros comuns;
- próximo passo.

## Desenvolvimento

`docs/develop/` é a documentação técnica para agentes e humanos que contribuem,
implementam ou modificam o framework.

| Assunto | Responsável documental |
| --- | --- |
| portal técnico | `docs/develop/README.md` |
| estados, atos, gates e rastreabilidade | `docs/develop/methodology.md` |
| fluxo de contribuição e validação | `docs/develop/contributing.md` |
| arquitetura das skills | `docs/develop/skills.md` |
| arquitetura do CLI | `docs/develop/cli.md` |
| módulos e ownership | `docs/develop/modules.md` |
| manutenção documental | `docs/develop/documentation.md` |
| contexto transversal | `docs/develop/context/README.md` |
| públicos da documentação | `docs/develop/context/documentation.md` |
| arquitetura e integrações | `docs/develop/context/architecture/` |
| dependências | `docs/develop/context/architecture/dependencies.md` |
| stack, pacotes, convenções e testes | `docs/develop/context/engineering/` |
| persistência, dados e privacidade | `docs/develop/context/data/` |
| fluxos entre módulos | `docs/develop/context/flows/` |
| motivação histórica | `docs/develop/decisions/` |

O percurso técnico explica relações e decisões sem copiar inventários extensos
de manifests, rotas, schemas ou testes.

## Fontes por módulo

| Módulo | Evidência primária |
| --- | --- |
| raiz | `AGENTS.md`, automação e contratos integrados |
| `brand/` | identidade e diretrizes |
| `skills/` | `SKILL.md`, scripts, referências e testes |
| `docs/` | os dois percursos oficiais |
| `example/` | aplicação e documentação operacional |
| `specsfy/` | apresentação pública |
| `specialists/` | catálogo, skills e testes |
| `cli/` | código, manifests, testes e interface pública |

## Reconciliação

1. identifique a afirmação e seu owner executável;
2. leia as instruções e evidências do módulo;
3. atualize `user/` quando a jornada pública mudar;
4. atualize `develop/` quando arquitetura, contribuição ou decisões mudarem;
5. atualize ambos quando a mudança afetar uso e implementação;
6. mantenha uma página por skill base sincronizada com o `SKILL.md`;
7. valide links, imagens, topologia, testes e status Git.
