/** Spec lifecycle commands (spec 0003) end to end, on copies of `example/`. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { put, validSpec } from "../gates/helpers.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { copyExample, removeCopy, runCli } from "./helpers.ts";

let home: string;
let project: string;

beforeAll(() => {
  home = mkdtempSync(join(tmpdir(), "specsfy-lifecycle-home-"));
  project = copyExample();
});
afterAll(() => {
  removeCopy(project);
  rmSync(home, { recursive: true, force: true });
});

const cli = (...args: string[]) => runCli([...args, "--project", project], home);

describe("specs transition", () => {
  test("specs transition 0001 defined moves the folder and updates the Status", async () => {
    const r = await cli("specs", "transition", "0001", "defined", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data).toMatchObject({ identifier: "0001-diretorio-global-usuarios", from: "completed", to: "defined", status: "Defined" });
    const path = join(project, "specs/defined/0001-diretorio-global-usuarios/spec.md");
    expect(readFileSync(path, "utf8")).toContain("| Status | Defined |");
    expect(existsSync(join(project, "specs/specs/0001-diretorio-global-usuarios"))).toBe(false);
  });

  test("a transition outside the method order exits with 2 and lists the accepted states", async () => {
    const r = await cli("specs", "transition", "0001", "completed", "--json");
    expect(r.code).toBe(2);
    expect(r.json.error.details.accepted).toEqual(["draft", "defined", "planned"]);
    expect(r.json.error.message).toContain("Accepted from defined");
  });

  test("an unknown state is rejected by the parser with 2", async () => {
    const r = await cli("specs", "transition", "0001", "done");
    expect(r.code).toBe(2);
  });

  test("an unknown spec exits with 6", async () => {
    const r = await cli("specs", "transition", "9999", "defined");
    expect(r.code).toBe(6);
  });

  test("concurrent CLI processes resolve the same spec under the transition lock", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "specsfy-transition-processes-"));
    try {
      const spec = "0042-login-social";
      const source = join(workspace, "specs", "planned", spec);
      const backlog = join(workspace, "specs", "backlog");
      mkdirSync(source, { recursive: true });
      mkdirSync(backlog);
      writeFileSync(join(source, "spec.md"), "# Login social\n\n| Status | Planned |\n");
      const item = join(backlog, "item.md");
      writeFileSync(item, `| Spec promovida | [Spec](../planned/${spec}/spec.md) |\n`);
      const args = ["specs", "transition", "42", "in-progress", "--project", workspace, "--json"];
      const results = await Promise.all([runCli(args, home), runCli(args, home)]);
      expect(results.map(({ code, json, stderr }) => ({
        code,
        error: json?.error,
        stderr,
      }))).toEqual([
        { code: ExitCode.SUCCESS, error: undefined, stderr: "" },
        { code: ExitCode.SUCCESS, error: undefined, stderr: "" },
      ]);
      expect(results.map(({ json }) => json.data.from).sort()).toEqual(["in-progress", "planned"]);
      const target = join("specs", "in-progress", spec, "spec.md");
      for (const { json } of results) {
        expect(json.data).toMatchObject({ identifier: spec, to: "in-progress", relativePath: target });
      }
      expect(existsSync(source)).toBe(false);
      expect(readFileSync(join(workspace, target), "utf8")).toBe("# Login social\n\n| Status | Implementing |\n");
      expect(readFileSync(item, "utf8")).toBe(`| Spec promovida | [Spec](../in-progress/${spec}/spec.md) |\n`);
    } finally {
      rmSync(workspace, { recursive: true, force: true });
    }
  });
});

describe("specs effort and migrate", () => {
  test("records the effort with its rationale", async () => {
    const r = await cli("specs", "effort", "0002", "5", "--reason", "Search and pagination", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.effort).toBe(5);
    const content = readFileSync(join(project, r.json.data.relativePath), "utf8");
    expect(content).toContain("| Effort | 5 |");
    expect(content).toContain("Search and pagination");
  });

  test("rejects an effort outside 1..10 and a missing reason", async () => {
    expect((await cli("specs", "effort", "0002", "11", "--reason", "x")).code).toBe(2);
    expect((await cli("specs", "effort", "0002", "3")).code).toBe(2);
  });

  test("migrates the remaining legacy specs", async () => {
    // example/ already uses the state folders: put one spec back in the
    // legacy layout to exercise the migration.
    mkdirSync(join(project, "specs/specs"), { recursive: true });
    renameSync(join(project, "specs/completed/0003-perfil-publico-usuario"), join(project, "specs/specs/0003-perfil-publico-usuario"));
    const r = await cli("specs", "migrate", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.count).toBeGreaterThan(0);
    expect(existsSync(join(project, "specs/specs/0003-perfil-publico-usuario"))).toBe(false);
    const again = await cli("specs", "migrate", "--json");
    expect(again.json.data.count).toBe(0);
  });
});

describe("tasks", () => {
  test("tasks check marks and unmarks the checkbox", async () => {
    const off = await cli("tasks", "check", "0003", "T001", "PREP", "--undo", "--json");
    expect(off.code).toBe(0);
    expect(off.json.data).toMatchObject({ task: "T001", item: "PREP", checked: false, changed: true });
    const path = join(project, off.json.data.path);
    expect(readFileSync(path, "utf8").split("\n")[off.json.data.line_number - 1]).toContain("- [ ] **PREP**");
    const on = await cli("tasks", "check", "0003", "T001", "PREP", "--json");
    expect(on.json.data).toMatchObject({ checked: true, changed: true });
    expect(readFileSync(path, "utf8").split("\n")[on.json.data.line_number - 1]).toContain("- [x] **PREP**");
  });

  test("tasks check fails with 6 for a missing task or item", async () => {
    expect((await cli("tasks", "check", "0003", "T999")).code).toBe(6);
    expect((await cli("tasks", "check", "0003", "T001", "NOPE")).code).toBe(6);
  });

  test("tasks next reports a complete spec", async () => {
    const r = await cli("tasks", "next", "0004", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.result.state).toBe("complete");
  });

  test("tasks next --phase red returns one eligible TDD task in a pending plan", async () => {
    const path = "specs/defined/0042-red/spec.md";
    const task = (id: string, tags: string, depends: string, check = " ") =>
      `- [${check}] ${id} ${tags} Task — Depends: ${depends}\n` +
      ["PREP", "EXECUTE", "VERIFY", "VISUAL", "EVIDENCE", "IMPROVE"]
        .map((key) => `  - [${check}] **${key}**: ${key}\n`).join("");
    const fixtures = [
      task("T001", "[TEST] [TDD]", "T005"),
      task("T002", "[CODE]", "none"),
      task("T003", "[TEST]", "none"),
      task("T005", "[TEST] [TDD]", "none"),
      task("T004", "[TEST] [TDD]", "none"),
    ];
    const writePlan = (body: string, planGate = "Pending") =>
      put(project, path, validSpec({ Slug: "0042-red", "Plan Gate": planGate })
        .replace("### 14. Tarefas\n\nConteúdo descrito.", `### 14. Tarefas\n\n${body}`));
    writePlan(fixtures.join("\n"));
    expect((await cli("tasks", "next", "42")).code).toBe(2);
    const next = async (...args: string[]) => cli("tasks", "next", "42", "--phase", "red", "--json", ...args);
    const first = await next("--all");
    expect(first.code).toBe(0);
    expect(first.json.data.result.ready).toMatchObject([{ id: "T005", next_item: { key: "PREP" } }]);
    expect(first.json.data.result.blocked).toMatchObject([{ id: "T001", waiting_for: ["T005"] }]);
    fixtures[3] = task("T005", "[TEST] [TDD]", "none", "x");
    writePlan(fixtures.join("\n"));
    expect((await next()).json.data.result.ready).toMatchObject([{ id: "T001" }]);
    writePlan(fixtures.join("\n"), "Passed");
    expect((await next()).code).toBe(2);
  });

  test("tasks delivery returns JSON with --json", async () => {
    const r = await cli("tasks", "delivery", "0004", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.result).toMatchObject({ result: "passed", status: "Complete" });
  });
});

describe("inbox, backlog and new specs", () => {
  test("inbox capture --json creates the file in specs/inbox/", async () => {
    const r = await cli("inbox", "capture", "--title", "Exportar pedidos", "--input", "Clientes querem exportar pedidos em CSV", "--json");
    expect(r.code).toBe(0);
    const path = r.json.data.result as string;
    expect(path).toContain(join(project, "specs", "inbox"));
    expect(readFileSync(path, "utf8")).toContain("Clientes querem exportar pedidos em CSV");
  });

  test("inbox capture without --input exits with 2", async () => {
    expect((await cli("inbox", "capture", "--title", "x")).code).toBe(2);
  });

  test("specs new creates a draft spec and inbox process requires the Definition Gate", async () => {
    const created = await cli("specs", "new", "--title", "Exportar pedidos", "--json");
    expect(created.code).toBe(0);
    expect(created.json.data.result).toContain(join("specs", "draft"));
    const capture = readdirSync(join(project, "specs", "inbox")).find((name) => name.endsWith(".md"))!;
    const draft = created.json.data.result.split("/").at(-2);
    const blocked = await cli("inbox", "process", capture, "--spec", draft, "--json");
    expect(blocked.code).toBe(10);
    const processed = await cli("inbox", "process", capture, "--spec", "0001,0002", "--json");
    expect(processed.code).toBe(0);
    expect(processed.json.data.to).toBe(`specs/inbox/processed/${capture}`);
    expect(existsSync(join(project, "specs", "inbox", "processed", capture))).toBe(true);
  });

  test("backlog start creates a numbered item", async () => {
    const r = await cli("backlog", "start", "--title", "Exportar pedidos", "--idea", "i", "--problem", "p", "--person", "q", "--result", "r", "--context", "c", "--json");
    expect(r.code).toBe(0);
    expect(r.json.data.result).toMatch(/specs\/backlog\/0003-exportar-pedidos\.md$/);
  });
});
