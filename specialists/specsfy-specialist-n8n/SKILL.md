---
name: specsfy-specialist-n8n
description: Construir, hospedar e integrar automações n8n com workflow legível, operação recuperável e contrato de webhook explícito. Use no modo workflows para nó, item, expressão, credencial, tratamento de erro, retry, sub-workflow e fila de trabalho; no modo self-hosting para Docker e Compose, variável de ambiente, banco Postgres, queue mode com Redis, webhook atrás de proxy reverso, backup e atualização de versão; no modo integration para API pública do n8n, webhook como contrato, chave de API, idempotência e versionamento de workflow. Não use para release e deploy da aplicação que chama o n8n (`$specsfy-specialist-delivery`), para a operação do Postgres e do Redis (`$specsfy-specialist-postgres` e `$specsfy-specialist-redis`) nem para o host Debian e o proxy (`$specsfy-specialist-server`).
---

# n8n

Cobre a automação que roda em produção. O modo workflows organiza nó, item,
expressão e erro; o modo self-hosting decide instalação, banco, fila, proxy e
recuperação; o modo integration trata a API pública, o webhook como contrato e o
versionamento do workflow.

## Quando usar

| Situação | Modo | Abra |
| --- | --- | --- |
| Criar ou revisar workflow, escolher nó, resolver expressão, organizar item, configurar credencial, tratar erro com retry, criar sub-workflow ou fila de trabalho | workflows | [Nó, item, expressão e erro](references/workflows.md) |
| Instalar com Docker ou Compose, configurar variável de ambiente, apontar para Postgres, ativar queue mode com Redis, publicar webhook atrás de proxy reverso, fazer backup ou atualizar versão | self-hosting | [Instalação, banco, fila e proxy](references/self-hosting.md) |
| Consumir a API pública do n8n, desenhar webhook como contrato, autenticar com chave de API, garantir idempotência, versionar workflow ou promover entre ambientes | integration | [API, webhook e versionamento](references/integration.md) |

Não use para:

- Release, versionamento de imagem e rollout da aplicação ao redor do n8n. Use
  `$specsfy-specialist-delivery`.
- Configuração interna do Postgres e do Redis usados pelo n8n. Use
  `$specsfy-specialist-postgres` e `$specsfy-specialist-redis`; aqui se decide
  qual instância o n8n consome e com que parâmetro.
- Host Debian, systemd, firewall e proxy reverso do servidor. Use
  `$specsfy-specialist-server`.
- Credencial de terceiro, autorização de usuário final e segredo da aplicação.
  Use `$specsfy-specialist-application-security`.

Combine com `$specsfy-specialist-docker` quando a implantação for Compose ou
Swarm, com `$specsfy-specialist-observability` quando o sinal do n8n entrar no
SLO e com `$specsfy-specialist-git` quando o workflow exportado for versionado no
repositório.

## No Specsfy

1. **Fonte de entrada por fase**
   - `specsfy-02-backlog`: leia o item indicado em `specs/backlog/`. A fase
     registra decisões e sinais no próprio item quando ainda não há spec.
   - `specsfy-03-specify` e `specsfy-04-validate`: use a
     spec aberta indicada pela fase.
   - `specsfy-05-tasks`: sugira especialistas e modos para a fase sincronizar
     plano e tarefas. A criação e a decomposição da seção 14 cabem à fase 05.
   - `specsfy-06-implement`: limite a atuação à tarefa e ao passo carregado
     pela fase. O modo tests conclui o checklist da tarefa em `prepare`.
2. Quando houver spec, leia a spec aberta indicada pela fase chamadora. Se
   receber um identificador inequívoco, resolva com
   `specsfy specs show <id> --content`. Confira a linha `| Especialistas |`,
   a subseção `#### Especialistas` em `### 8. Plano técnico` e a seção em
   elaboração. Consulte `.specsfy/STACK.md`, `.specsfy/RULES.md` e
   `.specsfy/DATABASE.md` quando o modo tocar banco. Siga o modo indicado:
   `Especialista: $specsfy-specialist-n8n (workflows)`, `(self-hosting)` ou
   `(integration)`. Sem indicação, confirme versão, modo de execução e objetivo.
3. Entregue conclusão, lacunas e evidências à fase chamadora. A fase dona
   registra a saída na spec ou no item de backlog. O especialista preserva
   a spec, seus gates e a tarefa ativa.
4. Inclua na devolutiva, quando aplicável, versão do n8n, revisão do workflow,
   contrato de webhook, configuração efetiva, banco, fila, backup e evidência.
   Identifique a credencial pelo nome e dono, preservando o segredo.

## Fluxo

1. Leia [references/standards.md](references/standards.md) e descubra versão,
   modo de execução (`regular` ou `queue`), banco, broker, volume de execução e o
   contrato de entrada antes de recomendar.
2. Classifique o pedido: workflows para lógica e erro, self-hosting para
   instalação e operação, integration para contrato e promoção.
3. Descreva o gatilho, a entrada esperada e o efeito externo antes de montar o
   nó. Workflow sem contrato de entrada testável não é revisável.
4. Trate erro e retry no desenho, não depois do incidente: caminho de falha,
   destino da execução com erro e alerta.
5. Valide com execução real e com as comprovações da seção Validação antes de
   entregar.

### Modo workflows

1. Modele o fluxo em etapa legível: gatilho, normalização, decisão, efeito
   externo e resposta. Nome do nó descreve a ação, não o tipo do nó.
2. Trabalhe com item, não com "linha": cada nó recebe lista de itens com `json` e
   `binary`, e expressão é avaliada por item.
3. Escreva expressão referenciando o nó anterior pelo nome, e teste com dado
   fixado. Expressão que depende de índice de item quebra quando a ordem muda.
4. Escolha `stopWorkflow`, `continueRegularOutput` ou `continueErrorOutput`
   para `onError`. Configure retry só com garantia de idempotência. Detalhe em
   [references/workflows.md](references/workflows.md).
5. Extraia lógica repetida para sub-workflow com entrada e saída declaradas, e
   deixe o workflow pai legível.

### Modo self-hosting

1. Confirme imagem e versão fixas, volume de dado e usuário de execução.
2. Escolha banco: Postgres em produção, SQLite só em desenvolvimento declarado.
3. Configure variável de ambiente por ambiente, com segredo fora do arquivo
   versionado. `N8N_ENCRYPTION_KEY` precisa ser estável e igual em todos os
   processos que leem credencial.
4. Quando o volume exigir, use queue mode com Postgres e Redis compartilhados,
   main, worker e, se necessário, processador de webhook. Configure runners
   externos nos processos que executam Code se houver dados sensíveis.
5. Configure URL pública e proxy reverso com o caminho de webhook correto, e
   valide a URL que o n8n gera, não só a que você digita.
6. Teste backup, restauração e atualização de versão. Passo a passo em
   [references/self-hosting.md](references/self-hosting.md).

### Modo integration

1. Defina o contrato do webhook: método, caminho, cabeçalho de autenticação,
   corpo, resposta, status e prazo.
2. Diferencie URL de teste e URL de produção, e confirme qual delas o consumidor
   usa.
3. Autentique a API pública com chave de escopo adequado e trate `429` com
   espera progressiva.
4. Confira o suporte da API pública a `Idempotency-Key` desde 2.45.0. Nos
   webhooks de usuário, reserve uma chave estável de forma atômica e persista
   o resultado para repetição. Use o ID de execução para correlação.
5. Versione o workflow exportado no Git e promova a mesma versão entre ambientes.
   Detalhe em [references/integration.md](references/integration.md).

## Padrões

- Imagem do n8n com versão fixa. `latest` muda comportamento de nó e de banco sem
  que ninguém tenha pedido.
- `N8N_ENCRYPTION_KEY` definida explicitamente, guardada em cofre e incluída no
  backup. Recriar container sem a chave torna credencial existente ilegível.
- Postgres em produção. SQLite em queue mode não é suportado e limita escrita
  concorrente.
- Queue mode separa `main`, `worker` e, quando necessário, `webhook`; concurrency
  por worker é declarada, não deixada no acaso.
- `N8N_WEBHOOK_URL` desde 2.30.0 e `N8N_EDITOR_BASE_URL` apontam aos endereços
  públicos correspondentes. Com a variável de webhook ausente, a URL pode
  incluir a porta interna. `WEBHOOK_URL` é o nome legado.
- `N8N_PROXY_HOPS` segue o caminho real. O último proxy encaminha
  `X-Forwarded-For`, `X-Forwarded-Host` e `X-Forwarded-Proto`.
- Em queue mode, use armazenamento binário legível por todos os processos.
- Configure runner externo para Code em instância com dados sensíveis
  (regra da casa), com a mesma versão do n8n e segredo do broker.
- Webhook com caminho próprio e nome estável, autenticação por cabeçalho ou
  assinatura e validação de corpo antes do efeito externo.
- Toda chamada externa com retry é idempotente ou usa chave de idempotência.
  Retry cego em criação de pedido duplica registro.
- Execução com erro tem destino: Error Workflow configurado, alerta entregue e
  retenção de dado de execução definida.
- Publique no Git o export sanitizado da revisão validada. Revise nomes de
  credenciais, parâmetros, headers literais e dados fixados.
- Retenção de execução configurada (`EXECUTIONS_DATA_PRUNE`, idade e quantidade).
  Banco que cresce sem poda para de responder.
- Backup cobre banco, chave de criptografia, arquivo de workflow e configuração.
  Só o dump do banco não devolve a instância.

## Antipadrões

- SQLite com queue mode ou múltiplos workers: escrita concorrente falha e a fila
  não anda.
- Container recriado sem `N8N_ENCRYPTION_KEY`: credencial existente vira erro de
  descriptografia e o workflow para.
- URL de webhook gerada com host ou porta interna atrás do proxy.
- Editor exposto sem TLS, sem autenticação e sem restrição de rede.
- Retry infinito em API de terceiro: amplifica incidente e pode bloquear a conta.
- Lógica de negócio só no canvas, sem export: não há revisão, diff nem rollback.
- Credencial copiada em nó `Set` ou em `Code`: segredo no JSON do workflow e em
  qualquer export.
- Execução com dado sensível sem poda nem mascaramento: banco cresce e vaza
  informação em log.
- API pública habilitada sem necessidade e com chave de escopo total.
- Atualização de versão sem ler nota de release e sem backup testado.

## Validação

- Execução manual com dado fixado produz saída esperada, e execução com entrada
  inválida segue o caminho de erro declarado.
- Webhook responde com o status e o corpo do contrato, testado por `curl` com e
  sem credencial.
- Retry testado com falha simulada de dependência, confirmando que não há efeito
  duplicado.
- `docker compose config` valida interpolação e variável obrigatória antes de
  subir.
- Main e worker respondem a `/healthz` e `/healthz/readiness`. Confira conexão
  com banco e Redis e rode um webhook publicado em staging.
- Falha automática aciona o Error Workflow configurado e entrega o alerta.
- Restauração de backup em instância descartável, com workflow abrindo e
  credencial funcionando.
- Promoção entre ambientes gera diff apenas no que é esperado, e a versão
  publicada é a mesma validada.
- Não declare automação estável, segura ou recuperável sem essas evidências;
  execução verde em um caso não cobre erro, retry e restauração.

## Skills relacionadas

- `$specsfy-specialist-docker` cuida da imagem, do Compose e da stack que
  executam o n8n; aqui se decide configuração, banco e fila.
- `$specsfy-specialist-postgres` opera o banco que guarda workflow, execução e
  credencial; este especialista define o que o n8n grava e como poda.
- `$specsfy-specialist-redis` opera o broker do queue mode; aqui se decide
  topologia de fila e concorrência.
- `$specsfy-specialist-server` define o host, o proxy reverso e a rede que expõem
  o webhook.
- `$specsfy-specialist-cloudflare` define DNS, TLS e Tunnel que publicam a URL do
  webhook; a configuração da instância e do workflow continua aqui.
- `$specsfy-specialist-delivery` coordena release da aplicação que integra com o
  n8n; este especialista entrega o contrato e a versão do workflow.
- `$specsfy-specialist-application-security` define ameaça e autorização;
  credencial, chave de API e webhook autenticado materializam a decisão.
- `$specsfy-specialist-observability` define métrica, log e alerta; aqui se
  garante que execução com erro gera sinal utilizável.
- `$specsfy-specialist-git` define branch e revisão do workflow exportado; o
  formato do JSON e a promoção entre ambientes ficam aqui.

Leia [references/standards.md](references/standards.md) para o índice dos modos,
as regras comuns e as fontes oficiais,
[references/workflows.md](references/workflows.md) para nó, item, expressão e
erro, [references/self-hosting.md](references/self-hosting.md) para instalação,
banco, fila e proxy e [references/integration.md](references/integration.md) para
API, webhook e versionamento.
