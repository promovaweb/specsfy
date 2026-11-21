# Catálogo de componentes

Os 231 arquivos em `assets/components/` são exemplos TSX copiáveis. Escolha pela
intenção da interface e abra somente os candidatos relevantes.

<!-- markdownlint-disable MD013 -->

| Família                 | Conteúdo                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `actions-feedback/`     | botões, menus, diálogos, alertas e banners                                          |
| `data-display/`         | tabelas, listas de descrição, avatares e selos                                      |
| `forms/`                | entradas, áreas de texto, seleções, caixas de combinação, opções e interruptores    |
| `hero/`                 | primeiras dobras públicas e variações com navegação                                 |
| `layout-navigation/`    | estruturas, barras laterais, barras de navegação, autenticação, paginação e rodapés |
| `marketing-company/`    | equipe, carreiras, escritórios, contato e suporte                                   |
| `marketing-content/`    | blog, FAQ, imprensa, apresentação e conteúdo editorial                              |
| `marketing-conversion/` | CTA, newsletter, preços e planos                                                    |
| `marketing-features/`   | recursos, capturas de tela, fluxos e descoberta de suporte                          |
| `marketing-proof/`      | depoimentos, conjuntos de logos e estatísticas                                      |
| `typography/`           | títulos, texto, links e divisores                                                   |

<!-- markdownlint-enable MD013 -->

## Descoberta

Listar a família sem carregar todo o catálogo:

```bash
rg --files assets/components/marketing-conversion
```

Filtrar nomes por intenção:

```bash
rg --files assets/components | rg 'pricing|comparison|toggle'
```

Ler dois ou três candidatos, comparar estrutura e dependências e escolher a
variante cuja intenção coincide com a composição definida pelo modo ui de `$specsfy-specialist-interface`.
Nomes usados no mapa de composição, como `ui-hero`, correspondem à família
homônima desta tabela, como `assets/components/hero/`.
