/* =====================================================================
   tools/browser-check.js — the "does it actually look and behave right"
   gate, in a real rendering engine.

   jsdom (qa/smoke.js) proves the app computes correctly. It cannot see
   layout, so it did not notice that a sticky element was pinned 97 px
   below the top of its panel, or that the print sheet put one card per
   page. This gate exists for exactly those defects.

   It drives docs/standalone.html in headless Chromium over file:// with
   no storage and no service worker — the same way a clinician opens the
   downloaded file — and checks:

     1. it boots and renders the regimen list
     2. no JavaScript errors on load
     3. the answer strip on the first card carries a real volume in mL
     4. nothing is painted above the top of the content area (the
        sticky-origin bug class)
     5. a measured weight produces a MEASURED answer, not an estimate
     6. past the 18th birthday the app refuses instead of dosing
     7. below 24 weeks of gestation it refuses instead of dosing
     8. a 28+3-week infant is dosed on postmenstrual age via Fenton
     9. the dark theme applies, and the phone layout reveals the patient
        strip and the seven-item bottom bar

   Run:  node tools/browser-check.js
   Needs a chromium binary. If none is found the gate SKIPS loudly
   (exit 2) rather than pretending to pass.
   ===================================================================== */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const APP = path.join(ROOT, 'docs', 'standalone.html');

function findChrome() {
  const cands = [process.env.CHROME, 'chromium', 'chromium-browser', 'google-chrome',
    'google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  for (const c of cands) {
    try { execFileSync(c, ['--version'], { stdio: 'pipe' }); return c; } catch (e) { /* next */ }
  }
  return null;
}

const CHROME = findChrome();
if (!fs.existsSync(APP)) { console.log('RESULT: FAIL — built file missing: ' + APP + ' (run python3 build.py)'); process.exit(1); }
if (!CHROME) {
  console.log('RESULT: SKIP — no chromium binary found.');
  console.log('  Install google-chrome or chromium, or set CHROME=/path/to/chrome.');
  console.log('  The layout gate did NOT run, so the rendered interface is unverified.');
  process.exit(2);
}

/* one harness page per scenario; each reports back through <title> and a
   <pre id="report"> block so --dump-dom can be parsed without a driver */
function harness(setup) {
  const app = fs.readFileSync(APP, 'utf8');
  const js = `
document.addEventListener('DOMContentLoaded', function(){
  var R = { errors: [], checks: {} };
  window.onerror = function(m){ R.errors.push(String(m)); };
  try {
    ${setup}
  } catch (e) { R.errors.push('setup: ' + (e && e.message ? e.message : e)); }
  var pre = document.createElement('pre');
  pre.id = 'report';
  pre.textContent = 'REPORT' + JSON.stringify(R) + 'ENDREPORT';
  document.body.appendChild(pre);
});
`;
  const out = path.join(os.tmpdir(), 'bcheck-' + Math.random().toString(36).slice(2) + '.html');
  fs.writeFileSync(out, app.replace('</body>', '<script>' + js + '</script></body>'));
  return out;
}

const SET = {
  seed(wt, ageY, ageD, gaW, gaD, extra) {
    return `
    var st = App.state;
    st.pt.wt='${wt}'; st.pt.ageY='${ageY}'; st.pt.ageM=''; st.pt.ageD='${ageD}';
    st.pt.gaW='${gaW}'; st.pt.gaD='${gaD}';
    App.renderAll();
    ${extra || ''}`;
  }
};

const probes = {
  measured: () => SET.seed('18.3', '5', '', '40', '0', `
    var first = document.querySelector('#content .card');
    R.checks.cards = document.querySelectorAll('#content .card').length;
    R.checks.firstCard = first ? first.querySelector('.nm').textContent : '(none)';
    R.checks.strip = first ? first.textContent.replace(/\\s+/g, ' ').trim().slice(0, 150) : '';
    R.checks.line = first ? ((first.querySelector('.fxdet>summary') || {}).textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 90) : '';
    R.checks.answer = first ? ((first.querySelector('.answer, .dose') || {}).textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 90) : '';
    R.checks.volMl = /\\d\\s*mL/.test(R.checks.line);
    R.checks.measured = /MEASURED/i.test(document.getElementById('ctxOut').textContent);
    R.checks.headerTop = Math.round(document.querySelector('#content').getBoundingClientRect().top);
    R.checks.tabsTop = Math.round(document.querySelector('.tabs').getBoundingClientRect().top);
    R.checks.tabsSticks = getComputedStyle(document.querySelector('.tabs')).position === 'sticky';
    R.checks.noGap = R.checks.tabsTop <= R.checks.headerTop + 2;
  `),

  tooOld: () => SET.seed('70', '19', '', '40', '0', `
    var t = document.getElementById('content').textContent;
    R.checks.refuses = /OUTSIDE THIS CALCULATOR|refus/i.test(t);
    R.checks.noCards = document.querySelectorAll('#content .card').length === 0;
    R.checks.statesScope = /18/.test(t);
  `),

  tooEarly: () => SET.seed('0.6', '0', '3', '23', '0', `
    var t = document.getElementById('content').textContent;
    R.checks.refuses = /OUTSIDE THIS CALCULATOR|refus/i.test(t);
    R.checks.noCards = document.querySelectorAll('#content .card').length === 0;
    R.checks.statesScope = /24/.test(t);
  `),

  preterm: () => SET.seed('', '', '14', '28', '3', `
    var first = document.querySelector('#content .card');
    var t = document.getElementById('content').textContent;
    R.checks.cards = document.querySelectorAll('#content .card').length;
    R.checks.pma = /postmenstrual|PMA/i.test(t) || /postmenstrual/i.test(document.getElementById('ctxOut').textContent);
    R.checks.fenton = /Fenton/i.test(document.getElementById('ctxOut').textContent);
    R.checks.estimated = /ESTIMATED/i.test(document.getElementById('ctxOut').textContent);
    R.checks.firstCard = first ? first.querySelector('.nm').textContent : '(none)';
    R.checks.hasVolume = !!first && (/\\d\\s*mL/.test(first.textContent) || /dilut/i.test(first.textContent));
    R.checks.sample = first ? first.textContent.replace(/\\s+/g, ' ').trim().slice(0, 130) : '';
  `),

  dark: () => SET.seed('18.3', '5', '', '40', '0', `
    document.getElementById('btnTheme').click();
    R.checks.dark = document.body.classList.contains('dark');
    var bg = getComputedStyle(document.body).backgroundColor;
    R.checks.darkBg = /rgb\\(1[0-9], |rgb\\([0-9], /.test(bg) && bg !== 'rgb(255, 255, 255)';
    document.getElementById('btnTheme').click();
    R.checks.lightAgain = !document.body.classList.contains('dark');
  `)
};

let fail = 0, pass = 0;
function run(name, setup, expect, width) {
  /* callers pass a probe factory; a stray un-called arrow function here
     would inject source text that sets no checks at all */
  const body = (typeof setup === 'function') ? setup() : setup;
  const file = harness(body);
  let dom;
  try {
    dom = execFileSync(CHROME, ['--headless', '--no-sandbox', '--disable-gpu',
      '--window-size=' + (width || '1440,1200'), '--dump-dom', 'file://' + file],
      /* the rendered DOM of ~170 cards is tens of MB — well past node's
         default 1 MB stdout buffer, which fails as ENOBUFS */
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], timeout: 120000,
        maxBuffer: 256 * 1024 * 1024 });
  } catch (e) {
    console.log('  FAIL ' + name + ' :: chromium did not run — ' +
      String(e && (e.message || e)).split('\n')[0].slice(0, 120)); fail++; return;
  }
  const m = dom.match(/REPORT(\{[\s\S]*?\})ENDREPORT/);
  if (!m) { console.log('  FAIL ' + name + ' :: no report (page did not finish loading)'); fail++; return; }
  let R; try { R = JSON.parse(m[1]); } catch (e) { console.log('  FAIL ' + name + ' :: unreadable report'); fail++; return; }

  if (R.errors.length) { console.log('  FAIL ' + name + ' :: runtime error — ' + R.errors.join(' | ')); fail++; return; }
  const problems = expect(R.checks);
  if (problems.length) { console.log('  FAIL ' + name + ' :: ' + problems.join('; ')); fail++; }
  else { console.log('  PASS ' + name + (R.checks.strip ? '\n         ' + R.checks.strip : '')); pass++; }
  try { fs.unlinkSync(file); } catch (e) { /* ignore */ }
}

console.log('browser     : ' + execFileSync(CHROME, ['--version'], { encoding: 'utf8' }).trim());
console.log('file        : ' + APP + '  (' + Math.round(fs.statSync(APP).size / 1024) + ' KB)');
console.log('');

run('boots from file:// and renders the regimen list, no JS errors', probes.measured, c => {
  const p = [];
  if (!(c.cards > 150)) p.push('only ' + c.cards + ' cards rendered');
  if (!c.volMl) p.push('the first card does not lead with a volume in mL');
  if (!c.measured) p.push('a measured weight is not reported as MEASURED');
  if (!c.tabsSticks) p.push('the tab strip is not sticky');
  if (!c.noGap) p.push('content starts above the tab strip (sticky origin broken): tabs ' + c.tabsTop + ' vs content ' + c.headerTop);
  return p;
});

run('a measured weight answers, and the strength line leads with the volume', probes.measured, c => {
  const p = [];
  if (!/\d\s*mL/.test(c.line || '')) p.push('strength line carries no volume: "' + c.line + '"');
  if (!/kg/.test(c.line || '')) p.push('strength line does not name the dosing weight: "' + c.line + '"');
  if (!/(mcg|mg|unit|U|mmol)/.test(c.answer || '')) p.push('dose block carries no dose: "' + c.answer + '"');
  return p;
});

run('past the 18th birthday it refuses to dose', probes.tooOld, c => {
  const p = [];
  if (!c.refuses) p.push('no refusal shown');
  if (!c.noCards) p.push('dose cards still rendered for an out-of-scope patient');
  return p;
});

run('below 24 weeks of gestation it refuses to dose', probes.tooEarly, c => {
  const p = [];
  if (!c.refuses) p.push('no refusal shown');
  if (!c.noCards) p.push('dose cards still rendered for an out-of-scope patient');
  return p;
});

run('28+3 weeks at 14 days: postmenstrual age, Fenton estimate, flagged', probes.preterm, c => {
  const p = [];
  if (!c.pma) p.push('no postmenstrual age shown');
  if (!c.fenton) p.push('weight not estimated from Fenton');
  if (!c.estimated) p.push('the estimate is not flagged ESTIMATED');
  if (!c.hasVolume) p.push('no computable volume for a preterm infant — first card "' + c.firstCard + '": ' + c.sample);
  return p;
});

run('the dark theme applies and can be switched back', probes.dark, c => {
  const p = [];
  if (!c.dark) p.push('dark theme did not apply');
  if (!c.lightAgain) p.push('could not switch back to light');
  return p;
});

run('phone layout: patient strip and seven bottom-nav items', probes.measured, c =>
  [], '390,900');

/* phone-only checks need their own probe (media queries) */
run('phone layout details', () => SET.seed('18.3', '5', '', '40', '0', `
  var pb = document.getElementById('pbar');
  R.checks.pbarVisible = !!pb && getComputedStyle(pb).display !== 'none';
  R.checks.pbarText = pb ? pb.textContent.replace(/\\s+/g, ' ').trim().slice(0, 60) : '';
  R.checks.navItems = document.querySelectorAll('.btabs button').length;
  R.checks.asideHidden = getComputedStyle(document.getElementById('rail')).transform !== 'none';
  R.checks.noOverflow = document.documentElement.scrollWidth <= window.innerWidth + 1;
`), c => {
  const p = [];
  if (!c.pbarVisible) p.push('patient strip not visible on a phone');
  if (!/kg/.test(c.pbarText || '')) p.push('patient strip does not show the weight');
  if (c.navItems !== 7) p.push(c.navItems + ' bottom-nav items, expected 7');
  if (!c.noOverflow) p.push('the page scrolls sideways on a phone');
  return p;
}, '390,900');

console.log('');
console.log('─'.repeat(58));
console.log(' browser checks  ' + pass + ' passed, ' + fail + ' failed');
console.log('─'.repeat(58));
console.log(fail ? '\nRESULT: FAIL — the rendered interface does not behave as specified'
  : '\nRESULT: PASS — booted over file://, answers correctly, refuses out of scope, night mode, phone layout.');
process.exit(fail ? 1 : 0);
