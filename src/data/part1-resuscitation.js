/* =====================================================================
   PART 1 — RESUSCITATION / CARDIAC ARREST · ARRHYTHMIA · VASOACTIVE
   ---------------------------------------------------------------------
   SCHEMA (used by all parts)
   {
     id   : unique key
     n    : drug name
     sys  : system group key (see SYS in engine.js)
     cls  : pharmacological class
     ind  : indication / clinical context
     pop  : 'adult' | 'paed' | 'neo' | 'all'      (who the regimen is for)
     minAge/maxAge : optional age window in years
     risk : 1..5 (5 = ISMP high-alert)
     d    : dose object
            {t:'mg'|'mgkg'|'mcg'|'mcgkg'|'g'|'units'|'unitskg'|'meq'|'meqkg'|
                'mmol'|'mmolkg'|'ml'|'mlkg'|'mgkghr'|'mcgkgmin'|'mgkgmin'|
                'unitskghr'|'mgkgday'|'text',
             v | lo/hi : value(s)
             cap    : max single dose, ABSOLUTE, in dose units
             capKg  : max single dose PER KG (whichever of cap/capKg is
                      smaller at the current weight is the one applied)
             capDay : max per 24 h, ABSOLUTE   | capDayKg : max per kg /24 h
             load:1 : declares that a single loading dose may legitimately
                      exceed capDay (e.g. dexamethasone 100 mg stat)
             div: number of divided doses | rep: repeat interval
             over: infusion/admin duration | text: non-numeric dose }
     inf  : true if it is a titrated infusion (enables pump calculator)
     diln : standard dilution presets [{l:'label', amt:4, in:50, u:'mg', bag:'50 mL NS',
                                        alt:{u:'mmol', amt:2.25} = same content in a 2nd unit}]
     fx   : formulations [{s:'strength', c:conc PER mL (liquids) or PER DOSAGE UNIT
                           (solids), u:'unit', p:'pack', b:'India brands',
                           r:'IV', prep:'reconstitution', hl:1 = preferred,
                           alt:[{u:'mmol', c:0.225}] = salt-specific factor when a
                                generic unit conversion would be WRONG,
                           own:{a|lo/hi|kg|kgLo/kgHi, cap, u, l, text} = this row
                                carries its OWN dose (composite multi-drug entries),
                           use:'fixed' + give:'text' = fixed instruction, no maths,
                           per:'vial' = quantity is counted per vial,
                           multi:1 = the strength string lists concentrations of
                                DIFFERENT chemical species (citrate vs base,
                                phosphate vs potassium) — only c/u is the dosed one}]
     admin: rate / technique
     dil  : dilution & compatibility
     warn : [red flags]   notes:[amber]  info:[blue]
     ref  : [reference keys -> refs.js]
   }
   ===================================================================== */
if (typeof REG === 'undefined') { var REG = []; }
function R(o) { REG.push(o); return o; }

/* ---------- FORMULATION SHORTHAND (India, IP/USP, mg per mL) ---------- */

/* =================== SYSTEM: RESUSCITATION =================== */

R({ id:'adr-arrest-ad', n:'Adrenaline (Epinephrine)', sys:'resus', cls:'Non-selective α/β adrenergic agonist',
  ind:'Cardiac arrest — asystole / PEA and refractory VF-pVT after shocks', pop:'adult', risk:5,
  d:{t:'mg', v:1, rep:'every 3–5 min while in arrest'},
  fx:[{s:'1 mg/mL (1:1000)', c:1, u:'mg', p:'1 mL ampoule', b:'Adrenaline IP — Neon, Vins, BDH, Troikaa', r:'IV/IO/IM/SC', hl:1},
      {s:'0.1 mg/mL (1:10,000)', c:0.1, u:'mg', p:'10 mL prefilled syringe (limited availability)', b:'Epinephrine 1:10,000 — imported / in-house dilution', r:'IV/IO'}],
  admin:'Rapid IV/IO push during CPR, then flush with 20 mL 0.9% NaCl and elevate limb for 10–20 s. If no IV/IO: ETT 2–2.5 mg diluted in 10 mL NS.',
  dil:'For ETT route dilute 1:1000 solution 1:10 (1 mg in 9 mL NS = 0.1 mg/mL) to allow accurate measurement.',
  warn:['NEVER give 1 mg/mL (1:1000) undiluted IV bolus to a patient with a pulse — causes lethal hypertension, LV failure and arrhythmia.','Confirm the ampoule is 1:1000 for IM anaphylaxis use and 1:10,000 (or diluted 1:1000) for IV use in a perfusing patient.','Do not mix with sodium bicarbonate in the same line — inactivated by alkaline pH.'],
  notes:['No maximum cumulative dose during cardiac arrest.','Interrupt CPR for <5 s to give the drug; resume immediately.'],
  ref:['AHA2025','ERC2025','ISCCM-ALS'] });

R({ id:'adr-arrest-pd', n:'Adrenaline (Epinephrine)', sys:'resus', cls:'Non-selective α/β adrenergic agonist',
  ind:'Paediatric cardiac arrest — any rhythm', pop:'paed', risk:5,
  d:{t:'mcgkg', v:10, cap:1000, rep:'every 3–5 min while in arrest'},
  fx:[{s:'1 mg/mL (1:1000)', c:1, u:'mg', p:'1 mL ampoule', b:'Adrenaline IP — Neon, Vins, BDH', r:'IV/IO/IM/SC', hl:1},
      {s:'0.1 mg/mL (1:10,000)', c:0.1, u:'mg', p:'dilute 1 mg/mL 1:10 → 0.1 mg/mL', b:'in-house dilution', r:'IV/IO'}],
  admin:'IV/IO 0.01 mg/kg (=0.1 mL/kg of 1:10,000) then flush with 3–5 mL/kg NS. ETT route: 0.1 mg/kg (=0.1 mL/kg of 1:1000) — larger dose needed.',
  dil:'Prepare 1:10,000 by drawing 0.1 mL of 1:1000 + 0.9 mL NS in a 1 mL syringe.',
  warn:['ETT/ET dose is 10× the IV dose — label the syringe with the route.','Maximum single IV/IO dose 1 mg.','1:1000 must never be given undiluted IV bolus in a perfusing child.'],
  notes:['Single-dose cap prevents the 10 mcg/kg calculation exceeding adult 1 mg dose in heavier children.'],
  ref:['AHA2025-PALS','APLS','IAP-EM','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });

R({ id:'adr-brady-pd', n:'Adrenaline (Epinephrine)', sys:'resus', cls:'Non-selective α/β adrenergic agonist',
  ind:'Symptomatic bradycardia unresponsive to ventilation/oxygenation & atropine (paediatric)', pop:'paed', risk:5,
  d:{t:'mcgkg', v:10, cap:1000, rep:'every 3–5 min as needed'},
  fx:[{s:'1 mg/mL (1:1000)', c:1, u:'mg', p:'1 mL ampoule', b:'Adrenaline IP', r:'IV/IO/IM', hl:1}],
  admin:'IV/IO over 3–5 min; effective ventilation and oxygenation are the primary treatment.',
  dil:'Dilute to 0.1 mg/mL (1:10,000) before IV use.',
  warn:['Correct hypoxia and acidosis first — most paediatric bradycardia is hypoxic.','Continuous ECG and BP monitoring mandatory.'],
  ref:['AHA2025-PALS','APLS','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'adr-inf-ad', n:'Adrenaline (Epinephrine) infusion', sys:'vasoactive', cls:'Inotrope + vasopressor (α1, β1, β2)',
  ind:'Cardiogenic / vasodilatory shock, post-arrest myocardial dysfunction, anaphylaxis infusion', pop:'all', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.05, hi:1},
  diln:[{l:'4 mg in 50 mL → 80 mcg/mL (standard)', amt:4, in:50, u:'mg', bag:'50 mL 0.9% NaCl or 5% dextrose'},
        {l:'1 mg in 50 mL → 20 mcg/mL (paediatric / small child)', amt:1, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'16 mg in 50 mL → 320 mcg/mL (fluid-restricted adult)', amt:16, in:50, u:'mg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'1 mg/mL (1:1000)', c:1, u:'mg', p:'1 mL ampoule × 4–16', b:'Adrenaline IP — Neon, Vins, BDH', r:'IV-inf', hl:1}],
  admin:'Central line strongly preferred. Start 0.05–0.1 mcg/kg/min, titrate q3–5 min. Syringe-pump delivery only.',
  dil:'Compatible with 0.9% NaCl and 5% dextrose. Protect from light; discard if pink/brown.',
  warn:['Extravasation → tissue necrosis. Check line patency every hour and mark the site.','Tachyarrhythmia, lactic acidosis, splanchnic and digital ischaemia at high dose.','Never co-infuse with sodium bicarbonate or other alkaline solutions.'],
  notes:['Anaphylaxis infusion (refractory): 0.05–0.2 mcg/kg/min titrated.','Doses >0.5 mcg/kg/min are rarely productive — reassess volume, mechanical cause and add vasopressin/steroid.'],
  ref:['AHA2025','ISCCM-SEP','AHA2025-PALS','ANAPH-IND','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'amio-arrest-ad', n:'Amiodarone', sys:'resus', cls:'Class III antiarrhythmic (K⁺ channel blocker, multi-channel)',
  ind:'Cardiac arrest — shock-refractory VF / pulseless VT', pop:'adult', risk:5,
  d:{t:'mg', v:300, cap:300, rep:'second dose 150 mg if VF/pVT persists'},
  fx:[{s:'50 mg/mL (150 mg/3 mL)', c:50, u:'mg', p:'3 mL ampoule/vial — need 6 ampoules', b:'Cordarone (Sanofi), Tachyra (Troikaa), Eurythmic, Amiodon', r:'IV', hl:1}],
  admin:'Dilute the 300 mg (6 mL) in 20 mL 5% dextrose → give over 10–20 min during CPR (or fast push in refractory arrest).',
  dil:'ONLY 5% dextrose. Final concentration ≥600 mg/L (0.6 mg/mL) — lower concentrations adsorb to the bag/tubing.',
  warn:['Hypotension and bradycardia on infusion (polysorbate 80 / benzyl alcohol vehicle).','Peripheral-line infusion >1 h risks thrombophlebitis — move to central access.','Do not mix with other drugs in the same syringe or line.'],
  notes:['Alternative: lidocaine 1–1.5 mg/kg if amiodarone unavailable.','Routine use in non-shockable arrest is NOT recommended.'],
  ref:['AHA2025','ERC2025'] });

R({ id:'amio-arrest-pd', n:'Amiodarone', sys:'resus', cls:'Class III antiarrhythmic',
  ind:'Paediatric shock-refractory VF / pulseless VT', pop:'paed', risk:5,
  d:{t:'mgkg', v:5, cap:300, capDayKg:15, rep:'may repeat 5 mg/kg, max 15 mg/kg in 24 h'},
  fx:[{s:'50 mg/mL (150 mg/3 mL)', c:50, u:'mg', p:'3 mL ampoule', b:'Cordarone (Sanofi), Tachyra', r:'IV', hl:1}],
  admin:'Rapid IV/IO push during CPR. If a perfusing rhythm: infuse over 20–60 min with ECG and BP monitoring.',
  dil:'Dilute to ≤6 mg/mL in 5% dextrose (e.g. 150 mg in 25 mL D5W) for non-arrest infusion.',
  warn:['Hypotension during infusion — reduce rate; give volume.','Contains benzyl alcohol — avoid prolonged/high-dose use in neonates where possible.','Maximum 15 mg/kg/24 h.'],
  ref:['AHA2025-PALS','APLS','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'amio-inf-ad', n:'Amiodarone infusion', sys:'arrhythmia', cls:'Class III antiarrhythmic',
  ind:'Post-arrest maintenance, recurrent VT/VF storm, AF with rate control when other agents unsuitable', pop:'adult', risk:4, inf:true,
  d:{t:'mgkghr', lo:0.5, hi:1},
  diln:[{l:'900 mg in 500 mL D5W → 1.8 mg/mL (24-h infusion)', amt:900, in:500, u:'mg', bag:'500 mL 5% dextrose'},
        {l:'450 mg in 250 mL D5W → 1.8 mg/mL', amt:450, in:250, u:'mg', bag:'250 mL 5% dextrose'},
        {l:'300 mg in 50 mL D5W → 6 mg/mL (syringe pump, fluid-restricted)', amt:300, in:50, u:'mg', bag:'50 mL 5% dextrose'}],
  fx:[{s:'50 mg/mL (150 mg/3 mL)', c:50, u:'mg', p:'3 mL ampoule', b:'Cordarone (Sanofi), Tachyra', r:'IV-inf', hl:1}],
  admin:'Standard 24-h regimen: 300 mg over first 1 h, then 900 mg over next 23 h (≈10–50 mg/h; usual total ≤2.2 g/24 h).',
  dil:'5% dextrose ONLY. Concentration must be ≥0.6 mg/mL (600 mg/L). Use a non-DEHP/PVC-free set and in-line filter if available.',
  warn:['Cumulative dose >2.2 g/24 h → hepatotoxicity, ARDS, lactic acidosis.','Peripheral infusion limited to <2 h and concentration ≤2 mg/mL.','Monitor BP, LFTs, TFTs (iodine load), ECG QT.'],
  notes:['Oral loading (if stable): 200 mg TDS × 1 week, then 200 mg BD × 1 week, then 200 mg OD.'],
  ref:['AHA2025','ERC2025'] });

R({ id:'amio-inf-pd', n:'Amiodarone infusion', sys:'arrhythmia', cls:'Class III antiarrhythmic',
  ind:'Paediatric recurrent VT / SVT refractory to adenosine & cardioversion', pop:'paed', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:5, hi:15},
  diln:[{l:'300 mg in 50 mL D5W → 6 mg/mL (360 mcg/mL)', amt:300, in:50, u:'mg', bag:'50 mL 5% dextrose'},
        {l:'150 mg in 50 mL D5W → 3 mg/mL', amt:150, in:50, u:'mg', bag:'50 mL 5% dextrose'}],
  fx:[{s:'50 mg/mL (150 mg/3 mL)', c:50, u:'mg', p:'3 mL ampoule', b:'Cordarone (Sanofi)', r:'IV-inf', hl:1}],
  admin:'Loading 5 mg/kg over 20–60 min, then 5 mcg/kg/min (titrate to max 15 mcg/kg/min). Total ≤15 mg/kg/24 h.',
  dil:'5% dextrose only; final concentration ≥1.5 mg/mL for short peripheral infusion.',
  warn:['Monitor BP continuously during load — hypotension is the commonest adverse effect.','Max 15 mg/kg/24 h or 5 mg/kg/24 h if given with other negative inotropes.'],
  ref:['AHA2025-PALS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'lido-arrest-ad', n:'Lidocaine (Lignocaine)', sys:'resus', cls:'Class Ib antiarrhythmic (Na⁺ channel blocker)',
  ind:'VF / pulseless VT — alternative to amiodarone', pop:'adult', risk:4,
  d:{t:'mgkg', lo:1, hi:1.5, cap:150, rep:'second dose 0.5–0.75 mg/kg q5–10 min; max 3 mg/kg in first hour'},
  fx:[{s:'20 mg/mL (2%) plain', c:20, u:'mg', p:'5 mL vial (100 mg), 30 mL vial', b:'Lignocaine IP — Neon, Saraca, Astra/Xylocard', r:'IV/IM', hl:1},
      {s:'10 mg/mL (1%) plain', c:10, u:'mg', p:'10 mL, 30 mL vial', b:'Lignocaine 1% — Neon, Saraca', r:'IV/IM/SC'}],
  admin:'IV push over 1–2 min during CPR. Max cumulative 3 mg/kg in the first hour.',
  dil:'May be given undiluted from the 1% or 2% vial; for infusion dilute 1–4 g in 250–500 mL NS (2–8 mg/mL).',
  warn:['NEVER use lignocaine with adrenaline (1:80,000 or 1:200,000) for antiarrhythmic IV use — the adrenaline content is dangerous.','Toxicity: perioral numbness, tinnitus, confusion, seizures, then cardiac depression.','Contraindicated in complete heart block without pacing, and in severe hepatic failure reduce dose by 50%.'],
  ref:['AHA2025','ERC2025'] });

R({ id:'lido-arrest-pd', n:'Lidocaine (Lignocaine)', sys:'resus', cls:'Class Ib antiarrhythmic',
  ind:'Paediatric VF / pulseless VT (alternative to amiodarone); VT with a pulse', pop:'paed', risk:4,
  d:{t:'mgkg', v:1, cap:100, rep:'may repeat 0.5–1 mg/kg; max 3 mg/kg in 1 h'},
  fx:[{s:'20 mg/mL (2%) plain', c:20, u:'mg', p:'5 mL vial', b:'Lignocaine IP — Neon, Saraca', r:'IV/IO', hl:1}],
  admin:'IV/IO over 1–2 min. For VT with a pulse, infuse over 30–60 min (avoid rapid bolus → hypotension).',
  dil:'Dilute 100 mg in 10 mL NS = 10 mg/mL for paediatric accuracy.',
  warn:['Avoid rapid bolus when a perfusing rhythm is present.','Max 3 mg/kg in the first hour; 20–50 mcg/kg/min infusion.'],
  ref:['AHA2025-PALS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'lido-inf-ad', n:'Lidocaine infusion', sys:'arrhythmia', cls:'Class Ib antiarrhythmic',
  ind:'Stable VT, ventricular ectopy storm after bolus', pop:'adult', risk:4, inf:true,
  d:{t:'mgkgmin', lo:0.02, hi:0.05},
  diln:[{l:'2 g in 500 mL NS → 4 mg/mL (standard)', amt:2, in:500, u:'g', bag:'500 mL 0.9% NaCl'},
        {l:'1 g in 250 mL NS → 4 mg/mL', amt:1, in:250, u:'g', bag:'250 mL 0.9% NaCl'}],
  fx:[{s:'20 mg/mL (2%) plain', c:20, u:'mg', p:'30 mL vial (600 mg)', b:'Lignocaine IP — Neon', r:'IV-inf', hl:1}],
  admin:'1–4 mg/min (≈20–50 mcg/kg/min) for 24 h, then reduce. Reduce by 50% if >70 years, heart failure or hepatic impairment.',
  dil:'Compatible with NS, D5W, RL. Use plain lignocaine only.',
  warn:['Cumulative toxicity >4 mg/min or >24 h without reduction.','Monitor for CNS toxicity (tremor, slurring, seizures) before cardiovascular collapse.'],
  ref:['AHA2025','TINTINALLI'] });

R({ id:'mgso4-torsades-ad', n:'Magnesium sulfate', sys:'resus', cls:'Electrolyte / membrane stabiliser',
  ind:'Torsades de pointes; VF/pVT with suspected hypomagnesaemia', pop:'adult', risk:4,
  d:{t:'g', lo:1, hi:2, cap:2},
  fx:[{s:'500 mg/mL (50%)', c:500, u:'mg', p:'2 mL ampoule (1 g), 10 mL vial (5 g)', b:'Magnesium Sulphate IP — Neon, Samarth, Sisco', r:'IV', hl:1},
      {s:'200 mg/mL (20%)', c:200, u:'mg', p:'10 mL ampoule (2 g)', b:'MgSO₄ 20% — Samarth', r:'IV'},
      {s:'250 mg/mL (25%)', c:250, u:'mg', p:'10 mL vial (2.5 g)', b:'MgSO₄ 25% — Neon', r:'IV'}],
  admin:'In arrest: 1–2 g diluted in 10 mL over 5–20 min. With a pulse (torsades): 1–2 g in 100 mL NS over 5–15 min, then 0.5–1 g/h.',
  dil:'For peripheral infusion dilute to ≤20% (200 mg/mL); ≤200 mg/mL is preferred to avoid thrombophlebitis.',
  warn:['Rapid IV push with a perfusing rhythm causes hypotension, bradycardia and asystole.','Loss of patellar reflexes = first sign of toxicity (serum Mg >3.5 mmol/L); >5 mmol/L → respiratory paralysis; >7 mmol/L → cardiac arrest.','Keep calcium gluconate 10% at the bedside as the antidote.'],
  ref:['AHA2025','ERC2025','TINTINALLI'] });

R({ id:'mgso4-torsades-pd', n:'Magnesium sulfate', sys:'resus', cls:'Electrolyte / membrane stabiliser',
  ind:'Paediatric torsades de pointes / refractory VF-pVT', pop:'paed', risk:4,
  d:{t:'mgkg', lo:25, hi:50, cap:2000, rep:'may repeat once'},
  fx:[{s:'500 mg/mL (50%)', c:500, u:'mg', p:'2 mL ampoule (1 g)', b:'Magnesium Sulphate IP — Neon, Samarth', r:'IV', hl:1}],
  admin:'Over 10–15 min with ECG and BP monitoring. Dilute to ≤100 mg/mL (10%) for peripheral use.',
  dil:'Dilute 1 g of 50% in 9 mL NS → 100 mg/mL (10%).',
  warn:['Monitor deep tendon reflexes and respiratory rate.','Hypotension/bradycardia on rapid infusion.'],
  ref:['AHA2025-PALS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'caglu-arrest-ad', n:'Calcium gluconate 10%', sys:'resus', cls:'Calcium salt / membrane stabiliser',
  ind:'Arrest due to hyperkalaemia, hypocalcaemia, hypermagnesaemia or calcium-channel-blocker overdose', pop:'all', risk:4,
  d:{t:'mgkg', lo:30, hi:60, cap:3000, rep:'may repeat in 10 min'},
  fx:[{s:'100 mg/mL (10%) — 9.3 mg elemental Ca²⁺/mL', c:100, u:'mg', p:'10 mL ampoule (1 g)', b:'Calcium Gluconate IP — Neon, Samarth, Saraca', r:'IV', hl:1}],
  admin:'Adult: 10–30 mL (1–3 g) IV over 5–10 min with ECG monitoring. Repeat if ECG changes of hyperkalaemia persist.',
  dil:'May be given undiluted through a large-bore/central line; dilute 1:1 in NS or D5W for peripheral infusion.',
  warn:['Do NOT give routinely in cardiac arrest — no benefit and possible harm (except the specific indications above).','NEVER mix with sodium bicarbonate or phosphate-containing solutions — precipitates calcium carbonate.','Extravasation → severe tissue necrosis (prefer central access).','Incompatible with ceftriaxone — do not co-administer (fatal precipitation), separate lines/flushes needed.'],
  notes:['Adult fixed dose 1–3 g; the weight-based band above covers children and small adults.'],
  ref:['AHA2025','ERC2025','TINTINALLI','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'cacl2-arrest', n:'Calcium chloride 10%', sys:'resus', cls:'Calcium salt (3× more elemental Ca²⁺ than gluconate)',
  ind:'Severe hyperkalaemia, hypermagnesaemia, CCB overdose — when central access available', pop:'all', risk:5,
  d:{t:'mgkg', lo:10, hi:20, cap:1000, rep:'may repeat in 10 min'},
  fx:[{s:'100 mg/mL (10%) — 27.2 mg elemental Ca²⁺/mL', c:100, u:'mg', p:'10 mL ampoule (1 g)', b:'Calcium Chloride IP — Neon, Samarth (availability variable)', r:'IV', hl:1}],
  admin:'Adult 5–10 mL (500–1000 mg) IV over 5–10 min. Paediatric 0.2 mL/kg (20 mg/kg) — max 500 mg per dose.',
  dil:'CENTRAL LINE ONLY. For peripheral use, dilute 1:1 with NS or D5W and give into a fast-running line.',
  warn:['1 g calcium chloride = 3 g calcium gluconate in elemental calcium — a 3-fold overdose risk if confused.','Severe tissue necrosis, sloughing and calcification if extravasated.','Do not mix with bicarbonate, phosphate or ceftriaxone.'],
  ref:['AHA2025','ERC2025','TINTINALLI','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'nahco3-arrest-ad', n:'Sodium bicarbonate', sys:'resus', cls:'Alkalinising agent',
  ind:'Arrest with pre-existing hyperkalaemia, TCA overdose, prolonged arrest; severe metabolic acidosis', pop:'adult', risk:3,
  d:{t:'meqkg', v:1, cap:100, rep:'then 0.5 mEq/kg every 10 min guided by ABG'},
  fx:[{s:'8.4% (1 mEq/mL = 84 mg/mL)', c:1, u:'mEq', p:'20 mL / 50 mL ampoule-vial', b:'Sodabic, Sodium Bicarbonate IP — Samarth, Neon', r:'IV', hl:1},
      {s:'7.5% (0.893 mEq/mL = 75 mg/mL)', c:0.893, u:'mEq', p:'15 mL ampoule (≈13.4 mEq)', b:'Sodium Bicarbonate 7.5% — Neon, Saraca', r:'IV'},
      {s:'4.2% (0.5 mEq/mL)', c:0.5, u:'mEq', p:'20 mL ampoule (paediatric)', b:'Sodabic 4.2%', r:'IV'}],
  admin:'Dilute 8.4% solution 1:1 with sterile water/D5W for peripheral administration (→4.2%). Give over 5 min; do not interrupt CPR for >10 s.',
  dil:'Compatible only with NS and D5W. NEVER mix with calcium, catecholamines, or labetalol in the same line.',
  warn:['Routine use in cardiac arrest is NOT recommended (Class 3) — may worsen intracellular acidosis and reduce coronary perfusion.','Causes hypernatraemia, hyperosmolality, hypokalaemia, and a left-shifted oxyhaemoglobin curve.','Inactivates adrenaline in the same syringe/line — flush with 20 mL NS between drugs.'],
  ref:['AHA2025','ERC2025','ISCCM-ALS'] });

R({ id:'nahco3-arrest-pd', n:'Sodium bicarbonate', sys:'resus', cls:'Alkalinising agent',
  ind:'Paediatric arrest with documented hyperkalaemia/hypocalcaemia/TCA toxicity; prolonged arrest', pop:'paed', risk:3,
  d:{t:'meqkg', v:1, cap:100},
  fx:[{s:'4.2% (0.5 mEq/mL)', c:0.5, u:'mEq', p:'20 mL ampoule', b:'Sodabic 4.2%, Sodium Bicarbonate 4.2%', r:'IV', hl:1},
      {s:'8.4% (1 mEq/mL)', c:1, u:'mEq', p:'20/50 mL vial — dilute 1:1 before paediatric use', b:'Sodabic', r:'IV'}],
  admin:'1 mEq/kg IV/IO = 2 mL/kg of 4.2% (or 1 mL/kg of 8.4% diluted 1:1). Give slowly.',
  dil:'In neonates and infants use 4.2% only, or dilute 8.4% 1:1 with sterile water.',
  warn:['Hyperosmolar 8.4% solution can cause intraventricular haemorrhage in neonates.','Not for routine use — only with a specific indication.','Flush the line before and after: incompatible with adrenaline, calcium and most drugs.'],
  ref:['AHA2025-PALS','APLS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'atropine-brady-ad', n:'Atropine', sys:'arrhythmia', cls:'Antimuscarinic (vagolytic)',
  ind:'Symptomatic sinus bradycardia / AV nodal block (adult)', pop:'adult', risk:3,
  d:{t:'mg', v:1, cap:3, rep:'every 3–5 min; maximum cumulative 3 mg'},
  fx:[{s:'0.6 mg/mL', c:0.6, u:'mg', p:'1 mL ampoule', b:'Atropine Sulphate IP — Neon, Samarth, Saraca', r:'IV/IM/SC', hl:1},
      {s:'1 mg/mL', c:1, u:'mg', p:'1 mL ampoule (some brands)', b:'Atropine 1 mg/mL — available at tertiary centres', r:'IV'}],
  admin:'IV push, may repeat every 3–5 min to a total of 3 mg. If no IV access: ETT 2–3 mg diluted in 10 mL NS.',
  dil:'Ready to use. Doses <0.5 mg may be diluted 1:10 (0.6 mg in 5.4 mL NS = 0.1 mg/mL) for accuracy.',
  warn:['Ineffective and possibly harmful in infranodal block (Mobitz II, third-degree with wide QRS) — proceed to pacing.','Cumulative 3 mg produces complete vagal blockade; beyond this, no additional benefit.','Causes tachycardia, urinary retention, blurred vision, delirium (esp. elderly).','Avoid in myocardial ischaemia — increases myocardial oxygen demand.'],
  notes:['2025 AHA/ERC: minimum single dose is 1 mg (previous 0.5 mg raised because lower doses can cause paradoxical bradycardia).'],
  ref:['AHA2025','ERC2025'] });

R({ id:'atropine-brady-pd', n:'Atropine', sys:'arrhythmia', cls:'Antimuscarinic (vagolytic)',
  ind:'Paediatric bradycardia due to increased vagal tone / primary AV block (after oxygenation)', pop:'paed', risk:3,
  d:{t:'mgkg', v:0.02, cap:1, rep:'may repeat once; min single dose 0.1 mg'},
  fx:[{s:'0.6 mg/mL', c:0.6, u:'mg', p:'1 mL ampoule', b:'Atropine Sulphate IP — Neon, Samarth', r:'IV/IM/SC/PO', hl:1}],
  admin:'0.02 mg/kg IV/IO. Minimum single dose 0.1 mg (prevents paradoxical bradycardia). Maximum single dose 0.5 mg in a child, 1 mg in an adolescent.',
  dil:'For neonates/infants dilute to 0.1 mg/mL (0.6 mg + 5.4 mL NS) so that 0.02 mg/kg = 0.2 mL/kg.',
  warn:['Oxygenation and ventilation are the definitive treatment — atropine is an adjunct.','Maximum 1 mg in children (0.5 mg per dose in small children).','Glaucoma, ileus, tachyarrhythmia caution.'],
  ref:['AHA2025-PALS','APLS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'vasopressin-arrest', n:'Vasopressin', sys:'resus', cls:'V1 receptor agonist (non-adrenergic vasopressor)',
  ind:'NOT recommended for routine cardiac arrest (removed from ACLS); may be considered in refractory vasodilatory shock', pop:'adult', risk:3,
  d:{t:'units', v:40, cap:40},
  fx:[{s:'20 units/mL', c:20, u:'units', p:'1 mL ampoule — sporadic availability in India', b:'Vasopressin (import); Terlipressin is the usual Indian substitute', r:'IV'}],
  admin:'If used in arrest: 40 units IV once (replaces the first or second adrenaline dose).',
  dil:'Dilute in NS.',
  warn:['Class 3 (no benefit) in routine adult cardiac arrest per AHA/ERC — adrenaline remains the standard.','Splanchnic and digital ischaemia, hyponatraemia.','Availability in India is unreliable; use noradrenaline ± terlipressin instead.'],
  ref:['AHA2025','ERC2025'] });

R({ id:'adenosine-svt-ad', n:'Adenosine', sys:'arrhythmia', cls:'AV-nodal blocking purine nucleoside',
  ind:'Regular narrow-complex SVT (AVNRT/AVRT) — diagnostic and therapeutic', pop:'adult', risk:4,
  d:{t:'mg', v:6, cap:18, rep:'12 mg after 1–2 min if no conversion; then 12 mg again (max 3 doses)'},
  fx:[{s:'3 mg/mL', c:3, u:'mg', p:'2 mL ampoule (6 mg)', b:'Adenosine IP — Claris, Neon, Samarth; Adenocard', r:'IV', hl:1}],
  admin:'RAPID IV push (<10 s) into the most proximal vein (antecubital preferred), immediately followed by a 20 mL NS flush and limb elevation.',
  dil:'No dilution. Draw exactly 2 mL for 6 mg and 4 mL for 12 mg — verify volume with a second clinician.',
  warn:['Causes brief asystole, chest pressure, flushing, dyspnoea — warn the patient; continuous ECG and defibrillator at bedside.','Contraindicated in second-/third-degree AV block, sick sinus syndrome (without a pacemaker), and active bronchospasm.','In heart-transplant patients the dose is 3 mg (supersensitivity).','Reduce dose to 3 mg if the patient is on dipyridamole or carbamazepine.'],
  notes:['If SVT does not convert after 3 doses, move to rate control / DC cardioversion.','Irregular wide-complex tachycardia (AF with WPW) — adenosine is CONTRAINDICATED.'],
  ref:['AHA2025','ERC2025'] });

R({ id:'adenosine-svt-pd', n:'Adenosine', sys:'arrhythmia', cls:'AV-nodal blocking purine nucleoside',
  ind:'Paediatric stable narrow-complex SVT', pop:'paed', risk:4,
  d:{t:'mgkg', v:0.1, cap:6, rep:'0.2 mg/kg (max 12 mg) after 1–2 min if no conversion'},
  fx:[{s:'3 mg/mL', c:3, u:'mg', p:'2 mL ampoule (6 mg)', b:'Adenosine IP — Claris, Neon, Samarth', r:'IV', hl:1}],
  admin:'0.1 mg/kg rapid IV/IO push (max 6 mg) + immediate flush. Second dose 0.2 mg/kg (max 12 mg).',
  dil:'No dilution. For infants draw the dose in a 1 mL syringe — an accurate volume is critical.',
  warn:['Monitor continuously — transient asystole is expected; be ready to start CPR.','Central-line administration needs a smaller dose.','Avoid in asthma/bronchospasm.'],
  ref:['AHA2025-PALS','APLS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

/* ---------- rate control ---------- */

R({ id:'esmolol-ad', n:'Esmolol', sys:'arrhythmia', cls:'Cardioselective β1-blocker (ultra-short acting, esterase-metabolised)',
  ind:'Acute rate control in AF/flutter, peri-operative tachycardia, aortic dissection, thyroid storm', pop:'adult', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:50, hi:300},
  diln:[{l:'2500 mg in 250 mL NS → 10 mg/mL (concentrated)', amt:2500, in:250, u:'mg', bag:'250 mL 0.9% NaCl'},
        {l:'2000 mg in 200 mL NS → 10 mg/mL (ready-to-use bottle)', amt:2000, in:200, u:'mg', bag:'200 mL premixed'}],
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'10 mL ampoule (100 mg), 20 mL (200 mg), 50 mL (500 mg)', b:'Esmocards (Cipla), Brevibloc (Baxter), Esmolate', r:'IV', hl:1}],
  admin:'Loading 500 mcg/kg over 1 min, then 50 mcg/kg/min for 4 min. If inadequate: repeat 500 mcg/kg load and increase to 100 mcg/kg/min; titrate by 50 mcg/kg/min every 4 min to a max of 300 mcg/kg/min.',
  dil:'Ready to use — no dilution required for the 10 mg/mL presentation. Compatible with NS, D5W, RL.',
  warn:['Avoid in decompensated heart failure, cardiogenic shock, severe asthma/COPD, second-/third-degree AV block.','Hypotension is dose-related — reduce infusion before stopping abruptly.','Contains no preservative; use within 24 h of opening.'],
  ref:['AHA2025','BNF'] });

R({ id:'esmolol-pd', n:'Esmolol', sys:'arrhythmia', cls:'Cardioselective β1-blocker',
  ind:'Paediatric SVT / junctional ectopic tachycardia / post-operative tachycardia', pop:'paed', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:50, hi:200},
  diln:[{l:'500 mg in 50 mL NS → 10 mg/mL (undiluted 10 mg/mL ampoule may be used directly)', amt:500, in:50, u:'mg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'10 mL ampoule (100 mg)', b:'Esmocards (Cipla), Brevibloc', r:'IV', hl:1}],
  admin:'Loading 100–500 mcg/kg over 1–5 min, then 50–200 mcg/kg/min. Monitor BP continuously.',
  dil:'May dilute to 1 mg/mL for small children to improve pump accuracy.',
  warn:['Neonates clear esmolol slowly — start at the low end.','Hypotension and bradycardia; stop if HR <60 or SBP falls >20%.'],
  ref:['BNFC','AHA2025-PALS','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'metoprolol-ad', n:'Metoprolol tartrate', sys:'arrhythmia', cls:'Cardioselective β1-blocker',
  ind:'Rate control in AF/flutter; adjunct in ACS with tachycardia/hypertension', pop:'adult', risk:4,
  d:{t:'mg', lo:2.5, hi:5, cap:15, rep:'every 2 min up to 3 doses (max 15 mg)'},
  fx:[{s:'1 mg/mL', c:1, u:'mg', p:'5 mL ampoule (5 mg)', b:'Betaloc (AstraZeneca), Metolar (Cipla), Betaloc IV', r:'IV', hl:1}],
  admin:'2.5–5 mg IV over 2 min; repeat every 2 min up to a total of 15 mg. Monitor BP and ECG continuously.',
  dil:'Ready to use; may be diluted in 10–20 mL NS.',
  warn:['Avoid in decompensated heart failure, hypotension (SBP <90), HR <60, PR >0.24 s, severe bronchospasm.','Do not combine with IV verapamil or diltiazem — risk of asystole.','Convert to oral metoprolol 25–50 mg BD once rate controlled.'],
  ref:['AHA2025','BNF'] });

R({ id:'diltiazem-ad', n:'Diltiazem', sys:'arrhythmia', cls:'Non-dihydropyridine calcium-channel blocker (class IV)',
  ind:'Rate control in AF/flutter with preserved LV function', pop:'adult', risk:4, inf:true,
  d:{t:'mgkghr', lo:5, hi:15},
  diln:[{l:'125 mg in 125 mL NS → 1 mg/mL', amt:125, in:125, u:'mg', bag:'125 mL 0.9% NaCl'},
        {l:'250 mg in 250 mL NS → 1 mg/mL', amt:250, in:250, u:'mg', bag:'250 mL 0.9% NaCl'}],
  fx:[{s:'5 mg/mL (25 mg/5 mL) lyophilised', c:5, u:'mg', p:'25 mg vial, 50 mg vial', b:'Diltzac (Wallace), Diltiocard, Herben (Torrent)', r:'IV', hl:1}],
  admin:'0.25 mg/kg IV bolus over 2 min (≈20 mg in a 70-kg adult). If inadequate after 15 min: 0.35 mg/kg (≈25 mg). Then 5–15 mg/h infusion.',
  dil:'Reconstitute 25 mg vial with 5 mL NS → 5 mg/mL. Dilute infusion to 1 mg/mL (max 250 mg/L).',
  warn:['CONTRAINDICATED in hypotension, HFrEF, pulmonary oedema, WPW with AF, and acute coronary syndromes with LV dysfunction.','Never combine with IV β-blocker.','Hepatic dose reduction required.'],
  ref:['AHA2025','BNF'] });

R({ id:'verapamil-ad', n:'Verapamil', sys:'arrhythmia', cls:'Non-dihydropyridine calcium-channel blocker',
  ind:'Rate control in AF/flutter when β-blocker and diltiazem unsuitable; SVT (adult, after adenosine fails)', pop:'adult', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:0.005, hi:0.005},
  diln:[{l:'50 mg in 250 mL NS → 200 mcg/mL', amt:50, in:250, u:'mg', bag:'250 mL 0.9% NaCl'}],
  fx:[{s:'2.5 mg/mL', c:2.5, u:'mg', p:'2 mL ampoule (5 mg)', b:'Veramil (Abbott), Calaptin (Abbott), Caveril', r:'IV', hl:1}],
  admin:'0.075–0.15 mg/kg IV over 2 min (usual 2.5–5 mg); may repeat 5–10 mg after 30 min; total max 20 mg. Maintenance infusion 0.005 mg/kg/min.',
  dil:'Dilute 5 mg in 10 mL NS (0.5 mg/mL) for slower injection.',
  warn:['Absolute contraindication in infants <1 year — profound hypotension, bradycardia and asystole.','Avoid in HFrEF, hypotension, WPW-AF, and with IV β-blockers.','Have calcium gluconate 10% and atropine ready.'],
  ref:['AHA2025','BNF','BNFC'] });

R({ id:'verapamil-pd', n:'Verapamil', sys:'arrhythmia', cls:'Non-dihydropyridine calcium-channel blocker',
  ind:'Paediatric SVT — ONLY in children >1 year, haemodynamically stable, after adenosine', pop:'paed', minAge:1, risk:5,
  d:{t:'mgkg', lo:0.1, hi:0.3, cap:10, rep:'may repeat after 30 min; max 3 doses'},
  fx:[{s:'2.5 mg/mL', c:2.5, u:'mg', p:'2 mL ampoule (5 mg)', b:'Veramil (Abbott), Calaptin', r:'IV', hl:1}],
  admin:'0.1–0.3 mg/kg IV over at least 2 min with continuous ECG/BP. Max single dose 5 mg (<5 yr) / 10 mg (>5 yr).',
  dil:'Dilute to 1 mg/mL before use in children.',
  warn:['CONTRAINDICATED under 1 year of age and in infants with SVT — use adenosine, digoxin or DC cardioversion.','Never give with IV propranolol.','Hypotension, bradycardia, AV block, asystole.'],
  ref:['BNFC','AHA2025-PALS','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'digoxin-ad', n:'Digoxin', sys:'arrhythmia', cls:'Cardiac glycoside (Na⁺/K⁺-ATPase inhibitor)',
  ind:'Rate control in AF (adjunct, esp. with heart failure); SVT', pop:'adult', risk:5,
  d:{t:'mg', v:0.25, cap:1.5, capDay:1.5, rep:'0.25 mg IV repeated up to a total of 1.5 mg over 24 h'},
  fx:[{s:'0.25 mg/mL', c:0.25, u:'mg', p:'2 mL ampoule (0.5 mg)', b:'Lanoxin (GSK), Cardoxin, Digoxin (Alkem)', r:'IV/PO', hl:1},
      {s:'0.25 mg tablet', c:0.25, u:'mg', p:'strip of 10', b:'Lanoxin 0.25 mg, Cardoxin 0.25 mg', r:'PO'},
      {s:'0.05 mg/mL elixir', c:0.05, u:'mg', p:'60 mL bottle', b:'Lanoxin paediatric elixir', r:'PO'}],
  admin:'IV over at least 5 min (undiluted or diluted 1:4 with NS/D5W). Total digitalising dose 8–12 mcg/kg (usually 0.75–1.5 mg) given as 50% now, 25% at 6 h, 25% at 12 h.',
  dil:'Dilute with at least a 4-fold volume of NS or D5W; do not mix with other drugs; give slowly to avoid vasoconstriction.',
  warn:['Check potassium, magnesium, calcium and renal function BEFORE each dose — hypokalaemia and hypomagnesaemia precipitate toxicity.','Reduce dose by 50% if eGFR <30 mL/min; avoid loading in renal failure.','Toxicity: nausea, yellow-green vision, bradycardia, AV block, bidirectional VT. Antidote: digoxin-specific Fab (very limited in India), KCl, magnesium, atropine, pacing.','Never give IV calcium rapidly with digoxin (stone-heart risk — theoretical).'],
  ref:['AHA2025','BNF','MARINO'] });

R({ id:'digoxin-pd', n:'Digoxin', sys:'arrhythmia', cls:'Cardiac glycoside',
  ind:'Paediatric SVT / rate control in heart failure', pop:'paed', risk:5,
  d:{t:'mcgkg', lo:20, hi:30, capDay:1000},
  fx:[{s:'0.25 mg/mL', c:0.25, u:'mg', p:'2 mL ampoule (0.5 mg)', b:'Lanoxin (GSK), Cardoxin', r:'IV/PO', hl:1},
      {s:'0.05 mg/mL elixir', c:0.05, u:'mg', p:'60 mL bottle', b:'Lanoxin paediatric elixir', r:'PO'}],
  admin:'Total digitalising dose (TDD) IV: neonate 20 mcg/kg, infant 30–35 mcg/kg, child 2–5 yr 30–40 mcg/kg, 5–10 yr 20–35 mcg/kg. Give 50% of TDD now, then 25% at 8 h and 25% at 16 h. Maintenance = 25–30% of TDD daily.',
  dil:'Dilute the ampoule 1:4 with sterile water or NS for accurate paediatric measurement (0.05 mg/mL).',
  warn:['IV bioavailability is higher than oral — reduce oral-to-IV conversion by ~20–25%.','Contraindicated in WPW with AF, hypertrophic obstructive cardiomyopathy, complete AV block.','Monitor ECG, K⁺, Mg²⁺ and renal function; ECG changes precede arrhythmia.'],
  ref:['BNFC','NELSON','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','GHAI10'] });

R({ id:'procainamide-ad', n:'Procainamide', sys:'arrhythmia', cls:'Class Ia antiarrhythmic',
  ind:'Stable wide-complex tachycardia, WPW with AF (alternative to amiodarone) — availability limited in India', pop:'adult', risk:4,
  d:{t:'mgkg', lo:20, hi:50, cap:1700},
  fx:[{s:'500 mg/mL', c:500, u:'mg', p:'10 mL vial (5 g) — sporadic/import', b:'Procainamide (import); Indian availability is unreliable', r:'IV'}],
  admin:'20–50 mg/min until the arrhythmia is suppressed, hypotension occurs, QRS widens >50% or a total of 17 mg/kg is given. Then 1–4 mg/min maintenance.',
  dil:'Dilute 1 g in 100 mL D5W → 10 mg/mL for infusion.',
  warn:['Stop for QRS widening >50%, hypotension, or 17 mg/kg total.','Avoid in prolonged QT, heart failure, and torsades.','Lupus-like syndrome with chronic use.'],
  notes:['Because Indian availability is unreliable, amiodarone or DC cardioversion are the usual first choices.'],
  ref:['AHA2025','BNF'] });

/* ---------- vasoactive ---------- */

R({ id:'norad-inf', n:'Noradrenaline (Norepinephrine)', sys:'vasoactive', cls:'Predominant α1 agonist with modest β1 activity',
  ind:'FIRST-LINE vasopressor in septic, vasodilatory and undifferentiated shock', pop:'all', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.05, hi:1},
  diln:[{l:'4 mg in 50 mL → 80 mcg/mL (standard syringe)', amt:4, in:50, u:'mg', bag:'50 mL 0.9% NaCl or 5% dextrose'},
        {l:'16 mg in 50 mL → 320 mcg/mL (adult, fluid-restricted)', amt:16, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'1 mg in 50 mL → 20 mcg/mL (neonate/small infant)', amt:1, in:50, u:'mg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'1 mg/mL', c:1, u:'mg', p:'4 mL ampoule (4 mg); also 2 mg/2 mL', b:'Norad (Neon), Norex (Samarth), Vinstar, Noradrenaline IP', r:'IV-inf', hl:1},
      {s:'2 mg/mL', c:2, u:'mg', p:'4 mL ampoule (8 mg)', b:'Noradrenaline 2 mg/mL — some brands', r:'IV-inf'}],
  admin:'Central venous line strongly preferred (peripheral use only in an emergency, large vein, <12 h). Start 0.05–0.1 mcg/kg/min; titrate q5 min to MAP ≥65 mmHg (or age-appropriate target).',
  dil:'Compatible with 0.9% NaCl and 5% dextrose. Protect from light — discard if discoloured (pink/brown).',
  warn:['Extravasation → necrosis. Check the site hourly; antidote = phentolamine 5–10 mg in 10 mL NS infiltrated locally (or terbutaline/nitroglycerin paste).','Do not mix with sodium bicarbonate or any alkaline solution.','Beware 10-fold errors: verify ampoule strength (1 mg/mL vs 2 mg/mL) and the final syringe concentration before connecting.'],
  notes:['Surviving Sepsis/ISCCM: target MAP ≥65 mmHg in adults; add vasopressin/terlipressin or hydrocortisone rather than escalating beyond ~0.5–1 mcg/kg/min.'],
  ref:['ISCCM-SEP','SSC2021','AHA2025-PALS','MARINO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'dopamine-inf', n:'Dopamine', sys:'vasoactive', cls:'Dose-dependent dopaminergic / β1 / α1 agonist',
  ind:'Second-line pressor; bradycardia-related hypotension; where noradrenaline unavailable', pop:'all', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:2, hi:20},
  diln:[{l:'200 mg in 50 mL → 4 mg/mL (4000 mcg/mL)', amt:200, in:50, u:'mg', bag:'50 mL 0.9% NaCl or D5W'},
        {l:'100 mg in 50 mL → 2 mg/mL (paediatric)', amt:100, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'400 mg in 500 mL → 0.8 mg/mL (gravity drip)', amt:400, in:500, u:'mg', bag:'500 mL 0.9% NaCl'}],
  fx:[{s:'40 mg/mL', c:40, u:'mg', p:'5 mL ampoule (200 mg)', b:'Dopamine IP — Neon, Samarth, Vamcare, Claris', r:'IV-inf', hl:1},
      {s:'10 mg/mL', c:10, u:'mg', p:'5 mL ampoule (50 mg)', b:'Dopamine 50 mg/5 mL — some brands', r:'IV-inf'}],
  admin:'2–5 mcg/kg/min (renal/dopaminergic), 5–10 (β1 inotropic), 10–20 (α1 pressor). Titrate q5–10 min. Syringe pump only.',
  dil:'Compatible with NS, D5W, RL. Protect from light.',
  warn:['More arrhythmogenic than noradrenaline — higher mortality in cardiogenic shock (SOAP II trial); noradrenaline is preferred.','Extravasation necrosis; central line preferred.','Inactivated by alkaline solutions (bicarbonate).'],
  ref:['SSC2021','MARINO','AHA2025-PALS','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'dobutamine-inf', n:'Dobutamine', sys:'vasoactive', cls:'Predominant β1 agonist (inotrope with mild β2 vasodilation)',
  ind:'Cardiogenic shock with adequate filling pressure, low cardiac output, decompensated heart failure, sepsis with myocardial dysfunction', pop:'all', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:2, hi:20},
  diln:[{l:'250 mg in 250 mL D5W → 1 mg/mL (1000 mcg/mL) standard', amt:250, in:250, u:'mg', bag:'250 mL 5% dextrose or NS'},
        {l:'125 mg in 50 mL → 2.5 mg/mL (paediatric syringe)', amt:125, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'500 mg in 250 mL → 2 mg/mL (fluid-restricted)', amt:500, in:250, u:'mg', bag:'250 mL 0.9% NaCl'}],
  fx:[{s:'25 mg/mL', c:25, u:'mg', p:'5 mL ampoule (125 mg) concentrate for infusion', b:'Dobutamine IP — Claris, Neon, Samarth; Dobuject', r:'IV-inf', hl:1},
      {s:'50 mg/mL', c:50, u:'mg', p:'5 mL ampoule (250 mg)', b:'Dobutamine 250 mg/5 mL — Fresenius/Intas', r:'IV-inf'},
      {s:'1 mg/mL ready-to-use', c:1, u:'mg', p:'100 mL / 250 mL bag (100 mg, 250 mg)', b:'Dobutamine infusion premix — Claris/Intas', r:'IV-inf'}],
  admin:'Start 2–5 mcg/kg/min; titrate q15 min to 10–20 mcg/kg/min max. Doses >20 mcg/kg/min rarely add benefit and cause tachycardia.',
  dil:'MUST be diluted before use — the concentrate is not for direct injection. Compatible with NS, D5W, RL.',
  warn:['Causes vasodilation → hypotension in hypovolaemic patients; ensure adequate preload first.','Tachycardia, ectopy and increased myocardial oxygen demand; reduce if HR rises >10% of baseline.','Do not mix with sodium bicarbonate or any alkaline solution.','Inactivated with heparin in the same line.'],
  ref:['SSC2021','MARINO','AHA2025-PALS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'milrinone-inf', n:'Milrinone', sys:'vasoactive', cls:'Phosphodiesterase-3 inhibitor (inodilator)',
  ind:'Low-output cardiogenic shock, post-cardiac-surgery, pulmonary hypertension/RV failure, β-blocker–refractory failure', pop:'all', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.25, hi:0.75},
  diln:[{l:'20 mg in 20 mL NS → 1 mg/mL (1000 mcg/mL) syringe pump', amt:20, in:20, u:'mg', bag:'20 mL 0.9% NaCl'},
        {l:'20 mg in 50 mL D5W → 400 mcg/mL', amt:20, in:50, u:'mg', bag:'50 mL 5% dextrose'}],
  fx:[{s:'1 mg/mL', c:1, u:'mg', p:'10 mL ampoule (10 mg), 20 mL ampoule (20 mg)', b:'Milirit (Alkem), Cardimil, Milrinone (Intas/Neon)', r:'IV', hl:1}],
  admin:'Optional loading 25–75 mcg/kg IV over 10 min (omit in hypotension/renal failure), then 0.25–0.75 mcg/kg/min. Reduce by 50% if CrCl <50 mL/min.',
  dil:'Ready to use or dilute in NS/D5W/RL to 200 mcg/mL. No in-line filter needed.',
  warn:['Hypotension and arrhythmia — the loading dose is often omitted in the ICU.','Renal clearance: accumulate in renal failure → halve the dose.','Thrombocytopenia with prolonged use.'],
  ref:['MARINO','BNFC','ISCCM-HF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'levosimendan-inf', n:'Levosimendan', sys:'vasoactive', cls:'Calcium sensitiser + K_ATP channel opener (inodilator)',
  ind:'Acute decompensated heart failure, low-output cardiogenic shock (esp. on β-blockade)', pop:'adult', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.05, hi:0.2},
  diln:[{l:'10 mg in 50 mL D5W → 200 mcg/mL (standard)', amt:10, in:50, u:'mg', bag:'50 mL 5% dextrose'},
        {l:'12.5 mg in 250 mL D5W → 50 mcg/mL', amt:12.5, in:250, u:'mg', bag:'250 mL 5% dextrose'}],
  fx:[{s:'2.5 mg/mL', c:2.5, u:'mg', p:'5 mL vial (12.5 mg)', b:'Simdax (Abbott), Levosimendan (Intas/Aurobindo), Levosim', r:'IV-inf', hl:1}],
  admin:'Load 6–12 mcg/kg over 10 min (omit if SBP <100), then 0.05–0.2 mcg/kg/min for 24 h. Haemodynamic effect persists 7–10 days (active metabolite OR-1896).',
  dil:'Dilute in 5% dextrose only.',
  warn:['Hypotension, headache, hypokalaemia — monitor K⁺ and BP closely.','Long half-life of the metabolite: effects and toxicity continue after the infusion is stopped.'],
  ref:['ISCCM-HF','ESC-HF','BNF'] });

R({ id:'terlipressin', n:'Terlipressin', sys:'vasoactive', cls:'Vasopressin V1 agonist (prodrug of lysine-vasopressin)',
  ind:'Hepatorenal syndrome, acute variceal bleed, refractory vasodilatory shock (noradrenaline-sparing)', pop:'adult', risk:4,
  d:{t:'mg', lo:1, hi:2, cap:2, rep:'variceal bleed/HRS: 1–2 mg IV every 4–6 h; shock infusion 2–4 mg/24 h'},
  fx:[{s:'0.2 mg/mL', c:0.2, u:'mg', p:'1 mL ampoule (200 mcg) ready-to-use', b:'Remestyp (Sanofi India)', r:'IV', hl:1},
      {s:'1 mg lyophilised vial', c:1, u:'mg', p:'1 mL vial reconstituted → 1 mg/mL', b:'Terlyp (Samarth), Terlip (Intas)', r:'IV', prep:'Reconstitute 1 mg with 1 mL NS → 1 mg/mL'},
      {s:'0.5 mg lyophilised vial', c:0.5, u:'mg', p:'1 mL vial reconstituted → 0.5 mg/mL', b:'Terlyp 0.5 mg (Samarth)', r:'IV', prep:'Reconstitute 0.5 mg with 1 mL NS'},
      {s:'1 mg/5 mL ready-to-use', c:0.2, u:'mg', p:'5 mL ampoule', b:'Terlip 1 mg/5 mL (Intas)', r:'IV'}],
  admin:'HRS: 1 mg IV every 6 h × 5 days, increase to 2 mg every 4 h if creatinine falls <25%; combine with albumin 20–40 g/day. Variceal bleed: 2 mg every 4 h × 5 days then 1 mg every 4 h. Shock: infusion 2–4 mg/24 h.',
  dil:'Give as slow IV bolus over 2 min or as infusion in NS.',
  warn:['Peripheral and splanchnic ischaemia — abdominal pain, diarrhoea, digital cyanosis, myocardial ischaemia.','Hyponatraemia: monitor Na⁺ every 6–12 h.','Contraindicated in pregnancy (uterine vasoconstriction), severe ischaemic heart disease, peripheral arterial disease.'],
  ref:['ISCCM-LIVER','AASLD-VARICEAL','MARINO'] });

R({ id:'phenylephrine', n:'Phenylephrine', sys:'vasoactive', cls:'Selective α1 agonist',
  ind:'Anaesthesia-related and vasodilatory hypotension; shock when tachyarrhythmia limits other pressors', pop:'adult', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:0.1, hi:2},
  diln:[{l:'50 mg in 50 mL NS → 1 mg/mL (1000 mcg/mL)', amt:50, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'10 mg in 100 mL NS → 100 mcg/mL', amt:10, in:100, u:'mg', bag:'100 mL 0.9% NaCl'}],
  fx:[{s:'10 mg/mL (1%)', c:10, u:'mg', p:'1 mL ampoule (10 mg)', b:'Phenylephrine IP — Neon, Vins, Samarth', r:'IV', hl:1}],
  admin:'Bolus 50–100 mcg IV every 1–2 min (dilute to 100 mcg/mL). Infusion 0.1–2 mcg/kg/min titrated to BP.',
  dil:'MUST be diluted for IV use — never inject the 10 mg/mL ampoule directly.',
  warn:['Pure vasoconstriction → reflex bradycardia and reduced cardiac output.','Extravasation necrosis; central line preferred for infusion.','10-fold dilution error is a recognised cause of hypertensive crisis — label the syringe concentration.'],
  ref:['BNF','MARINO'] });

R({ id:'ephedrine', n:'Ephedrine', sys:'vasoactive', cls:'Indirect + direct α/β sympathomimetic',
  ind:'Acute hypotension during anaesthesia/spinal block; bradycardia with hypotension', pop:'all', risk:3,
  d:{t:'mg', lo:5, hi:10, cap:30, rep:'repeat every 3–5 min; max cumulative ≈50 mg (or 30 mg per hour)'},
  fx:[{s:'30 mg/mL', c:30, u:'mg', p:'1 mL ampoule', b:'Ephedrine IP — Neon, Samarth, Vins', r:'IV/IM/SC', hl:1},
      {s:'50 mg/mL', c:50, u:'mg', p:'1 mL ampoule (some brands)', b:'Ephedrine Sulphate 50 mg/mL', r:'IV/IM'}],
  admin:'Dilute 30 mg in 9 mL NS → 3 mg/mL. Give 5–10 mg (1.7–3.3 mL) IV over 1 min, repeat q3–5 min.',
  dil:'Dilute to 3 mg/mL or 5 mg/mL for titration; paediatric dilution 30 mg in 30 mL → 1 mg/mL.',
  warn:['Tachyphylaxis after repeated doses.','Tachyarrhythmia, hypertension, increased myocardial oxygen demand.','Avoid with halothane and in ischaemic heart disease.'],
  notes:['Paediatric dose 0.1 mg/kg IV (max 10 mg per dose).'],
  ref:['BNF','BNFC','MORGAN','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'mephentermine', n:'Mephentermine', sys:'vasoactive', cls:'Indirect-acting sympathomimetic (α/β)',
  ind:'Acute hypotension — widely used Indian ICU/theatre pressor; spinal anaesthesia hypotension', pop:'adult', risk:3,
  d:{t:'mg', lo:15, hi:30, cap:45, rep:'repeat as needed; infusion 30 mg in 500 mL NS titrated'},
  fx:[{s:'15 mg/mL', c:15, u:'mg', p:'1 mL ampoule (15 mg)', b:'Mephentermine Sulphate IP — Neon, Vins, Samarth; Wyamine', r:'IV/IM/SC', hl:1}],
  admin:'IV 15–30 mg slowly over 1–2 min (may dilute 15 mg in 10 mL NS); IM 30–45 mg. Infusion: 30 mg in 500 mL NS (60 mcg/mL), titrate 15–60 mL/h.',
  dil:'Compatible with NS and D5W.',
  warn:['Less predictable than noradrenaline — not recommended as first-line in septic shock where noradrenaline is available.','Tachycardia, arrhythmia, hypertension.','Do not mix with MAO inhibitors (hypertensive crisis).'],
  ref:['BNF','IP-COMPENDIUM'] });

R({ id:'isoprenaline', n:'Isoprenaline (Isoproterenol)', sys:'vasoactive', cls:'Non-selective β1/β2 agonist',
  ind:'Temporary chemical pacing — symptomatic bradycardia/heart block awaiting a pacemaker; torsades with bradycardia', pop:'adult', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.01, hi:0.1},
  diln:[{l:'1 mg in 250 mL D5W → 4 mcg/mL', amt:1, in:250, u:'mg', bag:'250 mL 5% dextrose'},
        {l:'2 mg in 50 mL D5W → 40 mcg/mL (syringe pump)', amt:2, in:50, u:'mg', bag:'50 mL 5% dextrose'}],
  fx:[{s:'200 mcg/mL (1 mg/5 mL)', c:200, u:'mcg', p:'5 mL ampoule (1 mg) — availability intermittent in India', b:'Isoprenaline IP — Neon/Samarth (supply variable)', r:'IV-inf', hl:1}],
  admin:'Infuse 2–10 mcg/min (adult) titrated to HR 60–90/min. Paediatric 0.05–0.1 mcg/kg/min.',
  dil:'Dilute in D5W; protect from light.',
  warn:['Increases myocardial oxygen demand — avoid in ischaemic heart disease; can precipitate VT/VF.','Pure β-agonist: vasodilation may worsen hypotension.','Atropine + pacing remain first-line for symptomatic bradycardia.'],
  ref:['AHA2025','BNF','MARINO'] });

R({ id:'hydrocort-shock', n:'Hydrocortisone (stress-dose steroid)', sys:'vasoactive', cls:'Glucocorticoid with mineralocorticoid activity',
  ind:'Refractory septic shock (noradrenaline ≥0.25 mcg/kg/min for >6 h), adrenal crisis, suspected adrenal insufficiency', pop:'adult', risk:3,
  d:{t:'mg', v:50, cap:200, capDay:200, rep:'every 6 h (total 200 mg/24 h) — or 200 mg/day continuous infusion'},
  fx:[{s:'100 mg vial (as sodium succinate)', c:50, u:'mg', p:'100 mg vial; reconstitute with 2 mL WFI → 50 mg/mL', b:'Hydrocort (Samarth), Solu-Cortef (Pfizer), Efcorlin (Abbott), Cortisone', r:'IV/IM', hl:1, prep:'Reconstitute 100 mg vial with 2 mL WFI → 50 mg/mL'},
      {s:'25 mg/mL', c:25, u:'mg', p:'2 mL ampoule (50 mg)', b:'Hydrocortisone Sodium Succinate 50 mg/mL', r:'IV/IM'}],
  admin:'50 mg IV every 6 h (or 200 mg/24 h as a continuous infusion in 50 mL NS at 2 mL/h). Continue 5–7 days then taper.',
  dil:'Reconstituted solution is stable 24 h at room temperature; dilute in NS or D5W for infusion.',
  warn:['Hyperglycaemia, hypokalaemia, hypernatraemia, secondary infection, myopathy, delirium.','Do NOT use routinely in shock that is responsive to low-dose vasopressor.','Take a random cortisol/ACTH before the first dose if adrenal insufficiency is suspected — but do not delay treatment.'],
  notes:['Adrenal crisis: 100 mg IV bolus then 200 mg/24 h continuous + aggressive saline.'],
  ref:['SSC2021','ISCCM-SEP','BNF'] });

R({ id:'hydrocort-shock-pd', n:'Hydrocortisone (stress-dose steroid)', sys:'vasoactive', cls:'Glucocorticoid',
  ind:'Paediatric vasopressor-refractory septic shock; adrenal crisis; suspected CAH', pop:'paed', risk:3,
  d:{t:'mgkg', v:2, cap:50, capDay:200, rep:'every 6 h'},
  fx:[{s:'100 mg vial', c:50, u:'mg', p:'reconstitute 100 mg in 2 mL WFI → 50 mg/mL', b:'Hydrocort (Samarth), Solu-Cortef', r:'IV/IM', hl:1, prep:'Reconstitute with 2 mL WFI → 50 mg/mL'},
      {s:'25 mg/mL', c:25, u:'mg', p:'2 mL ampoule (50 mg)', b:'Hydrocortisone Sodium Succinate', r:'IV/IM'}],
  admin:'2 mg/kg/dose IV every 6 h (max 50 mg/dose). Adrenal crisis: 50 mg/m² (or 2 mg/kg) IV stat then 25–30 mg/m²/24 h divided 4–6 hourly.',
  dil:'Reconstitute and dilute in NS/D5W. For neonates use the preservative-free presentation where possible.',
  warn:['Hyperglycaemia, hypertension, immunosuppression, GI bleeding.','Avoid prolonged use in children — growth suppression.'],
  ref:['SSC2021-PEDS','BNFC','IAP-EM','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });
