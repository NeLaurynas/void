#!/usr/bin/env zsh
set -e
set -u
set -o pipefail

# --- sanity checks ---
if ! command -v avifenc >/dev/null 2>&1; then
  print -u2 "Error: avifenc not found. On macOS: brew install libavif"
  exit 1
fi

# We need ImageMagick for resizing / GIF handling
if command -v magick >/dev/null 2>&1; then
  IM_CONVERT=(magick convert)
  IM_IDENTIFY=(magick identify)
elif command -v convert >/dev/null 2>&1; then
  IM_CONVERT=(convert)
  IM_IDENTIFY=(identify)
else
  print -u2 "Error: ImageMagick not found. On macOS: brew install imagemagick"
  exit 1
fi

# --- gather inputs (PNG/JPG/GIF in current dir) ---
# enable case-insensitive globbing only for this expansion
setopt nocaseglob
FILES=( *.(png|jpg|jpeg|gif)(N) )  # (N) = nullglob
unsetopt nocaseglob

if (( ${#FILES} == 0 )); then
  print "No PNG/JPG/GIF images found in the current directory."
  exit 0
fi

# --- prepare output dir ---
OUTDIR="result"
mkdir -p "$OUTDIR"

# temp workspace for intermediates
TMPDIR="$(mktemp -d)"
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

encode_still() {
  local input="$1" stem="$2" out="$3"
  local tmp="$TMPDIR/${stem}.png"
  # Resize only if >2000px on any side
  "${IM_CONVERT[@]}" "$input" -resize '2000x2000>' "$tmp"
  print "Encoding \"$input\" → \"$out\" (q=75, speed=3, yuv=444)"
  avifenc -q 75 --speed 3 --yuv 444 "$tmp" "$out"
}

encode_gif() {
  local input="$1" stem="$2" out="$3"

  # 1) Coalesce to full frames, then conditionally resize; drop page offsets
  local pattern="$TMPDIR/${stem}_%04d.png"
  "${IM_CONVERT[@]}" "$input" -coalesce -resize '2000x2000>' +repage "$pattern"

  # 2) Collect frame paths (sorted). (N) avoids literal when no matches.
  local -a frames
  frames=( "$TMPDIR/${stem}"_*.png(N) )
  if (( ${#frames} == 0 )); then
    print "WARN: No frames extracted from $input; encoding as still."
    encode_still "$input" "$stem" "$out"
    return
  fi

  # 3) Read per-frame delays (centiseconds) and normalize (min 1).
  local delay_str
  delay_str="$("${IM_IDENTIFY[@]}" -format '%T ' "$input")"
  delay_str="${delay_str%% }"  # trim trailing space

  local -a delays
  delays=( ${=delay_str} )     # split into array by IFS (whitespace)

  local i
  for i in {1..${#delays}}; do
    [[ ${delays[i]} -lt 1 ]] && delays[i]=1
  done

  # Pad/trim delays to match frame count
  while (( ${#delays} < ${#frames} )); do delays+=( 1 ); done
  if (( ${#delays} > ${#frames} )); then
    delays=( "${(@)delays[1,${#frames}]}" )
  fi

  # 4) Build avifenc args with durations (timescale=100 → GIF centiseconds)
  local -a enc_args
  enc_args=( --timescale 100 --repetition-count infinite )  # 0 = infinite loop
  local idx=1
  local frame
  for frame in "${frames[@]}"; do
    enc_args+=( --duration "${delays[idx]}" "$frame" )
    (( idx++ ))
  done

  print "Encoding animated \"$input\" → \"$out\" (q=75, speed=3, yuv=444, frames=${#frames})"
  avifenc -q 75 --speed 3 --yuv 444 "${enc_args[@]}" -o "$out"
}

# --- process each image ---
for INPUT in "${FILES[@]}"; do
  base="${INPUT:t}"            # tail (filename)
  stem="${base%.*}"
  out="$OUTDIR/${stem}.avif"
  ext_l="${base##*.}"
  ext_l="${ext_l:l}"           # lowercase extension

  case "$ext_l" in
    gif)           encode_gif  "$INPUT" "$stem" "$out" ;;
    png|jpg|jpeg)  encode_still "$INPUT" "$stem" "$out" ;;
    *)             print "Skipping unsupported file: $INPUT" ;;
  esac
done

print "Done. AVIF files are in ./${OUTDIR}"
