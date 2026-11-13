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
import { FRAMEWORK_SKILLS } from "../../src/domain/installer.ts";
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
    expect(r.json!.data).toEqual({ project, updated: [] });
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
