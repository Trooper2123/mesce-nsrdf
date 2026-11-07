'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const path=require('node:path');
const {validateConfig}=require('../app/operational.js');
test('configuração Auth0 exige emissor HTTPS e client público',()=>{
 assert.deepEqual(validateConfig({issuer:'https://mesce-dev.auth0.com/',clientId:'public123',audience:'https://mesce-api'}),{
   issuer:'https://mesce-dev.auth0.com/',clientId:'public123',audience:'https://mesce-api'
 });
 for(const issuer of ['http://mesce-dev.auth0.com/','https://mesce-dev.auth0.com/sub','https://u:p@mesce-dev.auth0.com/','invalid']){
   assert.throws(()=>validateConfig({issuer,clientId:'public123',audience:'api'}));
 }
});
async function boot(env){
 const child=spawn(process.execPath,[path.join(__dirname,'../scripts/dev-server.cjs')],{env:{...process.env,PORT:'0',...env},stdio:['ignore','pipe','pipe']});
 let output='',closed=false;child.on('exit',()=>{closed=true;});
 const port=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('Servidor não iniciou')),6000);
  child.stdout.on('data',chunk=>{
   output+=String(chunk);const m=output.match(/127\.0\.0\.1:(\d+)/);
   if(m){clearTimeout(timeout);resolve(Number(m[1]));}
  });
  child.once('error',e=>{clearTimeout(timeout);reject(e);});
  child.once('exit',code=>{clearTimeout(timeout);reject(new Error('Servidor encerrado: '+code));});
 });
 return {port,close:async()=>{if(!closed){child.kill();await once(child,'exit');}}};
}
test('fluxo operacional falha fechado sem configuração e sem proxy',async()=>{
 const app=await boot({MESCE_ENABLE_API_PROXY:'0',MESCE_AUTH0_ISSUER:'',MESCE_AUTH0_CLIENT_ID:'',MESCE_AUTH0_AUDIENCE:''});
 try{
  const origin='http://127.0.0.1:'+app.port;
  assert.equal((await fetch(origin+'/operacional.html')).status,200);
  assert.equal((await fetch(origin+'/app/operational.js')).status,200);
  assert.equal((await fetch(origin+'/dev/auth-config')).status,503);
  const response=await fetch(origin+'/api/me',{headers:{Authorization:'Bearer synthetic.jwt.token'}});
  assert.equal(response.status,503);
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal((await fetch(origin+'/api/assisted',{headers:{Authorization:'Bearer synthetic.jwt.token'}})).status,404);
 }finally{await app.close();}
});
test('proxy valida Bearer, rotas, payload e evita expor credenciais',async()=>{
 const seen=[];
 const backend=http.createServer(async(req,res)=>{
  const chunks=[];for await(const item of req)chunks.push(item);
  seen.push({url:req.url,method:req.method,authorization:req.headers.authorization,cookie:req.headers.cookie,body:Buffer.concat(chunks).toString()});
  res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(req.url==='/api/me'?{role:'COORDINATOR'}:{items:[]}));
 });
 backend.listen(0,'127.0.0.1');await once(backend,'listening');
 const app=await boot({MESCE_ENABLE_API_PROXY:'1',MESCE_KOF_PORT:String(backend.address().port),MESCE_AUTH0_ISSUER:'https://mesce-dev.auth0.com/',MESCE_AUTH0_CLIENT_ID:'public123',MESCE_AUTH0_AUDIENCE:'https://mesce-api'});
 try{
  const origin='http://127.0.0.1:'+app.port;
  const cfg=await (await fetch(origin+'/dev/auth-config')).json();
  assert.deepEqual(cfg,{issuer:'https://mesce-dev.auth0.com/',clientId:'public123',audience:'https://mesce-api'});
  assert.equal((await fetch(origin+'/api/me')).status,401);
  assert.equal((await fetch(origin+'/api/assisted',{headers:{Authorization:'Bearer dummy.token'}})).status,404);
  assert.equal((await fetch(origin+'/api/me',{method:'POST',headers:{Authorization:'Bearer dummy.token'}})).status,404);
  assert.equal((await fetch(origin+'/api/celebrations',{method:'POST',headers:{Authorization:'Bearer dummy.token','Content-Type':'text/plain'},body:'x'})).status,415);
  const headers={Authorization:'Bearer dummy.token',Cookie:'sensitive=should-not-be-forwarded'};
  assert.equal((await fetch(origin+'/api/me',{headers})).status,200);
  assert.equal((await fetch(origin+'/api/celebrations',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{"kind":"Missa"}'})).status,200);
  assert.equal((await fetch(origin+'/api/celebrations',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'x'.repeat(17000)})).status,413);
  assert.equal(seen.length,2);assert(seen.every(x=>x.authorization==='Bearer dummy.token'&&!x.cookie));
  assert.equal(seen[1].body,'{"kind":"Missa"}');
 }finally{await app.close();backend.close();await once(backend,'close');}
});
