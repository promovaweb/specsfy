# Versionamento

O especialista Versionamento mantém o arquivo `SEMVER` na raiz do sistema como
fonte da versão de cada entrega. A imagem e os manifestos reproduzem o mesmo
número do changelog e da tag Git. A publicação segue uma ordem que garante o
artefato disponível antes da tag.

## Quando usar

- O especialista Deploy aciona este especialista para preparar um release, uma
  imagem de deploy, uma tag Git ou uma promoção entre ambientes.
- Você quer preparar ou conferir a próxima versão do sistema.

Em um release ou deploy completo, a coordenação volta ao especialista Deploy
depois da conferência da versão. Publicar imagem, tag ou GitHub Release e
executar deploy exigem a sua autorização explícita. A preparação local pode
criar ou atualizar o `SEMVER`.

## Como ele trabalha

1. Localiza a raiz do projeto e lê o `SEMVER`, as tags Git, o changelog e os
   artefatos da entrega.
2. Cria o `SEMVER` apenas quando ele não existe e a versão inicial foi
   confirmada.
3. Classifica a alteração como `patch`, `minor` ou `major`, explica o efeito e
   propõe a próxima versão antes de gravar.
4. Atualiza o `SEMVER` na preparação autorizada e leva o mesmo valor para
   metadados, imagem e manifestos.
5. Executa os testes e confere que a versão é maior que a publicação anterior.
6. Com autorização para publicar, envia primeiro o artefato imutável e só
   depois cria a tag Git e a GitHub Release.
7. Informa a versão, o digest, o commit, os ambientes alcançados e os comandos
   de reversão.

## Padrões aplicados

- O `SEMVER` guarda uma única versão `MAJOR.MINOR.PATCH`, com quebra de linha
  final.
- `patch` indica correção compatível, `minor` indica recurso compatível e
  `major` indica mudança incompatível.
- Tags Git, anotações OCI, changelog e a referência da stack reproduzem o valor
  do `SEMVER`.
- As imagens recebem tag de SemVer e de commit, o digest fica registrado e o
  deploy usa o digest quando a plataforma permite.
- O agente confere se uma tag imutável já existe antes do push e não substitui
  imagens ou tags publicadas.

O utilitário local executa estas operações de forma determinística, com o
mesmo resultado para os mesmos argumentos em qualquer máquina do projeto ou da
integração contínua:

```bash
node scripts/semver.mjs current --project .
node scripts/semver.mjs bump patch --project .
node scripts/semver.mjs verify 1.4.1 --project .
node scripts/semver.mjs docker-tag registry.example/app --project .
node scripts/semver.mjs verify-docker-tag registry.example/app:1.4.1 --project .
```

Depois da instalação, o caminho do script fica em
`specsfy-specialist-versioning/scripts/semver.mjs`, dentro da biblioteca de
skills do agente.

## Erros que ele evita

- Usar `latest` como identidade de uma entrega.
- Alterar o `SEMVER` depois que a imagem foi compilada com outro valor.
- Criar a tag Git sem confirmar a imagem no registry.
- Recompilar o mesmo número para corrigir uma publicação, em vez de preparar
  um novo incremento.
- Tratar a preparação local como autorização para publicar ou alterar um
  ambiente remoto.

## Como conferir o resultado

- `current` e `verify` confirmam o conteúdo do `SEMVER`.
- `docker-tag` gera a tag e `verify-docker-tag` interrompe o fluxo quando a tag
  difere do `SEMVER`.
- A versão é maior que a tag Git anterior.
- `SEMVER`, tag da imagem, anotações OCI, changelog e manifesto de deploy têm o
  mesmo valor.
- O digest publicado foi confirmado antes da tag Git.
- O rollback aponta para uma versão e um digest já disponíveis.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-versioning --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Deploy](deploy.md) coordena o fluxo completo de release e deploy.
- [Docker](docker.md) constrói e publica a imagem com a versão preparada.
- [Docker Swarm](docker-swarm.md) aplica no cluster a imagem e o digest
  conferidos.
- [Ansible](ansible.md) transporta os manifestos versionados.
- [Engenharia de Entrega](delivery-engineering.md) coordena testes, promoção,
  tag e GitHub Release.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-versioning/SKILL.md),
com a correspondência entre SemVer, Git e imagens OCI no arquivo de referência
da mesma pasta.
