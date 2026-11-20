# Arquitetura do Specsfy

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="../../../../brand/logo/icon.svg" type="image/svg+xml">
    <img src="../../../../brand/logo/icon.png" alt="Logo do Specsfy" width="128">
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

## Classificação

| Campo | Valor |
| --- | --- |
| Natureza | índice |
| Escopo | arquitetura transversal |
| Autoridade | roteamento arquitetural e invariantes vigentes |

## Papel

Rotear decisões arquiteturais e declarar invariantes do monorepo.

## Como usar

Leia antes de mudar módulos, dependências, integrações ou distribuição.

## Roteamento de arquitetura

| Assunto | Leia quando | Atualize quando |
| --- | --- | --- |
| [Responsabilidades](modules.md) | mover ownership | um módulo mudar |
| [Direção permitida](dependencies.md) | introduzir dependência | uma fronteira mudar |
| [Atualização remota](updates.md) | alterar o updater | origem ou confiança mudar |

## Visão arquitetural

O Specsfy é uma metodologia executável organizada em módulos de um único
monorepo.

```text
specsfy/ (tutorial) ─────► docs/ (documentação oficial)
         ├───────────────► skills/ (metodologia executável)
         └───────────────► specialists/ (contexto opcional)
cli/ (instalação/TUI) ──► skills/ + specialists/ + projeto consumidor
brand/ (identidade) ────► publicações
raiz (integração) ──────► testes transversais + CI
example/ (validação) ───► contratos do framework
```

`example/` é a aplicação interna usada para comprovar a integração.

Dentro da metodologia:

```text
input → inbox → backlog → spec única → gates → tarefas
      → BDD/TDD RED → entrega → evidência
                         ↑ update-spec ← pedido tardio
```

Os módulos compartilham raiz, remoto, histórico, issues, tags e releases Git.
O ownership de conteúdo continua delimitado por diretório.

## Integrações

O monorepo é publicado em
[`promovaweb/specsfy`](https://github.com/promovaweb/specsfy). GitHub Actions
executa os contratos locais como fronteira de CI. O CLI consulta a última GitHub Release do mesmo
repositório e baixa `skills/` e `specialists/` do mesmo checkout.

- Ferramenta externa indisponível não converte verificação ausente em sucesso.
- Rede, instalação global e escrita externa não são padrão dos scripts.
- Integração material futura ganha contexto próprio quando possuir fronteira de
  confiança independente.

## Invariantes transversais

- Cada fatia possui uma única `spec.md` normativa.
- Captura e backlog são entradas não normativas e preservam proveniência.
- Backlog não autoriza implementação.
- Gates comprovados controlam os três atos.
- BDD e TDD precedem mudança de produção.
- Pedido tardio entra por `update-spec`.
- Tarefas e evidências permanecem na spec.
- Contextos não duplicam comportamento de features.
- Todo conteúdo é versionado pela raiz Git única.
- Módulos não contêm `.git`, gitlinks ou submódulos próprios.
- `example/` valida. `docs/user/` orienta usuários e `docs/develop/` orienta
  contribuidores.
- `cli/` instala somente em projetos consumidores.

## Atualize quando

- a topologia, uma integração ou invariante mudar.

## Não use para

- inventariar arquivos.
- registrar comportamento exclusivo de uma feature.

## Fonte da verdade e precedência

Este índice governa a arquitetura vigente. Código, manifests e testes comprovam
o estado implementado. ADRs preservam motivação histórica.
