import crypto from 'node:crypto';

function key(){
  const secret=process.env.SESSION_SECRET;
  if(!secret||secret.length<32)throw new Error('SESSION_SECRET must be at least 32 characters');
  return crypto.createHash('sha256').update(secret).digest();
}

function b64url(value){return Buffer.from(value).toString('base64url');}

export function createSession(payload){
  const iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);
  const clear=Buffer.from(JSON.stringify({...payload,exp:Date.now()+7*24*60*60*1000}));
  const encrypted=Buffer.concat([cipher.update(clear),cipher.final()]);
  const tag=cipher.getAuthTag();
  return `${b64url(iv)}.${b64url(tag)}.${b64url(encrypted)}`;
}

export function readSession(token){
  if(!token)throw new Error('Missing session');
  const [ivPart,tagPart,dataPart]=token.split('.');
  if(!ivPart||!tagPart||!dataPart)throw new Error('Invalid session');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key(),Buffer.from(ivPart,'base64url'));
  decipher.setAuthTag(Buffer.from(tagPart,'base64url'));
  const clear=Buffer.concat([decipher.update(Buffer.from(dataPart,'base64url')),decipher.final()]);
  const payload=JSON.parse(clear.toString('utf8'));
  if(!payload.exp||payload.exp<Date.now())throw new Error('Session expired');
  return payload;
}

export function requireSession(req){
  const header=req.headers.authorization||'';
  const match=header.match(/^Bearer\s+(.+)$/i);
  return readSession(match?.[1]);
}
