const pageMeta={dashboard:['Dashboard','Your current training, recovery and upcoming work.'],plan:['Training Plan','Your schedule across the next training weeks.'],activities:['Activities','Completed running, strength and other sessions.'],performance:['Performance','Training volume and progression indicators.'],recovery:['Recovery','Current recovery, nutrition and injury-monitoring notes.'],coach:['Coach','Current observations, priorities and recommendations.']};
let dashboardData=null;
let charts=[];

function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function byId(id){return document.getElementById(id);}
function setText(id,value){const el=byId(id);if(el)el.textContent=value;}
function setHtml(id,value){const el=byId(id);if(el)el.innerHTML=value;}

function renderDocument(targetId,documentData){
  const target=byId(targetId);if(!target||!documentData)return;
  target.innerHTML=`<div class="document-header"><div><p class="eyebrow">Training Log</p><h2>${escapeHtml(documentData.title)}</h2><p>${escapeHtml(documentData.intro)}</p></div></div><div class="document-grid">${documentData.sections.map(section=>`<section class="document-section"><h3>${escapeHtml(section.heading)}</h3><ul>${section.items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`).join('')}</div>`;
}

function openTab(name){
  const buttons=[...document.querySelectorAll('.nav-item')];const selected=buttons.find(button=>button.dataset.tab===name)||buttons[0];
  buttons.forEach(item=>item.classList.toggle('active',item===selected));
  document.querySelectorAll('.tab-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`tab-${selected.dataset.tab}`));
  const meta=pageMeta[selected.dataset.tab]||pageMeta.dashboard;setText('pageTitle',meta[0]);setText('pageSubtitle',meta[1]);
  history.replaceState(null,'',`#${selected.dataset.tab}`);window.scrollTo({top:0,behavior:'smooth'});
  charts.forEach(chart=>chart.resize());
}

function setupNavigation(){
  document.querySelectorAll('.nav-item').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.tab)));
  document.querySelectorAll('[data-open-tab]').forEach(button=>button.addEventListener('click',()=>openTab(button.dataset.openTab)));
  openTab(location.hash.replace('#','')||'dashboard');
}

function workoutTypeClass(title=''){const value=title.toLowerCase();if(value.includes('easy'))return'easy';if(value.includes('long')||value.includes('race'))return'long';if(value.includes('tempo'))return'tempo';if(value.includes('interval'))return'interval';return'general';}

function renderCalendar(plan){
  const container=byId('calendarWeeks');if(!container)return;
  container.innerHTML=plan.weeks.map(week=>`<article class="calendar-week ${week.current?'current-week':''}"><div class="calendar-week-head"><div><p class="eyebrow">${escapeHtml(week.dateRange)}</p><h3>${escapeHtml(week.name)}</h3></div><div><strong>${escapeHtml(week.plannedDistance)}</strong><small>planned</small></div></div><div class="calendar-grid">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=>{const workout=week.workouts.find(item=>item.day===day);return `<div class="calendar-day"><span class="day-name">${day}</span>${workout?`<div class="calendar-workout ${workoutTypeClass(workout.title)} ${workout.completed?'complete':''}"><small>${workout.completed?'Completed':escapeHtml(workout.distance)}</small><strong>${escapeHtml(workout.title)}</strong></div>`:'<div class="calendar-rest">Rest</div>'}</div>`;}).join('')}</div></article>`).join('');
}

function renderPlan(plan){
  const container=byId('planWeeks');if(!container)return;
  container.innerHTML=plan.weeks.map(week=>{const completed=week.workouts.filter(workout=>workout.completed).length;const percent=Math.round((completed/week.workouts.length)*100);return `<article class="panel plan-week ${week.current?'current-week':''}"><div class="week-card-header"><div><p class="eyebrow">${escapeHtml(week.dateRange)}</p><h2>${escapeHtml(week.name)}</h2></div><div class="week-total"><strong>${escapeHtml(week.plannedDistance)}</strong><small>planned</small></div></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><div class="week-meta"><span>${completed}/${week.workouts.length} workouts complete</span><span>${escapeHtml(week.progressDistance)}</span></div><div class="workout-list">${week.workouts.map(workout=>`<article class="workout-row ${workout.completed?'complete':''}"><div class="workout-marker">${workout.completed?'✓':escapeHtml(workout.day.slice(0,1))}</div><div class="workout-main"><div><strong>${escapeHtml(workout.day)} · ${escapeHtml(workout.title)}</strong><span>${escapeHtml(workout.distance)}</span></div>${workout.summary?`<p>${escapeHtml(workout.summary)}</p>`:''}${workout.steps?`<ol>${workout.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol>`:''}</div></article>`).join('')}</div></article>`;}).join('');
}

function renderActivities(sessions,filter='all'){
  const filtered=filter==='all'?sessions:sessions.filter(item=>item.activity===filter);
  const html=filtered.map(item=>`<article class="activity-card"><div class="activity-icon ${item.activity.toLowerCase()}">${item.activity==='Running'?'R':'S'}</div><div><p class="activity-date">${escapeHtml(item.date)}</p><h3>${escapeHtml(item.activity)}</h3><p>${escapeHtml(item.summary)}</p></div><span class="pill">RPE ${escapeHtml(item.rpe||'—')}</span></article>`).join('');
  setHtml('activityCards',html||'<p class="empty-state">No matching activities.</p>');setHtml('dashboardActivities',html||'<p class="empty-state">No activities logged yet.</p>');
}

function renderWorkoutReport(){
  setText('reportTitle','Over/under tempo');
  setText('reportScore','9.5 / 10');
  setHtml('reportSummary',`<p class="report-lead">All four quality kilometres were completed within three seconds of their prescribed pace.</p><div class="report-callout"><strong>Coach takeaway</strong><p>Excellent pacing discipline. The faster reps stayed controlled, and the session felt comfortably hard rather than maximal.</p></div>`);
  const reps=[['4:35','Target 4:35','On target'],['4:18','Target 4:15','+3 sec'],['4:33','Target 4:35','−2 sec'],['4:18','Target 4:15','+3 sec']];
  setHtml('reportReps',reps.map((rep,index)=>`<div class="rep-card"><span>Rep ${index+1}</span><strong>${rep[0]}</strong><small>${rep[1]}</small><em>${rep[2]}</em></div>`).join(''));
}

function setupFilters(){document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(item=>item.classList.toggle('active',item===button));if(dashboardData)renderActivities(dashboardData.sessions,button.dataset.filter);}));}

function createDistanceChart(id,data){
  const ctx=byId(id);if(!ctx)return;
  const fallback=byId(`${id}Fallback`);
  if(typeof Chart==='undefined'){
    ctx.hidden=true;if(fallback)fallback.hidden=false;return;
  }
  try{
    const chart=new Chart(ctx,{type:'line',data:{labels:data.labels,datasets:[{label:'Distance (km)',data:data.values,borderColor:'#71e6b3',backgroundColor:'rgba(113,230,179,.12)',fill:true,tension:.34,spanGaps:true,pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#8e9ab0'},grid:{color:'rgba(43,54,80,.45)'}},y:{beginAtZero:true,ticks:{color:'#8e9ab0'},grid:{color:'rgba(43,54,80,.45)'}}}}});
    charts.push(chart);
  }catch(error){console.error(`Chart ${id} failed`,error);ctx.hidden=true;if(fallback)fallback.hidden=false;}
}

function renderCore(data){
  setText('updated',`Last updated ${data.updated}`);setText('status',data.status);
  setHtml('metrics',data.metrics.map(item=>`<article class="metric"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><small>${escapeHtml(item.note||'')}</small></article>`).join(''));
  setHtml('coachFocus',data.coachFocus.map(item=>`<li>${escapeHtml(item)}</li>`).join(''));
  setHtml('strengthRows',data.strength.map(row=>`<tr><td>${escapeHtml(row.exercise)}</td><td>${escapeHtml(row.load)}</td><td>${escapeHtml(row.work)}</td></tr>`).join(''));
  setText('latestTitle',data.latestSession.title);setText('latestType',data.latestSession.type);setHtml('latestDetails',data.latestSession.details.map(item=>`<div class="detail"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join(''));
  const next=data.plan.nextWorkout;setText('nextWorkoutTitle',next.title);setText('nextWorkoutDate',next.date);setHtml('nextWorkoutDetails',next.details.map(item=>`<div class="detail"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join(''));
  const current=data.plan.weeks.find(week=>week.current)||data.plan.weeks[0];const completed=current.workouts.filter(workout=>workout.completed).length;const percent=Math.round((completed/current.workouts.length)*100);setText('currentWeekTitle',`${current.name} · ${current.dateRange}`);setText('currentWeekProgressText',`${completed}/${current.workouts.length}`);const progress=byId('currentWeekProgress');if(progress)progress.style.width=`${percent}%`;setHtml('currentWeekSummary',`<span>${escapeHtml(current.progressDistance)}</span><span>${escapeHtml(current.plannedDistance)} planned</span>`);
  renderCalendar(data.plan);renderPlan(data.plan);renderActivities(data.sessions);renderWorkoutReport();renderDocument('runningContent',data.tabs.running);renderDocument('strengthContent',data.tabs.strength);renderDocument('recoveryContent',data.tabs.recovery);renderDocument('coachContent',data.tabs.coach);
}

async function loadDashboard(){
  try{
    const response=await fetch(`data.json?v=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();dashboardData=data;
    renderCore(data);
    createDistanceChart('distanceChart',data.weeklyDistance);createDistanceChart('performanceDistanceChart',data.weeklyDistance);
  }catch(error){
    console.error('Dashboard load failed',error);setText('updated','Dashboard data could not be loaded.');setText('status','Data error');
    const notice=byId('dashboardNotice');if(notice){notice.hidden=false;notice.textContent='The dashboard could not load its data. Please refresh after the latest deployment completes.';}
  }
}

document.addEventListener('DOMContentLoaded',()=>{setupNavigation();setupFilters();loadDashboard();});
