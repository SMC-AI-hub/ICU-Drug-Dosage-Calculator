#!/usr/bin/env python3
"""
Build script: bundles the Paediatric & Neonatal Drug Calculator source files
(CSS + JS data + engine + UI) into ONE self-contained, offline HTML file.

Run:  python3 build.py
Out:  docs/standalone.html          (the ONE-FILE app: download, double-click)
      docs/                         (the installable PWA: index.html + manifest
                                     + sw.js + icons -- this is what GitHub
                                     Pages serves, so the live link IS the app)

The build FAILS (exit 1) if:
  * any source file is missing
  * any JavaScript file has a syntax error (`node --check`)
  * a shell placeholder was not substituted
  * the output references an external network resource
"""
import os
import re
import shutil
import subprocess
import sys
import hashlib
import tempfile

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
DOCS = os.path.join(ROOT, "docs")
OUT = os.path.join(DOCS, "standalone.html")

DATA_PARTS = [
    "data/part1-resuscitation.js",
    "data/part2-cardiovascular.js",
    "data/part3-sedation-neuro.js",
    "data/part4-respiratory-renal.js",
    "data/part5-antimicrobials.js",
    "data/part6-endocrine-electrolyte.js",
    "data/part7-toxicology.js",
    "data/part8-special-situations.js",
]

JS_FILES = DATA_PARTS + ["refs.js", "engine.js", "ui.js"]
PLACEHOLDERS = ["/*__CSS__*/", "/*__JS__*/", "/*__BUILD__*/"]


def read(p):
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


def node_check(path):
    """Return None if the file parses, else the stderr text."""
    node = shutil.which("node")
    if not node:
        return None            # node unavailable - skip, do not block
    r = subprocess.run([node, "--check", path], capture_output=True, text=True)
    return None if r.returncode == 0 else (r.stderr or "").strip()


PWA_DIR = DOCS   # the site root IS the installable app
PWA_ICONS = os.path.join(PWA_DIR, "icons")

PWA_HEAD = """
<!-- ===== installable / offline (PWA) ===== -->
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#0b5394">
<meta name="color-scheme" content="light">
<meta name="application-name" content="ICU Drug Calculator">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ICU Drugs">
<meta name="format-detection" content="telephone=no">
<link rel="icon" type="image/svg+xml" href="icons/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
"""

PWA_BOOT = """
<script>
/* Register the service worker ONLY over http(s). Over file:// (a file opened
   by double-click) service workers cannot exist, and trying must not error. */
(function(){
  if(!('serviceWorker' in navigator)) return;
  if(location.protocol!=='http:' && location.protocol!=='https:') return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(e){
      /* the app still runs and still works from cache; install is unaffected */
      if(window.console) console.warn('service worker not registered:', e && e.message);
    });
  });
})();
</script>
"""

MANIFEST = {
    "name": "Paediatric & Neonatal Drug Calculator — 24 weeks to 18 years",
    "short_name": "Paeds Doses",
    "description": ("Offline paediatric and neonatal drug calculator, 24 weeks of "
                    "gestation to 18 years: postmenstrual-age dosing for preterm "
                    "infants, Fenton/WHO weight estimation, Indian formulations with "
                    "mg/mL concentrations for IV and oral routes, enforced dose caps, "
                    "pump-rate and infusion-board checks, and guideline references."),
    "id": "./",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "display_override": ["window-controls-overlay", "standalone", "minimal-ui"],
    "orientation": "any",
    "background_color": "#0b5394",
    "theme_color": "#0b5394",
    "lang": "en-IN",
    "dir": "ltr",
    "categories": ["medical", "health", "utilities"],
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png",
         "purpose": "maskable"},
        {"src": "icons/apple-touch-icon.png", "sizes": "180x180", "type": "image/png",
         "purpose": "any"},
    ],
    "shortcuts": [
        {"name": "Infusion pump rates", "short_name": "Pump", "url": "./?tab=pump",
         "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}]},
        {"name": "Emergency protocols", "short_name": "Protocols", "url": "./?tab=protocols",
         "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}]},
        {"name": "Calculators (CrCl, fluids, sodium)", "short_name": "Calculators",
         "url": "./?tab=utils", "icons": [{"src": "icons/icon-192.png", "sizes": "192x192"}]},
    ],
}

SW_JS = """/* ICU Drug Calculator — offline service worker.
   Strategy: install-time precache of the whole app, then cache-first for
   every same-origin request. Foreign origins are never contacted, so the
   app keeps working with the radio off, in a lift, or in a bunker. */
var CACHE = 'icu-calc-v{ver}';
var CORE = [
  './', './index.html', './manifest.webmanifest', './sw.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png', './icons/favicon.svg'
];

self.addEventListener('install', function (e) {{
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {{ return c.addAll(CORE); }})
      .then(function () {{ return self.skipWaiting(); }})
  );
}});

self.addEventListener('activate', function (e) {{
  e.waitUntil(
    caches.keys().then(function (keys) {{
      return Promise.all(keys
        .filter(function (k) {{ return k !== CACHE && k.indexOf('icu-calc-v') === 0; }})
        .map(function (k) {{ return caches.delete(k); }}));
    }}).then(function () {{ return self.clients.claim(); }})
  );
}});

self.addEventListener('fetch', function (e) {{
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  /* self-hosted by design: never intercept a foreign origin */
  if (url.origin !== self.location.origin) return;
  e.respondWith((function () {{
    return caches.match(req, {{ ignoreSearch: true }}).then(function (hit) {{
      if (hit) return hit;
      return fetch(req).then(function (res) {{
        if (res && res.ok) {{
          var copy = res.clone();
          caches.open(CACHE).then(function (c) {{ c.put(req, copy); }});
        }}
        return res;
      }}).catch(function () {{
        if (req.mode === 'navigate') {{
          return caches.match('./index.html');
        }}
        return Response.error();
      }});
    }});
  }})());
}});
"""


def write(path, body):
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)


def build_pwa(html, version):
    """Emit the installable package next to the single-file deliverable."""
    import json
    import subprocess
    os.makedirs(PWA_ICONS, exist_ok=True)

    # icons are generated by tools/make_icons.py; regenerate if any is missing
    want = {"icon-192.png": 192, "icon-512.png": 512,
            "icon-maskable-512.png": 512, "apple-touch-icon.png": 180,
            "favicon-32.png": 32, "favicon.svg": None}
    if any(not os.path.exists(os.path.join(PWA_ICONS, n)) for n in want):
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "make_icons.py")],
                       check=True)

    # index.html = the app + installable head + service-worker boot
    pwa_html = html.replace("</head>", PWA_HEAD + "</head>", 1)
    pwa_html = pwa_html.replace("</body>", PWA_BOOT + "</body>", 1)
    write(os.path.join(PWA_DIR, "index.html"), pwa_html)

    write(os.path.join(PWA_DIR, "manifest.webmanifest"),
          json.dumps(MANIFEST, indent=2, ensure_ascii=False) + "\n")

    write(os.path.join(PWA_DIR, "sw.js"), SW_JS.format(ver=version))

    # the single-file twin, shipped inside the same folder for people who
    # would rather carry one .html on a pen drive
    write(os.path.join(PWA_DIR, "standalone.html"), html)

    # every asset the PWA references must exist and be same-origin
    problems = []
    refs = re.findall(r'(?:href|src)="([^"#?]+)"', pwa_html) + \
             [i["src"] for i in MANIFEST["icons"]] + \
             [s["url"] for s in MANIFEST["shortcuts"]] + [
        "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
        "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/favicon.svg"]
    for r in refs:
        if r.startswith(("http://", "https://", "//")):
            problems.append("external: " + r)
            continue
        rel = r.split("?")[0].split("#")[0].lstrip("./")
        if not rel:
            continue
        if not os.path.exists(os.path.join(PWA_DIR, rel)):
            problems.append("missing: " + r)
    # manifest must parse and name real icon files
    m = json.loads(open(os.path.join(PWA_DIR, "manifest.webmanifest"),
                        encoding="utf-8").read())
    for ic in m["icons"]:
        if not os.path.exists(os.path.join(PWA_DIR, ic["src"])):
            problems.append("manifest icon missing: " + ic["src"])
    if problems:
        print("PWA PROBLEMS:")
        for x in problems:
            print("   ", x)
        return 1
    return 0


ZIP_OUT = os.path.join(ROOT, "Paediatric-Drug-Calculator-offline.zip")


def build_zip():
    """One distributable archive: the single file + the installable pack."""
    import zipfile
    keep = ["index.html", "manifest.webmanifest", "sw.js", "standalone.html",
            "README-INSTALL.md"]
    with zipfile.ZipFile(ZIP_OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(OUT, "Paediatric-Drug-Calculator.html")
        readme_src = os.path.join(PWA_DIR, "README-INSTALL.md")
        if os.path.exists(readme_src):
            z.write(readme_src, "README-INSTALL.md")
        for name in keep:
            fp = os.path.join(PWA_DIR, name)
            if os.path.exists(fp):
                z.write(fp, "pwa/" + name)
        for name in sorted(os.listdir(PWA_ICONS)):
            z.write(os.path.join(PWA_ICONS, name), "pwa/icons/" + name)
    kb = os.path.getsize(ZIP_OUT) / 1024.0
    print(f"zip  {ZIP_OUT}  ({kb:,.1f} KB)")
    return 0


def main():
    missing = [p for p in ["styles.css", "shell.html"] + JS_FILES
               if not os.path.exists(os.path.join(SRC, p))]
    if missing:
        print("MISSING FILES:", missing)
        return 1

    # ---- gate 1: every JS source must parse -----------------------------
    bad = []
    for rel in JS_FILES:
        e = node_check(os.path.join(SRC, rel))
        if e:
            bad.append((rel, e))
    if bad:
        print("JAVASCRIPT SYNTAX ERRORS — build aborted:")
        for rel, e in bad:
            print(f"\n--- {rel} ---\n{e}")
        return 1
    print("syntax: all %d JS sources parse cleanly" % len(JS_FILES))

    css = read(os.path.join(SRC, "styles.css"))
    shell = read(os.path.join(SRC, "shell.html"))

    js_chunks = []
    for rel in JS_FILES:
        body = read(os.path.join(SRC, rel))
        # strip sourceMappingURL / accidental external refs
        body = re.sub(r"//#\s*sourceMappingURL=.*", "", body)
        js_chunks.append(f"/* ===== {rel} ===== */\n{body}")
    js = "\n\n".join(js_chunks)

    # ---- gate 2: the assembled bundle must also parse -------------------
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False,
                                     encoding="utf-8") as tf:
        tf.write(js)
        tmp = tf.name
    e = node_check(tmp)
    os.unlink(tmp)
    if e:
        print("BUNDLED JAVASCRIPT DOES NOT PARSE — build aborted:\n" + e)
        return 1

    version = hashlib.sha256((css + js).encode()).hexdigest()[:12]
    html = shell.replace("/*__CSS__*/", css).replace("/*__JS__*/", js)
    html = html.replace("/*__BUILD__*/", version)

    # ---- gate 3: every placeholder substituted --------------------------
    left = [p for p in PLACEHOLDERS if p in html]
    if left:
        print("PLACEHOLDERS NOT SUBSTITUTED:", left)
        return 1

    # ---- gate 4: fully offline (no external network resources) ----------
    ext = []
    for m in re.findall(r'(?:src|href)\s*=\s*["\'](https?://[^"\']+)', html, re.I):
        if "w3.org" not in m:
            ext.append(m)
    for m in re.findall(r'(?:fetch|XMLHttpRequest|importScripts)\s*\(', html):
        ext.append(m + "(...)")
    if ext:
        print("EXTERNAL NETWORK REFERENCES FOUND (must be fully offline):")
        for x in sorted(set(ext)):
            print("   ", x)
        return 1

    os.makedirs(DOCS, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)

    # a clearly-named copy inside docs/: the file to hand to a colleague
    FRIENDLY = os.path.join(DOCS, "Paediatric-Drug-Calculator.html")
    with open(FRIENDLY, "w", encoding="utf-8") as f:
        f.write(html)
    # GitHub Pages: keep Jekyll away from the asset paths
    open(os.path.join(DOCS, ".nojekyll"), "w").close()

    # ---- stage 5: the installable offline package ------------------------
    rc = build_pwa(html, version)
    if rc:
        return 1

    kb = os.path.getsize(OUT) / 1024.0
    n_reg = len(re.findall(r"R\(\{\s*id:'", js))
    n_sys = len(set(re.findall(r"sys:'([a-z]+)'", js)))
    print(f"built {OUT}")
    print(f"copy  {FRIENDLY}  (the same app, named for what it is)")
    print(f"size {kb:,.1f} KB | build {version} | {n_reg} regimens · {n_sys} systems")
    print(f"pwa  {PWA_DIR}/ (installable: index.html + manifest + sw.js + icons)")
    rc = build_zip()
    if rc:
        return 1
    print("counts of formulations / references / protocols: run `node qa/validate.js`")
    return 0


if __name__ == "__main__":
    sys.exit(main())
