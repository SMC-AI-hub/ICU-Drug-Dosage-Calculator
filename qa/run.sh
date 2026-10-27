#!/usr/bin/env bash
# =====================================================================
# Full QA gate for the ICU Emergency Drug Calculator.
#
#   ./qa/run.sh
#
# Stage 1  node qa/validate.js  - the numerical / clinical gate
#          (structure, references, concentrations vs strength text,
#           independent re-derivation of every volume, cap behaviour,
#           pump rates, unit algebra, population routing)
# Stage 2  python3 build.py     - syntax-gates every source and bundles
# Stage 3  node qa/smoke.js     - drives the BUILT file in a real DOM
# Stage 5  node tools/browser-check.js - layout/behaviour in headless Chromium
#          (skips cleanly when no chromium is installed)
#
# Exit code is non-zero if any stage fails.
# =====================================================================
set -u
cd "$(dirname "$0")/.." || exit 1

fail=0

echo "════════════════════════════════════════════════════════════"
echo " STAGE 1/5 — numerical & clinical validation"
echo "════════════════════════════════════════════════════════════"
node qa/validate.js || fail=1

echo
echo "════════════════════════════════════════════════════════════"
echo " STAGE 2/5 — build the single-file app"
echo "════════════════════════════════════════════════════════════"
python3 build.py || fail=1

echo
echo "════════════════════════════════════════════════════════════"
echo " STAGE 3/5 — offline / installable (PWA) gate"
echo "════════════════════════════════════════════════════════════"
node qa/pwa.js || fail=1

echo
echo "════════════════════════════════════════════════════════════"
echo " STAGE 4/5 — DOM smoke test of the built file"
echo "════════════════════════════════════════════════════════════"
node qa/smoke.js
rc=$?
if [ "$rc" = "2" ]; then
  echo "(jsdom not installed — stage 3 SKIPPED, browser behaviour unverified)"
elif [ "$rc" != "0" ]; then
  fail=1
fi

echo
echo "════════════════════════════════════════════════════════════"
echo " STAGE 5/5 — rendered-interface check (real browser)"
echo "════════════════════════════════════════════════════════════"
echo "(jsdom proves the arithmetic; only a real engine can prove the layout,"
echo " the sticky origins and the phone behaviour)"
node tools/browser-check.js
rc=$?
if [ "$rc" = "2" ]; then
  echo "(no chromium on this machine — stage 5 SKIPPED, rendered layout unverified)"
elif [ "$rc" != "0" ]; then
  fail=1
fi

echo
echo "════════════════════════════════════════════════════════════"
if [ "$fail" = "0" ]; then
  echo " ALL STAGES PASSED"
else
  echo " QA FAILED — do not ship"
fi
echo "════════════════════════════════════════════════════════════"
exit $fail
