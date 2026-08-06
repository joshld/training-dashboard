async function loadDashboard(){
  try{
    const response=await fetch('data.json',{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const data=await response.json();
    document.getElementById('updated').textContent=`Last updated ${data.updated}`;
    document.getElementById('status').textContent=data.status;

    const metrics=document.getElementById('metrics');
    metrics.innerHTML=data.metrics.map(item=>`<article class="metric"><span>${item.label}</span><strong>${item.value}</strong><small>${item.note||''}</small></article>`).join('');

    document.getElementById('latestTitle').textContent=data.latestSession.title;
    document.getElementById('latestType').textContent=data.latestSession.type;
    document.getElementById('latestDetails').innerHTML=data.latestSession.details.map(item=>`<div class="detail"><span>${item.label}</span><strong>${item.value}</strong></div>`).join('');

    document.getElementById('strengthRows').innerHTML=data.strength.map(row=>`<tr><td>${row.exercise}</td><td>${row.load}</td><td>${row.work}</td></tr>`).join('');
    document.getElementById('coachFocus').innerHTML=data.coachFocus.map(item=>`<li>${item}</li>`).join('');
    document.getElementById('sessionRows').innerHTML=data.sessions.map(row=>`<tr><td>${row.date}</td><td>${row.activity}</td><td>${row.summary}</td><td>${row.rpe||'—'}</td></tr>`).join('');

    const ctx=document.getElementById('distanceChart');
    new Chart(ctx,{type:'line',data:{labels:data.weeklyDistance.labels,datasets:[{label:'Distance (km)',data:data.weeklyDistance.values,borderColor:'#6ee7b7',backgroundColor:'rgba(110,231,183,.15)',fill:true,tension:.32,spanGaps:true,pointRadius:4,pointHoverRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#9aa7bd'}}},scales:{x:{ticks:{color:'#9aa7bd'},grid:{color:'rgba(43,54,80,.5)'}},y:{beginAtZero:true,ticks:{color:'#9aa7bd'},grid:{color:'rgba(43,54,80,.5)'}}}}});
  }catch(error){
    console.error(error);
    document.getElementById('updated').textContent='Dashboard data could not be loaded.';
    document.getElementById('status').textContent='Data error';
  }
}

document.addEventListener('DOMContentLoaded',loadDashboard);
