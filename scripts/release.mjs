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
 * The Hub gitlink, its version and its release stay with the Hub. Commit
 * the feature work before `--publish`: everything left in the working tree
 * goes into the release commit.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "cli");
const EXPECTED_ASSETS = 6;

const [version, ...flags] = process.argv.slice(2);
const publish = flags.includes("--publish");

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Usage: node scripts/release.mjs <X.Y.Z> [--publish]");
  process.exit(2);
}

/** Runs a command, streaming its output; stops the release on failure. */
function step(title, command, args, cwd = ROOT) {
  console.log(`\n▸ ${title}`);
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`✗ ${title} failed (exit ${result.status ?? "signal"})`);
    process.exit(1);
  }
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
  console.log(`\n✓ Specsfy ${version} published. Next: the Hub gitlink, version and release.`);
}

if (publish) publishRelease();
else prepare();
