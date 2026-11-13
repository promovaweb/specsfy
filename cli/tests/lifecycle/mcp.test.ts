/** Lifecycle, context, milestones and docs tools over a real MCP stdio session. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CLI_DIR, cliEnv, copyExample, removeCopy } from "./helpers.ts";

let home: string;
let project: string;
let client: Client;

beforeAll(async () => {
  home = mkdtempSync(join(tmpdir(), "specsfy-lifecycle-mcp-"));
  project = copyExample();
  client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(new StdioClientTransport({ command: "bun", args: ["run", "src/main.ts", "mcp"], cwd: CLI_DIR, env: cliEnv(home), stderr: "pipe" }));
});
afterAll(async () => {
  await client.close();
  removeCopy(project);
  rmSync(home, { recursive: true, force: true });
});

const TOOLS = [
  "inbox_capture", "inbox_process", "backlog_start", "spec_create", "spec_transition", "spec_effort", "specs_migrate",
  "spec_research", "spec_change_analyze", "task_next", "task_check", "delivery_render",
  "context_setup", "context_inspect", "context_interface", "context_monitor", "context_stack", "context_rule",
  "context_database", "context_data", "context_usage", "milestones_sync", "milestones_import_mvp", "docs_build",
];

describe("mcp lifecycle tools", () => {
  test("registers every tool, write tools without readOnlyHint", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual(expect.arrayContaining(TOOLS));
    for (const name of ["spec_transition", "task_check", "inbox_capture", "docs_build", "milestones_sync"]) {
      expect(tools.find((tool) => tool.name === name)!.annotations?.readOnlyHint).toBe(false);
    }
    expect(tools.find((tool) => tool.name === "context_inspect")!.annotations?.readOnlyHint).toBe(true);
  });

  test("spec_transition moves a spec and rejects an invalid destination", async () => {
    const ok = await client.callTool({ name: "spec_transition", arguments: { spec: "0001", state: "defined", project } });
    expect(ok.isError).toBeFalsy();
    expect(ok.structuredContent).toMatchObject({ to: "defined", status: "Defined" });
    const bad = await client.callTool({ name: "spec_transition", arguments: { spec: "0001", state: "completed", project } });
    expect(bad.isError).toBe(true);
    const error = JSON.parse((bad.content as Array<{ text: string }>)[0]!.text);
    expect(error).toMatchObject({ code: 2, details: { accepted: ["draft", "defined", "planned"] } });
  });

  test("task_check unmarks and marks an item", async () => {
    const off = await client.callTool({ name: "task_check", arguments: { spec: "0002", task: "T001", item: "PREP", undo: true, project } });
    expect(off.structuredContent).toMatchObject({ checked: false, changed: true });
    const missing = await client.callTool({ name: "task_check", arguments: { spec: "0002", task: "T999", project } });
    expect(missing.isError).toBe(true);
  });

  test("inbox_capture runs the script and returns the new path", async () => {
    const r = await client.callTool({ name: "inbox_capture", arguments: { title: "Exportar pedidos", input: "Exportar pedidos em CSV", project } });
    expect(r.isError).toBe(false);
    expect((r.structuredContent as { result: string }).result).toContain(join(project, "specs", "inbox"));
  });
});
