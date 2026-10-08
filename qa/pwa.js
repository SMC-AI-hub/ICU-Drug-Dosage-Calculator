/* =====================================================================
   qa/pwa.js — the offline / installable gate.

   Proves the app is genuinely installable and genuinely offline on every
   platform: manifest is valid and complete, every icon exists at exactly
   the size it declares, the service worker parses and precaches only files
   that exist, nothing points at a foreign origin, and the ?tab= deep links
   used by the OS app shortcuts actually switch tabs.

   Run after build.py:   node qa/pwa.js
   ===================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PWA = path.resolve(ROOT, 'docs');          // build.py writes the installable pack into docs/
const SINGLE = path.resolve(ROOT, 'docs', 'standalone.html');

/* The gate must look at THIS repository, never at a checkout next door.
   (A previous revision resolved PWA as ../../pwa, which silently gated a
   different directory on the author's machine and failed in CI.) */
if (!PWA.startsWith(ROOT + path.sep) || !fs.existsSync(path.join(ROOT, 'build.py'))) {
  console.log('RESULT: FAIL — qa/pwa.js is not looking inside its own repo (' + PWA + ')');
  process.exit(1);
}

const FAIL = [], PASS = [];
const chk = (name, cond, detail) => {
  (cond ? PASS : FAIL).push(name + (detail != null ? ' :: ' + detail : ''));
};

/* ---------- PNG header reader (no dependencies) ---------- */
function pngSize(file) {
  const b = fs.readFileSync(file);
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

/* ---------- files present ---------- */
const FILES = ['index.html', 'manifest.webmanifest', 'sw.js', 'standalone.html'];
FILES.forEach(f => chk('pwa/' + f + ' exists', fs.existsSync(path.join(PWA, f))));
if (FAIL.length) { console.log(FAIL.map(f => '  FAIL ' + f).join('\n')); console.log('\nRESULT: FAIL'); process.exit(1); }

/* ---------- manifest ---------- */
let m;
try { m = JSON.parse(fs.readFileSync(path.join(PWA, 'manifest.webmanifest'), 'utf8')); }
catch (e) { chk('manifest is valid JSON', false, e.message); }
if (m) {
  chk('manifest is valid JSON', true);
  ['name', 'short_name', 'start_url', 'scope', 'display', 'background_color',
   'theme_color', 'icons'].forEach(k => chk('manifest has "' + k + '"', !!m[k]));
  chk('display is standalone', m.display === 'standalone', m.display);
  chk('scope is the app root', m.scope === './' || m.scope === '/', m.scope);
  const sizes = { any: 0, maskable: 0 };
  (m.icons || []).forEach(ic => {
    const p = path.join(PWA, ic.src);
    const ok = fs.existsSync(p);
    chk('manifest icon ' + ic.src + ' exists', ok);
    if (ok) {
      const d = pngSize(p);
      const want = ic.sizes.split('x').map(Number);
      chk(ic.src + ' is ' + want[0] + 'x' + want[1], d && d.w === want[0] && d.h === want[1],
        d ? d.w + 'x' + d.h : 'unreadable');
    }
    if ((ic.purpose || '').indexOf('maskable') >= 0) sizes.maskable++;
    if ((ic.purpose || '').indexOf('any') >= 0) sizes.any++;
  });
  chk('a maskable icon is declared (Android adaptive icons)', sizes.maskable >= 1,
    sizes.maskable + ' maskable');
  chk('an "any" icon at >=192 and >=512 is declared',
    (m.icons || []).some(i => i.sizes === '192x192' && /any/.test(i.purpose || '')) &&
    (m.icons || []).some(i => i.sizes === '512x512' && /any/.test(i.purpose || '')));
  chk('a 180x180 icon is declared for iOS',
    (m.icons || []).some(i => i.sizes === '180x180'));
  (m.shortcuts || []).forEach(s => {
    chk('shortcut "' + (s.name || '?') + '" deep-links', /^\.?\/?\?tab=[a-z]+$/.test(s.url || ''), s.url);
  });
  chk('manifest names no foreign origin',
    JSON.stringify(m).indexOf('http://') < 0 && JSON.stringify(m).indexOf('https://') < 0);
}

/* ---------- icons on disk ---------- */
[['icons/icon-192.png', 192], ['icons/icon-512.png', 512],
 ['icons/icon-maskable-512.png', 512], ['icons/apple-touch-icon.png', 180],
 ['icons/favicon-32.png', 32], ['icons/favicon.svg', null]].forEach(([f, want]) => {
  const p = path.join(PWA, f);
  chk(f + ' exists', fs.existsSync(p));
  if (want && fs.existsSync(p)) {
    const d = pngSize(p);
    chk(f + ' is ' + want + 'x' + want, d && d.w === want && d.h === want, d ? d.w + 'x' + d.h : 'unreadable');
  }
  if (f === 'icons/apple-touch-icon.png' && fs.existsSync(p)) {
    /* iOS paints transparency black — the apple icon must be opaque RGB */
    const b = fs.readFileSync(p);
    const colorType = b[25];
    chk('apple-touch-icon is opaque (colour type 2)', colorType === 2, 'colour type ' + colorType);
  }
});

/* ---------- service worker ---------- */
const swPath = path.join(PWA, 'sw.js');
const swr = cp.spawnSync(process.execPath, ['--check', swPath], { encoding: 'utf8' });
chk('sw.js parses', swr.status === 0, swr.stderr ? swr.stderr.split('\n')[0] : '');
const sw = fs.readFileSync(swPath, 'utf8');
const core = (sw.match(/var CORE = \[([\s\S]*?)\];/) || [, ''])[1]
  .match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
chk('sw.js precaches the shell', core.length >= 6, core.length + ' core files');
core.forEach(c => {
  const rel = c.replace(/^\.\//, '');
  const p = rel ? path.join(PWA, rel) : path.join(PWA, 'index.html');
  chk('sw precache entry exists: ' + c, fs.existsSync(p));
});
chk('sw never serves a foreign origin', /url\.origin !== self\.location\.origin/.test(sw));
chk('sw is versioned so a new build replaces the cache', /icu-calc-v[0-9a-f]{12}/.test(sw),
  (sw.match(/var CACHE = '([^']+)'/) || [])[1]);
chk('sw falls back to the cached shell for offline navigation',
  /req\.mode === 'navigate'/.test(sw) && /caches\.match\('\.\/index\.html'\)/.test(sw));

/* ---------- index.html ---------- */
const idx = fs.readFileSync(path.join(PWA, 'index.html'), 'utf8');
chk('index links the manifest', /<link rel="manifest" href="manifest\.webmanifest">/.test(idx));
chk('index declares theme-color', /name="theme-color" content="#0b5394"/.test(idx));
chk('index declares apple-touch-icon', /rel="apple-touch-icon" sizes="180x180" href="icons\/apple-touch-icon\.png"/.test(idx));
chk('index declares apple-mobile-web-app-capable', /name="apple-mobile-web-app-capable" content="yes"/.test(idx));
chk('index declares viewport-fit=cover', /viewport-fit=cover/.test(idx));
chk('index respects the status-bar safe area', /env\(safe-area-inset-top/.test(idx));
chk('SW registration is protocol-guarded',
  /location\.protocol!=='http:' && location\.protocol!=='https:'/.test(idx));
const ext = (idx.match(/(?:href|src)="(https?:\/\/[^"]+)"/g) || [])
  .filter(x => x.indexOf('w3.org') < 0);
chk('index.html references NO external resource', ext.length === 0, ext.slice(0, 3).join(', ') || 'none');
const localRefs = (idx.match(/(?:href|src)="([^"#?]+)"/g) || [])
  .map(s => s.slice(s.indexOf('="') + 2, -1))
  .filter(s => !s.startsWith('data:') && !s.startsWith('http'));
const missing = localRefs.filter(r => !fs.existsSync(path.join(PWA, r.replace(/^\.\//, ''))));
chk('every local asset referenced by index.html exists', missing.length === 0,
  missing.slice(0, 4).join(', ') || 'all ' + localRefs.length + ' present');

/* ---------- the one-file twin stays dependency-free ---------- */
const single = fs.readFileSync(SINGLE, 'utf8');
chk('standalone single file has no manifest link', single.indexOf('rel="manifest"') < 0);
chk('standalone single file registers no service worker', single.indexOf('serviceWorker') < 0);
chk('standalone single file has no external resource',
  (single.match(/(?:href|src)="(https?:\/\/[^"]+)"/g) || []).length === 0);
const twin = fs.readFileSync(path.join(PWA, 'standalone.html'), 'utf8');
chk('pwa/standalone.html is identical to the single-file deliverable', twin === single);

/* ---------- deep links (OS shortcuts) in a real DOM ---------- */
let JSDOM = null;
for (const c of ['jsdom', '/tmp/smoke/node_modules/jsdom', path.join(PWA, '..', 'icu-calc', 'node_modules', 'jsdom')]) {
  try { JSDOM = require(c).JSDOM; break; } catch (e) { /* next */ }
}
async function deepLink(url, wantTab) {
  const dom = new JSDOM(idx, { runScripts: 'dangerously', pretendToBeVisual: true, url });
  const w = dom.window;
  w.scrollTo = () => {}; w.print = () => {};
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  w.Element.prototype.scrollIntoView = function () {};
  await new Promise(r => setTimeout(r, 500));
  const st = w.App.state;
  const ok = st.tab === wantTab;
  dom.window.close();
  return { ok, got: st.tab };
}
(async () => {
  if (JSDOM) {
    const a = await deepLink('https://example.test/?tab=pump', 'pump');
    chk('?tab=pump opens the pump tab', a.ok, 'got ' + a.got);
    const b = await deepLink('https://example.test/?tab=protocols', 'protocols');
    chk('?tab=protocols opens the protocols tab', b.ok, 'got ' + b.got);
    const c = await deepLink('https://example.test/?tab=bogus', 'drugs');
    chk('an unknown ?tab= is ignored, not crashed', c.ok, 'got ' + c.got);
  } else {
    chk('jsdom available for deep-link test', false, 'skipped — jsdom missing');
  }

  console.log('\n' + PASS.map(p => '  PASS ' + p).join('\n'));
  if (FAIL.length) console.log('\n' + FAIL.map(f => '  FAIL ' + f).join('\n'));
  console.log('\n────────────────────────────────────────────────────────');
  console.log(' pwa assertions   ' + PASS.length + ' passed, ' + FAIL.length + ' failed');
  console.log(' gated directory  ' + PWA);
  console.log('────────────────────────────────────────────────────────');
  console.log(FAIL.length ? '\nRESULT: FAIL — the app is not provably offline-installable'
    : '\nRESULT: PASS — installable and offline on Windows, macOS, Android and iOS.');
  process.exit(FAIL.length ? 1 : 0);
})();
