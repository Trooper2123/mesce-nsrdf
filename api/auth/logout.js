'use strict';
const a=require('../../lib/mesce-auth');
module.exports=function(req,res){
 if(req.method!=='POST')return a.json(res,405,{error:'method_not_allowed'});
 // A browser can't invoke this via cross-site HTML form with a valid same-origin Origin.
 let cfg;try{cfg=a.config();}catch{return a.json(res,503,{error:'auth_not_configured'});}
 if(req.headers.origin!==cfg.origin)return a.json(res,403,{error:'origin_denied'});
 res.setHeader('Set-Cookie',a.cookie(a.name,'',0));
 return a.json(res,200,{loggedOut:true});
};
