/**
 * SQLite database stub. Copy to src/db/database.ts and adjust the imports
 * (`../../src/` becomes `../`).
 *
 * The binary keeps its data in `~/.<bin>/data.db`, next to settings.json
 * and the vault, so `<BIN>_HOME` redirects it in tests and CI. `bun:sqlite`
 * ships with Bun: no dependency enters package.json and the compiled
 * binary carries the driver.
 *
 * Rules: open through `openDatabase()` only; foreign keys on; WAL journal;
 * schema changes only through migrations (see migrations/index.ts); errors
 * become AppError with CONFIG or PERMISSION, never a raw SQLite stack.
 */
import { Database } from "bun:sqlite";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { AppError, classifyFsError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { ensureBaseDir } from "../../src/config/paths.ts";
import { migrations, type Migration } from "./migrations/index.ts";

/** Path of the database file inside the data directory. */
export function databasePath(): string {
  return join(ensureBaseDir(), "data.db");
}

/**
 * Copies the database to `<file>.v<version>.bak` with `VACUUM INTO`, which
 * gives a consistent copy even in WAL mode. Returns the backup path, or
 * `undefined` for in-memory databases.
 */
export function backupDatabase(db: Database, version: number): string | undefined {
  const file = db.filename;
  if (!file || file === ":memory:") return undefined;
  const target = `${file}.v${version}.bak`;
  rmSync(target, { force: true });
  db.run(`VACUUM INTO '${target.replaceAll("'", "''")}'`);
  return target;
}

/**
 * Applies pending migrations in order, each in its own transaction, and
 * records the version in `PRAGMA user_version`. A database newer than the
 * binary is refused, so an old binary never writes over a newer schema.
 * Migrations have no rollback: before changing a database that already
 * has a schema, the current file is copied to `data.db.v<version>.bak`.
 */
export function migrate(db: Database, list: readonly Migration[] = migrations): number {
  const current = (db.query("PRAGMA user_version").get() as { user_version: number }).user_version;
  const latest = list.at(-1)?.version ?? 0;
  if (current > latest) throw new AppError(ExitCode.CONFIG, `Database schema ${current} is newer than this binary (${latest}). Update the binary.`);
  if (current > 0 && current < latest) backupDatabase(db, current);
  for (const migration of list) {
    if (migration.version <= current) continue;
    db.transaction(() => {
      db.run(migration.up);
      db.run(`PRAGMA user_version = ${migration.version}`);
    })();
  }
  return latest;
}

/** Current schema version, latest known version and pending migrations. */
export function migrationStatus(db: Database, list: readonly Migration[] = migrations) {
  const current = (db.query("PRAGMA user_version").get() as { user_version: number }).user_version;
  const latest = list.at(-1)?.version ?? 0;
  const pending = list.filter((migration) => migration.version > current).map(({ version, name }) => ({ version, name }));
  return { current, latest, pending };
}

/**
 * Opens the database (`:memory:` in tests), turns on foreign keys and WAL
 * and, unless `apply` is false, applies the pending migrations. `db status`
 * opens with `apply: false` to report them. Close it with `db.close()`.
 */
export function openDatabase(path: string = databasePath(), { list = migrations, apply = true }: { list?: readonly Migration[]; apply?: boolean } = {}): Database {
  let db: Database | undefined;
  try {
    db = new Database(path, { create: true, strict: true });
    db.run("PRAGMA foreign_keys = ON");
    if (path !== ":memory:") db.run("PRAGMA journal_mode = WAL");
    if (apply) migrate(db, list);
    return db;
  } catch (e) {
    db?.close();
    if (e instanceof AppError) throw e;
    throw classifyFsError(e, ExitCode.CONFIG, `Could not open the database at ${path}`);
  }
}
