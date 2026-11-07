'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {getConfig}=require('../api/auth-config.js');
test('lê nomes Auth0 realmente cadastrados na Vercel sem publicar segredos',()=>{
 const result=getConfig({AUTH0_DOMAIN:'mesce.eu.auth0.com',AUTH0_CLIENT_ID:'public123',AUTH0_CLIENT_SECRET:'SUPER-SECRET',AUTH0_SECRET:'SUPER-SECRET-2',AUTH0_AUDIENCE:'https://api.mesce.example'});
 assert.equal(result.status,200);
 assert.deepEqual(result.body,{issuer:'https://mesce.eu.auth0.com/',clientId:'public123',audience:'https://api.mesce.example'});
 assert(!JSON.stringify(result).includes('SUPER-SECRET'));
});
test('distingue audience ausente de credenciais Auth0 ausentes',()=>{
 const missingAudience=getConfig({AUTH0_DOMAIN:'mesce.eu.auth0.com',AUTH0_CLIENT_ID:'public123'});
 assert.deepEqual(missingAudience,{status:503,body:{error:'auth0_api_audience_missing'}});
 assert.equal(getConfig({AUTH0_DOMAIN:'mesce.eu.auth0.com'}).body.error,'auth0_public_configuration_missing');
});
test('bloqueia issuer inseguro, credenciais e audience com CRLF',()=>{
 for(const domain of ['http://bad.example','https://bad.example/path','https://u:p@bad.example/']){
  assert.notEqual(getConfig({AUTH0_DOMAIN:domain,AUTH0_CLIENT_ID:'abc',AUTH0_AUDIENCE:'api'}).status,200);
 }
 assert.equal(getConfig({AUTH0_DOMAIN:'auth.example.com',AUTH0_CLIENT_ID:'abc',AUTH0_AUDIENCE:'bad\r\nheader'}).status,503);
});
