# Padrões comuns de interface

Revisado em 2026-11-20 contra: WCAG 2.2 (atualização de dezembro de 2024, ISO/IEC 40500:2025) e WAI-ARIA APG.

- Antes de propor uma tela, confirme o sistema que já atende a tarefa: rotas,
  stack, componentes, permissões, estados e testes. Use a linguagem do domínio
  e preserve o contexto da navegação.
- Aplique as regras macro de `DESIGNSYSTEM.MD`, registre telas e componentes
  em `INTERFACE.md` e mantenha as decisões da entrega na spec. Registre o
  alcance de qualquer exceção e a regra substituída.
- Descreva cada estado com informação disponível, ação possível, feedback,
  foco e caminho de recuperação. Valide os caminhos completos de sucesso e
  falha, incluindo as barreiras de acesso e permissão.
- Compare telas com conteúdo real, pelo menos nos viewports estreito e largo
  suportados. Registre método, achados e ajustes da conferência visual em
  `VISUAL` antes de `EVIDENCE`.

## Referências por modo

| Modo | Abra quando precisar de |
| --- | --- |
| discovery | [Inspeção de rotas, telas e testes](discovery.md) |
| system | [Regras macro, defaults e cenários de SaaS](system.md) |
| ux | [Pesquisa, tarefas, formulários e onboarding](ux.md) |
| ui | [Matrizes de shell, layout, dados, estados e revisão](ui.md) |
| accessibility | [Critérios WCAG, contratos de componentes e testes](accessibility.md) |

## Fontes oficiais

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG 2, visão geral e versões](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [USWDS Design Principles](https://designsystem.digital.gov/design-principles/)
