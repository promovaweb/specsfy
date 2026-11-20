#!/usr/bin/env node
/** Atualiza a stack detectada preservando linhas e complementos humanos. */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const START = "<!-- specsfy:stack:start -->"; const END = "<!-- specsfy:stack:end -->";
const project = resolve(process.argv.includes("--project") ? process.argv[process.argv.indexOf("--project") + 1] : process.cwd());
async function json(path) { try { const data = JSON.parse(await readFile(path, "utf8")); return data && typeof data === "object" ? data : {}; } catch { return {}; } }
const rows = [];
const add = (kind, name, source) => { if (!rows.some((row) => row.join("|") === [kind, name, source].join("|"))) rows.push([kind, name, source]); };

/** Busca manifests locais, respeitando exclusões usuais e o .gitignore aplicável. */
async function manifestRoots(directory, found = []) {
  const ignored = new Set([".git", ".agents", ".claude", ".specify", ".venv", "venv", "node_modules", "vendor", "dist", "build", "coverage", "__pycache__"]);
  const entries = await readdir(directory, { withFileTypes: true });
  if (directory === project || entries.some((entry) => entry.isFile() && ["package.json", "composer.json", "pyproject.toml", "requirements.txt", "go.mod", "Cargo.toml", "Gemfile"].includes(entry.name))) found.push(directory);
  for (const entry of entries) {
    if (!entry.isDirectory() || ignored.has(entry.name) || entry.name.startsWith("venv_")) continue;
    const child = join(directory, entry.name);
    if (spawnSync("git", ["check-ignore", "--quiet", "--", child], { cwd: directory }).status === 0) continue;
    await manifestRoots(child, found);
  }
  return found;
}
for (const directory of await manifestRoots(project)) {
  const prefix = relative(project, directory).replaceAll("\\", "/") + (directory === project ? "" : "/");
  const composer = await json(join(directory, "composer.json"));
  const packageJson = await json(join(directory, "package.json"));
const composerPackages = { ...(composer.require ?? {}), ...(composer["require-dev"] ?? {}) };
for (const [dependency, kind, label] of [["laravel/framework", "Framework", "Laravel"], ["php", "Linguagem", "PHP"], ["pestphp/pest", "Testes", "Pest"], ["phpunit/phpunit", "Testes", "PHPUnit"]]) if (dependency in composerPackages) add(kind, label, `\`${prefix}composer.json\` (\`${dependency}\`)`);
if (Object.keys(composer).length && !rows.some((row) => row[1] === "PHP")) add("Linguagem", "PHP", prefix + "composer.json");
const packages = { ...(packageJson.dependencies ?? {}), ...(packageJson.devDependencies ?? {}) };
for (const [dependency, kind, label] of [["next", "Framework", "Next.js"], ["astro", "Framework", "Astro"], ["react", "Biblioteca", "React"], ["typescript", "Linguagem", "TypeScript"], ["vitest", "Testes", "Vitest"], ["prisma", "Persistência", "Prisma"], ["@prisma/client", "Persistência", "Prisma Client"], ["drizzle-orm", "Persistência", "Drizzle ORM"]]) if (dependency in packages) add(kind, label, `\`${prefix}package.json\` (\`${dependency}\`)`);
if (Object.keys(packageJson).length) add("Runtime", "Node.js", prefix + "package.json");
if (existsSync(join(directory, "docker-compose.yml")) || existsSync(join(directory, "compose.yaml"))) add("Infraestrutura", "Containers", "arquivo Compose");

  if (existsSync(join(directory, "pyproject.toml")) || existsSync(join(directory, "requirements.txt"))) add("Linguagem", "Python", prefix + (existsSync(join(directory, "pyproject.toml")) ? "pyproject.toml" : "requirements.txt"));
}
// Registra a declaração; a validade dos padrões pertence ao verify_evidence.
if (existsSync(join(project, ".specsfy", "migrations.json"))) add("Migrations", "Runner próprio declarado", "`.specsfy/migrations.json`");
const target = join(project, ".specsfy", "STACK.md"); let existing = existsSync(target) ? await readFile(target, "utf8") : "";
/** Divide apenas separadores reais; barras escapadas permanecem na célula. */
function tableCells(line) {
  const cells = []; let value = ""; let slashes = 0;
  for (const character of line) {
    if (character === "|" && slashes % 2 === 0) { cells.push(value.trim()); value = ""; }
    else value += character;
    slashes = character === "\\" ? slashes + 1 : 0;
  }
  cells.push(value.trim());
  return cells.slice(1, -1);
}
const old = [], preserved = [];
if (existing.includes(START) && existing.includes(END)) {
  for (const line of existing.split(START)[1].split(END)[0].split(/\r?\n/u)) {
    if (!line.trim()) continue;
    if (!/^\|/.test(line)) { preserved.push(line); continue; }
    const cells = tableCells(line);
    if (cells[0] === "Camada" || cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    if (cells.length === 3) old.push(cells); else preserved.push(line);
  }
}
for (const row of old) add(...row);
const active = rows.length ? rows : [["Framework", "A confirmar", "Nenhum manifest reconhecido"]];
const block = `${START}\n| Camada | Tecnologia | Evidência |\n| --- | --- | --- |\n${active.map((row) => `| ${row.join(" | ")} |`).join("\n")}\n${preserved.length ? preserved.join("\n") + "\n" : ""}${END}`;
const updated = existing.includes(START) && existing.includes(END) ? `${existing.split(START)[0]}${block}${existing.split(END).slice(1).join(END)}`.trimEnd() + "\n" : `${(existing.trim() || "# Stack do sistema")}\n\n## Inventário detectado\n\n${block}\n`;
if (updated !== existing) { await mkdir(join(project, ".specsfy"), { recursive: true }); await writeFile(target, updated); console.log(target); }
