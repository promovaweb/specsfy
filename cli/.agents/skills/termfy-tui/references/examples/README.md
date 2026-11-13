# Exemplos de OpenTUI para o Termfy

Use com `termfy-tui` e [screen-tests.md](../screen-tests.md). Os exemplos são
receitas independentes, não abas registradas no starter kit.

## Arquivos e uso

| Arquivo | Finalidade | Como experimentar |
| --- | --- | --- |
| [overview-screen.ts](overview-screen.ts) | Painel informativo com valores injetados | `createOverviewScreen([["Service", "Catalog"]])` |
| [list-screen.ts](list-screen.ts) | Seleção, ativação e lista vazia | `createFilesScreen(["README.md", "package.json"])` |
| [latest-task.ts](latest-task.ts) | Cancelamento e descarte de resposta antiga | Injetar loader com `AbortSignal` e callback de estado |
| [async-screen.ts](async-screen.ts) | Carregamento, recarga, erro e cleanup | `createStatusScreen(async () => "Service available")` |
| [input-field.ts](input-field.ts) | Campo, validação e submissão | Montar `input` no host com modo de edição já integrado |
| [latest-task.test.ts](latest-task.test.ts) | Concorrência, saída, retorno e erro | Executar com Node.js com suporte a TypeScript |

## Instalar uma receita no projeto

Copie os arquivos escolhidos para `template/tui-recipes/` no projeto derivado;
os imports `../../src/tui/` foram escritos para esse destino. Para colocá-los
em outra pasta, ajuste esses imports. O diretório é uma sugestão de destino,
não um caminho que já exista em todo starter kit.

Crie uma instância da factory escolhida e registre-a na lista de telas.
Não registre todas as receitas automaticamente. Use o helper `latest-task.ts`
junto de `async-screen.ts`, mantendo o import relativo entre eles.

Os rótulos da interface são em inglês, conforme o starter kit. Comentários
destes arquivos explicam o material da skill em português. Ao incorporá-los
no produto, siga a convenção de comentários do repositório de destino.

## Cinco cenários para adaptação

1. **Serviço configurado:** mostre nome, endpoint público e estado pelo painel
   informativo. O cenário vazio usa `No configuration`.
2. **Arquivos disponíveis:** selecione um arquivo com as setas e confirme com
   Enter. Só a confirmação altera a linha `Opened`; mover não abre o arquivo.
3. **Estado remoto:** use o client existente do serviço, repassando o sinal.
   Pressione `r` para tentar novamente após erro.
4. **Nome obrigatório:** envie um valor vazio e confira a mensagem de validação;
   depois envie um nome válido e confirme uma única chamada ao callback.
5. **Resposta atrasada:** inicie duas consultas, devolva a segunda primeiro e
   confira que o resultado mais antigo não substitui a tela atual.

## Validação e limites

No Hub, `npm run validar:termfy-tui` copia as receitas para uma pasta
transitória dentro do starter kit, confere os tipos com suas dependências e
executa os testes do controlador em Node.js. A pasta é removida no fechamento.
O comando não registra abas nem atualiza skills instaladas.

A verificação de tipos não demonstra comportamento visual. Execute os ensaios
de frame e de terminal descritos em [screen-tests.md](../screen-tests.md).
O exemplo de campo não resolve sozinho o roteamento global: leia
[keyboard-and-forms.md](../keyboard-and-forms.md) antes da integração.
