# Gestor de pacotes Laravel

O especialista Gestor de pacotes Laravel recebe a URL de um repositório GitHub,
lê o contrato Composer e a documentação do pacote e compara com o que já existe
no projeto. Com a sua autorização, instala a dependência e mantém uma ficha de
uso em `docs/packages/`.

## Quando usar

- Você recebeu a URL GitHub de um pacote para uma aplicação Laravel.
- Um pacote Composer já instalado ainda não tem ficha de uso.
- O `composer.json`, o `composer.lock` e o `docs/packages/` estão fora de
  sincronia.

Pacotes npm, PHP sem Laravel e publicação de bibliotecas no Packagist ficam
fora deste especialista. Ele trabalha apenas com dependências Composer de
uma aplicação Laravel.

## Como ele trabalha

1. Confirma a raiz do projeto e normaliza a URL para
   `github.com/<organização>/<repositório>`, recusando endereços que não
   apontam para um repositório identificável.
2. Lê as instruções locais, o `composer.json`, o `composer.lock`, o
   `.specsfy/PACKAGES.md` e as fichas existentes, considerando os pacotes já
   instalados.
3. Consulta no repositório o `composer.json`, o README, a configuração, a
   versão publicada e os exemplos. Separa o que a fonte declara, o que o
   projeto mostra e o que ainda não foi confirmado.
4. Identifica o nome Composer, as versões de PHP e Laravel, os requisitos, os
   comandos de instalação e publicação e a forma de teste.
5. Interrompe o trabalho e explica a lacuna quando o repositório não expõe um
   pacote Composer compatível. Fora do Packagist, uma origem VCS exige a sua
   autorização específica.
6. Procura o pacote no manifest, no lockfile, em `vendor/composer/` e no
   código. Quando o pacote já está instalado, ele é reaproveitado sem outro
   `composer require`.
7. Com a instalação autorizada, executa `composer require <vendor/nome>` na
   raiz. O `--dev` aparece apenas quando o projeto trata o pacote como
   dependência de desenvolvimento.
8. Cria ou atualiza a ficha `docs/packages/<vendor>-<nome>.md`.
9. Mantém o `docs/packages/README.md` como índice dos pacotes diretos, com
   versão, finalidade e link para cada ficha.

## O que fica em `docs/packages/`

- `README.md` é o índice dos pacotes Composer diretos, com produção e
  desenvolvimento em listas separadas.
- `<vendor>-<nome>.md` explica instalação, configuração, uso local, testes e
  fontes consultadas.
- `.specsfy/PACKAGES.md` continua como a relação completa, incluindo as
  dependências transitivas.

## Padrões aplicados

- A versão instalada vem do `composer.lock`. Tags do GitHub e restrições do
  manifest não definem a versão.
- O nome da ficha converte a `/` do nome Composer em `-` e a mesma ficha
  acompanha as mudanças de versão.
- Cada ficha aponta o ponto de entrada usado pela aplicação, como provider,
  facade, middleware, command ou config.
- Comandos de instalação, publicação e teste aparecem com o motivo e o arquivo
  que deve mudar.
- Segredos, valores de `.env` e trechos extensos de terceiros ficam fora de
  `docs/packages/`.
- Notas escritas à mão fora da seção gerenciada são preservadas.

## Erros que ele evita

- Instalar sem ler o manifest e o lockfile, com versão incompatível ou
  dependência repetida.
- Tratar qualquer repositório PHP como pacote Laravel.
- Executar `php artisan vendor:publish`, migrations ou scripts do pacote sem
  confirmar o efeito e a autorização.
- Criar uma ficha genérica copiada do README.

## Como conferir o resultado

- URL, nome Composer, versão e requisitos aparecem em fontes primárias ou nos
  arquivos locais.
- `composer validate --strict` passa e `composer show <vendor/nome>` confirma
  o pacote instalado.
- Os testes, o formatter e a análise estática do projeto rodam sem um runner
  novo.
- O índice lista cada dependência direta e cada link aponta para uma ficha
  existente.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel-package-manager \
  --agent universal --copy --full-depth
```

O catálogo instala junto o especialista Laravel.

## Especialistas relacionados

- [Laravel](laravel.md) orienta o uso do pacote em HTTP, Eloquent, filas e
  testes.
- [Pesquisa Técnica](technical-research.md) compara documentação e versões
  quando o repositório deixa dúvidas.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-laravel-package-manager/SKILL.md),
com o formato das fichas e a hierarquia de fontes no arquivo de referência da
mesma pasta.
