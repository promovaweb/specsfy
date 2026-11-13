/**
 * Runs scripts/init.ts on a copy of the template files and checks that the
 * binary identity changes while framework references keep the Termfy name.
 */
import { afterAll, beforeAll, expect, test } from "bun:test";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "termfy-init-"));
  for (const file of ["package.json", "README.md", "AGENTS.md", "CHANGELOG.md", ".env.example"]) cpSync(join(root, file), join(dir, file));
  mkdirSync(join(dir, "scripts"));
  cpSync(join(root, "scripts/init.ts"), join(dir, "scripts/init.ts"));
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

test("init renames the binary and keeps framework references", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (pkg.termfy?.bin !== "termfy") return; // Only the template itself starts as termfy.
  const run = Bun.spawnSync(["bun", "scripts/init.ts", "--name", "notes", "--title", "Notes"], { cwd: dir });
  expect(run.exitCode).toBe(0);

  const next = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  expect(next.version).toBe("0.1.0");
  expect(next.termfy.bin).toBe("notes");
  expect(next.termfy.repository).toBe("");
  expect(next.repository).toBeUndefined();
  expect(next.termfy.starterKit).toBe(pkg.version);

  const agents = readFileSync(join(dir, "AGENTS.md"), "utf8");
  expect(agents).toContain("binário `notes`");
  expect(agents).toContain("`termfy-spec`");
  expect(agents).toContain(".agents/skills/termfy-*");
  expect(agents).toContain("promovaweb/termfy");
  expect(agents).not.toMatch(/notes-(spec|init|clispec)|promovaweb\/notes/);

  const readme = readFileSync(join(dir, "README.md"), "utf8");
  expect(readme.split("\n")[0]).toBe("# Notes");
  expect(readme).toContain("`notes about`");

  const changelog = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
  expect(changelog).toContain("## [0.1.0]");
  expect(changelog).not.toContain("0.9.");

  // A later rename without --title keeps the title and the recorded kit version.
  const rename = Bun.spawnSync(["bun", "scripts/init.ts", "--name", "shopnotes"], { cwd: dir });
  expect(rename.exitCode).toBe(0);
  const renamed = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  expect(renamed.termfy.title).toBe("Notes");
  expect(renamed.termfy.starterKit).toBe(pkg.version);
});
