/* =====================================================================
   PART 2 — ANTICOAGULATION · THROMBOLYSIS · BLOOD PRODUCTS
            HYPERTENSIVE EMERGENCIES · ANTIPLATELETS
   ===================================================================== */

/* ---------------- unfractionated heparin ---------------- */
R({ id:'heparin-acs', n:'Heparin (unfractionated)', sys:'anticoag', cls:'Indirect thrombin/Xa inhibitor (antithrombin-dependent)',
  ind:'ACS/NSTEMI, unstable angina, PCI — weight-based therapeutic anticoagulation', pop:'adult', risk:5, inf:true,
  d:{t:'unitskg', v:60, cap:4000, rep:'then infusion 12 units/kg/h (max 1000 units/h)'},
  diln:[{l:'25,000 units in 250 mL NS → 100 units/mL (standard)', amt:25000, in:250, u:'units', bag:'250 mL 0.9% NaCl'},
        {l:'25,000 units in 50 mL → 500 units/mL (fluid-restricted, syringe pump)', amt:25000, in:50, u:'units', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'5000 units/mL', c:5000, u:'units', p:'5 mL vial (25,000 units)', b:'Heparin Sodium IP — Gland, Neon, Samarth, Claris', r:'IV/SC', hl:1},
      {s:'1000 units/mL', c:1000, u:'units', p:'5 mL vial (5000 units)', b:'Heparin 1000 IU/mL — Gland/Neon', r:'IV/SC'},
      {s:'25,000 units/mL', c:25000, u:'units', p:'2 mL vial (50,000 units)', b:'Heparin concentrate — Gland', r:'IV'}],
  admin:'Bolus 60 units/kg IV (max 4000 units), then 12 units/kg/h (max 1000 units/h). Check aPTT at 6 h, then 6-hourly: target 1.5–2.5 × control (≈50–70 s).',
  dil:'Dilute in 0.9% NaCl or D5W. Use a dedicated lumen — heparin binds to many drugs.',
  warn:['ISMP high-alert drug — two-clinician independent double-check of the vial strength, the weight-based dose and the pump rate before starting.','HIT (heparin-induced thrombocytopenia): monitor platelets on day 0, then every 2–3 days from day 4 to 14. Stop heparin for a ≥50% platelet fall or thrombosis.','Reversal: protamine 1 mg per 100 units of heparin given in the last 2–3 h (max 50 mg per dose).','Bleeding risk — check Hb, platelets, creatinine before starting.'],
  ref:['AHA2025-ACS','BNF','MARINO'] });

R({ id:'heparin-vte', n:'Heparin (unfractionated)', sys:'anticoag', cls:'Indirect thrombin/Xa inhibitor',
  ind:'Acute VTE / PE / DVT, atrial fibrillation anticoagulation, ECMO & CRRT circuit', pop:'adult', risk:5, inf:true,
  d:{t:'unitskg', v:80, cap:10000, rep:'then infusion 18 units/kg/h (max 1250 units/h for the first 6 h)'},
  diln:[{l:'25,000 units in 250 mL NS → 100 units/mL', amt:25000, in:250, u:'units', bag:'250 mL 0.9% NaCl'},
        {l:'25,000 units in 50 mL → 500 units/mL (syringe pump)', amt:25000, in:50, u:'units', bag:'50 mL 0.9% NaCl'}],
  fx:[{s:'5000 units/mL', c:5000, u:'units', p:'5 mL vial (25,000 units)', b:'Heparin Sodium IP — Gland, Neon, Claris', r:'IV/SC', hl:1}],
  admin:'Bolus 80 units/kg IV (max 10,000 units) then 18 units/kg/h. aPTT target 1.5–2.5 × control. Recheck aPTT 6 h after every rate change.',
  dil:'Dilute in NS. For CRRT: 5–15 units/kg/h pre-filter; for ECMO: titrate to ACT 180–220 s.',
  warn:['Double-check independently — a 10-fold vial error (1000 vs 5000 vs 25,000 units/mL) has caused fatal bleeds.','Contraindicated in active major bleeding, platelets <50,000/µL, recent neurosurgery, uncontrolled severe hypertension.','Reversal: protamine sulfate.'],
  ref:['ACCP-VTE','ESC-PE','BNF'] });

R({ id:'heparin-prophy', n:'Heparin (unfractionated) — VTE prophylaxis', sys:'anticoag', cls:'Indirect thrombin/Xa inhibitor',
  ind:'Medical/surgical ICU VTE prophylaxis (preferred when CrCl <30 mL/min)', pop:'adult', risk:4,
  d:{t:'units', v:5000, rep:'every 8–12 h subcutaneously'},
  fx:[{s:'5000 units/mL', c:5000, u:'units', p:'5 mL vial (25,000 units) — withdraw 1 mL', b:'Heparin Sodium IP — Gland, Neon', r:'SC', hl:1},
      {s:'1000 units/mL', c:1000, u:'units', p:'5 mL vial (5000 units)', b:'Heparin 1000 IU/mL', r:'SC'}],
  admin:'5000 units SC every 8 h (high risk) or every 12 h (standard). No monitoring needed. First dose 2 h pre-operatively where indicated.',
  dil:'No dilution. Do not aspirate or massage the injection site.',
  warn:['Still causes HIT — baseline and serial platelet counts required.','Avoid if platelets <50,000/µL or active bleeding; use mechanical prophylaxis instead.'],
  ref:['ACCP-VTE','ISCCM-VTE'] });

R({ id:'enoxaparin-tx', n:'Enoxaparin (LMWH)', sys:'anticoag', cls:'Low-molecular-weight heparin (predominant anti-Xa)',
  ind:'Treatment of DVT/PE/ACS; unstable angina; NSTEMI', pop:'adult', risk:5,
  d:{t:'mgkg', v:1, cap:180, rep:'SC every 12 h'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'0.4 mL (40 mg), 0.6 mL (60 mg), 0.8 mL (80 mg), 1 mL (100 mg) prefilled syringes', b:'Clexane (Sanofi), Enoxaparin (Intas), Enoxapar, Kleptoven', r:'SC/IV', hl:1},
      {s:'120 mg/mL', c:120, u:'mg', p:'0.8 mL (100 mg), 1 mL (120 mg), 1.25 mL (150 mg)', b:'Clexane high-concentration', r:'SC'},
      {s:'150 mg/mL', c:150, u:'mg', p:'1 mL (150 mg)', b:'Clexane 150 mg/mL', r:'SC'}],
  admin:'Treatment: 1 mg/kg SC q12 h (or 1.5 mg/kg SC once daily for uncomplicated DVT/PE). ACS: 1 mg/kg SC q12 h PLUS a 30 mg IV bolus at presentation (age <75).',
  dil:'Prefilled syringes are ready to use — expel the air bubble but do NOT purge the drug; for doses <0.4 mL use the graduated syringe presentation.',
  warn:['CrCl 15–30 mL/min → reduce to 1 mg/kg once daily. CrCl <15 → avoid, use UFH.','Platelets <50,000/µL, active bleeding, recent spinal/epidural anaesthesia (wait ≥12 h after the last dose before needle placement, ≥4 h before removal).','Anti-Xa level monitoring in obesity (>150 kg), pregnancy, renal impairment: peak 0.6–1.0 IU/mL for q12 h dosing.','Reversal: protamine 1 mg per 1 mg enoxaparin if given <8 h ago; 0.5 mg per 1 mg if 8–12 h ago (only ~60% of anti-Xa activity reversed).'],
  ref:['ACCP-VTE','ESC-PE','AHA2025-ACS','BNF'] });

R({ id:'enoxaparin-prophy', n:'Enoxaparin — VTE prophylaxis', sys:'anticoag', cls:'Low-molecular-weight heparin',
  ind:'ICU VTE prophylaxis (medical and surgical patients)', pop:'adult', risk:4,
  d:{t:'mg', v:40, cap:40, rep:'once daily SC (30 mg q12 h in high-risk trauma/orthopaedic patients)'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'0.4 mL (40 mg) prefilled syringe', b:'Clexane, Enoxaparin (Intas), Enoxapar', r:'SC', hl:1}],
  admin:'40 mg SC once daily. CrCl 30–50 mL/min: 40 mg once daily (monitor). CrCl <30: 30 mg once daily or switch to UFH 5000 units SC q12 h.',
  dil:'Ready to use.',
  warn:['Time neuraxial procedures carefully — see the treatment-dose warnings.','No benefit from dose escalation in obesity without anti-Xa monitoring.'],
  ref:['ACCP-VTE','ISCCM-VTE'] });

R({ id:'enoxaparin-pd', n:'Enoxaparin (LMWH) — paediatric', sys:'anticoag', cls:'Low-molecular-weight heparin',
  ind:'Paediatric VTE treatment and prophylaxis; prosthetic valve / cardiac shunt thrombosis', pop:'paed', risk:5,
  d:{t:'unitskg', v:100, cap:4000, rep:'SC every 12 h (target anti-Xa 0.35–0.7 IU/mL)'},
  fx:[{s:'100 mg/mL (≈100 anti-Xa IU/mg)', c:100, u:'mg', alt:[{u:'units', c:100}], p:'graduated 0.8 mL and 1 mL syringes', b:'Clexane (Sanofi), Enoxaparin (Intas)', r:'SC', hl:1}],
  admin:'Treatment: infants <2 months 1.5 mg/kg (150 units/kg) SC q12 h; children ≥2 months 1 mg/kg (100 units/kg) SC q12 h. Prophylaxis: 0.5 mg/kg (50 units/kg) SC q12 h.',
  dil:'Use a graduated syringe; for neonates dilute 100 mg/mL to 10 mg/mL with NS to improve accuracy.',
  warn:['Neonates clear LMWH faster — anti-Xa monitoring is mandatory.','Renal impairment: extend the interval, monitor anti-Xa.','Protamine partially reverses (≈60% of anti-Xa).'],
  ref:['ACCP-PEDS','BNFC','ASH-PEDS-VTE','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'fondaparinux', n:'Fondaparinux', sys:'anticoag', cls:'Synthetic selective factor Xa inhibitor',
  ind:'VTE treatment; NSTEMI where heparin is contraindicated (HIT history)', pop:'adult', risk:5,
  d:{t:'mg', lo:5, hi:10, rep:'once daily SC — <50 kg: 5 mg; 50–100 kg: 7.5 mg; >100 kg: 10 mg'},
  fx:[{s:'12.5 mg/mL', c:12.5, u:'mg', p:'0.4 mL (5 mg), 0.6 mL (7.5 mg), 0.8 mL (10 mg) prefilled syringes', b:'Arixtra (GSK), Fondif (Intas), Fondaparinux (Dr Reddy\'s)', r:'SC', hl:1},
      {s:'2.5 mg/0.5 mL (5 mg/mL)', c:5, u:'mg', p:'0.5 mL prefilled syringe (2.5 mg)', b:'Fondaparinux 2.5 mg — prophylaxis presentation', r:'SC'}],
  admin:'Prophylaxis 2.5 mg SC once daily (start 6–8 h post-op). Treatment dose is weight-banded as above; first dose may be given with UFH in ACS.',
  dil:'Ready to use — no monitoring required.',
  warn:['CONTRAINDICATED if CrCl <30 mL/min — long half-life (17 h), renally cleared, no antidote.','Contraindicated <50 kg for prophylaxis (increased bleeding).','Weight bands must be checked at every prescription — a fixed dose causes under/over-dosing.'],
  ref:['ACCP-VTE','ESC-NSTEMI','BNF'] });

R({ id:'protamine', n:'Protamine sulfate', sys:'anticoag', cls:'Heparin antagonist (cationic polypeptide)',
  ind:'Reversal of unfractionated heparin (and partial reversal of LMWH) after major bleeding or before urgent surgery', pop:'all', risk:5,
  d:{t:'mg', v:1, cap:50, rep:'1 mg neutralises ≈100 units of heparin given in the preceding 2–3 h'},
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'5 mL ampoule (50 mg)', b:'Protamine Sulphate IP — Samarth, Neon, Gland', r:'IV', hl:1}],
  admin:'1 mg IV per 100 units of heparin remaining in the body (max 50 mg per dose) infused slowly over 10 min (≤5 mg/min). Enoxaparin: 1 mg per 1 mg if <8 h since the dose, 0.5 mg per 1 mg if 8–12 h.',
  dil:'May be diluted in NS to 1 mg/mL for slower infusion.',
  warn:['Rapid injection → profound hypotension, bradycardia, pulmonary hypertension, cardiac arrest.','Anaphylaxis risk is high in patients with prior protamine exposure, NPH insulin users, diabetic patients, fish allergy, and after vasectomy.','Excess protamine itself anticoagulates — never exceed the calculated dose.','Stop heparin first; recheck aPTT 5–15 min after the dose.'],
  ref:['ACCP-VTE','BNF','MARINO'] });

/* ---------------- thrombolysis ---------------- */
R({ id:'alteplase-stroke', n:'Alteplase (rt-PA) — acute ischaemic stroke', sys:'neurocrit', cls:'Recombinant tissue plasminogen activator (fibrin-selective)',
  ind:'Acute ischaemic stroke within 4.5 h of onset (extended to 9 h / wake-up stroke with perfusion imaging per EXTEND criteria)', pop:'adult', risk:5,
  d:{t:'mgkg', v:0.9, cap:90, rep:'10% as an IV bolus over 1 min, the remaining 90% over 60 min'},
  fx:[{s:'50 mg vial → 1 mg/mL after reconstitution', c:1, u:'mg', p:'50 mg vial + 50 mL diluent', b:'Actilyse (Boehringer), Alteplase (Rochelle/Cadila), Altekin', r:'IV', hl:1, prep:'Reconstitute 50 mg with 50 mL of the supplied WFI → 1 mg/mL. Use within 24 h refrigerated, 8 h at room temperature.'},
      {s:'20 mg vial → 1 mg/mL', c:1, u:'mg', p:'20 mg vial + 20 mL diluent', b:'Actilyse 20 mg', r:'IV', prep:'Reconstitute 20 mg with 20 mL WFI → 1 mg/mL'}],
  admin:'Calculate 0.9 mg/kg (max 90 mg). Give 10% over 1 min through a dedicated line, then the remainder over exactly 60 min with an infusion pump. Do not use the same line for anything else.',
  dil:'Reconstitute to 1 mg/mL; further dilution to 0.5 mg/mL is acceptable but not below 0.2 mg/mL (adsorption/instability).',
  warn:['Exclusion checklist is mandatory before starting: BP >185/110 (lower first), INR >1.7, platelets <100,000, glucose <50 or >400 mg/dL, recent major surgery/trauma/stroke/ICH, active bleeding.','Monitor BP every 15 min × 2 h, then 30 min × 6 h, then hourly × 16 h. Hold the infusion for SBP >180 or DBP >105.','Stop immediately for severe headache, acute hypertension, nausea/vomiting or neurological deterioration → urgent CT for ICH.','Symptomatic ICH reversal: cryoprecipitate 10 units + tranexamic acid 1 g IV (or aminocaproic acid).','Never give with heparin during the infusion; start antithrombotics only 24 h after a repeat CT.'],
  notes:['Volume to infuse (mL) = the mg dose, because the reconstituted concentration is 1 mg/mL. Verify this before programming the pump.'],
  ref:['AHA2025-STROKE','AHA-STROKE-2019','IND-STROKE-GUIDE'] });

R({ id:'tenecteplase-stroke', n:'Tenecteplase (TNK) — acute ischaemic stroke', sys:'neurocrit', cls:'Modified tissue plasminogen activator (fibrin-selective, longer half-life)',
  ind:'Acute ischaemic stroke ≤4.5 h — single-bolus alternative to alteplase (TRACE-2: non-inferior)', pop:'adult', risk:5,
  d:{t:'mgkg', v:0.25, cap:25, rep:'single IV bolus over 5–10 s'},
  fx:[{s:'25 mg vial → 5 mg/mL after reconstitution', c:5, u:'mg', p:'25 mg vial + 5 mL diluent', b:'Tenecteplase (Biocon), Tnkhep, Elaxim-TNK', r:'IV', hl:1, prep:'Reconstitute 25 mg with 5 mL WFI → 5 mg/mL. Use immediately.'},
      {s:'50 mg vial → 5 mg/mL', c:5, u:'mg', p:'50 mg vial + 10 mL diluent', b:'Tenecteplase 50 mg', r:'IV', prep:'Reconstitute 50 mg with 10 mL WFI → 5 mg/mL'}],
  admin:'0.25 mg/kg IV as a SINGLE bolus over 5–10 s (max 25 mg). No infusion needed — this is the main operational advantage in a hub-and-spoke stroke network.',
  dil:'Reconstitute to 5 mg/mL; volume (mL) = dose (mg) ÷ 5.',
  warn:['Same exclusion criteria and BP monitoring as alteplase.','Do NOT confuse the 0.25 mg/kg stroke dose with the STEMI weight-band dose (30–50 mg) — a tenfold error is fatal.','Single bolus means no chance to stop the infusion: complete the checklist first.'],
  notes:['For weight >100 kg the dose is capped at 25 mg (0.25 × 100).'],
  ref:['AHA2025-STROKE','TRACE2','AHA-STROKE-2019'] });

R({ id:'tenecteplase-stemi', n:'Tenecteplase (TNK) — STEMI', sys:'anticoag', cls:'Modified tissue plasminogen activator',
  ind:'STEMI when primary PCI cannot be achieved within 120 min of first medical contact', pop:'adult', risk:5,
  d:{t:'mg', lo:30, hi:50, rep:'single IV bolus over 5–10 s — weight-banded'},
  fx:[{s:'25 mg vial → 5 mg/mL', c:5, u:'mg', p:'25 mg vial + 5 mL diluent', b:'Tenecteplase (Biocon), Tnkhep', r:'IV', hl:1, prep:'Reconstitute with 5 mL WFI → 5 mg/mL'},
      {s:'50 mg vial → 5 mg/mL', c:5, u:'mg', p:'50 mg vial + 10 mL diluent', b:'Tenecteplase 50 mg', r:'IV', prep:'Reconstitute with 10 mL WFI → 5 mg/mL'}],
  admin:'Weight-band bolus (single injection over 5–10 s): <60 kg → 30 mg (6 mL); 60–69 kg → 35 mg (7 mL); 70–79 kg → 40 mg (8 mL); 80–89 kg → 45 mg (9 mL); ≥90 kg → 50 mg (10 mL).',
  dil:'Reconstitute to 5 mg/mL. Use immediately.',
  warn:['Give with aspirin 300 mg + clopidogrel (300 mg if <75 yr, 75 mg if ≥75 yr) + enoxaparin.','Absolute contraindications: prior ICH, known structural cerebrovascular lesion, ischaemic stroke <3 months (except acute <4.5 h), active bleeding, suspected aortic dissection, significant closed head/facial trauma <3 months.','Reduce dose in severe renal impairment and age ≥75.'],
  ref:['AHA2025-ACS','ESC-STEMI','CSI-STEMI'] });

R({ id:'streptokinase-stemi', n:'Streptokinase', sys:'anticoag', cls:'Non-fibrin-selective plasminogen activator (streptococcal protein)',
  ind:'STEMI fibrinolysis — the most widely used lytic in Indian district hospitals', pop:'adult', risk:5,
  d:{t:'units', v:1500000, cap:1500000, rep:'single infusion over 60 min'},
  fx:[{s:'1,500,000 IU vial', c:15000, u:'units', p:'vial reconstituted in 100 mL NS → 15,000 IU/mL', b:'Streptase (CSL), Streptokinase (Biocon/Abbott), Streptokin', r:'IV', hl:1, prep:'Reconstitute 1.5 million IU in 100 mL 0.9% NaCl → infuse the entire 100 mL over 60 min'}],
  admin:'1.5 million IU in 100 mL NS over exactly 60 min. Do NOT give a bolus.',
  dil:'Reconstitute in NS or D5W; avoid vigorous shaking (denaturation).',
  warn:['Hypotension during infusion is common — slow the rate, give fluids, lay the patient flat.','Allergic/anaphylactic reactions: have adrenaline, hydrocortisone and antihistamine drawn up before starting.','Do not repeat within 12 months (neutralising antistreptococcal antibodies).','Same absolute contraindications as other lytics; give with aspirin + clopidogrel + heparin/enoxaparin.'],
  ref:['AHA2025-ACS','CSI-STEMI','ESC-STEMI'] });

R({ id:'alteplase-pe', n:'Alteplase — massive (high-risk) pulmonary embolism', sys:'anticoag', cls:'Tissue plasminogen activator',
  ind:'PE with sustained hypotension/obstructive shock or cardiac arrest', pop:'adult', risk:5,
  d:{t:'mgkg', lo:0.6, hi:1, cap:100, rep:'100 mg over 2 h (or 0.6 mg/kg over 2 h, max 50 mg in smaller patients)'},
  fx:[{s:'50 mg vial → 1 mg/mL', c:1, u:'mg', p:'50 mg vial × 2 + 50 mL diluent each', b:'Actilyse (Boehringer), Alteplase (Rochelle)', r:'IV', hl:1, prep:'Reconstitute each 50 mg vial with 50 mL WFI → 1 mg/mL'}],
  admin:'Standard: 100 mg IV over 2 h (no bolus). Accelerated in arrest: 50–100 mg over 15–30 min, or 10 mg bolus. Catheter-directed: 10–24 mg over 6–24 h.',
  dil:'Reconstitute to 1 mg/mL. Use a dedicated line; no other drugs.',
  warn:['In cardiac arrest, if PE is the presumed cause, give 50–100 mg over 15–30 min and continue CPR for ≥60–90 min.','Stop heparin during the infusion in the 100 mg/2 h regimen (restart when aPTT <2 × control).','Major bleeding risk ≈2%, ICH ≈0.5%.','Absolute contraindications as for stroke thrombolysis.'],
  ref:['ESC-PE','AHA2025-PE','ACCP-VTE'] });

R({ id:'txa-trauma', n:'Tranexamic acid (TXA)', sys:'anticoag', cls:'Antifibrinolytic (lysine analogue, plasminogen-binding)',
  ind:'Major trauma with significant haemorrhage (within 3 h); post-partum haemorrhage; major surgery; mucosal bleeding', pop:'adult', risk:3,
  d:{t:'g', v:1, rep:'1 g over 10 min, then 1 g over 8 h (CRASH-2 regimen)'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'5 mL ampoule (500 mg) — need 2 ampoules per gram', b:'Tranexamic Acid IP — Neon, Samarth, Troikaa; Transamin, Trapic', r:'IV/PO', hl:1},
      {s:'500 mg tablet', c:500, u:'mg', p:'strip of 10', b:'Trapic 500, Tranexa 500', r:'PO'},
      {s:'250 mg/5 mL syrup', c:50, u:'mg', p:'30 mL bottle', b:'Tranexamic syrup', r:'PO'}],
  admin:'1 g (10 mL) IV over 10 min, then 1 g in 500 mL NS/D5W over 8 h. Must be started within 3 h of injury — later administration increases death.',
  dil:'Dilute in NS, D5W or RL. Do not mix with blood products in the same line.',
  warn:['Do not give after 3 h from injury in trauma (CRASH-2 showed increased death from bleeding).','Seizure risk at high doses, especially in cardiac surgery and renal impairment.','Contraindicated in active intravascular clotting, subarachnoid haemorrhage (relative), acquired colour-vision defect.'],
  ref:['CRASH2','WOMAN-TRIAL','ISCCM-TRAUMA'] });

R({ id:'txa-paed', n:'Tranexamic acid — paediatric', sys:'anticoag', cls:'Antifibrinolytic',
  ind:'Trauma, surgery, mucosal bleeding in children', pop:'paed', risk:3,
  d:{t:'mgkg', v:15, cap:1000, rep:'over 10 min, then 2 mg/kg/h (max 100 mg/h) for up to 8 h'},
  fx:[{s:'100 mg/mL', c:100, u:'mg', p:'5 mL ampoule (500 mg)', b:'Tranexamic Acid IP — Neon, Samarth', r:'IV', hl:1}],
  admin:'15 mg/kg IV over 10 min (max 1 g), then 2 mg/kg/h infusion.',
  dil:'Dilute to 10 mg/mL for accurate paediatric measurement (500 mg in 50 mL NS).',
  warn:['Seizures at high dose; reduce in renal impairment.','No benefit after 3 h from injury in trauma.'],
  ref:['BNFC','CRASH2','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10'] });

R({ id:'vitk-warfarin', n:'Vitamin K1 (Phytomenadione)', sys:'anticoag', cls:'Fat-soluble vitamin — clotting factor II/VII/IX/X cofactor',
  ind:'Warfarin reversal; vitamin K deficiency bleeding; neonatal prophylaxis', pop:'all', risk:4,
  d:{t:'mg', lo:1, hi:10, rep:'dose depends on INR and bleeding — see notes'},
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'1 mL ampoule (10 mg)', b:'Vitamin K1 IP — Neon, Samarth, USV; UvK, Vit-K', r:'IV/IM/PO', hl:1},
      {s:'2 mg/mL (neonatal)', c:2, u:'mg', p:'0.5 mL / 1 mL ampoule', b:'Neonatal Vitamin K 2 mg/mL — Neon/Samarth', r:'IM/IV', own:{lo:0.5,hi:1,u:'mg',l:'NEONATAL prophylaxis: 1 mg IM (0.5 mg/kg IM if birth weight <1.5 kg) using the 2 mg/mL neonatal ampoule.'}},
      {s:'10 mg tablet', c:10, u:'mg', p:'strip', b:'Vitamin K tabs (limited availability in India)', r:'PO'}],
  admin:'INR 4.5–10, no bleeding: 1–2.5 mg PO (or 0.5–1 mg slow IV). INR >10, no bleeding: 2.5–5 mg PO. Major bleeding: 10 mg IV over 20–30 min PLUS 4-factor PCC 25–50 IU/kg (or FFP 15 mL/kg). Neonatal prophylaxis: 1 mg IM (0.5 mg/kg IM if birth weight <1.5 kg).',
  dil:'For IV use, dilute 10 mg in 55 mL of 5% dextrose (or blood product) and infuse over 20–30 min — do not give undiluted IV push.',
  warn:['IV vitamin K1 can cause anaphylactoid reactions and cardiorespiratory arrest if given rapidly or undiluted — always dilute and infuse slowly with resuscitation facilities available.','IM injection is contraindicated with platelets <50,000/µL or INR >2 — give IV or PO instead.','Effect on INR takes 6–24 h: it does NOT treat active bleeding on its own — give PCC/FFP as well.','Oral absorption is erratic with cholestasis or malabsorption.'],
  ref:['BSH-WARFARIN','AHA2025-ACS','BNF','IAP-NEO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

/* ---------------- blood products ---------------- */
R({ id:'ffp', n:'Fresh frozen plasma (FFP)', sys:'anticoag', cls:'Blood component — all coagulation factors',
  ind:'Major haemorrhage with coagulopathy, warfarin reversal when PCC unavailable, TTP plasma exchange, multiple factor deficiency', pop:'all', risk:4,
  d:{t:'mlkg', lo:12, hi:15, cap:2000, rep:'reassess INR/PT after each 12–15 mL/kg; repeat if INR >1.5 with bleeding'},
  fx:[{s:'1 unit ≈ 200–250 mL', c:1, u:'ml', p:'bag, ABO-compatible, thawed at 37 °C', b:'Blood bank component', r:'IV', hl:1}],
  admin:'12–15 mL/kg (≈4 units in a 70-kg adult ≈ 800–1000 mL) infused over 30–60 min per unit. Target INR <1.5 / fibrinogen >2 g/L.',
  dil:'Use a blood transfusion set with a 170–260 µm filter. Thaw in a validated water bath at 37 °C.',
  warn:['Never use FFP to "correct" an INR without bleeding — no benefit, real harm (TACO, TRALI, anaphylaxis).','ABO compatibility required (AB plasma is universal).','Volume overload — give a diuretic or use PCC for warfarin reversal.','Transfuse within 24 h of thawing; store at 1–6 °C after thawing.'],
  ref:['BSH-TRANSFUSION','ISCCM-TRAUMA','MARINO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'cryo', n:'Cryoprecipitate', sys:'anticoag', cls:'Blood component — fibrinogen, FVIII, vWF, FXIII',
  ind:'Hypofibrinogenaemia (<1.5–2 g/L) with major bleeding; DIC; massive transfusion; uremic bleeding', pop:'all', risk:4,
  d:{t:'mlkg', lo:5, hi:10, rep:'10 units (1 adult pool) in a 70-kg adult; recheck fibrinogen 1 h later'},
  fx:[{s:'1 unit ≈ 15–20 mL (≈200–250 mg fibrinogen)', c:1, u:'ml', p:'single unit or 5–10 unit pool', b:'Blood bank component', r:'IV', hl:1}],
  admin:'Adult: 10 units (or 1 unit/10 kg). Raises fibrinogen by ≈0.7–1 g/L. Target fibrinogen >1.5 g/L (>2 g/L in obstetric haemorrhage).',
  dil:'Thaw at 37 °C; ABO compatibility is preferred but not mandatory; no filter required.',
  warn:['Transfuse promptly after thawing (within 4–6 h) — fibrinogen precipitates.','Not a substitute for FFP (contains only 5 factors).'],
  ref:['BSH-TRANSFUSION','ISCCM-TRAUMA','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'platelets', n:'Platelet concentrate', sys:'anticoag', cls:'Blood component',
  ind:'Thrombocytopenia with bleeding; platelets <50,000/µL before major surgery; <20,000/µL prophylactically; <100,000/µL for neurosurgery', pop:'all', risk:4,
  d:{t:'unitskg', v:0.1, rep:'1 random-donor unit per 10 kg (≈7 units in a 70-kg adult) or 1 apheresis unit'},
  fx:[{s:'1 random-donor unit ≈ 50 mL (≈5.5 × 10¹⁰ platelets)', c:1, u:'units', p:'5–7 unit pool or single apheresis unit', b:'Blood bank component', r:'IV', hl:1}],
  admin:'1 apheresis unit or 5–7 random-donor units raises the count by ≈30,000–50,000/µL. Infuse rapidly (20–30 min).',
  dil:'ABO-compatible preferred; store at 20–24 °C with continuous gentle agitation — NEVER refrigerate.',
  warn:['Do not give prophylactically in TTP/HIT unless life-threatening bleeding.','Platelet refractoriness — check a 10–60 min post-transfusion increment.','Febrile non-haemolytic and allergic reactions are common.'],
  ref:['BSH-TRANSFUSION','ISCCM-TRAUMA','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'albumin', n:'Human albumin 20% / 5%', sys:'electrolyte', cls:'Colloid volume expander / plasma protein',
  ind:'Hepatorenal syndrome with terlipressin, large-volume paracentesis, SBP, hypoalbuminaemia with refractory shock', pop:'all', risk:3,
  d:{t:'gkg', lo:0.5, hi:1, rep:'e.g. SBP: 1.5 g/kg day 1, then 1 g/kg day 3 (max 100 g and 50 g)'},
  fx:[{s:'20% (200 mg/mL)', c:200, u:'mg', p:'50 mL bottle (10 g), 100 mL bottle (20 g)', b:'Alburel 20% (Reliance), Human Albumin 20% (Grifols/Kedrion), Plasbumin', r:'IV', hl:1},
      {s:'5% (50 mg/mL)', c:50, u:'mg', p:'250 mL / 500 mL bottle', b:'Alburel 5%, Human Albumin 5%', r:'IV'},
      {s:'25% (250 mg/mL)', c:250, u:'mg', p:'50 mL (12.5 g), 100 mL (25 g)', b:'Plasbumin 25%, Alburex 25%', r:'IV'}],
  admin:'SBP: 1.5 g/kg IV within 6 h of diagnosis (max 100 g), then 1 g/kg on day 3 (max 50 g). Large-volume paracentesis: 6–8 g of albumin per litre of ascites removed above 5 L. HRS: 20–40 g/day with terlipressin.',
  dil:'Infuse over 30–60 min through a standard giving set (no blood filter needed).',
  warn:['Rapid infusion of hyperoncogenic 20–25% albumin causes circulatory overload and pulmonary oedema — infuse slowly and monitor CVP/JVP.','Not a substitute for crystalloid in septic shock resuscitation.','Cost and supply constraints — reserve for evidence-based indications.'],
  ref:['AASLD-ASCITES','EASL-LIVER','ISCCM-LIVER','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'ddavp', n:'Desmopressin (DDAVP)', sys:'anticoag', cls:'Synthetic vasopressin V2 agonist',
  ind:'Uraemic platelet dysfunction, mild haemophilia A / von Willebrand disease bleeding, post-neurosurgical diabetes insipidus, antiplatelet-related bleeding (adjunct)', pop:'all', risk:3,
  d:{t:'mcgkg', v:0.3, cap:20, rep:'over 15–30 min; may repeat in 12 h (max 2–3 doses)'},
  fx:[{s:'15 mcg/mL', c:15, u:'mcg', p:'1 mL ampoule (15 mcg)', b:'Desmopressin (Samarth), Minirin (Ferring), DDAVP', r:'IV/SC/IN', hl:1},
      {s:'4 mcg/mL', c:4, u:'mcg', p:'1 mL ampoule (4 mcg) — some brands', b:'Desmopressin 4 mcg/mL', r:'IV/SC'},
      {s:'0.1 mg tablet', c:0.1, u:'mg', p:'strip of 10', b:'Minirin 0.1 mg, Desmopressin tabs', r:'PO', own:{lo:100,hi:400,u:'mcg',l:'ORAL desmopressin 0.1–0.4 mg (100–400 mcg) — the oral dose is 10–20× the IV/SC dose because of poor bioavailability.'}}],
  admin:'0.3 mcg/kg diluted in 50–100 mL NS infused over 15–30 min. Effect starts in 1 h, peaks at 2–4 h, lasts 8–12 h.',
  dil:'Dilute in NS; do not exceed 15 mcg/mL in the final solution.',
  warn:['Fluid restriction for 24 h — significant risk of severe hyponatraemia and seizures.','Tachyphylaxis after 2–3 doses (factor stores depleted).','Facial flushing and hypotension with rapid infusion.'],
  ref:['BSH-TRANSFUSION','BNF','MARINO','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ---------------- antiplatelets ---------------- */
R({ id:'aspirin', n:'Aspirin', sys:'anticoag', cls:'Irreversible COX-1 inhibitor (antiplatelet)',
  ind:'ACS loading, acute ischaemic stroke, secondary prevention', pop:'all', risk:3,
  d:{t:'mg', lo:75, hi:325, rep:'ACS/stroke loading 150–325 mg once (chewed), then 75–150 mg daily'},
  fx:[{s:'325 mg tablet', c:325, u:'mg', p:'strip of 14', b:'Ecosprin 325 (USV), Loprin 325', r:'PO', hl:1},
      {s:'150 mg tablet', c:150, u:'mg', p:'strip of 14', b:'Ecosprin 150, Ecosprin Gold', r:'PO'},
      {s:'75 mg tablet (enteric-coated)', c:75, u:'mg', p:'strip of 14', b:'Ecosprin 75, Loprin 75', r:'PO'},
      {s:'350 mg soluble tablet', c:350, u:'mg', p:'dispersible', b:'Disprin (Reckitt)', r:'PO'},
      {s:'100 mg/mL chewable/oral suspension (paediatric)', c:100, u:'mg', p:'bottle', b:'Aspirin paediatric suspension (limited)', r:'PO'}],
  admin:'ACS/STEMI/stroke: 150–325 mg chewed (non-enteric) immediately, then 75–150 mg once daily.',
  dil:'Enteric-coated tablets must NOT be crushed for acute loading — use the plain/dispersible form.',
  warn:['Contraindicated in active GI bleeding, aspirin-induced asthma, and children with viral illness (Reye syndrome).','Withhold for 24 h after thrombolysis in ischaemic stroke.','PPI co-prescription for patients with GI risk factors.'],
  notes:['Paediatric (Kawasaki disease): anti-inflammatory 30–50 mg/kg/day in 4 divided doses until afebrile × 48 h, then 3–5 mg/kg/day for 6–8 weeks.'],
  ref:['AHA2025-ACS','AHA2025-STROKE','ESC-ACS','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'clopidogrel', n:'Clopidogrel', sys:'anticoag', cls:'P2Y12 ADP-receptor inhibitor (thienopyridine prodrug)',
  ind:'ACS/NSTEMI/STEMI dual antiplatelet therapy, post-stent, ischaemic stroke', pop:'adult', risk:3,
  d:{t:'mg', lo:300, hi:600, rep:'loading 300–600 mg once, then 75 mg daily'},
  fx:[{s:'75 mg tablet', c:75, u:'mg', p:'strip of 14', b:'Clopilet (Sanofi), Deplatt (Torrent), Clavix (Macleods)', r:'PO', hl:1},
      {s:'300 mg tablet', c:300, u:'mg', p:'strip', b:'Clopilet 300, Deplatt 300', r:'PO'}],
  admin:'STEMI/fibrinolysis: 300 mg load (75 mg if age ≥75). PCI/NSTEMI: 600 mg load. Stroke/TIA: 300 mg load then 75 mg daily. Crush and give via NG tube if needed (bioavailability is retained).',
  dil:'No parenteral form in India — if the patient cannot absorb enteral drugs, use IV cangrelor (not available) or defer.',
  warn:['CYP2C19 loss-of-function alleles (common in Indians, ~35%) reduce efficacy — consider ticagrelor/prasugrel in high-risk PCI.','Withhold 5 days before elective CABG.','TTP is a rare but serious complication.','Avoid omeprazole/esomeprazole (CYP2C19 inhibition) — pantoprazole is preferred.'],
  ref:['AHA2025-ACS','ESC-ACS','AHA2025-STROKE'] });

R({ id:'ticagrelor', n:'Ticagrelor', sys:'anticoag', cls:'Reversible P2Y12 ADP-receptor inhibitor (cyclopentyltriazolopyrimidine)',
  ind:'ACS (STEMI/NSTEMI) — preferred over clopidogrel unless contraindicated', pop:'adult', risk:3,
  d:{t:'mg', v:180, rep:'loading 180 mg, then 90 mg twice daily'},
  fx:[{s:'90 mg tablet', c:90, u:'mg', p:'strip of 14 (Brilinta), blister of 56', b:'Brilinta (AstraZeneca), Ticaglyn (Glenmark), Ticagrelor (Cipla)', r:'PO', hl:1},
      {s:'60 mg tablet', c:60, u:'mg', p:'strip of 14', b:'Brilinta 60 mg (long-term secondary prevention)', r:'PO'}],
  admin:'180 mg load (two 90 mg tablets), then 90 mg BD. Tablets may be crushed and suspended in water for NG administration.',
  dil:'Crushed: disperse in 50 mL water, flush the tube with a further 50 mL.',
  warn:['Contraindicated with a history of intracranial haemorrhage, active bleeding, severe hepatic impairment.','Dyspnoea in ~14% — usually self-limiting, do not confuse with heart failure.','Bradycardia/ventricular pauses — avoid with digoxin caution; hold if symptomatic.','Do not co-administer with simvastatin/lovastatin >40 mg.','Withhold 3–5 days before CABG.'],
  ref:['AHA2025-ACS','ESC-ACS'] });

R({ id:'abciximab', n:'Abciximab', sys:'anticoag', cls:'Glycoprotein IIb/IIIa receptor antagonist (monoclonal Fab)',
  ind:'High-risk PCI with large thrombus burden, bail-out during PCI', pop:'adult', risk:5, inf:true,
  d:{t:'mgkg', v:0.25, cap:25, rep:'bolus 0.25 mg/kg, then infusion 0.125 mcg/kg/min (max 10 mcg/min) for 12 h'},
  diln:[{l:'50 mg in 250 mL NS → 200 mcg/mL', amt:50, in:250, u:'mg', bag:'250 mL 0.9% NaCl (filter through 0.22 µm)'}],
  fx:[{s:'2 mg/mL', c:2, u:'mg', p:'5 mL vial (10 mg)', b:'Reopro (Eli Lilly/Dr Reddy\'s), Tirofiban-class alternatives', r:'IV', hl:1}],
  admin:'0.25 mg/kg IV bolus 10–60 min before PCI (max 25 mg), then 0.125 mcg/kg/min (max 10 mcg/min) for 12 h.',
  dil:'Filter the infusion through a 0.22 µm low-protein-binding filter; do not shake.',
  warn:['Bleeding is the major risk — strict sheath-removal criteria (ACT <175 s), avoid femoral puncture if possible.','Profound thrombocytopenia within 2–4 h in ~1% (acute) — check platelets at 2 h and 6 h.','Hypotension and bradycardia; atropine and fluids usually effective.','Availability in India is limited — tirofiban or eptifibatide are common substitutes.'],
  ref:['AHA2025-ACS','ESC-ACS'] });

R({ id:'tirofiban', n:'Tirofiban', sys:'anticoag', cls:'Non-peptide GP IIb/IIIa receptor antagonist',
  ind:'High-risk NSTEMI/ACS before PCI (more widely available in India than abciximab)', pop:'adult', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.4, hi:0.75},
  diln:[{l:'25 mg in 250 mL → 100 mcg/mL (concentrated premix)', amt:25, in:250, u:'mg', bag:'250 mL 0.9% NaCl'},
        {l:'12.5 mg in 250 mL → 50 mcg/mL (standard premix)', amt:12.5, in:250, u:'mg', bag:'250 mL 0.9% NaCl'}],
  fx:[{s:'250 mcg/mL', c:250, u:'mcg', p:'20 mL vial (5 mg), 50 mL vial (12.5 mg)', b:'Aggrastat, Tirofiban (Intas/Cipla), Tirotel', r:'IV', hl:1},
      {s:'50 mcg/mL (ready-to-use)', c:50, u:'mcg', p:'250 mL bag (12.5 mg)', b:'Tirofiban premix', r:'IV-inf'}],
  admin:'High-dose bolus regimen: 25 mcg/kg IV over 5 min, then 0.15 mcg/kg/min for 18 h. Alternative: 0.4 mcg/kg/min for 30 min, then 0.1 mcg/kg/min for 48–108 h.',
  dil:'Compatible with NS and D5W; may be given with heparin via a Y-site.',
  warn:['Thrombocytopenia — check platelets at baseline, 2–6 h and daily; stop if <90,000/µL.','Reduce infusion by 50% if CrCl <60 mL/min.','Contraindicated in prior thrombocytopenia with GP IIb/IIIa inhibitors, active bleeding, stroke <30 days, severe hypertension.'],
  ref:['AHA2025-ACS','ESC-ACS'] });

/* ---------------- hypertensive emergencies ---------------- */
R({ id:'gtn-inf', n:'Nitroglycerin (Glyceryl trinitrate)', sys:'htn', cls:'Organic nitrate — NO donor (venodilator > arteriolar)',
  ind:'ACS with hypertension/pulmonary oedema, acute LV failure, hypertensive emergency, controlled hypotension', pop:'adult', risk:4, inf:true,
  d:{t:'mcgmin', lo:5, hi:200, cap:200},
  diln:[{l:'50 mg in 50 mL NS → 1 mg/mL (1000 mcg/mL) syringe pump — STANDARD', amt:50, in:50, u:'mg', bag:'50 mL 0.9% NaCl'},
        {l:'100 mg in 100 mL → 1 mg/mL', amt:100, in:100, u:'mg', bag:'100 mL 0.9% NaCl'},
        {l:'50 mg in 250 mL D5W → 200 mcg/mL (gravity set)', amt:50, in:250, u:'mg', bag:'250 mL 5% dextrose'}],
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'10 mL ampoule (50 mg); also 5 mL (25 mg)', b:'Nitroglycerin IP — Glenmark, GPO, Samarth; Nitrolab, Nitroglyc', r:'IV-inf', hl:1},
      {s:'0.5 mg sublingual tablet', c:0.5, u:'mg', p:'strip of 30', b:'Angispan (Glenmark), Nitroglycerin SL, Sorbitrate 5 mg', r:'SL', own:{a:0.5,u:'mg',l:'Sublingual GTN 0.5 mg (1 tablet) every 5 min for up to 3 doses while awaiting the infusion — stop if the systolic BP falls below 90 mmHg.'}},
      {s:'0.4 mg/metered spray', c:0.4, u:'mg', p:'200-dose spray', b:'Nitrolingual spray (import)', r:'SL', own:{a:0.4,u:'mg',l:'GTN spray 0.4 mg (1 spray) sublingually, repeated after 5 min if needed (max 3 sprays in 15 min).'}}],
  admin:'Start 5–10 mcg/min; increase by 5 mcg/min every 3–5 min (or 10 mcg/min once 20 mcg/min is reached) up to 200 mcg/min. Titrated to symptoms and BP.',
  dil:'Use glass or polyolefin containers and non-PVC tubing where possible — GTN adsorbs onto PVC (up to 40–80% loss). Prime the line.',
  warn:['Tolerance develops within 24–48 h of continuous infusion — escalate only while effective.','Headache, flushing, reflex tachycardia; profound hypotension in RV infarction, aortic stenosis and hypertrophic obstructive cardiomyopathy.','Contraindicated with PDE-5 inhibitors (sildenafil within 24 h, tadalafil within 48 h) — refractory hypotension.','Do not run through the same lumen as blood products or heparin (inactivation).'],
  ref:['AHA2025-HTN','AHA2025-ACS','ESC-HTN','BNF'] });

R({ id:'labetalol-htn', n:'Labetalol', sys:'htn', cls:'Combined α1 + non-selective β blocker (ratio IV 1:7)',
  ind:'Hypertensive emergency, aortic dissection, pre-eclampsia/eclampsia, catecholamine excess', pop:'adult', risk:4,
  d:{t:'mg', lo:20, hi:80, cap:300, rep:'20 mg over 2 min; if no response 40–80 mg every 10 min; cumulative max 300 mg'},
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'10 mL ampoule (50 mg) — availability variable in India', b:'Labetalol IP — Neon/Intas; Labeta, Trandate (import)', r:'IV/PO', hl:1},
      {s:'100 mg tablet', c:100, u:'mg', p:'strip of 10', b:'Labetalol 100 mg, 200 mg tablets', r:'PO'}],
  admin:'20 mg IV over 2 min; then 40 mg at 10 min, then 80 mg every 10 min to a maximum of 300 mg. Infusion 1–2 mg/min (0.5–2 mg/kg/h) up to 10 mg/h.',
  dil:'May be given undiluted or diluted in NS/D5W to 1 mg/mL for infusion.',
  warn:['Avoid in asthma/COPD, decompensated heart failure, second-/third-degree AV block, and cocaine/pheochromocytoma without prior α-blockade.','Hypotension is more likely in volume-depleted patients — lay flat and give fluids.','Indian IV availability is inconsistent — urapidil, esmolol, GTN or nicardipine are frequent substitutes.'],
  ref:['AHA2025-HTN','ESC-HTN','BNF'] });

R({ id:'urapidil-htn', n:'Urapidil', sys:'htn', cls:'Selective α1 antagonist + central 5-HT1A agonist',
  ind:'Hypertensive emergency/crisis, severe hypertension, controlled hypotension during surgery — widely available in India', pop:'adult', risk:4,
  d:{t:'mg', lo:12.5, hi:25, cap:75, rep:'12.5–25 mg IV over 2 min; repeat 25 mg after 15 min if needed; then infusion'},
  fx:[{s:'5 mg/mL', c:5, u:'mg', p:'5 mL ampoule (25 mg)', b:'Urapidil (Torrent), Urapid, Ebrantil (Altana/Abbott)', r:'IV', hl:1}],
  admin:'Bolus 12.5–25 mg IV slowly over 2–5 min with BP monitoring; then infusion 5–40 mg/h (usual maintenance 9 mg/h) titrated to MAP reduction ≤25% in the first hour.',
  dil:'Dilute the 25 mg ampoule in NS or D5W to 1 mg/mL; stable for 24 h.',
  warn:['Rapid injection → sudden BP drop, nausea, dizziness, bradycardia.','Do not reduce BP by more than 25% in the first hour except in aortic dissection.','Additive hypotension with other antihypertensives and anaesthetic agents.'],
  ref:['ESC-HTN','BNF','IND-HTN'] });

R({ id:'nitroprusside-htn', n:'Sodium nitroprusside', sys:'htn', cls:'Direct NO donor — balanced arteriolar and venodilator',
  ind:'Hypertensive emergency with aortic dissection, encephalopathy, malignant hypertension; controlled hypotension', pop:'adult', risk:5, inf:true,
  d:{t:'mcgkgmin', lo:0.3, hi:10},
  diln:[{l:'50 mg in 250 mL D5W → 200 mcg/mL (standard)', amt:50, in:250, u:'mg', bag:'250 mL 5% dextrose — WRAP THE BAG IN FOIL'},
        {l:'50 mg in 50 mL D5W → 1 mg/mL (syringe pump, light-protected)', amt:50, in:50, u:'mg', bag:'50 mL 5% dextrose in a light-protected syringe'}],
  fx:[{s:'50 mg vial (lyophilised)', c:50, u:'mg', p:'50 mg amber vial', b:'Nipride (Sun/Genentech), Nitroprusside (limited availability in India)', r:'IV-inf', hl:1, prep:'Reconstitute 50 mg in 2–5 mL D5W, then add to 250 mL D5W → 200 mcg/mL. Protect from light at all times.'}],
  admin:'Start 0.3–0.5 mcg/kg/min; titrate by 0.5 mcg/kg/min every 3–5 min; usual 1–6 mcg/kg/min; max 10 mcg/kg/min for ≤10 min.',
  dil:'D5W only (NS causes some degradation). Wrap the bag and the giving set in aluminium foil; discard if the solution turns dark blue/green/brown.',
  warn:['Cyanide and thiocyanate toxicity: limit to 2 mcg/kg/min for >24 h, or 4 mcg/kg/min for <3 h. Higher risk with renal/hepatic failure, malnutrition.','Signs of cyanide toxicity: unexplained metabolic acidosis, rising lactate, venous hyperoxaemia, confusion, coma.','Antidote: sodium thiosulfate 12.5 g IV (co-infused prophylactically at 1 mg per 10 mg nitroprusside); hydroxocobalamin if available.','Coronary steal; raised intracranial pressure; sudden rebound hypertension on stopping.','Invasive arterial BP monitoring is mandatory.'],
  ref:['AHA2025-HTN','ESC-HTN','MARINO'] });

R({ id:'nicardipine-htn', n:'Nicardipine', sys:'htn', cls:'Dihydropyridine calcium-channel blocker (arterial-selective)',
  ind:'Hypertensive emergency — neuroprotective profile, preferred in acute stroke/ICH and post-operative hypertension', pop:'adult', risk:4, inf:true,
  d:{t:'mghr', lo:2.5, hi:15},
  diln:[{l:'25 mg in 250 mL → 100 mcg/mL (0.1 mg/mL) standard', amt:25, in:250, u:'mg', bag:'250 mL 0.9% NaCl or D5W'},
        {l:'40 mg in 100 mL → 400 mcg/mL (fluid-restricted)', amt:40, in:100, u:'mg', bag:'100 mL 0.9% NaCl'}],
  fx:[{s:'1 mg/mL', c:1, u:'mg', p:'10 mL ampoule (10 mg) — availability limited in India', b:'Nicardipine IP (import/limited); Indian alternatives: urapidil, GTN, labetalol', r:'IV-inf', hl:1}],
  admin:'Start 5 mg/h; increase by 2.5 mg/h every 5–15 min to a maximum of 15 mg/h. Once controlled, reduce to 3 mg/h.',
  dil:'Compatible with NS, D5W, RL. Avoid PVC-contact at high concentration.',
  warn:['Reflex tachycardia, headache, peripheral oedema.','Avoid in severe aortic stenosis and advanced heart failure.','Central access preferred for concentrations >0.1 mg/mL.'],
  ref:['AHA2025-HTN','AHA2025-STROKE','ESC-HTN'] });

R({ id:'hydralazine-htn', n:'Hydralazine', sys:'htn', cls:'Direct arteriolar vasodilator',
  ind:'Hypertensive emergency in pregnancy/pre-eclampsia; adjunct in resistant hypertension', pop:'adult', risk:4,
  d:{t:'mg', lo:5, hi:20, cap:20, rep:'5–10 mg IV over 5–10 min; repeat every 20–30 min; max 40 mg/24 h'},
  fx:[{s:'20 mg/mL', c:20, u:'mg', p:'1 mL ampoule (20 mg) — availability variable', b:'Apresoline (Novartis), Hydralazine IP (Neon/Samarth)', r:'IV/IM', hl:1},
      {s:'25 mg tablet', c:25, u:'mg', p:'strip', b:'Hydralazine 25 mg, Lonitens analogues', r:'PO'}],
  admin:'Dilute 20 mg to 20 mL (1 mg/mL); give 5–10 mg IV slowly over 5–10 min. Infusion 0.5–10 mg/h.',
  dil:'Dilute immediately before use with NS — the diluted solution is unstable (use within 1 h).',
  warn:['Reflex tachycardia and increased myocardial oxygen demand — avoid as monotherapy in ACS.','Unpredictable, prolonged hypotension; can precipitate cerebral/myocardial ischaemia.','Raised intracranial pressure; lupus-like syndrome with chronic use.','In pre-eclampsia, labetalol is generally preferred (fewer fetal heart-rate abnormalities).'],
  ref:['ACOG-HTN','BNF','AHA2025-HTN'] });

R({ id:'clonidine-htn', n:'Clonidine', sys:'htn', cls:'Central α2 agonist',
  ind:'Hypertensive urgency (oral); opioid/alcohol withdrawal adjunct; ICU agitation refractory to other agents', pop:'adult', risk:3,
  d:{t:'mg', lo:0.1, hi:0.2, cap:2.4, rep:'0.1–0.2 mg PO hourly until BP controlled or 0.7 mg cumulative given'},
  fx:[{s:'100 mcg/mL', c:100, u:'mcg', p:'1 mL ampoule (100 mcg) — availability limited', b:'Catapres (BI), Clonidine IP (Neon)', r:'IV/IM/SC/PO', hl:1},
      {s:'0.1 mg tablet', c:0.1, u:'mg', p:'strip of 10', b:'Catapres 0.1 mg, Arkamin (Biochem)', r:'PO'}],
  admin:'Oral loading for hypertensive urgency: 0.1–0.2 mg, then 0.1 mg every hour up to 0.7 mg total. IV infusion 0.5–1 mcg/kg/h (max 2 mcg/kg/h).',
  dil:'Dilute 100 mcg in 10 mL NS → 10 mcg/mL.',
  warn:['Sedation, dry mouth, bradycardia, AV block.','REBOUND HYPERTENSION if stopped abruptly after >2 weeks — taper over 2–4 days.','Do not use alone in hypertensive EMERGENCY (slow, unpredictable onset).'],
  ref:['BNF','AHA2025-HTN'] });

R({ id:'nifedipine-po', n:'Nifedipine (oral, not sublingual)', sys:'htn', cls:'Dihydropyridine calcium-channel blocker',
  ind:'Hypertensive urgency; pre-eclampsia; Raynaud phenomenon — never for hypertensive emergency', pop:'adult', risk:3,
  d:{t:'mg', lo:5, hi:10, cap:20, rep:'5–10 mg PO every 20–30 min as needed'},
  fx:[{s:'10 mg capsule', c:10, u:'mg', p:'strip of 10', b:'Nicardia 10 (Sun), Nifedipine 10 mg, Depin', r:'PO', hl:1},
      {s:'10 mg retard tablet', c:10, u:'mg', p:'strip', b:'Nicardia Retard, Nifedipine SR', r:'PO'},
      {s:'20 mg sustained-release tablet', c:20, u:'mg', p:'strip', b:'Nicardia XL 20, Nifedipine CC', r:'PO'}],
  admin:'5–10 mg orally (swallow the capsule whole) for hypertensive urgency; onset 15–30 min.',
  dil:'Not applicable — oral route only.',
  warn:['SUBLINGUAL/PUNCTURED CAPSULE NIFEDIPINE IS CONTRAINDICATED — causes precipitous, uncontrollable hypotension with stroke, MI and death.','Not appropriate for hypertensive emergency — use an IV titratable agent.','Reflex tachycardia, flushing, headache, ankle oedema.'],
  ref:['AHA2025-HTN','ACOG-HTN','BNF'] });

R({ id:'phentolamine', n:'Phentolamine', sys:'htn', cls:'Non-selective α-adrenergic antagonist',
  ind:'Catecholamine crisis (pheochromocytoma, MAOI-tyramine, cocaine/amphetamine toxicity); noradrenaline extravasation', pop:'adult', risk:4,
  d:{t:'mg', lo:5, hi:10, cap:15, rep:'5 mg IV over 1 min; repeat every 5–10 min as needed'},
  fx:[{s:'10 mg/mL', c:10, u:'mg', p:'1 mL ampoule (10 mg) — limited availability in India', b:'Phentolamine (import); Regitine', r:'IV/IM/SC', hl:1}],
  admin:'Pheochromocytoma crisis: 5 mg IV (1 mg IV in children) repeated as needed. Extravasation: 5–10 mg in 10 mL NS infiltrated into the affected tissue with a fine needle within 12 h.',
  dil:'Reconstitute/dilute in NS immediately before use.',
  warn:['Profound hypotension and reflex tachycardia — always give AFTER adequate α-blockade in pheochromocytoma if β-blockade is planned (never β-block first).','Availability in India is unreliable: alternatives for catecholamine crisis are IV phentolamine substitutes such as urapidil or esmolol + GTN.','For extravasation, topical nitroglycerin 2% paste or terbutaline infiltration are used when phentolamine is unavailable.'],
  ref:['BNF','TINTINALLI','MARINO'] });
