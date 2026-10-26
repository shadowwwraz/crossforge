"""Generates the CrossForge app icon (PNG + multi-size ICO)."""

from PIL import Image, ImageDraw

S = 1024
BG_TOP = (255, 199, 96)
BG_BOTTOM = (232, 130, 6)
INK = (38, 22, 2, 255)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def main() -> None:
    gradient = Image.new("RGB", (S, S))
    pixels = gradient.load()
    for y in range(S):
        color = lerp(BG_TOP, BG_BOTTOM, y / (S - 1))
        for x in range(S):
            pixels[x, y] = color

    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.235), fill=255)

    icon = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    icon.paste(gradient, (0, 0), mask)
    draw = ImageDraw.Draw(icon)

    # subtle top highlight
    highlight = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    hd.rounded_rectangle([0, 0, S - 1, int(S * 0.5)], radius=int(S * 0.235), fill=(255, 255, 255, 26))
    icon.alpha_composite(Image.composite(highlight, Image.new("RGBA", (S, S), (0, 0, 0, 0)), mask))

    draw = ImageDraw.Draw(icon)
    c = S // 2
    ring = int(S * 0.30)
    lw = int(S * 0.046)
    draw.ellipse([c - ring, c - ring, c + ring, c + ring], outline=INK, width=lw)

    gap = int(S * 0.41)
    tick_end = int(S * 0.545)
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        draw.line(
            [c + dx * gap, c + dy * gap, c + dx * tick_end, c + dy * tick_end],
            fill=INK,
            width=lw,
        )

    dot = int(S * 0.082)
    draw.ellipse([c - dot, c - dot, c + dot, c + dot], fill=INK)

    icon.save("build/icon.png")
    icon.save(
        "build/icon.ico",
        sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)],
    )
    print("icons written")


if __name__ == "__main__":
    main()
