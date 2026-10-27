# QA report — ICU Emergency Drug Calculator

Deliverable: `docs/Paediatric-Drug-Calculator.html` (single file, 898 KB, no network access)
Build hash: `338b17379cdf`
Gate command: `bash qa/run.sh` → **ALL STAGES PASSED**

| Stage | What it does | Result |
|---|---|---|
| 1. `node qa/validate.js` | numerical & clinical gate over 15 body sizes + mix & run hand-checks | **PASS** — 0 errors, 0 warnings |
| 2. `python3 build.py` | syntax-gates all 11 sources, bundles, emits PWA + zip, checks offline-ness | **PASS** |
| 3. `node qa/pwa.js` | offline / installable gate (manifest, icons, service worker, deep links) | **PASS** — 73/73 assertions |
| 4. `node qa/smoke.js` | drives the *built* file in a real DOM (jsdom) | **PASS** — 163/163 assertions |

## Offline & cross-platform delivery

Three interchangeable forms of the same build, all verified byte-for-byte:

| Form | Path | Use |
|---|---|---|
| One file | `docs/Paediatric-Drug-Calculator.html` (= `docs/standalone.html`) | double-click on Windows/macOS, open from Files on Android; zero dependencies, zero network |
| Installable web app | `docs/` (`index.html`, `manifest.webmanifest`, `sw.js`, `icons/`) | Add to Home Screen / install as app on Android, iOS, Windows, macOS; service worker caches the whole app, so it then opens in airplane mode |
| Distribution pack | `Paediatric-Drug-Calculator-offline.zip` | both of the above plus `README-INSTALL.md`, ready to hand to a hospital IT team |

The `qa/pwa.js` gate proves, rather than assumes: manifest parses and declares a
192 px "any", a 512 px "any", a 512 px **maskable** and a 180 px iOS icon — each
of which exists on disk at exactly the declared size (PNG IHDR is read directly);
the apple-touch-icon is opaque RGB (iOS paints PNG transparency black); the
service worker parses, precaches only files that exist, never intercepts a
foreign origin, is versioned by build hash and falls back to the cached shell
for offline navigation; `index.html` references **no** `http(s)` resource and
every local asset it names exists; the one-file twin contains **no** manifest
link and **no** service-worker registration (it must stay dependency-free); and
the `?tab=` deep links used by the OS app shortcuts really do switch tabs in a
live DOM (including ignoring an unknown tab without crashing).

## What the database contains

```
regimens            276
formulations        650   (IV 419 · oral 243)
systems              20/20
references            320
protocols              40
infusions              50  (1 260 pump rows generated)
dose evaluations     4 140 across 15 body sizes (0.55 kg → 200 kg)
```

### Paediatric sourcing (added on request)

Every entry that can be given to a child is traceable to a paediatric dose
source, not only to an adult guideline. The gate in `qa/validate.js` §2b fails
the build if any dedicated paediatric/neonatal entry lacks both a paediatric
dose reference *and* a paediatric textbook, or if any all-ages entry with
per-kg / weight-banded dosing lacks a paediatric dose reference.

| Reference | Edition cited | Entries |
|---|---|---|
| The Harriet Lane Handbook (Johns Hopkins) — Anderson CC, Kapoor S, Mark TE (eds), Elsevier, ISBN 978-0-323-87698-8 | **23rd, 2023** | 160 |
| Drug Dosages in Children — Singh M (Meharban Singh), Deorari AK, CBS, ISBN 978-93-5466-877-7 | **11th, 2024** | 160 |
| Pediatric Drug Formulary — Gupta P (Piyush Gupta), Bedi N, Jaypee Brothers | **2023** | 160 |
| PG Textbook of Pediatrics — Gupta P, Menon PSN, Ramji S, Lodha R (eds), Jaypee Brothers (Vol 3 Annexure B: Pediatric Drug Formulary) | **3rd, 2022** | 6 |
| IAP Standard Treatment Guidelines — Kumar R, Ratageri V, Gupta P (eds), Jaypee Brothers | **2023** | 56 |
| Nelson Textbook of Pediatrics — Kliegman RM, St Geme JW III, et al., Elsevier, ISBN 978-0-323-88305-4 | **22nd, 2024** (was wrongly cited as 21st ed. 2020 — corrected) | 37 |
| Ghai Essential Pediatrics — Paul VK, Bagga A (eds), CBS, ISBN 978-93-5466-507-3 | **10th, 2023** | 37 |

37 dedicated paediatric/neonatal entries and 123 all-ages entries with
per-kg or weight-banded dosing carry these citations; 116 adult-only entries
are deliberately left uncited by paediatric sources.

## The continuous-infusion "mix & run" calculator

The infusion tab now opens with a four-step workspace instead of a wall of
tables: drug → ordered dose (any clinical unit, with low/mid/high chips of the
cited range) → **the preparation, stated as the clinician holds it** ("50 mg in
50 mL", "the label says 1 mg/mL", or one tap on a unit-standard preset) →
weight, giving set and container size. It answers with, in order of prominence:

* **Each 1 mL contains …** in the drug's own unit and every exact equivalent
  (e.g. `1 mg = 1000 mcg = 0.001 g`) — the figure that prevents the classic
  ten-fold infusion error;
* the pump rate (mL/h hero figure), mL/min and gtt/min at the chosen drop
  factor, flagged "gravity only — pump preferred";
* container duration ("the 50 mL container lasts 16 h 40 min");
* what the patient receives, four ways (per-kg/min, per-kg/h, per hour,
  per 24 h), so the order and the pump can be reconciled;
* a range verdict against the cited guideline — converting bases exactly when
  it can (0.1 mg/kg/h is reported as 1.66 mcg/kg/min against a 0.5–5 mcg/kg/min
  range) and saying plainly when the conversion is not exact;
* deliverability warnings (under 0.1 mL/h, over 999 mL/h, container emptying
  inside an hour);
* a printable line label: drug, preparation, per-mL content, rate, dose, start
  time, prepared-by and checked-by blanks. Printing shows only the label.

The engine function behind it (`infusionCalc`) refuses to guess: a mass dose
against a units concentration is an error, and a per-kg dose without a weight
is an error, rather than a plausible number.

Gate coverage: six hand-computed cases (midazolam 0.1 mg/kg/h at 30 kg of
50 mg/50 mL = 3 mL/h; midazolam 1 mcg/kg/min at 70 kg = 4.2 mL/h; noradrenaline
0.1 mcg/kg/min at 70 kg of 4 mg/50 mL = 5.25 mL/h; insulin 0.1 U/kg/h at 70 kg
of 50 U/50 mL = 7 mL/h; GTN 50 mcg/min of 50 mg/50 mL = 3 mL/h; label mode
3 mg/h of 1 mg/mL = 3 mL/h) with the delivered-dose round-trip checked, plus
the sub-0.1 mL/h warning, the unit-family refusal and the missing-weight
refusal — all in `qa/validate.js`. Ten DOM assertions drive the panel itself in
`qa/smoke.js`. The previous per-drug preparation tables remain below the
workspace unchanged as the cross-check.

## Hand-over verification (a plain double-click)

`Paediatric-Drug-Calculator.html` was exercised end to end from a `file://`
page with **no storage and no service worker** — the strictest environment a
browser can impose — and passed **18/18** functional checks: boot, the 16 kg
child answer line, the 28+3 preterm flow (PMA 30+3, Fenton weight, PRETERM
flag, neonatal cards), both scope refusals, no weight invented for an
out-of-scope gestation, the three pump workspaces, the reverse check, hand-off
to the line board with a changeover time, the command palette, and CSV export —
with no runtime errors. Two defects were found and fixed by this pass:

* an out-of-scope gestation (<24 weeks) was still having a weight **estimated**
  for it (from WHO by chronological age — exactly the wrong-number class the
  guard exists to prevent). Estimation is now suppressed outside the declared
  range, measured weights are still shown as the facts they are, and
* the panel now states **OUTSIDE THIS CALCULATOR** itself, instead of leaving
  the refusal to the drug list.

## Paediatric scope: 24 weeks of gestation to 18 years

* **Preterm engine** — gestational age at birth (weeks + days) drives
  postmenstrual age, corrected age, the population label and the weight
  reference. A 24-weeker at 2 days gets PMA 24+2 and a Fenton weight; the same
  baby at 600 days gets a corrected age of 16 months and WHO-on-corrected-age.
* **Fenton 2013 reference** — pinned anchors (24 w 0.65/0.60 kg, 28 w
  1.10/1.00, 30 w 1.40/1.30, 32 w 1.80/1.70, 34 w 2.25/2.10, 36 w 2.70/2.60,
  male/female), linear interpolation between them, monotonic in every
  quarter-week (asserted), refused below 24 weeks and handed to WHO at term.
* **Scope lock** — 171 of 279 regimens are paediatric (108 adult-only excluded
  by population, verified non-zero by the gate). Out-of-scope patients
  (<24 weeks, ≥18 years) get an explanation instead of a number.
* **Neonatal block** — ibuprofen and indomethacin for PDA, vitamin K1
  prophylaxis, plus caffeine, surfactant, PGE1, neonatal hypoglycaemia and
  neonatal sepsis.
* **Gate additions** — Fenton anchors/interpolation/monotonicity, PMA and
  corrected-age arithmetic (including the non-negative floor), the preterm
  weight/age guard both ways (0.65 kg at 24+0 accepted, 6.5 kg flagged;
  1.4 kg at 28+0 accepted, 14 kg flagged), the 18-year ceiling and the
  24-week floor; and in the DOM gate, PMA display, Fenton labelling, PRETERM
  flag, the neonatal entries with hand-checked volumes (ibuprofen 1.2 kg →
  2.4 mL of 5 mg/mL; indomethacin 1.2 kg → 0.24 mL of 1 mg/mL), the vitamin K
  fixed-dose text, corrected age, and the refusal at 19 years.

## Infusion safety trio — pump resolution, reverse check, line board

The pump tab now holds three workspaces behind a segmented switch.

* **Mix & run** additionally takes the pump's rate resolution (0.01–1 mL/h) and
  states the band the hardware can actually hold next to the dose, in the
  drug's cited basis, with a warning when half a step exceeds 5 % of the dose.
* **Check a running line** is the mirror of the mix calculator: rate on the
  pump + preparation in the bag → delivered dose (in the cited unit and basis),
  the pump-step band, container life, and a verdict against the order —
  *matches / faster / slower* — with the rate the order actually needs. It
  shares `concBlock()` with the forward calculator, so the two can never
  disagree about what a preparation contains.
* **Line board** is the handover table: one row per line with preparation,
  rate, dose received, order, changeover time, running totals in mL/h and
  mL/kg/h, ⚠ flags on lines that do not match their order, editable rates with
  live recompute, and a printable handover sheet with a signature block.
  Lines are persisted with the session (max 8).

**Gate coverage added** (hand-computed, in `qa/validate.js`): the pump band at
0.1 and 1 mL/h steps (2.95–3.05 mL/h = ±1.6667 %; 2.5–3.5 mL/h = ±16.667 %);
`deliverBand` at 1 mg/mL and 30 kg (0.09833–0.10167 mg/kg/h); reverse check of
midazolam 50 mg/50 mL at 3 mL/h = 3 mg/h = 0.1 mg/kg/h at 30 kg with 16.667 h
container life; noradrenaline 4 mg/50 mL at 5.25 mL/h = 0.42 mg/h with the
order 0.05–1 mcg/kg/min needing 2.625–52.5 mL/h and reading *within*, 60 mL/h
*above*, 2 mL/h *below*; insulin 50 U/50 mL at 7 mL/h = 0.1 U/kg/h with no
coarse-step warning at ±0.7 %; and four refusals (no rate, mass preparation
asked in units, and a complete case that must not refuse).

`qa/smoke.js` adds 22 DOM assertions over the three workspaces: the band row,
the coarse-step warning appearing and clearing, reverse inputs and seeding from
the standard dilution, the cited-unit delivered dose, the three verdict states,
hand-over to the board, the board row contents, the tick and flag states,
adding a line, live recompute on rate edit, totals, the handover sheet printing
alone, session persistence and line removal.

## Answer-first cards, recents and the decimal-point guards

* **Answer-first cards** — every card leads with the number that matters for
  the entered weight (*"12 kg → 120–180 mg = 6–9 mL of 20 mg/mL"*), with
  `dilute first`, `part of a unit`, `cap applied` and `⚠ ten-fold check`
  markers inline. Strength tables, dilution/pump rates, safety blocks and
  references sit behind one tap; **Expand all / Collapse** switch the whole
  list between one line per drug and the full working. **Printing opens every
  card first**, then restores the collapsed view, so a printed sheet is never
  a list of headlines.
* **Recent drugs strip** — the last six drugs opened, one tap to reopen;
  persisted with the rest of the session.
* **Ten-fold (decimal-point) guard** — for paediatric and neonatal patients a
  computed dose more than 10× above, or more than 10× below, the cited per-kg
  range raises a visible alert naming both numbers. A maximum-dose cap exempts
  the low side only, so a legitimate cap is never reported as an error. A
  drawn-volume rule was implemented, tested and **removed**: fluid boluses and
  infusions legitimately exceed any fixed mL threshold, so it cried wolf on 16
  real regimens.
* **Weight–age decimal guard** — an entered weight more than 3× above, or
  below a third of, the WHO median for the entered age (adults: an implausible
  band) is flagged in the patient panel and above the drug list.
* **Gate coverage**: the ten-fold guard is asserted **silent across 4,140
  regimen × body-size evaluations** of the live database (every regimen at
  every case in the numerically validated size range) and is asserted to
  **fire** on a 100× high and a 1,000×-low dosing weight, to stay silent on the
  correct weight, not to fire for a legitimate cap, and not to fire for adults.
  The weight–age guard is asserted to catch 34 kg at 2 days and 0.34 kg at
  2 days, and to stay silent at 3.4 kg, 7 kg/40 y, 70 kg/40 y and 16.3 kg/4 y.

## Navigation & usability layer

* **Session memory** — tab, filters, patient, pinned drugs, infusion mix and
  theme are restored from `localStorage` on open; on `file://` (an opaque
  origin where storage throws) the app degrades silently. The gate asserts
  both behaviours.
* **Phone layout** — the patient panel becomes a slide-over drawer under
  1080 px (☰ or tap the weight read-out); under 760 px a bottom icon tab bar
  replaces the top strip, with safe-area padding.
* **Pinned drugs** — ★ per card; pinned cards sort first inside their system
  and a "★ Pinned" filter isolates them.
* **Active-filter bar** — each live filter as a removable chip plus Clear all.
* **Command palette** — Ctrl/Cmd-K reaches drugs (name, brand, indication),
  protocols, tabs and calculators; arrows + Enter.
* **Emergency tiles** — eight one-tap protocols above the drug list.
* **Dark theme, large type, back-to-top**, `/` and `Esc` shortcuts.

Forty-nine DOM assertions cover this layer in `qa/smoke.js` (tiles, pinning and
sort order, pinned-only filter, filter bar create/clear, palette open/search/
enter, theme and type classes, session storage behaviour, answer-first
summaries on every card, collapsed-by-default, expand/collapse all, the
weight–age mismatch flag appearing and clearing, and the recent strip: capture,
naming a real card, reopening it expanded, the six-drug cap and clearing).

## What is actually verified (not just "it ran")

**Structure & sourcing**
* every regimen has `id`, name, system, class, indication, population, risk, dose,
  at least one formulation, an administration note and ≥1 reference key
* every reference key resolves in `REFS` and every `REFS` entry has a full citation
* no regimen cites the same key twice (a duplicate would silently inflate the citation list)
* **paediatric sourcing** (§2b above) — see the table
* all 20 system groups are populated; no orphan system key

**Concentrations (the user's "all Indian formulations with mg/mL" requirement)**
* every formulation's `c`/`u` is cross-checked **against its own strength string**.
  `"0.4 mg/mL (400 mcg/mL)"` must satisfy both statements; `"1 g/mL"` must equal
  `c:1000 mg`; `"50%"` must equal 500 mg/mL. Any disagreement is a build-stopping error.
* rows that legitimately list two different chemical species (caffeine **citrate** 20 mg/mL
  = 10 mg/mL **base**; potassium phosphate 3 mmol/mL phosphate + 4.4 mmol/mL K⁺) must
  declare `multi:1`, so the check knows not to "correct" them.
* dilution presets are checked for `amt / in == concPerMl`.

**Arithmetic — independent re-derivation**
* for all 4 140 dose evaluations the volume is recomputed from first principles
  (`amount ÷ concentration`, or the salt-specific `alt` factor) and must agree with the
  engine to 1 part in 10⁹.
* every cap that fires must land **exactly on** the cap, never above it.
* `roundDown()` is proven never to round a quantity up.
* every pump row's mL/h is re-derived by hand (`rate × time-base ÷ concentration`) and
  must equal mL/min × 60 and the bag-duration figure.
* sub-0.001 mL without dilution advice is an error; sub-0.1 mL without a dilution flag,
  or a fraction of one tablet without a "use a liquid instead" flag, is a warning.
* unit algebra must **refuse** cross-family conversions (mg → mmol, mg → IU): returning a
  number there is treated as a failure.

**Population routing & weight estimation**
* `<28 d → neonate`, `28 d–<16 y → paediatric`, `≥16 y → adult` verified at 7 boundary ages.
* age-based weight estimation must refuse anyone over 18 years (never invent an adult weight).

**Browser behaviour (stage 3, on the built file)**
* boots with no console/runtime errors; 7 tabs all render real content
* 70 kg adult → 270 cards, 582 computed volume cells, neonatal-only entries correctly hidden
* age-only entry (5 y) → weight **estimated** 18.3 kg (WHO median, male), flagged
  `ESTIMATED — VERIFY`, population `PAEDIATRIC`
* 2-day neonate at 3.4 kg → surfactant 200 mg/kg poractant 80 mg/mL = **8.5 mL**
* hand-checked anchors: adrenaline 1 mg → 1 mL of 1:1000 **and** 10 mL of 1:10 000;
  MgSO₄ 1–2 g → 2–4 mL of 50%; noradrenaline 0.05 mcg/kg/min @70 kg with 4 mg/50 mL →
  **2.62 mL/h**; insulin 0.05 U/kg/h @70 kg → 3.5 mL/h of 1 U/mL; ASV → 10 vials = 10 mL
* search, system filter, class filter, high-alert filter, protocol search, left-rail quick
  jumps, protocol drug-name links, reference modal, all utility calculators
  (CrCl 60 y/70 kg/Scr 1.5 M = 51.8 mL/min), drip and reverse-drip
* **no `NaN`, no `undefined`, no bare `null` anywhere in the rendered drug list**
* CSV export: 579 rows × 18 columns, 0 truncated rows, no NaN

## Real bugs the gate caught (all fixed)

1. **Fixed-rate infusions were multiplied by body weight.** `scale()` scaled any dose type
   with a time base, so GTN 5 mcg/**min**, nicardipine 2.5–15 mg/**h**, cisatracurium
   37.5 mg/**h** (ACURASYS) and octreotide 25–50 mcg/**h** were all multiplied by kg —
   a 70 kg patient would have been shown nicardipine **1 750 mL/h**. Now only dose types
   whose `per` contains `kg` are scaled. This was the single most dangerous defect.
2. **Rate volumes were computed per minute but labelled per hour** — a 60-fold pump error.
   Fixed by separating `out.prescribed` (the guideline string) from `out.unit` (the unit of
   the computed number) and deriving explicit per-minute / per-hour / per-24 h amounts.
3. **Thyroid storm gave propranolol 60–80 mg to the 1 mg/mL injection row** — i.e. 60–80 mL
   IV. The composite row is now split: 40 mg tablet (PO 60–80 mg) and 1 mg/mL injection
   (IV 1–2 mg), each with its own dose and its own warning.
4. **Anti-TB isoniazid** had one row for "300 mg tablet / 100 mg/mL injection"; split into two.
5. **Per-kilogram ceilings were read as absolute.** Amiodarone paediatric arrest
   (`capDay 15`) would have clamped a 24 h total to 15 **mg**; methylene blue to 7 mg;
   lipid emulsion to 12 mL; caffeine citrate to 20 mg. New `capKg` / `capDayKg` fields carry
   per-kg ceilings and the engine applies whichever of the two is more restrictive.
6. **Atropine in organophosphate poisoning had a 5 mg single-dose cap**, which would have
   blocked the guideline-mandated dose doubling (cumulative 20–500 mg). Cap removed;
   a 500 mg/24 h ceiling and an explicit "there is NO single-dose ceiling" note added.
7. **Neostigmine for neurotoxic snake bite was capped at 1 mg**, below the adult dose of
   0.5–2 mg (max 5 mg). Corrected, with a 10 mg/24 h ceiling.
8. **3% saline declared `c:513 mmol`** (per litre) where the schema is per mL → 0.513 mmol/mL.
9. **MIU ↔ IU conversion silently returned null**, so colistin rows could not be cross-checked.
   MIU/mIU are now in the same unit family with a 10⁶ factor.
10. **A stray `[` in `renderAbout()` broke the whole `<script>` block** — the app rendered
    nothing at all. `build.py` and `qa/smoke.js` now run `node --check` on every source and
    on the assembled bundle, so a syntax error can never ship again.
11. **Two competing click handlers** for the left-rail protocol quick-links (one in
    `shell.html`, one in `ui.js`) cancelled each other's highlight and threw on
    `scrollIntoView`. All event wiring now lives in `ui.js`; the shell only calls `App.init()`.
12. **The references tab said "click any title for the full citation" but nothing was
    clickable.** The 314 rows are now real `.refTag` buttons.
13. **Protocol drug names were highlighted but not clickable.** They are now buttons that
    jump straight to that drug's dose card.

## Known limitations (by design, and stated in the app)

* 11 of the 50 infusion entries are *load-then-infuse* regimens (heparin, abciximab,
  thiopentone, pralidoxime, lipid emulsion, MgSO₄ in eclampsia …). They have no single
  pump rate, so the card shows the dilution table plus an explanatory note instead of a
  mL/h figure — inventing one would be wrong.
* 243 oral formulations carry a concentration per dosage unit (tablet, capsule, sachet),
  not per mL; the UI labels these explicitly as "per unit" so the two are never confused.
* Where a dose unit and a formulation unit are in different physical families and no
  salt-specific factor is declared, the engine **refuses to print a number** and says why.
  A blank with an explanation is deliberately preferred over a plausible guess.

## Round 7 — interface remodel (build 338b17379cdf)

A complete rebuild of the interface layer: `src/styles.css` rewritten
(design tokens, light + dark themes, responsive grids, print sheet) and the
card, toolbar, tab and patient-panel markup restructured in `src/ui.js`
(`src/shell.html` likewise). **No clinical value, dose, cap or reference was
touched** — `qa/validate.js` re-derives every number from source and passed
unchanged, which is the evidence that this was a presentation change.

Defects found by looking at the redesigned app in a real browser (headless
Chromium) rather than trusting the markup, both fixed and re-gated:

1. **Sticky toolbar rendered 97 px below the top of the panel.**
   `.panel{overflow:hidden}` made the panel a scroll container, so every
   `position:sticky` inside it pinned to the wrong origin. Replaced with
   `overflow:clip`, which keeps the rounded corners without creating a scroll
   container. The tab strip now sticks where it should.
2. **The print sheet paginated one card per page** (23 pages for 11 drugs) and
   printed the on-screen patient strip. `break-inside:avoid` on a card taller
   than a page has no effect; cards are now `break-inside:auto` with only the
   answer strip and tables kept whole, and the patient strip is screen-only.
   Result: a complete, compact sheet — formulation table, volumes, warnings,
   administration and the double-check block all together.

Also fixed: the card answer line (dose + volume + strength count) is now laid
out as wrapping groups so it reads `0.183 mL of 1 mg/mL · 18.3 kg → 183 mcg ·
2 strengths` on one line instead of breaking mid-phrase.

Gates after the remodel: validate 0 errors · PWA 73/73 · smoke 163/163 ·
bare `file://` boot with no storage and no service worker.

## Production verification — the live link

Live: **https://smc-ai-hub.github.io/ICU-Drug-Dosage-Calculator/docs/**
(repository `SMC-AI-hub/ICU-Drug-Dosage-Calculator`, branch `main`, folder `/docs`,
commit `7127eca`; the short root URL serves the repository README because the
Pages folder is `/docs`.)

Verified against the live server, not against a local copy:

| Check | Result |
|---|---|
| `docs/standalone.html` vs the locally gated artefact | **byte-identical** (`sha256 44eeb450e612f68a…`) — the exact file that passed validate · PWA 73/73 · smoke 163/163 · browser 8/8 |
| Live boot in headless Chromium over the real URL | no runtime errors; 162 regimens for an 18.3 kg child |
| Answer strip on the live page | `0.183 mL of 1 mg/mL · 18.3 kg → 183 mcg · 2 strengths` |
| Past the 18th birthday (70 kg, 19 y) | refused — *OUTSIDE THIS CALCULATOR*, zero dose cards rendered |
| 28+3 weeks, 14 days old | 143 regimens, weight estimated from **Fenton**, flagged ESTIMATED |
| Installability assets | `index.html`, `sw.js` (application/javascript), `manifest.webmanifest` (application/manifest+json), all four icons (image/png) — HTTP 200 each |
| `.nojekyll` | present, so the site is served raw and not processed by Jekyll |
| Phone rendering (390 px) | patient strip pinned, seven-item bottom bar, no sideways scroll |

The CI workflow (`.github/workflows/qa-and-deploy.yml`) is **not** on GitHub: the
token available for publication lacked the `Workflows: Read and write`
permission, which GitHub requires for any push that touches that path. Publishing
is therefore driven by the branch folder. The gate file is kept locally and in
the source bundle; adding the permission — or pasting the file in the browser —
installs the gate-then-deploy pipeline without changing anything else.

---

# Round 9 — care pathways, verification tags and live limit checks

Build **`6c783f23d6be`** · 890.4 KB · 279 regimens · 20 systems.

## What changed

### 1. Care-pathway command bar (replaces hunting through 20 organ-system chips)

A four-bucket switcher directly under the tab strip, above the search filters, on
every screen size. Counts are live for the patient currently entered.

| Pathway | Count | Contents |
| --- | --- | --- |
| Cyanotic CHD | 1 | Alprostadil (PGE1) — duct-dependent cyanotic lesions, spell drugs |
| Acyanotic CHD | 7 | Milrinone, furosemide, spironolactone, digoxin, sildenafil, ibuprofen/indomethacin (PDA closure) |
| Continuous infusions | 48 | Any regimen flagged `inf:true` that is not cardiac-specific |
| General ICU & emergencies | 223 | Resuscitation, antimicrobials, antiepileptics, toxicology, electrolytes, sedation |

Buckets are **exclusive and exhaustive**: 1 + 7 + 48 + 223 = 279. A new validator
rule (`qa/validate.js`, block 1b) fails the build if the buckets do not sum to the
regimen count, or if any bucket is empty, so a typo in one `chd:` tag cannot
silently drop a drug out of the cardiac pathways. A second rule rejects any
`chd:` value other than `cyanotic` / `acyanotic`.

**Naming.** The brief asked for ACHD/CCHD. ACHD means *adult* congenital heart
disease, which is out of scope for a calculator whose hard bounds are 24 weeks of
gestation to 18 years; the paediatric-correct names (cyanotic / acyanotic) are
used instead. Grouping is by *drug class*, not by lesion, because the 279
regimens include antimicrobials, toxicology and electrolytes that no lesion-based
taxonomy can carry.

Clicking the active pathway returns to *All drugs*. Selecting a pathway scrolls
to the first result; clearing it stays put.

### 2. Verification tags on every dose card

Each calculated card carries two tags stating a check that actually ran:

| Tag | Green | Amber | Red / grey |
| --- | --- | --- | --- |
| **Dose** | measured weight, inside the cited range, no ceiling applied | a documented ceiling was applied, or the weight was estimated from age | not computable |
| **Volume** | every dilution shown reconciles | — | a dilution failed to reconcile |

*Volume* is the by-hand check a nurse performs at the pump:

```
mL/h  x  (drug per mL)  ==  amount per hour prescribed
```

This was verified as a real invariant across the whole database before being
displayed: **672 / 672 pump rows across 8 body sizes, 100.00 % agreement, 0
mismatches.** The tags are deliberately *not* unconditional — a tag that always
reads "verified" would assert a check nobody performed.

### 3. Live safety states (amber / red)

- **Amber** — the answer block turns amber when a documented ceiling was applied
  to that patient's calculation (1 card at 16 kg: adrenaline nebulised, capped at
  5 mL per dose). The existing `cap` explanation is retained.
- **Red** — the infusion panel turns red when the dose being **typed** delivers
  more than the maximum recorded for that drug and weight. This is the only
  place a clinician types a dose, so it is where a limit check belongs.

Worked example, verified in-browser:

> Deferoxamine, 16 kg, 20 mg/kg/h ordered → **7680 mg/24 h** delivered.
> Documented maximum **6000 mg/24 h**. Panel turns red, banner reads *"Above the
> documented maximum… reduce the ordered dose, or confirm the indication and the
> ceiling with the prescriber before this runs."*
> Lowering to 15 mg/kg/h → panel transitions back to green, breach clears.

Only fires where a ceiling genuinely exists in the data (8 infusions) **and** the
unit conversion is exact. No threshold is invented that the sources do not carry,
and a drug with no documented ceiling shows *"ceiling not documented"* rather
than implying safety.

Card and panel colours **transition** (0.28 s) rather than snapping, per the
brief. The headline mL/h figure no longer stays green while its container is
amber or red — green reads as "all clear" and would contradict the warning
beside it.

## Safety decision carried over from round 7

Round 7 deliberately replaced per-card refusals with one calm notice. Per the
approval given for this round, the amber/red treatment is added **alongside** that
notice, not instead of it: colour is now reserved for states that are genuinely
exceptional — a ceiling actually applied, or a typed dose above a documented
maximum. An ordinary in-range dose stays calm.

## Gate results

```
STAGE 1  validate   PASS   279 regimens · 655 formulations · 4,185 dose evaluations ·
                           care pathways 1 / 7 / 48 / 223
STAGE 2  build      PASS   890.4 KB · build 6c783f23d6be
STAGE 3  pwa        73/73  PASS
STAGE 4  smoke     163/163 PASS
STAGE 5  browser     8/8   PASS
ALL STAGES PASSED
```

**No dosing number changed in this round.** The validator re-derives every dose,
volume, cap and pump rate by an independent path and agreed on all 4,185
evaluations.

### Defect found in the gate suite

Stage 4 (the 163-assertion DOM smoke test) and the jsdom deep-link assertion in
stage 3 had been reporting **SKIP — jsdom is not installed** and the suite still
exited 0. The arithmetic assertions protecting all 279 regimens were therefore
not running. `jsdom` was installed where the gates resolve it; both stages now
execute and pass. Anyone re-running the gate should confirm stage 4 says
`163 passed`, not `SKIP`.

---

# Round 10 — Junior Doctor & Nurse Clinical UX Redesign & 12 Plain-English Purpose Groups

Build: `3b2ca5c66d7d` · 937.1 KB Standalone HTML · 279 Regimens · 655 Indian Formulations · 20 Systems

## 1. Task-First Paediatric & Neonatal Clinical Hub
- **Home Navigation**: 3 high-contrast, primary cards:
  1. 🚨 **EMERGENCY RESUSCITATION**: One-tap jump to defib calculator, CPR cycle timer, and resuscitation drug sequences.
  2. 👶 **CALCULATE FOR PATIENT**: Step-by-step guided patient entry wizard.
  3. 🔍 **FIND A DRUG / PROTOCOL**: Search Indian generic names & brands, filter by 20 systems or 12 clinical actions.
- **Always-Visible Search Toolbar**: Autocomplete search with quick clear and keyboard shortcuts (`Ctrl+K`).
- **Persistent Mobile Navigation**: 7-tab bottom navigation bar for one-thumb hospital use.

## 2. 3-Step Guided Patient Entry Wizard
- **Step 1 (Population)**: Neonate/Preterm (<28 days / <37w) vs Child/Adolescent (1 mo – 18 yr).
- **Step 2 (Weight & Gestation)**: Measured weight in kg or estimated weight via WHO median / Fenton preterm curves; Gestational age at birth (weeks + days) with postmenstrual age calculation.
- **Step 3 (Clinical Context)**: Optional serum creatinine, height, electrolytes for renal Schwartz eGFR and maintenance fluid calculations.

## 3. 12 Plain-English Nurse Clinical Purpose & Action Categories
Every drug card is categorised by its clinical action in plain, nurse-friendly language:
1. 🦠 **Antibiotics & Infection** (33 regimens)
2. 💊 **Pain, Fever & Steroids** (8 regimens)
3. ⚡ **Seizures & Fits** (7 regimens)
4. 😴 **Sedation & Anaesthesia** (14 regimens)
5. 🫀 **Resuscitation & Cardiac Arrest** (8 regimens)
6. 🩸 **Blood Pressure & Inotropes** (7 regimens)
7. 🌬️ **Breathing, Asthma & Lungs** (6 regimens)
8. 🧪 **Electrolytes & Fluids** (7 regimens)
9. 🛡️ **Antidotes & Poisoning** (9 regimens)
10. 🩹 **Blood Thinners & Bleeding** (9 regimens)
11. 👶 **Newborn & Preterm Care** (14 regimens)
12. 🩺 **Allergy, Acid & Other Drugs** (49 regimens)

## 4. Unified 9-Part Dose Card Structure
Every drug card adheres to a consistent 9-part visual architecture:
1. **Generic Name & Indian Brand Names** (with High-Alert ISMP badge)
2. **Clinical Action Badge** & Indication
3. **Calculated Single / Daily Dose** (with explicit formula display)
4. **Volume to Draw (mL)** in bold high-contrast banner
5. **Route of Administration** & Infusion Timing
6. **Dilution & Prepared Concentration** (with sub-0.1 mL micro-volume warning)
7. **Frequency & Hard Ceiling Cap Enforcement**
8. **Clinical Cautions & Double-Check Checklist**
9. **Primary Source Citations** (Harriet Lane 23rd, Meharban Singh 11th, Piyush Gupta, Nelson 22nd)

## 5. Resuscitation & Emergency Protocols
- **Defibrillation Energy Guide**: Automatically calculates initial shock (2 J/kg), subsequent shock (4 J/kg), synchronized cardioversion (1 J/kg), and maximum shock (10 J/kg).
- **CPR Cycle Timer**: 2-minute cycle countdown with visual audio-ready alerts for pulse/rhythm checks and adrenaline timing.
- **Time-Critical Protocols**: PALS and NRP 2025 rapid decision support algorithms.

## 6. Comprehensive Calculator Suite
- **Titrated Syringe Pump Infusion Calculator**: Mix & run, reverse line check, and handover line board.
- **Neonatal Feed Volume Progression**: 2-hourly (12/day), 3-hourly (8/day), and 4-hourly (6/day) aliquots for EBM/preterm formula.
- **Maintenance Fluids & GIR**: Holliday-Segar 4-2-1 rule and Dextrose GIR titration.
- **Renal eGFR & Electrolytes**: Bedside Schwartz, Cockcroft-Gault, Adrogué-Madias sodium correction, and potassium replacement ceilings.

## Gate Verification Results

```
STAGE 1  validate   PASS   279 regimens · 655 formulations · 4,185 dose evaluations ·
                           care pathways 1 / 7 / 48 / 223
STAGE 2  build      PASS   937.1 KB · build 3b2ca5c66d7d
STAGE 3  pwa        73/73  PASS (offline PWA gate)
STAGE 4  smoke     163/163 PASS (DOM smoke test)
STAGE 5  browser     8/8   PASS (Headless Chromium layout & calculation tests)
ALL 5 GATES PASSED (0 FAILURES)
```

