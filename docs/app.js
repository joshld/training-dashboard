const pageMeta={dashboard:['Dashboard','Your current training, recovery and upcoming work.'],plan:['Training Plan','Your schedule across the next training weeks.'],activities:['Activities','Completed running, strength and other sessions.'],performance:['Performance','Training volume and progression indicators.'],recovery:['Recovery','Current recovery, nutrition and injury-monitoring notes.'],coach:['Coach','Current observations, priorities and recommendations.']};
let dashboardData=null;

function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

function renderDocument(targetId,documentData){
  const target=document.getElementById(targetId);if(!target||!documentData)return;
  target.innerHTML=`<div class="document-header"><div><p class="eyebrow">Training Log</p><h2>${escapeHtml(documentData.title)}</h2><p>${escapeHtml(documentData.intro)}</p></div></div><div class="document-grid">${documentData.sections.map(section=>`<section class="document-section"><h3>${escapeHtml(section.heading)}</h3><ul>${section.items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`).join('')}</div>`;
}

function openTab(name){
  const buttons=[...document.querySelectorAll('.nav-item')];const selected=buttons.find(button=>button.dataset.tab===name)||buttons[0];
  buttons.forEach(item=>item.classList.toggle('active',item===selected));
  document.querySelectorAll('.tab-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`tab-${selected.dataset.tab}`));
  const meta=pageMeta[selected.dataset.tab]||pageMeta.dashboard;document.getElementById('pageTitle').textContent=meta[0];document.getElementById('pageSubtitle').textContent=meta[1];
  history.replaceState(null,'',`#${selected.dataset.tab}`);window.scrollTo({top:0,behavior:'smooth'});
}

function setupNavigation(){
  document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.tab)));
  document.querySelectorAll('[data-open-tab]').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.openTab)));
  openTab(location.hash.replace('#','')||'dashboard');
}

function workoutTypeClass(title=''){const value=title.toLowerCase();if(value.includes('easy'))return'easy';if(value.includes('long')||value.includes('race'))return'long';if(value.includes('tempo'))return'tempo';if(value.includes('interval'))return'interval';return'general';}

function renderCalendar(plan){
  const container=document.getElementById('calendarWeeks');
  container.innerHTML=plan.weeks.map(week=>`<article class="calendar-week ${week.current?'current-week':''}"><div class="calendar-week-head"><div><p class="eyebrow">${escapeHtml(week.dateRange)}</p><h3>${escapeHtml(week.name)}</h3></div><div><strong>${escapeHtml(week.plannedDistance)}</strong><small>planned</small></div></div><div class="calendar-grid">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=>{const workout=week.workouts.find(item=>item.day===day);return `<div class="calendar-day"><span class="day-name">${day}</span>${workout?`<button class="calendar-workout ${workoutTypeClass(workout.title)} ${workout.completed?'complete':''}" data-workout-title="${escapeHtml(workout.title)}"><small>${workout.completed?'Completed':escapeHtml(workout.distance)}</small><strong>${escapeHtml(workout.title)}</strong></button>`:'<div class="calendar-rest">Rest</div>'}</div>`;}).join('')}</div></article>`).join('');
}

function renderPlan(plan){
  const container=document.getElementById('planWeeks');
  container.innerHTML=plan.weeks.map(week=>{const completed=week.workouts.filter(workout=>workout.completed).length;const percent=Math.round((completed/week.workouts.length)*100);return `<article class="panel plan-week ${week.current?'current-week':''}"><div class="week-card-header"><div><p class="eyebrow">${escapeHtml(week.dateRange)}</p><h2>${escapeHtml(week.name)}</h2></div><div class="week-total"><strong>${escapeHtml(week.plannedDistance)}</strong><small>planned</small></div></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><div class="week-meta"><span>${completed}/${week.workouts.length} workouts complete</span><span>${escapeHtml(week.progressDistance)}</span></div><div class="workout-list">${week.workouts.map(workout=>`<article class="workout-row ${workout.completed?'complete':''}"><div class="workout-marker">${workout.completed?'✓':escapeHtml(workout.day.slice(0,1))}</div><div class="workout-main"><div><strong>${escapeHtml(workout.day)} · ${escapeHtml(workout.title)}</strong><span>${escapeHtml(workout.distance)}</span></div>${workout.summary?`<p>${escapeHtml(workout.summary)}</p>`:''}${workout.steps?`<ol>${workout.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>`:''}</div></article>`).join('')}</div></article>`;}).join('');
}

function renderActivities(sessions,filter='all'){
  const filtered=filter==='all'?sessions:sessions.filter(item=>item.activity===filter);
  const html=filtered.map(item=>`<article class="activity-card"><div class="activity-icon ${item.activity.toLowerCase()}">${item.activity==='Running'?'R':'S'}</div><div><p class="activity-date">${escapeHtml(item.date)}</p><h3>${escapeHtml(item.activity)}</h3><p>${escapeHtml(item.summary)}</p></div><span class="pill">RPE ${escapeHtml(item.rpe||'—')}</span></article>`).join('');
  document.getElementById('activityCards').innerHTML=html;document.getElementById('dashboardActivities').innerHTML=html;
}

function setupFilters(){document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(item=>item.classList.toggle('active',item===button));renderActivities(dashboardData.sessions,button.dataset.filter);}));}

function createDistanceChart(id,data){const ctx=document.getElementById(id);if(!ctx)return;new Chart(ctx,{type:'line',data:{labels:data.labels,datasets:[{label:'Distance (km)',data:data.values,borderColor:'#71e6b3',backgroundColor:'rgba(113,230,179,.12)',fill:true,tension:.34,spanGaps:true,pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8e9ab0'},grid:{color:'rgba(43,54,80,.45)'}},y:{beginAtZero:true,ticks:{color:'#8e9ab0'},grid:{color:'rgba(43,54,80,.45)'}}}}});}

async function loadDashboard(){
  try{
    const response=await fetch('data.json',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();dashboardData=data;
    document.getElementById('updated').textContent=`Last updated ${data.updated}`;document.getElementById('status').textContent=data.status;
    document.getElementById('metrics').innerHTML=data.metrics.map(item=>`<article class="metric"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.note||'')}</small></article>`).join('');
    document.getElementById('coachFocus').innerHTML=data.coachFocus.map(item=>`<li>${escapeHtml(item)}</li>`).join('');
    document.getElementById('strengthRows').innerHTML=data.strength.map(row=>`<tr><td>${escapeHtml(row.exercise)}</td><td>${escapeHtml(row.load)}</td><td>${escapeHtml(row.work)}</td></tr>`).join('');
    document.getElementById('latestTitle').textContent=data.latestSession.title;document.getElementById('latestType').textContent=data.latestSession.type;document.getElementById('latestDetails').innerHTML=data.latestSession.details.map(item=>`<div class="detail"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');
    const next=data.plan.nextWorkout;document.getElementById('nextWorkoutTitle').textContent=next.title;document.getElementById('nextWorkoutDate').textContent=next.date;document.getElementById('nextWorkoutDetails').innerHTML=next.details.map(item=>`<div class="detail"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('');
    const current=data.plan.weeks.find(week=>week.current)||data.plan.weeks[0];const completed=current.workouts.filter(workout=>workout.completed).length;const percent=Math.round((completed/current.workouts.length)*100);document.getElementById('currentWeekTitle').textContent=`${current.name} · ${current.dateRange}`;document.getElementById('currentWeekProgressText').textContent=`${completed}/${current.workouts.length}`;document.getElementById('currentWeekProgress').style.width=`${percent}%`;document.getElementById('currentWeekSummary').innerHTML=`<span>${escapeHtml(current.progressDistance)}</span><span>${escapeHtml(current.plannedDistance)} planned</span>`;
    renderCalendar(data.plan);renderPlan(data.plan);renderActivities(data.sessions);renderDocument('runningContent',data.tabs.running);renderDocument('strengthContent',data.tabs.strength);renderDocument('recoveryContent',data.tabs.recovery);renderDocument('coachContent',data.tabs.coach);createDistanceChart('distanceChart',data.weeklyDistance);createDistanceChart('performanceDistanceChart',data.weeklyDistance);setupFilters();
  }catch(error){console.error(error);document.getElementById('updated').textContent='Dashboard data could not be loaded.';document.getElementById('status').textContent='Data error';}
}

document.addEventListener('DOMContentLoaded',()=>{setupNavigation();loadDashboard();});
