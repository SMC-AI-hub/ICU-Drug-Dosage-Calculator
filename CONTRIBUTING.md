# Contributing

The most valuable contribution to a paediatric dose calculator is a **wrong
number found before a patient is harmed**. Read this before changing anything.

## Reporting a dose problem

Open an issue titled `DOSE:` with:

- the drug card and the entry id (visible in the URL-less card, e.g. `ibuprofen-pda`),
- the child (age, gestational age if preterm, weight),
- what the app showed (screenshot or the exact text),
- what your reference says, **with the edition and page**,
- and your unit's protocol, if it differs.

## Changing the dose database

1. Edit only `src/data/partN-*.js`. Keep the schema: `{id,n,sys,cls,ind,pop,risk,inf?,diln[],d,fx[],admin,dil,warn[],notes[],ref[]}`.
2. Every entry needs a `ref[]` citing the reference list in `src/refs.js`. An
   entry with no citation will not be accepted.
3. Run the gates. **Nothing ships with a red gate.**

```bash
python3 build.py && npm test
```

The numerical gate re-derives every dose independently. If your change alters a
number it cannot verify, it will fail — that is the point.

## Rules that are not negotiable

- **Never** make the app guess. If a unit conversion is not exact, it must
  refuse and say why. A blank with an explanation beats a plausible number.
- **Never** remove a `warn[]` entry that names a hazard (look-alike
  concentrations, route restrictions, maximum rates) without a reference that
  supersedes it.
- **Never** widen the scope statement without evidence: the app covers 24 weeks
  of gestation to 18 years, and refuses outside it.
- Doses for high-alert drugs (risk 4–5) require **two** independent references.
- Keep the paediatric sourcing intact: Harriet Lane (latest), *Drug Dosages in
  Children* (Singh & Deorari), the Gupta paediatric formulary, IAP STG, Nelson.
  The gate checks that every paediatric entry cites at least one of them.

## Commit style

`data: <what changed> (<reference>)` — e.g.
`data: ibuprofen PDA higher course for >72 h (NeoFax 2024, Cochrane 2023)`.

Include the build hash from `python3 build.py` in the pull request body.
