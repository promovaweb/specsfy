---
name: specsfy-specialist-mcp
description: "Construir e revisar servidores MCP (Model Context Protocol) servidos por HTTP. Use o modo protocol para Streamable HTTP, versões, capacidades e OAuth, laravel para o pacote oficial laravel/mcp e nextjs para Route Handlers do App Router com o SDK oficial ou mcp-handler. Para API REST comum, use specsfy-specialist-architecture no modo web-api. Clientes MCP que consomem servidores de terceiros ficam fora do escopo."
---

# MCP

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Definir Streamable HTTP, compatibilidade, OAuth ou contratos de tools, resources e prompts | protocol | [references/protocol.md](references/protocol.md) |
| Publicar um servidor MCP com `laravel/mcp`, `routes/ai.php` ou `Mcp::web` | laravel | [references/laravel.md](references/laravel.md) |
| Servir MCP num Route Handler do App Router com o SDK oficial ou `mcp-handler` | nextjs | [references/nextjs.md](references/nextjs.md) |

Não use para:

- API REST comum. Use `$specsfy-specialist-architecture (web-api)`.
- Implementação de cliente MCP que consome servidores de terceiros.
- Servidor exclusivamente local por `stdio`.

## No Specsfy

1. **Fonte de entrada por fase**
   - Em `specsfy-02-backlog`, leia o item em `specs/backlog/` e registre ali
     as decisões e sinais do especialista, além das dúvidas abertas.
   - Em `specsfy-03-specify` e `specsfy-04-validate`, use a
     spec aberta e devolva a conclusão à seção trabalhada pela fase.
   - Em `specsfy-05-tasks`, ajude a sugerir e sincronizar especialistas e modos
     entre o cabeçalho, a seção 8 e as tarefas. Só essa fase escreve a seção 14.
   - Em `specsfy-06-implement`, limite-se à tarefa indicada e ao passo carregado.

   Nas fases com spec, leia a spec aberta indicada pela skill chamadora ou
   localizada por `specsfy status`. Consulte a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção
   pertinente à fase.
   Leia também `.specsfy/STACK.md` e `.specsfy/RULES.md`.
2. Siga o modo indicado na spec ou na tarefa, por exemplo
   `Especialista: $specsfy-specialist-mcp (laravel)`. Sem indicação,
   escolha pela tabela e consulte o modo `protocol` para o contrato HTTP comum.
3. Devolva as conclusões e dúvidas abertas no destino indicado no item 1.
4. Deixe as transições de estado da spec e o registro dos gates a cargo das
   skills da fase.
5. Registre URL, revisão do protocolo, clientes-alvo, recursos expostos,
   requisitos de acesso e os testes que demonstram o contrato.

## Fluxo

1. Leia [references/standards.md](references/standards.md). Confirme versão no
   manifesto e lockfile, runtime, ingress e revisões aceitas pelos clientes.
2. Liste as operações e classifique cada uma como tool, resource ou prompt.
   Defina entradas, resultados, erros e quais operações têm efeitos persistentes.
3. Escolha a URL Streamable HTTP, os métodos e o comportamento de
   compatibilidade. Defina se cada resposta usa JSON ou SSE por requisição.
4. Defina a lista de origens aceitas, identidade por requisição, escopos,
   políticas por operação e limites de tamanho, taxa e duração.
5. Implemente a rota e os contratos pelo modo selecionado. Reaproveite os
   serviços e as políticas do projeto nas primitivas MCP.
6. Compare Inspector, testes automatizados e requisições HTTP com o contrato.
   Registre revisões e capacidades exercitadas e lacunas observadas.

### Modo protocol

1. Use [references/protocol.md](references/protocol.md) para definir
   `server/discover`, metadados por chamada e cabeçalhos. Documente a
   compatibilidade legada apenas quando um cliente-alvo exigir.
2. Especifique descoberta OAuth e testes de token, catálogo, chamada, leitura e
   prompt. Se houver elicitation, prove o fluxo com o cliente que a anuncia.

### Modo laravel

1. Use [references/laravel.md](references/laravel.md) para registrar
   `Mcp::web` e as classes do servidor em `laravel/mcp`.
2. Escolha Passport para descoberta OAuth ou Sanctum para clientes gerenciados
   com token pré-configurado. Exercite políticas, guard e middleware na rota HTTP.

### Modo nextjs

1. Use [references/nextjs.md](references/nextjs.md) para montar a rota
   `app/mcp/route.ts` com o SDK oficial e as APIs Web `Request`/`Response`.
2. Adote `mcp-handler` quando a aplicação aproveitar o adaptador da Vercel.
   Confira a versão do SDK exigida, a forma de validar o token e o comportamento
   da rota no ambiente de deploy.

## Padrões

- Use Streamable HTTP e uma URL estável. Na revisão `2026-07-28`,
  processe cada POST de forma independente e valide a coerência dos cabeçalhos
  com o JSON-RPC.
- Declare `inputSchema` em toda tool. Quando houver contrato de saída,
  declare `outputSchema` e valide o `structuredContent` devolvido.
- Valide `Origin` quando recebido e responda `403` para origem inválida.
  Use HTTPS em produção, autenticação por requisição e menor privilégio por
  operação e por objeto.
- Separe erros do transporte, erros JSON-RPC e falhas de execução da tool
  (`isError`). Remova segredos, dados desnecessários e detalhes internos.
- Limite argumentos, duração, paginação e destinos de rede. Para operações
  com efeito persistente, preveja confirmação e repetição segura.

## Antipadrões

- Tool sem schema de entrada. O cliente perde o contrato antes da chamada.
- Segredo em resultado de tool. O conteúdo pode entrar no contexto do modelo
  e nos registros do cliente.
- Sessão legada sem validação de `Origin` ou vínculo à identidade. Um ID
  recebido no transporte não prova identidade.
- Servidor HTTP sem autenticação em produção. Qualquer chamador que alcance a
  rota pode tentar executar suas operações.
- Usar `stdio` quando se pediu HTTP. O teste ignora roteamento, cabeçalhos e
  controle de acesso do endpoint remoto.

## Validação

- Conecte o MCP Inspector via Streamable HTTP. Liste e execute as primitivas
  anunciadas, com credencial de teste quando aplicável.
- Rode os testes do framework para argumentos inválidos, saída estruturada,
  escopo insuficiente, acesso entre tenants e repetição de operação de escrita
  quando aplicável.
- Faça `curl` na URL real de teste. Confira revisão, cabeçalhos, tipo de
  resposta e rejeição de origem e token inválidos. Teste a descoberta OAuth
  e o caminho legado quando habilitados.
- Só declare compatibilidade e segurança para os cenários sustentados pelas
  evidências coletadas.

## Skills relacionadas

- `$specsfy-specialist-laravel` para serviços, policies e middleware Laravel.
- `$specsfy-specialist-nextjs` para App Router, runtime e limites de deploy.
- `$specsfy-specialist-typescript` para tipos e validação nas fronteiras.
- `$specsfy-specialist-architecture` para fronteiras de serviços e APIs REST
  no modo `web-api`.
- `$specsfy-specialist-application-security` para revisar identidade,
  autorização e exposição de dados.
- `$specsfy-specialist-testing` para cobertura de contrato e integração.
