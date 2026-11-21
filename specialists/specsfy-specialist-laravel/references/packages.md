# Padrões para pacotes Laravel

## Ficha por pacote

Cada arquivo `docs/packages/<vendor>-<nome>.md` deve conter, nesta ordem:

1. nome Composer e nome de exibição;
2. URL do repositório GitHub e fonte da documentação consultada;
3. versão instalada, PHP e faixa Laravel declarada pelo pacote;
4. finalidade para este projeto, separando uso observado de uso apenas
   descrito pelo pacote;
5. instalação e alteração esperada em `composer.json` e `composer.lock`;
6. configuração, publicação e migrations somente quando aplicáveis;
7. exemplo mínimo adaptado ao código local, sem copiar uma página inteira;
8. testes executados e comandos que outra pessoa pode repetir;
9. data da leitura e pontos ainda não confirmados.

O índice `docs/packages/README.md` deve ter uma linha por dependência direta
de `composer.json`, indicando `require` ou `require-dev`, versão do lockfile,
finalidade curta e link para a ficha. A relação transitiva continua em
`.specsfy/PACKAGES.md`.

## Ordem das fontes

Consulte primeiro o `composer.json` e a documentação versionada do próprio
pacote. Depois confira o lockfile local, o código instalado em `vendor/` e a
documentação oficial do Laravel para o mecanismo usado. Uma fonte de terceiros
serve apenas como pista e não autoriza sozinha um comando publicado na ficha.

Considere os pacotes já instalados antes de procurar uma alternativa nova: um
pacote do `composer.lock` que já resolve o caso vence uma dependência a mais.

## Comandos Composer

| Necessidade | Comando | Conferência posterior |
| --- | --- | --- |
| validar manifests | `composer validate --strict` | exit code zero e arquivos sem alteração inesperada |
| instalar dependência | `composer require vendor/nome` | `composer.json`, `composer.lock` e `composer show` |
| instalar ferramenta de desenvolvimento | `composer require --dev vendor/nome` | pacote em `require-dev` e lockfile atualizado |
| conferir pacote local | `composer show vendor/nome` | versão, descrição e fonte exibidas |
| reconstruir autoload | `composer dump-autoload` | testes do projeto continuam verdes |

Não use `composer update` como substituto de `composer require` para um pacote
novo. Quando a tarefa pedir uma atualização ampla, registre os pacotes
atingidos antes de executar o comando.

## Fontes oficiais

- [Composer CLI](https://getcomposer.org/doc/03-cli.md)
- [Composer schema](https://getcomposer.org/doc/04-schema.md)
- [Composer basic usage](https://getcomposer.org/doc/01-basic-usage.md)
- [Laravel package development](https://laravel.com/docs/packages)
- [GitHub REST API: repository contents](https://docs.github.com/en/rest/repos/contents)
