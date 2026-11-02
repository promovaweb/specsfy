/**
 * Regressão visual e interativa da TUI.
 *
 * A suíte usa um screen real do neo-blessed, mas sem depender de um terminal
 * físico. O buffer de células permite conferir a interface completa depois
 * de cada tecla ou clique.
 */

import blessed from "neo-blessed";
import { mkdir, writeFile } from "node:fs/promises";
import { PassThrough } from "node:stream";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { Catalog } from "../src/catalog.js";
import {
  BASE_DESCRIPTIONS,
  buildSkillOptions,
  filterSkillOptions,
  formatBacklogPreview,
  formatSkillDetail,
  formatTestRun,
  progressBar,
  skillPlanLabel,
  SpecsfyTui,
  TUI_BINDINGS,
  TUI_THEME,
  TUI_TABS,
} from "../src/tui.js";
import { temporaryDirectory } from "./helpers.js";

const screens: blessed.Widgets.Screen[] = [];

afterEach(() => {
  for (const screen of screens.splice(0)) {
    if (!screen.destroyed) screen.destroy();
  }
});

describe("contrato herdado da TUI Python", () => {
  test("mantém contraste mínimo nos pares semânticos da interface", () => {
    expect(
      contrastRatio(TUI_THEME.text, TUI_THEME.background),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrastRatio(TUI_THEME.textMuted, TUI_THEME.background),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrastRatio(TUI_THEME.textMuted, TUI_THEME.surface),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrastRatio(TUI_THEME.border, TUI_THEME.background),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(TUI_THEME.selectedText, TUI_THEME.selectedBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(TUI_THEME.focusText, TUI_THEME.focusBackground),
    ).toBeGreaterThanOrEqual(7);
    expect(
      contrastRatio(TUI_THEME.primaryText, TUI_THEME.primaryBackground),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(TUI_THEME.accent, TUI_THEME.background),
    ).toBeGreaterThanOrEqual(7);
  });

  test("mantém as seis áreas na mesma ordem", () => {
    expect(TUI_TABS).toEqual([
      { id: "home", label: "Home", key: "C-h" },
      { id: "backlogs", label: "Backlogs", key: "C-g" },
      { id: "specs", label: "Specs", key: "C-s" },
      { id: "tests", label: "Testes", key: "C-j" },
      { id: "skills", label: "Skills", key: "C-k" },
      { id: "about", label: "Sobre", key: "C-o" },
    ]);
  });

  test("expõe atalhos globais que o terminal Node consegue distinguir", () => {
    expect(TUI_BINDINGS).toEqual({
      "C-q": "Sair",
      escape: "Voltar",
      "C-u": "Atualizar",
      "C-b": "Framework",
      "C-d": "Detectar",
      "C-e": "Alternar",
      space: "Abrir/alternar",
      "C-a": "Aplicar",
      "C-r": "Atualizar skills",
      "C-v": "Marcar",
      "C-l": "Limpar",
      "C-t": "Todas",
      "C-n": "Instaladas",
      "C-c": "Recomendadas",
      "C-h": "Home",
      "C-g": "Backlogs",
      "C-s": "Specs",
      "C-j": "Testes",
      "C-x": "Executar testes",
      "C-k": "Skills",
      "C-o": "Sobre",
    });
    expect(BASE_DESCRIPTIONS).toHaveProperty("specsfy-update-spec");
  });

  test("gera barras determinísticas inclusive nos limites", () => {
    expect(progressBar(0)).toBe("░░░░░░░░░░");
    expect(progressBar(50)).toBe("█████░░░░░");
    expect(progressBar(100, 16)).toBe("████████████████");
  });

  test("preserva quebras de linha de metainformação no preview do backlog", () => {
    expect(formatBacklogPreview("**ID**: B-1\nTexto")).toBe(
      "**ID**: B-1  \nTexto",
    );
    expect(formatBacklogPreview("**ID**: B-1  ")).toBe("**ID**: B-1  ");
  });
});

describe("catálogo de skills", () => {
  const installed = new Set([
    "specsfy-02-backlog",
    "specsfy-specialist-legado",
    "external-skill",
  ]);
  const catalog = [
    {
      name: "specsfy-specialist-react",
      description: "Componentes React.",
      category: "frontend",
      tags: ["react"],
      files: [],
      dependencies: ["react"],
      requires: [],
    },
  ];

  test("monta framework, catálogo e instalação fora do catálogo", () => {
    const options = buildSkillOptions(catalog, installed);
    expect(options).toHaveLength(21);
    expect(
      options.find((option) => option.name === "external-skill"),
    ).toBeUndefined();
    expect(
      options.find((option) => option.name === "specsfy-specialist-legado"),
    ).toMatchObject({ kind: "instalada", installed: true });
  });

  test.each([
    ["all", "", 21],
    ["installed", "", 2],
    ["detected", "", 1],
    ["all", "react", 1],
    ["all", "FRONTEND", 1],
    ["all", "não existe", 0],
  ] as const)("filtra por %s e busca %j", (filter, query, total) => {
    const options = buildSkillOptions(catalog, installed);
    expect(
      filterSkillOptions(
        options,
        filter,
        query,
        installed,
        new Set(["specsfy-specialist-react"]),
      ),
    ).toHaveLength(total);
  });

  test("expõe o plano antes de executar qualquer alteração", () => {
    const selected = new Set(["specsfy-02-backlog", "nova"]);
    expect(skillPlanLabel("specsfy-02-backlog", installed, selected)).toBe(
      "Manter",
    );
    expect(skillPlanLabel("nova", installed, selected)).toBe("Instalar");
    expect(
      skillPlanLabel("specsfy-specialist-legado", installed, selected),
    ).toBe("Remover");
    expect(skillPlanLabel("ignorar", installed, selected)).toBe("Ignorar");
  });

  test("detalha plano, estado, categoria, descrição e ID", () => {
    const option = buildSkillOptions(catalog, installed).find(
      (item) => item.name === "specsfy-specialist-react",
    );
    expect(
      formatSkillDetail(
        option!,
        installed,
        new Set(["specsfy-specialist-react"]),
        new Set(["specsfy-specialist-react"]),
      ),
    ).toContain(
      "React\nPlano: Instalar · Estado: Não instalada · Recomendada\n" +
        "Categoria: Frontend\nComponentes React.\n\nID: specsfy-specialist-react",
    );
  });
});

describe("resultado de testes", () => {
  test.each([
    [0, "PASSOU"],
    [1, "FALHOU"],
  ])("formata exit code %i como %s", (exitCode, state) => {
    expect(
      formatTestRun({
        command: {
          label: "Vitest",
          display: "npm test",
          argv: ["npm", "test"],
          cwd: "/tmp/projeto",
        },
        exit_code: exitCode,
        duration_seconds: 1.25,
        summary_lines: ["10 testes"],
        output_lines: [],
      }),
    ).toBe(
      `${state}\n\nRunner: Vitest\nComando: npm test\nProjeto: /tmp/projeto\n` +
        "Duração: 1.25s\nExit code: " +
        `${exitCode}\n\n10 testes`,
    );
  });
});

describe("renderização e interação em terminal real", () => {
  test.each([
    [80, 24],
    [129, 44],
    [160, 50],
  ])("renderiza o Home sem perder regiões em %ix%i", async (columns, rows) => {
    const { tui, screen } = await mountedTui(columns, rows);
    const output = screenText(screen);
    expect(tui.activeTab).toBe("home");
    expect(output).toContain("Specsfy");
    expect(output).toContain("Dashboard de specs e skills");
    expect(output).toContain("Home");
    expect(output).toContain("Backlogs");
    expect(output).toContain("Specs");
    expect(output).toContain("Testes");
    expect(output).toContain("Skills");
    expect(output).toContain("Sobre");
    expect(output).toContain("Tarefas · 0");
    expect(output).toContain("Itens de tarefa");
    expect(output).toContain("Outros checkboxes: 0");
    expect(output.match(/pendentes/gu)).toHaveLength(2);
    expect(output).toContain("atualização automática");
    expect(output).toContain("Tab/Shift+Tab");
  });

  test("navega por todas as abas e destaca apenas a aba ativa", async () => {
    const { tui, screen } = await mountedTui();
    const shortcuts = [
      ["g", "backlogs", "Backlogs · 1"],
      ["s", "specs", "0001-login"],
      ["j", "tests", "Executar testes"],
      ["k", "skills", "Buscar por nome"],
      ["o", "about", "Specsfy CLI"],
      ["h", "home", "Outros checkboxes"],
    ] as const;
    for (const [key, tab, text] of shortcuts) {
      press(screen, key, true);
      expect(tui.activeTab).toBe(tab);
      expect(screenText(screen)).toContain(text);
      expect(activeTabCount(screen)).toBe(1);
    }
  });

  test("interpreta bytes reais dos atalhos que o terminal normaliza", async () => {
    const { tui, screen, input } = await mountedTui();
    input.write(Buffer.from([0x0a]));
    await settle();
    expect(tui.activeTab).toBe("tests");
    expect(screenText(screen)).toContain("Executar testes");

    input.write(Buffer.from([0x08]));
    await settle();
    expect(tui.activeTab).toBe("home");
  });

  test("filtra e marca skills com bytes reais e distintos de Tab e Enter", async () => {
    const { screen, input } = await mountedTui();
    input.write(Buffer.from([0x0b]));
    await settle();
    expect(screenText(screen)).toContain("21 visível(is)");

    input.write(Buffer.from([0x0e]));
    await settle();
    expect(screenText(screen)).toContain("2 visível(is)");

    input.write(Buffer.from([0x16]));
    await settle();
    expect(screenText(screen)).toContain(
      "2 selecionada(s) · 2 visível(is) · 0 para instalar · 0 para remover",
    );
  });

  test("abre e fecha a spec sem abandonar a aba Specs", async () => {
    const { tui, screen } = await mountedTui();
    press(screen, "s", true);
    press(screen, "space");
    expect(screenText(screen)).toContain("Esc: voltar para a lista de specs");
    press(screen, "escape");
    expect(tui.activeTab).toBe("specs");
    expect(screenText(screen)).not.toContain(
      "Esc: voltar para a lista de specs",
    );
  });

  test("atualiza o preview ao navegar pelos backlogs", async () => {
    const { screen } = await mountedTui();
    press(screen, "g", true);
    expect(screenText(screen)).toContain("BACKLOG-0001 · Ready");
    expect(screenText(screen)).toContain("Primeiro backlog");
  });

  test("busca em Skills sem duplicar widgets e Escape limpa a busca", async () => {
    const { tui, screen } = await mountedTui();
    press(screen, "k", true);
    const before = descendantCount(screen);
    const search = findWidgetByLabel(screen, "Buscar por nome");
    search.setValue("react");
    search.emit("submit", "react");
    expect(descendantCount(screen)).toBeLessThanOrEqual(before);
    expect(
      descendants(screen).filter((child) =>
        String(
          (
            child as blessed.Widgets.BlessedElement & {
              options?: { label?: string };
            }
          ).options?.label ?? "",
        ).includes("Buscar por nome"),
      ),
    ).toHaveLength(1);
    expect(screenText(screen)).toContain("React");
    press(screen, "escape");
    expect(tui.activeTab).toBe("skills");
    expect(screenText(screen)).toContain("21 visível(is)");
  });

  test("responde ao clique nas abas e nos controles de Skills", async () => {
    const { tui, screen } = await mountedTui();
    findWidgetByContent(screen, "Skills").emit("press");
    expect(tui.activeTab).toBe("skills");
    findWidgetByContent(screen, "Instaladas  ^N").emit("press");
    expect(screenText(screen)).toContain("2 visível(is)");
    findWidgetByContent(screen, "Todas  ^T").emit("press");
    expect(screenText(screen)).toContain("21 visível(is)");
  });

  test("refresh preserva seleção de skills ainda não aplicada", async () => {
    const { screen } = await mountedTui();
    press(screen, "k", true);
    press(screen, "space");
    await settle();
    expect(screenText(screen)).toContain("3 selecionada(s)");
    findWidgetByContent(screen, "Atualizar  ^R").emit("press");
    await settle();
    await settle();
    expect(screenText(screen)).toContain("3 selecionada(s)");
  });

  test("fechar uma spec devolve o foco à lista e mantém a navegação", async () => {
    const { screen, tui } = await mountedTui();
    press(screen, "s", true);
    press(screen, "space");
    expect(screenText(screen)).toContain("Esc: voltar para a lista de specs");
    press(screen, "escape");
    expect(tui.activeTab).toBe("specs");
    expect(screen.focused?.detached).not.toBe(true);
    press(screen, "g", true);
    expect(tui.activeTab).toBe("backlogs");
  });

  test("fecha a spec pelo byte real de Escape e restaura o foco para a lista", async () => {
    const { screen, tui, input } = await mountedTui();
    press(screen, "s", true);
    press(screen, "space");
    expect(screenText(screen)).toContain("Esc: voltar para a lista de specs");

    input.write("\u001b");
    await settle();

    expect(tui.activeTab).toBe("specs");
    expect(screenText(screen)).not.toContain(
      "Esc: voltar para a lista de specs",
    );
    expect(screen.focused?.type).toBe("list");
  });

  test("mantém o foco dentro do modal e permite fechá-lo pelo controle visível", async () => {
    const { screen, tui } = await mountedTui();
    press(screen, "s", true);
    press(screen, "space");

    press(screen, "tab");
    expect(screen.focused?.getContent().trim()).toBe("Fechar  Esc");
    press(screen, "tab");
    expect(screen.focused?.type).toBe("box");

    findWidgetByContent(screen, "Fechar  Esc").emit("press");
    expect(tui.activeTab).toBe("specs");
    expect(screen.focused?.type).toBe("list");
  });

  test("alterna, limpa e marca novamente a seleção por teclado", async () => {
    const { screen } = await mountedTui();
    press(screen, "k", true);
    press(screen, "space");
    await settle();
    expect(screenText(screen)).toContain(
      "3 selecionada(s) · 21 visível(is) · 1 para instalar · 0 para remover",
    );
    press(screen, "enter");
    await settle();
    expect(screenText(screen)).toContain(
      "2 selecionada(s) · 21 visível(is) · 0 para instalar · 0 para remover",
    );
    press(screen, "l", true);
    await settle();
    expect(screenText(screen)).toContain(
      "0 selecionada(s) · 21 visível(is) · 0 para instalar · 2 para remover",
    );
    press(screen, "v", true);
    await settle();
    expect(screenText(screen)).toContain(
      "21 selecionada(s) · 21 visível(is) · 19 para instalar · 0 para remover",
    );
  });

  test("aplica os filtros pelos três atalhos globais", async () => {
    const { screen } = await mountedTui();
    press(screen, "k", true);
    press(screen, "n", true);
    expect(screenText(screen)).toContain("2 visível(is)");
    press(screen, "c", true);
    expect(screenText(screen)).toContain("0 visível(is)");
    press(screen, "t", true);
    expect(screenText(screen)).toContain("21 visível(is)");
  });

  test("mantém Resumo e Testes como subabas clicáveis", async () => {
    const { screen } = await mountedTui();
    press(screen, "j", true);
    expect(screenText(screen)).toContain("Nenhuma execução nesta sessão.");
    const testButtons = descendants(screen).filter(
      (child) =>
        child.type === "button" &&
        (child as blessed.Widgets.BlessedElement).getContent().trim() ===
          "Testes",
    );
    expect(testButtons).toHaveLength(2);
    testButtons.at(-1)?.emit("press");
    expect(screenText(screen)).toContain("┌─ Testes ");
  });

  test("apresenta a falha de detecção do runner sem encerrar a TUI", async () => {
    const { tui, screen, input } = await mountedTui();
    input.write(Buffer.from([0x18]));
    await waitFor(() =>
      screenText(screen).includes(
        "Erro ao executar testes: Pest não foi detectado",
      ),
    );
    await settle();
    await settle();
    expect(tui.activeTab).toBe("tests");
    expect(screen.destroyed).not.toBe(true);
  });

  test("Tab e Shift+Tab percorrem os controles focáveis", async () => {
    const { screen } = await mountedTui();
    const initial = screen.focused;
    press(screen, "tab");
    expect(screen.focused).not.toBe(initial);
    const afterTab = screen.focused;
    press(screen, "tab", false, true);
    expect(screen.focused).not.toBe(afterTab);
  });

  test("Ctrl+Q encerra a tela sem deixar o processo pendurado", async () => {
    const { screen } = await mountedTui();
    press(screen, "q", true);
    expect(
      (screen as blessed.Widgets.Screen & { destroyed?: boolean }).destroyed,
    ).toBe(true);
  });
});

async function mountedTui(
  columns = 129,
  rows = 44,
): Promise<{
  tui: SpecsfyTui;
  screen: blessed.Widgets.Screen;
  input: PassThrough;
}> {
  const project = await temporaryDirectory();
  await mkdir(join(project, "specs", "specs", "0001-login"), {
    recursive: true,
  });
  await mkdir(join(project, "specs", "backlog"), { recursive: true });
  await writeFile(
    join(project, "specs", "specs", "0001-login", "spec.md"),
    "# Login\n\n**Status**: Complete\n**Definition Gate**: Passed\n" +
      "**Plan Gate**: Passed\n**Delivery Gate**: Passed\n\n- [x] T1 entrega\n",
  );
  await writeFile(
    join(project, "specs", "backlog", "0001-login.md"),
    "# Backlog: Primeiro backlog\n\n**ID**: BACKLOG-0001\n**Status**: Ready\n",
  );
  await writeFile(
    join(project, "skills-lock.json"),
    JSON.stringify({
      version: 1,
      skills: {
        "specsfy-02-backlog": {},
        "specsfy-specialist-legado": {},
      },
    }),
  );
  const input = Object.assign(new PassThrough(), {
    isTTY: true,
    setRawMode: () => undefined,
  });
  const output = Object.assign(new PassThrough(), {
    isTTY: true,
    columns,
    rows,
  });
  const screen = blessed.screen({
    input,
    output,
    terminal: "xterm-256color",
    smartCSR: false,
    fullUnicode: true,
    dockBorders: true,
    width: columns,
    height: rows,
  });
  screens.push(screen);
  const catalog = new Catalog([
    {
      name: "specsfy-specialist-react",
      description: "Componentes React.",
      category: "frontend",
      tags: ["react"],
      files: [],
      dependencies: ["react"],
      requires: [],
    },
  ]);
  const tui = new SpecsfyTui(project);
  await tui.start({ screen, catalog, watch: false });
  return { tui, screen, input };
}

function screenText(screen: blessed.Widgets.Screen): string {
  const lines = (
    screen as unknown as {
      lines: Array<Array<[number, string]>>;
    }
  ).lines;
  return lines
    .map((line) =>
      line
        .map((cell) => cell[1])
        .join("")
        .trimEnd(),
    )
    .join("\n");
}

function press(
  screen: blessed.Widgets.Screen,
  name: string,
  ctrl = false,
  shift = false,
): void {
  (screen as unknown as { program: NodeJS.EventEmitter }).program.emit(
    "keypress",
    "",
    {
      name,
      ctrl,
      shift,
      meta: false,
      full: ctrl ? `C-${name}` : shift ? `S-${name}` : name,
    },
  );
}

function descendants(widget: blessed.Widgets.Node): blessed.Widgets.Node[] {
  return [
    ...widget.children,
    ...widget.children.flatMap((child) => descendants(child)),
  ];
}

function descendantCount(screen: blessed.Widgets.Screen): number {
  return descendants(screen).length;
}

function findWidgetByLabel(
  screen: blessed.Widgets.Screen,
  label: string,
): blessed.Widgets.BlessedElement {
  const widget = descendants(screen).find((child) =>
    String(
      (
        child as blessed.Widgets.BlessedElement & {
          options?: { label?: string };
        }
      ).options?.label ?? "",
    ).includes(label),
  );
  if (!widget) throw new Error(`widget com label ${label} não encontrado`);
  return widget as blessed.Widgets.BlessedElement;
}

function findWidgetByContent(
  screen: blessed.Widgets.Screen,
  content: string,
): blessed.Widgets.BlessedElement {
  const widget = descendants(screen).find(
    (child) =>
      (child as blessed.Widgets.BlessedElement).getContent?.().trim() ===
      content,
  );
  if (!widget) throw new Error(`widget com conteúdo ${content} não encontrado`);
  return widget as blessed.Widgets.BlessedElement;
}

function activeTabCount(screen: blessed.Widgets.Screen): number {
  return descendants(screen).filter((child) => {
    const element = child as blessed.Widgets.BlessedElement & {
      style?: { bg?: unknown };
    };
    return (
      element.type === "button" &&
      TUI_TABS.some(({ label }) => element.getContent().trim() === label) &&
      element.style?.bg === TUI_THEME.activeBackground
    );
  }).length;
}

/** Calcula a razão WCAG entre duas cores hexadecimais sRGB. */
function contrastRatio(foreground: string, background: string): number {
  const luminances = [foreground, background].map(relativeLuminance);
  return (Math.max(...luminances) + 0.05) / (Math.min(...luminances) + 0.05);
}

/** Converte uma cor hexadecimal sRGB em luminância relativa. */
function relativeLuminance(color: string): number {
  const channels = color
    .slice(1)
    .match(/.{2}/gu)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  if (!channels || channels.length !== 3)
    throw new Error(`Cor inválida: ${color}`);
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

async function settle(): Promise<void> {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

async function waitFor(assertion: () => boolean): Promise<void> {
  const deadline = Date.now() + 1_000;
  while (!assertion()) {
    if (Date.now() >= deadline) {
      throw new Error("a interface não atingiu o estado esperado");
    }
    await settle();
  }
}
