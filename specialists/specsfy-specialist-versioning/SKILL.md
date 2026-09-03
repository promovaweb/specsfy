---
name: specsfy-specialist-versioning
description: Gerenciar a versão do sistema pelo SEMVER da raiz e validar tags Docker. Use como apoio focal da `$specsfy-specialist-deploy`.
---

# Versionamento

## Quando usar

- Acionar pela `$specsfy-specialist-deploy` ao preparar release, imagem
  destinada a deploy, tag Git ou promoção entre ambientes.
- Em pedido completo de release ou deploy, devolver a coordenação para
  `$specsfy-specialist-deploy` depois de preparar e conferir a versão.
- Não publicar imagem, tag, GitHub Release nem executar deploy sem autorização
  explícita. A preparação local pode criar ou atualizar `SEMVER`.

## Fluxo

1. Localizar a raiz do projeto e ler `SEMVER`, tags Git, changelog e artefatos
   relacionados à entrega.
2. Criar `SEMVER` somente quando ele estiver ausente e a versão inicial tiver
   sido confirmada.
3. Classificar a alteração como `patch`, `minor` ou `major`, explicar o efeito
   e propor a próxima versão antes de escrever.
4. Atualizar `SEMVER` durante a preparação autorizada e propagar o mesmo valor
   para metadados, imagem e manifestos que pertencem à entrega.
5. Executar testes e conferir que a versão é superior à publicação anterior.
6. Quando houver autorização para publicar, enviar primeiro o artefato
   imutável. Criar a tag Git e a GitHub Release somente depois que o artefato
   estiver disponível.
7. Entregar a versão, o digest, o commit, os ambientes alcançados e os comandos
   de reversão.

## Padrões

- Manter `SEMVER` na raiz com uma única versão estável `MAJOR.MINOR.PATCH` e
  quebra de linha final.
- Usar `patch` para correção compatível, `minor` para capacidade compatível e
  `major` para mudança incompatível.
- Tratar `SEMVER` como fonte da versão preparada. Tags Git, anotações OCI,
  changelog e referência da stack devem reproduzir o mesmo valor.
- Publicar imagens com tag SemVer e commit, registrar o digest e fazer o deploy
  por digest quando a plataforma permitir.
- Conferir se uma tag imutável já existe antes do push. Nunca substituir uma
  imagem ou tag publicada.
- Usar o utilitário local para operações determinísticas:

```bash
node scripts/semver.mjs current --project .
node scripts/semver.mjs bump patch --project .
node scripts/semver.mjs verify 1.4.1 --project .
node scripts/semver.mjs docker-tag registry.example/app --project .
node scripts/semver.mjs verify-docker-tag registry.example/app:1.4.1 --project .
```

Ao instalar a skill, ajuste o primeiro caminho para apontar para
`specsfy-specialist-versioning/scripts/semver.mjs` dentro da biblioteca de
skills do agente.

## Antipadrões

- Usar `latest` como identidade de uma entrega.
- Alterar `SEMVER` depois que a imagem já foi compilada com outro valor.
- Criar a tag Git antes de confirmar a presença da imagem no registry.
- Recompilar o mesmo número para corrigir uma publicação. Prepare um novo
  incremento.
- Misturar a preparação local com autorização implícita para publicar ou
  alterar um ambiente remoto.

## Validação

- Executar `current` e `verify` para confirmar o conteúdo de `SEMVER`.
- Gerar a tag Docker com `docker-tag` e executar `verify-docker-tag` antes do
  build, push ou deploy; uma tag diferente do `SEMVER` interrompe o fluxo.
- Comparar a versão com a tag Git anterior e recusar valor igual ou inferior.
- Comparar `SEMVER`, tag da imagem, anotações OCI, changelog e manifesto de
  deploy.
- Confirmar o digest publicado antes de criar a tag Git.
- Conferir que o rollback aponta para uma versão e um digest já disponíveis.

## Skills relacionadas

- `$specsfy-specialist-deploy` é a única responsável por coordenar o fluxo
  completo de release ou deploy.
- `$specsfy-specialist-docker` constrói e publica a imagem identificada pela
  versão preparada aqui.
- `$specsfy-specialist-docker-swarm` aplica no cluster a imagem e o digest
  conferidos por esta skill.
- `$specsfy-specialist-ansible` transporta os manifestos versionados e executa
  o preflight nos hosts.
- `$specsfy-specialist-delivery-engineering` coordena testes, promoção, tag e
  GitHub Release.

Leia [references/standards.md](references/standards.md) para a correspondência
entre SemVer, Git, imagens OCI e a sequência de publicação.
