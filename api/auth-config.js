'use strict';
/*
 * Vercel Function: publica APENAS metadados necessários ao OAuth.
 * Não retorna AUTH0_SECRET nem AUTH0_CLIENT_SECRET.
 * Requer audience registrada para a API MESCE; sem ela o login operacional fica bloqueado.
 */
function getConfig(env) {
 const domain=(env.MESCE_AUTH0_ISSUER||env.AUTH0_DOMAIN||'').trim();
 const clientId=(env.MESCE_AUTH0_CLIENT_ID||env.AUTH0_CLIENT_ID||'').trim();
 const audience=(env.MESCE_AUTH0_AUDIENCE||env.AUTH0_AUDIENCE||'').trim();
 if(!domain||!clientId)return {status:503,body:{error:'auth0_public_configuration_missing'}};
 let issuer;
 try{
  issuer=new URL(/^https:\/\//i.test(domain)?domain:'https://'+domain);
 }catch{return {status:503,body:{error:'auth0_invalid_issuer'}};}
 if(issuer.protocol!=='https:'||issuer.username||issuer.password||issuer.search||issuer.hash||issuer.pathname!=='/'||
    !/^[a-z0-9.-]+$/i.test(issuer.hostname)||!clientId||clientId.length>256)
   return {status:503,body:{error:'auth0_invalid_public_configuration'}};
 if(!audience)return {status:503,body:{error:'auth0_api_audience_missing'}};
 if(audience.length>512||/[\r\n]/.test(audience))return {status:503,body:{error:'auth0_invalid_audience'}};
 return {status:200,body:{issuer:issuer.href,clientId,audience}};
}
function handler(req,res){
 res.setHeader('Cache-Control','no-store, max-age=0');
 res.setHeader('Pragma','no-cache');
 res.setHeader('Content-Type','application/json; charset=utf-8');
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'method_not_allowed'});}
 const result=getConfig(process.env);
 return res.status(result.status).json(result.body);
}
module.exports=handler;
module.exports.getConfig=getConfig;
