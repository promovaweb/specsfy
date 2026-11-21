#!/usr/bin/env node
/** Valida o contrato estrutural Specsfy/2.0. */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parseGateTasks } from "../../specsfy-05-tasks/scripts/parse_tasks.mjs";

const args = process.argv.slice(2);
const input = args.find((arg) => !arg.startsWith("--"));
const draft = args.includes("--allow-draft");
const asJson = args.includes("--json");
const sections = ["Problema e resultado", "Research e esclarecimentos", "Escopo e atores", "Princípios e restrições do projeto", "Histórias de usuário", "Cenários BDD de aceite", "Requisitos", "Plano técnico", "Modelo de dados", "Interfaces e contratos", "Estratégia TDD", "Plano de testes e rastreabilidade", "Validações", "Tarefas", "Ordem de execução", "Dependências, riscos e suposições", "Decisões", "Definition of Done"];
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const field = (body, key) => body.match(new RegExp(`^\\|\\s*${escape(key)}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "im"))?.[1]?.trim();
const identifiers = (body, kind) => [...new Set([...body.matchAll(new RegExp(`\\b${kind}-\\d{3,}\\b`, "g"))].map((match) => match[0]))];

function minimumBddErrors(body) {
  const covered = new Map();
  const matches = [...body.matchAll(/^####\s+(AC-\d{3,})\b/gm)];
  for (const [index, match] of matches.entries()) {
    const chunk = body.slice(match.index, matches[index + 1]?.index);
    const ids = chunk.match(/\*\*Cobre\*\*:\s*([^\n]+)/i)?.[1]?.match(/\b(?:US|FR|NFR)-\d{3,}\b/g) ?? [];
    for (const id of ids) covered.set(id, new Set([...(covered.get(id) ?? []), match[1]]));
  }
  const errors = [];
  for (const kind of ["US", "FR", "NFR"]) for (const id of identifiers(body, kind)) {
    const count = covered.get(id)?.size ?? 0;
    if (count < 3) errors.push(`${id} possui ${count} cenários BDD; mínimo exigido: 3.`);
  }
  return errors;
}

const formOrAction = /\b(?:formulários?|aç(?:ão|ões)|bot(?:ão|ões))\b/i;
const crudOperations = new Map([
  ["listar", { control: /\bDataGrid\b/i, label: "DataGrid com coluna ID" }],
  ["consultar", {
    control: /\b(?:link|tela|DetailLists|aç(?:ão|ões)|bot(?:ão|ões))\b/i,
    action: /\b(?:consultar|consulta|detalhar|detalhe|DetailLists)\b/i,
    label: "acesso ao detalhe",
  }],
  ["criar", {
    control: formOrAction, action: /\b(?:criar|criação|cadastrar|cadastro|incluir|inclusão)\b/i,
    label: "formulário ou ação de criação",
  }],
  ["editar", {
    control: formOrAction, action: /\b(?:editar|edição|alterar|alteração|atualizar|atualização)\b/i,
    label: "controle de edição",
  }],
  ["apagar", {
    control: /\b(?:aç(?:ão|ões)|bot(?:ão|ões))\b/i,
    action: /\b(?:apagar|excluir|exclusão|remover|remoção)\b/i,
    label: "ação de exclusão",
  }],
]);

function affirmativeControl(text, pattern, extra = /.*/) {
  return text.split(/[.!?;\r\n]+/).some((clause) =>
    pattern.test(clause) && extra.test(clause) && !/\b(?:n(?:ã|a)o|nem|sem)\b/i.test(clause));
}

function crudErrors(content, body, status) {
  const prefix = "Interface para pessoas: Contrato CRUD";
  const declaration = /^[ \t]*(?:[-*][ \t]+)?(?:\*\*Operações\*\*:|\*\*Operações:\*\*|Operações:)[ \t]*(.*)$/gim;
  const declarations = [...content.matchAll(declaration)];
  if (!declarations.length) {
    return [/PageHeader/i, /DataGrid/i, /\bID\b/, /editar/i, /apagar/i].every(pattern => pattern.test(content))
      ? []
      : [`${prefix} precisa declarar PageHeader, DataGrid, ID, editar e apagar.`];
  }

  const operations = declarations[0][1].toLowerCase().split(",").map(operation => operation.trim());
  if (declarations.length !== 1 || new Set(operations).size !== operations.length ||
      operations.some(operation => !crudOperations.has(operation))) {
    return [`${prefix} exige uma linha Operações com itens distintos: listar, consultar, criar, editar, apagar.`];
  }

  const controls = content.replace(declaration, "");
  const errors = [];
  if (!affirmativeControl(controls, /\bPageHeader\b/i)) errors.push(`${prefix} precisa declarar PageHeader.`);

  const entries = new Map();
  for (const line of controls.split(/\r?\n/)) {
    const entry = line.match(/^[ \t]*[-*][ \t]+(?:\*\*([\p{L}]+)\*\*|([\p{L}]+)):[ \t]*(.*)$/iu);
    if (!entry) continue;
    const operation = (entry[1] ?? entry[2]).toLowerCase();
    if (!crudOperations.has(operation) && !/\bTarefa:/i.test(entry[3])) continue;
    if (!operations.includes(operation)) {
      errors.push(`${prefix}: entrada para operação não declarada: ${operation}.`);
      continue;
    }
    if (!entries.has(operation)) entries.set(operation, []);
    entries.get(operation).push(entry[3]);
  }

  const tasks = parseGateTasks(body);
  const resolveTasks = tasks.length > 0 || !["Draft", "Defined"].includes(status) ||
    field(body, "Plan Gate") === "Passed";
  for (const operation of operations) {
    const { control, action, label } = crudOperations.get(operation);
    const rows = entries.get(operation) ?? [];
    if (rows.length !== 1) {
      errors.push(`${prefix}: ${operation} exige uma entrada com ${label} e a tarefa da seção 14.`);
      continue;
    }
    const entry = rows[0].match(/^(.+?)[ \t]+[—-][ \t]+Tarefa:[ \t]+(`?)(T\d{3,})\2\.?[ \t]*$/i);
    const description = entry?.[1] ?? rows[0];
    const id = entry?.[3].toUpperCase();
    if (!affirmativeControl(description, control, operation === "listar" ? /\bID\b/ : undefined)) {
      errors.push(`${prefix}: ${operation} exige ${label}.`);
    }
    if (!id) {
      errors.push(`${prefix}: ${operation} exige a referência Tarefa: TNNN.`);
    } else if (resolveTasks) {
      const matching = tasks.filter(task => task.id === id);
      const task = matching[0];
      if (matching.length !== 1 || !task.tags.has("CODE") || !task.refs.size ||
          !affirmativeControl(task.description, control, action)) {
        errors.push(`${prefix}: ${operation} exige que ${id} seja uma tarefa [CODE] da seção 14 que implemente ${label}.`);
      }
    }
  }
  return errors;
}

/** Exige o contrato de interface e, quando aplicável, o contrato CRUD. */
function interfaceErrors(body, status) {
  const value = field(body, "Interface para pessoas");
  if (!value) return status === "Draft" ? [] : ["O cabeçalho deve informar se há Interface para pessoas."];
  if (status === "Draft" && /^(?:A definir|Pendente)\b/i.test(value)) return [];
  if (!/^(Sim|Não|Nao)\b/i.test(value)) {
    return ["Interface para pessoas deve começar com Sim, Não ou Nao."];
  }
  if (!/^Sim\b/i.test(value)) return [];

  const required = [
    "Interface para pessoas",
    "Stack e convenções de interface",
    "Telas e responsabilidades",
    "Fluxo de informação e navegação",
    "Menus e navegação principal",
    "Formulários e ações",
    "Composição e disposição",
    "Blocos React e componentes selecionados",
    "Estados e acessibilidade",
    "Revisão visual durante o desenvolvimento",
  ];
  if (/\b(?:CRUD|DataGrid|DetailLists|PageHeader)\b/i.test(body)) required.push("Contrato CRUD");
  const errors = [];
  for (const title of required) {
    const match = body.match(new RegExp(`^####\\s+${escape(title)}\\s*$`, "im"));
    if (!match) {
      errors.push(`Interface para pessoas: heading obrigatório ausente: ${title}.`);
      continue;
    }
    const next = body.slice(match.index + match[0].length).search(/^####\s+|^###\s+/m);
    const content = body.slice(match.index + match[0].length, next < 0 ? undefined : match.index + match[0].length + next);
    if (/\[(?:Tela|Como|Menu|Campos|Hierarquia|Loading|Sim ou Não)/i.test(content) || !content.trim()) {
      errors.push(`Interface para pessoas: ${title} precisa descrever o comportamento real.`);
    }
    if (title === "Menus e navegação principal" && (!/\bmenus?\b/i.test(content) || !/\b(?:item|rota|destino|tela|navega)/i.test(content))) {
      errors.push("Interface para pessoas: Menus e navegação principal precisa mapear menus, itens e destinos, ou declarar por que não há menu.");
    }
    const visualChecks = [[/bordas/i, "bordas"], [/espaçamentos/i, "espaçamentos"], [/margens/i, "margens"], [/padding/i, "padding"], [/tipografia/i, "tipografia"]];
    if (title === "Revisão visual durante o desenvolvimento" && visualChecks.some(([pattern]) => !pattern.test(content))) {
      errors.push("Interface para pessoas: Revisão visual durante o desenvolvimento precisa conferir bordas, espaçamentos, margens, padding e tipografia.");
    }
    if (title === "Contrato CRUD") errors.push(...crudErrors(content, body, status));
  }
  return errors;
}

if (!input || !existsSync(input)) {
  console.error(`ERRO: Arquivo não encontrado: ${input ?? ""}`);
  process.exitCode = 1;
} else {
  const path = resolve(input);
  const body = await readFile(path, "utf8");
  const errors = [];
  const warnings = [];
  const status = field(body, "Status");
  const slug = field(body, "Slug");
  const gates = { definition: field(body, "Definition Gate"), plan: field(body, "Plan Gate"), delivery: field(body, "Delivery Gate") };
  if (field(body, "Formato") !== "Specsfy/2.0") errors.push("O cabeçalho tabular deve declarar Formato como Specsfy/2.0.");
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push("Slug deve ser kebab-case na linha Slug do cabeçalho.");
  if (!['Draft', 'Defined', 'Planned', 'Implementing', 'Reviewing', 'Complete'].includes(status)) errors.push("Status deve ser Draft, Defined, Planned, Implementing, Reviewing ou Complete.");
  if (!draft && (status === "Draft" || gates.definition !== "Passed")) errors.push("Definition Gate precisa estar Passed para validação estrita.");
  for (const name of ["definition", "plan"]) if (!['Pending', 'Failed', 'Passed'].includes(gates[name])) errors.push(`${name} Gate inválido.`);
  if (!['Pending', 'In Progress', 'Failed', 'Passed'].includes(gates.delivery)) errors.push("Delivery Gate inválido.");
  for (const title of sections) if (!new RegExp(`^###\\s+(?:\\d+\\.\\s+)?${escape(title)}\\s*$`, "im").test(body) && !(title === "Dependências, riscos e suposições" && /^###\s+(?:16\.\s+)?Dependências, falhas possíveis e suposições\s*$/imu.test(body))) errors.push(`Heading obrigatório ausente: ${title}.`);
  const ids = Object.fromEntries(["US", "FR", "NFR", "AC", "DEC"].map((kind) => [kind, identifiers(body, kind)]));
  for (const kind of ["US", "FR", "NFR", "AC"]) if (!ids[kind].length) errors.push(`Nenhuma definição ${kind}-NNN encontrada.`);
  errors.push(...minimumBddErrors(body));
  if (status === "Complete" && /^\s*-\s+\[ \]\s+T\d{3,}/m.test(body)) errors.push("Status Complete não permite tarefas abertas na seção 14.");
  if ((/(?<![\p{L}\p{N}_])(?:TODO|TBD|FIXME)(?![\p{L}\p{N}_])/u.test(body) || /\[NEEDS CLARIFICATION/i.test(body)) && !(status === "Draft" && draft)) errors.push("Marcadores não resolvidos.");
  errors.push(...interfaceErrors(body, status));
  const result = { path, format: field(body, "Formato"), slug, status, gates, counts: Object.fromEntries(Object.entries(ids).map(([key, value]) => [key, value.length])), errors, warnings };
  if (asJson) console.log(JSON.stringify(result, null, 2));
  else { console.log(`Spec: ${path}`); errors.forEach((error) => console.log(`ERRO: ${error}`)); console.log(errors.length ? "RESULTADO: NOT READY" : status === "Draft" ? "RESULTADO: VALID DRAFT" : "RESULTADO: READY"); }
  process.exitCode = errors.length ? 1 : 0;
}
