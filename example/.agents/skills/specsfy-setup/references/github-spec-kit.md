# Compatibilidade com GitHub Spec Kit

- Fonte oficial: [repositório `github/spec-kit`](https://github.com/github/spec-kit).
- Estrutura confirmada no
  [guia de atualização](https://github.com/github/spec-kit/blob/main/docs/upgrade.md).
- Observado em: 2026-08-13.
- Adaptação: projeção somente de leitura criada pelo `specsfy-setup`.

## Detecção

A presença de `.specify/memory/constitution.md` ativa a integração. O setup lê
essa constituição e percorre recursivamente todos os arquivos regulares em
`specs/`. O percurso inclui `spec.md`, `plan.md`, `tasks.md`, contratos,
modelos de dados, guias, pesquisas e anexos próprios de cada feature.

## Projeção do Specsfy

O setup escreve `.specsfy/SPECKIT.md`. O bloco delimitado por
`specsfy:speckit` registra caminho, tipo, título e SHA-256 de cada fonte. Notas
humanas fora do bloco permanecem intactas em execuções posteriores.

A projeção orienta agentes a abrir os arquivos originais. Ela não duplica o
conteúdo normativo, não converte uma feature para o formato nativo do Specsfy e
não autoriza implementação.

## Preservação e convivência

O setup não escreve, move, renomeia nem remove conteúdo de `.specify/` ou
`specs/`. Os artefatos existentes continuam pertencendo ao GitHub Spec Kit.
Uma feature nova pode seguir o fluxo nativo do Specsfy sem modificar as
features anteriores.

A constituição continua sendo a governança do projeto. Quando uma regra dela
for incompatível com `.specsfy/RULES.md` ou com o fluxo do Specsfy, registre os
dois textos e peça orientação antes de alterar a feature.
