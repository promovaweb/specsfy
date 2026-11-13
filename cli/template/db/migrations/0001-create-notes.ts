/**
 * Migration stub. Copy to src/db/migrations/NNNN-<name>.ts, one file per
 * migration, and list it in src/db/migrations/index.ts.
 *
 * A released migration is never edited: a later change to the table is a
 * new file (ALTER TABLE, or create, copy, drop and rename). Conventions:
 * snake_case names in English, INTEGER PRIMARY KEY ids, ISO 8601 TEXT
 * timestamps, STRICT tables, no secrets (they belong to the vault).
 */
import type { Migration } from "./index.ts";

export const createNotes: Migration = {
  version: 1,
  name: "create_notes",
  up: `
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    ) STRICT;
    CREATE INDEX notes_created_at ON notes (created_at);
  `,
};
