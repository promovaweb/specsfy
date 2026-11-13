# Teclado, foco e formulários

Leia com `termfy-tui`, [Keyboard](opentui/core-concepts/keyboard.mdx),
[Interaction](opentui/core-concepts/interaction.mdx) e os tipos de
`InputRenderable`. Use os testes de integração de [screen-tests.md](screen-tests.md).

## O host atual

`mountTui` mantém o `TabSelectRenderable` em foco e encaminha somente
`key.name` para `Screen.onKey`. A tela não recebe `ctrl`, `shift`, `meta`,
texto colado nem o evento completo. O retorno `true` interrompe o handler do
Termfy, mas não equivale por si só a cancelar todos os listeners do OpenTUI.

Por isso, um formulário não fica pronto apenas ao montar `InputRenderable`.
É preciso coordenar o foco do seletor de abas, o campo e os atalhos globais.
Não escreva um handler que espere o nome `ctrl+s`: confira o `KeyEvent` da
versão instalada e adapte o contrato do host para transportar o evento.

## Navegação e edição

| Modo | Foco | Teclas a conferir |
| --- | --- | --- |
| Navegação | Aba ou lista ativa | Setas, dígitos, Tab, ajuda e saída |
| Edição | Campo atual | Letras, números, setas do cursor, colagem e Enter |
| Confirmação | Ação ou diálogo ativo | Confirmar, cancelar e retorno ao foco anterior |

O significado de Esc precisa aparecer na spec. Em edição ele pode cancelar
o campo; fora dela, o host atual encerra a TUI. O mesmo vale para Tab: hoje
troca de aba, mas um formulário pode precisar circular entre campos.

## Integração de um campo

1. Crie o campo com as cores do tema e uma largura delimitada.
2. Defina a entrada e a saída do modo de edição no host. Guarde o foco anterior.
3. Mova o foco para o campo e evite que a mesma tecla também acione a navegação.
4. Use `InputRenderableEvents.INPUT` para acompanhar alterações quando a API
   instalada oferecer esse evento. Confira `CHANGE` e `ENTER` separadamente;
   não assuma que os três eventos significam submissão.
5. Valide o valor no serviço do domínio. Mostre o erro junto do campo e
   preserve o texto para correção.
6. Ao salvar, impeça submissões simultâneas. Ao cancelar, restaure valor e foco
   conforme o comportamento definido, sem chamar a ação de persistência.
7. Remova listeners no teardown. Teste retornar à aba sem duplicar handlers.

O exemplo `input-field.ts` monta apenas o componente e seus eventos. Ele
não modifica o roteamento de teclas do host. Essa fronteira é intencional.

## Cinco ensaios necessários

- Digite `q`, `?`, `1` e `[` no campo; devem entrar como texto no modo de
  edição sem sair da aplicação nem mudar de aba.
- Use setas para mover o cursor; a seleção das abas deve permanecer igual.
- Cole várias palavras e caracteres acentuados; confira o valor recebido.
- Cancele um formulário inválido; nenhuma gravação deve ocorrer.
- Abra, feche e reabra o campo; uma submissão deve chamar o serviço uma vez.

Mouse é uma alternativa de entrada. Toda ação importante também precisa de
um percurso por teclado, com foco visível e indicação textual de estado.
