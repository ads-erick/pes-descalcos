#!/usr/bin/env bash
# Backup do banco (schema public) e das fotos das cartinhas, num arquivo só criptografado.
#
#   scripts/backup.sh <pasta de saída>
#
# Precisa de DATABASE_URL e BACKUP_PASSPHRASE no ambiente. PG_DUMP e PSQL trocam o binário
# (o pg_dump tem que ser da mesma versão do Postgres do Supabase ou mais novo).
# O repositório é público, então o arquivo sai sempre criptografado: sem a senha ninguém lê.
set -euo pipefail

: "${DATABASE_URL:?defina DATABASE_URL}"
: "${BACKUP_PASSPHRASE:?defina BACKUP_PASSPHRASE}"
saida="${1:?informe a pasta de saída}"
PG_DUMP="${PG_DUMP:-pg_dump}"
PSQL="${PSQL:-psql}"

# Secret colado com quebra de linha no fim chega aqui com ela: o pg_dump tenta um banco chamado
# "postgres\n" e o gpg criptografa com uma chave diferente da senha guardada. Apara as pontas.
aparar() {
  local v="$1"
  v="${v#"${v%%[![:space:]]*}"}"
  printf '%s' "${v%"${v##*[![:space:]]}"}"
}
DATABASE_URL="$(aparar "$DATABASE_URL")"
BACKUP_PASSPHRASE="$(aparar "$BACKUP_PASSPHRASE")"

# O pg_dump não funciona pelo pooler em modo transação (6543); a mesma URL na 5432 é o modo sessão
url="${DATABASE_URL/:6543\//:5432/}"

temp="$(mktemp -d)"
trap 'rm -rf "$temp"' EXIT
nome="pes-descalcos-$(date -u +%Y-%m-%dT%H%MZ)"
pasta="$temp/$nome"
mkdir -p "$pasta/fotos" "$saida"

# --clean --if-exists: restaurar por cima de um banco existente recria as tabelas do zero
"$PG_DUMP" "$url" --schema=public --no-owner --no-privileges --clean --if-exists --file="$pasta/banco.sql"
grep -q "CREATE TABLE public.jogador" "$pasta/banco.sql" || { echo "dump sem a tabela jogador" >&2; exit 1; }

# O bucket é público, então as fotos vêm pela própria URL, sem chave nenhuma.
# Foto que falhar vira aviso: não vale perder o backup do banco por causa dela.
"$PSQL" "$url" -At -v ON_ERROR_STOP=1 -c "select foto_url from jogador where foto_url is not null" |
  while read -r foto; do
    caminho="${foto#*/object/public/fotos/}"
    if [[ "$caminho" == "$foto" || "$caminho" == *..* ]]; then
      echo "::warning::foto fora do bucket, ignorada: $foto"
      continue
    fi
    mkdir -p "$pasta/fotos/$(dirname "$caminho")"
    curl -fsS --retry 3 -o "$pasta/fotos/$caminho" "$foto" || echo "::warning::foto não baixada: $caminho"
  done

tar -C "$temp" -czf - "$nome" |
  gpg --batch --yes --pinentry-mode loopback --passphrase-fd 3 \
    --symmetric --cipher-algo AES256 -o "$saida/$nome.tar.gz.gpg" 3<<<"$BACKUP_PASSPHRASE"

echo "backup: $saida/$nome.tar.gz.gpg ($(du -h "$saida/$nome.tar.gz.gpg" | cut -f1), $(find "$pasta/fotos" -type f | wc -l) fotos)"
