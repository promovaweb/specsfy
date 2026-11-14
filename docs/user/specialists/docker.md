# Docker

O especialista Docker orienta o agente na criação e na revisão de imagens,
arquivos Compose de desenvolvimento e políticas de tag. Ele produz imagens
pequenas, reproduzíveis e executadas sem root, com healthcheck e tratamento de
sinais definidos.

## Quando usar

- Você vai escrever ou revisar `Dockerfile`, `docker-compose.yml`,
  `.dockerignore` ou a política de tag e de registry.
- Um container não faz build, não sobe ou não responde ao healthcheck.
- Você quer reduzir o tamanho da imagem, remover um segredo vazado em uma
  camada ou corrigir um processo que ignora o `SIGTERM`.

Orquestração com vários nós, réplicas, secrets de cluster e redes overlay
ficam com o especialista Docker Swarm. Aqui, o Compose atende ao ambiente
local e à CI.

## Como ele trabalha

1. Identifica a arquitetura alvo, o runtime base, o build context e o contrato
   de execução com variáveis, portas e volumes.
2. Inspeciona o `Dockerfile`, o `.dockerignore`, o Compose e a política de
   imagens do projeto.
3. Em um release ou deploy, atua sob o especialista Deploy, usa a versão do
   especialista Versionamento e recusa a referência quando o
   `verify-docker-tag` aponta diferença.
4. Separa build e runtime em estágios. A imagem final fica sem compilador,
   cache de pacotes ou código que não roda em produção.
5. Fixa lockfiles e a versão da imagem base, de preferência por digest.
6. Executa o processo como usuário sem root, com privilégios limitados e sem
   segredos na imagem.
7. Define healthcheck, sinais, volumes, redes e configuração externa.
8. Constrói a imagem, procura vulnerabilidades e testa a execução com o mesmo
   usuário e as mesmas variáveis de produção.

## Padrões aplicados

- Extensões nativas compilam em estágios independentes, para que uma mudança
  em Redis não invalide toda a toolchain.
- Serviços que compartilham o código usam uma imagem única, com modos de
  processo no entrypoint, como HTTP, scheduler, filas e WebSocket.
- As tags de SemVer e de commit são imutáveis e o digest usado no deploy fica
  registrado, com a tag Git publicada depois da imagem.
- Caches de framework que dependem da configuração de runtime são gerados no
  entrypoint.
- A ordem das instruções aproveita o cache, com a instalação de dependências
  antes da cópia do código.
- Credenciais de build usam `RUN --mount=type=secret`, porque `ARG` e `ENV`
  ficam gravados no histórico das camadas.
- O `.dockerignore` exclui `.git`, `node_modules`, artefatos locais e `.env`.
- O `ENTRYPOINT` usa a forma exec, ou um init mínimo como `tini`, para receber
  sinais.
- Volumes nomeados ou bind mounts guardam o conteúdo persistente fora da
  camada gravável.
- Quando a carga permite, o container roda com limites de recurso e
  filesystem somente leitura.

## Erros que ele evita

- `latest` como única tag em produção.
- `ADD` para copiar arquivos locais, com descompactação e download implícitos.
- Imagem que atende tráfego rodando como root.
- Compilador e headers na camada final.
- Healthcheck que só confere a porta e ignora o banco ou a fila.

## Como conferir o resultado

- Builds com e sem cache produzem imagens equivalentes.
- A imagem roda com o usuário, a arquitetura e as variáveis do ambiente alvo.
- Healthcheck, `docker stop` dentro do prazo, portas, volumes e DNS interno
  foram exercitados, inclusive com uma dependência indisponível.
- O SBOM ou o scanner do projeto rodou sobre a imagem final, com tamanho e
  camadas inspecionados.

## Como instalar

```bash
npx skills add https://github.com/promovaweb/specsfy \
  --skill specsfy-specialist-docker --agent universal --copy --full-depth
```

## Especialistas relacionados

- [Deploy](deploy.md) coordena a entrega completa.
- [Versionamento](versioning.md) confere a identidade da imagem.
- [Docker Swarm](docker-swarm.md) cuida do cluster de produção.
- [Segurança de Aplicações](application-security.md) revisa a cadeia de
  suprimentos.
- [Observabilidade](observability.md) cuida de logs, métricas e traces do
  processo.
- [PostgreSQL](postgres.md) e [Redis](redis.md) cuidam do que roda dentro dos
  serviços de banco e cache.
- [Supabase](supabase.md) entra quando a CLI do Supabase orquestra o ambiente
  local.
- [Laravel](laravel.md) define workers, scheduler e variáveis da aplicação.
- [Debian Server](debian-server.md) cuida do host que executa a imagem.
- [Relatório de servidor](server-report.md) coleta logs e uso de disco por
  host.

## Referência técnica

As instruções completas que o agente segue estão no
[SKILL.md do especialista](../../../specialists/specsfy-specialist-docker/SKILL.md),
com build, Compose, segurança e cadeia de suprimentos no arquivo de referência
da mesma pasta.
