/**
 * Root of the command registry.
 *
 * Imports each command from `commands/` and builds the tree. Groups that
 * several specs extend (`specs`, `inbox`, `backlog`, `skills`) are built
 * from arrays exported by the file of each spec, so one spec never edits
 * another spec's file. A group with no subcommands is left out. The order
 * defines the display order in `--help` and in the OpenCLI description.
 */
import { manifest } from "../app/manifest.ts";
import { aboutCommand } from "./commands/about.ts";
import { configCommand } from "./commands/config.ts";
import { credentialsCommand } from "./commands/credentials.ts";
import { mcpCommand } from "./commands/mcp.ts";
import { createSkillCommand } from "./commands/skill.ts";
import { tuiCommand } from "./commands/tui.ts";
import { doctorCommand } from "./commands/doctor.ts";
import { createCompletionCommand } from "./commands/completion.ts";
import {
  backlogReadCommands,
  inboxReadCommands,
  progressCommand,
  scriptsCommand,
  specsReadCommands,
  statusCommand,
} from "./commands/project.ts";
import { backlogWriteCommands, inboxWriteCommands, specsWriteCommands, tasksCommands } from "./commands/lifecycle.ts";
import { gateCommands, gateTopLevelCommands } from "./commands/gates.ts";
import { contextCommands } from "./commands/context.ts";
import { testingTopLevelCommands } from "./commands/testing.ts";
import { milestonesCommands } from "./commands/milestones.ts";
import { projectDocsCommands } from "./commands/project-docs.ts";
import { frameworkTopLevelCommands, skillsCommands } from "./commands/framework.ts";
import type { Command } from "./registry.ts";

/** Group command, or nothing when no spec contributed subcommands. */
function group(name: string, description: string, subcommands: readonly Command[]): Command[] {
  return subcommands.length ? [{ name, description, subcommands }] : [];
}

export const root: Command = {
  name: manifest.bin,
  description: manifest.description,
  subcommands: [
    tuiCommand,
    statusCommand,
    ...group("specs", "Read and change specs: list, show, create, transition, effort.", [...specsReadCommands, ...specsWriteCommands]),
    ...group("tasks", "Next task and checklist items of a spec.", tasksCommands),
    ...group("inbox", "Captures in specs/inbox/: list, capture and process.", [...inboxReadCommands, ...inboxWriteCommands]),
    ...group("backlog", "Backlog items in specs/backlog/.", [...backlogReadCommands, ...backlogWriteCommands]),
    progressCommand,
    ...group("gate", "Run one Specsfy gate on a spec. Exit code 10 means the gate found problems.", gateCommands),
    ...gateTopLevelCommands,
    ...testingTopLevelCommands,
    ...group("context", "Project context files: setup, stack, rules, database, interface.", contextCommands),
    ...group("milestones", "Milestones of the project.", milestonesCommands),
    ...group("docs", "Project documentation generated from the specs.", projectDocsCommands),
    ...frameworkTopLevelCommands,
    ...group("skills", "Specsfy skills of the project: list, detect, install, remove, update.", skillsCommands),
    scriptsCommand,
    aboutCommand,
    configCommand,
    credentialsCommand,
    mcpCommand,
    createSkillCommand(() => root),
    doctorCommand,
    createCompletionCommand(() => root),
  ],
  examples: [
    `${manifest.bin}`,
    `${manifest.bin} status`,
    `${manifest.bin} specs list --json`,
    `${manifest.bin} progress --watch`,
    `${manifest.bin} mcp`,
    `${manifest.bin} --skill`,
  ],
};
