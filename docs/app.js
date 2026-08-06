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

function openTab(name){
  const buttons=[...document.querySelectorAll('.tab')];
  const selected=buttons.find(button=>button.dataset.tab===name)||buttons[0];
  buttons.forEach(item=>item.classList.toggle('active',item===selected));
  document.querySelectorAll('.tab-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`tab-${selected.dataset.tab}`));
  history.replaceState(null,'',selected.dataset.tab==='dashboard'?'#dashboard':`#${selected.dataset.tab}`);
  window.scrollTo({top:0,behavior:'smooth'});
}

function setupTabs(){
  document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.tab)));
  document.querySelectorAll('[data-open-tab]').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.openTab)));
  const requested=location.hash.replace('#','');
  if(requested)openTab(requested);
}

function renderPlan(plan){
  const container=document.getElementById('planWeeks');
  container.innerHTML=plan.weeks.map(week=>{
    const completed=week.workouts.filter(workout=>workout.completed).length;
    const percent=Math.round((completed/week.workouts.length)*100);
    return `<article class="panel plan-week ${week.current?'current-week':''}">
      <div class="week-card-header">
        <div><p class="eyebrow">${escapeHtml(week.dateRange)}</p><h2>${escapeHtml(week.name)}</h2></div>
        <div class="week-total"><strong>${escapeHtml(week.plannedDistance)}</strong><small>planned</small></div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
      <div class="week-meta"><span>${completed}/${week.workouts.length} workouts complete</span><span>${escapeHtml(week.progressDistance)}</span></div>
      <div class="workout-list">${week.workouts.map(workout=>`
        <article class="workout-row ${workout.completed?'complete':''}">
          <div class="workout-marker">${workout.completed?'✓':escapeHtml(workout.day.slice(0,1))}</div>
          <div class="workout-main"><div><strong>${escapeHtml(workout.day)} · ${escapeHtml(workout.title)}</strong><span>${escapeHtml(workout.distance)}</span></div>${workout.summary?`<p>${escapeHtml(workout.summary)}</p>`:''}${workout.steps?`<ol>${workout.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>`:''}</div>
        </article>`).join('')}</div>
    </article>`;
  }).join('');
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

    const next=data.plan.nextWorkout;
    document.getElementById('nextWorkoutTitle').textContent=next.title;
    document.getElementById('nextWorkoutDate').textContent=next.date;
    document.getElementById('nextWorkoutDetails').innerHTML=next.details.map(item=>`<div class="detail"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');

    const current=data.plan.weeks.find(week=>week.current)||data.plan.weeks[0];
    const completed=current.workouts.filter(workout=>workout.completed).length;
    const percent=Math.round((completed/current.workouts.length)*100);
    document.getElementById('currentWeekTitle').textContent=`${current.name} · ${current.dateRange}`;
    document.getElementById('currentWeekProgressText').textContent=`${completed}/${current.workouts.length}`;
    document.getElementById('currentWeekProgress').style.width=`${percent}%`;
    document.getElementById('currentWeekSummary').innerHTML=`<span>${escapeHtml(current.progressDistance)}</span><span>${escapeHtml(current.plannedDistance)} planned</span>`;
    renderPlan(data.plan);

    renderDocument('runningContent',data.tabs.running);
    renderDocument('strengthContent',data.tabs.strength);
    renderDocument('recoveryContent',data.tabs.recovery);
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
