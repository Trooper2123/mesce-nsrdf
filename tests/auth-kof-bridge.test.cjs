'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const auth=require('../lib/mesce-auth');
const bridge=require('../lib/mesce-kof-bridge');
const env={
 AUTH0_DOMAIN:'mesce.example.auth0.com',AUTH0_CLIENT_ID:'mesce-test',AUTH0_CLIENT_SECRET:'only-on-server',
 AUTH0_AUDIENCE:'https://api.mesce.nsrdf',AUTH0_SECRET:'a-completely-synthetic-session-secret-for-ci-tests',
 MESCE_KOF_API_URL:'https://kof.mesce.example/'
};
const request=(token='synthetic.jwt.value',method='GET')=>{
 const cookie=auth.seal({accessToken:token,expiresAt:Date.now()+60000},env.AUTH0_SECRET);
 return {method,headers:{cookie:'mesce_session='+cookie,origin:'https://mescensrdf.vercel.app','content-type':'application/json'}};
};
const fake=(status,payload)=>async(url,options)=>({status,headers:{get:()=>null},text:async()=>JSON.stringify(payload)});
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},end(s){this.text=s;},get status(){return this.statusCode;},set status(v){this.statusCode=v;}};}
test('Kof endpoint deve ser URL HTTPS pública configurada',()=>{
 assert.equal(bridge.backendUrl(env).href,'https://kof.mesce.example/');
 for(const url of ['http://kof.example/','https://localhost/','https://127.0.0.1','https://10.0.0.1','https://user:pass@kof.example/','https://kof.example/path','https://kof.example/?token=a']){
  assert.equal(bridge.backendUrl({...env,MESCE_KOF_API_URL:url}),null,url);
 }
 assert.equal(bridge.backendUrl({...env,MESCE_KOF_API_URL:''}),null);
});
test('token não pode ser falsificado, expirar ou ser enviado pelo navegador',()=>{
 assert.equal(bridge.tokenFromSession({headers:{}},env),null);
 assert.equal(bridge.tokenFromSession({headers:{cookie:'mesce_session=altered'}},env),null);
 const expired=auth.seal({accessToken:'synthetic.jwt.value',expiresAt:Date.now()-1000},env.AUTH0_SECRET);
 assert.equal(bridge.tokenFromSession({headers:{cookie:'mesce_session='+expired}},env),null);
});
test('BFF encaminha somente Bearer para Kof, sem cookie de navegador',async()=>{
 let observed;
 const result=await bridge.exchange(request(),'/api/me',{},env,async(url,options)=>{
  observed={url,options};return {status:200,headers:{get:()=>null},text:async()=>JSON.stringify({role:'COORDINATOR'})};
 });
 assert.deepEqual(result,{status:200,payload:{role:'COORDINATOR'}});
 assert.equal(observed.url,'https://kof.mesce.example/api/me');
 assert.equal(observed.options.headers.Authorization,'Bearer synthetic.jwt.value');
 assert(!JSON.stringify(observed.options).includes('mesce_session'));
 assert(!JSON.stringify(observed.options).includes(env.AUTH0_CLIENT_SECRET));
 assert.equal(observed.options.redirect,'manual');
});
test('sem Kof ou sem sessão falha fechado',async()=>{
 const unconfigured=await bridge.exchange(request(),'/api/me',{}, {...env,MESCE_KOF_API_URL:''},fake(200,{role:'COORDINATOR'}));
 assert.equal(unconfigured.status,503);
 const missing=await bridge.exchange({headers:{}},'/api/me',{},env,fake(200,{role:'COORDINATOR'}));
 assert.equal(missing.status,401);
});
test('403 do Kof não é promovido a coordenador',async()=>{
 const result=await bridge.exchange(request(),'/api/me',{},env,fake(403,{error:'forbidden'}));
 assert.deepEqual(result,{status:403,payload:{error:'mesce_access_denied'}});
});
test('somente perfil explícito de Kof é aceito',async()=>{
 const res=response();
 await bridge.handleMe(request(),res,env,fake(200,{role:'ADMIN',auth0_sub:'should_not_leak'}));
 assert.equal(res.statusCode,502);assert(!res.text.includes('auth0_sub'));
 const res2=response();
 await bridge.handleMe(request(),res2,env,fake(200,{role:'MINISTER',secret:'hidden'}));
 assert.equal(res2.statusCode,200);
 assert.deepEqual(JSON.parse(res2.text),{role:'MINISTER'});
});
test('POST exige mesma origem, validação e revalidação no Kof',async()=>{
 const valid={occursOn:'2026-12-06',startsAt:'08:00',locationCode:'PAROQUIA',kind:'Missa',requiredMinisters:3};
 const hostile=request();hostile.headers.origin='https://attacker.example';
 let called=0;
 const fetcher=async()=>{called++;return {status:201,headers:{get:()=>null},text:async()=>JSON.stringify({created:true})};};
 assert.equal((await bridge.exchange(hostile,'/api/celebrations',{method:'POST',body:valid},env,fetcher)).status,403);
 assert.equal(called,0);
 const res=response();await bridge.handleCelebrations({...request('synthetic.jwt.value','POST'),body:{...valid,requiredMinisters:0}},res,env,fetcher);
 assert.equal(res.statusCode,400);assert.equal(called,0);
 const done=response();await bridge.handleCelebrations({...request('synthetic.jwt.value','POST'),body:valid},done,env,fetcher);
 assert.equal(done.statusCode,201);assert.equal(called,1);
});
test('não segue redirect nem aceita HTML como resposta do Kof',async()=>{
 const a=await bridge.exchange(request(),'/api/me',{},env,fake(302,{role:'COORDINATOR'}));
 assert.equal(a.status,502);
 const b=await bridge.exchange(request(),'/api/me',{},env,async()=>({status:200,headers:{get:()=>null},text:async()=>'<html>error</html>'}));
 assert.equal(b.status,502);
});
