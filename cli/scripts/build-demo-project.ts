/**
 * Builds the demo project used by the TUI showcase.
 *
 * `example/` is a real application whose specs are all in the legacy
 * layout, so the Overview charts show a single bar. The showcase needs a
 * project with specs spread over the lifecycle. This script writes one, a
 * small online store, to `tests/fixtures/showcase-project/`:
 *
 * - specs in every state (draft, defined, planned, in-progress, review and
 *   completed), with gates and task checkboxes that match the state;
 * - backlog items and inbox captures, one of them still pending.
 *
 * Each spec reuses the body of a real spec of `example/` (so the parser
 * reads the same sections) with its own title, ID, slug, status, gates and
 * a share of the tasks checked. The output is deterministic and committed.
 *
 * Usage: bun run demo:build (then bun run showcase).
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { syncMilestones } from "../src/domain/milestones.ts";

const CLI = resolve(import.meta.dir, "..");
const BASE = resolve(CLI, "../example/specs/completed/0001-diretorio-global-usuarios/spec.md");
export const DEMO_PROJECT = join(CLI, "tests", "fixtures", "showcase-project");
const DATE = "2026-11-20";

type Gate = "Passed" | "Pending" | "Failed" | "Missing";

/** One spec of the demo store. */
interface DemoSpec {
  slug: string;
  title: string;
  folder: "draft" | "defined" | "planned" | "in-progress" | "review" | "completed";
  status: string;
  gates: [Gate, Gate, Gate];
  /** How many of the base spec's tasks are checked, from the first. */
  done: number;
}

const SPECS: DemoSpec[] = [
  { slug: "0001-catalogo-de-produtos", title: "Catálogo de produtos", folder: "completed", status: "Complete", gates: ["Passed", "Passed", "Passed"], done: 4 },
  { slug: "0002-carrinho-de-compras", title: "Carrinho de compras", folder: "completed", status: "Complete", gates: ["Passed", "Passed", "Passed"], done: 4 },
  { slug: "0003-checkout-com-pix", title: "Checkout com Pix", folder: "review", status: "Reviewing", gates: ["Passed", "Passed", "Pending"], done: 4 },
  { slug: "0004-cupons-de-desconto", title: "Cupons de desconto", folder: "in-progress", status: "Implementing", gates: ["Passed", "Passed", "Pending"], done: 3 },
  { slug: "0005-avaliacoes-de-produtos", title: "Avaliações de produtos", folder: "in-progress", status: "Implementing", gates: ["Passed", "Passed", "Pending"], done: 1 },
  { slug: "0006-rastreio-de-pedidos", title: "Rastreio de pedidos", folder: "planned", status: "Planned", gates: ["Passed", "Passed", "Pending"], done: 0 },
  { slug: "0007-lista-de-desejos", title: "Lista de desejos", folder: "defined", status: "Defined", gates: ["Passed", "Pending", "Pending"], done: 0 },
  { slug: "0008-programa-de-fidelidade", title: "Programa de fidelidade", folder: "draft", status: "Draft", gates: ["Pending", "Pending", "Pending"], done: 0 },
];

const BACKLOG = [
  { id: "BACKLOG-0001", slug: "0001-notas-fiscais", title: "Emissão de notas fiscais", status: "Ready" },
  { id: "BACKLOG-0002", slug: "0002-frete-por-regiao", title: "Frete calculado por região", status: "Refining" },
  { id: "BACKLOG-0003", slug: "0003-painel-de-vendas", title: "Painel de vendas para o lojista", status: "Promoted" },
];

const INBOX = [
  { slug: "2026-11-19-assinatura-mensal", title: "Assinatura mensal de produtos", status: "Capturada", processed: false },
  { slug: "2026-11-18-integracao-whatsapp", title: "Avisar o cliente pelo WhatsApp", status: "Processada", processed: true },
];

/** Rewrites the header table and checks the first `done` tasks. */
function demoSpec(base: string, spec: DemoSpec, index: number): string {
  const id = `SPEC-${String(index + 1).padStart(4, "0")}`;
  let text = base
    .replace(/^# .*$/m, `# Especificação integrada: ${spec.title}`)
    .replace(/^\| ID \| .* \|$/m, `| ID | ${id} |`)
    .replace(/^\| Slug \| .* \|$/m, `| Slug | ${spec.slug} |`)
    .replace(/^\| Status \| .* \|$/m, `| Status | ${spec.status} |`)
    .replace(/^\| Definition Gate \| .* \|$/m, `| Definition Gate | ${spec.gates[0]} |`)
    .replace(/^\| Plan Gate \| .* \|$/m, `| Plan Gate | ${spec.gates[1]} |`)
    .replace(/^\| Delivery Gate \| .* \|$/m, `| Delivery Gate | ${spec.gates[2]} |`)
    .replace(/^\| Atualizada em \| .* \|$/m, `| Atualizada em | ${DATE} |\n| Milestones | ${index < 5 ? "M01" : "M02"} |`);
  // Inside section 14, a top-level task and its sub-items follow its index.
  const lines = text.split("\n");
  let inTasks = false;
  let task = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^#{1,6}\s+\d+\./u.test(line)) inTasks = /^#{1,6}\s+14\.\s+Tarefas\s*$/u.test(line);
    if (!inTasks) continue;
    if (/^- \[[ x]\] T\d{3}/u.test(line)) task++;
    if (/^\s*- \[[ x]\]/u.test(line)) lines[i] = line.replace(/\[[ x]\]/u, task < spec.done ? "[x]" : "[ ]");
  }
  text = lines.join("\n");
  return text;
}

function backlogItem(item: (typeof BACKLOG)[number]): string {
  return `# Backlog: ${item.title}

| Metainformação | Valor |
| --- | --- |
| ID | ${item.id} |
| Status | ${item.status} |
| Produto | Loja online |
| Funcionalidade | ${item.title} |
| Tipo | Funcionalidade |
| Criado em | ${DATE} |
| Milestones | M02 |

## Ideia original

${item.title} para a loja online.
`;
}

function inboxCapture(item: (typeof INBOX)[number]): string {
  return `# Inbox: ${item.title}

| Metadado | Valor |
| --- | --- |
| Status | ${item.status} |
| Capturada em | ${DATE} |
| Slug | ${item.slug} |
| Origem | Input do usuário |

## Texto original

${item.title}.
`;
}

/** Milestone files with a human heading and goal; sync fills the progress. */
const MILESTONES = [
  { id: "M01", title: "M01 · MVP da loja", goal: "Vender pela internet: catálogo, carrinho, checkout com Pix, cupons e avaliações." },
  { id: "M02", title: "M02 · Pós-venda", goal: "Acompanhar o pedido depois da compra e trazer o cliente de volta." },
];

if (import.meta.main) {
  const base = readFileSync(BASE, "utf8");
  rmSync(DEMO_PROJECT, { recursive: true, force: true });
  SPECS.forEach((spec, index) => {
    const folder = join(DEMO_PROJECT, "specs", spec.folder, spec.slug);
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, "spec.md"), demoSpec(base, spec, index));
  });
  mkdirSync(join(DEMO_PROJECT, "specs", "backlog"), { recursive: true });
  for (const item of BACKLOG) writeFileSync(join(DEMO_PROJECT, "specs", "backlog", `${item.slug}.md`), backlogItem(item));
  for (const item of INBOX) {
    const folder = join(DEMO_PROJECT, "specs", "inbox", ...(item.processed ? ["processed"] : []));
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, `${item.slug}.md`), inboxCapture(item));
  }
  mkdirSync(join(DEMO_PROJECT, "specs", "milestones"), { recursive: true });
  for (const milestone of MILESTONES) {
    writeFileSync(join(DEMO_PROJECT, "specs", "milestones", `${milestone.id}.md`), `# ${milestone.title}\n\n## Objetivo\n\n${milestone.goal}\n`);
  }
  await syncMilestones(DEMO_PROJECT);
  // Part of the context, so the Context tab shows present and missing files.
  mkdirSync(join(DEMO_PROJECT, ".specsfy"), { recursive: true });
  writeFileSync(join(DEMO_PROJECT, "PROJECT.md"), "# Loja online\n\nLoja virtual de produtos artesanais, com vendas por Pix e cartão.\n\n## Pessoas\n\n- Cliente que compra pelo celular.\n- Lojista que cadastra produtos e acompanha pedidos.\n");
  writeFileSync(join(DEMO_PROJECT, ".specsfy", "STACK.md"), "# Stack\n\n| Camada | Tecnologia |\n| --- | --- |\n| Backend | Laravel 12 |\n| Frontend | React com Inertia |\n| Banco | PostgreSQL |\n");
  writeFileSync(join(DEMO_PROJECT, ".specsfy", "RULES.md"), "# Regras do projeto\n\n## Testes\n\n- Toda rota tem teste de feature.\n\n## Pagamentos\n\n- Valores em centavos, nunca em ponto flutuante.\n");
  // The skills of example/ make the Skills tab look like a real project.
  writeFileSync(join(DEMO_PROJECT, "skills-lock.json"), readFileSync(resolve(CLI, "../example/skills-lock.json"), "utf8"));
  console.log(`✓ demo project written to ${DEMO_PROJECT}: ${SPECS.length} specs, ${BACKLOG.length} backlog items, ${INBOX.length} captures`);
}
