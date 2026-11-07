'use strict';
const crypto=require('node:crypto');
const a=require('../../lib/mesce-auth');
module.exports=function(req,res){
 if(req.method!=='GET')return a.json(res,405,{error:'method_not_allowed'});
 let cfg;try{cfg=a.config();}catch{return a.json(res,503,{error:'auth_not_configured'});}
 const state=crypto.randomBytes(32).toString('base64url'),verifier=crypto.randomBytes(32).toString('base64url');
 const challenge=crypto.createHash('sha256').update(verifier).digest('base64url');
 const flow=a.seal({state,verifier,created:Date.now()},cfg.secret);
 const url=new URL('authorize',cfg.issuer);
 for(const [k,v]of Object.entries({response_type:'code',client_id:cfg.clientId,redirect_uri:cfg.callback,audience:cfg.audience,scope:'openid profile',state,code_challenge:challenge,code_challenge_method:'S256'}))url.searchParams.set(k,v);
 a.noStore(res);res.setHeader('Set-Cookie',a.cookie(a.flowName,flow,600,'/api/auth'));
 return a.redirect(res,url.href);
};
