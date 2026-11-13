/**
 * Database command stub. Copy to src/cli/commands/db.ts, adjust the
 * imports and register `dbCommand` in src/cli/commands.ts. Only for
 * binaries that have a database.
 *
 * `db status` reports the schema version and the pending migrations
 * without applying them; `db migrate` applies them. Every other command
 * that opens the database applies pending migrations on its own, so
 * `db migrate` is for people and scripts that want to do it explicitly.
 */
import { ExitCode } from "../../src/app/exit-codes.ts";
import { manifest } from "../../src/app/manifest.ts";
import { blocks, table } from "../../src/cli/format.ts";
import type { Command } from "../../src/cli/registry.ts";
import { databasePath, migrate, migrationStatus, openDatabase } from "./database.ts";

const status: Command = {
  name: "status",
  description: "Show the database file, schema version and pending migrations.",
  examples: [`${manifest.bin} db status`, `${manifest.bin} db status --json`],
  exitCodes: [ExitCode.CONFIG, ExitCode.PERMISSION],
  run: () => {
    const file = databasePath();
    const db = openDatabase(file, { apply: false });
    try {
      const data = { file, ...migrationStatus(db) };
      return {
        data,
        text: () => blocks(
          table([["File", file], ["Version", `${data.current} of ${data.latest}`], ["Pending", String(data.pending.length)]]),
          data.pending.map((migration) => `  - ${migration.version} ${migration.name}`).join("\n") || undefined,
        ),
      };
    } finally { db.close(); }
  },
};

const migrateCommand: Command = {
  name: "migrate",
  description: "Apply the pending migrations to the database.",
  examples: [`${manifest.bin} db migrate`],
  exitCodes: [ExitCode.CONFIG, ExitCode.PERMISSION],
  run: () => {
    const file = databasePath();
    const db = openDatabase(file, { apply: false });
    try {
      const before = migrationStatus(db);
      const version = migrate(db);
      const data = { file, from: before.current, to: version, applied: before.pending };
      return { data, text: () => before.pending.length ? `Applied ${before.pending.length} migration(s); schema at version ${version}.` : `Schema already at version ${version}.` };
    } finally { db.close(); }
  },
};

export const dbCommand: Command = {
  name: "db",
  description: "Inspect and migrate the local SQLite database.",
  subcommands: [status, migrateCommand],
  exitCodes: [ExitCode.CONFIG, ExitCode.PERMISSION],
};
