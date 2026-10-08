/* =====================================================================
   PART 3 — SEDATION · ANALGESIA · INDUCTION AGENTS · NMBA & REVERSAL
            SEIZURES / STATUS EPILEPTICUS · NEUROCRITICAL CARE
   ===================================================================== */

/* ================= INDUCTION / RSI ================= */
R({ id:'propofol-induction', n:'Propofol', sys:'sedation', cls:'Alkylphenol GABA-A agonist — IV induction agent',
  ind:'Rapid-sequence and elective induction of anaesthesia, procedural sedation', pop:'adult', risk:4,
  d:{t:'mgkg', lo:1.5, hi:2.5, cap:250, rep:'titrate in 10–20 mg increments'},
  fx:[{s:'10 mg/mL (1%)', c:10, u:'mg', p:'20 mL ampoule (200 mg), 50 mL vial (500 mg), 100 mL vial', b:'Propofol (Neon), Recofol (Fresenius), Propovan (Cipla), Anepol, Diprivan (AstraZeneca)', r:'IV', hl:1},
      {s:'20 mg/mL (2%)', c:20, u:'mg', p:'50 mL vial (1 g), 100 mL vial', b:'Propofol 2% (Neon/Fresenius), Propofol-Lipuro 2%', r:'IV-inf'}],
  admin:'1.5–2.5 mg/kg IV over 20–30 s in the healthy adult. REDUCE to 0.5–1 mg/kg (or omit) in shock, sepsis, severe hypovolaemia, heart failure and the elderly — propofol causes profound vasoplegia and myocardial depression.',
  dil:'Ready to use. Do not dilute below 2 mg/mL. May be diluted with 5% dextrose only (NS causes instability of the emulsion at low concentration).',
  warn:['Contraindicated in egg/soy allergy, disorders of fat metabolism, and for ICU sedation in children <16 years.','MILK OF DEATH: propofol-related infusion syndrome (PRIS) — metabolic acidosis, rhabdomyolysis, hyperkalaemia, lipaemia, renal failure, cardiac failure. Risk rises above 4 mg/kg/h for >48 h.','Strict asepsis — lipid emulsion supports bacterial growth. Discard 6–12 h after opening (follow the product insert); never re-use a syringe between patients.','Pain on injection — pre-treat with 1% lidocaine 20–40 mg or use a large vein.'],
  ref:['MORGAN','BNF','ISCCM-SEDATION'] });

R({ id:'propofol-sedation', n:'Propofol — ICU sedation infusion', sys:'sedation', cls:'GABA-A agonist',
  ind:'Mechanical ventilation sedation in adults (short-acting, rapid wake-up, neuro-ICU preferred)', pop:'adult', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:5, hi:67},
  diln:[{l:'1000 mg in 50 mL (2%) → 20 mg/mL (20,000 mcg/mL) syringe pump — STANDARD', amt:1000, in:50, u:'mg', bag:'50 mL of the 2% presentation'},
        {l:'500 mg in 50 mL (1%) → 10 mg/mL', amt:500, in:50, u:'mg', bag:'50 mL of the 1% presentation'}],
  fx:[{s:'20 mg/mL (2%)', c:20, u:'mg', p:'50 mL vial (1 g)', b:'Propofol 2% (Neon/Fresenius), Propofol-Lipuro', r:'IV-inf', hl:1},
      {s:'10 mg/mL (1%)', c:10, u:'mg', p:'50 mL vial (500 mg), 100 mL vial', b:'Propofol (Neon), Recofol, Diprivan', r:'IV-inf'}],
  admin:'5–67 mcg/kg/min (=0.3–4 mg/kg/h). Load 0.25–1 mg/kg if needed, then titrate to RASS −2 to 0. Do NOT exceed 4 mg/kg/h (67 mcg/kg/min) and do not continue >48 h at high dose without lipid, CK, lactate, triglyceride and ABG monitoring.',
  dil:'Use the 2% presentation in a syringe pump to limit lipid load (propofol provides 1.1 kcal/mL).',
  warn:['PRIS risk — check CK, triglycerides, lactate, base deficit and ECG daily; stop for unexplained acidosis, arrhythmia or rhabdomyolysis.','Contributes 0.1 g/kg/day of lipid — reduce parenteral nutrition fat accordingly.','Hypotension and bradycardia; avoid in haemodynamically unstable patients without vasopressor cover.','Contraindicated for sedation in children <16 years (PRIS).'],
  ref:['ISCCM-SEDATION','PADIS2018','BNF'] });

R({ id:'propofol-paed', n:'Propofol — paediatric induction', sys:'sedation', cls:'GABA-A agonist',
  ind:'Induction of anaesthesia in children >1 month (NOT for ICU sedation)', pop:'paed', minAge:0.08, risk:4,
  d:{t:'mgkg', lo:2.5, hi:3.5, cap:200},
  fx:[{s:'10 mg/mL (1%)', c:10, u:'mg', p:'20 mL ampoule (200 mg)', b:'Propofol (Neon), Recofol', r:'IV', hl:1}],
  admin:'2.5–3.5 mg/kg IV over 20–30 s in healthy children (reduce to 1–2 mg/kg in shock, on inotropes, or with concurrent opioid).',
  dil:'Use the 1% presentation only.',
  warn:['CONTRAINDICATED for ICU sedation in children <16 years — PRIS is frequently fatal.','Not licensed <1 month of age.','Pain on injection; use lignocaine 1 mg/kg or a large vein.'],
  ref:['MORGAN','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'etomidate', n:'Etomidate', sys:'sedation', cls:'Imidazole GABA-A agonist — cardio-stable induction agent',
  ind:'RSI induction in shock, sepsis, trauma, cardiac tamponade, haemodynamic instability', pop:'adult', risk:3,
  d:{t:'mgkg', lo:0.2, hi:0.3, cap:40},
  fx:[{s:'2 mg/mL', c:2, u:'mg', p:'10 mL ampoule (20 mg)', b:'Etomidate (Neon/Intas), Hypnomidate (J&J), Etomidate-Lipuro (B Braun)', r:'IV', hl:1}],
  admin:'0.2–0.3 mg/kg IV over 30–60 s (reduce to 0.1–0.15 mg/kg in shock/sepsis and the elderly). Onset 30–60 s, duration 5–15 min.',
  dil:'Ready to use — propylene-glycol vehicle (lipuro formulation is lipid-based and less painful).',
  warn:['Single-bolus reversible adrenocortical suppression (11-β-hydroxylase inhibition) lasting 12–24 h — avoid repeated boluses or infusion.','Myoclonus in 30–60% — pre-treat with fentanyl 1–2 mcg/kg or a small dose of a benzodiazepine.','Pain on injection; no analgesic effect — always co-administer an opioid.'],
  notes:['Despite adrenal suppression, single-dose etomidate has NOT been shown to increase mortality in septic shock and remains the preferred agent when haemodynamics are critical.'],
  ref:['MORGAN','TINTINALLI','ISCCM-INTUBATION'] });

R({ id:'etomidate-paed', n:'Etomidate — paediatric induction', sys:'sedation', cls:'GABA-A agonist',
  ind:'Haemodynamically unstable paediatric RSI', pop:'paed', risk:3,
  d:{t:'mgkg', lo:0.2, hi:0.3, cap:20},
  fx:[{s:'2 mg/mL', c:2, u:'mg', p:'10 mL ampoule (20 mg)', b:'Etomidate (Neon), Etomidate-Lipuro', r:'IV', hl:1}],
  admin:'0.2–0.3 mg/kg IV over 30–60 s; reduce to 0.1–0.2 mg/kg in shock.',
  dil:'Ready to use. Draw up in a 5 mL syringe for accuracy.',
  warn:['Adrenocortical suppression — avoid in septic shock where alternatives exist (ketamine).','Myoclonus; no analgesia.'],
  ref:['MORGAN','BNFC','APLS','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'ketamine-induction', n:'Ketamine', sys:'sedation', cls:'NMDA-receptor antagonist — dissociative anaesthetic with sympathomimetic properties',
  ind:'RSI in shock/asthma/trauma, procedural sedation, severe pain, agitated delirium, refractory bronchospasm', pop:'all', risk:3,
  d:{t:'mgkg', lo:1, hi:2, cap:150},
  fx:[{s:'50 mg/mL', c:50, u:'mg', p:'10 mL vial (500 mg)', b:'Ketamine IP — Neon, Ketalar (Pfizer), Ketmine (Themis)', r:'IV/IM/PO', hl:1},
      {s:'10 mg/mL', c:10, u:'mg', p:'10 mL ampoule (100 mg)', b:'Ketamine 10 mg/mL — Neon/Vamcare', r:'IV/IM'},
      {s:'100 mg/mL', c:100, u:'mg', p:'10 mL vial (1 g)', b:'Ketamine 100 mg/mL', r:'IV/IM'}],
  admin:'IV induction 1–2 mg/kg over 30–60 s (0.5–1 mg/kg in shock/catecholamine-depleted patients). IM induction 4–5 mg/kg. Analgesia 0.1–0.5 mg/kg IV; infusion 5–20 mcg/kg/min (0.3–1.2 mg/kg/h). Bronchodilation: 1–2 mg/kg IV then infusion.',
  dil:'May be diluted in NS or D5W to 10 mg/mL for accurate small-volume dosing.',
  warn:['Emergence phenomena (hallucinations, delirium) — co-administer midazolam 0.02–0.05 mg/kg or propofol.','Raises ICP, intra-ocular pressure, BP and HR — avoid in severe hypertension, aneurysm, raised ICP without controlled ventilation.','Hypersalivation — give glycopyrrolate 0.004 mg/kg or atropine 0.02 mg/kg.','Laryngospasm; respiratory drive is usually preserved but airway reflexes are unreliable — have suction and airway equipment ready.'],
  ref:['MORGAN','ISCCM-INTUBATION','TINTINALLI','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'thiopentone', n:'Thiopentone sodium', sys:'sedation', cls:'Barbiturate GABA-A agonist',
  ind:'Induction (where propofol unsuitable), refractory status epilepticus, refractory raised ICP / barbiturate coma', pop:'all', risk:4, inf:true,
  d:{t:'mgkg', lo:3, hi:5, cap:500},
  diln:[{l:'2 g in 50 mL → 40 mg/mL (2.5%–4% syringe pump)', amt:2, in:50, u:'g', bag:'50 mL 0.9% NaCl'},
        {l:'1 g in 40 mL → 25 mg/mL (2.5%)', amt:1, in:40, u:'g', bag:'40 mL WFI or NS'}],
  fx:[{s:'500 mg vial', c:25, u:'mg', p:'vial reconstituted to 2.5% (25 mg/mL) with 20 mL WFI', b:'Thiopentone IP — Neon, Pentothal (Abbott), Thiopentax', r:'IV', hl:1, prep:'Reconstitute 500 mg with 20 mL sterile WFI → 2.5% (25 mg/mL)'},
      {s:'1 g vial', c:25, u:'mg', p:'vial reconstituted to 2.5% with 40 mL WFI', b:'Thiopentone 1 g vial', r:'IV', prep:'Reconstitute 1 g with 40 mL WFI → 2.5% (25 mg/mL)'}],
  admin:'Induction 3–5 mg/kg IV over 30–60 s (1–2 mg/kg in shock). Refractory status/ICP: load 3–5 mg/kg (up to 10 mg/kg) then infusion 1–5 mg/kg/h titrated to burst suppression on EEG. Maintenance 0.5–3 mg/kg/h.',
  dil:'Reconstituted 2.5% solution is stable 24 h refrigerated. INCOMPATIBLE with acidic solutions (RL, dextrose) — use NS or WFI only.',
  warn:['INTRA-ARTERIAL INJECTION causes vasospasm, gangrene and limb loss — if it occurs: leave the cannula in, inject lignocaine or papaverine, give heparin, obtain urgent vascular/sympathetic block.','Extravasation → tissue necrosis (alkaline pH 10.5).','Myocardial depression, profound vasodilation, histamine release — avoid in shock, asthma and heart failure.','Cumulative elimination (long context-sensitive half-time) — prolonged coma after >48 h infusion.'],
  ref:['MORGAN','NCS-STATUS','MARINO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ================= ICU SEDATION & ANALGESIA INFUSIONS ================= */
R({ id:'midazolam-bolus', n:'Midazolam', sys:'sedation', cls:'Short-acting benzodiazepine (GABA-A)',
  ind:'Procedural sedation, premedication, seizures, ICU sedation bolus, RSI adjunct', pop:'all', risk:3,
  d:{t:'mgkg', lo:0.02, hi:0.1, cap:5, rep:'titrate in 0.5–1 mg increments every 2 min'},
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'1 mL ampoule (5 mg), 2 mL (10 mg), 3 mL (15 mg)', b:'Midanium (Abbott/Neon), Mezapam (Intas), Midfast, Hypnova 1 mg/mL, Dormicum (Roche)', r:'IV/IM/PO/PR/IN', hl:1},
      {s:'1 mg/mL', c:1, u:'mg', p:'5 mL vial (5 mg), 10 mL vial (10 mg)', b:'Hypnova (Fresenius), Midazolam 1 mg/mL', r:'IV/IM'},
      {s:'2 mg/mL oral syrup', c:2, u:'mg', p:'30 mL bottle', b:'Mezapam syrup, Midazolam oral solution (limited)', r:'PO', own:{kg:0.5,u:'mg',cap:20,l:'ORAL premedication 0.5 mg/kg (max 20 mg) 30–60 min before a procedure. Buccal/intranasal for seizures: 0.2–0.5 mg/kg (max 10 mg).'}},
      {s:'7.5 mg tablet', c:7.5, u:'mg', p:'strip', b:'Midazolam tabs (limited availability in India)', r:'PO', own:{lo:7.5,hi:15,u:'mg',l:'ORAL premedication 7.5–15 mg PO the night before / 1 h before a procedure (adult). Not for seizure control.'}}],
  admin:'Sedation/procedure: 0.02–0.1 mg/kg IV (adult usual 1–2.5 mg, max 5 mg) titrated every 2 min. Seizures: 0.15–0.2 mg/kg IV (max 10 mg). Premedication PO 0.5 mg/kg (max 20 mg). IM 0.07–0.1 mg/kg.',
  dil:'For small children dilute the 5 mg/mL ampoule to 1 mg/mL (5 mg + 4 mL NS) — a 1 mL syringe then gives 0.1 mL per 0.1 mg.',
  warn:['Respiratory depression and apnoea — monitor SpO₂ and have flumazenil and bag-mask ventilation available.','Paradoxical agitation in children and the elderly.','Accumulation in renal/hepatic failure and prolonged ICU infusion → delayed awakening.','Flumazenil reverses sedation but ALSO reverses seizure protection — use with extreme caution in chronic benzodiazepine users and mixed overdoses.'],
  ref:['ISCCM-SEDATION','PADIS2018','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'midazolam-inf', n:'Midazolam — ICU sedation infusion', sys:'sedation', cls:'Benzodiazepine',
  ind:'Continuous sedation for mechanical ventilation (preferred in renal/hepatic impairment, alcohol withdrawal, status epilepticus)', pop:'all', risk:3, inf:true,
  d:{t:'mcgkgmin', lo:0.5, hi:5},
  diln:[{l:'100 mg in 50 mL NS → 2 mg/mL (standard syringe)', amt:100, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'50 mg in 50 mL NS → 1 mg/mL', amt:50, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'200 mg in 100 mL → 2 mg/mL', amt:200, in:100, u:'mg', bag:'100 mL 0.9% NaCl'}],
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'3 mL ampoule (15 mg) × several', b:'Midanium (Abbott/Neon), Mezapam (Intas), Hypnova', r:'IV-inf', hl:1},
      {s:'1 mg/mL', c:1, u:'mg', p:'100 mL bag premix (some centres)', b:'Midazolam premix', r:'IV-inf'}],
  admin:'Loading 0.03–0.1 mg/kg, then 0.5–5 mcg/kg/min (0.03–0.3 mg/kg/h; adult typical 1–5 mg/h). Titrate to RASS −2 to 0 with daily interruption.',
  dil:'Compatible with NS and D5W.',
  warn:['Propylene glycol toxicity with high-dose prolonged infusion: metabolic acidosis, hyperosmolality, AKI — monitor the osmolal gap.','Tolerance within 24–72 h; accumulation causes prolonged sedation.','Daily sedation interruption and spontaneous awakening trials reduce ventilator days.'],
  ref:['ISCCM-SEDATION','PADIS2018','MARINO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'dexmedetomidine', n:'Dexmedetomidine', sys:'sedation', cls:'Highly selective central α2 agonist',
  ind:'Cooperative ("arousable") sedation, weaning from ventilator, delirium, alcohol withdrawal, awake fiberoptic intubation', pop:'adult', risk:4, inf:true,
  d:{t:'mcgkghr', lo:0.2, hi:1.5},
  diln:[{l:'400 mcg in 100 mL NS → 4 mcg/mL (STANDARD: 1 mL/h ≈ 4 mcg/h)', amt:400, in:100, u:'mcg', bag:'100 mL 0.9% NaCl'},
        {l:'200 mcg in 50 mL NS → 4 mcg/mL', amt:200, in:50, u:'mcg', bag:'50 mL 0.9% NaCl'},
        {l:'800 mcg in 100 mL NS → 8 mcg/mL (fluid-restricted)', amt:800, in:100, u:'mcg', bag:'100 mL 0.9% NaCl'}],
  fx:[{s:'100 mcg/mL', c:100, u:'mcg', p:'2 mL ampoule (200 mcg), 10 mL vial (1000 mcg)', b:'Dexmed (Intas), Precedex (Hospira/Abbott), Dexmedetomidine (Neon), Precedent', r:'IV-inf', hl:1}],
  admin:'Loading 1 mcg/kg IV over 10 min (OMIT the load in shock, elderly, severe bradycardia or on β-blockers), then 0.2–1.5 mcg/kg/h; usual ICU range 0.2–0.7 mcg/kg/h.',
  dil:'Dilute to 4 mcg/mL — this makes 1 mL/h ≈ 0.04 mcg/kg/h in a 100-kg patient and is easy to titrate.',
  warn:['Bradycardia and hypotension — hold if HR <50 or SBP <90; treat with atropine/glycopyrrolate and fluids.','Avoid in second-/third-degree AV block, severe LV dysfunction, and advanced age with frailty.','No respiratory depression — uniquely useful for extubation and NIV.','Withdrawal/hypertension after prolonged high-dose use — taper.'],
  ref:['ISCCM-SEDATION','PADIS2018','BNF'] });

R({ id:'fentanyl-bolus', n:'Fentanyl', sys:'sedation', cls:'Synthetic μ-opioid agonist (100× morphine potency)',
  ind:'ICU analgesia (first-line), procedural sedation, RSI adjunct, cardiac surgery', pop:'all', risk:4,
  d:{t:'mcgkg', lo:1, hi:2, cap:200, rep:'every 30–60 min as needed'},
  fx:[{s:'50 mcg/mL', c:50, u:'mcg', p:'2 mL ampoule (100 mcg), 5 mL (250 mcg), 10 mL (500 mcg)', b:'Fentanyl Citrate IP — Vamcare, Neon; Fentaxyl (Cipla), Fentanyl (Troikaa)', r:'IV/IM/SC/IT/EP', hl:1},
      {s:'100 mcg transdermal patch', c:100, u:'mcg', p:'patch (12.5/25/50/75/100 mcg/h)', b:'Fentanyl TTS (Cipla), Durogesic', r:'TD', own:{text:'Transdermal patch 100 mcg/h (also 12.5, 25, 50, 75 mcg/h) — for STABLE opioid-tolerant chronic pain only. Onset takes 12–24 h, so it is useless for acute pain. Remove it and cool the skin in any patient with fever or heat exposure (absorption rises sharply).'}},
      {s:'2 mcg/mL buccal/sublingual (limited)', c:2, u:'mcg', p:'lozenge/spray — import', b:'Actiq, Abstral (limited availability)', r:'SL', own:{text:'Buccal/sublingual fentanyl is for breakthrough cancer pain in opioid-tolerant patients only, at individually titrated doses (100–800 mcg). It is NOT interchangeable with the IV dose.'}}],
  admin:'Analgesia 1–2 mcg/kg IV over 1–2 min; induction 2–10 mcg/kg; cardiac surgery up to 50 mcg/kg. Repeat every 30–60 min or run an infusion.',
  dil:'For neonates/infants dilute to 10 mcg/mL (1 mL + 4 mL NS) for accurate measurement.',
  warn:['Chest-wall rigidity ("wooden chest") with rapid large boluses — reversed by a neuromuscular blocker.','Respiratory depression without sedation; delayed re-narcotisation after high dose.','No histamine release (advantage over morphine in shock and asthma).','Accumulation with prolonged infusion (context-sensitive half-time 4 h after 4 h infusion).'],
  ref:['ISCCM-SEDATION','PADIS2018','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'fentanyl-inf', n:'Fentanyl — infusion', sys:'sedation', cls:'μ-opioid agonist',
  ind:'Continuous ICU analgesia', pop:'all', risk:4, inf:true,
  d:{t:'mcgkghr', lo:1, hi:3},
  diln:[{l:'2500 mcg in 50 mL NS → 50 mcg/mL (standard syringe)', amt:2500, in:50, u:'mcg', bag:'50 mL 0.9% NaCl'},
        {l:'500 mcg in 50 mL NS → 10 mcg/mL (paediatric/neonatal)', amt:500, in:50, u:'mcg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'50 mcg/mL', c:50, u:'mcg', p:'10 mL ampoule (500 mcg) × 5', b:'Fentanyl Citrate IP — Vamcare, Neon, Fentaxyl', r:'IV-inf', hl:1}],
  admin:'Adult 1–3 mcg/kg/h (25–200 mcg/h). Paediatric 1–3 mcg/kg/h. Neonate 0.5–2 mcg/kg/h.',
  dil:'Compatible with NS and D5W; adsorbs onto PVC — use polyolefin/PVC-free tubing for long infusions.',
  warn:['Monitor with a validated pain/sedation score (CPOT, BPS, RASS) — opioids alone do not provide sedation.','Tolerance, dependence and withdrawal (iatrogenic withdrawal syndrome) after >5 days — wean over days to weeks.','Chest-wall rigidity; respiratory depression after weaning.'],
  ref:['ISCCM-SEDATION','PADIS2018','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'morphine-bolus', n:'Morphine sulfate', sys:'sedation', cls:'Natural μ-opioid agonist',
  ind:'Severe pain, acute pulmonary oedema, palliative dyspnoea, sickle-cell crisis', pop:'all', risk:4,
  d:{t:'mgkg', lo:0.05, hi:0.1, cap:10, rep:'every 2–4 h as needed'},
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'1 mL ampoule (10 mg), 2 mL (20 mg)', b:'Morphine Sulphate IP — Vamcare, Neon, Saraca; Morphine (RPG)', r:'IV/IM/SC/PO/PR/EP', hl:1},
      {s:'30 mg/mL (preservative-free, limited)', c:30, u:'mg', p:'1 mL ampoule', b:'Morphine 30 mg/mL — limited availability', r:'IV/SC'},
      {s:'10 mg / 30 mg extended-release tablet', c:10, u:'mg', p:'strip of 10', b:'Morphine ER (limited availability in India)', r:'PO', own:{lo:10,hi:30,u:'mg',l:'Extended-release morphine 10–30 mg PO 12-hourly for established, opioid-tolerant pain. NEVER crush or split an ER tablet, and never use it for acute ICU pain.'}},
      {s:'20 mg/mL oral solution', c:20, u:'mg', p:'30 mL bottle — restricted distribution', b:'Morphine oral solution (de-addiction centres/palliative)', r:'PO', own:{kgLo:0.1,kgHi:0.2,u:'mg',l:'Immediate-release oral solution 0.1–0.2 mg/kg (adult 5–20 mg) PO 4-hourly. The oral dose is roughly 3× the IV dose because of first-pass metabolism.'}}],
  admin:'0.05–0.1 mg/kg IV (adult usual 2–10 mg) over 4–5 min, diluted to 1 mg/mL. SC/IM 0.1–0.2 mg/kg 4-hourly.',
  dil:'DILUTE before IV injection — undiluted 10 mg/mL morphine given rapidly causes histamine release and hypotension.',
  warn:['Histamine release → vasodilation, hypotension, bronchospasm — AVOID in shock and asthma (fentanyl is preferred).','Active metabolite morphine-6-glucuronide accumulates in renal failure → prolonged sedation and respiratory depression; reduce dose or switch to fentanyl.','NDPS-controlled substance — record and witness every draw-up and disposal.','Naloxone is the antidote: titrate 40–80 mcg IV every 2 min rather than a large bolus, to reverse respiratory depression without precipitating crisis or pulmonary oedema.'],
  ref:['ISCCM-SEDATION','WHO-PALLIATIVE','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'morphine-inf', n:'Morphine — infusion', sys:'sedation', cls:'μ-opioid agonist',
  ind:'Continuous analgesia, palliative care, sickle-cell crisis', pop:'all', risk:4, inf:true,
  d:{t:'mcgkghr', lo:10, hi:40},
  diln:[{l:'100 mg in 100 mL NS → 1 mg/mL (standard syringe)', amt:100, in:100, u:'mg', bag:'100 mL 0.9% NaCl'},
        {l:'50 mg in 50 mL NS → 1 mg/mL', amt:50, in:50, u:'mg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'1 mL ampoule (10 mg) × 10', b:'Morphine Sulphate IP — Vamcare, Neon', r:'IV-inf', hl:1}],
  admin:'Adult 10–40 mcg/kg/h (1–10 mg/h). Paediatric 10–40 mcg/kg/h. Titrate to a pain/sedation score.',
  dil:'Compatible with NS and D5W.',
  warn:['Renal failure: reduce by 50% or switch to fentanyl.','Monitor respiratory rate and sedation score at least hourly during titration.','Accumulation causes delayed respiratory depression after stopping.'],
  ref:['ISCCM-SEDATION','WHO-PALLIATIVE','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'paracetamol-iv', n:'Paracetamol (acetaminophen) IV', sys:'sedation', cls:'Central COX inhibitor / analgesic–antipyretic',
  ind:'Fever and mild–moderate pain in ICU; opioid-sparing analgesia', pop:'all', risk:2,
  d:{t:'mgkg', lo:10, hi:15, cap:1000, capDay:4000, rep:'every 6 h (max 4 doses/24 h)'},
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'100 mL infusion bottle (1 g) — ready to use', b:'Calpol IV (GSK), Perfalgan (BMS/import), Cetamol infusion, Paracetamol IP infusion (Intas/Fresenius/Neon)', r:'IV', hl:1}],
  admin:'Adult >50 kg: 1 g IV over 15 min every 6 h (max 4 g/24 h). Adult <50 kg or hepatic/renal impairment: 15 mg/kg IV q6 h (max 60 mg/kg/day, ≤3 g). Children >33 kg: 15 mg/kg q6 h. Infants 10–33 kg: 15 mg/kg q6 h (max 60 mg/kg/day).',
  dil:'Ready to use; may be further diluted 1:1 with NS or D5W for children.',
  warn:['Hepatotoxicity above 4 g/day (or 60 mg/kg/day) — enforce a maximum daily dose and audit cumulative intake including combination products.','Reduce dose in chronic alcoholism, malnutrition, fasting, dehydration and hepatic impairment.','Antidote is N-acetylcysteine — see the Toxicology section.','Prolonged regular use with poor intake is a common cause of iatrogenic paracetamol toxicity in Indian ICUs.'],
  ref:['BNF','BNFC','IAP-FEVER','MHRA-PARA','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'paracetamol-po', n:'Paracetamol (acetaminophen) — oral/rectal', sys:'sedation', cls:'Analgesic–antipyretic',
  ind:'Fever, mild–moderate pain — oral/NG or rectal route', pop:'all', risk:2,
  d:{t:'mgkg', lo:10, hi:15, cap:1000, capDay:4000, rep:'every 4–6 h; max 4 doses/24 h (60 mg/kg/day in children, 75 mg/kg/day in neonates ≤3 days)'},
  fx:[{s:'500 mg tablet', c:500, u:'mg', p:'strip of 15', b:'Crocin 500 (GSK), Dolo 650, Calpol 500, Pacimol 500', r:'PO', hl:1},
      {s:'650 mg tablet', c:650, u:'mg', p:'strip of 15', b:'Dolo 650 (Micro Labs), Crocin Advance', r:'PO'},
      {s:'120 mg/5 mL suspension', c:24, u:'mg', p:'60 mL bottle', b:'Calpol 120, Crocin 120, P-250 alternatives', r:'PO'},
      {s:'250 mg/5 mL suspension', c:50, u:'mg', p:'60 mL bottle', b:'Calpol 250, Meftal-P combo variants', r:'PO'},
      {s:'100 mg/mL infant drops', c:100, u:'mg', p:'15 mL bottle with dropper', b:'Calpol drops, Crocin drops, P-125 drops', r:'PO'},
      {s:'125 mg / 250 mg suppository', c:125, u:'mg', p:'strip of 5', b:'Paracetamol suppositories (limited availability in India)', r:'PR'}],
  admin:'Oral/NG 10–15 mg/kg per dose every 4–6 h. Maximum 60 mg/kg/day in children; 4 g/day (or 60 mg/kg/day) in adults.',
  dil:'Suspension must be shaken well — concentration differs between brands (24 mg/mL vs 50 mg/mL). ALWAYS check the bottle strength before calculating the volume.',
  warn:['Brand-strength confusion (120 mg/5 mL vs 250 mg/5 mL vs 100 mg/mL drops) is the single commonest cause of paediatric paracetamol overdose in India.','Do not combine with other paracetamol-containing products (many Indian cold/cough syrups and combination analgesics contain it).','Rectal bioavailability is ~60–70% — a higher dose (20–25 mg/kg) is needed but the interval should be ≥6 h.'],
  ref:['IAP-FEVER','BNFC','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'tramadol', n:'Tramadol', sys:'sedation', cls:'Weak μ-agonist + SNRI (dual-mechanism analgesic)',
  ind:'Moderate–severe pain; opioid-sparing post-operative analgesia', pop:'adult', risk:3,
  d:{t:'mgkg', lo:1, hi:1.5, cap:100, capDay:400, rep:'every 6–8 h (max 400 mg/24 h; 300 mg if >75 years)'},
  fx:[{s:'50 mg/mL', c:50, u:'mg', p:'1 mL ampoule (50 mg), 2 mL ampoule (100 mg)', b:'Tramazac (Alkem), Tramadol (Vamcare/Neon), Ultratram, Tramacef', r:'IV/IM/SC/PO', hl:1},
      {s:'50 mg capsule / 100 mg ER tablet', c:50, u:'mg', p:'strip of 10', b:'Ultracet, Tramazac ER, Ultratram 50', r:'PO'},
      {s:'50 mg/5 mL syrup', c:10, u:'mg', p:'30 mL bottle', b:'Tramadol syrup', r:'PO'},
      {s:'100 mg/mL drops', c:100, u:'mg', p:'10 mL bottle', b:'Tramazac drops', r:'PO'}],
  admin:'50–100 mg IV slowly over 2–3 min (or diluted in 100 mL NS over 15–30 min) every 6–8 h. Oral 50–100 mg 4–6 hourly.',
  dil:'Dilute 100 mg in 100 mL NS/D5W for slower infusion to reduce nausea.',
  warn:['SEIZURES — dose-related and synergistic with SSRIs, TCAs, antipsychotics, quinolones and tramadol overdose.','Serotonin syndrome with other serotonergic drugs; contraindicated with MAOIs.','Nausea/vomiting, dizziness, constipation; reduce dose in renal/hepatic impairment (CrCl <30: extend interval to 12 h).','CYP2D6 polymorphism (common in Indians) → variable analgesia and toxicity.'],
  ref:['BNF','WHO-ANALGESIC'] });

R({ id:'ketorolac', n:'Ketorolac', sys:'sedation', cls:'NSAID (non-selective COX inhibitor)',
  ind:'Short-term (<5 days) moderate–severe acute pain; renal colic; post-operative analgesia', pop:'adult', risk:4,
  d:{t:'mgkg', lo:0.5, hi:1, cap:30, capDay:120, rep:'every 6–8 h — MAXIMUM 5 DAYS TOTAL (all routes combined)'},
  fx:[{s:'30 mg/mL', c:30, u:'mg', p:'1 mL ampoule (30 mg)', b:'Ketorol (Mankind), Ketorolac (Intas/Cipla), Ketrose, Ketovolt', r:'IV/IM/PO', hl:1},
      {s:'10 mg/mL', c:10, u:'mg', p:'1 mL ampoule (10 mg)', b:'Ketorolac 10 mg/mL', r:'IV/IM'},
      {s:'10 mg tablet', c:10, u:'mg', p:'strip of 10', b:'Ketorol DT 10 mg', r:'PO/SL'}],
  admin:'Adult <65 yr ≥50 kg: 30 mg IV/IM every 6–8 h (max 120 mg/day). Age ≥65 yr, weight <50 kg, or raised creatinine: 15 mg every 6–8 h (max 60 mg/day). Oral continuation 10 mg q4–6 h to complete 5 days.',
  dil:'May be given undiluted IV over at least 15 s, or diluted in 50–100 mL NS over 30 min.',
  warn:['ABSOLUTE 5-DAY LIMIT (parenteral + oral combined) — beyond this, GI bleeding and AKI rise sharply.','Contraindicated in active pe ulceration/GI bleed, renal impairment (CrCl <30), hypovolaemia, coagulopathy, peri-operative CABG, and in labour/breastfeeding.','Avoid combining with other NSAIDs, anticoagulants, corticosteroids or SSRIs.','Acute kidney injury is common in the ICU — check creatinine daily.'],
  ref:['BNF','TINTINALLI'] });

R({ id:'haloperidol', n:'Haloperidol', sys:'sedation', cls:'Butyrophenone typical antipsychotic (D2 antagonist)',
  ind:'Hyperactive ICU delirium with risk of harm, agitation refractory to other measures, nausea/vomiting (low dose)', pop:'adult', risk:4,
  d:{t:'mg', lo:2.5, hi:5, cap:20, capDay:20, rep:'2.5–5 mg IV/IM every 4–6 h as needed'},
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'1 mL ampoule (5 mg)', b:'Serenace (Sun/RPG), Haloperidol (Abbott India), Haloper, Ludium', r:'IV/IM/PO', hl:1},
      {s:'2 mg/mL', c:2, u:'mg', p:'1 mL ampoule (2 mg)', b:'Haloperidol 2 mg/mL', r:'IV/IM'},
      {s:'0.5 / 1.5 / 5 mg tablets', c:5, u:'mg', p:'strip', b:'Serenace 0.5/1.5/5 mg, Haloper', r:'PO'},
      {s:'2 mg/mL oral solution', c:2, u:'mg', p:'30 mL bottle', b:'Haloperidol oral solution', r:'PO'}],
  admin:'Delirium/agitation: 0.05–0.1 mg/kg (2.5–5 mg) IV or IM, repeated every 4–6 h; max 20 mg/24 h. Antiemetic: 0.5–1 mg.',
  dil:'IV haloperidol should be given over 2–5 min with continuous ECG monitoring.',
  warn:['QT PROLONGATION and torsades de pointes — obtain a baseline ECG, check K⁺ and Mg²⁺, and stop if QTc >500 ms or it prolongs by >25%.','IV use is off-label in many jurisdictions but is standard ICU practice — requires continuous ECG.','Extrapyramidal reactions and acute dystonia (treat with benzhexol/promethazine), neuroleptic malignant syndrome.','Do NOT use for sedation of a mechanically ventilated patient — treat the underlying cause of delirium instead; haloperidol does not shorten delirium duration.','Avoid in Parkinson disease, Lewy body dementia, and with other QT-prolonging drugs.'],
  ref:['PADIS2018','ISCCM-DELIRIUM','BNF'] });

R({ id:'naloxone', n:'Naloxone', sys:'sedation', cls:'Competitive μ-opioid receptor antagonist',
  ind:'Opioid-induced respiratory depression and overdose', pop:'all', risk:4,
  d:{t:'mcgkg', lo:1, hi:2, cap:2000, rep:'repeat every 2–3 min until respiratory rate >12/min; then infusion'},
  fx:[{s:'0.4 mg/mL (400 mcg/mL)', c:400, u:'mcg', p:'1 mL ampoule (400 mcg), 2 mL ampoule (800 mcg)', b:'Naloxone IP — Vamcare, Neon, Samarth; Narcan (import)', r:'IV/IM/SC/ETT', hl:1},
      {s:'20 mcg/mL (neonatal presentation)', c:20, u:'mcg', p:'1 mL ampoule (20 mcg) — availability limited', b:'Naloxone 0.02 mg/mL', r:'IV/IM'}],
  admin:'Opioid-dependent/chronic-pain patient or post-operative respiratory depression: 40–80 mcg IV every 2 min, titrated to respiratory rate (NOT full arousal). Opioid-naïve patient with arrest-level depression: 0.4–2 mg IV, repeated every 2–3 min up to 10 mg. IM/SC 0.4–0.8 mg if no IV access. Neonate: 10 mcg/kg IV/IM.',
  dil:'Dilute 400 mcg in 10 mL NS → 40 mcg/mL for careful titration in opioid-dependent patients.',
  warn:['Duration 30–90 min is SHORTER than most opioids (esp. methadone, sustained-release, fentanyl patches) → recurrent narcosis. Observe for at least 2–4 h (12–24 h for long-acting agents) or start an infusion.','Infusion: two-thirds of the effective bolus dose per hour.','Precipitates acute withdrawal, pulmonary oedema, arrhythmias, seizures and severe pain if given in large boluses to dependent patients.','Ineffective if the cause is not an opioid — search for other causes of coma.'],
  ref:['TINTINALLI','BNF','BNFC','AHA2025-OPIOID','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'flumazenil', n:'Flumazenil', sys:'sedation', cls:'Competitive benzodiazepine-receptor antagonist',
  ind:'Reversal of benzodiazepine-induced conscious sedation; diagnostic use in undifferentiated coma (with caution)', pop:'all', risk:4,
  d:{t:'mg', lo:0.2, hi:1, cap:3, rep:'0.2 mg over 15 s, then 0.1 mg/min to a max of 1 mg; infusion 0.1–0.4 mg/h'},
  fx:[{s:'0.1 mg/mL (100 mcg/mL)', c:0.1, u:'mg', p:'1 mL ampoule (100 mcg), 5 mL ampoule (500 mcg), 10 mL vial (1 mg)', b:'Anexate (Roche), Flumazenil (Neon/Clarion), Flumaz', r:'IV', hl:1}],
  admin:'Adult: 200 mcg IV over 15 s; if no response after 60 s give 100 mcg every minute up to 1 mg (usual effective 300–600 mcg). Paediatric: 10 mcg/kg (max 200 mcg), then 10 mcg/kg/min up to 1 mg.',
  dil:'May be diluted in NS or D5W.',
  warn:['SEIZURES — contraindicated in chronic benzodiazepine dependence, epilepsy treated with benzodiazepines, mixed overdose with TCAs/proconvulsants, and raised intracranial pressure.','Duration 30–60 min is shorter than most benzodiazepines → re-sedation. Observe for 2 h and be ready to repeat or infuse.','Do not use routinely in undifferentiated coma — the risk/benefit favours supportive care and targeted antidotes.','May precipitate arrhythmias and withdrawal.'],
  ref:['BNF','TINTINALLI','ISCCM-SEDATION','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ================= NEUROMUSCULAR BLOCKADE ================= */
R({ id:'suxamethonium', n:'Suxamethonium (Succinylcholine)', sys:'nmba', cls:'Depolarising neuromuscular blocker',
  ind:'RSI when the fastest possible onset is required (full stomach, cannot intubate/cannot ventilate)', pop:'adult', risk:5,
  d:{t:'mgkg', lo:1, hi:1.5, cap:150},
  fx:[{s:'50 mg/mL', c:50, u:'mg', p:'2 mL ampoule (100 mg); 10 mL vial (500 mg)', b:'Suxamethonium Chloride IP — Neon, Succitran (Samarth), Suxin, Anectine (GSK)', r:'IV/IM', hl:1}],
  admin:'1–1.5 mg/kg IV rapid push (onset 30–60 s, duration 5–10 min). If no IV access: IM 3–4 mg/kg (onset 3–5 min). Pre-curarisation with a non-depolariser is no longer routine.',
  dil:'Ready to use. Keep refrigerated (2–8 °C) — potency falls at room temperature.',
  warn:['ABSOLUTE CONTRAINDICATIONS: hyperkalaemia (K⁺ >5.5), burns >24 h old to 1–2 years, major denervation/spinal cord injury >72 h, crush injury, myopathies (Duchenne), malignant hyperthermia susceptibility, neuromuscular disease, open globe injury (relative), and children with an undiagnosed myopathy.','Hyperkalaemia up to +1 mmol/L normally — and fatal cardiac arrest in the contraindicated states.','Fasciculations, myalgia, raised intra-gastric and intra-ocular pressure, bradycardia (atropine pre-treatment in children), phase II block with repeated doses.','Always have a plan and a non-depolariser + sugammadex available; never paralyse without a secured airway plan and continuous monitoring.'],
  ref:['MORGAN','DAS-AIRWAY','ISCCM-INTUBATION'] });

R({ id:'suxamethonium-paed', n:'Suxamethonium — paediatric', sys:'nmba', cls:'Depolarising neuromuscular blocker',
  ind:'Paediatric RSI where rocuronium is unsuitable; IM use without IV access', pop:'paed', risk:5,
  d:{t:'mgkg', lo:1, hi:2, cap:100},
  fx:[{s:'50 mg/mL', c:50, u:'mg', p:'2 mL ampoule (100 mg)', b:'Suxamethonium IP — Neon, Succitran', r:'IV/IM', hl:1}],
  admin:'1–2 mg/kg IV (infants need the higher end because of the larger extracellular fluid volume). IM 3–4 mg/kg.',
  dil:'Dilute to 20 mg/mL for accuracy in small children.',
  warn:['Cardiac arrest from unrecognised myopathy/hyperkalaemia — suxamethonium should be avoided in children and adolescents unless there is a specific indication (e.g. laryngospasm, no IV access).','Atropine 0.02 mg/kg pre-treatment prevents bradycardia (especially with a second dose).','Never use in Duchenne/Becker muscular dystrophy or unexplained raised CK.'],
  ref:['MORGAN','APLS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'rocuronium', n:'Rocuronium', sys:'nmba', cls:'Aminosteroid non-depolarising neuromuscular blocker',
  ind:'RSI (1.2 mg/kg — onset 45–60 s), maintenance paralysis in ICU and theatre', pop:'all', risk:4,
  d:{t:'mgkg', lo:0.6, hi:1.2, cap:120, rep:'maintenance 0.1–0.2 mg/kg bolus or 0.3–0.6 mg/kg/h infusion'},
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'5 mL vial (50 mg), 10 mL vial (100 mg)', b:'Rocuronium Bromide IP — Neon, Rocmus (Intas), Rocuron (Zydus), Esmeron (MSD)', r:'IV', hl:1}],
  admin:'RSI 1.2 mg/kg IV over 5 s (excellent intubating conditions in 45–60 s). Routine intubation 0.6 mg/kg (90 s). Maintenance 10–20 mcg/kg boluses as needed or 0.3–0.6 mg/kg/h; use a nerve stimulator / train-of-four monitoring.',
  dil:'Ready to use; compatible with NS and D5W.',
  warn:['Duration 30–45 min (longer in hepatic/renal failure and the elderly) — always be prepared for a prolonged apnoea if intubation fails.','Reversed by sugammadex 2 mg/kg (moderate block) or 16 mg/kg (immediate reversal after a 1.2 mg/kg RSI dose).','Anaphylaxis is the commonest cause of peri-operative anaphylactic reactions to NMBAs.','Do not use for prolonged ICU paralysis without analgesia and sedation, and without TOF monitoring.'],
  ref:['MORGAN','DAS-AIRWAY','ISCCM-INTUBATION','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'atracurium', n:'Atracurium besylate', sys:'nmba', cls:'Benzylisoquinolinium non-depolarising NMBA (Hofmann elimination + ester hydrolysis)',
  ind:'Maintenance paralysis in ICU — preferred in renal and hepatic failure', pop:'all', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:5, hi:12},
  diln:[{l:'500 mg in 50 mL NS → 10 mg/mL (10,000 mcg/mL) syringe pump', amt:500, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'250 mg in 50 mL NS → 5 mg/mL', amt:250, in:50, u:'mg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'2.5 mL ampoule (25 mg), 5 mL ampoule (50 mg)', b:'Atracurium IP — Neon, Tracrium (GSK), Atrac, Atracuron', r:'IV', hl:1}],
  admin:'Bolus 0.4–0.5 mg/kg IV (onset 2–3 min, duration 30–45 min). Infusion 5–12 mcg/kg/min (0.3–0.7 mg/kg/h) titrated to TOF count 1–2.',
  dil:'Compatible with NS and D5W. Stable 24 h refrigerated once diluted.',
  warn:['Histamine release with rapid/large boluses → flushing, hypotension, bronchospasm. Give slowly.','Metabolite laudanosine accumulates in hepatic/renal failure → SEIZURES with prolonged high-dose infusion. Prefer cisatracurium for long infusions.','Organ-independent Hofmann elimination is temperature- and pH-dependent — acidosis and hypothermia prolong the block.','Store at 2–8 °C; potency is lost if kept warm for >2 weeks.'],
  ref:['MORGAN','ISCCM-SEDATION','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'cisatracurium', n:'Cisatracurium', sys:'nmba', cls:'Benzylisoquinolinium NMBA (Hofmann elimination, no histamine release)',
  ind:'Prolonged ICU paralysis, renal/hepatic failure, asthma/COPD, raised ICP', pop:'all', risk:4, inf:true,
  d:{t:'mcgkgmin', lo:0.5, hi:3},
  diln:[{l:'200 mg in 50 mL NS → 4 mg/mL (4000 mcg/mL)', amt:200, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'100 mg in 50 mL NS → 2 mg/mL', amt:100, in:50, u:'mg', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'2 mg/mL', c:2, u:'mg', p:'5 mL ampoule (10 mg), 30 mL vial (60 mg)', b:'Cisatracurium IP — Intas, Neon; Cisatra, Nimbex (GSK), Tracur', r:'IV', hl:1}],
  admin:'Bolus 0.15–0.2 mg/kg IV (onset 2–3 min). Infusion 1–3 mcg/kg/min (usually 0.5–5). Titrate to TOF count 1–2 with daily interruption.',
  dil:'Compatible with NS and D5W; use within 24 h of dilution.',
  warn:['3–4× less potent than atracurium — do not interchange the two mg-for-mg.','Produces far less laudanosine than atracurium, but seizures are still reported with very prolonged infusion.','Hofmann elimination is slowed by hypothermia and acidosis.','Always co-administer adequate sedation and analgesia — paralysis without sedation is a never-event.'],
  ref:['MORGAN','ISCCM-SEDATION','PADIS2018','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'vecuronium', n:'Vecuronium', sys:'nmba', cls:'Aminosteroid non-depolarising NMBA',
  ind:'Maintenance paralysis in theatre and ICU; RSI when rocuronium unavailable', pop:'all', risk:4,
  d:{t:'mgkg', lo:0.08, hi:0.12, cap:12, rep:'maintenance 0.01–0.015 mg/kg bolus or 0.8–1.2 mcg/kg/min'},
  fx:[{s:'10 mg vial (lyophilised)', c:1, u:'mg', p:'10 mg vial reconstituted with 10 mL WFI → 1 mg/mL', b:'Vecuronium Bromide IP — Neon, Veenuron (Intas), Vecuron (Samarth), Norcuron', r:'IV', hl:1, prep:'Reconstitute 10 mg with 10 mL sterile WFI → 1 mg/mL; use within 8 h'},
      {s:'4 mg vial', c:1, u:'mg', p:'4 mg vial reconstituted with 4 mL WFI → 1 mg/mL', b:'Vecuronium 4 mg', r:'IV', prep:'Reconstitute 4 mg with 4 mL WFI → 1 mg/mL'}],
  admin:'0.08–0.12 mg/kg IV (onset 2–3 min, duration 25–40 min). Maintenance infusion 0.8–1.2 mcg/kg/min.',
  dil:'Reconstitute to 1 mg/mL. Stable 8 h at room temperature after reconstitution.',
  warn:['Renal and hepatic elimination — accumulation in renal failure (30% renally excreted) and cholestasis.','Prolonged ICU use with corticosteroids → acute quadriplegic myopathy.','No histamine release and minimal cardiovascular effects (an advantage).'],
  ref:['MORGAN','ISCCM-SEDATION','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'sugammadex', n:'Sugammadex', sys:'nmba', cls:'Modified γ-cyclodextrin — selective relaxant-binding agent',
  ind:'Reversal of rocuronium or vecuronium block; immediate reversal after a failed RSI ("can\'t intubate")', pop:'all', risk:4,
  d:{t:'mgkg', lo:2, hi:16, cap:1600},
  fx:[{s:'200 mg/mL', c:200, u:'mg', p:'2 mL vial (400 mg), 5 mL vial (1 g)', b:'Bridion (MSD), Sugammadex (Neon/Intas), Sugan, Relaxis', r:'IV', hl:1}],
  admin:'Routine reversal at reappearance of T2: 2 mg/kg. Deep block (1–2 post-tetanic counts, no T): 4 mg/kg. IMMEDIATE reversal ~3 min after rocuronium 1.2 mg/kg: 16 mg/kg. Give over 10 s IV.',
  dil:'Ready to use — no dilution needed. Unused portions must be discarded (single-use vial).',
  warn:['Only reverses rocuronium and vecuronium — NOT suxamethonium, atracurium, cisatracurium or benzylisoquinoliniums.','Re-blockade can occur if the dose is too small — monitor TOF for at least 15 min after reversal.','Interferes with progesterone-based hormonal contraception for 7 days (advise a non-hormonal method).','Hypersensitivity/anaphylaxis; bradycardia and marked QT prolongation reported — monitor ECG.','Re-dosing rocuronium within 24 h needs a higher dose and non-depolariser alternatives; follow the product insert intervals.'],
  ref:['MORGAN','DAS-AIRWAY','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'neostigmine', n:'Neostigmine (+ glycopyrrolate)', sys:'nmba', cls:'Acetylcholinesterase inhibitor (reversal agent)',
  ind:'Reversal of non-depolarising neuromuscular block when sugammadex is unavailable; myasthenia gravis treatment; anticholinesterase test', pop:'all', risk:4,
  d:{t:'mgkg', lo:0.04, hi:0.07, cap:5, rep:'single dose; repeat after 10–15 min if incomplete'},
  fx:[{s:'0.5 mg/mL', c:0.5, u:'mg', p:'1 mL ampoule (0.5 mg), 5 mL vial (2.5 mg)', b:'Neostigmine Methylsulphate IP — Abbott, Samarth, Neon; Neoton, Prostigmin', r:'IV/IM/SC', hl:1}],
  admin:'0.04–0.07 mg/kg IV (usual adult 2.5–5 mg) — ALWAYS given with an antimuscarinic: glycopyrrolate 0.01 mg/kg (5 mcg per 1 mg neostigmine) or atropine 0.02 mg/kg. Give over 1 min; effect in 5–10 min, duration 30–60 min.',
  dil:'May be diluted in NS to 0.1 mg/mL.',
  warn:['Never give without an antimuscarinic — profound bradycardia, asystole, bronchospasm, salivation.','Ineffective if the block is deep (TOF count 0) — wait for at least 1–2 twitches, or use sugammadex.','Cholinergic crisis in overdose; paradoxical weakness at doses >0.07 mg/kg.','Re-curarisation: neostigmine wears off before long-acting NMBAs (pancuronium, high-dose vecuronium) — monitor for at least 2 h.'],
  ref:['MORGAN','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'glycopyrrolate', n:'Glycopyrrolate', sys:'nmba', cls:'Synthetic antimuscarinic (quaternary ammonium — does not cross the blood–brain barrier)',
  ind:'Antisialogogue before anaesthesia, reversal of neuromuscular block (with neostigmine), glycopyrronium for COPD (inhaled)', pop:'all', risk:3,
  d:{t:'mcgkg', lo:4, hi:10, cap:1000, rep:'0.004–0.01 mg/kg IV; with neostigmine 5 mcg per 1 mg neostigmine'},
  fx:[{s:'0.2 mg/mL (200 mcg/mL)', c:200, u:'mcg', p:'1 mL ampoule (200 mcg), 2 mL (400 mcg), 3 mL (600 mcg)', b:'Glycopyrrolate IP — Neon, Intas (Glyrea), Samarth; Robinul', r:'IV/IM/SC/PO/NEB', hl:1}],
  admin:'Premedication/antisialogogue 0.004 mg/kg IV 2–3 min before induction. With neostigmine 0.2 mg per 1 mg neostigmine. Anticholinergic bronchodilator (nebulised) 0.2 mg 8-hourly off-label.',
  dil:'Ready to use; may be diluted in NS.',
  warn:['Tachycardia, arrhythmia, urinary retention, dry mouth, blurred vision, reduced sweating → hyperthermia.','Does not cross the blood–brain barrier — no central anticholinergic syndrome (an advantage over atropine/scopolamine).','Contraindicated in glaucoma, paralytic ileus, myasthenia gravis (when used alone), and severe ulcerative colitis.'],
  ref:['MORGAN','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'dantrolene', n:'Dantrolene sodium', sys:'nmba', cls:'Ryanodine-receptor antagonist (skeletal muscle relaxant)',
  ind:'MALIGNANT HYPERTHERMIA — the only specific treatment; neuroleptic malignant syndrome (adjunct); spasticity', pop:'all', risk:5,
  d:{t:'mgkg', lo:2.5, hi:10, cap:1000, rep:'2.5 mg/kg IV rapidly, repeat every 5–10 min until symptoms abate (max cumulative ≈10 mg/kg, occasionally more)'},
  fx:[{s:'20 mg vial (with 3 g mannitol)', c:0.33, u:'mg', p:'20 mg vial reconstituted with 60 mL sterile WFI → 0.33 mg/mL', b:'Dantrolene (Neon/Intas), Dantrium (import), Dantrolen', r:'IV', hl:1, prep:'Reconstitute EACH 20 mg vial with 60 mL sterile water for injection (not saline) and shake vigorously until clear. This is labour-intensive — a 70-kg patient needs ≈9 vials for one 2.5 mg/kg dose.'}],
  admin:'STOP the triggering agent and hyperventilate with 100% oxygen. Give 2.5 mg/kg IV as rapidly as possible; repeat until muscle rigidity, tachycardia, hypercarbia and acidosis resolve. Then 1 mg/kg every 6 h (or 0.25 mg/kg/h) for 24–48 h to prevent recurrence.',
  dil:'Reconstitute only with sterile WFI — the solution is highly alkaline (pH 9.5) and irritant; use a large vein or central line.',
  warn:['Every anaesthetic area and ICU in India MUST stock at least 36 vials (enough for one adult dose) and check expiry dates.','Reconstitution takes time — assign multiple staff to mix vials simultaneously.','Recurrence in up to 25% within 24–36 h — continue monitoring and prophylactic dosing.','Also treat hyperkalaemia, acidosis, myoglobinuria (alkalinise urine) and DIC.','The alkaline solution causes tissue necrosis if extravasated.'],
  ref:['MHAUS','MORGAN','AAGBI-MH','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ================= SEIZURES / STATUS EPILEPTICUS ================= */
R({ id:'se-benzo1-ad', n:'Lorazepam', sys:'neuro', cls:'Intermediate-acting benzodiazepine',
  ind:'FIRST-LINE therapy for established status epilepticus (adult)', pop:'adult', risk:4,
  d:{t:'mgkg', v:0.1, cap:4, rep:'4 mg IV over 2 min; repeat 4 mg once after 10–15 min if seizures continue'},
  fx:[{s:'2 mg/mL', c:2, u:'mg', p:'1 mL ampoule (2 mg) — availability in India is limited; many centres substitute midazolam/diazepam', b:'Lorazepam Injection IP — Intas/Neon; Ativan (import)', r:'IV', hl:1},
      {s:'1 mg tablet', c:1, u:'mg', p:'strip of 10', b:'Lorivan (Abbott India) 0.5/1/2 mg', r:'PO/SL'}],
  admin:'4 mg IV over 2 min (0.1 mg/kg). May repeat once after 10–15 min. Then move immediately to a second-line anti-seizure drug.',
  dil:'Inject slowly and undiluted, or dilute 1:1 with WFI/NS.',
  warn:['Contains propylene glycol — avoid prolonged high-dose infusion (acidosis, hyperosmolality, AKI).','Respiratory depression and hypotension — monitor SpO₂, BP; airway equipment at the bedside.','Duration of seizure protection 12–24 h (longer than diazepam, which redistributes in 20–30 min).','If lorazepam is unavailable in India, use midazolam 10 mg IM or diazepam 10 mg IV.'],
  ref:['NCS-STATUS','AES2016','BNF','ISCCM-NEURO'] });

R({ id:'se-benzo1-ad-alt', n:'Diazepam', sys:'neuro', cls:'Long-acting benzodiazepine (rapid redistribution)',
  ind:'First-line status epilepticus where lorazepam is unavailable; seizure clusters', pop:'adult', risk:4,
  d:{t:'mgkg', lo:0.15, hi:0.2, cap:10, rep:'10 mg IV over 2–5 min; may repeat once after 10–15 min (max 30 mg total)'},
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'2 mL ampoule (10 mg)', b:'Diazepam IP — Samarth, Neon; Valium (Roche), Calmpose', r:'IV/IM/PR/PO', hl:1},
      {s:'5 mg tablet', c:5, u:'mg', p:'strip of 10', b:'Valium 5, Calmpose 5, Diazepam 2/5/10 mg', r:'PO'},
      {s:'2 mg/mL oral solution', c:2, u:'mg', p:'30 mL bottle', b:'Diazepam oral solution (limited)', r:'PO'}],
  admin:'10 mg IV at 2–5 mg/min (0.15–0.2 mg/kg). Rectal (if no IV access): 0.5 mg/kg (max 20 mg) as the injection given per rectum.',
  dil:'Give undiluted into a large vein — dilution causes precipitation. Do NOT mix with other drugs.',
  warn:['Seizure protection lasts only 20–30 min because of redistribution — ALWAYS follow with a long-acting anti-seizure drug (phenytoin/levetiracetam/valproate).','Thrombophlebitis, tissue necrosis and pain on injection (propylene glycol vehicle).','Respiratory depression, hypotension — especially when combined with other CNS depressants.','IM absorption is erratic — do not use the IM route for status.'],
  ref:['NCS-STATUS','AES2016','BNF'] });

R({ id:'se-benzo1-pd', n:'Midazolam / Lorazepam — paediatric status epilepticus', sys:'neuro', cls:'Benzodiazepine',
  ind:'FIRST-LINE therapy for paediatric status epilepticus (seizure >5 min)', pop:'paed', risk:4,
  d:{t:'mgkg', v:0.15, cap:10, rep:'midazolam 0.15 mg/kg IV (max 10 mg) or lorazepam 0.1 mg/kg IV (max 4 mg); repeat once after 5–10 min'},
  fx:[{s:'5 mg/mL midazolam', c:5, u:'mg', p:'1 mL ampoule (5 mg)', b:'Midanium (Abbott/Neon), Mezapam (Intas)', r:'IV/IM/IN/buccal', hl:1},
      {s:'1 mg/mL midazolam', c:1, u:'mg', p:'5 mL vial', b:'Hypnova (Fresenius)', r:'IV/IM'},
      {s:'2 mg/mL lorazepam', c:2, u:'mg', p:'1 mL ampoule (limited availability)', b:'Lorazepam inj (Intas/Neon)', r:'IV', own:{kg:0.1,u:'mg',cap:4,l:'LORAZEPAM 0.1 mg/kg IV (max 4 mg) — repeat ONCE after 5–10 min. This is a different dose from midazolam.'}}],
  admin:'IV access available: lorazepam 0.1 mg/kg (max 4 mg) OR midazolam 0.15–0.2 mg/kg (max 10 mg). No IV access: midazolam 0.2 mg/kg IM (max 10 mg), buccal 0.5 mg/kg (max 10 mg), or intranasal 0.2 mg/kg (max 10 mg). Repeat ONE further dose after 5–10 min if still seizing.',
  dil:'Buccal/intranasal midazolam: use the 5 mg/mL ampoule undiluted; for intranasal use a mucosal atomiser device.',
  warn:['Respiratory depression and apnoea — monitor SpO₂, have suction, oxygen and bag-mask ready.','Maximum two benzodiazepine doses, then move to second-line therapy (do not keep repeating benzodiazepines).','Buccal midazolam is preferred over rectal diazepam in the community and pre-hospital setting.'],
  ref:['APLS','IAP-SE','AES2016','BNFC','NICE-CG169','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });

R({ id:'se-phenytoin-ad', n:'Phenytoin (second-line, adult)', sys:'neuro', cls:'Class Ib-like Na⁺ channel blocker (hydantoin anticonvulsant)',
  ind:'Second-line therapy for established status epilepticus; seizure prophylaxis after TBI/craniotomy (7 days)', pop:'adult', risk:5,
  d:{t:'mgkg', lo:15, hi:20, cap:1500, rep:'single loading dose; additional 5 mg/kg after 10 min if seizures persist'},
  fx:[{s:'50 mg/mL', c:50, u:'mg', p:'5 mL ampoule (250 mg) — a 70-kg adult needs 5–6 ampoules', b:'Eptoin (Abbott/Intas), Dilantin (Abbott), Phenytal, Epilantin', r:'IV/IM/PO', hl:1},
      {s:'100 mg tablet (sodium phenytoin)', c:100, u:'mg', p:'strip of 10', b:'Eptoin 100, Dilantin 100, Phenytal 100', r:'PO'},
      {s:'30 mg/mL oral suspension', c:30, u:'mg', p:'150 mL / 300 mL bottle', b:'Eptoin suspension, Dilantin susp', r:'PO'},
      {s:'20 mg/mL oral suspension (100 mg/5 mL)', c:20, u:'mg', p:'200 mL bottle', b:'Phenytoin oral suspension IP', r:'PO'}],
  admin:'Loading 15–20 mg/kg IV diluted in NS at a MAXIMUM RATE OF 50 mg/min (25 mg/min in the elderly and in cardiac disease). Then maintenance 100 mg IV/PO every 8 h (5–7 mg/kg/day) started 12 h after the load.',
  dil:'MUST be diluted in 0.9% NaCl only (50–100 mL) and infused through an in-line 0.22 µm filter. DEXTROSE AND ALL OTHER FLUIDS CAUSE PRECIPITATION. Use the diluted solution within 1 h and flush the line with NS before and after.',
  warn:['RATE-LIMITING TOXICITY: hypotension and cardiac arrhythmias (propylene glycol + sodium load). Never exceed 50 mg/min; use a dedicated line with continuous ECG and BP monitoring.','Purple glove syndrome with peripheral extravasation — prefer a large-bore cannula or central line; stop immediately on pain/discolouration.','Zero-order (Michaelis–Menten) kinetics above ~300 mg/day — small dose changes cause large level changes. Target total level 10–20 mg/L (correct for albumin: adjusted = measured ÷ [(0.2 × albumin) + 0.1]).','Contraindicated in sinus bradycardia, SA block, second-/third-degree AV block, and Adams–Stokes syndrome.','Drug interactions: CYP inducer (reduces efficacy of many drugs); levels raised by valproate, amiodarone, fluconazole, metronidazole.','Stevens–Johnson syndrome/DRESS — HLA-B*15:02 is common in South Indians; consider screening.','IM injection is erratically absorbed and causes muscle necrosis — avoid.'],
  ref:['NCS-STATUS','AES2016','BNF','ISCCM-NEURO'] });

R({ id:'se-phenytoin-pd', n:'Phenytoin (second-line, paediatric)', sys:'neuro', cls:'Hydantoin anticonvulsant',
  ind:'Second-line therapy for paediatric status epilepticus after two benzodiazepine doses', pop:'paed', risk:5,
  d:{t:'mgkg', v:20, cap:1500, rep:'single loading dose over 20–30 min; then 4–8 mg/kg/day divided 2–3 doses from 12 h later'},
  fx:[{s:'50 mg/mL', c:50, u:'mg', p:'5 mL ampoule (250 mg)', b:'Eptoin (Abbott/Intas), Phenytal, Dilantin', r:'IV', hl:1},
      {s:'30 mg/mL oral suspension', c:30, u:'mg', p:'150 mL bottle', b:'Eptoin suspension', r:'PO'},
      {s:'100 mg tablet', c:100, u:'mg', p:'strip', b:'Eptoin 100', r:'PO'}],
  admin:'20 mg/kg IV diluted in NS at ≤1 mg/kg/min (absolute maximum 50 mg/min; use 25 mg/min in infants). Continuous ECG and BP monitoring throughout.',
  dil:'Dilute in 0.9% NaCl ONLY (final concentration ≤10 mg/mL); use an in-line filter; flush before and after.',
  warn:['Never dilute in dextrose — precipitation.','Cardiac arrhythmias and hypotension are rate-related.','Purple glove syndrome — use a large, well-sited cannula; avoid the dorsum of the hand in small children.','HLA-B*15:02 screening is relevant in South Indian children (SJS/TEN risk).'],
  ref:['APLS','IAP-SE','AES2016','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });

R({ id:'se-levetiracetam-ad', n:'Levetiracetam (second-line, adult)', sys:'neuro', cls:'SV2A synaptic vesicle protein ligand',
  ind:'Second-line status epilepticus; first-line seizure prophylaxis after TBI/SAH/craniotomy (favoured over phenytoin)', pop:'adult', risk:3,
  d:{t:'mgkg', lo:20, hi:60, cap:4500, rep:'single loading dose over 15 min; then 500–1500 mg BD'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'5 mL vial (500 mg) — a 60 mg/kg dose in a 70-kg adult needs 8–9 vials', b:'Levetiracetam IP — Sun, UCB (Keppra IV), Levepsy (Zydus), Levipil (Sun), Levipil IV', r:'IV/PO', hl:1},
      {s:'100 mg/mL oral solution', c:100, u:'mg', p:'150 mL / 300 mL bottle', b:'Keppra oral solution, Levipil syrup', r:'PO'},
      {s:'250 / 500 / 750 / 1000 mg tablets', c:500, u:'mg', p:'strip of 10', b:'Levipil, Levepsy, Keppra, Levace', r:'PO'}],
  admin:'Loading 60 mg/kg IV (max 4500 mg) over 15 min, or a standard 1000–3000 mg load. Maintenance 500–1500 mg BD IV/PO (max 3000 mg/day). Reduce in renal impairment (CrCl <50: halve the dose).',
  dil:'Dilute each 500 mg vial in 100 mL NS or D5W (final concentration ≥5 mg/mL); compatible with both; infuse over 15 min.',
  warn:['No significant drug interactions and no cardiac/rate toxicity — a major advantage over phenytoin in the ICU.','Behavioural side effects: irritability, aggression, depression, psychosis (5–10%).','Renally cleared — accumulate in AKI; halve the dose for CrCl <50 mL/min, and further for <30.','Evidence for second-line status epilepticus is comparable to phenytoin (ESETT trial).'],
  ref:['NCS-STATUS','ESETT','AES2016','BNF'] });

R({ id:'se-levetiracetam-pd', n:'Levetiracetam (second-line, paediatric)', sys:'neuro', cls:'SV2A ligand',
  ind:'Second-line paediatric status epilepticus; post-traumatic seizure prophylaxis', pop:'paed', risk:3,
  d:{t:'mgkg', lo:20, hi:60, cap:3000, rep:'single loading dose over 15 min; then 20–30 mg/kg twice daily'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'5 mL vial (500 mg)', b:'Levetiracetam IP — Sun, Keppra IV, Levipil', r:'IV', hl:1},
      {s:'100 mg/mL oral solution', c:100, u:'mg', p:'150 mL bottle', b:'Levipil syrup, Keppra solution', r:'PO'},
      {s:'250 / 500 mg tablets', c:250, u:'mg', p:'strip', b:'Levipil, Levepsy', r:'PO'}],
  admin:'Loading 40–60 mg/kg IV over 15 min (max 3000 mg). Maintenance 20–30 mg/kg BD (max 60 mg/kg/day). Neonates: 20–40 mg/kg load then 10–20 mg/kg BD.',
  dil:'Dilute in NS or D5W to ≥5 mg/mL; infuse over 15 min.',
  warn:['Renal dose adjustment required.','Behavioural disturbance is more noticeable in children and adolescents.'],
  ref:['APLS','IAP-SE','ESETT','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });

R({ id:'se-valproate-ad', n:'Sodium valproate IV (second-line, adult)', sys:'neuro', cls:'Broad-spectrum anticonvulsant (multiple mechanisms)',
  ind:'Second-line status epilepticus, particularly generalised/absence/myoclonic seizures; alternative when phenytoin is contraindicated', pop:'adult', risk:4,
  d:{t:'mgkg', lo:20, hi:40, cap:3000, rep:'20–40 mg/kg IV over 10–20 min; then 1–4 mg/kg/h infusion'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'4 mL vial (400 mg) — a 40 mg/kg dose in a 70-kg adult needs 7 vials', b:'Sodium Valproate for Injection — Sun (Encorate/Valprol IV), Valciv, Valpro (Abbott), Valrate', r:'IV/PO', hl:1},
      {s:'200 mg/5 mL syrup (40 mg/mL)', c:40, u:'mg', p:'150 mL bottle', b:'Encorate syrup, Valprol syrup, Valrate syrup', r:'PO'},
      {s:'200 / 300 / 500 mg tablets (CR)', c:500, u:'mg', p:'strip of 10', b:'Encorate Chrono, Valprol Chrono, Valrate CR', r:'PO'}],
  admin:'40 mg/kg IV over 10–20 min (max 3000 mg), then 1–4 mg/kg/h (usual 20–30 mg/kg/day) divided 2–3 times or as a continuous infusion.',
  dil:'Dilute in NS, D5W or RL to a final concentration of ≥3 mg/mL; infuse over at least 10 min.',
  warn:['HEPATOTOXICITY, hyperammonaemic encephalopathy and pancreatitis — check LFTs and ammonia.','Thrombocytopenia and platelet dysfunction — avoid if platelets <100,000/µL or before neurosurgery.','TERATOGENIC — avoid in women of childbearing potential unless there is no alternative (neural tube defects, developmental delay).','Enzyme inhibitor: markedly raises phenytoin, lamotrigine and carbapenem levels; carbapenems (meropenem) REDUCE valproate levels by 60–100% — this combination must be avoided.','Contraindicated in mitochondrial disorders (POLG mutations) and known urea-cycle defects.'],
  ref:['NCS-STATUS','AES2016','ESETT','BNF','MHRA-VPA'] });

R({ id:'se-valproate-pd', n:'Sodium valproate IV (second-line, paediatric)', sys:'neuro', cls:'Broad-spectrum anticonvulsant',
  ind:'Second-line paediatric status epilepticus; infantile spasms; generalised epilepsy', pop:'paed', risk:4,
  d:{t:'mgkg', lo:20, hi:40, cap:2000, rep:'20–40 mg/kg IV over 10–20 min; then 10–30 mg/kg/day divided'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'4 mL vial (400 mg)', b:'Valproate for Injection — Sun (Valprol IV), Valciv, Encorate IV', r:'IV', hl:1},
      {s:'40 mg/mL syrup', c:40, u:'mg', p:'150 mL bottle', b:'Encorate syrup, Valprol syrup', r:'PO'},
      {s:'200/300 mg CR tablets', c:200, u:'mg', p:'strip', b:'Encorate Chrono', r:'PO'}],
  admin:'20–40 mg/kg IV over 10–20 min (max 2000 mg per dose), then 10–30 mg/kg/day in divided doses.',
  dil:'Dilute to ≥3 mg/mL in NS/D5W.',
  warn:['Fatal hepatotoxicity in children <2 years on multiple anticonvulsants or with a metabolic disorder — screen for mitochondrial disease.','Pancreatitis, hyperammonaemia, thrombocytopenia.','Carbapenems abolish valproate levels.','Teratogenicity — counsel adolescent girls.'],
  ref:['APLS','IAP-SE','BNFC','MHRA-VPA','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });

R({ id:'se-phenobarbitone', n:'Phenobarbitone (phenobarbital)', sys:'neuro', cls:'Long-acting barbiturate',
  ind:'NEONATAL SEIZURES — first-line; second/third-line status epilepticus in children and adults', pop:'all', risk:4,
  d:{t:'mgkg', lo:15, hi:20, cap:2000, rep:'20 mg/kg IV over 20–30 min; if seizures persist give a further 10 mg/kg (max cumulative 40 mg/kg)'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'1 mL ampoule (100 mg), 2 mL ampoule (200 mg)', b:'Phenobarbitone Sodium IP — Abbott, Neon, Samarth; Gardenal, Epiphen', r:'IV/IM/PO', hl:1},
      {s:'30 mg / 60 mg tablets', c:60, u:'mg', p:'strip of 10', b:'Gardenal 30/60, Phenobarbitone tabs', r:'PO'},
      {s:'20 mg/5 mL elixir', c:4, u:'mg', p:'100 mL bottle', b:'Gardenal elixir, Phenobarb elixir', r:'PO'}],
  admin:'Neonatal seizures: 20 mg/kg IV over 15–30 min; if seizures continue give a further 10 mg/kg, then 10 mg/kg (total 40 mg/kg) — then maintenance 3–5 mg/kg/day from 12 h later. Status epilepticus (child/adult): 15–20 mg/kg IV at ≤50 mg/min.',
  dil:'May be given undiluted slowly, or diluted 1:1 with NS/WFI. Compatible with NS only — precipitates in acidic/dextrose solutions.',
  warn:['Profound respiratory depression, hypotension and apnoea — intubation is frequently required after a full loading dose.','Rate must not exceed 50–60 mg/min (cardiac and respiratory arrest).','Very long half-life (80–120 h) → prolonged sedation, difficult neurological assessment.','Enzyme inducer — many interactions. Paradoxical hyperactivity in children and the elderly.','NDPS-controlled substance in India — documentation required.'],
  ref:['IAP-NEO-SEIZURE','NCS-STATUS','AES2016','BNFC','WHO-NEONATAL','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'se-refractory-midaz', n:'Midazolam — refractory status epilepticus infusion', sys:'neuro', cls:'Benzodiazepine',
  ind:'Refractory / super-refractory status epilepticus (third-line)', pop:'all', risk:5, inf:true,
  d:{t:'mgkghr', lo:0.05, hi:2},
  diln:[{l:'200 mg in 50 mL NS → 4 mg/mL (4000 mcg/mL)', amt:200, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'100 mg in 100 mL NS → 1 mg/mL', amt:100, in:100, u:'mg', bag:'100 mL 0.9% NaCl'}],
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'3 mL ampoule (15 mg) × many', b:'Midanium (Abbott/Neon), Mezapam (Intas)', r:'IV-inf', hl:1}],
  admin:'Loading 0.2 mg/kg IV (max 10 mg) over 2 min, then 0.05–2 mg/kg/h titrated to burst suppression or seizure freedom for 24–48 h. Wean slowly over 24–48 h.',
  dil:'Compatible with NS and D5W.',
  warn:['Requires intubation, mechanical ventilation, invasive BP monitoring and continuous EEG.','Tachyphylaxis within 24–48 h.','Propylene glycol accumulation: metabolic acidosis and hyperosmolality — monitor the osmolal gap.','Hypotension on loading — have a vasopressor running.'],
  ref:['NCS-STATUS','AES2016','ESICM-SE','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'se-refractory-propofol', n:'Propofol — refractory status epilepticus infusion', sys:'neuro', cls:'GABA-A agonist',
  ind:'Refractory status epilepticus in adults (rapid on/off titration)', pop:'adult', minAge:16, risk:5, inf:true,
  d:{t:'mcgkgmin', lo:20, hi:200},
  diln:[{l:'1000 mg in 50 mL (2%) → 20 mg/mL', amt:1000, in:50, u:'mg', bag:'50 mL of the 2% presentation'},
        {l:'500 mg in 50 mL (1%) → 10 mg/mL', amt:500, in:50, u:'mg', bag:'50 mL of the 1% presentation'}],
  fx:[{s:'10 mg/mL (1%)', c:10, u:'mg', p:'50 mL vial (500 mg)', b:'Propofol (Neon), Recofol, Diprivan', r:'IV-inf', hl:1},
      {s:'20 mg/mL (2%)', c:20, u:'mg', p:'50 mL vial (1 g)', b:'Propofol 2% (Neon/Fresenius)', r:'IV-inf'}],
  admin:'Loading 1–2 mg/kg IV, then 20–200 mcg/kg/min (1.2–12 mg/kg/h) titrated to EEG burst suppression. Do NOT exceed 4 mg/kg/h (67 mcg/kg/min) for more than 48–72 h.',
  dil:'Use the 2% presentation to limit the lipid and propylene glycol load.',
  warn:['PROPOFOL INFUSION SYNDROME — lactic acidosis, rhabdomyolysis, hyperkalaemia, lipaemia, renal failure, cardiac failure. Check CK, lactate, triglycerides, K⁺, ABG every 6–12 h at high doses.','Hypotension and myocardial depression — usually needs a vasopressor.','Contraindicated in children <16 years for ICU sedation.'],
  ref:['NCS-STATUS','AES2016','ISCCM-NEURO'] });

R({ id:'se-thiopentone', n:'Thiopentone — refractory status epilepticus infusion', sys:'neuro', cls:'Barbiturate',
  ind:'Super-refractory status epilepticus; also used for refractory intracranial hypertension', pop:'adult', risk:5, inf:true,
  d:{t:'mgkghr', lo:1, hi:5},
  diln:[{l:'2 g in 50 mL → 40 mg/mL (2.5%–4%)', amt:2, in:50, u:'g', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'25 mg/mL (2.5%) after reconstitution', c:25, u:'mg', p:'500 mg / 1 g vials', b:'Thiopentone IP — Neon, Pentothal (Abbott)', r:'IV-inf', hl:1, prep:'Reconstitute 500 mg with 20 mL WFI → 2.5%'}],
  admin:'Loading 3–5 mg/kg IV (up to 10 mg/kg in super-refractory status), then 1–5 mg/kg/h titrated to burst suppression on continuous EEG. Maintain 24–48 h after the last electrographic seizure, then wean.',
  dil:'NS or WFI only — incompatible with dextrose and Ringer lactate.',
  warn:['Profound hypotension and myocardial depression — vasopressor support is almost always needed.','Paralytic ileus, immunosuppression, infection, delayed awakening (long context-sensitive half-time).','Extravasation and intra-arterial injection risks (see the induction entry).','Requires continuous EEG, invasive arterial pressure and often a pulmonary artery/echocardiographic assessment.'],
  ref:['NCS-STATUS','ESICM-SE','MARINO'] });

R({ id:'pyridoxine-inh', n:'Pyridoxine (vitamin B6)', sys:'neuro', cls:'Vitamin — cofactor for GABA synthesis',
  ind:'Isoniazid-induced status epilepticus; pyridoxine-dependent epilepsy in neonates; gyromitra mushroom poisoning; cycloserine toxicity', pop:'all', risk:3,
  d:{t:'mg', lo:1000, hi:5000, rep:'gram-for-gram replacement: 1 g IV per 1 g of isoniazid ingested (max 5 g if the amount is unknown)'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'1 mL ampoule (100 mg) — many ampoules required', b:'Pyridoxine IP — Neon, Samarth, Vensar; Pyridox (limited bulk availability)', r:'IV/IM/PO', hl:1},
      {s:'50 mg/mL', c:50, u:'mg', p:'1 mL ampoule', b:'Pyridoxine 50 mg/mL', r:'IV/IM'},
      {s:'10 / 20 / 50 mg tablets', c:50, u:'mg', p:'strip', b:'Pyridoxine tablets, Becosules (combination)', r:'PO'}],
  admin:'Give the amount of pyridoxine equal to the amount of isoniazid ingested (e.g. 10 g INH → 10 g pyridoxine) IV over 5–30 min; if seizures continue, give a further 5 g. If the ingested amount is unknown, give 5 g IV (adult) or 70 mg/kg IV (max 5 g) in a child.',
  dil:'Dilute in NS or D5W; the total volume can be large — plan access and fluid accordingly.',
  warn:['Pyridoxine must be given with a benzodiazepine — it works synergistically (both are needed to restore GABA).','Large-volume administration requires stock availability: check the pharmacy reserve before the patient arrives.','Chronic high-dose pyridoxine causes a sensory neuropathy.','Always keep a minimum of 5 g in the emergency drug trolley where INH toxicity is plausible.'],
  ref:['TINTINALLI','GOLDFRANK','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ================= NEUROCRITICAL CARE ================= */
R({ id:'mannitol', n:'Mannitol 20%', sys:'neurocrit', cls:'Osmotic diuretic',
  ind:'Raised intracranial pressure / cerebral oedema with herniation syndrome; acute glaucoma', pop:'all', risk:4,
  d:{t:'gkg', lo:0.25, hi:1, cap:100, rep:'every 4–6 h as needed; keep serum osmolality <320 mOsm/kg and Na⁺ 145–155 mmol/L'},
  fx:[{s:'200 mg/mL (20%)', c:200, u:'mg', p:'100 mL bottle (20 g), 350 mL bottle (70 g), 500 mL', b:'Osmitrol (Baxter), Mannitol IP — Eclar, Neon, Samarth, Claris; Mannitol 20%', r:'IV', hl:1},
      {s:'100 mg/mL (10%)', c:100, u:'mg', p:'500 mL bottle', b:'Mannitol 10%', r:'IV'}],
  admin:'0.25–1 g/kg IV over 5–20 min (in impending herniation give 1 g/kg rapidly over 5 min). Onset 15–30 min, peak 30–60 min, duration 2–6 h.',
  dil:'Ready to use. USE AN IN-LINE FILTER (15–20 µm) — mannitol crystallises at low temperature; warm and inspect the bottle before use.',
  warn:['Initial transient volume expansion → pulmonary oedema in heart failure; then osmotic diuresis with hypovolaemia, hypernatraemia and hypokalaemia.','Rebound intracranial hypertension with repeated dosing; discontinue once ICP is controlled.','Stop if serum osmolality >320 mOsm/kg or osmolar gap >55.','Extravasation causes tissue oedema and necrosis.','Contraindicated in anuria, severe dehydration and active intracranial bleeding (except during craniotomy).','Hypertonic saline is often preferred in hypovolaemic/hypotensive patients.'],
  ref:['BTF-TBI','NCS-ICP','MARINO','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'hts-3pct', n:'Hypertonic saline 3%', sys:'neurocrit', cls:'Osmotic agent / volume expander',
  ind:'Raised intracranial pressure, cerebral oedema (preferred when the patient is hypotensive/hypovolaemic); symptomatic hyponatraemia', pop:'all', risk:5,
  d:{t:'mlkg', lo:2, hi:5, cap:250, rep:'bolus 2–5 mL/kg over 10–20 min; may repeat; or continuous 0.5–1 mL/kg/h'},
  fx:[{s:'3% sodium chloride (30 mg/mL NaCl; 0.513 mmol/mL Na⁺; 513 mmol/L Na⁺)', c:0.513, u:'mmol', p:'100 mL and 500 mL bottles', b:'Sodium Chloride 3% Injection IP — Eurolife, Claris, Neon, Braun; HTS 3%', r:'IV', hl:1},
      {s:'23.4% (4000 mmol/L)', c:4000, u:'mmol', p:'30 mL vial — CENTRAL LINE ONLY; very limited availability', b:'Sodium Chloride 23.4% (import/compounded)', r:'IV'}],
  admin:'ICP bolus: 2–5 mL/kg of 3% (≈150–350 mL in a 70-kg adult) over 10–20 min via a central line, repeated for ICP >20–22 mmHg. Target serum Na⁺ 145–155 mmol/L. Continuous infusion 0.5–1 mL/kg/h.',
  dil:'Ready to use. For symptomatic hyponatraemia: 100–150 mL of 3% over 10–20 min, repeated up to 3 times (raises Na⁺ by ≈2 mmol/L per 100 mL in a 70-kg adult).',
  warn:['CENTRAL VENOUS ACCESS IS REQUIRED for repeated boluses and for anything above 3% — peripheral extravasation causes necrosis.','Correct chronic hyponatraemia by ≤8–10 mmol/L in 24 h (≤18 mmol/L in 48 h) to avoid osmotic demyelination syndrome. In acute symptomatic hyponatraemia the priority is rapid initial correction of 4–6 mmol/L.','Monitor Na⁺, Cl⁻, osmolality, potassium and volume status 4–6 hourly.','Hyperchloraemic metabolic acidosis; AKI; pulmonary oedema.'],
  ref:['NCS-ICP','BTF-TBI','ESICM-HYPO','MARINO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'nimodipine-sah', n:'Nimodipine', sys:'neurocrit', cls:'Dihydropyridine calcium-channel blocker (cerebro-selective)',
  ind:'Aneurysmal subarachnoid haemorrhage — prevention of delayed cerebral ischaemia from vasospasm (start within 4 days, continue 21 days)', pop:'adult', risk:4,
  d:{t:'mg', v:60, cap:240, capDay:360, rep:'60 mg orally every 4 h for 21 days'},
  fx:[{s:'30 mg tablet', c:30, u:'mg', p:'strip of 10', b:'Nimotop (Bayer), Nimodipine (Torrent/Cipla), Nimod, Nimular', r:'PO', hl:1},
      {s:'0.2 mg/mL infusion', c:0.2, u:'mg', p:'50 mL bottle (10 mg) — availability in India is limited', b:'Nimotop infusion (Bayer), Nimodipine 0.02% IV', r:'IV-inf'}],
  admin:'ORAL 60 mg every 4 h for 21 days (crush the tablet and give via NG tube, or use the oral solution from the IV bottle off-label via NG — NEVER inject the oral formulation IV). IV (if available): 1 mg/h (≈5 mL/h of 0.2 mg/mL) for 2 h, then 2 mg/h if tolerated (weight >70 kg or unstable BP: start 0.5 mg/h).',
  dil:'IV nimodipine must be given through a central line or in parallel with a compatible fluid; it adsorbs to PVC — use polyethylene tubing and the dedicated giving set.',
  warn:['FATAL ERROR: the ORAL capsule/tablet content has been injected intravenously, causing cardiac arrest and death. Label every syringe "NOT FOR IV USE" if drawn from the oral formulation.','Hypotension is the main limiting adverse effect — reduce or hold the dose if MAP falls; vasopressor support may be needed.','Do not use for raised ICP or traumatic brain injury — no benefit and possible harm.','Hepatic impairment: reduce the dose by 50%.'],
  ref:['AHA2025-SAH','NCS-SAH','BNF'] });

R({ id:'dexamethasone-cerebral', n:'Dexamethasone — cerebral oedema', sys:'neurocrit', cls:'Long-acting potent glucocorticoid (no mineralocorticoid activity)',
  ind:'Vasogenic oedema from brain tumour/abscess/metastasis; spinal cord compression; bacterial meningitis adjunct; NOT for TBI or ischaemic stroke', pop:'all', risk:3,
  d:{t:'mg', lo:4, hi:10, cap:100, capDay:96, load:1, rep:'10 mg IV load then 4 mg IV every 6 h; spinal cord compression: up to 100 mg IV stat (a single loading dose may exceed the 24 h ceiling); meningitis: 0.15 mg/kg IV q6h × 4 days'},
  fx:[{s:'4 mg/mL', c:4, u:'mg', p:'1 mL ampoule (4 mg), 2 mL ampoule (8 mg)', b:'Dexamethasone IP — Neon, Aristo, Samarth; Dexona (RPG), Decdan (Wallace), Dexasone', r:'IV/IM/PO', hl:1},
      {s:'8 mg/mL', c:8, u:'mg', p:'2 mL ampoule (16 mg)', b:'Dexamethasone 8 mg/mL', r:'IV/IM'},
      {s:'0.5 mg tablet', c:0.5, u:'mg', p:'strip of 10', b:'Dexona 0.5 mg, Decdan 0.5 mg', r:'PO'},
      {s:'0.5 mg/5 mL elixir', c:0.1, u:'mg', p:'30 mL bottle', b:'Dexamethasone elixir', r:'PO'}],
  admin:'Tumour oedema: 10 mg IV then 4 mg IV every 6 h; taper after 3–5 days once definitive treatment starts. Spinal cord compression: 10–16 mg IV stat then 4–6 mg 6-hourly. Bacterial meningitis: 0.15 mg/kg IV every 6 h for 4 days, starting 15–30 min BEFORE the first antibiotic dose.',
  dil:'Ready to use.',
  warn:['NOT indicated in traumatic brain injury (CRASH trial: increased mortality) or in ischaemic/haemorrhagic stroke.','In meningitis, dexamethasone must precede or accompany the first antibiotic dose — giving it later has no benefit and may reduce vancomycin penetration.','Hyperglycaemia, immunosuppression, GI bleeding, psychiatric effects, myopathy.','Taper rather than stopping abruptly after >2 weeks of therapy.'],
  ref:['NCCN-BRAIN','IDSA-MENINGITIS','ESCMID-MENINGITIS','CRASH','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'citicoline', n:'Citicoline (CDP-choline)', sys:'neurocrit', cls:'Endogenous nucleoside — membrane phospholipid precursor',
  ind:'Acute ischaemic stroke and traumatic brain injury — widely used in Indian practice; evidence is supportive but not definitive', pop:'adult', risk:2,
  d:{t:'mg', lo:500, hi:2000, capDay:2000, rep:'1000 mg IV/PO twice daily for 14–21 days'},
  fx:[{s:'250 mg/mL', c:250, u:'mg', p:'2 mL ampoule (500 mg)', b:'Strocit (Zuventus), Citicoline (Samarth), Neurocol, Cognicol, Citistar', r:'IV/IM/PO', hl:1},
      {s:'500 mg / 1000 mg sachet (oral solution)', c:1000, u:'mg', p:'5 mL sachet', b:'Strocit sachet, Citicoline oral solution', r:'PO'},
      {s:'500 mg tablet', c:500, u:'mg', p:'strip', b:'Citicoline 500 mg tablets', r:'PO'}],
  admin:'1000 mg IV slowly over 3–5 min (or in 100 mL NS over 30 min) twice daily for 14 days, then oral 500–1000 mg BD.',
  dil:'Compatible with NS and D5W.',
  warn:['Transient hypotension with rapid IV injection — give slowly.','Not a substitute for thrombolysis, thrombectomy, BP control or ICP management.','ICTUS trial showed no benefit of 2 g/day in acute ischaemic stroke — use with realistic expectations.'],
  ref:['ICTUS','IND-STROKE-GUIDE','BNF'] });
