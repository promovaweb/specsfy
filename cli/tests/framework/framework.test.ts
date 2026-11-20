/**
 * Framework commands (specs 0002 and 0011) end to end: install, update,
 * skills and doctor --project run in a subprocess against a local Git
 * repository built from the framework `skills/` folder, with a stub skills
 * CLI (SPECSFY_SKILLS_CLI) and an isolated data directory. upgrade and the
 * MCP tools run in process with a simulated fetch.
 */
import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../../src/config/paths.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { AppError } from "../../src/app/errors.ts";
import { manifest } from "../../src/app/manifest.ts";
import { FRAMEWORK_SKILLS, skillDigest } from "../../src/domain/installer.ts";
import { frameworkTopLevelCommands, skillsCommands } from "../../src/cli/commands/framework.ts";
import { registerFrameworkTools } from "../../src/mcp/tools/framework.ts";
import type { Catalog as McpCatalog } from "../../src/mcp/server.ts";
import type { Context } from "../../src/cli/registry.ts";

const CLI = join(import.meta.dir, "..", "..");
const FRAMEWORK = join(CLI, "..");
let root: string;
let home: string;
let repository: string;
let catalogFile: string;
let log: string;

function git(cwd: string, ...args: string[]) {
  const r = Bun.spawnSync(["git", "-c", "user.email=test@example.com", "-c", "user.name=test", ...args], { cwd });
  if (r.exitCode !== 0) throw new Error(r.stderr.toString());
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "specsfy-framework-"));
  home = join(root, "home");
  repository = join(root, "repository");
  log = join(root, "skills.jsonl");
  mkdirSync(home, { recursive: true });
  cpSync(join(FRAMEWORK, "skills"), join(repository, "skills"), { recursive: true, filter: (path) => !path.includes(`${join("skills", "tests")}`) });
  mkdirSync(join(repository, "specialists", "specsfy-specialist-x"), { recursive: true });
  writeFileSync(join(repository, "specialists", "specsfy-specialist-x", "SKILL.md"), "---\nname: specsfy-specialist-x\ndescription: X\n---\n");
  const catalog = { schema_version: 1, skills: [{ name: "specsfy-specialist-x", description: "X stack", category: "test", detect: { files: ["x.config"] } }] };
  writeFileSync(join(repository, "specialists", "catalog.json"), JSON.stringify(catalog));
  catalogFile = join(root, "catalog.json");
  writeFileSync(catalogFile, JSON.stringify(catalog));
  git(repository, "init", "-q", "-b", "main");
  git(repository, "add", ".");
  git(repository, "commit", "-q", "-m", "fixture");
  writeFileSync(join(home, "settings.json"), JSON.stringify({ catalog: { repository }, skills: { agents: "universal,claude-code" }, update: { check: false } }));
  const stub = join(root, "skills-cli");
  writeFileSync(stub, `#!/usr/bin/env bun
const fs = require("node:fs"); const p = require("node:path");
const a = process.argv.slice(2); fs.appendFileSync(process.env.SPECSFY_SKILLS_LOG, JSON.stringify(a) + "\\n");
const lp = p.join(process.cwd(), "skills-lock.json");
const l = fs.existsSync(lp) ? JSON.parse(fs.readFileSync(lp, "utf8")) : { version: 1, skills: {} };
if (a[0] === "remove") { for (const n of a.slice(1).filter((x) => !x.startsWith("-"))) delete l.skills[n]; fs.writeFileSync(lp, JSON.stringify(l)); process.exit(0); }
if (a[0] !== "add") process.exit(0);
const s = a[1]; const d = p.join(process.cwd(), ".agents", "skills"); fs.mkdirSync(d, { recursive: true });
for (let i = 0; i < a.length; i++) { if (a[i] !== "--skill") continue; const n = a[i + 1]; fs.cpSync(p.join(s, n), p.join(d, n), { recursive: true, force: true }); l.skills[n] = { source: s, sourceType: "local" }; }
fs.writeFileSync(lp, JSON.stringify(l));
`);
  chmodSync(stub, 0o755);
  process.env.SPECSFY_TEST_STUB = stub;
});

afterAll(() => rmSync(root, { recursive: true, force: true }));

async function run(args: string[], extra: Record<string, string> = {}) {
  const env: Record<string, string> = { ...(process.env as Record<string, string>), [HOME_VARIABLE]: home, NO_COLOR: "1", SPECSFY_SKILLS_CLI: process.env.SPECSFY_TEST_STUB!, SPECSFY_SKILLS_LOG: log, ...extra };
  delete env.SPECSFY_NPX_COMMAND;
  delete env[MASTER_KEY_VARIABLE];
  const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args, "--json"], { cwd: CLI, env, stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  const code = await proc.exited;
  let json: { ok: boolean; data?: any; error?: any } | undefined;
  try { json = JSON.parse(stdout); } catch { json = undefined; }
  return { code, stdout, stderr, json };
}

/** Every file of a tree with its content, to prove a rerun changes nothing. */
function snapshot(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else out[relative(dir, path)] = `${statSync(path).mtimeMs}:${readFileSync(path, "utf8")}`;
    }
  };
  walk(dir);
  return out;
}

describe("install and update", () => {
  let project: string;
  beforeAll(() => {
    project = join(root, "project");
    mkdirSync(project);
  });

  test("install --json in an empty project creates .specsfy/ and the lock", async () => {
    const r = await run(["install", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json?.ok).toBe(true);
    const data = r.json!.data;
    expect(data.project).toBe(project);
    expect(data.installed).toEqual(expect.arrayContaining([".specsfy/Spec.md", "AGENTS.md", "CLAUDE.md", ".agents/skills/specsfy-setup"]));
    expect(data.skipped).toEqual([]);
    expect(data.specialists).toEqual([]);
    for (const path of [".specsfy/Spec.md", ".specsfy/templates/custom", "skills-lock.json", ".specsfy/skills-lock.json"]) expect(existsSync(join(project, path))).toBe(true);
    const calls = readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line) as string[]);
    const add = calls.find((call) => call[0] === "add")!;
    expect(add.join(" ")).toContain("--agent universal --agent claude-code");
  }, 60_000);

  test("repeating install changes no file", async () => {
    const before = snapshot(project);
    const r = await run(["install", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json!.data.installed).toEqual([]);
    expect(r.json!.data.skipped).toEqual([...FRAMEWORK_SKILLS]);
    expect(snapshot(project)).toEqual(before);
  }, 60_000);

  test("update reports nothing to change", async () => {
    const r = await run(["update", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json!.data).toMatchObject({ project, check: false, in_sync: true, updated: [] });
    expect(r.json!.data.plan).toMatchObject({ framework: true, install: [], update: [], rename: [], retire: [], kept: [], files: [] });
    expect(r.json!.data.plan.current).toEqual([...FRAMEWORK_SKILLS]);
  }, 60_000);

  test("skills remove of a skill outside Specsfy exits with 2", async () => {
    const r = await run(["skills", "remove", "external-skill", "--project", project]);
    expect(r.code).toBe(ExitCode.USAGE);
    expect(r.json?.error?.message).toContain("not a Specsfy skill name");
  });

  test("skills install, detect and remove a specialist from the catalog", async () => {
    const env = { SPECSFY_SPECIALISTS_CATALOG: catalogFile };
    writeFileSync(join(project, "x.config"), "");
    const detected = await run(["skills", "detect", "--project", project], env);
    expect(detected.json!.data.skills.map((s: { name: string }) => s.name)).toEqual(["specsfy-specialist-x"]);
    const installed = await run(["skills", "install", "specsfy-specialist-x", "--project", project], env);
    expect(installed.code).toBe(0);
    expect(installed.json!.data).toEqual({ project, installed: [".agents/skills/specsfy-specialist-x"], specialists: ["specsfy-specialist-x"] });
    const removed = await run(["skills", "remove", "specsfy-specialist-x", "--project", project], env);
    expect(removed.json!.data.removed).toEqual([".agents/skills/specsfy-specialist-x"]);
    expect(existsSync(join(project, ".agents/skills/specsfy-specialist-x"))).toBe(false);
  }, 60_000);

  test("skills list reads the catalog", async () => {
    const r = await run(["skills", "list"], { SPECSFY_SPECIALISTS_CATALOG: catalogFile });
    expect(r.json!.data).toEqual({ count: 1, skills: [{ name: "specsfy-specialist-x", description: "X stack", category: "test", tags: [], requires: [] }] });
  });

  test("doctor --project adds the project checks without revealing the token", async () => {
    const r = await run(["doctor", "--project", project], { GH_TOKEN: "secret-token-value" });
    const names = r.json!.data.checks.map((c: { name: string }) => c.name);
    expect(names).toEqual(expect.arrayContaining(["bun", "git", "skills", "project", "lock", "github-token"]));
    expect(names).not.toContain("update");
    expect(r.json!.data.checks.find((c: { name: string }) => c.name === "github-token").detail).toBe("found (GH_TOKEN)");
    expect(r.stdout).not.toContain("secret-token-value");
    const plain = await run(["doctor"]);
    expect(plain.json!.data.checks.map((c: { name: string }) => c.name)).not.toContain("lock");
  });

  test("an explicit missing project is NOT_FOUND", async () => {
    const r = await run(["install", "--project", join(root, "missing")]);
    expect(r.code).toBe(ExitCode.NOT_FOUND);
  });
});

describe("update reconciles the project with the inventory", () => {
  let project: string;
  const skill = (name: string) => join(project, ".agents", "skills", name);
  const readJsonFile = (path: string) => JSON.parse(readFileSync(path, "utf8"));
  /** Plants a skill folder the way an older Specsfy left it; `tracked` records its digest. */
  async function plant(name: string, tracked: boolean) {
    mkdirSync(skill(name), { recursive: true });
    writeFileSync(join(skill(name), "SKILL.md"), `---\nname: ${name}\ndescription: old\n---\n`);
    const official = join(project, "skills-lock.json");
    const lock = readJsonFile(official);
    lock.skills[name] = { source: "old", sourceType: "local" };
    writeFileSync(official, JSON.stringify(lock));
    if (!tracked) return;
    const internal = join(project, ".specsfy", "skills-lock.json");
    const own = readJsonFile(internal);
    own.skills[name] = { source: "base", content_sha256: await skillDigest(skill(name)) };
    writeFileSync(internal, JSON.stringify(own));
  }
  /** Rewrites the inventory of the fixture repository and commits. */
  function editInventory(change: (inventory: any) => void, message: string) {
    const path = join(repository, "skills", "inventory.json");
    const inventory = readJsonFile(path);
    change(inventory);
    writeFileSync(path, JSON.stringify(inventory, null, 2));
    git(repository, "commit", "-qam", message);
  }

  beforeAll(async () => {
    project = join(root, "reconcile");
    mkdirSync(project);
    expect((await run(["install", "--project", project])).code).toBe(0);
  }, 60_000);

  test("a project without the framework is left alone", async () => {
    const empty = join(root, "no-framework");
    mkdirSync(empty);
    const r = await run(["update", "--project", empty]);
    expect(r.code).toBe(0);
    expect(r.json!.data.plan.framework).toBe(false);
    expect(r.json!.data.updated).toEqual([]);
    expect(existsSync(join(empty, ".agents"))).toBe(false);
    expect(existsSync(join(empty, ".specsfy"))).toBe(false);
  }, 60_000);

  test("--check reports a missing framework skill with exit 10 and writes nothing", async () => {
    expect((await run(["skills", "remove", "specsfy-progress", "--project", project])).code).toBe(0);
    const before = snapshot(project);
    const r = await run(["update", "--check", "--project", project]);
    expect(r.code).toBe(ExitCode.GATE_FAILED);
    expect(r.json!.data).toMatchObject({ check: true, in_sync: false, updated: [] });
    expect(r.json!.data.plan.install).toEqual(["specsfy-progress"]);
    expect(snapshot(project)).toEqual(before);
  }, 60_000);

  test("update installs the missing framework skill", async () => {
    const r = await run(["update", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json!.data.updated).toEqual([".agents/skills/specsfy-progress"]);
    expect(existsSync(join(skill("specsfy-progress"), "SKILL.md"))).toBe(true);
    expect((await run(["update", "--check", "--project", project])).code).toBe(0);
  }, 60_000);

  test("a renamed skill is removed, and kept when it has local changes", async () => {
    await plant("specsfy-base-idea", true);
    await plant("specsfy-base-discuss", false);
    const r = await run(["update", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json!.data.plan.rename).toEqual([{ from: "specsfy-base-idea", to: "specsfy-01-inbox" }]);
    expect(r.json!.data.plan.kept.map((k: { name: string }) => k.name)).toEqual(["specsfy-base-discuss"]);
    expect(existsSync(skill("specsfy-base-idea"))).toBe(false);
    expect(existsSync(skill("specsfy-base-discuss"))).toBe(true);
    expect(Object.keys(readJsonFile(join(project, "skills-lock.json")).skills)).not.toContain("specsfy-base-idea");
    const forced = await run(["update", "--force", "--project", project]);
    expect(forced.json!.data.plan.rename).toEqual([{ from: "specsfy-base-discuss", to: "specsfy-02-backlog" }]);
    expect(existsSync(skill("specsfy-base-discuss"))).toBe(false);
  }, 60_000);

  test("the tag of the binary is used, and --latest follows the default branch", async () => {
    git(repository, "tag", `v${manifest.version}`);
    const source = join(repository, "skills", "specsfy-01-inbox", "SKILL.md");
    writeFileSync(source, `${readFileSync(source, "utf8")}\nNew line on main.\n`);
    git(repository, "commit", "-qam", "change after the tag");
    const pinned = await run(["update", "--check", "--project", project]);
    expect(pinned.code).toBe(0);
    const latest = await run(["update", "--check", "--latest", "--project", project]);
    expect(latest.code).toBe(ExitCode.GATE_FAILED);
    expect(latest.json!.data.plan.update).toEqual(["specsfy-01-inbox"]);
    const applied = await run(["update", "--latest", "--project", project]);
    expect(applied.json!.data.updated).toEqual([".agents/skills/specsfy-01-inbox"]);
    expect(readFileSync(join(skill("specsfy-01-inbox"), "SKILL.md"), "utf8")).toContain("New line on main.");
  }, 60_000);

  test("a changed skill with local edits is kept until --force", async () => {
    const source = join(repository, "skills", "specsfy-02-backlog", "SKILL.md");
    writeFileSync(source, `${readFileSync(source, "utf8")}\nSource change.\n`);
    git(repository, "commit", "-qam", "change backlog");
    const local = join(skill("specsfy-02-backlog"), "SKILL.md");
    writeFileSync(local, `${readFileSync(local, "utf8")}\nMy local note.\n`);
    const r = await run(["update", "--latest", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json!.data.plan.kept).toEqual([{ name: "specsfy-02-backlog", reason: "has local changes; use --force to replace" }]);
    expect(readFileSync(local, "utf8")).toContain("My local note.");
    const forced = await run(["update", "--latest", "--force", "--project", project]);
    expect(forced.json!.data.updated).toEqual([".agents/skills/specsfy-02-backlog"]);
    expect(readFileSync(local, "utf8")).toContain("Source change.");
  }, 60_000);

  test("a retired skill is removed and a new framework skill is installed", async () => {
    mkdirSync(join(repository, "skills", "specsfy-new-thing"));
    writeFileSync(join(repository, "skills", "specsfy-new-thing", "SKILL.md"), "---\nname: specsfy-new-thing\ndescription: New\n---\n");
    git(repository, "add", ".");
    editInventory((inventory) => {
      delete inventory.skills["specsfy-progress"];
      inventory.skills["specsfy-new-thing"] = "base";
// A rename always points to a current skill, so the older name follows it.
      delete inventory.renamed["specsfy-base-progress"];
      inventory.retired.push("specsfy-progress", "specsfy-base-progress");
      inventory.renamed["specsfy-interviewer"] = "specsfy-new-thing";
      delete inventory.skills["specsfy-interviewer"];
    }, "retire, rename and add");
    const check = await run(["update", "--check", "--latest", "--project", project]);
    expect(check.code).toBe(ExitCode.GATE_FAILED);
    expect(check.json!.data.plan).toMatchObject({
      install: ["specsfy-new-thing"],
      retire: ["specsfy-progress"],
      rename: [{ from: "specsfy-interviewer", to: "specsfy-new-thing" }],
    });
    const r = await run(["update", "--latest", "--project", project]);
    expect(r.code).toBe(0);
    expect(r.json!.data.updated).toEqual(expect.arrayContaining([
      ".agents/skills/specsfy-new-thing",
      ".agents/skills/specsfy-progress",
      ".agents/skills/specsfy-interviewer",
    ]));
    expect(existsSync(skill("specsfy-new-thing"))).toBe(true);
    expect(existsSync(skill("specsfy-progress"))).toBe(false);
    expect(existsSync(skill("specsfy-interviewer"))).toBe(false);
    const names = Object.keys(readJsonFile(join(project, "skills-lock.json")).skills);
    expect(names).toContain("specsfy-new-thing");
    expect(names).not.toContain("specsfy-progress");
    expect((await run(["update", "--check", "--latest", "--project", project])).code).toBe(0);
  }, 60_000);

  test("the text report names every action", async () => {
    expect((await run(["skills", "remove", "specsfy-05-tasks", "--project", project])).code).toBe(0);
    const env: Record<string, string> = { ...(process.env as Record<string, string>), [HOME_VARIABLE]: home, NO_COLOR: "1", SPECSFY_SKILLS_CLI: process.env.SPECSFY_TEST_STUB!, SPECSFY_SKILLS_LOG: log };
    const proc = Bun.spawn(["bun", "run", "src/main.ts", "update", "--check", "--latest", "--project", project], { cwd: CLI, env, stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    expect(await proc.exited).toBe(ExitCode.GATE_FAILED);
    expect(stdout).toContain("would install  specsfy-05-tasks");
    expect(stdout).toContain('Run "specsfy update" to apply.');
  }, 60_000);
});

describe("upgrade", () => {
  const original = globalThis.fetch;
  afterEach(() => { globalThis.fetch = original; });
  const upgradeCommand = frameworkTopLevelCommands.find((c) => c.name === "upgrade")!;
  const ctx = (options: Record<string, boolean>) => ({ args: [], options, json: true, path: ["upgrade"], stdout: () => {}, stderr: () => {}, interactive: false }) as Context;

  test("upgrade --check --json with a simulated fetch returns latest", async () => {
    globalThis.fetch = (async () => Response.json({ tag_name: "v99.0.0" })) as unknown as typeof fetch;
    const result = await upgradeCommand.run!(ctx({ check: true }));
    expect(result.data).toEqual({ current: manifest.version, latest: "99.0.0", upgraded: false });
  });

  test("a network failure is exit code 5", async () => {
    globalThis.fetch = (async () => { throw new TypeError("offline"); }) as unknown as typeof fetch;
    const failure = await Promise.resolve(upgradeCommand.run!(ctx({ check: true }))).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(AppError);
    expect((failure as AppError).code).toBe(ExitCode.NETWORK_OR_API);
  });

  test("the commands keep the contract names", () => {
    expect(frameworkTopLevelCommands.map((c) => c.name)).toEqual(["install", "update", "upgrade"]);
    expect(skillsCommands.map((c) => c.name)).toEqual(["list", "detect", "install", "remove", "update"]);
  });
});

describe("mcp tools", () => {
  const original = globalThis.fetch;
  afterEach(() => { globalThis.fetch = original; });

  async function connect() {
    const server = new McpServer({ name: "t", version: "0" });
    const catalog: McpCatalog = { name: "t", version: "0", tools: [], resources: [], prompts: [] };
    registerFrameworkTools({ server, catalog });
    const [a, b] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "c", version: "0" });
    await Promise.all([server.connect(a), client.connect(b)]);
    return { client, catalog };
  }

  test("registers the seven tools and maps errors", async () => {
    const { client, catalog } = await connect();
    const expected = ["skills_list", "skills_detect", "framework_install", "framework_update", "skills_install", "skills_remove", "update_check"];
    expect(catalog.tools.map((t) => t.name)).toEqual(expected);
    expect((await client.listTools()).tools.map((t) => t.name)).toEqual(expected);
    const removed = await client.callTool({ name: "skills_remove", arguments: { names: ["external-skill"], project: root } });
    expect(removed.isError).toBe(true);
    expect(JSON.parse((removed.content as Array<{ text: string }>)[0]!.text).code).toBe(ExitCode.USAGE);
    globalThis.fetch = (async () => Response.json({ tag_name: "v99.0.0" })) as unknown as typeof fetch;
    const update = await client.callTool({ name: "update_check", arguments: {} });
    expect(update.structuredContent).toEqual({ current: manifest.version, latest: "99.0.0", available: true });
    await client.close();
  });
});
