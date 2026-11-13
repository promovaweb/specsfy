/** Exercita receitas pelo Client real em memória e em subprocesso stdio. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createRecipeServer, fixtureService } from "./recipe-server.ts";
import type { TaskService } from "./tasks-tools.ts";

/** Fecha ambos os lados mesmo se conexão ou asserção falhar. */
async function session(run: (client: Client, catalog: ReturnType<typeof createRecipeServer>["catalog"]) => Promise<void>, service?: TaskService) {
  const { server, catalog } = createRecipeServer(service);
  const client = new Client({ name: "recipe-test", version: "0.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(b);
    await client.connect(a);
    await run(client, catalog);
  } finally {
    await client.close();
    await server.close();
  }
}

test("catálogo e descoberta expõem os mesmos nomes e contratos", async () => {
  await session(async (client, catalog) => {
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(t => t.name).sort(), catalog.tools.map(t => t.name).sort());
    assert.ok(tools.every(t => t.outputSchema && t.annotations?.readOnlyHint));
    assert.deepEqual((await client.listPrompts()).prompts.map(p => p.name), catalog.prompts.map(p => p.name));
    assert.equal((await client.listResourceTemplates()).resourceTemplates.length, 1);
  });
});

test("paginação percorre o snapshot sem repetir itens e espelha o texto", async () => {
  await session(async (client) => {
    let cursor: string | undefined;
    const ids: string[] = [];
    do {
      const result = await client.callTool({ name: "tasks_list", arguments: { limit: 2, ...(cursor ? { cursor } : {}) } });
      assert.ok(!result.isError);
      const data = result.structuredContent as { items: { id: string }[]; nextCursor?: string };
      const text = (result.content as { text: string }[])[0]!.text;
      assert.deepEqual(JSON.parse(text), data);
      ids.push(...data.items.map(t => t.id));
      cursor = data.nextCursor;
    } while (cursor);
    assert.deepEqual(ids, ["a", "b", "c"]);
  });
});

test("SDK 1.32.2 devolve isError para schema inválido e tool desconhecida", async () => {
  await session(async client => {
    for (const request of [
      { name: "tasks_list", arguments: { limit: 51 } },
      { name: "tasks_list", arguments: { cursor: "-1" } },
      { name: "missing", arguments: {} },
    ]) assert.equal((await client.callTool(request)).isError, true);
  });
});

test("falhas de domínio e serviço não expõem mensagens privadas", async () => {
  await session(async client => {
    const result = await client.callTool({ name: "tasks_get", arguments: { id: "missing" } });
    assert.equal(result.isError, true);
    assert.match(JSON.stringify(result), /NOT_FOUND/);
  });
  await session(async client => {
    const result = await client.callTool({ name: "tasks_get", arguments: { id: "a" } });
    assert.equal(result.isError, true);
    assert.doesNotMatch(JSON.stringify(result), /private-token/);
  }, { ...fixtureService, get: async () => { throw new Error("private-token"); } });
});

test("resources fixos e templates retornam MIME e recusam tópico desconhecido", async () => {
  await session(async client => {
    for (const uri of ["recipe://task-guide", "recipe://task-guide/limits"]) {
      const result = await client.readResource({ uri });
      assert.equal(result.contents[0]!.mimeType, "text/markdown");
      assert.equal(result.contents[0]!.uri, uri);
    }
    assert.ok((await client.listResources()).resources.some(r => r.uri === "recipe://task-guide/limits"));
    await assert.rejects(client.readResource({ uri: "recipe://task-guide/unknown" }));
  });
});

test("prompt mantém foco e valida argumento obrigatório", async () => {
  await session(async client => {
    const result = await client.getPrompt({ name: "review_tasks", arguments: { focus: "documentation" } });
    assert.match(JSON.stringify(result.messages), /documentation/);
    await assert.rejects(client.getPrompt({ name: "review_tasks", arguments: {} }));
  });
});

test("cancelamento chega ao serviço por AbortSignal", { timeout: 5000 }, async () => {
  let entered!: () => void;
  let aborted!: () => void;
  const started = new Promise<void>(resolve => { entered = resolve; });
  const stopped = new Promise<void>(resolve => { aborted = resolve; });
  await session(async client => {
    const controller = new AbortController();
    const call = client.callTool({ name: "tasks_get", arguments: { id: "a" } }, undefined, { signal: controller.signal });
    const rejected = assert.rejects(call);
    await started;
    controller.abort();
    await rejected;
    await stopped;
  }, { ...fixtureService, get: async (_id, signal) => {
    entered();
    return new Promise((_, reject) => {
      signal.addEventListener("abort", () => { aborted(); reject(signal.reason); }, { once: true });
    });
  } });
});

test("subprocesso stdio negocia, descobre e chama uma tool", { timeout: 10000 }, async () => {
  const client = new Client({ name: "stdio-test", version: "0.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [fileURLToPath(new URL("./stdio-server.ts", import.meta.url))],
    stderr: "pipe",
  });
  let diagnostics = "";
  transport.stderr?.on("data", chunk => { diagnostics = (diagnostics + String(chunk)).slice(-4096); });
  try {
    await client.connect(transport);
    assert.equal((await client.listTools()).tools.length, 2);
    const result = await client.callTool({ name: "tasks_get", arguments: { id: "a" } });
    assert.deepEqual(result.structuredContent, { task: { id: "a", title: "Check docs" } });
    assert.doesNotMatch(diagnostics, /private-token/);
  } finally {
    await client.close();
    await transport.close();
  }
});

// Casos de borda de paginação e projeção independem da fixture principal.
test("lista vazia, cursor fora do snapshot e campos privados", async () => {
  await session(async client => {
    const empty = await client.callTool({ name: "tasks_list", arguments: {} });
    assert.deepEqual(empty.structuredContent, { items: [] });
    assert.equal((await client.callTool({ name: "tasks_list", arguments: { cursor: "99" } })).isError, true);
  }, { ...fixtureService, list: () => [] });
  await session(async client => {
    const result = await client.callTool({ name: "tasks_list", arguments: {} });
    assert.doesNotMatch(JSON.stringify(result), /private-token/);
  }, { ...fixtureService, list: () => [{ id: "a", title: "Public", token: "private-token" }] });
});

test("exceção na listagem também recebe mensagem pública", async () => {
  await session(async client => {
    const result = await client.callTool({ name: "tasks_list", arguments: {} });
    assert.equal(result.isError, true);
    assert.doesNotMatch(JSON.stringify(result), /private-token/);
  }, { ...fixtureService, list: () => { throw new Error("private-token"); } });
});
