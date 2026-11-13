/**
 * The `test` command (spec 0006) end to end, with a fake `php` on the PATH:
 * NOT_FOUND without a runner, GATE_FAILED before PHP without the database
 * proof, the runner exit code otherwise, live text output and --json data.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { chmodSync, existsSync, rmSync } from "node:fs";
import { delimiter, join } from "node:path";
import { cli, put, temporary } from "./helpers.ts";

let home: string;
let bin: string;
let marker: string;
const cleanup: string[] = [];

/** Writes a fake `php` that records its run and exits with `code`. */
function fakePhp(code: number): void {
  const php = put(bin, "php", `#!/bin/sh\ntouch '${marker}'\nprintf 'PASS  Tests/Unit/ExampleTest.php\\nTests: 1 passed\\n'\nexit ${code}\n`);
  chmodSync(php, 0o755);
}

/** Creates a Laravel Pest project; `safe` adds a separate test database. */
function laravel(safe: boolean): string {
  const root = temporary("specsfy-test-project-");
  cleanup.push(root);
  put(root, "artisan", "");
  put(root, "tests/Pest.php", "<?php\n");
  put(root, ".env", "APP_ENV=local\nDB_CONNECTION=mysql\nDB_DATABASE=app_dev\n");
  if (safe) put(root, ".env.testing", "APP_ENV=testing\nDB_DATABASE=app_test\n");
  return root;
}

const env = () => ({ PATH: `${bin}${delimiter}${process.env.PATH ?? ""}` });

beforeAll(() => {
  home = temporary("specsfy-test-home-");
  bin = temporary("specsfy-test-bin-");
  marker = join(bin, "php-ran");
  cleanup.push(home, bin);
});
afterAll(() => {
  for (const dir of cleanup) rmSync(dir, { recursive: true, force: true });
});

describe.skipIf(process.platform === "win32")("test", () => {
  test("a project without a known runner exits with 6", async () => {
    const root = temporary("specsfy-test-empty-");
    cleanup.push(root);
    const run = await cli(["test", "--project", root, "--json"], home, env());
    expect(run.code).toBe(6);
    expect(run.json?.error?.code).toBe(6);
  });

  test("without .env.testing it exits with 10 before PHP starts", async () => {
    rmSync(marker, { force: true });
    fakePhp(0);
    const run = await cli(["test", "--project", laravel(false), "--json"], home, env());
    expect(run.code).toBe(10);
    expect(run.json?.error?.message).toContain(".env.testing");
    expect(existsSync(marker)).toBe(false);
  });

  test("a passing suite exits with 0 and returns the data", async () => {
    fakePhp(0);
    const run = await cli(["test", "--project", laravel(true), "--json"], home, env());
    expect(run.code).toBe(0);
    const data = run.json?.data;
    expect(data.runner).toBe("Laravel Pest");
    expect(data.command).toBe("php artisan test");
    expect(data.exitCode).toBe(0);
    expect(typeof data.durationMs).toBe("number");
    expect(data.summary).toEqual(["Tests: 1 passed"]);
    expect(data.output).toEqual(["PASS  Tests/Unit/ExampleTest.php", "Tests: 1 passed"]);
  });

  test("a failing suite exits with 1 and keeps the runner code", async () => {
    fakePhp(3);
    const run = await cli(["test", "--project", laravel(true), "--json"], home, env());
    expect(run.code).toBe(1);
    expect(run.json?.data.exitCode).toBe(3);
  });

  test("text mode streams the runner output", async () => {
    fakePhp(0);
    const run = await cli(["test", "--project", laravel(true)], home, env());
    expect(run.code).toBe(0);
    expect(run.stdout).toContain("PASS  Tests/Unit/ExampleTest.php\nTests: 1 passed\nLaravel Pest: exit 0");
  });
});
