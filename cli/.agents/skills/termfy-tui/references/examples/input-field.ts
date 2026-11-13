/** Componente editável; o host precisa integrar foco e modo de edição. */
import { InputRenderable, InputRenderableEvents, type CliRenderer } from "@opentui/core";
import type { Theme } from "../../src/tui/theme.ts";

/**
 * Monta um campo de nome com validação local e callbacks explícitos.
 * Não instala atalhos globais. dispose remove listeners, sem destruir o host.
 */
export function createNameField(
  renderer: CliRenderer,
  theme: Theme,
  onSubmit: (value: string) => void,
  onError: (message: string) => void,
) {
  const input = new InputRenderable(renderer, {
    id: "name-field", width: "100%", placeholder: "Service name",
    backgroundColor: theme.surface, focusedBackgroundColor: theme.surfaceHigh,
    textColor: theme.text, cursorColor: theme.accent,
  });
  const submit = () => {
    const value = input.value.trim();
    if (!value) { onError("Enter a service name."); return; }
    onError("");
    onSubmit(value);
  };
  input.on(InputRenderableEvents.ENTER, submit);
  return {
    input,
    focus: () => input.focus(),
    blur: () => input.blur(),
    dispose: () => input.off(InputRenderableEvents.ENTER, submit),
  };
}
