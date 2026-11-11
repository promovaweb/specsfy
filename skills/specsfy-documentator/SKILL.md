---
name: specsfy-documentator
description: "Reconstrói a documentação técnica completa em docs/ e o registro de pacotes npm e Composer em .specsfy/PACKAGES.md a partir do código existente, manifests e lockfiles, preservando o conteúdo humano. Use depois de cada implementação, quando o monitor de contexto ou o progresso apontar docs/ ou PACKAGES.md ausente ou desatualizado, ou quando o usuário pedir para documentar o sistema. Não use para escrever specs, PROJECT.md ou regras (use specsfy-03-specify, specsfy-setup ou specsfy-aux-rules)."
---

# Documentar o sistema

Esta skill mantém `docs/` e `.specsfy/PACKAGES.md` como retrato fiel do
projeto atual. A documentação é uma projeção reconstruível das fontes locais:
o script gera a base, você confere e corrige somente o que o código não
sustenta.

## Pronto quando

- `build_documentation.mjs --project <raiz> --check` termina sem falha.
- `docs/` cobre toda a lista de `Cobertura obrigatória` e
  `.specsfy/PACKAGES.md` lista todos os pacotes dos manifests e lockfiles.
- Conteúdo humano fora dos blocos `specsfy:documentator` continua intacto.
- A tarefa que acionou a skill registra comando, resultado e arquivos
  atualizados.

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Registre como não identificado todo dado
que as fontes executáveis não sustentarem.

## Executar

1. Leia em paralelo as instruções locais, `PROJECT.md`, `.specsfy/STACK.md`,
   `.specsfy/RULES.md`, `.specsfy/DATABASE.md`, manifests, lockfiles,
   metadados instalados e o código existente. Antes de alterar a topologia
   publicada, leia [o padrão documental](references/documentation-standard.md).
2. Construa toda a documentação e `.specsfy/PACKAGES.md`, mesmo quando a skill
   for acionada sem spec ou implementação recente:

   ```bash
   node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs \
     --project <raiz>
   ```

3. Inspecione os arquivos gerados e corrija manualmente apenas inferências que
   o código não sustente. Não acrescente escolhas de arquitetura, relações ou
   integrações sem fonte.
4. Prove que a documentação representa o estado atual:

   ```bash
   node .agents/skills/specsfy-documentator/scripts/build_documentation.mjs \
     --project <raiz> --check
   ```

5. Registre na tarefa o comando, o resultado e os arquivos atualizados.

O conteúdo humano fica fora dos blocos `specsfy:documentator`, inclusive em
`.specsfy/PACKAGES.md`. O bloco é reconstruído a cada execução; tudo fora
dele é preservado.

## Cobertura obrigatória

Manter em `docs/`:

- portal e roteiro de leitura;
- arquitetura, componentes e UML em Mermaid;
- registro da aplicação e das implementações existentes;
- banco e entidades com `erDiagram`;
- fluxos com `flowchart` e `sequenceDiagram`;
- guia e resumo dos testes;
- frontend, views, React e Tailwind;
- bibliotecas e pacotes nativos, de framework, integrados e terceiros, com
  versão, fonte e referência GitHub;
- integrações e variáveis de configuração sem valores sensíveis;
- decisões explícitas e suas fontes.

Manter em `.specsfy/PACKAGES.md`:

- todos os pacotes npm e Composer encontrados nos manifests e lockfiles,
  inclusive dependências transitivas registradas localmente;
- gerenciador, escopo, nome, versão, finalidade curta e fonte de cada pacote;
- descrição declarada no lockfile ou no pacote instalado, quando existir;
- aviso explícito quando os metadados locais não comprovarem a finalidade.

Mapeamento por stack:

| Stack | O que mapear |
| --- | --- |
| Laravel | rotas, controllers, models, services, jobs, policies, Blade, migrations e Pest/PHPUnit |
| Node, Next.js, React ou Astro | páginas, rotas de API, componentes, módulos, scripts e Vitest/Jest/Node Test |

## Limites

- Não copie segredos, valores de `.env`, dados de produção ou código inteiro.
- Não documente arquivos ignorados pelo Git. Dentro de um repositório, o
  script lê somente arquivos rastreados ou não ignorados pelo `.gitignore`;
  fora dele, usa a lista fixa de pastas geradas.
- Não apresente heurística como fato confirmado.
- Não substitua specs, `PROJECT.md` ou arquivos humanos em `.specsfy/`.
  `PACKAGES.md` é a única projeção reconstruída nesse diretório e preserva o
  conteúdo fora do bloco gerado.
- A construção funciona sem rede. Quando o repositório GitHub de um pacote não
  estiver declarado localmente nem for conhecido, publique uma busca GitHub
  rotulada como tal em vez de inventar uma URL.
