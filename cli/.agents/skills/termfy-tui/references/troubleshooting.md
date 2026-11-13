# Diagnóstico de TUI

Use com `termfy-tui`, as fontes em [opentui-sources.md](opentui-sources.md)
e a matriz de [testes](screen-tests.md). Reproduza com o menor exemplo que
preserve o comportamento antes de alterar componentes compartilhados.

| Sintoma | O que conferir | Correção a ensaiar |
| --- | --- | --- |
| Aba não aparece | Registro, id e ordem de `screens` | Registrar a instância e testar abertura direta |
| Legenda aparece, tecla não funciona | `keys` não registra handler | Implementar `onKey` e testar efeito observado |
| Digitar `q` fecha a TUI | Campo e handler global compartilham entrada | Integrar modo de edição e foco no host |
| Modificador não chega | `onKey` recebe só o nome | Transportar `KeyEvent` no contrato, com testes |
| Cabeçalho desaparece com lista longa | Crescimento e shrink do viewport | Preservar altura do cabeçalho e limitar ScrollBox |
| Item ativo fica fora da janela | Seleção e rolagem não acompanham | Usar `scrollChildIntoView` ou o helper existente |
| Resposta antiga substitui resultado novo | Consultas concorrentes | Cancelar e comparar geração |
| Processo continua após fechar | Timers ou serviços da aplicação | Cleanup em troca de aba e `destroy` |
| Evento executa duas vezes | Listener instalado a cada entrada | Remover listener anterior ou instalar uma vez |
| Frame contém valores da máquina | Configuração global usada no teste | Isolar diretório de configuração e restaurar ambiente |
| Texto alinha mal com acentos ou CJK | Comprimento JS tratado como células | Usar medição apropriada do terminal e testar caracteres |
| Falha de biblioteca nativa | Runtime, plataforma e pacote nativo | Conferir suporte e instalação, sem mascarar o erro |

## FFI e execução local

Na verificação deste material em Node.js 26.8.1 com OpenTUI 0.8.3, a criação
do renderer encontrou `OpenTUI native FFI is not available for this runtime
yet`. A importação e os tipos não demonstram que a biblioteca nativa foi
inicializada. Relate essa falha como limitação de execução; não substitua o
renderer por um mock e apresente o resultado como captura real.

O produto Termfy usa Bun. Execute os testes de frame num ambiente compatível
com as instruções do projeto. No Hub, os validadores desta biblioteca usam
Node.js e distinguem verificação de tipos de execução nativa.

## Relatório útil

Inclua versão exata do OpenTUI, runtime, sistema, dimensões, tema, ação que
reproduz o problema, resultado esperado, frame observado e stack trace sem
credenciais. Separe falha de serviço externo, erro de lógica e problema do
renderer. Depois da correção, repita o ensaio original e o de encerramento.
