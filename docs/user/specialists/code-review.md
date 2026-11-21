# Code Review

O especialista Code Review orienta o agente na revisão técnica de uma mudança
já escrita. A revisão parte da spec e dos testes e entrega achados ordenados
por severidade, cada um com local exato, condição de falha e correção provável.

## Quando usar

- Há uma branch, um commit ou um pull request aguardando avaliação para o
  merge.
- Você quer uma segunda opinião sobre uma mudança, mesmo sem pull request
  aberto.
- A mudança altera autenticação, autorização ou entradas externas. Nesse caso,
  combine com o especialista Segurança de Aplicações.

Para desenhar uma estrutura nova, use o especialista Arquitetura de Software. A
revisão avalia o que já foi escrito.

## Como ele trabalha

1. Fixa a base de comparação e o escopo exato das alterações.
2. Lê a spec, a issue, as condições de aceite e as instruções do repositório.
3. Relaciona cada arquivo alterado ao comportamento que ele afeta, como
   permissões, contratos de API, configuração ou dependências.
4. Avalia corretude, casos de borda, segurança e concorrência. O estilo só
   impede o merge quando nenhuma ferramenta automática o verifica.
5. Confere se os testes falhariam sem a correção.
6. Confirma cada suspeita no código e nos chamadores antes de relatar.
7. Relata por severidade, com `arquivo:linha`, condição de disparo, impacto e
   correção provável.

## Padrões aplicados

- Bugs e falhas concretas têm prioridade sobre preferências de estilo.
- Cada achado descreve a entrada, a consequência observável e a comprovação
  (linha, teste ou log).
- A revisão considera clientes existentes, concorrência, rollback e
  observabilidade, além do caminho principal.
- Escopo ausente impede o merge. Melhoria futura vira comentário.
- O agente não repete o que o lint, o formatter ou o type checker já apontam.
- Quando uma lente não encontra problemas, o relatório diz isso sem afirmar
  ausência de falhas além do que foi observado.

## Erros que ele evita

- Recusar o merge por gosto pessoal de nome ou formatação.
- Aprovar porque os testes passam, sem conferir se o teste novo cobre o
  comportamento alterado.
- Revisar arquivo por arquivo e perder efeitos cruzados, como uma assinatura
  alterada com chamadores esquecidos.
- Relatar que algo parece inseguro sem apontar o vetor e a entrada.

## Como conferir o resultado

- A revisão cobre configuração, migrations e chamadores afetados fora das
  linhas alteradas.
- Cada achado foi confirmado no código e na suíte de testes.
- A lista final segue a severidade, calculada por probabilidade e impacto.
- O relatório termina com o que foi revisado e com o que ficou sem
  confirmação.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-code-review --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Debugging](debugging.md) reproduz e explica um defeito encontrado na
  revisão.
- [TypeScript](typescript.md) aprofunda contratos de tipo.
- [Interface](interface.md) aprofunda semântica, teclado e WCAG.
- [Segurança de Aplicações](application-security.md) aprofunda identidade e
  autorização.
- [Arquitetura](architecture.md) avalia acoplamento e estrutura.
- [Git](git.md) entra quando a revisão precisa ser refeita depois de um
  conflito.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-code-review/SKILL.md),
com lentes de revisão, escala de severidade e formato de achado no arquivo de
referência da mesma pasta.
