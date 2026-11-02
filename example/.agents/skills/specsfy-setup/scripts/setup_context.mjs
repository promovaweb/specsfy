#!/usr/bin/env node
/** Cria o contexto mínimo do projeto sem sobrescrever material do usuário. */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncSpecKitContext } from "./sync_speckit_context.mjs";

const START = "<!-- specsfy:framework:start -->"; const END = "<!-- specsfy:framework:end -->"; const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2); const project = resolve(args.includes("--project") ? args[args.indexOf("--project") + 1] : process.cwd());
async function json(path) { try { const value = JSON.parse(await readFile(path, "utf8")); return value && typeof value === "object" ? value : {}; } catch { return {}; } }
async function template(name, tokens) { const candidates = [join(project, ".specsfy", "templates", "custom", name), join(project, ".specsfy", "templates", name), join(skillRoot, "templates", name)]; const path = candidates.find(existsSync); if (!path) throw new Error(`template não encontrado: ${join(project, ".specsfy", "templates", name)}; execute \`specsfy install\``); let content = await readFile(path, "utf8"); for (const [token, value] of Object.entries(tokens)) { if (!content.includes(token)) throw new Error(`token obrigatório ausente em ${path}: ${token}`); content = content.replaceAll(token, value); } const unresolved = [...new Set(content.match(/\{\{[A-Z0-9_]+\}\}/g) ?? [])]; if (unresolved.length) throw new Error(`tokens não preenchidos em ${path}: ${unresolved.join(", ")}`); return content; }
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
 const frameworks = rows.filter(([kind]) => kind === "Framework").map(([, technology]) => technology); const label = frameworks.join(", ") || rows.map((row) => row[1]).join(", ") || "stack ainda não identificado"; const guidance = [frameworks.includes("Laravel") && "Para Laravel, descreva módulos de domínio, fronteiras HTTP/console e use `database/migrations` como primeira evidência do mapa de dados.", frameworks.includes("Next.js") && "Para Next.js, explicite App Router, Server Components, Client Components e fronteiras entre servidor e navegador.", frameworks.includes("Astro") && "Para Astro, explicite páginas, conteúdo, integrações e as ilhas interativas hidratadas no cliente."].filter(Boolean).join("\n\n") || "Confirme os manifests e as fronteiras principais antes de completar o modelo genérico.";
const table = (rows.length ? rows : [["Framework", "A confirmar", "Nenhum manifest reconhecido"]]).map((row) => `| ${row.join(" | ")} |`).join("\n"); const targets = new Map([[join(project, "PROJECT.md"), await template("Project.md", { "{{STACK_LABEL}}": label, "{{STACK_GUIDANCE}}": guidance })], [join(project, ".specsfy", "STACK.md"), await template("Stack.md", { "{{STACK_ROWS}}": table })], [join(project, ".specsfy", "RULES.md"), await template("Rules.md", { "{{STACK_LABEL}}": label, "{{STACK_GUIDANCE}}": guidance })], [join(project, ".specsfy", "DATABASE.md"), await template("Database.md", { "{{STACK_LABEL}}": label, "{{STACK_GUIDANCE}}": guidance })], [join(project, ".specsfy", "USER-PROFILE.md"), await template("UserProfile.md", {})], [join(project, "INTERFACE.md"), await template("Interface.md", { "{{STACK_LABEL}}": label, "{{STACK_GUIDANCE}}": guidance })], [join(project, "DESIGNSYSTEM.MD"), await template("DESIGNSYSTEM.MD", {})]]); const changed = [];
for (const [path, content] of targets) if (!existsSync(path)) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, `${content.trimEnd()}\n`); changed.push(path); }
const specKitContext = await syncSpecKitContext(project); if (specKitContext) changed.push(specKitContext);
const reference = await readFile(join(skillRoot, "specsfy-setup", "references", "framework-instructions.md"), "utf8"); const agents = `${START}${reference.split(START)[1].split(END)[0]}${END}`.replaceAll("{{SPECSFY_SPEC_PATH}}", ".specsfy/Spec.md"); const blocks = [[join(project, "AGENTS.md"), agents], [join(project, "CLAUDE.md"), `${START}\n@.specsfy/Spec.md\n${END}`]];
for (const [path, block] of blocks) { const existing = existsSync(path) ? await readFile(path, "utf8") : ""; const updated = existing.includes(START) && existing.includes(END) ? `${existing.split(START)[0]}${block}${existing.split(END).slice(1).join(END)}`.trimEnd() + "\n" : `${existing.trimEnd()}${existing.trim() ? "\n\n" : ""}${block.trimEnd()}\n`; if (updated !== existing) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, updated); changed.push(path); } }
changed.forEach((path) => console.log(path));
