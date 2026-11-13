/**
 * Test stub for the database layer. Copy to tests/<resource>.test.ts and
 * adjust the imports. The file name here does not end in `.test.ts`, so
 * `bun test` skips the stub itself.
 *
 * Each test opens its own `:memory:` database: migrations run from zero,
 * nothing touches `~/.<bin>/`, and tests stay independent.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Database } from "bun:sqlite";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";
import { migrate, migrationStatus, openDatabase } from "./database.ts";
import { checkMigrations, migrations } from "./migrations/index.ts";
import { addNote, getNote, listNotes, removeNote } from "./repository.ts";

describe("notes repository", () => {
  let db: Database;
  beforeEach(() => { db = openDatabase(":memory:"); });
  afterEach(() => db.close());

  test("migrations set user_version and are idempotent", () => {
    expect((db.query("PRAGMA user_version").get() as { user_version: number }).user_version).toBe(migrations.at(-1)!.version);
    expect(migrate(db)).toBe(migrations.at(-1)!.version);
  });

  test("status reports pending migrations before they are applied", () => {
    const fresh = openDatabase(":memory:", { apply: false });
    try {
      expect(migrationStatus(fresh)).toEqual({ current: 0, latest: migrations.length, pending: migrations.map(({ version, name }) => ({ version, name })) });
      migrate(fresh);
      expect(migrationStatus(fresh).pending).toEqual([]);
    } finally { fresh.close(); }
  });

  test("the registry refuses gaps and blank SQL", () => {
    expect(() => checkMigrations([{ version: 2, name: "gap", up: "SELECT 1" }])).toThrow();
    expect(() => checkMigrations([{ version: 1, name: "blank", up: " " }])).toThrow();
  });

  test("adds, lists, reads and removes", () => {
    const note = addNote(db, { title: "First" }, new Date("2026-11-10T12:00:00.000Z"));
    expect(listNotes(db)).toEqual([note]);
    expect(getNote(db, note.id).title).toBe("First");
    removeNote(db, note.id);
    expect(listNotes(db)).toEqual([]);
  });

  test("a missing row raises NOT_FOUND", () => {
    try { getNote(db, 99); throw new Error("expected AppError"); } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe(ExitCode.NOT_FOUND);
    }
  });

  test("a database with a schema is copied before new migrations", () => {
    const dir = mkdtempSync(join(tmpdir(), "db-backup-"));
    try {
      const file = join(dir, "data.db");
      openDatabase(file).close();
      const next = [...migrations, { version: migrations.length + 1, name: "add_notes_pinned", up: "ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0" }];
      openDatabase(file, { list: next }).close();
      expect(existsSync(`${file}.v${migrations.length}.bak`)).toBe(true);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });

  test("a database newer than the binary is refused", () => {
    db.run("PRAGMA user_version = 999");
    expect(() => migrate(db)).toThrow(AppError);
  });
});
