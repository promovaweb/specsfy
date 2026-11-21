/** Specialist declarations and suggestions through the domain, CLI and MCP. */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { cpSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HOME_VARIABLE } from "../src/config/paths.ts";
import { Catalog } from "../src/domain/catalog.ts";
import { FRAMEWORK_SKILLS } from "../src/domain/installer.ts";
import { readSpecSpecialists } from "../src/domain/spec-specialists.ts";
import { CLI_DIR, cli, put, temporary, validSpec } from "./gates/helpers.ts";

const fixture = readFileSync(join(import.meta.dir, "fixtures/specialists/spec.md"), "utf8");
const entry = (shortName: string) => ({ name: `specsfy-specialist-${shortName}`, description: shortName, category: "test" });
const interfaceEntry = {
  ...entry("interface"),
  modes: [{ name: "ui", title: "Interface", absorbs: "specsfy-specialist-old-ui" }],
  triggers: [{ mode: "ui", signal: "Access", keywords: ["autorização", "catálogo"] }],
};
const queueEntry = {
  ...entry("queue"),
  triggers: [
    { signal: "Async processing", keywords: ["fila assíncrona"] },
    { signal: "Examples and partial words", keywords: ["bar", "termo de exemplo", "termo de declaração"] },
  ],
};
const catalog = { schema_version: 1, skills: [interfaceEntry, queueEntry, entry("laravel"), entry("modeling"), entry("delivery")] };
let root: string;
let home: string;
let env: Record<string, string>;
const relativeSpec = "specs/defined/0001-lista/spec.md";

beforeAll(() => {
  root = temporary("specsfy-specialists-");
  home = temporary("specsfy-specialists-home-");
  env = { SPECSFY_SPECIALISTS_CATALOG: put(home, "catalog.json", JSON.stringify(catalog)) };
  put(root, relativeSpec, fixture);
  put(root, ".agents/skills/specsfy-specialist-interface/SKILL.md", "# Installed");
  put(root, ".agents/skills/specsfy-specialist-queue/README.md", "# Incomplete install");
});
afterAll(() => {
  for (const dir of [root, home]) rmSync(dir, { recursive: true, force: true });
});

test("reads unique specialist names from the metadata, plan and task annotations", () => {
  expect(readSpecSpecialists(fixture.replaceAll("\n", "\r\n"))).toEqual([
    "specsfy-specialist-interface", "specsfy-specialist-laravel",
    "specsfy-specialist-modeling", "specsfy-specialist-delivery",
  ]);
  expect(readSpecSpecialists(validSpec())).toEqual([]);
  expect(readSpecSpecialists(validSpec({ Especialistas: "" }))).toEqual([]);
});

test("parses modes, absorbs and triggers, defaulting legacy entries to empty lists", () => {
  const source = Catalog.fromPayload(catalog);
  expect(source.require(interfaceEntry.name).modes).toEqual(interfaceEntry.modes);
  expect(source.require(interfaceEntry.name).triggers).toEqual(interfaceEntry.triggers);
  expect(source.require("specsfy-specialist-laravel")).toMatchObject({ modes: [], triggers: [] });
});

const suggestions = [
  { name: interfaceEntry.name, mode: "ui", signal: "Access", declared: true, installed: true },
  { name: queueEntry.name, signal: "Async processing", declared: false, installed: false },
];

test("suggests signals and reports declarations and actual installs for all spec identifiers", async () => {
  for (const spec of ["1", "lista", relativeSpec]) {
    const run = await cli(["specialists", "suggest", spec, "--project", root, "--json"], home, env);
    expect(run.code).toBe(0);
    expect(run.json?.data).toEqual({ project: root, spec: relativeSpec, suggestions });
  }
  const text = await cli(["skills", "suggest", "0001-lista", "--project", root], home, env);
  expect(text.code).toBe(0);
  expect(text.stdout).toContain(`${interfaceEntry.name} (ui) <- Access [declared, installed]`);
  expect(text.stdout).toContain(`${queueEntry.name} <- Async processing [not declared, not installed]`);
  expect((await cli(["specialists", "suggest", "missing", "--project", root], home, env)).code).toBe(6);
});

test("returns success for an empty suggestion list and for a catalog fallback", async () => {
  put(root, "specs/draft/0002-empty/spec.md", "# Empty");
  const empty = await cli(["specialists", "suggest", "2", "--project", root, "--json"], home, env);
  expect(empty.code).toBe(0);
  expect(empty.json?.data.suggestions).toEqual([]);
  const fallback = await cli(["specialists", "suggest", "2", "--project", root, "--json"], home, {
    SPECSFY_SPECIALISTS_CATALOG: join(home, "missing.json"),
  });
  expect(fallback.code).toBe(0);
  expect(fallback.json?.data.catalogWarning).toContain("embedded catalog");
  const invalidCatalog = put(home, "invalid-catalog.json", JSON.stringify({
    schema_version: 1, skills: [{ ...entry("invalid"), triggers: [{ signal: "Empty" }] }],
  }));
  const invalid = await cli(["specialists", "suggest", "2", "--project", root, "--json"], home, {
    SPECSFY_SPECIALISTS_CATALOG: invalidCatalog,
  });
  expect(invalid.code).toBe(0);
  expect(invalid.json?.data.catalogWarning).toContain("embedded catalog");
});

test("MCP registers specialists_suggest with the same data", async () => {
  const client = new Client({ name: "specialists-test", version: "1" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [join(CLI_DIR, "src/main.ts"), "mcp"],
    env: { ...env, [HOME_VARIABLE]: home },
    stderr: "ignore",
  });
  try {
    await client.connect(transport);
    const result = await client.callTool({ name: "specialists_suggest", arguments: { spec: "lista", project: root } });
    expect(result.isError).toBe(false);
    expect(result.structuredContent).toEqual({ project: root, spec: relativeSpec, suggestions });
  } finally {
    await client.close();
  }
});

test("verify reports specialist warnings for each checked spec without changing policy or attestation", async () => {
  const project = temporary("specsfy-specialist-verify-");
  try {
    for (const skill of FRAMEWORK_SKILLS) {
      cpSync(join(CLI_DIR, "../skills", skill), join(project, ".agents/skills", skill), { recursive: true });
    }
    put(project, relativeSpec, validSpec({ Especialistas: "laravel, unknown" }).replace("Conteúdo descrito.", "Autorização."));
    const second = "specs/defined/0002-other/spec.md";
    put(project, second, validSpec({ Slug: "0002-other" }).replace("Conteúdo descrito.", "Fila assíncrona."));
    const run = await cli(["verify", "--project", project, "--attestation", "attestation.json", "--json"], home, env);
    expect(run.code).toBe(0);
    expect(run.json?.data.result.result).toBe("passed");
    expect(run.json?.data.warnings).toEqual([
      expect.objectContaining({ spec: relativeSpec, kind: "specialist-not-installed", name: "specsfy-specialist-laravel" }),
      expect.objectContaining({ spec: relativeSpec, kind: "unknown-specialist", name: "specsfy-specialist-unknown" }),
      expect.objectContaining({ spec: relativeSpec, kind: "specialist-not-installed", name: "specsfy-specialist-unknown" }),
      expect.objectContaining({ spec: relativeSpec, kind: "undeclared-specialist", name: interfaceEntry.name, mode: "ui", signal: "Access" }),
      expect.objectContaining({ spec: second, kind: "undeclared-specialist", name: queueEntry.name, signal: "Async processing" }),
    ]);
    expect(JSON.parse(readFileSync(join(project, "attestation.json"), "utf8"))).toEqual(run.json?.data.result);
    const text = await cli(["verify", "--project", project], home, env);
    expect(text.code).toBe(0);
    expect(text.stdout).toContain("Specsfy verify: PASSED");
    expect(text.stderr).toContain("WARNING");
    expect(text.stderr).toContain(queueEntry.name);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});
