/** Utilitários compartilhados pelas suítes do CLI. */
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function temporaryDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "specsfy-node-test-"));
}
