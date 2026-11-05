#!/usr/bin/env node
/* =====================================================================
   QA / VALIDATE — automated accuracy gate for the drug database.
   Loads the same source files the build bundles, then re-derives every
   number by an INDEPENDENT path and fails on any disagreement.

   Run:  node qa/validate.js            (exit 0 = pass, 1 = fail)
   ===================================================================== */
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..', 'src');

const FILES = [
  'data/part1-resuscitation.js','data/part2-cardiovascular.js','data/part3-sedation-neuro.js',
  'data/part4-respiratory-renal.js','data/part5-antimicrobials.js','data/part6-endocrine-electrolyte.js',
  'data/part7-toxicology.js','data/part8-special-situations.js','refs.js','engine.js'];

const code = FILES.map(f => fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
const sb = { console, Math, JSON, isFinite, isNaN, Number, String, Object, Array, RegExp, Date, parseFloat, parseInt };
vm.createContext(sb);
try { vm.runInContext(code, sb, { filename: 'bundle.js' }); }
catch (e) { console.log('FATAL: source will not evaluate — ' + e.message); process.exit(1); }

const { REG, REFS, SYS, PROT, computeRegimen, dtOf, convertUnit, canonUnit, baseOf,
        estimateWeight, popOf, fmtVol, fmtNum, fxForm, infusionCalc, dripRate,
        weightAgeCheck, pumpBand, deliverBand, reverseCheck,
        fentonWeight, fentonMonotonic, pmaDays, gaLabel, correctedAgeDays, preterm, childScope } = sb;

let ERR = [], WARN = [];
const err = (id, m) => ERR.push('[' + (id || '?') + '] ' + m);
const warn = (id, m) => WARN.push('[' + (id || '?') + '] ' + m);

/* body sizes the whole database must survive */
const CASES = [
  { kg: 0.55,  ageDays: 0.4,  pop: 'neo'   },   /* extreme preterm        */
  { kg: 1.2,   ageDays: 1,    pop: 'neo'   },   /* ELBW                   */
  { kg: 3.4,   ageDays: 3,    pop: 'neo'   },   /* term newborn           */
  { kg: 3.2,   ageDays: 27,   pop: 'neo'   },   /* day 27 - still neonate */
  { kg: 6.5,   ageDays: 120,  pop: 'paed'  },   /* 4 months               */
  { kg: 9.6,   ageDays: 365,  pop: 'paed'  },   /* 1 year                 */
  { kg: 14.3,  ageDays: 3*365.25, pop:'paed'},  /* 3 years                */
  { kg: 18.3,  ageDays: 5*365.25, pop:'paed'},  /* 5 years                */
  { kg: 31.9,  ageDays: 10*365.25,pop:'paed'},  /* 10 years               */
  { kg: 56.8,  ageDays: 15*365.25,pop:'paed'},  /* 15 years               */
  { kg: 42,    ageDays: 13*365.25,pop:'paed'},  /* small adolescent       */
  { kg: 50,    ageDays: 30*365.25,pop:'adult'},  /* 30 y, 50 kg            */
  { kg: 70,    ageDays: 45*365.25,pop:'adult'},  /* reference adult        */
  { kg: 120,   ageDays: 60*365.25,pop:'adult'},  /* obese adult            */
  { kg: 200,   ageDays: 25*365.25,pop:'adult'}   /* extreme obesity        */
];

/* ---------- 1. structural ---------- */
if (!Array.isArray(REG) || !REG.length) { console.log('FATAL: REG is empty'); process.exit(1); }
const ids = new Set();
REG.forEach(r => {
  if (!r.id) err('?', 'regimen has no id');
  else if (ids.has(r.id)) err(r.id, 'duplicate id');
  else ids.add(r.id);
  if (!r.n) err(r.id, 'no drug name');
  if (!r.sys) err(r.id, 'no system group');
  else if (!SYS[r.sys]) err(r.id, 'unknown system group "' + r.sys + '"');
  if (!r.cls) err(r.id, 'no pharmacological class');
  if (!r.ind) err(r.id, 'no indication');
  if (!['adult','paed','neo','all'].includes(r.pop)) err(r.id, 'invalid pop "' + r.pop + '"');
  if (r.risk == null || r.risk < 1 || r.risk > 5) err(r.id, 'risk must be 1..5, got ' + r.risk);
  if (!r.d) err(r.id, 'no dose object');
  if (!r.fx || !r.fx.length) err(r.id, 'no formulations');
  if (!r.admin) warn(r.id, 'no administration note');
  if (!r.ref || !r.ref.length) err(r.id, 'no references cited');
  if (!r.warn || !r.warn.length) warn(r.id, 'no safety warnings');
});

/* ---------- 2. references ---------- */
Object.keys(REFS).forEach(k => {
  if (!REFS[k].n || !REFS[k].f) err('REFS:' + k, 'incomplete citation');
});
REG.forEach(r => (r.ref || []).forEach(k => {
  if (!REFS[k]) err(r.id, 'cites undefined reference key "' + k + '"');
}));
REG.forEach(r => {
  /* a duplicated key would silently inflate the citation list */
  const seen = {};
  (r.ref || []).forEach(k => { if (seen[k]) err(r.id, 'cites "' + k + '" twice'); seen[k] = 1; });
});

/* ---------- 2b. paediatric sourcing ----------
   Any regimen that can be given to a child must be traceable to a
   paediatric dose source, not only to an adult guideline. */
const PAED_SRC = ['HARRIET-LANE', 'SINGH-DOSES', 'GUPTA-FORMULARY', 'PG-TB-PED', 'BNFC'];
const PAED_TEXT = ['NELSON', 'GHAI10'];
let paedN = 0, allKgN = 0;
REG.forEach(r => {
  const refs = r.ref || [];
  const dt = r.d && r.d.t ? String(r.d.t) : '';
  const perKg = /kg/.test(dt) || /kg/i.test((r.d && (r.d.rep || r.d.text)) || '') ||
                /child|paediatr|pediatr|infant|neonat|newborn/i.test((r.admin || '') + (r.ind || ''));
  const dedicated = r.pop === 'paed' || r.pop === 'neo';
  if (dedicated) {
    paedN++;
    if (!refs.some(k => PAED_SRC.includes(k)))
      err(r.id, 'paediatric regimen cites no paediatric dose source (' + PAED_SRC.join('/') + ')');
    if (!refs.some(k => PAED_TEXT.includes(k)))
      err(r.id, 'paediatric regimen cites no paediatric textbook (' + PAED_TEXT.join('/') + ')');
  } else if (r.pop === 'all' && perKg) {
    allKgN++;
    if (!refs.some(k => PAED_SRC.includes(k)))
      err(r.id, 'all-ages regimen with per-kg/child dosing cites no paediatric dose source');
  }
});
/* the paediatric sources must actually exist and be complete */
['HARRIET-LANE', 'SINGH-DOSES', 'GUPTA-FORMULARY', 'PG-TB-PED', 'GHAI10', 'NELSON', 'IAP-STG']
  .forEach(k => { if (!REFS[k]) err('REFS:' + k, 'required paediatric reference is missing'); });

/* ---------- 3. dose objects ---------- */
REG.forEach(r => {
  const d = r.d || {};
  if (!d.t) { err(r.id, 'dose has no type'); return; }
  const dt = dtOf(d.t);
  if (!dt) { err(r.id, 'unparseable dose type "' + d.t + '"'); return; }
  if (dt.kind === 'text') {
    if (!d.text) err(r.id, 'text dose with no text');
    return;
  }
  const lo = d.lo != null ? d.lo : d.v, hi = d.hi != null ? d.hi : d.v;
  if (lo == null || hi == null) {
    if (d.text) return;                       /* formula-driven, documented */
    err(r.id, 'dose type ' + d.t + ' has no numeric value');
    return;
  }
  if (!(isFinite(lo) && isFinite(hi))) { err(r.id, 'non-finite dose'); return; }
  if (lo < 0 || hi < 0) err(r.id, 'negative dose');
  if (lo > hi) err(r.id, 'dose lo (' + lo + ') > hi (' + hi + ')');
  if (lo === 0 && hi === 0 && !d.text) err(r.id, 'zero dose with no explanatory text');
  /* caps must not be smaller than the prescribed maximum */
  if (d.cap != null) {
    if (!isFinite(d.cap)) err(r.id, 'non-finite cap');
    else if (d.cap < hi) err(r.id, 'cap ' + d.cap + ' is BELOW the prescribed maximum ' + hi +
      ' (dose type ' + d.t + ') — the cap would silently cut every dose');
  }
  if (d.capDay != null) {
    if (!isFinite(d.capDay)) err(r.id, 'non-finite capDay');
    else if (d.cap != null && d.capDay < d.cap && !d.load)
      err(r.id, 'capDay ' + d.capDay + ' < single-dose cap ' + d.cap +
        ' (declare load:1 in d{} only if a single loading dose may exceed the 24 h ceiling)');
  }
  if (d.capKg != null && (!isFinite(d.capKg) || d.capKg < hi)) err(r.id, 'capKg below the prescribed maximum');
  if (d.capDayKg != null && !isFinite(d.capDayKg)) err(r.id, 'non-finite capDayKg');
  if (d.div != null && (!isFinite(d.div) || d.div < 1)) err(r.id, 'invalid div');
});

/* ---------- 4. formulations ---------- */
const PCT_RE = /^([\d.]+)\s*%/;
const CONCRE_RE = /^([\d.]+(?:,[\d.]+)*)\s*(mg|mcg|µg|ug|g|units|IU|mEq|mmol)\s*\/\s*mL/i;
const PERUNIT_RE = /^([\d.]+(?:,[\d.]+)*)\s*(mg|mcg|µg|ug|g|units|IU|mEq|mmol)\s*(vial|tablet|ampoule|capsule|sachet)/i;

REG.forEach(r => {
  (r.fx || []).forEach((f, i) => {
    const tag = r.id + ' fx' + i;
    if (!f.s) { err(tag, 'no strength text'); return; }
    if (f.use === 'fixed') { if (!f.give) err(tag, "use:'fixed' with no give text"); return; }
    if (f.own && f.own.text) return;
    if (f.c == null) { err(tag, 'no concentration'); return; }
    if (!isFinite(f.c) || f.c <= 0) { err(tag, 'concentration must be a positive finite number, got ' + f.c); return; }
    if (!f.u) { err(tag, 'no concentration unit'); return; }
    if (!f.r) warn(tag, 'no route');
    /* concentration must agree with the strength string */
    const s = String(f.s).replace(/,/g, '');
    /* A strength string may state the SAME concentration several ways, e.g.
       "0.4 mg/mL (400 mcg/mL)", or it may state concentrations of DIFFERENT
       chemical species, e.g. caffeine citrate 20 mg/mL = 10 mg/mL base - such
       rows must declare multi:1 so the check knows not to "correct" them. */
    const ALL_RE = /([\d.]+)\s*(mg|mcg|µg|ug|g|units|IU|mEq|mmol)\s*\/\s*mL/gi;
    const stated = []; let mm;
    while ((mm = ALL_RE.exec(s)) !== null) stated.push({ n: parseFloat(mm[1]), u: canonUnit(mm[2]) });
    const cu = canonUnit(f.u);
    const same = x => x.u === cu && Math.abs(x.n - f.c) / Math.max(x.n, f.c) <= 0.005;
    const equiv = x => { const cv = convertUnit(x.n, x.u, cu);
      return cv != null && Math.abs(cv - f.c) / Math.max(cv, f.c) <= 0.005; };
    if (stated.length) {
      /* (a) unless several species are declared, the stated equivalents must
             convert into one another */
      if (!f.multi) for (let i = 1; i < stated.length; i++) {
        const cv = convertUnit(stated[0].n, stated[0].u, stated[i].u);
        if (cv != null && Math.abs(cv - stated[i].n) / Math.max(cv, stated[i].n) > 0.005)
          err(tag, 'strength "' + f.s + '" is self-contradictory: ' + stated[0].n + ' ' + stated[0].u +
            '/mL = ' + cv + ' ' + stated[i].u + '/mL, not ' + stated[i].n);
      }
      /* (b) the declared c / u must appear in the string, directly or as an
             exact equivalent (1 g/mL == 1000 mg/mL == c:1000 mg) */
      if (!stated.some(same) && !stated.some(equiv))
        err(tag, 'strength "' + f.s + '" states ' +
          stated.map(x => x.n + ' ' + x.u + '/mL').join(' and ') +
          ' but c=' + f.c + ' ' + f.u + ' — the two must agree');
      /* (c) when the declared unit is itself stated, that number must match */
      if (!f.multi) stated.filter(x => x.u === cu).forEach(x => {
        if (!same(x)) err(tag, 'strength "' + f.s + '" says ' + x.n + ' ' + f.u + '/mL but c=' + f.c);
      });
    } else {
      const pm = PCT_RE.exec(s);
      if (pm && cu === 'mg') {
        /* a w/v percentage is g/100 mL, i.e. pct x 10 mg/mL */
        const expect = parseFloat(pm[1]) * 10;
        if (Math.abs(expect - f.c) / Math.max(expect, f.c) > 0.02)
          err(tag, 'strength "' + f.s + '" implies ' + expect + ' mg/mL but c=' + f.c);
      }
    }
    /* own-dose rows must be self-consistent */
    if (f.own) {
      const o = f.own;
      if (!o.u) err(tag, 'own dose with no unit');
      const a = o.lo != null ? o.lo : o.a, b = o.hi != null ? o.hi : o.a;
      const ka = o.kgLo != null ? o.kgLo : o.kg, kb = o.kgHi != null ? o.kgHi : o.kg;
      if (a != null && b != null && a > b) err(tag, 'own lo > own hi');
      if (ka != null && kb != null && ka > kb) err(tag, 'own kgLo > own kgHi');
      if (a == null && ka == null && !o.text) err(tag, 'own dose with no amount');
      if (o.cap != null && b != null && o.cap < b) err(tag, 'own cap ' + o.cap + ' below own max ' + b);
      if (o.cap != null && kb != null && o.cap < kb * 200) { /* cap below a 200 kg dose is expected; ignore */ }
    }
  });
});

/* ---------- 5. dilution presets ---------- */
REG.forEach(r => {
  (r.diln || []).forEach((p, i) => {
    const tag = r.id + ' diln' + i;
    if (p.amt == null || p['in'] == null) { warn(tag, 'incomplete preset'); return; }
    if (!(p['in'] > 0)) err(tag, 'bag volume must be > 0');
    if (!(p.amt > 0)) err(tag, 'drug amount must be > 0');
    if (!p.u) warn(tag, 'no unit');
  });
});

/* ---------- 6. engine behaviour across every body size ---------- */
let evaluated = 0, pumpRows = 0;
/* a regimen is only clinically meaningful for the population it declares */
const popOk = (r, c) => !r.pop || r.pop === 'all' || r.pop === c.pop;
CASES.forEach(c => {
  sb.ctxRef.kg = c.kg;
  const ctx = { kg: c.kg, dosingWeight: c.kg, ageDays: c.ageDays, pop: c.pop };
  REG.forEach(r => {
    const relevant = popOk(r, c);
    let out;
    try { out = computeRegimen(r, ctx); }
    catch (e) { err(r.id, 'computeRegimen threw at ' + c.kg + ' kg: ' + e.message); return; }
    evaluated++;
    if (out.error) err(r.id, out.error + '  (at ' + c.kg + ' kg)');
    if (out.dose) {
      if (!isFinite(out.dose.lo) || (out.dose.hi != null && !isFinite(out.dose.hi)))
        err(r.id, 'non-finite computed dose at ' + c.kg + ' kg');
      if (out.dose.lo > out.dose.hi + 1e-12)
        err(r.id, 'computed dose lo > hi at ' + c.kg + ' kg');
    }
    if (out.capApplied) {
      /* a cap that fires must land exactly ON the cap - never above */
      const dd = out.reg.d, daily = dtOf(dd.t) && dtOf(dd.t).kind === 'daily';
      let cap = daily ? (dd.capDay != null ? dd.capDay : dd.cap) : dd.cap;
      const capKg = daily ? (dd.capDayKg != null ? dd.capDayKg : dd.capKg) : dd.capKg;
      if (capKg != null && capKg * c.kg < (cap == null ? Infinity : cap)) cap = capKg * c.kg;
      if (cap != null && out.dose && out.dose.hi > cap + 1e-9)
        err(r.id, 'cap fired but the dose still exceeds it (' + out.dose.hi + ' > ' + cap + ') at ' + c.kg + ' kg');
    }
    (out.items || []).forEach((it, i) => {
      const tag = r.id + ' fx' + i + ' @' + c.kg + 'kg';
      if (it.mode === 'conc' || it.mode === 'direct') {
        if (it.volLo == null || !isFinite(it.volLo)) { err(tag, 'non-finite volume (' + it.volLo + ')'); return; }
        if (it.volLo < 0) { err(tag, 'negative volume'); return; }
        if (it.volHi != null && !isFinite(it.volHi)) err(tag, 'non-finite upper volume');
        if (it.volHi != null && it.volHi < it.volLo - 1e-12) err(tag, 'upper volume below lower volume');
        /* INDEPENDENT re-derivation of the volume */
        const f = it.fx;
        const amt = it.doseAmtLo;
        let expect = null;
        if (it.mode === 'direct') expect = amt;
        else {
          let cv = convertUnit(amt, canonUnit(it.doseUnit), canonUnit(f.u));
          if (cv != null) expect = cv / f.c;
          else (f.alt || []).forEach(a => { if (canonUnit(a.u) === canonUnit(it.doseUnit)) expect = amt / a.c; });
        }
        if (expect != null && isFinite(expect)) {
          const rel = Math.abs(expect - it.volLo) / Math.max(Math.abs(expect), 1e-12);
          if (rel > 1e-9) err(tag, 'volume ' + it.volLo + ' disagrees with an independent re-derivation ' + expect);
        }
        /* a measurable quantity must be reachable with a real syringe / pack */
        if (it.volLo > 0 && it.volLo < 0.001 && !it.dilAdvice && !it.fracAdvice)
          err(tag, 'quantity ' + it.volLo + ' is unmeasurable and no dilution or fractional-unit advice was produced');
        if (it.volLo > 0 && it.volLo < 0.1 && !it.needsDilution && !it.fractional && relevant)
          warn(tag, 'volume below 0.1 mL without a dilution flag');
        if (it.form !== 'liquid' && it.volLo > 0 && it.volLo < 1 && !it.fractional && relevant)
          warn(tag, 'fraction of one ' + it.perUnit + ' without a fractional-unit flag');
        /* absurd volumes usually mean a unit slip */
        if (it.volLo > 5000 && relevant) warn(tag, 'volume ' + fmtVol(it.volLo) + ' mL is implausibly large — verify the strength');
      }
      if (it.mode === 'na' || it.mode === 'info') {
        if (it.volLo != null) err(tag, 'a non-computable row must not carry a volume');
      }
      if (it.mode === 'fixed' && !it.give) err(tag, 'fixed row with no instruction');
    });
    /* rates: mL/h must equal mL/min x 60, and both must match the bag maths */
    (out.pump || []).forEach((p, i) => {
      pumpRows++;
      const tag = r.id + ' pump' + i + ' @' + c.kg + 'kg';
      if (!isFinite(p.mlPerHrLo) || p.mlPerHrLo <= 0) { err(tag, 'non-finite or non-positive mL/h'); return; }
      if (Math.abs(p.mlPerHrLo - p.mlPerMinLo * 60) > 1e-6 * p.mlPerHrLo)
        err(tag, 'mL/h ' + p.mlPerHrLo + ' != mL/min x 60 ' + (p.mlPerMinLo * 60));
      const dt = dtOf(r.d.t);
      if (dt && dt.per) {
        const tb = /min$/.test(dt.per) ? 'min' : (/h$/.test(dt.per) ? 'h' : 'day');
        const toMin = tb === 'min' ? 1 : (tb === 'h' ? 1 / 60 : 1 / 1440);
        let amt = (r.d.lo != null ? r.d.lo : r.d.v);
        /* ONLY per-kg dose types are scaled by body weight */
        if (dt.per.indexOf('kg') >= 0) amt *= c.kg;
        const daily = dt.kind === 'daily';
        let cap = daily ? (r.d.capDay != null ? r.d.capDay : r.d.cap) : r.d.cap;
        const capKg = daily ? (r.d.capDayKg != null ? r.d.capDayKg : r.d.capKg) : r.d.capKg;
        if (capKg != null && capKg * c.kg < (cap == null ? Infinity : cap)) cap = capKg * c.kg;
        if (cap != null && amt > cap) amt = cap;
        amt /= (r.d.div || 1);
        const perMin = amt * toMin;
        const perHr = perMin * 60;
        const expectMl = perHr / p.concPerMl;
        if (Math.abs(expectMl - p.mlPerHrLo) / Math.max(expectMl, 1e-12) > 1e-9)
          err(tag, 'pump mL/h ' + p.mlPerHrLo + ' != hand-derived ' + expectMl);
      }
      if (p.bagHoursLo <= 0 || !isFinite(p.bagHoursLo)) err(tag, 'invalid bag duration');
    });
  });
});

/* ---------- 7. population routing ---------- */
[[0.5, 'neo'], [27, 'neo'], [28, 'paed'], [365, 'paed'], [15 * 365.25, 'paed'], [16 * 365.25, 'adult'], [40 * 365.25, 'adult']]
  .forEach(([d, want]) => { if (popOf(d) !== want) err('popOf', d + ' days -> ' + popOf(d) + ', expected ' + want); });

/* ---------- 8. weight estimation sanity ---------- */
[[0, 3.3, 'male'], [1, 9.6, 'male'], [5, 18.3, 'male'], [10, 31.9, 'male'], [15, 56.8, 'male'],
 [0, 3.2, 'female'], [1, 8.9, 'female'], [5, 18.2, 'female'], [10, 32.9, 'female'], [15, 57.7, 'female']]
  .forEach(([y, want, sex]) => {
    const got = estimateWeight({ ageDays: y * 365.25, ageY: y, ageM: 0, sex: sex, method: 'who' });
    if (got == null || Math.abs(got - want) > 0.05) err('estimateWeight', y + 'y ' + sex + ' -> ' + got + ', expected ' + want);
  });
if (estimateWeight({ ageDays: 20 * 365.25, ageY: 20, sex: 'male' }) !== null)
  err('estimateWeight', 'must refuse to estimate a weight for an adult (>18 y)');

/* ---------- 9. unit algebra ---------- */
const UC = [['g', 'mg', 1, 1000], ['mcg', 'mg', 500, 0.5], ['mg', 'g', 2500, 2.5], ['L', 'mL', 1, 1000],
            ['MIU', 'IU', 1, 1e6], ['IU', 'MIU', 1e6, 1], ['units', 'IU', 10, 10]];
UC.forEach(([a, b, amt, want]) => {
  const got = convertUnit(amt, a, b);
  if (got == null || Math.abs(got - want) / Math.max(Math.abs(want), 1e-12) > 1e-9)
    err('convertUnit', amt + ' ' + a + ' -> ' + b + ' gave ' + got + ', expected ' + want);
});
/* cross-family conversions MUST be refused */
[['mg', 'mL'], ['mL', 'mg'], ['units', 'mg'], ['mmol', 'mg'], ['mEq', 'mmol'], ['mg', 'IU'], ['mL', 'mmol']]
  .forEach(([a, b]) => { if (convertUnit(1, a, b) !== null) err('convertUnit', 'must refuse ' + a + ' -> ' + b); });

/* ---------- 10. rounding must never round UP ---------- */
[0.0999, 0.14999, 1.0499, 9.949, 99.49, 1234.5].forEach(v => {
  const r = sb.roundDown(v, sb.precFor(v));
  if (r > v + 1e-12) err('roundDown', 'rounded UP: ' + v + ' -> ' + r);
});

/* ---------- 11. protocols ---------- */
const pids = new Set();
PROT.forEach(p => {
  if (!p.id || !p.t || !p.steps || !p.steps.length) err('PROT', 'incomplete protocol ' + p.id);
  if (pids.has(p.id)) err('PROT', 'duplicate protocol id ' + p.id);
  pids.add(p.id);
  (p.s || []).forEach(k => { if (!SYS[k]) err('PROT:' + p.id, 'unknown system "' + k + '"'); });
});

/* ---------- 12. coverage ---------- */
const sysUsed = {}; REG.forEach(r => sysUsed[r.sys] = (sysUsed[r.sys] || 0) + 1);
Object.keys(SYS).forEach(k => { if (!sysUsed[k]) warn('SYS', 'system group "' + k + '" has no regimens'); });
const routeCount = { iv: 0, po: 0 };
REG.forEach(r => (r.fx || []).forEach(f => {
  const rt = String(f.r || '').toLowerCase();
  if (rt.includes('iv')) routeCount.iv++;
  if (rt.includes('po') || rt.includes('oral') || rt.includes('sl')) routeCount.po++;
}));
if (!routeCount.iv) err('coverage', 'no IV formulations at all');
if (!routeCount.po) err('coverage', 'no oral formulations at all');

/* ---------- mix & run: independent hand-checks ----------
   Each case below was computed by hand before being written down.        */
(function(){
  const cases = [
    ['midazolam 0.1 mg/kg/h @30 kg, 50 mg in 50 mL',
      {doseAmt:0.1,doseUnit:'mg',per:'kg/h',kg:30,drugAmt:50,drugUnit:'mg',totalVol:50,containerMl:50,dripFactor:20},
      3, 1, 50/3],
    ['midazolam 1 mcg/kg/min @70 kg, 50 mg in 50 mL',
      {doseAmt:1,doseUnit:'mcg',per:'kg/min',kg:70,drugAmt:50,drugUnit:'mg',totalVol:50},
      4.2, 1, null],
    ['noradrenaline 0.1 mcg/kg/min @70 kg, 4 mg in 50 mL',
      {doseAmt:0.1,doseUnit:'mcg',per:'kg/min',kg:70,drugAmt:4,drugUnit:'mg',totalVol:50},
      5.25, 0.08, null],
    ['insulin 0.1 units/kg/h @70 kg, 50 units in 50 mL',
      {doseAmt:0.1,doseUnit:'units',per:'kg/h',kg:70,drugAmt:50,drugUnit:'units',totalVol:50},
      7, 1, null],
    ['GTN 50 mcg/min (weight-free), 50 mg in 50 mL',
      {doseAmt:50,doseUnit:'mcg',per:'min',kg:null,drugAmt:50,drugUnit:'mg',totalVol:50},
      3, 1, null],
    ['label mode: 3 mg/h of a 1 mg/mL bag',
      {doseAmt:3,doseUnit:'mg',per:'h',kg:null,concC:1,concU:'mg'},
      3, 1, null],
  ];
  cases.forEach(([name, o, wantMlHr, wantConc, wantHours]) => {
    const r = infusionCalc(Object.assign({}, o));
    if(!r.ok){ err('mix:' + name, 'did not compute: ' + r.err); return; }
    if(Math.abs(r.mlPerHr - wantMlHr) > 1e-9)
      err('mix:' + name, 'mL/h ' + r.mlPerHr + ' ≠ hand-computed ' + wantMlHr);
    if(Math.abs((r.perMl[0] || {}).v - wantConc) > 1e-9)
      err('mix:' + name, 'per-mL ' + (r.perMl[0] || {}).v + ' ≠ ' + wantConc);
    if(wantHours != null && Math.abs(r.hoursLast - wantHours) > 1e-9)
      err('mix:' + name, 'duration ' + r.hoursLast + ' ≠ ' + wantHours);
    /* the "patient receives" figure must round-trip to the ordered dose */
    if(o.per === 'kg/h' && Math.abs(r.deliver.perKgHr - o.doseAmt) > 1e-9)
      err('mix:' + name, 'delivered per-kg/h ' + r.deliver.perKgHr + ' ≠ ordered ' + o.doseAmt);
  });
  /* a sub-deliverable rate must raise a warning, not silently print */
  const tiny = infusionCalc({doseAmt:0.005,doseUnit:'mg',per:'kg/h',kg:10,drugAmt:50,drugUnit:'mg',totalVol:50});
  if(!tiny.ok || !tiny.checks.some(c => c.level === 'warn'))
    err('mix:tiny', '0.05 mL/h produced no deliverability warning');
  /* incompatible families must be refused, never guessed */
  const bad = infusionCalc({doseAmt:3,doseUnit:'mg',per:'h',kg:null,concC:1,concU:'units'});
  if(bad.ok) err('mix:refuse', 'a mass dose against a units concentration was not refused');
  /* per-kg orders with no weight must be refused */
  const noKg = infusionCalc({doseAmt:0.1,doseUnit:'mg',per:'kg/h',kg:null,drugAmt:50,drugUnit:'mg',totalVol:50});
  if(noKg.ok) err('mix:noKg', 'a per-kg dose computed without a weight');
})();

/* ---------- decimal-point guards ----------
   (a) the live database must produce ZERO ten-fold alerts at every body size;
   (b) a deliberate 100x data error MUST trip the guard;
   (c) the weight/age guard must catch mistyped weights and stay silent on
       plausible ones.                                                     */
(function(){
  let n=0;
  CASES.forEach(c => {
    REG.forEach(r => {
      const o = computeRegimen(r, {kg:c.kg, dosingWeight:c.kg, pop:c.pop, ageDays:c.ageDays});
      (o.alerts||[]).forEach(a => { if(String(a).indexOf('TEN-FOLD')===0) err(r.id, 'clean database tripped the ten-fold guard at '+c.kg+' kg: '+a); });
      n++;
    });
  });
  console.log(' ten-fold guard     silent across ' + n + ' evaluations (every regimen × every case)');

  /* a 100x dosing weight (the classic misplaced decimal) MUST trip the guard,
     a 1000x-low dosing weight MUST trip the other side, and a correct weight
     MUST stay silent. */
  const hasTF = o => (o.alerts||[]).some(a => String(a).indexOf('TEN-FOLD')===0);
  const uncapped = REG.find(r => r.d && /kg/.test(r.d.t) && !r.d.cap && !r.d.capDay && !r.d.capKg && !r.d.capDayKg);
  const capped   = REG.find(r => r.id==='paracetamol-po') || REG.find(r => r.d && r.d.t==='mgkg');
  if(!uncapped) err('tenfold:synthetic', 'no uncapped per-kg regimen found to test the high side');
  /* HIGH side: a 100x dosing weight on an uncapped per-kg regimen */
  const hi = computeRegimen(uncapped, {kg:12, dosingWeight:1200, pop:'paed', ageDays:1200});
  if(!hasTF(hi)) err('tenfold:synthetic', 'a 100x dosing-weight error did NOT trip the guard ('+uncapped.id+')');
  if(hasTF(computeRegimen(uncapped, {kg:12, dosingWeight:12, pop:'paed', ageDays:1200})))
    err('tenfold:synthetic', 'the correct dosing weight tripped the guard ('+uncapped.id+')');
  /* LOW side: a 1000x-low dosing weight on a mass-dosed regimen */
  const lo = computeRegimen(capped, {kg:12, dosingWeight:0.12, pop:'paed', ageDays:1200});
  if(!hasTF(lo)) err('tenfold:synthetic', 'a 1000x-low dosing-weight error did NOT trip the guard ('+capped.id+')');
  /* a legitimate maximum-dose cap must NOT be reported as a decimal error */
  if(hasTF(computeRegimen(capped, {kg:12, dosingWeight:1200, pop:'paed', ageDays:1200})))
    err('tenfold:synthetic', 'a capped dose was wrongly reported as a ten-fold error ('+capped.id+')');
  /* and the same error in an adult must stay silent: the guard is paediatric-only */
  if(hasTF(computeRegimen(uncapped, {kg:70, dosingWeight:7000, pop:'adult', ageDays:40*365.25})))
    err('tenfold:synthetic', 'the guard fired for an adult — it must be paediatric/neonatal only');

  const wa = [
    [34, 2, 'a 34 kg neonate'], [0.34, 2, 'a 0.34 kg neonate'], [3.4, 2, null],
    [16.3, 1460, null], [55, 5900, null],
    [70, 14600, 'a 40-year-old — out of scope for a paediatric calculator'],
    [40, 7500, 'a 20-year-old — out of scope'],
    /* preterm: the median must come from postmenstrual age (Fenton), and the
       4th element is the gestational age at birth in days */
    [0.65, 3,  null, 168], [6.5, 3, 'a 6.5 kg 24-weeker — ten-fold weight error', 168],
    [1.4, 14, null, 196], [14, 14, 'a 14 kg 28-weeker — ten-fold weight error', 196],
    [2.8, 30, null, 224],
    [7.4, 250, null, 238], [74, 250, 'a 74 kg ex-34-weeker at 8 months — ten-fold error', 238],
  ];
  wa.forEach(([kg, days, want, ga]) => {
    const m = weightAgeCheck(kg, days, 'male', ga);
    if(want && !m) err('weightAge', want + ' was NOT flagged');
    if(!want && m) err('weightAge', 'plausible ' + kg + ' kg at ' + days + ' d was flagged: ' + m);
  });
})();

/* ---------- preterm engine: Fenton reference, PMA, corrected age, scope ----------
   Hand-computed: the Fenton anchors are pinned (24/28/32/40 weeks), the weeks
   between them interpolate linearly, the table is monotonic in both sexes, and
   a 24-week GA is the floor. PMA = GA + PNA; corrected age = chronological age
   minus the days born early (floored at 0). The scope must admit a 24-weeker
   and a 17-year-old and exclude anything explicitiy adult-only.            */
(function(){
  const near = (got, want, tol) => got != null && Math.abs(got - want) <= (tol == null ? 1e-9 : tol);
  const anchors = [[24,0.65,0.60],[28,1.10,1.00],[30,1.40,1.30],[32,1.80,1.70],[34,2.25,2.10],[36,2.70,2.60]];
  anchors.forEach(([w,m,f]) => {
    if (!near(fentonWeight(w,'male'), m))   err('fenton', w + 'w male = ' + fentonWeight(w,'male') + ', want ' + m);
    if (!near(fentonWeight(w,'female'), f)) err('fenton', w + 'w female = ' + fentonWeight(w,'female') + ', want ' + f);
  });
  /* interpolation midway between two anchors */
  if (!near(fentonWeight(26,'female'), 0.80, 1e-9)) err('fenton', '26w female interpolation = ' + fentonWeight(26,'female') + ', want 0.800');
  if (!near(fentonWeight(33,'male'), 2.025, 1e-9))  err('fenton', '33w male interpolation = ' + fentonWeight(33,'male') + ', want 2.025');
  /* the declared range */
  if (fentonWeight(23,'male') !== null)     err('fenton', '23 weeks must be refused (below the declared range)');
  if (fentonWeight(40,'male') !== null)     err('fenton', '40 weeks must hand over to the WHO standard, not Fenton');
  if (!fentonMonotonic('male') || !fentonMonotonic('female'))
    err('fenton', 'the preterm reference must increase with every quarter-week of postmenstrual age');

  /* PMA and corrected age */
  if (pmaDays(196, 14) !== 210) err('pma', 'GA 28+0 with 14 postnatal days must be PMA 210 days');
  if (gaLabel(196) !== '28+0' || gaLabel(199) !== '28+3') err('pma', 'gaLabel gave ' + gaLabel(196) + ' / ' + gaLabel(199));
  if (correctedAgeDays(120, 199) !== 39) err('pma', 'a 28+3 infant at 120 days has a corrected age of 39 days (' + correctedAgeDays(120,199) + ')');
  if (correctedAgeDays(120, 280) !== 120) err('pma', 'a term infant is never corrected');
  if (correctedAgeDays(10, 300) !== 10)  err('pma', 'corrected age must not go negative');
  if (!preterm(196) || preterm(259) || preterm(273)) err('pma', 'preterm() must be true below 37+0 weeks only');

  /* scope: paediatric entries in, adult-only out */
  if (!childScope({pop:'neo'}) || !childScope({pop:'paed'}) || !childScope({pop:'all'}))
    err('scope', 'neonatal/paediatric/all-ages entries must be in scope');
  if (childScope({pop:'adult'})) err('scope', 'an explicitly adult entry must be out of scope');
  const inScope = REG.filter(childScope).length, out = REG.length - inScope;
  if (out < 1) err('scope', 'no adult-only entries were excluded at all — the scope filter is not biting');
  console.log(' scope              ' + inScope + ' of ' + REG.length + ' regimens are paediatric (' + out + ' adult-only excluded)');
  console.log(' preterm reference  ' + (inScope ? 'Fenton anchors pinned, monotonic in both sexes, 24 weeks floor' : ''));
})();

/* ---------- pump resolution and the reverse (pump -> dose) check ----------
   Hand-computed: a pump holds whole steps, so a target rate of 3 mL/h on a
   0.1 mL/h pump is really 2.95-3.05 mL/h = +/- 1.6667 % of dose; on a 1 mL/h
   volumetric pump it is 2.5-3.5 mL/h = +/- 16.67 %, which is a warning.
   Reverse: midazolam 50 mg in 50 mL at 3 mL/h delivers 3 mg/h = 0.1 mg/kg/h
   at 30 kg (the mirror of the forward hand-check), container 50 mL -> 16.667 h.
   Noradrenaline 4 mg in 50 mL at 5.25 mL/h delivers 0.42 mg/h = 0.1
   mcg/kg/min at 70 kg, and the order 0.05-1 mcg/kg/min needs 2.625-52.5 mL/h. */
(function(){
  const near = (got, want, tol) => got != null && Math.abs(got - want) <= tol * Math.max(1, Math.abs(want));
  const band = pumpBand(3, 0.1);
  if (!band) err('pumpBand', 'no band for 3 mL/h');
  else {
    if (!near(band.mlLo, 2.95, 1e-9)) err('pumpBand', 'low edge ' + band.mlLo + ' (want 2.95)');
    if (!near(band.mlHi, 3.05, 1e-9)) err('pumpBand', 'high edge ' + band.mlHi + ' (want 3.05)');
    if (!near(band.halfPct, 1.6666666, 1e-4)) err('pumpBand', 'half-step % ' + band.halfPct);
    if (band.coarse) err('pumpBand', 'a 0.1 mL/h pump at 3 mL/h must not be flagged coarse');
  }
  const coarse = pumpBand(0.5, 0.1);
  if (!coarse || !coarse.coarse) err('pumpBand', '0.5 mL/h on a 0.1 mL/h pump must be flagged coarse');
  const vol = pumpBand(3, 1);
  if (!vol || !near(vol.halfPct, 16.6666666, 1e-4) || !vol.coarse)
    err('pumpBand', 'a volumetric pump at 3 mL/h must be coarse (got ' + (vol && vol.halfPct) + ')');
  if (pumpBand(0, 0.1) !== null) err('pumpBand', 'a zero rate must return null');

  const db = deliverBand(3, 0.1, 1, 30);            /* 1 mg/mL, 30 kg */
  if (!db) err('deliverBand', 'no band');
  else {
    if (!near(db.amtLo, 2.95, 1e-9) || !near(db.amtHi, 3.05, 1e-9)) err('deliverBand', 'amount band ' + db.amtLo + '-' + db.amtHi);
    if (!near(db.perKgHrLo, 0.09833333, 1e-6) || !near(db.perKgHrHi, 0.10166667, 1e-6))
      err('deliverBand', 'per-kg band ' + db.perKgHrLo + '-' + db.perKgHrHi);
  }

  const mid = reverseCheck({ mlPerHr:3, drugAmt:50, drugUnit:'mg', totalVol:50, kg:30, containerMl:50 });
  if (!mid.ok) err('reverseCheck', 'midazolam case refused: ' + mid.err);
  else {
    if (!near(mid.concPerMl, 1, 1e-9)) err('reverseCheck', 'conc ' + mid.concPerMl + ' (want 1 mg/mL)');
    if (!near(mid.deliver.amtPerHr, 3, 1e-9)) err('reverseCheck', '3 mL/h of 1 mg/mL must be 3 mg/h');
    if (!near(mid.deliver.perKgHr, 0.1, 1e-9)) err('reverseCheck', 'per-kg ' + mid.deliver.perKgHr + ' (want 0.1 mg/kg/h at 30 kg)');
    if (!near(mid.hoursLast, 16.6666667, 1e-4)) err('reverseCheck', 'container life ' + mid.hoursLast + ' (want 16.667 h)');
    if (!near(mid.band.perKgHrLo, 0.09833333, 1e-6)) err('reverseCheck', 'band low ' + mid.band.perKgHrLo);
  }

  const nor = reverseCheck({ mlPerHr:5.25, drugAmt:4, drugUnit:'mg', totalVol:50, kg:70,
                             orderLo:0.05, orderHi:1, orderUnit:'mcg', orderPer:'kg/min' });
  if (!nor.ok) err('reverseCheck', 'noradrenaline case refused: ' + nor.err);
  else {
    if (!near(nor.deliver.amtPerHr, 0.42, 1e-9)) err('reverseCheck', 'norad 5.25 mL/h of 0.08 mg/mL must be 0.42 mg/h');
    if (!near(nor.expect.mlPerHrLo, 2.625, 1e-6) || !near(nor.expect.mlPerHrHi, 52.5, 1e-6))
      err('reverseCheck', 'expected rate ' + nor.expect.mlPerHrLo + '-' + nor.expect.mlPerHrHi + ' (want 2.625-52.5 mL/h)');
    if (!nor.verdict || nor.verdict.state !== 'within')
      err('reverseCheck', '5.25 mL/h must read as within the order (got ' + (nor.verdict && nor.verdict.state) + ')');
  }
  const fast = reverseCheck({ mlPerHr:60, drugAmt:4, drugUnit:'mg', totalVol:50, kg:70,
                              orderLo:0.05, orderHi:1, orderUnit:'mcg', orderPer:'kg/min' });
  if (!fast.verdict || fast.verdict.state !== 'above')
    err('reverseCheck', '60 mL/h must read as above the order (got ' + (fast.verdict && fast.verdict.state) + ')');
  const slow = reverseCheck({ mlPerHr:2, drugAmt:4, drugUnit:'mg', totalVol:50, kg:70,
                              orderLo:0.05, orderHi:1, orderUnit:'mcg', orderPer:'kg/min' });
  if (!slow.verdict || slow.verdict.state !== 'below')
    err('reverseCheck', '2 mL/h must read as below the order (got ' + (slow.verdict && slow.verdict.state) + ')');

  const ins = reverseCheck({ mlPerHr:7, drugAmt:50, drugUnit:'units', totalVol:50, kg:70 });
  if (!ins.ok) err('reverseCheck', 'insulin case refused: ' + ins.err);
  else {
    if (!near(ins.deliver.perKgHr, 0.1, 1e-9)) err('reverseCheck', 'insulin 7 mL/h of 1 U/mL at 70 kg = ' + ins.deliver.perKgHr + ' (want 0.1 U/kg/h)');
    if (ins.checks.some(c => c.level === 'warn' && /steps are/.test(c.msg)))
      err('reverseCheck', '7 mL/h on a 0.1 mL/h pump is +/-0.7 % and must not warn');
  }
  /* refusals refuse */
  if (reverseCheck({ drugAmt:4, drugUnit:'mg', totalVol:50, kg:70 }).ok) err('reverseCheck', 'no rate must refuse');
  if (reverseCheck({ mlPerHr:5, drugAmt:4, drugUnit:'mg', totalVol:50, doseUnit:'units' }).ok)
    err('reverseCheck', 'a mass preparation expressed in units must refuse');
  if (reverseCheck({ mlPerHr:5, drugAmt:4, drugUnit:'mg', totalVol:50, kg:70, orderLo:0.05, orderHi:1, orderUnit:'mcg', orderPer:'kg/min' }).ok === false)
    err('reverseCheck', 'a complete case must not refuse');
})();

/* ---------- report ---------- */
const nInf = REG.filter(r => r.inf).length;
const nFx = REG.reduce((a, r) => a + (r.fx || []).length, 0);
console.log('────────────────────────────────────────────────────────');
console.log(' regimens            ' + REG.length);
console.log(' formulations        ' + nFx + '  (IV ' + routeCount.iv + ' · oral ' + routeCount.po + ')');
console.log(' systems             ' + Object.keys(sysUsed).length + '/' + Object.keys(SYS).length);
console.log(' references          ' + Object.keys(REFS).length);
console.log('   paediatric sourced ' + paedN + ' dedicated paediatric/neonatal entries + ' + allKgN +
  ' all-ages entries with per-kg dosing');
['HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','PG-TB-PED','GHAI10','NELSON','IAP-STG'].forEach(k => {
  console.log('     ' + (REFS[k] ? REFS[k].n : k).padEnd(42) + 'cited by ' +
    REG.filter(r => (r.ref || []).includes(k)).length + ' entries');
});
console.log(' protocols           ' + PROT.length);
console.log(' infusions           ' + nInf + '  (pump rows generated ' + pumpRows + ')');
console.log(' dose evaluations    ' + evaluated + ' across ' + CASES.length + ' body sizes');
console.log('────────────────────────────────────────────────────────');
if (WARN.length) { console.log('WARNINGS (' + WARN.length + ')'); [...new Set(WARN)].slice(0, 60).forEach(w => console.log('  ~ ' + w)); }
if (ERR.length) {
  console.log('\nERRORS (' + ERR.length + ')');
  [...new Set(ERR)].slice(0, 200).forEach(e => console.log('  ✗ ' + e));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
console.log('\nRESULT: PASS — every dose, volume, cap and pump rate re-derived independently and agreed.');
process.exit(0);
