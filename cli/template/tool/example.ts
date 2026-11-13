/**
 * MCP tool stub. Copy to src/mcp/tools/<name>.ts, adjust the imports and
 * call the function from registerAll (src/mcp/server.ts).
 *
 * Rules: Zod inputSchema with .describe() on every field; a description that
 * says when to use it and what it returns; `structuredContent` equal to the
 * JSON in the text; never echo secrets; set isError on expected failures.
 */
import { z } from "zod";
import type { Registrar } from "../../src/mcp/server.ts";

export function registerExampleTools({ server, catalog }: Registrar): void {
  catalog.tools.push({ name: "example_query", description: "Queries a target and returns the result." });
  server.registerTool(
    "example_query",
    {
      title: "Query example",
      description: "Use when the user asks for information about a target. Returns name, state and the items found.",
      inputSchema: {
        target: z.string().min(1).describe("Target identifier."),
        limit: z.number().int().positive().max(100).optional().describe("Maximum number of items. Default 10."),
      },
    },
    async ({ target, limit }) => {
      const items = [target].slice(0, limit ?? 10);
      const d = { target, state: "ok", items };
      return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }], structuredContent: d };
    },
  );
}
