/** Coordena consultas e descarta respostas antigas, mesmo sem suporte ao abort. */
export type TaskState<T> =
  | { status: "loading" }
  | { status: "ready"; value: T }
  | { status: "error" };

/**
 * Cria um controlador sem dependência do renderer.
 * activate permite executar; stop cancela e invalida a geração atual.
 * Somente a execução mais recente pode notificar a tela ativa.
 */
export function createLatestTask<T>(
  load: (signal: AbortSignal) => Promise<T>,
  notify: (state: TaskState<T>) => void,
) {
  let generation = 0;
  let active = false;
  let controller: AbortController | undefined;
  return {
    activate() { active = true; },
    stop() {
      active = false;
      generation += 1;
      controller?.abort();
      controller = undefined;
    },
    async run(): Promise<void> {
      if (!active) return;
      const current = ++generation;
      controller?.abort();
      const request = new AbortController();
      controller = request;
      notify({ status: "loading" });
      try {
        const value = await load(request.signal);
        if (active && current === generation && !request.signal.aborted) {
          notify({ status: "ready", value });
        }
      } catch {
        if (active && current === generation && !request.signal.aborted) {
          notify({ status: "error" });
        }
      } finally {
        if (current === generation) controller = undefined;
      }
    },
  };
}
