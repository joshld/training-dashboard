import { parseFitMessages, formatPace } from './activity-analysis.js';

const fileInput=document.getElementById('activityFile');
const status=document.getElementById('importStatus');
const preview=document.getElementById('importPreview');
const STORAGE_KEY='trainingLogImportedActivities';
let currentSummary=null;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const fmtTime=s=>{if(!Number.isFinite(s))return'—';const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.round(s%60);return h?`${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${m}:${String(sec).padStart(2,'0')}`};
const fmtPace=(sec,km)=>formatPace(Number.isFinite(sec)&&km>0?sec/km:null);
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
function showError(message){status.innerHTML=`<div class="notice">${esc(message)}</div>`;preview.hidden=true;}
function loadStored(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(value)?value:[];}catch{return[];}}
function activityId(summary){return [summary.date||'',summary.durationSeconds||'',summary.distanceKm?.toFixed(3)||'',String(summary.activityType||'').toLowerCase()].join('|');}
function classifyActivity(type=''){const value=String(type).toLowerCase();return value.includes('run')?'Running':value.includes('strength')?'Strength':'Other';}

async function parseFit(file){
  let fitSdk;try{fitSdk=await import('https://esm.sh/@garmin/fitsdk@21.208.0');}catch{throw new Error('The FIT decoder could not be loaded. Check your connection or try a TCX export.');}
  const {Decoder,Stream}=fitSdk;const bytes=new Uint8Array(await file.arrayBuffer());const decoder=new Decoder(Stream.fromByteArray([...bytes]));
  if(!decoder.isFIT())throw new Error('The selected file is not a valid FIT file.');
  const {messages,errors}=decoder.read();if(errors?.length)console.warn('FIT decode warnings',errors);
  return parseFitMessages(messages, { fileName: file.name });
}
function text(node,name){return node?.getElementsByTagNameNS('*',name)?.[0]?.textContent?.trim()||null;}
function childText(node,name){const elements=[...node.getElementsByTagNameNS('*',name)];return elements.length?elements[0].textContent?.trim()||null:null;}
function calculateGpxDistance(points){let total=0,prev=null;for(const p of points){const lat=num(p.getAttribute('lat')),lon=num(p.getAttribute('lon'));if(lat==null||lon==null)continue;if(prev){const r=6371000,dLat=(lat-prev.lat)*Math.PI/180,dLon=(lon-prev.lon)*Math.PI/180,a=Math.sin(dLat/2)**2+Math.cos(prev.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)**2;total+=2*r*Math.asin(Math.sqrt(a));}prev={lat,lon};}return total||null;}
function parseXml(file,xml,type){
  const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw new Error(`Could not parse ${type} XML.`);
  const isTcx=type==='TCX',points=isTcx?[...doc.getElementsByTagNameNS('*','Trackpoint')]:[...doc.getElementsByTagNameNS('*','trkpt')];if(!points.length)throw new Error(`No track points were found in this ${type} file.`);
  const times=points.map(p=>Date.parse(text(p,isTcx?'Time':'time'))).filter(Number.isFinite),hrs=points.map(p=>isTcx?num(text(p.getElementsByTagNameNS('*','HeartRateBpm')[0],'Value')):num(text(p,'hr'))).filter(v=>v!=null),cads=points.map(p=>num(text(p,isTcx?'Cadence':'cad'))).filter(v=>v!=null);
  let distanceM=isTcx?num(text(doc,'DistanceMeters')):null;if(distanceM==null&&!isTcx)distanceM=calculateGpxDistance(points);
  const durationS=isTcx?(num(text(doc,'TotalTimeSeconds'))??(times.length>1?(Math.max(...times)-Math.min(...times))/1000:null)):(times.length>1?(Math.max(...times)-Math.min(...times))/1000:null);
  const laps=isTcx?[...doc.getElementsByTagNameNS('*','Lap')].map((lap,i)=>{const d=num(childText(lap,'DistanceMeters')),t=num(childText(lap,'TotalTimeSeconds')),hrNode=lap.getElementsByTagNameNS('*','AverageHeartRateBpm')[0];return{index:i+1,distanceKm:d!=null?d/1000:null,durationSeconds:t,pace:fmtPace(t,d!=null?d/1000:null),averageHeartRate:num(text(hrNode,'Value'))};}):[];
  return{sourceFormat:type,fileName:file.name,date:times.length?new Date(Math.min(...times)).toISOString():null,activityType:isTcx?(text(doc,'Sport')||'activity'):'activity',distanceKm:distanceM!=null?distanceM/1000:null,durationSeconds:durationS,averagePace:fmtPace(durationS,distanceM!=null?distanceM/1000:null),averageHeartRate:hrs.length?Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length):null,maximumHeartRate:hrs.length?Math.max(...hrs):null,averageCadence:cads.length?Math.round(cads.reduce((a,b)=>a+b,0)/cads.length):null,calories:isTcx?num(text(doc,'Calories')):null,ascentMetres:null,descentMetres:null,trainingEffect:null,anaerobicTrainingEffect:null,laps,sampleCount:points.length};
}
function render(summary){currentSummary=summary;document.getElementById('activityTitle').textContent=summary.activityType||'Activity';document.getElementById('activityFormat').textContent=summary.sourceFormat;const metrics=[['Date',summary.date?new Date(summary.date).toLocaleString():'—'],['Distance',summary.distanceKm!=null?`${summary.distanceKm.toFixed(2)} km`:'—'],['Duration',fmtTime(summary.durationSeconds)],['Average pace',summary.averagePace],['Average HR',summary.averageHeartRate!=null?`${summary.averageHeartRate} bpm`:'—'],['Maximum HR',summary.maximumHeartRate!=null?`${summary.maximumHeartRate} bpm`:'—'],['Cadence',summary.averageCadence!=null?`${summary.averageCadence} spm`:'—'],['Calories',summary.calories??'—'],['Ascent',summary.ascentMetres!=null?`${summary.ascentMetres} m`:'—'],['Training effect',summary.trainingEffect??'—'],['Samples',summary.sampleCount??'—']];document.getElementById('importMetrics').innerHTML=metrics.map(([k,v])=>`<div class="import-metric"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');document.getElementById('lapRows').innerHTML=(summary.laps||[]).map(l=>`<tr><td>${l.index}</td><td>${fmtTime(l.durationSeconds)}</td><td>${l.distanceKm!=null?l.distanceKm.toFixed(2)+' km':'—'}</td><td>${esc(l.pace)}</td><td>${l.averageHeartRate??'—'}</td></tr>`).join('')||'<tr><td colspan="5">No lap records found.</td></tr>';status.innerHTML=`<p class="status-ok">Parsed ${esc(summary.fileName)} successfully.</p>`;preview.hidden=false;}

fileInput.addEventListener('change',async()=>{const file=fileInput.files?.[0];if(!file)return;status.innerHTML='<p class="empty-state">Parsing activity…</p>';preview.hidden=true;try{const ext=file.name.split('.').pop().toLowerCase();let summary;if(ext==='fit')summary=await parseFit(file);else if(ext==='tcx'||ext==='gpx')summary=parseXml(file,await file.text(),ext.toUpperCase());else throw new Error('Supported formats are FIT, TCX and GPX.');render(summary);}catch(e){console.error(e);showError(e.message||'Import failed.');}});

document.getElementById('importActivity').addEventListener('click',()=>{if(!currentSummary)return;const stored=loadStored(),id=activityId(currentSummary),existing=stored.findIndex(item=>item.id===id);const entry={...currentSummary,id,activity:classifyActivity(currentSummary.activityType),importedAt:new Date().toISOString(),rpe:null};if(existing>=0){if(!window.confirm('This activity appears to already be imported. Replace it?'))return;stored[existing]=entry;}else stored.push(entry);stored.sort((a,b)=>Date.parse(b.date||0)-Date.parse(a.date||0));localStorage.setItem(STORAGE_KEY,JSON.stringify(stored));status.innerHTML='<p class="status-ok">Activity added to Training Log on this browser.</p>';const button=document.getElementById('importActivity');button.textContent='Imported ✓';setTimeout(()=>{window.location.href='index.html#activities';},650);});
document.getElementById('downloadJson').addEventListener('click',()=>{if(!currentSummary)return;const blob=new Blob([JSON.stringify(currentSummary,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${currentSummary.date?.slice(0,10)||'activity'}-${currentSummary.activityType||'activity'}.json`.replace(/\s+/g,'-').toLowerCase();a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
document.getElementById('copySummary').addEventListener('click',async()=>{if(!currentSummary)return;await navigator.clipboard.writeText(JSON.stringify(currentSummary,null,2));const button=document.getElementById('copySummary');button.textContent='Copied';setTimeout(()=>button.textContent='Copy JSON',1500);});
