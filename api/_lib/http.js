export function json(res,status,body){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(body));
}

export function cors(req,res){
  const allowed=process.env.PUBLIC_SITE_ORIGIN;
  const origin=req.headers.origin;
  if(allowed&&origin===allowed){
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  }
  if(req.method==='OPTIONS'){
    res.statusCode=204;
    res.end();
    return true;
  }
  return false;
}

export async function readJson(req){
  const chunks=[];
  for await(const chunk of req)chunks.push(chunk);
  if(!chunks.length)return{};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
