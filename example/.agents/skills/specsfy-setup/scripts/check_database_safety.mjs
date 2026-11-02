/**
 * Confere a separação do banco de testes e recusa comandos que podem apagar
 * estruturas ou registros antes que uma skill execute testes ou migrations.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const arguments_ = process.argv.slice(2);
const value = (flag) => {
  const index = arguments_.indexOf(flag);
  return index >= 0 ? arguments_[index + 1] : undefined;
};
const project = resolve(value("--project") ?? ".");
const command = value("--command") ?? "";
const json = arguments_.includes("--json");

const destructiveCommands = [
  /\bmigrate:(?:fresh|refresh|reset|rollback)\b/iu,
  /\bdb:wipe\b/iu,
  /\bschema:drop\b/iu,
  /\bprisma\s+migrate\s+reset\b/iu,
  /\b(?:rails|rake)\s+db:(?:drop|reset|setup)\b/iu,
  /\bmanage\.py\s+flush\b/iu,
  /\bdoctrine(?::|\s+)schema(?::|\s+)drop\b/iu,
  /\bsequelize\s+db:drop\b/iu,
  /\btypeorm\s+schema:drop\b/iu,
  /\bdrizzle-kit\s+drop\b/iu,
  /\bdropDatabase\s*\(/u,
  /\bDROP\s+(?:DATABASE|SCHEMA|TABLE)\b/iu,
  /\bTRUNCATE(?:\s+TABLE)?\b/iu,
  /--force-reset\b/iu,
];
const destructiveMigrationSource = [
  /->drop(?:IfExists|Column|ConstrainedForeignId|Foreign|Index|Primary|Unique)?\s*\(/u,
  /Schema::drop(?:IfExists)?\s*\(/u,
  /\bDROP\s+(?:DATABASE|SCHEMA|TABLE|COLUMN)\b/iu,
  /\bTRUNCATE(?:\s+TABLE)?\b/iu,
];
const destructiveTestTraits = /\b(?:RefreshDatabase|DatabaseMigrations)\b/u;

const errors = [];
const ignored = [];

if (!existsSync(project)) {
  errors.push(`projeto não encontrado: ${project}`);
} else {
  for (const pattern of destructiveCommands) {
    if (pattern.test(command)) {
      ignored.push("o comando informado pode apagar estruturas ou registros");
      break;
    }
  }

  await inspectCommandAlias();

  if (existsSync(join(project, "artisan"))) {
    await inspectLaravelEnvironment();
    if (isTestCommand(command)) await inspectLaravelTests();
    if (isMigrationCommand(command)) await inspectLaravelMigrations();
  }
}

const status = ignored.length ? "ignored" : errors.length ? "pending" : "safe";
const payload = {
  status,
  project,
  command_checked: Boolean(command),
  errors,
  ignored,
};

if (json) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(`Proteção do banco: ${status.toUpperCase()}`);
  for (const message of errors) console.log(`PENDENTE: ${message}`);
  for (const message of ignored) console.log(`IGNORADO: ${message}`);
}
process.exitCode = status === "safe" ? 0 : status === "ignored" ? 3 : 1;

/** Exige um destino explícito de teste diferente do banco usado pelo .env. */
async function inspectLaravelEnvironment() {
  const developmentPath = join(project, ".env");
  const testingPath = join(project, ".env.testing");
  if (!existsSync(testingPath)) {
    errors.push("Laravel exige .env.testing antes de executar qualquer teste");
    return;
  }

  const development = existsSync(developmentPath)
    ? parseEnv(await readFile(developmentPath, "utf8"))
    : new Map();
  const testing = parseEnv(await readFile(testingPath, "utf8"));

  if (testing.get("APP_ENV") !== "testing") {
    errors.push(".env.testing precisa declarar APP_ENV=testing");
  }
  if (!testing.get("DB_DATABASE") && !testing.get("DB_URL")) {
    errors.push(
      ".env.testing precisa declarar DB_DATABASE ou DB_URL sem herdar o .env",
    );
    return;
  }
  const testingTarget = databaseTarget(testing, development);
  const developmentTarget = databaseTarget(development);
  if (developmentTarget && testingTarget === developmentTarget) {
    errors.push(".env.testing aponta para o banco de desenvolvimento");
  }
}

/** Recusa traits Laravel que recriam migrations durante a inicialização. */
async function inspectLaravelTests() {
  const tests = join(project, "tests");
  if (!existsSync(tests)) return;
  for (const path of await regularFiles(tests)) {
    if (!path.endsWith(".php")) continue;
    const source = await readFile(path, "utf8");
    const match = destructiveTestTraits.exec(source);
    if (match) {
      ignored.push(
        `${basename(path)} usa ${match[1] ?? match[0]}, que pode recriar o banco`,
      );
    }
  }
}

/** Confere remoções somente nas migrations que o banco separado ainda não executou. */
async function inspectLaravelMigrations() {
  const migrations = join(project, "database", "migrations");
  if (!existsSync(migrations)) return;
  const destructive = [];
  for (const path of await regularFiles(migrations)) {
    const up = migrationMethod(await readFile(path, "utf8"), "up", "down");
    if (destructiveMigrationSource.some((pattern) => pattern.test(up))) destructive.push(path);
  }
  if (!destructive.length || errors.length || ignored.length) return;
  const environments = [...command.matchAll(/--env(?:=|\s+)([\w-]+)/gu)].map((match) => match[1]);
  if (!environments.length || environments.some((environment) => environment !== "testing") || /--(?:database|path|realpath)\b/u.test(command)) {
    errors.push("a consulta de migrations exige --env=testing e a conexão e os caminhos padrão");
    return;
  }
  if (existsSync(join(project, "bootstrap", "cache", "config.php"))) {
    errors.push("o cache de configuração precisa ser reconciliado com o banco de teste para consultar migrations");
    return;
  }
  // Consulta somente leitura, com argumentos fixos. O texto recebido nunca vira código de shell.
  const status = spawnSync("php", ["artisan", "migrate:status", "--env=testing", "--no-ansi"], {
    cwd: project, encoding: "utf8", timeout: 15_000, maxBuffer: 1_000_000,
  });
  if (status.status !== 0) {
    errors.push("não foi possível consultar o estado das migrations no banco de teste");
    return;
  }
  // Uma consulta sem estados mantém a recusa histórica das migrations destrutivas.
  if (!status.stdout.trim()) {
    ignored.push("a consulta não informou estados; as migrations que podem apagar registros permanecem recusadas");
    return;
  }
  for (const path of destructive) {
    const name = basename(path, ".php");
    const line = status.stdout.split(/\r?\n/u).find((row) => row.trimStart().startsWith(name + " "));
    if (line && /\bRan\s*$/u.test(line)) continue;
    if (line && /\bPending\s*$/u.test(line)) ignored.push(basename(path) + " está pendente e contém uma alteração que pode apagar registros");
    else errors.push("estado da migration não confirmado: " + basename(path));
  }
}

/** Isola o corpo executado pelo avanço da migration e desconsidera o rollback. */
function migrationMethod(source, method, nextMethod) {
  const start = source.search(new RegExp(`public\\s+function\\s+${method}\\s*\\(`, "u"));
  if (start < 0) return source;
  const tail = source.slice(start);
  const next = tail.search(
    new RegExp(`public\\s+function\\s+${nextMethod}\\s*\\(`, "u"),
  );
  return next < 0 ? tail : tail.slice(0, next);
}

/** Lê arquivos pequenos de uma árvore sem seguir links simbólicos. */
async function regularFiles(root) {
  const found = [];
  const pending = [root];
  while (pending.length) {
    const directory = pending.pop();
    if (!directory) continue;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) pending.push(path);
      else if (entry.isFile() && (await stat(path)).size <= 2_000_000) found.push(path);
    }
  }
  return found.sort();
}

/** Interpreta somente pares chave-valor; valores nunca são incluídos na saída. */
function parseEnv(source) {
  const result = new Map();
  for (const line of source.split(/\r?\n/u)) {
    const match = /^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u.exec(line);
    if (!match) continue;
    result.set(match[1], unquote(match[2]));
  }
  return result;
}

/** Produz uma identidade comparável sem revelar credenciais ou nomes na saída. */
function databaseTarget(environment, fallback = new Map()) {
  const get = (name) => environment.get(name) ?? fallback.get(name);
  const url = get("DB_URL");
  if (url) return `url:${url}`;
  const database = get("DB_DATABASE");
  if (!database) return "";
  return [
    get("DB_CONNECTION") ?? "",
    get("DB_HOST") ?? "",
    get("DB_PORT") ?? "",
    database,
  ].join("|");
}

/** Confere o conteúdo do alias de pacote acionado pelo comando informado. */
async function inspectCommandAlias() {
  const aliases = [];
  const composerMatch = /\bcomposer\s+(?:run\s+)?([\w:-]+)/iu.exec(command);
  if (composerMatch && !["install", "update", "require"].includes(composerMatch[1])) {
    aliases.push([join(project, "composer.json"), composerMatch[1]]);
  }
  const packageMatch = /\b(?:npm|pnpm|yarn|bun)(?:\s+run)?\s+([\w:-]+)/iu.exec(command);
  if (packageMatch) aliases.push([join(project, "package.json"), packageMatch[1]]);

  for (const [manifest, name] of aliases) {
    if (!existsSync(manifest)) continue;
    try {
      const parsed = JSON.parse(await readFile(manifest, "utf8"));
      const body = parsed.scripts?.[name];
      const source = Array.isArray(body) ? body.join("\n") : body;
      if (
        typeof source === "string" &&
        destructiveCommands.some((pattern) => pattern.test(source))
      ) {
        ignored.push(`o script ${name} pode apagar estruturas ou registros`);
      }
    } catch {
      errors.push(`não foi possível conferir o script ${name} em ${basename(manifest)}`);
    }
  }
}

function unquote(input) {
  if (
    input.length >= 2 &&
    ((input.startsWith('"') && input.endsWith('"')) ||
      (input.startsWith("'") && input.endsWith("'")))
  ) {
    return input.slice(1, -1);
  }
  return input;
}

function isTestCommand(input) {
  return /\b(?:artisan\s+test|pest|phpunit|composer\s+(?:test|ci))\b/iu.test(input);
}

function isMigrationCommand(input) {
  return /\b(?:artisan\s+migrate|migrate\s+--)/iu.test(input);
}
