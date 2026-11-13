/**
 * Command stub. Copy to src/cli/commands/<name>.ts, adjust the imports (they
 * point to src/ from template/) and register it in src/cli/commands.ts.
 *
 * Checklist:
 * - every option and argument has a `description`;
 * - `examples` start with the binary name;
 * - `exitCodes` lists the families the command can return;
 * - `data` is serializable and `text` is readable;
 * - secrets are read with getCredential(), never from arguments.
 */
import { manifest } from "../../src/app/manifest.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { error } from "../../src/app/errors.ts";
import { color, table } from "../../src/cli/format.ts";
import type { Command } from "../../src/cli/registry.ts";

export const exampleCommand: Command = {
  name: "example",
  description: "Describe in one line what the command does.",
  longDescription: "Optional paragraph with details, prerequisites and side effects.",
  arguments: [{ name: "target", description: "What the command processes.", required: true }],
  options: [
    { name: "--force", aliases: ["-f"], description: "Run without confirmation." },
    { name: "--limit", argument: { name: "n" }, description: "Maximum number of items.", default: "10" },
  ],
  exitCodes: [ExitCode.NOT_FOUND, ExitCode.NETWORK_OR_API],
  examples: [`${manifest.bin} example file.txt`, `${manifest.bin} example file.txt --limit 5 --json`],
  run: async (ctx) => {
    const target = ctx.args[0] as string;
    const limit = Number(ctx.options.limit ?? 10);
    if (!Number.isFinite(limit) || limit <= 0) throw error.usage("--limit must be a number greater than zero.");

    // Real work goes here. Use ctx.stderr for progress in text mode.
    const items = [target].slice(0, limit);

    return {
      data: { target, limit, items },
      text: () => table(items.map((i, n) => [`${color.dim(String(n + 1))}`, i])),
    };
  },
};
