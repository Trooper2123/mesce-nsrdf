'use strict';
const crypto=require('node:crypto');
const a=require('../../lib/mesce-auth');
module.exports=async function(req,res){
 if(req.method!=='GET')return a.json(res,405,{error:'method_not_allowed'});
 let cfg;try{cfg=a.config();}catch{return a.fail(res,'configuration');}
 // One-time flow cookie; clear it on any outcome.
 res.setHeader('Set-Cookie',a.cookie(a.flowName,'',0,'/api/auth'));
 const query=new URL(req.url,'https://mescensrdf.vercel.app').searchParams;
 if(query.has('error')){
   const error=query.get('error');
   const desc=(query.get('error_description')||'').toLowerCase();
   if(/callback url|redirect_uri|redirect uri|callback mismatch/.test(desc))return a.fail(res,'callback_mismatch');
   if(error==='unauthorized_client')return a.fail(res,'unauthorized_client');
   if(error==='consent_required')return a.fail(res,'consent_required');
   if(error==='login_required')return a.fail(res,'login_required');
   return a.fail(res,'provider_denied');
 }
 const code=query.get('code'),state=query.get('state');
 if(!code||!state||code.length>4096||state.length>512)return a.fail(res,'invalid_callback');
 let data;
 try{data=a.unseal(a.cookies(req)[a.flowName],cfg.secret);}catch{return a.fail(res,'missing_flow');}
 if(typeof data.state!=='string'||typeof data.verifier!=='string'||!Number.isSafeInteger(data.created)||
   Math.abs(Date.now()-data.created)>600000||data.state.length!==state.length||
   !crypto.timingSafeEqual(Buffer.from(data.state),Buffer.from(state)))return a.fail(res,'invalid_state');
 try{
  const body=new URLSearchParams({
   grant_type:'authorization_code',client_id:cfg.clientId,client_secret:cfg.clientSecret,
   redirect_uri:cfg.callback,code,code_verifier:data.verifier
  });
  const response=await fetch(new URL('oauth/token',cfg.issuer),{
   method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body,
   cache:'no-store',signal:AbortSignal.timeout(8000)
  });
  if(!response.ok)return a.fail(res,'exchange_denied');
  const result=await response.json();
  if(typeof result.access_token!=='string'||result.token_type?.toLowerCase()!=='bearer'||
     !Number.isFinite(result.expires_in)||result.expires_in<1||result.access_token.length>8000)
    return a.fail(res,'invalid_token_response');
  // Server-only encrypted cookie. Never expose access token to browser JS.
  const seconds=Math.max(1,Math.min(3600,Math.floor(result.expires_in)));
  const session=a.seal({accessToken:result.access_token,expiresAt:Date.now()+seconds*1000},cfg.secret);
  if(session.length>3500)return a.fail(res,'session_too_large');
  res.setHeader('Set-Cookie',[a.cookie(a.flowName,'',0,'/api/auth'),a.cookie(a.name,session,seconds)]);
  a.noStore(res);return a.redirect(res,'/operacional.html');
 }catch{return a.fail(res,'exchange_unavailable');}
};
