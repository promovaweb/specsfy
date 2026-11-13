/**
 * Detecção e execução segura dos testes do projeto consumidor.
 */

import { spawn } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { performance } from "node:perf_hooks";
import { isFile, pathExists, resolvePath } from "./filesystem.ts";
import { assertConsumerProject } from "./skill-lock.ts";

/** Comando de teste detectado sem interpretação por shell. */
export interface TestCommand {
  label: string;
  argv: readonly string[];
  cwd: string;
  display: string;
}

/** Resultado de uma execução do runner do consumidor. */
export interface TestRun {
  command: TestCommand;
  exit_code: number;
  duration_seconds: number;
  summary_lines: string[];
}

/** Detecta Laravel com Pest sem executar código do projeto. */
export async function detectProjectTestCommand(
  project: string,
): Promise<TestCommand> {
  const root = resolvePath(project);
  if (!(await pathExists(root))) {
    throw new Error(`projeto não encontrado: ${root}`);
  }
  await assertConsumerProject(root);
  if ((await isFile(join(root, "artisan"))) && (await usesPest(root))) {
    const argv = ["php", "artisan", "test"] as const;
    return {
      label: "Laravel Pest",
      argv,
      cwd: root,
      display: argv.join(" "),
    };
  }
  throw new Error(
    "Pest não foi detectado no projeto. " +
      "É esperado um projeto Laravel com artisan e pestphp/pest.",
  );
}

/** Executa o runner detectado, transmite linhas e preserva o exit code. */
export async function runProjectTests(
  project: string,
  emit: (line: string) => void = console.log,
  signal?: AbortSignal,
): Promise<TestRun> {
  const command = await detectProjectTestCommand(project);
  await assertSafeLaravelTestDatabase(command.cwd);
  const startedAt = performance.now();
  const lines: string[] = [];
  let structuredSummary: string[] = [];
  const [executable, ...arguments_] = command.argv;
  if (!executable) throw new Error("comando de teste vazio");
  const child = spawn(executable, arguments_, {
    cwd: command.cwd,
    env: { ...process.env, NO_COLOR: process.env.NO_COLOR ?? "1" },
    stdio: ["ignore", "pipe", "pipe"],
    signal,
  });
  if (!child.stdout) throw new Error("não foi possível capturar a saída do Pest");
  const consume = (line: string): void => {
    const presented = presentOutputLine(line);
    lines.push(...presented.lines);
    if (presented.summary.length) structuredSummary = presented.summary;
    for (const item of presented.lines) emit(item);
  };
  createInterface({ input: child.stdout, crlfDelay: Infinity }).on("line", consume);
  if (child.stderr) {
    createInterface({ input: child.stderr, crlfDelay: Infinity }).on(
      "line",
      consume,
    );
  }
  const exitCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code ?? 1));
  });
  return {
    command,
    exit_code: exitCode,
    duration_seconds: (performance.now() - startedAt) / 1000,
    summary_lines: structuredSummary.length
      ? structuredSummary
      : summaryLines(lines),
  };
}

/**
 * Interrompe o runner antes do spawn quando Laravel não possui um banco de
 * testes explícito e separado ou quando a suíte tenta recriar migrations.
 */
export async function assertSafeLaravelTestDatabase(root: string): Promise<void> {
  const developmentPath = join(root, ".env");
  const testingPath = join(root, ".env.testing");
  if (!(await isFile(testingPath))) {
    throw new Error(
      "testes suspensos: crie .env.testing com um banco separado do .env",
    );
  }

  const development = (await isFile(developmentPath))
    ? parseEnvironment(await readFile(developmentPath, "utf8"))
    : new Map<string, string>();
  const testing = parseEnvironment(await readFile(testingPath, "utf8"));
  if (testing.get("APP_ENV") !== "testing") {
    throw new Error("testes suspensos: .env.testing exige APP_ENV=testing");
  }
  if (!testing.get("DB_DATABASE") && !testing.get("DB_URL")) {
    throw new Error(
      "testes suspensos: .env.testing deve declarar DB_DATABASE ou DB_URL",
    );
  }
  const testingTarget = databaseTarget(testing, development);
  const developmentTarget = databaseTarget(development);
  if (developmentTarget && testingTarget === developmentTarget) {
    throw new Error(
      "testes suspensos: .env.testing aponta para o banco de desenvolvimento",
    );
  }

  const testsPath = join(root, "tests");
  if (!(await pathExists(testsPath))) return;
  for (const path of await phpFiles(testsPath)) {
    const source = await readFile(path, "utf8");
    if (/\b(?:RefreshDatabase|DatabaseMigrations)\b/u.test(source)) {
      throw new Error(
        "testes suspensos: a suíte usa trait que pode recriar migrations",
      );
    }
  }
}

/** Formata uma linha JSON estruturada do Pest ou preserva texto comum. */
export function presentOutputLine(line: string): {
  lines: string[];
  summary: string[];
} {
  let payload: unknown;
  try {
    payload = JSON.parse(line) as unknown;
  } catch {
    return { lines: [line], summary: [] };
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    (payload as Record<string, unknown>).tool !== "pest" ||
    typeof (payload as Record<string, unknown>).result !== "string"
  ) {
    return { lines: [line], summary: [] };
  }
  const value = payload as Record<string, unknown>;
  const total = integer(value.tests);
  const passed = integer(value.passed);
  const errors = integer(value.errors);
  const assertions = integer(value.assertions);
  const duration = integer(value.duration_ms);
  const summary = [
    `Tests: ${total} total · ${passed} passed · ${errors} errors`,
    `Assertions: ${assertions}`,
    `Duration: ${(duration / 1000).toFixed(2)}s`,
  ];
  const lines: string[] = [];
  if (Array.isArray(value.error_details)) {
    for (const detail of value.error_details) {
      if (!detail || typeof detail !== "object") continue;
      const error = detail as Record<string, unknown>;
      lines.push(
        `FAIL  ${String(error.test ?? "Teste desconhecido")}`,
        `      ${String(error.file ?? "arquivo desconhecido")}:${String(error.line ?? "?")}`,
        `      ${String(error.message ?? "Erro sem mensagem")}`,
        "",
      );
    }
  }
  if (!lines.length) lines.push(summary[0]!);
  return { lines, summary };
}

async function usesPest(root: string): Promise<boolean> {
  if (
    (await isFile(join(root, "tests", "Pest.php"))) ||
    (await isFile(join(root, "vendor", "bin", "pest")))
  ) {
    return true;
  }
  const path = join(root, "composer.json");
  if (!(await isFile(path))) return false;
  let payload: unknown;
  try {
    payload = JSON.parse(await readFile(path, "utf8")) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`composer.json inválido em ${root}: ${message}`);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  const dependencies = new Set<string>();
  for (const section of ["require", "require-dev"]) {
    const value = (payload as Record<string, unknown>)[section];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const dependency of Object.keys(value)) dependencies.add(dependency);
    }
  }
  return dependencies.has("pestphp/pest");
}

async function phpFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  const pending = [root];
  while (pending.length) {
    const directory = pending.pop();
    if (!directory) continue;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile() && path.endsWith(".php")) found.push(path);
    }
  }
  return found.sort();
}

function parseEnvironment(source: string): Map<string, string> {
  const environment = new Map<string, string>();
  for (const line of source.split(/\r?\n/u)) {
    const match = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u.exec(line);
    if (!match?.[1] || match[2] === undefined) continue;
    environment.set(match[1], unquote(match[2]));
  }
  return environment;
}

function databaseTarget(
  environment: Map<string, string>,
  fallback = new Map<string, string>(),
): string {
  const get = (name: string): string =>
    environment.get(name) ?? fallback.get(name) ?? "";
  const url = get("DB_URL");
  if (url) return `url:${url}`;
  return [get("DB_CONNECTION"), get("DB_HOST"), get("DB_PORT"), get("DB_DATABASE")].join("|");
}

function unquote(input: string): string {
  if (
    input.length >= 2 &&
    ((input.startsWith('"') && input.endsWith('"')) ||
      (input.startsWith("'") && input.endsWith("'")))
  ) {
    return input.slice(1, -1);
  }
  return input;
}

function summaryLines(lines: string[]): string[] {
  const markers = ["tests:", "duration:", "passed", "failed", "skipped", "todo"];
  return lines
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        markers.some((marker) => line.toLowerCase().includes(marker)),
    )
    .slice(-3);
}

function integer(value: unknown): number {
  return Number.isInteger(value) ? (value as number) : 0;
}
