/** Executa os cenários transversais com suas verificações explícitas por step. */
import { featureTests } from './bdd.mjs';
import { policySteps } from './steps/policies.mjs';
for (const name of ['cobertura_minima_spec', 'contexto_auxiliar', 'orquestracao_conversacional', 'seguranca_banco', 'interface_design_system']) featureTests(`tests/features/${name}.feature`, policySteps);
