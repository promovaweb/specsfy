#!/usr/bin/env node
/** Cria uma spec em `specs/draft/` a partir do template instalado. */

import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const MAX_SPEC_NUMBER = 9999;
const DIRECTORY_PATTERN = /^(\d{4})-/u;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const STATE_FOLDERS = ["draft", "defined", "planned", "in-progress", "review", "completed"];
const sourceTemplate = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../templates/Spec.md",
);

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) fail(`argumento inválido: ${key}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) fail(`valor ausente para ${key}`);
    values[key.slice(2)] = value;
    index += 1;
  }
  if (!values.title) fail("--title é obrigatório");
  return values;
}

function normalizedTitle(raw) {
  const title = raw.trim();
  if (!title) fail("o título não pode ficar vazio");
  if (/\r|\n/u.test(title)) fail("o título deve ocupar uma única linha");
  return title;
}

function slugify(title) {
  const slug = title.normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "");
  if (!slug) fail("o título deve conter ao menos um caractere alfanumérico");
  return slug;
}

function validatedSlug(raw, title) {
  if (raw === undefined) return slugify(title);
  const slug = raw.trim();
  if (!SLUG_PATTERN.test(slug)) fail(`slug inválido ${JSON.stringify(raw)}; utilize caracteres ASCII em kebab-case`);
  return slug;
}

async function existingNumbers(root) {
  const values = [];
  for (const folder of STATE_FOLDERS) {
    try {
      for (const entry of await readdir(join(root, "specs", folder), { withFileTypes: true })) {
        const match = DIRECTORY_PATTERN.exec(entry.name);
        if (entry.isDirectory() && match?.[1]) values.push(Number(match[1]));
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return values;
}

async function template(root) {
  const candidates = [
    join(root, ".specsfy/templates/custom/Spec.md"),
    join(root, ".specsfy/templates/Spec.md"),
    sourceTemplate,
  ];
  for (const path of candidates) {
    try {
      return await readFile(path, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  fail("template não encontrado; execute specsfy install para publicar .specsfy/templates/Spec.md");
}

function render(content, number, title, slug) {
  const replacements = {
    "{{SPEC_ID}}": `SPEC-${String(number).padStart(4, "0")}`,
    "{{SPEC_NUMBER}}": String(number).padStart(4, "0"),
    "{{SPEC_NAME}}": title,
    "{{SPEC_SLUG}}": slug,
    "{{CURRENT_DATE}}": new Date().toISOString().slice(0, 10),
  };
  let rendered = content;
  for (const [token, value] of Object.entries(replacements)) {
    if (!rendered.includes(token)) fail(`token obrigatório ausente no modelo: ${token}`);
    rendered = rendered.replaceAll(token, value);
  }
  const unresolved = [...new Set(rendered.match(/\{\{[A-Z0-9_]+\}\}/gu) ?? [])];
  if (unresolved.length) fail(`tokens não preenchidos no modelo: ${unresolved.join(", ")}`);
  return rendered;
}

async function initialize(root, title, slug) {
  const destinationRoot = join(root, "specs", "draft");
  await mkdir(destinationRoot, { recursive: true });
  const content = await template(root);
  const allocationLock = join(root, "specs", ".specsfy-allocation.lock");
  for (let attempt = 0; attempt < 500; attempt += 1) {
    try {
      await mkdir(allocationLock);
      break;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      await new Promise((resolveWait) => setTimeout(resolveWait, 10));
    }
    if (attempt === 499) fail("não foi possível reservar o próximo ID da spec");
  }
  let directory;
  let number;
  try {
    number = Math.max(0, ...(await existingNumbers(root))) + 1;
    if (number > MAX_SPEC_NUMBER) fail(`a sequência atingiu o limite ${MAX_SPEC_NUMBER}`);
    directory = join(destinationRoot, `${String(number).padStart(4, "0")}-${slug}`);
    try {
      await mkdir(directory);
    } catch (error) {
      throw error;
    }
  } finally {
    await rm(allocationLock, { recursive: true, force: true });
  }
  const path = join(directory, "spec.md");
  const temporary = join(directory, ".spec.md.tmp");
  try {
    await writeFile(temporary, render(content, number, title, slug), { encoding: "utf8", flag: "wx" });
    await rename(temporary, path);
    return resolve(path);
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const title = normalizedTitle(args.title);
  const root = resolve(args.root ?? process.cwd());
  console.log(await initialize(root, title, validatedSlug(args.slug, title)));
} catch (error) {
  console.error(`erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
