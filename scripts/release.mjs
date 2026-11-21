#!/usr/bin/env node
/**
 * Prepares and publishes a Specsfy release from the monorepo root.
 *
 * Prepare (default) — writes files, never commits:
 *
 *   node scripts/release.mjs 0.34.0
 *
 *   1. writes the version to VERSION, cli/package.json and cli/npm/package.json;
 *   2. regenerates cli/src/engine/skills.gen.ts, cli/bin/specsfy,
 *      cli/docs/opencli.json and every showcase screen;
 *   3. rebuilds the ebook and checks the version alignment;
 *   4. runs the root tests, the skills validation and `bun run validate`
 *      of the CLI (tests, docs, showcase and the compiled-binary smoke test).
 *
 * Publish — after reviewing the diff and writing `## [X.Y.Z]` in
 * cli/CHANGELOG.md:
 *
 *   node scripts/release.mjs 0.34.0 --publish
 *
 *   1. refuses without the changelog section or with a tag that exists;
 *   2. commits everything as `chore(release): vX.Y.Z`, tags and pushes;
 *   3. waits for the CLI Release workflow, reruns a failed job once and
 *      checks the five executables plus SHA256SUMS;
 *   4. publishes the npm wrapper from cli/npm (npm needs a logged-in user).
 *
 * Inside the Promovaweb Hub (this monorepo is its `specsfy` submodule),
 * `--publish` keeps everything in sync: after npm it runs the site step and
 * then the Hub step below. `--no-site` and `--no-hub` skip them; `--site`
 * and `--hub` run only that step after a publish.
 *
 * Site — the documentation of promovaweb.com/docs/specsfy:
 *
 *   1. sincroniza a documentação em um worktree limpo de origin/main;
 *   2. registra 301 para páginas movidas e 410 para fontes retiradas;
 *   3. envia a mídia ao R2 e mantém só o ebook vigente e o anterior nos downloads;
 *      registra a sitespec, atualiza o patch e publica a release do website;
 *   4. runs `npm run site:specsfy:check` against production.
 *   The ClickUp record of the Website list stays manual (MCP website).
 *
 * Hub:
 *
 *   1. fast-forwards the Hub to origin/main (other people's uncommitted
 *      files stay untouched; a Hub with staged files is refused);
 *   2. bumps the Hub patch version and writes its changelog entry from the
 *      bullets of ## [X.Y.Z] in cli/CHANGELOG.md (or from --hub-note "...");
 *   3. commits only VERSION, CHANGELOG.md and the specsfy gitlink, tags,
 *      pushes and creates the Hub GitHub Release.
 *
 * Commit the feature work before `--publish`: everything left in the
 * working tree goes into the release commit.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { planEditions } from "../.ebook/prune-editions.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "cli");
const EXPECTED_ASSETS = 6;

const [version, ...flags] = process.argv.slice(2);
const publish = flags.includes("--publish");
const HUB_PRESENT = (() => {
  try {
    return /specsfy/u.test(execFileSync("git", ["-C", resolve(dirname(fileURLToPath(import.meta.url)), "..", ".."), "submodule", "status", "specsfy"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return false;
  }
})();
const hub = flags.includes("--hub") || (publish && HUB_PRESENT && !flags.includes("--no-hub"));
const site = flags.includes("--site") || (publish && HUB_PRESENT && !flags.includes("--no-site"));
/** Website commit published by the site step, for the Hub gitlink. */
let websiteCommit;
const noteIndex = flags.indexOf("--hub-note");
const hubNote = noteIndex >= 0 ? flags[noteIndex + 1] : undefined;
const HUB = resolve(ROOT, "..");

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: node scripts/release.mjs <X.Y.Z> [--publish]");
  process.exit(2);
}

/** Runs a command, streaming its output; stops the release on failure. */
function step(title, command, args, cwd = ROOT) {
  console.log(`\n▸ ${title}`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`✗ ${title} failed (exit ${result.status ?? "signal"})`);
}

/** Runs a command and returns its trimmed stdout. */
function output(command, args, cwd = ROOT) {
  return execFileSync(command, args, { cwd, encoding: "utf8" }).trim();
}

/** Writes the version field of a package.json, keeping its formatting. */
function writePackageVersion(path) {
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg.version = version;
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

function prepare() {
  writeFileSync(join(ROOT, "VERSION"), `${version}\n`);
  writePackageVersion(join(CLI, "package.json"));
  writePackageVersion(join(CLI, "npm", "package.json"));
  console.log(`✓ version ${version} in VERSION, cli/package.json and cli/npm/package.json`);
  step("embedded skills", "bun", ["run", "embed"], CLI);
  step("launcher", "bun", ["run", "launcher"], CLI);
  step("OpenCLI description", "bun", ["run", "opencli"], CLI);
  step("showcase (every screen)", "bun", ["run", "showcase", "--", "--all"], CLI);
  step("ebook", "make", ["ebook"]);
  step("version alignment", "make", ["verify-version"]);
  step("root tests", "npm", ["test"]);
  step("skills validation", "npm", ["run", "validate:skills"]);
  step("CLI validate (tests, docs, showcase, build, smoke)", "bun", ["run", "validate"], CLI);
  console.log(`\n✓ ${version} is ready. Review the diff, write ## [${version}] in cli/CHANGELOG.md and run with --publish.`);
}

/** Waits for the workflow runs of the tag push, rerunning a failure once. */
function waitForWorkflows() {
  spawnSync("sleep", ["20"]);
  const runs = JSON.parse(output("gh", ["run", "list", "--limit", "3", "--json", "databaseId,name,headBranch"]));
  for (const run of runs) {
    let ok = spawnSync("gh", ["run", "watch", String(run.databaseId), "--exit-status"], { stdio: "ignore" }).status === 0;
    if (!ok) {
      console.log(`! ${run.name} (${run.headBranch}) failed; rerunning the failed jobs once`);
      spawnSync("gh", ["run", "rerun", String(run.databaseId), "--failed"], { stdio: "ignore" });
      spawnSync("sleep", ["15"]);
      ok = spawnSync("gh", ["run", "watch", String(run.databaseId), "--exit-status"], { stdio: "ignore" }).status === 0;
    }
    console.log(`${ok ? "✓" : "✗"} ${run.name} (${run.headBranch})`);
    if (!ok) {
      console.error("A workflow failed after one rerun: the npm wrapper was not published.");
      process.exit(1);
    }
  }
}

function publishRelease() {
  const tag = `v${version}`;
  if (!readFileSync(join(CLI, "CHANGELOG.md"), "utf8").includes(`## [${version}]`)) {
    console.error(`cli/CHANGELOG.md has no ## [${version}] section.`);
    process.exit(1);
  }
  if (output("git", ["tag", "-l", tag])) {
    console.error(`Tag ${tag} already exists; tags are never moved. Use a new version.`);
    process.exit(1);
  }
  if (readFileSync(join(ROOT, "VERSION"), "utf8").trim() !== version) {
    console.error(`VERSION is not ${version}. Run the prepare step first.`);
    process.exit(1);
  }
  step("commit", "git", ["add", "-A"]);
  step("commit", "git", ["commit", "-q", "-m", `chore(release): ${tag}`]);
  step("tag", "git", ["tag", tag]);
  step("push main", "git", ["push", "-q", "origin", "main"]);
  step("push tag", "git", ["push", "-q", "origin", tag]);
  waitForWorkflows();
  const assets = Number(output("gh", ["release", "view", tag, "--json", "assets", "-q", ".assets|length"]));
  if (assets !== EXPECTED_ASSETS) {
    console.error(`GitHub Release ${tag} has ${assets} assets, expected ${EXPECTED_ASSETS}: the npm wrapper was not published.`);
    process.exit(1);
  }
  console.log(`✓ GitHub Release ${tag} with ${assets} assets`);
  step("npm wrapper", "npm", ["publish", "--access", "public"], join(CLI, "npm"));
  console.log(`\n✓ Specsfy ${version} published.${hub ? "" : " Next: the Hub gitlink, version and release (--hub)."}${site ? "" : " The site was not updated (--site)."}`);
}

/** One-line summary of the changelog section: first sentence of each bullet. */
function changelogSummary() {
  const text = readFileSync(join(CLI, "CHANGELOG.md"), "utf8");
  const section = text.split(`## [${version}]`)[1]?.split(/\n## \[/u)[0] ?? "";
  const bullets = [];
  for (const line of section.split("\n")) {
    if (line.startsWith("- ")) bullets.push(line.slice(2).trim());
    else if (/^\s{2,}\S/u.test(line) && bullets.length) bullets[bullets.length - 1] += ` ${line.trim()}`;
  }
  const first = (bullet) => (bullet.match(/^.*?[.:](?=\s|$)/u)?.[0] ?? bullet).replace(/[.:]$/u, "");
  return bullets.map(first).join("; ") || "veja o cli/CHANGELOG.md do Specsfy";
}

/** Next free sitespec id of the website (four digits). */
function nextSitespecId(worktree) {
  const ids = readdirSync(join(worktree, ".sitespec")).map((name) => Number(name.slice(0, 4))).filter(Number.isFinite);
  return String(Math.max(0, ...ids) + 1).padStart(4, "0");
}

/**
 * Gives every removed documentation route its HTTP answer in the website
 * worktree. The page of a specialist renamed in skills/inventory.json (merged
 * into another) gets a 301 to the new page in src/config/redirects.mjs; any
 * other removed route gets a 410 in src/config/gone.mjs. Routes that already
 * have a 301 or a 410 are left alone. Returns the routes of each kind.
 */
/** Heading id the website gives a title (GitHub style: accents kept, punctuation dropped). */
function headingId(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s/gu, "-");
}

/**
 * Page of the specialist that absorbed a merged one, pointing to the section
 * of the mode (catalog `modes[].absorbs` and `modes[].title`).
 */
function absorbedTargets() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "specialists", "catalog.json"), "utf8"));
  const targets = {};
  for (const entry of catalog.skills) {
    for (const mode of entry.modes ?? []) {
      if (!mode.absorbs) continue;
      targets[mode.absorbs] = `/docs/specsfy/especialistas/${entry.name.replace(/^specsfy-specialist-/u, "")}/#${headingId(mode.title)}`;
    }
  }
  return targets;
}

/** Points the existing 301s of merged specialists to the section of their mode. */
function refreshSpecialistAnchors(worktree) {
  const redirectsFile = join(worktree, "src", "config", "redirects.mjs");
  let redirects = readFileSync(redirectsFile, "utf8");
  let changed = 0;
  for (const [name, target] of Object.entries(absorbedTargets())) {
    const from = `/docs/specsfy/especialistas/${name.replace(/^specsfy-specialist-/u, "")}`;
    const line = new RegExp(`^(\\t'${from}': )'([^']*)'`, "mu");
    const match = line.exec(redirects);
    if (!match || match[2] === target) continue;
    redirects = redirects.replace(line, `$1'${target}'`);
    changed++;
  }
  if (changed) writeFileSync(redirectsFile, redirects);
  return changed;
}

function registerRemovedRoutes(worktree, routes) {
  const result = { moved: [], gone: [] };
  if (!routes.length) return result;
  const goneFile = join(worktree, "src", "config", "gone.mjs");
  const redirectsFile = join(worktree, "src", "config", "redirects.mjs");
  let redirects = readFileSync(redirectsFile, "utf8");
  let gone = readFileSync(goneFile, "utf8");
  const pending = routes.filter((route) => !redirects.includes(`'${route}'`) && !gone.includes(`'${route}'`));
  const renamed = JSON.parse(readFileSync(join(ROOT, "skills", "inventory.json"), "utf8")).renamed ?? {};
  const anchored = absorbedTargets();
  const moves = [];
  for (const route of pending) {
    const specialist = /^\/docs\/specsfy\/especialistas\/(.+)$/u.exec(route)?.[1];
    const name = specialist && `specsfy-specialist-${specialist}`;
    const target = name && (anchored[name] ?? (renamed[name] && `/docs/specsfy/especialistas/${renamed[name].replace(/^specsfy-specialist-/u, "")}/`));
    if (target) moves.push([route, target]);
  }
  if (moves.length) {
    const anchor = "\t'/docs/specsfy/ideias':";
    if (!redirects.includes(anchor)) {
      console.error("✗ src/config/redirects.mjs changed: the /docs/specsfy block was not found");
      process.exit(1);
    }
    const lines = [`\t// Specsfy ${version} juntou especialistas: a página antiga aponta para o especialista que a absorveu.`, ...moves.map(([from, to]) => `\t'${from}': '${to}',`)];
    redirects = redirects.replace(anchor, `${lines.join("\n")}\n${anchor}`);
    writeFileSync(redirectsFile, redirects);
    result.moved = moves.map(([from]) => from);
  }
  const added = pending.filter((route) => !result.moved.includes(route));
  if (!added.length) return result;
  const lines = added.map((route) => `\t'${route}': 'Página da documentação do Specsfy retirada na versão ${version}: a fonte saiu do repositório, sem página equivalente.',`);
  gone = gone.replace("export const goneRoutes = {\n", `export const goneRoutes = {\n${lines.join("\n")}\n`);
  writeFileSync(goneFile, gone);
  result.gone = added;
  return result;
}

/** Publishes the Specsfy documentation, ebook and images on the website. */
function releaseSite() {
  const WEBSITE = join(HUB, "website");
  step("website fetch", "git", ["fetch", "-q", "origin"], WEBSITE);
  const temporary = mkdtempSync(join(tmpdir(), "specsfy-site-"));
  const worktree = join(temporary, "website");
  try {
    step("website worktree", "git", ["worktree", "add", "-q", "--detach", worktree, "origin/main"], WEBSITE);
    if (!existsSync(join(worktree, "scripts/media-podar-ebook-specsfy.mjs"))) {
      throw new Error("Publique o script de retenção no website antes de executar a etapa do site.");
    }
    symlinkSync(join(WEBSITE, "node_modules"), join(worktree, "node_modules"));
    const sync = output("npm", ["run", "sync:docs:specsfy", "--", "--website-dir", worktree], HUB);
    const downloads = join(worktree, "public/docs/specsfy/downloads");
    const build = JSON.parse(readFileSync(join(downloads, "build.json"), "utf8"));
    if (build.version !== version) throw new Error(`Ebook na versão ${build.version}; release na versão ${version}.`);

    // O sincronizador lista os caminhos removidos junto com os gravados.
    const removed = [];
    for (const [, path] of sync.matchAll(/^- website\/(\S+)$/gmu)) {
      const route = /^src\/content\/opensource-docs\/specsfy\/(.+)\.mdx?$/u.exec(path);
      if (route && !existsSync(join(worktree, path))) removed.push(`/docs/specsfy/${route[1]}`);
    }
    const ebook = join(ROOT, "ebook");
    const { retained, groups } = planEditions(ebook, 2, version);
    const previousEdition = retained[1];
    if (previousEdition) {
      for (const file of groups.get(previousEdition)) {
        copyFileSync(join(ebook, file), join(downloads, file));
      }
    }
    const { moved, gone } = registerRemovedRoutes(worktree, removed);
    const anchors = refreshSpecialistAnchors(worktree);
    step("media to R2", "npm", ["run", "media:publicar"], worktree);
    step("retain current and previous Specsfy ebooks", "npm", [
      "run", "media:podar-ebook-specsfy", "--", "--public-local", join(WEBSITE, "public"),
    ], worktree);
    if (!output("git", ["status", "--porcelain", "--untracked-files=no"], worktree) && !removed.length && !/^- website\/src\//mu.test(sync)) {
      console.log("✓ site already matches the Specsfy docs; nothing to publish");
      return;
    }
    const id = nextSitespecId(worktree);
    const sitespec = join(worktree, ".sitespec", `${id}-specsfy-docs-${version.replaceAll(".", "")}`, "SITEPEC.md");
    const now = new Date().toISOString();
    mkdirSync(dirname(sitespec), { recursive: true });
    writeFileSync(sitespec, [
      "---",
      'schemaVersion: "1.0.0"',
      `id: "${id}"`,
      `slug: specsfy-docs-${version.replaceAll(".", "")}`,
      // Text values go through JSON.stringify: a ": " inside a plain YAML
      // scalar breaks the frontmatter.
      `title: ${JSON.stringify(`Docs do Specsfy na versão ${version}`)}`,
      `summary: ${JSON.stringify(`A documentação pública do Specsfy em /docs/specsfy/ passa a refletir a versão ${version}, com o ebook e as imagens do guia publicados no R2.`)}`,
      "status: done",
      `createdAt: "${now}"`,
      `updatedAt: "${now}"`,
      "primarySkill: astrofy-documentation",
      "reviewSkills:",
      "  - astrofy-seo",
      "relatedFiles:",
      "  - src/content/opensource-docs/specsfy/",
      "  - public/docs/specsfy/downloads/build.json",
      "  - scripts/media-manifest.json",
      "  - scripts/media-podar-ebook-specsfy.mjs",
      "tags:",
      "  - specsfy",
      "  - docs",
      `source: ${JSON.stringify(`Publicação da Specsfy ${version} pelo scripts/release.mjs do Specsfy (regra do Luiz de 20/11/2026: tudo sincronizado a cada atualização).`)}`,
      "priority: medium",
      "---",
      "",
      "## Descrição",
      "",
      `Publicação automática da documentação do Specsfy ${version}: páginas regeneradas pelo npm run sync:docs:specsfy, ebook e imagens enviados ao R2 pelo npm run media:publicar a partir de um worktree limpo do origin/main, e conferência em produção pelo npm run site:specsfy:check.`,
      "",
      "## Checklist",
      "",
      `- [x] Páginas de /docs/specsfy/ sincronizadas com a Specsfy ${version} {#sd01}`,
      "- [x] Ebook e imagens do guia publicados no R2 e registrados no media-manifest.json {#sd02}",
      "- [x] Downloads do ebook retêm a edição vigente e a anterior no manifesto e no R2 {#sd04}",
      "- [x] Release do website criada; conferência em produção pelo npm run site:specsfy:check {#sd03}",
      "",
    ].join("\n"));
    // The website lists only valid sitespecs; refuse to commit a broken one.
    const listed = spawnSync("astrofy", ["sitespec", "list", "--json"], { cwd: worktree, encoding: "utf8" });
    if (listed.status === 0) {
      const parsed = JSON.parse(listed.stdout);
      const errors = (parsed.data ?? parsed).errors ?? [];
      if (errors.length) {
        console.error(`✗ invalid sitespec: ${JSON.stringify(errors)}`);
        throw new Error("A sitespec do release não passou na validação.");
      }
    } else console.log("! astrofy not found; the sitespec was not validated");
    const pkg = JSON.parse(readFileSync(join(worktree, "package.json"), "utf8"));
    const [major, minor, patch] = pkg.version.split(".").map(Number);
    const next = `${major}.${minor}.${patch + 1}`;
    const previous = pkg.version;
    pkg.version = next;
    writeFileSync(join(worktree, "package.json"), `${JSON.stringify(pkg, null, "\t")}\n`);
    let count = 0;
    const lock = readFileSync(join(worktree, "package-lock.json"), "utf8").replace(new RegExp(`"version": "${previous.replaceAll(".", "\\.")}"`, "g"), (match) => (count++ < 2 ? `"version": "${next}"` : match));
    writeFileSync(join(worktree, "package-lock.json"), lock);
    const goneNote = (gone.length ? ` Páginas retiradas, com 410: ${gone.map((route) => `\`${route}/\``).join(", ")}.` : "") + (moved.length ? ` Páginas fundidas, com 301 para a nova: ${moved.map((route) => `\`${route}/\``).join(", ")}.` : "") + (anchors ? ` ${anchors} redirecionamento(s) de especialistas agrupados passam a apontar para a seção do modo.` : "");
    const entry = `Documentação do Specsfy em \`/docs/specsfy/\` na versão ${version}, com o ebook e as imagens do guia publicados no R2.${goneNote} Sitespec ${id}.`;
    const changelog = readFileSync(join(worktree, "CHANGELOG.md"), "utf8");
    writeFileSync(join(worktree, "CHANGELOG.md"), changelog.replace("# Changelog do website\n\n", `# Changelog do website\n\n## [${next}] - ${now.slice(0, 10)}\n\n### Alterado\n\n- ${entry}\n\n`));
    // Only these paths: a worktree without the media regenerates registries
    // (imagens-responsivas-registro.json) that must never be committed.
    const paths = ["package.json", "package-lock.json", "CHANGELOG.md", "scripts/media-manifest.json", ".sitespec", "src/content/opensource-docs/specsfy", "public/docs/specsfy/downloads/build.json", "src/config/gone.mjs", "src/config/redirects.mjs"];
    step("website stage", "git", ["add", "--", ...paths], worktree);
    step("website commit", "git", ["commit", "-q", "-m", `docs: Specsfy ${version} em /docs/specsfy ${next}`], worktree);
    step("website tag", "git", ["tag", `v${next}`], worktree);
    step("website push", "git", ["push", "-q", "origin", "HEAD:main"], worktree);
    step("website push tag", "git", ["push", "-q", "origin", `v${next}`], worktree);
    step("website release", "gh", ["release", "create", `v${next}`, "--repo", "promovaweb/website", "--title", `v${next}`, "--notes", `### Alterado\n\n- ${entry}`], worktree);
    websiteCommit = output("git", ["rev-parse", "HEAD"], worktree);
    console.log(`✓ website ${next} published with the Specsfy ${version} docs`);
  } finally {
    spawnSync("git", ["-C", WEBSITE, "worktree", "remove", "--force", worktree], { stdio: "ignore" });
    rmSync(temporary, { recursive: true, force: true });
  }
  const check = spawnSync("npm", ["run", "site:specsfy:check"], { cwd: HUB, encoding: "utf8" });
  console.log(check.status === 0 ? "✓ production check passed" : `! production check: ${(check.stdout + check.stderr).trim().split("\n").slice(-4).join(" | ")} (the deploy may still be running; rerun npm run site:specsfy:check)`);
}

/** Bumps the Hub with the new specsfy gitlink, version, changelog, tag and release. */
function releaseHub() {
  const run = (args, cwd = HUB) => output("git", args, cwd);
  if (!/specsfy/u.test(run(["submodule", "status", "specsfy"]))) {
    console.error(`${HUB} is not the Hub with the specsfy submodule.`);
    process.exit(1);
  }
  if (run(["diff", "--cached", "--name-only"])) {
    console.error("The Hub has staged files; commit or unstage them first. Nothing was changed.");
    process.exit(1);
  }
  step("Hub fetch", "git", ["fetch", "-q", "origin"], HUB);
  step("Hub fast-forward", "git", ["merge", "--ff-only", "-q", "origin/main"], HUB);
  const current = readFileSync(join(HUB, "VERSION"), "utf8").trim();
  const [major, minor, patch] = current.split(".").map(Number);
  const next = `${major}.${minor}.${patch + 1}`;
  const note = `Specsfy ${version}: ${hubNote ?? changelogSummary()}.${websiteCommit ? " Site /docs/specsfy sincronizado." : ""}`;
  writeFileSync(join(HUB, "VERSION"), `${next}\n`);
  const changelog = readFileSync(join(HUB, "CHANGELOG.md"), "utf8");
  writeFileSync(join(HUB, "CHANGELOG.md"), changelog.replace("# Changelog do Hub\n\n", `# Changelog do Hub\n\n## [${next}] - ${new Date().toISOString().slice(0, 10)}\n\n### Alterado\n\n- ${note}\n\n`));
  step("Hub stage", "git", ["add", "VERSION", "CHANGELOG.md", "specsfy"], HUB);
  // The website checkout may be on other work; the gitlink points to the
  // commit the site step published.
  if (websiteCommit) step("Hub website gitlink", "git", ["update-index", "--cacheinfo", `160000,${websiteCommit},website`], HUB);
  step("Hub commit", "git", ["commit", "-q", "-m", `chore: specsfy ${version} no Hub ${next}`], HUB);
  step("Hub tag", "git", ["tag", `v${next}`], HUB);
  step("Hub push", "git", ["push", "-q", "origin", "main"], HUB);
  step("Hub push tag", "git", ["push", "-q", "origin", `v${next}`], HUB);
  step("Hub release", "gh", ["release", "create", `v${next}`, "--title", `v${next}`, "--notes", `### Alterado\n\n- ${note}`], HUB);
  console.log(`✓ Hub ${next} published with Specsfy ${version}`);
}

if (publish) publishRelease();
else if (!hub && !site) prepare();
if (site) releaseSite();
if (hub) releaseHub();
