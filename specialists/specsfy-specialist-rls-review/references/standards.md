# Padrões da revisão adversarial de RLS

## Inventário de isolamento

Para cada tabela em escopo, extraia a verdade do schema antes de julgar
qualquer predicado.

| Fato | Onde olhar | Por que importa |
| --- | --- | --- |
| RLS habilitada | `alter table ... enable row level security` | sem RLS, todo usuário autenticado lê tudo |
| Grants ao papel autenticado | `grant ... to authenticated` | `update` no nível da tabela abre reparentamento |
| Grants a papel anônimo ou público | `grant ... to anon`, política `to public` | vazamento sem sessão |
| Políticas com `for`, `to`, `using`, `with check` | `create policy` | é o predicado que você ataca |
| PERMISSIVE contra RESTRICTIVE | `as restrictive` | gate escrito como permissiva não restringe |
| Funções `security definer` | `security definer` | ignoram RLS; exigem validação e `search_path` fixo |
| Views sobre tabela com RLS | `create ... view` | sem `security_invoker = true` rodam como dono |

Funções auxiliares de pertencimento e permissão já auditadas não voltam ao
escopo, salvo quando o diff as altera. Quando isso acontecer, toda política que
as chama é afetada.

## Catálogo de ataques

### A. Exposição da tabela

1. **RLS desabilitada.** Tabela com `grant` ao papel autenticado e sem
   `enable row level security`. Exposição total.
2. **`grant update` no nível da tabela.** Com o privilégio na tabela inteira, o
   usuário executa `update ... set <coluna_de_tenant> = '<outro tenant>'` e move
   ou rouba a linha. `with check` sozinho não impede de forma confiável. O
   privilégio precisa ser por coluna, excluindo a chave primária, a coluna de
   tenant e as chaves estrangeiras de posse.
3. **Grant a papel anônimo, ou política `to public`, sobre dado de tenant.**
   `to public` inclui o papel anônimo.

### B. Buracos no predicado

1. **`with check` ausente no caminho de escrita.** `for insert` e `for update`
   precisam restringir a linha *nova*. Um `for update ... using (pertence(...))`
   sem `with check` permite editar a própria linha e sair com a coluna de tenant
   apontando para outra conta. `for all` herda `using` como `with check`, o que
   é aceitável desde que o predicado sirva também para escrita.
2. **`insert` com coluna de tenant livre.** O `with check` precisa amarrar a
   linha nova a um tenant que o usuário controla, nunca a `true` nem a um valor
   que o cliente fornece.
3. **`using (true)` e predicados largos.** Legítimo apenas em tabela de
   referência global. Sobre dado de tenant é vazamento de leitura.
4. **Verificação sobre o tenant errado.** O predicado precisa julgar a coluna da
   própria linha. Cuidado com sombreamento entre argumento da função e coluna da
   tabela: uma política que passa a coluna errada verifica silenciosamente outra
   conta.
5. **Leitura que permite enumerar.** Linha de outro tenant que só é filtrada na
   aplicação continua visível para quem chama a API direto.

### C. Camadas restritivas

1. **Gate permissivo.** Toda política que existe para negar precisa de
   `as restrictive`; caso contrário faz OR com as permissivas.
2. **Política de administração.** Tabela nova que deve ser visível à
   administração precisa da política correspondente; a que não deve ser visível
   não pode herdá-la por engano.

### D. Funções SECURITY DEFINER

1. **`set search_path = ''` ausente.** Função definer sem caminho fixo é
   sequestrável por objeto de mesmo nome em outro schema.
2. **Trabalho privilegiado sem verificação prévia.** A função roda como dono e
   ignora RLS: precisa validar pertencimento e permissão, e falhar alto, antes
   de tocar o dado.
3. **`grant execute` largo demais.** Mutação privilegiada concedida ao papel
   autenticado é superfície de ataque; avalie se pertence apenas ao papel de
   serviço.
4. **Identidade recebida por parâmetro.** Dentro da função definer, a identidade
   continua sendo a de quem chama; confie nela, nunca num identificador de
   usuário que o chamador informa.

### E. Views e correção de desempenho

1. **View sem `security_invoker = true`.** Ela roda com o privilégio do dono e
   ignora a RLS de quem consulta.
2. **Identidade não encapsulada em subconsulta.** Além do custo por linha, a
   forma encapsulada é a convenção; chamada solta em política nova é sinal de
   descuido.

### F. Armazenamento de arquivos

1. **Política de objeto sem escopo de bucket.** Vaza entre buckets.
2. **Política de objeto sem cláusula de posse.** Vaza entre tenants dentro do
   mesmo bucket. As duas cláusulas são obrigatórias juntas.

## Modelo pgTAP de dois tenants

Os testes ficam com a suíte do banco, em arquivos `*.test.sql`. Há duas formas
de assumir uma identidade dentro do teste: as funções auxiliares de teste do
Supabase, quando instaladas, ou as configurações de sessão, que funcionam em
qualquer Postgres.

```sql
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid>","role":"authenticated"}';
```

Volte para `set local role postgres;` entre um ator e outro. O arquivo inteiro
vive dentro de `begin; select no_plan(); ... select * from finish(); rollback;`.

```sql
begin;
select no_plan();

-- Dois usuários e dois tenants, semeados com o papel privilegiado para que a
-- semeadura não seja filtrada pelas políticas sob teste.
set local role service_role;
-- ... criar usuário e tenant vítima, usuário e tenant atacante
-- ... inserir uma linha do tenant vítima em public.<tabela>
set local role postgres;

-- Assumir o atacante: usuário válido, sem vínculo com o tenant vítima.
set local role authenticated;
set local request.jwt.claims = '{"sub":"<uuid do atacante>","role":"authenticated"}';

-- Leitura: o atacante não enxerga nenhuma linha da vítima.
select is_empty(
  $$ select 1 from public.<tabela> where <coluna_de_tenant> = '<tenant vitima>' $$,
  'atacante não lê as linhas da vítima'
);

-- Escrita: o atacante não consegue reparentar a linha para o tenant vítima.
select throws_ok(
  $$ update public.<tabela> set <coluna_de_tenant> = '<tenant vitima>' $$,
  null, null,
  'atacante não reparenta linha para o tenant vítima'
);

-- Caso positivo: quem pertence ao tenant vítima continua lendo a linha.
-- Sem ele, uma política que nega todo mundo passa na suíte inteira.

select * from finish();
rollback;
```

Asserções úteis: `results_eq`, `is_empty`, `throws_ok`, `throws_like`,
`lives_ok` e `ok`. Um teste que **deixa de recusar** a ação entre tenants é
brecha confirmada, de severidade máxima. Um teste que passa é isolamento
provado para aquele vetor, e o relatório precisa dizer isso com o nome do teste.

## Refutação independente

Cada brecha confirmada e cada assinatura de isolamento correto passa por uma
verificação separada, que recebe apenas o texto da política, o resultado do
teste e a afirmação. A tarefa dela é derrubar a afirmação: achar a política que
de fato salva o caso, a camada restritiva esquecida, o trigger que bloqueia a
escrita ou, para um veredito limpo, o statement, o papel ou o nível de
autenticação que ainda vaza. A brecha sobrevive apenas se a refutação também a
reproduzir; a assinatura limpa sobrevive apenas se a refutação não achar vetor
livre.

## Formato do relatório

O veredito vem primeiro. Depois, por achado:

- **BRECHA** `arquivo:linha`: o usuário atacante consegue ler, escrever ou
  apagar dado do tenant vítima por meio do statement citado. Prova: o teste
  nomeado deixa de recusar, ou o achado é estático e não verificado, com o
  motivo. Correção: a mudança concreta de política, grant, `with check` ou
  camada restritiva.
- **FRAGILIDADE** `arquivo:linha`: camada de defesa removida que não vaza hoje,
  com o motivo e a correção.
- **PROVADO** `tabela`: isolamento válido para os verbos testados, com o nome
  dos testes que o comprovam.

| Tabela | SELECT | INSERT | UPDATE entre tenants | DELETE | Gate | Administração |
| --- | --- | --- | --- | --- | --- | --- |

Veredito final em uma linha: ISOLADO, VAZA ou NÃO VERIFICADO, seguido da lista
numerada de brechas que bloqueiam o merge, cada uma com o teste que falha e a
correção de uma linha.

## Fontes oficiais

- Row Security Policies: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- CREATE POLICY: https://www.postgresql.org/docs/current/sql-createpolicy.html
- GRANT: https://www.postgresql.org/docs/current/sql-grant.html
- CREATE FUNCTION: https://www.postgresql.org/docs/current/sql-createfunction.html
- CREATE VIEW e `security_invoker`: https://www.postgresql.org/docs/current/sql-createview.html
- Row Level Security no Supabase: https://supabase.com/docs/guides/database/postgres/row-level-security
- Testes de banco com pgTAP: https://supabase.com/docs/guides/local-development/testing/pgtap-extended
- Documentação do pgTAP: https://pgtap.org/documentation.html
