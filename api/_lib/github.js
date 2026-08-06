const API='https://api.github.com';
const REPO=process.env.GITHUB_REPOSITORY||'joshld/training-dashboard';

async function gh(path,token,options={}){
  const response=await fetch(`${API}${path}`,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json',...(options.headers||{})}});
  const text=await response.text();
  const body=text?JSON.parse(text):null;
  if(!response.ok){const error=new Error(body?.message||`GitHub HTTP ${response.status}`);error.status=response.status;throw error;}
  return body;
}

export async function getUser(token){return gh('/user',token);}
export async function getFile(path,token){return gh(`/repos/${REPO}/contents/${path}?ref=main`,token);}
export async function putFile(path,content,sha,message,token){
  return gh(`/repos/${REPO}/contents/${path}`,token,{method:'PUT',body:JSON.stringify({message,content:Buffer.from(content).toString('base64'),sha,branch:'main'})});
}

export function decodeFile(file){return Buffer.from(file.content.replace(/\n/g,''),'base64').toString('utf8');}
