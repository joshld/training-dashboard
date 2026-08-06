import {createSession} from '../_lib/session.js';
import {getUser} from '../_lib/github.js';

function cookie(req,name){return (req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${name}=`))?.slice(name.length+1);}

export default async function handler(req,res){
  try{
    const {code,state}=req.query;
    if(!code||!state||cookie(req,'oauth_state')!==state)throw new Error('Invalid OAuth state');
    const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({client_id:process.env.GITHUB_CLIENT_ID,client_secret:process.env.GITHUB_CLIENT_SECRET,code,redirect_uri:process.env.GITHUB_CALLBACK_URL})});
    const auth=await response.json();
    if(!response.ok||!auth.access_token)throw new Error(auth.error_description||'GitHub token exchange failed');
    const user=await getUser(auth.access_token);
    if(user.login!==process.env.ALLOWED_GITHUB_LOGIN)throw new Error('This GitHub account is not allowed to edit the training log');
    const session=createSession({login:user.login,token:auth.access_token});
    const target=new URL(process.env.PUBLIC_SITE_ORIGIN);
    target.searchParams.set('auth_session',session);
    target.searchParams.set('open_tab','plan');
    res.statusCode=302;res.setHeader('Location',target.toString());res.end();
  }catch(error){res.statusCode=400;res.end(error.message);}
}
