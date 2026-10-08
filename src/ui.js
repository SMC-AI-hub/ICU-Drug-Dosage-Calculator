/* =====================================================================
   UI.JS — rendering, filtering, patient panel, tools, print, export.
   All arithmetic lives in engine.js. Nothing here invents a number.
   ===================================================================== */
var App = (function(){
'use strict';

/* ------------------------------------------------------------------ */
/* state                                                              */
/* ------------------------------------------------------------------ */
var ST = {
  tab:'drugs',
  sys:new Set(), cls:'', q:'', pop:'', riskOnly:false, highAlertOnly:false,
  expand:new Set(),
  pt:{ wt:'', ageY:'', ageM:'', ageD:'', sex:'male', ht:'', scr:'', wMethod:'who', adultOverride:false,
       k:'', na:'', glu:'' },
  tool:{ df:20 },
  mix:{ id:'', amt:'', du:'mg', per:'kg/min', mode:'made', df:20, cont:50 },
  fav:new Set(), favOnly:false, theme:'', typeBig:false, tilesOpen:true, recent:[],
  pumpMode:'mix', step:0.1, rev:{}, board:[], boardNote:''
};

/* ---------------- session persistence ----------------
   A ward phone should reopen exactly where it was left: same tab, same
   filters, same patient, same pinned drugs, same infusion mix. Everything is
   device-local; nothing leaves the browser.                                */
var LS_KEY='icucalc.session.v1';
var LS_T=null;
function queueSave(){
  if(LS_T) clearTimeout(LS_T);
  LS_T=setTimeout(saveState, 350);
}
function saveState(){
  try{
    localStorage.setItem(LS_KEY, JSON.stringify({
      tab:ST.tab, q:ST.q, cls:ST.cls, pop:ST.pop, ha:ST.highAlertOnly,
      sys:Array.from(ST.sys), fav:Array.from(ST.fav), favOnly:ST.favOnly,
      pt:ST.pt, mix:ST.mix, theme:ST.theme, typeBig:ST.typeBig, tilesOpen:ST.tilesOpen,
      recent:ST.recent, pumpMode:ST.pumpMode, step:ST.step, rev:ST.rev,
      board:ST.board.slice(0,8)
    }));
  }catch(_){ /* private mode / full disk: the app simply does not remember */ }
}
function loadState(){
  try{
    var o=JSON.parse(localStorage.getItem(LS_KEY)||'null');
    if(!o) return;
    if(o.tab) ST.tab=o.tab;
    ST.q=o.q||''; ST.cls=o.cls||''; ST.pop=o.pop||'';
    ST.highAlertOnly=!!o.ha; ST.favOnly=!!o.favOnly;
    ST.sys=new Set(o.sys||[]); ST.fav=new Set(o.fav||[]);
    if(o.pt) Object.keys(o.pt).forEach(function(k){ if(k in ST.pt) ST.pt[k]=o.pt[k]; });
    if(o.mix) Object.keys(o.mix).forEach(function(k){ ST.mix[k]=o.mix[k]; });
    ST.theme=o.theme||''; ST.typeBig=!!o.typeBig; ST.tilesOpen=o.tilesOpen!==false;
    ST.recent=(o.recent||[]).slice(0,6);
    if(o.pumpMode==='mix'||o.pumpMode==='rev'||o.pumpMode==='board') ST.pumpMode=o.pumpMode;
    if(o.step) ST.step=o.step;
    if(o.rev) ST.rev=o.rev;
    if(Object.prototype.toString.call(o.board)==='[object Array]') ST.board=o.board.slice(0,8);
  }catch(_){ }
}
function applyPrefs(){
  document.body.classList.toggle('dark', ST.theme==='dark');
  document.body.classList.toggle('big', !!ST.typeBig);
}

var $  = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
/* smooth-scroll that degrades safely where scrollIntoView is unavailable */
function scrollToEl(el, block){
  if(!el || typeof el.scrollIntoView!=='function') return;
  try{ el.scrollIntoView({behavior:'smooth', block:block||'start'}); }catch(_){
    try{ el.scrollIntoView(); }catch(__){}
  }
}
function toast(msg){
  var t=$('#toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(function(){t.classList.remove('show');},2600);
}
function plural(n,w){ return fmtNum(n)+' '+w+(Math.abs(n-1)<1e-9?'':'s'); }

/* ------------------------------------------------------------------ */
/* patient context                                                    */
/* ------------------------------------------------------------------ */
function num(v){ var n=parseFloat(v); return isFinite(n)?n:null; }

function buildCtx(){
  var p = ST.pt;
  var ageY=num(p.ageY), ageM=num(p.ageM), ageD=num(p.ageD);
  var hasAge = (ageY!=null||ageM!=null||ageD!=null) && ((ageY||0)+(ageM||0)+(ageD||0))>=0;
  var ageDays = hasAge ? ageToDays(ageY||0, ageM||0, ageD||0) : null;
  var entered = num(p.wt);
  var measured = entered!=null && entered>0;

  /* gestational age at birth (24+0 to 42+0). Preterm infants are dosed on
     postmenstrual age and weighed against the Fenton reference, not WHO. */
  var gaW=num(p.gaW), gaD=num(p.gaD);
  var gaDays = (gaW!=null && gaW>0) ? gaW*7 + Math.max(0,Math.min(6,gaD||0)) : null;

  var pop = ageDays!=null ? popOf(ageDays) : null;
  if(gaDays!=null && gaDays<259 && ageDays!=null && ageDays < 28) pop='neo';
  if(p.adultOverride && pop==='paed') pop='adult';

  var kg=null, source=null, methods=[];
  if(measured){ kg=entered; source='measured'; }
  else if(ageDays!=null && !(gaDays!=null && gaDays < SCOPE_MIN_GA_WEEKS*7) && ageDays < SCOPE_MAX_AGE_Y*365.25){
    var w = estimateWeight({ageDays:ageDays, ageY:ageY||0, ageM:ageM||0, gaDays:gaDays, sex:p.sex, method:p.wMethod});
    if(w!=null){ kg=w; source='estimated'; }
    /* always show the alternatives so the user can see the spread */
    methods.push({k:(gaDays!=null && pmaDays(gaDays,ageDays)<280)? 'Fenton (by PMA)' : 'WHO median',
      v:estimateWeight({ageDays:ageDays,ageY:ageY||0,ageM:ageM||0,gaDays:gaDays,sex:p.sex,method:'who'})});
    methods.push({k:'APLS / Luscombe', v:aplsWeight(ageY||0, ageM||0)});
  }
  if(pop==null && kg!=null){ /* weight only: infer nothing about age */ }

  var ht = num(p.ht), scr = num(p.scr);
  var ibw = (ht && pop==='adult') ? ibwDevine(ht,p.sex) : null;
  var abw = (ibw!=null && kg!=null && kg>ibw) ? adjBW(ibw,kg) : null;
  var obese = (ibw!=null && kg!=null && kg > 1.2*ibw);
  var bsaA = (ht&&kg)? bsaMosteller(ht,kg) : null;
  var bsaH = (ht&&kg&&kg<10)? bsaHaycock(ht,kg) : null;
  var crcl = (ageY!=null && kg && scr) ? crclCG(ageY, kg, scr, p.sex) : null;
  var egfr = (ht && scr && (pop==='paed'||pop==='neo')) ? egfrSchwartz(ht,scr) : null;
  var maint = kg? maintenanceFluids(kg) : null;
  var dosingWeight = kg;
  var dwLabel = 'actual body weight';

  var ctx = {
    kg:kg, ageDays:ageDays, ageY:ageY, ageM:ageM, ageD:ageD, pop:pop, sex:p.sex,
    gaDays:gaDays, gaWeeks:(gaDays!=null? gaDays/7 : null), gaLabel:(gaDays!=null? gaLabel(gaDays):null),
    pmaDays:(gaDays!=null&&ageDays!=null? pmaDays(gaDays,ageDays) : null),
    pmaWeeks:(gaDays!=null&&ageDays!=null? pmaDays(gaDays,ageDays)/7 : null),
    correctedDays:(gaDays!=null&&ageDays!=null? correctedAgeDays(ageDays,gaDays) : null),
    isPreterm:(gaDays!=null && gaDays<259),
    heightCm:ht, scr:scr, ibw:ibw, adjBW:abw, obese:obese,
    bsa:bsaA, bsaHaycock:bsaH, crCl:crcl, eGFR:egfr, maint:maint,
    weightSource:source, weightMethods:methods,
    dosingWeight:dosingWeight, dosingWeightLabel:dwLabel,
    /* decimal-point guard: does the entered weight match the entered age? */
    weightAgeMsg: measured ? weightAgeCheck(kg, ageDays, p.sex, gaDays) : null,
    scopeMsg: scopeReason({gaWeeks:(gaDays!=null? gaDays/7 : null), ageDays:ageDays})
  };
  return ctx;
}

/* aminoglycosides and other hydrophilic drugs dose on adjusted body weight
   in obesity - flagged on the card, never applied silently */
function needsAdjWeight(reg){
  return /aminoglycoside/i.test(reg.cls||'');
}

function dosingWeightFor(reg, ctx){
  if(needsAdjWeight(reg) && ctx.obese && ctx.adjBW!=null){
    return {kg:ctx.adjBW, label:'adjusted body weight (obesity, hydrophilic drug)'};
  }
  return {kg:ctx.kg, label:'actual body weight'};
}

/* ------------------------------------------------------------------ */
/* filtering                                                          */
/* ------------------------------------------------------------------ */
function popVisible(reg, ctx){
  if(reg.pop==='all') return true;
  var p = ctx.pop;
  if(ST.pop) p = ST.pop;
  if(!p){
    /* No age was entered, so the population is genuinely ambiguous: show
       everything, EXCEPT neonatal-only entries once the weight makes a
       neonate impossible (the largest term newborn ever recorded is ~10 kg).
       This never hides a drug that could apply - it only removes entries that
       cannot possibly apply to this patient. */
    if(reg.pop==='neo' && ctx.kg!=null && ctx.kg>=12) return false;
    return true;
  }
  if(reg.pop===p) return true;
  if(p==='adult' && reg.pop==='paed') return false;
  if(p==='paed'  && reg.pop==='adult') return false;
  if(p==='neo'   && reg.pop==='adult') return false;
  if(p==='neo'   && reg.pop==='paed')  return !!reg.minAge || /neonat|newborn|surfactant|ductus/i.test((reg.n||'')+(reg.ind||''));
  return false;
}
function matchQ(reg, q){
  if(!q) return true;
  q=q.toLowerCase();
  var hay=[reg.n,reg.cls,reg.ind,reg.id,reg.admin,reg.d&&reg.d.rep].join(' ').toLowerCase();
  if(hay.indexOf(q)>=0) return true;
  var fx=(reg.fx||[]).map(function(f){return f.s+' '+(f.b||'');}).join(' ').toLowerCase();
  return fx.indexOf(q)>=0;
}
function visibleRegs(ctx){
  /* paediatric scope: entries that are explicitly adult-only never appear */
  var C=REG.filter(childScope);
  var q=ST.q.trim();
  return C.filter(function(r){
    if(ST.sys.size && !ST.sys.has(r.sys)) return false;
    if(ST.cls && r.cls!==ST.cls) return false;
    if(ST.highAlertOnly && (r.risk||1)<4) return false;
    if(ST.favOnly && !ST.fav.has(r.id)) return false;
    if(ST.riskOnly && (r.risk||1)<3) return false;
    if(!popVisible(r,ctx)) return false;
    if(!matchQ(r,q)) return false;
    return true;
  });
}

/* ------------------------------------------------------------------ */
/* rendering: patient panel                                           */
/* ------------------------------------------------------------------ */
function renderPatient(){
  var ctx = buildCtx();
  var p = ST.pt;
  var wFlag = ctx.weightSource==='measured'
      ? '<span class="flag f-measured">MEASURED</span>'
      : ctx.weightSource==='estimated'
      ? '<span class="flag f-est">ESTIMATED — VERIFY</span>'
      : '<span class="flag f-crit">NO WEIGHT</span>';

  var big = ctx.kg!=null ? '<div class="big">'+fmtNum(ctx.kg,1)+'<small>kg</small></div>' : '<div class="big">—</div>';
  var popTxt = ctx.pop? popLabel(ctx.pop) : 'Enter an age or a weight';

  var rows='';
  function kv(k,v){ rows+='<dt>'+k+'</dt><dd>'+v+'</dd>'; }
  if(ctx.pop) kv('Population', esc(popTxt));
  var showPeri = ctx.gaLabel && (ctx.isPreterm || (ctx.ageDays!=null && ctx.ageDays < 28));
  if(showPeri) kv('Born at', esc(ctx.gaLabel)+' weeks'+(ctx.isPreterm?' <span class="flag f-est">PRETERM</span>':''));
  if(ctx.pmaWeeks!=null && showPeri){
    var pw=ctx.pmaWeeks, pwk=Math.floor(pw), pwd=Math.round((pw-pwk)*7); if(pwd===7){ pwk+=1; pwd=0; }
    kv('Postmenstrual age', pwk+'+'+pwd+' weeks'+(pwk<40?' <span class="flag f-info">still a '+(pw<30?'very preterm':pw<34?'preterm':pw<37?'late preterm':'term-pending')+' body</span>':''));
  }
  if(ctx.correctedDays!=null && ctx.isPreterm && ctx.correctedDays < 2*365.25 && showPeri)
    kv('Corrected age', Math.floor(ctx.correctedDays/30.44)+' months ('+ctx.correctedDays+' days)'+
       ' <span class="flag f-est">use this for growth &amp; development</span>');
  if(ctx.weightSource==='estimated'){
    (ctx.weightMethods||[]).forEach(function(m){
      if(m.v!=null) kv(m.k, fmtNum(m.v,1)+' kg');
    });
  }
  if(ctx.ibw!=null)  kv('Ideal BW (Devine)', fmtNum(ctx.ibw,1)+' kg');
  if(ctx.adjBW!=null)kv('Adjusted BW', fmtNum(ctx.adjBW,1)+' kg'+(ctx.obese?' <span class="flag f-info">obese</span>':''));
  if(ctx.bsa!=null)  kv('BSA (Mosteller)', fmtNum(ctx.bsa,2)+' m²');
  if(ctx.bsaHaycock!=null) kv('BSA (Haycock, <10 kg)', fmtNum(ctx.bsaHaycock,2)+' m²');
  if(ctx.crCl!=null) kv('CrCl (Cockcroft–Gault)', fmtNum(ctx.crCl,0)+' mL/min');
  if(ctx.eGFR!=null) kv('eGFR (bedside Schwartz)', fmtNum(ctx.eGFR,0)+' mL/min/1.73 m²');
  if(ctx.maint!=null)kv('Maintenance fluid (Holliday–Segar)', fmtNum(ctx.maint,0)+' mL/24 h = '+fmtNum(ctx.maint/24,1)+' mL/h');
  if(ctx.k!=null)    kv('Potassium deficit (to 4.0)', fmtNum(potassiumDeficit(ctx.k,ctx.kg||0),0)+' mmol');

  var warn='';
  if(ctx.weightSource==='estimated'){
    warn = '<div class="notebox" style="margin:8px 0 0"><ul><li>Weight is <b>ESTIMATED</b>. Every formula can err by 20–30%, worse at the extremes of age. Weigh the patient and re-enter as soon as possible. Maximum single and 24-hour dose caps are still enforced.</li></ul></div>';
  }
  if(!ctx.kg){
    warn = '<div class="warnbox" style="margin:8px 0 0"><ul><li>No weight available — weight-based doses cannot be calculated. Fixed adult doses are still shown.</li></ul></div>';
  }
  if(ctx.obese){
    warn += '<div class="infobox" style="margin:8px 0 0"><ul><li>Obesity detected (actual &gt;1.2 × ideal). Aminoglycosides and other hydrophilic drugs are automatically dosed on <b>adjusted</b> body weight; this is flagged on each affected card.</li></ul></div>';
  }
  if(ctx.crCl!=null && ctx.crCl<50){
    warn += '<div class="warnbox" style="margin:8px 0 0"><ul><li>CrCl '+fmtNum(ctx.crCl,0)+' mL/min — <b>renal dose adjustment required</b>. Loading doses of hydrophilic drugs are usually UNCHANGED; only the maintenance dose or interval changes. See the Renal Dose protocol.</li></ul></div>';
  }

  var waMsg = ctx.weightAgeMsg;
  if(waMsg){
    warn += '<div class="warnbox" style="margin:8px 0 0"><ul><li><b>⚠ WEIGHT–AGE MISMATCH — possible decimal-point error.</b> '+esc(waMsg)+'</li></ul></div>';
  }
  if(ctx.scopeMsg){
    warn = '<div class="warnbox" style="margin:0 0 8px"><ul><li><b>⚠ OUTSIDE THIS CALCULATOR.</b> '+esc(ctx.scopeMsg)+
      ' No dose is estimated for this patient, and none is shown in the list.</li></ul></div>' + warn;
  }

  $('#ctxOut').innerHTML =
     '<div class="cap">Dosing weight '+wFlag+'</div>'+big+
     '<div class="rng">'+(ctx.weightSource==='estimated'
        ? 'Estimation method: '+esc((ctx.isPreterm && ctx.pmaWeeks!=null && ctx.pmaWeeks<40)
            ? 'Fenton preterm reference, by postmenstrual age' : wMethodLabel(p.wMethod))
        : 'Use this weight for every calculation below')+'</div>'+
     '<dl class="kv">'+rows+'</dl>'+warn;

  /* header meta */
  $('#metaCtx').innerHTML = ctx.kg!=null
     ? '<b>'+fmtNum(ctx.kg,1)+' kg</b> · '+esc(ctx.pop?popLabel(ctx.pop):'age not entered')+(ctx.crCl!=null?' · CrCl '+fmtNum(ctx.crCl,0):'')
     : 'No patient entered';

  return ctx;
}
function wMethodLabel(m){
  return m==='who'?'WHO median weight-for-age ('+(ST.pt.sex==='female'?'girls':'boys')+')'
       : m==='apls'?'APLS formula ((2×age)+8 / (3×age)+7)'
       : 'Luscombe & Owens ((3×age)+7)';
}

/* ------------------------------------------------------------------ */
/* rendering: one drug card                                           */
/* ------------------------------------------------------------------ */
function routeClass(r){
  if(!r) return '';
  r=String(r).toLowerCase();
  if(r.indexOf('iv')>=0) return 'iv';
  if(r.indexOf('po')>=0||r.indexOf('oral')>=0||r.indexOf('sl')>=0) return 'po';
  if(r.indexOf('im')>=0) return 'im';
  if(r.indexOf('neb')>=0||r.indexOf('inh')>=0) return 'neb';
  if(r.indexOf('sc')>=0) return 'sc';
  if(r.indexOf('pr')>=0||r.indexOf('pv')>=0) return 'pr';
  return '';
}
function riskLabel(rk){
  return rk>=5?'HIGH-ALERT · ISMP':rk===4?'HIGH RISK':rk===3?'CAUTION':rk===2?'STANDARD':'LOW RISK';
}

function truncStr(s, n){
  s=String(s==null?'':s);
  return s.length>n? s.slice(0,n-1)+'…' : s;
}
/* the one line a clinician needs before expanding anything: for the entered
   weight, the amount and the volume to draw from the strength the unit uses */
function pickItem(reg, out){
  var its=(out.items||[]).filter(function(i){
    return i.mode==='conc'||i.mode==='direct'||i.mode==='fixed';
  });
  if(!its.length) return null;
  var hl=its.filter(function(i){ return i.fx&&i.fx.hl; })[0];
  if(hl) return hl;
  var iv=its.filter(function(i){ return /IV|IO/.test((i.fx&&i.fx.r)||''); })[0];
  return iv||its[0];
}
function summaryLine(reg, out, ctx){
  if(!out) return '—';
  if(!out.ok) return esc(truncStr(out.doseText||out.error||'no computable dose',120));
  var it=pickItem(reg,out), s=[];
  if(ctx.kg!=null) s.push(fmtNum(ctx.kg,1)+' kg →');
  if(!it){ s.push(esc(truncStr((out.dose&&out.dose.text)||out.doseText||'',120))); return s.join(' '); }
  var solid = it.form==='solid';
  var dose = fmtNum(it.doseAmtLo)+
    (it.doseAmtHi!=null && Math.abs(it.doseAmtHi-it.doseAmtLo)>1e-9 ? '–'+fmtNum(it.doseAmtHi) : '')+
    ' '+esc(it.doseUnit);
  if(out.kind==='rate' && it.mlPerHrLo!=null){
    s.push('<b>'+fmtVol(it.mlPerHrLo)+
      (it.mlPerHrHi!=null&&Math.abs(it.mlPerHrHi-it.mlPerHrLo)>1e-9?'–'+fmtVol(it.mlPerHrHi):'')+
      ' mL/h</b> of '+fmtNum(it.conc)+' '+esc(it.concUnit)+'/mL');
  } else if(it.volLo!=null && !solid){
    s.push(dose+' = <b>'+fmtVol(it.volLo)+
      (it.volHi!=null&&Math.abs(it.volHi-it.volLo)>1e-9?'–'+fmtVol(it.volHi):'')+' '+esc(it.perUnit)+'</b>'+
      ' of '+fmtNum(it.conc)+' '+esc(it.concUnit)+'/mL');
  } else if(it.volLo!=null && solid){
    s.push(dose+' = <b>'+fmtNum(it.volLo)+
      (it.volHi!=null&&Math.abs(it.volHi-it.volLo)>1e-9?'–'+fmtNum(it.volHi):'')+
      ' '+esc(it.perUnit==='unit'?'dosage unit':it.perUnit)+'</b>');
    if(it.fractional) s.push('<span class="sumwarn">part of a unit — prefer a liquid</span>');
  } else if(it.give){
    s.push('<b>'+esc(it.give)+'</b>');
  } else {
    s.push(esc(truncStr((out.dose&&out.dose.text)||'',120)));
  }
  if(it.needsDilution) s.push('<span class="sumwarn">dilute first (&lt;0.1 mL)</span>');
  if(out.capApplied) s.push('<span class="sumwarn">cap applied</span>');
  var tf=(out.alerts||[]).filter(function(a){ return a.indexOf('TEN-FOLD')===0; }).length;
  if(tf) s.push('<span class="sumwarn">⚠ '+tf+' ten-fold check'+(tf>1?'s':'')+'</span>');
  return s.join(' ');
}

function renderCard(reg, ctx){
  var dw = dosingWeightFor(reg, ctx);
  var lctx = {kg:dw.kg, dosingWeight:dw.kg, ageDays:ctx.ageDays, pop:ctx.pop};
  ctxRef.kg = dw.kg;
  var out = computeRegimen(reg, lctx);

  var open = ST.expand.has(reg.id);
  var rk = reg.risk||1;
  var h = [];
  h.push('<article class="card risk'+rk+(ST.fav.has(reg.id)?' pinned':'')+'" data-id="'+esc(reg.id)+'">');

  /* ---- header ---- */
  var badges='';
  if(reg.pop && reg.pop!=='all') badges+='<span class="bdg b-age">'+esc(reg.pop==='neo'?'NEONATE':reg.pop==='paed'?'PAEDIATRIC':'ADULT')+'</span>';
  if(reg.pop==='all') badges+='<span class="bdg b-age">ALL AGES</span>';
  badges+='<span class="bdg b-risk">'+esc(riskLabel(rk))+'</span>';
  var routes={}; (reg.fx||[]).forEach(function(f){ if(f.r) routes[f.r]=1; });
  Object.keys(routes).slice(0,4).forEach(function(r){ badges+='<span class="bdg b-route '+routeClass(r)+'">'+esc(r)+'</span>'; });
  if(reg.inf) badges+='<span class="bdg b-same">INFUSION</span>';
  if(dw.label!=='actual body weight') badges+='<span class="bdg b-same">'+esc(dw.label)+'</span>';
  h.push('<div class="ch"><div style="min-width:0;flex:1"><div class="nm">'+esc(reg.n)+'</div>'+
         '<div class="ind">'+esc(reg.ind||'')+'</div><div class="badges">'+badges+'</div></div>'+
         '<button class="star'+(ST.fav.has(reg.id)?' on':'')+'" data-fav="'+esc(reg.id)+'" '+
         'aria-pressed="'+ST.fav.has(reg.id)+'" title="Pin this drug to the top of its system">★</button></div>');

  /* ---- dose ---- */
  h.push('<div class="dose">');
  if(out.error && !out.ok && !out.dose && !out.doseText){
    h.push('<div class="dl">Dose</div><div class="dv" style="color:var(--crit);font-size:14px">'+esc(out.error)+'</div>');
  } else if(out.kind==='text'){
    h.push('<div class="dl">Dose / regimen</div><div class="dv" style="font-size:13.5px;line-height:1.4">'+esc(out.doseText)+'</div>');
  } else {
    h.push('<div class="dl">Calculated dose '+(dw.kg!=null&&out.prescribed&&out.prescribed.indexOf('kg')>=0?'for '+fmtNum(dw.kg,1)+' kg':'')+'</div>');
    h.push('<div class="dv">'+esc(out.dose.text)+(out.kind==='rate'?' <small>as prescribed; see pump rates below for mL/h</small>':'')+'</div>');
    if(out.prescribed && out.prescribed!==out.unit){
      h.push('<div class="dr">prescribed as <b>'+esc(out.dose.prescribedText||'')+'</b></div>');
    }
    if(out.dose && out.capApplied && out.capMsg){
      h.push('<div class="cap hit">⚠ '+esc(out.capMsg)+'</div>');
    } else if(reg.d && (reg.d.cap!=null||reg.d.capDay!=null||reg.d.capKg!=null||reg.d.capDayKg!=null)){
      var caps=[], du=out.dtU||out.unit||'';
      if(reg.d.cap!=null) caps.push('max single '+fmtNum(reg.d.cap)+' '+du);
      if(reg.d.capKg!=null) caps.push('max single '+fmtNum(reg.d.capKg)+' '+du+'/kg'+(dw.kg?' = '+fmtNum(reg.d.capKg*dw.kg)+' '+du:''));
      if(reg.d.capDay!=null) caps.push('max '+fmtNum(reg.d.capDay)+' '+du+'/24 h');
      if(reg.d.capDayKg!=null) caps.push('max '+fmtNum(reg.d.capDayKg)+' '+du+'/kg/24 h'+(dw.kg?' = '+fmtNum(reg.d.capDayKg*dw.kg)+' '+du:''));
      h.push('<div class="cap">Ceiling enforced: '+esc(caps.join(' · '))+'</div>');
    }
    if(reg.d && reg.d.rep) h.push('<div class="dr">'+esc(reg.d.rep)+'</div>');
  }
  h.push('</div>');

  /* ---- ten-fold / look-alike alerts: visible even when collapsed ---- */
  if(out.alerts && out.alerts.length){
    h.push('<div class="notebox warn" style="margin:9px 0 0"><ul>'+
      out.alerts.map(function(a){ return '<li>'+esc(a)+'</li>'; }).join('')+'</ul></div>');
  }

  /* ---- formulations & pump rates, collapsed behind the answer line ---- */
  h.push('<details class="fxdet" data-id="'+esc(reg.id)+'"'+(open?' open':'')+'>'+
         '<summary>'+summaryLine(reg,out,ctx)+' · <span style="opacity:.7">all strengths</span></summary>'+
         '<div class="fxbody">');
  var items = out.items||[];
  if(items.length){
    h.push('<table class="fx"><thead><tr><th>Formulation available in India</th><th>Concentration</th><th style="text-align:right">Volume / quantity to give</th><th>Route</th></tr></thead><tbody>');
    items.forEach(function(it){
      var f=it.fx;
      var trc = f.hl?' class="hl"':'';
      var concTxt = (it.mode==='info'||it.mode==='na') && f.c==null ? '—' : fmtNum(f.c)+' '+esc(f.u)+(it.form==='solid'?' per '+esc(it.perUnit):'/mL');
      var volTxt;
      if(it.mode==='conc'||it.mode==='direct'){
        volTxt = '<span class="vol'+(it.volLo>=1?' big':'')+'">'+fmtVol(it.volLo)+(it.volHi!=null&&Math.abs(it.volHi-it.volLo)>1e-9?'–'+fmtVol(it.volHi):'')+'</span> '+esc(it.perUnit);
        if(it.form==='solid') volTxt += ' <span class="syr">'+esc(it.perUnit==='unit'?'dosage unit':it.perUnit)+'</span>';
        if(it.needsDilution) volTxt += ' <span class="syr" title="below the reliably measurable 0.1 mL">⚠ dilute</span>';
        if(it.fractional) volTxt += ' <span class="syr" title="a fraction of one dosage unit">⚠ part unit</span>';
      } else if(it.mode==='fixed'){
        volTxt = '<span class="na" style="font-style:normal">'+esc(it.give||'—')+'</span>';
      } else if(it.mode==='na'){
        volTxt = '<span class="na">not applicable</span>';
      } else {
        volTxt = '<span class="na">—</span>';
      }
      h.push('<tr'+trc+'><td><span class="str">'+esc(f.s)+'</span>'+
             (f.p?'<div class="pack">'+esc(f.p)+'</div>':'')+
             (f.b?'<div class="brand">'+esc(f.b)+'</div>':'')+
             (f.prep?'<div class="pack"><b>Prep:</b> '+esc(f.prep)+'</div>':'')+
             '</td><td class="mono">'+concTxt+'</td>'+
             '<td style="text-align:right">'+volTxt+(it.label&&it.mode!=='fixed'?'<div class="pack">'+esc(it.label)+'</div>':'')+'</td>'+
             '<td><span class="bdg b-route '+routeClass(f.r)+'">'+esc(f.r||'—')+'</span></td></tr>');
      if(it.dilAdvice || it.fracAdvice){
        h.push('<tr'+trc+'><td colspan="4"><div class="notebox'+(it.needsDilution||it.fractional?' warn':'')+'" style="margin:0"><ul>'+
               (it.dilAdvice?'<li><b>Dilute before drawing:</b> '+esc(it.dilAdvice)+'</li>':'')+
               (it.fracAdvice?'<li><b>Not measurable as supplied:</b> '+esc(it.fracAdvice)+'</li>':'')+
               '</ul></div></td></tr>');
      }
      if(it.mode==='na' && it.reason){
        h.push('<tr'+trc+'><td colspan="4"><div class="pack">'+esc(it.reason)+'</div></td></tr>');
      }
    });
    h.push('</tbody></table>');
  }

  /* ---- standard dilutions + pump rates ---- */
  var diln = reg.diln||[];
  if(diln.length || (out.pump&&out.pump.length)){
    h.push('<div class="infx"><div class="ih">💧 Standard dilution &amp; pump rate'+(dw.kg!=null?' for '+fmtNum(dw.kg,1)+' kg':'')+'</div>');
    if(out.infNote) h.push('<div class="pack" style="margin-bottom:5px">'+esc(out.infNote)+'</div>');
    if(out.pump && out.pump.length){
      h.push('<table><thead><tr><th>Preparation</th><th>Concentration</th><th>Pump rate</th><th>Bag lasts</th></tr></thead><tbody>');
      out.pump.forEach(function(pp){
        h.push('<tr><td>'+esc(pp.l)+(pp.bag?'<div class="pack">'+esc(pp.bag)+'</div>':'')+'</td>'+
          '<td class="mono">'+fmtNum(pp.concPerMl)+' '+esc(pp.concUnit)+'</td>'+
          '<td><b>'+fmtVol(pp.mlPerHrLo)+'–'+fmtVol(pp.mlPerHrHi)+' mL/h</b><div class="pack">'+fmtVol(pp.mlPerMinLo)+'–'+fmtVol(pp.mlPerMinHi)+' mL/min</div></td>'+
          '<td class="mono">'+fmtNum(pp.bagHoursLo)+'–'+fmtNum(pp.bagHoursHi)+' h</td></tr>');
      });
      h.push('</tbody></table>');
      h.push('<div class="eq">mL/h = (dose × weight × 60 ÷ time-base) ÷ (drug amount ÷ bag volume) — verify by hand before programming the pump.</div>');
    } else if(diln.length){
      h.push('<table><thead><tr><th>Preparation</th><th>Concentration</th><th>Bag</th></tr></thead><tbody>');
      diln.forEach(function(pr){
        h.push('<tr><td>'+esc(pr.l||'')+'</td><td class="mono">'+(pr.amt!=null&&pr['in']?fmtNum(pr.amt/pr['in'])+' '+esc(pr.u||'')+'/mL':'—')+'</td><td>'+esc(pr.bag||'')+'</td></tr>');
      });
      h.push('</tbody></table>');
    }
    h.push('</div>');
  }
  h.push('</div></details>');

  /* ---- administration ---- */
  h.push('<div class="cbody">');
  if(reg.admin) h.push('<div class="sec"><b>Administration</b>'+esc(reg.admin)+'</div>');
  if(reg.dil)   h.push('<div class="sec"><b>Dilution &amp; compatibility</b>'+esc(reg.dil)+'</div>');
  h.push('<div class="sec"><b>Pharmacological class</b>'+esc(reg.cls||'—')+'</div>');
  h.push('</div>');

  /* ---- warnings / notes / info ---- */
  if(reg.warn && reg.warn.length){
    h.push('<div class="warnbox"><ul>'+reg.warn.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div>');
  }
  if(reg.notes && reg.notes.length){
    h.push('<div class="notebox"><ul>'+reg.notes.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div>');
  }
  if(reg.info && reg.info.length){
    h.push('<div class="infobox"><ul>'+reg.info.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div>');
  }

  /* ---- unit-risk cross-checks ---- */
  var ur = unitRiskCheck(reg, ctx);
  if(ur.length){
    h.push('<details class="moredet"><summary>⚖ Unit &amp; look-alike cross-check ('+ur.length+')</summary><div class="inner"><div class="notebox" style="margin:0"><ul>'+
      ur.map(function(w){return '<li>'+esc(w)+'</li>';}).join('')+'</ul></div></div></details>');
  }

  /* ---- high-alert double check ---- */
  if(rk>=4){
    h.push('<details class="moredet"'+(rk>=5?' open':'')+'><summary>✍ Independent double check'+(rk>=5?' — MANDATORY (high-alert drug)':' — required')+'</summary><div class="inner">'+
      '<div class="warnbox" style="margin:0"><ul><li>Two practitioners must <b>independently</b> verify: drug · strength · concentration · dose · dilution · rate · route · patient identity.</li>'+
      '<li>Confirm the ampoule/vial in hand matches the formulation row you used.</li>'+
      '<li>Read the volume back aloud and check it against the table above.</li></ul></div>'+
      '<table class="tbl"><tbody><tr><td style="width:50%">Prepared by (name / time)</td><td>Checked by (name / time)</td></tr>'+
      '<tr><td style="height:26px"></td><td></td></tr></tbody></table></div></details>');
  }

  /* ---- references ---- */
  var refs=(reg.ref||[]).filter(function(k){return REFS[k];});
  if(refs.length){
    h.push('<div class="refbox"><b>References</b> '+refs.map(function(k){
      return '<span class="tag refTag" data-ref="'+esc(k)+'" style="cursor:pointer">'+esc(REFS[k].n)+'</span>';
    }).join(' ')+'</div>');
  }
  h.push('</article>');
  return h.join('');
}

/* ------------------------------------------------------------------ */
/* rendering: drugs tab                                               */
/* ------------------------------------------------------------------ */
function renderChips(ctx){
  var counts={};
  REG.forEach(function(r){ if(childScope(r) && popVisible(r,ctx)) counts[r.sys]=(counts[r.sys]||0)+1; });
  var keys = Object.keys(SYS).filter(function(k){return counts[k];});
  var h=['<div class="chips no-print">'];
  h.push('<button class="chip" data-sys="__all__" aria-pressed="'+(ST.sys.size===0)+'">All systems <span class="n">'+keys.reduce(function(a,k){return a+counts[k];},0)+'</span></button>');
  keys.forEach(function(k){
    h.push('<button class="chip" data-sys="'+esc(k)+'" aria-pressed="'+ST.sys.has(k)+'">'+esc(SYS[k].short)+' <span class="n">'+counts[k]+'</span></button>');
  });
  h.push('</div>');
  return h.join('');
}
function renderToolbar(ctx){
  var classes={};
  REG.forEach(function(r){ if(childScope(r) && r.cls) classes[r.cls]=1; });
  var ck=Object.keys(classes).sort();
  return '<div class="toolbar no-print">'+
    '<div class="field grow search"><label for="q">Search drug, brand, indication</label>'+
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'+
      '<input id="q" type="text" value="'+esc(ST.q)+'" placeholder="e.g. adrenaline, amiodarone, Ceftriaxone, snakebite…" autocomplete="off"></div>'+
    '<div class="field"><label for="cls">Pharmacological class</label><select id="cls"><option value="">All classes ('+ck.length+')</option>'+
      ck.map(function(c){return '<option value="'+esc(c)+'"'+(ST.cls===c?' selected':'')+'>'+esc(c)+'</option>';}).join('')+'</select></div>'+
    '<div class="field"><label for="pop">Show population</label><select id="pop">'+
      [['','Auto (from age)'],['adult','Adolescent 16–18 y'],['paed','Child 1 mo–16 y'],['neo','Neonate <28 d']].map(function(o){
        return '<option value="'+o[0]+'"'+(ST.pop===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></div>'+
    '<div class="field"><label>&nbsp;</label><div style="display:flex;gap:6px">'+
      '<button class="chip risk" id="haOnly" aria-pressed="'+ST.highAlertOnly+'">High-alert only</button>'+
      '<button class="chip" id="favOnly" aria-pressed="'+ST.favOnly+'" title="Only the drugs you pinned">★ Pinned'+(ST.fav.size?' ('+ST.fav.size+')':'')+'</button>'+
      '<button class="chip" id="expAll">Expand all</button>'+
      '<button class="chip" id="colAll">Collapse</button>'+
    '</div></div>'+
  '</div>';
}
var TILES=[
  ['🫀','Adult cardiac arrest','adrenaline · amiodarone','p-arrest-adult'],
  ['🧒','Paediatric arrest','weight-first sequence','p-arrest-paed'],
  ['🌬️','Anaphylaxis','adrenaline IM, no delay','p-anaphylaxis'],
  ['🦠','Septic shock','first-hour antibiotics','p-septic-shock'],
  ['🩸','DKA','insulin only after K⁺ ≥3.3','p-dka'],
  ['⚡','Status epilepticus','benzo → second agent','p-status-epilepticus'],
  ['🐍','Snakebite','ASV dose & the 6-hour rule','p-snakebite'],
  ['☠️','OP poisoning','atropine to dry axillae','p-op-poisoning']];
function renderTiles(){
  if(ST.tilesOpen===false)
    return '<button class="chip no-print" id="tilesOpen" style="margin:0 0 9px">▸ Emergency shortcuts</button>';
  var h=['<div class="tiles no-print">'];
  TILES.forEach(function(t){
    h.push('<button class="tile" data-proto="'+t[3]+'"><span class="ti">'+t[0]+'</span>'+
      '<div class="tn">'+t[1]+'</div><div class="td">'+t[2]+'</div></button>');
  });
  h.push('<button class="tile" id="tilesClose" style="min-width:64px"><span class="ti">✕</span>'+
    '<div class="tn">Hide</div><div class="td">shortcuts</div></button>');
  h.push('</div>');
  return h.join('');
}
function renderFilterBar(){
  var items=[];
  if(ST.q.trim()) items.push(['q','search: '+ST.q.trim()]);
  ST.sys.forEach(function(s){ items.push(['sys:'+s, (SYS[s]&&SYS[s].label)||s]); });
  if(ST.cls) items.push(['cls','class: '+ST.cls]);
  if(ST.pop) items.push(['pop','population: '+ST.pop]);
  if(ST.highAlertOnly) items.push(['ha','high-alert only']);
  if(ST.favOnly) items.push(['fav','pinned only']);
  if(!items.length) return '';
  return '<div class="fbar no-print"><span class="fbl">Filters</span>'+
    items.map(function(i){ return '<button class="fb" data-clear="'+esc(i[0])+'">'+esc(i[1])+' <span class="x">✕</span></button>'; }).join('')+
    '<button class="fb" data-clear="*"><b>Clear all</b></button></div>';
}
function pushRecent(id){
  if(!id) return;
  ST.recent=[id].concat(ST.recent.filter(function(x){ return x!==id; })).slice(0,6);
  renderRecentInto();
  queueSave();
}
function recentHtml(){
  if(!ST.recent.length) return '';
  var h=['<div class="recentbar no-print" id="recentBar"><span class="rb">Recent</span>'];
  ST.recent.forEach(function(id){
    var r=null;
    for(var i=0;i<REG.length;i++) if(REG[i].id===id) r=REG[i];
    if(r) h.push('<button class="rc" data-open="'+esc(id)+'">🕘 '+esc(r.n)+'</button>');
  });
  h.push('<button class="rcx" id="rcClear">clear</button></div>');
  return h.join('');
}
function renderRecentInto(){
  var host=document.getElementById('recentSlot');
  if(host) host.outerHTML='<span id="recentSlot" style="display:contents">'+recentHtml()+'</span>';
  else {
    var bar=document.querySelector('.recentbar');
    if(bar) bar.outerHTML=recentHtml()||'<span id="recentSlot" style="display:contents"></span>';
  }
  $$('.recentbar .rc').forEach(function(b){
    b.addEventListener('click',function(){ openCardNow(b.getAttribute('data-open')); });
  });
  var cx=document.getElementById('rcClear');
  if(cx) cx.addEventListener('click',function(){ ST.recent=[]; renderRecentInto(); queueSave(); });
}
function renderDrugs(ctx){
  var list = visibleRegs(ctx);
  if(ctx.scopeMsg){
    var head=[renderToolbar(ctx), renderChips(ctx), renderFilterBar()];
    head.push('<div class="notebox warn" style="margin:9px 0"><b>Outside this calculator.</b> '+esc(ctx.scopeMsg)+
      '</div>');
    head.push('<div class="pack">No doses are shown, deliberately: a paediatric calculator that silently prints a number for an out-of-range patient is worse than one that refuses.</div>');
    return head.join('');
  }
  var h=[renderToolbar(ctx), renderChips(ctx),
    '<span id="recentSlot" style="display:contents">'+recentHtml()+'</span>',
    renderTiles(), renderFilterBar()];
  if(ctx.weightAgeMsg){
    h.push('<div class="notebox warn" style="margin:0 0 9px"><b>⚠ WEIGHT–AGE MISMATCH — possible decimal-point error.</b> '+esc(ctx.weightAgeMsg)+'</div>');
  }
  h.push('<div class="count"><b>'+list.length+'</b> regimen'+(list.length===1?'':'s')+' shown of '+REG.length+' · weight '+
     (ctx.kg!=null?fmtNum(ctx.kg,1)+' kg ('+ctx.weightSource+')':'not set')+' · '+(ctx.pop?esc(popLabel(ctx.pop)):'population not determined')+
     ' <span class="printonly">· printed '+new Date().toLocaleString()+'</span></div>');
  if(!list.length){
    h.push('<div class="empty"><b>No regimen matches these filters</b>Try clearing the search box, choosing “All systems”, or switching the population filter.</div>');
    return h.join('');
  }
  /* group by system in the canonical SYS order */
  var bySys={};
  list.forEach(function(r){ (bySys[r.sys]=bySys[r.sys]||[]).push(r); });
  Object.keys(SYS).forEach(function(k){
    if(!bySys[k]||!bySys[k].length) return;
    h.push('<section class="sysgroup"><h3>'+esc(SYS[k].label)+' <span class="cnt">'+bySys[k].length+'</span><span class="desc">'+esc(SYS[k].desc)+'</span></h3>');
    bySys[k].sort(function(a,b){ return (ST.fav.has(b.id)?1:0)-(ST.fav.has(a.id)?1:0); });
    h.push('<div class="grid">');
    bySys[k].forEach(function(r){ h.push(renderCard(r,ctx)); });
    h.push('</div></section>');
  });
  return h.join('');
}

/* ------------------------------------------------------------------ */
/* rendering: infusion pump tab                                       */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* rendering: continuous infusion — "mix & run" + the overview grid    */
/* ------------------------------------------------------------------ */
function perLabel(u, per){
  if(per==='kg/min') return u+'/kg/min';
  if(per==='kg/h')   return u+'/kg/h';
  if(per==='kg/day') return u+'/kg/day';
  if(per==='kg')     return u+'/kg';
  if(per==='min')    return u+'/min';
  if(per==='day')    return u+'/day';
  return u+'/h';
}
/* per-kg vs absolute, and minute/hour/day, so an ordered dose can be compared
   with the cited range even when the clinician chose a different basis      */

var MIX_UNITS = ['mg','mcg','g','units','IU','mmol','mEq'];
var MIX_PERS  = ['kg/min','kg/h','kg/day','min','h','day'];

function infusionList(ctx){
  return REG.filter(function(r){ return r.inf && childScope(r) && popVisible(r, ctx); });
}

/* the mix state seeds its defaults from the chosen drug the first time that
   drug is selected, so the panel always opens with a sane, cited starting
   point: the low end of the prescribed range and the unit's standard prep. */
function mixState(ctx){
  if(!ST.mix) ST.mix={};
  var m=ST.mix, list=infusionList(ctx);
  if(!m.id || !list.some(function(r){ return r.id===m.id; })) m.id=(list[0]||{}).id||'';
  var reg=null;
  for(var i=0;i<list.length;i++) if(list[i].id===m.id) reg=list[i];
  if(reg && m.regId!==reg.id){
    m.regId=reg.id;
    var dt=dtOf(reg.d.t);
    m.du=dt.u; m.per=dt.per;
    m.amt=(reg.d.lo!=null)? String(reg.d.lo) : '';
    m.mode=m.mode||'made';
    m.drugUnit=(reg.diln&&reg.diln[0]&&reg.diln[0].u)||'mg';
    if(reg.diln && reg.diln[0]){ m.drugAmt=String(reg.diln[0].amt); m.vol=String(reg.diln[0].in); }
    if(m.df==null) m.df=20;
    if(m.cont==null) m.cont=50;
  }
  return {reg:reg, m:m, list:list};
}

function mixUnitOptions(m, reg){
  var seen={}, opts=[];
  function add(u, per){
    var k=u+'|'+per;
    if(seen[k]) return;
    seen[k]=1;
    opts.push({u:u, per:per, l:perLabel(u, per)});
  }
  if(reg){ var dt=dtOf(reg.d.t); add(dt.u, dt.per); }
  MIX_UNITS.forEach(function(u){ MIX_PERS.forEach(function(p){ add(u, p); }); });
  return opts;
}

function renderMixPanel(ctx){
  var s=mixState(ctx), m=s.m, reg=s.reg;
  if(!reg) return '<div class="pack">No titrated infusion matches the current population filter.</div>';
  var dt=dtOf(reg.d.t);
  var h=['<div class="mixpanel"><div class="mph"><h3>Continuous infusion — mix &amp; run</h3>'+
    '<div class="mps">Say what you actually put in the syringe or bag. The app says back what each mL contains, what the pump must read, how long it lasts and what the patient receives.</div></div>',
    '<div class="mbody">'];

  /* ---- row 1: drug + ordered dose ---- */
  h.push('<div class="mgrid">');
  h.push('<div class="field"><label for="mxDrug">1 · Drug</label><select id="mxDrug">');
  var bySys={};
  s.list.forEach(function(r){ (bySys[r.sys]=bySys[r.sys]||[]).push(r); });
  Object.keys(bySys).forEach(function(sk){
    h.push('<optgroup label="'+esc((SYS[sk]&&SYS[sk].n)||sk)+'">');
    bySys[sk].forEach(function(r){
      h.push('<option value="'+esc(r.id)+'"'+(r.id===m.id?' selected':'')+'>'+esc(r.n)+(r.risk>=4?' ⚠':'')+'</option>');
    });
    h.push('</optgroup>');
  });
  h.push('</select><div class="pack" style="margin-top:6px">'+esc(reg.ind||'')+
         ((reg.risk||0)>=4?' <b class="hi">HIGH-ALERT</b>':'')+'</div></div>');

  h.push('<div class="field"><label for="mxAmt">2 · Ordered dose</label><div class="row">'+
    '<input id="mxAmt" type="number" step="any" min="0" inputmode="decimal" value="'+esc(m.amt||'')+'" style="max-width:120px">'+
    '<select id="mxPer">'+mixUnitOptions(m,reg).map(function(o){
      return '<option value="'+esc(o.u+'|'+o.per)+'"'+(o.u===m.du&&o.per===m.per?' selected':'')+'>'+esc(o.l)+'</option>';
    }).join('')+'</select></div>');
  h.push('<div class="chips" style="margin-top:6px">');
  if(reg.d.lo!=null && reg.d.hi!=null){
    var mid=(reg.d.lo+reg.d.hi)/2;
    [[reg.d.lo,'low'],[mid,'mid'],[reg.d.hi,'high']].forEach(function(c){
      h.push('<button class="chip mxrange" data-v="'+c[0]+'">'+fmtNum(c[0])+' '+esc(perLabel(dt.u,dt.per))+' · '+c[1]+'</button>');
    });
  }
  h.push('</div>');
  h.push('<div class="pack" style="margin-top:6px">Guideline range: <b>'+esc(reg.d.rep ||
      (reg.d.lo!=null ? fmtNum(reg.d.lo)+'–'+fmtNum(reg.d.hi)+' '+perLabel(dt.u,dt.per) : 'see the drug card'))+'</b></div>');
  h.push('</div></div>');

  /* ---- row 2: the preparation ---- */
  h.push('<div class="mgrid">');
  h.push('<div class="field"><label>3 · The preparation in the line</label>'+
    '<div class="seg" id="mxMode" role="group"><button data-m="made" aria-pressed="'+(m.mode==='made')+'">I made it</button>'+
    '<button data-m="label" aria-pressed="'+(m.mode==='label')+'">The label says</button></div>');
  h.push('<div class="row" id="mxMadeRow" style="'+(m.mode==='made'?'':'display:none')+'margin-top:7px">'+
    '<input id="mxDrugAmt" type="number" step="any" min="0" inputmode="decimal" placeholder="drug amount" value="'+esc(m.drugAmt||'')+'" style="max-width:110px">'+
    '<select id="mxDrugUnit">'+MIX_UNITS.map(function(u){ return '<option'+(u===m.drugUnit?' selected':'')+'>'+esc(u)+'</option>'; }).join('')+'</select>'+
    '<span class="inl">in</span><input id="mxVol" type="number" step="any" min="0" inputmode="decimal" placeholder="final mL" value="'+esc(m.vol||'')+'" style="max-width:100px"><span class="inl">mL</span></div>');
  h.push('<div class="row" id="mxLabelRow" style="'+(m.mode==='label'?'':'display:none')+'margin-top:7px">'+
    '<input id="mxConcC" type="number" step="any" min="0" inputmode="decimal" placeholder="concentration" value="'+esc(m.concC||'')+'" style="max-width:120px">'+
    '<select id="mxConcU">'+MIX_UNITS.map(function(u){ return '<option'+(u===(m.concU||m.drugUnit)?' selected':'')+'>'+esc(u)+'/mL</option>'; }).join('')+'</select></div>');
  if(reg.diln && reg.diln.length){
    h.push('<div class="chips" style="margin-top:7px">');
    reg.diln.forEach(function(d,i){
      h.push('<button class="chip mxpre" data-i="'+i+'" title="'+esc(d.bag||'')+'">'+esc(d.l)+'</button>');
    });
    h.push('</div>');
  }
  h.push('</div>');

  /* ---- row 2b: patient, giving set, container ---- */
  h.push('<div class="field"><label>4 · Patient &amp; delivery</label>');
  var kg=(ctx.kg!=null)? ctx.kg : null;
  h.push('<div class="row"><span class="inl">Weight</span>');
  if(kg!=null) h.push('<b class="mono">'+fmtNum(kg,1)+' kg</b><span class="inl">('+esc(popLabel(ctx.pop))+')</span>');
  else h.push('<input id="mxWt" type="number" step="any" min="0" inputmode="decimal" placeholder="kg" style="max-width:90px">');
  h.push('</div>');
  h.push('<div class="row" style="margin-top:7px"><span class="inl">Giving set</span><select id="mxDf">'+
    [20,15,10,60].map(function(f){ return '<option value="'+f+'"'+(f===m.df?' selected':'')+'>'+f+' gtt/mL'+(f===60?' (micro)':'')+'</option>'; }).join('')+
    '</select></div>');
  h.push('<div class="row" style="margin-top:7px"><span class="inl">Container</span><select id="mxCont">'+
    [20,30,50,100,250,500].map(function(v){ return '<option value="'+v+'"'+(v===m.cont?' selected':'')+'>'+v+' mL</option>'; }).join('')+
    '</select></div>');
  h.push('<div class="row" style="margin-top:7px"><span class="inl">Pump steps</span><select id="mxStep" title="the rate resolution your pump can hold">'+
    [[0.01,'0.01 mL/h (precision syringe pump)'],[0.05,'0.05 mL/h'],[0.1,'0.1 mL/h (typical syringe pump)'],[0.5,'0.5 mL/h'],[1,'1 mL/h (volumetric pump)']]
      .map(function(v){ return '<option value="'+v[0]+'"'+(v[0]===ST.step?' selected':'')+'>'+esc(v[1])+'</option>'; }).join('')+
    '</select></div>');
  h.push('</div></div>');

  /* ---- the answer ---- */
  h.push('<div class="conc-line" id="mxConcLine">—</div>');
  h.push('<div id="mxOut"></div>');
  h.push('</div></div>');
  return h.join('');
}

function mixCompute(ctx){
  var s=mixState(ctx), m=s.m, reg=s.reg;
  if(!reg) return null;
  var kg=(ctx.kg!=null)? ctx.kg : (m.wt? num(m.wt) : null);
  var o={ doseAmt:num(m.amt), doseUnit:m.du, per:m.per, kg:kg,
          dripFactor:m.df, containerMl:m.cont };
  if(m.mode==='label'){ o.concC=num(m.concC); o.concU=(m.concU||m.drugUnit); }
  else { o.drugAmt=num(m.drugAmt); o.drugUnit=m.drugUnit; o.totalVol=num(m.vol); }
  var r=infusionCalc(o);
  r.reg=reg; r.kg=kg; r.du=m.du; r.per=m.per; r.m=m;
  return r;
}

function mixOutHtml(r){
  if(!r) return '<div class="pack">No infusion selected.</div>';
  if(!r.ok) return '<div class="notebox warn"><b>Cannot compute yet.</b> '+esc(r.err||'')+'</div>';
  var reg=r.reg, dt=dtOf(reg.d.t), h=[];
  /* headline: what each mL holds */
  var pl=(r.perMl||[]).map(function(p,i){
    return (i===0? '<b>'+fmtNum(p.v)+' '+esc(p.u)+'</b>' : fmtNum(p.v)+' '+esc(p.u));
  }).join('  =  ');
  /* hero rate */
  h.push('<div class="rate-hero"><div class="rh">'+fmtNum(r.mlPerHr)+' <small>mL/h</small></div>'+
    '<div class="rs">'+fmtNum(r.mlPerMin,2)+' mL/min'+
    (r.gttPerMin!=null? ' · <b>'+fmtNum(r.gttPerMin,0)+' gtt/min</b> at '+r.m.df+' gtt/mL (gravity only — pump preferred)':'')+
    '</div></div>');
  h.push('<table class="tbl" style="margin-top:8px"><tbody>');
  h.push('<tr><td>Each 1 mL of this preparation contains</td><td class="n b">'+pl+'</td></tr>');
  h.push('<tr><td>Program the pump</td><td class="n b">'+fmtNum(r.mlPerHr)+' mL/h</td></tr>');
  if(r.hoursLast!=null){
    var hh=Math.floor(r.hoursLast), mm=Math.round((r.hoursLast-hh)*60);
    if(mm===60){ hh+=1; mm=0; }
    h.push('<tr><td>The '+r.containerMl+' mL container lasts</td><td class="n">'+hh+' h '+mm+' min at this rate</td></tr>');
  }
  /* what the pump can actually hold at its step resolution */
  var bd=deliverBand(r.mlPerHr, ST.step, r.concPerMl, r.kg);
  if(bd){
    var oLo=doseInBasis(bd.amtLo, r.du, reg, r.kg), oHi=doseInBasis(bd.amtHi, r.du, reg, r.kg);
    h.push('<tr><td>The pump can hold '+bd.mlLo.toFixed(2)+'–'+bd.mlHi.toFixed(2)+' mL/h, so the dose is</td><td class="n">'+
      (oLo&&oHi? '<b>'+fmtNum(oLo.v,4)+'–'+fmtNum(oHi.v,4)+'</b> '+esc(oLo.u+'/'+(oLo.per.indexOf('kg')===0? 'kg'+oLo.per.slice(2):oLo.per))+' (' : '')+
      fmtNum(bd.amtLo,4)+'–'+fmtNum(bd.amtHi,4)+' '+r.du+'/h'+(oLo&&oHi?')':'')+
      ' <span class="'+(bd.coarse?'sumwarn':'syr')+'">±'+fmtNum(bd.halfPct,1)+' %</span></td></tr>');
    if(bd.coarse) h.push('<tr><td colspan="2"><div class="notebox warn">The pump\'s '+bd.step+' mL/h steps are ±'+
      fmtNum(bd.halfPct,1)+' % of the dose at '+fmtNum(r.mlPerHr)+' mL/h — the pump, not the arithmetic, is limiting accuracy. Use a more concentrated preparation so the rate lands on a higher number.</div></td></tr>');
  }
  var d=r.deliver;
  h.push('<tr><td>Patient receives</td><td class="n">'+
    (r.kg? fmtNum(d.perKgMin,3)+' '+r.du+'/kg/min · '+fmtNum(d.perKgHr,3)+' '+r.du+'/kg/h · ':'')+
    fmtNum(d.amtPerHr,2)+' '+r.du+'/h · '+fmtNum(d.amtPerDay,1)+' '+r.du+'/24 h</td></tr>');
  h.push('</tbody></table>');

  /* range check against the cited guideline range, converting bases where
     the conversion is exact (same mass family, per-kg vs per-kg, min/h/day) */
  if(reg.d.lo!=null && reg.d.hi!=null){
    var v=num(r.m.amt), vb=null, note='';
    if(v!=null){
      var u2=convertUnit(v, r.du, dt.u);
      if(u2!=null && comparablePer(r.per, dt.per)){
        var f=perFactor(r.per, dt.per);
        if(f!=null){ vb=u2*f; }
        if(r.du!==dt.u || r.per!==dt.per) note=' — your '+fmtNum(v)+' '+perLabel(r.du,r.per)+' = '+fmtNum(vb)+' '+perLabel(dt.u,dt.per);
      }
    }
    if(vb!=null){
      if(vb<reg.d.lo) h.push('<div class="notebox"><b>Below the usual range</b> '+fmtNum(reg.d.lo)+'–'+fmtNum(reg.d.hi)+' '+esc(perLabel(dt.u,dt.per))+note+'. Confirm the indication before running it slower.</div>');
      else if(vb>reg.d.hi) h.push('<div class="notebox warn"><b>Above the usual range</b> '+fmtNum(reg.d.lo)+'–'+fmtNum(reg.d.hi)+' '+esc(perLabel(dt.u,dt.per))+note+'. A second clinician must confirm this dose before it runs.</div>');
      else h.push('<div class="notebox ok" style="background:var(--ok-soft);border-color:#bfe3cf"><b>Within the cited range</b> '+fmtNum(reg.d.lo)+'–'+fmtNum(reg.d.hi)+' '+esc(perLabel(dt.u,dt.per))+note+'.</div>');
    } else if(v!=null){
      h.push('<div class="pack">Prescribed basis is '+esc(perLabel(dt.u,dt.per))+' — you are ordering in '+esc(perLabel(r.du,r.per))+', which is not an exact conversion. Convert and confirm against the drug card.</div>');
    }
  }
  (r.checks||[]).forEach(function(c){
    h.push('<div class="notebox'+(c.level==='warn'?' warn':'')+'">'+esc(c.msg)+'</div>');
  });
  h.push('<div class="row" style="margin-top:10px"><button class="btn sm" id="mxPrintLbl">Print line label</button>'+
    '<button class="btn sm openCard" data-id="'+esc(reg.id)+'" style="margin-left:8px">Open full drug card →</button></div>');
  h.push('<div class="lbl" id="mxLbl" style="margin-top:10px">'+labelHtml(r)+'</div>');
  return h.join('');
}

function labelHtml(r){
  var reg=r.reg;
  var when=new Date();
  function two(n){ return (n<10?'0':'')+n; }
  var pl=(r.perMl||[]).map(function(p){ return fmtNum(p.v)+' '+p.u; }).join(' = ');
  return '<table><tbody>'+
   '<tr><td style="width:38%"><b>DRUG</b></td><td>'+esc(reg.n)+'</td></tr>'+
   '<tr><td><b>PREPARATION</b></td><td>'+esc(r.m.mode==='label'
        ? (fmtNum(r.m.concC)+' '+(r.m.concU||r.m.drugUnit)+'/mL')
        : (fmtNum(r.m.drugAmt)+' '+r.m.drugUnit+' in '+fmtNum(r.m.vol)+' mL'))+'</td></tr>'+
   '<tr><td><b>EACH 1 mL CONTAINS</b></td><td>'+esc(pl)+'</td></tr>'+
   '<tr><td><b>RATE</b></td><td>'+fmtNum(r.mlPerHr)+' mL/h'+(r.gttPerMin!=null?'  ('+fmtNum(r.gttPerMin,0)+' gtt/min at '+r.m.df+'/mL)':'')+'</td></tr>'+
   '<tr><td><b>DOSE</b></td><td>'+esc(fmtNum(num(r.m.amt))+' '+perLabel(r.du,r.per))+(r.kg?' for '+fmtNum(r.kg,1)+' kg':'')+'</td></tr>'+
   '<tr><td><b>STARTED</b></td><td>'+two(when.getDate())+'/'+two(when.getMonth()+1)+'/'+when.getFullYear()+' '+two(when.getHours())+':'+two(when.getMinutes())+' &nbsp;&nbsp; <b>PREPARED BY</b> ____________ &nbsp; <b>CHECKED BY</b> ____________</td></tr>'+
   '</tbody></table>';
}

function revOut(){
  var cl=$('#rvConcLine'), out=$('#rvOut');
  if(!cl || !out) return;
  var r=revCompute(buildCtx());
  if(r && r.ok){
    cl.innerHTML='Each <b>1 mL</b> contains '+
      (r.perMl||[]).map(function(p,i){ return (i===0?'<b>'+fmtNum(p.v)+' '+esc(p.u)+'</b>':fmtNum(p.v)+' '+esc(p.u)); }).join(' = ');
  } else {
    cl.innerHTML='—';
  }
  out.innerHTML=revOutHtml(r);
  var tb=$('#rvToBoard');
  if(tb) tb.onclick=null;   /* the handler is bound in wirePumpModes */
  wireInnerExtras();
  queueSave();
}
/* re-bind the buttons that only exist after a partial re-render */
function wireInnerExtras(){
  var tb=$('#rvToBoard');
  if(tb && !tb._wired){
    tb._wired=true;
    tb.addEventListener('click', function(){
      var s=revState(buildCtx()), r=s.r;
      var out=revCompute(buildCtx());
      if(!out || !out.ok){ toast('Work out a rate first'); return; }
      addBoardLine({ id:r.id, mode:r.mode, amt:r.drugAmt, drugUnit:r.drugUnit, vol:r.vol, concC:r.concC, concU:r.concU,
        rate:r.rate, cont:r.cont, wt:r.wt, orderLo:r.orderLo, orderHi:r.orderHi, orderUnit:r.orderUnit, orderPer:r.orderPer,
        label:out.reg.n });
      ST.pumpMode='board'; renderContent(); wireInner(); toast('Line added to the board');
    });
  }
  $$('#rvOut .openCard, #content .openCard').forEach(function(b){
    if(b._wired) return; b._wired=true;
    b.addEventListener('click', function(){ openCardNow(b.getAttribute('data-id')); });
  });
}

function mixOut(){
  var ctx=buildCtx();
  var r=mixCompute(ctx);
  var cl=$('#mxConcLine'), out=$('#mxOut');
  if(cl){
    if(r && r.ok){
      cl.innerHTML='Each <b>1 mL</b> contains '+
        (r.perMl||[]).map(function(p,i){ return (i===0?'<b>'+fmtNum(p.v)+' '+esc(p.u)+'</b>':fmtNum(p.v)+' '+esc(p.u)); }).join(' = ')+
        ' of '+esc(r.reg.n)+'.';
    } else {
      cl.innerHTML='<b>Enter the preparation</b> — how much drug, in how many mL (or the concentration on the label).';
    }
  }
  if(out) out.innerHTML=mixOutHtml(r);
  var pb=$('#mxPrintLbl');
  if(pb) pb.addEventListener('click', function(){
    var pa=$('#lblPrintArea');
    if(pa && r && r.ok){
      pa.innerHTML='<h2 style="margin:0 0 8px">Infusion line label</h2>'+labelHtml(r);
      document.body.classList.add('lbl-only');
      var done=function(){ document.body.classList.remove('lbl-only'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      window.print();
      setTimeout(done, 4000);
    }
  });
  queueSave();
  var oc=out? out.querySelector('.openCard') : null;
  if(oc) oc.addEventListener('click', function(){
    ST.tab='drugs'; ST.expand=new Set([oc.dataset.id]); pushRecent(oc.dataset.id); renderAll();
    var el=document.querySelector('.card[data-id="'+oc.dataset.id+'"]');
    scrollToEl(el,'start');
  });
}

var PUMP_MODES=[['mix','Mix &amp; run','work out a new infusion'],['rev','Check a running line','rate on the pump → what the patient is getting'],['board','Line board','every line in one handover table']];
function renderPumpTabs(){
  return '<div class="pumptabs no-print" role="tablist">'+
    PUMP_MODES.map(function(m){
      return '<button role="tab" data-pm="'+m[0]+'" title="'+esc(m[2])+'" aria-selected="'+(ST.pumpMode===m[0])+'">'+
        (ST.pumpMode===m[0]?'<b>':'')+m[1]+(ST.pumpMode===m[0]?'</b>':'')+'</button>';
    }).join('')+'</div>';
}
function revState(ctx){
  if(!ST.rev) ST.rev={};
  var r=ST.rev, list=infusionList(ctx);
  if(!r.id || !list.some(function(x){ return x.id===r.id; })) r.id=(list[0]||{}).id||'';
  var reg=null;
  for(var i=0;i<list.length;i++) if(list[i].id===r.id) reg=list[i];
  if(reg && r.regId!==reg.id){
    r.regId=reg.id;
    var dt=dtOf(reg.d.t);
    r.orderUnit=dt.u; r.orderPer=dt.per;
    r.orderLo=(reg.d.lo!=null)?String(reg.d.lo):''; r.orderHi=(reg.d.hi!=null)?String(reg.d.hi):'';
    r.drugUnit=(reg.diln&&reg.diln[0]&&reg.diln[0].u)||'mg';
    if(reg.diln&&reg.diln[0]){ r.drugAmt=String(reg.diln[0].amt); r.vol=String(reg.diln[0].in); }
    else { r.drugAmt=''; r.vol=''; }
    if(r.rate==null) r.rate='';
    if(r.cont==null) r.cont=50;
    if(r.mode!=='label') r.mode='made';
  }
  return {reg:reg, r:r, list:list};
}
function revCompute(ctx){
  var s=revState(ctx), r=s.r, reg=s.reg;
  if(!reg) return null;
  var kg=(ctx.kg!=null)? ctx.kg : (num(r.wt)||null);
  var o={ mlPerHr:num(r.rate), kg:kg, step:ST.step, dripFactor:r.df, containerMl:num(r.cont) };
  if(r.mode==='label'){ o.concC=num(r.concC); o.concU=(r.concU||r.drugUnit); }
  else { o.drugAmt=num(r.drugAmt); o.drugUnit=r.drugUnit; o.totalVol=num(r.vol); }
  var oLo=num(r.orderLo), oHi=num(r.orderHi);
  if(oLo!=null && oHi!=null){ o.orderLo=oLo; o.orderHi=oHi; o.orderUnit=r.orderUnit; o.orderPer=r.orderPer; }
  var out=reverseCheck(o);
  out.reg=reg; out.kg=kg; out.r=r; out.step=ST.step;
  return out;
}
function renderReverse(ctx){
  var s=revState(ctx), r=s.r, reg=s.reg;
  var h=['<div class="mixpanel"><div class="mixhead"><h2>Check a running line</h2>'+
    '<div class="pack">Read the rate off the pump and the preparation off the bag — this says what the patient is actually receiving, and flags it when that is not the ordered dose.</div></div>'];
  h.push('<div class="mixbody"><div class="field"><label for="rvDrug">1 · Drug</label><select id="rvDrug">'+
    s.list.map(function(x){ return '<option value="'+esc(x.id)+'"'+(x.id===r.id?' selected':'')+'>'+esc(x.n)+'</option>'; }).join('')+
    '</select></div>');
  h.push('<div class="field"><label for="rvRate">2 · Rate displayed on the pump (mL/h)</label><div class="row">'+
    '<input id="rvRate" type="number" step="any" min="0" inputmode="decimal" value="'+esc(r.rate||'')+'" style="max-width:130px" placeholder="e.g. 5.25">'+
    '</div></div>');
  h.push('<div class="field"><label>3 · What the container holds</label>'+
    '<div class="seg" id="rvMode" role="group"><button data-m="made" aria-pressed="'+(r.mode!=='label')+'">Amount in volume</button>'+
    '<button data-m="label" aria-pressed="'+(r.mode==='label')+'">Ready-made label</button></div>');
  h.push('<div class="row" id="rvMadeRow" style="'+(r.mode!=='label'?'':'display:none')+'margin-top:7px">'+
    '<input id="rvAmt" type="number" step="any" min="0" inputmode="decimal" placeholder="drug amount" value="'+esc(r.drugAmt||'')+'" style="max-width:110px">'+
    '<select id="rvUnit">'+MIX_UNITS.map(function(u){ return '<option'+(u===r.drugUnit?' selected':'')+'>'+esc(u)+'</option>'; }).join('')+'</select>'+
    '<span class="inl">in</span><input id="rvVol" type="number" step="any" min="0" inputmode="decimal" placeholder="final mL" value="'+esc(r.vol||'')+'" style="max-width:100px">'+
    '<span class="inl">mL</span></div>');
  h.push('<div class="row" id="rvLabelRow" style="'+(r.mode==='label'?'':'display:none')+'margin-top:7px">'+
    '<input id="rvConcC" type="number" step="any" min="0" inputmode="decimal" placeholder="concentration" value="'+esc(r.concC||'')+'" style="max-width:120px">'+
    '<select id="rvConcU">'+MIX_UNITS.map(function(u){ return '<option'+(u===(r.concU||r.drugUnit)?' selected':'' )+'>'+esc(u)+'/mL</option>'; }).join('')+'</select></div>');
  h.push('<div class="row" style="margin-top:7px"><span class="inl">Container</span><select id="rvCont">'+
    [20,30,50,100,250,500].map(function(v){ return '<option value="'+v+'"'+(v===r.cont?' selected':'')+'>'+v+' mL</option>'; }).join('')+'</select>'+
    '<span class="inl">Weight</span>');
  if(ctx.kg!=null) h.push('<b>'+fmtNum(ctx.kg,1)+' kg</b> <span class="pack">(from the patient panel)</span>');
  else h.push('<input id="rvWt" type="number" step="any" min="0" inputmode="decimal" placeholder="kg" value="'+esc(r.wt||'')+'" style="max-width:90px">');
  h.push('</div>');
  h.push('<div class="field" style="margin-top:9px"><label>4 · The order the patient is on — optional, but this is what makes it a check</label><div class="row">'+
    '<input id="rvLo" type="number" step="any" min="0" inputmode="decimal" value="'+esc(r.orderLo||'')+'" style="max-width:96px" placeholder="low">'+
    '<span class="inl">–</span><input id="rvHi" type="number" step="any" min="0" inputmode="decimal" value="'+esc(r.orderHi||'')+'" style="max-width:96px" placeholder="high">'+
    '<select id="rvOU">'+MIX_UNITS.map(function(u){ return '<option'+(u===r.orderUnit?' selected':'')+'>'+esc(u)+'</option>'; }).join('')+'</select>'+
    '<select id="rvOP">'+MIX_PERS.map(function(p){ return '<option value="'+esc(p)+'"'+(p===r.orderPer?' selected':'')+'>per '+esc(perLabel('',p).replace(/^\/\s*/,''))+'</option>'; }).join('')+'</select>'+
    '</div></div>');
  h.push('</div><div class="mixout"><div class="conc-line" id="rvConcLine">—</div><div id="rvOut"></div></div></div>');
  return h.join('');
}

function revOutHtml(r){
  if(!r) return '<div class="pack">No infusion selected.</div>';
  if(!r.ok) return '<div class="notebox warn"><b>Cannot check yet.</b> '+esc(r.err||'')+'</div>';
  var reg=r.reg, h=[];
  var pl=(r.perMl||[]).map(function(p,i){ return (i===0?'<b>'+fmtNum(p.v)+' '+esc(p.u)+'</b>':fmtNum(p.v)+' '+esc(p.u)); }).join('  =  ');
  h.push('<div class="rate-hero"><div class="rh">'+fmtNum(r.mlPerHr)+' <small>mL/h</small></div><div class="rs">'+
    fmtNum(r.mlPerMin,2)+' mL/min on the pump'+(r.gttPerMin!=null?' · '+fmtNum(r.gttPerMin,0)+' gtt/min at '+r.r.df+' gtt/mL':'')+'</div></div>');
  h.push('<table class="tbl" style="margin-top:8px"><tbody>');
  h.push('<tr><td>Each 1 mL of this preparation contains</td><td class="n b">'+pl+'</td></tr>');
  var dsp=doseInBasis(r.deliver.amtPerHr, r.du, reg, r.kg);
  h.push('<tr><td><b>The patient is receiving</b></td><td class="n b">'+
    (dsp? '<span style="font-size:15px">'+esc(doseStr(dsp,4))+'</span><br>':'')+
    (r.kg&&!dsp? fmtNum(r.deliver.perKgMin,4)+' '+r.du+'/kg/min · '+fmtNum(r.deliver.perKgHr,4)+' '+r.du+'/kg/h<br>':'')+
    fmtNum(r.deliver.amtPerHr,3)+' '+r.du+'/h · '+fmtNum(r.deliver.amtPerDay,2)+' '+r.du+'/24 h</td></tr>');
  if(r.band){
    var bLo=doseInBasis(r.band.amtLo, r.du, reg, r.kg), bHi=doseInBasis(r.band.amtHi, r.du, reg, r.kg);
    h.push('<tr><td>Pump steps of '+r.band.step+' mL/h deliver</td><td class="n">'+r.band.mlLo.toFixed(2)+'–'+r.band.mlHi.toFixed(2)+' mL/h'+
      (bLo&&bHi? ' → '+fmtNum(bLo.v,4)+'–'+fmtNum(bHi.v,4)+' '+esc(bLo.u+'/'+(bLo.per.indexOf('kg')===0? 'kg'+bLo.per.slice(2):bLo.per)):'')+
      ' <span class="'+(r.band.coarse?'sumwarn':'syr')+'">±'+fmtNum(r.band.halfPct,1)+' %</span></td></tr>');
  }
  if(r.hoursLast!=null){
    var hh=Math.floor(r.hoursLast), mm=Math.round((r.hoursLast-hh)*60);
    if(mm===60){ hh+=1; mm=0; }
    h.push('<tr><td>The '+r.containerMl+' mL container empties</td><td class="n">in '+hh+' h '+mm+' min</td></tr>');
  }
  h.push('</tbody></table>');
  if(r.verdict){
    var cls = r.verdict.state==='within' ? 'notebox ok' : 'notebox warn';
    var tt  = r.verdict.state==='within' ? '✓ Matches the order' : (r.verdict.state==='above'?'⚠ Faster than the order':'⚠ Slower than the order');
    h.push('<div class="'+cls+'"'+(r.verdict.state==='within'?' style="background:var(--ok-soft);border-color:#bfe3cf"':'')+
      '><b>'+tt+'</b> '+esc(r.verdict.msg)+'</div>');
  } else if(r.reg.d.lo!=null){
    h.push('<div class="pack">Cited range for this drug: '+fmtNum(r.reg.d.lo)+'–'+fmtNum(r.reg.d.hi)+' '+esc(perLabel(dtOf(r.reg.d.t).u, dtOf(r.reg.d.t).per))+
      '. Enter the order above to have the rate checked against it.</div>');
  }
  (r.checks||[]).forEach(function(c){ h.push('<div class="notebox'+(c.level==='warn'?' warn':'')+'">'+esc(c.msg)+'</div>'); });
  h.push('<div class="row" style="margin-top:10px"><button class="btn sm" id="rvToBoard">Add this line to the board →</button>'+
    '<button class="btn sm openCard" data-id="'+esc(reg.id)+'" style="margin-left:8px">Open full drug card →</button></div>');
  return h.join('');
}

/* a delivered amount per hour, re-expressed in the unit and basis the
   guideline cites for that drug (mcg/kg/min, mg/h, units/kg/h …), so what the
   pump delivers can be read straight against the order without mental maths */
function doseInBasis(amtPerHr, fromU, reg, kg){
  if(amtPerHr==null || !reg || !reg.d) return null;
  var dt=dtOf(reg.d.t);
  var v=convertUnit(amtPerHr, fromU, dt.u);
  if(v==null) return null;
  var pt=perTime(dt.per);
  if(pt<0) return null;
  if(pt===0){                      /* per kg, no time base: a total dose */
    if(kg==null) return null;
    var tot=convertUnit(amtPerHr, fromU, dt.u);
    return tot==null? null : {v:tot/kg, u:dt.u, per:'kg'};
  }
  var out=v*(pt/60);               /* per hour -> per the cited time base */
  if(dt.per.indexOf('kg')===0){ if(kg==null) return null; out=out/kg; }
  return {v:out, u:dt.u, per:dt.per};
}
function doseStr(d, dp){
  if(!d) return null;
  return fmtNum(d.v, dp==null?3:dp)+' '+d.u+'/'+(d.per.indexOf('kg')===0? 'kg'+d.per.slice(2) : d.per);
}

/* ---------------- the line board ----------------
   Every infusion running on the patient in one table: what is in the line,
   what each mL holds, the rate, the dose that rate delivers, what the order
   was, how long the container lasts and when it needs changing. Persisted
   with the session, printable for handover.                              */
function boardLine(ctx, line){
  var list=infusionList(ctx);
  var reg=null;
  for(var i=0;i<list.length;i++) if(list[i].id===line.id) reg=list[i];
  if(!reg) for(var j=0;j<REG.length;j++) if(REG[j].id===line.id) reg=REG[j];
  if(!reg) return null;
  var kg=(ctx.kg!=null)? ctx.kg : (num(line.wt)||null);
  var o={ mlPerHr:num(line.rate), kg:kg, step:ST.step, containerMl:num(line.cont) };
  if(line.mode==='label'){ o.concC=num(line.concC); o.concU=(line.concU||line.drugUnit); }
  else { o.drugAmt=num(line.amt); o.drugUnit=line.drugUnit; o.totalVol=num(line.vol); }
  var oLo=num(line.orderLo), oHi=num(line.orderHi);
  if(oLo!=null && oHi!=null){ o.orderLo=oLo; o.orderHi=oHi; o.orderUnit=line.orderUnit; o.orderPer=line.orderPer; }
  var out=reverseCheck(o);
  out.reg=reg; out.kg=kg; out.line=line;
  return out;
}
function boardDefaults(reg){
  var dt=reg? dtOf(reg.d.t) : {u:'mcg',per:'kg/min'};
  return { id:reg?reg.id:'', amt:(reg&&reg.diln&&reg.diln[0])?String(reg.diln[0].amt):'',
    drugUnit:(reg&&reg.diln&&reg.diln[0]&&reg.diln[0].u)||'mg',
    vol:(reg&&reg.diln&&reg.diln[0])?String(reg.diln[0].in):'', rate:'', cont:50, mode:'made',
    orderLo:(reg&&reg.d.lo!=null)?String(reg.d.lo):'', orderHi:(reg&&reg.d.hi!=null)?String(reg.d.hi):'',
    orderUnit:dt.u, orderPer:dt.per, label:(reg?reg.n:'')+' '+(dt.u==='units'?'U':'')+dt.u+'/'+dt.per };
}
function renderBoard(ctx){
  var h=['<div class="mixpanel"><div class="mixhead"><h2>Line board</h2>'+
    '<div class="pack">Every infusion running on this patient, with the dose each rate actually delivers and how long each container lasts. Filled from the check above, or add a line by hand. Nothing is stored anywhere but this device.</div></div>'];
  h.push('<div class="mixbody"><div class="row"><span class="inl">Add a line</span><select id="bdDrug">'+
    infusionList(ctx).map(function(x){ return '<option value="'+esc(x.id)+'">'+esc(x.n)+'</option>'; }).join('')+
    '</select><button class="btn sm" id="bdAdd" style="margin-left:8px">+ Add</button>'+
    (ST.board.length? '<button class="btn sm" id="bdPrint" style="margin-left:8px">Print handover sheet</button>'+
      '<button class="btn sm" id="bdClear" style="margin-left:8px">Clear all</button>' : '')+
    '</div>');
  if(!ST.board.length){
    h.push('<div class="pack" style="margin-top:10px">No lines yet. Add one above, or work a line out under <b>Mix &amp; run</b> and use “Add this line to the board”.</div>');
    h.push('</div></div>');
    return h.join('');
  }
  var tot=0, out=[];
  h.push('</div>');   /* the body closes; the table goes full width */
  h.push('<div class="boardwrap"><table class="board"><thead><tr>'+
    '<th>Line</th><th>Preparation</th><th class="n">Rate</th><th class="n">Dose received</th><th>Order</th><th class="n">Left in container</th><th></th></tr></thead>'+
    '<tbody id="boardRows">');
  ST.board.forEach(function(line, i){
    var o=boardLine(ctx, line);
    tot += (num(line.rate)||0);
    h.push('<tr'+((o&&o.verdict&&o.verdict.state!=='within')?' class="flag"':'')+'>');
    if(!o || !o.ok){
      h.push('<td><b>'+esc(line.label||line.id)+'</b></td>');
      h.push('<td class="pack" colspan="2">'+esc((o&&o.err)||'cannot compute this line')+
        '<input class="bdin" data-b="rate" data-i="'+i+'" type="number" step="any" min="0" inputmode="decimal" value="'+esc(line.rate||'')+'" placeholder="mL/h" aria-label="rate"></td>');
      h.push('<td class="n bdose">—</td>');
      h.push('<td class="pack" colspan="2">set the preparation and the rate to see the dose</td>');
      h.push('<td><button class="x" data-bdel="'+i+'" title="remove">✕</button></td></tr>');
      return;
    }
    out.push(o);
    var pl=(o.perMl||[]).map(function(p){ return fmtNum(p.v)+' '+p.u; }).join(' = ');
    var tleft = (o.hoursLast!=null)? (function(){
      var hh=Math.floor(o.hoursLast), mm=Math.round((o.hoursLast-hh)*60); if(mm===60){hh+=1;mm=0;}
      return hh+' h '+mm+' min';
    })() : '—';
    var orderTxt = (o.verdict||o.expect)
      ? fmtNum(num(line.orderLo))+'–'+fmtNum(num(line.orderHi))+' '+esc(perLabel(line.orderUnit,line.orderPer))
      : '<span class="pack">not entered</span>';
    h.push('<td><b>'+esc(o.reg.n)+'</b>'+(o.verdict&&o.verdict.state==='within'?' <span class="tickok" title="matches the order">✓</span>':
        (o.verdict?' <span class="tickbad" title="does not match the order">⚠</span>':''))+'</td>');
    h.push('<td class="mono" style="font-size:12px">'+esc(pl)+'<div class="pack">'+
      (line.mode==='label'? fmtNum(num(line.concC))+' '+(line.concU||'')+'/mL'
        : fmtNum(num(line.amt))+' '+esc(line.drugUnit||'')+' in '+fmtNum(num(line.vol))+' mL')+'</div></td>');
    h.push('<td class="n">'+fmtNum(num(line.rate))+' mL/h<div class="pack">'+fmtNum(num(line.rate)/60,3)+' mL/min</div>'+
      '<input class="bdin" data-b="rate" data-i="'+i+'" type="number" step="any" min="0" inputmode="decimal" value="'+esc(line.rate||'')+'" placeholder="mL/h" aria-label="rate"></td>');
    var dspB=doseInBasis(o.deliver.amtPerHr, o.du, o.reg, o.kg);
    h.push('<td class="n bdose">'+(dspB? '<b>'+esc(doseStr(dspB,4))+'</b><div class="pack">'+fmtNum(o.deliver.amtPerHr,3)+' '+o.du+'/h</div>'
      : (o.kg? fmtNum(o.deliver.perKgMin,4)+' '+o.du+'/kg/min<div class="pack">'+fmtNum(o.deliver.perKgHr,3)+' '+o.du+'/kg/h</div>'
        : fmtNum(o.deliver.amtPerHr,3)+' '+o.du+'/h'))+'</td>');
    h.push('<td>'+orderTxt+'</td>');
    h.push('<td class="n bleft">'+tleft+'<div class="pack">'+fmtNum(num(line.cont))+' mL</div></td>');
    h.push('<td><button class="x" data-bdel="'+i+'" title="remove this line">✕</button></td>');
    h.push('</tr>');
  });
  h.push('</tbody><tfoot><tr><td colspan="2"><b>Total fluid running</b></td><td class="n b">'+fmtNum(tot,2)+' mL/h</td>'+
    '<td colspan="4" class="pack">'+(ctx.kg!=null? fmtNum(tot/ctx.kg,2)+' mL/kg/h — check this against the maintenance allowance and the fluid balance chart': 'enter a weight to see mL/kg/h')+'</td></tr></tfoot></table>');
  h.push('<div class="pack no-print" style="margin-top:8px">Printing gives a handover sheet: one row per line, with the rate, the dose received, the order and the time to changeover.</div>');
  h.push('</div>');
  ST.boardOut = out;
  return h.join('');
}
function boardSheet(ctx){
  var rows=ST.board.map(function(line){ return boardLine(ctx, line); }).filter(function(o){ return o && o.ok; });
  var tot=ST.board.reduce(function(s,l){ return s+(num(l.rate)||0); }, 0);
  var when=new Date();
  function two(n){ return (n<10?'0':'')+n; }
  var h=['<table><tbody><tr><td colspan="5" style="font-size:15px"><b>INFUSION HANDOVER SHEET</b> — '+
    (ctx.kg!=null? fmtNum(ctx.kg,1)+' kg': 'no weight entered')+' · printed '+two(when.getDate())+'/'+two(when.getMonth()+1)+'/'+when.getFullYear()+' at '+two(when.getHours())+':'+two(when.getMinutes())+'</td></tr>',
    '<tr><td><b>LINE</b></td><td><b>EACH 1 mL CONTAINS</b></td><td><b>RATE</b></td><td><b>DOSE RECEIVED</b></td><td><b>ORDER / CHANGE DUE</b></td></tr>'];
  rows.forEach(function(o){
    var tleft = (o.hoursLast!=null)? (function(){ var hh=Math.floor(o.hoursLast), mm=Math.round((o.hoursLast-hh)*60); if(mm===60){hh+=1;mm=0;} return hh+' h '+mm+' min'; })() : '—';
    h.push('<tr><td>'+esc(o.reg.n)+'</td><td>'+esc((o.perMl||[]).map(function(p){ return fmtNum(p.v)+' '+p.u; }).join(' = '))+'</td>'+
      '<td>'+fmtNum(o.mlPerHr)+' mL/h</td><td>'+esc(doseStr(doseInBasis(o.deliver.amtPerHr,o.du,o.reg,o.kg),4)||'')+'<br>'+fmtNum(o.deliver.amtPerHr,2)+' '+o.du+'/h</td>'+
      '<td>'+(o.verdict? fmtNum(num(o.line.orderLo))+'–'+fmtNum(num(o.line.orderHi))+' '+esc(perLabel(o.line.orderUnit,o.line.orderPer)):'—')+
      (o.verdict&&o.verdict.state!=='within'?' <b>⚠ '+esc(o.verdict.state==='above'?'FAST':'SLOW')+'</b>':'')+
      '<br>changes in '+tleft+'</td></tr>');
  });
  h.push('<tr><td colspan="5"><b>Total</b> '+fmtNum(tot,2)+' mL/h'+(ctx.kg!=null? ' = '+fmtNum(tot/ctx.kg,2)+' mL/kg/h':'')+
    ' · line-by-line check by ______________  /  confirmed by ______________</td></tr></tbody></table>');
  return h.join('');
}

function renderPump(ctx){
  var h=['<div class="mixwrap">'];
  h.push(renderPumpTabs());
  if(ST.pumpMode==='rev'){ h.push(renderReverse(ctx)); h.push('</div>'); return h.join(''); }
  if(ST.pumpMode==='board'){ h.push(renderBoard(ctx)); h.push('</div>'); return h.join(''); }
  h.push(renderMixPanel(ctx));
  var inf=infusionList(ctx);
  h.push('<div class="count"><b>'+inf.length+'</b> titrated infusions · the table under each drug cross-checks the rate for every standard preparation.</div>');
  h.push('<div class="utilgrid">');
  inf.forEach(function(r){
    var dw=dosingWeightFor(r,ctx);
    ctxRef.kg=dw.kg;
    var out=computeRegimen(r,{kg:dw.kg,dosingWeight:dw.kg,pop:ctx.pop,ageDays:ctx.ageDays});
    h.push('<div class="utile"><h3>'+esc(r.n)+'</h3><div class="ub">');
    h.push('<div class="pack">'+esc(r.ind||'')+'</div>');
    h.push('<div class="dose" style="padding:8px 0;background:transparent;border:0"><div class="dl">Prescribed range</div><div class="dv" style="font-size:16px">'+esc(out.dose?out.dose.prescribedText||out.dose.text:'')+'</div></div>');
    if(out.pump&&out.pump.length){
      h.push('<table class="tbl"><thead><tr><th>Preparation</th><th class="n">Conc.</th><th class="n">mL/h</th><th class="n">mL/min</th></tr></thead><tbody>');
      out.pump.forEach(function(pp){
        h.push('<tr><td>'+esc(pp.l)+'</td><td class="n mono">'+fmtNum(pp.concPerMl)+' '+esc(pp.concUnit)+'</td>'+
               '<td class="n b">'+fmtVol(pp.mlPerHrLo)+'–'+fmtVol(pp.mlPerHrHi)+'</td>'+
               '<td class="n mono">'+fmtVol(pp.mlPerMinLo)+'–'+fmtVol(pp.mlPerMinHi)+'</td></tr>');
      });
      h.push('</tbody></table>');
    } else {
      h.push('<div class="pack">Loading/bolus dose — the maintenance infusion rate is described in the administration note on the drug card.</div>');
    }
    if(out.dose&&out.dose.text) h.push('<div class="pack" style="margin-top:6px">Computed for <b>'+(dw.kg!=null?fmtNum(dw.kg,1)+' kg':'—')+'</b>: '+esc(out.dose.text)+'</div>');
    h.push('<button class="btn sm openCard" data-id="'+esc(r.id)+'" style="margin-top:7px">Open full drug card →</button>');
    h.push('</div></div>');
  });
  h.push('</div></div>');
  return h.join('');
}

function wirePump(){
  var s=mixState(buildCtx()), m=s.m;
  var sel=$('#mxDrug');
  if(sel) sel.addEventListener('change', function(){
    m.id=sel.value; m.regId=null;         /* force re-seed for the new drug */
    renderContent(); wireInner();
    var s2=$('#mxDrug'); if(s2){ s2.focus(); }
    mixOut();
  });
  var amt=$('#mxAmt');
  if(amt) amt.addEventListener('input', function(){ m.amt=amt.value; mixOut(); });
  var per=$('#mxPer');
  if(per) per.addEventListener('change', function(){
    var p=per.value.split('|'); m.du=p[0]; m.per=p[1]; mixOut();
  });
  $$('#mxMode button').forEach(function(b){
    b.addEventListener('click', function(){
      m.mode=b.dataset.m;
      $$('#mxMode button').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
      var made=$('#mxMadeRow'), lab=$('#mxLabelRow');
      if(made) made.style.display=(m.mode==='made'?'':'none');
      if(lab) lab.style.display=(m.mode==='label'?'':'none');
      mixOut();
    });
  });
  [['#mxDrugAmt','drugAmt'],['#mxVol','vol'],['#mxConcC','concC']].forEach(function(pair){
    var el=$(pair[0]);
    if(el) el.addEventListener('input', function(){ m[pair[1]]=el.value; mixOut(); });
  });
  var du=$('#mxDrugUnit');
  if(du) du.addEventListener('change', function(){ m.drugUnit=du.value; mixOut(); });
  var cu=$('#mxConcU');
  if(cu) cu.addEventListener('change', function(){ m.concU=cu.value; mixOut(); });
  $$('.mxpre').forEach(function(b){
    b.addEventListener('click', function(){
      var reg=s.reg; if(!reg||!reg.diln) return;
      var d=reg.diln[+b.dataset.i]; if(!d) return;
      m.mode='made'; m.drugAmt=String(d.amt); m.drugUnit=d.u||'mg'; m.vol=String(d.in);
      var a=$('#mxDrugAmt'), v=$('#mxVol'), u=$('#mxDrugUnit');
      if(a) a.value=m.drugAmt; if(v) v.value=m.vol; if(u) u.value=m.drugUnit;
      var made=$('#mxMadeRow'), lab=$('#mxLabelRow');
      if(made) made.style.display=''; if(lab) lab.style.display='none';
      $$('#mxMode button').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.m==='made')); });
      mixOut();
    });
  });
  $$('.mxrange').forEach(function(b){
    b.addEventListener('click', function(){
      m.amt=b.dataset.v;
      var a=$('#mxAmt'); if(a) a.value=m.amt;
      mixOut();
    });
  });
  var df=$('#mxDf');
  if(df) df.addEventListener('change', function(){ m.df=+df.value; mixOut(); });
  var ct=$('#mxCont');
  if(ct) ct.addEventListener('change', function(){ m.cont=+ct.value; mixOut(); });
  var wt=$('#mxWt');
  if(wt) wt.addEventListener('input', function(){
    ST.pt.wt=wt.value; renderPatient(); mixOut();
  });
  var st=$('#mxStep');
  if(st) st.addEventListener('change', function(){ ST.step=+st.value; mixOut(); queueSave(); });
  mixOut();
}

/* live updates for the two new pump sub-modes */
function wirePumpModes(){
  /* --- the mode switch itself --- */
  $$('.pumptabs button').forEach(function(b){
    b.addEventListener('click',function(){
      var pm=b.getAttribute('data-pm');
      if(ST.pumpMode===pm) return;
      ST.pumpMode=pm; queueSave();
      renderContent(); wireInner();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });

  /* --- check a running line --- */
  if(ST.pumpMode==='rev'){
    var s=revState(buildCtx()), r=s.r;
    var bind=function(id, fn){ var el=$('#'+id); if(el) el.addEventListener('input', function(){ fn(el.value); revOut(); }); };
    var bindC=function(id, fn){ var el=$('#'+id); if(el) el.addEventListener('change', function(){ fn(el.value); revOut(); }); };
    var dsel=$('#rvDrug');
    if(dsel) dsel.addEventListener('change', function(){
      r.id=dsel.value; r.regId=null; renderContent(); wireInner(); var d=$('#rvDrug'); if(d) d.focus(); revOut();
    });
    bind('rvRate',   function(v){ r.rate=v; });
    bind('rvAmt',    function(v){ r.drugAmt=v; });
    bind('rvVol',    function(v){ r.vol=v; });
    bind('rvConcC',  function(v){ r.concC=v; });
    bind('rvWt',     function(v){ r.wt=v; });
    bind('rvLo',     function(v){ r.orderLo=v; });
    bind('rvHi',     function(v){ r.orderHi=v; });
    bindC('rvUnit',  function(v){ r.drugUnit=v; });
    bindC('rvConcU', function(v){ r.concU=v; });
    bindC('rvOU',    function(v){ r.orderUnit=v; });
    bindC('rvOP',    function(v){ r.orderPer=v; });
    bindC('rvCont',  function(v){ r.cont=+v; });
    $$('#rvMode button').forEach(function(b){
      b.addEventListener('click', function(){
        r.mode=b.getAttribute('data-m');
        $$('#rvMode button').forEach(function(x){ x.setAttribute('aria-pressed', String(x===b)); });
        var mr=$('#rvMadeRow'), lr=$('#rvLabelRow');
        if(mr) mr.style.display = (r.mode==='label')?'none':'';
        if(lr) lr.style.display = (r.mode==='label')?'':'none';
        revOut();
      });
    });
    var tb=$('#rvToBoard');
    if(tb) tb.addEventListener('click', function(){
      var out=revCompute(buildCtx());
      if(!out || !out.ok){ toast('Work out a rate first'); return; }
      addBoardLine({
        id:r.id, mode:r.mode, amt:r.drugAmt, drugUnit:r.drugUnit, vol:r.vol, concC:r.concC, concU:r.concU,
        rate:r.rate, cont:r.cont, wt:r.wt, orderLo:r.orderLo, orderHi:r.orderHi, orderUnit:r.orderUnit, orderPer:r.orderPer,
        label:out.reg.n
      });
      ST.pumpMode='board';
      renderContent(); wireInner();
      toast('Line added to the board');
    });
    revOut();
  }

  /* --- the line board --- */
  if(ST.pumpMode==='board'){
    var add=$('#bdAdd');
    if(add) add.addEventListener('click', function(){
      var sel=$('#bdDrug'); if(!sel) return;
      var reg=null;
      for(var i=0;i<REG.length;i++) if(REG[i].id===sel.value) reg=REG[i];
      if(!reg) return;
      var ctx=buildCtx(), line=boardDefaults(reg);
      /* start the line at the low end of the cited range in the standard
         preparation, so the row is meaningful the moment it appears */
      var dt=dtOf(reg.d.t);
      var kg=(ctx.kg!=null)? ctx.kg : num(line.wt);
      var fwd=infusionCalc({ doseAmt:reg.d.lo, doseUnit:dt.u, per:dt.per, kg:kg,
        drugAmt:num(line.amt), drugUnit:line.drugUnit, totalVol:num(line.vol), containerMl:num(line.cont) });
      line.rate = (fwd && fwd.ok)? String(Math.round(fwd.mlPerHr*100)/100) : '';
      addBoardLine(line);
      toast(fwd && fwd.ok? 'Line added at the low end of the range ('+line.rate+' mL/h) — edit as needed' : 'Line added — enter its rate');
      renderContent(); wireInner();
    });
    $$('button[data-bdel]').forEach(function(b){
      b.addEventListener('click', function(){
        var i=+b.getAttribute('data-bdel');
        ST.board.splice(i,1); queueSave();
        renderContent(); wireInner();
      });
    });
    /* each line's fields are editable in place */
    $$('.board input[data-b]').forEach(function(el){
      el.addEventListener('input', function(){
        var i=+el.getAttribute('data-i'), k=el.getAttribute('data-b');
        if(!ST.board[i]) return;
        ST.board[i][k]=el.value;
        queueSave();
        boardRefresh();
      });
    });
    var bp=$('#bdPrint');
    if(bp) bp.addEventListener('click', function(){
      var pa=$('#lblPrintArea');
      if(pa){
        pa.innerHTML=boardSheet(buildCtx());
        document.body.classList.add('lbl-only');
        var done=function(){ document.body.classList.remove('lbl-only'); window.removeEventListener('afterprint', done); };
        window.addEventListener('afterprint', done);
        setTimeout(function(){ try{ window.print(); }catch(_){ done(); } },80);
      }
    });
    var bc=$('#bdClear');
    if(bc) bc.addEventListener('click', function(){
      ST.board=[]; queueSave(); renderContent(); wireInner(); toast('Board cleared');
    });
    /* live total without a full re-render, so typing in a cell is not lost */
    ST.boardOut=ST.board.map(function(line){ return boardLine(buildCtx(), line); });
  }
}
function addBoardLine(line){
  if(!ST.board) ST.board=[];
  ST.board.push(line);
  if(ST.board.length>8) ST.board.shift();
  queueSave();
}
/* re-render only the computed cells of the board while the user types */
function boardRefresh(){
  var ctx=buildCtx();
  $$('#boardRows tr').forEach(function(tr, i){
    var o=boardLine(ctx, ST.board[i]); if(!o) return;
    var cell=tr.querySelector('.bdose');
    var dspR=o.ok? doseInBasis(o.deliver.amtPerHr, o.du, o.reg, o.kg) : null;
    if(cell && o.ok) cell.innerHTML = (dspR? '<b>'+esc(doseStr(dspR,4))+'</b><div class="pack">'+fmtNum(o.deliver.amtPerHr,3)+' '+o.du+'/h</div>'
      : (o.kg? fmtNum(o.deliver.perKgMin,4)+' '+o.du+'/kg/min<div class="pack">'+fmtNum(o.deliver.perKgHr,3)+' '+o.du+'/kg/h</div>'
        : fmtNum(o.deliver.amtPerHr,3)+' '+o.du+'/h'));
    var lc=tr.querySelector('.bleft');
    if(lc) lc.innerHTML = (o.ok && o.hoursLast!=null)? (function(){
      var hh=Math.floor(o.hoursLast), mm=Math.round((o.hoursLast-hh)*60); if(mm===60){hh+=1;mm=0;}
      return hh+' h '+mm+' min<div class="pack">'+fmtNum(num(o.line.cont))+' mL</div>';
    })() : '—';
    tr.classList.toggle('flag', !!(o.ok && o.verdict && o.verdict.state!=='within'));
  });
  var tf=document.querySelector('.board tfoot td.n b');
  if(tf) tf.textContent = fmtNum(ST.board.reduce(function(s,l){ return s+(num(l.rate)||0); },0),2)+' mL/h';
}

/* ------------------------------------------------------------------ */
/* rendering: drip rate                                               */
/* ------------------------------------------------------------------ */
function renderDrip(){
  return '<div class="utilgrid" style="padding:12px">'+
  '<div class="utile"><h3>IV drip-rate calculator</h3><div class="ub">'+
   '<div class="row"><div class="field"><label for="dMl">Volume to infuse (mL)</label><input id="dMl" type="number" step="any" min="0" value="500"></div>'+
   '<div class="field"><label for="dHr">Over (hours)</label><input id="dHr" type="number" step="any" min="0" value="8"></div>'+
   '<div class="field"><label for="dDf">Drop factor</label><select id="dDf">'+
     '<option value="20">20 gtt/mL — macro (standard set)</option>'+
     '<option value="15">15 gtt/mL — macro</option>'+
     '<option value="10">10 gtt/mL — macro (blood set)</option>'+
     '<option value="60">60 gtt/mL — micro / paediatric</option></select></div></div>'+
   '<div id="dOut" style="margin-top:10px"></div>'+
   '<div class="infobox" style="margin:9px 0 0"><ul><li>Gravity drip rates drift with the patient\'s position, the cannula and the vein. For every high-alert drug use a pump, not a drip.</li>'+
   '<li>Drop factors are printed on the giving-set packaging — always read it, never assume 20.</li></ul></div>'+
  '</div></div>'+
  '<div class="utile"><h3>Reverse: drops/min → mL/h</h3><div class="ub">'+
   '<div class="row"><div class="field"><label for="rGtt">Observed rate (gtt/min)</label><input id="rGtt" type="number" step="any" min="0" value="42"></div>'+
   '<div class="field"><label for="rDf">Drop factor</label><select id="rDf">'+
     '<option value="20">20</option><option value="15">15</option><option value="10">10</option><option value="60">60</option></select></div></div>'+
   '<div id="rOut" style="margin-top:10px"></div>'+
  '</div></div></div>';
}
function calcDrip(){
  var ml=num($('#dMl').value), hr=num($('#dHr').value), df=num($('#dDf').value)||20;
  var o=$('#dOut');
  if(ml==null||hr==null||hr<=0||ml<=0){ o.innerHTML='<div class="pack">Enter a volume and a time greater than zero.</div>'; return; }
  var mlh=ml/hr, gtt=dripRate(mlh,df);
  o.innerHTML='<div class="big-out">'+fmtNum(gtt,0)+' <small>gtt/min</small></div>'+
    '<table class="tbl"><tbody>'+
    '<tr><td>Rate</td><td class="n b">'+fmtNum(mlh,1)+' mL/h</td></tr>'+
    '<tr><td>mL per minute</td><td class="n">'+fmtNum(mlh/60,2)+' mL/min</td></tr>'+
    '<tr><td>Drops per minute ('+df+' gtt/mL)</td><td class="n b">'+fmtNum(gtt,1)+'</td></tr>'+
    '<tr><td>Drops per 15 seconds (easier to count)</td><td class="n">'+fmtNum(gtt/4,1)+'</td></tr>'+
    '</tbody></table>';
}
function calcRev(){
  var g=num($('#rGtt').value), df=num($('#rDf').value)||20, o=$('#rOut');
  if(g==null||g<=0){ o.innerHTML='<div class="pack">Enter a drop rate.</div>'; return; }
  var mlh=mlPerHrFromDrops(g,df);
  o.innerHTML='<div class="big-out">'+fmtNum(mlh,1)+' <small>mL/h</small></div>'+
    '<div class="pack">'+fmtNum(mlh/60,2)+' mL/min · '+fmtNum(mlh*24,0)+' mL/24 h</div>';
}

/* ------------------------------------------------------------------ */
/* rendering: utilities                                               */
/* ------------------------------------------------------------------ */
function renderUtils(ctx){
  var kg=ctx.kg;
  var h=['<div class="utilgrid" style="padding:12px">'];

  /* renal */
  h.push('<div class="utile"><h3>Renal function</h3><div class="ub">'+
   '<div class="row">'+
    '<div class="field"><label for="uAge">Age (years)</label><input id="uAge" type="number" step="any" min="0" value="'+(ctx.ageY!=null?ctx.ageY:'')+'"></div>'+
    '<div class="field"><label for="uWt">Weight (kg)</label><input id="uWt" type="number" step="any" min="0" value="'+(kg!=null?fmtNum(kg,1):'')+'"></div>'+
    '<div class="field"><label for="uScr">Serum creatinine (mg/dL)</label><input id="uScr" type="number" step="any" min="0" value="'+esc(ST.pt.scr)+'"></div>'+
    '<div class="field"><label for="uHt">Height (cm)</label><input id="uHt" type="number" step="any" min="0" value="'+esc(ST.pt.ht)+'"></div>'+
    '<div class="field"><label for="uSex">Sex</label><select id="uSex"><option value="male"'+(ST.pt.sex!=='female'?' selected':'')+'>Male</option><option value="female"'+(ST.pt.sex==='female'?' selected':'')+'>Female</option></select></div>'+
   '</div><div id="uRenal" style="margin-top:9px"></div>'+
   '<div class="pack" style="margin-top:7px">Cockcroft–Gault uses <b>actual</b> body weight unless the patient is obese, when <b>adjusted</b> body weight is preferred. eGFR assumes steady state and must not be used for dose adjustment in acute kidney injury.</div>'+
  '</div></div>');

  /* body size */
  h.push('<div class="utile"><h3>Body size</h3><div class="ub"><div id="uBody"></div>'+
   '<div class="pack" style="margin-top:7px">Devine ideal body weight; adjusted = IBW + 0.4 × (actual − IBW); Mosteller BSA = √(height cm × weight kg ÷ 3600); Haycock is preferred under 10 kg.</div></div></div>');

  /* fluids */
  h.push('<div class="utile"><h3>Maintenance fluid &amp; glucose infusion rate</h3><div class="ub">'+
   '<div class="row"><div class="field"><label for="fWt">Weight (kg)</label><input id="fWt" type="number" step="any" min="0" value="'+(kg!=null?fmtNum(kg,1):'')+'"></div>'+
   '<div class="field"><label for="fPct">Dextrose (%)</label><select id="fPct"><option>5</option><option selected>10</option><option>12.5</option><option>25</option><option>50</option></select></div>'+
   '<div class="field"><label for="fGir">Target GIR (mg/kg/min)</label><input id="fGir" type="number" step="any" min="0" value="6"></div></div>'+
   '<div id="fOut" style="margin-top:9px"></div>'+
   '<div class="pack" style="margin-top:7px">Holliday–Segar: 100 mL/kg for the first 10 kg, +50 mL/kg for the next 10 kg, +20 mL/kg above 20 kg per 24 h. GIR = (dextrose % × 10 × mL/h) ÷ (60 × kg).</div></div></div>');

  /* sodium */
  h.push('<div class="utile"><h3>Sodium &amp; water</h3><div class="ub">'+
   '<div class="row"><div class="field"><label for="sNa">Serum Na⁺ (mmol/L)</label><input id="sNa" type="number" step="any" value="'+esc(ST.pt.na||'')+'"></div>'+
   '<div class="field"><label for="sWt">Weight (kg)</label><input id="sWt" type="number" step="any" value="'+(kg!=null?fmtNum(kg,1):'')+'"></div>'+
   '<div class="field"><label for="sInf">Infusate Na⁺</label><select id="sInf">'+
     '<option value="513">3% NaCl (513)</option><option value="154">0.9% NaCl (154)</option><option value="77">0.45% NaCl (77)</option>'+
     '<option value="0">5% dextrose (0)</option></select></div>'+
   '<div class="field"><label for="sTgt">Target Na⁺</label><input id="sTgt" type="number" step="any" value="125"></div></div>'+
   '<div id="sOut" style="margin-top:9px"></div>'+
   '<div class="warnbox" style="margin:9px 0 0"><ul><li>Correction limit <b>≤8–10 mmol/L in 24 h</b> (≤4–6 if high risk: chronic, malnutrition, alcoholism, liver disease, K⁺ &lt;3.0). Exceeding it causes osmotic demyelination.</li>'+
   '<li>Potassium replacement raises serum Na⁺ and counts towards the limit.</li></ul></div></div></div>');

  /* potassium */
  h.push('<div class="utile"><h3>Potassium</h3><div class="ub">'+
   '<div class="row"><div class="field"><label for="kSer">Serum K⁺ (mmol/L)</label><input id="kSer" type="number" step="any" value="'+esc(ST.pt.k||'')+'"></div>'+
   '<div class="field"><label for="kWt">Weight (kg)</label><input id="kWt" type="number" step="any" value="'+(kg!=null?fmtNum(kg,1):'')+'"></div>'+
   '<div class="field"><label for="kMmol">Dose to give (mmol)</label><input id="kMmol" type="number" step="any" value="20"></div>'+
   '<div class="field"><label for="kVol">In volume (mL)</label><input id="kVol" type="number" step="any" value="500"></div></div>'+
   '<div id="kOut" style="margin-top:9px"></div>'+
   '<div class="warnbox" style="margin:9px 0 0"><ul><li>Peripheral maximum <b>20 mmol/h</b> and <b>40 mmol/L</b>; central line up to 40 mmol/h with continuous ECG.</li>'+
   '<li>KCl must NEVER be given as an IV bolus — undiluted IV potassium is a never-event.</li></ul></div></div></div>');

  /* unit cross-check */
  h.push('<div class="utile"><h3>Unit cross-check</h3><div class="ub">'+
   '<div class="row"><div class="field"><label for="cAmt">Amount</label><input id="cAmt" type="number" step="any" value="1"></div>'+
   '<div class="field"><label for="cFrom">From</label><select id="cFrom">'+unitOpts()+'</select></div>'+
   '<div class="field"><label for="cTo">To</label><select id="cTo">'+unitOpts()+'</select></div></div>'+
   '<div id="cOut" style="margin-top:9px"></div>'+
   '<table class="tbl"><thead><tr><th>Equivalence used in this tool</th><th class="n">Value</th></tr></thead><tbody>'+
   [['Potassium: 1 mmol K⁺','39.1 mg'],['Sodium: 1 mmol Na⁺','23 mg'],
    ['Calcium gluconate 10%: 1 mL','100 mg salt = 9.3 mg elemental Ca = 0.225 mmol = 0.45 mEq'],
    ['Calcium chloride 10%: 1 mL','100 mg salt = 27.2 mg elemental Ca = 0.68 mmol = 1.36 mEq'],
    ['Magnesium sulfate 50%: 1 mL','500 mg = 2.06 mmol = 4.1 mEq'],
    ['Sodium bicarbonate 8.4%: 1 mL','84 mg = 1 mmol = 1 mEq'],
    ['KCl 15%: 1 mL','150 mg = 2 mmol K⁺'],['Human insulin: 1 mg','28.8 IU'],
    ['Colistin: 1 MIU','≈33.3 mg colistin base activity (CBA) ≈80 mg CMS'],
    ['Phosphorus: 1 mmol','31 mg'],['Heparin: 1 mg','≈120–160 IU (batch dependent)']]
    .map(function(r){return '<tr><td>'+esc(r[0])+'</td><td class="n mono">'+esc(r[1])+'</td></tr>';}).join('')+
   '</tbody></table></div></div>');

  h.push('</div>');
  return h.join('');
}
function unitOpts(){
  var u=['mg','g','mcg','mL','L','IU','units','mEq','mmol','MIU'];
  return u.map(function(x){return '<option>'+x+'</option>';}).join('');
}
function calcRenal(){
  var a=num($('#uAge').value), w=num($('#uWt').value), s=num($('#uScr').value), ht=num($('#uHt').value), sx=$('#uSex').value;
  var o=$('#uRenal'); var rows='';
  var cg=crclCG(a,w,s,sx), jf=crclJelliffe(a,s,sx), sc=egfrSchwartz(ht,s);
  var ibwv=ibwDevine(ht,sx), abwv=(ibwv!=null&&w!=null&&w>ibwv)?adjBW(ibwv,w):null;
  if(cg!=null) rows+='<tr><td>Cockcroft–Gault CrCl</td><td class="n b">'+fmtNum(cg,1)+' mL/min</td></tr>';
  if(jf!=null) rows+='<tr><td>Jelliffe CrCl (no weight)</td><td class="n">'+fmtNum(jf,1)+' mL/min</td></tr>';
  if(sc!=null) rows+='<tr><td>Bedside Schwartz eGFR (paediatric)</td><td class="n">'+fmtNum(sc,1)+' mL/min/1.73 m²</td></tr>';
  if(ibwv!=null) rows+='<tr><td>Ideal body weight (Devine)</td><td class="n">'+fmtNum(ibwv,1)+' kg</td></tr>';
  if(abwv!=null) rows+='<tr><td>Adjusted body weight</td><td class="n">'+fmtNum(abwv,1)+' kg</td></tr>';
  if(!rows){ o.innerHTML='<div class="pack">Enter age, weight and serum creatinine.</div>'; return; }
  var band = cg==null?'': cg>=90?'normal/high — watch for AUGMENTED renal clearance (β-lactams may be subtherapeutic)'
    : cg>=60?'mild impairment': cg>=30?'moderate impairment — most drugs need adjustment': cg>=15?'severe impairment':'kidney failure — dose for RRT/dialysis';
  o.innerHTML='<table class="tbl"><tbody>'+rows+'</tbody></table><div class="pack" style="margin-top:6px">'+esc(band)+'</div>';
}
function calcBody(){
  var ctx=buildCtx(), o=$('#uBody'), rows='';
  function r(k,v,u){ if(v!=null) rows+='<tr><td>'+k+'</td><td class="n b">'+fmtNum(v,2)+' '+u+'</td></tr>'; }
  r('Weight in use',ctx.kg,'kg'); r('Ideal body weight',ctx.ibw,'kg'); r('Adjusted body weight',ctx.adjBW,'kg');
  r('BSA (Mosteller)',ctx.bsa,'m²'); r('BSA (Haycock, <10 kg)',ctx.bsaHaycock,'m²');
  r('Maintenance fluid (Holliday–Segar)',ctx.maint,'mL/24 h');
  if(ctx.maint!=null) r('Maintenance rate',ctx.maint/24,'mL/h');
  if(ctx.kg) r('4-2-1 rule rate',ctx.kg<=10?4*ctx.kg:(ctx.kg<=20?40+2*(ctx.kg-10):60+1*(ctx.kg-20)),'mL/h');
  o.innerHTML = rows? '<table class="tbl"><tbody>'+rows+'</tbody></table>' : '<div class="pack">Enter height and/or weight in the patient panel.</div>';
}
function calcFluid(){
  var w=num($('#fWt').value), pct=num($('#fPct').value), g=num($('#fGir').value), o=$('#fOut');
  var rows='';
  var m=maintenanceFluids(w);
  if(m!=null) rows+='<tr><td>Maintenance fluid (Holliday–Segar)</td><td class="n b">'+fmtNum(m,0)+' mL/24 h = '+fmtNum(m/24,1)+' mL/h</td></tr>';
  if(w&&pct&&g) rows+='<tr><td>mL/h of '+pct+'% dextrose for GIR '+g+'</td><td class="n b">'+fmtNum(mlPerHrForGir(g,pct,w),1)+' mL/h</td></tr>';
  if(w&&pct){
    [4,6,8,10,12].forEach(function(t){
      rows+='<tr><td>GIR from '+fmtNum(mlPerHrForGir(t,pct,w),1)+' mL/h of '+pct+'%</td><td class="n">'+fmtNum(t,1)+' mg/kg/min</td></tr>';
    });
  }
  o.innerHTML = rows? '<table class="tbl"><tbody>'+rows+'</tbody></table>' : '<div class="pack">Enter a weight.</div>';
}
function calcSodium(){
  var na=num($('#sNa').value), w=num($('#sWt').value), inf=num($('#sInf').value), tgt=num($('#sTgt').value), o=$('#sOut');
  if(na==null||w==null){ o.innerHTML='<div class="pack">Enter the serum sodium and a weight.</div>'; return; }
  var sx=ST.pt.sex, tbw=w*(sx==='female'?0.5:0.6);
  var am=adrogueMadias(na,inf,tbw), fwd=freeWaterDeficit(w,na,sx), need=sodiumForHyponatraemia(w,na,tgt);
  var rows='<tr><td>Total body water (assumed)</td><td class="n">'+fmtNum(tbw,1)+' L</td></tr>';
  if(am!=null) rows+='<tr><td>Δ serum Na⁺ per 1 L of this infusate (Adrogué–Madias)</td><td class="n b">'+(am>=0?'+':'')+fmtNum(am,2)+' mmol/L</td></tr>';
  if(am!=null&&am>0) rows+='<tr><td>Volume of this infusate to raise Na⁺ by 8 mmol/L (the 24 h LIMIT)</td><td class="n b">'+fmtNum(8/am/1000,2)+' L</td></tr>';
  if(need!=null&&tgt!=null) rows+='<tr><td>Na⁺ required to reach '+fmtNum(tgt,0)+' mmol/L</td><td class="n">'+fmtNum(need,0)+' mmol</td></tr>';
  if(fwd!=null&&na>145) rows+='<tr><td>Free-water deficit (hypernatraemia)</td><td class="n b">'+fmtNum(fwd,2)+' L — replace HALF over the first 24 h</td></tr>';
  o.innerHTML='<table class="tbl"><tbody>'+rows+'</tbody></table>';
}
function calcPotassium(){
  var k=num($('#kSer').value), w=num($('#kWt').value), mm=num($('#kMmol').value), v=num($('#kVol').value), o=$('#kOut');
  var rows='';
  if(k!=null&&w!=null) rows+='<tr><td>Estimated deficit to K⁺ 4.0</td><td class="n b">'+fmtNum(potassiumDeficit(k,w),0)+' mmol</td></tr>';
  if(mm!=null&&v!=null&&v>0){
    var conc=mm/(v/1000);
    var rate=20; /* mmol/h peripheral max */
    rows+='<tr><td>Final concentration</td><td class="n b">'+fmtNum(conc,1)+' mmol/L</td></tr>';
    rows+='<tr><td>Peripheral limit 40 mmol/L</td><td class="n">'+(conc<=40?'<b style="color:var(--ok)">OK</b>':'<b style="color:var(--crit)">EXCEEDS — central line only</b>')+'</td></tr>';
    rows+='<tr><td>Fastest safe peripheral rate (20 mmol/h)</td><td class="n">'+fmtNum(20/conc*1000,0)+' mL/h → the dose takes '+fmtNum(mm/20,1)+' h</td></tr>';
    rows+='<tr><td>KCl mass equivalent</td><td class="n">'+fmtNum(mm*74.5,0)+' mg ('+fmtNum(mm*74.5/1000,2)+' g)</td></tr>';
  }
  o.innerHTML = rows? '<table class="tbl"><tbody>'+rows+'</tbody></table>' : '<div class="pack">Enter the serum potassium and weight.</div>';
}
function calcConv(){
  var a=num($('#cAmt').value), f=$('#cFrom').value, t=$('#cTo').value, o=$('#cOut');
  if(a==null){ o.innerHTML=''; return; }
  var v=convertUnit(a,f,t);
  o.innerHTML = v==null
    ? '<div class="warnbox" style="margin:0"><ul><li><b>No conversion exists</b> between '+esc(f)+' and '+esc(t)+' — they are different physical quantities (mass, volume, moles, charge, activity). Any website or rule of thumb that converts them is wrong unless it names the exact salt.</li></ul></div>'
    : '<div class="big-out">'+fmtNum(v)+' <small>'+esc(t)+'</small></div><div class="pack">'+fmtNum(a)+' '+esc(f)+' = '+fmtNum(v)+' '+esc(t)+'</div>';
}

/* ------------------------------------------------------------------ */
/* rendering: protocols                                               */
/* ------------------------------------------------------------------ */
function renderProtocols(){
  var q=ST.q.trim().toLowerCase();
  var list = PROT.filter(function(p){
    if(!q) return true;
    return (p.t+' '+p.steps.join(' ')).toLowerCase().indexOf(q)>=0;
  });
  var h=['<div class="toolbar no-print"><div class="field grow search"><label for="pq">Search protocols</label>'+
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'+
    '<input id="pq" type="text" value="'+esc(ST.q)+'" placeholder="e.g. hyperkalaemia, snakebite, eclampsia…" autocomplete="off"></div></div>',
    '<div class="count"><b>'+list.length+'</b> protocol'+(list.length===1?'':'s')+' · time-critical sequences and decision support</div>'];
  if(!list.length){ h.push('<div class="empty"><b>No protocol matches “'+esc(ST.q)+'”</b></div>'); return h.join(''); }
  h.push('<div style="padding:12px">');
  list.forEach(function(p){
    h.push('<article class="proto" data-pid="'+esc(p.id)+'"><h3>'+esc(p.t)+'</h3><div class="pp">'+
      (p.s||[]).map(function(k){ return SYS[k]?esc(SYS[k].short):esc(k); }).join(' · ')+
      '</div><ol>'+p.steps.map(function(s){ return '<li>'+highlightDrugs(s)+'</li>'; }).join('')+'</ol></article>');
  });
  h.push('</div>');
  return h.join('');
}
/* make drug names and numbers in a protocol step easy to read at 3 a.m. */
function highlightDrugs(txt){
  var s=esc(txt);
  s=s.replace(/([0-9]+(?:\.[0-9]+)?)\s*(mg\/kg\/min|mcg\/kg\/min|mg\/kg\/h|mcg\/kg\/h|mg\/kg|mcg\/kg|mg\/h|mcg\/h|mmol\/kg|mEq\/kg|mL\/kg|mg|mcg|g|IU|units|mmol|mEq|mL|%)/g,
              '<span class="step-vol">$1 $2</span>');
  s=s.replace(/\b(adrenaline|epinephrine|noradrenaline|amiodarone|lidocaine|atropine|magnesium sulfate|sodium bicarbonate|calcium gluconate|calcium chloride|insulin|dextrose|naloxone|flumazenil|midazolam|lorazepam|diazepam|levetiracetam|phenytoin|fosphenytoin|valproate|phenobarbitone|propofol|dexamethasone|hydrocortisone|methylprednisolone|salbutamol|ipratropium|ceftriaxone|cefotaxime|ampicillin|gentamicin|amikacin|meropenem|vancomycin|piperacillin|metronidazole|doxycycline|azithromycin|artesunate|quinine|acyclovir|aciclovir|prazosin|pralidoxime|naloxone|dantrolene|sugammadex|neostigmine|oxytocin|methylergometrine|carboprost|misoprostol|terlipressin|octreotide|pantoprazole|lactulose|tranexamic acid|heparin|protamine|vitamin K1|naloxone|thiamine|glucagon|methylene blue|hydroxocobalamin|N-acetylcysteine|fomepizole|lipid emulsion|glucagon|labetalol|hydralazine|nifedipine|nicardipine|nitroglycerin|nitroprusside|esmolol|metoprolol|diltiazem|verapamil|digoxin|adenosine|tenecteplase|alteplase|streptokinate|aspirin|clopidogrel|enoxaparin|furosemide|mannitol|hypertonic saline|lignocaine|ketamine|etomidate|thiopentone|suxamethonium|rocuronium|atracurium|cisatracurium|vecuronium|IVIG|anti-snake venom serum|ASV|surfactant|caffeine citrate|alprostadil|betamethasone|zinc|ORS|ivermectin|colistin|tigecycline|linezolid|oseltamivir|remdesivir|amphotericin|fluconazole|voriconazole|caspofungin)\b/gi,
              '<button type="button" class="step-drug" data-drug="$1" title="Open the dose card for $1">$1</button>');
  return s;
}

/* ------------------------------------------------------------------ */
/* rendering: references                                              */
/* ------------------------------------------------------------------ */
function renderRefs(){
  var used={};
  REG.forEach(function(r){ (r.ref||[]).forEach(function(k){ used[k]=(used[k]||0)+1; }); });
  var keys=Object.keys(REFS).sort();
  var h=['<div class="count"><b>'+keys.length+'</b> references · '+Object.keys(used).length+' cited by the drug entries · click any title for the full citation</div>','<div style="padding:12px">'];
  h.push('<table class="tbl"><thead><tr><th style="width:26%">Short label</th><th>Citation</th><th class="n">Used by</th></tr></thead><tbody>');
  keys.forEach(function(k){
    h.push('<tr><td class="b"><span class="tag refTag" data-ref="'+esc(k)+'" style="cursor:pointer" title="Click for the full citation">'+esc(REFS[k].n)+'</span><div class="pack mono">'+esc(k)+'</div></td><td>'+esc(REFS[k].f)+'</td><td class="n">'+(used[k]||0)+'</td></tr>');
  });
  h.push('</tbody></table>');
  h.push('<div class="infobox" style="margin:12px 0 0"><ul><li>Doses follow the most recent edition of each guideline available at the time of writing. Where a guideline has been superseded during the year, the version cited in the entry is the one used.</li>'+
   '<li>Indian availability, brand names and pack sizes reflect the IP/NFDC market. Formulations change — always read the label on the product in your hand.</li>'+
   '<li>This is a decision-support tool. It does not replace your institutional protocol, the patient\'s chart, or clinical judgement.</li></ul></div>');
  h.push('</div>');
  return h.join('');
}

/* ------------------------------------------------------------------ */
/* rendering: about / disclaimer                                      */
/* ------------------------------------------------------------------ */
function renderAbout(){
  var nReg=REG.length, nFx=0, nSys={}, nRisk5=0;
  REG.forEach(function(r){ nFx+=(r.fx||[]).length; nSys[r.sys]=1; if((r.risk||0)>=5)nRisk5++; });
  return '<div style="padding:14px"><div class="proto"><h3>What this is</h3><ol>'+
   '<li><b>Scope: 24 weeks of gestation to the 18th birthday.</b> Enter the gestational age at birth for any baby born before 37 weeks and the app doses on <b>postmenstrual age</b>, estimates weight from the <b>Fenton</b> preterm reference, and shows the <b>corrected age</b>. Past the 18th birthday it refuses to print a number rather than guess.</li>'+
   '<li>A single offline HTML file — <b>'+nReg+' drug regimens</b>, <b>'+nFx+' Indian formulations</b> across <b>'+Object.keys(nSys).length+' body systems</b>, <b>'+PROT.length+' emergency protocols</b> and <b>'+Object.keys(REFS).length+' cited references</b>.</li>'+
   '<li>Enter an <b>age OR a weight</b> and every dose on the page recalculates: the amount, the maximum cap, and the volume to draw for <i>each</i> available strength.</li>'+
   '<li>Every formulation carries its <b>concentration in mg/mL</b> (or mcg/mL, IU/mL, mmol/mL, % w/v), pack size, Indian brand names, route and reconstitution instruction — for <b>IV and oral</b> products.</li>'+
   '<li>Drugs are grouped two ways: by <b>body system</b> (selectable chips) and by <b>pharmacological class</b> (dropdown).</li>'+
   '<li>Each entry cites the guideline it comes from — AHA/ERC 2025, NICE, WHO, KDIGO, IDSA, ESC, ACOG, ISCCM, IAP, NTEP, NVBDCP, MoHFW national protocols and the standard textbooks.</li>'+
   '<li>'+nRisk5+' entries are flagged ISMP high-alert and carry a mandatory independent double-check block with signature lines that print with the sheet.</li>'+
  '</ol></div>'+
  '<div class="proto"><h3>Install it on any device — it then runs with no internet</h3>'+
   '<div class="pp">The whole calculator, all '+nReg+' regimens, all '+nFx+' formulations and every reference, lives inside this app. Nothing is fetched from any server while you use it.</div><ol>'+
   '<li><b>Android.</b> Open it in Chrome, Edge, Samsung Internet or Firefox, tap the menu (⋮) and choose <b>Install app</b> or <b>Add to Home screen</b>. It then launches full-screen like a normal app and works in airplane mode.</li>'+   '<li><b>iPhone / iPad.</b> Open it in <b>Safari</b>, tap <b>Share</b>, then <b>Add to Home Screen</b>. iOS may evict web-app caches after about a week of not opening the app — open it once a week, or carry the single HTML file in Files.</li>'+   '<li><b>Windows.</b> Open it in Edge or Chrome and click the <b>install icon in the address bar</b> (or menu → Apps → Install this site as an app). It becomes a Start-menu app with its own window. No browser needed after that.</li>'+   '<li><b>Mac.</b> Chrome or Edge → menu → <b>Install …</b>; or Safari 17+ → File → <b>Add to Dock</b>. It appears in the Dock and the Launchpad as an app.</li>'+   '<li><b>No server at all.</b> Copy the folder (or just the single <span class="mono">standalone.html</span>) onto a pen drive or a hospital file share and open it from disk. Installation then is unnecessary — the calculator is complete as a file. The service worker, and therefore true offline caching, needs http(s), which is why installing from a hosted copy is the more durable option.</li>'+   '<li><b>For a whole hospital.</b> Put the folder on any HTTPS web server or intranet box. Each phone, tablet and workstation that installs it once keeps working when the network does not.</li>'+   '<li><b>Updates.</b> A new build is cached automatically the next time the device has connectivity; the old version keeps working until then. The version hash is shown in the top bar.</li>'+  '</ol></div>'+
  '<div class="proto"><h3>How error is prevented</h3><ol>'+
   '<li><b>Caps are enforced, not advisory.</b> A weight-based dose that exceeds the maximum single or 24-hour dose is clamped and the card says so in red.</li>'+
   '<li><b>Units are never guessed.</b> The engine only converts within a physical family (mass, volume, activity, moles, charge). Where a salt-specific factor is needed — mmol of elemental calcium in calcium gluconate, anti-Xa units in enoxaparin, mmol of phosphorus per tablet — it is declared explicitly per product. Where no validated factor exists, no number is printed at all.</li>'+
   '<li><b>Rates are separated from amounts.</b> A prescribed rate (mcg/kg/min) is converted to per-minute, per-hour and per-24-hour amounts and to mL/h for each standard dilution, so the pump figure can be checked against the prescription by a different route.</li>'+
   '<li><b>Sub-0.1 mL volumes are caught.</b> Any volume below the measurable limit produces an explicit dilution instruction (1:10 or 1:100) rather than an impossible number.</li>'+
   '<li><b>Rounding is always down.</b> Quantities are truncated at the displayed precision, so a rounded figure can never deliver more drug than calculated.</li>'+
   '<li><b>Composite regimens keep their drugs apart.</b> Where one entry covers several drugs (thyroid storm, DKA fluids, neonatal sepsis, HRZE), each row carries its own dose — one drug\'s dose is never divided by another drug\'s concentration.</li>'+
   '<li><b>Look-alike and 10-fold traps are cross-checked</b> per drug: insulin 100 vs 40 IU/mL, adrenaline 1:1000 vs 1:10,000, caffeine citrate vs base, colistin MIU vs mg, heparin 5,000 vs 25,000 IU/mL, MgSO₄ 50/25/20%.</li>'+
   '<li><b>Renal function changes the answer.</b> Enter creatinine and CrCl/eGFR appear, with the dosing-weight basis (actual / ideal / adjusted) shown on the card.</li>'+
   '<li><b>The whole thing is validated</b> by an automated test suite that re-runs every regimen at nine different body sizes and fails the build on any NaN, any cap below the calculated dose, any concentration mismatch or any missing citation.</li>'+
  '</ol></div>'+
  '<div class="proto" style="border-left-color:var(--crit)"><h3>Disclaimer — read this</h3><ol>'+
   '<li>This is clinical <b>decision support</b>, not a prescription. It does not replace your judgement, the patient\'s chart, your institutional protocol or your pharmacist.</li>'+
   '<li>Formulations, brand names and pack sizes in India change without notice. <b>Read the label on the product in your hand</b> and confirm that its concentration matches the row you used.</li>'+
   '<li>Neonatal dosing depends on gestational as well as postnatal age. For the first 28 days of life, cross-check every dose against a neonatal formulary.</li>'+
   '<li>Weight estimated from age can be wrong by 20–30%. Weigh the patient.</li>'+
   '<li>Guidelines are revised. Check the cited source for the current version.</li>'+
   '<li>Nothing in this file transmits data anywhere. It works fully offline, which also means it cannot update itself.</li>'+
  '</ol></div></div>';
}

/* ------------------------------------------------------------------ */
/* tabs                                                               */
/* ------------------------------------------------------------------ */
var TABS=[['drugs','Drug doses'],['pump','Infusion pump'],['drip','Drip rate'],['protocols','Protocols'],['utils','Calculators'],['refs','References'],['about','About & safety']];
var TAB_ICONS={drugs:'💊',pump:'💉',drip:'💧',protocols:'📋',utils:'🧮',refs:'📚',about:'ℹ️'};
var TAB_SHORT={drugs:'Drugs',pump:'Pump',drip:'Drip',protocols:'Protocols',utils:'Calc',refs:'Refs',about:'About'};
function renderTabs(){
  return '<div class="tabs no-print" role="tablist">'+TABS.map(function(t){
    return '<button role="tab" data-tab="'+t[0]+'" aria-selected="'+(ST.tab===t[0])+'">'+esc(t[1])+'</button>';
  }).join('')+'</div>'+
  '<nav class="btabs no-print" aria-label="Sections">'+TABS.map(function(t){
    return '<button data-tab="'+t[0]+'" aria-selected="'+(ST.tab===t[0])+'"><span class="bi">'+
      (TAB_ICONS[t[0]]||'•')+'</span>'+esc(TAB_SHORT[t[0]]||t[1])+'</button>';
  }).join('')+'</nav>';
}
function renderContent(){
  var ctx=buildCtx();
  var c=$('#content');
  if(ST.tab==='drugs') c.innerHTML=renderDrugs(ctx);
  else if(ST.tab==='pump') c.innerHTML=renderPump(ctx);
  else if(ST.tab==='drip'){ c.innerHTML=renderDrip(); calcDrip(); calcRev(); }
  else if(ST.tab==='protocols') c.innerHTML=renderProtocols();
  else if(ST.tab==='utils'){ c.innerHTML=renderUtils(ctx); calcRenal(); calcBody(); calcFluid(); calcSodium(); calcPotassium(); calcConv(); }
  else if(ST.tab==='refs') c.innerHTML=renderRefs();
  else c.innerHTML=renderAbout();
  queueSave();
}
function renderAll(){
  var ctx=renderPatient();
  $('#tabs').innerHTML=renderTabs();
  renderContent();
  wireInner();
}

/* ------------------------------------------------------------------ */
/* events                                                             */
/* ------------------------------------------------------------------ */
/* one path to a protocol, used by the rail chips, the emergency tiles,
   the command palette and the protocol drug-links */
function gotoProto(pid){
  ST.tab='protocols'; ST.q=''; ST.sys=new Set(); ST.cls='';
  renderAll();
  var pq=$('#pq'); if(pq) pq.value='';
  var el=document.querySelector('.proto[data-pid="'+String(pid).replace(/"/g,'')+'"]');
  $$('.proto').forEach(function(p){ p.classList.remove('flash'); });
  if(el){
    el.classList.add('flash');
    scrollToEl(el,'start');
    toast('Jumped to protocol: '+((el.querySelector('h3')||{}).textContent||pid));
  } else {
    toast('Protocol "'+pid+'" was not found');
  }
  wireInner();
}

function wireInner(){
  $$('#content .chip[data-sys]').forEach(function(b){
    b.addEventListener('click',function(){
      var k=b.getAttribute('data-sys');
      if(k==='__all__') ST.sys.clear();
      else if(ST.sys.has(k)) ST.sys.delete(k); else ST.sys.add(k);
      renderContent(); wireInner();
    });
  });
  [['q',ST.tab],['pq','protocols']].forEach(function(pr){
    var e=$('#'+pr[0]);
    if(e) e.addEventListener('input',function(){
      ST.q=e.value; renderContent(); wireInner();
      var n=$('#'+pr[0]); if(n){ n.focus(); try{n.setSelectionRange(n.value.length,n.value.length);}catch(_){} }
    });
  });
  var cl=$('#cls'); if(cl) cl.addEventListener('change',function(){ ST.cls=cl.value; renderContent(); wireInner(); });
  var po=$('#pop'); if(po) po.addEventListener('change',function(){ ST.pop=po.value; renderContent(); wireInner(); });
  var ha=$('#haOnly'); if(ha) ha.addEventListener('click',function(){ ST.highAlertOnly=!ST.highAlertOnly; renderContent(); wireInner(); });
  var ea=$('#expAll');
  if(ea) ea.addEventListener('click',function(){
    ST.expand=new Set(REG.map(function(r){ return r.id; }));
    renderContent(); wireInner();
    $$('details.moredet').forEach(function(d){ d.open=true; });
    toast('Every card expanded');
  });
  var ca=$('#colAll');
  if(ca) ca.addEventListener('click',function(){
    ST.expand=new Set();
    renderContent(); wireInner();
    toast('Cards collapsed to the one-line answer');
  });
  $$('#content .refTag').forEach(function(t){
    t.addEventListener('click',function(){ openRef(t.getAttribute('data-ref')); });
  });
  /* a drug name inside a protocol step opens that drug's dose card */
  $$('#content .step-drug').forEach(function(b){
    b.addEventListener('click',function(){
      var nm=(b.getAttribute('data-drug')||'').trim();
      if(!nm) return;
      for(var ri=0;ri<REG.length;ri++){
        if(REG[ri].n.toLowerCase()===nm.toLowerCase()){ pushRecent(REG[ri].id); break; }
      }
      ST.tab='drugs'; ST.q=nm; ST.sys.clear(); ST.cls=''; ST.highAlertOnly=false;
      renderAll();
      var n=$('#q'); if(n){ n.focus(); try{ n.setSelectionRange(n.value.length,n.value.length); }catch(_){} }
      var hit=$$('#content .card').length;
      toast(hit? ('Showing '+hit+' entr'+(hit===1?'y':'ies')+' matching "'+nm+'"') : ('No entry matches "'+nm+'"'));
    });
  });
  $$('#content .openCard').forEach(function(b){
    b.addEventListener('click',function(){
      ST.tab='drugs'; ST.q=''; ST.sys.clear(); ST.cls='';
      var id=b.getAttribute('data-id');
      renderAll();
      var el=$('#content .card[data-id="'+CSS.escape(id)+'"]');
      if(el){ scrollToEl(el,'center');
        el.style.outline='3px solid var(--brand)'; setTimeout(function(){el.style.outline='';},2200); }
    });
  });
  ['dMl','dHr','dDf'].forEach(function(i){ var e=$('#'+i); if(e) e.addEventListener('input',calcDrip); if(e) e.addEventListener('change',calcDrip); });
  ['rGtt','rDf'].forEach(function(i){ var e=$('#'+i); if(e){ e.addEventListener('input',calcRev); e.addEventListener('change',calcRev);} });
  ['uAge','uWt','uScr','uHt','uSex'].forEach(function(i){ var e=$('#'+i); if(e){e.addEventListener('input',calcRenal);e.addEventListener('change',calcRenal);} });
  ['fWt','fPct','fGir'].forEach(function(i){ var e=$('#'+i); if(e){e.addEventListener('input',calcFluid);e.addEventListener('change',calcFluid);} });
  ['sNa','sWt','sInf','sTgt'].forEach(function(i){ var e=$('#'+i); if(e){e.addEventListener('input',calcSodium);e.addEventListener('change',calcSodium);} });
  ['kSer','kWt','kMmol','kVol'].forEach(function(i){ var e=$('#'+i); if(e){e.addEventListener('input',calcPotassium);e.addEventListener('change',calcPotassium);} });
  ['cAmt','cFrom','cTo'].forEach(function(i){ var e=$('#'+i); if(e){e.addEventListener('input',calcConv);e.addEventListener('change',calcConv);} });
  if(ST.tab==='pump'){ wirePump(); wirePumpModes(); }

  /* ---- pinned stars ---- */
  $$('.star[data-fav]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var id=b.getAttribute('data-fav');
      if(ST.fav.has(id)) ST.fav.delete(id); else ST.fav.add(id);
      renderContent(); wireInner(); queueSave();
      toast(ST.fav.has(id)?'Pinned to the top of its system':'Unpinned');
    });
  });
  var fo=$('#favOnly');
  if(fo) fo.addEventListener('click',function(){ ST.favOnly=!ST.favOnly; renderContent(); wireInner(); queueSave(); });

  /* ---- active filter bar ---- */
  $$('.fbar .fb').forEach(function(b){
    b.addEventListener('click',function(){
      var k=b.getAttribute('data-clear');
      if(k==='*'){ ST.q=''; ST.cls=''; ST.pop=''; ST.sys=new Set(); ST.highAlertOnly=false; ST.favOnly=false; }
      else if(k==='q') ST.q='';
      else if(k==='cls') ST.cls='';
      else if(k==='pop') ST.pop='';
      else if(k==='ha') ST.highAlertOnly=false;
      else if(k==='fav') ST.favOnly=false;
      else if(k.indexOf('sys:')===0) ST.sys.delete(k.slice(4));
      renderContent(); wireInner(); queueSave();
    });
  });

  /* ---- record a drug as recent when a person actually opens it ---- */
  $$('.fxdet').forEach(function(dt2){
    dt2.addEventListener('toggle',function(e){
      if(dt2.open && e.isTrusted) pushRecent(dt2.getAttribute('data-id'));
    });
  });

  /* ---- emergency tiles ---- */
  $$('.tile[data-proto]').forEach(function(b){
    b.addEventListener('click',function(){ gotoProto(b.getAttribute('data-proto')); });
  });
  var tc=$('#tilesClose');
  if(tc) tc.addEventListener('click',function(){ ST.tilesOpen=false; renderContent(); wireInner(); queueSave(); });
  var to2=$('#tilesOpen');
  if(to2) to2.addEventListener('click',function(){ ST.tilesOpen=true; renderContent(); wireInner(); queueSave(); });

  /* ---- bottom tab bar (phones) ---- */
  $$('.btabs button').forEach(function(b){
    b.addEventListener('click',function(){
      ST.tab=b.getAttribute('data-tab');
      renderAll();
      scrollToEl(document.getElementById('content'),'start');
    });
  });
}
function openRef(k){
  var r=REFS[k]; if(!r) return;
  openModal('Reference — '+r.n, '<p style="margin:0 0 8px"><b>'+esc(r.n)+'</b></p><p style="margin:0">'+esc(r.f)+'</p>'+
    '<p class="pack" style="margin-top:10px">Key: <span class="mono">'+esc(k)+'</span></p>');
}
function openModal(title, html){
  $('#modalT').textContent=title; $('#modalB').innerHTML=html; $('#modal').classList.add('open');
}
function closeModal(){ $('#modal').classList.remove('open'); }

/* ------------------------------------------------------------------ */
/* CSV export                                                         */
/* ------------------------------------------------------------------ */
function csvCell(v){
  v = String(v==null?'':v);
  if(/[",\n]/.test(v)) v='"'+v.replace(/"/g,'""')+'"';
  return v;
}
function exportCsv(){
  var ctx=buildCtx();
  var list=visibleRegs(ctx);
  var rows=[['System','Drug','Class','Population','Risk','Indication','Prescribed dose','Calculated dose','Formulation','Concentration','Route','Volume/quantity','Unit','Label','Brands','Pack','Cap applied','References']];
  list.forEach(function(r){
    var dw=dosingWeightFor(r,ctx); ctxRef.kg=dw.kg;
    var out=computeRegimen(r,{kg:dw.kg,dosingWeight:dw.kg,pop:ctx.pop,ageDays:ctx.ageDays});
    var base=[SYS[r.sys]?SYS[r.sys].label:r.sys, r.n, r.cls||'', r.pop||'', r.risk||'', r.ind||'',
              (out.dose&&out.dose.prescribedText)||'', (out.dose&&out.dose.text)||out.doseText||'', ];
    if(out.error && !(out.items&&out.items.length)){
      rows.push(base.concat(['','','','','','','','',out.error,'']));
      return;
    }
    (out.items||[]).forEach(function(it){
      var f=it.fx;
      var qty = (it.mode==='conc'||it.mode==='direct')
        ? fmtVol(it.volLo)+(it.volHi!=null&&Math.abs(it.volHi-it.volLo)>1e-9?'-'+fmtVol(it.volHi):'')
        : (it.mode==='fixed'? (it.give||'') : '');
      var concCell = f.c!=null ? fmtNum(f.c)+' '+f.u+(it.form==='solid'?(' per '+(it.perUnit||'unit')):'/mL') : '';
      rows.push(base.concat([f.s||'', concCell, f.r||'', qty, it.perUnit||'', it.label||'', f.b||'', f.p||'',
        out.capApplied?'YES':'', (r.ref||[]).join('|')]));
    });
  });
  var csv='\ufeff'+rows.map(function(r){return r.map(csvCell).join(',');}).join('\r\n');
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ICU_drug_doses_'+(ctx.kg!=null?fmtNum(ctx.kg,1)+'kg_':'')+(ST.sys.size?Array.from(ST.sys).join('-'):'all')+'_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(a.href);},4000);
  toast('Exported '+rows.length+' rows to CSV');
}

/* ------------------------------------------------------------------ */
/* patient-panel events                                               */
/* ------------------------------------------------------------------ */
function wirePanel(){
  ['wt','ageY','ageM','ageD','gaW','gaD','ht','scr','k','na','glu'].forEach(function(id){
    var e=$('#p_'+id); if(!e) return;
    e.addEventListener('input',function(){ ST.pt[id]=e.value; debounceRender(); });
  });
  var sx=$('#p_sex'); if(sx) sx.addEventListener('change',function(){ ST.pt.sex=sx.value; renderAll(); });
  var wm=$('#p_wm'); if(wm) wm.addEventListener('change',function(){ ST.pt.wMethod=wm.value; renderAll(); });
  var ao=$('#p_ao'); if(ao) ao.addEventListener('change',function(){ ST.pt.adultOverride=ao.checked; renderAll(); });
  var d70=$('#btnDemo70');
  if(d70) d70.addEventListener('click',function(){
    ST.pt.wt='16'; ST.pt.ageY='4'; ST.pt.ageM=''; ST.pt.ageD=''; ST.pt.gaW='40'; ST.pt.gaD='0'; ST.pt.sex='male';
    syncPanel(); renderAll(); toast('Example loaded: 4-year-old, 16 kg');
  });
  var dPt=$('#btnDemoPreterm');
  if(dPt) dPt.addEventListener('click',function(){
    ST.pt.wt=''; ST.pt.ageY=''; ST.pt.ageM=''; ST.pt.ageD='14'; ST.pt.gaW='28'; ST.pt.gaD='3'; ST.pt.sex='male';
    syncPanel(); renderAll(); toast('Example loaded: 28+3 preterm, 14 days old — weight estimated from Fenton');
  });
  $('#btnReset').addEventListener('click',function(){
    ST.pt={wt:'',ageY:'',ageM:'',ageD:'',gaW:'',gaD:'',sex:'male',ht:'',scr:'',wMethod:'who',adultOverride:false,k:'',na:'',glu:''};
    syncPanel(); renderAll(); toast('Patient cleared');
  });
  $('#btnPrint').addEventListener('click',function(){
    /* a collapsed card would print only its one-line answer, so open every
       strength table and safety block first, then put them back afterwards */
    var closed = $$('.fxdet:not([open])').concat($$('details.moredet:not([open])'));
    closed.forEach(function(x){ x.open=true; });
    var restore=function(){ closed.forEach(function(x){ x.open=false; });
      window.removeEventListener('afterprint',restore); };
    window.addEventListener('afterprint',restore);
    setTimeout(function(){ try{ window.print(); }catch(_){} },80);
  });
  $('#btnCsv').addEventListener('click',exportCsv);
  $('#btnAbout').addEventListener('click',function(){ ST.tab='about'; renderAll(); });
  $('#modalX').addEventListener('click',closeModal);
  $('#modal').addEventListener('click',function(e){ if(e.target===$('#modal')) closeModal(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeModal(); });
  $$('#tabs').forEach(function(t){
    t.addEventListener('click',function(e){
      var b=e.target.closest('button[data-tab]'); if(!b) return;
      ST.tab=b.getAttribute('data-tab'); renderAll();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  /* left-rail quick jumps: switch to the protocol tab, find that protocol
     and scroll to it with a visible highlight */
  $$('.chip.goto').forEach(function(b){
    b.addEventListener('click',function(){ gotoProto(b.getAttribute('data-goto')); });
  });

  /* demo quick-fill */
  $$('.quickfill').forEach(function(b){
    b.addEventListener('click',function(){
      var v=b.getAttribute('data-fill').split(',');
      ST.pt.wt=v[0]; ST.pt.ageY=v[1]; ST.pt.ageM=v[2]; ST.pt.ageD=v[3]||'';
      syncPanel(); renderAll(); toast('Patient set: '+(v[0]?v[0]+' kg':'')+(v[1]?' · '+v[1]+' y':'')+(v[2]?' '+v[2]+' m':''));
    });
  });
}
var _dh=null;
function debounceRender(){ clearTimeout(_dh); _dh=setTimeout(renderAll,120); }
function syncPanel(){
  var p=ST.pt;
  ['wt','ageY','ageM','ageD','gaW','gaD','ht','scr','k','na','glu'].forEach(function(id){ var e=$('#p_'+id); if(e) e.value=p[id]||''; });
  var sx=$('#p_sex'); if(sx) sx.value=p.sex;
  var wm=$('#p_wm'); if(wm) wm.value=p.wMethod;
  var ao=$('#p_ao'); if(ao) ao.checked=!!p.adultOverride;
}

/* ------------------------------------------------------------------ */
/* ---------------- command palette ----------------
   One box to reach anything: a drug by name, brand or indication, a protocol,
   a tab or a calculator. Ctrl/Cmd-K, or the 🔍 button.                    */
var PAL_LIST=[], PAL_IDX=0;
function palOpen(){
  var p=$('#pal'); if(!p) return;
  p.classList.add('open');
  var i=$('#palIn');
  if(i){ i.value=''; palRender(''); setTimeout(function(){ i.focus(); },30); }
}
function palClose(){ var p=$('#pal'); if(p) p.classList.remove('open'); }
function openCardNow(id){
  ST.tab='drugs'; ST.q=''; ST.sys=new Set(); ST.cls=''; ST.expand.add(id);
  pushRecent(id);
  renderAll();
  var el=document.querySelector('.card[data-id="'+String(id).replace(/"/g,'')+'"]');
  if(el){ scrollToEl(el,'center'); el.style.outline='3px solid var(--brand)';
    setTimeout(function(){ el.style.outline=''; },2200); }
}
function palItems(q){
  q=(q||'').trim().toLowerCase();
  var out=[];
  REG.forEach(function(r){
    var hay=(r.n+' '+(r.ind||'')+' '+((r.fx||[]).map(function(f){ return f.b||''; }).join(' '))).toLowerCase();
    if(!q||hay.indexOf(q)>=0) out.push({k:'Drug', l:r.n, run:function(){ openCardNow(r.id); }});
  });
  PROT.forEach(function(p){
    if(!q||p.t.toLowerCase().indexOf(q)>=0) out.push({k:'Protocol', l:p.t, run:function(){ gotoProto(p.id); }});
  });
  [['utils','Calculators: CrCl / eGFR / IBW / BSA','#uAge'],
   ['utils','Calculators: maintenance fluids & GIR','#fWt'],
   ['utils','Calculators: sodium correction','#sNa'],
   ['utils','Calculators: potassium replacement','#kSer'],
   ['utils','Calculators: unit converter','#cAmt'],
   ['drip','Drip-rate calculator','#dMl']].forEach(function(c){
    if(!q||c[1].toLowerCase().indexOf(q)>=0) out.push({k:'Tool', l:c[1], run:function(){
      ST.tab=c[0]; renderAll(); scrollToEl(document.querySelector(c[2]),'center');
    }});
  });
  TABS.forEach(function(t){
    if(!q||t[1].toLowerCase().indexOf(q)>=0) out.push({k:'Tab', l:t[1], run:function(){ ST.tab=t[0]; renderAll(); }});
  });
  return out.slice(0,40);
}
function palRender(q){
  PAL_LIST=palItems(q); PAL_IDX=0;
  var res=$('#palRes'); if(!res) return;
  if(!PAL_LIST.length){ res.innerHTML='<div class="palhint">Nothing matches. Try a drug name, a brand, or “snakebite”.</div>'; return; }
  res.innerHTML=PAL_LIST.map(function(it,i){
    return '<button data-i="'+i+'" class="'+(i===0?'sel':'')+'"><span class="pk">'+it.k+'</span><span>'+esc(it.l)+'</span></button>';
  }).join('');
  $$('#palRes button').forEach(function(b){
    b.addEventListener('click',function(){
      var it=PAL_LIST[+b.getAttribute('data-i')];
      palClose(); if(it) it.run();
    });
  });
}
function palKey(e){
  if(e.key==='ArrowDown'){ PAL_IDX=Math.min(PAL_LIST.length-1,PAL_IDX+1); e.preventDefault(); }
  else if(e.key==='ArrowUp'){ PAL_IDX=Math.max(0,PAL_IDX-1); e.preventDefault(); }
  else if(e.key==='Enter'){ var it=PAL_LIST[PAL_IDX]; palClose(); if(it) it.run(); return; }
  else if(e.key==='Escape'){ palClose(); return; }
  else return;
  $$('#palRes button').forEach(function(b,i){ b.classList.toggle('sel', i===PAL_IDX); });
  var sel=$('#palRes button.sel'); if(sel&&sel.scrollIntoView) try{ sel.scrollIntoView({block:'nearest'}); }catch(_){}
}

function init(){
  loadState();
  applyPrefs();
  /* off-DOM print area for infusion line labels */
  if(!document.getElementById('lblPrintArea')){
    var pa=document.createElement('div'); pa.id='lblPrintArea';
    document.body.appendChild(pa);
  }
  /* deep links and OS app shortcuts: ?tab=pump , ?tab=protocols , ?q=...  */
  try{
    var qs=(location.search||'').replace(/^\?/,'');
    if(qs){
      var p={};
      qs.split('&').forEach(function(kv){
        var i=kv.indexOf('=');
        if(i>0){ try{ p[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1)); }catch(_){} }
      });
      if(p.tab && TABS.some(function(t){ return t[0]===p.tab; })) ST.tab=p.tab;
      if(p.q) ST.q=p.q;
    }
  }catch(_){ /* a bad query string must never stop the app */ }
  syncPanel();
  wirePanel();
  renderAll();
  /* ---- global chrome: scrim, palette, back-to-top ---- */
  var scrim=document.createElement('div'); scrim.className='scrim'; document.body.appendChild(scrim);
  scrim.addEventListener('click',function(){ document.body.classList.remove('rail-open'); });
  var pal=document.createElement('div'); pal.id='pal'; pal.className='pal';
  pal.innerHTML='<div class="palbox"><input id="palIn" type="text" autocomplete="off" '+
    'placeholder="Jump to a drug, brand, protocol, tab or calculator…" aria-label="Jump to">'+
    '<div class="palres" id="palRes"></div>'+
    '<div class="palhint">↑ ↓ to move · Enter to open · Esc to close · Ctrl+K anywhere</div></div>';
  document.body.appendChild(pal);
  pal.addEventListener('click',function(e){ if(e.target===pal) palClose(); });
  var in2=$('#palIn');
  if(in2){
    in2.addEventListener('input',function(){ palRender(in2.value); });
    in2.addEventListener('keydown',palKey);
  }
  var fab=document.createElement('button'); fab.className='fab'; fab.id='fabTop';
  fab.type='button'; fab.title='Back to top'; fab.textContent='↑'; document.body.appendChild(fab);
  fab.addEventListener('click',function(){
    try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(_){ window.scrollTo(0,0); }
  });
  var onScroll=function(){
    var y=window.pageYOffset||document.documentElement.scrollTop||0;
    fab.classList.toggle('show', y>600);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- topbar preference buttons ---- */
  var bt=$('#btnTheme');
  if(bt) bt.addEventListener('click',function(){ ST.theme=(ST.theme==='dark'?'':'dark'); applyPrefs(); queueSave(); });
  var by=$('#btnType');
  if(by) by.addEventListener('click',function(){ ST.typeBig=!ST.typeBig; applyPrefs(); queueSave(); });
  var bp=$('#btnPal');
  if(bp) bp.addEventListener('click',palOpen);
  var br=$('#btnRail');
  if(br) br.addEventListener('click',function(){ document.body.classList.toggle('rail-open'); });
  var mc=$('#metaCtx');
  if(mc){ mc.style.cursor='pointer'; mc.title='Open the patient panel';
    mc.addEventListener('click',function(){ document.body.classList.add('rail-open'); }); }

  /* keyboard: "/" focuses search, Ctrl/Cmd-K opens the palette */
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey) && (e.key==='k'||e.key==='K')){ e.preventDefault(); palOpen(); return; }
    if(e.key==='Escape'){ palClose(); document.body.classList.remove('rail-open'); }
    if(e.key==='/' && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)){
      e.preventDefault(); ST.tab='drugs'; renderAll(); var q=$('#q'); if(q) q.focus();
    }
  });
}
return {init:init, renderAll:renderAll, state:ST};
})();
