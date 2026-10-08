# Clinical safety notice

**Read this before the app is used on a patient. It is part of every copy.**

## What this is

A paediatric and neonatal emergency drug calculator for **24 weeks of gestation
to the 18th birthday**, built for Indian practice: Indian formulations with
their concentrations in mg/mL (or mcg/mL, units/mL, mmol/mL, % w/v), pack
sizes and brand names, for IV and oral routes, grouped by body system and by
pharmacological class.

## What it is not

- It is **not** a substitute for clinical judgement, a second checker, or your
  unit's protocol.
- It is **not** a national formulary. Where local practice differs from the
  cited reference, **local practice wins** — and please tell us so the
  difference can be documented.
- It is **not** validated for patients outside its declared range. Below 24
  weeks of gestation, and past the 18th birthday, it deliberately prints **no
  dose at all**.

## The five things this app does to reduce error

1. Every number carries its **citation**, and the paediatric entries are
   sourced from Harriet Lane, *Drug Dosages in Children* (Singh & Deorari),
   the Gupta paediatric formulary, the IGC/PG textbook, IAP standard treatment
   guidelines and Nelson.
2. Every dose shows the **volume to draw from each available strength**, not
   just the milligrams — and it refuses to print a number when a unit
   conversion is not exact rather than guessing.
3. Maximum single and 24-hour caps are enforced and named when they bite.
4. A **ten-fold guard** flags a computed dose more than 10× above or below the
   cited range, and a **weight–age guard** flags an entered weight that does
   not match the stated age — the two commonest fatal keyboard errors.
5. The infusion workspaces state **what the pump can actually hold** at its
   step resolution, and the line board checks a running rate against the order.

## Before you give a drug, check by hand

- The **patient's weight** is the number you would bet the child's life on.
  Weigh the child. If the app is estimating, it says so — treat an estimate as
  an estimate.
- The **concentration on the vial in your hand**, not on this screen.
- The **dose against the cited range shown on the card**.
- The **maximum cap** if the card says one was applied.

## Reporting a problem

A wrong dose in a calculator is a serious defect. If you find one, record the
drug, the weight and age entered, what the app showed, and what the reference
says — and raise it as an issue in this repository (or with whoever gave you
the file) the same day. Do not wait for a convenient moment.

## Verification

This repository ships the tests that verify it:

```
npm ci
python3 build.py
npm test          # numerical/clinical gate, offline gate, DOM gate
```

The numerical gate re-derives every dose, volume, cap and pump rate
independently of the app's own code, across every body size from a 0.55 kg
24-weeker to a 70 kg adolescent, and fails the build if any of them disagree.
