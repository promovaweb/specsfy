/** Montagem isolada das receitas; não importa o runtime Bun da aplicação. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Registrar } from "../../src/mcp/server.ts";
import { registerTaskTools } from "./tasks-tools.ts";
import type { TaskService } from "./tasks-tools.ts";
import { registerTaskResources, registerTaskPrompt } from "./resources-prompts.ts";

/** Fixture pública imutável usada nos testes, sem cofre nem acesso à rede. */
export const fixtureService: TaskService = {
  list: () => [{ id: "a", title: "Check docs" }, { id: "b", title: "Run tests" }, { id: "c", title: "Review output" }],
  get: async (id, signal) => {
    signal.throwIfAborted();
    return fixtureService.list().find((task) => task.id === id);
  },
};

/** Cada teste recebe servidor e catálogo próprios, sem estado compartilhado mutável. */
export function createRecipeServer(service: TaskService = fixtureService): Registrar {
  const server = new McpServer({ name: "recipe", version: "0.0.0" });
  const catalog: Registrar["catalog"] = { name: "recipe", version: "0.0.0", tools: [], resources: [], prompts: [] };
  const r = { server, catalog };
  registerTaskTools(r, service);
  registerTaskResources(r, "recipe");
  registerTaskPrompt(r);
  return r;
}
