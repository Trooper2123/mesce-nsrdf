'use strict';
/* Servidor de desenvolvimento LOCAL. Nunca publicar como backend de produção.
 * Proxy limitado aos endpoints do MESCE, sem cookies, logs ou cache de tokens.
 */
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const type={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json; charset=utf-8'};
const allowed=new Set(['/','/index.html','/privacidade.html','/pwa.html','/operacional.html','/manifest.webmanifest','/icon.svg','/sw.js','/app/privacy.js','/app/scheduling.js','/app/visits.js','/app/operational.js','/app/accessibility.css']);
const apiRoutes=new Map([['/api/me',new Set(['GET'])],['/api/celebrations',new Set(['GET','POST'])]]);
const port=Number(process.env.PORT||4173);
const maxBody=16384;
const headers={'Cache-Control':'no-store','Pragma':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
function respond(res,status,value){
 res.writeHead(status,{...headers,'Content-Type':'application/json; charset=utf-8'});
 res.end(JSON.stringify(value));
}
function authConfig(){
 const issuer=process.env.MESCE_AUTH0_ISSUER,clientId=process.env.MESCE_AUTH0_CLIENT_ID,audience=process.env.MESCE_AUTH0_AUDIENCE;
 if(!issuer||!clientId||!audience)return null;
 try {
  const url=new URL(issuer);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/')return null;
  if(!/^[a-zA-Z0-9_-]{4,256}$/.test(clientId)||audience.length>512)return null;
  return {issuer:url.href,clientId,audience};
 }catch{return null;}
}
async function proxy(req,res,pathname){
 const permitted=apiRoutes.get(pathname);
 if(!permitted||!permitted.has(req.method)){respond(res,404,{error:'not_found'});return;}
 if(process.env.MESCE_ENABLE_API_PROXY!=='1'){respond(res,503,{error:'backend_not_enabled'});return;}
 const auth=req.headers.authorization;
 if(typeof auth!=='string'||!/^Bearer [A-Za-z0-9_.~-]+$/.test(auth)){respond(res,401,{error:'missing_bearer'});return;}
 if(req.method==='POST'&&!(req.headers['content-type']||'').startsWith('application/json')){respond(res,415,{error:'json_required'});return;}
 let chunks=[],size=0,exceeded=false;
 for await (const chunk of req){
  size+=chunk.length;
  if(size>maxBody){exceeded=true;break;}
  chunks.push(chunk);
 }
 if(exceeded){respond(res,413,{error:'payload_too_large'});return;}
 const backendPort=Number(process.env.MESCE_KOF_PORT||8081);
 if(!Number.isInteger(backendPort)||backendPort<1||backendPort>65535){respond(res,503,{error:'backend_unavailable'});return;}
 try{
  const response=await fetch('http://127.0.0.1:'+backendPort+pathname,{
    method:req.method,headers:{Authorization:auth,...(req.method==='POST'?{'Content-Type':'application/json'}:{})},
    body:req.method==='POST'?Buffer.concat(chunks):undefined,
    redirect:'error',signal:AbortSignal.timeout(8000)
  });
  if(response.status>=300&&response.status<400){respond(res,502,{error:'invalid_backend_redirect'});return;}
  const buffer=Buffer.from(await response.arrayBuffer());
  if(buffer.length>524288){respond(res,502,{error:'backend_response_too_large'});return;}
  res.writeHead(response.status,{...headers,'Content-Type':'application/json; charset=utf-8'});
  res.end(buffer);
 }catch{respond(res,503,{error:'backend_unavailable'});}
}
const server=http.createServer((req,res)=>{
 let pathname;
 try{pathname=new URL(req.url,'http://127.0.0.1').pathname;}catch{respond(res,400,{error:'invalid_path'});return;}
 if(pathname==='/dev/auth-config'&&req.method==='GET'){
  const config=authConfig();
  if(!config){respond(res,503,{error:'auth0_not_configured'});return;}
  respond(res,200,config);return;
 }
 if(pathname.startsWith('/api/')){
  void proxy(req,res,pathname).catch(()=>{if(!res.headersSent)respond(res,503,{error:'backend_unavailable'});});
  return;
 }
 if(req.method!=='GET'||!allowed.has(pathname)){respond(res,404,{error:'not_found'});return;}
 const file=path.join(root,pathname==='/'?'index.html':pathname.slice(1));
 fs.readFile(file,(err,bytes)=>{
  if(err){respond(res,404,{error:'not_found'});return;}
  const config=authConfig();
  const authHost=config?new URL(config.issuer).origin:'';
  const operational=pathname==='/operacional.html';
  const csp=operational
   ?"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' "+authHost+"; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
   :"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
  res.writeHead(200,{...headers,'Content-Type':type[path.extname(file)]||'text/plain; charset=utf-8','Content-Security-Policy':csp});
  res.end(bytes);
 });
});
server.listen(port,'127.0.0.1',()=>process.stdout.write('MESCE DEV: http://127.0.0.1:'+server.address().port+' (dados sintéticos apenas)\n'));
