# Specsfy Specialists

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

Catálogo oficial de skills técnicas opcionais do Specsfy. O prefixo
`specsfy-specialist-` distingue o contexto especializado das skills base
que executam a metodologia.

Os especialistas são instalados sob demanda no projeto consumidor:

```bash
specsfy skills list
specsfy skills detect
specsfy skills install specsfy-specialist-laravel
```

O [catálogo](catalog.json) usa `detect` para reconhecer arquivos,
dependências e imagens de serviços em Compose (`detect.images`). Nas sugestões
de uma spec, `stack: true` indica que o especialista precisa de confirmação
no projeto. A detecção ou um nome listado em `aliases` e declarado em
`.specsfy/STACK.md`, como PostgreSQL ou Next.js, confirma a tecnologia.
Interface e Arquitetura podem ser sugeridas a partir dos sinais da spec.

Para implementar interfaces React a partir de referências copiáveis, use
`specsfy-specialist-ui-components`. Ele reúne o catálogo de blocos React, as
composições gratuitas do ReUI e as primitives shadcn/ui; o CLI resolve e instala
as dependências declaradas no catálogo automaticamente.

Para criar ou alterar uma interface de sistema, use
`specsfy-specialist-interface`. Ele reúne a descoberta de interface, o design
system, o UI design, o UX design e a acessibilidade web: examina o sistema e a
stack já existentes, conduz as perguntas sobre telas e encaminha a tecnologia
correta para a entrega.

`specsfy-specialist-interface` mantém `DESIGNSYSTEM.MD` no projeto
consumidor. O `$specsfy-setup` cria o arquivo a partir do template quando ele
está ausente. Quando a pessoa não informa direção visual, a skill aplica
defaults para SaaS: `DataGrid` em listas com detalhe clicável por linha,
`DetailLists` em detalhes, `PageHeader` nas superfícies e seções de formulário
em duas colunas responsivas em criar e editar, com `Breadcrumb` em todas as
telas e o nome da equipe ativa visível. Primitives shadcn/ui e
blocos gratuitos ReUI podem acelerar a composição; o registro local de
componentes e telas continua em `INTERFACE.md`.

O catálogo reúne 27 especialistas: Laravel, MCP, Supabase, PostgreSQL, MySQL,
MongoDB, Redis, Modelagem, Arquitetura, Interface, Componentes de UI, React,
Tailwind CSS, Next.js, TypeScript, Docker, Servidor, Cloudflare, Entrega, n8n,
Git, Observabilidade, Testes, Segurança de Aplicações, Code Review, Debugging e
Pesquisa. Ele cobre a stack Promovaweb, design de interfaces, qualidade,
arquitetura, operação e disciplinas de engenharia. A referência completa de
instalação e uso pertence à
[`documentação do Specsfy`](../docs/), com um guia por especialista em
[`docs/user/specialists`](../docs/user/specialists.md).

Para release, deploy ou inclusão de servidor, use somente
`specsfy-specialist-delivery`. A orquestradora prepara o `SEMVER`, inspeciona a
aplicação, mantém o inventário Ansible, testa conexões, sincroniza chaves
públicas para a conta `deploy` e chama `specsfy-specialist-docker` e
`specsfy-specialist-server` conforme a etapa. O projeto consumidor recebe o
wrapper `./deploy` com as ações `check-hosts`, `secrets`, `sync-keys` e `run`.

O comando `./deploy run` mantém a senha manual no terminal. Para execução pela
IA, prepare uma fonte externa com `./deploy configure-vault` e use
`./deploy run --non-interactive`. Arquivos, scripts de cofre e configurações
nativas do Ansible também são aceitos. O guia de
[operações de deploy](../docs/user/deploy-vault.md) explica cadastro,
permissões, troca, remoção e migração dos scripts existentes.

Para diagnóstico sem alterar o servidor, use `specsfy-specialist-server` no modo
relatório. A coleta usa Ansible e registra containers, serviços Swarm, logs
limitados e uso de disco em `server-reports/`, por host e data.

Nenhuma skill deste módulo é instalada ou executada pela raiz do
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy).

## Validar

```bash
node --test tests/*.test.mjs
```
