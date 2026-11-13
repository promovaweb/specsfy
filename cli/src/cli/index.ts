/**
 * CLI execution.
 *
 * `runCli(argv)` parses the arguments, handles the global options
 * (`--help`, `--version`, `--skill`, `--opencli`), runs the command and
 * returns the exit code. Printing follows the convention: text for people,
 * `--json` for machines, with a stable envelope on success and on error.
 */
import { AppError } from "../app/errors.ts";
import { manifest } from "../app/manifest.ts";
import { ExitCode, exitCodeName } from "../app/exit-codes.ts";
import { readSettings, getPath } from "../config/settings.ts";
import { skillText } from "../skill/index.ts";
import { renderHelp } from "./help.ts";
import { root } from "./commands.ts";
import { color, forceColors } from "./format.ts";
import { generateOpenCli } from "./opencli.ts";
import { writeSync } from "node:fs";
import { parse } from "./parser.ts";
import type { Context, Result } from "./registry.ts";

/**
 * Writes the whole text to a file descriptor synchronously. Asynchronous
 * stream writes are cut at the pipe buffer when the process exits right
 * after a large output (`--opencli`, `--skill`, big `--json`). EAGAIN on a
 * non-blocking pipe is retried until every byte is written.
 */
function writeAll(fd: number, text: string): void {
  const buffer = Buffer.from(text.endsWith("\n") ? text : `${text}\n`);
  let offset = 0;
  while (offset < buffer.length) {
    try {
      offset += writeSync(fd, buffer, offset, buffer.length - offset);
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code;
      // The reader closed the pipe (`| head`): the rest of the output has no destination.
      if (code === "EPIPE") return;
      if (code !== "EAGAIN") throw e;
      Bun.sleepSync(1);
    }
  }
}

const write = (text: string) => {
  if (text.length) writeAll(1, text);
};
const writeError = (text: string) => {
  if (text.length) writeAll(2, text);
};

function prefersJson(): boolean {
  try {
    return getPath(readSettings(), "output.format") === "json";
  } catch {
    return false;
  }
}

/**
 * Prints the JSON result envelope. `ok` follows the exit code, so a gate
 * that fails (code 10) returns `ok: false` with its findings in `data`.
 */
export function printJson(command: string, data: unknown, code: ExitCode = ExitCode.SUCCESS): void {
  write(JSON.stringify({ ok: code === ExitCode.SUCCESS, command, ...(code === ExitCode.SUCCESS ? {} : { code }), data }, null, 2));
}

/** Prints the JSON error envelope. */
export function printErrorJson(command: string, e: AppError): void {
  write(JSON.stringify({ ok: false, command, error: e.toJSON() }, null, 2));
}

/** Runs the CLI and returns the exit code without exiting the process. */
export async function runCli(argv: readonly string[]): Promise<number> {
  let json = argv.includes("--json") || prefersJson();
  let commandName = manifest.bin;

  try {
    const parsed = parse(root, argv);
    const { command, path, args, options } = parsed;
    commandName = [manifest.bin, ...path].join(" ");
    json = options.json === true || (options.json === undefined && prefersJson());
    if (options["no-color"] === true) forceColors(false);

    if (options.version === true) {
      if (json) printJson(commandName, { bin: manifest.bin, version: manifest.version });
      else write(`${manifest.bin} ${manifest.version}`);
      return ExitCode.SUCCESS;
    }

    if (options.opencli === true) {
      write(JSON.stringify(generateOpenCli(root), null, 2));
      return ExitCode.SUCCESS;
    }

    if (options.skill !== undefined) {
      const topic = typeof options.skill === "string" ? options.skill : undefined;
      const text = skillText(root, topic);
      if (json) printJson(commandName, { topic: topic ?? "all", markdown: text });
      else write(text);
      return ExitCode.SUCCESS;
    }

    if (options.help === true || !command.run) {
      const help = renderHelp(root, path, command);
      if (json) printJson(commandName, { help: help.replace(/\u001b\[[0-9;]*m/g, "") });
      else write(help);
      return options.help === true ? ExitCode.SUCCESS : ExitCode.USAGE;
    }

    const ctx: Context = {
      args,
      options,
      json,
      path,
      stdout: write,
      stderr: writeError,
      interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    };

    const result: Result = await command.run(ctx);
    if (json) printJson(commandName, result.data, result.code ?? ExitCode.SUCCESS);
    else write(typeof result.text === "function" ? result.text() : result.text);
    return result.code ?? ExitCode.SUCCESS;
  } catch (e) {
    const appError = e instanceof AppError ? e : new AppError(ExitCode.GENERIC_ERROR, e instanceof Error ? e.message : String(e));
    if (json) {
      printErrorJson(commandName, appError);
    } else {
      writeError(`${color.error("error")} ${appError.message} ${color.dim(`[${appError.code} ${exitCodeName(appError.code)}]`)}`);
      if (appError.code === ExitCode.USAGE) writeError(color.dim(`Use "${commandName} --help".`));
    }
    return appError.code;
  }
}
