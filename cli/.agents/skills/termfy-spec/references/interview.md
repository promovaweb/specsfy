# Entrevista de uma spec

Pergunte em blocos e confirme cada bloco em uma frase antes do próximo.
Quando houver escolha, ofereça até três caminhos com o recomendado primeiro
e aceite uma resposta livre. O `CLISPEC.md` já descreve o binário; aqui o
assunto é uma evolução.

## 1. Objetivo

- O que a pessoa quer conseguir fazer que hoje não consegue?
- Quem usa: alguém no terminal, um script ou CI, um agente?
- O que fica fora desta spec, mesmo que pareça próximo?

Preenche: `## Goal`. Se o pedido junta capacidades independentes, proponha
specs separadas.

## 2. Comportamento

Peça um exemplo concreto de uso, do jeito que a pessoa digitaria ou
pediria ao agente:

- Que comando ela roda, com quais valores? O que espera ver na tela?
- Um script vai ler a saída? Quais campos ele precisa no `--json`?
- O que pode dar errado (sem credencial, item inexistente, serviço fora do
  ar, entrada inválida)? O que a pessoa deve ver em cada caso?
- Precisa de confirmação ou de terminal? Qual a saída não interativa
  (`--yes`, `--stdin`)?
- Na TUI: o que aparece de relance, que teclas fazem o quê?
- Para um agente: que pergunta ele responde ou que ação executa?

Preenche: `## Behavior`, em fluxos e exemplos com saída e exit code.

## 3. Superfície

Traduza o comportamento em entradas, com nomes em inglês:

- Commands: caminho (`orders export`), função, arguments, options com
  tipo, padrão e valores aceitos, `data` do `--json`, exit codes,
  credenciais e se pede confirmação. Recomende `recurso verbo` quando
  houver mais de uma ação sobre o mesmo recurso.
- Screens: id, função, painéis e teclas.
- Tools MCP: nome em `snake_case`, o command que espelham, entrada, saída
  e efeito (`read`, `write` ou `network`). Dados passivos viram resource
  com URI.
- Settings e credenciais novas.
- O que muda ou sai de entradas que o `CLISPEC.md` já tem.

Preenche: `## Surface`, um item por entrada, começando por Adiciona,
Altera ou Remove. Mostre a lista à pessoa.

## 4. Dados e integrações

- Algum serviço externo novo? Endpoint, autenticação, limites de uso,
  paginação.
- Que credencial ele usa e como a pessoa a obtém?
- A evolução precisa guardar dados entre execuções? Pergunte só quando o
  comportamento sugerir (histórico, cache, fila, registro próprio). O
  padrão é não guardar.
- Se precisar: que dados, quais consultas, por quanto tempo. O banco fica
  em `~/.<bin>/data.db` e muda só por migration embutida no binário.

Preenche: credenciais e settings em `## Surface`; com banco, as tabelas
em Surface (nome, colunas, tipo, chave primária e `NOT NULL`) e as notas
de dados para o Design.

## 5. Desenho do código

Proponha o Design e peça a opinião da pessoa, com o recomendado primeiro:

- Arquivos novos e alterados em `src/`, um por command, screen e grupo de
  tools.
- Funções compartilhadas: onde fica a lógica que CLI, MCP e TUI chamam.
- Client HTTP (`termfy-api`) ou repositório SQLite (`termfy-database`),
  quando houver.
- Tabelas, colunas e a migration nova, quando houver banco.
- Dependências novas e o motivo; prefira o que o Bun já oferece.
- Tratamento de erro: que `AppError` e qual exit code em cada falha.

Preenche: `## Design`.

## 6. Aceite

- Como a pessoa vai saber que está pronto? Que comando ela roda e o que
  espera ver?
- Que caso de erro precisa estar coberto?

Preenche: `## Tests`, um item `- [ ]` por teste de aceite, e `## Tasks`,
um item `- [ ]` por entrega, com a tag da skill responsável no fim. Cite
pelo nome cada item de Surface em ao menos uma tarefa ou teste.

## Fechamento

Releia a spec com a pessoa, faça a conferência manual de
`spec-contract.md`, registre as dúvidas em `## Notes` e indique a skill
da primeira tarefa.
