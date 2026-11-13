#!/usr/bin/env bash
#
# Cria uma copia do template em clientes/<slug>/site ja com nome, cor de marca,
# fontes (opcional) e os textos que voce tiver. O original em html/ nunca e alterado.
#
#   ./personalizar.sh <pasta-destino> <#COR> "<Nome do Cliente>" [opcoes]
#
# Opcoes (em qualquer ordem, depois dos 3 primeiros argumentos):
#   --dados arquivo.txt        arquivo com linhas CHAVE=valor (modelo: dados-modelo.txt)
#   --fonte-titulo "Nome"      familia do Google Fonts para titulos (padrao: Barlow Condensed)
#   --fonte-corpo  "Nome"      familia do Google Fonts para o texto (padrao: Barlow)
#   CHAVE=valor                qualquer placeholder, direto na linha de comando
#
# Exemplo:
#   ./personalizar.sh ../../../clientes/loja-x/site '#2F6FED' 'Loja X Motos' \
#       --dados ../../../clientes/loja-x/dados-site.txt WHATSAPP=5511999990000
#
# O que o script resolve sozinho a partir do nome: MARCA_1 (primeira palavra,
# fica na cor de destaque), MARCA_2 (o resto), SIGLA (primeira palavra, ate 3
# letras), e MAPS_DESTINO/MAPS_URL (nome + endereco, ja codificados) quando
# voce nao informar.
#
set -euo pipefail
# bash 5.2+ trata "&" na substituicao ${v//x/&y} como "texto casado"; aqui "&" e literal.
shopt -u patsub_replacement 2>/dev/null || true

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORIGEM="$AQUI/html"

# Cores de marca do template (ver :root em html/index.html)
COR_ORIGINAL='e2582f'        # --laranja (tambem esta no favicon, como %23e2582f)
COR_CLARA_ORIGINAL='ff7a4d'  # --laranja-claro (hover dos botoes)

uso() {
  echo "uso: $0 <pasta-destino> <#COR> \"<Nome do Cliente>\" [--dados arq.txt] [--fonte-titulo \"X\"] [--fonte-corpo \"Y\"] [CHAVE=valor ...]" >&2
  exit 1
}

DESTINO="${1:-}"; COR="${2:-}"; NOME="${3:-}"
[ -z "$DESTINO" ] || [ -z "$COR" ] || [ -z "$NOME" ] && uso
shift 3

if ! [[ "$COR" =~ ^#[0-9A-Fa-f]{6}$ ]]; then
  echo "erro: cor precisa ser hex de 6 digitos, tipo '#2F6FED' (recebi '$COR')" >&2; exit 1
fi
if [ -e "$DESTINO" ] && [ -n "$(ls -A "$DESTINO" 2>/dev/null)" ]; then
  echo "erro: '$DESTINO' ja existe e nao esta vazia. Escolha outra pasta." >&2; exit 1
fi

declare -A D
FONTE_TITULO=""; FONTE_CORPO=""

while [ $# -gt 0 ]; do
  case "$1" in
    --dados)
      [ -f "${2:-}" ] || { echo "erro: arquivo de dados '${2:-}' nao existe" >&2; exit 1; }
      primeira=1
      while IFS= read -r linha || [ -n "$linha" ]; do
        linha="${linha%$'\r'}"
        [ "$primeira" = 1 ] && { linha="${linha#$'\xEF\xBB\xBF'}"; primeira=0; }
        case "$linha" in ''|\#*) continue;; esac
        k="${linha%%=*}"; v="${linha#*=}"
        [[ "$k" =~ ^[A-Z0-9_]+$ ]] || { echo "aviso: linha ignorada (chave invalida): $linha" >&2; continue; }
        D[$k]="$v"
      done < "$2"
      shift 2;;
    --fonte-titulo) FONTE_TITULO="${2:-}"; shift 2;;
    --fonte-corpo)  FONTE_CORPO="${2:-}";  shift 2;;
    [A-Z]*=*)
      k="${1%%=*}"; [[ "$k" =~ ^[A-Z0-9_]+$ ]] || uso
      D[$k]="${1#*=}"; shift;;
    *) echo "erro: argumento nao reconhecido: $1" >&2; uso;;
  esac
done

# ---------- derivados do nome ----------
D[NOME]="$NOME"
primeira_palavra="${NOME%% *}"
resto=""; [ "$NOME" != "$primeira_palavra" ] && resto="${NOME#* }"
: "${D[MARCA_1]:=$primeira_palavra}"
: "${D[MARCA_2]:=$resto}"
sigla="${primeira_palavra^^}"; : "${D[SIGLA]:=${sigla:0:3}}"

urlenc() {
  local LC_ALL=C s="$1" i c out=""
  for ((i = 0; i < ${#s}; i++)); do
    c="${s:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) out+="$c";;
      *) out+="$(printf '%%%02X' "'$c")";;
    esac
  done
  printf '%s' "$out"
}

if [ -z "${D[MAPS_DESTINO]:-}" ]; then
  if [ -n "${D[ENDERECO_LINHA1]:-}" ]; then
    D[MAPS_DESTINO]="$NOME, ${D[ENDERECO_LINHA1]}${D[ENDERECO_LINHA2]:+, ${D[ENDERECO_LINHA2]}}"
  fi
fi
if [ -n "${D[MAPS_DESTINO]:-}" ]; then
  D[MAPS_DESTINO]="$(urlenc "${D[MAPS_DESTINO]}")"
  : "${D[MAPS_URL]:=https://www.google.com/maps/search/?api=1&query=${D[MAPS_DESTINO]}}"
fi

# ---------- validacoes leves ----------
if [ -n "${D[WHATSAPP]:-}" ] && ! [[ "${D[WHATSAPP]}" =~ ^[0-9]{12,13}$ ]]; then
  echo "aviso: WHATSAPP deve ser so digitos com 55 + DDD, ex.: 5511999990000 (recebi '${D[WHATSAPP]}')" >&2
fi
if [ -n "${D[TELEFONE]:-}" ] && ! [[ "${D[TELEFONE]}" =~ ^\+?[0-9]{10,14}$ ]]; then
  echo "aviso: TELEFONE deve ser +55 e digitos, ex.: +5511999990000 (recebi '${D[TELEFONE]}')" >&2
fi
if [ -n "${D[INSTAGRAM]:-}" ]; then D[INSTAGRAM]="${D[INSTAGRAM]#@}"; fi

echo "-> copiando template para $DESTINO"
mkdir -p "$DESTINO"
cp -r "$ORIGEM/." "$DESTINO/"
ARQ="$DESTINO/index.html"

# ---------- cor ----------
hex="${COR#\#}"; hex="${hex,,}"
r=$((16#${hex:0:2})); g=$((16#${hex:2:2})); b=$((16#${hex:4:2}))
mix() { echo $(( $1 + (255 - $1) * 20 / 100 )); }
clara="$(printf '%02x%02x%02x' "$(mix $r)" "$(mix $g)" "$(mix $b)")"
echo "-> cor de marca #$hex (hover #$clara)"
sed -i -e "s/%23${COR_ORIGINAL}/%23${hex}/g" -e "s/#${COR_ORIGINAL}/#${hex}/g" -e "s/#${COR_CLARA_ORIGINAL}/#${clara}/g" "$ARQ"

# ---------- fontes ----------
if [ -n "$FONTE_TITULO" ]; then
  echo "-> fonte dos titulos: $FONTE_TITULO (o link do Google Fonts pede os pesos 600-800 e italico: confira que a familia tem)"
  sed -i -e "s/--titulo:'Barlow Condensed'/--titulo:'${FONTE_TITULO}'/" -e "s/family=Barlow+Condensed:/family=${FONTE_TITULO// /+}:/" "$ARQ"
fi
if [ -n "$FONTE_CORPO" ]; then
  echo "-> fonte do texto: $FONTE_CORPO (pesos 400-700)"
  sed -i -e "s/--corpo:'Barlow'/--corpo:'${FONTE_CORPO}'/" -e "s/family=Barlow:wght@/family=${FONTE_CORPO// /+}:wght@/" "$ARQ"
fi

# ---------- textos ----------
SCRIPT="$(mktemp)"
trap 'rm -f "$SCRIPT"' EXIT
n=0
for k in "${!D[@]}"; do
  v="${D[$k]}"
  if [ "$k" != "MAPS_DESTINO" ] && [ "$k" != "MAPS_URL" ]; then   # URLs ja vem prontas
    v="${v//&/&amp;}"; v="${v//</&lt;}"; v="${v//>/&gt;}"; v="${v//\"/&quot;}"
  fi
  v="${v//\\/\\\\}"; v="${v//&/\\&}"; v="${v//|/\\|}"
  printf 's|{{%s}}|%s|g\n' "$k" "$v" >> "$SCRIPT"
  n=$((n + 1))
done
sed -i -f "$SCRIPT" "$ARQ"
echo "-> $n placeholders preenchidos"

restam="$(grep -o '{{[A-Z0-9_]*}}' "$ARQ" | sort -u || true)"
n_restam=0; [ -n "$restam" ] && n_restam="$(printf '%s\n' "$restam" | wc -l | tr -d ' ')"

cat <<FIM

Pronto: $DESTINO
Placeholders ainda sem valor: $n_restam $( [ "$n_restam" -gt 0 ] && echo "(listados abaixo; preencha e rode de novo numa pasta limpa, ou edite o index.html)" )
$restam

Falta fazer na mao (o script nao tem como adivinhar):

  1. FOTOS      colocar em img/ os arquivos que o index.html espera, com esses nomes:
                hero.jpg, item-1.jpg a item-8.jpg, loja1.jpg, loja2.jpg, fachada.jpg, loja3.jpg
                (img/LEIA-ME.txt tem os tamanhos). Foto real do cliente (Instagram, Maps),
                nunca de outro cliente. Sem o arquivo, o bloco cinza com o rotulo continua la.
  2. ITENS      8 cartoes de estoque: so preco e km que o cliente confirmou. Para outra
                quantidade, copiar/apagar um <article class="moto"> inteiro.
  3. AVALIACOES so texto real do Google, nome abreviado. Escolha a mais forte para o destaque
                e liste em AVALIACAO_DESTAQUE_PALAVRAS as palavras que acendem.
  4. PREVIA     selo, noindex, robots.txt e vercel.json ficam ate virar site oficial
                (4 comentarios "REMOVER AO VIRAR SITE OFICIAL" no index.html).
  5. CONFERIR   grep -n '{{[A-Z]' index.html deve voltar vazio antes de publicar; abrir por HTTP
                (python -m http.server) em 1440 e 375, e rodar a skill adaptar-mobile.

FIM
