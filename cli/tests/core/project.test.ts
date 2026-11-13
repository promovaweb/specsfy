/**
 * Spec 0001: project resolution, read model and embedded script runner.
 *
 * Reads the framework `example/` project without changing it and builds
 * small projects in temporary directories for the edge cases.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findProjectRoot, resolveProject, resolveSpecPath } from "../../src/core/project.ts";
import { listSpecs, projectOverview, specDetail } from "../../src/core/overview.ts";
import { embeddedScripts, runScript } from "../../src/engine/runner.ts";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { HOME_VARIABLE } from "../../src/config/paths.ts";

const example = join(import.meta.dir, "..", "..", "..", "example");
let dir: string;
let home: string;

/** Minimal spec in the canonical layout. */
function spec(root: string, folder: string, name: string, status = "Draft") {
  const path = join(root, "specs", folder, name);
  mkdirSync(path, { recursive: true });
  writeFileSync(join(path, "spec.md"), `# ${name}\n\n| Campo | Valor |\n| --- | --- |\n| Status | ${status} |\n| Formato | Specsfy/2.0 |\n`);
}

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "specsfy-core-"));
  home = mkdtempSync(join(tmpdir(), "specsfy-home-"));
  process.env[HOME_VARIABLE] = home;
  spec(dir, "draft", "0001-recover-password");
  spec(dir, "defined", "0002-export-orders", "Defined");
  spec(dir, "planned", "0003-export-orders-csv", "Planned");
  mkdirSync(join(dir, "app", "deep"), { recursive: true });
});
afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
  rmSync(home, { recursive: true, force: true });
});

async function rejection(promise: Promise<unknown>): Promise<AppError> {
  try {
    await promise;
  } catch (e) {
    return e as AppError;
  }
  throw new Error("expected a rejection");
}

describe("findProjectRoot", () => {
  test("walks up from a subfolder to the directory with specs/", () => {
    expect(findProjectRoot(join(dir, "app", "deep"))).toBe(dir);
  });

  test("resolveProject rejects a missing --project directory", () => {
    expect(() => resolveProject(join(dir, "missing"))).toThrow(AppError);
  });
});

describe("resolveSpecPath", () => {
  test("accepts folder name, number with and without padding, slug and path", async () => {
    const expected = join(dir, "specs", "draft", "0001-recover-password", "spec.md");
    expect(await resolveSpecPath(dir, "0001-recover-password")).toBe(expected);
    expect(await resolveSpecPath(dir, "0001")).toBe(expected);
    expect(await resolveSpecPath(dir, "1")).toBe(expected);
    expect(await resolveSpecPath(dir, "recover-password")).toBe(expected);
    expect(await resolveSpecPath(dir, "specs/draft/0001-recover-password")).toBe(expected);
  });

  test("an unknown spec is NOT_FOUND", async () => {
    expect((await rejection(resolveSpecPath(dir, "9999"))).code).toBe(ExitCode.NOT_FOUND);
  });

  test("an empty identifier is USAGE", async () => {
    expect((await rejection(resolveSpecPath(dir, " "))).code).toBe(ExitCode.USAGE);
  });
});

describe("read model", () => {
  test("overview counts specs per state folder", async () => {
    const overview = await projectOverview(dir);
    expect(overview.summary.total_specs).toBe(3);
    expect(overview.states.draft).toBe(1);
    expect(overview.states.defined).toBe(1);
    expect(overview.states.planned).toBe(1);
  });

  test("listSpecs filters by state", async () => {
    const specs = await listSpecs(dir, "planned");
    expect(specs.map((item) => item.slug)).toEqual(["0003-export-orders-csv"]);
  });

  test("the example project has six legacy specs", async () => {
    const overview = await projectOverview(example);
    expect(overview.specs).toHaveLength(6);
    expect(overview.states.legacy).toBe(6);
  });

  test("specDetail includes the Markdown only on request", async () => {
    expect((await specDetail(dir, "1")).content).toBeUndefined();
    expect((await specDetail(dir, "1", true)).content).toContain("recover-password");
  });
});

describe("embedded scripts", () => {
  test("the skills tree carries the framework scripts", () => {
    expect(embeddedScripts()).toContain("specsfy-04-validate/scripts/validate_spec.mjs");
  });

  test("runScript executes a script with the binary runtime", async () => {
    const run = await runScript("specsfy-progress/scripts/progress.mjs", [example, "--json"], { cwd: example });
    expect(run.code).toBe(0);
    expect((run.json as { summary: { total_specs: number } }).summary.total_specs).toBe(6);
  });

  test("an unknown script is NOT_FOUND", async () => {
    expect((await rejection(runScript("missing/scripts/x.mjs", []))).code).toBe(ExitCode.NOT_FOUND);
  });
});
