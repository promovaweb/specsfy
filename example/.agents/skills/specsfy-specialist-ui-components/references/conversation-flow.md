# Fluxo de Conversa

Use este roteiro para ajudar o usuário a criar uma interface sem transformar a
conversa em um formulário longo.

## 1. Identificar a tela

Determine a categoria principal:

- página pública ou de apresentação;
- painel ou aplicativo autenticado;
- formulário ou fluxo de coleta;
- tabela/lista/dados;
- artigo ou conteúdo;
- componente isolado.

Se o usuário já colou um trecho de código, pule as perguntas de descoberta e
classifique o componente.

## 2. Definir objetivo

Pergunta útil:

> Qual é a ação principal que esta tela precisa gerar?

Exemplos:

- capturar uma oportunidade;
- vender plano;
- explicar produto;
- mostrar métricas;
- permitir edição;
- conduzir contato;
- navegar para conteúdo.

## 3. Definir usuário e densidade

Pergunta útil:

> Essa interface é para visitante público, cliente autenticado, operador interno
> ou administrador?

Use a resposta para decidir:

- público ou marketing → mais narrativa, prova visual e CTA;
- aplicativo interno → mais densidade, filtros, estados e navegação clara;
- administração → tabelas, selos, ações por linha e confirmações;
- integração inicial ou formulário → etapas, validação, progresso e feedback.

## 4. Escolher composição

Abra [composition-map.md](composition-map.md) e defina a hierarquia com
`$specsfy-specialist-interface` (modo ui).

Escolha uma sequência inicial e comunique de forma simples:

```text
Vou montar assim: destaque principal → benefícios → prova social → FAQ → rodapé.
```

Ou:

<!-- markdownlint-disable MD013 -->

```text
Vou montar assim: estrutura do aplicativo → filtros → tabela → detalhes → diálogos de ação.
```

<!-- markdownlint-enable MD013 -->

## 5. Escolher referências

Abra [catalog.md](catalog.md), liste apenas a família necessária e leia somente
os exemplos escolhidos.

Evite carregar todas as referências de uma skill grande.

## 6. Implementar por incrementos

Ordem sugerida:

1. estrutura de layout;
2. seções e componentes principais;
3. dados e estados;
4. ações e feedback;
5. responsividade e modo escuro;
6. acessibilidade;
7. validação.

## 7. Pedir confirmação apenas quando necessário

Não pergunte sobre detalhes cosméticos se o projeto já indica um padrão.

Pergunte quando houver risco de retrabalho alto:

- escolher entre painel e página de apresentação;
- escolher o framework ou a rota de destino;
- decidir se instala uma dependência;
- substituir o design system existente;
- introduzir biblioteca nova.
