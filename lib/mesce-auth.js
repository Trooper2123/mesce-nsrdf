'use strict';
const crypto=require('node:crypto');
const name='mesce_session',flowName='mesce_oauth_flow';
function config(env=process.env){
 const raw=(env.AUTH0_DOMAIN||'').trim(),clientId=(env.AUTH0_CLIENT_ID||'').trim(),clientSecret=(env.AUTH0_CLIENT_SECRET||'').trim(),audience=(env.AUTH0_AUDIENCE||'').trim(),secret=(env.AUTH0_SECRET||'');
 if(!raw||!clientId||!clientSecret||!audience||secret.length<32)throw Error('auth_not_configured');
 const issuer=new URL(/^https:\/\//.test(raw)?raw:'https://'+raw);
 if(issuer.protocol!=='https:'||issuer.username||issuer.password||issuer.search||issuer.hash||issuer.pathname!=='/')throw Error('invalid_issuer');
 const origin=new URL(env.MESCE_APP_ORIGIN||'https://mescensrdf.vercel.app');
 if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password)throw Error('invalid_app_origin');
 return {issuer:issuer.href,clientId,clientSecret,audience,secret,origin:origin.origin,callback:origin.origin+'/api/auth/callback'};
}
function key(secret){return crypto.hkdfSync('sha256',Buffer.from(secret),Buffer.from('mesce-auth0-v1'),Buffer.from('cookie-encryption'),32);}
function seal(value,secret){
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(secret),iv);
 const data=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);
 return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64url');
}
function unseal(value,secret){
 if(typeof value!=='string'||value.length>12000)throw Error('invalid_cookie');
 const all=Buffer.from(value,'base64url');
 if(all.length<29)throw Error('invalid_cookie');
 const decipher=crypto.createDecipheriv('aes-256-gcm',key(secret),all.subarray(0,12));
 decipher.setAuthTag(all.subarray(12,28));
 return JSON.parse(Buffer.concat([decipher.update(all.subarray(28)),decipher.final()]).toString('utf8'));
}
function cookies(req){
 const parts=(req.headers?.cookie||'').split(';'),values={};
 for(const item of parts){const at=item.indexOf('=');if(at>0)values[item.slice(0,at).trim()]=item.slice(at+1).trim();}
 return values;
}
function cookie(name,value,maxAge,path='/'){
 return name+'='+value+'; Path='+path+'; HttpOnly; Secure; SameSite=Lax; Max-Age='+maxAge;
}
function noStore(res){res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');}
function redirect(res,url){res.writeHead(303,{Location:url,'Cache-Control':'no-store'});res.end();}
function json(res,status,payload){noStore(res);res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(payload));}
function fail(res,status='login_failed'){noStore(res);redirect(res,'/operacional.html?auth_error='+encodeURIComponent(status));}
module.exports={name,flowName,config,seal,unseal,cookies,cookie,noStore,redirect,json,fail};
