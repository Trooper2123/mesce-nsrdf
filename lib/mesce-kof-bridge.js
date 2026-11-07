'use strict';
// Servidor Vercel -> KofLang -> Neon. O navegador nunca recebe access tokens.
// O Kof sempre valida RS256/JWKS, iss/aud e role associado ao auth0_sub no Neon.
const auth=require('./mesce-auth');
const METHODS=Object.freeze({'/api/me':['GET'],'/api/celebrations':['GET','POST']});
const ALLOWED_ROLES=new Set(['COORDINATOR','MINISTER']);
function backendUrl(env=process.env){
 const raw=(env.MESCE_KOF_API_URL||'').trim();
 if(!raw)return null;
 let url;
 try{url=new URL(raw);}catch{return null;}
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||
    url.pathname!=='/'||url.hostname==='localhost'||url.hostname.endsWith('.local')||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)||
    url.hostname==='::1'||url.hostname==='[::1]')return null;
 return url;
}
function tokenFromSession(req,env=process.env,now=Date.now()){
 const cfg=auth.config(env);
 const encrypted=auth.cookies(req)[auth.name];
 if(!encrypted)return null;
 let item;
 try{item=auth.unseal(encrypted,cfg.secret);}catch{return null;}
 if(!item||typeof item.accessToken!=='string'||item.accessToken.length>8192||
    !/^[A-Za-z0-9_\-.~]+$/.test(item.accessToken)||
    !Number.isSafeInteger(item.expiresAt)||item.expiresAt<=now+5000)return null;
 return item.accessToken;
}
function securityHeaders(res){
 auth.noStore(res);
 res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
 res.setHeader('Referrer-Policy','no-referrer');
}
function respond(res,status,body){
 securityHeaders(res);
 return auth.json(res,status,body);
}
function hasSameOrigin(req,env=process.env){
 const cfg=auth.config(env);
 const supplied=req.headers?.origin;
 return supplied===cfg.origin;
}
async function exchange(req,path,{method='GET',body}={},env=process.env,fetcher=fetch){
 if(!METHODS[path]?.includes(method))return {status:405,payload:{error:'method_not_allowed'}};
 const url=backendUrl(env);
 if(!url)return {status:503,payload:{error:'kof_not_configured'}};
 let bearer;
 try{bearer=tokenFromSession(req,env);}catch{return {status:503,payload:{error:'auth_not_configured'}};}
 if(!bearer)return {status:401,payload:{error:'session_required'}};
 if(method!=='GET'){
  try{if(!hasSameOrigin(req,env))return {status:403,payload:{error:'origin_denied'}};}
  catch{return {status:503,payload:{error:'auth_not_configured'}};}
 }
 const target=new URL(path.slice(1),url);
 const headers={Authorization:'Bearer '+bearer,Accept:'application/json'};
 if(method!=='GET')headers['Content-Type']='application/json';
 let result;
 try{
  result=await fetcher(target.href,{method,headers,body:method==='GET'?undefined:JSON.stringify(body),
   cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(8000)});
 }catch{return {status:503,payload:{error:'kof_unavailable'}};}
 if(![200,201,400,401,403,404,409,422].includes(result.status))
  return {status:502,payload:{error:'invalid_kof_response'}};
 const length=Number(result.headers?.get?.('content-length'));
 if(Number.isFinite(length)&&length>65536)return {status:502,payload:{error:'kof_payload_too_large'}};
 let raw;
 try{raw=await result.text();}catch{return {status:502,payload:{error:'invalid_kof_response'}};}
 if(raw.length>65536)return {status:502,payload:{error:'kof_payload_too_large'}};
 // Kof 201 currently returns {"created":true}.
 let payload;
 try{payload=JSON.parse(raw);}catch{return {status:502,payload:{error:'invalid_kof_response'}};}
 if(result.status===401)return {status:401,payload:{error:'invalid_access_token'}};
 if(result.status===403)return {status:403,payload:{error:'mesce_access_denied'}};
 if(result.status>=400)return {status:result.status,payload:{error:'kof_rejected_request'}};
 return {status:result.status,payload};
}
async function handleMe(req,res,env=process.env,fetcher=fetch){
 if(req.method!=='GET')return respond(res,405,{error:'method_not_allowed'});
 const result=await exchange(req,'/api/me',{},env,fetcher);
 if(result.status===200){
  // Don't return arbitrary Kof identity fields; only allowlisted role.
  if(!ALLOWED_ROLES.has(result.payload?.role))
   return respond(res,502,{error:'invalid_role_response'});
  return respond(res,200,{role:result.payload.role});
 }
 return respond(res,result.status,result.payload);
}
async function handleCelebrations(req,res,env=process.env,fetcher=fetch){
 if(!METHODS['/api/celebrations'].includes(req.method))return respond(res,405,{error:'method_not_allowed'});
 let input;
 if(req.method==='POST'){
  if(!req.headers?.['content-type']?.toLowerCase().startsWith('application/json'))
   return respond(res,415,{error:'json_required'});
  input=req.body;
  if(typeof input==='string'){try{input=JSON.parse(input);}catch{return respond(res,400,{error:'invalid_payload'});}}
  if(!input||typeof input!=='object'||Array.isArray(input))return respond(res,400,{error:'invalid_payload'});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.occursOn)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.startsAt)||
    typeof input.locationCode!=='string'||!input.locationCode.trim()||input.locationCode.length>60||
    typeof input.kind!=='string'||!input.kind.trim()||input.kind.length>60||
    !Number.isInteger(input.requiredMinisters)||input.requiredMinisters<1||input.requiredMinisters>30)
    return respond(res,400,{error:'invalid_payload'});
  input={occursOn:input.occursOn,startsAt:input.startsAt,locationCode:input.locationCode.trim(),
   kind:input.kind.trim(),requiredMinisters:input.requiredMinisters};
 }
 const result=await exchange(req,'/api/celebrations',{method:req.method,body:input},env,fetcher);
 if(result.status===200){
  if(!Array.isArray(result.payload)||result.payload.length>1000)return respond(res,502,{error:'invalid_celebrations_response'});
 }
 return respond(res,result.status,result.payload);
}
module.exports={backendUrl,tokenFromSession,exchange,handleMe,handleCelebrations};
