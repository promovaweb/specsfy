#!/usr/bin/env node
/**
 * Projeta o contexto do GitHub Spec Kit para o Specsfy sem alterar as fontes.
 *
 * A constituição ativa a integração. Cada arquivo regular sob `specs/` é lido
 * como bytes para que contratos e anexos não textuais também sejam registrados.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const START = "<!-- specsfy:speckit:start -->";
const END = "<!-- specsfy:speckit:end -->";
const CONSTITUTION = ".specify/memory/constitution.md";
const TARGET = ".specsfy/SPECKIT.md";

/**
 * Atualiza somente o bloco gerenciado da ponte e devolve o caminho alterado.
 * A ausência da constituição indica que o projeto não usa o GitHub Spec Kit.
 */
export async function syncSpecKitContext(projectPath) {
  const project = resolve(projectPath);
  const constitutionPath = join(project, ...CONSTITUTION.split("/"));
  if (!(await isRegularFile(constitutionPath))) return undefined;

  const constitution = await inspectFile(project, constitutionPath);
  const specsPath = join(project, "specs");
  const artifacts = existsSync(specsPath)
    ? await inspectDirectory(project, specsPath)
    : [];
  const block = renderProjection(constitution, artifacts);
  const target = join(project, ...TARGET.split("/"));
  const existing = existsSync(target) ? await readFile(target, "utf8") : "";
  const updated = upsertManagedBlock(existing, block, target);
  if (updated === existing) return undefined;

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, updated);
  return target;
}

/** Percorre `specs/` em ordem estável e lê todo arquivo regular encontrado. */
async function inspectDirectory(project, directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await inspectDirectory(project, path)));
    } else if (entry.isFile()) {
      files.push(await inspectFile(project, path));
    }
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

/** Lê bytes, fingerprint e título sem pressupor que o artefato seja Markdown. */
async function inspectFile(project, path) {
  const content = await readFile(path);
  const binary = content.includes(0);
  const text = binary ? "" : content.toString("utf8");
  const heading = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return {
    path: relative(project, path).split(sep).join("/"),
    type: classify(path, binary),
    title: heading || (binary ? "arquivo binário" : basename(path)),
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

/** Nomeia os artefatos conhecidos do Spec Kit e mantém fallback genérico. */
function classify(path, binary) {
  if (binary) return "Binário";
  const name = basename(path).toLowerCase();
  const normalizedPath = path.split(sep).join("/");
  if (normalizedPath.endsWith(CONSTITUTION)) return "Constituição";
  if (name === "spec.md") return "Spec";
  if (name === "plan.md") return "Plano";
  if (name === "tasks.md") return "Tarefas";
  if (name === "research.md") return "Pesquisa";
  if (name === "data-model.md") return "Dados";
  if (name === "quickstart.md") return "Guia";
  if (path.split(sep).includes("contracts")) return "Contrato";
  return "Artefato";
}

/** Monta a projeção derivada que orienta agentes de volta às fontes originais. */
function renderProjection(constitution, artifacts) {
  const rows = [constitution, ...artifacts]
    .map(
      ({ path, type, title, sha256 }) =>
        `| \`${escapeCell(path)}\` | ${escapeCell(type)} | ${escapeCell(title)} | \`${sha256}\` |`,
    )
    .join("\n");
  return `${START}
## Fontes detectadas

| Caminho | Tipo | Título | SHA-256 |
| --- | --- | --- | --- |
${rows}

## Regras de convivência

- Leia a constituição e os arquivos originais listados antes de planejar ou
  alterar uma feature correspondente.
- Trate a constituição como governança do projeto. Registre incompatibilidades
  com as regras do Specsfy antes de continuar e peça orientação à pessoa.
- Preserve caminhos, conteúdo e organização de \`.specify/\` e \`specs/\`. A
  skill \`specsfy-setup\` atualiza somente esta projeção derivada.
- Use os artefatos existentes do Spec Kit como fonte da feature correspondente.
  Não os converta silenciosamente para o formato nativo do Specsfy.
${END}`;
}

/** Substitui somente o bloco conhecido e preserva qualquer nota externa. */
function upsertManagedBlock(existing, block, path) {
  const starts = existing.split(START).length - 1;
  const ends = existing.split(END).length - 1;
  if (starts !== ends || starts > 1) {
    throw new Error(`bloco de compatibilidade malformado em ${path}`);
  }
  if (!starts) {
    const header = existing
      ? existing
      : "# Compatibilidade com GitHub Spec Kit\n\n" +
        "Projeção gerada a partir das fontes preservadas no projeto.\n";
    const separator = header.endsWith("\n\n")
      ? ""
      : header.endsWith("\n")
        ? "\n"
        : "\n\n";
    return `${header}${separator}${block}\n`;
  }
  const start = existing.indexOf(START);
  const end = existing.indexOf(END, start) + END.length;
  return `${existing.slice(0, start)}${block}${existing.slice(end)}`;
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

async function isRegularFile(path) {
  try {
    return (await lstat(path)).isFile();
  } catch {
    return false;
  }
}
