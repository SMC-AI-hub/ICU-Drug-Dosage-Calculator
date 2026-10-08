/* =====================================================================
   PART 5 — ANTIMICROBIALS · ANTIFUNGALS · ANTIVIRALS · ANTIPARASITICS
   Indian strengths, extended-infusion guidance and renal adjustment
   ===================================================================== */

/* ---------- anti-pseudomonal β-lactams ---------- */
R({ id:'pip-tazo', n:'Piperacillin–Tazobactam', sys:'antiinfective', cls:'Ureidopenicillin + β-lactamase inhibitor',
  ind:'Empirical hospital-acquired and sepsis cover (Gram-negatives incl. Pseudomonas, anaerobes, enterococci); aspiration pneumonia; intra-abdominal sepsis', pop:'all', risk:3,
  d:{t:'mgkg', lo:50, hi:67.5, cap:4500, capDay:18000, rep:'4.5 g IV every 6 h (3.375 g q6h if CrCl 20–40 mL/min)'},
  fx:[{s:'4.5 g vial (4 g piperacillin + 0.5 g tazobactam)', c:225, u:'mg', p:'4.5 g vial reconstituted to 20 mL → 225 mg/mL', b:'Tazact (Cipla), Pipzo (Intas), Pip-Tazo (Aurobindo), Tazarin, Pip-Taz', r:'IV', hl:1, prep:'Reconstitute the 4.5 g vial with 20 mL NS or WFI → 225 mg/mL; then further dilute in 50–100 mL NS and infuse over 3–4 h'},
      {s:'3.375 g vial (paediatric)', c:225, u:'mg', p:'3.375 g vial reconstituted to 15 mL', b:'Tazact 3.375 g, Pipzo Kid', r:'IV', prep:'Reconstitute with 15 mL NS → 225 mg/mL'},
      {s:'2.25 g vial', c:225, u:'mg', p:'2.25 g vial', b:'Tazact 2.25 g', r:'IV'}],
  admin:'Adult 4.5 g IV every 6 h as a 3–4 h EXTENDED INFUSION (or continuous 13.5–18 g/24 h) — this optimises time above MIC and is associated with lower mortality in severe sepsis. Children 80–100 mg/kg of the piperacillin component every 6–8 h (max 4.5 g/dose). Febrile neutropenia: 4.5 g q6h.',
  dil:'Reconstitute then dilute in 50–100 mL NS (or D5W). Stable 24 h at room temperature, 48 h refrigerated. INCOMPATIBLE with Ringer lactate (use NS or D5W).',
  warn:['Contains 2.79 mEq (64 mg) of sodium per gram — significant in heart failure and renal failure.','Renal adjustment: CrCl 20–40 → 3.375 g q6h; CrCl <20 → 2.25 g q6h; haemodialysis → 2.25 g q8–12 h plus a 0.75 g supplement after each session.','Neurotoxicity/seizures if accumulated in renal failure.','Acute interstitial nephritis and, combined with vancomycin, an increased risk of AKI — monitor creatinine daily.','Penicillin allergy: cross-reactivity with cephalosporins is low (<2%) except with shared side chains.'],
  ref:['SANFORD','ISCCM-SEP','BNF','BSAC-ABX','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'meropenem', n:'Meropenem', sys:'antiinfective', cls:'Carbapenem (group 2)',
  ind:'ESBL/AmpC Gram-negative sepsis, meningitis, necrotising intra-abdominal infection, febrile neutropenia, hospital-acquired pneumonia', pop:'all', risk:3,
  d:{t:'mgkg', lo:30, hi:40, cap:2000, capDay:6000, rep:'1 g IV every 8 h (2 g q8h for meningitis/Pseudomonas/HAP)'},
  fx:[{s:'1 g vial', c:50, u:'mg', p:'1 g vial reconstituted with 20 mL WFI → 50 mg/mL', b:'Meronem (AstraZeneca/Pfizer), Merokind (Cipla), Mepex (Abbott), Merocel, Merox', r:'IV', hl:1, prep:'Reconstitute 1 g with 20 mL sterile WFI or NS → 50 mg/mL; then dilute in 100 mL NS and infuse over 3 h'},
      {s:'500 mg vial', c:50, u:'mg', p:'500 mg vial reconstituted with 10 mL → 50 mg/mL', b:'Meronem 500, Merokind 500', r:'IV', prep:'Reconstitute 500 mg with 10 mL WFI → 50 mg/mL'},
      {s:'125 mg vial (paediatric)', c:25, u:'mg', p:'125 mg vial reconstituted with 5 mL', b:'Meropenem 125 mg paediatric vial', r:'IV', prep:'Reconstitute with 5 mL WFI → 25 mg/mL'}],
  admin:'Adult 1 g IV q8h over 3 h (extended infusion) — 2 g q8h for meningitis, Pseudomonas pneumonia, HAP/VAP or critically ill patients with augmented renal clearance. Children 30–40 mg/kg q8h (meningitis 40 mg/kg q8h), max 2 g/dose. Neonates 20–40 mg/kg q12h (q8h if >7 days old and >1200 g).',
  dil:'Reconstitute with WFI or NS; dilute to 1–20 mg/mL for infusion. Stable 3 h at room temperature in NS, 24 h refrigerated.',
  warn:['Lowers the seizure threshold — reduce dose in renal impairment and CNS disease (still safer than imipenem).','REDUCES VALPROATE LEVELS BY 60–100% within 24 h — this combination must be avoided; use an alternative anticonvulsant or antibiotic.','Renal adjustment: CrCl 26–50 → 1 g q12h; CrCl 10–25 → 500 mg q12h; CrCl <10 → 500 mg q24h; CRRT → 1 g q8–12h; IHD → 500 mg q24h after dialysis.','Augmented renal clearance (CrCl >130 mL/min, young trauma/burns patients) may require 2 g q6h with extended infusion.'],
  ref:['SANFORD','ISCCM-SEP','IDSA-ESBL','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'imipenem', n:'Imipenem–Cilastatin', sys:'antiinfective', cls:'Carbapenem (group 1) + dehydropeptidase inhibitor',
  ind:'Polymicrobial and MDR infections, Acinetobacter, anaerobes; alternative to meropenem', pop:'adult', risk:3,
  d:{t:'mgkg', lo:15, hi:25, cap:1000, capDay:4000, rep:'500 mg IV q6h (or 1 g q8h) infused over 30–60 min'},
  fx:[{s:'500 mg imipenem + 500 mg cilastatin vial', c:50, u:'mg', p:'500 mg vial reconstituted with 10 mL NS → 50 mg/mL (must be further diluted)', b:'Tienam (MSD), Imipenem (Fresenius/Intas), Imicil, Cilam', r:'IV', hl:1, prep:'Reconstitute 500 mg with 10 mL NS, shake, transfer to 100 mL NS → 5 mg/mL; final concentration must be ≤5 mg/mL'},
      {s:'250 mg vial', c:25, u:'mg', p:'250 mg vial', b:'Imipenem 250 mg', r:'IV'}],
  admin:'500 mg IV every 6 h (or 1 g q8h) infused over 30–60 min (never faster — nausea/vomiting). Maximum 4 g/day (or 50 mg/kg/day, whichever is lower).',
  dil:'Final concentration must NOT exceed 5 mg/mL. Compatible with NS and D5W. Use within 4 h at room temperature.',
  warn:['HIGHEST SEIZURE RISK OF ALL CARBAPENEMS — avoid in CNS lesions, meningitis and renal impairment; meropenem is preferred in neuro-infection.','Nephrotoxicity and elevated transaminases.','Renal adjustment: CrCl 31–70 → 500 mg q8h; CrCl 21–30 → 500 mg q12h; CrCl 6–20 → 250–500 mg q12h; IHD → 250–500 mg q12h after dialysis.','Reduces valproate levels — avoid the combination.'],
  ref:['SANFORD','IDSA-ESBL','BNF'] });

R({ id:'ertapenem', n:'Ertapenem', sys:'antiinfective', cls:'Carbapenem (group 1) — once-daily, no Pseudomonas/Acinetobacter cover',
  ind:'Community-acquired intra-abdominal and pelvic sepsis, ESBL urinary infection, diabetic foot infection, outpatient parenteral therapy', pop:'adult', risk:3,
  d:{t:'g', v:1, cap:1, rep:'1 g IV/IM once daily'},
  fx:[{s:'1 g vial', c:100, u:'mg', p:'1 g vial reconstituted with 10 mL NS → 100 mg/mL', b:'Ertapenem (MSD/Invanz), Ertap (Cipla), Ertazen', r:'IV/IM', hl:1, prep:'Reconstitute 1 g with 10 mL NS → 100 mg/mL; dilute in 50 mL NS and infuse over 30 min'}],
  admin:'1 g IV over 30 min once daily (or 1 g IM once daily reconstituted in 1% lidocaine without adrenaline). CrCl <30 mL/min: 500 mg once daily.',
  dil:'Reconstitute with NS only (NOT dextrose or Ringer). Use within 6 h at room temperature.',
  warn:['NO activity against Pseudomonas aeruginosa, Acinetobacter or Enterococcus — do not use for hospital-acquired or ICU sepsis.','Seizures; encephalopathy in renal impairment.','Renal dose reduction is mandatory below CrCl 30 mL/min.'],
  ref:['SANFORD','IDSA-ESBL','BNF'] });

R({ id:'cefepime', n:'Cefepime', sys:'antiinfective', cls:'Fourth-generation cephalosporin',
  ind:'Pseudomonas cover, febrile neutropenia, HAP/VAP, complicated urinary sepsis, meningitis', pop:'all', risk:3,
  d:{t:'mgkg', lo:30, hi:50, cap:2000, capDay:6000, rep:'2 g IV every 8 h (febrile neutropenia/HAP); 50 mg/kg q8h in children'},
  fx:[{s:'1 g vial', c:100, u:'mg', p:'1 g vial reconstituted with 10 mL WFI → 100 mg/mL', b:'Cefepime (Ranbaxy/Sun), Maxipime (BMS), Cefimax, Taxepime', r:'IV/IM', hl:1, prep:'Reconstitute 1 g with 10 mL sterile WFI or NS → 100 mg/mL; dilute in 50–100 mL before infusion'},
      {s:'500 mg vial', c:100, u:'mg', p:'500 mg vial reconstituted with 5 mL', b:'Cefepime 500 mg, Maxipime 500', r:'IV/IM', prep:'Reconstitute with 5 mL WFI → 100 mg/mL'},
      {s:'2 g vial', c:100, u:'mg', p:'2 g vial', b:'Cefepime 2 g', r:'IV'}],
  admin:'2 g IV every 8 h infused over 3 h (extended infusion) for severe infection; 1 g q12h for moderate. Children 50 mg/kg q8h (max 2 g/dose).',
  dil:'Reconstitute then dilute in 50–100 mL NS/D5W; stable 24 h at room temperature.',
  warn:['CEFEPIME-INDUCED NEUROTOXICITY: encephalopathy, myoclonus, non-convulsive status epilepticus and coma — strongly associated with renal impairment and unadjusted dosing. Monitor mental status daily and adjust for CrCl.','Renal adjustment: CrCl 30–60 → 1–2 g q12h; CrCl 11–29 → 1–2 g q24h; CrCl <11 → 500 mg–1 g q24h; IHD → give after dialysis.','No anaerobic cover — add metronidazole for intra-abdominal sepsis.','Does not cover ESBL-producing organisms reliably.'],
  ref:['SANFORD','ISCCM-SEP','BNF','IDSA-AMP','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'ceftazidime', n:'Ceftazidime', sys:'antiinfective', cls:'Third-generation anti-pseudomonal cephalosporin',
  ind:'Pseudomonas, febrile neutropenia, meningitis, complicated urinary and respiratory infection', pop:'all', risk:3,
  d:{t:'mgkg', lo:33, hi:50, cap:2000, capDay:6000, rep:'2 g IV every 8 h (1 g q8h for less severe infection)'},
  fx:[{s:'1 g vial', c:100, u:'mg', p:'1 g vial reconstituted with 10 mL WFI → 100 mg/mL', b:'Ceftazidime IP — Intas, Neon; Taxim, Ceftum, Fortum (GSK), Ceftin-Z', r:'IV/IM', hl:1, prep:'Reconstitute 1 g with 10 mL WFI → 100 mg/mL; dilute in 100 mL NS'},
      {s:'2 g vial', c:100, u:'mg', p:'2 g vial', b:'Ceftazidime 2 g', r:'IV'},
      {s:'500 mg vial', c:100, u:'mg', p:'500 mg vial', b:'Ceftazidime 500 mg', r:'IV/IM'}],
  admin:'1–2 g IV every 8 h over 30 min (extended infusion 3 h in severe sepsis). Children 50 mg/kg q8h (meningitis 50 mg/kg q8h, max 2 g/dose).',
  dil:'Reconstitute with WFI/NS; compatible with NS, D5W and RL; use within 6 h at room temperature.',
  warn:['Induces AmpC resistance in Enterobacter, Serratia and Citrobacter — avoid as monotherapy for these organisms.','Weak Gram-positive cover (poor against MSSA and no cover for enterococci or Listeria).','Neurotoxicity in renal impairment; dose adjustment mandatory.','Renal adjustment: CrCl 31–50 → 1 g q12h; CrCl 16–30 → 1 g q24h; CrCl <16 → 500 mg q24h.'],
  ref:['SANFORD','ISCCM-SEP','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'ceftriaxone', n:'Ceftriaxone', sys:'antiinfective', cls:'Third-generation cephalosporin (long half-life, once-daily)',
  ind:'Community-acquired pneumonia, meningitis, typhoid, gonorrhoea, urinary and biliary sepsis, leptospirosis, Lyme disease, scrub typhus alternative', pop:'all', risk:3,
  d:{t:'mgkg', lo:50, hi:100, cap:2000, capDay:4000, rep:'1–2 g IV once daily (meningitis 2 g q12h)'},
  fx:[{s:'1 g vial', c:100, u:'mg', p:'1 g vial reconstituted with 10 mL WFI → 100 mg/mL', b:'Rocephin (Roche), Monocef (Aristo), Taxim-O alternatives, Ceftriaxone IP — Intas/Neon/Cipla, Taxacef', r:'IV/IM', hl:1, prep:'Reconstitute 1 g with 10 mL sterile WFI or NS → 100 mg/mL; for IM use 1% lidocaine as the diluent'},
      {s:'500 mg vial', c:100, u:'mg', p:'500 mg vial reconstituted with 5 mL', b:'Ceftriaxone 500 mg', r:'IV/IM'},
      {s:'250 mg vial (paediatric/neonatal)', c:50, u:'mg', p:'250 mg vial reconstituted with 5 mL', b:'Ceftriaxone 250 mg', r:'IV/IM'},
      {s:'2 g vial', c:100, u:'mg', p:'2 g vial', b:'Ceftriaxone 2 g', r:'IV'}],
  admin:'Adult 1–2 g IV once daily (meningitis and endocarditis 2 g every 12 h). Children 50–100 mg/kg/day once daily (max 4 g/day). Neonates 50 mg/kg once daily. Typhoid 80–100 mg/kg/day.',
  dil:'Reconstitute with WFI, NS or 1% lidocaine (IM only). Compatible with NS, D5W and RL.',
  warn:['NEVER co-administer with calcium-containing solutions (Ringer lactate, calcium gluconate) in NEONATES — fatal precipitation in the lungs and kidneys. In children and adults, flush thoroughly between infusions or use a different line.','Contraindicated in hyperbilirubinaemic neonates (displaces bilirubin from albumin → kernicterus) and in premature infants <41 weeks corrected age.','Biliary sludge and pseudolithiasis; Clostridioides difficile colitis.','No dose adjustment for renal impairment alone, but reduce to 2 g/day maximum in combined renal AND hepatic failure.','Contains no significant sodium load — suitable for heart failure.'],
  ref:['SANFORD','IAP-MENINGITIS','IDSA-MENINGITIS','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'cefotaxime', n:'Cefotaxime', sys:'antiinfective', cls:'Third-generation cephalosporin (neonatal-preferred)',
  ind:'Neonatal sepsis and meningitis (safer than ceftriaxone), paediatric sepsis, community-acquired pneumonia, spontaneous bacterial peritonitis', pop:'paed', risk:3,
  d:{t:'mgkg', lo:50, hi:100, cap:2000, capDay:12000, rep:'50 mg/kg IV every 6–8 h (meningitis 50 mg/kg q6h)'},
  fx:[{s:'1 g vial', c:100, u:'mg', p:'1 g vial reconstituted with 10 mL WFI → 100 mg/mL', b:'Cefotax (Neon), Taxim (Sanofi/Aventis), Cefotaxime IP — Claris, Intas; Otocef', r:'IV/IM', hl:1, prep:'Reconstitute 1 g with 10 mL sterile WFI → 100 mg/mL'},
      {s:'500 mg vial', c:100, u:'mg', p:'500 mg vial reconstituted with 5 mL', b:'Cefotaxime 500 mg', r:'IV/IM'},
      {s:'250 mg vial', c:50, u:'mg', p:'250 mg vial reconstituted with 5 mL', b:'Cefotaxime 250 mg', r:'IV/IM'}],
  admin:'Neonate <1 week / <1200 g: 50 mg/kg IV q12h. Neonate 1–4 weeks: 50 mg/kg q8h. Infant/child: 50 mg/kg q6–8h (meningitis q6h), max 2 g/dose and 12 g/day.',
  dil:'Reconstitute with WFI or NS; dilute in 10–50 mL for infusion over 20–30 min.',
  warn:['PREFERRED over ceftriaxone in neonates — no bilirubin displacement and no calcium-precipitation risk.','Short half-life requires 6–8 hourly dosing.','No enterococcal, Listeria or anaerobic cover.','Renal adjustment if CrCl <20 mL/min: halve the dose.'],
  ref:['SANFORD','IAP-NEO-SEPSIS','WHO-NEO','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','NELSON','GHAI10','IAP-STG'] });

R({ id:'cefoperazone-sulbactam', n:'Cefoperazone–Sulbactam', sys:'antiinfective', cls:'Third-generation cephalosporin + β-lactamase inhibitor',
  ind:'Very widely used in Indian ICUs for Acinetobacter and mixed Gram-negative/anaerobic sepsis; HAP/VAP', pop:'adult', risk:3,
  d:{t:'g', lo:1.5, hi:3, capDay:12, rep:'3 g IV every 8 h (high-dose regimen; 1.5 g q8h for moderate infection)'},
  fx:[{s:'3 g vial (2 g cefoperazone + 1 g sulbactam)', c:300, u:'mg', p:'3 g vial reconstituted with 7.2 mL WFI → 417 mg/mL; dilute further', b:'Magnex Forte (Lupin), Cefoperaz (Cipla), Sulcef, Cefoper-S, Operaz', r:'IV/IM', hl:1, prep:'Reconstitute the 3 g vial with 7.2 mL sterile WFI, then dilute in 100 mL NS and infuse over 30–60 min'},
      {s:'1.5 g vial (1 g cefoperazone + 0.5 g sulbactam)', c:150, u:'mg', p:'1.5 g vial reconstituted with 3.6 mL', b:'Magnex 1.5 g, Cefoperaz-S 1.5 g', r:'IV/IM'},
      {s:'0.75 g vial (paediatric)', c:75, u:'mg', p:'0.75 g vial', b:'Magnex 750 mg', r:'IV'}],
  admin:'Moderate 1.5 g IV q12h; severe 3 g IV q8h (or 1.5 g q6h). Maximum sulbactam 4 g/day. Children 25–100 mg/kg/day of the cefoperazone component divided q8–12 h.',
  dil:'Reconstitute then dilute in NS or D5W; infuse over 30–60 min.',
  warn:['DISULFIRAM-LIKE REACTION with alcohol (flushing, sweating, headache, tachycardia) — cefoperazone has an N-methylthiotetrazole side chain. Avoid alcohol during therapy and for 5 days after.','Vitamin K-dependent hypoprothrombinaemia and bleeding — check PT/INR weekly and give vitamin K 10 mg weekly prophylactically in high-risk patients.','Evidence for Acinetobacter is largely observational; sulbactam is the active component against Acinetobacter — high-dose sulbactam (≥4 g/day) is needed.','No renal adjustment needed for cefoperazone (biliary excretion) — a practical advantage in AKI.'],
  ref:['SANFORD','ISCCM-ABX','IAP-HAP','BSAC-ABX','IAP-STG'] });

R({ id:'amp-sulbactam', n:'Ampicillin–Sulbactam', sys:'antiinfective', cls:'Aminopenicillin + β-lactamase inhibitor',
  ind:'Aspiration pneumonia, diabetic foot, head/neck infection, intra-abdominal sepsis, Listeria cover (high-dose ampicillin), dog/human bites', pop:'all', risk:2,
  d:{t:'g', lo:1.5, hi:3, capDay:12, rep:'3 g IV every 6 h (12 g/day maximum)'},
  fx:[{s:'3 g vial (2 g ampicillin + 1 g sulbactam)', c:300, u:'mg', p:'3 g vial reconstituted with 9.6 mL WFI → 312 mg/mL', b:'Unasyn (Pfizer), Ampicillin-Sulbactam IP — Claris/Intas; Sulbactum, Combisyn', r:'IV/IM', hl:1, prep:'Reconstitute with 9.6 mL WFI, then dilute in 100 mL NS and infuse over 15–30 min'},
      {s:'1.5 g vial (1 g + 0.5 g)', c:150, u:'mg', p:'1.5 g vial reconstituted with 4.8 mL', b:'Unasyn 1.5 g, Ampicillin-Sulbactam 1.5 g', r:'IV/IM'},
      {s:'Sultamicillin 375 mg tablet (oral prodrug)', c:375, u:'mg', p:'strip of 6', b:'Unasyn-S, Sultamicillin (Pfizer)', r:'PO'}],
  admin:'Adult 3 g IV every 6 h. Children 200–300 mg/kg/day of the ampicillin component divided q6h. Listeria meningitis: ampicillin 2 g IV every 4 h (12 g/day) ± gentamicin.',
  dil:'Reconstitute with WFI; dilute in 50–100 mL NS; use within 1 h of reconstitution (stability is short).',
  warn:['Frequent dosing (q6h) and short stability are practical limitations.','Renal adjustment: CrCl 15–30 → q12h; CrCl 5–15 → q24h.','Diarrhoea and C. difficile colitis.','Sultamicillin oral tablets are useful for step-down therapy.'],
  ref:['SANFORD','IDSA-MENINGITIS','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ---------- new β-lactam / β-lactamase inhibitor combinations ---------- */
R({ id:'ceftaz-avi', n:'Ceftazidime–Avibactam', sys:'antiinfective', cls:'Cephalosporin + novel diazabicyclooctane β-lactamase inhibitor',
  ind:'Carbapenem-resistant Enterobacterales (KPC, OXA-48), complicated urinary and intra-abdominal infection, HAP/VAP. NOT active against metallo-β-lactamases (NDM-1 — the commonest carbapenemase in India)', pop:'adult', risk:4,
  d:{t:'g', v:2.5, cap:2.5, capDay:7.5, rep:'2.5 g IV every 8 h infused over 2 h'},
  fx:[{s:'2.5 g vial (2 g ceftazidime + 0.5 g avibactam)', c:208, u:'mg', p:'2.5 g vial reconstituted with 12 mL WFI → 208 mg/mL; dilute in 100 mL NS', b:'Zavicefta (Pfizer/Allergan), Ceftazidime-Avibactam (Cipla/Aurobindo generics)', r:'IV', hl:1, prep:'Reconstitute with 12 mL sterile WFI, then dilute in 100 mL NS and infuse over 2 h'}],
  admin:'2.5 g IV every 8 h as a 2-hour infusion for 5–14 days.',
  dil:'Reconstitute with WFI or NS; final concentration 8–40 mg/mL; use within 12 h at room temperature or 24 h refrigerated.',
  warn:['Check the carbapenemase genotype: ceftazidime–avibactam is INACTIVE against NDM/VIM/IMP metallo-β-lactamases, which predominate in India. Combine with aztreonam for MBL producers.','Renal adjustment: CrCl 31–50 → 1.25 g q8h; CrCl 16–30 → 0.94 g q8h; CrCl ≤15 → 0.94 g q24h.','Coombs-positive haemolytic anaemia, C. difficile colitis.','Very expensive — restrict to culture-proven CRE with an infectious-disease review.'],
  ref:['SANFORD','IDSA-AMR','ISCCM-AMR','ESCMID-CRE'] });

R({ id:'cefiderocol', n:'Cefiderocol', sys:'antiinfective', cls:'Siderophore cephalosporin ("Trojan horse")',
  ind:'Carbapenem-resistant Gram-negatives including metallo-β-lactamase (NDM) producers, Pseudomonas, Acinetobacter, Stenotrophomonas', pop:'adult', risk:4,
  d:{t:'g', v:2, cap:2, capDay:6, rep:'2 g IV every 8 h infused over 3 h'},
  fx:[{s:'1 g vial (cefiderocol tosylate)', c:50, u:'mg', p:'1 g vial reconstituted with 10 mL NS → 100 mg/mL; then dilute in 100 mL NS', b:'Fetroja (Shionogi) — limited/compassionate availability in India', r:'IV', hl:1, prep:'Reconstitute each 1 g vial with 10 mL NS, shake, then dilute in 100 mL NS; final concentration 8–20 mg/mL'}],
  admin:'2 g IV every 8 h over 3 hours. Renal adjustment: CrCl 30–59 → 1.5 g q8h; CrCl 15–29 → 1 g q8h; CrCl <15 → 0.75 g q8h; give after dialysis.',
  dil:'Must be reconstituted and diluted in NS ONLY (calcium-containing and dextrose solutions are incompatible). Use within 4 h at room temperature.',
  warn:['Higher all-cause mortality was observed in MDR Gram-negative infections without an alternative (CREDIBLE-CR) — reserve for cases with no other option.','Infusion-related reactions, seizures, C. difficile colitis.','Availability in India is via named-patient/import route — plan ahead.'],
  ref:['SANFORD','IDSA-AMR','ISCCM-AMR'] });

/* ---------- glycopeptides / anti-MRSA ---------- */
R({ id:'vancomycin', n:'Vancomycin', sys:'antiinfective', cls:'Glycopeptide (cell-wall inhibitor)',
  ind:'MRSA bacteraemia, endocarditis, pneumonia, meningitis, skin/soft-tissue infection; empirical Gram-positive cover in device-related sepsis', pop:'all', risk:5,
  d:{t:'mgkg', lo:15, hi:20, cap:2000, capDay:4000, rep:'15–20 mg/kg IV every 8–12 h; LOADING DOSE 25–30 mg/kg in critically ill patients'},
  fx:[{s:'500 mg vial', c:50, u:'mg', p:'500 mg vial reconstituted with 10 mL WFI → 50 mg/mL; dilute to ≤5 mg/mL', b:'Vancocin (Eli Lilly), Vancomycin IP — Claris, Neon, Cipla; Glycovanc, Vancocid', r:'IV/PO', hl:1, prep:'Reconstitute 500 mg with 10 mL sterile WFI, then dilute in 100–250 mL NS or D5W to a final concentration of ≤5 mg/mL'},
      {s:'1 g vial', c:50, u:'mg', p:'1 g vial reconstituted with 20 mL WFI → 50 mg/mL; dilute to ≤5 mg/mL', b:'Vancocin 1 g, Vancomycin 1 g (Claris/Neon)', r:'IV', prep:'Reconstitute 1 g with 20 mL WFI, then dilute in at least 200 mL NS/D5W'},
      {s:'250 mg capsule (oral — for C. difficile only)', c:250, u:'mg', p:'strip/bottle', b:'Vancocin 250 mg capsules, Vancoled', r:'PO', own:{a:125,u:'mg',l:'ORAL vancomycin 125 mg PO q6h (500 mg q6h plus IV metronidazole for fulminant C. difficile). Oral vancomycin is NOT absorbed — it treats only colitis and is useless for systemic infection.'}}],
  admin:'Loading dose 25–30 mg/kg IV (max 3 g) in critically ill patients, then 15–20 mg/kg every 8–12 h INFUSED OVER AT LEAST 60 MIN (or 1 h per gram, whichever is longer). Target AUC₀₋₂₄/MIC 400–600 (equivalent to a trough of 15–20 mg/L for MIC ≤1).',
  dil:'Final concentration must be ≤5 mg/mL (10 mg/mL may be used via a central line). Compatible with NS and D5W. Stable 14 days refrigerated.',
  warn:['RED-MAN SYNDROME (histamine-mediated flushing, pruritus, hypotension) — prevent by infusing at ≤10 mg/min (never faster), pre-medicating with an antihistamine, and ensuring adequate hydration. It is a rate reaction, NOT an allergy.','NEPHROTOXICITY — risk rises with troughs >20 mg/L, concurrent piperacillin-tazobactam, aminoglycosides, amphotericin or contrast. Check creatinine daily and trough levels from the 4th dose.','Therapeutic drug monitoring is mandatory: draw the trough immediately BEFORE the next dose at steady state (4th dose) or use AUC-guided Bayesian dosing.','Oral vancomycin is NOT absorbed — it treats only C. difficile colitis; it is useless for systemic infection.','IV vancomycin does not treat C. difficile.','Dose reduction required in renal impairment; dosing by levels in dialysis patients.'],
  ref:['SANFORD','IDSA-MRSA','ASHP-VANCO','ISCCM-AMR','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'teicoplanin', n:'Teicoplanin', sys:'antiinfective', cls:'Glycopeptide (long half-life, once-daily)',
  ind:'MRSA and Gram-positive infection where vancomycin is poorly tolerated, red-man syndrome or difficult venous access; bone/joint infection', pop:'adult', risk:4,
  d:{t:'mgkg', lo:6, hi:12, cap:800, rep:'loading 12 mg/kg IV q12h × 3 doses, then 6–12 mg/kg IV/IM once daily'},
  fx:[{s:'400 mg vial', c:133, u:'mg', p:'400 mg vial with 3 mL ampoule of WFI → ≈133 mg/mL', b:'Targocid (Sanofi), Teicoplanin (Cipla/Intas/Lupin), Teicomac, T-Plan', r:'IV/IM', hl:1, prep:'Add the 3 mL ampoule of WFI slowly down the vial wall, roll gently (DO NOT shake — foaming causes under-dosing) until fully dissolved; use immediately or dilute in NS'},
      {s:'200 mg vial', c:67, u:'mg', p:'200 mg vial with 3 mL WFI → ≈67 mg/mL', b:'Targocid 200 mg, Teicoplanin 200 mg', r:'IV/IM', prep:'Add 3 mL WFI, roll gently until dissolved'}],
  admin:'Loading 12 mg/kg IV every 12 h for 3 doses, then maintenance 6 mg/kg once daily (12 mg/kg once daily for endocarditis, bone/joint infection, neutropenia, or BMI >40).',
  dil:'Reconstituted solution may be given IV bolus over 3–5 min or IM directly. May be added to NS/D5W.',
  warn:['Foaming during reconstitution is the commonest cause of under-dosing — roll, never shake, and allow the foam to settle.','Thrombocytopenia, neutropenia, elevated transaminases — monitor weekly FBC and LFTs.','Nephrotoxicity and ototoxicity (less than vancomycin but still present).','Renal adjustment: CrCl 30–60 → maintenance every 48 h; CrCl <30 → every 72 h.','Trough level monitoring where available: target >15 mg/L (≥20 mg/L for endocarditis/bone).'],
  ref:['SANFORD','IDSA-MRSA','BNF','BSAC-ABX'] });

R({ id:'linezolid', n:'Linezolid', sys:'antiinfective', cls:'Oxazolidinone (protein synthesis inhibitor, 50S)',
  ind:'MRSA and vancomycin-resistant enterococcus pneumonia/bacteraemia, complicated skin-soft-tissue infection, CNS infection (excellent CSF penetration), MDR-TB', pop:'all', risk:4,
  d:{t:'mg', v:600, cap:600, capDay:1200, rep:'600 mg IV or PO every 12 h'},
  fx:[{s:'2 mg/mL (600 mg/300 mL) ready-to-use infusion', c:2, u:'mg', p:'300 mL bag (600 mg) — no reconstitution needed', b:'Linezolid Injection IP — Fresenius/Kabi, Cipla, Intas; Zyvox (Pfizer), Linox, Zyline', r:'IV', hl:1},
      {s:'600 mg tablet', c:600, u:'mg', p:'strip of 10', b:'Zyvox 600, Linox 600, Linezolid 600 (Cipla/Intas)', r:'PO'},
      {s:'100 mg/5 mL oral suspension', c:20, u:'mg', p:'150 mL bottle', b:'Zyvox suspension, Linezolid suspension', r:'PO'}],
  admin:'600 mg IV (over 30–120 min) or PO every 12 h. Oral bioavailability is ~100% — switch to the tablet as soon as the gut works. Children 10 mg/kg q8h (<12 yr) or q12h (≥12 yr), max 600 mg/dose.',
  dil:'The 300 mL bag is ready to use — DO NOT add other drugs; do not use in series connections.',
  warn:['NO renal or hepatic dose adjustment is required — a major advantage in AKI.','THROMBOCYTOPAENIA and anaemia after >10–14 days — monitor FBC twice weekly; stop if platelets fall.','Serotonin syndrome with SSRIs, SNRIs, tramadol, fentanyl, MAOIs, triptans, pethidine — linezolid is a weak reversible MAO inhibitor.','Optic and peripheral neuropathy with courses >28 days (may be irreversible) — assess vision and symptoms monthly.','Lactic acidosis; hypoglycaemia (rare).'],
  ref:['SANFORD','IDSA-MRSA','ISCCM-AMR','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'daptomycin', n:'Daptomycin', sys:'antiinfective', cls:'Cyclic lipopeptide (membrane depolarising agent)',
  ind:'MRSA/VRE bacteraemia, right-sided endocarditis, complicated skin-soft-tissue infection, vancomycin failure or intolerance. INEFFECTIVE IN PNEUMONIA', pop:'adult', risk:4,
  d:{t:'mgkg', lo:6, hi:12, capDay:1200, rep:'6 mg/kg IV once daily (8–12 mg/kg for bacteraemia/endocarditis/obesity)'},
  fx:[{s:'500 mg vial', c:50, u:'mg', p:'500 mg vial reconstituted with 10 mL NS → 50 mg/mL', b:'Dapton (Cipla), Cubicin (Novartis/MSD), Daptomycin (Intas), Dapxo', r:'IV', hl:1, prep:'Reconstitute 500 mg with 10 mL 0.9% NaCl, swirl gently (do not shake) for 2–3 min; final concentration 50 mg/mL'},
      {s:'350 mg vial', c:50, u:'mg', p:'350 mg vial reconstituted with 7 mL NS', b:'Cubicin 350 mg', r:'IV'}],
  admin:'6 mg/kg IV over 2 min (or 30–90 min infusion) once daily; 8–12 mg/kg for S. aureus bacteraemia, endocarditis or persistent infection. Use ideal/adjusted body weight in obesity.',
  dil:'Reconstitute with NS or Ringer lactate ONLY (dextrose is incompatible). Give within 12 h refrigerated.',
  warn:['INACTIVATED BY PULMONARY SURFACTANT — NEVER use for pneumonia, including MRSA pneumonia.','MYOPATHY and rhabdomyolysis — check CK at baseline and weekly (more often in renal impairment, with statins, or if muscle symptoms develop). Stop for CK >5 × ULN with symptoms or >10 × ULN asymptomatic.','Hold statins during therapy.','Eosinophilic pneumonia (rare, 2–4 weeks into therapy).','Renal adjustment: CrCl <30 mL/min → every 48 h.'],
  ref:['SANFORD','IDSA-MRSA','ISCCM-AMR','BNF'] });

R({ id:'clindamycin', n:'Clindamycin', sys:'antiinfective', cls:'Lincosamide (50S protein synthesis inhibitor)',
  ind:'Anaerobic and Gram-positive infection, necrotising soft-tissue infection (toxin suppression in toxic shock and necrotising fasciitis), aspiration pneumonia, PCP alternative, cerebral toxoplasmosis', pop:'all', risk:3,
  d:{t:'mgkg', lo:10, hi:15, cap:900, capDay:2700, rep:'600–900 mg IV every 8 h'},
  fx:[{s:'150 mg/mL', c:150, u:'mg', p:'2 mL ampoule (300 mg), 4 mL ampoule (600 mg), 6 mL ampoule (900 mg)', b:'Clindamycin IP — Neon, Intas; Dalacin C (Pfizer), Clindacin, Clynam', r:'IV/IM/PO', hl:1},
      {s:'150 mg / 300 mg capsules', c:300, u:'mg', p:'strip of 10', b:'Dalacin 300, Clindamycin 300', r:'PO'},
      {s:'15 mg/mL oral solution', c:15, u:'mg', p:'bottle (limited)', b:'Clindamycin palmitate oral solution', r:'PO'}],
  admin:'300–900 mg IV every 6–8 h (max 2700 mg/day; 4800 mg/day in life-threatening infection). Children 25–40 mg/kg/day divided q6–8h.',
  dil:'MUST be diluted — concentrations >18 mg/mL and rates >30 mg/min cause cardiac arrest and hypotension. Dilute 600 mg in 50–100 mL NS/D5W and infuse over 30–60 min.',
  warn:['NEVER give as an IV bolus — hypotension, arrhythmia and cardiac arrest.','CLOSTRIDIOIDES DIFFICILE COLITIS is the highest-risk antibiotic association — stop immediately for diarrhoea.','Poor CSF penetration (even with inflamed meninges) — not for meningitis.','No Gram-negative cover.'],
  ref:['SANFORD','IDSA-NSTI','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ---------- aminoglycosides ---------- */
R({ id:'amikacin', n:'Amikacin', sys:'antiinfective', cls:'Aminoglycoside (30S protein synthesis inhibitor, bactericidal)',
  ind:'MDR Gram-negative sepsis, urinary sepsis, synergy in endocarditis, MDR-TB, once-daily extended-interval dosing', pop:'all', risk:5,
  d:{t:'mgkg', lo:15, hi:20, capDay:1500, rep:'15–20 mg/kg IV once daily (extended-interval) — use IDEAL body weight, or adjusted body weight if obese'},
  fx:[{s:'250 mg/mL', c:250, u:'mg', p:'2 mL ampoule (500 mg)', b:'Amikacin Sulphate IP — Neon, Intas, Claris, Samarth; Amikin (Bristol), Miplor', r:'IV/IM', hl:1},
      {s:'100 mg/mL', c:100, u:'mg', p:'2 mL ampoule (200 mg), 4 mL ampoule (400 mg)', b:'Amikacin 100 mg/mL — Neon/Intas (paediatric-friendly strength)', r:'IV/IM'},
      {s:'50 mg/mL', c:50, u:'mg', p:'2 mL ampoule (100 mg) — neonatal', b:'Amikacin 50 mg/mL', r:'IV/IM'}],
  admin:'Extended-interval: 15–20 mg/kg (based on ideal/adjusted body weight) IV over 30–60 min once daily in patients with normal renal function and no ascites/burns/oedema. Traditional: 7.5 mg/kg q12h. Neonates: 15 mg/kg q24h (<7 days or <1200 g: q48h).',
  dil:'Dilute in 100–200 mL NS or D5W (5 mg/mL typical) and infuse over 30–60 min (over 1–2 h in children).',
  warn:['NEPHROTOXICITY and OTOTOXICITY (vestibular and cochlear, often irreversible) — risk increases with cumulative dose >15 g, duration >7–10 days, renal impairment, concurrent vancomycin/amphotericin/loop diuretics/cisplatin, and advanced age.','Monitor a level: for once-daily dosing draw a level 6–14 h after the start and use a nomogram (target <5 mg/L at 12 h; ideally undetectable before the next dose). Peak target 20–30 mg/L.','Check creatinine daily; hold if creatinine rises >25% or urine output falls.','Contraindicated in myasthenia gravis and other neuromuscular disorders (potentiates blockade).','In obesity use ADJUSTED body weight: IBW + 0.4 × (TBW − IBW). In burns, ascites and pregnancy use total body weight with level monitoring.'],
  ref:['SANFORD','ISCCM-AMR','BNF','ATS-AMINOGLYCOSIDE','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'gentamicin', n:'Gentamicin', sys:'antiinfective', cls:'Aminoglycoside',
  ind:'Gram-negative sepsis, synergy for enterococcal/streptococcal endocarditis, leptospirosis, tularaemia, plague, neonatal sepsis', pop:'all', risk:5,
  d:{t:'mgkg', lo:5, hi:7, capDay:500, rep:'5–7 mg/kg IV once daily (extended-interval); neonatal sepsis 4–5 mg/kg once daily'},
  fx:[{s:'40 mg/mL', c:40, u:'mg', p:'1 mL ampoule (40 mg), 2 mL ampoule (80 mg)', b:'Gentamicin Sulphate IP — Samarth, Neon, Claris, Intas; Genticyn, Gentacin', r:'IV/IM', hl:1},
      {s:'10 mg/mL (paediatric)', c:10, u:'mg', p:'2 mL ampoule (20 mg)', b:'Gentamicin 10 mg/mL', r:'IV/IM'},
      {s:'20 mg/mL', c:20, u:'mg', p:'2 mL ampoule (40 mg)', b:'Gentamicin 20 mg/mL', r:'IV/IM'}],
  admin:'5–7 mg/kg IV once daily over 30–60 min (extended-interval). Endocarditis synergy: 3 mg/kg/day divided q8h. Neonates ≥35 weeks >7 days: 4–5 mg/kg q24h; <35 weeks or <7 days: 4–5 mg/kg q36–48h.',
  dil:'Dilute in 50–100 mL NS or D5W; infuse over 30–60 min (2 h in children).',
  warn:['Same nephrotoxicity and ototoxicity profile as amikacin — mandatory level monitoring and daily creatinine.','Target peak 5–10 mg/L; for once-daily dosing draw a level at 6–14 h and use a nomogram (target <1 mg/L pre-dose).','Physically incompatible with β-lactams in the same line — flush or use separate access.','Contraindicated in myasthenia gravis.','Use ideal body weight for dosing in adults; adjusted body weight if obese.'],
  ref:['SANFORD','ISCCM-SEP','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ---------- polymyxins ---------- */
R({ id:'colistin', n:'Colistin (Colistimethate sodium, CMS)', sys:'antiinfective', cls:'Polymyxin E — cationic detergent acting on Gram-negative membranes',
  ind:'Carbapenem-resistant Acinetobacter baumannii, Pseudomonas and Klebsiella pneumoniae (last-resort agent)', pop:'adult', risk:5,
  d:{t:'units', lo:9000000, hi:9000000, capDay:9000000, rep:'LOADING DOSE 9 million IU (=300 mg colistin base activity, CBA) IV over 0.5–1 h, then maintenance'},
  fx:[{s:'4.5 million IU vial (≈150 mg CBA)', c:4500000, u:'units', per:'vial', p:'4.5 MIU vial reconstituted with 10 mL WFI', b:'Colimycin (Pfizer/Abbott), Colistar (Glenmark), Promixin, Colistimethate Sodium IP — Neon/Intas', r:'IV/NEB', hl:1, prep:'Reconstitute each 4.5 MIU vial with 10 mL sterile WFI (do not shake vigorously), then dilute in 100–250 mL NS and infuse over 0.5–1 h'},
      {s:'1 million IU vial (≈34 mg CBA)', c:1000000, u:'units', per:'vial', p:'1 MIU vial', b:'Colimycin 1 MIU, Colistar 1 MIU', r:'IV/NEB', prep:'Reconstitute with 5 mL WFI'},
      {s:'125,000 IU/mL oral suspension (colistin sulfate)', c:125000, u:'units', p:'bottle — NOT absorbed systemically', b:'Colimycin oral suspension, Colisone', r:'PO', own:{text:'Oral colistin SULFATE (not colistimethate) 1–2 million IU/kg/day in divided doses is a non-absorbed gut decontaminant. It is a DIFFERENT salt from the IV/nebulised colistimethate sodium and the two must never be interchanged.'}}],
  admin:'2019 INTERNATIONAL CONSENSUS DOSING: loading dose 9 MIU (≈300 mg CBA) IV over 0.5–1 h regardless of renal function, then maintenance 4.5 MIU (150 mg CBA) q12h if CrCl ≥50 mL/min; 3 MIU q12h for CrCl 30–49; 2.25 MIU q12h for CrCl 10–29; 1.5 MIU q24h for CrCl <10; give after dialysis. Infuse the maintenance dose over 0.5–1 h.',
  dil:'Reconstitute with WFI, dilute in NS (or D5W) to ≤50,000 IU/mL; use within 2 h of preparation (degrades rapidly at room temperature).',
  warn:['UNIT CONFUSION IS THE COMMONEST CAUSE OF MASSIVE OVERDOSE: 1 MIU colistimethate ≈ 33.4 mg CBA ≈ 34 mg colistin. Indian vials may be labelled in MIU or in mg CBA — ALWAYS confirm which one before calculating.','NEPHROTOXICITY in up to 50–60% — check creatinine daily; it is dose-dependent and usually reversible.','NEUROTOXICITY: paraesthesiae, dizziness, neuromuscular blockade → apnoea (potentiated by aminoglycosides, NMBAs, myasthenia gravis).','Do NOT give the loading dose more than once; the maintenance dose starts 12–24 h after the load.','Nebulised colistin 1–2 MIU q8–12h is an adjunct for MDR Gram-negative VAP (adjunct, not a substitute for IV therapy).','No activity against Proteus, Providencia, Serratia, Burkholderia or Gram-positives.'],
  ref:['SANFORD','ISCCM-AMR','CONSENSUS-COLISTIN','ESCMID-CRE','BNF'] });

R({ id:'polymyxinB', n:'Polymyxin B sulfate', sys:'antiinfective', cls:'Polymyxin — active drug (not a prodrug; no CBA/IU conversion needed)',
  ind:'Carbapenem-resistant Acinetobacter, Pseudomonas, Enterobacterales — increasingly preferred over colistin in Indian ICUs', pop:'adult', risk:5,
  d:{t:'unitskg', lo:20000, hi:25000, capDay:2000000, rep:'LOADING 20,000–25,000 IU/kg (2–2.5 mg/kg) IV over 1 h, then 12,500–15,000 IU/kg (1.25–1.5 mg/kg) q12h'},
  fx:[{s:'50,000 IU vial (≈5 mg)', c:50000, u:'units', p:'50,000 IU vial reconstituted with 5 mL NS → 10,000 IU/mL', b:'Polymyxin B for Injection IP — Bharat Parentals, Neon, Intas, Gland; Poly B, X-Poly', r:'IV', hl:1, prep:'Reconstitute 50,000 IU with 5 mL NS → 10,000 IU/mL; dilute in 250–500 mL NS and infuse over 1 h'},
      {s:'750,000 IU vial (≈75 mg)', c:750000, u:'units', p:'750,000 IU vial', b:'Polymyxin B 750,000 IU (limited brands)', r:'IV', prep:'Reconstitute with 10 mL NS'}],
  admin:'Loading 2–2.5 mg/kg (20,000–25,000 IU/kg) IV over 1 h, then 1.25–1.5 mg/kg (12,500–15,000 IU/kg) every 12 h, each dose infused over 1 h. Use ACTUAL body weight; cap the dose at 200 mg/day in most protocols. NO renal adjustment is required.',
  dil:'Reconstitute with NS; dilute in 250–500 mL NS; infuse over 1 h (over 2–3 h in children). Use within 6 h refrigerated.',
  warn:['NEPHROTOXICITY (up to 60%) and NEUROTOXICITY — same class warnings as colistin; neuromuscular blockade can cause apnoea.','Unlike colistin, polymyxin B is the ACTIVE drug — no prodrug conversion, so its pharmacokinetics are more predictable and NO renal dose adjustment is needed (an advantage in AKI/CRRT).','Conversion: 1 mg polymyxin B sulfate ≈ 10,000 IU. Verify the vial label units.','Histamine release, hyperpigmentation (reversible) with prolonged courses.','Pre-medicate with an antihistamine and infuse slowly to reduce infusion reactions.'],
  ref:['SANFORD','ISCCM-AMR','CONSENSUS-COLISTIN','ESCMID-CRE'] });

R({ id:'tigecycline', n:'Tigecycline', sys:'antiinfective', cls:'Glycylcycline (minocycline derivative, 30S inhibitor)',
  ind:'Complicated intra-abdominal and skin-soft-tissue infection, MDR Acinetobacter (in combination), VRE; last-line option', pop:'adult', risk:4,
  d:{t:'mg', v:100, cap:100, capDay:200, rep:'100 mg IV load, then 50 mg IV every 12 h'},
  fx:[{s:'50 mg vial', c:10, u:'mg', p:'50 mg vial reconstituted with 5.3 mL NS → 10 mg/mL', b:'Tygacil (Pfizer/Wyeth), Tigecycline IP — Aurobindo, Fresenius/Kabi, Intas; Tigecyn, Tigatix', r:'IV', hl:1, prep:'Reconstitute 50 mg with 5.3 mL NS or D5W (gives 10 mg/mL), swirl gently until dissolved, then transfer to 100 mL NS/D5W → final 0.5 mg/mL (max 1 mg/mL)'}],
  admin:'Loading 100 mg IV over 30–60 min, then 50 mg IV q12h over 30–60 min for 5–14 days.',
  dil:'Final concentration must be ≤1 mg/mL. Compatible with NS, D5W and RL. Protect from light; use within 6 h at room temperature or 24 h refrigerated.',
  warn:['FDA black-box warning: INCREASED ALL-CAUSE MORTALITY versus comparators — reserve for situations with no alternative.','Achieves very LOW serum concentrations (large volume of distribution) — poor choice for bacteraemia; good tissue/biliary/intra-abdominal penetration.','Severe nausea and vomiting in ~25%; pancreatitis; hepatic dysfunction; coagulopathy (hypofibrinogenaemia — check fibrinogen and PT weekly).','NO renal adjustment and no dose change in dialysis — useful in AKI.','Not for children <8 years (tooth discoloration, bone growth); avoid in pregnancy.'],
  ref:['SANFORD','ISCCM-AMR','FDA-TIGE','BNF'] });

R({ id:'aztreonam', n:'Aztreonam', sys:'antiinfective', cls:'Monobactam (β-lactam with no cross-reactivity except ceftazidime)',
  ind:'Severe penicillin/cephalosporin allergy with Gram-negative infection; combined with ceftazidime–avibactam for metallo-β-lactamase producers', pop:'adult', risk:2,
  d:{t:'g', lo:1, hi:2, capDay:8, rep:'2 g IV every 8 h for severe/Pseudomonas infection'},
  fx:[{s:'1 g vial', c:100, u:'mg', p:'1 g vial reconstituted with 6 mL WFI → ≈100 mg/mL; dilute further', b:'Aztreonam IP — Cipla/Intas; Azactam (BMS) — availability limited in India', r:'IV/IM/NEB', hl:1, prep:'Reconstitute 1 g with 6–10 mL WFI, then dilute in 100 mL NS and infuse over 20–60 min'}],
  admin:'1–2 g IV every 6–8 h. Pseudomonas: 2 g q6–8h.',
  dil:'Compatible with NS and D5W; use within 48 h refrigerated.',
  warn:['ONLY Gram-negative cover — no activity against Gram-positives or anaerobes (combine for mixed infection).','Safe in penicillin allergy, but cross-reacts with CEFTAZIDIME (shared side chain).','Renal adjustment: halve the maintenance dose if CrCl 10–30 mL/min; give after dialysis.','Availability in India is inconsistent — plan ahead if used for MBL combinations.'],
  ref:['SANFORD','IDSA-AMR','BNF'] });

/* ---------- quinolones & others ---------- */
R({ id:'ciprofloxacin', n:'Ciprofloxacin', sys:'antiinfective', cls:'Fluoroquinolone (DNA gyrase/topoisomerase IV inhibitor)',
  ind:'Complicated urinary sepsis, Pseudomonas, enteric fever, traveller\'s diarrhoea, anthrax, plague, intra-abdominal infection (with metronidazole)', pop:'adult', risk:3,
  d:{t:'mg', lo:200, hi:400, capDay:1200, rep:'400 mg IV every 8–12 h (400 mg q8h for Pseudomonas)'},
  fx:[{s:'2 mg/mL (200 mg/100 mL) ready-to-use infusion', c:2, u:'mg', p:'100 mL bag (200 mg), 200 mL bag (400 mg)', b:'Ciplox (Cipla), Cifran (Sun), Ciprofloxacin IP — Claris/Intas/Neon', r:'IV', hl:1},
      {s:'10 mg/mL concentrate (limited)', c:10, u:'mg', p:'20 mL vial (200 mg)', b:'Ciprofloxacin concentrate', r:'IV'},
      {s:'250 / 500 / 750 mg tablets', c:500, u:'mg', p:'strip of 10', b:'Ciplox 500, Cifran 500, Ciproxin (Bayer)', r:'PO'},
      {s:'100 mg/5 mL suspension', c:20, u:'mg', p:'bottle (limited)', b:'Ciprofloxacin suspension', r:'PO'}],
  admin:'400 mg IV over 60 min every 8–12 h. Oral 500–750 mg BD (bioavailability ~70%).',
  dil:'Ready to use; DO NOT mix with other drugs; incompatible with alkaline solutions and precipitates with heparin and multivalent cations.',
  warn:['QT PROLONGATION and torsades — check the ECG and K⁺/Mg²⁺; avoid with other QT-prolonging drugs.','TENDINITIS, TENDON RUPTURE (esp. Achilles, age >60, corticosteroids, transplant recipients), peripheral neuropathy, CNS effects (seizures, confusion), aortic aneurysm/dissection risk — FDA/CDSCO class warnings.','Chelation with calcium, magnesium, iron, aluminium and dairy products — separate enteral administration by 2–4 h (relevant for NG feeds).','Renal adjustment: CrCl 30–50 → q12h; CrCl 5–29 → q18–24h.','Restrict use for uncomplicated infections — resistance in India is >70% for E. coli.'],
  ref:['SANFORD','IAP-ABX','FDA-QUINOLONE','BNF','IAP-STG'] });

R({ id:'levofloxacin', n:'Levofloxacin', sys:'antiinfective', cls:'Fluoroquinolone (respiratory fluoroquinolone)',
  ind:'Community-acquired and hospital-acquired pneumonia, complicated urinary sepsis, skin-soft-tissue infection, plague/anthrax, Legionella', pop:'adult', risk:3,
  d:{t:'mg', lo:500, hi:750, capDay:750, rep:'750 mg IV/PO once daily × 5 days (pneumonia) or 500 mg once daily'},
  fx:[{s:'5 mg/mL (500 mg/100 mL) ready-to-use infusion', c:5, u:'mg', p:'100 mL bag (500 mg)', b:'Levoflox (Cipla), Tavanic (Sanofi), Levofloxacin IP — Claris/Intas; Levoquin', r:'IV', hl:1},
      {s:'750 mg tablet', c:750, u:'mg', p:'strip of 5', b:'Levoflox 750, Tavanic 750, Levoquin 750', r:'PO'},
      {s:'250 / 500 mg tablets', c:500, u:'mg', p:'strip of 10', b:'Levoflox 500, Tavanic 500', r:'PO'},
      {s:'25 mg/mL oral solution', c:25, u:'mg', p:'100 mL bottle', b:'Levofloxacin oral solution', r:'PO'}],
  admin:'750 mg IV over 90 min once daily × 5 days (or 500 mg over 60 min once daily × 7–14 days). Oral bioavailability is ~99% — switch as soon as the gut works.',
  dil:'Ready to use — DO NOT mix with heparin or alkaline solutions; use a dedicated line or flush thoroughly.',
  warn:['Infuse over ≥60 min (750 mg over 90 min) to avoid hypotension.','Same class warnings as ciprofloxacin: QT prolongation, tendinopathy, neuropathy, CNS effects, dysglycaemia, aortic events.','Renal adjustment: CrCl 20–50 → 750 mg q48h; CrCl 10–19 → 750 mg initial then 500 mg q48h.','Avoid in TB-endemic settings without excluding TB — fluoroquinolone monotherapy delays the diagnosis and selects resistance.','Seizure threshold lowered; avoid with NSAIDs and theophylline.'],
  ref:['SANFORD','IAP-ABX','FDA-QUINOLONE','BNF','IAP-STG'] });

R({ id:'metronidazole', n:'Metronidazole', sys:'antiinfective', cls:'Nitroimidazole (anaerobic DNA strand-breaking)',
  ind:'Intra-abdominal and pelvic anaerobic sepsis, aspiration pneumonia, C. difficile colitis (where fidaxomicin/vancomycin unavailable), amoebiasis, cerebral abscess, giardiasis, bacterial vaginosis', pop:'all', risk:2,
  d:{t:'mgkg', lo:7.5, hi:15, cap:1500, capDay:4000, rep:'500 mg IV every 8 h (7.5 mg/kg); amoebic abscess 500–750 mg q8h'},
  fx:[{s:'5 mg/mL (500 mg/100 mL) ready-to-use infusion', c:5, u:'mg', p:'100 mL bottle (500 mg), 300 mL (1.5 g)', b:'Metrogyl (J B Chemicals), Flagyl (Sanofi), Metronidazole IP — Claris/Intas/Neon', r:'IV', hl:1},
      {s:'200 / 400 mg tablets', c:400, u:'mg', p:'strip of 10', b:'Metrogyl 400, Flagyl 400, Metrogyl 200', r:'PO'},
      {s:'100 mg/5 mL suspension', c:20, u:'mg', p:'60 mL bottle', b:'Metrogyl suspension, Flagyl suspension', r:'PO'},
      {s:'200 mg/5 mL suspension (some brands)', c:40, u:'mg', p:'60 mL bottle', b:'Metrogyl 200 mg/5 mL', r:'PO'}],
  admin:'500 mg IV over 30–60 min every 8 h (or 15 mg/kg load then 7.5 mg/kg q6–8h). Oral 400 mg TDS. C. difficile: 500 mg PO TDS × 10–14 days (oral vancomycin 125 mg QID is preferred).',
  dil:'Ready to use — do not add other drugs; compatible with NS and D5W.',
  warn:['DISULFIRAM-LIKE REACTION with alcohol — avoid alcohol during therapy and for 48 h after.','Metallic taste, nausea, peripheral neuropathy with prolonged courses (>2 weeks), seizures, encephalopathy (cerebellar lesions on MRI).','Potentiates warfarin (raised INR) — reduce the warfarin dose and monitor INR closely.','Darkening of urine is harmless.','Reduces the clearance of lithium, phenytoin and ciclosporin.'],
  ref:['SANFORD','IAP-ABX','BNF','IDSA-CDIFF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'azithromycin', n:'Azithromycin', sys:'antiinfective', cls:'Azalide macrolide (50S inhibitor)',
  ind:'Community-acquired pneumonia (atypical cover), scrub typhus alternative, typhoid (uncomplicated), chlamydia, traveller\'s diarrhoea', pop:'all', risk:2,
  d:{t:'mgkg', lo:7.5, hi:10, cap:500, capDay:500, rep:'500 mg IV/PO once daily × 3–5 days'},
  fx:[{s:'500 mg vial', c:50, u:'mg', p:'500 mg vial reconstituted with 4.8 mL WFI → 100 mg/mL; then dilute to 1–2 mg/mL', b:'Azithral IV (Alembic), Azax IV (Cipla), Azee (FDC), Azithromycin IP — Intas/Neon', r:'IV', hl:1, prep:'Reconstitute 500 mg with 4.8 mL sterile WFI → 100 mg/mL; then dilute in 250–500 mL NS/D5W to a final concentration of 1–2 mg/mL and infuse over 1–3 h'},
      {s:'500 mg tablet', c:500, u:'mg', p:'strip of 3/5', b:'Azithral 500, Azax 500, Azee 500', r:'PO'},
      {s:'200 mg/5 mL suspension', c:40, u:'mg', p:'15 mL / 30 mL bottle', b:'Azithral 200 suspension, Azee suspension', r:'PO'},
      {s:'100 mg/5 mL suspension', c:20, u:'mg', p:'15 mL bottle', b:'Azithral 100 suspension', r:'PO'}],
  admin:'Adult 500 mg IV once daily × 3–5 days then oral 250–500 mg daily. Children 10 mg/kg IV/PO once daily × 3 days. Scrub typhus alternative 500 mg daily × 5 days.',
  dil:'FINAL CONCENTRATION MUST BE 1–2 mg/mL for infusion over 1–3 h (never give as a bolus or at >2 mg/mL — severe infusion-site reactions and thrombophlebitis).',
  warn:['QT PROLONGATION and torsades — avoid with other QT-prolonging drugs, hypokalaemia, hypomagnesaemia and bradycardia.','Infusion-site pain, phlebitis; hepatotoxicity; diarrhoea.','Give at least 1 h apart from antacids and enteral feeds.','Oral bioavailability is only ~37% but tissue levels are high — IV is preferred in the critically ill.'],
  ref:['SANFORD','IAP-ABX','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'doxycycline', n:'Doxycycline', sys:'antiinfective', cls:'Tetracycline (30S inhibitor)',
  ind:'SCRUB TYPHUS (first-line), rickettsial disease, leptospirosis, Q fever, brucellosis (with rifampicin/gentamicin), malaria prophylaxis, anthrax', pop:'all', risk:2,
  d:{t:'mg', lo:100, hi:200, capDay:200, rep:'100 mg IV/PO every 12 h × 7–14 days (loading 200 mg once)'},
  fx:[{s:'100 mg vial', c:10, u:'mg', p:'100 mg vial reconstituted with 10 mL WFI → 10 mg/mL; dilute in 250–500 mL to 0.1–1 mg/mL', b:'Doxt (Dr Reddy\'s), Doxycycline IP — Neon/Intas; Vibramycin (Pfizer) — IV availability in India is limited, oral is standard', r:'IV/PO', hl:1, prep:'Reconstitute 100 mg with 10 mL WFI → 10 mg/mL; dilute in at least 250 mL NS/D5W (max 1 mg/mL) and infuse over 1–4 h; protect from light'},
      {s:'100 mg capsule / tablet', c:100, u:'mg', p:'strip of 10', b:'Doxt 100, Doxycycline 100 (Cipla/Intas), Vibramycin 100', r:'PO'}],
  admin:'Scrub typhus/rickettsial: 100 mg PO/IV twice daily × 7 days (children >8 years and adults alike — short courses do not stain teeth). Loading 200 mg once may be used.',
  dil:'IV concentration must not exceed 1 mg/mL; infuse over 1–4 h; protect from light; use within 12 h.',
  warn:['Oesophagitis and ulceration — take with a full glass of water while upright, and remain upright for 30 min.','Photosensitivity; vestibular symptoms (less than minocycline).','Chelation with calcium, iron, magnesium, aluminium and dairy — separate by 2 h.','Azithromycin 500 mg daily × 5 days is the alternative in pregnancy and children <8 years for scrub typhus.','IV availability in India is unreliable — the oral route is well absorbed (95%) and appropriate if the gut works.'],
  ref:['SANFORD','IAP-SCRUB','ISCCM-RICKETTSIA','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'cotrimoxazole', n:'Co-trimoxazole (TMP–SMX)', sys:'antiinfective', cls:'Sulfonamide + dihydrofolate reductase inhibitor (sequential folate blockade)',
  ind:'Pneumocystis jirovecii pneumonia (treatment and prophylaxis), Nocardia, Stenotrophomonas maltophilia, Listeria alternative, cyclospora, isospora', pop:'all', risk:4,
  d:{t:'mgkg', lo:15, hi:20, capDay:1800, rep:'TMP component 15–20 mg/kg/day IV/PO divided every 6–8 h for PCP × 21 days; prophylaxis TMP 5 mg/kg/day'},
  fx:[{s:'80 mg trimethoprim + 400 mg sulfamethoxazole per mL', c:16, u:'mg', p:'5 mL ampoule (TMP 80 mg + SMX 400 mg); 10 mL ampoule (TMP 160 mg + SMX 800 mg)', b:'Coptin (Abbott), Septran IV, Bactrim IV, Resprim', r:'IV', hl:1, prep:'Dilute each 5 mL ampoule in 125 mL of D5W (minimum) → final ≤1 mg/mL of the TMP component; use within 6 h; inspect for precipitation'},
      {s:'80 + 400 mg tablet', c:16, u:'mg', p:'strip of 10', b:'Septran (GSK), Bactrim, Resprim, Coptin', r:'PO'},
      {s:'160 + 800 mg DS tablet', c:32, u:'mg', p:'strip of 10', b:'Septran DS, Bactrim DS', r:'PO'},
      {s:'40 + 200 mg per 5 mL suspension', c:8, u:'mg', p:'50 mL bottle', b:'Septran suspension, Bactrim suspension', r:'PO'}],
  admin:'PCP treatment: TMP 15–20 mg/kg/day IV divided q6–8h for 21 days (with corticosteroids if PaO₂ <70 mmHg or A-a gradient >35). Prophylaxis: one DS tablet daily or 3× weekly. Stenotrophomonas: TMP 8–12 mg/kg/day divided q6h.',
  dil:'MUST be diluted (≥125 mL of D5W per 5 mL ampoule; maximum concentration 1 mg/mL of TMP). Precipitates in NS and in concentrated solutions — use D5W and inspect the bag.',
  warn:['SEVERE CUTANEOUS ADVERSE REACTIONS — Stevens–Johnson syndrome, toxic epidermal necrolysis and DRESS, especially in slow acetylators and HIV-positive patients; HLA-B*15:02/B*38:02 association.','HYPERKALAEMIA (trimethoprim blocks the renal ENaC channel) — check K⁺ every 2–3 days; can cause life-threatening hyperkalaemia, especially with ACE inhibitors/ARBs/spironolactone.','Acute rise in serum creatinine without a fall in GFR (trimethoprim inhibits tubular creatinine secretion) — do not confuse with true AKI.','Folate depletion → megaloblastic anaemia, neutropenia, thrombocytopenia; give folinic acid (NOT folic acid) in prolonged high-dose therapy.','Hyponatraemia, hypoglycaemia, hepatotoxicity, aseptic meningitis, pulmonary infiltrates.','Fluid load with high-dose IV therapy is significant (each 5 mL ampoule needs 125 mL of diluent).'],
  ref:['SANFORD','IDSA-PCP','NIH-OI','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

/* ---------- antifungals ---------- */
R({ id:'ampb-deoxy', n:'Amphotericin B deoxycholate', sys:'antiinfective', cls:'Polyene macrolide antifungal (ergosterol-binding)',
  ind:'Mucormycosis, cryptococcal meningitis (with flucytosine), visceral leishmaniasis, severe endemic mycoses — where liposomal amphotericin is unavailable', pop:'all', risk:5,
  d:{t:'mgkg', lo:0.7, hi:1.5, capDay:100, rep:'0.7–1 mg/kg/day IV (mucormycosis 1–1.5 mg/kg/day); visceral leishmaniasis 1 mg/kg/day × 15–21 days'},
  fx:[{s:'50 mg vial', c:5, u:'mg', p:'50 mg vial reconstituted with 10 mL WFI → 5 mg/mL; dilute to 0.1 mg/mL in D5W', b:'Fungizone (BMS), Amphocin (Cipla), Ambisome is the LIPOSOMAL product — DO NOT CONFUSE, Amphotret', r:'IV', hl:1, prep:'Reconstitute 50 mg with 10 mL sterile WFI (gives 5 mg/mL), shake until clear, then add to 500 mL of 5% DEXTROSE ONLY → final 0.1 mg/mL (never exceed 0.1 mg/mL, never use NS)'}],
  admin:'Test dose 1 mg over 20–30 min in naive patients, then 0.7–1 mg/kg/day (mucor 1–1.5 mg/kg/day) infused over 2–6 h in 5% dextrose. Visceral leishmaniasis (India): 1 mg/kg/day × 15–21 days, or 1 mg/kg/day × 5 days + 1 mg/kg on day 14.',
  dil:'D5W ONLY — 0.9% sodium chloride precipitates the drug. Final concentration must not exceed 0.1 mg/mL (0.25 mg/mL via a central line). Protect from light.',
  warn:['THE TWO AMPHOTERICIN PRODUCTS ARE NOT INTERCHANGEABLE: conventional deoxycholate is dosed at 0.7–1.5 mg/kg/day whereas liposomal is dosed at 3–10 mg/kg/day. A mg-for-mg swap causes either massive overdose (nephrotoxicity, cardiac arrest) or under-treatment.','Infusion reactions ("shake and bake"): fever, rigors, chills, headache, vomiting, hypotension — pre-medicate with paracetamol + hydrocortisone 25–50 mg IV + pethidine 25 mg for rigors; slow the infusion.','NEPHROTOXICITY in almost all patients — pre-load with 500–1000 mL NS, monitor creatinine and K⁺/Mg²⁺ daily, and replace potassium and magnesium aggressively.','Hypokalaemia, hypomagnesaemia, renal tubular acidosis, anaemia (EPO suppression), thrombophlebitis.','Rapid infusion causes arrhythmias and cardiac arrest — NEVER give as a bolus.'],
  ref:['SANFORD','ECMM-MUCOR','ISCCM-FUNGAL','IDSA-CRYPTO','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'ampb-liposomal', n:'Liposomal amphotericin B', sys:'antiinfective', cls:'Lipid-associated polyene antifungal (reduced nephrotoxicity)',
  ind:'Invasive candidiasis, aspergillosis, mucormycosis (FIRST-LINE at 5–10 mg/kg/day), cryptococcal meningitis, visceral leishmaniasis (single high dose), febrile neutropenia', pop:'all', risk:5,
  d:{t:'mgkg', lo:3, hi:10, capDay:500, rep:'3–5 mg/kg/day IV (mucormycosis 5–10 mg/kg/day; CNS aspergillosis 5 mg/kg/day)'},
  fx:[{s:'50 mg vial', c:4, u:'mg', p:'50 mg vial reconstituted with 12 mL WFI → 4 mg/mL', b:'Ambisome (Gilead/Astellas), Amphocrit (Cipla), Amblip, Liposomal Amphotericin B (Intas/Aurobindo), Fungisome', r:'IV', hl:1, prep:'Reconstitute 50 mg with 12 mL sterile WFI (gives 4 mg/mL), shake VIGOROUSLY for 30 s until completely clear, then pass through the supplied 0.22 µm in-line filter into D5W (final 1–2 mg/mL, or 0.2 mg/mL in infants)'}],
  admin:'3–5 mg/kg/day IV over 2 h (or 1–2 mg/kg/h); mucormycosis and CNS infection 5–10 mg/kg/day. Visceral leishmaniasis in India: single dose 10 mg/kg IV (or 3–5 mg/kg/day × 3–5 days).',
  dil:'Reconstitute ONLY with sterile WFI (never NS or bacteriostatic water with preservative); dilute in 5% DEXTROSE ONLY; use the 5 µm in-line filter supplied.',
  warn:['DO NOT INTERCHANGE with conventional amphotericin B deoxycholate on a mg-for-mg basis — liposomal doses are 5–10× higher.','Infusion reactions still occur (fever, rigors, chest tightness, bronchospasm) — slow the infusion and pre-medicate.','Nephrotoxicity is reduced but NOT absent — monitor creatinine, K⁺ and Mg²⁺ daily.','Anaphylaxis is possible with the first dose — have resuscitation facilities available.','Very expensive in India — the Cipla/Intas biosimilars have made it more accessible; verify the reconstitution volume, which differs between brands.'],
  ref:['SANFORD','ECMM-MUCOR','IDSA-ASPERGILLOSIS','ISCCM-FUNGAL','NVBDCP-KALA','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'fluconazole', n:'Fluconazole', sys:'antiinfective', cls:'Triazole antifungal (14-α-demethylase inhibitor)',
  ind:'Candidaemia (non-glabrata/krusei), oesophageal and mucocutaneous candidiasis, cryptococcal meningitis consolidation, coccidioidomycosis', pop:'all', risk:3,
  d:{t:'mgkg', lo:6, hi:12, cap:800, capDay:800, rep:'loading 800 mg (12 mg/kg) IV/PO day 1, then 400 mg (6 mg/kg) daily'},
  fx:[{s:'2 mg/mL (200 mg/100 mL) ready-to-use infusion', c:2, u:'mg', p:'100 mL bag (200 mg), 200 mL bag (400 mg)', b:'Fluka (Cipla), Forcan (Cipla), Zocon (FDC), Fluconazole IP — Claris/Intas', r:'IV', hl:1},
      {s:'50 / 150 / 200 mg capsules', c:150, u:'mg', p:'strip of 1/4/7', b:'Forcan 150, Zocon 150, Fluka 150, Fluca 150', r:'PO'},
      {s:'50 mg/mL oral suspension', c:50, u:'mg', p:'30 mL bottle', b:'Zocon suspension, Fluconazole suspension', r:'PO'}],
  admin:'Loading 800 mg (12 mg/kg) IV or PO on day 1, then 400 mg (6 mg/kg) daily. Oropharyngeal candidiasis 100–200 mg daily. Infuse at 5–10 mL/min.',
  dil:'Ready to use — do not add other drugs.',
  warn:['QT PROLONGATION and torsades — check the ECG, K⁺ and Mg²⁺; avoid with other QT-prolonging drugs.','Strong CYP2C9/CYP3A4 inhibitor — markedly raises warfarin (INR), phenytoin, ciclosporin, tacrolimus, sulfonylureas, statins, rifabutin levels.','INACTIVE against Candida krusei and unreliable against C. glabrata and C. auris — echinocandins are first-line for candidaemia in the ICU.','Hepatotoxicity (rare but fatal); exfoliative skin reactions in HIV patients.','Renal adjustment: 50% of the dose if CrCl <50 mL/min (no adjustment for the loading dose).'],
  ref:['SANFORD','IDSA-CANDIDA','ISCCM-FUNGAL','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'voriconazole', n:'Voriconazole', sys:'antiinfective', cls:'Second-generation triazole (broad-spectrum, mould-active)',
  ind:'INVASIVE ASPERGILLOSIS (first-line), fusariosis, scedosporiosis, fluconazole-resistant candidiasis, chronic pulmonary aspergillosis', pop:'all', risk:5,
  d:{t:'mgkg', lo:4, hi:6, cap:400, capDay:800, rep:'loading 6 mg/kg IV q12h × 2 doses, then 4 mg/kg IV q12h (PO 200 mg q12h if >40 kg)'},
  fx:[{s:'200 mg vial', c:10, u:'mg', p:'200 mg vial reconstituted with 19 mL WFI → 10 mg/mL; dilute to 0.5–5 mg/mL', b:'Vfend (Pfizer), Vorican (Cipla), Voriconazole IP — Intas/Lupin/Aurobindo; Voriz, Vorican', r:'IV/PO', hl:1, prep:'Reconstitute 200 mg with 19 mL sterile WFI or NS (discard 1.9 mL to maintain volume) → 10 mg/mL; then dilute in NS/D5W/RL to a final concentration of 0.5–5 mg/mL and infuse over 1–3 h'},
      {s:'50 mg / 200 mg tablets', c:200, u:'mg', p:'strip of 4/10', b:'Vfend 200, Vorican 200, Voriz 200', r:'PO'},
      {s:'40 mg/mL oral suspension', c:40, u:'mg', p:'75 mL bottle', b:'Vfend suspension (import)', r:'PO'}],
  admin:'IV loading 6 mg/kg q12h × 2 doses, then 4 mg/kg q12h (or PO 400 mg q12h × 2 then 200 mg q12h in adults >40 kg). Trough level target 1–5.5 mg/L (draw before the 5th dose).',
  dil:'Reconstitute with WFI/NS; final concentration 0.5–5 mg/mL; infuse over 1–3 h; do not bolus. Use within 24 h.',
  warn:['VISUAL DISTURBANCES (photopsia, blurred vision, colour change) in ~30% — reversible; advise against night driving.','PHOTOSENSITIVITY and a long-term risk of squamous cell skin cancer — strict sun protection.','NEUROTOXICITY: visual hallucinations, confusion, encephalopathy — strongly associated with trough levels >5.5 mg/L. Therapeutic drug monitoring is mandatory.','HEPATOTOXICITY — check LFTs twice weekly.','QT prolongation; avoid with other QT-prolonging drugs.','Severe drug interactions (CYP2C19/3A4): contraindicated with rifampicin, carbamazepine, phenytoin (high dose), sirolimus, ergot alkaloids, St John\'s wort, and high-dose ritonavir. Reduce ciclosporin/tacrolimus by 50%.','The IV vehicle (sulfobutyl ether β-cyclodextrin, SBECD) accumulates in CrCl <50 mL/min — prefer oral therapy or use IV with close monitoring.','Genotype-guided dosing: CYP2C19 poor metabolisers (common in Indians, ~3%) need a 50% dose reduction.'],
  ref:['SANFORD','IDSA-ASPERGILLOSIS','ISCCM-FUNGAL','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'caspofungin', n:'Caspofungin', sys:'antiinfective', cls:'Echinocandin (β-1,3-glucan synthase inhibitor)',
  ind:'Invasive candidiasis (FIRST-LINE in the ICU), empirical therapy in febrile neutropenia, salvage therapy for aspergillosis', pop:'all', risk:3,
  d:{t:'mg', v:50, cap:70, capDay:70, rep:'70 mg IV day 1, then 50 mg IV once daily'},
  fx:[{s:'50 mg vial', c:5, u:'mg', p:'50 mg vial reconstituted with 10.5 mL NS → ≈5 mg/mL; dilute in 250 mL NS', b:'Cancidas (MSD), Caspofungin IP — Cipla, Intas, Fresenius; Caspogard, Candifung', r:'IV', hl:1, prep:'Reconstitute 50 mg with 10.5 mL NS or 0.45% NaCl (final 5 mg/mL), then add to 250 mL NS and infuse over 1 h. Do NOT use dextrose-containing diluents.'},
      {s:'70 mg vial', c:7, u:'mg', p:'70 mg vial reconstituted with 10.5 mL NS → 7 mg/mL', b:'Cancidas 70 mg, Caspofungin 70 mg', r:'IV', prep:'Reconstitute with 10.5 mL NS, then dilute in 250 mL NS'}],
  admin:'70 mg IV loading dose on day 1, then 50 mg IV once daily over 1 hour. Children 70 mg/m²/day (max 70 mg). Increase to 70 mg daily if weight >80 kg or with rifampicin/efavirenz/phenytoin/dexamethasone.',
  dil:'INCOMPATIBLE WITH DEXTROSE — use NS or 0.45% NaCl only. Stable 24 h at room temperature after dilution.',
  warn:['No activity against Cryptococcus, Fusarium or Mucorales (zygomycetes) — mucormycosis will progress on caspofungin.','Hepatotoxicity; histamine-mediated infusion reactions (rash, facial swelling, pruritus, bronchospasm) — slow the infusion and pre-medicate with an antihistamine.','Hypokalaemia and fluid overload.','Drug interactions: ciclosporin (transient transaminitis), tacrolimus (reduce by 20%), rifampicin, dexamethasone and enzyme inducers (increase the caspofungin dose).'],
  ref:['SANFORD','IDSA-CANDIDA','ISCCM-FUNGAL','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'micafungin', n:'Micafungin', sys:'antiinfective', cls:'Echinocandin',
  ind:'Candidaemia and invasive candidiasis, oesophageal candidiasis, antifungal prophylaxis in HSCT and neutropenia', pop:'all', risk:3,
  d:{t:'mgkg', lo:2, hi:100, capDay:200, rep:'candidaemia 100 mg IV once daily (no loading dose needed); oesophageal 150 mg; CNS/eye involvement 200–400 mg'},
  fx:[{s:'50 mg vial', c:5, u:'mg', p:'50 mg vial reconstituted with 5 mL NS → 10 mg/mL', b:'Mycamine (Astellas), Micafungin (Cipla/Intas generics)', r:'IV', hl:1, prep:'Reconstitute 50 mg with 5 mL NS (avoid shaking to prevent foaming), then dilute in 100 mL NS and infuse over 1 h'},
      {s:'100 mg vial', c:10, u:'mg', p:'100 mg vial reconstituted with 10 mL NS → 10 mg/mL', b:'Mycamine 100 mg', r:'IV', prep:'Reconstitute with 10 mL NS, then dilute in 100 mL NS'}],
  admin:'100 mg IV once daily over 1 hour for candidaemia/invasive candidiasis (no loading dose required). Children <4 months 10 mg/kg/day; ≥4 months 2–4 mg/kg/day.',
  dil:'Reconstitute with NS (or D5W), dilute in 100 mL NS/D5W; protect from light; infuse over 1 hour.',
  warn:['No loading dose is needed — this simplifies the first-day prescription.','Hepatotoxicity, renal impairment, haemolysis/haemolytic anaemia (rare).','Histamine-mediated infusion reactions; infuse over at least 1 hour.','No activity against Cryptococcus or Mucorales.'],
  ref:['SANFORD','IDSA-CANDIDA','ISCCM-FUNGAL','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'itraconazole', n:'Itraconazole', sys:'antiinfective', cls:'Triazole antifungal',
  ind:'Chronic pulmonary aspergillosis, histoplasmosis, blastomycosis, sporotrichosis, allergic bronchopulmonary aspergillosis, onychomycosis', pop:'adult', risk:3,
  d:{t:'mg', lo:200, hi:600, capDay:600, rep:'200 mg IV/PO twice daily × 4 doses (loading), then 200 mg once daily'},
  fx:[{s:'10 mg/mL IV infusion (25 mL ampoule = 250 mg)', c:10, u:'mg', p:'25 mL ampoule with the dedicated 0.9% NaCl diluent and in-line filter', b:'Canditral (Glenmark), Itzol (Cipla), Itrasys (Intas), Sporox (Janssen)', r:'IV/PO', hl:1},
      {s:'100 mg capsule', c:100, u:'mg', p:'strip of 4', b:'Canditral 100, Itzol 100, Itrasys 100', r:'PO'},
      {s:'10 mg/mL oral solution', c:10, u:'mg', p:'150 mL bottle', b:'Sporanox oral solution (Janssen), Itraconazole solution', r:'PO'}],
  admin:'Loading 200 mg twice daily for 4 doses, then 200 mg once daily for at least 3–6 months (chronic pulmonary aspergillosis). IV infusion over 1 hour using the supplied dedicated filter, then flush with 15–20 mL NS.',
  dil:'The IV ampoule MUST be diluted with the supplied 0.9% NaCl bag/diluent and given through the supplied in-line filter; do not mix with other fluids or drugs.',
  warn:['NEGATIVE INOTROPE — contraindicated in ventricular dysfunction and heart failure (FDA black-box warning).','Capsules need an ACIDIC gastric environment for absorption — avoid PPIs/H2 blockers; the oral solution is better absorbed and should be taken fasting.','Hepatotoxicity (rare but fatal) — check LFTs monthly.','Strong CYP3A4 inhibitor: raises digoxin, warfarin, ciclosporin, tacrolimus, statins, midazolam, quinidine (contraindicated) levels.','QT prolongation; peripheral oedema; hypokalaemia.'],
  ref:['SANFORD','IDSA-ASPERGILLOSIS','ISCCM-FUNGAL','BNF'] });

/* ---------- antivirals ---------- */
R({ id:'aciclovir', n:'Aciclovir (Acyclovir)', sys:'antiinfective', cls:'Guanosine analogue (viral DNA polymerase inhibitor)',
  ind:'HSV encephalitis, neonatal HSV, disseminated HSV/VZV, severe varicella/zoster, immunocompromised mucocutaneous HSV', pop:'all', risk:4,
  d:{t:'mgkg', lo:10, hi:20, cap:1500, rep:'10 mg/kg IV every 8 h over 1 h (HSV encephalitis × 14–21 days; neonatal HSV 20 mg/kg q8h)'},
  fx:[{s:'250 mg vial', c:25, u:'mg', p:'250 mg vial reconstituted with 10 mL WFI or NS → 25 mg/mL; dilute to ≤7 mg/mL', b:'Acivir IV (Cipla), Zovirax (GSK), Herperax, Acyclovir IP — Neon/Intas; Acyclovir Sodium for Injection', r:'IV/PO', hl:1, prep:'Reconstitute 250 mg with 10 mL sterile WFI or NS → 25 mg/mL; then dilute in 100–250 mL NS/D5W to a final concentration ≤7 mg/mL (≤4 mg/mL in neonates) and infuse over 1 h'},
      {s:'500 mg vial', c:25, u:'mg', p:'500 mg vial reconstituted with 20 mL', b:'Aciclovir 500 mg vial', r:'IV', prep:'Reconstitute with 20 mL WFI → 25 mg/mL'},
      {s:'200 / 400 / 800 mg tablets', c:400, u:'mg', p:'strip of 5/10', b:'Acivir 400, Zovirax 400, Herperax 400', r:'PO', own:{lo:200,hi:800,u:'mg',l:'ORAL aciclovir 200 mg 5×/day (HSV) or 800 mg 5×/day (VZV). The oral dose is NOT the IV dose — only IV therapy (10 mg/kg q8h) is adequate for encephalitis or disseminated disease.'}},
      {s:'200 mg/5 mL suspension', c:40, u:'mg', p:'125 mL bottle', b:'Aciclovir suspension', r:'PO', own:{kgLo:10,kgHi:20,u:'mg',l:'ORAL suspension for children: 200 mg 4–5×/day for HSV, or 20 mg/kg (max 800 mg) 4×/day for varicella.'}},
      {s:'30 mg/g ophthalmic ointment', c:30, u:'mg', p:'4.5 g tube', b:'Acivir eye ointment', r:'Ophthalmic', own:{text:'3% ophthalmic ointment: a 10 mm ribbon into the lower conjunctival sac 5 times daily for herpes simplex keratitis. TOPICAL USE ONLY — never inject, and never use the IV preparation in the eye.'}}],
  admin:'HSV encephalitis: 10 mg/kg IV every 8 h over 1 hour × 14 days (21 days in immunocompromised or neonates: 20 mg/kg q8h × 21 days). Start IMMEDIATELY on suspicion — do not wait for PCR/CSF results.',
  dil:'Final concentration must be ≤7 mg/mL; infuse over at least 1 hour (rapid infusion → renal failure).',
  warn:['CRYSTALLURIA AND ACUTE KIDNEY INJURY — the commonest serious toxicity. Prevent by infusing over ≥1 h, maintaining a urine output of ≥1 mL/kg/h, aggressive hydration and alkalinisation of the urine.','Neurotoxicity (tremor, myoclonus, confusion, hallucinations, seizures) — accumulates in renal impairment; dose adjust.','Renal adjustment by CrCl: 25–50 → q12h; 10–25 → q24h; <10 → 50% of the dose q24h after dialysis.','Alkaline pH (11) of the reconstituted solution — handle carefully; extravasation causes inflammation.','Check CSF HSV PCR at baseline and repeat before stopping therapy if the first PCR was negative but suspicion remains.'],
  ref:['SANFORD','IDSA-ENCEPHALITIS','IAP-CNS','BNF','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'ganciclovir', n:'Ganciclovir', sys:'antiinfective', cls:'Guanosine analogue (CMV-active)',
  ind:'CMV disease (retinitis, colitis, pneumonitis, encephalitis) in transplant recipients and the immunocompromised; congenital CMV', pop:'adult', risk:5,
  d:{t:'mgkg', lo:5, hi:5, capDay:600, rep:'INDUCTION 5 mg/kg IV q12h × 14–21 days, then MAINTENANCE 5 mg/kg once daily'},
  fx:[{s:'500 mg vial', c:50, u:'mg', p:'500 mg vial reconstituted with 10 mL WFI → 50 mg/mL; dilute in 100 mL NS to ≤4 mg/mL', b:'Gancivir (Cipla), Cymevene (Roche), Ganciclovir IP — Neon/Intas; Gancyclovir', r:'IV/PO', hl:1, prep:'Reconstitute 500 mg with 10 mL sterile WFI → 50 mg/mL; then dilute in 100 mL NS (final ≤4 mg/mL) and infuse over 1 h'}],
  admin:'Induction 5 mg/kg IV over 1 hour every 12 h for 14–21 days; then maintenance 5 mg/kg once daily (5 days/week) for as long as immunosuppression persists.',
  dil:'Final concentration must be ≤4 mg/mL; infuse over 1 hour via a large vein or central line.',
  warn:['SEVERE NEUTROPENIA, THROMBOCYTOPAENIA AND ANAEMIA — monitor FBC daily during induction; hold if neutrophils <500/µL or platelets <25,000/µL; G-CSF may be needed.','CARCINOGENIC, MUTAGENIC, TERATOGENIC and IMPAIRS FERTILITY in animal studies — handle as a cytotoxic drug: use gloves, a closed-system transfer device and cytotoxic precautions for preparation, administration and waste.','Renal adjustment is mandatory (CrCl 50–70 → 2.5 mg/kg q12h; 25–49 → 2.5 mg/kg q24h; 10–24 → 1.25 mg/kg q24h; <10 → not recommended).','Renal toxicity; CNS effects (confusion, seizures, psychosis).','Valganciclovir (oral, 450 mg tablets — Valcyte/Cylovir) is the step-down option with ~60% bioavailability.'],
  ref:['SANFORD','AST-CMV','ISCCM-FUNGAL','BNF'] });

R({ id:'oseltamivir', n:'Oseltamivir', sys:'antiinfective', cls:'Neuraminidase inhibitor (anti-influenza)',
  ind:'Severe/complicated influenza, ICU patients with suspected influenza during the season, post-exposure prophylaxis', pop:'all', risk:2,
  d:{t:'mg', lo:30, hi:75, capDay:150, rep:'75 mg PO twice daily × 5 days (severe/ICU: 150 mg twice daily may be considered)'},
  fx:[{s:'75 mg capsule', c:75, u:'mg', p:'strip of 10', b:'Antiflu (Cipla), Tamiflu (Roche), Oseltamivir IP — Intas/Hetero; Fluvir', r:'PO', hl:1},
      {s:'30 mg / 45 mg capsules', c:45, u:'mg', p:'strip of 10', b:'Tamiflu 30/45 mg, Antiflu 30', r:'PO'},
      {s:'6 mg/mL oral suspension', c:6, u:'mg', p:'60 mL bottle (reconstituted)', b:'Tamiflu suspension, Antiflu suspension', r:'PO'}],
  admin:'Adult/adolescent >40 kg: 75 mg PO twice daily × 5 days. Children: <15 kg 30 mg BD; 15–23 kg 45 mg BD; 23–40 kg 60 mg BD; >40 kg 75 mg BD. Infants 3–11 months: 3 mg/kg BD. Start within 48 h of symptom onset but GIVE IT ANYWAY in severe/ICU disease regardless of duration.',
  dil:'Capsules may be opened and the contents mixed with a small amount of sweetened food/liquid for patients who cannot swallow; the suspension must be shaken before use.',
  warn:['Nausea and vomiting in ~10% — give with food.','Neuropsychiatric events (delirium, self-injury) reported mainly in Japanese children/adolescents — monitor.','Renal adjustment: CrCl 30–60 → 30 mg BD; CrCl 10–30 → 30 mg once daily.','No IV formulation available in India — for malabsorption use NG administration or compassionate IV peramivir/zanamivir.','Continue for longer (10–15 days) in immunocompromised patients and consider resistance testing if no improvement.'],
  ref:['SANFORD','IDSA-INFLUENZA','IAP-INFLUENZA','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'remdesivir', n:'Remdesivir', sys:'antiinfective', cls:'Nucleotide prodrug — RNA-dependent RNA polymerase inhibitor',
  ind:'Hospitalised COVID-19 / severe viral pneumonia requiring oxygen; other RNA virus infections (off-label)', pop:'all', risk:3,
  d:{t:'mg', lo:100, hi:200, capDay:200, rep:'200 mg IV day 1, then 100 mg IV once daily × 4 more days (total 5 days; extend to 10 days if not improving)'},
  fx:[{s:'100 mg vial (lyophilised)', c:5, u:'mg', p:'100 mg vial reconstituted with 20 mL WFI → 5 mg/mL; dilute in 100–250 mL NS', b:'Remdesivir IP — Cipla (Cipremi), Hetero (Rendem), Sun (Desrem), Mylan, Dr Reddy\'s; Veklury (Gilead)', r:'IV', hl:1, prep:'Reconstitute 100 mg with 20 mL sterile WFI, swirl (do not shake), then add to 100 mL NS → 1 mg/mL; infuse over 30 min (or 30–120 min)'},
      {s:'100 mg/20 mL ready-to-use solution', c:5, u:'mg', p:'20 mL vial (100 mg)', b:'Veklury solution for injection (Gilead)', r:'IV'}],
  admin:'200 mg IV on day 1 over 30 min, then 100 mg IV once daily for 4 days (extend to 10 days in patients not improving or who are immunocompromised).',
  dil:'Final concentration 1 mg/mL in NS; do NOT co-infuse with other drugs; flush the line before and after.',
  warn:['Monitor LFTs — hold if ALT >10 × ULN or ALT >5 × ULN with symptoms/signs of liver injury.','Infusion reactions (hypotension, nausea, diaphoresis, shivering) — slow or stop the infusion.','eGFR <30 mL/min was an exclusion in trials; current guidance permits use with monitoring (the SBECD vehicle accumulates) — prefer shorter courses.','Bradyarrhythmia; coagulation abnormalities.','Availability and cost have improved in India with multiple generic manufacturers.'],
  ref:['SANFORD','WHO-THERAPEUTICS','ICMR-COVID','BNF'] });

/* ---------- antiparasitics ---------- */
R({ id:'artesunate', n:'Artesunate', sys:'antiinfective', cls:'Artemisinin derivative (antiplasmodial)',
  ind:'SEVERE MALARIA (all species) — first-line, superior to quinine in adults and children', pop:'all', risk:4,
  d:{t:'mgkg', lo:2.4, hi:3, cap:240, rep:'2.4 mg/kg IV at 0, 12 and 24 h, then once daily until oral therapy is tolerated'},
  fx:[{s:'60 mg vial', c:60, u:'mg', p:'60 mg vial reconstituted with 1 mL of 5% sodium bicarbonate → 60 mg/mL, then dilute in 5 mL NS/D5W → 10 mg/mL', b:'Falinate (Ipca), Artesunate (Cipla/Intas), Falcigo (Fresenius), Artsunate, Artesun', r:'IV/IM', hl:1, prep:'(1) Add 1 mL of the supplied 5% sodium bicarbonate to the 60 mg vial and shake for 1 min until fully dissolved (60 mg/mL). (2) Add 5 mL of NS or D5W → 10 mg/mL. (3) Give 0.24 mL/kg of the final solution IV over 1–2 min. USE IMMEDIATELY — do not store.'},
      {s:'110 mg vial', c:55, u:'mg', p:'110 mg vial reconstituted with 2 mL sodium bicarbonate then 8 mL NS → 11 mg/mL', b:'Artesunate 110 mg (adult vial)', r:'IV/IM', prep:'Reconstitute with 2 mL 5% sodium bicarbonate, then dilute with 8 mL NS → 11 mg/mL'}],
  admin:'2.4 mg/kg IV at 0, 12 and 24 hours, then 2.4 mg/kg once daily until the patient can tolerate oral therapy (minimum 24 h of parenteral therapy), then complete 3 days of an oral artemisinin combination (artesunate–sulfadoxine-pyrimethamine or artemether–lumefantrine).',
  dil:'Two-step reconstitution is MANDATORY — artesunate does not dissolve in saline alone. Inject IV over 1–2 min (undiluted after step 2 is acceptable) or give IM.',
  warn:['DELAYED HAEMOLYSIS 1–4 weeks after treatment — check Hb weekly for 4 weeks after artesunate for severe malaria.','Two-step reconstitution errors and "shake for 1 minute" omissions are a common cause of under-dosing and treatment failure.','Post-artemisinin delayed haemolysis, reticulocytopenia, transaminitis.','If artesunate is unavailable, use artemether 3.2 mg/kg IM then 1.6 mg/kg daily, or IV quinine.','Do NOT use artesunate in the first trimester unless it is the only option (quinine + clindamycin preferred).'],
  ref:['WHO-MALARIA','NVBDCP-MALARIA','SANFORD','IAP-MALARIA','BNFC','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY','IAP-STG'] });

R({ id:'quinine', n:'Quinine dihydrochloride', sys:'antiinfective', cls:'Cinchona alkaloid antimalarial (artesunate alternative)',
  ind:'Severe malaria where artesunate is unavailable; babesiosis (with atovaquone/clindamycin)', pop:'all', risk:5,
  d:{t:'mgkg', lo:10, hi:20, cap:600, capDay:1800, rep:'20 mg/kg of the SALT (=16.7 mg/kg base) IV over 4 h, then 10 mg/kg salt q8h'},
  fx:[{s:'300 mg/mL (quinine dihydrochloride)', c:300, u:'mg', p:'2 mL ampoule (600 mg)', b:'Quinine IP — Neon, Samarth, Vins; Quinoquin, CQ-300', r:'IV/IM/PO', hl:1},
      {s:'300 mg tablet (quinine sulphate)', c:300, u:'mg', p:'strip of 10', b:'Quinine Sulphate 300 mg (Cipla/Neon), Quinoquin', r:'PO'}],
  admin:'Loading 20 mg/kg of quinine SALT (16.7 mg/kg base) diluted in 5–10 mL/kg of D5W infused over 4 h (max 600 mg per dose), then 10 mg/kg salt q8h over 2–4 h. OMIT the loading dose if the patient has received quinine, quinidine or mefloquine in the previous 12–24 h.',
  dil:'Dilute in 5% dextrose (or NS) to ≤2 mg/mL; infuse slowly — NEVER give as an IV bolus (fatal arrhythmias and hypotension).',
  warn:['SEVERE HYPOGLYCAEMIA — quinine stimulates insulin secretion. Monitor capillary glucose every 2–4 h and give 5–10% dextrose-containing fluids.','QT PROLONGATION and torsades; hypotension with rapid infusion; cinchonism (tinnitus, deafness, headache, nausea, visual disturbance).','Blackwater fever (massive intravascular haemolysis and haemoglobinuria).','Hypersensitivity/immune thrombocytopenia.','In severe malaria, artesunate is superior (SEAQUAMAT and AQUAMAT trials) — quinine is now a second-line agent.'],
  ref:['WHO-MALARIA','NVBDCP-MALARIA','SANFORD','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'ivermectin', n:'Ivermectin', sys:'antiinfective', cls:'Macrocyclic lactone — glutamate-gated chloride channel agonist',
  ind:'Strongyloidiasis (including hyperinfection/disseminated disease in the immunocompromised), scabies (crusted), onchocerciasis, filariasis', pop:'all', risk:2,
  d:{t:'mcgkg', lo:200, hi:400, cap:36000, rep:'200 mcg/kg PO daily × 1–2 days (strongyloides hyperinfection: daily until two consecutive negative stool tests)'},
  fx:[{s:'6 mg tablet (scored)', c:6, u:'mg', p:'strip of 4', b:'Ivermec (Cipla), Iverjohn (Johnson), Vermectin, Ivecop (Cipla), Ivermectin IP', r:'PO', hl:1},
      {s:'3 mg tablet', c:3, u:'mg', p:'strip of 4', b:'Ivermec 3 mg, Ivecop 3', r:'PO'},
      {s:'12 mg tablet', c:12, u:'mg', p:'strip', b:'Ivermectin 12 mg', r:'PO'},
      {s:'6 mg/mL oral solution (veterinary origin — NOT for human use)', c:6, u:'mg', p:'bottle', b:'Do NOT use veterinary formulations — a recognised cause of fatal human overdose', r:'PO'}],
  admin:'200 mcg/kg PO once daily × 1–2 days, taken on an empty stomach with water. Crusted scabies: 200 mcg/kg on days 1, 2, 8, 9 and 15 (with topical permethrin). Strongyloides hyperinfection in the immunocompromised: daily dosing until two consecutive negative stool examinations, often with prolonged/subcutaneous therapy.',
  dil:'No parenteral formulation is licensed in India; crushed tablets via an NG tube are used in ICU (absorption is unreliable — consider rectal or veterinary subcutaneous preparations only under expert advice).',
  warn:['MAZZOTTI REACTION in onchocerciasis (fever, rash, hypotension, lymphadenopathy, ocular damage) — pre-treat with corticosteroids.','Encephalopathy in patients with high Loa loa microfilarial counts (relevant to travellers from Central Africa).','Cross the blood–brain barrier when P-glycoprotein is inhibited or deficient — avoid with strong P-gp inhibitors.','Use ONLY human pharmaceutical-grade products — veterinary pour-on/injectable formulations have caused severe toxicity and death.','Give before or with high-dose corticosteroids in patients from endemic areas to prevent strongyloides hyperinfection syndrome (Tamil Nadu is endemic).'],
  ref:['SANFORD','WHO-NTD','CDC-STRONGYLOIDES','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'benzylpenicillin', n:'Benzylpenicillin (Penicillin G)', sys:'antiinfective', cls:'Natural β-lactam penicillin',
  ind:'Neurosyphilis, leptospirosis, gas gangrene/clostridial myonecrosis, rheumatic fever, diphtheria (with antitoxin), streptococcal necrotising fasciitis (with clindamycin), meningococcaemia', pop:'all', risk:3,
  d:{t:'unitskg', lo:50000, hi:4000000, capDay:24000000, rep:'neurosyphilis/leptospirosis 2.4 million IU IV every 4 h (or 18–24 MIU/day continuous)'},
  fx:[{s:'5 Lakh IU (500,000 IU) vial', c:50000, u:'units', p:'vial reconstituted with 1 mL WFI → 500,000 IU/mL', b:'Benzylpenicillin IP — Neon, Abbott, Saraca, Samarth; Penidure is the BENZATHINE salt (IM depot) — DO NOT CONFUSE', r:'IV/IM', hl:1, prep:'Reconstitute with WFI or NS to 50,000–500,000 IU/mL; dilute in 100 mL NS for infusion'},
      {s:'10 Lakh IU (1 million IU) vial', c:100000, u:'units', p:'vial reconstituted with 2 mL WFI → 500,000 IU/mL', b:'Penicillin G 10 Lakh IU — Neon/Abbott', r:'IV/IM', prep:'Reconstitute with 2 mL WFI'}],
  admin:'Neurosyphilis: 18–24 MIU/day given as 3–4 MIU IV q4h × 10–14 days. Leptospirosis: 1.5 MIU IV q6–8h × 7 days. Necrotising soft-tissue infection (group A streptococcus): 4 MIU IV q4h PLUS clindamycin 900 mg q8h (toxin suppression). Diphtheria: 1.2 MIU/day divided q6h × 14 days WITH antitoxin.',
  dil:'Contains ~2 mEq of potassium or sodium per million IU — a significant electrolyte load at high doses (hyperkalaemia, especially in renal failure).',
  warn:['ANAPHYLAXIS — a test dose is not required but resuscitation facilities must be immediately available; adrenaline, hydrocortisone and antihistamines drawn up.','Never confuse Benzylpenicillin (Penicillin G, IV/IM) with Procaine penicillin (IM only) or Benzathine penicillin (deep IM depot ONLY — intravenous benzathine penicillin causes cardiorespiratory arrest and death).','High-dose therapy in renal failure → seizures (GABA antagonism).','Jarisch–Herxheimer reaction in syphilis/leptospirosis within 2–8 h — treat supportively with antipyretics and fluids.','Sodium/potassium load; hypersensitivity rash; C. difficile colitis.'],
  ref:['SANFORD','CDC-SYPHILIS','WHO-LEPTO','IAP-DIPHTHERIA','BNF','IAP-STG','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'antitoxin-diph', n:'Diphtheria antitoxin (DAT)', sys:'antiinfective', cls:'Equine antitoxin (passive immunisation)',
  ind:'Suspected respiratory diphtheria — give IMMEDIATELY on clinical suspicion, do not wait for culture', pop:'all', risk:5,
  d:{t:'units', lo:20000, hi:100000, rep:'pharyngeal/laryngeal ≤48 h: 20,000–40,000 IU; nasopharyngeal: 40,000–60,000 IU; extensive disease ≥3 days or bull-neck: 80,000–120,000 IU'},
  fx:[{s:'20,000 IU / 40,000 IU vial', c:10000, u:'units', p:'vial reconstituted with the supplied diluent', b:'Diphtheria Antitoxin (equine) — Haffkine Institute, Serum Institute of India, Vins; DAT', r:'IV/IM', hl:1, prep:'Reconstitute with the supplied sterile diluent; warm to body temperature before use'}],
  admin:'Give as soon as diphtheria is suspected clinically — do NOT wait for laboratory confirmation. Dilute in 100–250 mL NS and infuse IV over 30–60 min (or IM for mild disease). Concurrent benzylpenicillin or erythromycin × 14 days, plus strict isolation and contact prophylaxis.',
  dil:'Warm the reconstituted antitoxin to 37 °C; dilute in NS.',
  warn:['ANAPHYLAXIS AND SERUM SICKNESS — a skin/conjunctival sensitivity test is advised before IV use; have adrenaline 1:1000 drawn up and resuscitation facilities ready.','Observe for 30 min during and 4 h after the infusion.','Equine protein — sensitisation affects future antitoxin/antivenom use.','Serum sickness (fever, rash, arthralgia, proteinuria) in 5–10% at 7–14 days.','Notify public health authorities immediately — diphtheria is a notifiable disease in India.'],
  ref:['IAP-DIPHTHERIA','WHO-DIPHTHERIA','NCDC-DIPHTHERIA','BNF','IAP-STG'] });

R({ id:'tetanus-ig', n:'Human tetanus immunoglobulin (HTIG) / Equine ATS', sys:'antiinfective', cls:'Passive immunoglobulin — neutralises unbound tetanospasmin',
  ind:'Clinical tetanus; post-exposure prophylaxis in an incompletely immunised patient with a tetanus-prone wound', pop:'all', risk:4,
  d:{t:'units', lo:3000, hi:10000, rep:'established tetanus 3,000–6,000 IU IM (or 500 IU IM which may be as effective); prophylaxis 250 IU IM'},
  fx:[{s:'250 IU / 500 IU prefilled syringe (human)', c:250, u:'units', p:'single-dose prefilled syringe', b:'Human Tetanus Immunoglobulin — CSL, Grifols, Kedrion; TETABULIN, HyperTET', r:'IM', hl:1},
      {s:'1500 IU ampoule (equine anti-tetanus serum)', c:1500, u:'units', p:'1 mL ampoule', b:'Anti-Tetanus Serum (equine) — Vins, Serum Institute, Haffkine; ATS 1500 IU', r:'IM'}],
  admin:'Established tetanus: HTIG 3,000–6,000 IU IM once (part may be infiltrated around the wound); some centres give 500 IU IM which appears equally effective. Prophylaxis in a tetanus-prone wound with incomplete immunisation: HTIG 250 IU IM (or ATS 1500 IU IM after a sensitivity test) plus tetanus toxoid at a different site.',
  dil:'IM only — do NOT inject intravenously (human IG contains aggregates that can cause reactions).',
  warn:['HTIG does not neutralise toxin already bound to nervous tissue — give as early as possible and debride the wound.','Equine ATS requires a sensitivity test and carries a risk of anaphylaxis and serum sickness.','Start metronidazole 500 mg IV q6–8h (preferred over penicillin, which is a GABA antagonist), control spasms with benzodiazepines ± magnesium, and ensure airway protection.','Give tetanus toxoid (Td) simultaneously at a DIFFERENT site to complete active immunisation.'],
  ref:['WHO-TETANUS','IAP-TETANUS','CDC-TETANUS','BNF','IAP-STG'] });

/* ---------- anti-TB (ICU-relevant) ---------- */
R({ id:'anti-tb', n:'Anti-tuberculosis therapy (HRZE) — ICU dosing', sys:'antiinfective', cls:'Antimycobacterial combination',
  ind:'Severe/disseminated TB, TB meningitis, miliary TB, TB ARDS, TB pericarditis — initiated in the ICU', pop:'all', risk:4,
  d:{t:'text', text:'HRZE — each drug is dosed separately (see the rows below). Isoniazid 5 mg/kg (max 300 mg) + rifampicin 10 mg/kg (max 600 mg) + pyrazinamide 25 mg/kg (max 2 g) + ethambutol 15 mg/kg (max 1.6 g), once daily on an empty stomach.', rep:'HRZE: isoniazid 5 mg/kg (max 300 mg) + rifampicin 10 mg/kg (max 600 mg) + pyrazinamide 25 mg/kg (max 2 g) + ethambutol 15 mg/kg (max 1.6 g) — once daily, fasting'},
  fx:[{s:'Isoniazid 300 mg tablet', c:300, u:'mg', p:'strip of 10', b:'Isoniazid IP — Zydus/Cipla/Macleods; R-Cinex & Forecox FDCs also contain it', r:'PO/NG', hl:1, own:{kg:5,u:'mg',cap:300,l:'ISONIAZID 5 mg/kg (max 300 mg) once daily. Always co-prescribe pyridoxine 10–25 mg/day (50 mg/day in pregnancy, HIV, malnutrition or diabetes).'}},
      {s:'Isoniazid 100 mg/mL injection', c:100, u:'mg', p:'1 mL ampoule (100 mg); 2 mL ampoule (200 mg)', b:'Koxide inj (Abbott India), Isoniazid IP injection — Cipla/Zydus', r:'IV/IM', own:{kg:5,u:'mg',cap:300,l:'ISONIAZID 5 mg/kg (max 300 mg) once daily — use the IV route in malabsorption, TB meningitis or when the patient cannot take enteral drugs.'}},
      {s:'Rifampicin 450 / 600 mg capsule; 600 mg IV vial', c:600, u:'mg', p:'strip of 10; 600 mg vial reconstituted with 10 mL', b:'Rifampicin IP (Cipla/Sanofi), Rifex, Rcinex; Rifampin IV (limited)', r:'IV/PO', own:{kg:10,u:'mg',cap:600,l:'RIFAMPICIN 10 mg/kg (max 600 mg) once daily, fasting. It is a potent CYP3A4 inducer — expect interactions with warfarin, DOACs, antiretrovirals, corticosteroids, azoles and methadone.'}},
      {s:'Pyrazinamide 500 / 750 / 1000 mg tablets', c:750, u:'mg', p:'strip of 10', b:'Pyrazinamide IP (Zydus/Cipla), Rcinex-PZ', r:'PO', own:{kg:25,u:'mg',cap:2000,l:'PYRAZINAMIDE 25 mg/kg (max 2 g) once daily for the 2-month intensive phase only. Monitor urate and liver function.'}},
      {s:'Ethambutol 400 / 800 / 1000 mg tablets', c:800, u:'mg', p:'strip of 10', b:'Ethambutol IP (Cipla/Zydus), Myambutol, Combutol', r:'PO', own:{kg:15,u:'mg',cap:1600,l:'ETHAMBUTOL 15 mg/kg (max 1.6 g) once daily. Test visual acuity and colour vision before starting and monthly — optic neuritis is dose- and duration-related and is hard to assess in a sedated patient.'}},
      {s:'Fixed-dose combination (FDC) tablets — weight-banded', c:150, u:'mg', p:'strip; NTEP weight bands 25–39 kg, 40–54 kg, 55–70 kg, >70 kg', b:'NTEP/FDC kits: Akurit-4, Rcinex-4, Forecox, Rifater alternatives', r:'PO', own:{text:'Use the NTEP (Nikshay) weight-band FDC once daily on an empty stomach — RHZE 150/75/400/275 mg: 25–39 kg = 1 tablet, 40–54 kg = 2, 55–70 kg = 3, >70 kg = 4. Register every case in Nikshay; FDCs improve adherence and reduce acquired resistance.'}}],
  admin:'Intensive phase (2 months): HRZE once daily on an empty stomach. TB meningitis/pericarditis: add prednisolone or dexamethasone (dexamethasone 0.4 mg/kg/day IV tapering over 6–8 weeks) and consider a fluoroquinolone. Continuation phase (4 months): HR. Register the patient under NTEP (Nikshay) and use weight-band FDCs.',
  dil:'IV isoniazid may be given undiluted or in 100 mL NS; IV rifampicin must be reconstituted and diluted per the insert.',
  warn:['HEPATOTOXICITY from isoniazid, rifampicin and pyrazinamide — check LFTs weekly initially; stop if ALT >5 × ULN (or >3 × ULN with symptoms).','Optic neuritis from ethambutol (dose- and duration-related) — check visual acuity and colour vision monthly; avoid if the patient cannot report visual symptoms.','Rifampicin is a potent CYP3A4/2C inducer — it drastically reduces the levels of corticosteroids, warfarin, antiretrovirals, azoles, voriconazole (contraindicated), methadone, hormonal contraceptives, most antiarrhythmics and many ICU drugs. Review EVERY co-prescription.','Always give pyridoxine 25–50 mg/day with isoniazid to prevent peripheral neuropathy (and 100–200 mg/day in malnutrition, diabetes, alcoholism, pregnancy and HIV).','Red-orange discolouration of urine, tears and sweat from rifampicin is harmless.','Malabsorption in critical illness — measure drug levels or use the IV route where available.'],
  ref:['NTEP-INDIA','WHO-TB','IDSA-TB','SANFORD','BNF','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });

R({ id:'amphotericin-vl', n:'Liposomal amphotericin B — visceral leishmaniasis (kala-azar)', sys:'antiinfective', cls:'Liposomal polyene',
  ind:'Visceral leishmaniasis — the recommended first-line single-dose regimen in the Indian subcontinent', pop:'all', risk:4,
  d:{t:'mgkg', v:10, cap:400, rep:'10 mg/kg IV as a SINGLE dose (India/Bangladesh/Nepal NVBDCP regimen); alternative 3–5 mg/kg/day × 3–5 days'},
  fx:[{s:'50 mg vial', c:4, u:'mg', p:'50 mg vial reconstituted with 12 mL WFI → 4 mg/mL', b:'Ambisome (Gilead), Amphocrit (Cipla), Amblip, Fungisome', r:'IV', hl:1, prep:'Reconstitute with 12 mL WFI, shake vigorously for 30 s until clear, then dilute in D5W and pass through the supplied 0.22 µm filter'}],
  admin:'Single dose 10 mg/kg IV over 2–4 h (WHO/NVBDCP recommended for the Indian subcontinent). Cure rates >95%. Alternatives: 3 mg/kg/day on days 1–5, 14, 17, 21, 28, 31, 38 (immunocompromised patients).',
  dil:'D5W only; use the supplied in-line filter; protect from light.',
  warn:['Infusion reactions (fever, rigors, chest tightness) — pre-medicate with paracetamol and hydrocortisone; slow the infusion.','A 70-kg patient needs 700 mg = 14 vials — confirm stock availability BEFORE starting.','Monitor renal function, K⁺ and Mg²⁺; hydrate before the infusion.','Post-kala-azar dermal leishmaniasis may follow treatment in the Indian subcontinent.'],
  ref:['NVBDCP-KALA','WHO-LEISH','SANFORD','HARRIET-LANE','SINGH-DOSES','GUPTA-FORMULARY'] });
