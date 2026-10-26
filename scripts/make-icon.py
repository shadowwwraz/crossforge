"""Processes the CrossForge master artwork into PNG + multi-size ICO."""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
MASTER = BUILD / "icon-master.jpg"
OUT_PNG = BUILD / "icon.png"
OUT_ICO = BUILD / "icon.ico"


def main() -> None:
    if not MASTER.exists():
        print(f"Master image not found at {MASTER}")
        return

    src = Image.open(MASTER)
    cropped = src.crop((168, 168, 856, 856))
    size = 1024
    img = cropped.resize((size, size), Image.Resampling.LANCZOS)

    scale = 4
    msize = size * scale
    mask = Image.new("L", (msize, msize), 0)
    draw = ImageDraw.Draw(mask)
    radius = int(msize * 0.22)
    draw.rounded_rectangle([0, 0, msize - 1, msize - 1], radius=radius, fill=255)
    mask = mask.resize((size, size), Image.Resampling.LANCZOS)

    rgba = img.convert("RGBA")
    rgba.putalpha(mask)

    rgba.save(OUT_PNG, "PNG")
    print(f"Saved {OUT_PNG}")

    sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (24, 24), (16, 16)]
    rgba.save(OUT_ICO, format="ICO", sizes=sizes)
    print(f"Saved {OUT_ICO}")


if __name__ == "__main__":
    main()
