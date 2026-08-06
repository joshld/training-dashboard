function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function renderDocument(targetId,documentData){
  const target=document.getElementById(targetId);
  if(!target||!documentData)return;
  target.innerHTML=`
    <div class="document-header">
      <div><p class="eyebrow">Training Log</p><h2>${escapeHtml(documentData.title)}</h2><p>${escapeHtml(documentData.intro)}</p></div>
      <a class="source-link" href="https://github.com/joshld/training-dashboard/blob/main/${escapeHtml(documentData.source)}" target="_blank" rel="noreferrer">View Markdown</a>
    </div>
    <div class="document-grid">
      ${documentData.sections.map(section=>`
        <section class="document-section">
          <h3>${escapeHtml(section.heading)}</h3>
          <ul>${section.items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </section>`).join('')}
    </div>`;
}

function setupTabs(){
  const buttons=[...document.querySelectorAll('.tab')];
  buttons.forEach(button=>button.addEventListener('click',()=>{
    const name=button.dataset.tab;
    buttons.forEach(item=>item.classList.toggle('active',item===button));
    document.querySelectorAll('.tab-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`tab-${name}`));
    history.replaceState(null,'',name==='dashboard'?'#dashboard':`#${name}`);
  }));
  const requested=location.hash.replace('#','');
  const initial=buttons.find(button=>button.dataset.tab===requested);
  if(initial)initial.click();
}

async function loadDashboard(){
  try{
    const response=await fetch('data.json',{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    document.getElementById('updated').textContent=`Last updated ${data.updated}`;
    document.getElementById('status').textContent=data.status;

    document.getElementById('metrics').innerHTML=data.metrics.map(item=>`<article class="metric"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.note||'')}</small></article>`).join('');
    document.getElementById('latestTitle').textContent=data.latestSession.title;
    document.getElementById('latestType').textContent=data.latestSession.type;
    document.getElementById('latestDetails').innerHTML=data.latestSession.details.map(item=>`<div class="detail"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');
    document.getElementById('strengthRows').innerHTML=data.strength.map(row=>`<tr><td>${escapeHtml(row.exercise)}</td><td>${escapeHtml(row.load)}</td><td>${escapeHtml(row.work)}</td></tr>`).join('');
    document.getElementById('coachFocus').innerHTML=data.coachFocus.map(item=>`<li>${escapeHtml(item)}</li>`).join('');
    document.getElementById('sessionRows').innerHTML=data.sessions.map(row=>`<tr><td>${escapeHtml(row.date)}</td><td>${escapeHtml(row.activity)}</td><td>${escapeHtml(row.summary)}</td><td>${escapeHtml(row.rpe||'—')}</td></tr>`).join('');

    renderDocument('runningContent',data.tabs.running);
    renderDocument('strengthContent',data.tabs.strength);
    renderDocument('recoveryContent',data.tabs.recovery);
    renderDocument('athleteContent',data.tabs.athlete);
    renderDocument('coachContent',data.tabs.coach);

    const ctx=document.getElementById('distanceChart');
    new Chart(ctx,{type:'line',data:{labels:data.weeklyDistance.labels,datasets:[{label:'Distance (km)',data:data.weeklyDistance.values,borderColor:'#6ee7b7',backgroundColor:'rgba(110,231,183,.15)',fill:true,tension:.32,spanGaps:true,pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9aa7bd'}}},scales:{x:{ticks:{color:'#9aa7bd'},grid:{color:'rgba(43,54,80,.5)'}},y:{beginAtZero:true,ticks:{color:'#9aa7bd'},grid:{color:'rgba(43,54,80,.5)'}}}}});
  }catch(error){
    console.error(error);
    document.getElementById('updated').textContent='Dashboard data could not be loaded.';
    document.getElementById('status').textContent='Data error';
  }
}

document.addEventListener('DOMContentLoaded',()=>{setupTabs();loadDashboard();});
