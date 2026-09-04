#!/usr/bin/env node
/**
 * specsfy-07-behavioral-audit
 * ----------------------------------------------------------------------------
 * Gate complementar ao specsfy-06-tdd-bdd (check_traceability.mjs).
 *
 * PROBLEMA QUE ISSO RESOLVE:
 *   validate_spec / validate_tasks / check_traceability confirmam que a spec
 *   está bem formada e que cada FR/AC tem pelo menos N testes vinculados por
 *   marcador "SPECSFY: ...". Isso é cobertura DOCUMENTAL — nunca comportamental.
 *   Um teste que só faz assertFileExists(), ou que só cobre o caminho feliz de
 *   um requisito de segurança, passa igual num teste que de fato prova o
 *   comportamento. Este script varre os arquivos de teste vinculados a
 *   requisitos "sensíveis" (segurança, dinheiro, prazo legal, integração
 *   externa) e sinaliza quando a evidência parece rasa demais pro peso do
 *   requisito.
 *
 * O QUE ISSO NÃO FAZ:
 *   Não entende semântica profunda — é heurística de texto sobre o spec.md e os
 *   arquivos de teste. Falsos positivos e negativos são esperados. Trate o
 *   output como uma lista de atenção para revisão consciente.
 *
 * USO:
 *   node behavioral_audit.mjs <spec.md> <tests_dir> [--min-sad-path 1]
 *
 * SAÍDA:
 *   Para cada FR/NFR/AC marcado como sensível na spec, reporta:
 *     - quantos arquivos de teste o cobrem
 *     - se algum desses testes tem indício de "sad path" (falha esperada,
 *       exceção, status 4xx/5xx, assertFalse, rejeição, expect toThrow)
 *     - se algum teste parece raso (só assertFileExists / assertTrue(true) / poucas asserções)
 *   RESULTADO final: PASS | WARNINGS
 * ----------------------------------------------------------------------------
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Configuração heurística
// ---------------------------------------------------------------------------

const SENSITIVE_KEYWORDS = [
  // Segurança / Criptografia
  /criptograf/i, /gpg/i, /chave privada/i, /chave p[uú]blica/i, /certificado/i,
  /assinatura digital/i, /autentica/i, /bearer/i, /token/i, /senha/i,
  /rate limit/i, /permiss[aã]o/i, /autoriza[cç][aã]o/i, /isolamento/i,
  // Dinheiro / Fiscal / Tributário
  /pagamento/i, /cobran[cç]a/i, /fatura/i, /nf-?e/i, /nfc-?e/i, /nfs-?e/i,
  /imposto/i, /tribut/i, /estorno/i, /reembolso/i, /monof[aá]sico/i, /diferimento/i,
  // Prazo Legal / Regra de Negócio Crítica
  /prazo/i, /cancelamento/i, /expira/i, /retenção/i, /lgpd/i, /bloqueio/i, /inadimpl/i,
  // Integração Externa / Rede
  /sefaz/i, /webhook/i, /integra[cç][aã]o/i, /api externa/i, /soap/i,
  // Infraestrutura Crítica / Concorrência
  /backup/i, /restauração/i, /disaster recovery/i, /healthcheck/i,
  /autorrecupera/i, /idempot/i, /concorr[eê]ncia/i, /trava/i,
];

// Padrões de asserção que indicam "caminho triste" (sad path)
const SAD_PATH_PATTERNS = [
  /assertStatus\(\s*4\d\d\s*\)/,
  /assertStatus\(\s*5\d\d\s*\)/,
  /assertResponseStatus\(\s*4\d\d\s*\)/,
  /expectException/,
  /assertFalse\(/,
  /assertThrows/,
  /assertRejected/,
  /->toThrow\(/,
  /->toBeFalse\(\)/,
  /assertNotEquals\(\s*0\s*,\s*.*ExitCode/i,
  /assertJsonValidationErrors/,
  /assertSessionHasErrors/,
  /->assertForbidden\(/,
  /->assertUnauthorized\(/,
  /->assertNotFound\(/,
  /->assertGuest\(/,
  /isSuccessful\(\)\s*\)\s*;?\s*$/m,
  /assertStringContainsString\(\s*['"].*(?:bloque|inv[aá]lid|expir|já foi finaliz|obrigat|erro|falh)/i,
];

// Padrões que indicam teste raso (shallow test)
const SHALLOW_TEST_PATTERNS = [
  /assertFileExists\(/,
  /assertTrue\(\s*true\s*\)/,
  /assertDirectoryExists\(/,
  /file_exists\(.*\)\s*\)\s*;/,
  /expect\(true\)->toBeTrue\(\)/,
];

// ---------------------------------------------------------------------------

function fail(msg) {
  console.error(`[ERRO] ${msg}`);
  process.exit(2);
}

function readArgs() {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith('--'));
  const [specPath, testsDir] = positional;
  if (!specPath || !testsDir) {
    fail('Uso: node behavioral_audit.mjs <spec.md> <tests_dir> [--min-sad-path N]');
  }
  const minSadPathIdx = args.indexOf('--min-sad-path');
  const minSadPath = minSadPathIdx !== -1 ? parseInt(args[minSadPathIdx + 1], 10) : 1;
  return { specPath, testsDir, minSadPath };
}

function walkTestFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkTestFiles(full));
    } else if (/Test\.php$/.test(entry.name) || /\.test\.(?:js|ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// Extrai blocos SPECSFY suportando PHPUnit classes e Pest closures
function extractSpecsfyBlocks(fileContent) {
  const blocks = [];

  // Padrão 1: PHPUnit Docblock acima de public function
  const phpunitRe = /SPECSFY:\s*([^\n*]+)\n(?:\s*\*[^\n]*\n)*\s*\*\/\s*\n\s*public function\s+(\w+)\s*\(/g;
  let m;
  while ((m = phpunitRe.exec(fileContent)) !== null) {
    const ids = m[1].trim().split(/\s+/).filter((id) => /^[A-Z]+-\d+$/.test(id));
    blocks.push({ ids, methodName: m[2], type: 'phpunit', matchIndex: m.index });
  }

  // Padrão 2: Pest closures test('...', function ...) ou it('...', function ...)
  const pestRe = /(?:\/\*\*[\s\S]*?SPECSFY:\s*([^\n*]+)[\s\S]*?\*\/|\/\/\s*SPECSFY:\s*([^\n]+))\s*\n\s*(?:test|it)\(\s*['"]([^'"]+)['"]/g;
  while ((m = pestRe.exec(fileContent)) !== null) {
    const rawIds = m[1] || m[2];
    const ids = rawIds.trim().split(/\s+/).filter((id) => /^[A-Z]+-\d+$/.test(id));
    blocks.push({ ids, methodName: m[3], type: 'pest', matchIndex: m.index });
  }

  return blocks;
}

function extractMethodBody(fileContent, block) {
  if (block.type === 'phpunit') {
    const startRe = new RegExp(`public function\\s+${block.methodName}\\s*\\([^)]*\\)`);
    const startMatch = startRe.exec(fileContent);
    if (!startMatch) return '';
    const start = startMatch.index;
    const nextFnMatch = /public function\s+\w+\s*\(/g;
    nextFnMatch.lastIndex = start + startMatch[0].length;
    const next = nextFnMatch.exec(fileContent);
    const end = next ? next.index : fileContent.length;
    return fileContent.slice(start, end);
  } else {
    // Pest test
    const escapedName = block.methodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startRe = new RegExp(`(?:test|it)\\(\\s*['"]${escapedName}['"]`);
    const startMatch = startRe.exec(fileContent);
    if (!startMatch) return '';
    const start = startMatch.index;
    const nextTestMatch = /(?:test|it)\(\s*['"]/g;
    nextTestMatch.lastIndex = start + startMatch[0].length;
    const next = nextTestMatch.exec(fileContent);
    const end = next ? next.index : fileContent.length;
    return fileContent.slice(start, end);
  }
}

function extractSpecRequirements(specContent) {
  const reqs = [];
  const re = /^\s*-\s*\*\*((?:FR|FR-EXT|NFR|AC)-[\w-]+)\*\*:\s*(.+)$/gm;
  let m;
  while ((m = re.exec(specContent)) !== null) {
    reqs.push({ id: m[1], text: m[2] });
  }
  return reqs;
}

function isSensitive(text) {
  return SENSITIVE_KEYWORDS.some((re) => re.test(text));
}

function main() {
  const { specPath, testsDir, minSadPath } = readArgs();

  if (!fs.existsSync(specPath)) fail(`Spec não encontrada: ${specPath}`);
  const specContent = fs.readFileSync(specPath, 'utf8');
  const requirements = extractSpecRequirements(specContent);
  const sensitiveReqs = requirements.filter((r) => isSensitive(r.text));

  if (sensitiveReqs.length === 0) {
    console.log('Nenhum requisito sensível detectado pelas palavras-chave atuais.');
    console.log('RESULTADO: PASS (nada a auditar)');
    return;
  }

  const testFiles = walkTestFiles(testsDir);
  const fileContents = new Map(testFiles.map((f) => [f, fs.readFileSync(f, 'utf8')]));

  // Mapa: requirement ID -> lista de { file, methodName, hasSadPath, isShallow }
  const coverage = new Map(sensitiveReqs.map((r) => [r.id, []]));

  for (const [file, content] of fileContents) {
    const blocks = extractSpecsfyBlocks(content);
    for (const block of blocks) {
      const body = extractMethodBody(content, block);
      const hasSadPath = SAD_PATH_PATTERNS.some((re) => re.test(body));
      const isShallow = SHALLOW_TEST_PATTERNS.some((re) => re.test(body))
        && (body.match(/(?:assert\w*\(|expect\()/g) || []).length <= 3;

      for (const id of block.ids) {
        if (coverage.has(id)) {
          coverage.get(id).push({
            file: path.relative(process.cwd(), file),
            method: block.methodName,
            hasSadPath,
            isShallow,
          });
        }
      }
    }
  }

  console.log(`Auditoria Comportamental Specsfy: ${path.basename(specPath)}`);
  console.log(`Requisitos sensíveis detectados: ${sensitiveReqs.length}\n`);

  let warnings = 0;

  for (const req of sensitiveReqs) {
    const tests = coverage.get(req.id) || [];
    const label = `${req.id}`;

    if (tests.length === 0) {
      console.log(`⚠️  ${label}: SEM nenhum teste vinculado (requisito sensível) — "${req.text.slice(0, 80)}"`);
      warnings++;
      continue;
    }

    const sadPathCount = tests.filter((t) => t.hasSadPath).length;
    const allShallow = tests.every((t) => t.isShallow);

    if (sadPathCount < minSadPath) {
      console.log(`⚠️  ${label}: ${tests.length} teste(s), mas NENHUM parece exercitar caminho triste/falha — "${req.text.slice(0, 80)}"`);
      tests.forEach((t) => console.log(`     - ${t.file} :: ${t.method}`));
      warnings++;
    } else if (allShallow) {
      console.log(`⚠️  ${label}: teste(s) parecem rasos (existência de arquivo / poucas asserções) — "${req.text.slice(0, 80)}"`);
      tests.forEach((t) => console.log(`     - ${t.file} :: ${t.method}`));
      warnings++;
    } else {
      console.log(`✔️  ${label}: ${tests.length} teste(s), caminho triste / validação presente.`);
    }
  }

  console.log('');
  if (warnings === 0) {
    console.log('RESULTADO: PASS');
  } else {
    console.log(`RESULTADO: WARNINGS (${warnings} requisito(s) sensível(is) merecem revisão manual)`);
    console.log('Isto NÃO bloqueia o Delivery Gate automaticamente — é sinal para revisão humana.');
  }
}

main();
