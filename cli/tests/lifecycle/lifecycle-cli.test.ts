/** Spec lifecycle commands (spec 0003) end to end, on copies of `example/`. */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
