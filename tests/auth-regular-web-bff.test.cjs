'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const a=require('../lib/mesce-auth.js');
const login=require('../api/auth/login.js');
const callback=require('../api/auth/callback.js');
const session=require('../api/auth/session.js');
const logout=require('../api/auth/logout.js');
const env=()=>({AUTH0_DOMAIN:'mesce.us.auth0.com',AUTH0_CLIENT_ID:'client-test',AUTH0_CLIENT_SECRET:'client-secret-only-server',AUTH0_AUDIENCE:'https://api.mesce.nsrdf',AUTH0_SECRET:'correct-horse-battery-staple-test-session-secret-32'});
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},writeHead(code,headers){this.statusCode=code;Object.assign(this.headers,headers);},end(value){this.output=value;}};}
function putEnv(){const saved={};for(const [k,v]of Object.entries(env())){saved[k]=process.env[k];process.env[k]=v;}return ()=>{for(const [k,v]of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v;}};}
test('sessão usa AES-GCM autenticado e rejeita adulteração',()=>{
 const token=a.seal({accessToken:'synthetic',expiresAt:Date.now()+60000},env().AUTH0_SECRET);
 assert.deepEqual(a.unseal(token,env().AUTH0_SECRET).accessToken,'synthetic');
 assert.throws(()=>a.unseal(token.slice(0,-6)+'xxxxxx',env().AUTH0_SECRET));
 assert.doesNotMatch(token,/synthetic/);
});
test('início da autenticação envia callback do servidor e cookie HttpOnly',()=>{
 const restore=putEnv();try{
  const res=response();login({method:'GET'},res);
  assert.equal(res.statusCode,303);
  const loc=new URL(res.headers.Location);
  assert.equal(loc.searchParams.get('redirect_uri'),'https://mescensrdf.vercel.app/api/auth/callback');
  assert.equal(loc.searchParams.get('response_type'),'code');
  assert.equal(loc.searchParams.get('code_challenge_method'),'S256');
  assert.match(res.headers['set-cookie'],/HttpOnly; Secure; SameSite=Lax/);
  assert(!JSON.stringify(res.headers).includes(env().AUTH0_CLIENT_SECRET));
 }finally{restore();}
});
test('callback inválido não tenta troca de código',async()=>{
 const restore=putEnv();try{
  const res=response();
  await callback({method:'GET',url:'/api/auth/callback?code=synthetic&state=mismatch',headers:{}},res);
  assert.equal(res.statusCode,303);
  assert.match(res.headers.Location,/missing_flow/);
 }finally{restore();}
});
test('sessão ausente ou adulterada nunca autentica',()=>{
 const restore=putEnv();try{
  for(const headers of [{},{cookie:'mesce_session=bad-cookie'}]){
   const res=response();session({method:'GET',headers},res);
   assert.deepEqual(JSON.parse(res.output),{authenticated:false,backendReady:false});
  }
 }finally{restore();}
});
test('logout exige POST e origem autorizada',()=>{
 const restore=putEnv();try{
  for(const req of [{method:'GET',headers:{}},{method:'POST',headers:{origin:'https://attacker.example'}}]){
   const res=response();logout(req,res);assert.notEqual(res.statusCode,200);
  }
  const res=response();logout({method:'POST',headers:{origin:'https://mescensrdf.vercel.app'}},res);
  assert.equal(res.statusCode,200);assert.match(res.headers['set-cookie'],/Max-Age=0/);
 }finally{restore();}
});
