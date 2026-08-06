import { Decoder, Stream } from 'https://esm.sh/@garmin/fitsdk@21.208.0';

const fileInput=document.getElementById('activityFile');
const status=document.getElementById('importStatus');
const preview=document.getElementById('importPreview');
let currentSummary=null;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime=s=>{if(!Number.isFinite(s))return'—';const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.round(s%60);return h?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`};
const fmtPace=(sec,km)=>Number.isFinite(sec)&&km>0?`${Math.floor(sec/km/60)}:${String(Math.round(sec/km%60)).padStart(2,'0')}/km`:'—';
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};

function showError(message){status.innerHTML=`<div class="notice">${esc(message)}</div>`;preview.hidden=true;}
function first(arr){return Array.isArray(arr)?arr[0]:arr;}
function pick(obj,...keys){for(const key of keys){if(obj&&obj[key]!=null)return obj[key];}return null;}
function metres(v){const n=num(v);return n==null?null:(n>1000?n:n);}

async function parseFit(file){
  const bytes=new Uint8Array(await file.arrayBuffer());
  const stream=Stream.fromByteArray([...bytes]);
  const decoder=new Decoder(stream);
  if(!decoder.isFIT())throw new Error('The selected file is not a valid FIT file.');
  const {messages,errors}=decoder.read();
  if(errors?.length)console.warn('FIT decode warnings',errors);
  const session=first(messages.sessionMesgs)||{};
  const laps=messages.lapMesgs||[];
  const records=messages.recordMesgs||[];
  const distanceM=num(pick(session,'totalDistance','enhancedTotalDistance'))??num(pick(first(laps),'totalDistance'));
  const durationS=num(pick(session,'totalTimerTime','totalElapsedTime'));
  const start=pick(session,'startTime','timestamp')||pick(records[0],'timestamp');
  const summary={
    sourceFormat:'FIT',fileName:file.name,date:start?new Date(start).toISOString():null,
    activityType:String(pick(session,'sport','subSport')||'activity'),distanceKm:distanceM!=null?distanceM/1000:null,durationSeconds:durationS,
    averagePace:fmtPace(durationS,distanceM!=null?distanceM/1000:null),
    averageHeartRate:num(pick(session,'avgHeartRate')),maximumHeartRate:num(pick(session,'maxHeartRate')),
    averageCadence:num(pick(session,'avgRunningCadence','avgCadence')),calories:num(pick(session,'totalCalories')),
    ascentMetres:num(pick(session,'totalAscent')),descentMetres:num(pick(session,'totalDescent')),
    trainingEffect:num(pick(session,'totalTrainingEffect','totalAerobicTrainingEffect')),anaerobicTrainingEffect:num(pick(session,'totalAnaerobicTrainingEffect')),
    averageGroundContactTime:num(pick(session,'avgStanceTime')),averageVerticalOscillation:num(pick(session,'avgVerticalOscillation')),
    averageStrideLength:num(pick(session,'avgStepLength','avgStrideLength')),
    laps:laps.map((lap,i)=>{const d=num(pick(lap,'totalDistance'));const t=num(pick(lap,'totalTimerTime','totalElapsedTime'));return{index:i+1,distanceKm:d!=null?d/1000:null,durationSeconds:t,pace:fmtPace(t,d!=null?d/1000:null),averageHeartRate:num(pick(lap,'avgHeartRate'))};}),
    sampleCount:records.length
  };
  return summary;
}

function text(node,name){return node?.getElementsByTagNameNS('*',name)?.[0]?.textContent||null;}
function parseXml(file,xml,type){
  const doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror'))throw new Error(`Could not parse ${type} XML.`);
  const points=[...doc.getElementsByTagNameNS('*','Trackpoint'),...doc.getElementsByTagNameNS('*','trkpt')];
  const times=points.map(p=>Date.parse(text(p,'Time')||text(p,'time'))).filter(Number.isFinite);
  const hrs=points.map(p=>num(text(p,'Value')||text(p,'hr'))).filter(v=>v!=null);
  const cads=points.map(p=>num(text(p,'Cadence')||text(p,'cad'))).filter(v=>v!=null);
  let distanceM=num(text(doc,'DistanceMeters'));
  if(distanceM==null&&type==='GPX')distanceM=calculateGpxDistance(points);
  const durationS=times.length>1?(Math.max(...times)-Math.min(...times))/1000:num(text(doc,'TotalTimeSeconds'));
  const laps=[...doc.getElementsByTagNameNS('*','Lap')].map((lap,i)=>{const d=num(text(lap,'DistanceMeters'));const t=num(text(lap,'TotalTimeSeconds'));return{index:i+1,distanceKm:d!=null?d/1000:null,durationSeconds:t,pace:fmtPace(t,d!=null?d/1000:null),averageHeartRate:num(text(lap,'AverageHeartRateBpm'))};});
  return{sourceFormat:type,fileName:file.name,date:times.length?new Date(Math.min(...times)).toISOString():null,activityType:text(doc,'Sport')||'activity',distanceKm:distanceM!=null?distanceM/1000:null,durationSeconds:durationS,averagePace:fmtPace(durationS,distanceM!=null?distanceM/1000:null),averageHeartRate:hrs.length?Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length):null,maximumHeartRate:hrs.length?Math.max(...hrs):null,averageCadence:cads.length?Math.round(cads.reduce((a,b)=>a+b,0)/cads.length):null,calories:num(text(doc,'Calories')),ascentMetres:null,descentMetres:null,trainingEffect:null,anaerobicTrainingEffect:null,laps,sampleCount:points.length};
}
function calculateGpxDistance(points){let total=0,prev=null;for(const p of points){const lat=num(p.getAttribute('lat')),lon=num(p.getAttribute('lon'));if(lat==null||lon==null)continue;if(prev){const r=6371000,dLat=(lat-prev.lat)*Math.PI/180,dLon=(lon-prev.lon)*Math.PI/180,a=Math.sin(dLat/2)**2+Math.cos(prev.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)**2;total+=2*r*Math.asin(Math.sqrt(a));}prev={lat,lon};}return total||null;}

function render(summary){currentSummary=summary;document.getElementById('activityTitle').textContent=`${summary.activityType||'Activity'}`;document.getElementById('activityFormat').textContent=summary.sourceFormat;
  const metrics=[['Date',summary.date?new Date(summary.date).toLocaleString():'—'],['Distance',summary.distanceKm!=null?`${summary.distanceKm.toFixed(2)} km`:'—'],['Duration',fmtTime(summary.durationSeconds)],['Average pace',summary.averagePace],['Average HR',summary.averageHeartRate!=null?`${summary.averageHeartRate} bpm`:'—'],['Maximum HR',summary.maximumHeartRate!=null?`${summary.maximumHeartRate} bpm`:'—'],['Cadence',summary.averageCadence!=null?`${summary.averageCadence} spm`:'—'],['Calories',summary.calories??'—'],['Ascent',summary.ascentMetres!=null?`${summary.ascentMetres} m`:'—'],['Training effect',summary.trainingEffect??'—'],['Samples',summary.sampleCount??'—']];
  document.getElementById('importMetrics').innerHTML=metrics.map(([k,v])=>`<div class="import-metric"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
  document.getElementById('lapRows').innerHTML=(summary.laps||[]).map(l=>`<tr><td>${l.index}</td><td>${fmtTime(l.durationSeconds)}</td><td>${l.distanceKm!=null?l.distanceKm.toFixed(2)+' km':'—'}</td><td>${esc(l.pace)}</td><td>${l.averageHeartRate??'—'}</td></tr>`).join('')||'<tr><td colspan="5">No lap records found.</td></tr>';
  status.innerHTML=`<p class="success-state">Parsed ${esc(summary.fileName)} successfully.</p>`;preview.hidden=false;
}

fileInput.addEventListener('change',async()=>{const file=fileInput.files?.[0];if(!file)return;status.innerHTML='<p class="empty-state">Parsing activity…</p>';preview.hidden=true;try{const ext=file.name.split('.').pop().toLowerCase();let summary;if(ext==='fit')summary=await parseFit(file);else if(ext==='tcx'||ext==='gpx')summary=parseXml(file,await file.text(),ext.toUpperCase());else throw new Error('Supported formats are FIT, TCX and GPX.');render(summary);}catch(e){console.error(e);showError(e.message||'Import failed.');}});

document.getElementById('downloadJson').addEventListener('click',()=>{if(!currentSummary)return;const blob=new Blob([JSON.stringify(currentSummary,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${currentSummary.date?.slice(0,10)||'activity'}-${currentSummary.activityType||'activity'}.json`.replace(/\s+/g,'-').toLowerCase();a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
document.getElementById('copySummary').addEventListener('click',async()=>{if(!currentSummary)return;await navigator.clipboard.writeText(JSON.stringify(currentSummary,null,2));document.getElementById('copySummary').textContent='Copied';setTimeout(()=>document.getElementById('copySummary').textContent='Copy JSON',1500);});
