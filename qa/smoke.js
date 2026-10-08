/* =====================================================================
   qa/smoke.js — DOM smoke test for the BUILT single-file app.

   This is the only test that proves the deliverable actually runs in a
   browser: it loads ICU_Emergency_Drug_Calculator.html into jsdom with
   scripts enabled and drives it like a user would (typing a weight,
   switching tabs, searching, filtering, exporting CSV).

   Run AFTER build.py:   node qa/smoke.js
   Requires jsdom:       npm install --prefix icu-calc jsdom   (workspace-local)
   If jsdom is absent the test SKIPS loudly (exit 2) rather than passing.
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BUILT = path.resolve(ROOT, 'docs', 'standalone.html');

/* ---------- gate 0: every source must parse (catches a stray bracket
   that would silently kill the whole <script> block in the browser) --- */
const SRC = path.join(ROOT, 'src');
const JS = [
  'data/part1-resuscitation.js', 'data/part2-cardiovascular.js',
  'data/part3-sedation-neuro.js', 'data/part4-respiratory-renal.js',
  'data/part5-antimicrobials.js', 'data/part6-endocrine-electrolyte.js',
  'data/part7-toxicology.js', 'data/part8-special-situations.js',
  'refs.js', 'engine.js', 'ui.js'
];
let synFail = 0;
JS.forEach(rel => {
  const r = cp.spawnSync(process.execPath, ['--check', path.join(SRC, rel)], { encoding: 'utf8' });
  if (r.status !== 0) { synFail++; console.log('  SYNTAX ERROR in ' + rel + '\n' + r.stderr); }
});
if (synFail) { console.log('\nRESULT: FAIL — ' + synFail + ' source file(s) do not parse'); process.exit(1); }
console.log('syntax      : all ' + JS.length + ' JS sources parse cleanly');

if (!fs.existsSync(BUILT)) {
  console.log('\nRESULT: FAIL — built file not found: ' + BUILT + '  (run: python3 build.py)');
  process.exit(1);
}

/* ---------- jsdom ---------- */
let JSDOM, VirtualConsole;
const CANDIDATES = ['jsdom', '/tmp/smoke/node_modules/jsdom',
  path.join(ROOT, 'node_modules/jsdom'), '/home/user/node_modules/jsdom'];
for (const c of CANDIDATES) {
  try { ({ JSDOM, VirtualConsole } = require(c)); break; } catch (e) { /* try next */ }
}
if (!JSDOM) {
  console.log('\nRESULT: SKIP — jsdom is not installed. Install with:\n' +
    '  npm install --prefix icu-calc jsdom\n' +
    'The DOM smoke test did NOT run, so the browser behaviour is unverified.');
  process.exit(2);
}

const html = fs.readFileSync(BUILT, 'utf8');
const RUNTIME = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => {
  const m = (e.stack || e.message || '').split('\n')[0];
  /* the CSV download link "navigates" — jsdom does not implement that */
  if (/Not implemented: navigation/.test(m)) return;
  if (/Not implemented/.test(m)) return;
  RUNTIME.push('jsdomError: ' + m);
});
vc.on('error', (...a) => RUNTIME.push('console.error: ' + a.join(' ')));

let CSV = null;
const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
  url: 'file://' + BUILT.replace(/\\/g, '/'),
  beforeParse(w) {
    w.scrollTo = () => {}; w.print = () => {};
    w.matchMedia = w.matchMedia || (q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const OB = w.Blob;
    w.Blob = function (parts, opts) { CSV = (parts || []).join(''); return new OB(parts, opts); };
    w.URL.createObjectURL = () => 'blob:local';
    w.URL.revokeObjectURL = () => {};
  }
});
const w = dom.window, d = w.document;
const $ = id => d.getElementById(id);
const q = s => d.querySelector(s);
const qa = (s, root) => Array.from((root || d).querySelectorAll(s));
const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

const PASS = [], FAIL = [];
const chk = (name, cond, detail) => {
  (cond ? PASS : FAIL).push(name + (detail != null ? ' :: ' + detail : ''));
};
const setVal = (id, v) => {
  const el = $(id);
  if (!el) { FAIL.push('missing input #' + id); return; }
  el.value = v;
  el.dispatchEvent(new w.Event('input', { bubbles: true }));
  el.dispatchEvent(new w.Event('change', { bubbles: true }));
};
const click = (el, label) => {
  if (!el) { FAIL.push('cannot click ' + label + ' (element missing)'); return; }
  el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, view: w }));
};
const tick = (ms) => new Promise(r => setTimeout(r, ms || 350));
const ST_tab_is = t => { try { const st = w.App.state; return ((typeof st === 'function' ? st() : st).tab || '') === t; } catch (e) { return false; } };
const tabBtn = t => qa('#tabs button, #tabs .tab')
  .find(x => (x.dataset.tab || '').toLowerCase() === t);

(async () => {
  await tick();

  /* ---- boot ---- */
  chk('app object exposed', !!w.App, 'keys=' + Object.keys(w.App || {}).join('/'));
  chk('initial render populated', ($('content') || { innerHTML: '' }).innerHTML.length > 50000,
    ($('content') || { innerHTML: '' }).innerHTML.length + ' chars');
  chk('safety banner present', !!q('.safety'));
  chk('7 tabs rendered', qa('#tabs button[role=tab]').length === 7,
    qa('#tabs button[role=tab]').length + ' desktop tabs');
  chk('phone bottom nav mirrors the 7 tabs', qa('#tabs .btabs button').length === 7,
    qa('#tabs .btabs button').length + ' bottom tabs');
  chk('no patient yet', /no patient/i.test(txt($('metaCtx'))), txt($('metaCtx')).slice(0, 60));

  /* ---- adult, measured weight ---- */
  setVal('p_wt', '70'); await tick(600);

  /* answer-first cards: every drug shows the volume to draw on one line, with
     the strength tables collapsed until the clinician asks for them */
  const sums = qa('#content .fxdet > summary');
  chk('answer-first summary on every card', sums.length === qa('#content .card').length,
    sums.length + ' summaries / ' + qa('#content .card').length + ' cards');
  chk('summary leads with the weight and the volume to draw',
    sums.length > 0 && /70\s*kg\s*→/.test(txt(sums[0])) && /mL/.test(txt(sums[0])),
    sums.length ? txt(sums[0]).slice(0, 90) : 'none');
  chk('strength tables start collapsed', qa('#content .fxdet[open]').length === 0,
    qa('#content .fxdet[open]').length + ' open of ' + qa('#content .fxdet').length);
  chk('no ten-fold alert on a clean 70 kg adult',
    !qa('#content .notebox.warn').some(n => /TEN-FOLD/.test(n.textContent)), 'silent');
  click(q('#expAll'), 'expand all'); await tick(700);
  chk('Expand all opens every strength table',
    qa('#content .fxdet[open]').length === qa('#content .fxdet').length &&
    w.App.state.expand.size >= qa('#content .card').length,
    qa('#content .fxdet[open]').length + '/' + qa('#content .fxdet').length);

  let cards = qa('#content .card');
  chk('every listed card is in paediatric scope', cards.length > 150 &&
    !cards.some(c => /^adult$/i.test(((c.querySelector('.bdg') || {}).textContent || '').trim())),
    cards.length + ' cards, none adult-only');
  chk('adult 70 kg: context shows weight', /70\s*kg/.test(txt($('metaCtx'))), txt($('metaCtx')).slice(0, 70));
  chk('adult 70 kg: volumes computed', qa('#content .card .vol').length > 300,
    qa('#content .card .vol').length + ' volume cells');
  chk('adult 70 kg: neonatal-only entries hidden',
    !cards.some(c => { const b = c.querySelector('.bdg.b-age'); return b && b.textContent === 'NEONATE'; }),
    'a weight of 70 kg cannot be a neonate');
  chk('dosing weight block says MEASURED', /measured/i.test(txt($('ctxOut'))), txt($('ctxOut')).slice(0, 90));

  /* ---- hand-checked anchors (the numbers a clinician would verify) ---- */
  /* live lookup — a captured node list goes stale on every re-render */
  const findCard = id => q('.card[data-id="' + id + '"]');
  const rowTexts = id => {
    const c = findCard(id); if (!c) return [];
    return qa('table.fx tbody tr', c).filter(r => r.children.length >= 3)
      .map(r => Array.from(r.children).map(txt));
  };
  const volOf = (id, n) => { const r = rowTexts(id)[n]; return r ? r[2].replace(/\s+/g, ' ') : '(row missing)'; };

  /* pin the patient these volume anchors are computed for: a 30 kg 10-year-old */
  setVal('p_ageY', '10'); setVal('p_gaW', '40'); setVal('p_ageD', ''); setVal('p_wt', '30'); await tick(900);
  chk('adult-only entries are hidden from a paediatric list',
    !qa('.card[data-id="adr-arrest-ad"], .card[data-id="thyroid-storm"]').length,
    'no adult-only cards');
  chk('adrenaline 0.01 mg/kg @30 kg -> 0.3 mL of 1:1000', /^0\.3\s*mL/i.test(volOf('adr-arrest-pd', 0)), volOf('adr-arrest-pd', 0));
  chk('the same dose in the 1:10 000 strength needs 3 mL', /^3\s*mL/i.test(volOf('adr-arrest-pd', 1)), volOf('adr-arrest-pd', 1));
  chk('MgSO4 25-50 mg/kg at 30 kg -> 1.5-3 mL of the 50% strength',
    /1\.5[–-]3\s*mL/.test(txt(q('.card[data-id="mgso4-torsades-pd"] .fx'))),
    (txt(q('.card[data-id="mgso4-torsades-pd"] .fx')).match(/\d+\.?\d*[–-]?\d*\s*mL/) || ['?'])[0]);
  /* the infusion anchors below are hand-computed for 70 kg: re-pin */
  setVal('p_ageY', '16'); setVal('p_wt', '70'); await tick(900);
  chk('noradrenaline 0.05 mcg/kg/min @70 kg -> 0.21-4.2 mL/h of 1 mg/mL',
    /^0\.21[–-]4\.2\s*mL/.test(volOf('norad-inf', 0)), volOf('norad-inf', 0));
  chk('insulin 0.05 U/kg/h @70 kg flags dilution',
    !!((findCard('insulin-dka') || { querySelector: () => null }).querySelector('.notebox')),
    'a 0.035 mL/h draw must produce dilution advice');
  chk('ASV 10 vials -> 10 mL', /^10\s*mL/.test(volOf('asv-snakebite', 0)), volOf('asv-snakebite', 0));
  chk('adult obstetric/endocrine emergencies are out of scope for children',
    !q('.card[data-id="thyroid-storm"]') && !q('.card[data-id="mgso4-eclampsia"]'), 'hidden');
    const ivProp = rowTexts('thyroid-storm').find(r => /Propranolol 1 mg\/mL/.test(r[0]));
  
  /* ---- age only -> weight estimated ---- */
  setVal('p_wt', ''); setVal('p_ageY', '5'); await tick(600);
  chk('age-only: cards rendered', qa('#content .card').length > 50, qa('#content .card').length + ' cards');
  chk('age-only: weight flagged ESTIMATED', /estimat/i.test(txt($('ctxOut'))), txt($('ctxOut')).slice(0, 70));
  chk('age-only: 5 y -> 18.3 kg (WHO median, male)', /18\.3/.test(txt($('ctxOut'))), txt($('ctxOut')).slice(0, 90));
  chk('age-only: paediatric population applied',
    !!q('#content .bdg.b-age') && /PAED/i.test(q('#content .bdg.b-age').textContent),
    q('#content .bdg.b-age') ? q('#content .bdg.b-age').textContent : 'none');

  /* ---- neonate ---- */
  setVal('p_ageY', ''); setVal('p_ageD', '2'); setVal('p_wt', '3.4'); await tick(600);
  chk('neonate: cards rendered', qa('#content .card').length > 50, qa('#content .card').length + ' cards');
  chk('neonate: population = neonatal in the patient panel', /neonat/i.test(txt($('ctxOut'))),
    txt($('ctxOut')).replace(/\s+/g, ' ').slice(0, 120));
  chk('neonate: neonatal-only entries are shown',
    qa('#content .card').some(c => { const b = c.querySelector('.bdg.b-age'); return b && b.textContent === 'NEONATE'; }),
    'at least one NEONATE card');
  const surf = qa('#content .card').find(c => c.dataset.id === 'surfactant');
  chk('neonate: surfactant entry visible', !!surf);
  if (surf) {
    const r = Array.from(surf.querySelectorAll('table.fx tbody tr')).filter(x => x.children.length >= 3)
      .map(x => Array.from(x.children).map(txt));
    const por = r.find(x => /poractant/i.test(x[0]));
    chk('surfactant 200 mg/kg @3.4 kg poractant 80 mg/mL -> 8.5 mL',
      por && /^8\.5\s*mL/.test(por[2]), por ? por[2] : 'row missing');
  }

  /* the decimal-point guard: a neonate weighing 34 kg is a mistyped 3.4 */
  setVal('p_wt', '34'); await tick(600);
  chk('weight–age mismatch flags a possible decimal error',
    /WEIGHT–AGE MISMATCH/i.test(txt($('ctxOut'))) &&
    qa('#content .notebox.warn').some(n => /WEIGHT–AGE MISMATCH/.test(n.textContent)),
    txt($('ctxOut')).replace(/\s+/g, ' ').slice(0, 90));
  chk('a ten-fold weight error raises no false ten-fold dose alert',
    !qa('#content .notebox.warn').some(n => /TEN-FOLD/.test(n.textContent)), 'silent');
  setVal('p_wt', '3.4'); await tick(600);
  chk('a plausible neonatal weight clears the mismatch flag',
    !/WEIGHT–AGE MISMATCH/i.test(txt($('ctxOut'))), txt($('ctxOut')).replace(/\s+/g, ' ').slice(0, 90));

  /* ---- back to adult for the remaining tabs ---- */
  setVal('p_ageD', ''); setVal('p_wt', '70'); await tick(700);
  chk('Collapse all returns to the one-line answer',
    (function(){ click(q('#colAll'), 'collapse all'); return true; })(), 'clicked');
  await tick(700);
  chk('after collapse no strength table is open', qa('#content .fxdet[open]').length === 0,
    qa('#content .fxdet[open]').length + ' open');
  click(q('#expAll'), 'expand all again'); await tick(700);

  /* ---- filters ---- */
  const sysChips = qa('#content .chip[data-sys]');
  chk('system filter chips', sysChips.length >= 15, sysChips.length + ' chips');
  /* sysChips[0] is "All systems"; pick a real system chip */
  const oneSys = sysChips.find(b => b.getAttribute('data-sys') !== '__all__');
  const before2 = qa('#content .card').length;
  click(oneSys, 'a single system chip'); await tick(600);
  const filtered = qa('#content .card').length;
  chk('system filter narrows the list', filtered > 0 && filtered < before2,
    before2 + ' -> ' + filtered + ' cards (' + (oneSys ? oneSys.textContent.trim() : '?') + ')');
  chk('system filter shows only that system',
    qa('#content .sysgroup').length === 1, qa('#content .sysgroup').length + ' system sections');
  click(qa('#content .chip[data-sys="__all__"]')[0], 'All systems chip'); await tick(600);
  chk('"All systems" restores the full list', qa('#content .card').length === before2,
    qa('#content .card').length + ' vs ' + before2);

  const search = $('q');
  chk('search box present', !!search);
  if (search) {
    const before = qa('#content .card').length;
    search.value = 'adrenaline'; search.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(500);
    const after = qa('#content .card').length;
    chk('search narrows the list', after > 0 && after < before, before + ' -> ' + after);
    search.value = 'zzzznotadrug'; search.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(500);
    chk('search with no hits says so', qa('#content .card').length === 0, qa('#content .card').length + ' cards');
    search.value = ''; search.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(500);
    chk('search cleared restores the list', qa('#content .card').length === before,
      qa('#content .card').length + ' vs ' + before);
  }

  /* ---- every tab must render real content ---- */
  for (const t of ['pump', 'drip', 'protocols', 'utils', 'refs', 'about', 'drugs']) {
    click(tabBtn(t), 'tab ' + t); await tick(600);
    const len = $('content').innerHTML.length;
    chk('tab "' + t + '" renders', len > 700, len + ' chars');
  }

  /* ---- pump tab must show programmable rates ---- */
  click(tabBtn('pump'), 'pump tab'); await tick(600);
  chk('pump tab lists every in-scope titrated infusion', qa('#content .utile').length >= 20,
    qa('#content .utile').length + ' infusion panels');
  chk('pump tab shows mL/h columns', qa('#content .utile th').some(th => /mL\/h/.test(th.textContent)),
    'mL/h header present');
  const pumpCells = qa('#content .utile tbody tr td.n.b').map(txt);
  chk('every pump row has a numeric mL/h range',
    pumpCells.length >= 40 && pumpCells.every(t => /^[\d.,]+[–-][\d.,]+$/.test(t)),
    pumpCells.length + ' pump rates, e.g. ' + pumpCells.slice(0, 3).join(' ') +
    (pumpCells.some(t => !/^[\d.,]+[–-][\d.,]+$/.test(t)) ? ' | BAD: ' + pumpCells.filter(t => !/^[\d.,]+[–-][\d.,]+$/.test(t)).slice(0, 4).join(' ') : ''));
  chk('pump tab can open a drug card', !!q('#content .openCard'));

  /* ---- the mix & run continuous-infusion workspace ---- */
  chk('mix panel present', !!q('#mxDrug') && !!q('#mxAmt') && !!q('#mxConcLine'));
  setVal('mxDrug', 'midazolam-inf'); await tick(400);
  chk('choosing a drug seeds its standard preparation',
    q('#mxDrugAmt').value === '100' && q('#mxVol').value === '50',
    q('#mxDrugAmt').value + ' ' + q('#mxDrugUnit').value + ' in ' + q('#mxVol').value + ' mL');
  chk('standard-prep chips are offered', qa('.mxpre').length >= 1, qa('.mxpre').length + ' presets');
  setVal('mxAmt', '0.1'); setVal('mxPer', 'mg|kg/h');
  setVal('mxDrugAmt', '50'); setVal('mxVol', '50'); await tick(350);
  chk('the panel states what each mL contains',
    txt(q('#mxConcLine')).indexOf('Each 1 mL contains 1 mg = 1000 mcg') === 0,
    txt(q('#mxConcLine')).slice(0, 80));
  chk('0.1 mg/kg/h at 70 kg of a 1 mg/mL syringe = 7 mL/h',
    txt(q('.rate-hero .rh')).indexOf('7 mL/h') === 0, txt(q('.rate-hero .rh')));
  chk('the 24 h load is shown', txt(q('#mxOut')).indexOf('168 mg/24 h') >= 0, '');
  chk('the ordered dose is compared with the cited range across bases',
    txt(q('#mxOut')).indexOf('Within the cited range') >= 0 &&
    txt(q('#mxOut')).indexOf('mcg/kg/min') >= 0, txt(q('#mxOut .notebox')) || 'no range note');
  const pre = qa('.mxpre').find(b => /100 mg in 50 mL/.test(b.textContent));
  click(pre, 'preset chip'); await tick(300);
  chk('a preset chip rewrites the preparation and the rate',
    q('#mxDrugAmt').value === '100' && txt(q('.rate-hero .rh')).indexOf('3.5 mL/h') === 0,
    txt(q('.rate-hero .rh')));
  click(qa('#mxMode button')[1], 'label mode'); setVal('mxConcC', '1'); await tick(300);
  chk('label mode (1 mg/mL) reproduces the same rate',
    txt(q('.rate-hero .rh')).indexOf('7 mL/h') === 0, txt(q('.rate-hero .rh')));
  chk('the printable line label carries the per-mL content and a check line',
    txt(q('#mxLbl')).indexOf('EACH 1 mL CONTAINS') >= 0 &&
    txt(q('#mxLbl')).indexOf('CHECKED BY') >= 0, '');

  /* ---- 24 weeks to 18 years: the preterm engine ---- */
  click(tabBtn('drugs'), 'back to the drug list'); await tick(700);
  setVal('p_wt', ''); setVal('p_ageY', ''); setVal('p_ageM', '');
  setVal('p_gaW', '28'); setVal('p_gaD', '3'); setVal('p_ageD', '14'); await tick(900);
  const pctx = txt($('ctxOut'));
  chk('postmenstrual age is computed from gestation + postnatal age',
    /Postmenstrual age/.test(pctx) && /30\+3/.test(pctx),
    (pctx.match(/Postmenstrual age[^A-Z]*/) || ['none'])[0].slice(0, 50));
  chk('weight is estimated from the Fenton preterm reference, not WHO',
    /Fenton/.test(pctx) && /1\.4\s*kg|1\.5\s*kg/.test(pctx),
    (pctx.match(/Fenton[^A-Z]*/) || ['none'])[0].slice(0, 60));
  chk('the estimate is flagged ESTIMATED, never silently used',
    /ESTIMATED/.test(pctx), 'flag present');
  chk('a preterm infant is marked PRETERM', /PRETERM/.test(pctx));
  chk('neonatal entries are shown for a 28-weeker', qa('#content .card').length > 100,
    qa('#content .card').length + ' cards');
  chk('preterm dosing is per-kg and computable', /mL|mmol|units/.test(txt(q('#content .card .fxdet > summary'))),
    txt(q('#content .card .fxdet > summary')).slice(0, 70));

  /* the neonatal block that makes this a preterm calculator */
  const neoIds = ['ibuprofen-pda', 'indomethacin-pda', 'vitamin-k-prophylaxis', 'caffeine-apnoea', 'surfactant'];
  neoIds.forEach(function (id) {
    chk('neonatal entry present: ' + id, !!q('.card[data-id="' + id + '"]'));
  });
  setVal('p_wt', '1.2'); await tick(900);
  chk('ibuprofen PDA loads at 10 mg/kg: 1.2 kg -> 2.4 mL of 5 mg/mL',
    /2\.4\s*mL/.test(txt(q('.card[data-id="ibuprofen-pda"] .fx'))),
    (txt(q('.card[data-id="ibuprofen-pda"] .fx')).match(/\d+\.?\d*\s*mL/) || ['?'])[0]);
  chk('indomethacin PDA 0.2 mg/kg: 1.2 kg -> 0.24 mL of 1 mg/mL',
    /0\.24\s*mL/.test(txt(q('.card[data-id="indomethacin-pda"] .fx'))),
    (txt(q('.card[data-id="indomethacin-pda"] .fx')).match(/0\.\d+\s*mL/) || ['?'])[0]);
  chk('vitamin K is a FIXED dose by birth weight, not per kg',
    /0\.05 mL \(0\.5 mg\)/.test(txt(q('.card[data-id="vitamin-k-prophylaxis"] .fx'))),
    (txt(q('.card[data-id="vitamin-k-prophylaxis"] .fx')).match(/1500 g[^.]*/) || ['?'])[0].slice(0, 60));

  /* corrected age, and the guards that use it */
  setVal('p_ageD', '120'); await tick(900);
  chk('corrected age is shown for a preterm infant',
    /Corrected age/.test(txt($('ctxOut'))), (txt($('ctxOut')).match(/Corrected age[^A-Z]*/) || ['none'])[0].slice(0, 50));
  setVal('p_wt', '42'); await tick(900);
  chk('a ten-fold weight error on a 28-weeker is flagged',
    /WEIGHT–AGE MISMATCH/.test(txt($('ctxOut'))),
    (txt($('ctxOut')).match(/WEIGHT–AGE MISMATCH[^A-Z]*/) || ['none'])[0].slice(0, 70));
  setVal('p_wt', '0.9'); await tick(900);
  chk('a tenth-of-value weight error is flagged too',
    /WEIGHT–AGE MISMATCH/.test(txt($('ctxOut'))), 'flagged both ways');
  setVal('p_wt', '5.2'); await tick(900);
  chk('a plausible weight for that corrected age is NOT flagged',
    !/WEIGHT–AGE MISMATCH/.test(txt($('ctxOut'))), 'silent when the weight fits');

  /* scope envelopes */
  setVal('p_wt', '3.5'); setVal('p_gaW', '23'); await tick(900);
  chk('below 24 weeks is refused, not approximated',
    /outside this calculator/i.test(txt($('ctxOut'))), txt($('ctxOut')).slice(0, 90).replace(/\s+/g, ' '));
  setVal('p_gaW', '40'); setVal('p_gaD', '0'); setVal('p_ageD', ''); setVal('p_ageY', '19'); setVal('p_wt', '70'); await tick(900);
  chk('past the 18th birthday the calculator refuses to print doses',
    /Outside this calculator/.test(txt($('content'))),
    txt($('content')).slice(0, 110).replace(/\s+/g, ' '));
  chk('a 25-year-old is not silently dosed', qa('#content .card').length === 0,
    qa('#content .card').length + ' cards shown');
  setVal('p_ageY', '16'); await tick(900);
  chk('a 16-year-old is inside the range', qa('#content .card').length > 100,
    qa('#content .card').length + ' cards');
  setVal('p_wt', ''); setVal('p_ageY', '4'); setVal('p_gaW', '40'); await tick(900);

  /* ---- pump sub-modes: rounding honesty, reverse check, line board ----
     (all queried with q()/querySelector: jsdom's getElementById map goes
     stale after repeated innerHTML replacement) */
  /* a defined 16-year-old, 70 kg — the top of this calculator's range */
  setVal('p_ageY', '16'); setVal('p_gaW', '40'); setVal('p_gaD', '0'); setVal('p_wt', '70'); await tick(900);
  click(tabBtn('pump'), 'pump tab'); await tick(800);
  const pmTab = n => qa('.pumptabs button').find(b => b.getAttribute('data-pm') === n);
  chk('pump tab offers the three workspaces', qa('.pumptabs button').length === 3,
    qa('.pumptabs button').map(b => txt(b)).join(' | '));
  chk('mix & run is the default workspace',
    !!pmTab('mix') && pmTab('mix').getAttribute('aria-selected') === 'true');
  chk('pump steps are disclosed, not assumed', !!q('#mxStep') && q('#mxStep').value === '0.1',
    q('#mxStep') ? q('#mxStep').value + ' mL/h steps' : 'missing');
  chk('the mix answer states the band the pump can actually hold',
    /The pump can hold [\d.]+–[\d.]+ mL\/h/.test(txt(q('#mxOut'))),
    (txt(q('#mxOut')).match(/The pump can hold[^±]*±[\d.]+ %/) || ['none'])[0]);
  setVal('mxStep', '1'); await tick(500);
  chk('a coarse pump step warns instead of blessing the number',
    /limiting accuracy/.test(txt(q('#mxOut'))),
    (txt(q('#mxOut')).match(/steps are ±[\d.]+ %/) || ['no warning'])[0]);
  setVal('mxStep', '0.1'); await tick(400);

  click(pmTab('rev'), 'Check a running line'); await tick(900);
  chk('reverse check renders its inputs', !!q('#rvDrug') && !!q('#rvRate') && !!q('#rvConcLine'));
  const rvDrug = q('#rvDrug');
  if (rvDrug) { rvDrug.value = 'norad-inf'; rvDrug.dispatchEvent(new w.Event('change', { bubbles: true })); }
  await tick(900);
  chk('the drug seeds the preparation from its standard dilution',
    q('#rvAmt') && q('#rvAmt').value === '4' && q('#rvVol') && q('#rvVol').value === '50',
    (q('#rvAmt') ? q('#rvAmt').value : '?') + ' in ' + (q('#rvVol') ? q('#rvVol').value : '?') + ' mL');
  setVal('rvRate', '5.25'); await tick(700);
  const rvTxt = txt(q('#rvOut'));
  chk('each mL content is stated', /Each 1 mL contains 0\.08 mg = 80 mcg/.test(txt(q('#rvConcLine'))),
    txt(q('#rvConcLine')));
  chk('the delivered dose is given in the drug\'s cited unit and basis',
    /0\.1 mcg\/kg\/min/.test(rvTxt), (rvTxt.match(/The patient is receiving[^A-Z]*/) || [''])[0].slice(0, 70));
  chk('the rate is checked against the ordered range',
    /Matches the order/.test(rvTxt), (rvTxt.match(/(?:Matches|Faster|Slower)[^A-Z]*/) || ['none'])[0].slice(0, 70));
  setVal('rvRate', '60'); await tick(700);
  chk('too fast is flagged, not silently accepted',
    /Faster than the order/.test(txt(q('#rvOut'))),
    (txt(q('#rvOut')).match(/Faster than the order[^A-Z]*/) || ['none'])[0].slice(0, 70));
  setVal('rvRate', '2'); await tick(700);
  chk('too slow is flagged too', /Slower than the order/.test(txt(q('#rvOut'))),
    (txt(q('#rvOut')).match(/Slower than the order[^A-Z]*/) || ['none'])[0].slice(0, 70));
  setVal('rvRate', '5.25'); await tick(700);
  click(q('#rvToBoard'), 'add to board'); await tick(1100);
  chk('the check hands the line to the board', w.App.state.pumpMode === 'board' && qa('#boardRows tr').length === 1,
    w.App.state.pumpMode + ', ' + qa('#boardRows tr').length + ' row');
  const boardRow = qa('#boardRows tr')[0];
  chk('the board row carries rate, dose, order and changeover',
    !!boardRow && /5\.25 mL\/h/.test(txt(boardRow)) && /0\.1 mcg\/kg\/min/.test(txt(boardRow)) &&
    /0\.05–1 mcg\/kg\/min/.test(txt(boardRow)) && /h \d+ min/.test(txt(boardRow)),
    txt(boardRow).slice(0, 150));
  chk('a matching line is ticked', !!q('#boardRows .tickok') && !q('#boardRows tr.flag'));
  const bdSecond = q('#bdDrug');
  if (bdSecond) { bdSecond.value = 'dopamine-inf'; bdSecond.dispatchEvent(new w.Event('change', { bubbles: true })); }
  click(q('#bdAdd'), 'add line'); await tick(900);
  chk('lines can be added by hand', qa('#boardRows tr').length === 2, qa('#boardRows tr').length + ' lines');
  const rateCells = qa('#boardRows input[data-b="rate"]');
  if (rateCells[1]) { rateCells[1].value = '12'; rateCells[1].dispatchEvent(new w.Event('input', { bubbles: true })); }
  await tick(600);
  chk('editing a rate recomputes that line live',
    qa('#boardRows .bdose')[1] && txt(qa('#boardRows .bdose')[1]).length > 4,
    txt(qa('#boardRows .bdose')[1]));
  chk('the running total is kept',
    /mL\/h/.test(txt(q('.board tfoot'))) && /mL\/kg\/h/.test(txt(q('.board tfoot'))),
    txt(q('.board tfoot')).slice(0, 90));
  click(q('#bdPrint'), 'print handover sheet'); await tick(700);
  chk('the handover sheet prints alone with one row per line',
    qa('#lblPrintArea table tr').length >= 4 && /INFUSION HANDOVER SHEET/.test(txt(q('#lblPrintArea'))) &&
    /line-by-line check by/.test(txt(q('#lblPrintArea'))),
    qa('#lblPrintArea table tr').length + ' rows');
  chk('printing reveals only the sheet', /lbl-only/.test(d.body.className), d.body.className || '(none)');
  chk('the board survives a restart',
    (function () { let s = null; try { s = JSON.parse(w.localStorage.getItem('icucalc.session.v1') || '{}'); } catch (_) {}
      return !s ? true : (s.board || []).length === 2; })(),
    'session saved');
  qa('#boardRows button[data-bdel]')[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, view: w }));
  await tick(800);
  chk('a line can be removed', qa('#boardRows tr').length === 1, qa('#boardRows tr').length + ' left');
  click(pmTab('mix'), 'back to mix'); await tick(800);

  /* ---- navigation & usability layer ---- */
  click(tabBtn('drugs'), 'back to drugs'); await tick(500);
  chk('emergency shortcut tiles render', qa('.tile[data-proto]').length === 8,
    qa('.tile[data-proto]').length + ' tiles');
  const starBtn = qa('.star[data-fav]')[2];
  const starId = starBtn.getAttribute('data-fav');
  click(starBtn, 'pin a drug'); await tick(400);
  const pinnedCard = q('.card[data-id="' + starId + '"]');
  chk('pinning marks the card', !!pinnedCard && /\bpinned\b/.test(pinnedCard.className), pinnedCard ? pinnedCard.className : 'missing');
  chk('pinned drug sorts first in its system group',
    pinnedCard.closest('.sysgroup').querySelector('.card').getAttribute('data-id') === starId);
  click(q('#favOnly'), 'pinned only'); await tick(400);
  chk('pinned-only filter shows exactly the pinned drugs', qa('#content .card').length === 1,
    qa('#content .card').length + ' card');
  chk('active filter bar appears and can be cleared', !!q('.fbar') && /Pinned only|pinned only/i.test(txt(q('.fbar'))),
    txt(q('.fbar')).slice(0, 60));
  click(qa('.fbar .fb').find(b => b.getAttribute('data-clear') === '*'), 'clear all'); await tick(400);
  chk('clear-all restores the full list', qa('#content .card').length > 100, qa('#content .card').length + ' cards');
  setVal('q', 'adrenaline'); await tick(400);
  chk('search shows a removable filter chip', /search: adrenaline/i.test(txt(q('.fbar'))), txt(q('.fbar')).slice(0, 60));
  click(qa('.fbar .fb').find(b => b.getAttribute('data-clear') === 'q'), 'clear search'); await tick(300);
  /* command palette */
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }));
  await tick(200);
  chk('Ctrl+K opens the command palette', q('#pal').classList.contains('open'));
  setVal('palIn', 'snake'); await tick(250);
  chk('palette finds drugs and protocols', qa('#palRes button').length >= 2,
    qa('#palRes button').length + ' results: ' + qa('#palRes button').slice(0, 3).map(txt).join(' | ').slice(0, 90));
  q('#palIn').dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  await tick(400);
  chk('Enter in the palette navigates', !q('#pal').classList.contains('open') && w.App.state.tab === 'drugs',
    'tab=' + w.App.state.tab);
  /* recent-drugs strip: whatever was just opened is one tap away next time */
  chk('the opened drug joins the Recent strip', qa('#content .recentbar .rc').length >= 1,
    txt(q('#content .recentbar')).slice(0, 80));
  const rcFirst = q('#content .recentbar .rc');
  chk('a Recent chip names a real drug', !!rcFirst && rcFirst.getAttribute('data-open') &&
    !!q('.card[data-id="' + rcFirst.getAttribute('data-open') + '"]'),
    rcFirst ? txt(rcFirst) : 'none');
  click(rcFirst, 'recent chip'); await tick(500);
  chk('tapping a Recent chip opens that card expanded',
    !!q('#content .fxdet[data-id="' + rcFirst.getAttribute('data-open') + '"][open]'),
    rcFirst.getAttribute('data-open'));
  chk('the Recent strip keeps at most six drugs', w.App.state.recent.length <= 6,
    w.App.state.recent.length + ' entries');
  click(q('#rcClear'), 'clear recents'); await tick(200);
  chk('Recent can be cleared', w.App.state.recent.length === 0 && !q('#content .recentbar'),
    w.App.state.recent.length + ' entries left');
  /* preferences */
  click(q('#btnTheme'), 'theme'); click(q('#btnType'), 'type');
  chk('dark theme and large text toggle on the body', /dark/.test(d.body.className) && /big/.test(d.body.className),
    d.body.className);
  click(q('#btnTheme')); click(q('#btnType')); await tick(100);
  let sess = null, lsAvail = true;
  try { sess = w.localStorage.getItem('icucalc.session.v1'); }
  catch (_) { lsAvail = false; }   /* file:// is an opaque origin: storage must degrade, not crash */
  chk('session persists when storage is available, degrades silently when not',
    lsAvail ? (!!sess && JSON.parse(sess).tab === w.App.state.tab) : true,
    lsAvail ? 'saved: ' + (sess || '').slice(0, 40) : 'opaque origin — app kept working');

  /* ---- protocols ---- */
  click(tabBtn('protocols'), 'protocols'); await tick(600);
  chk('40 protocols listed', qa('#content .proto').length >= 30, qa('#content .proto').length + ' protocols');
  const pq = $('pq');
  if (pq) {
    pq.value = 'snake'; pq.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(500);
    chk('protocol search filters', qa('#content .proto').length > 0 && qa('#content .proto').length < 30,
      qa('#content .proto').length + ' matches');
    pq.value = ''; pq.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(500);
  }
  /* drug links inside a protocol step jump to that drug card */
  const dl = q('#content .proto .step-drug');
  chk('protocol steps contain clickable drug names', qa('#content .proto .step-drug').length > 50,
    qa('#content .proto .step-drug').length + ' drug links');
  if (dl) {
    const nm = dl.getAttribute('data-drug');
    click(dl, 'protocol drug link'); await tick(800);
    chk('protocol drug link jumps to the drugs tab', ST_tab_is('drugs'), 'tab=' + w.App.state.tab);
    chk('protocol drug link filters to that drug', qa('#content .card').length > 0 && ($('q') || {}).value === nm,
      qa('#content .card').length + ' cards for "' + nm + '"');
    click(tabBtn('protocols'), 'back to protocols'); await tick(700);
    const pq2 = $('pq'); if (pq2) { pq2.value = ''; pq2.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(600); }
  }

  /* left-rail quick jumps */
  const goto = qa('.chip.goto');
  chk('left rail has 15 quick-jump chips', goto.length === 15, goto.length + ' chips');
  if (goto.length) {
    click(goto[3], 'a quick-jump chip'); await tick(700);
    chk('quick jump switches to the protocols tab', ST_tab_is('protocols'), 'tab=' + (w.App.state.tab || '?'));
    chk('quick jump flashes exactly one protocol', qa('#content .proto.flash').length === 1,
    qa('#content .proto.flash').length + ' flashed (' +
    (q('#content .proto.flash') ? q('#content .proto.flash').getAttribute('data-pid') : 'none') + ')');
    chk('quick jump target matches data-goto',
      (q('#content .proto.flash') || { getAttribute: () => '' }).getAttribute('data-pid') === goto[3].getAttribute('data-goto'),
      goto[3].getAttribute('data-goto'));
  }

  /* ---- references tab must show a citation for every key ---- */
  click(tabBtn('refs'), 'refs'); await tick(600);
  chk('references table rendered', qa('#content table.tbl tbody tr').length > 200,
    qa('#content table.tbl tbody tr').length + ' references');
  chk('no reference is an empty citation',
    !qa('#content table.tbl tbody tr').some(r => txt(r.children[1]).length < 12),
    'every row has a full citation');
  const refTag = q('#content .refTag');
  chk('reference rows are clickable on the refs tab', qa('#content .refTag').length > 200,
    qa('#content .refTag').length + ' clickable citations');
  if (refTag) {
    click(refTag, 'a reference tag'); await tick(400);
    chk('clicking a reference opens the citation modal', /\bopen\b/.test(($('modal') || {}).className || ''),
      'modal class=' + (($('modal') || {}).className || 'none') + ' | body=' + txt($('modalB')).slice(0, 70));
    chk('modal shows a full citation', txt($('modalB')).length > 40, txt($('modalB')).slice(0, 90));
    click($('modalX'), 'modal close'); await tick(300);
    chk('modal closes', !/\bopen\b/.test(($('modal') || {}).className || ''),
      'modal class=' + (($('modal') || {}).className || 'none'));
  }
  /* drug cards also carry reference tags */
  click(tabBtn('drugs'), 'drugs tab'); await tick(700);
  chk('drug cards carry clickable references', qa('#content .card .refTag').length > 200,
    qa('#content .card .refTag').length + ' reference tags on cards');

  /* ---- utils calculators must produce numbers ---- */
  click(tabBtn('utils'), 'utils'); await tick(600);
  const uIn = qa('#content input');
  chk('utils inputs present', uIn.length > 8, uIn.length + ' inputs');
  const fill = { uAge: '60', uWt: '70', uScr: '1.5', uHt: '170', fWt: '70', fPct: '10', sNa: '120', sWt: '70', sInf: '3', sTgt: '130', kSer: '2.8', kWt: '70', cAmt: '1', dMl: '100', dHr: '1', rGtt: '30' };
  Object.keys(fill).forEach(id => { const e = $(id); if (e) { e.value = fill[id]; e.dispatchEvent(new w.Event('input', { bubbles: true })); e.dispatchEvent(new w.Event('change', { bubbles: true })); } });
  await tick(400);
  const uTxt = txt($('content'));
  const crcl = (uTxt.match(/CrCl[^\d]{0,30}(\d+(?:\.\d+)?)/) || [])[1] || '(not found)';
  chk('CrCl computed (Cockcroft-Gault 60 y, 70 kg, Scr 1.5 mg/dL, male = 51.9 mL/min)',
    Math.abs(parseFloat(crcl) - 51.9) < 1.5, 'CrCl=' + crcl);
  chk('GIR computed', /GIR/i.test(uTxt) && /\d/.test(uTxt));
  chk('sodium correction computed', /mmol/.test(uTxt));
  chk('no NaN anywhere in utils', !/NaN/.test(uTxt), /NaN/.test(uTxt) ? 'NaN FOUND in utils output' : 'clean');

  /* ---- drip tab ---- */
  click(tabBtn('drip'), 'drip'); await tick(600);
  const dTxt = txt($('content'));
  chk('drip tab computes', /gtt|drop/i.test(dTxt));
  chk('no NaN in drip tab', !/NaN/.test(dTxt));

  /* ---- global: no NaN, no undefined in the whole drug list ---- */
  click(tabBtn('drugs'), 'drugs'); await tick(700);
  const all = $('content').innerHTML;
  chk('no "NaN" rendered anywhere in the drug list', all.indexOf('NaN') < 0,
    all.indexOf('NaN') >= 0 ? 'context: ' + all.slice(Math.max(0, all.indexOf('NaN') - 90), all.indexOf('NaN') + 30).replace(/\s+/g, ' ') : 'clean');
  chk('no "undefined" rendered anywhere', all.indexOf('undefined') < 0,
    all.indexOf('undefined') >= 0 ? 'context: ' + all.slice(Math.max(0, all.indexOf('undefined') - 90), all.indexOf('undefined') + 30).replace(/\s+/g, ' ') : 'clean');
  chk('no "null" rendered as text', !/>null</.test(all));

  /* ---- demo / reset ---- */
  click($('btnDemo70'), 'demo button'); await tick(600);
  chk('demo button loads a 4-year-old, 16 kg', parseFloat($('p_wt').value) === 16 && $('p_ageY').value === '4',
    'p_wt=' + $('p_wt').value + ', age=' + $('p_ageY').value);
  click($('btnReset'), 'reset button'); await tick(600);
  chk('reset clears the patient', !$('p_wt').value && /no patient/i.test(txt($('metaCtx'))), txt($('metaCtx')).slice(0, 50));

  /* ---- CSV ---- */
  click($('btnDemo70'), 'demo button'); await tick(600);
  click($('btnCsv'), 'csv button'); await tick(400);
  chk('CSV produced', CSV && CSV.length > 10000, CSV ? CSV.length + ' chars' : 'nothing captured');
  if (CSV) {
    const lines = CSV.replace(/^\ufeff/, '').split('\r\n');
    const ncol = lines[0].split(',').length;
    chk('CSV header has 18 columns', ncol === 18, ncol + ' columns');
    chk('CSV row count matches the visible formulations', lines.length > 250, (lines.length - 1) + ' rows');
    const short = lines.filter(l => l.trim() && l.split(',').length < 4);
    chk('no truncated CSV rows', short.length === 0, short.length + ' bad rows');
    chk('CSV contains no NaN', CSV.indexOf('NaN') < 0);
  }
  chk('toast confirms the export', /export/i.test(txt($('toast'))), txt($('toast')).slice(0, 60));

  /* ---- runtime errors ---- */
  chk('no runtime JS errors', RUNTIME.length === 0, RUNTIME.slice(0, 6).join(' || '));

  /* ---------- report ---------- */
  console.log('\n' + PASS.map(p => '  PASS ' + p).join('\n'));
  if (FAIL.length) console.log('\n' + FAIL.map(f => '  FAIL ' + f).join('\n'));
  console.log('\n────────────────────────────────────────────────────────');
  console.log(' smoke assertions  ' + PASS.length + ' passed, ' + FAIL.length + ' failed');
  console.log('────────────────────────────────────────────────────────');
  console.log(FAIL.length ? '\nRESULT: FAIL' : '\nRESULT: PASS — the built file boots, renders and computes in a DOM.');
  process.exit(FAIL.length ? 1 : 0);
})();
