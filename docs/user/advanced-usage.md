# Uso avançado do Specsfy

Este guia reúne recursos usados depois da primeira spec: seleção de
especialistas, progresso em JSON, atualização visual e retomada de uma mudança
posterior. Para acompanhar os exemplos, conclua o
[primeiro projeto](getting-started.md), mantenha o CLI e o framework instalados
e execute os comandos na raiz do projeto consumidor.

## Detecte e instale orientação técnica

Comece com `skills detect` para ler as recomendações do catálogo sem alterar o
projeto:

```bash
specsfy skills detect --project .
```

Quando todas as recomendações forem aplicáveis, `--detected` instala o
framework e os especialistas em uma única execução. O `skills-lock.json`
registra os arquivos publicados:

```bash
specsfy install --project . --detected
```

Quando o catálogo listar tecnologias que não pertencem à aplicação, repita
`--specialist` somente com os nomes confirmados. Assim, o instalador publica as
bases e ignora as recomendações que não foram escolhidas:

```bash
specsfy install --project . \
  --specialist specsfy-specialist-laravel \
  --specialist specsfy-specialist-postgres
```

Em um projeto já preparado, acrescente somente os especialistas escolhidos com
`npx skills add`:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-laravel --agent universal --copy --full-depth
```

A detecção usa manifests, dependências e arquivos reconhecidos pelo catálogo.
O comando de instalação só deve ser executado depois da revisão. Os
especialistas orientam escolhas técnicas, mas não criam specs nem aprovam
gates.

## Automatize a leitura de progresso

```bash
specsfy progress --project . --json
specsfy progress --project . --watch --interval 0.5 --json
```

O JSON contém `summary` e `specs`. Com `--watch`, um snapshot novo aparece
somente quando o conteúdo das specs muda. Painéis podem consumir essa saída
para leitura, mas os gates continuam sendo editados apenas na `spec.md` pela
skill responsável.

## Ajuste a atualização visual

```bash
specsfy config show --project .
specsfy config set --project . --watch-interval 0.5
```

A configuração vive em `<projeto>/.specsfy/config.json` e preserva chaves
desconhecidas. Consulte todos os recursos no [guia do CLI](cli.md).

## Atualize sem perder customizações

```bash
specsfy update --project .
```

O CLI usa fingerprints para distinguir conteúdo gerenciado intacto de
customização local. Uma diferença local faz a atualização ou a remoção ser
recusada. Use `--force` somente depois de revisar a comparação e confirmar que
o conteúdo protegido pode ser descartado.

Quando o CLI foi instalado pelo npm, o comando abaixo atualiza o pacote
global:

```bash
specsfy upgrade
```

Quando a instalação usa o executável Node oficial, `specsfy upgrade` pode
substituí-lo automaticamente. Para fazer a troca manual, use o download e
restaure a permissão:

```bash
curl -fL get.specsfy.dev -o "$HOME/.local/bin/specsfy"
chmod +x "$HOME/.local/bin/specsfy"
```

## Incorpore uma mudança na spec

Quando surgir algo novo depois da definição, use a entrada explícita:

```text
Use $specsfy-update-spec em
specs/<estado>/<NNNN>-<slug>/spec.md:
quero adicionar, remover, corrigir ou mudar esta especificação.
```

Quando um requisito observável muda, a skill reabre a definição. O Definition,
o Plan e o Delivery Gate precisam de evidência nova. Quando apenas o plano
técnico muda, ela reabre o Ato II e o Ato III. A spec alterada invalida as
provas que dependiam da versão anterior e preserva tarefas e evidências ainda
compatíveis.

As skills fazem transições e retomadas na mesma conversa. Esse handoff não
amplia autorização para instalar, publicar, fazer deploy ou executar ação
destrutiva.

Consulte [Atualizar uma especificação](update-spec.md) para a classificação
completa e exemplos em linguagem comum.

## Limites

- `--force` pode descartar customizações protegidas.
- `--detected` depende do catálogo e do estado observado no projeto.
- A TUI e o progresso projetam estado, mas não substituem a spec.
- o especialista não substitui a confirmação da versão, das convenções e das
  falhas possíveis no projeto.

O resultado esperado é um projeto com especialistas escolhidos de forma
explícita, automação somente de leitura e gates coerentes com a versão atual da
spec.
