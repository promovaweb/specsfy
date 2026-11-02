/** Executa os cenários integrados do CLI com steps Node. */
import { featureTests } from './bdd.mjs';
import { cliSteps } from './steps/cli.mjs';
for (const name of ['cli_progress', 'cli_tests', 'cli_updater', 'cli_skills_ux']) featureTests(`tests/features/${name}.feature`, cliSteps);
