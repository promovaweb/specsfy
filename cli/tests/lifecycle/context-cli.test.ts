/** Context, milestones and docs commands (specs 0005, 0007, 0008) on copies of `example/`. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EXAMPLE_DIR, copyExample, removeCopy, runCli } from "./helpers.ts";

let home: string;
let project: string;

beforeAll(() => {
  home = mkdtempSync(join(tmpdir(), "specsfy-context-home-"));
  project = copyExample();
});
afterAll(() => {
  removeCopy(project);
  rmSync(home, { recursive: true, force: true });
});

const cli = (...args: string[]) => runCli([...args, "--project", project], home);

describe("context", () => {
  test("context inspect --json on example/ identifies Laravel", async () => {
    const r = await runCli(["context", "inspect", "--project", EXAMPLE_DIR, "--json"], home);
    expect(r.code).toBe(0);
    expect(r.json.data.result.composer_packages).toContain("laravel/framework");
  });

  test("context rule and data write .specsfy files", async () => {
    const rule = await cli("context", "rule", "--section", "Testes", "--rule", "Toda rota tem teste de feature.", "--json");
    expect(rule.code).toBe(0);
    expect(readFileSync(join(project, ".specsfy", "RULES.md"), "utf8")).toContain("- Toda rota tem teste de feature.");
    const data = await cli("context", "data", "--name", "Pedido", "--purpose", "a", "--store", "b", "--format", "c", "--links", "d", "--access", "e", "--lifecycle", "f", "--sources", "g", "--json");
    expect(data.code).toBe(0);
    expect(readFileSync(join(project, ".specsfy", "DATABASE.md"), "utf8")).toContain("| Pedido | a | b | c | d | e | f | g |");
  });

  test("context monitor --check exits with 10 when documents are pending", async () => {
    const pending = await cli("context", "monitor", "--paths", "composer.json", "--check", "--json");
    expect(pending.code).toBe(10);
    expect(pending.json.data.result.status).toBe("pending");
    const report = await cli("context", "monitor", "--paths", "composer.json", "--json");
    expect(report.code).toBe(0);
  });

  test("context usage estimates the spec size", async () => {
    const r = await cli("context", "usage", "0001", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.result.total.value).toBeGreaterThan(0);
  });
});

describe("milestones", () => {
  test("milestones sync --json returns the updated milestones", async () => {
    const spec = join(project, "specs/specs/0001-diretorio-global-usuarios/spec.md");
    writeFileSync(spec, readFileSync(spec, "utf8").replace("| Status | Complete |", "| Status | Complete |\n| Milestones | M01 |"));
    const r = await cli("milestones", "sync", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.milestones).toEqual([expect.objectContaining({ id: "M01", path: "specs/milestones/M01.md", total_specs: 1, completed_specs: 1, percent: 100 })]);
    expect(readFileSync(join(project, "specs/milestones/M01.md"), "utf8")).toContain("specsfy:milestone-progress:start");
  });
});

describe("docs", () => {
  test("docs build --check fails with 10 when outdated and passes after docs build", async () => {
    expect((await cli("docs", "build", "--check")).code).toBe(10);
    expect((await cli("docs", "build")).code).toBe(0);
    expect((await cli("docs", "build", "--check", "--json")).code).toBe(0);
  });
});
