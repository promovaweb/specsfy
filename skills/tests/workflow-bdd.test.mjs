/** Registra os cenários das skills com seus steps Node explícitos. */
import { featureTests } from '../../tests/bdd.mjs';
import { captureSteps } from './steps/capture.mjs';
import { contextSteps } from './steps/context.mjs';
import { executionSteps } from './steps/execution.mjs';

const steps = [...captureSteps, ...contextSteps, ...executionSteps];
for (const feature of ['backlog', 'inbox', 'inicializacao_especificacoes', 'contexto_auxiliar', 'documentacao_sistema', 'migrations_planejadas', 'orquestracao_conversacional']) featureTests(`skills/tests/features/${feature}.feature`, steps);
