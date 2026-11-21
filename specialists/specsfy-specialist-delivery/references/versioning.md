# Padrões do modo versioning

## Fonte local

O arquivo `SEMVER` vive na raiz do projeto e contém somente uma versão estável
no formato `MAJOR.MINOR.PATCH`. O valor termina com quebra de linha. O modo
versioning recusa prefixo `v`, espaços, metadados, versão preliminar e conteúdo
adicional. (regra da casa)

A restrição a versões estáveis é do Specsfy. A especificação oficial do [Semantic Versioning](https://semver.org/) define:

- `patch` para correção compatível;
- `minor` para capacidade nova e compatível;
- `major` para mudança incompatível na interface pública.

O SemVer 2.0.0 também prevê pré-releases e metadados de build. A série
`0.y.z` é de desenvolvimento inicial e não promete estabilidade da API.

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
Qualquer ação remota exige autorização explícita. (regra da casa)

## Fontes

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Open Container Initiative: image annotations](https://github.com/opencontainers/image-spec/blob/main/annotations.md)
- [Docker: tags and digests](https://docs.docker.com/dhi/core-concepts/digests/)
