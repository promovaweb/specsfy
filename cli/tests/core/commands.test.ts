/** Spec 0001: end-to-end runs of the read commands against `example/`. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOME_VARIABLE } from "../../src/config/paths.ts";

const cli = join(import.meta.dir, "..", "..");
const example = join(cli, "..", "example");
let home: string;

beforeAll(() => { home = mkdtempSync(join(tmpdir(), "specsfy-cmd-")); });
afterAll(() => rmSync(home, { recursive: true, force: true }));

async function run(args: string[]) {
  const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
    cwd: cli,
    env: { ...process.env, [HOME_VARIABLE]: home, NO_COLOR: "1" },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, stdout, stderr };
}

describe("read commands", () => {
  test("status --json returns the overview envelope", async () => {
    const { code, stdout } = await run(["status", "--project", example, "--json"]);
    expect(code).toBe(0);
    const body = JSON.parse(stdout);
    expect(body.ok).toBe(true);
    expect(body.data.specs).toHaveLength(6);
  });

  test("specs show resolves a number and fails with 6 for an unknown spec", async () => {
    const found = await run(["specs", "show", "6", "--project", example, "--json"]);
    expect(found.code).toBe(0);
    expect(JSON.parse(found.stdout).data.slug).toBe("0006-produtos");
    const missing = await run(["specs", "show", "9999", "--project", example, "--json"]);
    expect(missing.code).toBe(6);
  });

  test("backlog list reads specs/backlog/", async () => {
    const { code, stdout } = await run(["backlog", "list", "--project", example, "--json"]);
    expect(code).toBe(0);
    expect(JSON.parse(stdout).data.count).toBe(2);
  });

  test("scripts run passes arguments to the embedded script", async () => {
    const { code, stdout } = await run(["scripts", "run", "specsfy-progress/progress", "--project", example, "--json", "--", example, "--json"]);
    expect(code).toBe(0);
    expect(JSON.parse(stdout).data.result.summary.total_specs).toBe(6);
  });
});
