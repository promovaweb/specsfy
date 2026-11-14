# Arquitetura de Software

O especialista Arquitetura de Software orienta o agente em escolhas
estruturais difíceis de reverter, como um serviço novo, uma fila, um cache
distribuído ou a direção de uma dependência entre módulos. A comparação usa
cenários mensuráveis de qualidade e fica com a menor estrutura capaz de
atender a todos eles.

## Quando usar

- Você vai introduzir um serviço, uma fila ou um cache distribuído.
- A tarefa muda o limite entre módulos ou a direção de uma dependência
  estrutural.
- Um atributo de qualidade, como latência, disponibilidade ou consistência,
  precisa orientar a escolha de forma explícita.

Renomear, mover arquivos ou refatorar localmente é manutenção. Quando o limite
em discussão é um conceito de negócio ainda não modelado, o especialista
Modelagem de Domínio entra primeiro.

## Como ele trabalha

1. Define a finalidade do sistema, as restrições de orçamento e de prazo, os
   desenvolvedores disponíveis e os cenários de qualidade mensuráveis.
2. Descreve o estado atual: responsáveis por cada base, dependências entre
   módulos, fluxos principais em runtime e os pontos de dor.
3. Identifica as forças em conflito, as escolhas caras de reverter e as
   consequências de cada caminho.
4. Compara as opções pelos mesmos cenários e pelo custo operacional de cada
   uma, incluindo rede, consistência distribuída e observabilidade.
5. Escolhe a menor estrutura que atende aos cenários.
6. Define o plano de transição, com compatibilidade durante a migração,
   observabilidade e um rollback viável.
7. Registra a escolha em um ADR e verifica os limites com testes de
   dependência ou análise estática, quando possível.

## Padrões aplicados

- Cada módulo tem responsabilidade, armazenamento e interface claros.
- As dependências apontam das partes voláteis para as estáveis. O módulo de
  negócio não depende de detalhes de framework ou infraestrutura.
- Serviço, fila, cache ou abstração nova exige um cenário consumidor
  mensurável.
- A arquitetura implementada e a arquitetura desejada são descritas
  separadamente.
- Cada atributo de qualidade vira um cenário com estímulo, ambiente, resposta
  e medida, como "sob 200 req/s, p99 abaixo de 300 ms".
- Escolhas fáceis de substituir ficam locais. Só as escolhas caras de mudar
  ganham um ADR.
- A evolução acontece por etapas verificáveis, como strangler fig e expand e
  contract, em vez de uma reescrita completa.

## Erros que ele evita

- Adotar microsserviços sem um cenário de escala ou de deploy independente que
  justifique o custo.
- Módulos sem limites nem direção de dependência, chamando uns aos outros
  livremente.
- Projetar uma arquitetura para o futuro sem um cenário mensurável.
- Criar uma camada genérica de indireção com um único consumidor.

## Como conferir o resultado

- Caminhos principais, modos de falha, consistência e capacidade foram
  avaliados contra os cenários definidos.
- Testes de arquitetura ou de dependência mantêm a direção escolhida, quando a
  ferramenta permite.
- A migração foi ensaiada, com rollback testado.
- Os impactos em segurança, banco de dados e operação fazem parte da escolha.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-software-architecture \
  --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Pesquisa Técnica](technical-research.md) reúne comprovação primária sobre
  limites e compatibilidade externa.
- [Modelagem de Domínio](domain-modeling.md) define os limites do negócio.
- [Engenharia de Entrega](delivery-engineering.md) planeja rollout e rollback
  da migração.
- [Performance](performance-engineering.md) entra quando o atributo em
  discussão é latência ou capacidade.
- [Code Review](code-review.md) confere se o código respeita os limites
  escolhidos.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-software-architecture/SKILL.md),
com visões arquiteturais, formato de ADR e atributos de qualidade no arquivo de
referência da mesma pasta.
