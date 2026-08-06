import {cors,json,readJson} from '../_lib/http.js';
import {requireSession} from '../_lib/session.js';
import {decodeFile,getFile,putFile} from '../_lib/github.js';

const DECISIONS_PATH='coach/suggestion-decisions.md';
const PLAN_PATH='plans/current-plan.md';
const SUGGESTIONS_PATH='plans/plan-suggestions.md';

function tableRows(md,heading){
  const section=md.split(`## ${heading}`)[1]?.split('\n## ')[0]||'';
  return section.split('\n').filter(line=>line.trim().startsWith('|')).slice(2).map(line=>line.split('|').slice(1,-1).map(v=>v.trim()));
}
function esc(value){return String(value??'').replace(/\|/g,'\\|').replace(/\r?\n/g,' ');}
function upsertDecision(md,row){
  const header='| Suggestion ID | Decision | Note | Updated By | Updated At |\n|---|---|---|---|---|';
  const line=`| ${row.map(esc).join(' | ')} |`;
  if(!md)return `# Suggestion Decisions\n\n${header}\n${line}\n`;
  const lines=md.split('\n');
  const index=lines.findIndex(item=>item.startsWith(`| ${row[0]} |`));
  if(index>=0)lines[index]=line;else lines.push(line);
  return `${lines.join('\n').trim()}\n`;
}
function applySuggestion(planMd,suggestion,action,note){
  if(!['applied','modified'].includes(action))return planMd;
  const [id,day,workout,,,,suggested]=suggestion;
  const lines=planMd.split('\n');
  const index=lines.findIndex(line=>line.startsWith(`| ${day} | ${workout} |`));
  if(index<0)throw new Error(`Workout for suggestion ${id} was not found`);
  const cells=lines[index].split('|').slice(1,-1).map(v=>v.trim());
  cells[4]=action==='modified'&&note?note:suggested;
  lines[index]=`| ${cells.join(' | ')} |`;
  return lines.join('\n');
}

export default async function handler(req,res){
  if(cors(req,res))return;
  try{
    const session=requireSession(req);
    if(req.method!=='POST')return json(res,405,{error:'POST required'});
    const {suggestionId,action,note=''}=await readJson(req);
    if(!suggestionId||!['applied','modified','dismissed'].includes(action))return json(res,400,{error:'Invalid decision'});
    const suggestionsFile=await getFile(SUGGESTIONS_PATH,session.token);
    const suggestion=tableRows(decodeFile(suggestionsFile),'Suggestions').find(row=>row[0]===suggestionId);
    if(!suggestion)return json(res,404,{error:'Suggestion not found'});

    if(action!=='dismissed'){
      const planFile=await getFile(PLAN_PATH,session.token);
      const updatedPlan=applySuggestion(decodeFile(planFile),suggestion,action,note);
      await putFile(PLAN_PATH,updatedPlan,planFile.sha,`Apply training plan suggestion: ${suggestionId}`,session.token);
    }

    let decisionsFile=null,decisionsMd='';
    try{decisionsFile=await getFile(DECISIONS_PATH,session.token);decisionsMd=decodeFile(decisionsFile);}catch(error){if(error.status!==404)throw error;}
    const updated=upsertDecision(decisionsMd,[suggestionId,action,note,session.login,new Date().toISOString()]);
    await putFile(DECISIONS_PATH,updated,decisionsFile?.sha,`Record training plan decision: ${suggestionId}`,session.token);
    return json(res,200,{ok:true,suggestionId,action});
  }catch(error){return json(res,error.message?.includes('session')?401:500,{error:error.message});}
}
