/** Checks that the project store reloads only when the fingerprint changes. */
import { expect, test } from "bun:test";
import { createProjectStore, type StoreState } from "../../src/tui/store.ts";
import { EXAMPLE, fakeServices } from "./helpers.ts";

test("reloads on fingerprint change only, and stops cleanly", async () => {
  let fingerprint = "a";
  let loads = 0;
  const real = fakeServices();
  const services = fakeServices({
    fingerprint: async () => fingerprint,
    overview: async (project) => { loads += 1; return real.overview(project); },
  });
  const store = createProjectStore(EXAMPLE, services, 3600);
  const states: StoreState["status"][] = [];
  store.subscribe((state) => states.push(state.status));
  expect(store.state().status).toBe("loading");
  store.start();
  while (store.state().status === "loading") await Bun.sleep(10);
  expect(loads).toBe(1);
  await store.check();
  expect(loads).toBe(1);
  fingerprint = "b";
  await store.check();
  expect(loads).toBe(2);
  const state = store.state();
  expect(state.status === "ready" && state.snapshot.overview.specs.length).toBe(6);
  expect(state.status === "ready" && state.snapshot.installed.has("specsfy-01-inbox")).toBe(true);
  store.stop();
  fingerprint = "c";
  await store.check();
  expect(loads).toBe(2);
  expect(states).toEqual(["ready", "ready"]);
});

test("a failing load shows an error and keeps the last snapshot", async () => {
  let fail = false;
  const real = fakeServices();
  let fingerprint = 0;
  const services = fakeServices({
    fingerprint: async () => String(fingerprint),
    overview: async (project) => { if (fail) throw new Error("disk gone"); return real.overview(project); },
  });
  const store = createProjectStore(EXAMPLE, services, 3600);
  store.start();
  while (store.state().status === "loading") await Bun.sleep(10);
  fail = true;
  fingerprint = 1;
  await store.check();
  const state = store.state();
  expect(state.status).toBe("error");
  expect(state.status === "error" && state.message).toBe("disk gone");
  expect(state.status === "error" && state.snapshot?.overview.specs.length).toBe(6);
  store.stop();
});
