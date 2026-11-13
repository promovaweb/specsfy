/**
 * Autenticação compartilhada para chamadas à API do GitHub.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Monta os headers oficiais e inclui token quando disponível. */
export async function apiHeaders(
  userAgent: string,
  accept = "application/vnd.github+json",
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": userAgent,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = await githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Resolve a credencial sem persistir nem imprimir seu valor. */
export async function githubToken(): Promise<string | undefined> {
  for (const variable of ["GH_TOKEN", "GITHUB_TOKEN"] as const) {
    const value = process.env[variable]?.trim();
    if (value) return value;
  }
  try {
    const result = await execFileAsync("gh", ["auth", "token"], {
      encoding: "utf8",
    });
    return result.stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}
