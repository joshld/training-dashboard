const PLAN_SUGGESTION_STORAGE_KEY='trainingLogPlanSuggestionDecisions';

function loadSuggestionDecisions(){
  try{const parsed=JSON.parse(localStorage.getItem(PLAN_SUGGESTION_STORAGE_KEY)||'{}');return parsed&&typeof parsed==='object'?parsed:{};}catch(error){console.warn('Suggestion decisions could not be loaded',error);return{};}
}

function saveSuggestionDecision(id,state,note=''){
  const decisions=loadSuggestionDecisions();
  decisions[id]={state,note,updatedAt:new Date().toISOString()};
  localStorage.setItem(PLAN_SUGGESTION_STORAGE_KEY,JSON.stringify(decisions));
}

function suggestionEsc(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

function suggestionCard(item,decision){
  const state=decision?.state||'pending';
  const stateText=state==='applied'?'Applied in this browser':state==='dismissed'?'Keeping the current plan':state==='modified'?`Modified: ${decision.note}`:'';
  return `<article class="suggestion-card" data-suggestion-id="${suggestionEsc(item.id)}" data-state="${suggestionEsc(state)}">
    <div class="suggestion-top">
      <div class="suggestion-title"><p class="eyebrow">${suggestionEsc(item.workoutDay)} · ${suggestionEsc(item.workout)}</p><h3>${suggestionEsc(item.priority)} priority suggestion</h3><div class="suggestion-meta"><span class="suggestion-tag">Optional</span><span class="suggestion-tag">Plan remains unchanged until accepted</span></div></div>
      <div class="suggestion-confidence">${item.confidence??'—'}%<small>confidence</small></div>
    </div>
    <div class="suggestion-comparison"><div class="suggestion-block"><span>Current</span><strong>${suggestionEsc(item.current)}</strong></div><div class="suggestion-block"><span>Suggested</span><strong>${suggestionEsc(item.suggested)}</strong></div></div>
    <div class="suggestion-reason"><div><span>Why</span>${suggestionEsc(item.reason)}</div><div><span>Expected impact</span>${suggestionEsc(item.expectedImpact)}</div></div>
    <div class="suggestion-actions"><button class="suggestion-apply" type="button" data-suggestion-action="applied">Apply</button><button class="suggestion-modify" type="button" data-suggestion-action="modified">Modify</button><button class="suggestion-dismiss" type="button" data-suggestion-action="dismissed">Keep original</button></div>
    ${stateText?`<div class="suggestion-state">${suggestionEsc(stateText)}</div>`:''}
  </article>`;
}

function renderPlanSuggestions(suggestions=[]){
  const host=document.getElementById('planSuggestions');
  if(!host)return;
  const decisions=loadSuggestionDecisions();
  const pending=suggestions.filter(item=>(decisions[item.id]?.state||'pending')==='pending').length;
  const count=document.getElementById('planSuggestionCount');if(count)count.textContent=`${pending} pending`;
  const list=document.getElementById('planSuggestionsList');if(!list)return;
  list.innerHTML=suggestions.length?suggestions.map(item=>suggestionCard(item,decisions[item.id])).join(''):'<p class="suggestions-empty">No plan changes are currently recommended.</p>';
  list.querySelectorAll('[data-suggestion-action]').forEach(button=>button.addEventListener('click',()=>{
    const card=button.closest('[data-suggestion-id]');if(!card)return;
    const id=card.dataset.suggestionId;const action=button.dataset.suggestionAction;
    if(action==='modified'){
      const note=prompt('Describe the version you want to use instead:');
      if(!note?.trim())return;
      saveSuggestionDecision(id,'modified',note.trim());
    }else saveSuggestionDecision(id,action);
    renderPlanSuggestions(suggestions);
  }));
}

async function loadPlanSuggestions(){
  try{
    const response=await fetch(`generated-data.json?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const generated=await response.json();
    renderPlanSuggestions(generated?.plan?.suggestions||[]);
  }catch(error){
    console.warn('Plan suggestions could not be loaded',error);
    const list=document.getElementById('planSuggestionsList');if(list)list.innerHTML='<p class="suggestions-empty">Plan suggestions are temporarily unavailable.</p>';
  }
}

function loadPersistenceScripts(){
  const config=document.createElement('script');config.src='runtime-config.js?v=1.0.0';
  config.onload=()=>{const auth=document.createElement('script');auth.src='auth-persistence.js?v=1.0.0';document.head.appendChild(auth);};
  document.head.appendChild(config);
}

document.addEventListener('DOMContentLoaded',()=>{loadPlanSuggestions();loadPersistenceScripts();});
