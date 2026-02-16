#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEDIA_DIR="$ROOT_DIR/media"
SOURCE_HEIC="$MEDIA_DIR/test_hdr_heif_gainmap.HEIC"

if [[ ! -f "$SOURCE_HEIC" ]]; then
  echo "Missing source fixture: $SOURCE_HEIC" >&2
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick (magick) is required to generate EXIF fixtures." >&2
  exit 1
fi

if ! command -v exiftool >/dev/null 2>&1; then
  echo "exiftool is required to generate EXIF fixtures." >&2
  exit 1
fi

echo "Generating EXIF matrix fixtures from: $SOURCE_HEIC"

magick "$SOURCE_HEIC" "$MEDIA_DIR/exif_matrix.jpg"
magick "$SOURCE_HEIC" "$MEDIA_DIR/exif_matrix.jpeg"
magick "$SOURCE_HEIC" "$MEDIA_DIR/exif_matrix.png"
magick "$SOURCE_HEIC" "$MEDIA_DIR/exif_matrix.webp"
magick "$SOURCE_HEIC" -compress jpeg "$MEDIA_DIR/exif_matrix.tif"
magick "$SOURCE_HEIC" -compress jpeg "$MEDIA_DIR/exif_matrix.tiff"
magick "$SOURCE_HEIC" "$MEDIA_DIR/exif_matrix.heif"
cp "$SOURCE_HEIC" "$MEDIA_DIR/exif_matrix.heic"

# Ensure EXIF groups are written consistently for format-contract fixtures.
for fmt in jpg jpeg png webp tif tiff heif heic; do
  exiftool -overwrite_original -TagsFromFile "$SOURCE_HEIC" -EXIF:all "$MEDIA_DIR/exif_matrix.${fmt}" >/dev/null
done

echo "Generated:"
ls -lh "$MEDIA_DIR"/exif_matrix.* | sed -n '1,40p'
