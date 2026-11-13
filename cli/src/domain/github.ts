/**
 * Shared authentication for GitHub API calls.
 *
 * The token is looked up in this order and never printed or persisted:
 * the vault credential `github.token`, the `GH_TOKEN` and `GITHUB_TOKEN`
 * variables, then `gh auth token`. A missing credential or an unreadable
 * vault counts as "no token" so public requests keep working.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getCredential } from "../config/credentials.ts";

const execFileAsync = promisify(execFile);

/** Name of the vault credential holding the GitHub token. */
export const GITHUB_TOKEN_CREDENTIAL = "github.token";

/** Where a GitHub token came from, without its value. */
export type GithubTokenSource = "vault" | "GH_TOKEN" | "GITHUB_TOKEN" | "gh";

/** Builds the official headers and adds the token when one is available. */
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

/** Reads the vault credential; absence or an unreadable vault yields undefined. */
function vaultToken(): string | undefined {
  try {
    return getCredential(GITHUB_TOKEN_CREDENTIAL).trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolves the token and its source without exposing the value to logs.
 * Returns undefined when no source provides one.
 */
export async function resolveGithubToken(): Promise<{ token: string; source: GithubTokenSource } | undefined> {
  const fromVault = vaultToken();
  if (fromVault) return { token: fromVault, source: "vault" };
  for (const variable of ["GH_TOKEN", "GITHUB_TOKEN"] as const) {
    const value = process.env[variable]?.trim();
    if (value) return { token: value, source: variable };
  }
  try {
    const result = await execFileAsync("gh", ["auth", "token"], { encoding: "utf8" });
    const token = result.stdout.trim();
    return token ? { token, source: "gh" } : undefined;
  } catch {
    return undefined;
  }
}

/** Resolves the credential without persisting or printing its value. */
export async function githubToken(): Promise<string | undefined> {
  return (await resolveGithubToken())?.token;
}
