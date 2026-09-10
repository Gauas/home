#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INPUT="${1:-$PROJECT_ROOT/public/assets/new_hero.mp4}"
OUTPUT_DIR="$PROJECT_ROOT/public/video"
MP4_OUTPUT="$OUTPUT_DIR/gauas-hero-loop.mp4"
WEBM_OUTPUT="$OUTPUT_DIR/gauas-hero-loop.webm"

FFMPEG_BIN="${FFMPEG_BIN:-/usr/bin/ffmpeg}"
FFPROBE_BIN="${FFPROBE_BIN:-/usr/bin/ffprobe}"

if [[ ! -x "$FFMPEG_BIN" || ! -x "$FFPROBE_BIN" ]]; then
  echo "FFmpeg and FFprobe are required at /usr/bin (or set FFMPEG_BIN and FFPROBE_BIN)." >&2
  exit 1
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Source video not found: $INPUT" >&2
  exit 1
fi

FRAME_COUNT="$("$FFPROBE_BIN" -v error -select_streams v:0 -count_frames \
  -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 "$INPUT")"

if [[ ! "$FRAME_COUNT" =~ ^[0-9]+$ || "$FRAME_COUNT" -lt 3 ]]; then
  echo "Could not determine a usable frame count for: $INPUT" >&2
  exit 1
fi

# For source frames 0..N-1, append reversed frames N-2..1.
# This excludes duplicate B at the turn and duplicate A at the loop boundary.
REVERSE_END=$((FRAME_COUNT - 1))
FILTER="[0:v]split=2[forward_source][reverse_source];[forward_source]setpts=PTS-STARTPTS[forward];[reverse_source]trim=start_frame=1:end_frame=${REVERSE_END},reverse,setpts=PTS-STARTPTS[reversed];[forward][reversed]concat=n=2:v=1:a=0[out]"

mkdir -p "$OUTPUT_DIR"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

"$FFMPEG_BIN" -hide_banner -y -i "$INPUT" \
  -filter_complex "$FILTER" -map "[out]" -an \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -movflags +faststart "$TEMP_DIR/gauas-hero-loop.mp4"

mv "$TEMP_DIR/gauas-hero-loop.mp4" "$MP4_OUTPUT"

if "$FFMPEG_BIN" -hide_banner -encoders 2>/dev/null | grep -F "libvpx-vp9" >/dev/null; then
  "$FFMPEG_BIN" -hide_banner -y -i "$INPUT" \
    -filter_complex "$FILTER" -map "[out]" -an \
    -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 \
    -pix_fmt yuv420p "$TEMP_DIR/gauas-hero-loop.webm"
  mv "$TEMP_DIR/gauas-hero-loop.webm" "$WEBM_OUTPUT"
fi

echo "Source frames: $FRAME_COUNT"
echo "Output frames: $((FRAME_COUNT * 2 - 2))"
echo "Created: $MP4_OUTPUT"
[[ -f "$WEBM_OUTPUT" ]] && echo "Created: $WEBM_OUTPUT"
