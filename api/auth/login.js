import crypto from 'node:crypto';

export default function handler(req,res){
  const clientId=process.env.GITHUB_CLIENT_ID;
  const callback=process.env.GITHUB_CALLBACK_URL;
  if(!clientId||!callback){res.statusCode=500;res.end('GitHub auth is not configured');return;}
  const state=crypto.randomBytes(24).toString('hex');
  const url=new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id',clientId);
  url.searchParams.set('redirect_uri',callback);
  url.searchParams.set('state',state);
  res.setHeader('Set-Cookie',`oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.statusCode=302;
  res.setHeader('Location',url.toString());
  res.end();
}
