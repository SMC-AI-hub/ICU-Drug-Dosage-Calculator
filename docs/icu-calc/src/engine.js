/* =====================================================================
   ENGINE.JS — all mathematics. No DOM access here.
   Design rule: never silently guess. If a computation cannot be done
   with certainty it returns null and the UI states why.
   ===================================================================== */

/* ---------------- unit algebra ----------------
   Every unit belongs to a family. Conversion is only allowed WITHIN a
   family. Cross-family conversion needs an explicit salt-specific factor
   supplied by the formulation ('alt' array). This is deliberate: it makes
   a wrong answer impossible rather than merely unlikely.               */
var UFAM = {
  'g':'mass','mg':'mass','mcg':'mass','ug':'mass','µg':'mass','nanogram':'mass','ng':'mass',
  'mL':'vol','ml':'vol','L':'vol','litre':'vol',
  'IU':'iu','unit':'iu','units':'iu','U':'iu','MIU':'iu','mIU':'iu','miu':'iu',
  'mEq':'eq','mmol':'mol','mOsm':'osm','mg elemental Ca':'mass'
};
var MASS_TO_MG = {ng:1e-6,'nanogram':1e-6,'ug':0.001,'µg':0.001,mcg:0.001,mg:1,g:1000};
var UNIT_TO_IU = {'IU':1,'unit':1,'units':1,'U':1,'miu':1,'MIU':1e6,'mIU':1e6};
var VOL_TO_ML  = {mL:1,ml:1,L:1000,litre:1000};

function famOf(u){
  if(u==null) return null;
  u = String(u).trim();
  if(UFAM[u]) return UFAM[u];
  // strip rates e.g. 'mg/mL' 'mg/kg/min'
  var base = u.split('/')[0].trim();
  if(UFAM[base]) return UFAM[base];
  return null;
}
function baseOf(u){ return u==null?null:String(u).trim().split('/')[0].trim(); }
/* canonical spelling of a unit token, so 'ml' and 'mL', 'meq' and 'mEq'
   and 'iu' and 'IU' are always the same unit */
function canonUnit(u){
  if(u==null) return null;
  var b = baseOf(u);
  var t = b.toLowerCase();
  if(t==='ml') return 'mL';
  if(t==='meq') return 'mEq';
  if(t==='mcg'||t==='ug'||t==='µg') return 'mcg';
  if(t==='iu'||t==='u') return 'units';
  if(t==='miu') return 'MIU';
  if(t==='mmol'||t==='mg'||t==='g'||t==='mosm'||t==='mmol'||t==='mm') return b.length<=4?b:b;
  return b;
}

/* Convert an amount between units of the SAME family. Returns null if not possible. */
function convertUnit(amt, from, to){
  if(amt==null||isNaN(amt)) return null;
  from = baseOf(from); to = baseOf(to);
  if(from===to) return amt;
  if(!from||!to) return null;
  var f1=famOf(from), f2=famOf(to);
  if(!f1||f1!==f2) return null;
  if(f1==='mass'){
    var a=MASS_TO_MG[from], b=MASS_TO_MG[to];
    if(a==null||b==null) return null;
    return amt*a/b;
  }
  if(f1==='vol'){
    var a2=VOL_TO_ML[from], b2=VOL_TO_ML[to];
    if(a2==null||b2==null) return null;
    return amt*a2/b2;
  }
  if(f1==='iu'){
    var ia=UNIT_TO_IU[from], ib=UNIT_TO_IU[to];
    if(ia==null||ib==null) return null;
    return amt*ia/ib;
  }
  return null;
}

/* ---------------- clinically safe rounding ----------------
   Rule: never round UP a drug amount. Round DOWN at the displayed
   precision so the patient can never receive more than calculated.     */
function roundDown(x, dp){
  if(x==null||!isFinite(x)) return null;
  var f = Math.pow(10, dp);
  return Math.floor(x*f + 1e-9)/f;      // guard against binary float error
}
/* choose display precision from magnitude */
function precFor(x){
  var a = Math.abs(x);
  if(a===0) return 0;
  if(a<0.01) return 4;
  if(a<0.1)  return 3;
  if(a<1)    return 3;
  if(a<10)   return 2;
  if(a<100)  return 1;
  return 0;
}
function fmtNum(x, forceDp){
  if(x==null||!isFinite(x)) return '—';
  var dp = (forceDp==null)?precFor(x):forceDp;
  var v = roundDown(x, dp);
  if(v==null) return '—';
  if(dp<=0) return String(Math.round(v));
  var s = v.toFixed(dp);
  if(s.indexOf('.')>=0) s = s.replace(/0+$/,'').replace(/\.$/,'');
  return s;
}
function fmtVol(x){
  /* volumes: extra care at the low end */
  if(x==null||!isFinite(x)) return '—';
  if(x===0) return '0';
  if(x<0.001) return '<0.001';
  return fmtNum(x);
}

/* ---------------- age helpers ---------------- */
function ageToDays(y,m,d){
  y = Number(y)||0; m = Number(m)||0; d = Number(d)||0;
  return y*365.25 + m*30.4375 + d;
}
function popOf(days){
  if(days==null) return null;
  if(days < 28) return 'neo';
  if(days < 16*365.25) return 'paed';
  return 'adult';
}
function popLabel(p){ return p==='neo'?'Neonate (<28 days)':p==='paed'?'Paediatric (28 days–16 years)':'Adolescent (16–18 years) — adult doses apply'; }

/* WHO median weight-for-age (kg). Source: WHO Child Growth Standards /
   WHO Reference 2007. Values are medians, interpolated linearly.      */
var WHO_MALE = [[0,3.3],[0.5,7.5],[1,9.6],[2,12.2],[3,14.3],[4,16.3],[5,18.3],[6,20.5],[7,22.9],[8,25.6],
  [9,28.6],[10,31.9],[11,35.6],[12,39.9],[13,44.7],[14,50.4],[15,56.8],[16,63.2],[17,68.7],[18,72.5]];
var WHO_FEMALE = [[0,3.2],[0.5,6.9],[1,8.9],[2,11.5],[3,13.9],[4,16.1],[5,18.2],[6,20.4],[7,22.9],[8,25.8],
  [9,29.2],[10,32.9],[11,37.4],[12,42.4],[13,48.2],[14,53.5],[15,57.7],[16,60.4],[17,61.9],[18,62.5]];
/* APLS weight formulae (Luscombe & Owens where noted) */
function aplsWeight(ageY, ageM){
  var a = Number(ageY)||0, mo = Number(ageM)||0;
  var totalMonths = a*12 + mo;
  if(a<1) return (0.5*totalMonths)+4;                 // APLS infant
  if(a<=5) return (2*a)+8;                            // APLS 1–5 y
  return (3*a)+7;                                     // Luscombe 6–15 y
}
function interpolate(table, x){
  if(x<=table[0][0]) return table[0][1];
  if(x>=table[table.length-1][0]) return table[table.length-1][1];
  for(var i=0;i<table.length-1;i++){
    if(x>=table[i][0] && x<=table[i+1][0]){
      var f=(x-table[i][0])/(table[i+1][0]-table[i][0]);
      return table[i][1] + f*(table[i+1][1]-table[i][1]);
    }
  }
  return null;
}
/* Estimate weight. method: 'auto'|'who'|'apls'|'luscombe'. Returns kg or null. */
function estimateWeight(opt){
  var ageDays = opt.ageDays;
  if(ageDays==null||isNaN(ageDays)) return null;
  if(ageDays > 18*365.25) return null;              // past 18 y: ask for a real weight
  var m = opt.method||'auto';
  /* a preterm infant is weighed against its POSTMENSTRUAL age, not its
     chronological age: a 26-weeker at 2 weeks of life is a 28-week body. */
  var pre = (opt.gaDays!=null && opt.gaDays < 280 && m!=='apls' && m!=='luscombe');
  if(pre){
    var pma = pmaDays(opt.gaDays, ageDays)/7;
    var fw = fentonWeight(pma, opt.sex);
    if(fw!=null) return fw;
    /* past term PMA the WHO standard takes over — but on CORRECTED age:
       a 26-weeker at 40 weeks PMA is a newborn, not a 3-month-old.        */
    if(correctedAgeDays(ageDays, opt.gaDays) < 2*365.25) ageDays = correctedAgeDays(ageDays, opt.gaDays);
  }
  var sex = opt.sex==='female'?WHO_FEMALE:WHO_MALE;
  if(m==='apls') return aplsWeight(opt.ageY, opt.ageM);
  if(m==='luscombe'){ var a=(opt.ageY||0); return a>=1?(3*a)+7:null; }
  if(m==='who' || ageDays<16*365.25){
    var yrs = ageDays/365.25;
    return interpolate(sex, yrs);
  }
  return null;
}

/* ---------------- scope: this is a PAEDIATRIC calculator ----------------
   24 weeks of gestation to the 18th birthday. Entries whose population is
   explicitly 'adult' are out of scope and never listed; everything dosed by
   weight or by age (pop 'all') stays in, because most of it is used in
   children. The scope is a filter, never a deletion: the validated data
   files are untouched, so the numerical gate keeps its full meaning.     */
var SCOPE_MIN_GA_WEEKS = 24, SCOPE_MAX_AGE_Y = 18;
function childScope(r){ return r && r.pop !== 'adult'; }
function scopeReason(ctx){
  if(ctx.gaWeeks!=null && ctx.gaWeeks < SCOPE_MIN_GA_WEEKS)
    return 'Gestational age below '+SCOPE_MIN_GA_WEEKS+' weeks is outside this calculator. Use your unit\'s extreme-preterm protocol and a validated neonatal reference.';
  if(ctx.ageDays!=null && ctx.ageDays >= SCOPE_MAX_AGE_Y*365.25)
    return 'This calculator covers 24 weeks of gestation to 18 years. Past the 18th birthday, use an adult reference.';
  return null;
}

/* ---------------- scope: this is a PAEDIATRIC calculator ----------------
   24 weeks of gestation to the 18th birthday. Entries whose population is
   explicitly 'adult' are out of scope and never listed; everything dosed by
   weight or by age (pop 'all') stays in, because most of it is used in
   children. The scope is a filter, never a deletion: the validated data
   files are untouched, so the numerical gate keeps its full meaning.     */
var SCOPE_MIN_GA_WEEKS = 24, SCOPE_MAX_AGE_Y = 18;
function childScope(r){ return r && r.pop !== 'adult'; }
function scopeReason(ctx){
  if(ctx.gaWeeks!=null && ctx.gaWeeks < SCOPE_MIN_GA_WEEKS)
    return 'Gestational age below '+SCOPE_MIN_GA_WEEKS+' weeks is outside this calculator. Use your unit\'s extreme-preterm protocol and a validated neonatal reference.';
  if(ctx.ageDays!=null && ctx.ageDays >= SCOPE_MAX_AGE_Y*365.25)
    return 'This calculator covers 24 weeks of gestation to 18 years. Past the 18th birthday, use an adult reference.';
  return null;
}

/* ---------------- preterm growth reference (Fenton 2013) ----------------
   Birth-weight 50th centile by postmenstrual age, used ONLY to estimate a
   weight when none has been measured, and to sanity-check one that has.
   Anchors are the published weeks below; the weeks between them are linear
   interpolations. Fenton TR, Kim JH. BMC Pediatr 2013;13:39. Below 24 weeks
   is outside this calculator's declared range and is refused.            */
var FENTON_GA = [24, 28, 30, 32, 34, 36, 40];
var FENTON_MALE   = [0.65, 1.10, 1.40, 1.80, 2.25, 2.70, 3.60];
var FENTON_FEMALE = [0.60, 1.00, 1.30, 1.70, 2.10, 2.60, 3.40];
var PMA_FENTON_MAX = 40;      /* at term and beyond the WHO standard takes over */

function fentonWeight(gaWeeks, sex){
  if(gaWeeks==null || isNaN(gaWeeks)) return null;
  if(gaWeeks < 24)  return null;                 /* below the declared range */
  if(gaWeeks >= PMA_FENTON_MAX) return null;     /* term: use WHO instead      */
  var t = (sex==='female')? FENTON_FEMALE : FENTON_MALE;
  for(var i=0;i<FENTON_GA.length-1;i++){
    if(gaWeeks>=FENTON_GA[i] && gaWeeks<=FENTON_GA[i+1]){
      var f=(gaWeeks-FENTON_GA[i])/(FENTON_GA[i+1]-FENTON_GA[i]);
      return t[i]+f*(t[i+1]-t[i]);
    }
  }
  return null;
}

/* postmenstrual age in days = gestational age at birth + postnatal age */
function pmaDays(gaDays, pnaDays){
  if(gaDays==null || pnaDays==null) return null;
  return gaDays + pnaDays;
}
function gaLabel(gaDays){
  if(gaDays==null) return '—';
  var w=Math.floor(gaDays/7), d=Math.round(gaDays-7*w);
  if(d===7){ w+=1; d=0; }
  return w+'+'+d;
}
/* corrected (post-term) age: chronological age minus the weeks the infant was
   born early. Used for growth and development up to 24 months corrected. */
function correctedAgeDays(ageDays, gaDays){
  if(ageDays==null) return null;
  if(gaDays==null || gaDays>=280) return ageDays;
  return Math.max(0, ageDays - (280-gaDays));
}
function preterm(gaDays){ return gaDays!=null && gaDays < 259; }   /* <37+0 */

/* the preterm reference must never go backwards with age — the gate relies
   on this being true of the table itself, not just of the samples */
function fentonMonotonic(sex){
  var prev=-1;
  for(var w=24; w<40; w+=0.25){
    var v=fentonWeight(w, sex);
    if(v==null || v<=prev) return false;
    prev=v;
  }
  return true;
}

/* ---------------- body-size calculations ---------------- */
function ibwDevine(cm, sex){
  if(!cm||cm<=0) return null;
  var inch = cm/2.54;
  return sex==='female' ? 45.5 + 2.3*(inch-60) : 50 + 2.3*(inch-60);
}
function adjBW(ibw, abw){ if(ibw==null||abw==null) return null; return ibw + 0.4*(abw-ibw); }
function bsaMosteller(cm, kg){
  if(!cm||!kg||cm<=0||kg<=0) return null;
  return Math.sqrt((cm*kg)/3600);
}
function bsaHaycock(cm, kg){          // preferred in infants <10 kg
  if(!cm||!kg||cm<=0||kg<=0) return null;
  return 0.024265*Math.pow(cm,0.3964)*Math.pow(kg,0.5378);
}
function crclCG(ageY, kg, scrMgdl, sex){
  if(!ageY||!kg||!scrMgdl||scrMgdl<=0) return null;
  var v = ((140-ageY)*kg)/(72*scrMgdl);
  return sex==='female'? v*0.85 : v;
}
function egfrSchwartz(cm, scrMgdl, k){
  if(!cm||!scrMgdl||scrMgdl<=0) return null;
  return (k||0.413)*cm/scrMgdl;      // bedside Schwartz 2009, k=0.413
}
function crclJelliffe(ageY, scrMgdl, sex){
  if(!ageY||!scrMgdl||scrMgdl<=0) return null;
  var v = (98 - 0.8*(ageY-20))/scrMgdl;
  return sex==='female'? v*0.9 : v;
}
function maintenanceFluids(kg){       // Holliday–Segar (mL/24 h)
  if(!kg||kg<=0) return null;
  if(kg<=10) return 100*kg;
  if(kg<=20) return 1000 + 50*(kg-10);
  return 1500 + 20*(kg-20);
}
/* Free water deficit (L) = 0.6 x BW x (1 - 140/[Na]) */
function freeWaterDeficit(kg, na, sex){
  if(!kg||!na||na<=0) return null;
  var tbw = kg*(sex==='female'?0.5:0.6);
  return tbw*(1 - 140/na);
}
/* Adrogue-Madias: change in serum Na per 1 L of infusate */
function adrogueMadias(naSerum, infusateNa, tbw){
  if(naSerum==null||infusateNa==null||!tbw) return null;
  return (infusateNa - naSerum)/(tbw+1);
}
/* K+ deficit (mmol) ~ 200-400 mmol per 1 mmol/L fall below 4.0 */
function potassiumDeficit(kSerum, kg){
  if(kSerum==null||!kg) return null;
  if(kSerum>=3.0) return (4.0-kSerum)*200;
  return 400 + (3.0-kSerum)*400;
}
function sodiumForHyponatraemia(kg, naSerum, target){
  if(!kg||!naSerum) return null;
  var tbw = kg*0.6;
  return tbw*((target||125) - naSerum);
}

/* ---------------- dose type classification ----------------
   A dose type string is normalised to lowercase with every separator
   removed, then parsed into {u: dose unit, per: scaling, kind}.
   kind: 'bolus' (per administration) | 'rate' (per time) | 'daily' | 'text'
   The parser is total: any unit x any scaling x any time-base is accepted,
   so a new data file cannot silently produce an unhandled type.        */
function dtOf(t){
  if(t==null) return null;
  var k = String(t).toLowerCase().replace(/[\s\-_\/.]/g,'');
  if(k===''||k==='text') return k==='text'?{u:null,per:null,kind:'text'}:null;
  if(k.indexOf('iu')===0) k = 'units'+k.slice(2);          /* IU family -> units */
  if(k.indexOf('miu')===0) k = 'MIU'+k.slice(3);
  var m = /^(mg|mcg|miu|g|units|meq|mmol|mosm|ml)(kg)?(min|h|hr|day|d)?$/.exec(k);
  if(!m) return null;
  var u = m[1]==='meq' ? 'mEq' : m[1]==='ml' ? 'mL' : m[1]==='miu' ? 'MIU' : m[1]==='mosm' ? 'mOsm' : m[1];
  var perKg = !!m[2];
  var tb = m[3]; if(tb==='hr') tb='h'; if(tb==='d') tb='day';
  var per = (perKg?'kg':'') + (tb?((perKg?'/':'')+tb):'');
  if(per==='') per = null;
  var kind;
  if(per==null) kind='bolus';
  else if(per==='kg') kind='bolus';
  else if(per==='day'||per==='kg/day') kind='daily';
  else kind='rate';
  return {u:u, per:per, kind:kind, raw:k};
}

/* ---------------- the dose engine ----------------
   ctx: {kg, ageDays, pop, heightCm, crCl, ibw, dosingWeight, dosingWeightLabel}
   returns a fully computed object or {error:'...'}                        */
function computeRegimen(reg, ctx){
  var out = {reg:reg, ok:false, dose:null, items:[], notes:[], alerts:[]};
  var d = reg.d||{};
  /* make the active dosing weight visible to volForFx (used by fx.own rows
     and by per-kg rate rows) without threading ctx through every call */
  if(ctx){ ctxRef.kg = (ctx.dosingWeight!=null)?ctx.dosingWeight:(ctx.kg||null); }
  /* text-only regimens: still list every formulation, but compute nothing */
  function fillItems(dt){
    var fxList=(reg.fx||[]), computable=0;
    for(var i=0;i<fxList.length;i++){
      var r = volForFx(fxList[i], out, dt, d);
      if(r){ out.items.push(r); if(r.mode==='conc'||r.mode==='direct'||r.mode==='fixed') computable++; }
    }
    out.computable=computable;
    if(out.items.length===0) out.error='This entry has no formulation listed.';
    else if(computable===0 && out.kind!=='text')
      out.error='None of the listed formulations can be matched to the dose unit ('+(dt?dt.u:'-')+'). No quantity is shown - follow the administration note.';
  }
  var dt0 = dtOf(d.t);
  if((d.text && !d.t) || (dt0 && dt0.kind==='text')){
    out.ok=true; out.kind='text'; out.doseText=d.text||'(no numeric dose - see administration note)';
    fillItems(dt0||{u:null,per:null,kind:'text'});
    return out;
  }
  var dt = dt0;
  if(!dt){ out.error='Unknown dose type "'+d.t+'"'; return out; }
  var kg = ctx.dosingWeight!=null?ctx.dosingWeight:(ctx.kg||null);
  var needKg = !!dt.per && dt.per.indexOf('kg')>=0;
  if(needKg && (!kg||kg<=0)){ out.error='Enter a body weight (or an age so weight can be estimated)'; return out; }

  /* 1. the numeric dose value */
  var lo = (d.lo!=null)?d.lo:(d.v!=null?d.v:null);
  var hi = (d.hi!=null)?d.hi:(d.v!=null?d.v:null);
  if(lo==null||hi==null){
    if(d.text){ out.ok=true; out.kind='text'; out.doseText=d.text; fillItems(dt); return out; }
    out.error='No dose value defined'; return out;
  }

  /* 2. scale by weight */
  function scale(v){
    /* Only weight-based dose types are multiplied by body weight.
       A fixed rate such as 'mcg/min' or 'mg/h' is an ABSOLUTE amount and
       must never be scaled - scaling it would inflate the dose by the
       body weight in kilograms. */
    if(!dt.per || dt.per.indexOf('kg')<0) return v;
    return v*kg;
  }
  var aLo = scale(lo), aHi = scale(hi);

  /* 3. apply cap
     A cap may be declared either as an absolute amount (cap / capDay) or
     as a per-kilogram ceiling (capKg / capDayKg). Both may be present; the
     more restrictive (smaller) one is always the one applied. */
  var isDaily = dt.kind==='daily';
  var capped=false, capMsg=null, capUsed=null, capFromKg=false;
  function capValue(daily){
    var abs = daily ? (d.capDay!=null?d.capDay:d.cap) : d.cap;
    var perKg = daily ? (d.capDayKg!=null?d.capDayKg:d.capKg) : d.capKg;
    var res=null, fromKg=false;
    if(abs!=null){ res=abs; }
    if(perKg!=null && kg>0){
      var v=perKg*kg;
      if(res==null || v<res){ res=v; fromKg=true; }
    }
    return {v:res,kg:fromKg,perKg:perKg,abs:abs};
  }
  function applyCap(v, daily){
    var c = capValue(daily);
    if(c.v==null || v==null) return v;
    if(v>c.v){ capped=true; capUsed=c.v; capFromKg=c.kg; capPerKgShown=c.perKg; return c.v; }
    return v;
  }
  var capPerKgShown=null;
  aLo = applyCap(aLo, isDaily); aHi = applyCap(aHi, isDaily);
  if(capped){
    var suf = isDaily?' /24 h':' per dose';
    capMsg = capFromKg
      ? ('Maximum cap applied: '+fmtNum(capPerKgShown)+' '+dt.u+'/kg'+suf+
         ' = '+fmtNum(capUsed)+' '+dt.u+' at '+fmtNum(kg)+' kg. The weight-based calculation exceeded this maximum.')
      : ('Maximum cap applied: '+fmtNum(capUsed)+' '+dt.u+suf+
         '. The weight-based calculation exceeded the licensed/protocol maximum.');
    out.alerts.push(capMsg);
  }
  out.capPerKg = capFromKg ? capPerKgShown : null;

  /* 4. divide for multi-dose daily regimens */
  var div = d.div||1;
  var perDoseLo = aLo/div, perDoseHi = aHi/div;

  /* 5. describe */
  var unitStr = dt.u + (dt.per? '/'+dt.per : '');
  out.ok = true;
  out.kind = dt.kind;
  out.prescribed = unitStr;
  out.unit = unitStr;
  out.dtU = dt.u;
  out.per = dt.per;
  out.div = div;
  out.capApplied = capped;
  out.capMsg = capMsg;

  if(dt.kind==='rate'){
    /* the time base of the prescribed rate: min | h | day */
    var tb = /min$/.test(dt.per) ? 'min' : (/h$/.test(dt.per) ? 'h' : 'day');
    var toMin = tb==='min' ? 1 : (tb==='h' ? 1/60 : 1/(24*60));
    out.rateTb = tb;
    out.rateLo = perDoseLo; out.rateHi = perDoseHi;                 /* exactly as prescribed */
    out.ratePerMinLo = perDoseLo*toMin;     out.ratePerMinHi = perDoseHi*toMin;
    out.ratePerHrLo  = out.ratePerMinLo*60; out.ratePerHrHi  = out.ratePerMinHi*60;
    out.ratePerDayLo = out.ratePerHrLo*24;  out.ratePerDayHi = out.ratePerHrHi*24;
    out.unit = dt.u+'/'+tb;
    out.dose = {lo:perDoseLo, hi:perDoseHi, unit:out.unit, text: doseText(perDoseLo,perDoseHi,out.unit),
                prescribedText: doseText(lo,hi,unitStr)};
  } else if(dt.kind==='daily'){
    out.unit = dt.u+'/24 h';
    out.dose = {lo:aLo, hi:aHi, unit:out.unit, text: doseText(aLo,aHi,out.unit),
                prescribedText: doseText(lo,hi,unitStr)};
    out.dailyLo = aLo; out.dailyHi = aHi;
    if(div>1){
      out.perDose = {lo:perDoseLo, hi:perDoseHi, unit:dt.u, text: doseText(perDoseLo,perDoseHi,dt.u)+' per dose × '+div};
    }
  } else {
    out.unit = dt.u;
    out.dose = {lo:perDoseLo, hi:perDoseHi, unit:dt.u, text: doseText(perDoseLo,perDoseHi,dt.u),
                prescribedText: doseText(lo,hi,unitStr)};
  }

  /* 6. quantity for each formulation */
  fillItems(dt);

  /* 7. PUMP RATES for every standard dilution preset.
     A rate regimen must never be read off the neat ampoule concentration:
     the ampoule row gives the drug QUANTITY per hour, which is not what the
     pump is programmed with. These are the real mL/h figures. */
  out.pump = [];
  if(reg.inf && dt.kind==='rate'){
    var presets = reg.diln||[];
    for(var q=0;q<presets.length;q++){
      var pr = presets[q];
      if(pr==null || pr.amt==null || pr['in']==null || !(pr['in']>0)) continue;
      var cAmt = convertUnit(pr.amt, canonUnit(pr.u), dt.u);
      /* a preset may state its content in another unit as well (e.g. 10 g of
         calcium gluconate = 22.5 mmol of elemental calcium in the same bag) */
      if(cAmt==null && pr.alt){
        var al = (Object.prototype.toString.call(pr.alt)==='[object Array]')?pr.alt:[pr.alt];
        for(var w=0;w<al.length;w++){ if(canonUnit(al[w].u)===dt.u && al[w].amt!=null){ cAmt=al[w].amt; break; } }
      }
      if(cAmt==null) continue;
      var concPerMl = cAmt/pr['in'];
      if(!(concPerMl>0)) continue;
      out.pump.push({
        l:pr.l||'', bag:pr.bag||'', amt:pr.amt, amtU:canonUnit(pr.u), vol:pr['in'],
        concPerMl:concPerMl, concUnit:dt.u+'/mL',
        mlPerHrLo:  out.ratePerHrLo /concPerMl, mlPerHrHi:  out.ratePerHrHi /concPerMl,
        mlPerMinLo: out.ratePerMinLo/concPerMl, mlPerMinHi: out.ratePerMinHi/concPerMl,
        bagHoursLo: pr['in']/(out.ratePerHrHi /concPerMl), bagHoursHi: pr['in']/(out.ratePerHrLo /concPerMl),
        dayAmtLo: out.ratePerDayLo, dayAmtHi: out.ratePerDayHi, dayUnit:dt.u+'/24 h'
      });
    }
    out.infNote = out.pump.length
      ? 'Program the pump from the DILUTION table below (mL/h). The ampoule rows show the drug quantity per hour, NOT the pump rate.'
      : 'No standard dilution is defined for this infusion - use the ampoule quantity per hour and calculate the bag rate manually, then have it independently checked.';
  }
  tenFoldCheck(reg, out, ctx);
  return out;
}

/* ---------------- decimal-point / ten-fold guard ----------------
   The error that kills children is a misplaced decimal: a dose or a drawn
   volume ten times — or a tenth of — what was intended. Armed only for
   paediatric and neonatal patients: flag a computed dose more than 10x above,
   or more than 10x below, the cited per-kg range for the entered weight.
   (A drawn-volume rule was tried and removed: infusions and fluid boluses
   legitimately exceed any fixed mL threshold, so it cried wolf.)
   A deliberately applied dose cap exempts the low side only. */
/* ---------------- weight / age decimal-point guard ----------------
   The commonest fatal keyboard error is a misplaced decimal in the WEIGHT:
   3.4 kg entered as 34, or 70 kg as 7. Compare the entered weight with the
   WHO median for the entered age (or a plausible adult band) and say so.  */
function weightAgeCheck(kg, ageDays, sex, gaDays){
  if(kg==null || ageDays==null) return null;
  if(gaDays!=null && gaDays<168)
    return 'a gestational age below 24 weeks is outside this calculator — use your unit\'s extreme-preterm protocol and a validated neonatal reference.';
  if(ageDays >= 18*365.25)
    return 'this calculator covers 24 weeks of gestation to 18 years. Past the 18th birthday, use an adult reference.';
  if(ageDays >= 16*365.25){
    if(kg < 20)  return 'a weight of '+fmtNum(kg,1)+' kg was entered for an adolescent — possible decimal-point error. Re-weigh before dosing.';
    if(kg > 200) return 'a weight of '+fmtNum(kg,1)+' kg is beyond plausible — check the entry.';
    return null;
  }
  /* preterm: the median must come from postmenstrual / corrected age, never
     from the chronological age — a 26-weeker at 3 weeks is not a 3-week-old */
  var med = estimateWeight({ageDays:ageDays, gaDays:gaDays, sex:sex||'male', method:'who'});
  if(med==null || !(med>0)) return null;
  if(kg > med*3)
    return fmtNum(kg,1)+' kg is more than 3× the reference median ('+fmtNum(med,1)+' kg) for this age — possible decimal-point error. Re-weigh before dosing.';
  if(kg < med/3)
    return fmtNum(kg,1)+' kg is less than a third of the reference median ('+fmtNum(med,1)+' kg) for this age — possible decimal-point error. Re-weigh before dosing.';
  return null;
}

function tenFoldCheck(reg, out, ctx){
  if(!out || !out.ok || !ctx) return;
  if(ctx.pop!=='paed' && ctx.pop!=='neo') return;
  var kg = ctx.kg;
  var dt = (reg.d && reg.d.t) ? dtOf(reg.d.t) : null;
  if(!dt || String(dt.per).indexOf('kg')<0 || kg==null) return;
  if(reg.d.hi==null || reg.d.lo==null) return;
  if(!out.dose || out.dose.hi==null) return;
  var inU = convertUnit(out.dose.hi, out.unit, dt.u);
  if(inU==null) return;
  var perKg = inU/kg;
  if(!isFinite(perKg) || perKg<=0) return;
  if(perKg > reg.d.hi*10){
    /* a cap can only ever REDUCE a dose, so nothing legitimate lands here */
    out.alerts.push('TEN-FOLD CHECK — the computed dose ('+fmtNum(perKg)+' '+dt.u+'/kg) is more than 10x the cited ceiling of '+
      fmtNum(reg.d.hi)+' '+dt.u+'/kg. Suspect a decimal point or a unit error; do not administer until independently rechecked.');
  } else if(!out.capApplied && perKg < reg.d.lo/10){
    /* below the floor is legitimate when a maximum-dose cap bites, so that case is exempt */
    out.alerts.push('TEN-FOLD CHECK — the computed dose ('+fmtNum(perKg)+' '+dt.u+'/kg) is less than a tenth of the cited floor of '+
      fmtNum(reg.d.lo)+' '+dt.u+'/kg. Suspect a decimal point or a unit error.');
  }
}

function doseText(lo,hi,unit){
  if(lo==null) return '—';
  var same = (hi==null) || (Math.abs(hi-lo)<1e-12);
  if(same) return fmtNum(lo)+' '+unit;
  return fmtNum(lo)+'–'+fmtNum(hi)+' '+unit;
}

/* physical form of a formulation: 'liquid' or 'solid'.
   Solids are dosed as a COUNT of dosage units, liquids as a VOLUME. */
function fxForm(fx){
  var s = ((fx.s||'')+' '+(fx.p||'')+' '+(fx.b||'')).toLowerCase();
  if(/\b(tablet|tablets|tab|tabs|capsule|capsules|cap|rotacap|sachet|sachets|suppository|pessary|lozenge|inhaler|inhalers|effervescent|chewable|rotabs|dry\s*syrup|powder\s+for\s+suspension|odt|dispersible)\b/.test(s)) return 'solid';
  return 'liquid';
}

/* Quantity needed for ONE formulation given the computed dose.
   mode:
     'conc'   quantity = amount / concentration   (the normal case)
     'direct' the dose is itself a volume         (mL-based doses)
     'fixed'  the formulation carries its own instruction (co-administered drug)
     'info'   nothing to compute (text-only regimen, no concentration declared)
     'na'     conversion impossible - never guess; the UI states why         */
function volForFx(fx, out, dt, d){
  if(!fx) return null;
  var form = fxForm(fx);
  var perUnit = fx.per || (form==='solid' ? 'unit' : 'mL');
  var base = {fx:fx, form:form, perUnit:perUnit};

  /* (1) rows that state their own fixed instruction */
  if(fx.use==='fixed' || fx.give){
    base.mode='fixed'; base.give = fx.give||''; base.label='as stated';
    return base;
  }
  /* (2) a row may carry its OWN numeric dose. This is how a single entry
        that combines several different drugs (hydrocortisone AND
        methylprednisolone, or poractant 200 mg/kg AND beractant 100 mg/kg)
        still produces a CORRECT volume for every row instead of applying
        one drug's dose to another drug's concentration. */
  var doseU, amtLo, amtHi, label, concU;
  if(fx.own){
    var ow = fx.own;
    if(ow.text){ base.mode='fixed'; base.give=ow.text; base.label='as stated'; return base; }
    doseU = canonUnit(ow.u);
    if(ow.kg!=null || ow.kgLo!=null){
      var kgv = ctxRef.kg;
      if(!kgv || kgv<=0){
        base.mode='info'; base.label='-';
        base.reason='This row is weight-based - enter a body weight (or an age so it can be estimated).';
        return base;
      }
      var kl = (ow.kgLo!=null)?ow.kgLo:ow.kg;
      var kh = (ow.kgHi!=null)?ow.kgHi:kl;
      amtLo = kl*kgv; amtHi = kh*kgv;
      if(ow.cap!=null){ amtLo=Math.min(amtLo,ow.cap); amtHi=Math.min(amtHi,ow.cap); base.ownCapHit=(kh*kgv>ow.cap); }
    } else {
      amtLo = (ow.lo!=null)?ow.lo:ow.a;
      amtHi = (ow.hi!=null)?ow.hi:ow.a;
    }
    label = ow.l || 'per dose';
    if(amtLo==null || !doseU){ base.mode='info'; base.label='-'; return base; }
  } else {
    if(out.kind==='text' || !dt || dt.u==null){ base.mode='info'; base.label='-'; return base; }
    doseU = canonUnit(dt.u);
    if(out.kind==='bolus'){ amtLo=out.dose.lo; amtHi=out.dose.hi; label='per dose'; }
    else if(out.kind==='daily'){ amtLo=(out.perDose?out.perDose.lo:out.dailyLo); amtHi=(out.perDose?out.perDose.hi:out.dailyHi); label=out.perDose?'per dose':'per 24 h'; }
    else if(out.kind==='rate'){ amtLo=out.ratePerHrLo; amtHi=out.ratePerHrHi; label='per hour'; }
    if(amtLo==null){ base.mode='info'; base.label='-'; return base; }
  }

  var conc = fx.c;
  concU = canonUnit(fx.u);
  base.label=label; base.doseAmtLo=amtLo; base.doseAmtHi=amtHi; base.doseUnit=doseU;
  base.conc=conc; base.concUnit=fx.u;
  base.doseText = (amtHi==null||Math.abs(amtHi-amtLo)<1e-12)
      ? fmtNum(amtLo)+' '+doseU : fmtNum(amtLo)+'-'+fmtNum(amtHi)+' '+doseU;

  if(conc==null || isNaN(conc) || conc<=0){
    base.mode='info'; base.reason='No concentration is declared for this formulation.'; return base;
  }

  /* (3) the dose is itself a volume */
  if(doseU==='mL'){
    if(form==='solid'){
      base.mode='na';
      base.reason='The dose is prescribed as a volume, so it does not apply to this solid formulation.';
      return base;
    }
    base.mode='direct'; base.volLo=amtLo; base.volHi=amtHi;
    if(out.kind==='rate'){ rateExtras(base, out, amtLo, amtHi, amtLo/60, amtHi/60); }
    flagDilution(base, amtLo);
    return base;
  }

  /* (4) express the dose in the formulation's own unit, then divide by its
        concentration. 'alt' supplies a salt-specific factor for the cases in
        which a generic unit conversion would be WRONG (mmol of elemental
        calcium in calcium gluconate, anti-Xa units in enoxaparin, mmol of
        elemental phosphorus per tablet). Without it we refuse to guess. */
  function qtyOf(a){
    if(a==null) return null;
    var v = convertUnit(a, doseU, concU);
    if(v!=null) return v/conc;
    var alts = fx.alt||[];
    for(var j=0;j<alts.length;j++){
      if(canonUnit(alts[j].u)===doseU && alts[j].c){ return a/alts[j].c; }
    }
    return null;
  }
  var vLo=qtyOf(amtLo), vHi=qtyOf(amtHi);
  if(vLo==null){
    base.mode='na';
    base.reason='The dose is in '+doseU+' but this formulation is labelled in '+concU+'. No validated conversion exists, so no quantity is shown - read the administration note.';
    return base;
  }
  base.mode='conc';
  base.volLo=vLo; base.volHi=vHi;
  if(out.kind==='rate'){
    rateExtras(base, out, vLo, vHi, qtyOf(out.ratePerMinLo), qtyOf(out.ratePerMinHi));
  }
  flagDilution(base, vLo);
  return base;
}

/* a rate row exposes the same quantity on three time bases so that the pump
   can be programmed in mL/h and independently cross-checked in mL/min and in
   the dose units of the original prescription */
function rateExtras(base, out, volHrLo, volHrHi, volMinLo, volMinHi){
  base.mlPerHrLo=volHrLo; base.mlPerHrHi=volHrHi;
  base.mlPerMinLo=volMinLo; base.mlPerMinHi=volMinHi;
  base.dosePerHrLo=out.ratePerHrLo; base.dosePerHrHi=out.ratePerHrHi;
  base.dosePerMinLo=out.ratePerMinLo; base.dosePerMinHi=out.ratePerMinHi;
  base.dosePerDayLo=out.ratePerDayLo; base.dosePerDayHi=out.ratePerDayHi;
  base.rateTb=out.rateTb;
  base.unitsPerHrLo=out.ratePerHrLo; base.unitsPerHrHi=out.ratePerHrHi;
  base.unitsPerMinLo=out.ratePerMinLo; base.unitsPerMinHi=out.ratePerMinHi;
  if(ctxRef && ctxRef.kg){ base.perKgMinLo=out.ratePerMinLo/ctxRef.kg; base.perKgHrLo=out.ratePerHrLo/ctxRef.kg; }
}

function flagDilution(o, v){
  o.needsDilution = (v!=null && v>0 && v<0.1 && o.form==='liquid');
  o.fractional = false; o.fracAdvice = null;
  if(!o.needsDilution){
    if(v!=null && v>0 && v<1 && o.form && o.form!=='liquid'){
      o.fractional = true;
      var du = (o.fx && (o.fx.p||o.fx.du)) || 'dosage unit';
      o.fracAdvice = 'This is a fraction of one '+du+' ('+fmtVol(v)+' '+du+
        '). Do NOT estimate this by splitting - use a liquid strength (syrup, suspension or drops) or a different pack size so the dose can be measured accurately.';
      o.alert = o.fracAdvice;
    }
    return;
  }
  if(v>=0.01){
    o.dilAdvice='The drawn volume '+fmtVol(v)+' mL is below the reliably measurable 0.1 mL. Make a 1:10 dilution - take '+fmtVol(v)+' mL, add diluent to a total of '+fmtVol(v*10)+' mL, then give '+fmtVol(v*10)+' mL of the dilution.';
  } else {
    o.dilAdvice='The drawn volume '+fmtVol(v)+' mL cannot be measured even after a 1:10 dilution. Make a 1:100 dilution - take '+fmtVol(v)+' mL, add diluent to a total of '+fmtVol(v*100)+' mL, then give '+fmtVol(v*100)+' mL - or use a weaker strength.';
  }
}
var ctxRef = {kg:null};   /* set by the UI before computing rates */

/* ---------------- infusion pump calculator ("mix & run") ----------------
   The clinician states the infusion in whichever way they hold it:
     made : "I put 50 mg into a 50 mL syringe"   (drugAmt, drugUnit, totalVol)
     label: "the bag reads 1 mg/mL"              (concC, concU)
   and the ordered dose in any of the usual clinical units. Everything else —
   the per-mL content, the pump rate, the drip rate, how long the container
   lasts, the 24 h load and the deliverability checks — is derived.

   o: {doseAmt, doseUnit, per, kg,
       drugAmt, drugUnit, totalVol, concC, concU, dripFactor, containerMl}
   per: 'kg/min' | 'kg/h' | 'kg/day' | 'min' | 'h' | 'day' | 'kg'              */
function infusionCalc(o){
  var res = {ok:false, steps:[], checks:[]};
  var kg = o.kg, per = o.per||'', doseAmt = o.doseAmt, du = o.doseUnit;
  if(doseAmt==null||isNaN(doseAmt)||doseAmt<=0){ res.err='Enter the ordered dose.'; return res; }
  if(per.indexOf('kg')===0 && (kg==null||isNaN(kg)||kg<=0)){ res.err='Enter the patient weight — this dose is per kg.'; return res; }

  /* 1. amount delivered per hour, in the dose unit */
  var perHour;
  if(per==='kg/min'){ perHour = doseAmt*kg*60; }
  else if(per==='kg/h'){ perHour = doseAmt*kg; }
  else if(per==='kg/day'){ perHour = doseAmt*kg/24; }
  else if(per==='kg'){ perHour = doseAmt*kg; }
  else if(per==='min'){ perHour = doseAmt*60; }
  else if(per==='h'){ perHour = doseAmt; }
  else if(per==='day'){ perHour = doseAmt/24; }
  else { perHour = doseAmt; }
  res.perHourAmt = perHour; res.perHourUnit = du+'/h';

  /* 2 & 3. what each mL of the line holds (shared with reverseCheck) */
  var cb = concBlock(o, du);
  if(cb.err){ res.err = cb.err; return res; }
  var concPerMl = cb.concPerMl;
  res.concPerMl = concPerMl;
  res.perMl = cb.perMl;

  /* 4. the pump */
  res.mlPerHr = perHour/concPerMl;
  res.mlPerMin = res.mlPerHr/60;
  res.gttPerMin = (o.dripFactor)? dripRate(res.mlPerHr, o.dripFactor) : null;
  res.ok = isFinite(res.mlPerHr) && res.mlPerHr>0;
  if(!res.ok){ res.err='That combination gives no deliverable rate.'; return res; }

  /* 5. what the patient actually receives, expressed several ways */
  var amtHr = res.mlPerHr*concPerMl;
  res.deliver = { amtPerMin:amtHr/60, amtPerHr:amtHr, amtPerDay:amtHr*24,
    perKgMin:(kg? amtHr/60/kg : null), perKgHr:(kg? amtHr/kg : null), perKgDay:(kg? amtHr*24/kg : null) };

  /* 6. container duration and 24 h load */
  if(o.containerMl!=null && o.containerMl>0){
    res.containerMl = o.containerMl;
    res.hoursLast = o.containerMl/res.mlPerHr;
  }
  res.dayAmt = amtHr*24; res.dayUnit = du;

  /* 7. deliverability checks — the pump, not the person, must catch these */
  if(res.mlPerHr < 0.1)
    res.checks.push({level:'warn', msg:'Under 0.1 mL/h — most pumps cannot hold this accurately. Use a MORE concentrated preparation, or a smaller final volume.'});
  else if(res.mlPerHr < 1)
    res.checks.push({level:'info', msg:'Under 1 mL/h: use a syringe pump (not a volumetric pump) and check the rate against this page with a second person.'});
  if(res.mlPerHr > 999)
    res.checks.push({level:'warn', msg:'Over 999 mL/h — beyond most pumps. Use a MORE dilute preparation or split the dose across two lines.'});
  if(res.hoursLast!=null && res.hoursLast < 1)
    res.checks.push({level:'info', msg:'The '+o.containerMl+' mL container empties in under an hour at this rate — expect a changeover soon.'});
  return res;
}

/* concentration of the line in <du> per mL, plus the "each 1 mL contains"
   breakdown in the drug's own unit and every unit it converts to exactly.
   Shared by the forward calculator and the reverse (pump-to-dose) checks so
   the two can never disagree.                                            */
function concBlock(o, du){
  var concPerMl = null;
  if(o.concC!=null && o.concU!=null){
    var c = convertUnit(o.concC, baseOf(o.concU), du);
    if(c!=null) concPerMl = c;
  } else if(o.drugAmt!=null && o.totalVol!=null && o.totalVol>0){
    var a = convertUnit(o.drugAmt, o.drugUnit, du);
    if(a!=null) concPerMl = a/o.totalVol;
  }
  if(concPerMl==null||concPerMl<=0)
    return {err:'Cannot express that preparation in '+du+'/mL. Check the units — a mass dose needs a mass concentration.'};
  var out = {concPerMl:concPerMl, perMl:[]};
  var homeU = (o.concC!=null)? baseOf(o.concU) : o.drugUnit;
  if(homeU){
    var homePerMl = (o.concC!=null)? o.concC : (o.drugAmt/o.totalVol);
    out.perMl.push({u:homeU, v:homePerMl});
  }
  ['mg','mcg','g','units','IU','mmol','mEq'].forEach(function(u){
    if(out.perMl.some(function(p){ return p.u===u; })) return;
    var v = convertUnit(concPerMl, du, u);
    /* skip alternates that are numerically nothing at a readable precision
       (80 mcg/mL is also 0.00008 g/mL - printing "0 g" only adds noise) */
    if(v!=null && isFinite(v) && v>=1e-4) out.perMl.push({u:u, v:v});
  });
  return out;
}

/* ---------------- dose-basis arithmetic ----------------
   perTime() -> minutes per stated basis (so per-minute doses scale to /h),
   comparablePer() -> are two bases the same family (per-kg vs absolute),
   perFactor() -> exact multiplier from one basis to another, else null.
   These live with the engine because the reverse check and the forward
   calculator must never disagree about what a basis means.               */
function perTime(p){
  if(p==='kg/min'||p==='min') return 1;
  if(p==='kg/h'||p==='h') return 60;
  if(p==='kg/day'||p==='day') return 1440;
  if(p==='kg') return 0;
  return -1;
}
function comparablePer(a, b){
  var fa=(a&&a.indexOf('kg')===0)?'kg':'abs', fb=(b&&b.indexOf('kg')===0)?'kg':'abs';
  if(fa!==fb) return false;
  var ta=perTime(a), tb=perTime(b);
  if(ta<0||tb<0) return false;
  if(ta===0||tb===0) return a===b;
  return true;
}
function perFactor(from, to){
  var a=perTime(from), b=perTime(to);
  if(a<0||b<0||a===0||b===0) return (from===to)?1:null;
  return b/a;
}

/* ---------------- pump-resolution honesty ----------------
   A pump does not hold an arbitrary rate: it holds whole steps (commonly
   0.1 mL/h on a syringe pump, 1 mL/h on a volumetric pump). A target of
   3 mL/h is really somewhere in 2.95-3.05 mL/h, i.e. ±1.7 % of dose. When
   half a step is more than 5 % of the target, the pump — not the arithmetic
   — is limiting the accuracy, and the mix panel says so.                 */
function pumpBand(mlPerHr, step){
  if(mlPerHr==null || !isFinite(mlPerHr) || mlPerHr<=0) return null;
  step = (step==null || step<=0)? 0.1 : step;
  var half = step/2;
  var mlLo = Math.max(0, mlPerHr-half), mlHi = mlPerHr+half;
  var pct = (half/mlPerHr)*100;
  return {step:step, mlLo:mlLo, mlHi:mlHi, halfPct:pct, coarse:(pct>5)};
}

/* the same band expressed as a delivered dose, in du/h and du/kg/h */
function deliverBand(mlPerHr, step, concPerMl, kg){
  var b = pumpBand(mlPerHr, step);
  if(!b || concPerMl==null) return null;
  b.amtLo = b.mlLo*concPerMl; b.amtHi = b.mlHi*concPerMl;
  if(kg){ b.perKgHrLo = b.amtLo/kg; b.perKgHrHi = b.amtHi/kg; }
  return b;
}

/* ---------------- reverse check: pump rate -> delivered dose ----------------
   The mirror of infusionCalc. The nurse reads a rate off a running pump and a
   preparation off the bag, and this says what the patient is actually
   receiving — plus, when the order is given, whether that is the order.   */
function reverseCheck(o){
  var res = {ok:false, checks:[]};
  var ml = o.mlPerHr, kg = o.kg;
  if(ml==null || isNaN(ml) || ml<=0){ res.err='Enter the rate displayed on the pump (mL/h).'; return res; }
  var du = o.doseUnit || baseOf(o.concU) || o.drugUnit;
  if(!du){ res.err='Enter what the preparation contains — for example 4 mg in 50 mL.'; return res; }
  var cb = concBlock(o, du);
  if(cb.err){ res.err = cb.err; return res; }
  res.du = du; res.concPerMl = cb.concPerMl; res.perMl = cb.perMl;
  res.mlPerHr = ml; res.mlPerMin = ml/60;
  if(o.dripFactor) res.gttPerMin = dripRate(ml, o.dripFactor);

  var amtHr = ml*cb.concPerMl;
  res.deliver = { amtPerMin:amtHr/60, amtPerHr:amtHr, amtPerDay:amtHr*24,
    perKgMin:(kg? amtHr/60/kg : null), perKgHr:(kg? amtHr/kg : null), perKgDay:(kg? amtHr*24/kg : null) };
  res.band = deliverBand(ml, o.step, cb.concPerMl, kg);

  if(o.containerMl!=null && o.containerMl>0){
    res.containerMl = o.containerMl;
    res.hoursLast = o.containerMl/ml;
  }

  /* verdict against the ordered range, when one was given */
  if(o.orderLo!=null && o.orderHi!=null && o.orderPer){
    var u2lo = convertUnit(o.orderLo, o.orderUnit||du, du);
    var u2hi = convertUnit(o.orderHi, o.orderUnit||du, du);
    if(u2lo!=null && u2hi!=null){
      var f = perFactor(o.orderPer, 'h');   /* order per X -> per hour */
      if(f!=null){
        var needLo = u2lo*f*(o.orderPer.indexOf('kg')===0? kg : 1);
        var needHi = u2hi*f*(o.orderPer.indexOf('kg')===0? kg : 1);
        if((o.orderPer.indexOf('kg')!==0 || kg) && needLo>0){
          res.expect = {mlPerHrLo: needLo/cb.concPerMl, mlPerHrHi: needHi/cb.concPerMl};
          if(amtHr < needLo*0.99)      res.verdict = {state:'below', msg:'The pump is delivering LESS than the ordered range. At this concentration the order needs '+fmtNum(res.expect.mlPerHrLo)+'–'+fmtNum(res.expect.mlPerHrHi)+' mL/h.'};
          else if(amtHr > needHi*1.01) res.verdict = {state:'above', msg:'The pump is delivering MORE than the ordered range. At this concentration the order needs '+fmtNum(res.expect.mlPerHrLo)+'–'+fmtNum(res.expect.mlPerHrHi)+' mL/h.'};
          else                         res.verdict = {state:'within', msg:'The pump rate matches the ordered range ('+fmtNum(res.expect.mlPerHrLo)+'–'+fmtNum(res.expect.mlPerHrHi)+' mL/h at this concentration).'};
        }
      }
    }
  }
  if(res.band && res.band.coarse)
    res.checks.push({level:'warn', msg:"At this rate the pump's "+res.band.step+" mL/h steps are ±"+" "+fmtNum(res.band.halfPct,1)+" % of the dose. Use a more concentrated preparation so the rate lands on a higher number."});
  if(o.containerMl>0 && res.hoursLast<1)
    res.checks.push({level:'info', msg:'The container empties in under an hour at this rate.'});
  res.ok = true;
  return res;
}

/* standard ready-to-use dilutions: dose (mcg/kg/min or mg/h) -> mL/h */
function stdDilutionMlPerHr(drugAmtMg, bagVolMl, doseAmt, doseUnit, per, kg){
  var conc = (drugAmtMg*1000)/bagVolMl;   /* mcg/mL */
  var perHourMcg;
  if(per==='kg/min') perHourMcg = doseAmt*(doseUnit==='mg'?1000:1)*kg*60;
  else if(per==='kg/h') perHourMcg = doseAmt*(doseUnit==='mg'?1000:1)*kg;
  else if(per==='h') perHourMcg = doseAmt*(doseUnit==='mg'?1000:1);
  else if(per==='kg/day') perHourMcg = doseAmt*(doseUnit==='mg'?1000:1)*kg/24;
  else return null;
  return perHourMcg/conc;
}

/* ---------------- drip-rate calculator ----------------
   dropFactor: 20 (macro, 20 gtt/mL), 15, 10 or 60 (micro)            */
function dripRate(mlPerHr, dropFactor){
  if(mlPerHr==null||!isFinite(mlPerHr)||mlPerHr<=0) return null;
  if(!dropFactor) dropFactor = 20;
  return (mlPerHr*dropFactor)/60;
}
function mlPerHrFromDrops(gtt, dropFactor){
  if(gtt==null||!isFinite(gtt)||gtt<=0) return null;
  return (gtt*60)/(dropFactor||20);
}

/* ---------------- unit cross-check helpers ---------------- */
function mgPerKg(mg, kg){ return (mg==null||!kg)?null:mg/kg; }
function mcgToMg(m){ return m==null?null:m/1000; }
function mmolToMgK(k){ return k==null?null:k*39.1; }     /* potassium */
function mgToMmolK(mg){ return mg==null?null:mg/39.1; }
function mmolToMgNa(na){ return na==null?null:na*23; }
function meqToMmolCaGluc(mEq){ return mEq==null?null:mEq/2; }
function mmolToMgPhos(p){ return p==null?null:p*31; }
function mmolToMgMg(m){ return m==null?null:m*24.3; }
function mEqToMgMg(e){ return e==null?null:(e/2)*24.3; }
function iuToMcgInsulin(iu){ return iu==null?null:iu*0.0347; } /* human insulin 1 mg = 28.8 IU */

/* GIR (glucose infusion rate) mg/kg/min from dextrose % */
function gir(dextPct, mlPerHr, kg){
  if(dextPct==null||mlPerHr==null||!kg) return null;
  /* dextPct g/100 mL -> mg/mL = dextPct*10 */
  return (dextPct*10*mlPerHr)/(60*kg);
}
function mlPerHrForGir(targetGir, dextPct, kg){
  if(targetGir==null||dextPct==null||!kg) return null;
  return (targetGir*60*kg)/(dextPct*10);
}

/* ---------------- sanity guards used by the UI ---------------- */
function assertFinite(x, what){
  if(x==null||!isFinite(x)) throw new Error('Non-finite value for '+what);
  return x;
}
/* Detect the classic 10-fold insulin and 1000-fold mcg/mg errors */
function unitRiskCheck(reg, ctx){
  var risks=[];
  var d=reg.d||{};
  if(/insulin/i.test(reg.n||'')){
    risks.push('INSULIN: confirm the vial strength — 100 IU/mL and 40 IU/mL vials are both marketed in India. A 40 IU/mL vial drawn up as if 100 IU/mL gives 2.5× the intended dose.');
  }
  if(/adrenaline|epinephrine/i.test(reg.n||'')){
    risks.push('ADRENALINE: 1:1000 (1 mg/mL) is for IM/SC use; 1:10,000 (0.1 mg/mL) is for IV use in arrest. Confirm which ampoule is in hand.');
  }
  if(/caffeine/i.test(reg.n||'')){
    risks.push('CAFFEINE: citrate vs base — caffeine citrate 20 mg/mL contains 10 mg/mL of caffeine base. Confirm which the order specifies.');
  }
  if(/colistin|polymyxin/i.test(reg.n||'')){
    risks.push('COLISTIN: MIU (colistin base activity) vs mg (colistimethate sodium) — 1 MIU ≈ 33.3 mg CBA ≈ 80 mg CMS. Confirm the unit on the order.');
  }
  if(/heparin/i.test(reg.n||'') && /25000|5000/.test(JSON.stringify(reg.fx||[]))){
    risks.push('HEPARIN: 5,000 IU/mL and 25,000 IU/mL strengths are both supplied. Confirm the vial.');
  }
  if(/magnesium|mgso4|magnesium sulfate/i.test((reg.n||'')+' '+(reg.id||''))){
    risks.push('MAGNESIUM SULFATE: 50%, 25% and 20% strengths all exist. 50% = 500 mg/mL = 4.06 mEq/mL. Confirm the ampoule.');
  }
  if(/potassium|kcl/i.test((reg.n||'')+' '+(reg.id||''))){
    risks.push('POTASSIUM CHLORIDE: never give as an IV bolus. Undiluted IV KCl is a never-event and causes cardiac arrest.');
  }
  return risks;
}

/* ---------------- protocol / decision-support data ---------------- */
if (typeof PROT === 'undefined') { var PROT = []; }
PROT = [
 {id:'p-arrest-adult', t:'Adult cardiac arrest — drug sequence',
  s:['resus','arrhythmia'],
  steps:['Start high-quality CPR: 100–120/min, depth 5–6 cm, full recoil, minimise interruptions (<10 s).',
   'Defibrillate shockable rhythms (VF/pulseless VT) — biphasic 120–200 J, monophasic 360 J; resume CPR immediately for 2 min before rhythm check.',
   'Establish IV/IO access; IO is equivalent when IV fails.',
   'Adrenaline 1 mg IV/IO (10 mL of 1:10,000) every 3–5 min — from the 3rd shock in shockable rhythms, immediately in non-shockable.',
   'After the 3rd shock, if VF/pVT persists: amiodarone 300 mg in 20 mL 5% dextrose IV/IO; a further 150 mg after the 5th shock.',
   'Alternative to amiodarone: lidocaine 1–1.5 mg/kg IV, then 0.5–0.75 mg/kg (max 3 mg/kg total).',
   'Treat reversible causes — the 5 Hs and 5 Ts: hypoxia, hypovolaemia, hypo/hyperkalaemia, hypothermia, tension pneumothorax, tamponade, toxins, thrombosis (coronary/pulmonary).',
   'Do not routinely give sodium bicarbonate, calcium or magnesium unless a specific indication exists (hyperkalaemia, hypocalcaemia, TCA overdose, MgSO4 toxicity).',
   'Consider ECLS/ECPR for refractory arrest in a capable centre.']},
 {id:'p-arrest-paed', t:'Paediatric cardiac arrest — drug sequence',
  s:['resus'],
  steps:['CPR 100–120/min; depth ≥ one-third AP diameter of chest (≈4 cm infant, ≈5 cm child).',
   'Adrenaline 10 mcg/kg IV/IO (0.1 mL/kg of 1:10,000) every 3–5 min. Via ETT use 100 mcg/kg (0.1 mL/kg of 1:1000) and flush with 3–5 mL saline.',
   'Refractory VF/pVT: amiodarone 5 mg/kg over 20–60 min (max 300 mg per dose) or lidocaine 1 mg/kg (max 100 mg per dose).',
   'Defibrillation 2 J/kg → 4 J/kg → ≥4 J/kg (max 10 J/kg or adult dose, whichever is lower).',
   'Fluid 20 mL/kg isotonic crystalloid bolus in hypovolaemic/septic arrest.',
   'Search for cause: hypoxia is the commonest paediatric arrest rhythm (asystole/bradycardia).',
   'Neonatal arrest: ventilate first. Adrenaline only after 30 s of effective ventilation and chest compressions. Dose 10–30 mcg/kg IV/IO (prefer IV/IO over ETT).']},
 {id:'p-septic-shock', t:'Septic shock — first-hour bundle',
  s:['vasoactive','antiinfective','electrolyte'],
  steps:['Measure lactate; repeat if >2 mmol/L.',
   'Blood cultures × 2 sets BEFORE antibiotics — do not delay antibiotics >45 min.',
   'Broad-spectrum antimicrobials within 1 hour of recognition (see Antimicrobials tab, India-adapted empirical therapy).',
   'Crystalloid 30 mL/kg within the first 3 hours for hypotension or lactate ≥4 mmol/L; in children 10–20 mL/kg boluses (up to 40–60 mL/kg in the first hour) with reassessment after each.',
   'Noradrenaline first-line to MAP ≥65 mmHg (adults); children: start 0.05–0.1 mcg/kg/min.',
   'Add vasopressin 0.03 U/min (or 0.0005 U/kg/min in children) if noradrenaline ≥0.25–0.5 mcg/kg/min.',
   'Hydrocortisone 200 mg/day IV (adults) or 2 mg/kg 6-hourly (children) if vasopressor-dependent despite adequate fluid.',
   'Reassess perfusion dynamically; avoid a fixed CVP target. De-escalate antimicrobials on culture results.']},
 {id:'p-anaphylaxis', t:'Anaphylaxis — immediate action',
  s:['anaphylaxis'],
  steps:['Remove the trigger; call for help; lay the patient flat with legs raised (sitting up if breathing is difficult, left lateral if pregnant). NEVER let them stand or sit up suddenly.',
   'ADRENALINE IM into the anterolateral thigh — this is the single most important step and must not be delayed.',
   'Adult 0.5 mg (0.5 mL of 1:1000). Child >12 y 0.5 mg; 6–12 y 0.3 mg; 6 months–6 y 0.15 mg; <6 months 0.1–0.15 mg (10 mcg/kg).',
   'Repeat every 5 minutes if there is no improvement.',
   'High-flow oxygen; airway management early — laryngeal oedema progresses rapidly.',
   'IV fluid: crystalloid 1–2 L rapidly in adults (10–20 mL/kg in children).',
   'Adjuncts ONLY after adrenaline: hydrocortisone, chlorphenamine/ranitidine, salbutamol for bronchospasm. They never replace adrenaline.',
   'Refractory anaphylaxis (no response to ≥3 IM doses): adrenaline IV infusion 0.05–0.1 mcg/kg/min with continuous monitoring; seek senior/ICU help immediately.',
   'Observe a minimum of 6–12 hours (longer if biphasic, severe, or on β-blockers); prescribe an adrenaline auto-injector and refer to allergy.']},
 {id:'p-status-epilepticus', t:'Status epilepticus — time-based pathway',
  s:['neuro'],
  steps:['0–5 min (stabilise): airway, oxygen, IV access, capillary glucose, thiamine if malnourished/alcoholic, ECG, send Na⁺/Ca²⁺/Mg²⁺/glucose/toxicology.',
   '5–20 min (initial therapy): benzodiazepine. Adult lorazepam 4 mg IV (repeat once after 10 min) or midazolam 10 mg IM. Child midazolam 0.2 mg/kg IM/IN (max 10 mg), lorazepam 0.1 mg/kg IV (max 4 mg), or diazepam 0.2 mg/kg IV / 0.5 mg/kg PR.',
   '20–40 min (second-line): levetiracetam 60 mg/kg IV (max 4500 mg), fosphenytoin 20 mg PE/kg (max 1500 mg PE) or valproate 40 mg/kg IV (max 3000 mg). All three are equally effective (ESETT).',
   '40–60 min (third-line / refractory): anaesthetic doses — midazolam 0.2 mg/kg load then 0.05–2 mg/kg/h, propofol 1–2 mg/kg then 20–200 mcg/kg/min (avoid >48 h and >4 mg/kg/h in children — PRIS), or thiopentone 3–5 mg/kg then 1–5 mg/kg/h. Continuous EEG. Intubate and ventilate.',
   'Do not exceed a total fosphenytoin rate of 150 mg PE/min (adults) or 3 mg PE/kg/min (children) — hypotension and arrhythmia.',
   'Valproate: avoid in known mitochondrial disease, hepatic failure, and pregnancy; it abolishes valproate levels if carbapenems are co-administered.',
   'Eclampsia is NOT treated this way — magnesium sulfate is the drug of choice.']},
 {id:'p-hyperkalaemia', t:'Severe hyperkalaemia (K⁺ >6.5 mmol/L or ECG change)',
  s:['electrolyte','renal','resus'],
  steps:['ECG immediately: peaked T waves → loss of P → wide QRS → sine wave → asystole.',
   'STEP 1 MEMBRANE STABILISATION: calcium gluconate 10% 10–20 mL (10–30 mL in arrest) IV over 5–10 min; repeat if ECG unchanged after 5 min. Onset 1–3 min, duration 30–60 min. Use calcium chloride 10% 10 mL only via a central line.',
   'STEP 2 SHIFT INTO CELLS: insulin 10 units IV + 25 g dextrose (50 mL of 50% or 250 mL of 10%) over 15–30 min. Onset 15–30 min, duration 4–6 h. Monitor glucose hourly for ≥6 h — late hypoglycaemia is common.',
   'Salbutamol 10–20 mg nebulised (or 0.5 mg IV) as an ADJUNCT — never as monotherapy; ≈40% of dialysis patients do not respond.',
   'Sodium bicarbonate 50 mmol IV only if there is a significant metabolic acidosis; ineffective as monotherapy.',
   'STEP 3 REMOVE FROM THE BODY: loop diuretic if the patient makes urine; potassium binder (sodium zirconium cyclosilicate 10 g TDS × 48 h then 5–10 g daily, or patiromer); DIALYSIS is definitive — organise early.',
   'Stop every potassium-raising drug: ACEi/ARB, spironolactone, amiloride, NSAIDs, trimethoprim, heparin, β-blockers, KCl infusions.',
   'Pseudohyperkalaemia: haemolysed sample, prolonged tourniquet, extreme thrombocytosis/leucocytosis — repeat the sample before treating an asymptomatic patient.']},
 {id:'p-hypokalaemia', t:'Hypokalaemia (K⁺ <3.0 mmol/L or symptomatic)',
  s:['electrolyte'],
  steps:['ECG: flattened T waves, U waves, ST depression, prolonged QU, torsades de pointes risk.',
   'Check and correct MAGNESIUM FIRST — hypokalaemia is refractory until Mg²⁺ is normal.',
   'Peripheral IV: maximum 20 mmol/h, maximum concentration 40 mmol/L, through a large vein with cardiac monitoring. Pain and phlebitis are expected.',
   'Central line: up to 40 mmol/h in refractory cases with continuous ECG.',
   'NEVER give KCl as an IV bolus or push — undiluted KCl is a never-event.',
   'Oral is safer and adequate for K⁺ >2.5 mmol/L without arrhythmia: KCl 24–48 mmol 2–4 times daily.',
   'Estimate the deficit: K⁺ 3.0–3.5 ≈ 100–200 mmol deficit; each 1 mmol/L fall below 3.0 adds ≈200–400 mmol.',
   'Recheck K⁺ every 2–4 h during replacement; overcorrection causes fatal hyperkalaemia.',
   'Find the cause: diuretics, GI loss, insulin/β-agonist shift, RTA, hyperaldosteronism, refeeding.']},
 {id:'p-hyponatraemia', t:'Hyponatraemia — symptomatic and correction limits',
  s:['electrolyte','neurocrit'],
  steps:['Severe symptoms (seizure, coma, respiratory arrest): hypertonic saline 3% 100–150 mL IV over 10–20 min; repeat up to 3 times, or 2 mL/kg boluses. Target a 4–6 mmol/L rise to stop seizures.',
   'CORRECTION LIMITS — exceed them and you cause osmotic demyelination: ≤8–10 mmol/L in the first 24 h (≤4–6 mmol/L if high risk: chronic, malnutrition, alcoholism, liver disease, K⁺ <3.0). ≤18 mmol/L in 48 h.',
   'Check K⁺ and correct it — potassium replacement raises serum Na⁺ and counts towards the limit.',
   'SIADH: fluid restriction ± urea/tolvaptan. Hypovolaemic: isotonic saline. Hypervolaemic (HF/cirrhosis): fluid restriction ± loop diuretic.',
   'If overcorrection occurs, STOP, give 5% dextrose 3 mL/kg/h and/or desmopressin 1–2 mcg IV q6–8 h (proactive "DDAVP clamp" strategy).',
   'Measure Na⁺ every 2–4 h during active correction.',
   'Chronic (>48 h or unknown duration) hyponatraemia is the dangerous one — correct slowly.']},
 {id:'p-snakebite', t:'Snakebite — India national protocol',
  s:['tox'],
  steps:['IMMOBILISE the limb like a fracture; keep the patient calm and still; no tourniquet, no cutting, no sucking, no ice, no electric shock, no local injection.',
   'Transport to a facility with ASV. Note the time of the bite and, if safe, a photograph of the snake — never try to catch or kill it.',
   'Assess: 20-minute whole-blood clotting test (20WBCT) is the bedside test for venom-induced consumptive coagulopathy. Repeat every 6 h until it is normal.',
   'INDICATIONS FOR ASV — systemic: coagulopathy (incoagulable blood, spontaneous bleeding), neurotoxic ptosis/paralysis, cardiovascular shock or arrhythmia, AKI, haemoglobinuria/myoglobinuria; local: swelling involving >half the bitten limb, rapid progression, swelling beyond a joint, or compartment syndrome.',
   'DOSE: 10 vials of polyvalent ASV for every patient — adult, child, pregnant or elderly. Venom load is the same, so the dose is the same.',
   'Give IV: reconstitute each vial in 10 mL of the supplied diluent/distilled water, add to 200–500 mL normal saline, infuse over 30–60 min (start slowly, 25% in the first 15 min while watching for anaphylaxis).',
   'REPEAT: haemotoxic — if 20WBCT still incoagulable 6 h after the first dose, repeat 10 vials (6-hour rule; maximum 30 vials). Neurotoxic — if no improvement in 1–2 h, repeat 10 vials (maximum 20 vials).',
   'NEVER give ASV intramuscularly or locally into the bite site.',
   'Pre-medication: adrenaline 0.25 mg SC (children 5 mcg/kg of 1:1000) before ASV reduces acute reactions — omit in hypertension or ischaemic heart disease.',
   'Neurotoxic (cobra/krait) envenoming: atropine 0.6 mg adult / 50 mcg/kg child IV, then neostigmine 0.01–0.04 mg/kg q1–3 h (max 10 mg/24 h). Perform an anticholinesterase (edrophonium/neostigmine) test first.',
   'Supportive: mechanical ventilation for neurotoxic paralysis, dialysis for AKI, blood products only for life-threatening bleeding (ASV is the treatment for coagulopathy), tetanus prophylaxis, analgesia (avoid NSAIDs and morphine).',
   'Sea snake and green pit viper bites are NOT covered by Indian polyvalent ASV.',
   'No ASV is indicated for a "dry bite" — but observe for at least 24 h with repeated 20WBCT.']},
 {id:'p-scorpion', t:'Scorpion sting (Mesobuthus tamulus) — Indian red scorpion',
  s:['tox'],
  steps:['Local pain and swelling only = benign — analgesia and observation.',
   'Autonomic storm (hypertension, tachycardia, sweating, priapism, vomiting, pulmonary oedema) is the life-threatening form.',
   'PRAZOSIN is the drug of choice: 30 mcg/kg PO/NG in children (maximum 0.5 mg per dose in adults); repeat every 3 hours until LVEF >60%, then every 6 hours for 3 days. Maximum 5 mg/day.',
   'Give the first dose with the patient FLAT AND SUPINE; keep them supine for about 3 hours. First-dose postural hypotension is expected and is not a reason to stop.',
   'Give prazosin irrespective of the blood pressure — it prevents the catecholamine-mediated myocardial injury.',
   'Monitoring: pulse, BP, respiratory rate every 30 min for 3 h, then hourly for 6 h, then 6-hourly.',
   'Pulmonary oedema: oxygen, prazosin, cautious diuresis; avoid large fluid boluses. Dobutamine 3–10 mcg/kg/min if there is LV dysfunction with hypotension.',
   'Avoid dopamine boluses and other catecholamine surges.',
   'Scorpion antivenom (Hynosis, anti-Hottentotta tamulus) exists in India but is rarely used; evidence is limited. Prazosin remains first-line.',
   'Never give opioids or sedatives that mask the evolving neurological picture.']},
 {id:'p-op-poisoning', t:'Organophosphorus / carbamate poisoning',
  s:['tox'],
  steps:['PROTECT YOURSELF: gloves, apron, mask, eye protection. Decontaminate in a well-ventilated area away from the resuscitation room. Secondary contamination of staff is common.',
   'Remove all clothing (cut it off, do not pull over the head); wash hair, skin, nails and skin folds with soap and water for at least 15 min; repeat if oily.',
   'Airway and suction — copious bronchorrhoea is the killer.',
   'ATROPINE 2 mg IV in adults (0.05 mg/kg in children, minimum 0.1 mg) every 5–10 min, doubling the dose each time if there is no response.',
   'ENDPOINT OF ATROPINISATION = CLEAR AXILLAE (dry armpits), clear lung fields, pulse >80/min, systolic BP >80 mmHg. NOT pupil size and NOT heart rate alone.',
   'Maintenance: give the atropinising dose hourly; reduce by 10–25% every 24–48 h once the patient is stable. Total requirements may run into hundreds of milligrams. Do not stop abruptly.',
   'PRALIDOXIME 30 mg/kg IV load over 30 min (≈1–2 g adult), then 8–10 mg/kg/h infusion for 24–48 h. Most useful within 6 h for OP; NOT indicated in carbamate poisoning.',
   'Carbamate poisoning: atropine only, shorter duration, pralidoxime not required.',
   'Gastric lavage only within 1 h of a life-threatening ingestion; never in a patient with an unprotected airway or after a hydrocarbon.',
   'Watch for the intermediate syndrome (24–96 h: neck flexor, proximal limb and respiratory muscle weakness → ventilate) and delayed polyneuropathy (1–3 weeks).',
   'AVOID: suxamethonium (prolonged apnoea), morphine, aminophylline, phenothiazines, theophylline.',
   'Diazepam 5–10 mg IV may reduce seizure and mortality — give for seizures or severe agitation.',
   'Discharge only after at least 48 h symptom-free off atropine; many OP agents are lipid-soluble and relapse.']},
 {id:'p-alp', t:'Aluminium phosphide / phosphine (rice-tablet) poisoning',
  s:['tox'],
  steps:['No specific antidote exists. Mortality is 50–90% even with good care. Early recognition and aggressive support are everything.',
   'Inhibit further phosphine release: gastric lavage with coconut oil or KMnO4 (1:10,000) — phosphine is lipid-soluble; vegetable oil reduces absorption.',
   'Do NOT induce vomiting. Never leave the tablet in the stomach.',
   'Magnesium sulfate: 20% MgSO4 20 mL IV slowly, then 20 mL 8-hourly for 3 days (some protocols use a 24 g/24 h infusion) — the evidence is limited but widely followed in India.',
   'Cardiogenic shock is the usual cause of death: noradrenaline + dobutamine; avoid large fluid boluses (non-compliant, poisoned myocardium).',
   'Refractory shock: consider high-dose insulin–euglycaemia and IABP/ECMO in a capable centre.',
   'ECG monitoring for at least 72 h — arrhythmias, ST changes and conduction block are common and can be delayed.',
   'Severe metabolic acidosis: sodium bicarbonate only if pH <7.1 and refractory.',
   'Handle staff safety: phosphine gas is released from the stomach contents and vomitus — suction in a ventilated area, protect staff.',
   'This is a deliberate self-poisoning in most Indian cases — involve psychiatry and the family, and secure the means.']},
 {id:'p-dka', t:'Diabetic ketoacidosis — adult and paediatric protocol',
  s:['endocrine','electrolyte'],
  steps:['Confirm: glucose >13.9 mmol/L (250 mg/dL) or known diabetes, ketones >3.0 mmol/L (or urine ketones 2+), pH <7.3 or HCO₃⁻ <18 mmol/L.',
   'FLUIDS FIRST. Adults: 1 L 0.9% NaCl over the first hour (500 mL/h if no shock), then 250–500 mL/h guided by hydration. Children: 10 mL/kg over 1 h (20 mL/kg if shocked), then replace the deficit evenly over 24–48 h — NEVER faster, because cerebral oedema is the main paediatric killer.',
   'INSUL: adults 0.1 U/kg IV bolus then 0.1 U/kg/h, or 0.14 U/kg/h without a bolus. Children 0.05–0.1 U/kg/h — START ONLY 1 HOUR AFTER fluids begin, and never give a bolus.',
   'DO NOT start insulin until K⁺ ≥3.3 mmol/L. If K⁺ <3.3, replace potassium first and delay insulin.',
   'POTASSIUM: if K⁺ 3.3–5.2 add 20–40 mmol KCl to each litre of fluid; if K⁺ >5.2 hold and recheck in 1 h. Total insulin-driven K⁺ shift is large.',
   'SWITCH to 5% dextrose (with 0.45–0.9% NaCl) once glucose falls below 11–14 mmol/L (200–250 mg/dL). Continue the insulin — the aim is to clear ketones, not just lower glucose.',
   'BICARBONATE is NOT recommended (pH >6.9). Below 6.9 in adults consider 100 mmol NaHCO3 in 400 mL water with 20 mmol KCl over 2 h.',
   'Search for the precipitant: infection (most common), missed insulin, MI, stroke, pancreatitis, drugs, new-onset diabetes.',
   'Resolution: glucose <11 mmol/L AND two of — pH >7.3, HCO₃⁻ >18, anion gap <12, ketones <0.6. Then overlap SC insulin by 1–2 h before stopping the infusion.',
   'Cerebral oedema (children): sudden headache, vomiting, behavioural change, falling GCS, bradycardia, hypertension. Mannitol 0.5–1 g/kg or 3% NaCl 2.5–5 mL/kg IMMEDIATELY, halve the fluid rate, intubate if needed. Do not wait for imaging.',
   'Give thiamine before any dextrose in a malnourished or alcoholic patient.']},
 {id:'p-thyroid-storm', t:'Thyroid storm',
  s:['endocrine'],
  steps:['Clinical diagnosis — Burch–Wartofsky score ≥45 is highly suggestive. Do not wait for TFTs to treat.',
   'Treat the precipitant: infection, surgery, trauma, iodine load, parturition, DKA, abrupt thyroxine withdrawal.',
   'ORDER MATTERS — follow the sequence below.',
   '1. β-BLOCKER: propranolol 60–80 mg PO/NG q4h (or 0.5–1 mg IV over 1 min, then 1–10 mg/h infusion). It controls the adrenergic features and blocks peripheral T4→T3 conversion at high doses. Avoid in severe asthma/decompensated HF (use esmolol, which is ultra-short-acting).',
   '2. THIONAMIDE: propylthiouracil 500–1000 mg load then 200 mg q4–6h (preferred — also blocks T4→T3 conversion), or carbimazole/methimazole 40–60 mg/day in divided doses.',
   '3. IODINE — AT LEAST 60 MINUTES AFTER the thionamide: Lugol\'s iodine 0.25 mL (≈8 drops) PO q6h or potassium iodide 250 mg PO q6h. Giving iodine first fuels further hormone synthesis (Jod–Basedow).',
   '4. GLUCOCORTICOID: hydrocortisone 100 mg IV q8h (or dexamethasone 2 mg q6h) — blocks T4→T3 conversion, treats relative adrenal insufficiency and the autoimmune process.',
   '5. SUPPORTIVE: paracetamol for fever (NEVER aspirin — it displaces T4 from binding proteins and worsens the storm), cooling blanket, oxygen, fluids, treat AF/HF, thiamine.',
   '6. Cholestyramine 4 g PO q6h blocks enterohepatic recirculation of thyroid hormone.',
   'Refractory: plasmapheresis or emergency thyroidectomy once euthyroid.',
   'Myxoedema coma is the mirror emergency — hypothermia, bradycardia, hypoventilation. Give hydrocortisone BEFORE levothyroxine, or you precipitate an adrenal crisis.']},
 {id:'p-adrenal-crisis', t:'Acute adrenal crisis',
  s:['endocrine'],
  steps:['Suspect it in any patient with refractory hypotension, unexplained shock, hyponatraemia + hyperkalaemia, hypoglycaemia, vomiting, abdominal pain or fever — especially with known steroid use, autoimmune disease, TB, anticoagulation (adrenal haemorrhage) or pituitary disease.',
   'DO NOT wait for a cortisol result. Draw blood for cortisol and ACTH, then treat immediately.',
   'HYDROCORTISONE 100 mg IV bolus, then 200 mg/24 h (either 50 mg q6h or a continuous infusion).',
   'Children: 50 mg/m² IV (or 25 mg infant, 50 mg child, 100 mg adolescent) then the same dose 6-hourly.',
   'FLUID: 1 L 0.9% NaCl over the first hour (children 20 mL/kg), then guided by perfusion. These patients are profoundly volume-depleted.',
   'Correct hypoglycaemia with dextrose; treat hyperkalaemia if severe.',
   'Fludrocortisone is unnecessary while hydrocortisone is ≥50 mg/day — it has enough mineralocorticoid activity.',
   'Search for and treat the precipitant — infection is the commonest.',
   'If dexamethasone was used instead (because a cortisol/ACTH stimulation test is planned), note that hydrocortisone cross-reacts in the cortisol assay and dexamethasone does not.',
   'Never stop steroids abruptly; taper and educate the patient about sick-day rules and a steroid card.']},
 {id:'p-massive-transfusion', t:'Massive haemorrhage and transfusion',
  s:['anticoag','electrolyte'],
  steps:['Massive transfusion = ≥1 blood volume in 24 h, ≥4 units RBC in 1 h, or ongoing loss of 150 mL/min.',
   'CONTROL THE BLEEDING — no drug replaces a surgeon or an interventional radiologist.',
   'Tranexamic acid 1 g IV over 10 min within 3 hours of injury (CRASH-2) or of PPH onset (WOMAN); repeat 1 g after 30 min if bleeding continues. No benefit, possible harm, after 3 h.',
   'Activate the massive transfusion protocol: RBC:FFP:platelets in a 1:1:1 ratio (or 2:1:1) — early plasma reduces death from bleeding.',
   'Restrictive target: Hb 7–8 g/dL in most ICU patients; higher in active bleeding or ACS.',
   'Permissive hypotension (SBP 80–90 mmHg) in trauma WITHOUT head injury until bleeding is controlled; target SBP ≥110 mmHg if there is a TBI.',
   'WARM everything — hypothermia (<35 °C) worsens coagulopathy. Use a fluid warmer and a warm room.',
   'Correct the lethal triad: hypothermia, acidosis, coagulopathy.',
   'Calcium: citrate in stored blood chelates calcium. Give calcium gluconate 10% 10 mL (or calcium chloride 10% 5 mL) for every 4 units of blood, and monitor ionised calcium — aim >1.1 mmol/L.',
   'Hyperkalaemia from stored blood: monitor and treat; fresh blood or washed red cells if needed.',
   'Check fibrinogen — target >1.5–2 g/L; cryoprecipitate (10 units) or fibrinogen concentrate if low.',
   'Platelets: maintain >50 ×10⁹/L (>100 in TBI or ongoing bleeding).',
   'Reversal of anticoagulants: warfarin → PCC 25–50 IU/kg + vitamin K1 5–10 mg IV; DOAC → andexanet alfa or PCC 50 IU/kg; dabigatran → idarucizumab 5 g IV; heparin → protamine 1 mg per 100 IU of heparin given in the last 2–3 h.',
   'Blood is a drug — check the unit, the patient, the group and the expiry twice, at the bedside, with two trained people.']},
 {id:'p-acute-asthma', t:'Acute severe / life-threatening asthma',
  s:['respiratory'],
  steps:['ASSESS SEVERITY. Life-threatening: silent chest, cyanosis, feeble respiratory effort, bradycardia, hypotension, exhaustion, confusion, coma, SpO₂ <92%, PEF <33% best. Near-fatal: rising PaCO₂ or needing ventilation.',
   'Acute severe: PEF 33–50%, RR ≥25, HR ≥110, unable to complete sentences.',
   'OXYGEN to keep SpO₂ 93–95% (94–98% in children).',
   'SALBUTAMOL nebulised 5 mg (2.5 mg if <5 years) driven by OXYGEN, repeated every 15–20 min initially; continuous nebulisation 10–15 mg/h in severe attacks.',
   'IPRATROPIUM 0.5 mg nebulised q20–30 min for the first 2 h in acute severe/life-threatening asthma — added benefit over salbutamol alone.',
   'If nebulisers are unavailable: salbutamol 250 mcg IV slowly, or 5 mg/kg IV infusion over 20–60 min with cardiac monitoring.',
   'CORTICOSTEROID EARLY: prednisolone 40–50 mg PO (children 1–2 mg/kg, max 40 mg) or hydrocortisone 200 mg IV / methylprednisolone 40–125 mg IV. Continue for 5–7 days.',
   'IV MAGNESIUM SULFATE 2 g over 20 min in adults (children 25–50 mg/kg, max 2 g) for life-threatening asthma or no response after 1 h — improves lung function and reduces admission.',
   'Consider aminophylline 5 mg/kg load then 0.5–0.7 mg/kg/h ONLY in an ICU with level monitoring (target 10–20 mg/L); not routinely recommended.',
   'NEVER sedate an asthmatic outside the ICU — respiratory depression is fatal.',
   'Intubate only for exhaustion, coma or arrest; asthma ventilation needs long expiratory time, low rate, low tidal volume and tolerance of permissive hypercapnia.',
   'Identify and treat the trigger; check inhaler technique; arrange follow-up and an asthma action plan before discharge.']},
 {id:'p-variceal-bleed', t:'Acute variceal haemorrhage',
  s:['gi','anticoag'],
  steps:['Airway first — consider early intubation for massive haematemesis or encephalopathy (grade III–IV) before endoscopy.',
   'Two large-bore IV cannulae; cross-match; do NOT over-transfuse.',
   'RESTRICTIVE TRANSFUSION target Hb 7–8 g/dL. Over-transfusion raises portal pressure and re-bleeding.',
   'VASOACTIVE DRUG IMMEDIATELY, before endoscopy and continued for 2–5 days:',
   '  Terlipressin 2 mg IV q4h for 48 h, then 1 mg q4h once bleeding is controlled. Watch for ischaemia (cardiac, limb, bowel) and hyponatraemia.',
   '  Alternatives: octreotide 50 mcg IV bolus then 50 mcg/h infusion for 2–5 days; or somatostatin 250 mcg bolus then 250 mcg/h.',
   'ANTIBIOTIC PROPHYLAXIS reduces re-bleeding and mortality: ceftriaxone 1 g IV daily (child 50–100 mg/kg/day, max 2 g) for up to 7 days.',
   'ENDOSCOPY within 12 hours — band ligation is first-line for oesophageal varices.',
   'PPI (pantoprazole 80 mg IV then 8 mg/h × 72 h) if a peptic ulcer is found or suspected.',
   'Rescue: Sengstaken–Blakemore tube as a BRIDGE ONLY (max 24 h, airway must be protected); TIPS is definitive rescue therapy.',
   'Correct coagulopathy pragmatically — FFP/cryoprecipitate/platelets guided by bleeding, not by numbers alone. Vitamin K1 10 mg IV daily for 3 days.',
   'Lactulose for encephalopathy prophylaxis; avoid sedatives; do not use NSAIDs or aspirin.']},
 {id:'p-eclampsia', t:'Eclampsia and severe pre-eclampsia',
  s:['obs','neuro'],
  steps:['ECLAMPSIA = any seizure in a woman with pre-eclampsia. MAGNESIUM SULFATE is the drug of choice — superior to diazepam and phenytoin (Magpie, Eclampsia Trial).',
   'ZUSPAN REGIMEN: MgSO4 4 g IV load over 15–20 min (40 mL of 10% or 8 mL of 50% diluted to 100 mL), then 1 g/h IV infusion for 24 h after the last seizure or delivery.',
   'PRITCHARD REGIMEN (no infusion pump): 4 g IV slowly over 5–10 min PLUS 10 g IM (5 g into each buttock with 1 mL 2% lidocaine), then 5 g IM every 4 hours.',
   'Recurrent seizure: a further 2 g IV over 5 min.',
   'TOXICITY MONITORING every 15–30 min during the load and hourly thereafter: patellar reflex present, respiratory rate ≥16/min, urine output ≥25–30 mL/h (or ≥100 mL/4 h).',
   'Loss of reflexes occurs at 4–5 mmol/L, respiratory depression at 6–7 mmol/L, cardiac arrest above 12 mmol/L.',
   'ANTIDOTE: CALCIUM GLUCONATE 10% 10 mL IV slowly over 5–10 min — keep it drawn up at the bedside at all times.',
   'RENAL IMPAIRMENT: reduce the maintenance dose to 0.5 g/h and monitor levels, or use a lower dose.',
   'CONTROL SEVERE HYPERTENSION (SBP ≥160 or DBP ≥110): labetalol 20 mg IV over 2 min, then 40 mg, then 80 mg every 10 min up to a total of 220 mg; or hydralazine 5–10 mg IV over 2 min repeated q20 min up to 20 mg; or nifedipine 10 mg PO.',
   'Target BP 140–150/90–100 mmHg — do NOT drop the pressure precipitously (placental perfusion).',
   'DELIVERY is the definitive treatment once the mother is stabilised. MgSO4 continues for 24 h post-partum.',
   'AVOID: phenytoin/diazepam as first-line, ergometrine in hypertension, ACE inhibitors and ARBs in pregnancy, nitroprusside (cyanide toxicity in the fetus).',
   'Watch for pulmonary oedema (the commonest cause of maternal death in pre-eclampsia) — restrict fluids to ≈80 mL/h total unless there is haemorrhage.']},
 {id:'p-pph', t:'Post-partum haemorrhage',
  s:['obs','anticoag'],
  steps:['Call for help; ABC; two large-bore IV cannulae; cross-match 4 units; catheterise; empty the uterus; bimanual compression.',
   'OXITOCIN first-line: 5 IU IV slowly over 2 min (never as a rapid bolus — causes hypotension and arrhythmia) then 20–40 IU in 500–1000 mL saline at 60–120 mL/h; or 10 IU IM.',
   'If bleeding continues: METHYLERGOMETRINE 0.2 mg IM/IV slowly. ABSOLUTELY CONTRAINDICATED in hypertension, pre-eclampsia and cardiac disease.',
   'MISOPROSTOL 800–1000 mcg sublingually or rectally when oxytocin is unavailable or as an adjunct. NOTE: for induction of labour in a viable pregnancy the dose is only 25 mcg — the PPH dose is 30–40× higher.',
   'CARBOPROST (15-methyl PGF2α) 250 mcg IM or intramyometrial, repeated q15–90 min to a maximum of 2 mg (8 doses). CONTRAINDICATED IN ASTHMA (bronchospasm).',
   'TRANEXAMIC ACID 1 g IV over 10 min within 3 h of birth (WOMAN trial); repeat 1 g if bleeding continues after 30 min.',
   'Fluid resuscitation with warmed crystalloid; transfuse RBC, FFP and platelets 1:1:1 for ongoing massive loss.',
   'Non-drug measures: uterine massage, intrauterine balloon tamponade, B-Lynch suture, uterine/internal iliac artery embolisation, hysterectomy as the last resort.',
   'Correct coagulopathy — fibrinogen <2 g/L predicts severe PPH; give cryoprecipitate or fibrinogen concentrate.',
   'Monitor for dilutional coagulopathy, hypocalcaemia (citrate) and hypothermia.',
   'Document the estimated blood loss objectively — visual estimation underestimates by about 30–50%.']},
 {id:'p-neonatal-resus', t:'Neonatal resuscitation',
  s:['neonatal','resus'],
  steps:['THE GOLDEN MINUTE: most newborns need only warmth, positioning, drying, stimulation and clearing of the airway.',
   'If apnoeic, gasping or HR <100 after the initial steps → positive-pressure ventilation with a T-piece or self-inflating bag in room air (21%) for a term baby; 21–30% for a preterm baby. Ventilate for 30 seconds and re-check the heart rate.',
   'CORRECT VENTILATION MOVES THE CHEST and raises the heart rate — this is the single most important sign. If the HR does not rise, re-check the mask seal, head position, airway obstruction and pressure (MR SOPA).',
   'HR <60 despite 30 s of EFFECTIVE ventilation → chest compressions at 3:1 with ventilation (90 compressions + 30 breaths/min), two-thumb encircling technique, depth one-third AP diameter.',
   'After a further 60 s of coordinated compressions and effective ventilation, if HR <60: ADRENALINE 10–30 mcg/kg IV/IO (0.1–0.3 mL/kg of 1:1000, i.e. 0.01–0.03 mg/kg). Prefer IV/IO (umbilical venous catheter). Via ETT use 50–100 mcg/kg (0.5–1 mL/kg of 1:1000) — absorption is unreliable.',
   'Repeat adrenaline every 3–5 min. Flush with 0.5–1 mL saline after each dose.',
   'VOLUME: normal saline or O-negative blood 10 mL/kg IV/IO over 5–10 min if there is suspected blood loss or shock (pallor, poor perfusion, weak pulses unresponsive to resuscitation).',
   'NEVER give undiluted 25% or 50% dextrose to a newborn. For hypoglycaemia use 10% dextrose 2 mL/kg IV then a 10% infusion.',
   'Meconium: do NOT routinely intubate and suction — even with thick meconium. Ventilate if the baby is non-vigorous.',
   'Premature babies: plastic wrap for <1500 g without drying, room temperature 23–25 °C, servo-controlled radiant warmer, delay cord clamping 30–60 s if vigorous.',
   'Target pre-ductal SpO₂: 1 min 60–65%, 2 min 65–70%, 3 min 70–75%, 4 min 75–80%, 5 min 80–85%, 10 min 85–95%.',
   'Consider: pneumothorax (transilluminate), congenital diaphragmatic hernia (scaphoid abdomen — intubate, never bag-mask), severe anaemia/hydrops, maternal opioids (naloxone is NOT recommended in the delivery room).']},
 {id:'p-neonatal-sepsis', t:'Neonatal sepsis — India',
  s:['neonatal','antiinfective'],
  steps:['Early-onset (<72 h) is usually vertically transmitted: Group B Streptococcus, E. coli, Klebsiella, Listeria.',
   'Late-onset (>72 h) is usually nosocomial: coagulase-negative staphylococci, Klebsiella, Acinetobacter, Pseudomonas, Candida.',
   'Investigate BEFORE antibiotics: blood culture (minimum 1 mL, ideally 2 mL), CRP at 12–24 h (early CRP is unreliable), full blood count with I:T ratio >0.2, chest X-ray, lumbar puncture if meningitis is suspected or the culture is positive.',
   'FIRST-LINE empirical (early onset): AMPICILLIN 50 mg/kg IV 12-hourly (<7 days; 8-hourly thereafter) PLUS GENTAMICIN 4–5 mg/kg IV once daily.',
   'If staphylococcal sepsis is suspected (skin pustules, indwelling lines, late onset): CLOXACILLIN 25–50 mg/kg IV 6–8 hourly PLUS AMIKACIN 15 mg/kg IV once daily.',
   'CEFKTRIAXONE IS AVOIDED IN NEONATES — it displaces bilirubin from albumin (kernicterus) and precipitates with calcium-containing IV fluids (fatal). Use CEFOTAXIME 50 mg/kg IV q8–12 h instead.',
   'Meningitis: cefotaxime 50 mg/kg q8h + ampicillin, or meropenem 20–40 mg/kg q8h; treat for 21 days (Gram-negative) or 14 days (Gram-positive).',
   'Supportive: thermoneutral environment, careful fluids (avoid overload — risk of PDA and NEC), inotropes for shock, mechanical ventilation, correct hypoglycaemia/hypocalcaemia/acidosis.',
   'Review at 48–72 h with culture results; stop antibiotics if cultures are negative and the baby is well.',
   'Doses depend on gestational AND postnatal age — renal clearance matures rapidly. Always check the current neonatal formulary.',
   'Never give benzathine penicillin intravenously — it is fatal. It is for IM use only.']},
 {id:'p-acute-stroke', t:'Acute ischaemic stroke — thrombolysis pathway',
  s:['neurocrit','anticoag'],
  steps:['TIME IS BRAIN. Note the exact time last seen well — this, not the time of discovery, defines the window.',
   'Non-contrast CT head within 25 min of arrival to exclude haemorrhage.',
   'BP must be <185/110 mmHg BEFORE thrombolysis and <180/105 for 24 h after. Treat with labetalol 10–20 mg IV q10 min (max 300 mg), nicardipine 5 mg/h IV titrated, or urapidil 12.5–25 mg IV.',
   'ALTEPLASE 0.9 mg/kg IV (maximum 90 mg): 10% as an IV bolus over 1 minute, the remaining 90% infused over 60 minutes. Window: within 4.5 h of onset.',
   'TENECTEPLASE 0.25 mg/kg IV (maximum 25 mg) as a single bolus over 5–10 s — non-inferior to alteplase (TRACE-2, EXTEND-IA TNK) and logistically simpler. Preferred before thrombectomy and in many Indian centres.',
   'EXCLUSIONS: intracranial haemorrhage on CT, stroke or serious head trauma in the last 3 months, previous ICH, intracranial neoplasm/AVM/aneurysm, GI or urinary haemorrhage within 21 days, major surgery within 14 days, arterial puncture at a non-compressible site within 7 days, platelets <100 ×10⁹/L, INR >1.7, aPTT >40 s, LMWH treatment dose within 24 h, DOAC within 48 h, SBP >185 or DBP >110 despite treatment.',
   'Mechanical thrombectomy for large-vessel occlusion up to 24 h in selected patients (DAWN/DEFUSE-3 criteria).',
   'Do NOT give aspirin for 24 h after thrombolysis.',
   'No heparin infusion after thrombolysis.',
   'Neurological observations every 15 min for 2 h, then every 30 min for 6 h, then hourly to 24 h. Stop the infusion for severe headache, acute hypertension, nausea/vomiting or neurological deterioration and get an urgent CT.',
   'Manage glucose (target 7.8–10 mmol/L), temperature, oxygenation (only if SpO₂ <94%), and swallow screening before any oral intake.',
   'SAH is a DIFFERENT pathway — never thrombolyse. Thunderclap headache, CT ± LP, nimodipine 60 mg PO q4h × 21 days.']},
 {id:'p-icp', t:'Raised intracranial pressure',
  s:['neurocrit','electrolyte'],
  steps:['Raise the head of the bed to 30°, head midline, avoid neck compression; adequate analgesia and sedation; treat fever; maintain PaCO₂ 35–40 mmHg; avoid hypoxia and hypotension.',
   'Target CPP 60–70 mmHg (CPP = MAP − ICP). Target ICP <22 mmHg.',
   'Osmotherapy for acute deterioration:',
   '  MANNITOL 0.25–1 g/kg IV over 20–30 min (12.5–50 g). Effective in 15–30 min, lasts 4–6 h. Requires an intact blood–brain barrier and adequate BP; avoid if serum osmolality >320 mOsm/kg or in hypotension/hypovolaemia.',
   '  HYPERTONIC SALINE 3% 2–5 mL/kg bolus (or 23.4% 30 mL via a central line for herniation). Preferred in hypotensive patients. Target Na⁺ 145–155 mmol/L.',
   'Hyperventilate to PaCO₂ 30–35 mmHg ONLY as a temporary measure for impending herniation — it causes cerebral ischaemia if prolonged.',
   'Neuromuscular blockade reduces ICP in refractory cases; consider a short trial.',
   'Barbiturate coma or decompressive craniectomy for refractory intracranial hypertension — specialist decision.',
   'CORTICOSTEROIDS ARE CONTRAINDICATED IN TRAUMATIC BRAIN INJURY (CRASH trial — increased mortality). They ARE indicated for vasogenic oedema around a tumour or abscess (dexamethasone 10 mg IV then 4 mg q6h).',
   'Seizure prophylaxis for 7 days after severe TBI is reasonable (phenytoin or levetiracetam); routine long-term prophylaxis is not.',
   'Maintain euvolaemia, Na⁺ 140–150, glucose 6–10 mmol/L, Hb >7–9 g/dL, temperature <37.5 °C.',
   'Never let ICP treatment compromise cerebral perfusion pressure.']},
 {id:'p-crs', t:'Continuous renal replacement therapy — anticoagulation',
  s:['renal','anticoag'],
  steps:['KDIGO recommends REGIONAL CITRATE ANTICOAGULATION (RCA) for CRRT wherever there is no contraindication — it prolongs filter life and avoids systemic anticoagulation.',
   'RCA: 4% trisodium citrate pre-filter at 1.2–1.5× the blood flow rate (mL citrate per mL blood), targeting a post-filter ionised calcium of 0.25–0.40 mmol/L.',
   'Replace calcium centrally: calcium gluconate 10% or calcium chloride 10% infused into the RETURN line (a separate lumen — never in the same line as citrate, they will clot each other) to keep the systemic ionised calcium 1.0–1.2 mmol/L.',
   'MONITOR for CITRATE ACCUMULATION: the ratio of total serum calcium to ionised calcium. A ratio >2.5 means citrate is accumulating — reduce or stop citrate and switch to heparin or no anticoagulation.',
   'Other clues to accumulation: rising total calcium with falling ionised calcium, metabolic acidosis with an elevated anion gap, worsening lactate (citrate is metabolised to bicarbonate — accumulation causes ACIDOSIS, not alkalosis).',
   'CONTRAINDICATIONS to citrate: severe liver failure, shock with severe lactic acidosis (lactate >4 mmol/L rising), severe hypoxaemia, impaired oxidative metabolism.',
   'HEPARIN alternative: 500–1500 IU/h (no bolus) with aPTT monitoring at 1.5–2× baseline, or weight-based 5–10 IU/kg/h. Protamine 1 mg per 100 IU heparin if bleeding.',
   'NO ANTICOAGULATION with frequent saline flushes (100–200 mL q15–30 min) and a high blood flow rate is acceptable when the bleeding risk is very high — filter life is shorter.',
   'Citrate locks up magnesium too — monitor ionised Mg²⁺ as well as calcium.',
   'Dosing: CVVH/CVVHD 20–25 mL/kg/h effluent is standard (RENAL/ATN trials); higher doses give no survival benefit. Adjust antibiotic doses for the CRRT clearance.',
   'Monitor phosphate — CRRT removes phosphate and hypophosphataemia is common; use phosphate-containing replacement fluid or supplement.']},
 {id:'p-mh', t:'Malignant hyperthermia',
  s:['nmba','tox'],
  steps:['Triggers: volatile anaesthetics (halothane, isoflurane, sevoflurane, desflurane) and suxamethonium. Safe: propofol, etomidate, ketamine, thiopentone, opioids, all non-depolarising NMBAs, benzodiazepines, local anaesthetics, nitrous oxide.',
   'Early signs: unexplained rise in end-tidal CO₂ that does not respond to increased ventilation, masseter muscle rigidity after suxamethonium, tachycardia, tachypnoea, arrhythmias.',
   'Late signs: hyperthermia (can rise 1–2 °C every 5 min), generalised rigidity, myoglobinuria, hyperkalaemia, acidosis, DIC.',
   'STOP the trigger immediately; call for help and the MH cart; hyperventilate with 100% oxygen at high flow.',
   'Change to a clean anaesthetic machine or fit activated-charcoal filters; switch to TIVA.',
   'DANTROLENE 2.5 mg/kg IV rapidly through a large cannula, repeat every 5–10 min until rigidity, hypermetabolism and acidosis resolve — cumulative doses may reach 10 mg/kg or more. Reconstitute each 20 mg vial in 60 mL sterile water (0.33 mg/mL) and give warm.',
   'Dantrolene contains 3 g of mannitol and 140 mg of NaOH per 20 mg vial — expect diuresis.',
   'Treat hyperkalaemia (calcium, insulin–dextrose, salbutamol, bicarbonate); treat arrhythmias with standard drugs but AVOID calcium-channel blockers with dantrolene (cardiovascular collapse and hyperkalaemia).',
   'Cool actively if the core temperature >39 °C: cold IV saline 15 mL/kg q10 min, surface cooling, ice-cold lavage of body cavities; STOP cooling at 38 °C to avoid overshoot hypothermia.',
   'Monitor: core temperature, K⁺, CK, myoglobin, blood gases, coagulation, urine output (target >2 mL/kg/h with forced diuresis to protect the kidneys).',
   'Continue dantrolene 1 mg/kg q4–6 h or 0.25 mg/kg/h for at least 24–36 h after the episode — recrudescence occurs in about 25%.',
   'Abort the surgery if it is not life-saving; refer the patient and family for MH testing and genetic counselling; label the notes and the patient.',
   'Ryanodex/Ryanopur (ultra-concentrated dantrolene 250 mg in 50 mL) is faster to reconstitute — check which formulation your pharmacy stocks.']},
 {id:'p-last', t:'Local anaesthetic systemic toxicity (LAST)',
  s:['tox','sedation'],
  steps:['Recognise early: perioral numbness, metallic taste, tinnitus, agitation, dizziness → seizures → arrhythmias → cardiovascular collapse. Bupivacaine and ropivacaine are the most cardiotoxic.',
   'STOP the injection; call for help; get the lipid-emulsion kit.',
   'Airway management and 100% oxygen — hypoxia and acidosis dramatically worsen LAST.',
   'Seizures: benzodiazepine (midazolam 0.1 mg/kg or diazepam 0.1–0.2 mg/kg). Avoid large doses of propofol in a haemodynamically unstable patient — it worsens hypotension and is NOT a substitute for lipid emulsion.',
   'LIPID EMULSION 20%: bolus 1.5 mL/kg lean body mass IV over 1 minute, then 0.25 mL/kg/min infusion. Maximum initial rate 10 mL/min.',
   'If cardiovascular instability persists, repeat the bolus once or twice and increase the infusion to 0.5 mL/kg/min. Maximum cumulative dose ≈12 mL/kg.',
   'ACLS MODIFICATIONS in LAST: use adrenaline in SMALL doses only (≤1 mcg/kg) — large doses impair lipid resuscitation and worsen arrhythmias; AVOID vasopressin, calcium-channel blockers, β-blockers and local anaesthetics (lidocaine as an antiarrhythmic).',
   'Prefer amiodarone for ventricular arrhythmias.',
   'Prolonged resuscitation is warranted — successful outcomes have been reported after more than 60 minutes of CPR. Consider cardiopulmonary bypass/ECMO.',
   'Observe for at least 12 hours after a severe event (4–6 hours after a milder one) — rebound toxicity occurs as lipid redistributes.',
   'Do not use lipid emulsion for non-lipophilic drug overdose as first-line — evidence is strongest for bupivacaine, and reasonable for other lipophilic agents.']},
 {id:'p-sedation', t:'ICU analgesia and sedation',
  s:['sedation','nmba'],
  steps:['ANALGESIA FIRST (analgosedation) — treat pain before adding a sedative. Untreated pain drives agitation, delirium and ventilator dyssynchrony.',
   'Set an explicit target: RASS 0 to −2 for most ventilated patients. Assess at least every 4 h with a validated scale (RASS or SAS) and document.',
   'Delirium screening: CAM-ICU or ICDSC every shift. Delirium is independently associated with mortality, longer ventilation and cognitive impairment.',
   'PREFERRED SEDATIVES: propofol or dexmedetomidine over benzodiazepines for short-term sedation (less delirium, shorter ventilation). Benzodiazepines are preferred in alcohol withdrawal, status epilepticus, severe asthma and where cost constrains the choice.',
   'PROPOFOL: 5–50 mcg/kg/min (0.3–3 mg/kg/h). Reduce or stop if triglycerides >4.4 mmol/L. PRIS (propofol infusion syndrome) — unexplained acidosis, rhabdomyolysis, hyperkalaemia, lipaemia, bradycardia, cardiac failure — occurs with >4 mg/kg/h for >48 h; it is usually fatal and there is no treatment except stopping propofol.',
   'DEXMEDETOMIDINE: 0.2–1.4 mcg/kg/h without a loading dose (a load causes hypotension and bradycardia). Reduces delirium; does not suppress respiration.',
   'MIDAZOLAM: 0.5–5 mg/h. Accumulates in renal and hepatic failure; its active metabolite is renally cleared.',
   'ANALGESIA: fentanyl 25–200 mcg boluses or 0.3–3 mcg/kg/h; morphine 2–10 mg boluses or 2–10 mg/h (histamine release, active metabolite M6G accumulates in renal failure); paracetamol 1 g q6h IV as the opioid-sparing base (reduce to 500 mg q6h if weight <50 kg or malnourished).',
   'DAILY INTERRUPTION of sedation with a spontaneous breathing trial reduces ventilation duration — do it every morning unless there is a specific contraindication.',
   'NEUROMUSCULAR BLOCKADE only for specific indications (severe ARDS with dyssynchrony despite deep sedation, status asthmaticus, refractory intracranial hypertension, tetanus, shivering during targeted temperature management). ALWAYS ensure the patient is deeply sedated and analgesed FIRST — paralysis without sedation is torture.',
   'Monitor the depth of blockade with train-of-four; use the minimum effective dose; document the indication daily and stop as soon as it is no longer needed.',
   'Cisatracurium and atracurium undergo Hofmann elimination — they are the agents of choice in renal and hepatic failure.',
   'Suxamethonium: only for rapid-sequence intubation. Contraindicated after 72 h of immobilisation, burns, denervation, hyperkalaemia, and in malignant hyperthermia susceptibility.']},
 {id:'p-antibiotics-india', t:'Empirical antimicrobial therapy — Indian ICU',
  s:['antiinfective'],
  steps:['Always send cultures BEFORE the first dose, but never delay antibiotics beyond 1 hour in septic shock.',
   'Base the choice on your LOCAL antibiogram — Indian ICU resistance patterns vary widely between centres and change yearly.',
   'HOSPITAL-ACQUIRED / VENTILATOR-ASSOCIATED PNEUMONIA: piperacillin–tazobactam 4.5 g q6h (extended infusion over 3–4 h) or cefepime 2 g q8h or meropenem 1 g q8h (extended over 3 h) PLUS, if MRSA is likely, vancomycin (AUC-guided) or linezolid 600 mg q12h. Add colistin or tigecycline only when carbapenem resistance is documented or highly likely.',
   'SEPSIS OF UNKNOWN ORIGIN: piperacillin–tazobactam or meropenem ± vancomycin/linezolid. Add an antifungal (echinocandin) if there are risk factors for candidaemia: TPN, recent broad-spectrum antibiotics, central lines, abdominal surgery, immunosuppression.',
   'COMMUNITY-ACQUIRED SEVERE PNEUMONIA: ceftriaxone 2 g q12–24h PLUS azithromycin 500 mg daily (or levofloxacin 750 mg daily as a single agent in appropriate patients).',
   'SUSPECTED SCRUB TYPHUS / RICKETTSIA (very common in India, especially post-monsoon): doxycycline 100 mg q12h PO/IV; azithromycin 500 mg daily in pregnancy and children.',
   'SUSPECTED ENTERIC FEVER: azithromycin 20 mg/kg/day or ceftriaxone 50–100 mg/kg/day — fluoroquinolone resistance is now near-universal in India.',
   'MELIOIDOSIS (increasingly recognised): ceftazidime 2 g q6–8h or meropenem 1 g q8h for ≥10–14 days, then oral TMP-SMX eradication therapy for 3–6 months.',
   'CARBAPENEM-RESISTANT ENTEROBACTERALES: ceftazidime–avibactam 2.5 g q8h over 2 h (add aztreonam for metallo-β-lactamases — the commonest mechanism in India), or meropenem–vaborbactam, or colistin/tigecyclide combinations. Consult infectious diseases.',
   'EXTENDED INFUSIONS: piperacillin–tazobactam over 3–4 h and meropenem over 3 h improve target attainment in critically ill patients with augmented renal clearance.',
   'DE-ESCALATE at 48–72 h once culture results and the clinical course are known. Document the indication and the planned stop date on every prescription.',
   'ADJUST for renal function, CRRT, obesity and burns — the standard dose is often inadequate in the critically ill (increased volume of distribution and augmented renal clearance).',
   'ANTIFUNGALS: candidaemia — an echinocandin first-line (caspofungin 70 mg then 50 mg daily; micafungin 100 mg daily), step down to fluconazole once sensitivities are known and the patient is stable; remove central lines; ophthalmoscopy. Mucormycosis — liposomal amphotericin B 5–10 mg/kg/day PLUS urgent surgical debridement; echinocandins have NO activity.',
   'NEVER give IV benzathine penicillin. NEVER combine ceftriaxone with calcium-containing fluids in a neonate.']},
 {id:'p-meningitis', t:'Suspected bacterial meningitis / encephalitis',
  s:['antiinfective','neurocrit'],
  steps:['DO NOT DELAY ANTIBIOTICS FOR IMAGING OR LUMBAR PUNCTURE. If there is a delay, give the first dose immediately and do the LP later.',
   'Blood cultures, then antibiotics within 1 hour of suspicion.',
   'ADULT empirical: ceftriaxone 2 g IV q12h PLUS vancomycin (AUC-guided, for cephalosporin-resistant pneumococcus). Add ampicillin 2 g q4h if age >50, immunocompromised or alcohol use disorder (Listeria).',
   'CHILD empirical (>1 month): ceftriaxone 100 mg/kg/day in 1–2 divided doses (max 4 g/day) or cefotaxime 200 mg/kg/day in 4 divided doses PLUS vancomycin.',
   'NEONATE: ampicillin 50 mg/kg q12h + cefotaxime 50 mg/kg q8h + gentamicin 4–5 mg/kg daily. AVOID ceftriaxone (bilirubin displacement and calcium precipitation).',
   'Dexamethasone 0.15 mg/kg (adult 10 mg) IV q6h for 4 days — give BEFORE or WITH the first antibiotic dose. Proven benefit in pneumococcal meningitis in adults and H. influenzae in children.',
   'ACYCLOVIR 10 mg/kg IV q8h (children 20 mg/kg q8h; neonates 20 mg/kg q8h) for suspected HSV encephalitis — altered behaviour, seizures, temporal lobe changes on imaging or CSF lymphocytosis with RBCs. Start empirically; stop only when the CSF PCR is negative and the clinical picture fits.',
   'India-specific: consider tuberculosis (start empirical anti-TB therapy if CSF shows lymphocytic pleocytosis, very high protein, low glucose and a basal exudate), leptospirosis, scrub typhus, Japanese encephalititis, cryptococcal meningitis (HIV), and cerebral malaria.',
   'Supportive: manage raised ICP, seizures, hyponatraemia (SIADH vs cerebral salt wasting — the treatment is opposite), and fluid balance.',
   'Droplet precautions for meningococcal disease; give rifampicin 600 mg q12h × 2 days (or ciprofloxacin 500 mg single dose) prophylaxis to close contacts.',
   'Repeat LP if there is no improvement in 48 h, or in Gram-negative or pneumococcal meningitis treated with a cephalosporin to confirm sterilisation.']},
 {id:'p-malaria', t:'Severe malaria',
  s:['antiinfective'],
  steps:['SEVERE MALARIA criteria: impaired consciousness, prostration, multiple seizures, acidosis (base deficit >8 or HCO₃⁻ <15), hypoglycaemia (<2.2 mmol/L), severe anaemia (Hb <5 g/dL), renal impairment (creatinine >265 µmol/L), jaundice with another organ dysfunction, pulmonary oedema, significant bleeding, shock, hyperparasitaemia (>10%).',
   'IV ARTESUNATE is first-line for ALL severe malaria — adults, children and pregnancy (including the first trimester). It reduces mortality by about 22.5% versus quinine (SEAQUAMAT, AQUAMAT).',
   'Adult and child ≥20 kg: 2.4 mg/kg IV at 0, 12 and 24 h, then once daily.',
   'Child <20 kg: 3.0 mg/kg IV at 0, 12 and 24 h, then once daily.',
   'Pregnancy: the same 2.4 mg/kg regimen in all trimesters.',
   'Continue parenteral therapy for a minimum of 24 h and until the patient can tolerate oral medication, then complete a full course of an artemisinin-based combination therapy (or doxycycline/clindamycin + artesunate in adults; avoid doxycycline in pregnancy and children <8 years).',
   'If artesunate is unavailable: quinine dihydrochloride 20 mg salt/kg IV over 4 h (loading), then 10 mg/kg q8h; NEVER give quinine as an IV bolus (fatal hypotension and arrhythmia). Reduce the dose by one-third after 48 h and in renal/hepatic failure.',
   'Monitor glucose hourly — both quinine and severe malaria cause profound hypoglycaemia.',
   'DELAYED HAEMOLYSIS occurs 1–3 weeks after IV artesunate in about 10–15% of travellers — advise the patient to return and check the Hb weekly for 4 weeks.',
   'Do NOT use exchange transfusion routinely; do NOT add heparin, aspirin or high-dose steroids (they increase harm).',
   'Adjuncts: treat seizures (benzodiazepine; avoid prophylactic phenobarbitone), correct anaemia, manage AKI (early RRT), treat pulmonary oedema carefully (fluid restriction), give thiamine.',
   'Report every case to the NVBDCP/NVBDC — malaria is a notifiable disease in India and must be entered in the surveillance system.']},
 {id:'p-mh-paed-weight', t:'Weight estimation in children',
  s:['resus','misc'],
  steps:['A MEASURED WEIGHT IS ALWAYS PREFERRED. Estimate only when the child cannot be weighed and there is no time.',
   'This calculator uses the WHO median weight-for-age by sex (the most accurate population estimate) and shows the APLS and Luscombe formulae alongside for comparison.',
   'APLS: <1 year → (0.5 × age in months) + 4 kg; 1–5 years → (2 × age in years) + 8 kg; 6–12 years → (3 × age in years) + 7 kg.',
   'Luscombe & Owens (validated 1–15 years): (3 × age in years) + 7 kg — closer to modern weights than the older APLS formula, but it still underestimates in overweight children.',
   'Length-based tapes (Broselow, Sandell) are the most accurate estimation method and should be used wherever available.',
   'All formulae can err by 20–30%, and the error is worse at the extremes of age.',
   'SAFETY NET: the calculator applies every maximum single and 24-hour dose cap, so a grossly over-estimated weight cannot produce a toxic dose for drugs with a defined maximum.',
   'Confirm the weight as soon as possible and recalculate. Document that an estimated weight was used.',
   'For drugs with a narrow therapeutic index (aminoglycosides, vancomycin, phenytoin, chemotherapy), never rely on an estimated weight — measure it.']},
 {id:'p-never-events', t:'Never-events and high-alert drug checks',
  s:['misc'],
  steps:['These errors are entirely preventable. Every one of them has killed patients in Indian ICUs.',
   '1. Never give IV potassium chloride undiluted or as a bolus. It must always be diluted and infused with a pump and cardiac monitoring.',
   '2. Never give insulin without confirming the vial strength (100 IU/mL vs 40 IU/mL) and having a second practitioner check the dose.',
   '3. Never give IV benzathine penicillin — it causes cardiorespiratory arrest. It is for deep IM use only.',
   '4. Never give adrenaline 1:1000 intravenously to a patient with a pulse. Use 1:10,000 for IV arrest dosing or a diluted infusion for shock.',
   '5. Vincristine is for INTRAVENOUS use only — intrathecal vincristine is uniformly fatal. Dispense it in a minibag, never in a syringe, and label it "FOR INTRAVENOUS USE — FATAL IF GIVEN BY ANY OTHER ROUTE".',
   '6. Never give ceftriaxone with, or through the same line as, a calcium-containing solution in a neonate — it forms a precipitate in the lungs and kidneys.',
   '7. Never give 25% or 50% dextrose undiluted to a newborn — use 10% dextrose.',
   '8. Never give methylergometrine to a hypertensive or pre-eclamptic patient.',
   '9. Never give a calcium-channel blocker with dantrolene — cardiovascular collapse.',
   '10. Never give magnesium sulfate without calcium gluconate at the bedside and without checking reflexes, respiratory rate and urine output.',
   '11. Never correct serum sodium faster than 8–10 mmol/L in 24 hours.',
   '12. Never give sodium nitrite for suspected cyanide poisoning if there has been smoke inhalation — it adds carboxyhaemoglobin-induced hypoxia to methaemoglobinaemia. Use hydroxocobalamin.',
   '13. Never give a DOAC dose without checking renal function and the exact drug — apixaban, rivaroxaban, dabigatran and edoxaban are not interchangeable.',
   '14. Never confuse colistin MIU with colistin mg — 1 MIU ≈ 33.3 mg colistin base activity.',
   '15. Never confuse caffeine citrate with caffeine base — citrate is twice the mass for the same base dose.',
   '16. Never give a paracetamol dose without checking the total from ALL sources (IV, oral, and combination products) — 4 g/24 h maximum in a healthy adult, 2 g in the low-weight or malnourished.',
   '17. Never give naloxone as a large bolus to an opioid-dependent patient — titrate to respiratory rate, not to full arousal.',
   '18. Never assume a "look-alike, sound-alike" vial is what the label says. Read the label twice, at the point of drawing up and at the point of administration.',
   'INDEPENDENT DOUBLE CHECK for every high-alert drug (this calculator flags risk 4 and 5): two practitioners separately verify the drug, the concentration, the dose, the route, the rate and the patient.']},
 {id:'p-verification', t:'How to use this calculator safely',
  s:['misc'],
  steps:['1. Enter the WEIGHT whenever it is known. An estimated weight is only a fallback.',
   '2. Check the POPULATION label the calculator has assigned (neonate / paediatric / adult) — it is derived from the age you entered and it filters the regimens shown.',
   '3. For renally excreted drugs, enter the serum creatinine so the CrCl/eGFR is computed and the dose can be adjusted.',
   '4. Read the VOLUME, not just the dose. Confirm the concentration on the vial in your hand matches the formulation row you are using.',
   '5. If a volume is below 0.1 mL, follow the dilution advice — do not attempt to measure it directly.',
   '6. Cross-check the dose against your institutional protocol and the cited reference before administering.',
   '7. Every regimen with risk 4 or 5 carries an independent double-check requirement.',
   '8. This tool does not replace clinical judgement, the patient\'s own chart, or your pharmacy.',
   '9. Report any discrepancy you find — an error you catch is an error the next clinician will not make.',
   '10. Print the sheet, sign it, and file it in the case record as part of the double-check documentation.']},
 {id:'p-antidote-table', t:'Antidote quick-reference — poison → drug',
  s:['tox'],
  steps:['Paracetamol → N-acetylcysteine (150 mg/kg over 1 h, 50 mg/kg over 4 h, 100 mg/kg over 16 h).',
   'Organophosphorus/carbamate → atropine (titrated to dry axillae) ± pralidoxime.',
   'Opioid → naloxone, titrated to respiratory rate.',
   'Benzodiazepine → flumazenil ONLY in a secure, non-dependent, non-TCA co-ingestion.',
   'β-blocker / calcium-channel blocker → glucagon, high-dose insulin–euglycaemia, calcium, lipid emulsion, pacing.',
   'Digoxin / cardiac glycoside plants (oleander, Thevetia) → digoxin-specific Fab.',
   'Tricyclic antidepressant → sodium bicarbonate (target pH 7.45–7.55).',
   'Iron → deferoxamine.',
   'Methanol / ethylene glycol → fomepizole (or ethanol) + folate/thiamine + haemodialysis.',
   'Cyanide → hydroxocobalamin (first-line) or sodium nitrite + sodium thiosulfate.',
   'Methaemoglobinaemia → methylene blue 1–2 mg/kg (contraindicated in G6PD deficiency).',
   'Snakebite → anti-snake venom serum, 10 vials.',
   'Scorpion sting → prazosin.',
   'Aluminium phosphide → supportive + magnesium sulfate (no proven antidote).',
   'Rodenticide (superwarfarin) → vitamin K1 in high, prolonged doses (50–200 mg/day for weeks to months).',
   'Heparin → protamine sulfate.',
   'Warfarin → vitamin K1 + 4-factor PCC.',
   'Dabigatran → idarucizumab 5 g.',
   'Apixaban/rivaroxaban → andexanet alfa or 4-factor PCC 50 IU/kg.',
   'Valproate → L-carnitine.',
   'Local anaesthetic → 20% lipid emulsion.',
   'Malignant hyperthermia → dantrolene.',
   'Anticholinergic → physostigmine (only in a secure diagnosis, with ECG monitoring and atropine at the bedside).',
   'Serotonin syndrome → cyproheptadine + benzodiazepines + cooling.',
   'Neuroleptic malignant syndrome → stop the agent + benzodiazepines + bromocriptine ± dantrolene + cooling.',
   'Sulfonylurea → octreotide 50–100 mcg SC q6–12 h (dextrose alone causes rebound hyperinsulinaemia).',
   'Isoniazid → pyridoxine gram-for-gram.',
   'Colchicine → no antidote; Fab fragments are not commercially available.',
   'Hydrofluoric acid → calcium gluconate gel topically + IV/arterial calcium.',
   'Methotrexate → folinic acid (leucovorin) rescue + glucarpidase + urinary alkalinisation.']},
 {id:'p-antidote-hie', t:'High-dose insulin–euglycaemia therapy (HIET)',
  s:['tox','endocrine'],
  steps:['INDICATION: β-blocker or calcium-channel-blocker overdose with myocardial dysfunction and shock refractory to fluids, calcium and catecholamines.',
   'LOAD: regular insulin 1 unit/kg IV bolus over 5–10 min. If the patient is in profound shock, consider omitting the bolus (it can cause transient cardiovascular collapse).',
   'INFUSION: start at 1 unit/kg/h — this is 10–100× the dose used for DKA. Titrate up by 1 unit/kg/h every 15–30 min to a typical range of 2–10 units/kg/h; the maximum reported is 80 units/kg/h.',
   'GLUCOSE: start 10–25% dextrose to keep the blood glucose 5.5–11 mmol/L (100–200 mg/dL). Typical requirement 0.5 g/kg/h. Use a central line for >12.5% dextrose.',
   'POTASSIUM: supplement to keep K⁺ 2.8–3.5 mmol/L at the start; it will fall. Check hourly initially.',
   'MONITOR: glucose every 15 min for the first hour, then hourly; potassium hourly; phosphate and magnesium 4-hourly; continuous ECG.',
   'Hypoglycaemia can occur up to 24 h AFTER stopping the infusion — continue hourly glucose monitoring for at least 12–24 h after cessation.',
   'Onset is SLOW: allow 30–60 minutes before declaring failure. Continue catecholamines in the interim.',
   'Give alongside: calcium (chloride 1 g or gluconate 3 g IV, repeated), glucagon 5 mg IV then 5 mg/h (β-blockers), lipid emulsion for lipophilic agents, vasopressors, and consider pacing or ECMO.',
   'Do NOT use HIET if potassium is <2.5 mmol/L until it is corrected.']},
 {id:'p-fluid-therapy', t:'IV fluid prescription and maintenance',
  s:['electrolyte','renal'],
  steps:['MAINTENANCE (Holliday–Segar): 100 mL/kg for the first 10 kg, +50 mL/kg for the next 10 kg, +20 mL/kg above 20 kg, per 24 hours.',
   'A simpler adult estimate: 25–30 mL/kg/day of water and 1 mmol/kg/day each of Na⁺, K⁺ and Cl⁻.',
   'USE ISOTONIC FLUIDS for maintenance in children (0.9% NaCl or a balanced solution) — hypotonic maintenance fluids cause hospital-acquired hyponatraemia and deaths (AAP 2018, NICE CG174).',
   'Add dextrose only if the patient cannot be fed and needs it for hypoglycaemia prevention (2.5–5% in children; 5% is not a resuscitation fluid).',
   'Add potassium only after urine output is confirmed and K⁺ is known.',
   'BALANCED CRYSTALLOIDS (Ringer lactate, Plasma-Lyte, Normosol) cause less hyperchloraemic acidosis and less AKI than 0.9% saline (SMART, SPLIT, BaSICS) — prefer them for large-volume resuscitation.',
   '0.9% saline remains appropriate for hypochloraemic metabolic alkalosis, hyponatraemia and (with caution) raised ICP.',
   'Ringer lactate contains 4 mmol/L K⁺ — this is not a reason to avoid it in hyperkalaemia (it is less potassium-raising than saline because it avoids acidosis), but it does contain calcium and must not be co-infused with ceftriaxone in neonates.',
   'RESUSCITATION: 250–500 mL boluses in adults (10–20 mL/kg in children), each followed by a structured reassessment of perfusion. Do not give fluid blindly.',
   'ALBUMIN 5% or 20%: consider in spontaneous bacterial peritonitis, hepatorenal syndrome, large-volume paracentesis, and possibly in septic shock requiring large crystalloid volumes. No survival benefit in general ICU populations (SAFE); harm in traumatic brain injury.',
   'DEPRESCALATION: switch to enteral nutrition and oral intake as soon as possible; stop maintenance IV fluids when the patient is drinking/eating adequately.',
   'Document the indication, the rate and the planned review time for EVERY bag.']},
 {id:'p-renal-dose', t:'Renal dose adjustment principles',
  s:['renal','antiinfective'],
  steps:['Estimate CrCl with Cockcroft–Gault using the ACTUAL body weight unless the patient is obese, in which case use adjusted body weight.',
   'eGFR (CKD-EPI/Schwartz) estimates STEADY-STATE kidney function and is NOT appropriate for dose adjustment in acute, changing kidney injury — use CrCl.',
   'AUGMENTED RENAL CLEARANCE (CrCl >130 mL/min) is common in young trauma, burns and sepsis patients — standard doses of β-lactams and vancomycin are frequently subtherapeutic. Use extended infusions and TDM.',
   'For hydrophilic drugs (β-lactams, aminoglycosides, glycopeptides) the loading dose is UNCHANGED in renal failure — only the maintenance dose or interval changes. Under-dosing the first dose is a common and dangerous error.',
   'For lipophilic drugs the volume of distribution is largely unchanged.',
   'Aminoglycosides: dose on IDEAL or ADJUSTED body weight, use extended-interval dosing where possible, and monitor levels (peak/trough or a single level with a nomogram).',
   'Vancomycin: AUC/MIC 400–600 target; load 25–30 mg/kg in the critically ill regardless of renal function.',
   'CRRT removes many drugs — assume a GFR equivalent to about 20–40 mL/min and dose accordingly; check specific tables. Citrate anticoagulation also chelates calcium.',
   'IHD removes small, hydrophilic, low-protein-bound drugs — give a supplementary dose AFTER each session.',
   'Commonly missed adjustments: enoxaparin (halve if CrCl <30), fondaparinux (contraindicated <30), dabigatran (avoid <30), DOACs generally, colistin, meropenem, levetiracetam, vancomycin, aminoglycosides, fluconazole, gabapentin, lithium.',
   'Nephrotoxins to review daily: aminoglycosides, vancomycin, amphotericin B, colistin, NSAIDs, ACEi/ARB, iodinated contrast, high-dose aciclovir (crystalluria), tenofovir.',
   'Recheck the renal function daily in AKI and recalculate — the dose that was right yesterday may be wrong today.']},
 {id:'p-paed-dosing', t:'Paediatric dosing safety rules',
  s:['misc'],
  steps:['ALWAYS calculate from the weight, never from the adult dose divided by age.',
   'ALWAYS apply the maximum single dose AND the maximum 24-hour dose — this calculator does both automatically.',
   'Children are not small adults: neonates have immature hepatic CYP enzymes and renal function; infants have a larger volume of distribution for water-soluble drugs; toddlers have faster clearance per kilogram than adults.',
   'Neonatal dosing depends on GESTATIONAL age and POSTNATAL age — use a neonatal formulary, not this calculator alone, for the first 28 days of life.',
   'Check the concentration of every liquid and injection: many drugs come in more than one strength in India (e.g. paracetamol syrup 120 mg/5 mL and 250 mg/5 mL; salbutamol nebuliser 1 mg/mL and 5 mg/mL).',
   'Use a 1 mL syringe for any volume below 1 mL, and never measure less than 0.05 mL without diluting.',
   'Dilute concentrated injections to a measurable volume — this calculator suggests dilutions for every volume below 0.1 mL.',
   'Watch for excipients: benzyl alcohol (gasping syndrome in neonates), propylene glycol (lorazepam, phenytoin infusions — toxicity in neonates and renal failure), ethanol.',
   'Phenytoin infusion rate: never faster than 1 mg/kg/min in children (0.5 mg/kg/min in neonates) — hypotension and arrhythmias. Fosphenytoin can be given 3× faster.',
   'Avoid aspirin in children with a viral illness (Reye syndrome).',
   'Avoid tetracyclines/doxycycline under 8 years EXCEPT for life-threatening rickettsial disease, where doxycycline remains first-line regardless of age (short courses do not stain teeth).',
   'Avoid fluoroquinolones in children except for specific indications (complicated UTI, Pseudomonas in cystic fibrosis, MDR-TB, anthrax).',
   'Ceftriaxone: avoid in neonates, especially premature ones, and never with calcium-containing fluids.',
   'Metoclopramide: avoid under 1 year (extrapyramidal reactions); promethazine is contraindicated under 2 years (apnoea).',
   'Codeine and tramadol: contraindicated under 12 years (and under 18 after tonsillectomy) — CYP2D6 ultra-rapid metabolisers cause fatal respiratory depression.',
   'Document weight, the calculation and the maximum applied on every paediatric prescription.']},
 {id:'p-infusion-safety', t:'IV infusion and pump safety',
  s:['misc','vasoactive'],
  steps:['LABEL every syringe and bag with the drug, the total amount, the total volume, the concentration, the patient and the time — before you connect it.',
   'Use a smart pump with a drug library and hard dose limits for every high-alert infusion.',
   'Double-check the programme at the pump against the prescription with a second practitioner for all risk 4–5 drugs.',
   'Calculate the concentration, not just the rate: "mL/h" means nothing without knowing the mg/mL in the bag.',
   'Never run two vasoactive drugs through the same lumen if it can be avoided, and never flush a vasopressor line — a bolus of the line volume can be fatal.',
   'Prime the line with the drug solution, not saline, to avoid a bolus on connection and an interruption on changeover.',
   'Change syringes BEFORE they are empty; overlap two pumps when changing a critical infusion to avoid an interruption in noradrenaline or insulin.',
   'Check the infusion site every hour for vasopressors — extravasation of noradrenaline causes necrosis. Antidote: phentolamine 5–10 mg in 10–15 mL saline infiltrated locally, or topical nitroglycerin 2% paste.',
   'Maximum peripheral concentrations: potassium 40 mmol/L, dopamine/noradrenaline preferably central, vancomycin ≤5 mg/mL, aciclovir ≤7 mg/mL, promethazine should never be given peripherally if avoidable.',
   'Reconcile all infusion rates at every handover and document them in mL/h AND in dose units.',
   'This calculator\'s pump tab works out the mL/h from the ordered dose and the prepared concentration — use it, then verify the answer makes clinical sense (a rate above 50 mL/h for a vasopressor usually means the bag is too dilute).']}
];
