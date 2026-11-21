# Padrões de acessibilidade web

## Escopo e conformidade

Registre antes da auditoria:

- WCAG e nível requerido, normalmente WCAG 2.2 A/AA quando aplicável;
- páginas, estados, idiomas e fluxos incluídos;
- browsers, viewports e tecnologias assistivas representativas;
- conteúdo ou integrações de terceiros fora do controle;
- método, data, evidência e limitações.

Conformidade é avaliada sobre páginas e processos completos no escopo. Um
componente isolado ou ferramenta automática não prova conformidade do fluxo.

## Matriz de critérios frequentes

| Superfície | Critérios e evidência prática |
| --- | --- |
| estrutura | 1.3.1/1.3.2: landmarks, headings, labels e ordem significativa |
| contraste | 1.4.3/1.4.11: texto, controles, estados e gráficos medidos |
| resize/reflow | 1.4.4/1.4.10/1.4.12: texto 200%, 320 CSS px e spacing |
| teclado/foco | 2.1.1/2.1.2, 2.4.3/2.4.7/2.4.11: fluxo sem armadilha |
| pointer | 2.5.1/2.5.2/2.5.7/2.5.8: alternativa, cancelamento e alvo |
| formulários | 3.3.1–3.3.8: identificação, prevenção e autenticação |
| widgets | 4.1.2: nome, papel, valor e estado calculados |
| status | 4.1.3: atualização anunciada sem mudança indevida de foco |

Use o texto normativo e o Understanding correspondente para interpretar
exceções; a tabela é roteador, não substituto da norma.

## Contratos de componentes

### Dialog

- botão de abertura tem nome útil;
- foco entra em elemento coerente com a tarefa;
- `Tab` e `Shift+Tab` permanecem no conteúdo modal;
- `Escape` fecha quando não destrói trabalho sem confirmação;
- título nomeia o dialog e o foco retorna ao disparador válido.

### Menu, disclosure e tabs

Não confunda padrões. Navegação expansível costuma ser disclosure, não menu de
aplicação. Implemente teclas e relações do APG apenas quando o papel escolhido
corresponder ao comportamento completo.

### Combobox

Mantenha valor, opção ativa, popup e estado expandido sincronizados. Autocomplete
não pode impedir texto livre quando o contrato permite valores não listados.

### Formulário

- `label` visível e programaticamente associado;
- instruções e formato antes do erro;
- `aria-describedby` ou relação equivalente para ajuda/erro;
- erro contextual e resumo navegável quando há múltiplos campos;
- entrada válida preservada e foco movido somente quando ajuda a recuperação.

## Conteúdo dinâmico

- Use região de status para confirmação não intrusiva; alertas assertivos ficam
  reservados a informação urgente.
- Não anuncie cada tecla, progresso irrelevante ou atualização repetitiva.
- Após navegação client-side, atualize título e posicione foco em um ponto que
  comunique o novo contexto quando necessário.
- Em remoção do elemento focado, escolha destino lógico próximo e previsível.
- Loading precisa comunicar espera sem tornar conteúdo inerte indefinidamente.

## Visual e entrada

- Contraste de texto normal AA: pelo menos 4.5:1; texto grande: 3:1.
- Componentes e objetos gráficos necessários: pelo menos 3:1 contra cores
  adjacentes conforme o critério aplicável.
- Reflow: teste largura equivalente a 320 CSS px para conteúdo vertical,
  respeitando exceções normativas como tabelas que exigem duas dimensões.
- Target size mínimo de WCAG 2.2 AA: 24 por 24 CSS px ou espaçamento/exceção
  admitidos pelo critério.
- Não dependa só de drag, hover, orientação, movimento ou gesto multiponto.
- Respeite `prefers-reduced-motion` e valide forced colors sem remover outline.

## Matriz de testes

1. sem mouse: Tab, Shift+Tab, Enter, Space, Escape e setas conforme o widget;
2. browser zoom e resize/reflow, sem esconder overflow;
3. contraste calculado e inspeção em forced colors;
4. accessibility tree para nome, papel, estado e relações;
5. automação axe/linter para classes detectáveis de erro;
6. leitor de tela + browser definidos pelo projeto nos fluxos críticos;
7. conteúdo longo, idioma, erro, loading e permissão negada.

Documente resultado por critério com reprodução, impacto, localização, correção
proposta e evidência do reteste.

## Fontes primárias

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Understanding WCAG 2.2: https://www.w3.org/WAI/WCAG22/understanding/
- WAI-ARIA 1.2: https://www.w3.org/TR/wai-aria-1.2/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- HTML Accessibility API Mappings: https://www.w3.org/TR/html-aam-1.0/
- Accessible Name and Description Computation: https://www.w3.org/TR/accname-1.2/
- WAI Forms Tutorial: https://www.w3.org/WAI/tutorials/forms/
