/**
 * Shared helpers of the gates and testing suites: a CLI runner in a
 * subprocess with an isolated data directory, and a generator of a minimal
 * spec that passes `validate_spec` in strict mode.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { HOME_VARIABLE } from "../../src/config/paths.ts";

/** Directory of the CLI package. */
export const CLI_DIR = join(import.meta.dir, "..", "..");

/** The repository's `example/` project, used read-only. */
export const EXAMPLE_DIR = join(CLI_DIR, "..", "example");

/** Creates a temporary directory with a recognizable prefix. */
export function temporary(prefix = "specsfy-gates-"): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

/** Writes a file, creating its parent directories. */
export function put(root: string, path: string, content: string): string {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  return target;
}

/** Output of one CLI run. */
export interface CliRun {
  code: number;
  stdout: string;
  stderr: string;
  /** Parsed stdout when `--json` was given. */
  json?: { ok: boolean; data?: any; error?: { code: number; message: string } };
}

/**
 * Runs `bun run src/main.ts <args>` with `home` as the data directory.
 * `env` is merged over the current environment; `PATH` may be replaced.
 */
export async function cli(args: string[], home: string, env: Record<string, string> = {}): Promise<CliRun> {
  const proc = Bun.spawn([process.execPath, "run", "src/main.ts", ...args], {
    cwd: CLI_DIR,
    env: { ...process.env, [HOME_VARIABLE]: home, NO_COLOR: "1", ...env },
    stdin: "ignore",
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  const run: CliRun = { code, stdout, stderr };
  if (args.includes("--json")) {
    try { run.json = JSON.parse(stdout); } catch { /* left undefined: the test fails on the assertion */ }
  }
  return run;
}

const SECTIONS = [
  "Problema e resultado", "Research e esclarecimentos", "Escopo e atores", "Princípios e restrições do projeto",
  "Histórias de usuário", "Cenários BDD de aceite", "Requisitos", "Plano técnico", "Modelo de dados",
  "Interfaces e contratos", "Estratégia TDD", "Plano de testes e rastreabilidade", "Validações", "Tarefas",
  "Ordem de execução", "Dependências, riscos e suposições", "Decisões", "Definition of Done",
];

function sectionBody(title: string): string {
  if (title === "Histórias de usuário") return "#### US-001 Listar itens\n\nComo pessoa usuária, quero listar os itens.";
  if (title === "Cenários BDD de aceite") return [1, 2, 3].map((n) => `#### AC-00${n} Cenário ${n}\n\n**Cobre**: US-001, FR-001, NFR-001`).join("\n\n");
  if (title === "Requisitos") return "- **FR-001**: Listar os itens.\n- **NFR-001**: Responder em até 200 ms.";
  if (title === "Decisões") return "- DEC-001: Usar a listagem padrão.";
  return "Conteúdo descrito.";
}

/**
 * Markdown of a minimal Specsfy/2.0 spec in status Defined that passes
 * `validate_spec` without `--allow-draft`. `overrides` replaces header rows.
 */
export function validSpec(overrides: Record<string, string> = {}): string {
  const header: Record<string, string> = {
    Formato: "Specsfy/2.0",
    Slug: "0001-lista",
    Status: "Defined",
    "Definition Gate": "Passed",
    "Plan Gate": "Pending",
    "Delivery Gate": "Pending",
    "Interface para pessoas": "Não",
    ...overrides,
  };
  const rows = Object.entries(header).map(([key, value]) => `| ${key} | ${value} |`).join("\n");
  const sections = SECTIONS.map((title, index) => `### ${index + 1}. ${title}\n\n${sectionBody(title)}\n`).join("\n");
  return `# Especificação integrada: Lista\n\n| Campo | Valor |\n| --- | --- |\n${rows}\n\n${sections}`;
}

/** Creates a project in a temporary directory with one spec at `specs/specs/0001-lista/spec.md`. */
export function projectWithSpec(markdown: string): string {
  const root = temporary("specsfy-gates-project-");
  put(root, "specs/specs/0001-lista/spec.md", markdown);
  return root;
}
