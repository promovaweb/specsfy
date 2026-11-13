/**
 * Checks that the embedded documentation covers the code.
 *
 * Every command path of the registry must appear in docs/cli.md, every
 * screen id in docs/tui.md, every MCP tool, resource and prompt name in
 * docs/mcp.md, every settings key in docs/configuration.md and every exit
 * code name in docs/exit-codes.md. The check reads the Markdown as text and
 * looks for the name inside backticks or as a table cell, so prose can keep
 * its own wording. Exits with 1 on the first missing group.
 */
import { readFileSync } from "node:fs";
import { root } from "../src/cli/commands.ts";
import { exitCodeDescriptions } from "../src/app/exit-codes.ts";
import { SETTINGS_SCHEMA } from "../src/config/settings.ts";
import { describeServer } from "../src/mcp/server.ts";
import { screens } from "../src/tui/screens/index.ts";
import type { Command } from "../src/cli/registry.ts";
import { manifest } from "../src/app/manifest.ts";

const errors: string[] = [];

function read(file: string): string {
  try {
    // Resolve the placeholders the way the binary does, so `{{bin}}://about` matches `termfy://about`.
    return readFileSync(file, "utf8")
      .replaceAll("{{bin}}", manifest.bin)
      .replaceAll("{{title}}", manifest.title)
      .replaceAll("{{version}}", manifest.version)
      .replaceAll("{{BIN}}", manifest.envPrefix);
  } catch {
    errors.push(`${file} missing`);
    return "";
  }
}

function mentions(text: string, name: string): boolean {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Accept the name inside backticks, as a table cell or as a standalone word.
  return new RegExp(`(\`[^\`]*${escaped}[^\`]*\`|\\|\\s*${escaped}\\s*\\||(^|\\W)${escaped}(\\W|$))`, "m").test(text);
}

function commandPaths(command: Command, prefix: string[] = []): string[] {
  const paths: string[] = [];
  for (const sub of command.subcommands ?? []) {
    if (sub.hidden) continue;
    const path = [...prefix, sub.name];
    paths.push(path.join(" "));
    paths.push(...commandPaths(sub, path));
  }
  return paths;
}

const cli = read("docs/cli.md");
for (const path of commandPaths(root)) {
  const parts = path.split(" ");
  // A subcommand counts as documented when its parent table lists it with a pipe list (`config list|get`).
  const direct = mentions(cli, path);
  const grouped = parts.length === 2 && new RegExp(`${parts[0]}[^\\n]*${parts[1]}`).test(cli);
  if (!direct && !grouped) errors.push(`docs/cli.md does not mention command "${path}"`);
}

const tui = read("docs/tui.md");
for (const screen of screens) {
  if (!mentions(tui, screen.id) && !mentions(tui, screen.title)) errors.push(`docs/tui.md does not mention screen "${screen.id}"`);
}

const mcp = read("docs/mcp.md");
const catalog = describeServer();
for (const tool of catalog.tools) if (!mentions(mcp, tool.name)) errors.push(`docs/mcp.md does not mention tool "${tool.name}"`);
for (const resource of catalog.resources) if (!mentions(mcp, resource.uri.replace(/\{[^}]+\}/g, "{topic}"))) errors.push(`docs/mcp.md does not mention resource "${resource.uri}"`);
for (const prompt of catalog.prompts) if (!mentions(mcp, prompt.name)) errors.push(`docs/mcp.md does not mention prompt "${prompt.name}"`);

const configuration = read("docs/configuration.md");
for (const setting of SETTINGS_SCHEMA) {
  if (!mentions(configuration, setting.key)) errors.push(`docs/configuration.md does not mention key "${setting.key}"`);
}

const exitCodes = read("docs/exit-codes.md");
for (const code of exitCodeDescriptions) {
  if (!mentions(exitCodes, code.name)) errors.push(`docs/exit-codes.md does not mention exit code "${code.name}"`);
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log("✓ docs/ covers every command, screen, tool, resource, prompt, setting and exit code");
