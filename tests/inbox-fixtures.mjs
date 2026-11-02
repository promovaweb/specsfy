/** Compartilha capturas descartáveis para os contratos e steps do CLI Inbox. */
import { join } from 'node:path';
import { ROOT, temporary, put, node } from './helpers.mjs';
export const CAPTURE = '2026-07-28-143205-avisar-clientes-sobre-atrasos.md';
export const ORIGINAL = 'Quero avisar clientes quando uma entrega atrasar, talvez por e-mail.';
export const CAPTURE_CONTENT = '# Inbox: Avisar clientes sobre atrasos\n\n| Metadado | Valor |\n| --- | --- |\n| Status | Capturada |\n| Capturada em | 2026-07-28T14:32:05Z |\n| Slug | avisar-clientes-sobre-atrasos |\n| Backlog derivado | Nenhum |\n| Spec derivada | Nenhuma |\n\n## Texto original\n\n' + ORIGINAL + '\n';
export const SPEC_ID = '0007-avisos-de-atraso';
/** Materializa uma spec mínima sem operar os arquivos reais do repositório. */
export function inboxFixture(t, folder = 'defined', rows = '| Status | Defined |\n| Definition Gate | Passed |\n') {
  const root = temporary(t);
  put(root, 'specs/inbox/' + CAPTURE, CAPTURE_CONTENT);
  const spec = put(root, `specs/${folder}/${SPEC_ID}/spec.md`, '# Especificação: Avisos de atraso\n\n| Campo | Valor |\n| --- | --- |\n| Formato | Specsfy/2.0 |\n' + rows + `\nOrigem: specs/inbox/${CAPTURE}\n`);
  return { root, spec };
}
/** Executa o binário versionado; CLI pode apontar ao head isolado da PR na revisão. */
export function processCapture(root, args = [], cli = join(ROOT, 'cli/bin/specsfy')) {
  return node(cli, ['inbox', 'process', CAPTURE, '--spec', SPEC_ID, '--project', root, '--json', ...args]);
}
