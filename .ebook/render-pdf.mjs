#!/usr/bin/env node
/** Pagina o HTML com o CSS editorial e gera PDF pelo Chromium, sem Python. */
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [html, pdf, css, baseDirectory] = process.argv.slice(2);
if (!html || !pdf || !css) throw new Error('uso: render-pdf.mjs HTML PDF CSS');
const root = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({ executablePath: process.env.SPECSFY_CHROMIUM_PATH || undefined });
try {
  const page = await browser.newPage();
  if (baseDirectory) {
    // O manual de marca resolve imagens e fontes a partir de brand/guide/.
    // A resposta mantém o HTML gerado intacto no disco e fornece a base ao navegador.
    const base = pathToFileURL(resolve(baseDirectory) + '/').href;
    const content = readFileSync(resolve(html), 'utf8').replace(/<head([^>]*)>/i, `<head$1><base href="${base}">`);
    await page.route(pathToFileURL(resolve(html)).href, route => route.fulfill({ contentType: 'text/html', body: content }));
  }
  await page.goto(pathToFileURL(resolve(html)).href);
  await page.addStyleTag({ path: resolve(css) });
  // Paged.js resolve target-counter, mas não implementa leader() do CSS original.
  // Separa o pontilhado do contador para preservar a leitura do sumário.
  await page.addStyleTag({ content: '#TOC a { display: flex; align-items: baseline; gap: 0.3em; } #TOC a::before { content: ""; order: 1; flex: 1; border-bottom: 1px dotted var(--gray-500); } #TOC a::after { content: target-counter(attr(href), page); order: 2; }' });
  await page.evaluate(() => { window.PagedConfig = { auto: false }; });
  await page.addScriptTag({ path: resolve(root, 'node_modules/pagedjs/dist/paged.polyfill.js') });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await window.PagedPolyfill.preview();
  });
  await page.pdf({ path: resolve(pdf), format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true, outline: true });
} finally {
  await browser.close();
}
