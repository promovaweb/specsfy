# Padrões de versionamento e entrega

## Fonte local

O arquivo `SEMVER` vive na raiz do projeto e contém somente uma versão estável
no formato `MAJOR.MINOR.PATCH`. O valor termina com quebra de linha. A skill
recusa prefixo `v`, espaços, metadados, versão preliminar e conteúdo adicional.

A especificação oficial do [Semantic Versioning](https://semver.org/) define:

- `patch` para correção compatível;
- `minor` para capacidade nova e compatível;
- `major` para mudança incompatível na interface pública.

## Correspondência entre artefatos

Uma entrega usa o mesmo número nos seguintes pontos:

- arquivo `SEMVER`;
- entrada do changelog;
- tag da imagem, como `registry.example/app:1.4.0`;
- anotação OCI `org.opencontainers.image.version`;
- manifesto ou variável consumida pelo deploy;
- tag Git `v1.4.0` e título da GitHub Release.

O commit também recebe uma tag de imagem própria. O digest publicado identifica
o conteúdo promovido entre ambientes, sem recompilação.

## Ordem de publicação

1. Ler a versão preparada em `SEMVER`.
2. Rodar testes e compilar o artefato uma vez.
3. Publicar as tags SemVer e commit no registry.
4. Conferir a presença e o digest do artefato.
5. Criar e enviar a tag Git.
6. Criar a GitHub Release.
7. Promover o mesmo digest e observar a convergência.

Essa sequência impede uma tag Git pública de apontar para uma imagem ausente.
Qualquer ação remota exige autorização explícita.

## Fontes

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Open Container Initiative: image annotations](https://github.com/opencontainers/image-spec/blob/main/annotations.md)
- [Docker: tags and digests](https://docs.docker.com/dhi/core-concepts/digests/)
