/** Servidor de teste em subprocesso: stdout reservado integralmente ao SDK. */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRecipeServer } from "./recipe-server.ts";

const { server } = createRecipeServer();
await server.connect(new StdioServerTransport());
process.stdin.once("end", () => { void server.close(); });
