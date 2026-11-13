/** Testa concorrência e cancelamento sem rede, relógio ou renderer nativo. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createLatestTask, type TaskState } from "./latest-task.ts";

/** Promise controlada pelo teste para ordenar respostas sem sleeps. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test("resposta antiga não substitui a consulta mais recente", async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const states: TaskState<string>[] = [];
  const signals: AbortSignal[] = [];
  const requests = [first, second];
  const task = createLatestTask((signal) => {
    signals.push(signal);
    return requests.shift()!.promise;
  }, (state) => states.push(state));
  task.activate();
  const a = task.run();
  const b = task.run();
  assert.equal(signals[0]!.aborted, true);
  second.resolve("new"); await b;
  first.resolve("old"); await a;
  assert.deepEqual(states.filter((state) => state.status === "ready"),
    [{ status: "ready", value: "new" }]);
});

test("sair invalida a resposta e permite reentrada", async () => {
  const pending = deferred<string>();
  const states: TaskState<string>[] = [];
  let calls = 0;
  const task = createLatestTask(() => {
    calls += 1;
    return calls === 1 ? pending.promise : Promise.resolve("returned");
  }, (state) => states.push(state));
  task.activate(); const request = task.run();
  task.stop(); task.stop();
  pending.resolve("late"); await request;
  await task.run(); assert.equal(calls, 1);
  assert.deepEqual(states, [{ status: "loading" }]);
  task.activate(); await task.run();
  assert.deepEqual(states.at(-1), { status: "ready", value: "returned" });
});

test("erro não vaza a mensagem do serviço e permite nova tentativa", async () => {
  const states: TaskState<string>[] = [];
  let calls = 0;
  const task = createLatestTask(async () => {
    if (++calls === 1) throw new Error("private upstream response");
    return "";
  }, (state) => states.push(state));
  task.activate(); await task.run();
  assert.deepEqual(states.at(-1), { status: "error" });
  await task.run();
  assert.deepEqual(states.at(-1), { status: "ready", value: "" });
});

test("rejeição depois de cancelar não publica erro", async () => {
  const pending = deferred<string>();
  const states: TaskState<string>[] = [];
  const task = createLatestTask(() => pending.promise, (state) => states.push(state));
  task.activate(); const request = task.run(); task.stop();
  pending.reject(new Error("cancelled")); await request;
  assert.deepEqual(states, [{ status: "loading" }]);
});
