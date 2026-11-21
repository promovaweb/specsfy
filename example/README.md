# Aplicação de exemplo do Specsfy

<p align="center">
  <picture>
    <source srcset="../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>

Esta aplicação Laravel é o ambiente interno usado para exercitar decisões,
contratos e práticas do Specsfy em um produto real. Ela pertence ao repositório
`example/`; não é a documentação oficial da metodologia.

A documentação oficial para usuários é publicada em
[`docs/`](../docs/).

## Papel no Specsfy

O projeto demonstra como uma aplicação mantém comportamento, implementação,
testes e documentação operacional próximos das fontes executáveis. Ele serve
para validação interna do framework, sem transformar detalhes deste aplicativo
em regras universais da metodologia.

## Capacidades demonstradas

- autenticação por senha e passkey;
- confirmação de senha e autenticação em dois fatores;
- manutenção e exclusão do perfil;
- criação, seleção e exclusão de equipe;
- papéis de equipe `owner`, `admin` e `member`;
- convites, aceite, recusa e cancelamento;
- alteração e remoção de membros conforme permissões.
- diretório global e paginado de usuários, com busca por nome;
- perfis públicos internos com participações e papéis por equipe;
- diretório global de equipes e roster público interno de membros.

## Arquitetura

O backend usa Laravel, Fortify e Inertia. O frontend usa React, TypeScript,
Tailwind CSS e Vite. Dependências e scripts são definidos em
[`composer.json`](composer.json) e [`package.json`](package.json).

As rotas HTTP ficam em [`routes/web.php`](routes/web.php) e
[`routes/settings.php`](routes/settings.php). Controllers e middleware aplicam
autenticação, verificação de e-mail, confirmação de senha e associação à equipe.
As páginas Inertia ficam em
[`resources/js/pages/`](resources/js/pages/).

## Persistência e dados

[`app/Models/User.php`](app/Models/User.php) representa a conta autenticável,
incluindo passkeys, dois fatores e a equipe atual.
[`app/Models/Team.php`](app/Models/Team.php) representa equipes pessoais ou
compartilhadas, membros e convites.

As migrations em [`database/migrations/`](database/migrations/) definem usuários,
passkeys, dados de dois fatores, equipes, associações e infraestrutura do
Laravel. O ambiente local usa a conexão definida em `.env`; a configuração
inicial pode ser copiada de [`.env.example`](.env.example).

## Rotas e jornadas

As jornadas principais usam rotas nomeadas verificáveis:

- entrada pública e autenticação: `route:home`, `route:login`,
  `route:register`;
- dashboard da equipe atual: `route:dashboard`;
- diretório global: `route:directory.users.index`,
  `route:directory.users.show`, `route:directory.teams.index` e
  `route:directory.teams.show`;
- perfil e segurança: `route:profile.edit`, `route:security.edit`,
  `route:appearance.edit`;
- equipes: `route:teams.index`, `route:teams.store`, `route:teams.edit`,
  `route:teams.switch`;
- membros e convites: `route:teams.members.update`,
  `route:teams.invitations.store`, `route:invitations.accept`,
  `route:invitations.decline`.

Execute `php artisan route:list` para consultar o contrato completo de rotas.

## Preparar o ambiente

Requisitos locais: PHP, Composer, Node.js e npm compatíveis com os manifests.

```bash
composer setup
```

O comando `composer setup` instala dependências, cria `.env` a partir de
`.env.example`, gera a chave, executa migrations e compila o frontend.

## Executar

Para iniciar o ambiente integrado de desenvolvimento, use `composer dev`:

```bash
composer dev
```

Para executar somente o servidor frontend, use `npm run dev`:

```bash
npm run dev
```

Para produzir os assets, use `npm run build`:

```bash
npm run build
```

## Qualidade e testes

O contrato de backend e frontend está em [`tests/`](tests/). A verificação
principal `composer test` exige [`.env.testing`](.env.testing) e o executável
`specsfy` disponível no `PATH`. A preparação usa `specsfy gate database` para
validar o destino SQLite e o comando de migration antes de aplicá-lo. O Composer
então executa lint PHP, análise estática e testes. A suíte usa transações:

```bash
composer test
```

Checks individuais disponíveis:

```bash
composer lint:check
composer types:check
npm run lint:check
npm run format:check
npm run types:check
```

Os comandos do Prettier usam o `.gitignore` central do monorepo para excluir
rotas e artefatos gerados.

## Mapa de referências

| Assunto | Fonte executável |
| --- | --- |
| Dependências e automação PHP | [`composer.json`](composer.json) |
| Dependências e automação frontend | [`package.json`](package.json) |
| Variáveis locais | [`.env.example`](.env.example) |
| Rotas principais | [`routes/web.php`](routes/web.php) |
| Configurações, equipes e segurança | [`routes/settings.php`](routes/settings.php) |
| Usuários e autenticação | [`app/Models/User.php`](app/Models/User.php) |
| Equipes e associações | [`app/Models/Team.php`](app/Models/Team.php) |
| Diretório global | [`app/Http/Controllers/Directory/`](app/Http/Controllers/Directory/) |
| Persistência | [`database/migrations/`](database/migrations/) |
| Páginas Inertia | [`resources/js/pages/`](resources/js/pages/) |
| Testes automatizados | [`tests/`](tests/) |
