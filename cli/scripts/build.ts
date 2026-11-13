/**
 * Compiles the binary with `bun build --compile`.
 *
 * Without arguments, produces `dist/<bin>` for the current platform. With
 * `--all`, produces one executable per supported target, named
 * `dist/<bin>-<target>`.
 *
 * OpenTUI loads a native package per platform (`@opentui/core-<os>-<cpu>`,
 * plus `-musl` variants on Linux) with dynamic imports, and the bundler
 * tries to resolve every one of them. A plain `bun install` only installs
 * the package of the current machine, so the packages that are not
 * installed are passed as `--external`: each is loaded only on its own
 * platform, never on the one being built. Cross builds need the target's
 * package; install them all from the lockfile with
 * `bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"`.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { manifest } from "../src/app/manifest.ts";

const targets = [
  { target: "bun-linux-x64", suffix: "linux-x64", native: "@opentui/core-linux-x64" },
  { target: "bun-linux-arm64", suffix: "linux-arm64", native: "@opentui/core-linux-arm64" },
  { target: "bun-darwin-x64", suffix: "darwin-x64", native: "@opentui/core-darwin-x64" },
  { target: "bun-darwin-arm64", suffix: "darwin-arm64", native: "@opentui/core-darwin-arm64" },
  { target: "bun-windows-x64", suffix: "windows-x64", native: "@opentui/core-win32-x64" },
] as const;

const installed = (name: string) => existsSync(join("node_modules", name, "package.json"));

/** Native OpenTUI packages declared by @opentui/core and absent from node_modules. */
function missingNativePackages(): string[] {
  const pkg = JSON.parse(readFileSync(join("node_modules", "@opentui", "core", "package.json"), "utf8")) as { optionalDependencies?: Record<string, string> };
  return Object.keys(pkg.optionalDependencies ?? {}).filter((name) => !installed(name));
}

const all = process.argv.includes("--all");
mkdirSync("dist", { recursive: true });
const externals = missingNativePackages();

async function compile(outfile: string, target?: string): Promise<void> {
  const args = ["build", "src/main.ts", "--compile", "--minify", `--outfile=${outfile}`, ...externals.map((name) => `--external=${name}`)];
  if (target) args.push(`--target=${target}`);
  const proc = Bun.spawn(["bun", ...args], { stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`Failed to compile ${outfile} (exit code ${code}).`);
  console.log(`✓ ${outfile}`);
}

if (all) {
  const absent = targets.filter(({ native }) => !installed(native)).map(({ native }) => native);
  if (absent.length) {
    console.error(`✗ Missing native packages for cross builds: ${absent.join(", ")}.`);
    console.error('  Install them from the lockfile: bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"');
    process.exit(1);
  }
  for (const { target, suffix } of targets) {
    const ext = suffix.startsWith("windows") ? ".exe" : "";
    await compile(`dist/${manifest.bin}-${suffix}${ext}`, target);
  }
} else {
  await compile(`dist/${manifest.bin}`);
}
