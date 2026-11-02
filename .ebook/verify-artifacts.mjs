#!/usr/bin/env node
/** Confere hashes, aliases e navegação interna dos dois formatos do ebook. */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, basename, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser } from '@xmldom/xmldom';

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const run = (command, args) => execFileSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/** Rejeita XML malformado antes de interpretar seus destinos de navegação. */
function xml(source) {
  execFileSync('xmllint', ['--nonet', '--noout', '-'], { input: source, stdio: ['pipe', 'pipe', 'pipe'] });
  return new DOMParser().parseFromString(source, 'application/xml');
}

/** Decompõe referências relativas sem promover um caminho para URL externa. */
function targetParts(target) {
  const external = /^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith('//');
  const hash = target.indexOf('#');
  const base = hash < 0 ? target : target.slice(0, hash);
  return { external, path: base.split('?')[0], fragment: hash < 0 ? '' : target.slice(hash + 1) };
}

/** Confere links do PDF e recursos/âncoras do EPUB sem extrair arquivos no disco. */
export function verifyNavigation(pdf, epub) {
  const errors = [];
  const document = xml(run('pdftohtml', ['-xml', '-hidden', '-i', pdf, '-stdout']));
  const pages = new Set([...document.getElementsByTagName('page')].map(node => node.getAttribute('number')));
  for (const node of document.getElementsByTagName('*')) {
    if (!node.hasAttribute('href')) continue;
    const target = node.getAttribute('href');
    const parsed = targetParts(target);
    if (parsed.external) errors.push(`PDF -> link externo: ${target}`);
    else if (parsed.fragment && !pages.has(parsed.fragment)) errors.push(`PDF -> página interna ausente: ${target}`);
  }
  run('unzip', ['-tqq', epub]);
  const names = new Set(run('unzip', ['-Z1', epub]).split('\n').filter(Boolean));
  const documents = new Map();
  for (const name of names) {
    if (/\.(xhtml|html|opf|ncx|xml)$/.test(name)) documents.set(name, xml(run('unzip', ['-p', epub, name])));
  }
  const packageDocument = documents.get('EPUB/content.opf');
  const identifier = packageDocument?.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'identifier')[0];
  if (identifier?.textContent !== 'urn:specsfy:guia-do-usuario') errors.push('EPUB -> identificador não canônico');
  const htmlDocuments = [...documents].filter(([name]) => /\.(xhtml|html)$/.test(name));
  const ids = new Map(htmlDocuments.map(([name, doc]) => [name, new Set([...doc.getElementsByTagName('*')].filter(node => node.hasAttribute('id')).map(node => node.getAttribute('id')))]));
  for (const [name, doc] of htmlDocuments) {
    for (const node of doc.getElementsByTagName('*')) {
      const target = node.getAttribute('href') || node.getAttribute('src');
      if (!target) continue;
      const parsed = targetParts(target);
      const clickable = node.localName === 'a';
      if (clickable && parsed.external) { errors.push(`${name} -> link externo: ${target}`); continue; }
      const resolved = parsed.path ? posix.normalize(posix.join(posix.dirname(name), parsed.path)) : name;
      if (parsed.path && !names.has(resolved)) { errors.push(`${name} -> ${target}`); continue; }
      if (clickable && parsed.fragment && !ids.get(resolved)?.has(parsed.fragment)) errors.push(`${name} -> âncora ausente: ${target}`);
    }
  }
  if (errors.length) throw new Error('navegação inválida nos artefatos:\n' + errors.join('\n'));
}

/** Exige edição, digest das fontes e aliases exatamente iguais aos artefatos. */
export function verifyManifest({ version, sourceSha, pdf, epub, manifest }) {
  const payload = JSON.parse(readFileSync(manifest, 'utf8'));
  for (const [key, expected] of Object.entries({ version, edition: `v${version}`, source_sha256: sourceSha })) {
    if (payload[key] !== expected) throw new Error(`${key} desatualizado; execute make ebook`);
  }
  for (const [kind, path] of Object.entries({ pdf, epub })) {
    const content = readFileSync(path);
    const record = payload.artifacts?.[kind];
    if (record?.file !== basename(path) || record.sha256 !== sha256(content)) throw new Error(`hash de ${basename(path)} desatualizado`);
    const alias = resolve(path, '..', `ebook-specsfy.${kind}`);
    if (!content.equals(readFileSync(alias))) throw new Error(`ebook-specsfy.${kind} não corresponde à edição vigente`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { VERSION: version, SOURCE_SHA: sourceSha, PDF_OUT: pdf, EPUB_OUT: epub, MANIFEST: manifest } = process.env;
    if (![version, sourceSha, pdf, epub, manifest].every(Boolean)) throw new Error('VERSION, SOURCE_SHA, PDF_OUT, EPUB_OUT e MANIFEST são obrigatórios');
    verifyManifest({ version, sourceSha, pdf, epub, manifest });
    verifyNavigation(pdf, epub);
  } catch (error) { console.error(`Erro: ${error.message}`); process.exitCode = 1; }
}
