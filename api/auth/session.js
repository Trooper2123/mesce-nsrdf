'use strict';
const a=require('../../lib/mesce-auth');
module.exports=function(req,res){
 if(req.method!=='GET')return a.json(res,405,{error:'method_not_allowed'});
 let cfg;try{cfg=a.config();}catch{return a.json(res,503,{error:'auth_not_configured'});}
 try{
  const data=a.unseal(a.cookies(req)[a.name],cfg.secret);
  if(typeof data.accessToken!=='string'||!Number.isSafeInteger(data.expiresAt)||data.expiresAt<Date.now())
   throw Error('expired');
  // No user identity/role is inferred here: Kof must validate JWT and DB mapping later.
  return a.json(res,200,{authenticated:true,backendReady:false});
 }catch{return a.json(res,200,{authenticated:false,backendReady:false});}
};
