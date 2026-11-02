# Contribuir e modificar o framework

Este fluxo serve para agentes e humanos. Ele preserva ownership, evidência e
coerência entre metodologia, código, documentação e distribuição.

## 1. Localize o owner

| Mudança | Owner principal |
| --- | --- |
| método e skills base | `skills/` |
| especialista técnico | `specialists/` |
| CLI, TUI, instalador ou updater | `cli/` |
| documentação de uso | `docs/user/` |
| documentação técnica | `docs/develop/` |
| identidade | `brand/` |
| aplicação de validação | `example/` |
| contrato transversal | raiz e `tests/` |

Leia o `AGENTS.md` da raiz e do owner antes de editar. Git sempre é executado
na raiz única.

## 2. Carregue o menor contexto

Use [`context/README.md`](context/README.md). Leia arquitetura somente quando a
mudança altera componentes ou dependências. Leia dados quando houver
persistência ou privacidade. Leia engenharia para stack, pacotes, convenções ou
testes.

## 3. Defina o contrato observável

Para mudança de comportamento:

1. descreva o cenário BDD.
2. derive um teste TDD.
3. execute o teste antes da implementação.
4. confirme um RED causado pelo comportamento ausente.

Uma falha de import, ambiente ou fixture não é RED válido.

## 4. Implemente no owner

Faça a menor alteração coerente. Não mova responsabilidade apenas para reduzir
o diff. Se o contrato atravessar módulos, altere todos no mesmo commit.

Exemplos:

- novo campo de spec: template, validador, skills consumidoras e docs.
- novo comando: parser, implementação, testes, README do CLI e guia do usuário.
- nova regra de skill: `SKILL.md`, teste focal, metadata e referência aplicável.

## 5. Obtenha GREEN e refatore

Execute o teste focal até GREEN, refatore e repita. Quando a tarefa puder
alterar a interface, faça também a revisão visual durante o desenvolvimento,
mesmo sem pedido específico. Confira bordas, espaçamentos, margens, padding e
tipografia nos estados e viewports aplicáveis e registre o resultado no item
`VISUAL`. Depois rode a regressão do owner.

Skills:

```bash
npm run test:skills
node scripts/validate-skills.mjs skills/<skill>
```

CLI:

```bash
cd cli
npm ci
npm run build:executable
npm run check
./bin/specsfy --version
```

Especialistas:

```bash
npm run test:specialists
```

## 6. Atualize documentação

- mudanças de uso atualizam `docs/user/`.
- decisões e arquitetura atualizam `docs/develop/`.
- mudanças que afetam ambos atualizam os dois percursos.
- mudanças no contrato visual atualizam o design system, os especialistas e a
  documentação de uso e desenvolvimento aplicável.
- detalhes internos de `example/` permanecem em `example/README.md`.

Não copie inventários extensos de manifests, rotas ou schemas para a
documentação.

## 7. Execute a regressão integrada

Na raiz:

```bash
npm ci --ignore-scripts
npm test
npm run validate:skills
```

Revise `git diff --check`, links, imagens, status e artefatos derivados.

## 8. Entregue evidência

Uma entrega pronta informa:

- o comportamento alterado.
- o RED observado.
- os comandos verdes.
- documentação atualizada.
- falhas possíveis ou limites restantes.

Commits e push exigem escopo explícito. Release do CLI usa a skill local
`specsfy-release-cli` e não é consequência automática de uma mudança comum.
