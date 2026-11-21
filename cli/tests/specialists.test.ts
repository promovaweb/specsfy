/** Specialist declarations and suggestions through the domain, CLI and MCP. */
import { afterAll, beforeAll, expect, spyOn, test } from "bun:test";
import { cpSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HOME_VARIABLE } from "../src/config/paths.ts";
import { ExitCode } from "../src/app/exit-codes.ts";
import { runVerify } from "../src/cli/commands/gates.ts";
import { specialistSuggestDef } from "../src/cli/commands/specialists.ts";
import { Catalog } from "../src/domain/catalog.ts";
import { FRAMEWORK_SKILLS } from "../src/domain/installer.ts";
import { readSpecSpecialists } from "../src/domain/spec-specialists.ts";
import { CLI_DIR, cli, put, temporary, validSpec } from "./gates/helpers.ts";

const fixture = readFileSync(join(import.meta.dir, "fixtures/specialists/spec.md"), "utf8");
const entry = (shortName: string) => ({ name: `specsfy-specialist-${shortName}`, description: shortName, category: "test" });
const interfaceEntry = {
  ...entry("interface"),
  detect: { dependencies: ["axe-core"] },
  modes: [{ name: "ui", title: "Interface", absorbs: "specsfy-specialist-old-ui" }],
  triggers: [
    { mode: "ui", signal: "Access", keywords: ["autorização", "catálogo"] },
    { mode: "ui", signal: "Flow", keywords: ["fluxo da equipe"] },
  ],
};
const queueEntry = {
  ...entry("queue"),
  triggers: [
    { signal: "Async processing", keywords: ["fila assíncrona"] },
    { signal: "Examples, declarations and partial words", keywords: ["bar", "termo de exemplo", "termo de declaração", "specsfy-specialist-laravel", "specsfy-specialist-delivery"] },
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

test("reads unnumbered specialist sections and excludes their declarations from signals", async () => {
  const spec = "specs/defined/0003-unnumbered/spec.md";
  const markdown = fixture.replace("### 8. Plano técnico", "### Plano técnico").replace("### 14. Tarefas", "### Tarefas");
  put(root, spec, markdown);
  expect(readSpecSpecialists(markdown)).toEqual(readSpecSpecialists(fixture));
  const run = await cli(["specialists", "suggest", spec, "--project", root, "--json"], home, env);
  expect(run.code).toBe(0);
  expect(run.json?.data.suggestions).toEqual(suggestions);
});

test("parses modes, absorbs and triggers, defaulting legacy entries to empty lists", () => {
  const source = Catalog.fromPayload(catalog);
  expect(source.require(interfaceEntry.name).modes).toEqual(interfaceEntry.modes);
  expect(source.require(interfaceEntry.name).triggers).toEqual(interfaceEntry.triggers);
  expect(source.require("specsfy-specialist-laravel")).toMatchObject({ modes: [], triggers: [] });
});

const suggestions = [
  {
    name: interfaceEntry.name, mode: "ui", signal: "Access", declared: true, installed: true,
    signals: [{ signal: "Access", evidence: { line: 1, text: "# Catálogo com AUTORIZACAO" } }],
  },
  {
    name: queueEntry.name, signal: "Async processing", declared: false, installed: false,
    signals: [{ signal: "Async processing", evidence: { line: 11, text: "Publicar em FILA\n   ASSÍNCRONA e importar foobarbaz." } }],
  },
];

test("suggests signals and reports declarations and actual installs for all spec identifiers", async () => {
  for (const spec of ["1", "lista", relativeSpec]) {
    const run = await cli(["specialists", "suggest", spec, "--project", root, "--json"], home, env);
    expect(run.code).toBe(0);
    expect(run.json?.data).toEqual({ project: root, spec: relativeSpec, suggestions });
  }
  const text = await cli(["skills", "suggest", "0001-lista", "--project", root], home, env);
  expect(text.code).toBe(0);
  expect(text.stdout).toContain(`${interfaceEntry.name} (ui) <- Access (line 1: # Catálogo com AUTORIZACAO) [declared, installed]`);
  expect(text.stdout).toContain(`${queueEntry.name} <- Async processing (line 11: Publicar em FILA ASSÍNCRONA e importar foobarbaz.) [not declared, not installed]`);
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
    schema_version: 1, skills: [{ ...entry("invalid"), detect: { dependencies: "react" } }],
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

test("uses concept signals and declared stack aliases with the default catalog", async () => {
  const project = temporary("specsfy-specialist-stack-");
  try {
    put(project, relativeSpec, "# Tela de cadastro acessível com teclado. Contrato HTTP da API. Migration PostgreSQL. App Router de Next.js. Fila Redis.");
    const args = ["specialists", "suggest", "1", "--project", project, "--json"];
    const names = async () => {
      const run = await cli(args, home, { SPECSFY_SPECIALISTS_CATALOG: "" });
      expect(run.code).toBe(0);
      return run.json?.data.suggestions.map(({ name }: { name: string }) => name);
    };
    expect(await names()).toEqual(expect.arrayContaining(["specsfy-specialist-interface", "specsfy-specialist-architecture"]));
    put(project, ".specsfy/STACK.md", [
      "# Stack", "| Camada | Tecnologia | Evidência |", "| --- | --- | --- |",
      "| Banco | PostgreSQL | migrations |", "| Frontend | Next.js | package.json |",
      "| Cache | A confirmar | Redis |",
      "- Sem Redis neste ambiente", "- Não usa Redis", "- Redis: pendente", "- Redis: ausente",
      "### Pendências de stack", "- Redis",
    ].join("\n"));
    const confirmed = await names();
    expect(confirmed).toEqual(expect.arrayContaining(["specsfy-specialist-postgres", "specsfy-specialist-nextjs"]));
    expect(confirmed).not.toContain("specsfy-specialist-redis");
    put(project, ".specsfy/STACK.md", "# Stack\n\n- Valkey");
    expect(await names()).toContain("specsfy-specialist-redis");
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("suggest detects Laravel from artisan or its package and n8n from Compose services", async () => {
  const project = temporary("specsfy-specialist-markers-");
  try {
    put(project, relativeSpec, "# Controller em Laravel e n8n em queue mode.");
    put(project, "composer.json", JSON.stringify({ require: { "symfony/framework-bundle": "^7" } }));
    put(project, "compose.dev.yaml", "x-example:\n  image: n8nio/n8n\nservices:\n  automation:\n    image: n8nio/n8n-helper\n");
    const args = ["specialists", "suggest", "1", "--project", project, "--json"];
    const suggestions = async () => {
      const run = await cli(args, home, { SPECSFY_SPECIALISTS_CATALOG: "" });
      expect(run.code).toBe(0);
      return run.json?.data.suggestions;
    };
    expect(await suggestions()).toEqual([]);
    put(project, "infra/docker-compose.prod.yml", "services:\n  automation:\n    image: 'n8nio/n8n:1.0' # pinned\n");
    put(project, "artisan", "#!/usr/bin/env php\n");
    expect(await suggestions()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: "specsfy-specialist-laravel" }),
      expect.objectContaining({ name: "specsfy-specialist-n8n", mode: "workflows" }),
      expect.objectContaining({ name: "specsfy-specialist-n8n", mode: "self-hosting" }),
    ]));
    rmSync(join(project, "artisan"));
    put(project, "composer.json", JSON.stringify({ require: { "laravel/framework": "^12" } }));
    expect(await suggestions()).toEqual(expect.arrayContaining([expect.objectContaining({ name: "specsfy-specialist-laravel" })]));
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("verify scans once and preserves a policy failure when detection throws", async () => {
  const project = temporary("specsfy-specialist-failed-detection-");
  const detect = spyOn(Catalog.prototype, "detect").mockRejectedValue(new Error("Detection failed"));
  try {
    put(project, ".specsfy/STACK.md", "# Stack\n\n- PostgreSQL\n");
    put(project, relativeSpec, validSpec().replace("Conteúdo descrito.", "Migration PostgreSQL."));
    put(project, "specs/defined/0002-other/spec.md", "# Invalid spec\n");
    const result = await runVerify({ project, attestation: "attestation.json" });
    expect(detect).toHaveBeenCalledTimes(1);
    expect(result.code).toBe(ExitCode.GATE_FAILED);
    expect(result.data.result).toEqual(JSON.parse(readFileSync(join(project, "attestation.json"), "utf8")));
    expect(result.data.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "stack-detection-failed" }),
      expect.objectContaining({ kind: "undeclared-specialist", name: "specsfy-specialist-postgres" }),
    ]));
    expect(result.data.warnings.filter(({ kind }) => kind === "stack-detection-failed")).toHaveLength(1);
    const suggested = await specialistSuggestDef.execute(project, { spec: "1" });
    expect(suggested.warning).toContain("stack");
    expect(suggested.data).toMatchObject({
      stackWarning: expect.any(String),
      suggestions: expect.arrayContaining([expect.objectContaining({ name: "specsfy-specialist-postgres" })]),
    });
  } finally {
    detect.mockRestore();
    rmSync(project, { recursive: true, force: true });
  }
});

test("verify reports specialist warnings for each checked spec without changing policy or attestation", async () => {
  const project = temporary("specsfy-specialist-verify-");
  try {
    for (const skill of FRAMEWORK_SKILLS) {
      cpSync(join(CLI_DIR, "../skills", skill), join(project, ".agents/skills", skill), { recursive: true });
    }
    put(project, relativeSpec, validSpec({ Especialistas: "laravel, unknown" }).replace("Conteúdo descrito.", "Autorização no fluxo da equipe."));
    const second = "specs/defined/0002-other/spec.md";
    put(project, second, validSpec({ Slug: "0002-other" }).replace("Conteúdo descrito.", "Fila assíncrona."));
    const run = await cli(["verify", "--project", project, "--attestation", "attestation.json", "--json"], home, env);
    expect(run.code).toBe(0);
    expect(run.json?.data.result.result).toBe("passed");
    expect(run.json?.data.warnings).toEqual([
      expect.objectContaining({ spec: relativeSpec, kind: "specialist-not-installed", name: "specsfy-specialist-laravel" }),
      expect.objectContaining({ spec: relativeSpec, kind: "unknown-specialist", name: "specsfy-specialist-unknown" }),
      expect.objectContaining({ spec: relativeSpec, kind: "specialist-not-installed", name: "specsfy-specialist-unknown" }),
      expect.objectContaining({ spec: relativeSpec, kind: "undeclared-specialist", name: interfaceEntry.name, mode: "ui", signal: "Access", signals: [
        expect.objectContaining({ signal: "Access", evidence: expect.objectContaining({ line: expect.any(Number) }) }),
        expect.objectContaining({ signal: "Flow", evidence: expect.objectContaining({ text: "Autorização no fluxo da equipe." }) }),
      ] }),
      expect.objectContaining({ spec: second, kind: "undeclared-specialist", name: queueEntry.name, signal: "Async processing" }),
    ]);
    expect(JSON.parse(readFileSync(join(project, "attestation.json"), "utf8"))).toEqual(run.json?.data.result);
    const text = await cli(["verify", "--project", project], home, env);
    expect(text.code).toBe(0);
    expect(text.stdout).toContain("Specsfy verify: PASSED");
    expect(text.stderr).toContain("WARNING");
    expect(text.stderr).toContain(queueEntry.name);
    const invalidCatalog = put(home, "invalid-verify-catalog.json", JSON.stringify({
      schema_version: 1, skills: [{ ...entry("broken"), detect: { dependencies: "react" } }],
    }));
    const fallback = await cli(["verify", "--project", project, "--json"], home, {
      SPECSFY_SPECIALISTS_CATALOG: invalidCatalog,
    });
    expect(fallback.code).toBe(ExitCode.SUCCESS);
    expect(fallback.json?.data.result.result).toBe("passed");
    expect(fallback.json?.data.warnings).toContainEqual(expect.objectContaining({ kind: "catalog-unavailable" }));
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("groups signals by mode with source lines and ignores negated and out-of-scope matches", async () => {
  const project = temporary("specsfy-rehearsal-signals-");
  try {
    put(project, "package.json", '{"dependencies":{"react":"*"}}');
    put(project, ".specsfy/STACK.md", "# Stack\n\n- Pest\n");
    const markdown = [
      "# Cupons",
      "| Especialistas | testing, architecture, interface |",
      "<!-- Comment", "Contrato HTTP ignorado", "-->",
      "### 3. Escopo e atores",
      "#### Fora de escopo",
      "Redis, fila assíncrona e rollout.",
      "##### Subescopo",
      "Pipeline GitHub Actions.",
      "#### Incluído",
      "Listagem e cadastro. Jornada de navegação.",
      "Não haverá rollout, deploy ou OpenAPI. Interface com teclado, sem versão pública.",
      "Exportação via webhook está fora de escopo.",
      "Inspeção local do shell AppSidebar, da navegação e das telas do diretório existente.",
      "O POST redireciona para a lista e retorna erros Inertia em falha de validação.",
      "### 8. Plano técnico",
      "#### Especialistas",
      "| Especialista | Modo | Sinal que o puxou | Fases |",
      "| --- | --- | --- | --- |",
      "| interface | discovery | Inventário do shell e das telas | Specify |",
      "| interface | ux | Fluxo de navegação | Specify |",
      "| architecture | web-api | Contratos Inertia e paginação | Specify |",
      "| testing | pest | Testes Pest HTTP por cenário e regressão | Tasks |",
      "#### Migrations",
      "O rollback remove a tabela; a foreign key usa cascade.",
      "Conferir rollback da migration durante deploy.",
      "### 14. Tarefas",
      "- [ ] T001 [CODE] Implementar página React em resources/js/pages/coupons.tsx — Depends: none",
      "  - Especialista: $specsfy-specialist-interface (ux)",
      "  - Especialista: $specsfy-specialist-ui-components (components)",
      "- [ ] T002 [TEST] Rodar regressão Pest — Depends: T001",
      "  - [ ] **VERIFY**: Rodar Playwright para teste de navegador.",
      "- [ ] T003 [OPS] Configurar runtime como pré-condição do deploy — Depends: none",
      "  - [ ] **EVIDENCE**: Registrar versão resolvida, processo e healthcheck.",
      "#### Métricas de sucesso",
      "Todos os cenários de aceite passam.",
    ].join("\n");
    put(project, relativeSpec, markdown);
    const suggest = async () => {
      const run = await cli(["specialists", "suggest", "1", "--project", project, "--json"], home, { SPECSFY_SPECIALISTS_CATALOG: "" });
      expect(run.code).toBe(0);
      return run.json?.data.suggestions;
    };
    for (const declared of [true, false]) {
      const source = declared ? markdown : markdown.split("\n").filter((line) =>
        !/^\| (?:interface \| (?:ux|discovery)|architecture \| web-api)|Especialista: \$specsfy-specialist-interface \(ux\)/u.test(line)
      ).join("\n");
      put(project, relativeSpec, source);
      const found = await suggest();
      const find = (name: string, mode: string) => found.filter((item: { name: string; mode?: string }) =>
        item.name === `specsfy-specialist-${name}` && item.mode === mode);
      expect(find("interface", "ux")).toEqual([expect.objectContaining({ declared, signals: [
        expect.objectContaining({ evidence: { line: 12, text: expect.stringContaining("Jornada") } }),
        expect.objectContaining({ evidence: { line: 12, text: expect.stringContaining("Listagem") } }),
      ] })]);
      for (const [name, mode, prefix] of [
        ["interface", "discovery", "Inspeção local"], ["architecture", "web-api", "O POST"],
        ["ui-components", "components", "- [ ] T001"],
      ] as const) {
        const lines = source.split("\n");
        const index = lines.findIndex((line) => line.startsWith(prefix));
        expect(find(name, mode)).toEqual([expect.objectContaining({ declared: name === "ui-components" || declared, signals: [
          expect.objectContaining({ evidence: { line: index + 1, text: lines[index] } }),
        ] })]);
      }
      expect(find("testing", "pest")[0].declared).toBe(true);
      expect(find("testing", "playwright")[0].declared).toBe(false);
      expect(found.filter(({ name }: { name: string }) => /(?:debugging|delivery|observability)$/.test(name))).toEqual([]);
    }
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("verify warns about rollback of a deployment and excludes migration rollback and declaration text", async () => {
  const project = temporary("specsfy-specialist-rollback-");
  try {
    const deployRollback = "Planejar rollback do deploy em produção.";
    const plan = [
      "#### Especialistas", "", "| Especialista | Modo | Sinal que o puxou | Fases |",
      "| --- | --- | --- | --- |", "| interface | ux | Deploy em produção | Tasks |", "",
      "#### Migrations", "", "O rollback remove a tabela.",
    ].join("\n");
    const source = validSpec({ Especialistas: "interface" }).replace("### 8. Plano técnico\n\nConteúdo descrito.", `### 8. Plano técnico\n\n${plan}`);
    for (const rollback of ["", deployRollback]) {
      put(project, relativeSpec, source.replace("O rollback remove a tabela.", `O rollback remove a tabela.\n\n${rollback}`));
      const run = await cli(["verify", "--spec", "1", "--project", project, "--json"], home, { SPECSFY_SPECIALISTS_CATALOG: "" });
      expect(run.code).toBe(0);
      const delivery = run.json?.data.warnings.filter(({ name }: { name?: string }) => name === "specsfy-specialist-delivery");
      expect(delivery).toEqual(rollback ? [expect.objectContaining({ mode: "deploy", signals: [
        expect.objectContaining({ evidence: { line: expect.any(Number), text: deployRollback } }),
      ] })] : []);
    }
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});
