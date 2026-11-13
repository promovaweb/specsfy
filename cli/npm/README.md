# @promovaweb/specsfy

<!-- markdownlint-disable MD033 -->
<p align="center">
  <picture>
    <source srcset="https://promovaweb.com/opensource/specsfy/icon.svg"
    type="image/svg+xml">
    <img
      src="https://promovaweb.com/opensource/specsfy/icon.png"
      alt="Logo do Specsfy"
      width="128"
    >
  </picture>
</p>
<!-- markdownlint-enable MD033 -->

Wrapper npm do binário `specsfy`. A instalação não traz o binário: na
primeira execução, `bin/specsfy.cjs` baixa o executável da plataforma
(`specsfy-<os>-<arch>[.exe]`) do GitHub Release da mesma versão do pacote,
confere o SHA-256 com o `SHA256SUMS` da release e o guarda em cache. As
execuções seguintes usam o cache e repassam argumentos, `stdin`, `stdout`,
`stderr` e exit code.

```bash
npm install -g @promovaweb/specsfy
specsfy --version
```

Plataformas: `linux-x64`, `linux-arm64`, `darwin-x64`, `darwin-arm64` e
`windows-x64`. O pacote não tem dependências.

| Variável | Efeito |
| --- | --- |
| `SPECSFY_BINARY` | Usa este executável e não baixa nada. |
| `SPECSFY_DOWNLOAD_URL` | Base de download com o layout `<base>/v<versão>/<arquivo>` (padrão: GitHub Releases). |
| `SPECSFY_CACHE_DIR` | Diretório do cache (padrão: `~/.cache/specsfy`, `%LOCALAPPDATA%\specsfy\cache` no Windows). |

O binário iniciado pelo wrapper recebe `SPECSFY_NPM_WRAPPER=1`; com isso,
`specsfy upgrade` atualiza o pacote pelo npm em vez de trocar o executável.
Sem npm, instale o binário avulso com `scripts/install-cli.sh` do
repositório.
