/**
 * Binary manifest.
 *
 * Single source of identity for the executable: command name, title,
 * version, description, author and links. Help text, the About tab, the MCP
 * server and the OpenCLI description all read from here. When this
 * repository is used as a template, `bun run init -- --name <bin>` rewrites
 * the `termfy` block and the `name`, `bin` and `description` fields of
 * package.json.
 *
 * package.json is read at build time: Bun embeds the JSON in the compiled
 * binary, so the manifest stays valid outside the repository.
 */
import pkg from "../../package.json" with { type: "json" };

/** Static identity of the executable. */
export interface Manifest {
  /** Executable name, used for `~/.<bin>/`, env prefix and MCP URIs. */
  readonly bin: string;
  /** Human-readable name for titles and headers. */
  readonly title: string;
  /** SemVer version from package.json. */
  readonly version: string;
  /** One-line description of what the binary does. */
  readonly description: string;
  /** Person or organization responsible. */
  readonly author: string;
  /** Website. */
  readonly site: string;
  /** Git repository URL. */
  readonly repository: string;
  /** License declared in package.json. */
  readonly license: string;
  /** Environment variable prefix, derived from `bin` in upper case. */
  readonly envPrefix: string;
}

interface TermfyBlock {
  bin?: string;
  title?: string;
  author?: string;
  site?: string;
  repository?: string;
}

const block: TermfyBlock = (pkg as { termfy?: TermfyBlock }).termfy ?? {};
const bin = block.bin ?? pkg.name;

export const manifest: Manifest = Object.freeze({
  bin,
  title: block.title ?? bin,
  version: pkg.version,
  description: pkg.description,
  author: block.author ?? "",
  site: block.site ?? "",
  repository: block.repository ?? "",
  license: pkg.license ?? "UNLICENSED",
  envPrefix: bin.replace(/[^a-z0-9]/gi, "_").toUpperCase(),
});

/** Credits shown in the About tab and by the `about` command. */
export const credits: ReadonlyArray<{ name: string; role: string; url: string }> = Object.freeze([
  { name: "Bun", role: "runtime, bundler and binary compiler", url: "https://bun.sh" },
  { name: "OpenTUI", role: "terminal user interface rendering", url: "https://opentui.com" },
  { name: "MCP TypeScript SDK", role: "Model Context Protocol server over stdio", url: "https://modelcontextprotocol.io" },
  { name: "OpenCLI", role: "standard description of the command-line interface", url: "https://opencli.org" },
  { name: "Zod", role: "schema validation for MCP tools", url: "https://zod.dev" },
]);
