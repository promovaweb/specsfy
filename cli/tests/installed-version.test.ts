/**
 * The installed-version watcher: a running TUI keeps its old code, so it
 * checks the files that start a new process and, after a change, asks the
 * installed command for its version. The header then says to reopen.
 */
import { describe, expect, test } from "bun:test";
import { manifest } from "../src/app/manifest.ts";
import { createInstalledVersionWatcher, runningCompiledBinary, type InstalledVersionDeps } from "../src/domain/installed-version.ts";
import { DEMO_PROJECT } from "../scripts/build-demo-project.ts";
import { mount } from "./tui/helpers.ts";

/** Fake system: mutable mtimes and installed version, with call counts. */
function fakeSystem(version = manifest.version) {
  const state = { mtime: 1, version, versionCalls: 0 };
  const deps: InstalledVersionDeps = {
    candidates: () => ["/usr/local/bin/specsfy"],
    mtime: () => state.mtime,
    version: async () => {
      state.versionCalls++;
      return state.version;
    },
  };
  return { state, deps };
}

describe("installed-version watcher", () => {
  test("asks for the version only after the file changes and reports a new one once", async () => {
    const { state, deps } = fakeSystem("0.36.2");
    const found: string[] = [];
    const watcher = createInstalledVersionWatcher("0.36.2", deps, (v) => found.push(v));
    await watcher.check();
    await watcher.check();
    expect(state.versionCalls).toBe(0);
    state.mtime = 2;
    state.version = "0.37.0";
    await watcher.check();
    expect(found).toEqual(["0.37.0"]);
    state.mtime = 3;
    await watcher.check();
    expect(found).toEqual(["0.37.0"]);
    expect(state.versionCalls).toBe(2);
  });

  test("a reinstall of the same version says nothing", async () => {
    const { state, deps } = fakeSystem("0.36.2");
    const found: string[] = [];
    const watcher = createInstalledVersionWatcher("0.36.2", deps, (v) => found.push(v));
    await watcher.check();
    state.mtime = 2;
    await watcher.check();
    expect(found).toEqual([]);
  });

  test("a failed --version is ignored", async () => {
    const { state, deps } = fakeSystem();
    deps.version = async () => undefined;
    const found: string[] = [];
    const watcher = createInstalledVersionWatcher(manifest.version, deps, (v) => found.push(v));
    await watcher.check();
    state.mtime = 2;
    await watcher.check();
    expect(found).toEqual([]);
  });

  test("bun itself is not the compiled binary", () => {
    expect(runningCompiledBinary("/home/me/.bun/bin/bun")).toBe(false);
    expect(runningCompiledBinary("/usr/local/bin/specsfy")).toBe(true);
  });
});

describe("TUI header", () => {
  test("shows the reopen notice after a newer specsfy is installed", async () => {
    const { state, deps } = fakeSystem();
    const tui = await mount({ project: DEMO_PROJECT, width: 160, height: 34, installedVersion: deps, installedVersionInterval: 30 });
    await tui.waitFor("0001-catalogo-de-produtos");
    expect(tui.frame()).not.toContain("installed: press q");
    state.mtime = 2;
    state.version = "9.9.9";
    const frame = await tui.waitFor("v9.9.9 installed: press q and reopen");
    expect(frame.split("\n")[0]).toContain("v9.9.9 installed");
    await tui.close();
  });
});
