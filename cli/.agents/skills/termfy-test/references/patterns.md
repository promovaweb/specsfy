# Padrões copiáveis

Cada bloco TypeScript é um exemplo independente para um arquivo da área em
`tests/`, com imports relativos a essa pasta. Integre-o aos testes existentes
sem duplicar imports ou hooks. Execute a partir da raiz do starter kit.
Os exemplos usam dados locais e não acessam rede.

## CLI em subprocesso

Modelo de `tests/cli.test.ts`. O ambiente é passado apenas ao subprocesso;
`HOME_VARIABLE` representa `<BIN>_HOME`, sem fixar o nome do produto.

```ts
/** Exercises CLI JSON output in an isolated subprocess. */
import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../src/config/paths.ts";
import { ExitCode } from "../src/app/exit-codes.ts";
import { manifest } from "../src/app/manifest.ts";

test("about returns identity as JSON", async () => {
  const directory = mkdtempSync(join(tmpdir(), "termfy-cli-"));
  const env = { ...process.env, [HOME_VARIABLE]: directory, NO_COLOR: "1" };
  delete env[MASTER_KEY_VARIABLE];
  const child = Bun.spawn([process.execPath, "run", "src/main.ts", "about", "--json"], {
    cwd: join(import.meta.dir, ".."), env,
    stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  const timeout = setTimeout(() => child.kill(), 4000);
  try {
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
    ]);
    expect(code).toBe(ExitCode.SUCCESS);
    expect(stderr).toBe("");
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(true);
    expect(result.command).toBe(`${manifest.bin} about`);
    expect(result.data.bin).toBe(manifest.bin);
  } finally {
    clearTimeout(timeout);
    child.kill();
    await child.exited;
    rmSync(directory, { recursive: true, force: true });
  }
});
```

Para testar `--stdin`, use `stdin: new Response("test-only-value\n")`.
Confira o code de cada subprocesso. Em falha de domínio, valide o code
esperado e o envelope de erro, além da ausência de valores sensíveis.

## MCP via stdio

Modelo de `tests/mcp.test.ts`. A conexão é local e a tool `about` não faz
requisições externas. Não use servidores públicos para validar o protocolo.

```ts
/** Calls a local MCP tool through the stdio transport. */
import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../src/config/paths.ts";
import { manifest } from "../src/app/manifest.ts";

test("about is discoverable and returns structured identity", async () => {
  const directory = mkdtempSync(join(tmpdir(), "termfy-mcp-"));
  const env = { ...process.env, [HOME_VARIABLE]: directory, NO_COLOR: "1" } as Record<string, string>;
  delete env[MASTER_KEY_VARIABLE];
  const client = new Client({ name: "local-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath, args: ["run", "src/main.ts", "mcp"],
    cwd: join(import.meta.dir, ".."), env, stderr: "ignore",
  });
  const timeout = setTimeout(() => { void transport.close(); }, 4000);
  try {
    await client.connect(transport);
    const catalog = await client.listTools();
    expect(catalog.tools.some((tool) => tool.name === "about")).toBe(true);
    const result = await client.callTool({ name: "about", arguments: {} });
    expect(result.isError).not.toBe(true);
    const identity = result.structuredContent as { bin: string };
    expect(identity.bin).toBe(manifest.bin);
    const content = (result.content as Array<{ type: string; text?: string }>)[0];
    expect(content?.type).toBe("text");
    expect(JSON.parse(content?.text ?? "null")).toEqual(result.structuredContent);
  } finally {
    clearTimeout(timeout);
    try { await client.close(); }
    finally {
      try { await transport.close(); }
      finally { rmSync(directory, { recursive: true, force: true }); }
    }
  }
});
```

Para conferir diagnósticos, use `stderr: "pipe"` e consuma o stream durante
as chamadas. Uma tool de rede precisa de um transporte de aplicação falso
ou servidor local controlado, mantendo o SDK MCP real neste teste.

## TUI por frame

Modelo de `tests/tui.test.ts`. `mountTui` retorna uma Promise que termina
quando o renderer é destruído. Não espere essa Promise antes de interagir.

```ts
/** Checks navigation and cleanup without a physical terminal. */
import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTestRenderer, type TestRendererSetup } from "@opentui/core/testing";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../src/config/paths.ts";
import { mountTui } from "../src/tui/index.ts";

test("tab navigation shows About and quit destroys the renderer", async () => {
  const directory = mkdtempSync(join(tmpdir(), "termfy-tui-"));
  const previous = new Map([HOME_VARIABLE, MASTER_KEY_VARIABLE].map((key) => [key, process.env[key]]));
  process.env[HOME_VARIABLE] = directory;
  delete process.env[MASTER_KEY_VARIABLE];
  let setup: TestRendererSetup | undefined;
  let closed: Promise<void> | undefined;
  try {
    setup = await createTestRenderer({ width: 120, height: 32 });
    closed = mountTui(setup.renderer, { initialTab: "overview" });
    await setup.renderOnce();
    expect(setup.captureCharFrame()).toContain("Environment");
    setup.mockInput.pressKey("2");
    await setup.renderOnce();
    expect(setup.captureCharFrame()).toContain("Credits");
    setup.mockInput.pressKey("q");
    await closed;
    expect(setup.renderer.isDestroyed).toBe(true);
  } finally {
    try {
      if (setup && !setup.renderer.isDestroyed) setup.renderer.destroy();
      await closed;
    } finally {
      for (const [key, value] of previous) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      rmSync(directory, { recursive: true, force: true });
    }
  }
});
```

Adapte as teclas à screen declarada em `src/tui/screens/index.ts`. Para
seleção e rolagem de `listPanel`, consulte `tests/tui-list.test.ts`.

## Configuração em pasta temporária

Modelo de `tests/config.test.ts`. Restaure o ambiente anterior, inclusive
quando a máquina da pessoa já tiver uma master key configurada.

```ts
/** Verifies settings persistence without touching user configuration. */
import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../src/config/paths.ts";
import { readSettings, writeSettings, getPath, setPath, convertValue } from "../src/config/settings.ts";

test("settings preserve a valid theme and reject an unknown enum value", () => {
  const directory = mkdtempSync(join(tmpdir(), "termfy-config-"));
  const previous = new Map([HOME_VARIABLE, MASTER_KEY_VARIABLE].map((key) => [key, process.env[key]]));
  process.env[HOME_VARIABLE] = directory;
  delete process.env[MASTER_KEY_VARIABLE];
  try {
    const settings = readSettings();
    expect(getPath(settings, "tui.theme")).toBe("night");
    setPath(settings, "tui.theme", convertValue("tui.theme", "day"));
    writeSettings(settings);
    expect(getPath(readSettings(), "tui.theme")).toBe("day");
    expect(() => convertValue("tui.theme", "unknown")).toThrow(/accepts only/);
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
```
