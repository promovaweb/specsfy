# Padrões do ReUI

ReUI segue o modelo shadcn de código copiado e mantido pelo projeto. O registry
resolve dependências, mas cada arquivo instalado passa a integrar o código do
produto.

Tokens adicionais usados pelo ReUI: `--destructive-foreground`, `--info`,
`--info-foreground`, `--success`, `--success-foreground`, `--warning`,
`--warning-foreground`, `--invert` e `--invert-foreground`.

Use esses tokens no CSS global somente quando houver componentes que os
consomem. Preserve a definição de tema claro e escuro do projeto.

O agente pode consultar a documentação e exemplos reais, mas nunca inventa
props. Para cada componente, leia sua página no registry antes da adaptação.

Fontes oficiais: <https://reui.io/docs/get-started>,
<https://reui.io/docs/styling>, <https://reui.io/docs/agent-skills> e
<https://reui.io/components>.
