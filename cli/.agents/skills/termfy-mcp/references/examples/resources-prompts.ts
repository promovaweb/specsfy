/** Receitas de resource fixo, template descobrível e prompt sem efeitos externos. */
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { Registrar } from "../../src/mcp/server.ts";

const guides: Record<string, string> = {
  tasks: "# Tasks\n\nUse tasks_list to discover task identifiers.",
  limits: "# Limits\n\nTask pages contain at most 50 items.",
};

/** Recebe o scheme da identidade do produto; não lê arquivos a partir da URI. */
export function registerTaskResources({ server, catalog }: Registrar, scheme: string): void {
  const uri = `${scheme}://task-guide`;
  const description = "Task guide in Markdown.";
  catalog.resources.push({ uri, name: "task-guide", description });
  server.registerResource("task-guide", uri, { description, mimeType: "text/markdown" }, (url) => ({
    contents: [{ uri: url.href, mimeType: "text/markdown", text: guides.tasks! }],
  }));
  const template = `${scheme}://task-guide/{topic}`;
  catalog.resources.push({ uri: template, name: "task-guide-topic", description: "One task guide section." });
  server.registerResource("task-guide-topic", new ResourceTemplate(template, {
    list: async () => ({ resources: Object.keys(guides).map((topic) => ({
      uri: `${scheme}://task-guide/${topic}`, name: topic, mimeType: "text/markdown",
    })) }),
  }), { description: "One task guide section.", mimeType: "text/markdown" }, (url, variables) => {
    const topic = variables.topic;
    if (typeof topic !== "string" || !Object.hasOwn(guides, topic)) {
      throw new McpError(ErrorCode.InvalidParams, "Unknown guide topic.");
    }
    return { contents: [{ uri: url.href, mimeType: "text/markdown", text: guides[topic]! }] };
  });
}

/** Cria mensagens; a recuperação do prompt não chama tools nem executa comandos. */
export function registerTaskPrompt({ server, catalog }: Registrar): void {
  const name = "review_tasks";
  const description = "Prepare a task review. Returns instructions to inspect tasks without changing them.";
  catalog.prompts.push({ name, description });
  server.registerPrompt(name, {
    title: "Review tasks", description,
    argsSchema: { focus: z.string().min(1).max(200).describe("Review focus supplied by the user.") },
  }, ({ focus }) => ({ messages: [{ role: "user", content: {
    type: "text", text: `Read the task guide and call tasks_list. Summarize matching tasks without changing them. User focus: ${JSON.stringify(focus)}`,
  } }] }));
}
