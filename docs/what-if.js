const WHAT_IF_HISTORY_KEY='trainingLogWhatIfHistory';
let whatIfPlan=null;

function wiEsc(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function wiNumber(value){const match=String(value||'').match(/([0-9]+(?:\.[0-9]+)?)/);return match?Number(match[1]):0;}
function wiPlanDistance(plan){return (plan?.workouts||[]).reduce((sum,w)=>sum+(String(w.distance||'').toLowerCase().includes('km')?wiNumber(w.distance):0),0);}
function wiQualityCount(plan){return (plan?.workouts||[]).filter(w=>/interval|tempo|threshold|hill|race practice|marathon/i.test(w.title||'')).length;}
function wiLongRun(plan){return Math.max(0,...(plan?.workouts||[]).map(w=>/long run|race practice/i.test(w.title||'')?wiNumber(w.distance):0));}
function wiRecoveryScore(plan){const quality=wiQualityCount(plan),distance=wiPlanDistance(plan),strength=(plan?.workouts||[]).filter(w=>/strength|arms|gym|push|pull|legs/i.test(`${w.title} ${w.distance}`)).length;return Math.max(1,Math.min(5,5-Math.round(distance/35)-Math.max(0,quality-2)-Math.max(0,strength-2)));}
function wiStars(n){return '★'.repeat(n)+'☆'.repeat(5-n);}
function clonePlan(plan){return JSON.parse(JSON.stringify(plan));}

function analyseScenario(text,plan){
  const proposed=clonePlan(plan);const q=text.trim();const lower=q.toLowerCase();let action='No recognised change';let assumptions=[];
  const workouts=proposed.workouts||[];
  if(/skip|remove|miss/.test(lower)){
    const target=workouts.find(w=>lower.includes(String(w.day||'').toLowerCase())||lower.includes(String(w.title||'').toLowerCase().split(' ')[0]));
    if(target){target._removed=true;action=`Skip ${target.day} ${target.title}`;}else assumptions.push('No specific workout was identified, so the next incomplete workout was removed.');
    const selected=target||workouts.find(w=>!w.completed);if(selected){selected._removed=true;action=`Skip ${selected.day} ${selected.title}`;}
    proposed.workouts=workouts.filter(w=>!w._removed);
  }else if(/move/.test(lower)){
    const target=workouts.find(w=>/long run|race practice/i.test(w.title||''))||workouts.find(w=>!w.completed);const dayMatch=lower.match(/to\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/i);
    if(target&&dayMatch){const map={monday:'Mon',tuesday:'Tue',wednesday:'Wed',thursday:'Thu',friday:'Fri',saturday:'Sat',sunday:'Sun',mon:'Mon',tue:'Tue',wed:'Wed',thu:'Thu',fri:'Fri',sat:'Sat',sun:'Sun'};const old=target.day;target.day=map[dayMatch[1].toLowerCase()];action=`Move ${target.title} from ${old} to ${target.day}`;}else assumptions.push('The simulator could not identify both a workout and destination day.');
  }else if(/shorten|reduce/.test(lower)){
    const target=workouts.find(w=>/long run|race practice/i.test(w.title||''))||workouts.find(w=>!w.completed&&/km/i.test(w.distance||''));const km=lower.match(/(?:to|by)\s+([0-9]+(?:\.[0-9]+)?)\s*km/);
    if(target){const old=wiNumber(target.distance);const next=km?(lower.includes(' by ')?Math.max(0,old-Number(km[1])):Number(km[1])):Math.max(0,old-4);target.distance=`${next} km`;action=`Shorten ${target.title} from ${old} km to ${next} km`;} 
  }else if(/extend|increase/.test(lower)){
    const target=workouts.find(w=>/long run|race practice/i.test(w.title||''))||workouts.find(w=>!w.completed&&/km/i.test(w.distance||''));const km=lower.match(/(?:to|by)\s+([0-9]+(?:\.[0-9]+)?)\s*km/);
    if(target){const old=wiNumber(target.distance);const next=km?(lower.includes(' by ')?old+Number(km[1]):Number(km[1])):old+2;target.distance=`${next} km`;action=`Extend ${target.title} from ${old} km to ${next} km`;}
  }else if(/add.*soccer|play.*soccer/.test(lower)){workouts.push({day:'Sun',title:'Soccer',distance:'90 min',completed:false,summary:'Added scenario session'});action='Add soccer session';}
  else if(/add.*(gym|strength)|heavy squats/.test(lower)){workouts.push({day:'Fri',title:'Strength',distance:'Gym',completed:false,summary:'Added scenario session'});action='Add strength session';}
  else if(/rest|recovery day/.test(lower)){const target=workouts.find(w=>!w.completed);if(target){target._removed=true;proposed.workouts=workouts.filter(w=>!w._removed);action=`Replace ${target.day} ${target.title} with rest`;}}
  else assumptions.push('This first version recognises skip, move, shorten, extend, add soccer, add strength and add rest scenarios.');

  const currentMetrics={distance:wiPlanDistance(plan),quality:wiQualityCount(plan),longRun:wiLongRun(plan),recovery:wiRecoveryScore(plan)};
  const proposedMetrics={distance:wiPlanDistance(proposed),quality:wiQualityCount(proposed),longRun:wiLongRun(proposed),recovery:wiRecoveryScore(proposed)};
  const distanceDelta=proposedMetrics.distance-currentMetrics.distance;
  const recoveryDelta=proposedMetrics.recovery-currentMetrics.recovery;
  let recommendation='The proposed change is broadly neutral.';
  if(recoveryDelta>0&&distanceDelta<0)recommendation='Reasonable when fatigue is elevated; it reduces load while preserving most of the week.';
  else if(recoveryDelta<0)recommendation='Use caution. This increases recovery demand and may compromise the next key session.';
  else if(distanceDelta>5)recommendation='The extra volume is meaningful. Only apply it when recovery and schedule allow.';
  if(proposedMetrics.quality>3)recommendation='Not recommended: the proposed week contains too many demanding sessions close together.';
  return{query:q,action,assumptions,currentMetrics,proposedMetrics,recommendation,confidence:assumptions.length?68:86,proposed};
}

function renderWhatIfResult(result){const host=document.getElementById('whatIfResult');if(!host)return;const row=(label,a,b)=>`<div class="wi-row"><span>${wiEsc(label)}</span><strong>${wiEsc(a)}</strong><strong>${wiEsc(b)}</strong></div>`;host.hidden=false;host.innerHTML=`<div class="wi-result-head"><div><p class="eyebrow">Simulation</p><h3>${wiEsc(result.action)}</h3></div><span class="suggestion-count">${result.confidence}% confidence</span></div><div class="wi-table"><div class="wi-row wi-head"><span>Measure</span><strong>Current</strong><strong>Proposed</strong></div>${row('Weekly distance',`${result.currentMetrics.distance.toFixed(1)} km`,`${result.proposedMetrics.distance.toFixed(1)} km`)}${row('Quality sessions',result.currentMetrics.quality,result.proposedMetrics.quality)}${row('Longest run',`${result.currentMetrics.longRun} km`,`${result.proposedMetrics.longRun} km`)}${row('Recovery outlook',wiStars(result.currentMetrics.recovery),wiStars(result.proposedMetrics.recovery))}</div><div class="wi-recommendation"><span>Recommendation</span><p>${wiEsc(result.recommendation)}</p></div>${result.assumptions.length?`<div class="wi-assumptions"><span>Assumptions</span><ul>${result.assumptions.map(x=>`<li>${wiEsc(x)}</li>`).join('')}</ul></div>`:''}<div class="wi-actions"><button id="whatIfApply" class="suggestion-apply" type="button">Save proposed scenario</button><button id="whatIfCopy" class="suggestion-modify" type="button">Copy for coach</button><button id="whatIfDiscard" class="suggestion-dismiss" type="button">Discard</button></div><p class="wi-note">Saving records the scenario in this browser. It does not alter the Markdown plan automatically.</p>`;
  document.getElementById('whatIfApply')?.addEventListener('click',()=>{const history=JSON.parse(localStorage.getItem(WHAT_IF_HISTORY_KEY)||'[]');history.unshift({...result,savedAt:new Date().toISOString()});localStorage.setItem(WHAT_IF_HISTORY_KEY,JSON.stringify(history.slice(0,25)));document.getElementById('whatIfApply').textContent='Saved';});
  document.getElementById('whatIfCopy')?.addEventListener('click',async()=>{const text=`What if scenario: ${result.query}\nProposed change: ${result.action}\nRecommendation: ${result.recommendation}\nCurrent distance: ${result.currentMetrics.distance.toFixed(1)} km\nProposed distance: ${result.proposedMetrics.distance.toFixed(1)} km`;await navigator.clipboard.writeText(text);document.getElementById('whatIfCopy').textContent='Copied';});
  document.getElementById('whatIfDiscard')?.addEventListener('click',()=>{host.hidden=true;host.innerHTML='';});
}

async function initWhatIf(){try{const response=await fetch(`generated-data.json?v=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();whatIfPlan=data.plan;}catch(error){console.warn('What If plan load failed',error);}
  const form=document.getElementById('whatIfForm');const input=document.getElementById('whatIfInput');form?.addEventListener('submit',event=>{event.preventDefault();if(!whatIfPlan||!input?.value.trim())return;renderWhatIfResult(analyseScenario(input.value,whatIfPlan));});
  document.querySelectorAll('[data-what-if-prompt]').forEach(button=>button.addEventListener('click',()=>{if(input){input.value=button.dataset.whatIfPrompt;input.focus();}}));
}
document.addEventListener('DOMContentLoaded',initWhatIf);
