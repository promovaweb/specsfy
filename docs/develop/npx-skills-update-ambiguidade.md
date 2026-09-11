# Diagnóstico: `npx skills update` pula skills do Specsfy por ambiguidade

## Resumo

Uma instalação nova das skills do Specsfy com `npx skills add` funciona normalmente, mas `npx skills update` executado imediatamente depois pode pular várias skills com a mensagem:

```text
Warning: Multiple current paths match these skills from promovaweb/specsfy;
skipping them rather than deleting or migrating the wrong skill
```

O problema foi reproduzido em um diretório temporário vazio, portanto não depende de um projeto consumidor antigo, de `skills-lock.json` legado ou dos symlinks de Claude Code.

## Reprodução mínima

```bash
TMP="$(mktemp -d)"
cd "$TMP"
git init -q

npx skills add promovaweb/specsfy
npx skills add promovaweb/specsfy/specialists
npx skills update
```

Na instalação testada, as duas chamadas de `add` instalaram 20 skills base e 38 specialists. Em seguida, o `update` reportou múltiplos caminhos para várias skills, incluindo:

```text
specsfy-01-inbox
specsfy-02-backlog
specsfy-03-specify
specsfy-04-validate
specsfy-05-tasks
specsfy-06-tdd-bdd
specsfy-07-implement
specsfy-aux-database
specsfy-aux-rules
specsfy-aux-stack
specsfy-documentator
specsfy-progress
specsfy-setup
specsfy-update-spec
```

O mesmo ocorre com diversos specialists.

## Evidência do lock

A instalação nova registra o caminho canônico corretamente. Exemplo:

```json
{
  "specsfy-05-tasks": {
    "source": "promovaweb/specsfy",
    "sourceType": "github",
    "skillPath": "skills/specsfy-05-tasks/SKILL.md"
  }
}
```

Portanto, o warning não decorre de ausência de `skillPath` no lock.

## Causa observada

O repositório contém o catálogo canônico e também snapshots instalados no projeto `example/`, com o mesmo `name` no frontmatter. Por exemplo:

```text
skills/specsfy-05-tasks/SKILL.md
example/.agents/skills/specsfy-05-tasks/SKILL.md
```

O `skills` atual faz uma checagem de relocação durante o update. Quando descobre mais de um caminho com o mesmo nome normalizado, classifica a skill como ambígua e falha fechado para não migrar/remover a origem errada.

Isso explica por que `npx skills add promovaweb/specsfy` consegue instalar corretamente a skill canônica, enquanto `npx skills update` pode recusá-la logo depois.

## Teste adicional

Também foi validado que reinstalar uma skill específica substitui corretamente a cópia local:

```bash
printf '\n# TESTE-TEMPORARIO-REFRESH\n' >> .agents/skills/specsfy-05-tasks/SKILL.md
npx skills add promovaweb/specsfy --skill specsfy-05-tasks
```

Depois da reinstalação, o marcador temporário desaparece. Assim, `add` continua sendo um workaround funcional para refresh das skills afetadas.

## Workaround atual

Enquanto a ambiguidade não for resolvida, um projeto consumidor pode manter a atualização geral com:

```bash
npx skills update
```

e forçar o refresh do Specsfy com:

```bash
npx skills add promovaweb/specsfy
npx skills add promovaweb/specsfy/specialists
```

## Possíveis caminhos de correção

Vale avaliar uma solução que preserve o projeto `example/` sem fazer seus snapshots competirem com `skills/` e `specialists/` na descoberta usada pelo updater. Algumas opções a investigar:

- tornar os snapshots de `example/.agents/skills/` invisíveis para descoberta externa, sem impedir o uso pelo próprio projeto de exemplo;
- ajustar a forma como o exemplo é materializado/armazenado para evitar nomes duplicados no repositório distribuído;
- ou, caso a correção pertença ao `vercel-labs/skills`, registrar upstream um caso em que existe `skillPath` exato no lock mas o update ainda falha fechado por um homônimo fora do catálogo canônico.

Este PR é deliberadamente de diagnóstico e reprodução. Ele não altera a semântica das skills nem escolhe unilateralmente qual das alternativas acima deve ser adotada.
