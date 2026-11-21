# MCP

O especialista MCP ajuda a publicar um servidor Model Context Protocol por
HTTP. Um cliente de IA pode descobrir as operações do servidor, chamá-las
com argumentos definidos e receber dados que consegue interpretar. Por
exemplo, um assistente de suporte pode consultar um pedido pelo código e
receber seu status em campos separados.

## Quando usar

- Você quer expor ferramentas, recursos ou modelos de mensagem a clientes
  MCP por uma URL.
- Seu projeto Laravel vai usar o pacote oficial `laravel/mcp`.
- Seu projeto Next.js vai servir MCP por uma rota do App Router.
- Você precisa conferir acesso via OAuth ou compatibilidade com um cliente
  que usa uma revisão anterior do protocolo.

Para uma API REST comum, use [Arquitetura](architecture.md) no modo
`web-api`. A criação de clientes para consumir servidores de terceiros
fica fora do escopo deste especialista.

## Como ele trabalha

1. Lê a spec e os arquivos de contexto da stack. Confirma quais aplicações
   vão se conectar e as versões que elas aceitam.
2. Define a URL, as operações, os argumentos de entrada e os campos de saída.
3. Decide quem pode chamar cada operação e como a identidade será comprovada.
4. Usa o modo `protocol`, `laravel` ou `nextjs` indicado na spec ou na tarefa.
5. Registra na spec ou na tarefa o que o endpoint oferece e quais testes
   demonstram o comportamento.

## Protocolo

O modo `protocol` define o contrato que os clientes vão usar. Uma tool
executa uma ação ou consulta. Um resource disponibiliza contexto por uma
URI. Um prompt oferece um modelo de mensagem pronto para preencher.

Streamable HTTP usa uma URL como `/mcp`. Na revisão `2026-07-28`, cada
pedido leva as informações necessárias para ser processado sozinho.
O servidor pode responder em JSON ou enviar uma sequência de eventos SSE
na resposta do próprio pedido. O cabeçalho `Mcp-Session-Id` pertence às
versões antigas que usavam sessões de transporte.

Em produção, o especialista verifica HTTPS, origem da requisição,
credenciais e permissões por operação. Com OAuth, os metadados do
recurso protegido indicam ao cliente qual serviço pode emitir o token.
Se a operação precisar de uma informação adicional, a elicitation permite
pedi-la durante a chamada, desde que o cliente ofereça esse recurso.

## Laravel

O modo `laravel` usa `laravel/mcp` para criar as classes do servidor e
`Mcp::web` em `routes/ai.php` para registrar a URL. A mesma regra de acesso
que protege os dados da aplicação também deve proteger a tool que os lê.

Sanctum atende clientes gerenciados que já recebem um token. Passport é a
opção documentada para clientes que precisam descobrir e executar o fluxo
OAuth. O especialista [Laravel](laravel.md#servidor-mcp) também cobre essa
integração no modo `mcp`.

## Next.js

O modo `nextjs` usa um Route Handler do App Router, como
`app/mcp/route.ts`. O caminho padrão conecta a rota ao SDK oficial por
`Request` e `Response`. Para a revisão atual, o pacote de servidor é
`@modelcontextprotocol/server`. Projetos antigos podem usar
`@modelcontextprotocol/sdk` da linha v1 e o protocolo legado.

O adaptador `mcp-handler` da Vercel é uma alternativa quando o projeto
usa seus recursos de integração, como os helpers para OAuth.

## Como conferir o resultado

1. Rode a aplicação de teste. Abra `npx @modelcontextprotocol/inspector`,
   selecione Streamable HTTP e informe a URL completa. No Laravel também é
   possível abrir o Inspector pelo comando `php artisan mcp:inspector`
   seguido pelo caminho registrado, como `mcp/catalog`.
2. Liste as operações publicadas e chame as que a spec descreve. Teste uma
   entrada válida e outra inválida. Em um endpoint protegido, teste também
   sem credencial e com uma identidade sem acesso à operação.
3. Rode os testes do projeto. Use `curl` para conferir a resposta HTTP,
   os cabeçalhos que chegam ao endpoint e a rejeição de uma origem não
   permitida. Para OAuth, confirme também os metadados e a emissão do token.

## Como instalar

No projeto que vai usar o especialista, execute:

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-mcp --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Laravel](laravel.md) cobre os serviços, as políticas e o middleware da
  aplicação.
- [Next.js](nextjs.md) orienta o App Router e o runtime da rota.
- [TypeScript](typescript.md) cobre tipos e validação nas fronteiras.
- [Arquitetura](architecture.md) orienta os limites entre serviços e APIs.
- [Segurança de Aplicações](application-security.md) revisa o acesso aos dados.
- [Testing](testing.md) orienta os testes de contrato e integração.

## Referência técnica

As instruções do agente estão no
[SKILL.md](../../../specialists/specsfy-specialist-mcp/SKILL.md).
O [índice técnico](../../../specialists/specsfy-specialist-mcp/references/standards.md)
reúne os exemplos de cada modo e as fontes oficiais.
