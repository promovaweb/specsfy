#!/usr/bin/env bun
/**
 * Binary entry point.
 *
 * Dispatch rule:
 *
 * 1. no arguments and an interactive terminal → open the TUI;
 * 2. no arguments and no TTY → print help and exit with code 2, so pipes
 *    and agents do not hang waiting for an interface;
 * 3. with arguments → CLI (including `mcp`, which becomes a stdio server).
 *
 * The process always ends through `process.exit` with a code from
 * `app/exit-codes.ts`, after stdout and stderr are flushed.
 */
import { runCli } from "./cli/index.ts";
import { ExitCode } from "./app/exit-codes.ts";

const argv = process.argv.slice(2);

process.on("SIGINT", () => {
  process.exit(ExitCode.INTERRUPTED);
});

const noArguments = argv.length === 0;
const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

const code = noArguments && interactive ? await runCli(["tui"]) : await runCli(noArguments ? ["--help"] : argv);

/**
 * Waits until everything written to a stream reached the OS. Without it,
 * `process.exit` cuts large outputs (`--opencli`, `--skill`, big `--json`)
 * at the pipe buffer size when stdout is a pipe.
 */
function flush(stream: NodeJS.WriteStream): Promise<void> {
  return new Promise((resolve) => {
    if (stream.destroyed || !stream.writable) return resolve();
    stream.write("", () => resolve());
  });
}

await Promise.all([flush(process.stdout), flush(process.stderr)]);
process.exit(noArguments && !interactive ? ExitCode.USAGE : code);
