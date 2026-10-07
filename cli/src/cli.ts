/**
 * Entrada pública do Specsfy CLI.
 *
 * Define a gramática de comandos e coordena módulos de domínio sem incorporar
 * regras de instalação, catálogo ou progresso.
 */

import { Command, CommanderError, Option } from "commander";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Catalog } from "./catalog.js";
import { clickUpfyHandoff } from "./clickupfy.js";
import { loadConfig, updateConfig } from "./config.js";
import { processInboxCapture } from "./inbox.js";
import { SkillInstaller } from "./installer.js";
import {
  migrateSpecs,
  SPEC_FOLDERS,
  transitionSpec,
  updateSpecEffort,
} from "./lifecycle.js";
import { syncMilestones } from "./milestones.js";
import {
  scanSpecs,
  serializeSpec,
  specsFingerprint,
  summarizeSpecs,
} from "./progress.js";
import { runProjectTests } from "./project-testing.js";
import {
  assertPrerequisites,
  checkPrerequisites,
  type PrerequisiteCheck,
} from "./prerequisites.js";
import {
  checkForUpdate,
  offerStartupUpdate,
  upgradeCurrentInstallation,
} from "./updater.js";
import { VERSION } from "./version.js";

interface ProjectOptions {
  project: string;
}

/** Constrói o parser público sem executar efeitos. */
export function buildProgram(): Command {
  const program = new Command();
  program
    .name("specsfy")
    .description("Instala o Specsfy e acompanha especificações no terminal.")
    .version(VERSION, "--version")
    .showHelpAfterError()
    .action(async () => {
      await openTui(process.cwd());
    });

  program
    .command("install")
    .description("instala as skills do framework")
    .addOption(projectOption())
    .option("--force", "substitui arquivos gerenciados alterados")
    .option("--detected", "instala também os especialistas detectados")
    .option("--specialist <nome>", "especialista explícito; pode ser repetido", collect, [])
    .option("--json", "emite resultado JSON")
    .action(
      async (options: ProjectOptions & {
        force?: boolean;
        detected?: boolean;
        specialist: string[];
        json?: boolean;
      }) => {
        const checks = await checkPrerequisites(options.project);
        assertPrerequisites(checks, ["node", "git", "skills", "project"]);
        const installer = await SkillInstaller.create(options.project, options.force);
        const changed = await installer.installBase();
        let specialistNames = [...options.specialist];
        let catalog: Catalog | undefined;
        if (options.detected) {
          catalog = await Catalog.fetch();
          specialistNames.push(
            ...(await catalog.detect(options.project)).map((entry) => entry.name),
          );
        }
        if (specialistNames.length) {
          catalog ??= await Catalog.fetch();
          specialistNames = catalog.resolve(specialistNames).map((entry) => entry.name);
          changed.push(...(await installer.installSpecialists(specialistNames)));
        }
        printInstallation(changed, Boolean(options.json));
      },
    );

  program
    .command("doctor")
    .description("verifica os pré-requisitos do Specsfy")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (options: ProjectOptions & { json?: boolean }) => {
      const checks = await checkPrerequisites(options.project);
      printPrerequisites(checks, Boolean(options.json));
      if (checks.some(({ ok }) => !ok)) process.exitCode = 1;
    });

  program
    .command("update")
    .description("atualiza todas as skills Specsfy instaladas")
    .addOption(projectOption())
    .option("--force", "substitui arquivos gerenciados alterados")
    .option("--json", "emite resultado JSON")
    .action((options: ProjectOptions & { force?: boolean; json?: boolean }) =>
      updateSkills(options),
    );

  program
    .command("upgrade")
    .description("atualiza o próprio Specsfy CLI")
    .option("--json", "emite resultado JSON")
    .action(async (options: { json?: boolean }) => {
      const checks = await checkPrerequisites(process.cwd());
      assertPrerequisites(checks, ["node", "npm"]);
      const update = await checkForUpdate(VERSION, { force: true });
      if (!update) {
        printUpgrade({ upgraded: false, current_version: VERSION }, Boolean(options.json));
        return;
      }
      await upgradeCurrentInstallation(update.latest_version);
      printUpgrade(
        {
          upgraded: true,
          current_version: VERSION,
          latest_version: update.latest_version,
        },
        Boolean(options.json),
      );
    });

  const skills = program.command("skills").description("gerencia especialistas");
  skills
    .command("list")
    .description("lista o catálogo")
    .option("--json", "emite resultado JSON")
    .action(async (options: { json?: boolean }) => {
      printCatalog((await Catalog.fetch()).entries, Boolean(options.json));
    });
  skills
    .command("detect")
    .description("detecta skills para o projeto")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (options: ProjectOptions & { json?: boolean }) => {
      const catalog = await Catalog.fetch();
      printCatalog(await catalog.detect(options.project), Boolean(options.json));
    });
  skills
    .command("install")
    .description("instala especialistas")
    .argument("<names...>", "nomes das skills")
    .addOption(projectOption())
    .option("--force", "substitui arquivos gerenciados alterados")
    .action(
      async (
        names: string[],
        options: ProjectOptions & { force?: boolean },
      ) => {
        const catalog = await Catalog.fetch();
        const resolved = catalog.resolve(names).map((entry) => entry.name);
        const installer = await SkillInstaller.create(options.project, options.force);
        printPaths(await installer.installSpecialists(resolved));
      },
    );
  skills
    .command("remove")
    .description("remove skills instaladas")
    .argument("<names...>", "nomes das skills")
    .addOption(projectOption())
    .option("--force", "remove arquivos gerenciados alterados")
    .action(
      async (
        names: string[],
        options: ProjectOptions & { force?: boolean },
      ) => {
        const installer = await SkillInstaller.create(options.project, options.force);
        printPaths(await installer.remove(names));
      },
    );
  skills
    .command("update")
    .description("atualiza todas as skills Specsfy instaladas")
    .addOption(projectOption())
    .option("--force", "substitui arquivos gerenciados alterados")
    .option("--json", "emite resultado JSON")
    .action((options: ProjectOptions & { force?: boolean; json?: boolean }) =>
      updateSkills(options),
    );

  program
    .command("transition")
    .description("move uma spec para o próximo estado")
    .argument("<identificador>", "ID e slug da spec")
    .argument("<status>", "pasta de destino")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (
      identifier: string,
      status: string,
      options: ProjectOptions & { json?: boolean },
    ) => {
      if (!SPEC_FOLDERS.includes(status as (typeof SPEC_FOLDERS)[number])) {
        throw new Error(`status de pasta inválido: ${status}`);
      }
      const result = await transitionSpec(
        options.project,
        identifier,
        status as (typeof SPEC_FOLDERS)[number],
      );
      await syncMilestones(options.project);
      printTransition(result, await clickUpfyHandoff(options.project, result.path, "transition"), Boolean(options.json));
    });

  program
    .command("migrate")
    .description("migra specs do layout anterior para pastas de estado")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (options: ProjectOptions & { json?: boolean }) => {
      const migrated = await migrateSpecs(options.project);
      if (migrated.length) await syncMilestones(options.project);
      if (options.json) console.log(JSON.stringify({ migrated }));
      else if (migrated.length) {
        for (const item of migrated) {
          printTransition(item, await clickUpfyHandoff(options.project, item.path, "transition"), false);
        }
      }
      else console.log("nenhuma spec legada para migrar");
    });

  program
    .command("effort")
    .description("atualiza o esforço estimado de uma spec")
    .argument("<identificador>", "ID e slug da spec")
    .argument("<pontuacao>", "inteiro de 1 a 10", Number)
    .requiredOption("--reason <texto>", "justificativa da estimativa")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (
      identifier: string,
      score: number,
      options: ProjectOptions & { reason: string; json?: boolean },
    ) => {
      const result = await updateSpecEffort(
        options.project,
        identifier,
        score,
        options.reason,
      );
      const handoff = await clickUpfyHandoff(options.project, result.path, "effort");
      if (options.json) console.log(JSON.stringify({ ...result, clickupfy: handoff }));
      else {
        console.log(`${result.identifier}\tEffort ${result.effort}/10`);
        printClickUpfyHandoff(handoff);
      }
    });

  const inbox = program
    .command("inbox")
    .description("mantém a fila ativa de capturas em specs/inbox/");
  inbox
    .command("process")
    .description("retira da fila ativa uma captura coberta por specs com Definition Gate aprovado")
    .argument("<captura>", "arquivo .md em specs/inbox/, por nome ou caminho")
    .requiredOption("--spec <id>", "spec que cobre a captura; pode ser repetida", collect, [])
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (
      capture: string,
      options: ProjectOptions & { spec: string[]; json?: boolean },
    ) => {
      const result = await processInboxCapture(options.project, capture, options.spec);
      if (options.json) console.log(JSON.stringify(result));
      else {
        console.log(`${result.name}\t${result.from} → ${result.to}\t${result.status}`);
        for (const spec of result.specs) console.log(`Spec\t${spec.identifier}\t${spec.path}`);
        for (const path of result.updated_references) console.log(`Referência\t${path}`);
      }
    });

  program
    .command("progress")
    .description("exibe progresso das specs")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .option("--watch", "emite novo resumo quando uma spec muda")
    .option("--interval <segundos>", "intervalo do watch em segundos", Number)
    .action(
      async (options: ProjectOptions & {
        json?: boolean;
        watch?: boolean;
        interval?: number;
      }) => runProgress(options),
    );

  const milestones = program
    .command("milestones")
    .description("mantém os marcos derivados de specs e backlog");
  milestones
    .command("sync")
    .description("atualiza specs.md e o progresso dos milestones")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (options: ProjectOptions & { json?: boolean }) => {
      const result = await syncMilestones(options.project);
      if (options.json) console.log(JSON.stringify(result));
      else {
        console.log(`Índice\t${result.index_path}`);
        for (const milestone of result.milestones) {
          console.log(
            `${milestone.id}\t${milestone.completed_specs}/${milestone.total_specs} specs\t` +
              `${milestone.backlog_items} backlog\t${milestone.percent}%`,
          );
        }
      }
    });

  program
    .command("test")
    .description("executa os testes do projeto")
    .addOption(projectOption())
    .action(async (options: ProjectOptions) => {
      const result = await runProjectTests(options.project);
      process.exitCode = result.exit_code;
    });

  program
    .command("tui")
    .description("abre a interface terminal")
    .addOption(projectOption())
    .action(async (options: ProjectOptions) => {
      await openTui(options.project);
    });

  const config = program.command("config").description("configura o projeto consumidor");
  config
    .command("show")
    .description("exibe a configuração efetiva")
    .addOption(projectOption())
    .option("--json", "emite resultado JSON")
    .action(async (options: ProjectOptions & { json?: boolean }) => {
      printConfig(await loadConfig(options.project), Boolean(options.json));
    });
  config
    .command("set")
    .description("altera a configuração")
    .addOption(projectOption())
    .requiredOption("--watch-interval <segundos>", "intervalo de atualização", Number)
    .option("--json", "emite resultado JSON")
    .action(
      async (
        options: ProjectOptions & { watchInterval: number; json?: boolean },
      ) => {
        printConfig(
          await updateConfig(options.project, options.watchInterval),
          Boolean(options.json),
        );
      },
    );
  return program;
}

/** Executa o CLI e converte falhas conhecidas em exit code previsível. */
export async function runCli(argv = process.argv): Promise<number> {
  const program = buildProgram();
  program.exitOverride();
  try {
    await program.parseAsync(argv);
    return Number(process.exitCode ?? 0);
  } catch (error) {
    if (error instanceof CommanderError) {
      if (
        error.code === "commander.helpDisplayed" ||
        error.code === "commander.version"
      ) {
        return 0;
      }
      return error.exitCode;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`erro: ${message}`);
    return 1;
  }
}

function projectOption(): Option {
  return new Option("--project <caminho>", "raiz do projeto consumidor").default(
    process.cwd(),
  );
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

async function openTui(project: string): Promise<void> {
  const reader = createInterface({ input: stdin, output: stdout });
  const shouldExit = await offerStartupUpdate(
    VERSION,
    (prompt) => reader.question(prompt),
  );
  reader.close();
  if (shouldExit) return;
  const { SpecsfyTui } = await import("./tui.js");
  await new SpecsfyTui(project).run();
}

async function runProgress(options: ProjectOptions & {
  json?: boolean;
  watch?: boolean;
  interval?: number;
}): Promise<void> {
  const configured = await loadConfig(options.project);
  const interval = options.interval ?? configured.watch_interval;
  if (!Number.isFinite(interval) || interval <= 0) {
    throw new Error("interval deve ser maior que zero");
  }
  let previous = "";
  while (true) {
    const fingerprint = await specsFingerprint(options.project);
    if (fingerprint !== previous) {
      const specs = await scanSpecs(options.project);
      printProgress(specs, Boolean(options.json));
      previous = fingerprint;
      if (!options.watch) {
        if (!specs.length) process.exitCode = 2;
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));
  }
}

function printProgress(
  specs: Awaited<ReturnType<typeof scanSpecs>>,
  json: boolean,
): void {
  const summary = summarizeSpecs(specs);
  if (json) {
    console.log(
      JSON.stringify({
        summary,
        specs: specs.map(serializeSpec),
      }),
    );
    return;
  }
  console.log(
    `Resumo\t${summary.total_specs} specs\t` +
      `${summary.completed_tasks}/${summary.total_tasks} tarefas\t` +
      `${summary.completed_items}/${summary.total_items} itens\t` +
      `${summary.percent}%`,
  );
  for (const spec of specs) {
    console.log(
      `${spec.slug}\t${spec.status}\t` +
        `${spec.completed_tasks}/${spec.total_tasks} tarefas\t` +
        `${spec.completed_items}/${spec.total_items} itens\t${spec.percent}%`,
    );
  }
}

function printCatalog(
  entries: Catalog["entries"],
  json: boolean,
): void {
  if (json) {
    console.log(
      JSON.stringify(
        entries.map(({ name, description, category, tags, requires }) => ({
          name,
          description,
          category,
          tags,
          requires,
        })),
      ),
    );
    return;
  }
  for (const entry of entries) {
    console.log(`${entry.name}\t${entry.description}`);
  }
}

function printConfig(
  config: Awaited<ReturnType<typeof loadConfig>>,
  json: boolean,
): void {
  if (json) console.log(JSON.stringify(config));
  else {
    console.log(`project\t${config.project}`);
    console.log(`watch_interval\t${config.watch_interval}`);
  }
}

function printPaths(paths: string[]): void {
  for (const path of paths) console.log(path);
}

function printInstallation(paths: string[], json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ changed: paths.length, paths }));
  } else if (paths.length) {
    printPaths(paths);
  } else {
    console.log("skills já estão atualizadas");
  }
}

async function updateSkills(
  options: ProjectOptions & { force?: boolean; json?: boolean },
): Promise<void> {
  const checks = await checkPrerequisites(options.project);
  assertPrerequisites(checks, ["node", "git", "skills", "project"]);
  const installer = await SkillInstaller.create(options.project, options.force);
  printInstallation(await installer.updateAll(), Boolean(options.json));
}

function printPrerequisites(checks: PrerequisiteCheck[], json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ ok: checks.every(({ ok }) => ok), checks }));
    return;
  }
  for (const check of checks) {
    console.log(`${check.ok ? "OK" : "FALHA"}\t${check.name}\t${check.detail}`);
  }
}

function printUpgrade(
  result: { upgraded: boolean; current_version: string; latest_version?: string },
  json: boolean,
): void {
  if (json) console.log(JSON.stringify(result));
  else if (result.upgraded) {
    console.log(
      `Specsfy CLI atualizado: ${result.current_version} → ${result.latest_version}.`,
    );
  } else {
    console.log(`Specsfy CLI já está atualizado em ${result.current_version}.`);
  }
}

function printTransition(
  transition: Awaited<ReturnType<typeof transitionSpec>>,
  handoff: Awaited<ReturnType<typeof clickUpfyHandoff>>,
  json: boolean,
): void {
  if (json) console.log(JSON.stringify({ ...transition, clickupfy: handoff }));
  else {
    console.log(
      `${transition.identifier}\t${transition.from} → ${transition.to}\t${transition.status}`,
    );
    printClickUpfyHandoff(handoff);
  }
}

function printClickUpfyHandoff(handoff: Awaited<ReturnType<typeof clickUpfyHandoff>>): void {
  if (handoff.available && handoff.task_id) {
    console.log(`ClickUpfy\tencaminhar ${handoff.action} para a tarefa ${handoff.task_id}`);
  }
}
