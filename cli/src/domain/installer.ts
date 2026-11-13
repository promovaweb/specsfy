/**
 * Instalação idempotente do framework e das skills do Specsfy.
 *
 * A materialização é delegada ao CLI oficial `skills`; este módulo mantém os
 * fingerprints, protege customizações e gerencia somente blocos identificados.
 */

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  readdir,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import {
  isFile,
  pathExists,
  readJson,
  resolvePath,
  writeTextAtomic,
} from "./filesystem.ts";
import {
  assertConsumerProject,
  ensureSkillsLock,
  installedSkillNames,
} from "./skill-lock.ts";
import { resolveNpxSkillsCommand } from "./prerequisites.ts";

const execFileAsync = promisify(execFile);

export const MONOREPO_REPOSITORY =
  "https://github.com/promovaweb/specsfy.git";
export const BASE_DIRECTORY = "skills";
export const SPECIALISTS_DIRECTORY = "specialists";
export const BASE_SKILLS = [
  "specsfy-01-inbox",
  "specsfy-02-backlog",
  "specsfy-03-specify",
  "specsfy-04-validate",
  "specsfy-05-tasks",
  "specsfy-06-tdd-bdd",
  "specsfy-07-implement",
  "specsfy-update-spec",
  "specsfy-progress",
  "specsfy-interviewer",
  "specsfy-mvp-milestone-interviewer",
  "specsfy-roadmap-milestone-interviewer",
  "specsfy-milestone-governor",
  "specsfy-data-discovery",
] as const;
export const AUXILIARY_SKILLS = [
  "specsfy-aux-stack",
  "specsfy-aux-rules",
  "specsfy-aux-database",
] as const;
export const DOCUMENTATION_SKILLS = ["specsfy-documentator"] as const;
export const FRAMEWORK_SKILLS = [
  "specsfy-setup",
  ...AUXILIARY_SKILLS,
  ...DOCUMENTATION_SKILLS,
  ...BASE_SKILLS,
] as const;
export const RENAMED_BASE_SKILLS: Readonly<Record<string, string>> = {
  "specsfy-base-idea": "specsfy-01-inbox",
  "specsfy-base-backlog": "specsfy-02-backlog",
  "specsfy-base-interview": "specsfy-02-backlog",
  "specsfy-base-specify": "specsfy-03-specify",
  "specsfy-base-validate": "specsfy-04-validate",
  "specsfy-base-tasks": "specsfy-05-tasks",
  "specsfy-base-tdd-bdd": "specsfy-06-tdd-bdd",
  "specsfy-base-implement": "specsfy-07-implement",
  "specsfy-base-update-spec": "specsfy-update-spec",
  "specsfy-base-progress": "specsfy-progress",
  "specsfy-base-discuss": "specsfy-02-backlog",
};

const FRAMEWORK_START = "<!-- specsfy:framework:start -->";
const FRAMEWORK_END = "<!-- specsfy:framework:end -->";
const SPEC_PATH_TOKEN = "{{SPECSFY_SPEC_PATH}}";
const CONSUMER_SPEC_PATH = ".specsfy/Spec.md";
const CONSUMER_TEMPLATE_DIRECTORY = ".specsfy/templates";
const CONSUMER_CUSTOM_TEMPLATE_DIRECTORY = ".specsfy/templates/custom";
const FRAMEWORK_TEMPLATE_NAMES = [
  "Inbox.md",
  "Backlog.md",
  "Spec.md",
  "Tasks.md",
  "Project.md",
  "Stack.md",
  "Rules.md",
  "Database.md",
  "UserProfile.md",
  "Interface.md",
  "DESIGNSYSTEM.MD",
] as const;
const CONSUMER_EXAMPLE_PATH = ".specsfy/examples/Spec.md";

interface ManagedRecord {
  source?: string;
  installed_at?: string;
  updated_at?: string;
  content_sha256?: string;
  [key: string]: unknown;
}

interface InternalLock {
  schema_version: number;
  skills: Record<string, ManagedRecord>;
  framework?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Instalador de um projeto consumidor explicitamente selecionado. */
export class SkillInstaller {
  readonly project: string;
  readonly force: boolean;

  private constructor(project: string, force: boolean) {
    this.project = resolvePath(project);
    this.force = force;
  }

  /** Valida o destino e cria o lock oficial antes de liberar o instalador. */
  static async create(project: string, force = false): Promise<SkillInstaller> {
    const installer = new SkillInstaller(project, force);
    await assertConsumerProject(installer.project);
    await ensureSkillsLock(installer.project);
    return installer;
  }

  /** Instala todo o framework base. */
  async installBase(): Promise<string[]> {
    return this.installBaseSelection([...FRAMEWORK_SKILLS]);
  }

  /** Instala um subconjunto válido do framework base. */
  async installBaseSelection(names: string[]): Promise<string[]> {
    const allowed = new Set<string>(FRAMEWORK_SKILLS);
    const invalid = [...new Set(names.filter((name) => !allowed.has(name)))].sort();
    if (invalid.length) {
      throw new Error(`skill do framework desconhecida: ${invalid.join(", ")}`);
    }
    return withRepositoryCheckout(
      MONOREPO_REPOSITORY,
      BASE_DIRECTORY,
      (checkout) => this.installBaseFromCheckout(checkout, names),
    );
  }

  /** Instala framework estrutural e skills a partir de uma origem local. */
  async installBaseFromCheckout(
    checkout: string,
    names: readonly string[] = BASE_SKILLS,
  ): Promise<string[]> {
    await this.validateSkillInstallation(checkout, names);
    const legacy = await this.legacyBaseTargets();
    return withInstallationRollback([
      join(this.project, ".specsfy"),
      join(this.project, "AGENTS.md"),
      join(this.project, "CLAUDE.md"),
      join(this.project, "skills-lock.json"),
      ...names.map((name) => join(this.project, ".agents", "skills", name)),
      ...legacy.map(([, target]) => target),
    ], async () => {
      const changed = await this.installFrameworkFromCheckout(checkout);
      changed.push(
        ...(await this.installFromCheckout(checkout, names, "base")),
        ...(await this.removeLegacyBase(legacy)),
      );
      return changed;
    });
  }

  /** Publica regras, templates, exemplo e blocos gerenciados. */
  async installFrameworkFromCheckout(checkout: string): Promise<string[]> {
    const sourceSpec = join(checkout, "Spec.md");
    const sourceExample = join(checkout, "examples", "Spec.md");
    const sourceAgents = join(checkout, "AGENTS.md");
    const templatePaths = Object.fromEntries(
      FRAMEWORK_TEMPLATE_NAMES.map((name) => [
        name,
        join(checkout, "templates", name),
      ]),
    ) as Record<(typeof FRAMEWORK_TEMPLATE_NAMES)[number], string>;
    for (const path of [
      sourceSpec,
      ...Object.values(templatePaths),
      sourceExample,
      sourceAgents,
    ]) {
      if (!(await isFile(path))) {
        throw new Error(`arquivo estrutural ausente na origem: ${path}`);
      }
    }
    const specContent = await readFile(sourceSpec, "utf8");
    const exampleContent = await readFile(sourceExample, "utf8");
    const templates = Object.fromEntries(
      await Promise.all(
        FRAMEWORK_TEMPLATE_NAMES.map(async (name) => [
          name,
          await readFile(templatePaths[name], "utf8"),
        ]),
      ),
    ) as Record<(typeof FRAMEWORK_TEMPLATE_NAMES)[number], string>;
    const agentsBlock = (await extractSourceBlock(sourceAgents)).replace(
      SPEC_PATH_TOKEN,
      CONSUMER_SPEC_PATH,
    );
    const claudeBlock = `${FRAMEWORK_START}\n@${CONSUMER_SPEC_PATH}\n${FRAMEWORK_END}`;
    const lock = await this.readLock();
    const previous =
      lock.framework && typeof lock.framework === "object" ? lock.framework : {};
    const previousTemplates =
      previous.templates_sha256 &&
      typeof previous.templates_sha256 === "object" &&
      !Array.isArray(previous.templates_sha256)
        ? (previous.templates_sha256 as Record<string, unknown>)
        : {};
    const plans: Array<[string, string | undefined]> = [
      [
        join(this.project, CONSUMER_SPEC_PATH),
        await planManagedFile(
          join(this.project, CONSUMER_SPEC_PATH),
          specContent,
          stringValue(previous.spec_sha256),
          this.force,
        ),
      ],
      [
        join(this.project, CONSUMER_EXAMPLE_PATH),
        await planManagedFile(
          join(this.project, CONSUMER_EXAMPLE_PATH),
          exampleContent,
          stringValue(previous.example_sha256),
          this.force,
        ),
      ],
      [
        join(this.project, "AGENTS.md"),
        await planManagedBlock(
          join(this.project, "AGENTS.md"),
          agentsBlock,
          stringValue(previous.agents_sha256),
          this.force,
        ),
      ],
      [
        join(this.project, "CLAUDE.md"),
        await planManagedBlock(
          join(this.project, "CLAUDE.md"),
          claudeBlock,
          stringValue(previous.claude_sha256),
          this.force,
        ),
      ],
    ];
    for (const name of FRAMEWORK_TEMPLATE_NAMES) {
      const target = join(this.project, CONSUMER_TEMPLATE_DIRECTORY, name);
      const recorded =
        stringValue(previousTemplates[name]) ??
        (name === "Spec.md" ? stringValue(previous.template_sha256) : undefined);
      plans.push([
        target,
        await planManagedFile(target, templates[name], recorded, this.force),
      ]);
    }
    const changed: string[] = [];
    for (const [target, content] of plans) {
      if (content === undefined) continue;
      await writeTextAtomic(target, content);
      changed.push(target);
    }
    await mkdir(join(this.project, CONSUMER_CUSTOM_TEMPLATE_DIRECTORY), {
      recursive: true,
    });
    const frameworkRecord: Record<string, unknown> = {
      source: "base",
      spec_sha256: contentDigest(specContent),
      template_sha256: contentDigest(templates["Spec.md"]),
      templates_sha256: Object.fromEntries(
        FRAMEWORK_TEMPLATE_NAMES.map((name) => [
          name,
          contentDigest(templates[name]),
        ]),
      ),
      example_sha256: contentDigest(exampleContent),
      agents_sha256: contentDigest(agentsBlock),
      claude_sha256: contentDigest(claudeBlock),
    };
    if (JSON.stringify(previous) !== JSON.stringify(frameworkRecord)) {
      lock.framework = frameworkRecord;
      await this.writeLock(lock);
    }
    return changed;
  }

  /** Instala especialistas do catálogo oficial. */
  async installSpecialists(names: string[]): Promise<string[]> {
    return this.installFromRepository(
      MONOREPO_REPOSITORY,
      names,
      "specialists",
      SPECIALISTS_DIRECTORY,
    );
  }

  /** Atualiza todas as skills Specsfy já registradas. */
  async updateAll(): Promise<string[]> {
    const installed = await installedSkillNames(this.project);
    const base = [...FRAMEWORK_SKILLS].filter((name) => installed.has(name)).sort();
    const specialists = [...installed]
      .filter((name) => name.startsWith("specsfy-specialist-"))
      .sort();
    const changed: string[] = [];
    if (base.length) changed.push(...(await this.installBaseSelection(base)));
    if (specialists.length) {
      changed.push(...(await this.installSpecialists(specialists)));
    }
    return changed;
  }

  /** Clona uma origem temporária e instala as skills solicitadas. */
  async installFromRepository(
    repository: string,
    names: readonly string[],
    sourceName: string,
    directory?: string,
  ): Promise<string[]> {
    return withRepositoryCheckout(repository, directory, (checkout) =>
      this.installFromCheckout(checkout, names, sourceName),
    );
  }

  /** Instala skills locais preservando alterações não autorizadas. */
  async installFromCheckout(
    checkout: string,
    names: readonly string[],
    sourceName: string,
  ): Promise<string[]> {
    const destination = join(this.project, ".agents", "skills");
    await mkdir(destination, { recursive: true });
    const lock = await this.readLock();
    const operations: Array<{
      action: "install" | "current" | "replace";
      source: string;
      target: string;
      digest: string;
    }> = [];
    for (const name of names) {
      const source = join(checkout, name);
      if (!(await isFile(join(source, "SKILL.md")))) {
        throw new Error(`skill inválida ou ausente na origem: ${name}`);
      }
      const target = join(destination, name);
      const digest = await skillDigest(source);
      if (!(await pathExists(target))) {
        operations.push({ action: "install", source, target, digest });
        continue;
      }
      const targetDigest = await skillDigest(target);
      if (targetDigest === digest) {
        operations.push({ action: "current", source, target, digest });
        continue;
      }
      const recorded = lock.skills[name]?.content_sha256;
      if (!this.force && recorded !== targetDigest) {
        throw new Error(
          `${target} possui alterações locais; preserve-as ou use --force para substituir`,
        );
      }
      operations.push({ action: "replace", source, target, digest });
    }
    return withInstallationRollback([
      join(this.project, ".specsfy", "skills-lock.json"),
      join(this.project, "skills-lock.json"),
      ...operations.filter(({ action }) => action !== "current").map(({ target }) => target),
    ], async () => {
      const changedNames = operations
        .filter(({ action }) => action !== "current")
        .map(({ target }) => basename(target));
      if (changedNames.length) {
        await installWithSkillsCli(checkout, changedNames, this.project);
      }
      const installed: string[] = [];
      let lockChanged = false;
      for (const operation of operations) {
        const name = basename(operation.target);
        const previous = lock.skills[name] ?? {};
        if (operation.action !== "current") {
          if (
            !(await pathExists(operation.target)) ||
            (await skillDigest(operation.target)) !== operation.digest
          ) {
            throw new Error(
              `skills CLI não materializou ${name} corretamente em ${operation.target}`,
            );
          }
          installed.push(operation.target);
        }
        if (
          previous.source === sourceName &&
          previous.content_sha256 === operation.digest
        ) {
          continue;
        }
        const now = new Date().toISOString();
        const record: ManagedRecord = {
          source: sourceName,
          installed_at:
            typeof previous.installed_at === "string" ? previous.installed_at : now,
          content_sha256: operation.digest,
        };
        if (Object.keys(previous).length && operation.action !== "current") {
          record.updated_at = now;
        }
        lock.skills[name] = record;
        lockChanged = true;
      }
      if (lockChanged) await this.writeLock(lock);
      return installed;
    });
  }

  /** Remove somente nomes pertencentes ao Specsfy e protege customizações. */
  async remove(names: string[]): Promise<string[]> {
    const lock = await this.readLock();
    const official = await installedSkillNames(this.project);
    const framework = new Set<string>(FRAMEWORK_SKILLS);
    const targets: Array<[string, string]> = [];
    for (const name of names) {
      if (
        !framework.has(name) &&
        !(name in RENAMED_BASE_SKILLS) &&
        !name.startsWith("specsfy-aux-") &&
        name !== "specsfy-setup" &&
        !(DOCUMENTATION_SKILLS as readonly string[]).includes(name) &&
        !name.startsWith("specsfy-specialist-")
      ) {
        throw new Error(`nome de skill Specsfy inválido: ${name}`);
      }
      const target = join(this.project, ".agents", "skills", name);
      if ((await pathExists(target)) && !this.force) {
        const recorded = lock.skills[name]?.content_sha256;
        if (recorded !== (await skillDigest(target))) {
          throw new Error(
            `${target} possui alterações locais; preserve-as ou use --force para remover`,
          );
        }
      }
      targets.push([name, target]);
    }
    const materialized = (
      await Promise.all(
        targets.map(async ([name, target]) => ({
          name,
          target,
          exists: await pathExists(target),
        })),
      )
    );
    const commandNames = materialized
      .filter(({ name, exists }) => exists || official.has(name))
      .map(({ name }) => name);
    if (commandNames.length) await removeWithSkillsCli(commandNames, this.project);
    const removed: string[] = [];
    let lockChanged = false;
    for (const { name, target, exists } of materialized) {
      if (exists) {
        await rm(target, { recursive: true });
        removed.push(target);
      }
      if (lock.skills[name]) {
        delete lock.skills[name];
        lockChanged = true;
      }
    }
    if (lockChanged) await this.writeLock(lock);
    return removed;
  }

  private async validateSkillInstallation(
    checkout: string,
    names: readonly string[],
  ): Promise<void> {
    const lock = await this.readLock();
    for (const name of names) {
      const source = join(checkout, name);
      if (!(await isFile(join(source, "SKILL.md")))) {
        throw new Error(`skill inválida ou ausente na origem: ${name}`);
      }
      const target = join(this.project, ".agents", "skills", name);
      if (!(await pathExists(target))) continue;
      const sourceDigest = await skillDigest(source);
      const targetDigest = await skillDigest(target);
      if (sourceDigest === targetDigest) continue;
      if (!this.force && lock.skills[name]?.content_sha256 !== targetDigest) {
        throw new Error(
          `${target} possui alterações locais; preserve-as ou use --force para substituir`,
        );
      }
    }
  }

  private async legacyBaseTargets(): Promise<Array<[string, string]>> {
    const lock = await this.readLock();
    const targets: Array<[string, string]> = [];
    for (const name of Object.keys(RENAMED_BASE_SKILLS)) {
      const target = join(this.project, ".agents", "skills", name);
      if (!(await pathExists(target))) continue;
      if (
        !this.force &&
        lock.skills[name]?.content_sha256 !== (await skillDigest(target))
      ) {
        throw new Error(
          `${target} foi renomeada e possui alterações locais; preserve-as ` +
            "ou use --force para removê-la após instalar a substituta",
        );
      }
      targets.push([name, target]);
    }
    return targets;
  }

  private async removeLegacyBase(
    targets: Array<[string, string]>,
  ): Promise<string[]> {
    if (!targets.length) return [];
    const lock = await this.readLock();
    const official = await installedSkillNames(this.project);
    const registered = targets
      .map(([name]) => name)
      .filter((name) => official.has(name));
    if (registered.length) await removeWithSkillsCli(registered, this.project);
    const removed: string[] = [];
    for (const [name, target] of targets) {
      if (await pathExists(target)) {
        await rm(target, { recursive: true });
        removed.push(target);
      }
      delete lock.skills[name];
    }
    await this.writeLock(lock);
    return removed;
  }

  private async readLock(): Promise<InternalLock> {
    const path = join(this.project, ".specsfy", "skills-lock.json");
    if (!(await isFile(path))) return { schema_version: 1, skills: {} };
    const payload = await readJson(path);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error(`lock inválido: ${path}`);
    }
    const lock = payload as Partial<InternalLock>;
    if (!lock.skills || typeof lock.skills !== "object" || Array.isArray(lock.skills)) {
      lock.skills = {};
    }
    lock.schema_version ??= 1;
    return lock as InternalLock;
  }

  private async writeLock(payload: InternalLock): Promise<void> {
    await writeTextAtomic(
      join(this.project, ".specsfy", "skills-lock.json"),
      `${JSON.stringify(payload, null, 2)}\n`,
    );
  }
}

async function withRepositoryCheckout<T>(
  repository: string,
  directory: string | undefined,
  action: (checkout: string) => Promise<T>,
): Promise<T> {
  const temporary = await mkdtemp(join(tmpdir(), "specsfy-install-"));
  const checkout = join(temporary, "checkout");
  try {
    try {
      await execFileAsync("git", [
        "clone",
        "--depth",
        "1",
        repository,
        checkout,
      ]);
    } catch (error) {
      const detail =
        error && typeof error === "object" && "stderr" in error
          ? String((error as { stderr?: unknown }).stderr ?? "").trim()
          : "";
      throw new Error(detail || "falha ao baixar catálogo");
    }
    const source = directory ? join(checkout, directory) : checkout;
    if (!(await pathExists(source))) {
      throw new Error(`diretório ausente no monorepo: ${directory}`);
    }
    return await action(source);
  } finally {
    await rm(temporary, { recursive: true });
  }
}

async function extractSourceBlock(path: string): Promise<string> {
  const block = managedBlock(await readFile(path, "utf8"), path);
  if (block === undefined) {
    throw new Error(`bloco ${FRAMEWORK_START} ausente no arquivo estrutural: ${path}`);
  }
  if (!block.includes(SPEC_PATH_TOKEN)) {
    throw new Error(`token ${SPEC_PATH_TOKEN} ausente no bloco de ${path}`);
  }
  return block;
}

async function planManagedFile(
  path: string,
  expected: string,
  recordedDigest: string | undefined,
  force: boolean,
): Promise<string | undefined> {
  if (!(await pathExists(path))) return expected;
  if (!(await isFile(path))) throw new Error(`${path} existe e não é um arquivo`);
  const current = await readFile(path, "utf8");
  if (current === expected) return undefined;
  if (force || recordedDigest === contentDigest(current)) return expected;
  throw new Error(
    `${path} possui alterações locais; preserve-as ou use --force para substituir`,
  );
}

async function planManagedBlock(
  path: string,
  expected: string,
  recordedDigest: string | undefined,
  force: boolean,
): Promise<string | undefined> {
  if ((await pathExists(path)) && !(await isFile(path))) {
    throw new Error(`${path} existe e não é um arquivo`);
  }
  const content = (await isFile(path)) ? await readFile(path, "utf8") : "";
  const current = managedBlock(content, path);
  if (current === undefined) return appendBlock(content, expected);
  if (current === expected) return undefined;
  if (!force && recordedDigest !== contentDigest(current)) {
    throw new Error(
      `${path} possui alterações locais no bloco Specsfy; ` +
        "preserve-as ou use --force para substituir somente o bloco",
    );
  }
  const start = content.indexOf(FRAMEWORK_START);
  const end = content.indexOf(FRAMEWORK_END, start) + FRAMEWORK_END.length;
  return content.slice(0, start) + expected + content.slice(end);
}

function managedBlock(content: string, path: string): string | undefined {
  const starts = content.split(FRAMEWORK_START).length - 1;
  const ends = content.split(FRAMEWORK_END).length - 1;
  if (!starts && !ends) return undefined;
  if (starts !== 1 || ends !== 1) {
    throw new Error(`bloco Specsfy malformado em ${path}`);
  }
  const start = content.indexOf(FRAMEWORK_START);
  const end = content.indexOf(FRAMEWORK_END, start) + FRAMEWORK_END.length;
  return content.slice(start, end);
}

function appendBlock(content: string, block: string): string {
  if (!content) return `${block}\n`;
  const separator = content.endsWith("\n\n") ? "" : content.endsWith("\n") ? "\n" : "\n\n";
  return `${content}${separator}${block}\n`;
}

function contentDigest(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function installWithSkillsCli(
  source: string,
  names: string[],
  project: string,
): Promise<void> {
  const command = await resolveNpxSkillsCommand();
  if (!command) {
    throw new Error(
      "npx não encontrado. Instale o npm e disponibilize `npx` no PATH para " +
        "executar `npx skills add`.",
    );
  }
  const arguments_ = [...command.slice(1), "add", resolve(source)];
  for (const name of names) arguments_.push("--skill", name);
  arguments_.push("--agent", "universal", "--copy", "-y", "--full-depth");
  await runSkillsCommand(command[0]!, arguments_, project, "instalar", names);
}

async function removeWithSkillsCli(
  names: string[],
  project: string,
): Promise<void> {
  const command = await resolveNpxSkillsCommand();
  if (!command) {
    throw new Error(
      "npx não encontrado. Instale o npm e disponibilize `npx` no PATH para " +
        "gerenciar as skills instaladas.",
    );
  }
  await runSkillsCommand(
    command[0]!,
    [...command.slice(1), "remove", ...names, "--agent", "universal", "-y"],
    project,
    "remover",
    names,
  );
}

async function runSkillsCommand(
  executable: string,
  arguments_: string[],
  project: string,
  action: string,
  names: string[],
): Promise<void> {
  try {
    await execFileAsync(executable, arguments_, {
      cwd: project,
      encoding: "utf8",
    });
  } catch (error) {
    const value = error as { stderr?: unknown; stdout?: unknown; code?: unknown };
    const detail = String(value.stderr ?? value.stdout ?? "").trim();
    throw new Error(
      `skills CLI falhou ao ${action} ${names.join(", ")}: ` +
        (detail || `exit ${String(value.code ?? 1)}`),
    );
  }
}

/** Calcula o fingerprint estável de uma skill, ignorando caches gerados. */
export async function skillDigest(path: string): Promise<string> {
  const digest = createHash("sha256");
  for (const entry of await walkEntries(path)) {
    const relativePath = relative(path, entry).split(sep).join("/");
    if (isGenerated(relativePath)) continue;
    digest.update(relativePath);
    digest.update("\0");
    const metadata = await lstat(entry);
    if (metadata.isSymbolicLink()) {
      digest.update("link:");
      digest.update((await readlink(entry)).split(sep).join("/"));
    } else if (metadata.isFile()) {
      digest.update((metadata.mode & 0o777).toString(8));
      digest.update(":");
      digest.update(await readFile(entry));
    } else {
      digest.update("dir");
    }
    digest.update("\0");
  }
  return digest.digest("hex");
}

async function walkEntries(root: string): Promise<string[]> {
  const output: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    output.push(path);
    if (entry.isDirectory()) output.push(...(await walkEntries(path)));
  }
  return output.sort();
}

function isGenerated(path: string): boolean {
  const parts = path.split("/");
  const name = parts.at(-1) ?? "";
  return (
    parts.includes("__pycache__") ||
    name === ".DS_Store" ||
    name.endsWith(".pyc") ||
    name.endsWith(".pyo")
  );
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Restaura os destinos gerenciados se o processo delegado falhar ou divergir. */
async function withInstallationRollback<T>(paths: string[], operation: () => Promise<T>): Promise<T> {
  const backup = await mkdtemp(join(tmpdir(), "specsfy-install-rollback-"));
  const snapshots: Array<{ target: string; backup: string; existed: boolean }> = [];
  let retainBackup = false;
  try {
    for (const [index, target] of [...new Set(paths)].entries()) {
      let existed = true;
      try { await lstat(target); } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        existed = false;
      }
      const saved = join(backup, String(index));
      if (existed) await cp(target, saved, { recursive: true, dereference: false });
      snapshots.push({ target, backup: saved, existed });
    }
    try { return await operation(); } catch (error) {
      try {
        for (const snapshot of snapshots) {
          await rm(snapshot.target, { recursive: true, force: true });
          if (snapshot.existed) {
            await mkdir(join(snapshot.target, ".."), { recursive: true });
            await cp(snapshot.backup, snapshot.target, { recursive: true, dereference: false });
          }
        }
      } catch (restoreError) {
        retainBackup = true;
        throw new AggregateError([error, restoreError], `A restauração falhou. Os arquivos anteriores permanecem em ${backup}`);
      }
      throw error;
    }
  } finally {
    if (!retainBackup) await rm(backup, { recursive: true, force: true });
  }
}
