'use strict';
const a=require('../../lib/mesce-auth');
const bridge=require('../../lib/mesce-kof-bridge');
module.exports=async function(req,res){
 if(req.method!=='GET')return a.json(res,405,{error:'method_not_allowed'});
 let cfg;try{cfg=a.config();}catch{return a.json(res,503,{error:'auth_not_configured'});}
 let token;
 try{token=bridge.tokenFromSession(req,process.env);}catch{return a.json(res,503,{error:'auth_not_configured'});}
 if(!token)return a.json(res,200,{authenticated:false,backendReady:false});
 // Authentication at Auth0 is distinct from authorization to MESCE.
 // Kof checks token signature, audience, issuer and active role in Neon.
 const result=await bridge.exchange(req,'/api/me');
 if(result.status===200&&['COORDINATOR','MINISTER'].includes(result.payload?.role))
  return a.json(res,200,{authenticated:true,backendReady:true,role:result.payload.role});
 if(result.status===403)
  return a.json(res,200,{authenticated:true,backendReady:true,authorized:false});
 if(result.status===401)return a.json(res,200,{authenticated:false,backendReady:true});
 return a.json(res,200,{authenticated:true,backendReady:false});
};
