#!/usr/bin/env node
/** Resume as fontes relevantes de um projeto sem alterar seus arquivos. */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const project = resolve(args.includes("--project") ? args[args.indexOf("--project") + 1] : process.cwd());
const ignored = new Set([".git", ".agents", ".claude", ".specify", ".venv", "venv", "__pycache__", ".pytest_cache", "graphify-out", "node_modules.locked", "node_modules", "vendor", "dist", "build", ".next", ".astro", "coverage", ".turbo"]);
const textExtensions = new Set([".astro", ".css", ".go", ".html", ".js", ".jsx", ".json", ".md", ".mjs", ".php", ".py", ".rb", ".rs", ".sql", ".svelte", ".toml", ".ts", ".tsx", ".vue", ".yaml", ".yml", ".xml", ".neon", ".dist", ".cjs"]);
const groups = {
  instructions: [], manifests: [], configuration: [], application: [], routes: [],
  persistence: [], integrations: [], tests: [], documentation: [], interface: [],
};

function extension(path) {
  const name = path.split("/").at(-1) ?? "";
  return name.includes(".") ? `.${name.split(".").at(-1)}`.toLowerCase() : "";
}

function add(group, path) {
  if (!groups[group].includes(path)) groups[group].push(path);
}

async function classify(path) {
  const lower = path.toLowerCase();
  const parts = lower.split("/");
  const name = parts.at(-1) ?? "";
  if (["agents.md", "claude.md", "readme.md", "contributing.md"].includes(name)) add("instructions", path);
  if (["package.json", "composer.json", "pyproject.toml", "go.mod", "cargo.toml", "gemfile"].includes(name)) add("manifests", path);
  if (/(^|\/)(\.env\.example|.*config\.|.*\.config\.|tsconfig\.json|vite\.config\.|astro\.config\.|next\.config\.)/.test(lower)) add("configuration", path);
  if (parts.some((part) => ["routes", "pages"].includes(part)) || /(^|\/)app\/http\//.test(lower)) add("routes", path);
  if (["database", "migrations", "prisma", "drizzle", "schema"].some((item) => parts.includes(item)) || name.endsWith(".sql")) add("persistence", path);
  if (["tests", "test", "__tests__", "spec"].some((item) => parts.includes(item)) || /\.(test|spec)\.[a-z]+$/.test(lower)) add("tests", path);
  if (lower.startsWith("docs/") || name.endsWith(".md")) add("documentation", path);
  if (["components", "layouts", "views", "resources"].some((item) => parts.includes(item)) || /\.(astro|jsx|tsx|vue|svelte)$/.test(lower)) add("interface", path);
  if (["api", "clients", "services", "integrations", "webhooks"].some((item) => parts.includes(item))) add("integrations", path);
  const source = /\.(astro|cjs|go|js|jsx|mjs|php|py|rb|rs|svelte|ts|tsx|vue)$/.test(lower);
  if (source && parts.some((part) => ["src", "app", "server", "lib", "packages"].includes(part)) && !groups.tests.includes(path) && !groups.persistence.includes(path)) {
    add("application", path);
    if (/<Route\b|createBrowserRouter\s*\(|Route::/.test(await readFile(join(project, path), "utf8"))) add("routes", path);
  }
}

async function walk(directory) {
  if (!existsSync(directory)) return;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.startsWith("venv_")) continue;
    const target = join(directory, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (textExtensions.has(extension(entry.name)) || entry.name === "Gemfile") await classify(relative(project, target).replaceAll("\\", "/"));
  }
}

async function packageNames(path, fields) {
  try {
    const value = JSON.parse(await readFile(path, "utf8"));
    return fields.flatMap((field) => Object.keys(value[field] ?? {})).sort();
  } catch {
    return [];
  }
}

await walk(project);
for (const paths of Object.values(groups)) paths.sort();
const packageNamesFound = await packageNames(join(project, "package.json"), ["dependencies", "devDependencies"]);
const composerNamesFound = await packageNames(join(project, "composer.json"), ["require", "require-dev"]);
console.log(JSON.stringify({
  project,
  source_groups: groups,
  package_names: packageNamesFound,
  composer_packages: composerNamesFound,
  totals: Object.fromEntries(Object.entries(groups).map(([name, paths]) => [name, paths.length])),
  reading_order: ["instructions", "manifests", "configuration", "application", "routes", "persistence", "integrations", "interface", "tests", "documentation"],
}, null, 2));
