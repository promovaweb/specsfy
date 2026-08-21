---
name: specsfy-specialist-rls-review
description: Auditar Row Level Security de forma adversarial e provar o isolamento entre tenants com pgTAP executável, atacando políticas, grants, funções SECURITY DEFINER e views como um usuário real de outro tenant. Use quando o pedido for revisar RLS, auditar isolamento entre contas, responder se um usuário alcança dados de outra conta, ou depois de qualquer migration que toque política, grant, função SECURITY DEFINER ou view; não use para escrever a primeira política nem para modelar schema e índice, use `$specsfy-specialist-supabase` e `$specsfy-specialist-postgres` nesses casos.
---

# Revisão adversarial de RLS

Quem revisa assume o papel de tenant hostil: a tarefa é **escapar da própria
conta**, ler, escrever ou apagar linhas de outro tenant, e insistir até
conseguir ou até esgotar cada classe de ataque. A revisão não valida o schema,
tenta quebrá-lo, e **prova cada conclusão com um teste que roda**.

O princípio a preservar é um só: leitura estática é hipótese, ataque pgTAP que
passa é prova. Uma política que *parece* segura não está segura até que uma
sonda entre tenants, executada como o usuário atacante, deixe de alcançar o
dado. Nunca assine um isolamento que você apenas leu.

## Quando usar

- Acionar quando o diff contiver `create policy`, `alter policy`, `grant`,
  `enable row level security`, função `security definer` ou view sobre tabela
  com RLS.
- Acionar também quando a pergunta for operacional: "um usuário consegue ver os
  dados de outra conta?", "este endpoint vaza entre tenants?".
- Não acionar para escrever a primeira política, modelar o schema ou escolher
  índice: use `$specsfy-specialist-supabase` para a plataforma e
  `$specsfy-specialist-postgres` para o banco, e volte para cá quando existir
  política a atacar.
- Combinar com `$specsfy-specialist-application-security` quando a autorização
  também viver fora do banco, em claims do JWT, chave de serviço ou verificação
  na aplicação.

## Fluxo

1. Fixar o escopo e anunciá-lo. O padrão é o modo diff: políticas, grants e
   funções alteradas, mais o raio de alcance delas. O modo auditoria completa
   percorre todas as migrations e vale quando uma tabela nova entra ou quando o
   pedido é auditar o schema inteiro.
2. Descobrir o vocabulário real do projeto antes de julgar: qual é a coluna de
   tenant, quais são as funções de pertencimento e de permissão, quais papéis
   existem. Nunca presuma `account_id` nem o nome de uma função auxiliar; leia
   as migrations.
3. Levantar o inventário de isolamento por tabela em escopo: RLS habilitada,
   grants por papel, políticas com `for`, `to`, `using` e `with check`,
   PERMISSIVE contra RESTRICTIVE, funções `security definer` e views. Esse
   inventário é a base de comparação de todo o resto.
4. Percorrer o catálogo de ataques de
   [references/standards.md](references/standards.md), item por item. Cada item
   é um ataque, não uma observação de estilo: para cada achado, escreva o
   exploit concreto, com o usuário, o statement e a linha alcançada.
5. Provar cada achado plausível com pgTAP executável, usando o modelo de dois
   tenants da referência. O mesmo vale para cada garantia que você quer
   *confirmar*: a prova de que o isolamento existe é um ataque que falha.
6. Refutar as próprias conclusões. Cada brecha confirmada e cada assinatura de
   "isolamento correto" passa por uma verificação independente, cuja única
   tarefa é derrubá-la.
7. Relatar por veredito, com a matriz de isolamento por tabela e a lista de
   correções que bloqueiam o merge.

## Padrões

- Provar o isolamento pelos dois lados: além dos casos que afirmam que o alheio
  não aparece, a suíte precisa de ao menos um caso afirmando que quem pertence
  **consegue** ler. Uma política que nega todo mundo passa em qualquer teste que
  só verifique negação.
- Cobrir os quatro verbos em cada tabela sensível: `SELECT`, `INSERT` pelo
  `with check`, `UPDATE` incluindo a troca da coluna de tenant, e `DELETE`.
- Semear as fixturas com o papel privilegiado, para que a própria semeadura não
  seja filtrada pelas políticas sob teste, e atacar com um usuário autenticado
  sem vínculo nenhum com o tenant vítima.
- Tratar `grant update` no nível da tabela como reprovação: o privilégio precisa
  ser por coluna, fora da chave primária, da coluna de tenant e de qualquer
  chave estrangeira de posse.
- Exigir `as restrictive` em toda política que exista para *negar*. Gate de
  fator duplo, de plano ou de status escrito como permissiva faz OR com as
  demais e não restringe nada.
- Classificar cada achado por prova: brecha confirmada por teste que falha em
  recusar, fragilidade que remove uma camada sem vazar hoje, ou isolamento
  provado com o nome do teste que o comprova.
- Marcar como **estático, não verificado** todo achado que não pôde ser
  executado, e dizer por quê.

## Antipadrões

- Assinar isolamento a partir da leitura da política. O predicado correto no
  papel convive com grant de coluna ausente, view sem `security_invoker`,
  função definer permissiva e trigger que reintroduz a linha.
- Testar somente `SELECT`. A maior parte das brechas reais está na escrita: o
  `with check` ausente que deixa reparentar a linha para outro tenant é o caso
  clássico, e nenhum teste de leitura o encontra.
- Presumir os nomes do projeto anterior: a coluna de tenant, as funções de
  pertencimento e os papéis mudam de repositório para repositório, e um
  predicado avaliado contra o nome errado é uma revisão inteira desperdiçada.
- Deixar que o mesmo contexto que produziu o achado o confirme. Sem uma segunda
  leitura hostil, os dois erros clássicos passam: chamar de brecha o que uma
  camada RESTRICTIVE bloqueia, e chamar de seguro o que só foi testado em um
  statement.
- Corrigir a política e não reexecutar a suíte. A correção de uma política
  costuma alterar o resultado de outra, principalmente quando funções auxiliares
  são compartilhadas.

## Validação

- Executar a suíte pgTAP no banco local e citar o nome de cada teste no
  relatório: `supabase test db --local` no ambiente Supabase, ou `pg_prove` no
  Postgres puro.
- Manter o caso positivo em cada arquivo de isolamento, junto com os negativos.
- Reexecutar a suíte inteira depois de cada correção de política, grant ou
  função auxiliar.
- Fechar o relatório com a matriz de isolamento e um veredito único: ISOLADO,
  VAZA ou NÃO VERIFICADO.
- Não declarar uma tabela isolada sem a evidência acima; linguagem absoluta sem
  prova é proibida.

## Skills relacionadas

- `$specsfy-specialist-supabase` desenha políticas, papéis e ambiente local;
  esta skill ataca o que ele desenhou.
- `$specsfy-specialist-postgres` aprofunda schema, privilégio, função e plano
  quando a correção da brecha exige mudar a modelagem, não a política.
- `$specsfy-specialist-application-security` cobre a autorização fora do banco,
  como claims do JWT e chave de serviço; esta skill cobre apenas o que a linha
  do Postgres decide.

Leia [references/standards.md](references/standards.md) para o catálogo de
ataques por classe, o modelo pgTAP de dois tenants, o formato do relatório e as
fontes oficiais.
