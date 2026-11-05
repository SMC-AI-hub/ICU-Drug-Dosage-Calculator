# Paediatric & Neonatal Drug Calculator — offline install pack
### 24 weeks of gestation to 18 years

Everything in this folder runs with **no internet connection**. The complete
drug database (279 regimens · 660 Indian formulations · 321 references ·
40 protocols) is embedded in the HTML; no CDN, no font, no analytics, no
telemetry, nothing is fetched at run time.

**Scope:** this is a paediatric calculator. Enter the **gestational age at
birth** for any baby born before 37 weeks and it doses on postmenstrual age,
estimates weight from the Fenton preterm reference and shows the corrected
age. It deliberately prints **no doses** below 24 weeks of gestation or past
the 18th birthday — an out-of-range patient gets an explanation, never a
number.

## What is in the pack

| Path | What it is |
|---|---|
| `ICU_Emergency_Drug_Calculator.html` | **The whole app in one file.** Double-click it on Windows or macOS, or open it from the Files app on Android. No install, no server. |
| `pwa/index.html` | The same app, packaged as an installable web app. |
| `pwa/manifest.webmanifest` | Install metadata: name, icons, colours, app shortcuts. |
| `pwa/sw.js` | Service worker. Precaches the app and serves it cache-first, so it opens in airplane mode. |
| `pwa/icons/` | Launcher icons at 192/512 px, a maskable 512 px, an iOS 180 px touch icon and favicons. |
| `pwa/standalone.html` | A copy of the one-file build, kept inside the pack for convenience. |

## Installing it

### Android
1. Host the `pwa/` folder on any HTTPS address (or use the copy your hospital
   already serves), and open it in **Chrome**, **Edge**, **Samsung Internet**
   or **Firefox**.
2. Tap the menu **⋮ → Install app** (or **Add to Home screen**).
3. The icon appears on the home screen; it launches full-screen and works
   with the radio off.

No host available? Copy `ICU_Emergency_Drug_Calculator.html` onto the phone
and open it in any browser, or from the Files app.

### iPhone / iPad
1. Open the hosted copy in **Safari** (iOS only installs from Safari).
2. Tap **Share → Add to Home Screen**.
3. It launches as a standalone app.

Note: iOS can evict a web app's cache after roughly seven days of the app not
being opened. Open it once a week, or keep the single HTML file in the Files
app as a permanent fallback.

### Windows
1. Open the hosted copy in **Edge** or **Chrome**.
2. Click the **install icon in the address bar**, or **⋯ / ⋮ → Apps → Install
   this site as an app**.
3. It appears in the Start menu and the taskbar with its own window.

Or simply double-click `ICU_Emergency_Drug_Calculator.html`.

### macOS
- **Chrome / Edge:** menu → **Install …** (or **Cast, save and share →
  Install page as app…**).
- **Safari 17+:** **File → Add to Dock** — it becomes a Dock app.
- Or open `ICU_Emergency_Drug_Calculator.html` in any browser.

### No server at all (ward computer, pen drive, field kit)
Copy the folder, or just the single HTML file, onto local storage and open it.
Installation is unnecessary — the calculator is complete as a file. The
service worker (true offline caching after first load) requires `http(s)`,
which is the only reason to host it.

## Hosting it for a department
Put the `pwa/` folder on any HTTPS web server or intranet box — nginx, Apache,
IIS, a Raspberry Pi, GitHub Pages, anything. Requirements are only:
- serve `sw.js` as `text/javascript` and `manifest.webmanifest` as
  `application/manifest+json` (any modern server does this by extension);
- keep the folder structure, because the service worker caches relative paths;
- HTTPS (browsers refuse service workers over plain HTTP except localhost).

Each device that installs it once keeps working when the network does not.

## Updating
The service worker's cache name embeds the build hash. When you replace the
folder with a newer build, every installed device picks the new version up on
its next visit while connected, and keeps using the old one until then. The
build hash is visible in the top bar of the app.

## Verifying the pack
`icu-calc/qa/run.sh` runs four gates: numerical/clinical validation, the
build, the **offline-installable gate** (`qa/pwa.js`: manifest completeness,
exact icon sizes, service-worker precache integrity, zero foreign origins,
`?tab=` shortcut deep links) and a DOM smoke test of the built file.
All four must pass for a shippable pack.
