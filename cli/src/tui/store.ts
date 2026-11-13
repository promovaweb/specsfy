/**
 * Live project state shared by the TUI screens.
 *
 * The store loads the project overview and the installed skills once, then
 * checks the files every `tui.watchInterval` seconds by fingerprint (specs,
 * backlog, inbox and `skills-lock.json`). It reloads only when the
 * fingerprint changes, so an idle project costs a few `stat` and hash calls
 * per tick. Checks never overlap, and a reload started after `stop` never
 * notifies anyone. Screens subscribe and redraw only the parts that change.
 */
import { getPath, readSettings } from "../config/settings.ts";
import type { ProjectOverview } from "../core/overview.ts";
import type { TuiServices } from "./services.ts";

/** One loaded picture of the project. */
export interface ProjectSnapshot {
  overview: ProjectOverview;
  installed: Set<string>;
  /** Message when `skills-lock.json` could not be read. */
  lockError?: string;
  loadedAt: Date;
}

/** Load state seen by the screens. */
export type StoreState =
  | { status: "loading" }
  | { status: "ready"; snapshot: ProjectSnapshot }
  | { status: "error"; message: string; snapshot?: ProjectSnapshot };

/** Reads `tui.watchInterval` in seconds; invalid values fall back to 0.75. */
export function watchIntervalSeconds(): number {
  try {
    const value = getPath(readSettings(), "tui.watchInterval");
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.max(0.2, value);
  } catch {
    // Without readable settings, use the default.
  }
  return 0.75;
}

/** Message of an unknown error, without stack. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Store of one project, owned by one TUI instance. */
export interface ProjectStore {
  readonly project: string;
  readonly services: TuiServices;
  state(): StoreState;
  /** Calls `listener` on every change and returns the unsubscribe function. */
  subscribe(listener: (state: StoreState) => void): () => void;
  /** Loads now and starts the polling. Idempotent. */
  start(): void;
  /** Stops the polling and discards pending loads. Idempotent. */
  stop(): void;
  /** Reloads now, regardless of the fingerprint. */
  reload(): Promise<void>;
  /** Checks the fingerprint and reloads when it changed. */
  check(): Promise<void>;
}

/** Creates the store; nothing is read until `start`, which also reads `tui.watchInterval` when no interval is given. */
export function createProjectStore(project: string, services: TuiServices, intervalSeconds?: number): ProjectStore {
  let current: StoreState = { status: "loading" };
  let fingerprint: string | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let generation = 0;
  let running = false;
  let checking = false;
  const listeners = new Set<(state: StoreState) => void>();

  const publish = (state: StoreState) => {
    current = state;
    for (const listener of [...listeners]) listener(state);
  };

  const reload = async () => {
    const mine = ++generation;
    try {
      const nextFingerprint = await services.fingerprint(project);
      const overview = await services.overview(project);
      let installed = new Set<string>();
      let lockError: string | undefined;
      try {
        installed = await services.installedSkills(project);
      } catch (error) {
        lockError = errorMessage(error);
      }
      if (mine !== generation || !running) return;
      fingerprint = nextFingerprint;
      publish({ status: "ready", snapshot: { overview, installed, lockError, loadedAt: new Date() } });
    } catch (error) {
      if (mine !== generation || !running) return;
      const snapshot = current.status === "loading" ? undefined : current.snapshot;
      publish({ status: "error", message: errorMessage(error), snapshot });
    }
  };

  const check = async () => {
    if (!running || checking) return;
    checking = true;
    try {
      const next = await services.fingerprint(project);
      if (running && next !== fingerprint) await reload();
    } catch {
      // A transient read error keeps the last snapshot; the next tick retries.
    } finally {
      checking = false;
    }
  };

  return {
    project,
    services,
    state: () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      if (running) return;
      running = true;
      void reload();
      timer = setInterval(() => void check(), (intervalSeconds ?? watchIntervalSeconds()) * 1000);
    },
    stop() {
      running = false;
      generation += 1;
      if (timer) clearInterval(timer);
      timer = undefined;
    },
    reload: async () => {
      if (running) await reload();
    },
    check,
  };
}
