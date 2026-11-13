/**
 * Gate commands and `verify` (spec 0004), end to end in a subprocess: valid
 * and invalid specs in temporary projects, the `example/` project read-only,
 * verify without Node.js on the PATH and without `.agents/skills/`.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { gateCommands, gateDefinitions, gateTopLevelCommands } from "../../src/cli/commands/gates.ts";
import { EXAMPLE_DIR, cli, projectWithSpec, temporary, validSpec } from "./helpers.ts";

let home: string;
const cleanup: string[] = [];

beforeAll(() => {
  home = temporary("specsfy-gates-home-");
  cleanup.push(home);
});
afterAll(() => {
  for (const dir of cleanup) rmSync(dir, { recursive: true, force: true });
});

function project(markdown: string): string {
  const root = projectWithSpec(markdown);
  cleanup.push(root);
  return root;
}

describe("gate definitions", () => {
  test("list the gates in display order, all as gates", () => {
    expect(gateDefinitions.map((def) => def.name)).toEqual(["spec", "tasks", "interface", "trace", "acceptance", "evidence", "findings", "database"]);
    expect(gateDefinitions.map((def) => def.tool)).toEqual(["gate_spec", "gate_tasks", "gate_interface", "gate_trace", "gate_acceptance", "gate_evidence", "gate_findings", "gate_database"]);
    expect(gateDefinitions.every((def) => def.gate === true)).toBe(true);
    // tasks, evidence and database run code of the project, so MCP clients must not treat them as reads.
    expect(gateDefinitions.filter((def) => def.effect === "execute").map((def) => def.name)).toEqual(["tasks", "evidence", "database"]);
    expect(gateCommands.map((command) => command.name)).toEqual(gateDefinitions.map((def) => def.name));
    expect(gateTopLevelCommands.map((command) => command.name)).toEqual(["verify"]);
  });

  test("declare the options of each script", () => {
    const options = (name: string) => gateCommands.find((command) => command.name === name)!.options!.map((option) => option.name);
    expect(options("spec")).toEqual(["--allow-draft", "--project"]);
    expect(options("trace")).toEqual(["--kinds", "--full-chain", "--minimum-tests", "--project"]);
    expect(options("evidence")).toEqual(["--delivery", "--task", "--attestation", "--project"]);
    expect(options("database")).toEqual(["--command", "--project"]);
    const verify = gateTopLevelCommands[0]!.options!.map((option) => option.name);
    expect(verify).toEqual(["--boundary", "--attestation", "--timeout-seconds", "--max-output-bytes", "--self-test", "--project"]);
  });
});

describe("gate spec", () => {
  test("a valid spec exits with 0", async () => {
    const root = project(validSpec());
    const run = await cli(["gate", "spec", "0001", "--project", root, "--json"], home);
    expect(run.code).toBe(0);
    expect(run.json?.data.ok).toBe(true);
    expect(run.json?.data.result.errors).toEqual([]);
  });

  test("an invalid spec exits with 10 and lists the problems in --json", async () => {
    const root = project(validSpec({ Formato: "Specsfy/1.0", Status: "Unknown" }));
    const run = await cli(["gate", "spec", "lista", "--project", root, "--json"], home);
    expect(run.code).toBe(10);
    expect(run.json?.data.ok).toBe(false);
    expect(run.json?.data.exitCode).toBe(1);
    const errors: string[] = run.json?.data.result.errors;
    expect(errors.some((message) => message.includes("Specsfy/2.0"))).toBe(true);
    expect(errors.some((message) => message.includes("Status"))).toBe(true);
  });

  test("--allow-draft accepts a Draft spec that strict mode refuses", async () => {
    const root = project(validSpec({ Status: "Draft", "Definition Gate": "Pending" }));
    expect((await cli(["gate", "spec", "0001", "--project", root, "--json"], home)).code).toBe(10);
    expect((await cli(["gate", "spec", "0001", "--allow-draft", "--project", root, "--json"], home)).code).toBe(0);
  });

  test("an unknown spec exits with 6", async () => {
    const root = project(validSpec());
    const run = await cli(["gate", "spec", "9999", "--project", root, "--json"], home);
    expect(run.code).toBe(6);
  });

  test("the legacy specs of example/ fail the current contract", async () => {
    const run = await cli(["gate", "spec", "0001", "--project", EXAMPLE_DIR, "--json"], home);
    expect(run.code).toBe(10);
    expect(run.json?.data.result.status).toBe("Complete");
  });
});

describe("other gates on example/", () => {
  test("interface passes and returns the script text", async () => {
    const run = await cli(["gate", "interface", "0001", "--project", EXAMPLE_DIR, "--json"], home);
    expect(run.code).toBe(0);
    expect(typeof run.json?.data.result).toBe("string");
  });

  test("trace forwards --kinds and --minimum-tests", async () => {
    const run = await cli(["gate", "trace", "0001", "--kinds", "US,AC", "--minimum-tests", "1", "--project", EXAMPLE_DIR, "--json"], home);
    expect([0, 10]).toContain(run.code);
    expect(run.json?.data.result.kinds).toEqual(["US", "AC"]);
    expect(run.json?.data.result.required_cases).toBe(1);
  });

  test("acceptance, evidence and findings pass", async () => {
    for (const gate of ["acceptance", "evidence", "findings"]) {
      const run = await cli(["gate", gate, "0001", "--project", EXAMPLE_DIR, "--json"], home);
      expect({ gate, code: run.code }).toEqual({ gate, code: 0 });
      expect(run.json?.data.result.result).toBe("passed");
    }
  });

  test("tasks fails on the legacy spec with 10", async () => {
    const run = await cli(["gate", "tasks", "0001", "--project", EXAMPLE_DIR, "--json"], home);
    expect(run.code).toBe(10);
    expect(run.json?.data.result.errors.length).toBeGreaterThan(0);
  });

  test("database is safe, and a destructive --command fails with 10", async () => {
    const safe = await cli(["gate", "database", "--project", EXAMPLE_DIR, "--json"], home);
    expect(safe.code).toBe(0);
    expect(safe.json?.data.result.status).toBe("safe");
    const wipe = await cli(["gate", "database", "--command", "php artisan migrate:fresh", "--project", EXAMPLE_DIR, "--json"], home);
    expect(wipe.code).toBe(10);
    expect(wipe.json?.data.result.status).toBe("ignored");
  });
});

describe("verify", () => {
  test("--self-test --json passes", async () => {
    const root = project(validSpec());
    const run = await cli(["verify", "--self-test", "--project", root, "--json"], home);
    expect(run.code).toBe(0);
    expect(run.json?.data.result.result).toBe("passed");
    expect(run.json?.data.result.checks[0].name).toBe("self-test");
    expect(run.json?.data.timeoutSeconds).toBe(300);
  });

  test("--json on example/ returns result and exits with 10", async () => {
    const run = await cli(["verify", "--project", EXAMPLE_DIR, "--json"], home);
    expect(run.code).toBe(10);
    expect(run.json?.data.skillsSource).toBe("project");
    expect(run.json?.data.result.result).toBe("failed");
    const checks: Array<{ name: string; status: string }> = run.json?.data.result.checks;
    expect(checks.find((check) => check.name === "skills")?.status).toBe("passed");
    expect(checks.find((check) => check.name === "acceptance:0001-diretorio-global-usuarios")?.status).toBe("passed");
  });

  test("works without Node.js on the PATH", async () => {
    const bin = temporary("specsfy-gates-path-");
    cleanup.push(bin);
    const git = Bun.which("git");
    if (git) symlinkSync(git, join(bin, "git"));
    const run = await cli(["verify", "--project", EXAMPLE_DIR, "--json"], home, { PATH: bin });
    expect(run.code).toBe(10);
    const checks: Array<{ name: string; status: string; detail: string }> = run.json?.data.result.checks;
    const acceptance = checks.find((check) => check.name === "acceptance:0001-diretorio-global-usuarios");
    expect(acceptance?.status).toBe("passed");
  });

  test("falls back to the embedded scripts without .agents/skills/", async () => {
    const root = project(validSpec());
    const run = await cli(["verify", "--project", root, "--json"], home);
    expect(run.code).toBe(10);
    expect(run.json?.data.skillsSource).toBe("embedded");
    const checks: Array<{ name: string; status: string }> = run.json?.data.result.checks;
    expect(checks.find((check) => check.name === "spec:0001-lista")?.status).toBe("passed");
    expect(checks.find((check) => check.name === "skills")?.status).toBe("failed");
  });

  test("--attestation writes the payload relative to the project", async () => {
    const root = project(validSpec());
    mkdirSync(join(root, ".specsfy"), { recursive: true });
    const run = await cli(["verify", "--self-test", "--boundary", "ci", "--attestation", ".specsfy/attestation.json", "--timeout-seconds", "30", "--project", root, "--json"], home);
    expect(run.code).toBe(0);
    expect(run.json?.data.boundary).toBe("ci");
    expect(run.json?.data.timeoutSeconds).toBe(30);
    expect(existsSync(join(root, ".specsfy", "attestation.json"))).toBe(true);
    const attestation = await Bun.file(join(root, ".specsfy", "attestation.json")).json();
    expect(attestation.boundary).toBe("ci");
  });

  test("invalid limits exit with 2", async () => {
    const root = project(validSpec());
    expect((await cli(["verify", "--timeout-seconds", "0", "--project", root, "--json"], home)).code).toBe(2);
    expect((await cli(["verify", "--boundary", "remote", "--project", root, "--json"], home)).code).toBe(2);
  });
});
