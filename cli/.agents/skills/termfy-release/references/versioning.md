# Versão e notas da publicação

Leia o diff desde a última tag junto com `CHANGELOG.md`. O changelog resume
o efeito para quem usa o binário; a categoria da nota sozinha não determina
o incremento. Uma correção também pode alterar um contrato público.

## SemVer para o CLI

| Mudança desde a última versão | Incremento |
| --- | --- |
| Contrato público incompatível com scripts ou configuração existentes | major |
| Command, option, tool ou capacidade nova que preserva o uso anterior | minor |
| Correção compatível, documentação ou ajuste interno sem nova capacidade pública | patch |

Use o maior incremento presente no conjunto. De 1.4.2, patch resulta em
1.4.3, minor em 1.5.0 e major em 2.0.0. Zere os componentes seguintes.
Não confunda a versão do framework com a versão do binário derivado.

Antes de 1.0.0, siga a política declarada pelo projeto. Na ausência dela,
adote minor para incompatibilidades ou novas capacidades e patch para
correções compatíveis, como 0.6.1 para 0.7.0 ou 0.6.2. Descreva qualquer
incompatibilidade também nessa faixa; não use 0.x para ocultar uma migração.
A passagem para 1.0.0 anuncia a estabilidade do contrato público.

## Mudanças incompatíveis

| Alteração | Quem precisa adaptar o uso |
| --- | --- |
| Command removido ou renomeado | scripts que o chamam |
| Option renomeada ou removida sem alias compatível | chamadas que usam o nome anterior |
| Campo de `data` removido, renomeado ou com tipo diferente | consumidores de `--json` |
| Exit code alterado para a mesma situação | scripts que tratam esse retorno |
| Key de settings renomeada sem leitura ou migração do nome anterior | instalações com configuração persistida |
| Argument antes opcional passa a obrigatório | chamadas existentes sem esse argument |
| Padrão de uma option muda o resultado observável | chamadas que dependem do padrão |
| Tool MCP removida ou entrada obrigatória nova | clientes e agentes que usam a tool |

Confira `src/cli/registry.ts`, `src/app/exit-codes.ts` e
`src/config/settings.ts` ao revisar esses contratos. `Command`, `run`,
`data`, `text`, `ExitCode` e `SETTINGS_SCHEMA` são os nomes usados no código.
Aliases, campos antigos preservados e migração de settings podem manter a
compatibilidade; teste o uso anterior antes de classificá-lo como preservado.

## Keep a Changelog

Mantenha `Unreleased` para trabalho futuro. Use as categorias Adicionado,
Alterado, Obsoleto, Removido, Corrigido e Segurança quando houver
conteúdo, como no `CHANGELOG.md` do starter kit. Escreva as
notas em português, com o nome exato de commands, options e keys.

Exemplo de formato, com versão e data a substituir pelos valores reais:

```markdown
## [Unreleased]

## [0.6.2] - 2026-11-10

### Corrigido

- Corrige a leitura de settings existentes durante a inicialização.
```

O workflow procura o cabeçalho `## [X.Y.Z]` correspondente à tag e extrai
até a próxima versão. Não deixe essa seção vazia. Para mudança incompatível,
escreva a chamada antiga, a nova e como adaptar o arquivo ou script afetado.
