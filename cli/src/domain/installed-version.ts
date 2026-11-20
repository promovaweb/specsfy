/**
 * Notices that a newer specsfy was installed while a long-lived process
 * (the TUI) keeps running the old one.
 *
 * A running process never reloads its own code. The watcher looks at the
 * modification time of the files that would start a new process: the
 * executable in use and the first `specsfy` on the PATH (for the npm
 * wrapper this is the wrapper script, which npm rewrites on upgrade). Only
 * when one of them changes does it ask the installed command for its
 * version, so the check costs a few `stat` calls most of the time. Running
 * the wrapper's `--version` also downloads the new binary, so reopening is
 * instant.
 */
import { spawn } from "node:child_process";
import { statSync } from "node:fs";
import { basename, delimiter, join } from "node:path";

/** What the watcher needs from the system; tests replace it. */
export interface InstalledVersionDeps {
  /** Files whose change means a new install, in priority order. */
  candidates(): string[];
  /** Modification time in ms, or undefined when the file is missing. */
  mtime(path: string): number | undefined;
  /** Version printed by `<command> --version`, or undefined on failure. */
  version(command: string): Promise<string | undefined>;
}

/** First `specsfy` executable on the PATH, if any. */
export function specsfyOnPath(env: NodeJS.ProcessEnv = process.env): string | undefined {
  const names = process.platform === "win32" ? ["specsfy.cmd", "specsfy.exe", "specsfy"] : ["specsfy"];
  for (const dir of (env.PATH ?? "").split(delimiter).filter(Boolean)) {
    for (const name of names) {
      const path = join(dir, name);
      try {
        if (statSync(path).isFile()) return path;
      } catch {
        // Not in this directory.
      }
    }
  }
  return undefined;
}

/** True when this process is a compiled specsfy binary, not `bun src/...`. */
export function runningCompiledBinary(execPath: string = process.execPath): boolean {
  return !/^bun(\.exe)?$/iu.test(basename(execPath));
}

/** Real system access: stat, PATH lookup and a short `--version` run. */
export function systemInstalledVersionDeps(): InstalledVersionDeps {
  return {
    candidates: () => [process.execPath, specsfyOnPath()].filter((path): path is string => Boolean(path)),
    mtime: (path) => {
      try {
        return statSync(path).mtimeMs;
      } catch {
        return undefined;
      }
    },
    version: (command) => new Promise((resolve) => {
      const child = spawn(command, ["--version"], { stdio: ["ignore", "pipe", "ignore"], env: { ...process.env, NO_COLOR: "1" } });
      let out = "";
      const timer = setTimeout(() => { child.kill(); resolve(undefined); }, 120_000);
      child.stdout.on("data", (chunk) => { out += String(chunk); });
      child.on("error", () => { clearTimeout(timer); resolve(undefined); });
      child.on("close", () => {
        clearTimeout(timer);
        resolve(/(\d+\.\d+\.\d+(?:-[\w.]+)?)/u.exec(out)?.[1]);
      });
    }),
  };
}

/**
 * Creates a watcher for the version `current`. The first `check` records
 * the modification times; later checks ask for the installed version only
 * after a change, and call `onNewer` once per new version found.
 */
export function createInstalledVersionWatcher(current: string, deps: InstalledVersionDeps, onNewer: (version: string) => void) {
  let baseline: Map<string, number | undefined> | undefined;
  let reported = current;
  let running = false;
  return {
    async check(): Promise<void> {
      if (running) return;
      running = true;
      try {
        const files = deps.candidates();
        const now = new Map(files.map((file) => [file, deps.mtime(file)]));
        if (!baseline) {
          baseline = now;
          return;
        }
        const changed = files.filter((file) => now.get(file) !== baseline!.get(file));
        baseline = now;
        if (!changed.length) return;
        // Ask the command a new process would start: the one on the PATH
        // when there is one, else the executable in use.
        const command = files[files.length - 1]!;
        const installed = await deps.version(command);
        if (installed && installed !== reported) {
          reported = installed;
          if (installed !== current) onNewer(installed);
        }
      } finally {
        running = false;
      }
    },
  };
}
