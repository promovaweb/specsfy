# Modelo de segurança do cofre

## Formato

`credentials.json` guarda um envelope AES-256-GCM:

| Campo | Conteúdo |
| --- | --- |
| `version` | `1` |
| `algorithm` | `aes-256-gcm` |
| `iv` | 12 bytes aleatórios em base64 |
| `tag` | tag de autenticação de 16 bytes em base64 |
| `data` | JSON `{ name: value }` cifrado, em base64 |

A tag garante integridade: um arquivo editado ou cifrado com outra chave
falha ao decifrar e o comando encerra com código 4.

## Chave mestra

32 bytes. Fonte, em ordem: `<BIN>_MASTER_KEY` (64 hex) e depois
`~/.<bin>/master.key`. O arquivo é criado na primeira gravação com 0600.

Rotação: `credentials rotate-key` exige um cofre existente, decifra com a
chave atual e gera uma nova chave aleatória. Com `--from-env`, a chave
antiga deve estar em `master.key`; a variável `<BIN>_MASTER_KEY` fornece
a nova. Ambos os modos gravam a nova chave em `master.key` com 0600.
Sem a flag, remova a variável antiga do shell após a rotação. Não rode
rotações ou gravações concorrentes no cofre.

## O que a cifra cobre

- Leitura casual do arquivo por quem abre a pasta.
- Cópia do arquivo em backup, sincronização de pasta ou repositório por
  engano.
- Ferramentas que varrem o disco à procura de tokens em texto claro.

## O que a cifra não cobre

- Outro processo da mesma conta de usuário, que lê `master.key` e decifra.
- Memória do processo enquanto o valor está em uso.
- Um atacante com acesso root.

Para esses casos, a mitigação é injetar `<BIN>_MASTER_KEY` a partir de um
gerenciador de segredos (1Password CLI, Bitwarden, Vault, variáveis do CI) e
não gravar `master.key`.

## Regras de código

- Nunca `console.log(value)`, nem em modo debug.
- Mensagens de erro citam o nome da credencial, nunca o valor.
- `mask()` para qualquer exibição sem `--reveal`.
- Em `--json`, `credentials get` sem `--reveal` devolve `masked` e
  `length`, não `value`.
- `credentials_status` expõe `vaultStatus()`. `doctor` também testa se o
  cofre pode ser decifrado, sem devolver valores. O status do cofre sozinho
  não comprova sua leitura: em falha, `vaultStatus()` pode devolver lista vazia.
- Testes usam `<BIN>_HOME` apontando para pasta temporária e nunca tocam em
  `~/.<bin>/` da máquina.
