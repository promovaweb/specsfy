/**
 * Repository stub. Copy to src/db/<resource>.ts (for example
 * src/db/notes.ts) and adjust the imports.
 *
 * A repository is the only place with SQL for its table. Commands, MCP
 * tools and TUI screens call these functions, so the three modes read and
 * write the same way. Functions receive the open Database, which keeps
 * them testable with `openDatabase(":memory:")`.
 *
 * Rules: prepared statements with named parameters, never string
 * concatenation of values; rows mapped to camelCase objects; a missing row
 * raises NOT_FOUND (6) with the id in the message.
 */
import type { Database } from "bun:sqlite";
import { AppError } from "../../src/app/errors.ts";
import { ExitCode } from "../../src/app/exit-codes.ts";

export interface Note {
  id: number;
  title: string;
  body: string;
  createdAt: string;
}

interface NoteRow { id: number; title: string; body: string; created_at: string }

const toNote = (row: NoteRow): Note => ({ id: row.id, title: row.title, body: row.body, createdAt: row.created_at });

/** Lists notes, newest first, up to `limit`. */
export function listNotes(db: Database, limit = 50): Note[] {
  return db.query<NoteRow, { limit: number }>("SELECT id, title, body, created_at FROM notes ORDER BY created_at DESC, id DESC LIMIT $limit")
    .all({ limit }).map(toNote);
}

/** Inserts a note and returns it with its id. */
export function addNote(db: Database, input: { title: string; body?: string }, now = new Date()): Note {
  const row = db.query<NoteRow, { title: string; body: string; createdAt: string }>(
    "INSERT INTO notes (title, body, created_at) VALUES ($title, $body, $createdAt) RETURNING id, title, body, created_at",
  ).get({ title: input.title, body: input.body ?? "", createdAt: now.toISOString() });
  return toNote(row!);
}

/** Returns one note or raises NOT_FOUND. */
export function getNote(db: Database, id: number): Note {
  const row = db.query<NoteRow, { id: number }>("SELECT id, title, body, created_at FROM notes WHERE id = $id").get({ id });
  if (!row) throw new AppError(ExitCode.NOT_FOUND, `Note ${id} not found.`);
  return toNote(row);
}

/** Removes a note or raises NOT_FOUND. */
export function removeNote(db: Database, id: number): void {
  const { changes } = db.query<never, { id: number }>("DELETE FROM notes WHERE id = $id").run({ id });
  if (changes === 0) throw new AppError(ExitCode.NOT_FOUND, `Note ${id} not found.`);
}
