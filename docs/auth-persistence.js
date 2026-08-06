const AUTH_SESSION_KEY='trainingLogAuthSession';

function apiBase(){return String(window.TRAINING_LOG_CONFIG?.apiBaseUrl||'').replace(/\/$/,'');}
function authSession(){return localStorage.getItem(AUTH_SESSION_KEY)||'';}
function authHeaders(){return {'Content-Type':'application/json',Authorization:`Bearer ${authSession()}`};}
function captureAuthCallback(){
  const url=new URL(window.location.href);
  const session=url.searchParams.get('auth_session');
  if(session){localStorage.setItem(AUTH_SESSION_KEY,session);url.searchParams.delete('auth_session');url.searchParams.delete('open_tab');history.replaceState({},'',url);}
}
function renderAuthControl(){
  const heading=document.querySelector('.suggestions-heading');
  if(!heading||document.getElementById('trainingLogAuth'))return;
  const box=document.createElement('div');box.id='trainingLogAuth';box.className='training-log-auth';
  if(!apiBase())box.innerHTML='<small>Persistent updates need API configuration</small>';
  else if(authSession())box.innerHTML='<span>Signed in with GitHub</span><button type="button" id="trainingLogSignOut">Sign out</button>';
  else box.innerHTML='<a class="suggestion-apply" href="'+apiBase()+'/api/auth/login">Sign in with GitHub</a>';
  heading.appendChild(box);
  document.getElementById('trainingLogSignOut')?.addEventListener('click',()=>{localStorage.removeItem(AUTH_SESSION_KEY);location.reload();});
}
async function persistDecision(id,decision){
  if(!apiBase()||!authSession())return;
  const response=await fetch(apiBase()+'/api/plan/decision',{method:'POST',headers:authHeaders(),body:JSON.stringify({suggestionId:id,action:decision.state,note:decision.note||''})});
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||`HTTP ${response.status}`);
  const card=document.querySelector(`[data-suggestion-id="${CSS.escape(id)}"]`);
  card?.insertAdjacentHTML('beforeend','<div class="suggestion-state">Saved to GitHub. It will appear on every device after deployment.</div>');
}
function watchSuggestionActions(){
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-suggestion-action]');if(!button)return;
    const card=button.closest('[data-suggestion-id]');if(!card)return;
    setTimeout(async()=>{
      const decisions=loadSuggestionDecisions();const decision=decisions[card.dataset.suggestionId];if(!decision)return;
      if(!authSession()){renderAuthControl();return;}
      try{await persistDecision(card.dataset.suggestionId,decision);}catch(error){alert(`The local decision was saved, but GitHub was not updated: ${error.message}`);}
    },50);
  });
}

document.addEventListener('DOMContentLoaded',()=>{captureAuthCallback();renderAuthControl();watchSuggestionActions();});
