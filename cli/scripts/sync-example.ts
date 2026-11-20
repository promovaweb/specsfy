/**
 * Brings the installed skills of `../example/` to the working tree.
 *
 * `example/` is a consumer project kept in the monorepo. This script runs
 * the same reconciliation as `specsfy update --force`, but from the local
 * `skills/` and `specialists/` folders instead of a clone, so a change to a
 * skill or to `skills/inventory.json` reaches the example before it is
 * committed.
 *
 * Usage:
 *
 *   bun run example:sync
 */
import { join, relative, resolve } from "node:path";
import { SkillInstaller } from "../src/domain/installer.ts";

const root = resolve(import.meta.dir, "..", "..");
const project = join(root, "example");
const installer = await SkillInstaller.create(project, true, { agents: "universal" });
const { plan, changed } = await installer.reconcileFromCheckout(root);
for (const path of changed) console.log(relative(project, path));
for (const { name, reason } of plan.kept) console.log(`kept ${name}: ${reason}`);
console.log(`✓ example/ matches the inventory: ${changed.length} path(s) changed`);
