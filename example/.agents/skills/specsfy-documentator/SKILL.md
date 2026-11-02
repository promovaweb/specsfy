---
name: specsfy-documentator
description: Construir a documentação técnica em docs/ e o inventário npm/Composer em .specsfy/PACKAGES.md. Use ao documentar sistemas ou após implementações.
---

# Documentar o sistema

## Preparação obrigatória

Antes de executar esta skill, carregue obrigatoriamente `$specsfy-setup` na
raiz do projeto. Em handoff automático, carregue-o de novo antes desta etapa.
Reutilize a raiz confirmada na conversa e não prossiga se o setup apontar uma
pendência.

## Modo de interação

Modo de interação: `sem perguntas`.
Não formule perguntas nesta skill. Registre como não identificado todo dado
que as fontes executáveis não sustentarem.

1. Ler instruções locais, `PROJECT.md`, `.specsfy/STACK.md`,
   `.specsfy/RULES.md`, `.specsfy/DATABASE.md`, manifests, lockfiles,
   metadados instalados e código existente.
2. Ler [o padrão documental](references/documentation-standard.md) antes de
   alterar a topologia publicada.
3. Construir toda a documentação e `.specsfy/PACKAGES.md`, mesmo quando a
   skill for acionada sem uma spec ou implementação recente:

   ```bash
   node scripts/build_documentation.mjs --project <raiz>
   ```

4. Inspecionar os arquivos gerados e corrigir manualmente somente inferências
   que o código não sustente. Não inventar decisões, relações ou integrações.
5. Executar `--check` para provar que a documentação representa o estado atual:

   ```bash
   node scripts/build_documentation.mjs --project <raiz> --check
   ```

6. Preservar conteúdo humano fora dos blocos `specsfy:documentator`, inclusive
   em `.specsfy/PACKAGES.md`. Tratar o bloco como projeção reconstruível das
   fontes locais.
7. Registrar na evidência da tarefa o comando, resultado e arquivos atualizados.

## Cobertura obrigatória

Manter em `docs/`:

- portal e roteiro de leitura;
- arquitetura, componentes e UML em Mermaid;
- inventário da aplicação e implementações existentes;
- banco e entidades com `erDiagram`;
- fluxos com `flowchart` e `sequenceDiagram`;
- guia e resumo dos testes;
- frontend, views, React e Tailwind;
- bibliotecas e pacotes nativos, de framework, integrados e terceiros, com
  versão, fonte e referência GitHub;
- integrações e variáveis de configuração sem valores sensíveis;
- decisões explícitas e suas fontes.

Manter em `.specsfy/PACKAGES.md`:

- todos os pacotes npm e Composer encontrados nos manifests e lockfiles do
  projeto, inclusive dependências transitivas registradas localmente;
- gerenciador, escopo, nome, versão, finalidade curta e fonte de cada pacote;
- descrição declarada no lockfile ou pacote instalado quando existir;
- aviso explícito quando os metadados locais não comprovarem a finalidade.

Para Laravel, mapear rotas, controllers, models, services, jobs, policies,
Blade, migrations e Pest/PHPUnit. Para Node, Next.js, React ou Astro, mapear
páginas, rotas de API, componentes, módulos, scripts e Vitest/Jest/Node Test.

## Limites

- Não copiar segredos, valores de `.env`, dados de produção ou código inteiro.
- Não apresentar heurística como decisão confirmada.
- Não substituir specs, `PROJECT.md` ou arquivos humanos em `.specsfy/`.
  `PACKAGES.md` é a única projeção reconstruída pela skill nesse diretório e
  preserva conteúdo fora do bloco gerado.
- Não exigir rede para construir. Quando o repositório GitHub de um pacote não
  estiver declarado localmente nem for conhecido, publicar uma busca GitHub
  claramente rotulada, em vez de inventar uma URL.
