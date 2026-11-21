# Seleção de componentes shadcn/ui e ReUI

Em Laravel com React, use shadcn/ui e ReUI juntos. shadcn/ui fornece
primitives; ReUI fornece composições gratuitas para fluxos completos.

Toda tela deve renderizar `Breadcrumb` com o nome da equipe ativa, o módulo e a
tela atual. Em Laravel, reaproveite o componente existente do layout e passe os
itens pelas rotas e pela tipagem local.

| Necessidade | shadcn/ui | ReUI |
| --- | --- | --- |
| Ação | Button, Button Group, Toggle, Toggle Group | Button e ações compostas |
| Texto e formulário | Field, Input, Input Group, Textarea, Label, Checkbox, Radio Group, Switch | Form, Number Field, Phone Input, Autocomplete, Cascader |
| Seleção e datas | Select, Native Select, Combobox, Calendar, Date Picker, Slider | Date Selector, Filters, Tree |
| Dados | Table, Data Table, Pagination, Chart | Data Grid, Filters, Sortable, Timeline |
| Overlay | Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card | Dialog, Sheet e Frame |
| Navegação | Breadcrumb, Navigation Menu, Menubar, Tabs, Sidebar, Command | Navbar, Scrollspy, Icon Stack |
| Feedback | Alert, Badge, Empty, Progress, Skeleton, Spinner, Toast | Alert, Badge, Rating, Timeline |
| Estrutura | Card, Separator, Scroll Area, Resizable, Carousel | App Shell, Dashboard, Stats, List |
| Fluxos | Accordion, Collapsible, Stepper por composição | Stepper, Wizard, Onboarding |
| Conversa e agente | Message, Message Scroller, Bubble, Trace, Code Block, Questionnaire | Timeline, Code Block, File Upload |
| Arquivos e agenda | Attachment | File Upload, Event Calendar, Gantt, Kanban |

## Lista de primitives shadcn/ui

Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment, Avatar, Badge,
Breadcrumb, Bubble, Button, Button Group, Calendar, Card, Carousel, Chart,
Checkbox, Code Block, Collapsible, Combobox, Command, Context Menu, Data Table,
Date Picker, Dialog, Direction, Drawer, Dropdown Menu, Empty, Field, Hover Card,
Input, Input Group, Input OTP, Item, Kbd, Label, Marker, Menubar, Message,
Message Scroller, Native Select, Navigation Menu, Pagination, Popover,
Progress, Questionnaire, Radio Group, Resizable, Scroll Area, Select,
Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs,
Textarea, Toast, Toggle, Toggle Group, Tooltip, Trace e Typography.

Projeto novo desde julho de 2026 nasce em Base UI; a lista vale para Base UI,
Radix e React Aria, com API e atributos de estado próprios de cada base. Em
Base UI, `asChild` dá lugar a `render`.

Para cada tela, use primeiro a linha da tabela. Em seguida, consulte
[reui-components-free.md](reui-components-free.md) para a família ReUI e a documentação oficial para a API
atual do componente escolhido.

Fontes: <https://ui.shadcn.com/docs/installation> e
<https://reui.io/components>.
