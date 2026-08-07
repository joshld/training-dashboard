const GENERATED_DATA_URL='generated-data.json';

function generatedActivityToSession(item){
  const parts=[];
  if(item.title)parts.push(item.title);
  if(item.distanceKm!=null)parts.push(`${Number(item.distanceKm).toFixed(2)} km`);
  if(item.duration)parts.push(item.duration);
  if(item.summary)parts.push(item.summary);
  return{
    date:item.date,
    activity:item.activity||'Other',
    summary:parts.join(' · '),
    rpe:item.rpe||'—',
    generated:true
  };
}

function mergeGeneratedSessions(existing=[],generated=[]){
  const keyed=new Map();
  for(const item of [...generated.map(generatedActivityToSession),...existing]){
    const key=`${item.date}|${item.activity}|${item.summary}`;
    if(!keyed.has(key))keyed.set(key,item);
  }
  return [...keyed.values()].sort((a,b)=>Date.parse(b.date||0)-Date.parse(a.date||0));
}

function renderGeneratedActivityFallback(generated){
  if(Array.isArray(generated?.sessions))renderActivities(generated.sessions.map(generatedActivityToSession));
}

function applyGeneratedPlan(generated){
  if(!generated)return;
  if(!dashboardData){renderGeneratedActivityFallback(generated);return;}
  dashboardData.sessions=mergeGeneratedSessions(dashboardData.sessions||[],generated.sessions||[]);
  const current=dashboardData.plan?.weeks?.find(week=>week.current);
  if(current&&generated.plan){
    current.name=generated.plan.title||current.name;
    current.dateRange=generated.plan.dateRange||current.dateRange;
    current.plannedDistance=generated.plan.plannedDistance||current.plannedDistance;
    current.progressDistance=generated.plan.progressDistance||current.progressDistance;
    if(Array.isArray(generated.plan.workouts)&&generated.plan.workouts.length)current.workouts=generated.plan.workouts;
  }
  if(Array.isArray(generated.plan?.coachGuidance)&&generated.plan.coachGuidance.length){
    dashboardData.coachFocus=generated.plan.coachGuidance;
  }
  if(generated.updated)setText('updated',`Last updated ${generated.updated}`);
  if(generated.status)setText('status',generated.status);
  renderActivities(dashboardData.sessions);
  if(current){renderCalendar(dashboardData.plan);renderPlan(dashboardData.plan);}
  if(dashboardData.coachFocus)setHtml('coachFocus',dashboardData.coachFocus.map(item=>`<li>${escapeHtml(item)}</li>`).join(''));
}

async function loadGeneratedMarkdownData(){
  try{
    const response=await fetch(`${GENERATED_DATA_URL}?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok){
      if(response.status!==404)console.warn(`Generated data load failed: HTTP ${response.status}`);
      return;
    }
    const generated=await response.json();
    let settled=false;
    const cleanup=()=>{
      document.removeEventListener('training-dashboard-ready',onReady);
      document.removeEventListener('training-dashboard-error',onError);
    };
    const onReady=()=>{if(settled)return;settled=true;cleanup();applyGeneratedPlan(generated);};
    const onError=()=>{if(settled)return;settled=true;cleanup();renderGeneratedActivityFallback(generated);};
    document.addEventListener('training-dashboard-ready',onReady);
    document.addEventListener('training-dashboard-error',onError);
    if(dashboardData)onReady();
    else if(dashboardLoadFailed)onError();
  }catch(error){console.warn('Generated Markdown data is unavailable; using legacy dashboard data.',error);}
}

document.addEventListener('DOMContentLoaded',loadGeneratedMarkdownData);
