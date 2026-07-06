from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1] / "outputs" / "Success Capital"
IMAGES = ROOT / "images"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for item in candidates:
        try:
            return ImageFont.truetype(item, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded_gradient(draw: ImageDraw.ImageDraw, box, radius: int, top, bottom):
    x0, y0, x1, y1 = box
    width = x1 - x0
    height = y1 - y0
    gradient = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = gradient.load()
    for y in range(height):
        t = y / max(1, height - 1)
        color = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(4))
        for x in range(width):
            pixels[x, y] = color
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width - 1, height - 1), radius, fill=255)
    draw.bitmap((x0, y0), Image.composite(gradient, Image.new("RGBA", (width, height)), mask))


def make_hero():
    random.seed(42)
    w, h = 1800, 1200
    img = Image.new("RGBA", (w, h), "#050505")
    px = img.load()

    for y in range(h):
        for x in range(w):
            nx = (x - w * 0.72) / w
            ny = (y - h * 0.35) / h
            glow = max(0, 1 - math.sqrt(nx * nx * 7 + ny * ny * 6))
            gold = int(62 * glow)
            blue = int(28 * max(0, 1 - math.sqrt(((x - w * 0.2) / w) ** 2 * 10 + ((y - h * 0.2) / h) ** 2 * 5)))
            px[x, y] = (5 + gold // 5, 5 + gold // 6, 6 + blue, 255)

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay, "RGBA")

    for i in range(90):
        x = random.randint(0, w)
        y = random.randint(0, int(h * 0.62))
        alpha = random.randint(18, 80)
        d.ellipse((x, y, x + 2, y + 2), fill=(241, 200, 112, alpha))

    horizon = int(h * 0.70)
    buildings = []
    x = 0
    while x < w + 80:
        bw = random.randint(44, 115)
        bh = random.randint(150, 520)
        if 640 < x < 1260:
            bh += random.randint(80, 220)
        buildings.append((x, horizon - bh, x + bw, horizon))
        x += bw + random.randint(4, 13)

    for idx, box in enumerate(buildings):
        bx0, by0, bx1, by1 = box
        top = (19, 19, 20, 245)
        bottom = (5, 5, 6, 255)
        rounded_gradient(d, (bx0, by0, bx1, by1), 5, top, bottom)
        if idx % 5 == 0:
            d.polygon([(bx0, by0), ((bx0 + bx1) // 2, by0 - random.randint(38, 90)), (bx1, by0)], fill=(14, 14, 15, 248))
        for wy in range(by0 + 24, by1 - 22, 32):
            for wx in range(bx0 + 12, bx1 - 12, 26):
                if random.random() > 0.53:
                    a = random.randint(35, 115)
                    d.rounded_rectangle((wx, wy, wx + 6, wy + 13), radius=2, fill=(232, 181, 91, a))

    chart_points = []
    for i in range(0, 12):
        x = 270 + i * 110
        y = 820 - i * 38 + math.sin(i * 1.3) * 62 + random.randint(-24, 24)
        chart_points.append((x, y))
    for offset, alpha, width in [(18, 34, 20), (8, 64, 12), (0, 230, 6)]:
        pts = [(x, y + offset) for x, y in chart_points]
        d.line(pts, fill=(226, 177, 87, alpha), width=width, joint="curve")
    for x, y in chart_points:
        d.ellipse((x - 8, y - 8, x + 8, y + 8), fill=(245, 204, 123, 245))
        d.ellipse((x - 18, y - 18, x + 18, y + 18), outline=(245, 204, 123, 70), width=2)

    for i in range(7):
        base_x = 1120 + i * 75
        top_y = 780 - i * 48
        d.rounded_rectangle((base_x, top_y, base_x + 42, 870), radius=12, fill=(229, 177, 86, 90 + i * 15))
        d.rounded_rectangle((base_x + 8, top_y + 10, base_x + 34, 870), radius=8, fill=(255, 229, 153, 45))

    d.rectangle((0, horizon, w, h), fill=(0, 0, 0, 82))
    d.ellipse((1090, 180, 1860, 950), fill=(219, 165, 78, 22))
    d.ellipse((1250, 270, 1580, 600), outline=(236, 183, 91, 44), width=3)
    d.ellipse((1290, 310, 1540, 560), outline=(236, 183, 91, 28), width=2)

    img = Image.alpha_composite(img, overlay)
    vignette = Image.new("L", (w, h), 0)
    vd = ImageDraw.Draw(vignette)
    vd.ellipse((-320, -180, w + 320, h + 220), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(100))
    edge_alpha = Image.eval(vignette, lambda a: int((255 - a) * 0.55))
    edge_dark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    edge_dark.putalpha(edge_alpha)
    img = Image.alpha_composite(img, edge_dark)
    img.save(IMAGES / "hero-skyline.png", optimize=True)


def make_og():
    w, h = 1200, 630
    img = Image.open(IMAGES / "hero-skyline.png").resize((w, 800)).crop((0, 90, w, 720)).convert("RGBA")
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle((0, 0, w, h), fill=(0, 0, 0, 86))
    d.rounded_rectangle((70, 70, 180, 180), radius=26, fill=(223, 174, 87, 230))
    d.text((108, 91), "SC", fill=(9, 9, 9, 255), font=font(42, True), anchor="mm")
    d.text((70, 225), "Success Capital", fill=(248, 240, 222, 255), font=font(68, True))
    d.text((74, 315), "Build Wealth With Confidence", fill=(231, 190, 106, 255), font=font(38, False))
    d.text((76, 380), "Professional investment management with disciplined risk controls.", fill=(213, 213, 205, 240), font=font(28, False))
    img.save(IMAGES / "og-image.png", optimize=True)


def make_qr_like():
    size = 840
    margin = 66
    cells = 29
    cell = (size - 2 * margin) // cells
    img = Image.new("RGBA", (size, size), (247, 241, 226, 255))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((18, 18, size - 18, size - 18), radius=44, fill=(9, 9, 9, 255))
    d.rounded_rectangle((42, 42, size - 42, size - 42), radius=36, fill=(247, 241, 226, 255))

    grid = [[False for _ in range(cells)] for _ in range(cells)]

    def finder(cx, cy):
        for y in range(7):
            for x in range(7):
                edge = x in (0, 6) or y in (0, 6)
                center = 2 <= x <= 4 and 2 <= y <= 4
                grid[cy + y][cx + x] = edge or center

    finder(0, 0)
    finder(cells - 7, 0)
    finder(0, cells - 7)

    seed = sum(ord(ch) for ch in "Success Capital")
    rnd = random.Random(seed)
    for y in range(cells):
        for x in range(cells):
            in_finder = (x < 8 and y < 8) or (x > cells - 9 and y < 8) or (x < 8 and y > cells - 9)
            logo_space = 10 <= x <= 18 and 11 <= y <= 17
            if in_finder or logo_space:
                continue
            wave = math.sin(x * 1.7 + y * 0.9) + math.cos(x * 0.9 - y * 1.4)
            grid[y][x] = rnd.random() + wave * 0.09 > 0.58

    for y, row in enumerate(grid):
        for x, filled in enumerate(row):
            if not filled:
                continue
            x0 = margin + x * cell
            y0 = margin + y * cell
            d.rounded_rectangle((x0 + 2, y0 + 2, x0 + cell - 2, y0 + cell - 2), radius=4, fill=(13, 13, 13, 255))

    for fx, fy in [(0, 0), (cells - 7, 0), (0, cells - 7)]:
        x0 = margin + fx * cell
        y0 = margin + fy * cell
        d.rounded_rectangle((x0, y0, x0 + 7 * cell, y0 + 7 * cell), radius=12, outline=(218, 166, 78, 255), width=7)
        d.rounded_rectangle((x0 + 2 * cell, y0 + 2 * cell, x0 + 5 * cell, y0 + 5 * cell), radius=8, fill=(218, 166, 78, 255))

    cx0 = margin + 10 * cell
    cy0 = margin + 11 * cell
    cx1 = margin + 19 * cell
    cy1 = margin + 18 * cell
    d.rounded_rectangle((cx0, cy0, cx1, cy1), radius=22, fill=(9, 9, 9, 255), outline=(218, 166, 78, 255), width=4)
    d.text(((cx0 + cx1) / 2, cy0 + 43), "SC", font=font(46, True), fill=(236, 190, 105, 255), anchor="mm")
    d.text((size / 2, cy0 + 99), "Success Capital", font=font(22, True), fill=(247, 241, 226, 255), anchor="mm")
    img.save(IMAGES / "qr.png", optimize=True)


def main():
    IMAGES.mkdir(parents=True, exist_ok=True)
    make_hero()
    make_og()
    make_qr_like()


if __name__ == "__main__":
    main()
