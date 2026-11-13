/** Contracts of the detection and execution of the consumer project tests. */
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  assertSafeLaravelTestDatabase,
  detectProjectTestCommand,
  presentOutputLine,
  runProjectTests,
} from "../../src/domain/project-testing.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("consumer project runner", () => {
  async function configureSafeDatabase(project: string): Promise<void> {
    await writeFile(
      join(project, ".env"),
      "APP_ENV=local\nDB_CONNECTION=mysql\nDB_HOST=127.0.0.1\nDB_DATABASE=produto_dev\n",
    );
    await writeFile(
      join(project, ".env.testing"),
      "APP_ENV=testing\nDB_DATABASE=produto_test\n",
    );
  }

  test("detects Laravel Pest without running code", async () => {
    const project = await temporaryDirectory();
    await writeFile(join(project, "artisan"), "#!/usr/bin/env php\n");
    await writeFile(
      join(project, "composer.json"),
      JSON.stringify({ "require-dev": { "pestphp/pest": "^4" } }),
    );

    await expect(detectProjectTestCommand(project)).resolves.toEqual({
      label: "Laravel Pest",
      argv: ["php", "artisan", "test"],
      cwd: project,
      display: "php artisan test",
    });
  });

  test("accepts the Pest fixture and refuses projects without a runner", async () => {
    const project = await temporaryDirectory();
    await expect(detectProjectTestCommand(project)).rejects.toMatchObject({ code: ExitCode.NOT_FOUND, message: expect.stringContaining("test runner") });
    await writeFile(join(project, "artisan"), "");
    await mkdir(join(project, "tests"));
    await writeFile(join(project, "tests/Pest.php"), "<?php\n");
    await expect(detectProjectTestCommand(project)).resolves.toMatchObject({
      label: "Laravel Pest",
    });
  });

  test("presents the structured report without raw JSON", () => {
    const result = presentOutputLine(
      JSON.stringify({
        tool: "pest",
        result: "failed",
        tests: 2,
        passed: 1,
        errors: 1,
        assertions: 3,
        duration_ms: 1250,
        error_details: [
          {
            test: "DashboardTest::loads dashboard",
            file: "/project/tests/DashboardTest.php",
            line: 12,
            message: "Expected status 200.",
          },
        ],
      }),
    );
    expect(result.summary).toEqual([
      "Tests: 2 total · 1 passed · 1 errors",
      "Assertions: 3",
      "Duration: 1.25s",
    ]);
    expect(result.lines).toContain("FAIL  DashboardTest::loads dashboard");
    expect(result.lines.join("\n")).not.toContain("error_details");
  });

  test("streams the output and keeps the Pest exit code", async () => {
    const project = await temporaryDirectory();
    const commands = await temporaryDirectory();
    await writeFile(join(project, "artisan"), "");
    await mkdir(join(project, "tests"));
    await writeFile(join(project, "tests/Pest.php"), "<?php\n");
    await configureSafeDatabase(project);
    const php = join(commands, "php");
    await writeFile(
      php,
      "#!/bin/sh\nprintf 'PASS  Tests/Unit/ExampleTest.php\\n1 failed\\n'\nexit 1\n",
    );
    await chmod(php, 0o755);
    const previousPath = process.env.PATH;
    process.env.PATH = `${commands}:${previousPath ?? ""}`;
    const output: string[] = [];
    try {
      const result = await runProjectTests(project, (line) => output.push(line));
      expect(result.exit_code).toBe(1);
      expect(result.summary_lines).toEqual(["1 failed"]);
      expect(result.output).toEqual(["PASS  Tests/Unit/ExampleTest.php", "1 failed"]);
      expect(output).toEqual([
        "PASS  Tests/Unit/ExampleTest.php",
        "1 failed",
      ]);
    } finally {
      if (previousPath === undefined) delete process.env.PATH;
      else process.env.PATH = previousPath;
    }
  });

  test("suspends tests without .env.testing before starting the runner", async () => {
    const project = await temporaryDirectory();
    await writeFile(join(project, "artisan"), "");
    await mkdir(join(project, "tests"));
    await writeFile(join(project, "tests/Pest.php"), "<?php\n");

    await expect(runProjectTests(project)).rejects.toMatchObject({ code: ExitCode.GATE_FAILED, message: expect.stringContaining(".env.testing") });
  });

  test("refuses the development database and destructive traits", async () => {
    const project = await temporaryDirectory();
    await writeFile(join(project, "artisan"), "");
    await mkdir(join(project, "tests"));
    await writeFile(
      join(project, ".env"),
      "APP_ENV=local\nDB_CONNECTION=mysql\nDB_DATABASE=produto_dev\n",
    );
    await writeFile(
      join(project, ".env.testing"),
      "APP_ENV=testing\nDB_DATABASE=produto_dev\n",
    );
    await writeFile(join(project, "tests/Pest.php"), "<?php\n");

    await expect(assertSafeLaravelTestDatabase(project)).rejects.toThrow(
      "development database",
    );

    await writeFile(
      join(project, ".env.testing"),
      "APP_ENV=testing\nDB_DATABASE=produto_test\n",
    );
    await writeFile(
      join(project, "tests/Pest.php"),
      "<?php\nuse Illuminate\\Foundation\\Testing\\RefreshDatabase;\n",
    );
    await expect(assertSafeLaravelTestDatabase(project)).rejects.toThrow(
      "recreate migrations",
    );
  });
});
