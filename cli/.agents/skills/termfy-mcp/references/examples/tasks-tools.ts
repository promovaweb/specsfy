/** Receitas MCP de consulta paginada e leitura cancelável com serviço injetado. */
import { z } from "zod";
import type { Registrar } from "../../src/mcp/server.ts";

const taskSchema = z.object({
  id: z.string().describe("Task identifier."),
  title: z.string().describe("Task title."),
});
export type Task = z.infer<typeof taskSchema>;

/** O serviço compartilha regras com CLI/TUI e respeita o AbortSignal recebido. */
export interface TaskService {
  list(): readonly Task[];
  get(id: string, signal: AbortSignal): Promise<Task | undefined>;
}

/** Mantém texto JSON e structuredContent derivados do mesmo objeto. */
function result(data: Record<string, unknown>) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }], structuredContent: data };
}

/** Erro de domínio com mensagem fixa; nunca inclui mensagens do serviço. */
function failure(code: string, message: string) {
  return { isError: true, ...result({ error: { code, message } }) };
}

/** Registra consultas locais; list() representa um snapshot estável nesta receita. */
export function registerTaskTools({ server, catalog }: Registrar, service: TaskService): void {
  const name = "tasks_list";
  const description = "List a stable local task snapshot. Returns at most 50 tasks and a continuation cursor.";
  catalog.tools.push({ name, description });
  server.registerTool(name, {
    title: "List tasks", description,
    inputSchema: {
      limit: z.number().int().min(1).max(50).default(10).describe("Page size, from 1 to 50. Default 10."),
      cursor: z.string().regex(/^(0|[1-9][0-9]{0,8})$/).optional().describe("Continuation cursor from the previous page."),
    },
    outputSchema: {
      items: z.array(taskSchema).describe("Tasks in this page."),
      nextCursor: z.string().optional().describe("Absent on the final page."),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, ({ limit, cursor }) => {
    try {
      const rows = service.list();
      const offset = Number(cursor ?? 0);
      if (offset > rows.length) return failure("INVALID_CURSOR", "Restart from the first page.");
      // Projeta somente campos públicos; objetos do serviço podem ter campos privados.
      const items = rows.slice(offset, offset + limit).map(({ id, title }) => ({ id, title }));
      const next = offset + items.length;
      return result({ items, ...(next < rows.length ? { nextCursor: String(next) } : {}) });
    } catch {
      return failure("UNAVAILABLE", "Could not list tasks. Check the service and try again.");
    }
  });

  const getName = "tasks_get";
  const getDescription = "Read one local task by identifier. Returns its public fields or a recoverable error.";
  catalog.tools.push({ name: getName, description: getDescription });
  server.registerTool(getName, {
    title: "Read task", description: getDescription,
    inputSchema: { id: z.string().min(1).max(80).describe("Task identifier." ) },
    outputSchema: { task: taskSchema.describe("Requested task.") },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ id }, extra) => {
    try {
      const signal = AbortSignal.any([extra.signal, AbortSignal.timeout(5000)]);
      signal.throwIfAborted();
      const task = await service.get(id, signal);
      signal.throwIfAborted();
      if (!task) return failure("NOT_FOUND", "Check the identifier with tasks_list.");
      return result({ task: { id: task.id, title: task.title } });
    } catch {
      return failure("UNAVAILABLE", "Could not read the task. Check the service and try again.");
    }
  });
}
