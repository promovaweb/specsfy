#!/usr/bin/env node

/**
 * Gerencia o arquivo SEMVER na raiz de um projeto.
 *
 * Comandos:
 * - init --initial X.Y.Z --project <diretório>
 * - current --project <diretório>
 * - bump patch|minor|major --project <diretório>
 * - verify X.Y.Z --project <diretório>
 */

import { rename, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const STABLE_SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/** Encerra o processo com uma mensagem apropriada para uso em CLI. */
function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

/** Analisa os argumentos aceitos e devolve comando, parâmetros e projeto. */
function parseArguments(argumentsList) {
  const values = [...argumentsList];
  const command = values.shift();
  const positionals = [];
  let project = ".";
  let initial;

  while (values.length > 0) {
    const value = values.shift();
    if (value === "--project") project = values.shift();
    else if (value === "--initial") initial = values.shift();
    else positionals.push(value);
  }

  if (!command || !project) throw new Error("Informe um comando e um projeto.");
  return { command, initial, positionals, project: resolve(project) };
}

/** Valida e separa uma versão estável em três números. */
function parseVersion(value) {
  const match = STABLE_SEMVER.exec(value);
  if (!match) throw new Error(`Versão inválida: ${value}`);
  return match.slice(1).map(Number);
}

/** Lê e valida o arquivo SEMVER do projeto. */
async function readVersion(file) {
  const value = (await readFile(file, "utf8")).trim();
  parseVersion(value);
  return value;
}

/** Escreve a versão por troca atômica de um arquivo temporário. */
async function writeVersion(file, value) {
  parseVersion(value);
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, `${value}\n`, { encoding: "utf8", flag: "wx" });
  await rename(temporary, file);
}

/** Calcula o incremento solicitado para uma versão estável. */
function bumpVersion(current, level) {
  const [major, minor, patch] = parseVersion(current);
  if (level === "patch") return `${major}.${minor}.${patch + 1}`;
  if (level === "minor") return `${major}.${minor + 1}.0`;
  if (level === "major") return `${major + 1}.0.0`;
  throw new Error("O incremento deve ser patch, minor ou major.");
}

/** Executa o comando solicitado contra o arquivo SEMVER do projeto. */
async function main() {
  const { command, initial, positionals, project } = parseArguments(process.argv.slice(2));
  const file = resolve(project, "SEMVER");

  if (command === "init") {
    if (!initial) throw new Error("Informe --initial X.Y.Z.");
    parseVersion(initial);
    await writeFile(file, `${initial}\n`, { encoding: "utf8", flag: "wx" });
    process.stdout.write(`${initial}\n`);
    return;
  }

  const current = await readVersion(file);
  if (command === "current") process.stdout.write(`${current}\n`);
  else if (command === "bump") {
    const next = bumpVersion(current, positionals[0]);
    await writeVersion(file, next);
    process.stdout.write(`${next}\n`);
  } else if (command === "verify") {
    const expected = positionals[0];
    parseVersion(expected);
    if (current !== expected) throw new Error(`SEMVER contém ${current}, não ${expected}.`);
    process.stdout.write(`${current}\n`);
  } else throw new Error(`Comando desconhecido: ${command}`);
}

main().catch((error) => fail(error.message));
