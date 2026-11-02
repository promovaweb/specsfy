# Guia de desenvolvimento do Specsfy

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

Este percurso explica como o framework funciona por dentro e como modificá-lo
sem romper a metodologia. Ele é destinado a agentes e humanos que contribuem
com skills, CLI, documentação, especialistas, identidade ou testes.

Para aprender a usar o produto em um projeto consumidor, siga o
[guia do usuário](../user/README.md).

## Leitura inicial

| Preciso entender… | Documento |
| --- | --- |
| atos, gates, estados e fonte normativa | [Metodologia](methodology.md) |
| captura sem perguntas e templates centrais | [Skills](skills.md) |
| como preparar e entregar uma contribuição | [Contribuir](contributing.md) |
| contrato, estrutura e orquestração das skills | [Skills](skills.md) |
| instalação, catálogo, TUI, progresso e updater | [CLI](cli.md) |
| modelo, sincronização e entrevistas de milestones | [Milestones](milestones.md) |
| módulos e ownership do monorepo | [Módulos](modules.md) |
| como manter esta documentação | [Documentação](documentation.md) |
| decisões transversais vigentes | [Roteador de contexto](context/README.md) |
| motivação histórica | [Decisões arquiteturais](decisions/README.md) |

## Para agentes

1. leia o `AGENTS.md` da raiz e do módulo afetado.
2. use o [roteador de contexto](context/README.md) para carregar somente as
   decisões relevantes.
3. trate código, testes, manifests e schemas como evidência do estado
   implementado.
4. preserve `spec.md` como fonte normativa em projetos consumidores.
5. observe RED antes de mudar o comportamento.
6. atualize documentação e testes no mesmo diff.

## Para humanos

O mesmo percurso serve para revisão de design e código. Comece por
[Metodologia](methodology.md), identifique o owner em
[Módulos](modules.md) e use [Contribuir](contributing.md) como checklist de
execução e regressão.

## Contexto técnico

O diretório [`context/`](context/README.md) contém unidades normativas pequenas:

- arquitetura, módulos, dependências e integrações.
- stack, pacotes, convenções e testes.
- persistência, privacidade e retenção.
- design system, padrões CRUD e owners de interface.
- fluxos que atravessam módulos.
- glossário e finalidade do produto.

Esses documentos fornecem contexto para contribuir, implementar ou modificar o
framework. Eles não substituem uma spec de feature nem duplicam inventários do
código.

## Validação rápida

Na raiz do monorepo:

```bash
npm ci --ignore-scripts
npm test
npm run validate:skills
```

Cada módulo possui comandos adicionais em seu `AGENTS.md`.
