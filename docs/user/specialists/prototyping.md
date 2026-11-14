# Prototipação

O especialista Prototipação orienta o agente a construir protótipos
descartáveis que respondem a uma pergunta técnica, de interação ou visual. O
protótipo tem escopo e prazo definidos, termina com uma resposta registrada e
não vira código de produção.

## Quando usar

- Uma pergunta específica só pode ser respondida com confiança por algo
  executável.
- Você quer comparar duas ou mais alternativas concretas antes de uma escolha
  difícil de reverter.

Quando a resposta já está documentada em uma fonte primária, o especialista
Pesquisa Técnica resolve a dúvida com menos esforço. O protótipo também não é
promovido a produção, porque deixa de lado testes, tratamento de erro e
segurança de propósito.

## Como ele trabalha

1. Formula uma única pergunta e a condição que decide a resposta antes de
   escrever código.
2. Define o que precisa ser real (o mecanismo testado) e o que pode ser
   simulado.
3. Escolhe a fidelidade mínima, um prazo explícito e um local descartável.
4. Constrói mais de uma alternativa quando a comparação direta informa melhor.
5. Executa o cenário planejado e coleta comprovação observável.
6. Responde à pergunta como aceita, rejeitada ou inconclusiva e registra as
   limitações do teste.
7. Descarta o protótipo ou o arquiva como código fora de produção, sem
   dependências de runtime apontando para ele.

## Padrões aplicados

- Uma demonstração convincente não prova concorrência, escala, erro ou
  segurança que não foram exercitados.
- Registros de produção, credenciais e integrações reais ficam fora do
  protótipo, salvo quando a pergunta exige esse teste, com escopo e
  autorização.
- Protótipos de interface usam conteúdo realista e estados extremos, como
  texto longo, lista vazia e erro.
- Protótipos de lógica expõem transições e invariantes em uma interface
  mínima, como uma CLI ou um teste executável.
- Abstração, cobertura de testes e acabamento visual entram apenas quando a
  pergunta exige.
- O código fica em um diretório isolado, com nome inequívoco e sem export
  público, para impedir imports acidentais.
- O aprendizado vira requisito, escolha registrada ou teste na spec, em um ADR
  ou no backlog.

## Erros que ele evita

- Deixar um protótipo temporário em produção porque funcionou na demonstração.
- Testar várias perguntas no mesmo protótipo.
- Investir em acabamento quando a pergunta era sobre a viabilidade de um
  mecanismo.
- Reaproveitar o arquivo do protótipo como base do código de produção.

## Como conferir o resultado

- A condição de escolha foi definida no início e o resultado pode ser
  reproduzido com o mesmo cenário.
- A pergunta tem resposta explícita. Se ela ficou inconclusiva, o registro diz
  o que falta para decidir.
- As limitações do protótipo e as diferenças em relação à produção estão
  registradas.
- Nenhum artefato do protótipo continua ligado ao runtime final, conforme
  verificado no código.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-prototyping --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Pesquisa Técnica](technical-research.md) responde a perguntas com fontes
  primárias, sem construir nada.
- [Modelagem de Domínio](domain-modeling.md) transforma um conceito revelado
  pelo protótipo em modelo.
- [UX Design](ux-design.md) e [UI Design](ui-design.md) entram quando um
  protótipo de interface exige rigor de fluxo ou de hierarquia visual.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-prototyping/SKILL.md),
com níveis de fidelidade por tipo de pergunta no arquivo de referência da
mesma pasta.
