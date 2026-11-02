/**
 * Dashboard terminal do Specsfy.
 *
 * Mantém as seis áreas públicas, navegação por teclado e mouse, polling dos
 * arquivos do projeto e confirmação explícita antes de alterar skills.
 */

import blessed from "neo-blessed";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import {
  backlogsFingerprint,
  type BacklogItem,
  scanBacklogs,
} from "./backlog.js";
import { Catalog, type CatalogEntryValue } from "./catalog.js";
import { loadConfig } from "./config.js";
import { resolvePath } from "./filesystem.js";
import {
  AUXILIARY_SKILLS,
  DOCUMENTATION_SKILLS,
  FRAMEWORK_SKILLS,
  SkillInstaller,
} from "./installer.js";
import {
  type SpecProgress,
  scanSpecs,
  specsFingerprint,
  summarizeSpecs,
} from "./progress.js";
import { runProjectTests, type TestRun } from "./project-testing.js";
import { ensureSkillsLock, skillsLockFingerprint } from "./skill-lock.js";
import { VERSION } from "./version.js";

marked.use(
  markedTerminal({
    reflowText: true,
    width: Math.max(40, Math.min(process.stdout.columns ?? 80, 120)),
    showSectionPrefix: false,
  }),
);

/** Descrições do framework exibidas quando o catálogo remoto não as fornece. */
export const BASE_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "specsfy-01-inbox": "Captura e pré-processa entradas sem fazer perguntas.",
  "specsfy-02-backlog":
    "Refina entradas, reduz ambiguidades e prioriza o backlog.",
  "specsfy-03-specify": "Criação e evolução da especificação normativa.",
  "specsfy-04-validate": "Revisão de qualidade, riscos e gates.",
  "specsfy-05-tasks": "Decomposição rastreável do trabalho.",
  "specsfy-06-tdd-bdd": "BDD, TDD e rastreabilidade dos requisitos.",
  "specsfy-07-implement": "Execução disciplinada e evidências da entrega.",
  "specsfy-update-spec": "Atualiza pedidos tardios e reabre os gates afetados.",
  "specsfy-progress": "Leitura e acompanhamento do progresso.",
  "specsfy-setup": "Prepara e reconcilia o contexto persistente do projeto.",
  "specsfy-aux-stack": "Mapeia e mantém o stack técnico observado.",
  "specsfy-aux-rules":
    "Ajuda a registrar regras explícitas sem apagar as atuais.",
  "specsfy-aux-database": "Mantém o mapa tabular completo da persistência.",
  "specsfy-documentator":
    "Reconstrói a documentação técnica completa do sistema.",
};

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  base: "Essenciais",
  auxiliary: "Auxiliares",
  documentation: "Documentação",
  architecture: "Arquitetura",
  backend: "Backend",
  data: "Dados",
  design: "Design e experiência",
  engineering: "Engenharia",
  frontend: "Frontend",
  language: "Linguagens",
  operations: "Operações",
  platform: "Plataforma",
  quality: "Qualidade",
  instalada: "Outras instaladas",
};

/** Atalhos globais preservados entre as versões Python e Node.js. */
export const TUI_BINDINGS = {
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
} as const;

/** Abas públicas na ordem fixa apresentada no dashboard. */
export const TUI_TABS = [
  { id: "home", label: "Home", key: "C-h" },
  { id: "backlogs", label: "Backlogs", key: "C-g" },
  { id: "specs", label: "Specs", key: "C-s" },
  { id: "tests", label: "Testes", key: "C-j" },
  { id: "skills", label: "Skills", key: "C-k" },
  { id: "about", label: "Sobre", key: "C-o" },
] as const;

/**
 * Paleta semântica da TUI, derivada dos tokens oficiais do dark mode.
 *
 * Os pares de texto, seleção e foco mantêm contraste mensurável sem depender
 * das cores configuráveis de 16 posições do terminal da pessoa usuária.
 */
export const TUI_THEME = {
  background: "#000A0E",
  surface: "#001117",
  surfaceRaised: "#03212A",
  text: "#F2F8F9",
  textMuted: "#B2C6CE",
  border: "#5F7D8C",
  accent: "#C4B5FD",
  activeBackground: "#5EEDE1",
  activeText: "#001117",
  selectedBackground: "#6D28D9",
  selectedText: "#F2F8F9",
  primaryBackground: "#15626A",
  primaryText: "#F2F8F9",
  focusBackground: "#5EEDE1",
  focusText: "#001117",
  warning: "#FCD34D",
} as const;

/** Identificador válido de uma área principal do dashboard. */
export type Tab = (typeof TUI_TABS)[number]["id"];

/** Filtro aplicado sobre as opções de skill disponíveis. */
export type SkillFilter = "all" | "installed" | "detected";

/** Opções de montagem usadas pelo executável e por integrações da TUI. */
export interface TuiStartOptions {
  screen?: blessed.Widgets.Screen;
  catalog?: Catalog;
  watch?: boolean;
}

/** Linha normalizada do seletor de skills. */
export interface SkillOption {
  name: string;
  description: string;
  kind: string;
  installed: boolean;
}

/** Dashboard terminal principal. */
export class SpecsfyTui {
  project: string;
  #screen?: blessed.Widgets.Screen;
  #body?: blessed.Widgets.BoxElement;
  #status?: blessed.Widgets.BoxElement;
  #projectInput?: blessed.Widgets.TextboxElement;
  #modal: blessed.Widgets.BoxElement | undefined;
  #modalCloseButton: blessed.Widgets.ButtonElement | undefined;
  #modalFocus: blessed.Widgets.BlessedElement | undefined;
  #tabButtons = new Map<Tab, blessed.Widgets.ButtonElement>();
  #activeTab: Tab = "home";
  #specs: SpecProgress[] = [];
  #backlogs: BacklogItem[] = [];
  #catalogEntries: CatalogEntryValue[] = [];
  #catalog: Catalog | undefined;
  #catalogError = "";
  #installed = new Set<string>();
  #selected = new Set<string>();
  #selectionDirty = false;
  #loaded = false;
  #detected = new Set<string>();
  #skillFilter: SkillFilter = "all";
  #skillQuery = "";
  #selectedSkill = "";
  #suppressSkillToggleUntil = 0;
  #fingerprints = { specs: "", backlogs: "", lock: "" };
  #poller: NodeJS.Timeout | undefined;
  #refreshPromise: Promise<void> | undefined;
  #testRunning = false;
  #testResultTab: "summary" | "output" = "summary";
  #testSummary = "Nenhuma execução nesta sessão.";
  #testOutput: string[] = [];
  #testSummaryPanel: blessed.Widgets.BoxElement | undefined;
  #testOutputPanel: blessed.Widgets.BoxElement | undefined;

  constructor(project = process.cwd()) {
    this.project = resolvePath(project);
  }

  /** Aba atualmente exibida, útil para integrações e testes de acessibilidade. */
  get activeTab(): Tab {
    return this.#activeTab;
  }

  /** Monta a aplicação e resolve depois do encerramento da tela. */
  async run(): Promise<void> {
    const screen = blessed.screen({
      smartCSR: true,
      fullUnicode: true,
      mouse: true,
      title: "Specsfy",
      dockBorders: true,
    });
    await this.start({ screen });
    await new Promise<void>((resolve) => {
      if (screenDestroyed(screen)) {
        resolve();
        return;
      }
      screen.once("destroy", () => {
        resolve();
      });
    });
  }

  /**
   * Monta a TUI em um screen existente.
   *
   * A separação permite embutir a interface e exercitar o mesmo renderer em
   * terminais virtuais, sem manter um processo pendurado durante os testes.
   */
  async start(options: TuiStartOptions = {}): Promise<void> {
    if (this.#screen && !screenDestroyed(this.#screen)) {
      throw new Error("a TUI já foi iniciada nesta instância");
    }
    const screen =
      options.screen ??
      blessed.screen({
        smartCSR: true,
        fullUnicode: true,
        mouse: true,
        title: "Specsfy",
        dockBorders: true,
      });
    this.#screen = screen;
    this.#catalog = options.catalog;
    this.#catalogEntries = options.catalog?.entries ?? [];
    this.mountShell(screen);
    this.bindKeys(screen);
    screen.once("destroy", () => {
      if (this.#poller) clearInterval(this.#poller);
      this.#poller = undefined;
      this.#refreshPromise = undefined;
      this.#modal = undefined;
      this.#modalCloseButton = undefined;
      this.#modalFocus = undefined;
    });
    this.showStatus("Carregando projeto…");
    await this.refreshAll(!options.catalog);
    this.showTab("home");
    if (options.watch !== false) {
      const config = await loadConfig(this.project);
      if (screenDestroyed(screen)) return;
      this.#poller = setInterval(
        () => void this.refreshIfChanged().catch((error) => {
          this.showStatus(`Erro ao atualizar automaticamente: ${errorMessage(error)}`);
        }),
        config.watch_interval * 1000,
      );
    }
  }

  private mountShell(screen: blessed.Widgets.Screen): void {
    blessed.box({
      parent: screen,
      top: 0,
      left: 0,
      width: "100%",
      height: 1,
      align: "center",
      content: "Specsfy — Dashboard de specs e skills",
      style: {
        fg: TUI_THEME.text,
        bg: TUI_THEME.selectedBackground,
        bold: true,
      },
    });
    this.#projectInput = blessed.textbox({
      parent: screen,
      top: 1,
      left: 1,
      right: 21,
      height: 3,
      border: "line",
      value: this.project,
      inputOnFocus: false,
      keys: true,
      mouse: true,
      style: {
        fg: TUI_THEME.text,
        bg: TUI_THEME.surface,
        border: { fg: TUI_THEME.border },
        focus: { border: { fg: TUI_THEME.focusBackground } },
      },
    });
    this.#projectInput.on("submit", (value) => {
      this.project = resolvePath(String(value || this.project));
      this.#projectInput?.setValue(this.project);
      void this.refreshAll(true);
    });
    this.#projectInput.key(["enter"], () => this.#projectInput?.readInput());
    this.#projectInput.on("click", () => this.#projectInput?.readInput());
    const refresh = blessed.button({
      parent: screen,
      top: 1,
      right: 1,
      width: 19,
      height: 3,
      border: "line",
      content: "Atualizar  ^U",
      align: "center",
      valign: "middle",
      mouse: true,
      keys: true,
      style: buttonStyle(true),
    });
    refresh.on("press", () => void this.refreshAll(true));
    this.#tabButtons.clear();
    let left = 1;
    for (const { label, id } of TUI_TABS) {
      const width = label.length + 2;
      const button = blessed.button({
        parent: screen,
        top: 4,
        left,
        width,
        height: 1,
        content: label,
        align: "center",
        mouse: true,
        keys: true,
        style: {
          fg: TUI_THEME.textMuted,
          bg: TUI_THEME.background,
          focus: {
            fg: TUI_THEME.focusText,
            bg: TUI_THEME.focusBackground,
            bold: true,
          },
          hover: { fg: TUI_THEME.focusText, bg: TUI_THEME.focusBackground },
        },
      });
      button.on("press", () => this.showTab(id));
      this.#tabButtons.set(id, button);
      left += width;
    }
    blessed.line({
      parent: screen,
      top: 5,
      left: 0,
      width: "100%",
      orientation: "horizontal",
      style: { fg: TUI_THEME.border },
    });
    this.#body = blessed.box({
      parent: screen,
      top: 6,
      left: 1,
      right: 1,
      bottom: 4,
      style: { fg: TUI_THEME.text, bg: TUI_THEME.background },
    });
    this.#status = blessed.box({
      parent: screen,
      bottom: 2,
      left: 0,
      width: "100%",
      height: 1,
      padding: { left: 1 },
      style: { fg: TUI_THEME.textMuted, bg: TUI_THEME.surface },
    });
    blessed.box({
      parent: screen,
      bottom: 1,
      left: 0,
      width: "100%",
      height: 1,
      content:
        " ^ = Ctrl  ·  Tab/Shift+Tab: foco  ·  Setas: navegar  ·  " +
        "Espaço: abrir spec/alternar skill  ·  Esc: voltar  ·  Mouse: disponível",
      style: { fg: TUI_THEME.accent, bg: TUI_THEME.background },
    });
    blessed.box({
      parent: screen,
      bottom: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: " ^Q Sair    Esc Voltar",
      style: { fg: TUI_THEME.text, bg: TUI_THEME.surface, bold: true },
    });
  }

  private bindKeys(screen: blessed.Widgets.Screen): void {
    screen.key(["C-q"], () => screen.destroy());
    screen.key(["escape"], () => this.goBack());
    screen.key(["C-u"], () => void this.refreshAll(true));
    // O neo-blessed normaliza Ctrl+H como Backspace e Ctrl+J como Line Feed.
    // Os aliases mantêm os atalhos globais funcionais com bytes de TTY reais.
    screen.key(["C-h", "backspace"], () => this.showTab("home"));
    screen.key(["C-g"], () => this.showTab("backlogs"));
    screen.key(["C-s"], () => this.showTab("specs"));
    screen.key(["C-j", "linefeed"], () => this.showTab("tests"));
    screen.key(["C-k"], () => this.showTab("skills"));
    screen.key(["C-o"], () => this.showTab("about"));
    screen.key(["C-x"], () => void this.runTests());
    screen.key(["C-b"], () => this.selectFramework());
    screen.key(["C-d"], () => void this.detectSkills());
    screen.key(["C-e"], () => this.toggleSelectedSkill());
    screen.key(["C-a"], () => void this.applySkills());
    screen.key(["C-r"], () => void this.updateSkills());
    screen.key(["C-v"], () => this.selectVisible());
    screen.key(["C-l"], () => this.clearVisible());
    screen.key(["C-t"], () => this.setSkillFilter("all"));
    screen.key(["C-n"], () => this.setSkillFilter("installed"));
    screen.key(["C-c"], () => this.setSkillFilter("detected"));
    screen.on("keypress", (_character, key) => {
      if (key.name !== "tab") return;
      if (this.#modal) {
        this.moveModalFocus(key.shift);
        return;
      }
      if (!screen.focused || !screen.keyable.includes(screen.focused)) {
        this.#projectInput?.focus();
      } else if (key.shift) {
        screen.focusPrevious();
      } else {
        screen.focusNext();
      }
      screen.render();
    });
  }

  private showTab(tab: Tab): void {
    if (this.#modal) return;
    this.#activeTab = tab;
    const body = this.#body;
    if (!body || !this.#screen) return;
    for (const [id, button] of this.#tabButtons) {
      button.style.bg =
        id === tab ? TUI_THEME.activeBackground : TUI_THEME.background;
      button.style.fg = id === tab ? TUI_THEME.activeText : TUI_THEME.textMuted;
      button.style.bold = id === tab;
    }
    for (const child of [...body.children]) child.destroy();
    this.#testSummaryPanel = undefined;
    this.#testOutputPanel = undefined;
    if (tab === "home") this.renderHome(body);
    else if (tab === "backlogs") this.renderBacklogs(body);
    else if (tab === "specs") this.renderSpecs(body);
    else if (tab === "tests") this.renderTests(body);
    else if (tab === "skills") this.renderSkills(body);
    else this.renderAbout(body);
    this.focusActiveTab();
    if (!screenDestroyed(this.#screen)) this.#screen.render();
  }

  /** Recupera um alvo navegável quando um painel foi recriado ou fechado. */
  private focusActiveTab(): void {
    const screen = this.#screen;
    if (!screen || screenDestroyed(screen)) return;
    const focused = screen.focused;
    if (focused && !focused.detached && focused.visible) return;
    this.#tabButtons.get(this.#activeTab)?.focus();
  }

  /** Renderiza somente enquanto a tela ainda pertence ao ciclo atual. */
  private renderScreen(): void {
    if (this.#screen && !screenDestroyed(this.#screen)) this.#screen.render();
  }

  /**
   * Retorna um nível por vez: fecha modal, limpa busca e volta ao Home.
   *
   * Essa ordem reproduz a ação `back` do Textual e evita que Escape descarte
   * o contexto da aba enquanto o usuário fecha uma visualização.
   */
  private goBack(): void {
    if (this.#modal) {
      this.closeModal();
      return;
    }
    if (this.#activeTab === "skills" && this.#skillQuery) {
      this.#skillQuery = "";
      this.showTab("skills");
      return;
    }
    if (this.#activeTab !== "home") this.showTab("home");
  }

  private renderHome(body: blessed.Widgets.BoxElement): void {
    const summary = summarizeSpecs(this.#specs);
    const cards: Array<[string, string, string, string]> = [
      ["Specs", String(summary.total_specs), "#021C26", "#5EEDE1"],
      [
        `Tarefas · ${summary.pending_tasks} pendentes`,
        `${summary.completed_tasks}/${summary.total_tasks}`,
        "#2E1065",
        "#C4B5FD",
      ],
      [
        `Itens de tarefa · ${summary.pending_task_items} pendentes`,
        `${summary.completed_task_items}/${summary.total_task_items}`,
        "#03212A",
        "#37E1D0",
      ],
      [
        "",
        `${summary.percent}%\n${progressBar(summary.percent, 16)}`,
        "#001117",
        TUI_THEME.warning,
      ],
    ];
    cards.forEach(([label, value, background, border], index) => {
      blessed.box({
        parent: body,
        top: 0,
        left: `${index * 25}%`,
        width: "25%",
        height: 7,
        border: "line",
        align: "center",
        valign: "middle",
        content: `{bold}${value}{/bold}${label ? `\n${label}` : ""}`,
        tags: true,
        style: { fg: TUI_THEME.text, bg: background, border: { fg: border } },
      });
    });
    blessed.box({
      parent: body,
      top: 9,
      left: 0,
      right: 0,
      height: 5,
      border: "line",
      padding: { left: 2, right: 2 },
      valign: "middle",
      content:
        `Outros checkboxes: ${summary.total_other_items}. ` +
        `Itens do ciclo sem tarefa: ${summary.orphan_checklist_items}. ` +
        "Consulte os detalhes da spec para revisar as linhas indicadas.",
      style: {
        fg: TUI_THEME.text,
        bg: TUI_THEME.surface,
        border: { fg: TUI_THEME.border },
      },
    });
  }

  private renderBacklogs(body: blessed.Widgets.BoxElement): void {
    const preview = blessed.box({
      parent: body,
      top: 0,
      left: "35%",
      right: 0,
      bottom: 0,
      border: "line",
      label: " Selecione um backlog ",
      padding: { left: 1, right: 1 },
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      mouse: true,
      scrollbar: terminalScrollbar(),
      style: focusablePanelStyle(),
    });
    const list = blessed.list({
      parent: body,
      top: 0,
      left: 0,
      width: "34%",
      bottom: 0,
      border: "line",
      label: ` Backlogs · ${this.#backlogs.length} `,
      items: this.#backlogs.map((item) => item.title),
      keys: true,
      vi: true,
      mouse: true,
      tags: false,
      style: {
        ...focusablePanelStyle(),
        selected: {
          fg: TUI_THEME.selectedText,
          bg: TUI_THEME.selectedBackground,
          bold: true,
        },
        item: { fg: TUI_THEME.text, bg: TUI_THEME.background },
      },
    });
    const updatePreview = (): void => {
      const item = this.#backlogs[selectedIndex(list)];
      preview.setLabel(
        item ? ` ${item.identifier} · ${item.status} ` : " Nenhum backlog ",
      );
      preview.setContent(
        item
          ? renderMarkdown(formatBacklogPreview(item.content))
          : "Crie arquivos em specs/backlog/<NNNN>-<slug>.md para visualizá-los aqui.",
      );
      this.renderScreen();
    };
    list.on("select item", updatePreview);
    list.on("keypress", updatePreview);
    updatePreview();
    list.focus();
  }

  private renderSpecs(body: blessed.Widgets.BoxElement): void {
    const heading =
      " Spec                             Status        Gates   Tarefas  Checklist  Progresso ";
    const panel = blessed.box({
      parent: body,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      border: "line",
      style: { border: { fg: TUI_THEME.border } },
    });
    blessed.box({
      parent: panel,
      top: 0,
      left: 0,
      width: "100%-2",
      height: 1,
      content: heading,
      style: {
        fg: TUI_THEME.activeText,
        bg: TUI_THEME.activeBackground,
        bold: true,
      },
    });
    const list = blessed.list({
      parent: panel,
      top: 1,
      left: 0,
      right: 0,
      bottom: 0,
      items: this.#specs.map(
        (spec) =>
          ` ${spec.slug.slice(0, 32).padEnd(32)} ` +
          `${spec.status.slice(0, 12).padEnd(12)} ` +
          `${`${spec.passed_gates}/${spec.total_gates}`.padEnd(7)} ` +
          `${`${spec.completed_tasks}/${spec.total_tasks}`.padEnd(8)} ` +
          `${`${spec.completed_task_items}/${spec.total_task_items}`.padEnd(8)} ` +
          `${progressBar(spec.percent)} ${spec.percent}%`,
      ),
      keys: true,
      vi: true,
      mouse: true,
      style: {
        selected: {
          fg: TUI_THEME.selectedText,
          bg: TUI_THEME.selectedBackground,
          bold: true,
        },
        item: { fg: TUI_THEME.text, bg: TUI_THEME.background },
      },
    });
    const open = (): void => {
      const spec = this.#specs[selectedIndex(list)];
      if (spec) this.openSpec(spec);
    };
    list.on("select", open);
    list.key(["space"], open);
    list.focus();
  }

  private openSpec(spec: SpecProgress): void {
    const screen = this.#screen;
    if (!screen || this.#modal) return;
    const modal = blessed.box({
      parent: screen,
      top: "4%",
      left: "4%",
      width: "92%",
      height: "92%",
      border: "line",
      label: ` ${spec.slug} · ${spec.status} `,
      content:
        `${spec.title} · Gates ${spec.passed_gates}/${spec.total_gates} · ` +
        `Tarefas ${spec.completed_tasks}/${spec.total_tasks} · ` +
        `Checklist ${spec.completed_task_items}/${spec.total_task_items} · ${spec.percent}%\n` +
        `Outros checkboxes: ${spec.total_other_items} · Itens do ciclo sem tarefa: ${spec.orphan_checklist_lines.length}\n` +
        (spec.orphan_checklist_lines.length ? `Revisar linhas ${spec.orphan_checklist_lines.join(", ")} com $specsfy-update-spec.\n` : "") +
        `${spec.path}\n\n${renderMarkdown(spec.content)}\n\n` +
        "Esc: voltar para a lista de specs",
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      mouse: true,
      padding: { left: 1, right: 1 },
      scrollbar: terminalScrollbar(),
      style: {
        fg: TUI_THEME.text,
        bg: TUI_THEME.background,
        border: { fg: TUI_THEME.focusBackground },
      },
    });
    this.#modalFocus = screen.focused;
    this.#modal = modal;
    const closeButton = blessed.button({
      parent: modal,
      top: 0,
      right: 1,
      width: 13,
      height: 1,
      content: "Fechar  Esc",
      align: "center",
      mouse: true,
      keys: true,
      style: buttonStyle(),
    });
    closeButton.on("press", () => this.closeModal());
    this.#modalCloseButton = closeButton;
    screen.focusPush(modal);
    screen.render();
  }

  /**
   * Fecha o overlay sem manter widgets destruídos no histórico de foco.
   *
   * O neo-blessed registra cada mudança de foco em uma pilha. Um modal pode
   * receber foco no conteúdo e no botão de fechar; ambos precisam sair da
   * pilha antes da destruição para que Tab, setas e atalhos retornem à lista
   * de specs, sem apontar para um elemento destacado que já não existe.
   */
  private closeModal(): void {
    const modal = this.#modal;
    if (!modal) return;
    const screen = this.#screen;
    this.#modal = undefined;
    this.#modalCloseButton = undefined;
    if (screen && !screenDestroyed(screen)) {
      while (screen.focused && isDescendantOf(screen.focused, modal)) {
        screen.focusPop();
      }
    }
    modal.destroy();
    const focus = this.#modalFocus;
    this.#modalFocus = undefined;
    if (focus && !focus.detached && focus.visible) {
      if (screen?.focused !== focus) focus.focus();
    } else {
      this.focusActiveTab();
    }
    this.renderScreen();
  }

  /** Alterna Tab e Shift+Tab apenas entre conteúdo e fechamento do modal. */
  private moveModalFocus(backward: boolean): void {
    const modal = this.#modal;
    const closeButton = this.#modalCloseButton;
    const screen = this.#screen;
    if (!modal || !closeButton || !screen || screenDestroyed(screen)) return;
    const targets = [modal, closeButton];
    const current = targets.indexOf(screen.focused as typeof modal);
    const offset = backward ? -1 : 1;
    const next = targets[(current + offset + targets.length) % targets.length]!;
    next.focus();
    screen.render();
  }

  private renderTests(body: blessed.Widgets.BoxElement): void {
    const button = blessed.button({
      parent: body,
      top: 1,
      right: 2,
      width: 24,
      height: 3,
      content: " Executar testes ^X ",
      align: "center",
      mouse: true,
      keys: true,
      style: buttonStyle(true),
    });
    button.on("press", () => void this.runTests());
    blessed.box({
      parent: body,
      top: 1,
      left: 2,
      right: 28,
      height: 3,
      content: this.#testRunning
        ? "Executando os testes do projeto…"
        : this.#testSummary === "Nenhuma execução nesta sessão."
          ? this.#testSummary
          : "A última execução está disponível abaixo.",
    });
    const summaryTab = blessed.button({
      parent: body,
      top: 5,
      left: 1,
      width: 10,
      height: 1,
      content: "Resumo",
      align: "center",
      keys: true,
      mouse: true,
      style: tabStyle(this.#testResultTab === "summary"),
    });
    const outputTab = blessed.button({
      parent: body,
      top: 5,
      left: 11,
      width: 10,
      height: 1,
      content: "Testes",
      align: "center",
      keys: true,
      mouse: true,
      style: tabStyle(this.#testResultTab === "output"),
    });
    summaryTab.on("press", () => {
      this.#testResultTab = "summary";
      this.showTab("tests");
    });
    outputTab.on("press", () => {
      this.#testResultTab = "output";
      this.showTab("tests");
    });
    if (this.#testResultTab === "summary") {
      this.#testSummaryPanel = blessed.box({
        parent: body,
        top: 6,
        left: 1,
        right: 1,
        bottom: 0,
        border: "line",
        label: " Resumo ",
        content: this.#testSummary,
        padding: { left: 2, right: 2, top: 1 },
        keys: true,
        vi: true,
        mouse: true,
        scrollable: true,
        style: focusablePanelStyle(),
      });
    } else {
      // O blessed.log agenda a rolagem depois de setContent e acessa widgets
      // destruídos quando a saída ao vivo recria a aba. A caixa preserva a
      // rolagem sem deixar callbacks pendentes entre duas renderizações.
      this.#testOutputPanel = blessed.box({
        parent: body,
        top: 6,
        left: 1,
        right: 1,
        bottom: 0,
        border: "line",
        label: " Testes ",
        padding: { left: 1, right: 1 },
        keys: true,
        vi: true,
        mouse: true,
        scrollable: true,
        alwaysScroll: true,
        tags: false,
        content: this.#testOutput.join("\n"),
        style: focusablePanelStyle(),
      });
    }
    button.focus();
  }

  private async runTests(): Promise<void> {
    if (this.#modal || this.#testRunning) return;
    this.showTab("tests");
    this.#testRunning = true;
    this.#testResultTab = "output";
    this.#testOutput = [];
    this.#testSummary = "Preparando o runner de testes…";
    this.showTab("tests");
    this.showStatus("Executando os testes do projeto…");
    try {
      const result = await runProjectTests(this.project, (line) => {
        this.#testOutput.push(line);
        this.#testOutputPanel?.setContent(this.#testOutput.join("\n"));
        if (this.#activeTab === "tests" && this.#testResultTab === "output") {
          this.renderScreen();
        }
      });
      this.#testSummary = formatTestRun(result);
      this.#testSummaryPanel?.setContent(this.#testSummary);
      this.#testResultTab = "summary";
      this.showStatus(
        `${result.exit_code === 0 ? "Testes passaram" : "Testes falharam"} · ` +
          `${result.duration_seconds.toFixed(2)}s · exit code ${result.exit_code}`,
      );
      if (this.#activeTab === "tests") this.showTab("tests");
    } catch (error) {
      const message = `Erro ao executar testes: ${errorMessage(error)}`;
      this.#testSummary = message;
      this.#testSummaryPanel?.setContent(message);
      this.#testOutput.push(message);
      this.#testResultTab = "summary";
      this.showStatus(message);
      if (this.#activeTab === "tests") this.showTab("tests");
    } finally {
      this.#testRunning = false;
      this.renderScreen();
    }
  }

  private renderSkills(body: blessed.Widgets.BoxElement): void {
    blessed.box({
      parent: body,
      top: 0,
      left: 0,
      right: 0,
      height: 1,
      content:
        `${this.project}/skills-lock.json · ` +
        `${this.#installed.size} skill(s) Specsfy instalada(s)` +
        (this.#catalogError
          ? ` · catálogo indisponível: ${this.#catalogError}`
          : ""),
      style: { fg: TUI_THEME.textMuted },
    });
    const search = blessed.textbox({
      parent: body,
      top: 1,
      left: 0,
      right: 20,
      height: 3,
      border: "line",
      label: " Buscar por nome, tecnologia ou categoria… ",
      value: this.#skillQuery,
      inputOnFocus: false,
      keys: true,
      mouse: true,
      style: focusablePanelStyle(),
    });
    search.on("submit", (value) => {
      this.#skillQuery = String(value ?? "");
      this.showTab("skills");
    });
    search.key(["enter"], () => search.readInput());
    search.on("click", () => search.readInput());
    const update = blessed.button({
      parent: body,
      top: 1,
      right: 0,
      width: 19,
      height: 3,
      border: "line",
      content: "Atualizar  ^R",
      align: "center",
      valign: "middle",
      keys: true,
      mouse: true,
      style: buttonStyle(),
    });
    update.on("press", () => void this.updateSkills());
    const filters: Array<[string, SkillFilter]> = [
      ["Todas  ^T", "all"],
      ["Instaladas  ^N", "installed"],
      ["Recomendadas  ^C", "detected"],
    ];
    filters.forEach(([label, filter], index) => {
      const button = blessed.button({
        parent: body,
        top: 4,
        left: `${index * 33}%`,
        width: index === 2 ? "34%" : "33%",
        height: 3,
        border: "line",
        content: label,
        align: "center",
        valign: "middle",
        keys: true,
        mouse: true,
        style: buttonStyle(this.#skillFilter === filter),
      });
      button.on("press", () => this.setSkillFilter(filter));
    });
    const visible = this.visibleSkills();
    const toInstall = [...this.#selected].filter(
      (name) => !this.#installed.has(name),
    ).length;
    const toRemove = [...this.#installed].filter(
      (name) => !this.#selected.has(name),
    ).length;
    blessed.box({
      parent: body,
      top: 7,
      left: 0,
      right: 0,
      height: 1,
      content:
        `${this.#selected.size} selecionada(s) · ${visible.length} visível(is) · ` +
        `${toInstall} para instalar · ${toRemove} para remover`,
      style: { fg: TUI_THEME.text, bold: true },
    });
    const catalog = blessed.box({
      parent: body,
      top: 8,
      left: 0,
      right: 0,
      bottom: 4,
    });
    const list = blessed.list({
      parent: catalog,
      top: 1,
      left: 0,
      width: "64%",
      bottom: 0,
      border: "line",
      items: visible.map(
        (option) =>
          ` ${skillPlanLabel(option.name, this.#installed, this.#selected).padEnd(8)} ` +
          `${friendlySkillName(option.name).slice(0, 28).padEnd(28)} ` +
          `${(CATEGORY_LABELS[option.kind] ?? titleCase(option.kind)).slice(0, 18).padEnd(18)} ` +
          `${skillStateLabel(option.name, this.#installed, this.#detected)}`,
      ),
      keys: true,
      vi: true,
      mouse: true,
      style: {
        ...focusablePanelStyle(),
        selected: {
          fg: TUI_THEME.selectedText,
          bg: TUI_THEME.selectedBackground,
          bold: true,
        },
        item: { fg: TUI_THEME.text, bg: TUI_THEME.background },
      },
    });
    const detail = blessed.box({
      parent: catalog,
      top: 0,
      left: "64%",
      right: 0,
      bottom: 0,
      border: "line",
      label: " Detalhes ",
      padding: { left: 1, right: 1 },
      scrollable: true,
      keys: true,
      vi: true,
      mouse: true,
      style: focusablePanelStyle(),
    });
    blessed.box({
      parent: catalog,
      top: 0,
      left: 0,
      width: "64%",
      height: 1,
      content:
        " PLANO    SKILL                        CATEGORIA          ESTADO ",
      style: {
        fg: TUI_THEME.activeText,
        bg: TUI_THEME.activeBackground,
        bold: true,
      },
    });
    const updateDetail = (): void => {
      const option = visible[selectedIndex(list)];
      this.#selectedSkill = option?.name ?? "";
      detail.setContent(
        option
          ? formatSkillDetail(
              option,
              this.#installed,
              this.#selected,
              this.#detected,
            )
          : "Nenhuma skill visível.\n\nAjuste a busca ou os filtros para continuar.",
      );
      this.renderScreen();
    };
    list.on("select item", updateDetail);
    list.on("keypress", () => setImmediate(updateDetail));
    const toggle = (): void => {
      updateDetail();
      this.toggleSelectedSkill();
    };
    list.on("select", toggle);
    list.key(["space"], toggle);
    const actions: Array<[string, () => void, boolean?]> = [
      ["Detectar  ^D", () => void this.detectSkills()],
      ["Framework  ^B", () => this.selectFramework()],
      ["Marcar  ^V", () => this.selectVisible()],
      ["Limpar  ^L", () => this.clearVisible()],
      ["Alternar  ^E", () => this.toggleSelectedSkill()],
      ["Aplicar  ^A", () => void this.applySkills(), true],
    ];
    actions.forEach(([label, action, primary], index) => {
      const button = blessed.button({
        parent: body,
        bottom: 0,
        left: `${index * (100 / 6)}%`,
        width: `${100 / 6}%`,
        height: 3,
        border: "line",
        content: label,
        align: "center",
        valign: "middle",
        keys: true,
        mouse: true,
        style: buttonStyle(Boolean(primary)),
      });
      button.on("press", action);
    });
    updateDetail();
    list.focus();
  }

  private renderAbout(body: blessed.Widgets.BoxElement): void {
    blessed.box({
      parent: body,
      top: 2,
      left: 3,
      right: 3,
      height: 12,
      content:
        `Specsfy CLI ${VERSION}\n\n` +
        "Framework para transformar ideias em especificações rastreáveis e " +
        "acompanhar sua entrega.\n\n" +
        "Skills instaladas são lidas do skills-lock.json do projeto. " +
        "Ctrl+Q encerra a interface.",
    });
  }

  private refreshAll(reloadCatalog: boolean): Promise<void> {
    if (this.#refreshPromise) return this.#refreshPromise;
    const promise = this.refreshAllInternal(reloadCatalog);
    const tracked = promise.finally(() => {
      if (this.#refreshPromise === tracked) this.#refreshPromise = undefined;
    });
    this.#refreshPromise = tracked;
    return tracked;
  }

  private async refreshAllInternal(reloadCatalog: boolean): Promise<void> {
    try {
      const [specs, backlogs, lock] = await Promise.all([
        scanSpecs(this.project),
        scanBacklogs(this.project),
        ensureSkillsLock(this.project),
      ]);
      this.#specs = specs;
      this.#backlogs = backlogs;
      const installed = new Set(Object.keys(lock.skills).filter(isSpecsfySkill));
      this.#installed = installed;
      if (reloadCatalog || !this.#catalog) {
        try {
          this.#catalog = await Catalog.fetch();
          this.#catalogEntries = this.#catalog.entries;
          this.#catalogError = "";
        } catch (error) {
          this.#catalogError = errorMessage(error);
        }
      }
      const available = new Set(
        buildSkillOptions(this.#catalogEntries, installed).map((option) => option.name),
      );
      this.#selected = this.#loaded && this.#selectionDirty
        ? new Set([...this.#selected].filter((name) => available.has(name)))
        : new Set(installed);
      this.#loaded = true;
      this.#fingerprints = {
        specs: await specsFingerprint(this.project),
        backlogs: await backlogsFingerprint(this.project),
        lock: await skillsLockFingerprint(this.project),
      };
      const summary = summarizeSpecs(specs);
      this.showStatus(
        `${this.project} · ${summary.completed_specs}/${summary.total_specs} specs completas · ` +
          "atualização automática ativa" +
          (this.#catalogError
            ? ` · catálogo indisponível: ${this.#catalogError}`
            : ""),
      );
      this.showTab(this.#activeTab);
    } catch (error) {
      this.showStatus(`Erro: ${errorMessage(error)}`);
    }
  }

  private async refreshIfChanged(): Promise<void> {
    const current = {
      specs: await specsFingerprint(this.project),
      backlogs: await backlogsFingerprint(this.project),
      lock: await skillsLockFingerprint(this.project),
    };
    if (
      current.specs !== this.#fingerprints.specs ||
      current.backlogs !== this.#fingerprints.backlogs ||
      current.lock !== this.#fingerprints.lock
    ) {
      await this.refreshAll(false);
    }
  }

  private skillOptions(): SkillOption[] {
    return buildSkillOptions(this.#catalogEntries, this.#installed);
  }

  private visibleSkills(): SkillOption[] {
    return filterSkillOptions(
      this.skillOptions(),
      this.#skillFilter,
      this.#skillQuery,
      this.#installed,
      this.#detected,
    );
  }

  private setSkillFilter(filter: SkillFilter): void {
    this.#skillFilter = filter;
    this.showTab("skills");
  }

  private selectFramework(): void {
    this.#selected = new Set([...this.#selected, ...FRAMEWORK_SKILLS]);
    this.#selectionDirty = true;
    this.showStatus(
      "As skills do framework foram selecionadas. Use ^A para aplicar.",
    );
    this.showTab("skills");
  }

  private async detectSkills(): Promise<void> {
    if (this.#modal) return;
    this.showTab("skills");
    const startedOnSkills = this.#activeTab === "skills";
    try {
      this.#catalog ??= await Catalog.fetch();
      this.#catalogEntries = this.#catalog.entries;
      const entries = await this.#catalog.detect(this.project);
      this.#detected = new Set(entries.map((entry) => entry.name));
      this.#selected = new Set([...this.#selected, ...this.#detected]);
      this.#selectionDirty = true;
      this.#skillFilter = "detected";
      this.showStatus(
        `Skills detectadas e selecionadas: ${
          [...this.#detected].sort().join(", ") || "nenhuma skill"
        }`,
      );
      if (startedOnSkills && this.#activeTab === "skills") this.showTab("skills");
    } catch (error) {
      this.showStatus(`Erro: ${errorMessage(error)}`);
    }
  }

  private toggleSelectedSkill(): void {
    if (Date.now() < this.#suppressSkillToggleUntil) return;
    if (this.#activeTab !== "skills" || !this.#selectedSkill) return;
    if (this.#selected.has(this.#selectedSkill)) {
      this.#selected.delete(this.#selectedSkill);
    } else {
      this.#selected.add(this.#selectedSkill);
    }
    this.#selectionDirty = true;
    this.showTab("skills");
  }

  private selectVisible(): void {
    this.#suppressSkillToggleUntil = Date.now() + 100;
    for (const option of this.visibleSkills()) this.#selected.add(option.name);
    this.#selectionDirty = true;
    this.showTab("skills");
  }

  private clearVisible(): void {
    this.#suppressSkillToggleUntil = Date.now() + 100;
    for (const option of this.visibleSkills())
      this.#selected.delete(option.name);
    this.#selectionDirty = true;
    this.showTab("skills");
  }

  private async applySkills(): Promise<void> {
    if (this.#modal) return;
    this.showTab("skills");
    try {
      const selected = new Set([...this.#selected].filter(isSpecsfySkill));
      const specialistNames = [...selected].filter((name) =>
        name.startsWith("specsfy-specialist-"),
      );
      if (specialistNames.length) {
        this.#catalog ??= await Catalog.fetch();
        for (const entry of this.#catalog.resolve(specialistNames)) {
          selected.add(entry.name);
          this.#selected.add(entry.name);
        }
      }
      const toAdd = [...selected].filter((name) => !this.#installed.has(name));
      const toRemove = [...this.#installed].filter(
        (name) => !selected.has(name),
      );
      const base = toAdd.filter((name) =>
        (FRAMEWORK_SKILLS as readonly string[]).includes(name),
      );
      const specialists = toAdd.filter((name) =>
        name.startsWith("specsfy-specialist-"),
      );
      const installer = await SkillInstaller.create(this.project);
      const changed: string[] = [];
      if (base.length)
        changed.push(...(await installer.installBaseSelection(base)));
      if (specialists.length) {
        this.#catalog ??= await Catalog.fetch();
        const names = this.#catalog
          .resolve(specialists)
          .map((entry) => entry.name)
          .filter((name) => !this.#installed.has(name));
        changed.push(...(await installer.installSpecialists(names)));
      }
      if (toRemove.length)
        changed.push(...(await installer.remove(toRemove.sort())));
      this.#selectionDirty = false;
      await this.refreshAll(false);
      this.showStatus(
        changed.length
          ? `Seleção aplicada: ${changed.length} alteração(ões).`
          : "A seleção já corresponde ao skills-lock.json.",
      );
    } catch (error) {
      this.showStatus(`Erro: ${errorMessage(error)}`);
    }
  }

  private async updateSkills(): Promise<void> {
    if (this.#modal) return;
    this.showTab("skills");
    try {
      const changed = await (
        await SkillInstaller.create(this.project)
      ).updateAll();
      await this.refreshAll(true);
      this.showStatus(
        changed.length
          ? `Skills atualizadas: ${changed.length} alteração(ões).`
          : "Todas as skills instaladas já estão atualizadas.",
      );
    } catch (error) {
      this.showStatus(`Erro: ${errorMessage(error)}`);
    }
  }

  private showStatus(message: string): void {
    this.#status?.setContent(message);
    this.renderScreen();
  }
}

/** Cria as opções base, especialistas e instalações fora do catálogo atual. */
export function buildSkillOptions(
  catalogEntries: CatalogEntryValue[],
  installed: Set<string>,
): SkillOption[] {
  const options: SkillOption[] = FRAMEWORK_SKILLS.map((name) => ({
    name,
    description: BASE_DESCRIPTIONS[name] ?? "Skill do framework Specsfy.",
    kind:
      (AUXILIARY_SKILLS as readonly string[]).includes(name) ||
      name === "specsfy-setup"
        ? "auxiliary"
        : (DOCUMENTATION_SKILLS as readonly string[]).includes(name)
          ? "documentation"
          : "base",
    installed: installed.has(name),
  }));
  const known = new Set<string>(FRAMEWORK_SKILLS);
  for (const entry of catalogEntries) {
    known.add(entry.name);
    options.push({
      name: entry.name,
      description: entry.description,
      kind: entry.category,
      installed: installed.has(entry.name),
    });
  }
  for (const name of [...installed].sort()) {
    if (!known.has(name) && isSpecsfySkill(name)) {
      options.push({
        name,
        description: "Skill Specsfy instalada fora do catálogo atual.",
        kind: "instalada",
        installed: true,
      });
    }
  }
  const categories = Object.keys(CATEGORY_LABELS);
  return options.sort((left, right) => {
    const category =
      categories.indexOf(left.kind) - categories.indexOf(right.kind);
    return category || left.name.localeCompare(right.name);
  });
}

/** Retorna o plano explícito de uma skill sem executar mudanças. */
export function skillPlanLabel(
  name: string,
  installed: Set<string>,
  selected: Set<string>,
): "Manter" | "Instalar" | "Remover" | "Ignorar" {
  if (selected.has(name)) return installed.has(name) ? "Manter" : "Instalar";
  return installed.has(name) ? "Remover" : "Ignorar";
}

/** Filtra o catálogo com a mesma regra usada pela busca e pelos botões. */
export function filterSkillOptions(
  options: SkillOption[],
  filter: SkillFilter,
  queryValue: string,
  installed: Set<string>,
  detected: Set<string>,
): SkillOption[] {
  const query = queryValue.trim().toLocaleLowerCase("pt-BR");
  return options.filter((option) => {
    const searchable =
      `${option.name} ${option.description} ${option.kind}`.toLocaleLowerCase(
        "pt-BR",
      );
    if (query && !searchable.includes(query)) return false;
    if (filter === "installed" && !installed.has(option.name)) return false;
    if (filter === "detected" && !detected.has(option.name)) return false;
    return true;
  });
}

/** Formata o painel lateral da skill selecionada. */
export function formatSkillDetail(
  option: SkillOption,
  installed: Set<string>,
  selected: Set<string>,
  detected: Set<string>,
): string {
  const states = [installed.has(option.name) ? "Instalada" : "Não instalada"];
  if (detected.has(option.name)) states.push("Recomendada");
  return (
    `${friendlySkillName(option.name)}\n` +
    `Plano: ${skillPlanLabel(option.name, installed, selected)} · ` +
    `Estado: ${states.join(" · ")}\n` +
    `Categoria: ${CATEGORY_LABELS[option.kind] ?? titleCase(option.kind)}\n` +
    `${option.description}\n\nID: ${option.name}`
  );
}

function skillStateLabel(
  name: string,
  installed: Set<string>,
  detected: Set<string>,
): string {
  const states = [installed.has(name) ? "Instalada" : "Disponível"];
  if (detected.has(name)) states.push("Recomendada");
  return states.join(" · ");
}

function friendlySkillName(name: string): string {
  const baseNames: Record<string, string> = {
    "specsfy-01-inbox": "01 · Inbox",
    "specsfy-02-backlog": "02 · Backlog",
    "specsfy-03-specify": "03 · Especificar",
    "specsfy-04-validate": "04 · Validar",
    "specsfy-05-tasks": "05 · Tarefas",
    "specsfy-06-tdd-bdd": "06 · TDD orientado por BDD",
    "specsfy-07-implement": "07 · Implementar",
    "specsfy-update-spec": "Atualizar especificação",
    "specsfy-progress": "Progresso",
    "specsfy-setup": "Setup",
    "specsfy-documentator": "Documentator",
  };
  if (baseNames[name]) return baseNames[name];
  return titleCase(
    name.replace(/^specsfy-(?:aux|specialist)-/u, "").replaceAll("-", " "),
  );
}

function isSpecsfySkill(name: string): boolean {
  return (
    (FRAMEWORK_SKILLS as readonly string[]).includes(name) ||
    (DOCUMENTATION_SKILLS as readonly string[]).includes(name) ||
    name.startsWith("specsfy-aux-") ||
    name.startsWith("specsfy-specialist-")
  );
}

/** Formata o resumo estável de uma execução de testes. */
export function formatTestRun(result: TestRun): string {
  return (
    `${result.exit_code === 0 ? "PASSOU" : "FALHOU"}\n\n` +
    `Runner: ${result.command.label}\n` +
    `Comando: ${result.command.display}\n` +
    `Projeto: ${result.command.cwd}\n` +
    `Duração: ${result.duration_seconds.toFixed(2)}s\n` +
    `Exit code: ${result.exit_code}\n\n` +
    (result.summary_lines.join("\n") || "O runner não emitiu um resumo.")
  );
}

function titleCase(value: string): string {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

/** Constrói a barra de progresso textual usada nos cards e tabelas. */
export function progressBar(percent: number, width = 10): string {
  const filled = Math.round((percent * width) / 100);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
}

/** Preserva cada metainformação do backlog em sua própria linha no Markdown. */
export function formatBacklogPreview(content: string): string {
  return content
    .split(/\r?\n/u)
    .map((line) =>
      line.startsWith("**") && line.includes("**:") && !line.endsWith("  ")
        ? `${line}  `
        : line,
    )
    .join("\n");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function selectedIndex(list: blessed.Widgets.ListElement): number {
  return (list as blessed.Widgets.ListElement & { selected: number }).selected;
}

/** Retorna se um elemento é o modal ou um de seus controles filhos. */
function isDescendantOf(
  element: blessed.Widgets.BlessedElement,
  ancestor: blessed.Widgets.BlessedElement,
): boolean {
  let current: blessed.Widgets.Node | undefined = element;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function renderMarkdown(content: string): string {
  return String(marked.parse(content));
}

function buttonStyle(primary = false): blessed.Widgets.Types.TStyle {
  return {
    fg: primary ? TUI_THEME.primaryText : TUI_THEME.text,
    bg: primary ? TUI_THEME.primaryBackground : TUI_THEME.surface,
    border: { fg: primary ? TUI_THEME.focusBackground : TUI_THEME.border },
    focus: {
      fg: TUI_THEME.focusText,
      bg: TUI_THEME.focusBackground,
      border: { fg: TUI_THEME.focusBackground },
    },
    hover: {
      fg: TUI_THEME.focusText,
      bg: TUI_THEME.focusBackground,
      border: { fg: TUI_THEME.focusBackground },
    },
  };
}

function tabStyle(active: boolean): blessed.Widgets.Types.TStyle {
  return {
    fg: active ? TUI_THEME.activeText : TUI_THEME.textMuted,
    bg: active ? TUI_THEME.activeBackground : TUI_THEME.background,
    bold: active,
    focus: { fg: TUI_THEME.focusText, bg: TUI_THEME.focusBackground },
    hover: { fg: TUI_THEME.focusText, bg: TUI_THEME.focusBackground },
  };
}

/** Mantém borda e foco legíveis em painéis, inputs e regiões roláveis. */
function focusablePanelStyle(): blessed.Widgets.Types.TStyle {
  return {
    fg: TUI_THEME.text,
    bg: TUI_THEME.background,
    border: { fg: TUI_THEME.border },
    focus: { border: { fg: TUI_THEME.focusBackground } },
  };
}

/** Usa trilho discreto e indicador turquesa na rolagem dos painéis. */
function terminalScrollbar(): NonNullable<
  blessed.Widgets.ScrollableBoxOptions["scrollbar"]
> {
  return {
    ch: " ",
    track: { bg: TUI_THEME.surfaceRaised },
    style: { bg: TUI_THEME.focusBackground },
  };
}

/** Detecta o estado encerrado sem depender da tipagem incompleta do blessed. */
function screenDestroyed(screen: blessed.Widgets.Screen): boolean {
  return Boolean(
    (screen as blessed.Widgets.Screen & { destroyed?: boolean }).destroyed,
  );
}
