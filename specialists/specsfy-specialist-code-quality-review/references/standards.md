# Padrões da revisão de qualidade de código

## Escala de severidade

| Severidade | Critério | Efeito na entrega |
| --- | --- | --- |
| Crítico | vazamento de dado, falha de autorização, segredo exposto, quebra de contrato publicado | bloqueia |
| Alto | o comportamento correto depende de sorte: entrada externa sem validação, erro engolido, tipo dinâmico introduzido de propósito, estado inconsistente | bloqueia |
| Médio | padrão registrado do projeto violado sem falha imediata: efeito desnecessário, estado espalhado, componente duplicado, ausência de estado de carregamento | corrige antes de fechar a fatia |
| Baixo | manutenção: nome, organização de arquivo, comentário que repete o código | comentário, não bloqueio |

Um achado sobe de severidade quando alcança dado de outra pessoa, dinheiro,
credencial ou contrato que alguém de fora já consome.

## Lentes de revisão

### 1. Tipos e contratos

- Tipo dinâmico introduzido de propósito, ou asserção que apaga uma verificação
  que o compilador faria.
- Anotação explícita onde a inferência já resolvia: repete a informação e
  envelhece sozinha.
- Erro tratado sem tipo, ou capturado e descartado sem registro nem
  propagação.
- Contrato público alterado sem que todos os chamadores tenham sido ajustados
  na mesma mudança.

### 2. Fronteira entre servidor e cliente

- Módulo importado dos dois lados quando só um deveria alcançá-lo, em
  linguagens e frameworks onde essa separação existe.
- Segredo, credencial ou chave de serviço em caminho que o navegador recebe.
- Dado sensível devolvido ao cliente porque a consulta trouxe a linha inteira
  quando três campos bastavam.
- Busca de dado no cliente onde a renderização no servidor já resolvia, e o
  contrário: renderização no servidor de algo que depende de interação.

### 3. Entrada externa

- Entrada validada em uma fronteira e não na outra: o mesmo schema precisa
  valer para quem chama de fora e para quem chama de dentro.
- Validação existente no cliente e ausente no servidor. A do cliente é
  conveniência; a do servidor é a que protege.
- Persistência que aceita o que a aplicação recusa: quando a regra importa, o
  banco a repete como restrição própria.

### 4. Autorização e exposição

- Caminho novo que não passa pela camada que o projeto elegeu como dona da
  autorização.
- Privilégio concedido além do necessário para a operação, principalmente
  escrita concedida onde só leitura era preciso.
- Resposta que permite distinguir estados que deveriam ser indistinguíveis,
  como a existência de um cadastro.
- Registro de log que carrega dado pessoal, credencial ou token.

### 5. Interface

- Efeito usado para derivar dado que já existe na renderização, ou para
  sincronizar estado que poderia ser calculado.
- Estado fragmentado em muitas variáveis independentes quando a transição é uma
  só, e o inverso, um objeto único onde os campos não mudam juntos.
- Operação assíncrona sem estado visível de carregamento, de erro e de vazio.
- Bloco repetido três vezes na mesma tela sem virar componente, e componente
  criado para um único uso.
- Componente equivalente reescrito quando o projeto já publica o dele.

### 6. Persistência

- Tabela nova sem a proteção de acesso que o projeto aplica às demais.
- Privilégio de escrita concedido na tabela inteira quando o correto é por
  coluna.
- Restrição de integridade deixada para a aplicação quando o banco poderia
  garanti-la.
- Função equivalente reescrita quando o schema já tem a sua.

### 7. Complexidade acidental

- Abstração criada para um único uso.
- Camada de indireção que só repassa a chamada.
- Estrutura de arquivo divergente do padrão do módulo vizinho, sem motivo
  declarado.

## Formato do relatório

1. **Visão geral**: uma frase sobre o estado do que foi revisado.
2. **Achados por severidade**: crítico, alto, médio e baixo, nesta ordem. Cada
   item traz `arquivo:linha`, a condição que dispara a falha, a consequência
   observável e a correção concreta.
3. **Leitura de segurança**: autenticação, autorização, exposição de dado e
   validação de entrada, com o vetor concreto quando houver achado, e a
   declaração explícita de ausência quando não houver.
4. **O que passou**: o padrão bem aplicado, nomeado de forma específica.
5. **Ações**: a lista ordenada do que corrigir, separando o que bloqueia a
   entrega do que é melhoria futura.
6. **Cobertura e risco residual**: o que foi olhado e o que não foi possível
   confirmar.

## Fontes oficiais

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Você talvez não precise de um efeito, na documentação do React: https://react.dev/learn/you-might-not-need-an-effect
- Server Components na documentação do Next.js: https://nextjs.org/docs/app/getting-started/server-and-client-components
- OWASP Application Security Verification Standard: https://owasp.org/www-project-application-security-verification-standard/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- CWE Top 25: https://cwe.mitre.org/top25/
- Row Security Policies no PostgreSQL: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- GRANT no PostgreSQL: https://www.postgresql.org/docs/current/sql-grant.html
