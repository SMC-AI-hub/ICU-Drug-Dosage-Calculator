# Paediatric & Neonatal Drug Calculator

**24 weeks of gestation to the 18th birthday.** Offline. Indian formulations.
Guideline-referenced. Every dose shown as an amount *and* the volume to draw
from each strength available in India.

[**Open the live app →**](https://smc-ai-hub.github.io/ICU-Drug-Dosage-Calculator/)

---

## The interface

Built for a ward, not a demo: one screen, answer first.

* **Answer strip.** Every card leads with the dose **and** the volume to draw
  (`0.183 mL of 1 mg/mL → 18.3 kg → 183 mcg`), then the strength count. The
  full formulation table, administration, dilution, cross-checks and
  references are one tap below — closed by default, so 160+ regimens stay
  scannable instead of becoming a wall.
* **Never a blank page.** With no patient entered the page opens on a
  *Who are we dosing?* panel: one tap for a 5-year-old or a term newborn, or
  type a weight. Below 24 weeks of gestation or past the 18th birthday it
  refuses to print a dose at all rather than estimating one.
* **Find anything in one keystroke.** `Ctrl`/`Cmd`+`K` (or 🔍) searches every
  drug, brand, indication, protocol and tool; `/` jumps to the drug search.
* **Phone-first.** A patient strip stays pinned at the top ("18.3 kg ·
  Paediatric · MEASURED") and a bottom bar mirrors the seven sections.
* **Night mode.** A real dark theme for a 3 a.m. ward round, plus a larger-text
  toggle, both remembered on the device.
* **Prints as a document.** The print button opens every section first, so the
  sheet carries the full card — formulation table, volumes, warnings, the
  independent double-check block with signature lines — and no card is split
  across a page break.

## Install it (no internet needed after this)

| You want | Do this |
|---|---|
| **Windows / macOS desktop** | Download [`docs/Paediatric-Drug-Calculator.html`](docs/Paediatric-Drug-Calculator.html) — 860 KB, one file. Double-click. It opens in your browser and works with the Wi-Fi off. |
| **Android** | Open the live link in Chrome → ⋮ → **Add to Home screen**. It installs as an app and works offline. |
| **iPhone / iPad** | Open the live link in Safari → Share → **Add to Home Screen**. |
| **A ward computer with no internet** | Put the single file on the machine or a USB stick and open it. Nothing is ever fetched from a server. |
| **A colleague** | Send the single file. Email it, WhatsApp it, whatever works. It is self-contained. |

The installable version and the single file are **the same app, byte for
byte** — the build proves this on every commit.

## What it does

- **Enter an age or a weight** and every dose on the page recalculates: the
  amount, the maximum cap, and the volume to draw for *each* formulation —
  with the answer on one line at the top of every card, before you tap in.
- **Preterm engine.** Enter the gestational age at birth (weeks + days) for
  any baby born before 37 weeks and the app doses on **postmenstrual age**,
  estimates weight from the **Fenton 2013** preterm reference, and shows the
  **corrected age**. Below 24 weeks of gestation it refuses to guess.
- **Indian formulations throughout** — concentrations in mg/mL for IV and
  oral, pack sizes, and the brand names actually stocked in India.
- **Infusion workspace** — mix & run (with the pump-resolution honesty band),
  check a running line (pump rate → delivered dose, against the order), and a
  line board that prints as a handover sheet with time to changeover.
- **Category and system views**, search by name/brand/indication, pinned
  drugs, a command palette on <kbd>Ctrl</kbd>+<kbd>K</kbd>, dark theme, large
  type, and a session that survives a phone being pocketed mid-shift.
- **Every number is cited**, and the app refuses to print a number when a unit
  conversion is not exact.

## Safety

**Read [`NOTICE-CLINICAL.md`](NOTICE-CLINICAL.md) before use.** In short: this
is a decision-support tool, not a formulary; local practice wins; verify the
vial in your hand, and report any wrong dose the same day.

## Repository layout

```
docs/                     the built site — what GitHub Pages serves
  index.html              the installable PWA
  standalone.html         the one-file app (identical to the .html download)
  Paediatric-Drug-Calculator.html   same file, named for what it is
  manifest.webmanifest, sw.js, icons/
src/                      the source
  data/part1..8*.js       the dose database (regimens, formulations, citations)
  engine.js               dose maths, caps, unit algebra, infusion calculator
  ui.js                   rendering, panels, pump workspace, line board
  refs.js                 the reference list every entry cites
  styles.css, shell.html
qa/                       the gates (see below)
  validate.js             numerical & clinical validation
  pwa.js                  offline / installable checks
  smoke.js                drives the BUILT file in a real DOM
  run.sh                  all of the above, in order
build.py                  bundles src -> docs/ and fails on any gate error
serve.py                  local preview server
tools/make_icons.py       regenerates every icon at exact pixel sizes
```

## Development

```bash
npm ci                 # one dev dependency: jsdom
python3 build.py       # bundles src/ -> docs/, gates the output, writes the zip
bash qa/run.sh         # the four gates, in order, exactly as CI runs them
python3 serve.py 8000  # preview at http://localhost:8000
```

### The gates

The full record of what has been verified, and the defects found by looking
rather than assuming, is in [`QA_REPORT.md`](QA_REPORT.md).

| Stage | What it proves |
|---|---|
| `qa/validate.js` | Every dose, volume, cap and pump rate is **re-derived independently** of the app's own code, across every body size from a 0.55 kg 24-weeker to a 70 kg adolescent. Also asserts the ten-fold guard is silent on the whole live database and fires on a deliberate 100× error, that the Fenton table is monotonic, and that scope refusals hold. |
| `build.py` | Every source parses, no placeholder survives, and the output contains **no external network reference** — the file is provably offline. |
| `qa/pwa.js` | Manifest, icons at exact sizes, service worker, deep links, and that the standalone file is byte-identical to the built site. |
| `qa/smoke.js` | 163 assertions driving the **built artefact** in a DOM: dosing, scope refusals, the preterm flow, the pump workspace, the line board, search, palette, CSV export. |
| `tools/browser-check.js` | Runs the built file over `file://` in headless Chromium: it boots with no errors, the answer strip leads with the volume, out-of-scope patients are refused rather than dosed, a 28+3-weeker is dosed on postmenstrual age from Fenton, dark mode applies, and the phone layout (patient strip, seven-item bottom bar, no sideways scroll) holds. This is the gate that catches layout defects jsdom cannot see — it is how the sticky-origin and print-pagination bugs were found. Skips loudly if no Chromium is installed. |

CI runs all four plus a bare `file://` boot with no storage and no service
worker, and **only deploys to Pages if every one of them passes**.

## Deployment

Two ways to be live. Route A is instant and needs no token; Route B is the
fully automated gated pipeline.

**A — Pages from a branch (no token, live in about a minute)**

1. **Settings → Pages → Build and deployment → Source: _Deploy from a branch_**
2. Branch **`main`**, folder **`/docs`** → **Save**

Live at <https://smc-ai-hub.github.io/ICU-Drug-Dosage-Calculator/>.
The app is installable from that link (Chrome/Edge: *Install app*; Safari:
*Add to Home Screen*). Keep `.github/workflows/qa-and-deploy.yml` out of the
repository while the source is a branch — its deploy job can only publish when
the source is *GitHub Actions*, so it would show a red cross for no reason.

**B — GitHub Actions (gates every push, then publishes)**

Requires the workflow file to be on `main`, which GitHub only accepts from a
token with the **Workflows: Read and write** permission (or by creating the
file in the browser):

1. Push `.github/workflows/qa-and-deploy.yml` (or add it via
   *Add file → Create new file*, pasting the file's contents).
2. **Settings → Pages → Source: _GitHub Actions_**.
3. Push to `main`. The `qa` job runs all four gates — numerical validation,
   the offline/installable gate, the DOM smoke test and the bare-`file://`
   boot — and the `deploy` job runs **only** after they pass.

**A red gate publishes nothing.** The previously deployed version keeps
serving, so a broken build can never replace a working one.


## Licence

[Apache License 2.0](LICENSE) — free to use, install, modify and redistribute
with attribution, keeping the licence and copyright notice intact. As with any
Apache-2.0 work, the software comes **without warranty of any kind**; read
[`NOTICE-CLINICAL.md`](NOTICE-CLINICAL.md) before putting it near a patient.
Any modified build must be renamed and re-gated (see [`CONTRIBUTING.md`](CONTRIBUTING.md))
so that a changed calculator can never be mistaken for a verified one.
