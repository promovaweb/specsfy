/** Executa os cenários de documentação e identidade por seus steps Node. */
import { featureTests } from './bdd.mjs';
import { documentationSteps } from './steps/documentation.mjs';
import { brandSteps } from './steps/brand.mjs';
import { monorepoDocumentationSteps } from './steps/monorepo-documentation.mjs';
for (const name of ['contexto_projeto', 'documentacao_sistema', 'icone_framework']) featureTests(`tests/features/${name}.feature`, [...documentationSteps, ...brandSteps]);
featureTests('tests/features/documentacao_monorepo.feature', monorepoDocumentationSteps);
