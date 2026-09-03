# Ebook do guia do usuário

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

Esta pasta publica o conteúdo completo de `docs/user/` em PDF e EPUB. Os
arquivos Markdown continuam sendo a única fonte editorial. Não edite os
artefatos gerados.

## Idioma obrigatório

Todo o conteúdo editorial do ebook e do PDF do Specsfy deve ser escrito em
Português do Brasil. Termos técnicos em inglês podem ser preservados quando
forem a forma adotada pelo ecossistema, mas títulos, explicações, exemplos,
mensagens e metadados de leitura devem usar `pt-BR`.

O build recusa a publicação quando `.ebook/metadata.yaml` não declara
`lang: "pt-BR"` ou quando o template HTML não usa `lang="pt-BR"`. A revisão
editorial das páginas em `docs/user/` continua responsável por garantir o
idioma do texto antes de `make ebook`.

## Edição vigente

A versão está em [`../VERSION`](../VERSION) e segue SemVer. Essa é a mesma
versão do framework, CLI, skills, especialistas, tag e GitHub Release:

- `PATCH`: correção de texto, link, exemplo ou apresentação.
- `MINOR`: nova página, novo percurso ou ampliação material.
- `MAJOR`: reorganização incompatível da jornada ou do contrato editorial.

Os artefatos vigentes usam o padrão:

```text
Specsfy-Guia-do-Usuario-v<versão>.pdf
Specsfy-Guia-do-Usuario-v<versão>.epub
```

Para links permanentes, use os aliases da edição mais recente:

- [PDF vigente](ebook-specsfy.pdf): `ebook-specsfy.pdf`;
- [EPUB vigente](ebook-specsfy.epub): `ebook-specsfy.epub`.

Cada execução bem-sucedida mantém somente as cinco edições SemVer mais
recentes. PDF e EPUB de versões mais antigas são removidos juntos. A limpeza
considera exclusivamente arquivos que seguem o padrão acima e preserva
README, manifesto, fontes e qualquer outro arquivo do diretório.

[`build.json`](build.json) registra a edição, a ordem, o digest das fontes e os
hashes dos dois arquivos. As tabelas `## Classificação` permanecem nas fontes
Markdown: o build extrai `Natureza`, `Escopo` e `Autoridade` para
`document_metadata` no manifesto, mas não as exibe no PDF nem no EPUB.

Nos artefatos portáteis, todo link clicável navega dentro do próprio ebook. A
experiência autocontida explica a metodologia, as etapas e os procedimentos no
próprio capítulo, sem encaminhar você ao repositório ou à documentação online
para completar uma instrução.

Um caminho de arquivo pode aparecer quando ele for necessário para executar a
ação descrita, como `specs/<estado>/<NNNN>-<slug>/spec.md`. Uma citação nominal
de uma fonte também pode permanecer nos créditos. Fora desses casos, não use o
ebook para encaminhar a pessoa a diretórios, módulos ou páginas externas.
Referências externas continuam visíveis como texto, sem abrir o navegador ou
retirar a pessoa da leitura. O build também verifica se cada capítulo e âncora
interna referenciada realmente existe.

Quando uma seção só fizer sentido no portal, como o download do próprio PDF ou
EPUB, envolva-a em `::: {.online-only}` nas fontes de `docs/user/`. O filtro do
ebook a remove dos formatos portáteis; não use essa classe para esconder uma
explicação necessária à jornada de quem lê.

## Gerar

Na raiz do monorepo:

```bash
make ebook
```

O build exige que a [ordem pedagógica canônica](../docs/user/reading-order.txt)
inclua cada página Markdown de `docs/user/` exatamente uma vez. Imagens e
demais arquivos desse percurso entram automaticamente no digest.

## Regra de atualização

Toda alteração em `docs/user/`, inclusive imagens, exige:

1. ajustar `../VERSION` conforme o impacto da release completa.
2. atualizar
   [`docs/user/reading-order.txt`](../docs/user/reading-order.txt) se uma
   página foi criada, movida ou removida.
3. executar `make ebook`.
4. executar `make verify-ebook`.

A regressão da raiz também executa a verificação. Ela falha se o digest das
fontes ou os hashes do PDF e EPUB não coincidirem com `build.json`.

O script de retenção é executado somente depois que a edição vigente passa
pela verificação de integridade. Se `../VERSION` não estiver entre as cinco
versões SemVer mais recentes encontradas, o build interrompe a limpeza.
