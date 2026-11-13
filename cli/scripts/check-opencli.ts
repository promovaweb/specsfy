/**
 * Checks that docs/opencli.json matches the command registry.
 * Exits with 1 when the file is missing or different, so `bun run validate`
 * reminds you to run `bun run opencli`.
 */
import { readFileSync } from "node:fs";
import { generateOpenCli } from "../src/cli/opencli.ts";
import { root } from "../src/cli/commands.ts";

const expected = `${JSON.stringify(generateOpenCli(root), null, 2)}\n`;
let current = "";
try {
  current = readFileSync("docs/opencli.json", "utf8");
} catch {
  console.error("docs/opencli.json does not exist. Run: bun run opencli");
  process.exit(1);
}
if (current !== expected) {
  console.error("docs/opencli.json is out of date. Run: bun run opencli");
  process.exit(1);
}
console.log("✓ docs/opencli.json matches the command registry");
