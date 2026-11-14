# UX Design

O especialista UX Design orienta o agente na descoberta e na estrutura da
experiência, das jornadas e da arquitetura da informação aos formulários e às
mensagens de erro. Ele conduz as perguntas sobre as telas e valida as
suposições com tarefas observadas.

## Quando usar

- Você vai estruturar uma jornada, a arquitetura da informação, um formulário,
  um onboarding ou as mensagens de erro.
- Há dúvida sobre o problema, a sequência, a linguagem ou a capacidade do
  público de concluir uma tarefa.
- Uma suposição de interação precisa de um protótipo descartável. Nesse caso,
  combine com o especialista Prototipação.

Acabamento visual com fluxo já validado fica com o especialista UI Design. Este
especialista cuida do que acontece antes dessa etapa.

## Como ele trabalha

1. Carrega o especialista Design System e lê o `DESIGNSYSTEM.MD`.
2. Pergunta, uma lacuna de cada vez, quais telas existem, como a informação
   percorre o fluxo e quais campos e validações entram no formulário.
3. Pergunta como cada ação abre (página, painel lateral, modal, área expandida
   ou outro formato) e aplica os defaults do `DESIGNSYSTEM.MD` quando você não
   indica uma direção visual.
4. Lê a stack e as telas existentes e identifica o que já aparece em cada tela
   afetada.
5. Formula a suposição de comportamento e define o público, a frequência e a
   consequência de uma falha.
6. Separa fato observado, inferência, suposição e preferência interna.
7. Escolhe um método de pesquisa proporcional à pergunta e ao impacto, com
   recrutamento, consentimento, roteiro e condição de parada.
8. Descreve a jornada atual com entradas, escolhas, esperas, erros, canais e
   passagens entre áreas, preservando as exceções importantes.
9. Prototipa na fidelidade mínima e conduz sessões com tarefas e instruções
   neutras.
10. Sintetiza os achados por comprovação, severidade, alcance e impacto,
    separando achado, interpretação, recomendação e questão aberta.

O especialista não escolhe painel lateral ou modal por preferência interna.
Ele registra a sua resposta e encaminha a composição ao especialista UI Design.

## Telas de um CRUD

A descoberta de um CRUD cobre:

- lista com linha clicável e estado vazio
- detalhe
- criação e edição em seções de duas colunas responsivas
- erro de campo
- ausência de permissão
- falha de carregamento

## Padrões aplicados

- A linguagem segue o domínio e a complexidade aparece aos poucos.
- O status do sistema, o próximo passo e a recuperação ficam visíveis.
- Cada informação é solicitada quando se torna necessária, com o motivo
  explicado.
- Ações triviais dispensam confirmação. O desfazer aparece quando é a opção
  mais segura.
- Os valores digitados são preservados depois de um erro, com a correção
  apontada junto do campo.
- O onboarding leva ao primeiro resultado útil em vez de um tour obrigatório.
- Dark patterns, urgência artificial e consentimento ambíguo ficam fora do
  produto.
- Todas as telas mantêm o `Breadcrumb` com o team ativo, o módulo e a tela
  atual.

## Erros que ele evita

- Perguntar se o público gostou ou mostrar a solução antes da tarefa.
- Transformar uma única sessão em conclusão geral.
- Recrutar só colegas ou especialistas quando o produto atende iniciantes.
- Entregar soluções sem ligar cada uma a um achado.
- Medir só o tempo, sem separar abandono, sucesso assistido e erro crítico.

## Como conferir o resultado

- Cada pergunta de pesquisa tem método, participantes e comprovação
  compatíveis com a escolha que orienta.
- Os achados levam a notas ou gravações consentidas. As recomendações levam
  aos achados.
- Públicos, dispositivos e tecnologias assistivas relevantes foram incluídos,
  com as lacunas de recrutamento registradas.
- Mudanças estruturais foram revalidadas com as mesmas tarefas principais.
- Uma experiência só é descrita como validada com comprovação observada e os
  limites da amostra.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-ux-design --agent universal --copy --full-depth
```

O catálogo instala junto o especialista Design System.

## Especialistas relacionados

- [ReUI](reui.md) compõe a interface React depois da jornada validada.
- [Experiência de Interface](interface-experience.md) coordena telas, ações e
  estados.
- [UI Design](ui-design.md) materializa a hierarquia visual.
- [Design System](design-system.md) define defaults e cenários de CRUD.
- [Prototipação](prototyping.md) cria o artefato mínimo para testar uma
  suposição.
- [Acessibilidade Web](web-accessibility.md) avalia conformidade e tecnologias
  assistivas.
- [Modelagem de Domínio](domain-modeling.md) alinha vocabulário e invariantes.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-ux-design/SKILL.md),
com a escolha de métodos de pesquisa e a avaliação de formulários no arquivo de
referência da mesma pasta.
