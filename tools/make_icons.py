#!/usr/bin/env python3
"""Generate every icon the installable app needs, at exact pixel sizes.

Drawn programmatically (not traced from a raster) so the mark is crisp at
32 px and 512 px alike, and so the colours match the app's own palette:
  --brand #0b5394   --brand2 #083d6e   accent #9fd0ff

Outputs into  <repo>/../../pwa/icons/
  icon-512.png            rounded square, purpose "any"
  icon-192.png            rounded square, purpose "any"
  icon-maskable-512.png   full bleed, artwork inside the 80% safe zone
  apple-touch-icon.png    180 px, opaque full bleed (iOS applies its own mask)
  favicon-32.png          32 px rounded square
  favicon.svg             vector, for the browser tab
"""
import os

from PIL import Image, ImageDraw

OUT = os.path.normpath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "pwa", "icons"))

BRAND = (11, 83, 148)      # #0b5394
BRAND2 = (8, 61, 110)      # #083d6e
ACCENT = (159, 208, 255)   # #9fd0ff
WHITE = (255, 255, 255)

SS = 8                     # supersampling factor


def _gradient(n):
    img = Image.new("RGB", (n, n))
    px = img.load()
    for y in range(n):
        t = y / (n - 1)
        row = tuple(round(BRAND[i] + (BRAND2[i] - BRAND[i]) * t) for i in range(3))
        for x in range(n):
            px[x, y] = row
    return img


def _rounded_mask(n, radius_frac):
    m = Image.new("L", (n, n), 0)
    d = ImageDraw.Draw(m)
    if radius_frac <= 0:
        d.rectangle([0, 0, n, n], fill=255)
    else:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=n * radius_frac, fill=255)
    return m


def _artwork(n, scale):
    """A medical cross above an ECG trace, centred in `scale` of the canvas."""
    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    u = n * scale
    ox = oy = (n - u) / 2.0

    def X(f):
        return ox + u * f

    def Y(f):
        return oy + u * f

    # ---- cross (upper 60%) -------------------------------------------------
    rr = u * 0.055
    d.rounded_rectangle([X(0.400), Y(0.115), X(0.600), Y(0.665)], radius=rr, fill=WHITE)
    d.rounded_rectangle([X(0.235), Y(0.280), X(0.765), Y(0.480)], radius=rr, fill=WHITE)

    # ---- ECG trace (lower band) -------------------------------------------
    pts = [(0.055, 0.815), (0.235, 0.815), (0.295, 0.815), (0.340, 0.895),
           (0.395, 0.640), (0.450, 0.945), (0.505, 0.815), (0.560, 0.815),
           (0.625, 0.870), (0.690, 0.765), (0.750, 0.815), (0.945, 0.815)]
    w = max(2, int(round(u * 0.055)))
    poly = [(X(px), Y(py)) for px, py in pts]
    d.line(poly, fill=ACCENT, width=w, joint="curve")
    r = w / 2.0
    for p in (poly[0], poly[-1]):
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=ACCENT)
    return img


def compose(size, radius_frac, scale, opaque=False):
    n = size * SS
    canvas = _gradient(n).convert("RGBA")
    canvas.alpha_composite(_artwork(n, scale))
    if radius_frac > 0 and not opaque:
        canvas.putalpha(_rounded_mask(n, radius_frac))
    return canvas.resize((size, size), Image.LANCZOS)


def save(img, name, flatten=False):
    path = os.path.join(OUT, name)
    if flatten:
        flat = Image.new("RGB", img.size, WHITE)
        flat.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = flat
    img.save(path, "PNG", optimize=True)
    print("  %-24s %4dx%-4d %7.1f KB  %s" % (
        name, img.size[0], img.size[1], os.path.getsize(path) / 1024.0, img.mode))
    return path


FAVICON_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b5394"/><stop offset="1" stop-color="#083d6e"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#g)"/>
  <rect x="25.6" y="7.4" width="12.8" height="35.2" rx="3.5" fill="#fff"/>
  <rect x="15" y="17.9" width="34" height="12.8" rx="3.5" fill="#fff"/>
  <path d="M3.5 52.2h11.5l3.8 5.1 3.5-16.3 3.5 19.5 3.5-8.3h3.5l4.1 3.5 4.2-6.7 3.8 3.2H60.5"
        fill="none" stroke="#9fd0ff" stroke-width="3.5"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
"""


def main():
    os.makedirs(OUT, exist_ok=True)
    print("icons ->", OUT)
    save(compose(512, 0.22, 0.82), "icon-512.png")
    save(compose(192, 0.22, 0.82), "icon-192.png")
    save(compose(512, 0.00, 0.62), "icon-maskable-512.png")
    save(compose(180, 0.00, 0.78), "apple-touch-icon.png", flatten=True)
    save(compose(32, 0.22, 0.90), "favicon-32.png")
    p = os.path.join(OUT, "favicon.svg")
    with open(p, "w", encoding="utf-8") as f:
        f.write(FAVICON_SVG)
    print("  %-24s %4dx%-4d %7.1f KB  SVG" % ("favicon.svg", 64, 64,
                                               os.path.getsize(p) / 1024.0))

    # ---- verify ------------------------------------------------------------
    expect = {"icon-512.png": 512, "icon-192.png": 192,
              "icon-maskable-512.png": 512, "apple-touch-icon.png": 180,
              "favicon-32.png": 32}
    for name, want in expect.items():
        im = Image.open(os.path.join(OUT, name))
        assert im.size == (want, want), "%s is %s, expected %dx%d" % (name, im.size, want, want)
    # full-bleed icons must not be white at the corners (iOS paints transparency black)
    ap = Image.open(os.path.join(OUT, "apple-touch-icon.png")).convert("RGB")
    assert ap.getpixel((0, 0)) != (255, 255, 255), "apple-touch-icon must be full bleed"
    mk = Image.open(os.path.join(OUT, "icon-maskable-512.png")).convert("RGB")
    assert mk.getpixel((0, 0)) != (255, 255, 255), "maskable icon must be full bleed"
    # maskable artwork must stay inside the central 80% safe zone
    mkpx = Image.open(os.path.join(OUT, "icon-maskable-512.png")).convert("L")
    bbox = mkpx.point(lambda v: 255 if v > 200 else 0).getbbox()
    lo, hi = 512 * 0.10, 512 * 0.90
    assert bbox[0] >= lo and bbox[1] >= lo and bbox[2] <= hi and bbox[3] <= hi, \
        "maskable artwork leaves the safe zone: %s" % (bbox,)
    print("verified: exact sizes, full bleed, maskable safe zone %s" % (bbox,))


if __name__ == "__main__":
    main()
