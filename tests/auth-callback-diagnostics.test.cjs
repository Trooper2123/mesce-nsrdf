'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {authErrorMessage}=require('../app/operational.js');
function error(code,description=''){
  return authErrorMessage(new URLSearchParams({error:code,error_description:description}));
}
test('callback mismatch recebe instrução acionável',()=>{
 assert.match(error('access_denied','Callback URL mismatch. The provided redirect_uri is not in the allowed list.'),/Allowed Callback URLs/);
});
test('acesso negado e cliente não autorizado recebem mensagens distintas',()=>{
 assert.match(error('access_denied'),/Acesso negado/);
 assert.match(error('unauthorized_client'),/tipo da aplicação/);
});
test('mensagem arbitrária do Auth0 nunca é refletida no HTML',()=>{
 const secret='SECRET_OR_TOKEN_SHOULD_NEVER_APPEAR';
 assert.doesNotMatch(error('other_error',secret),new RegExp(secret));
 assert.doesNotMatch(error('access_denied','<script>alert(1)</script>'),/script/);
});
