/** MCP tools of the gates and of the project tests over a real stdio session. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HOME_VARIABLE } from "../../src/config/paths.ts";
import { CLI_DIR, projectWithSpec, temporary, validSpec } from "./helpers.ts";

let home: string;
let client: Client;
const cleanup: string[] = [];

beforeAll(async () => {
  home = temporary("specsfy-gates-mcp-");
  cleanup.push(home);
  client = new Client({ name: "test", version: "0.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["run", "src/main.ts", "mcp"],
    cwd: CLI_DIR,
    env: { ...(process.env as Record<string, string>), [HOME_VARIABLE]: home },
    stderr: "pipe",
  });
  await client.connect(transport);
});

afterAll(async () => {
  await client.close();
  for (const dir of cleanup) rmSync(dir, { recursive: true, force: true });
});

describe("gate tools", () => {
  test("are registered with their effects", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((tool) => tool.name);
    expect(names).toEqual(expect.arrayContaining(["gate_spec", "gate_tasks", "gate_interface", "gate_trace", "gate_acceptance", "gate_evidence", "gate_findings", "gate_database", "verify", "project_test"]));
    expect(tools.find((tool) => tool.name === "gate_spec")?.annotations?.readOnlyHint).toBe(true);
    expect(tools.find((tool) => tool.name === "project_test")?.annotations?.readOnlyHint).toBe(false);
  });

  test("gate_spec passes a valid spec and flags an invalid one", async () => {
    const valid = projectWithSpec(validSpec());
    const invalid = projectWithSpec(validSpec({ Slug: "Not Kebab" }));
    cleanup.push(valid, invalid);
    const ok = await client.callTool({ name: "gate_spec", arguments: { spec: "0001", project: valid } });
    expect(ok.isError).toBe(false);
    const bad = await client.callTool({ name: "gate_spec", arguments: { spec: "0001", project: invalid } });
    expect(bad.isError).toBe(true);
    const data = bad.structuredContent as { result: { errors: string[] } };
    expect(data.result.errors.some((message) => message.includes("Slug"))).toBe(true);
  });

  test("verify with self-test returns the payload", async () => {
    const root = projectWithSpec(validSpec());
    cleanup.push(root);
    const run = await client.callTool({ name: "verify", arguments: { "self-test": true, project: root } });
    expect(run.isError).toBe(false);
    expect((run.structuredContent as { result: { result: string } }).result.result).toBe("passed");
  });

  test("project_test without a runner returns NOT_FOUND", async () => {
    const root = temporary("specsfy-gates-mcp-empty-");
    cleanup.push(root);
    const run = await client.callTool({ name: "project_test", arguments: { project: root } });
    expect(run.isError).toBe(true);
    const text = (run.content as Array<{ text: string }>)[0]!.text;
    expect(JSON.parse(text).code).toBe(6);
  });
});
