# Gates de qualidade

## Conteúdo

- O arquivo declara `Formato: Specsfy/2.0` e preserva exatamente os três atos na ordem canônica.
- O problema, ator e resultado são explícitos.
- Escopo e fora de escopo não se contradizem.
- Métricas de sucesso têm alvo e método de observação.
- Termos canônicos são usados de modo consistente.
- Research distingue fatos confirmados, esclarecimentos, suposições e decisões.
- Research registra fontes, documentação consultada, dúvidas respondidas e dúvidas abertas.
- Toda API ou documentação externa consultada possui evidência em `research/`, com origem, versão/data, licença quando aplicável e caminho indexado no `spec.md`.

## Requisitos

- Cada requisito descreve uma obrigação, não uma solução vaga.
- Palavras como rápido, seguro, simples, escalável e intuitivo têm medida ou critério.
- Permissões, validação, erros, concorrência, limites e estados vazios aparecem quando relevantes.
- Requisitos não funcionais têm alvo e verificação.

## Comportamento

- Cada jornada P1 tem caminho feliz e falha relevante.
- Cada cenário BDD possui Given, When e Then observáveis.
- Cada `AC` referencia `US/FR/NFR` existentes.
- A feature inteira e cada `US`, `FR` e `NFR` possuem pelo menos três `AC`
  distintos declarados em `**Cobre**`.

## Implementabilidade

- O design técnico respeita o repositório existente.
- Plano, modelo de dados, estados, contratos e migrações estão decididos o suficiente para nomear arquivos em tarefas.
- Migrations, models, controllers/casos de uso, views, queries/repositórios e jobs têm responsabilidade, caminho e “Não aplicável” justificado quando ausentes.
- APIs expostas e externas registram versão, autenticação, entradas, saídas, erros e documentação consultada.
- Dependências externas incluem falha, timeout ou indisponibilidade quando material.
- Riscos e suposições não escondem decisões de alto impacto.

## Verificação

- A estratégia mantém o BDD como referência e separa os níveis executáveis de
  TDD: unidade, integração/contrato, browser e manual.
- A matriz liga `FR/NFR → AC/método → teste/comando → evidência`.
- A estratégia prevê pelo menos três casos TDD executáveis para a feature
  inteira e para cada `US`, `FR` e `NFR`.
- Tarefas `[TEST]` precedem tarefas `[CODE]` para o mesmo comportamento.
- `Plan Gate: Passed` exige que os predecessores TDD das tarefas `[CODE]`
  estejam concluídos com RED registrado.
- Verificação manual tem justificativa.
- Definition of Done pode ser provada por comandos ou evidências objetivas.
- Quando uma atestação for publicada, ela usa schema 2, digest da política
  executável, limites explícitos, commit e bindings com hashes de arquivos.
- Timeout usa código 124; saída truncada é marcada e não expõe bytes posteriores
  ao limite configurado.

## Fonte única

- O pacote `specs/<estado>/<NNNN>-<slug>/` contém somente o `spec.md` normativo e, quando necessário, `research/` com evidências não normativas.
- Não existem `plan.md`, `research.md`, `data-model.md`, `tasks.md` ou checklists paralelos.
- Gates e evidências vivem na seção 13 de `spec.md`.
- Tarefas e progresso vivem na seção 14 do mesmo arquivo.
- Os estados seguem `Draft → Defined → Planned → Implementing → Complete`;
  nenhum gate posterior permanece aprovado quando sua entrada é reaberta.
