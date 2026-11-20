# Política de pacotes

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | normativo |
| Escopo | dependências de desenvolvimento e execução |
| Autoridade | política de adoção, atualização e remoção de pacotes |

## Papel

Definir como dependências são avaliadas, introduzidas, atualizadas e removidas
sem transformar este documento em inventário de versões.

## Como usar

Leia antes de adicionar import de terceiro ou ferramenta necessária ao
desenvolvimento, teste ou publicação.

## Atualize quando

- a política de dependências mudar.
- um pacote se tornar estrutural.
- uma exceção de segurança ou compatibilidade for aceita.

## Não use para

- copiar a lista de dependências transitivas.
- registrar versão já presente em manifest.
- autorizar pacote sem teste e justificativa.

## Fonte da verdade e precedência

Manifests e lockfiles são as fontes executáveis de pacotes e versões. Este
documento registra somente finalidade, política e restrições. Na ausência de
manifest, comandos explícitos revelam dependências efêmeras.

Nos projetos consumidores, `.specsfy/PACKAGES.md` é a projeção reconstruível
dessas fontes. `$specsfy-documentator` lista dependências npm e Composer
diretas e transitivas, acrescenta a descrição local disponível e declara a
ausência de finalidade quando nenhum metadado confiável existir. Esse
inventário não redefine a política nem substitui manifests e lockfiles.

Os manifests de `example/` pertencem à aplicação interna de validação em
`example/`. Eles são a fonte das dependências PHP e JavaScript daquele
aplicativo, não um catálogo de pacotes obrigatórios para usar o Specsfy.

## Pacotes estruturais

| Pacote ou ferramenta | Papel | Forma atual |
| --- | --- | --- |
| `node:test` | executar testes e aceite Gherkin (`tests/bdd.mjs`) | runtime do Node.js 22.20 ou superior |
| `yaml` | validar metadata de skills | `devDependencies` do `package.json` da raiz |
| Bun | executar, testar (`bun test`) e compilar (`bun build --compile`) o CLI | `engines` de `cli/package.json` e `cli/bun.lock` |
| OpenTUI (`@opentui/core`) | renderizar a TUI do CLI | `cli/package.json` |
| MCP SDK (`@modelcontextprotocol/sdk`) | servir `specsfy mcp` via stdio | `cli/package.json` |
| Zod | declarar o `inputSchema` das tools MCP | `cli/package.json` |
| TypeScript | verificar tipos do CLI (`bun run typecheck`) | `cli/package.json` |
| `skills` | materializar skills nos projetos consumidores | `cli/package.json` e `src/domain/prerequisites.ts` |

## Política de dependências

- Justificar finalidade e alternativa baseada na biblioteca padrão.
- Cobrir o contrato introduzido com teste.
- Definir fonte de versão e estratégia de atualização.
- Avaliar licença, segurança, manutenção e compatibilidade.
- Remover dependência que não possua mais consumidor.
- Não documentar pacote transitivo como escolha arquitetural.
- Alterar pacote de `example/` somente com teste da capacidade exercitada e
  atualização de sua documentação operacional na mesma entrega.
- Alterar pacote do CLI somente no repositório `cli/`, com lockfile,
  teste da TUI e build da distribuição.

## Pacotes Laravel no projeto consumidor

Quando uma tarefa receber uma URL GitHub de pacote Laravel, o especialista
`specsfy-specialist-laravel-package-manager` lê a documentação e compara o
nome e a versão com `composer.json`, `composer.lock`, `vendor/` e as fontes de
contexto do projeto. Pacote já instalado é reutilizado; pacote novo só entra
após autorização para executar `composer require`.

O especialista mantém uma ficha por dependência direta em
`docs/packages/<vendor>-<nome>.md` e o índice `docs/packages/README.md`. O
documentador continua responsável por `.specsfy/PACKAGES.md`, que inclui as
dependências transitivas e permanece derivado dos manifests e lockfiles.
