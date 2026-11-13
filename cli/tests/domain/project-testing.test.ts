/** Contratos da detecção e execução de testes do projeto consumidor. */
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  assertSafeLaravelTestDatabase,
  detectProjectTestCommand,
  presentOutputLine,
  runProjectTests,
} from "../../src/domain/project-testing.ts";
import { temporaryDirectory } from "./helpers.ts";

describe("runner do projeto consumidor", () => {
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

  test("detecta Laravel Pest sem executar código", async () => {
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

  test("aceita a fixture Pest e recusa projetos sem runner", async () => {
    const project = await temporaryDirectory();
    await expect(detectProjectTestCommand(project)).rejects.toThrow("Pest");
    await writeFile(join(project, "artisan"), "");
    await mkdir(join(project, "tests"));
    await writeFile(join(project, "tests/Pest.php"), "<?php\n");
    await expect(detectProjectTestCommand(project)).resolves.toMatchObject({
      label: "Laravel Pest",
    });
  });

  test("apresenta relatório estruturado sem expor JSON bruto", () => {
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

  test("transmite a saída e preserva o exit code do Pest", async () => {
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
      expect(output).toEqual([
        "PASS  Tests/Unit/ExampleTest.php",
        "1 failed",
      ]);
    } finally {
      if (previousPath === undefined) delete process.env.PATH;
      else process.env.PATH = previousPath;
    }
  });

  test("suspende testes sem .env.testing antes de iniciar o runner", async () => {
    const project = await temporaryDirectory();
    await writeFile(join(project, "artisan"), "");
    await mkdir(join(project, "tests"));
    await writeFile(join(project, "tests/Pest.php"), "<?php\n");

    await expect(runProjectTests(project)).rejects.toThrow(".env.testing");
  });

  test("recusa o banco de desenvolvimento e traits destrutivas", async () => {
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
      "banco de desenvolvimento",
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
      "recriar migrations",
    );
  });
});
