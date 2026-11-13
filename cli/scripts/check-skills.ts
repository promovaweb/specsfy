/**
 * Checks that the Termfy framework skills are installed in the project.
 *
 * The starter kit depends on `.agents/skills/termfy-*`, installed by
 * `bun run skills:install` (which calls `npx skills add`) and recorded in
 * `skills-lock.json`. This script fails when a skill is missing or absent
 * from the lock, so `bun run validate` reminds you to reinstall. It also
 * flags termfy-* skills that the framework no longer ships, and reads the
 * "Compatibilidade" line of each SKILL.md and warns when a skill needs a
 * newer starter kit than the one the project came from (`termfy.starterKit`
 * in package.json, recorded by scripts/init.ts).
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const expected = [
  "termfy", "termfy-init", "termfy-brand", "termfy-clispec", "termfy-spec", "termfy-api-import", "termfy-config", "termfy-api", "termfy-database",
  "termfy-cli", "termfy-command-set", "termfy-mcp", "termfy-tui", "termfy-test", "termfy-review", "termfy-docs",
  "termfy-release", "termfy-mcp-client",
];
const errors: string[] = [];
const warnings: string[] = [];

let lock: { skills?: Record<string, { source?: string }> } = {};
try {
  lock = JSON.parse(readFileSync("skills-lock.json", "utf8"));
} catch {
  errors.push("skills-lock.json missing or invalid. Run: bun run skills:install");
}

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { version: string; termfy?: { bin?: string; starterKit?: string } };
// The template compares with its own version; a derived project with the
// starter kit version recorded by scripts/init.ts.
const kitVersion = pkg.termfy?.bin === "termfy" ? pkg.version : pkg.termfy?.starterKit;
const toNumber = (v: string) => v.split(".").map(Number).reduce((total, part) => total * 1000 + part, 0);

for (const name of expected) {
  const dir = join(".agents", "skills", name);
  const skillFile = join(dir, "SKILL.md");
  if (!existsSync(skillFile)) errors.push(`${dir}/SKILL.md missing`);
  if (!existsSync(join(dir, "references"))) errors.push(`${dir}/references missing`);
  if (!lock.skills?.[name]) errors.push(`${name} not recorded in skills-lock.json`);
  if (existsSync(skillFile)) {
    // Skills declare "Starter kit a partir da vX.Y.Z" in their Compatibility section.
    const match = /Starter kit a partir da v(\d+\.\d+\.\d+)/.exec(readFileSync(skillFile, "utf8"));
    if (match && kitVersion && toNumber(match[1]!) > toNumber(kitVersion)) {
      warnings.push(`${name} needs starter kit ${match[1]} or later; this project came from ${kitVersion}. Compare src/ with the starter kit before relying on the skill.`);
    }
  }
}

// A renamed or removed framework skill stays behind after `npx skills add`; flag it.
const installed = existsSync(join(".agents", "skills")) ? readdirSync(join(".agents", "skills")).filter((name) => name.startsWith("termfy")) : [];
const recorded = Object.keys(lock.skills ?? {}).filter((name) => name.startsWith("termfy"));
for (const name of new Set([...installed, ...recorded])) {
  if (!expected.includes(name)) errors.push(`${name} is no longer a Termfy skill; remove .agents/skills/${name}, .claude/skills/${name} and its skills-lock.json entry`);
}

for (const w of warnings) console.warn(`! ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error("Reinstall with: bun run skills:install");
  process.exit(1);
}
console.log(`✓ ${expected.length} Termfy skills installed (${lock.skills?.[expected[0]!]?.source ?? "unknown source"})`);
