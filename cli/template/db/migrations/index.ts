/**
 * Migration registry stub. Copy to src/db/migrations/index.ts.
 *
 * The schema of the database changes only through this list. Versions
 * start at 1 and grow by one, in file order; `openDatabase()` applies the
 * pending ones in a transaction each and records the version in
 * `PRAGMA user_version`. `checkMigrations()` runs at import time, so a gap
 * or a repeated version fails every test and every start.
 *
 * Migrations are embedded in the binary: every file is imported statically
 * here, so `bun build --compile` carries the SQL. Never read migrations
 * from disk at runtime or build the list with a dynamic import; the
 * compiled binary runs where the repository does not exist.
 */
import { createNotes } from "./0001-create-notes.ts";

export interface Migration {
  /** Sequential version, equal to the file number. */
  version: number;
  /** snake_case summary: the file name after the number, with underscores. */
  name: string;
  /** SQL that moves the schema from version - 1 to version. */
  up: string;
}

/** Refuses gaps, repeats and blank SQL. Returns the list unchanged. */
export function checkMigrations(list: readonly Migration[]): readonly Migration[] {
  list.forEach((migration, index) => {
    if (migration.version !== index + 1) throw new Error(`Migration ${migration.name} has version ${migration.version}; expected ${index + 1}.`);
    if (!migration.up.trim()) throw new Error(`Migration ${migration.name} has no SQL.`);
  });
  return list;
}

export const migrations: readonly Migration[] = checkMigrations([createNotes]);
