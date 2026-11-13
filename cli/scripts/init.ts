/**
 * Customizes the template for a new binary.
 *
 * Usage:
 *   bun run init -- --name mycli [--title "My CLI"] [--description "..."]
 *                   [--author "Org"] [--repository URL] [--site URL]
 *
 * Rewrites package.json (name, bin, description, termfy block), .env.example
 * and the literal mentions of the previous bin/title in README.md,
 * AGENTS.md, CHANGELOG.md and .github/workflows/*.yml. It does not touch
 * src/ or docs/, which read the identity from the manifest at runtime.
 *
 * When the previous identity is the template itself (`termfy`), the new
 * project starts at version 0.1.0 with a fresh CHANGELOG.md, and the
 * template repository URL is not inherited unless --repository is given.
 *
 * Prints what changed and exits with 0; invalid arguments exit with 2.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
function option(name: string): string | undefined {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  return v && !v.startsWith("--") ? v : undefined;
}

const name = option("name");
if (!name || !/^[a-z][a-z0-9-]{1,39}$/.test(name)) {
  console.error("Provide --name with lower-case letters, digits and hyphens (2 to 40 characters), starting with a letter.");
  process.exit(2);
}
const description = option("description");
const author = option("author");
const repository = option("repository");
const site = option("site");

const pkgPath = "package.json";
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const previous: string = pkg.termfy?.bin ?? pkg.name;
const previousTitle: string = pkg.termfy?.title ?? previous;

// A project created from the template starts its own history: version 0.1.0,
// a fresh CHANGELOG.md and no inherited repository URL.
const fromTemplate = previous === "termfy" && name !== "termfy";
// A rename without --title keeps the current title; only the template
// title gives way to the new name.
const title = option("title") ?? (fromTemplate ? name : previousTitle);

const kitVersion: string = fromTemplate ? pkg.version : pkg.termfy?.starterKit ?? pkg.version;

pkg.name = name;
if (fromTemplate) pkg.version = "0.1.0";
pkg.bin = { [name]: "src/main.ts" };
if (description) pkg.description = description;
pkg.termfy = {
  bin: name,
  title,
  author: author ?? pkg.termfy?.author ?? "",
  site: site ?? pkg.termfy?.site ?? "",
  repository: repository ?? (fromTemplate ? "" : pkg.termfy?.repository ?? ""),
  framework: pkg.termfy?.framework ?? "https://github.com/promovaweb/termfy",
  // Starter kit version the project came from; skills:check compares it
  // with the minimum version each skill declares.
  starterKit: kitVersion,
};
if (repository) pkg.repository = { type: "git", url: `git+${repository}.git` };
else if (fromTemplate) delete pkg.repository;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`✓ package.json: ${previous} → ${name}`);

const targets = [".env.example", "README.md", "AGENTS.md", ...(fromTemplate ? [] : ["CHANGELOG.md"])];
try {
  for (const f of readdirSync(".github/workflows")) targets.push(join(".github/workflows", f));
} catch {
  // No workflows, carry on.
}
const previousPrefix = previous.replace(/[^a-z0-9]/gi, "_").toUpperCase();
const nextPrefix = name.replace(/[^a-z0-9]/gi, "_").toUpperCase();
/**
 * Framework references that keep the Termfy name in a project created from
 * the template: skill names, the framework repositories and the sentences
 * that name Termfy as the framework. Only the binary identity is renamed.
 */
const FRAMEWORK_REFERENCES: RegExp[] = [
  /promovaweb\/termfy(?:-starter-kit)?/g,
  /termfy-(?:[a-z][a-z-]*|\*)/g,
  /`termfy`(?=[:,] (?:a )?porta de entrada)/g,
  /\[Termfy\]\(/g,
  /(?:framework|starter kit do|Termfy Starter) Termfy|Termfy Starter Kit/g,
];

/** Replaces the identity in `text` with `nextName`, keeping framework references when `keepFramework` is set. */
function renameIdentity(text: string, nextName: string, keepFramework: boolean): string {
  const kept: string[] = [];
  let masked = text;
  if (keepFramework) {
    for (const pattern of FRAMEWORK_REFERENCES) {
      masked = masked.replace(pattern, (match) => `\u0000${kept.push(match) - 1}\u0000`);
    }
  }
  const renamed = masked
    .replaceAll(`${previousPrefix}_`, `${nextPrefix}_`)
    .replaceAll(previousTitle, title)
    .replaceAll(previous, nextName);
  return renamed.replace(/\u0000(\d+)\u0000/g, (_match: string, index: string) => kept[Number(index)] ?? "");
}

for (const file of targets) {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  let next = renameIdentity(text, name, fromTemplate);
  if (fromTemplate && file === "README.md") next = next.replace(/^# .*$/m, `# ${title}`);
  if (fromTemplate && file === "AGENTS.md") {
    next = next.replace("Este repositório é o starter kit do Termfy:", `Este repositório é o binário \`${name}\`, criado com o starter kit do\nTermfy:`);
  }
  if (next !== text) {
    writeFileSync(file, next);
    console.log(`✓ ${file}`);
  }
}
if (fromTemplate) {
  const today = new Date().toISOString().slice(0, 10);
  writeFileSync("CHANGELOG.md", `# Changelog\n\nFormato baseado em Keep a Changelog. Versões seguem SemVer.\n\n## [0.1.0] - ${today}\n\n### Adicionado\n\n- Projeto criado a partir do Termfy Starter Kit.\n`);
  console.log("✓ CHANGELOG.md: history started at 0.1.0");
}
console.log(`\nDone. Check with: bun run dev -- --version && bun run dev -- --help`);
console.log("Then run: bun run validate");
