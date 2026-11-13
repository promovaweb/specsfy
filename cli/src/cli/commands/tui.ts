/**
 * `tui` command: opens the terminal interface explicitly.
 * Without arguments the binary already opens the TUI; this command exists
 * for scripts and to allow `--tab` and `--project` regardless of the
 * configuration. The project is resolved before the terminal is taken, so
 * a missing `--project` directory fails with NOT_FOUND like other commands.
 */
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { projectOption } from "../../engine/script-command.ts";
import { resolveProject } from "../../core/project.ts";
import type { Command } from "../registry.ts";

/** Tab ids accepted by `--tab`; same list as `tui.initialTab` and `SCREEN_IDS`. */
const TABS = ["overview", "specs", "backlog", "gates", "tests", "skills", "about"];

export const tuiCommand: Command = {
  name: "tui",
  description: "Open the terminal interface (Overview, Specs, Backlog, Gates, Tests, Skills and About). Requires a TTY.",
  options: [
    {
      name: "--tab",
      argument: { name: "tab", values: TABS },
      description: "Initial tab. Overrides tui.initialTab from settings.json.",
    },
    projectOption,
  ],
  exitCodes: [ExitCode.NO_TTY, ExitCode.NOT_FOUND],
  interactive: true,
  examples: [`${manifest.bin}`, `${manifest.bin} tui --tab specs`, `${manifest.bin} tui --project ../app`],
  run: async (ctx) => {
    const project = resolveProject(ctx.options.project);
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw error.noTty(`The TUI needs an interactive terminal. Use "${manifest.bin} --help" for the commands.`);
    }
    const { startTui } = await import("../../tui/index.ts");
    const tab = typeof ctx.options.tab === "string" ? ctx.options.tab : undefined;
    await startTui({ initialTab: tab, project });
    return { data: { closed: true }, text: "" };
  },
};
