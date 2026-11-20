/**
 * TUI showcase: screenshots of every screen, kept in
 * `docs/user/assets/showcase/` of the monorepo.
 *
 * Mounts the TUI on the OpenTUI test renderer (140x40) with the read-only
 * `example/` project of the repository and captures each tab, plus the key
 * help, in the `night` and `day` themes. Every shot is saved twice:
 *
 * - `<theme>-<shot>.png`: the image, rendered from the colored
 *   frame by the Playwright installed in `../.ebook/node_modules`;
 * - `cli/tests/showcase-frames/<theme>-<shot>.txt`: the plain character
 *   frame, used by `--check`.
 *
 * Usage:
 *
 *   bun run showcase          renders the screens whose frame changed
 *   bun run showcase -- --all renders every screen again
 *   bun run showcase:check    fails when a screen differs from its frame
 *
 * The check runs in `bun run validate`, so any TUI change that alters a
 * screen asks for `bun run showcase`. Version, platform and runtime are
 * masked in the comparison, so a release alone does not fail the check.
 * Absolute paths are replaced by `~/projects/example` before saving, so the
 * images never show the machine of whoever ran the script. The specialist
 * catalog comes from `../specialists/catalog.json`, without network.
 */
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseColor, type RGBA } from "@opentui/core";
import { createTestRenderer } from "@opentui/core/testing";
import type { CapturedFrame } from "@opentui/core";
import { HOME_VARIABLE } from "../src/config/paths.ts";
import { Catalog } from "../src/domain/catalog.ts";
import { mountTui } from "../src/tui/index.ts";
import { SCREEN_IDS } from "../src/tui/screens/index.ts";
import { defaultServices } from "../src/tui/services.ts";
import { themes, type Theme } from "../src/tui/theme.ts";

const CLI = resolve(import.meta.dir, "..");
const EXAMPLE = resolve(CLI, "../example");
const CATALOG = resolve(CLI, "../specialists/catalog.json");
const OUT = resolve(CLI, "../docs/user/assets/showcase");
/** Older names used by docs/user/cli.md, the website and the root READMEs. */
const PUBLISHED = resolve(CLI, "../docs/user/assets/cli");
const PUBLISHED_COPIES: Record<string, string> = {
  "night-overview": "cli-dash.png",
  "night-backlog": "cli-backlogs.png",
  "night-specs": "cli-specs.png",
  "night-skills": "cli-skills.png",
};
const FRAMES = join(CLI, "tests/showcase-frames");
const PLAYWRIGHT = resolve(CLI, "../.ebook/node_modules/");
const WIDTH = 140;
const HEIGHT = 40;
const SHOWN_PATH = "~/projects/example";

/** One screenshot: file name, initial tab and keys pressed before capture. */
interface Shot {
  name: string;
  tab: (typeof SCREEN_IDS)[number];
  keys: string[];
}

const SHOTS: Shot[] = [
  ...SCREEN_IDS.map((tab) => ({ name: tab, tab, keys: [] })),
  { name: "help", tab: "overview", keys: ["?"] },
];

const THEMES: Array<[string, Theme]> = [
  ["night", themes.night],
  ["day", themes.day],
];

/**
 * Replaces `from` with `to` and pads the rest of the path token with the
 * width difference, so the columns after it stay aligned.
 */
function substitute(text: string, from: string, to: string): string {
  if (!from || !text.includes(from)) return text;
  const pattern = new RegExp(`${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\S*)`, "g");
  return text.replace(pattern, (_, rest: string) => `${to}${rest}${" ".repeat(Math.max(0, from.length - to.length))}`);
}

/** Machine values replaced by stable ones: paths, data directory and PID. */
const SUBSTITUTIONS: Array<[string, string]> = [];

/** Hides the paths and process values of this machine in one piece of text. */
function anonymize(text: string): string {
  let result = text;
  for (const [from, to] of SUBSTITUTIONS) result = substitute(result, from, to);
  const pid = String(process.pid);
  return result.replace(new RegExp(`(?<!\\d)${pid}(?!\\d)`, "g"), "4242".padEnd(pid.length, " "));
}

/** Masks values that change on every release or machine. */
function normalize(frame: string): string {
  return frame
    .replace(/v\d+\.\d+\.\d+(-[\w.]+)?/g, "vX.Y.Z")
    .replace(/Bun \d+\.\d+\.\d+/g, "Bun X.Y.Z")
    .replace(/(linux|darwin|windows)-(x64|arm64)/g, "os-arch")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trimEnd())
    .join("\n")
    .trimEnd();
}

function css(color: RGBA): string | null {
  if (color.a === 0) return null;
  return `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Converts a colored frame to a standalone HTML page. */
function frameHtml(frame: CapturedFrame, background: string): string {
  const rows = frame.lines.map((line) =>
    line.spans
      .map((span) => {
        const fg = css(span.fg);
        const bg = css(span.bg);
        const bold = span.attributes & 1 ? "font-weight:700;" : "";
        const style = `${fg ? `color:${fg};` : ""}${bg ? `background:${bg};` : ""}${bold}`;
        return `<span style="${style}">${escapeHtml(anonymize(span.text))}</span>`;
      })
      .join(""),
  );
  return `<!doctype html><meta charset="utf-8"><body style="margin:0;background:${background}">` +
    `<pre style="margin:0;padding:18px;background:${background};font:14px/1.25 'JetBrains Mono','DejaVu Sans Mono',monospace;white-space:pre;display:inline-block">` +
    `${rows.join("\n")}</pre>`;
}

/** Mounts the TUI, presses the keys and returns the text and HTML frames. */
async function capture(shot: Shot, theme: Theme, catalog: Catalog): Promise<{ text: string; html: string }> {
  const setup = await createTestRenderer({ width: WIDTH, height: HEIGHT });
  const services = {
    ...defaultServices(),
    loadCatalog: async () => catalog,
    runTests: async () => { throw new Error("tests are not run in the showcase"); },
  };
  const closed = mountTui(setup.renderer, { project: EXAMPLE, initialTab: shot.tab, services }, theme);
  // The store reads the project and the catalog asynchronously; wait until
  // the frame stops changing.
  let previous = "";
  for (let stable = 0, round = 0; stable < 5 && round < 200; round++) {
    await setup.renderOnce();
    const current = setup.captureCharFrame();
    stable = current === previous ? stable + 1 : 0;
    previous = current;
    await Bun.sleep(40);
  }
  for (const key of shot.keys) {
    setup.mockInput.pressKey(key);
    await setup.renderOnce();
  }
  await setup.renderOnce();
  const text = anonymize(setup.captureCharFrame());
  const html = frameHtml(setup.captureSpans(), css(parseColor(theme.background)) ?? "#000");
  setup.renderer.destroy();
  await closed;
  return { text, html };
}

/** Renders the HTML pages to PNG with the Playwright of the ebook build. */
async function renderImages(pages: Array<[string, string]>): Promise<void> {
  if (!existsSync(join(PLAYWRIGHT, "playwright"))) {
    throw new Error("Playwright not found in ../.ebook/node_modules. Run: (cd .ebook && npm ci && npx playwright install chromium)");
  }
  const { chromium } = createRequire(PLAYWRIGHT)("playwright");
  const work = mkdtempSync(join(tmpdir(), "specsfy-showcase-"));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    for (const [name, html] of pages) {
      const file = join(work, `${name}.html`);
      writeFileSync(file, html);
      await page.goto(`file://${file}`);
      await page.locator("pre").screenshot({ path: join(OUT, `${name}.png`) });
    }
  } finally {
    await browser.close();
    rmSync(work, { recursive: true, force: true });
  }
}

const check = process.argv.includes("--check");
const home = mkdtempSync(join(tmpdir(), "specsfy-showcase-home-"));
process.env[HOME_VARIABLE] = home;
SUBSTITUTIONS.push(
  [home, "~/.specsfy"],
  [EXAMPLE, SHOWN_PATH],
  [process.execPath, "~/.bun/bin/bun"],
);
if (process.env.HOME && process.env.HOME.length > 1) SUBSTITUTIONS.push([process.env.HOME, "~"]);
const catalog = await Catalog.fromPath(CATALOG);
const results: Array<{ name: string; text: string; html: string }> = [];
try {
  for (const [themeName, theme] of THEMES) {
    for (const shot of SHOTS) {
      results.push({ name: `${themeName}-${shot.name}`, ...(await capture(shot, theme, catalog)) });
    }
  }
} finally {
  rmSync(home, { recursive: true, force: true });
}

if (check) {
  const stale = results.filter(({ name, text }) => {
    const file = join(FRAMES, `${name}.txt`);
    return !existsSync(file) || normalize(readFileSync(file, "utf8")) !== normalize(text);
  });
  const expected = new Set(results.map(({ name }) => `${name}.txt`));
  const extra = existsSync(FRAMES) ? readdirSync(FRAMES).filter((file) => !expected.has(file)) : [];
  if (stale.length || extra.length) {
    for (const { name } of stale) console.error(`✗ docs/user/assets/showcase/${name} differs from the TUI`);
    for (const file of extra) console.error(`✗ tests/showcase-frames/${file} has no matching screen`);
    console.error("The showcase is out of date. Run: bun run showcase");
    process.exit(1);
  }
  console.log(`✓ docs/user/assets/showcase/ matches the TUI (${results.length} screens)`);
  process.exit(0);
}

// Only screens whose frame changed (or whose image is missing) are
// rendered again, so an unrelated TUI change does not rewrite every PNG in
// the Git history. --all renders everything, as before a release.
const all = process.argv.includes("--all");
mkdirSync(FRAMES, { recursive: true });
const keep = new Set(results.map(({ name }) => name));
for (const file of readdirSync(FRAMES)) if (!keep.has(file.replace(/\.txt$/, ""))) rmSync(join(FRAMES, file));
for (const file of readdirSync(OUT)) if (file.endsWith(".png") && !keep.has(file.replace(/\.png$/, ""))) rmSync(join(OUT, file));
const changed = results.filter(({ name, text }) => {
  const frame = join(FRAMES, `${name}.txt`);
  const same = existsSync(frame) && normalize(readFileSync(frame, "utf8")) === normalize(text);
  return all || !same || !existsSync(join(OUT, `${name}.png`));
});
for (const { name, text } of changed) writeFileSync(join(FRAMES, `${name}.txt`), `${text.trimEnd()}\n`);
if (changed.length) await renderImages(changed.map(({ name, html }) => [name, html]));
for (const { name } of changed) {
  const copy = PUBLISHED_COPIES[name];
  if (copy) copyFileSync(join(OUT, `${name}.png`), join(PUBLISHED, copy));
}
console.log(`✓ docs/user/assets/showcase/ updated: ${changed.length} of ${results.length} screens rendered`);
process.exit(0);
