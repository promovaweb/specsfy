# Design modern unix para a TUI

O visual segue a geração de ferramentas de terminal como lazygit, bottom,
gitui, k9s e o próprio OpenCode: denso, legível, com hierarquia feita por
cor e peso em vez de espaço em branco.

## Estrutura fixa da tela

Esquema ilustrativo com rótulos traduzidos; a interface do binário usa inglês.

```text
▌ Título v<version>   │  descrição em uma linha            linux-x64 • Bun 1.4.4 
──────────────────────────────────────────────────────────────────────────────
 Overview      About
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ╭─ Painel em foco ──────────────────────╮╭─ Painel ───────────────────────────╮
 │ rótulo      valor                     ││ rótulo     valor                   │
 │ rótulo      valor                     ││                                    │
 ╰───────────────────────────────────────╯╰────────────────────────────────────╯
  ←/→  aba   1-9  ir   ?  ajuda   q  sair
```

1. Cabeçalho de uma linha: glifo de marca em acento, título em negrito,
   versão apagada, descrição que encolhe sem quebrar, plataforma à direita.
2. Filete na cor da borda separando cabeçalho e abas.
3. Abas horizontais (`TabSelectRenderable`) com sublinhado na aba ativa.
4. Conteúdo em painéis com borda arredondada e título na borda.
5. Barra inferior com teclas em bloco invertido e ação ao lado.

## Paleta

Dois temas em `src/tui/theme.ts`. Papéis:

| Papel | Uso |
| --- | --- |
| `background` | fundo geral |
| `surface` | fundo dos painéis |
| `surfaceHigh` | aba ativa, caixa de ajuda |
| `border`, `borderActive` | borda normal e do painel em foco |
| `text`, `textDim`, `textStrong` | valor, rótulo, título |
| `accent` | o que está ativo ou é ação |
| `accentSecondary` | links, origens externas |
| `ok`, `warn`, `error` | estado, nunca decoração |
| `barBackground`, `barText`, `keyBackground`, `keyText` | barra inferior |

A paleta `night` parte do Tokyo Night; a `day` parte do Tokyo Night Day.
Mantenha contraste mínimo 4.5:1 entre `text` e `surface`.

## Tipografia de terminal

- Rótulos à esquerda, apagados, alinhados pela maior chave; valores à
  direita, em `text`. Use `keyValueTable`.
- Títulos de seção dentro do painel em `textStrong` negrito.
- Listas com `•` em acento ou `→` para comandos.
- Nada em caixa alta além de siglas.
- Glifos de uma célula apenas. Evite emoji: largura varia por terminal.

## Movimento e estado

- Nenhuma animação contínua. Atualize só quando houver dado novo.
- Estado por cor: `ok` verde, `warn` âmbar, `error` vermelho, sempre
  acompanhado de texto, nunca só pela cor.
- Painel em foco recebe `borderActive` e título em `accent`.

## Densidade

- Sem gap entre painéis vizinhos.
- Padding horizontal de uma célula; vertical zero.
- Linha superior com altura automática; linha inferior com `flexGrow: 1`.
- Larguras fixas só em painéis laterais (46 a 58 colunas); o principal cresce.

## Texto longo

- Valores em uma linha usam `wrapMode: "none"` e recortam na borda.
- Descrições usam `wrapMode: "word"` em painéis com altura automática.
- URLs longas vão em linha própria, em `textDim`, abaixo do rótulo.

## Checklist de revisão

- [ ] Nenhuma cor literal fora de `src/tui/theme.ts`.
- [ ] Nenhum `console.log`.
- [ ] Barra inferior lista as teclas da tela.
- [ ] Frame de teste em 110×30 sem texto cortado em rótulos.
- [ ] Funciona com `tui.theme = day`.
