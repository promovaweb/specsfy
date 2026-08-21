#!/usr/bin/env node
/** Reconstrói documentação técnica a partir do código existente, sem sobrescrever notas humanas. */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

const START = "<!-- specsfy:documentator:start -->";
const END = "<!-- specsfy:documentator:end -->";
const ignored = new Set([".git", ".venv", ".next", ".turbo", ".temp", "build", "coverage", "dist", "docs", "node_modules", "playwright-report", "storage", "test-results", "vendor"]);
const args = process.argv.slice(2);
const project = resolve(args.includes("--project") ? args[args.indexOf("--project") + 1] : process.cwd());
const check = args.includes("--check");
const blank = "Finalidade não descrita nos metadados locais.";

async function json(path) { try { return JSON.parse(await readFile(path, "utf8")); } catch { return {}; } }
async function text(path) { try { return await readFile(path, "utf8"); } catch { return ""; } }
async function walk(folder) {
  const output = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(folder, entry.name);
    if (entry.isDirectory()) output.push(...await walk(path)); else output.push(path);
  }
  return output;
}
function table(headers, rows) {
  return `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.map((row) => `| ${row.map((value) => String(value ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ")).join(" | ")} |`).join("\n")}`;
}
function merge(existing, title, generated) {
  const block = `${START}\n${generated.trim()}\n${END}`;
  if (existing.includes(START) && existing.includes(END)) return `${existing.split(START)[0]}${block}${existing.split(END).slice(1).join(END)}`.trimEnd() + "\n";
  return `${existing.trim() || `# ${title}`}\n\n${block}\n`;
}
function repo(value) {
  const raw = typeof value === "string" ? value : value?.url ?? "";
  return raw.replace(/^git\+/, "").replace(/\.git$/, "");
}
function category(path) {
  const value = path.replaceAll("\\", "/");
  if (/\/(Services?|service)\//i.test(value)) return "Serviços";
  if (/\/(routes|api)\//i.test(value) || /route\.(?:ts|js)$/.test(value)) return "Rotas e APIs";
  if (/\/(pages?|views?|app)\//i.test(value) || /page\.(?:tsx?|jsx?)$/.test(value)) return "Páginas";
  if (/\/(components?)\//i.test(value)) return "Componentes";
  if (/(^|\/)(tests?|spec)\//i.test(value) || /\.(test|spec)\./.test(value)) return "Testes";
  return "Outras fontes";
}
function symbols(content) {
  return [...new Set([...content.matchAll(/\b(?:class|function|interface|enum)\s+([A-Z_a-z][\w]*)|\b(?:const|function)\s+([A-Z][\w]*)/g)].map((match) => match[1] ?? match[2]).filter(Boolean))].slice(0, 8).join(", ");
}

if (!existsSync(project)) {
  console.error(`projeto inexistente: ${project}`);
  process.exitCode = 2;
} else {
  const files = await walk(project);
  const manifests = files.filter((path) => path.endsWith("package.json"));
  const rootPackage = await json(join(project, "package.json"));
  const composer = await json(join(project, "composer.json"));
  const rows = [];
  const push = (manager, scope, name, version, purpose = blank, source = "") => rows.push([manager, scope, name, version, purpose, source]);
  const addManifest = (manifest, nodeScope = false) => {
    for (const [scope, values] of [["produção", manifest.dependencies], ["desenvolvimento", manifest.devDependencies], ["opcional", manifest.optionalDependencies], ["peer", manifest.peerDependencies]]) for (const [name, version] of Object.entries(values ?? {})) push("npm", scope, name, version);
  };
  addManifest(rootPackage);
  for (const path of manifests.filter((path) => path !== join(project, "package.json"))) addManifest(await json(path));
  for (const [scope, values] of [["produção", composer.require], ["desenvolvimento", composer["require-dev"]]]) for (const [name, version] of Object.entries(values ?? {})) push("Composer", scope, name, version);
  const composerLock = await json(join(project, "composer.lock"));
  for (const item of [...(composerLock.packages ?? []), ...(composerLock["packages-dev"] ?? [])]) push("Composer", "transitiva", item.name, item.version, item.description ?? blank, repo(item.source));
  function legacyLock(dependencies) { for (const [name, item] of Object.entries(dependencies ?? {})) { push("npm", "transitiva", name, item?.version ?? "—", item?.description ?? blank, repo(item?.repository)); legacyLock(item?.dependencies); } }
  for (const lockPath of files.filter((path) => path.endsWith("package-lock.json"))) {
    const lock = await json(lockPath);
    for (const [key, item] of Object.entries(lock.packages ?? {})) if (key.includes("node_modules/")) push("npm", "transitiva", key.split("node_modules/").at(-1), item?.version ?? "—", item?.description ?? blank, repo(item?.repository));
    legacyLock(lock.dependencies);
  }
  const metadataRoots = [...new Set([project, ...manifests.map(dirname)])];
  for (const row of rows) {
    if (row[0] !== "npm") continue;
    for (const root of metadataRoots) {
      const metadata = await json(join(root, "node_modules", row[2], "package.json"));
      if (Object.keys(metadata).length) {
        if (metadata.description) row[4] = metadata.description;
        if (repo(metadata.repository)) row[5] = repo(metadata.repository);
        break;
      }
    }
  }
  const seen = new Set();
  const packages = rows.filter((row) => { const key = `${row[0]}:${row[1]}:${row[2]}:${row[3]}`; if (seen.has(key)) return false; seen.add(key); return true; });
  const code = files.filter((path) => [".astro", ".css", ".go", ".js", ".jsx", ".php", ".rb", ".rs", ".ts", ".tsx", ".vue"].includes(extname(path)) || path.endsWith(".blade.php"));
  const testFiles = code.filter((path) => category(relative(project, path)) === "Testes");
  const declared = Object.keys({ ...(rootPackage.dependencies ?? {}), ...(rootPackage.devDependencies ?? {}), ...(composer.require ?? {}), ...(composer["require-dev"] ?? {}) });
  const frameworks = [["astro", "Astro"], ["next", "Next.js"], ["react", "React"], ["laravel/framework", "Laravel"]].flatMap(([key, label]) => declared.includes(key) ? [label] : []);
  const runner = declared.includes("pestphp/pest") ? "Pest" : declared.includes("vitest") ? "Vitest" : "não identificado";
  const scripts = Object.entries({ ...(rootPackage.scripts ?? {}), ...(composer.scripts ?? {}) }).map(([name, value]) => `${name}: ${typeof value === "string" ? value : "comando composto"}`);
  const applicationRows = [];
  for (const path of code.slice(0, 250)) {
    const local = relative(project, path).replaceAll("\\", "/");
    applicationRows.push([category(local), local, symbols(await text(path)) || "—"]);
  }
  const frontendFiles = code.filter((path) => /\.(?:tsx|jsx|vue|astro|css)$/.test(path) || /tailwind\.config/.test(path));
  const frontendContent = await Promise.all(frontendFiles.map(text));
  const tailwind = declared.includes("tailwindcss") || frontendFiles.some((path) => /tailwind\.config/.test(path)) || frontendContent.some((item) => item.includes("tailwindcss"));
  const tokens = [...new Set(frontendContent.flatMap((item) => [...item.matchAll(/--[\w-]+/g)].map((match) => match[0])))];
  const docData = {
    "README.md": ["Documentação técnica", `## Visão geral\n\n- Frameworks detectados: ${frameworks.join(", ") || "não identificados"}.\n- Arquivos de código: ${code.length}.\n- Arquivos de teste: ${testFiles.length}.\n\n## Roteiro\n\n- [Arquitetura](architecture.md)\n- [Aplicação](application.md)\n- [Banco de dados](database.md)\n- [Testes](testing.md)\n- [Pacotes](packages.md)`],
    "architecture.md": ["Arquitetura", `## Componentes\n\n${table(["Tipo", "Quantidade"], [["Código", code.length], ["Testes", testFiles.length]])}\n\n## Diagramas\n\n\`\`\`mermaid\nflowchart TD\n  Application[Aplicação]\n\`\`\`\n\n\`\`\`mermaid\nclassDiagram\n  class Application\n\`\`\``],
    "application.md": ["Aplicação e implementações", `## Superfícies\n\nCategorias: Serviços, Rotas e APIs, Páginas, Componentes, Testes e Outras fontes.\n\nRelação: relaciona cada arquivo observado à sua superfície.\n\n${table(["Categoria", "Arquivo", "Símbolos"], applicationRows.length ? applicationRows : [["Outras fontes", "—", "Nenhum arquivo de código encontrado"]])}`],
    "database.md": ["Banco de dados", `## Fontes de persistência\n\n${table(["Arquivo"], files.filter((path) => /migration|prisma|\.sql$/i.test(path)).map((path) => [relative(project, path)]).concat([["Nenhuma estrutura confirmada além das fontes listadas."]]))}\n\n\`\`\`mermaid\nerDiagram\n  ENTITY { string id }\n\`\`\``],
    "flows.md": ["Fluxos", "## Fluxo principal\n\n```mermaid\nflowchart LR\n  Entrada --> Aplicação --> Saída\n```\n\n```mermaid\nsequenceDiagram\n  participant Cliente\n  participant Aplicação\n  Cliente->>Aplicação: requisição\n```"],
    "testing.md": ["Testes", `## Resumo\n\n- Arquivos de teste: ${testFiles.length}.\n- Runner: ${runner}.\n- Scripts: ${scripts.join("; ") || "não declarados"}.\n\n${table(["Arquivo"], testFiles.map((path) => [relative(project, path)]).concat(testFiles.length ? [] : [["Nenhum teste identificado"]]))}`],
    "frontend.md": ["Frontend e design system", `## Superfícies observadas\n\n- Componentes, páginas ou views: ${frontendFiles.length}.\n- Tailwind: ${tailwind ? "detectado" : "não identificado"}.\n- Tokens CSS: ${tokens.join(", ") || "não identificados"}.\n\n${table(["Arquivo"], frontendFiles.map((path) => [relative(project, path)]).concat(frontendFiles.length ? [] : [["Nenhuma superfície frontend identificada"]]))}`],
    "packages.md": ["Pacotes e bibliotecas", `## Inventário\n\n${table(["Categoria", "Escopo", "Pacote", "Versão", "Finalidade", "Fonte", "GitHub"], packages.map((row) => [row[0] === "npm" ? "Terceiro" : row[0], row[1], row[2], row[3], row[4], row[5], row[5].includes("github.com") ? row[5] : "—"]))}`],
    "integrations.md": ["Integrações", "## Configuração\n\nValores de ambiente e integrações são documentados apenas pelos nomes declarados localmente, sem segredos."],
    "decisions.md": ["Decisões técnicas", "## Política\n\nDecisões explícitas em `PROJECT.md` e `.specsfy/` prevalecem sobre inferências deste documento."],
  };
  const targets = {...Object.fromEntries(Object.entries(docData).map(([name, [title]]) => [join(project, "docs", name), [title, docData[name][1]]])), [join(project, ".specsfy", "PACKAGES.md")]: ["Pacotes e bibliotecas", `# Pacotes e bibliotecas\n\n${table(["Gerenciador", "Escopo", "Pacote", "Versão", "Finalidade", "Fonte"], packages)}`]};
  const stale = [];
  for (const [path, [title, generated]] of Object.entries(targets)) {
    const current = await text(path);
    const expected = merge(current, title, generated);
    if (current !== expected) stale.push(relative(project, path));
    if (!check && current !== expected) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, expected); }
  }
  if (check && stale.length) { console.error(`Documentação desatualizada: ${stale.join(", ")}`); process.exitCode = 1; }
}
