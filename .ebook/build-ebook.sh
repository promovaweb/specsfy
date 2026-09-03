#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_ROOT="$ROOT/docs/user"
EBOOK_ROOT="$ROOT/ebook"
BUILD_ROOT="$SCRIPT_DIR/build"
VERSION_FILE="$ROOT/VERSION"
ORDER_FILE="$DOCS_ROOT/reading-order.txt"
MANIFEST="$EBOOK_ROOT/build.json"
PDF_STYLE="$SCRIPT_DIR/pdf.css"
EPUB_STYLE="$SCRIPT_DIR/epub.css"
TEMPLATE="$SCRIPT_DIR/template.html"
METADATA="$SCRIPT_DIR/metadata.yaml"
LINK_FILTER="$SCRIPT_DIR/external-links.lua"
METADATA_FILTER="$SCRIPT_DIR/strip-document-metadata.lua"
METADATA_EXTRACTOR="$SCRIPT_DIR/extract-document-metadata.py"
RETENTION_SCRIPT="$SCRIPT_DIR/prune-editions.py"
LOGO_SVG="$ROOT/brand/logo/icon.svg"
LOGO_PNG="$ROOT/brand/logo/icon.png"
STYLE_GUIDE="$ROOT/brand/style-guide.html"

fail() {
  echo "Erro: $*" >&2
  exit 1
}

relative_path() {
  realpath --relative-to="$ROOT" "$1"
}

[ -f "$VERSION_FILE" ] || fail "VERSION ausente na raiz."
VERSION="$(tr -d '[:space:]' < "$VERSION_FILE")"
[[ "$VERSION" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]] \
  || fail "VERSION deve conter SemVer estável, por exemplo 1.0.0."

STEM="Specsfy-Guia-do-Usuario-v$VERSION"
PDF_OUT="$EBOOK_ROOT/$STEM.pdf"
EPUB_OUT="$EBOOK_ROOT/$STEM.epub"
PDF_ALIAS="$EBOOK_ROOT/ebook-specsfy.pdf"
EPUB_ALIAS="$EBOOK_ROOT/ebook-specsfy.epub"

required_sources=(
  "$VERSION_FILE"
  "$ORDER_FILE"
  "$PDF_STYLE"
  "$EPUB_STYLE"
  "$TEMPLATE"
  "$METADATA"
  "$LINK_FILTER"
  "$METADATA_FILTER"
  "$METADATA_EXTRACTOR"
  "$RETENTION_SCRIPT"
  "$SCRIPT_DIR/build-ebook.sh"
  "$LOGO_SVG"
  "$LOGO_PNG"
  "$STYLE_GUIDE"
)
for source in "${required_sources[@]}"; do
  [ -f "$source" ] || fail "fonte obrigatória ausente: $(relative_path "$source")"
done

grep -Fxq 'lang: "pt-BR"' "$METADATA" \
  || fail '.ebook/metadata.yaml deve declarar lang: "pt-BR".'
grep -Fq '<html lang="pt-BR">' "$TEMPLATE" \
  || fail '.ebook/template.html deve declarar lang="pt-BR".'

mapfile -t ordered_pages < <(
  sed -e '/^[[:space:]]*#/d' -e '/^[[:space:]]*$/d' "$ORDER_FILE"
)
[ "${#ordered_pages[@]}" -gt 0 ] \
  || fail "docs/user/reading-order.txt está vazio."

declare -A ordered_set=()
page_paths=()
page_inputs=()
for relative in "${ordered_pages[@]}"; do
  [[ "$relative" == docs/user/*.md ]] \
    || fail "página fora de docs/user/reading-order.txt: $relative"
  [ -f "$ROOT/$relative" ] || fail "página ausente: $relative"
  [ -z "${ordered_set[$relative]:-}" ] || fail "página duplicada: $relative"
  ordered_set["$relative"]=1
  page_paths+=("$ROOT/$relative")
  page_inputs+=("${relative#docs/user/}")
done

while IFS= read -r relative; do
  [ -n "${ordered_set[$relative]:-}" ] \
    || fail "página não ordenada em docs/user/reading-order.txt: $relative"
done < <(
  find "$DOCS_ROOT" -type f -name '*.md' -print0 \
    | sort -z \
    | xargs -0 -r realpath --relative-to="$ROOT"
)

source_files=()
while IFS= read -r -d '' source; do
  source_files+=("$source")
done < <(find "$DOCS_ROOT" -type f -print0 | sort -z)
source_files+=("${required_sources[@]}")

SOURCE_SHA="$(
  for source in "${source_files[@]}"; do
    printf '%s\\0%s\\n' \
      "$(relative_path "$source")" \
      "$(sha256sum "$source" | cut -d' ' -f1)"
  done | sha256sum | cut -d' ' -f1
)"

check_manifest() {
  [ -f "$MANIFEST" ] || fail "ebook/build.json ausente; execute make ebook."
  [ -f "$PDF_OUT" ] || fail "$(basename "$PDF_OUT") ausente; execute make ebook."
  [ -f "$EPUB_OUT" ] || fail "$(basename "$EPUB_OUT") ausente; execute make ebook."
  [ -f "$PDF_ALIAS" ] || fail "ebook-specsfy.pdf ausente; execute make ebook."
  [ -f "$EPUB_ALIAS" ] || fail "ebook-specsfy.epub ausente; execute make ebook."
  cmp -s "$PDF_OUT" "$PDF_ALIAS" || fail "ebook-specsfy.pdf não corresponde à edição vigente."
  cmp -s "$EPUB_OUT" "$EPUB_ALIAS" || fail "ebook-specsfy.epub não corresponde à edição vigente."

  VERSION="$VERSION" SOURCE_SHA="$SOURCE_SHA" PDF_OUT="$PDF_OUT" \
    EPUB_OUT="$EPUB_OUT" MANIFEST="$MANIFEST" python3 - <<'PY'
import hashlib
import json
import os
from pathlib import Path

manifest = json.loads(Path(os.environ["MANIFEST"]).read_text(encoding="utf-8"))
expected = {
    "version": os.environ["VERSION"],
    "edition": f"v{os.environ['VERSION']}",
    "source_sha256": os.environ["SOURCE_SHA"],
}
for key, value in expected.items():
    if manifest.get(key) != value:
        raise SystemExit(
            f"Erro: {key} desatualizado; execute make ebook."
        )

for kind, env_name in (("pdf", "PDF_OUT"), ("epub", "EPUB_OUT")):
    path = Path(os.environ[env_name])
    record = manifest.get("artifacts", {}).get(kind, {})
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if record.get("file") != path.name or record.get("sha256") != digest:
        raise SystemExit(
            f"Erro: hash de {path.name} desatualizado; execute make ebook."
        )
PY
  unzip -tqq "$EPUB_OUT" || fail "EPUB inválido: $(basename "$EPUB_OUT")"
  while IFS= read -r entry; do
    unzip -p "$EPUB_OUT" "$entry" | xmllint --noout - \
      || fail "XML inválido no EPUB: $entry"
  done < <(
    unzip -Z1 "$EPUB_OUT" \
      | grep -E '\.(xhtml|opf|ncx|xml)$'
  )
  PDF_OUT="$PDF_OUT" EPUB_OUT="$EPUB_OUT" python3 - <<'PY'
import posixpath
import subprocess
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit
from zipfile import ZipFile
import os

failures = []
pdf_document = ET.fromstring(subprocess.run(
    [
        "pdftohtml",
        "-xml",
        "-hidden",
        "-i",
        os.environ["PDF_OUT"],
        "-stdout",
    ],
    check=True,
    text=True,
    capture_output=True,
).stdout)
pdf_pages = {
    node.attrib["number"]
    for node in pdf_document.iter()
    if node.tag == "page" and "number" in node.attrib
}
for node in pdf_document.iter():
    target = node.attrib.get("href")
    if not target:
        continue
    parsed = urlsplit(target)
    if parsed.scheme or parsed.netloc:
        failures.append(f"PDF -> link externo: {target}")
    elif parsed.fragment and parsed.fragment not in pdf_pages:
        failures.append(f"PDF -> página interna ausente: {target}")

with ZipFile(os.environ["EPUB_OUT"]) as archive:
    names = set(archive.namelist())
    documents = {}
    for name in sorted(
        entry for entry in names if entry.endswith((".xhtml", ".html"))
    ):
        documents[name] = ET.fromstring(archive.read(name))
    package = ET.fromstring(archive.read("EPUB/content.opf"))
    identifier = package.find(
        ".//{http://purl.org/dc/elements/1.1/}identifier"
    )
    if identifier is None or identifier.text != "urn:specsfy:guia-do-usuario":
        failures.append("EPUB -> identificador não canônico")
    document_ids = {
        name: {
            node.attrib["id"]
            for node in document.iter()
            if "id" in node.attrib
        }
        for name, document in documents.items()
    }
    for name, document in documents.items():
        for node in document.iter():
            target = node.attrib.get("href") or node.attrib.get("src")
            if not target:
                continue
            parsed = urlsplit(target)
            is_clickable = node.tag.endswith("}a")
            if is_clickable and (parsed.scheme or parsed.netloc):
                failures.append(f"{name} -> link externo: {target}")
                continue
            resolved = name
            if parsed.path:
                resolved = posixpath.normpath(
                    posixpath.join(posixpath.dirname(name), parsed.path)
                )
                if resolved not in names:
                    failures.append(f"{name} -> {target}")
                    continue
            if (
                is_clickable
                and parsed.fragment
                and parsed.fragment not in document_ids.get(resolved, set())
            ):
                failures.append(f"{name} -> âncora ausente: {target}")
if failures:
    raise SystemExit(
        "Erro: navegação inválida nos artefatos:\n" + "\n".join(failures)
    )
PY
  echo "OK: edição v$VERSION sincronizada com docs/user/."
}

if [ "${1:-}" = "--check" ]; then
  check_manifest
  exit 0
fi
[ "$#" -eq 0 ] || fail "uso: ./.ebook/build-ebook.sh [--check]"

for bin in pandoc weasyprint python3 unzip xmllint jq magick fc-match; do
  command -v "$bin" >/dev/null 2>&1 || fail "'$bin' não encontrado no PATH."
done

mkdir -p "$BUILD_ROOT"

DOCUMENT_METADATA_JSON="$BUILD_ROOT/document-metadata.json"
python3 "$METADATA_EXTRACTOR" \
  --root "$ROOT" \
  "${page_paths[@]}" > "$DOCUMENT_METADATA_JSON"
jq -e 'type == "object"' "$DOCUMENT_METADATA_JSON" >/dev/null \
  || fail "metadados documentais inválidos."

FONT_FACES="$BUILD_ROOT/fontfaces.css"
awk '
  /@font-face/ { p = 1 }
  /:root[ \t]*\{/ { exit }
  p { print }
' "$STYLE_GUIDE" > "$FONT_FACES"
[ -s "$FONT_FACES" ] || fail "fontes Inter e Manrope ausentes em brand/style-guide.html."

FILLED_TEMPLATE="$BUILD_ROOT/template.filled.html"
awk -v ff="$FONT_FACES" '
  $0 == "$fontfaces$" {
    while ((getline line < ff) > 0) print line
    close(ff)
    next
  }
  { print }
' "$TEMPLATE" > "$FILLED_TEMPLATE"

MESES=(janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro)
DAY="$(date +%-d)"
MONTH_NUM="$((10#$(date +%m)))"
YEAR="$(date +%Y)"
PT_DATE="$DAY de ${MESES[$((MONTH_NUM - 1))]} de $YEAR"
HTML_OUT="$BUILD_ROOT/$STEM.html"
COVER_PNG="$BUILD_ROOT/$STEM-cover.png"
SANS_FONT="$(fc-match -f '%{file}\n' 'Manrope:style=SemiBold' | head -1)"
BODY_FONT="$(fc-match -f '%{file}\n' 'Inter:style=Regular' | head -1)"
[ -f "$SANS_FONT" ] || fail "Manrope não encontrada."
[ -f "$BODY_FONT" ] || fail "Inter não encontrada."

magick \
  -size 1600x2560 xc:'#FFFFFF' \
  \( "$LOGO_PNG" -resize 300x300 \) -geometry +150+170 -composite \
  -font "$BODY_FONT" -fill '#171717' -pointsize 34 \
  -annotate +150+850 'SPECSFY' \
  -font "$SANS_FONT" -fill '#000000' -pointsize 116 \
  -annotate +150+1050 'Guia completo' \
  -annotate +150+1190 'do usuário' \
  -font "$BODY_FONT" -fill '#171717' -pointsize 42 \
  -annotate +150+1400 'Specify. Prove. Ship.' \
  -font "$SANS_FONT" -fill '#737373' -pointsize 38 \
  -annotate +150+1540 'Da primeira ideia à entrega comprovada,' \
  -annotate +150+1600 'em uma jornada prática e rastreável.' \
  -stroke '#D4D4D4' -strokewidth 2 -draw 'line 150,2260 1450,2260' \
  -stroke none -font "$BODY_FONT" -fill '#737373' -pointsize 30 \
  -annotate +150+2340 "EDIÇÃO V$VERSION" \
  "$COVER_PNG"

(
  cd "$DOCS_ROOT"
  pandoc "${page_inputs[@]}" \
    --from=markdown \
    --to=html5 \
    --standalone \
    --embed-resources \
    --file-scope \
    --lua-filter="$METADATA_FILTER" \
    --lua-filter="$LINK_FILTER" \
    --template="$FILLED_TEMPLATE" \
    --toc \
    --toc-depth=2 \
    --resource-path="$SCRIPT_DIR:$ROOT:$DOCS_ROOT" \
    --metadata-file="$METADATA" \
    --metadata title="Specsfy — Guia completo do usuário · v$VERSION" \
    --metadata version="$VERSION" \
    --metadata date="$PT_DATE" \
    --output "$HTML_OUT"
)

weasyprint \
  "$HTML_OUT" \
  "$PDF_OUT" \
  --base-url "$ROOT" \
  --stylesheet "$PDF_STYLE"

(
  cd "$DOCS_ROOT"
  pandoc "${page_inputs[@]}" \
    --from=markdown \
    --to=epub3 \
    --standalone \
    --file-scope \
    --lua-filter="$METADATA_FILTER" \
    --lua-filter="$LINK_FILTER" \
    --toc \
    --toc-depth=2 \
    --epub-title-page=true \
    --epub-cover-image="$COVER_PNG" \
    --css="$EPUB_STYLE" \
    --resource-path="$SCRIPT_DIR:$ROOT:$DOCS_ROOT" \
    --metadata-file="$METADATA" \
    --metadata title="Specsfy — Guia completo do usuário · v$VERSION" \
    --metadata version="$VERSION" \
    --metadata date="$(date +%F)" \
    --output "$EPUB_OUT"
)

sources_json="$(
  printf '%s\n' "${source_files[@]}" \
    | while IFS= read -r source; do relative_path "$source"; done \
    | sort -u \
    | jq -R . \
    | jq -s .
)"
PDF_SHA="$(sha256sum "$PDF_OUT" | cut -d' ' -f1)"
EPUB_SHA="$(sha256sum "$EPUB_OUT" | cut -d' ' -f1)"
document_metadata="$(<"$DOCUMENT_METADATA_JSON")"

jq -n \
  --arg version "$VERSION" \
  --arg edition "v$VERSION" \
  --arg generated_at "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --arg source_sha256 "$SOURCE_SHA" \
  --arg pdf_file "$(basename "$PDF_OUT")" \
  --arg pdf_sha256 "$PDF_SHA" \
  --arg epub_file "$(basename "$EPUB_OUT")" \
  --arg epub_sha256 "$EPUB_SHA" \
  --argjson sources "$sources_json" \
  --argjson document_metadata "$document_metadata" \
  '{
    schema_version: 1,
    version: $version,
    edition: $edition,
    generated_at: $generated_at,
    source_sha256: $source_sha256,
    sources: $sources,
    document_metadata: $document_metadata,
    artifacts: {
      pdf: {file: $pdf_file, sha256: $pdf_sha256},
      epub: {file: $epub_file, sha256: $epub_sha256}
    }
}' > "$MANIFEST"

# Mantém URLs estáveis para a edição mais recente sem substituir os arquivos versionados.
cp "$PDF_OUT" "$PDF_ALIAS"
cp "$EPUB_OUT" "$EPUB_ALIAS"

check_manifest
python3 "$RETENTION_SCRIPT" \
  --ebook-root "$EBOOK_ROOT" \
  --keep 5 \
  --protect-version "$VERSION"
echo "PDF:  $PDF_OUT"
echo "EPUB: $EPUB_OUT"
