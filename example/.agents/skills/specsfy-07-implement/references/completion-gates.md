# Gates de conclusão

## Por tarefa

- Dependências estão concluídas.
- Resultado descrito existe no caminho indicado.
- IDs referenciados continuam válidos.
- Teste focal observou RED quando o comportamento era novo.
- O Gherkin da spec foi usado como referência para desenhar o teste TDD; nenhum
  `.feature` foi criado ou executado.
- Cada caso TDD identificado por seu próprio `SPECSFY:` observou RED e depois
  GREEN; a feature inteira e cada `US`, `FR` e `NFR` possuem ao menos três.
- Teste focal e regressão relacionada estão verdes.
- Checkbox mudou somente após a verificação.
- Os seis itens `PREP/EXECUTE/VERIFY/VISUAL/EVIDENCE/IMPROVE` estão concluídos
  nessa ordem e refletem resultados reais. `VISUAL` registra a conferência de
  bordas, espaçamentos, margens, padding e tipografia quando a tarefa altera a
  interface, mesmo sem pedido específico.
- O pai foi concluído somente depois dos seis itens.
- Toda tarefa `[MIGRATION]` possui arquivo versionado, comando de aplicação com
  saída zero e consulta de estado com saída zero.
- A micro-retrospectiva registrou melhoria aplicada ou ausência justificada.

## Por história

- O teste independente da história foi executado.
- A história possui ao menos três `AC` e três casos TDD distintos.
- Todos os cenários `AC` da história têm evidência.
- Caminhos de erro e permissão relevantes foram exercitados.
- A história entrega valor sem depender de uma história de prioridade menor, salvo decisão explícita.

## Final

- `Definition Gate` e `Plan Gate` permanecem `Passed`; `Delivery Gate` só muda
  para `Passed` depois das evidências abaixo.
- A seção `14. Tarefas` de `specs/<estado>/<NNNN>-<slug>/spec.md` não possui tarefas abertas.
- A suite completa, lint, tipos e build disponíveis passam.
- Rastreabilidade não possui gaps automatizáveis.
- NFRs têm medição ou evidência documentada.
- Não há placeholder, teste pulado ou mudança de escopo escondida.
- O código observado corresponde à versão atual da fonte única `specs/<estado>/<NNNN>-<slug>/spec.md`.
- Nenhuma alteração estrutural do banco ficou sem sua tarefa `[MIGRATION]`, e
  todas as
  migrations planejadas foram aplicadas e conferidas no banco de teste.
