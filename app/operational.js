/* MESCE dev: OAuth2 authorization code + PKCE; tokens only in memory.
 * No client secret, no implicit grant, no login via simulated roles.
 */
(function(root){
'use strict';
const $=id=>document.getElementById(id);
const status=message=>{$('status').textContent=message;};
const transientKey='mesce.auth.pkce.2026';
let config=null,token=null,expiresAt=0,role=null;
function base64url(bytes){
  let text='';for(const b of bytes)text+=String.fromCharCode(b);
  return btoa(text).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function randomCode(byteLength){
  const bytes=new Uint8Array(byteLength);crypto.getRandomValues(bytes);return base64url(bytes);
}
async function challenge(verifier){
  return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
}
function validateConfig(value){
  if(!value||typeof value!=='object'||typeof value.clientId!=='string'||!value.clientId.trim())throw new Error('Cliente Auth0 não configurado.');
  const issuer=new URL(value.issuer);
  if(issuer.protocol!=='https:'||issuer.username||issuer.password||issuer.search||issuer.hash||issuer.pathname!=='/')throw new Error('Emissor Auth0 inválido.');
  if(typeof value.audience!=='string'||!value.audience.trim())throw new Error('Audiência Auth0 inválida.');
  return {issuer:issuer.href,clientId:value.clientId,audience:value.audience};
}
const callback=()=>location.origin+'/operacional.html';
async function login(){
  if(!config)return;
  const verifier=randomCode(32),state=randomCode(24),codeChallenge=await challenge(verifier);
  sessionStorage.setItem(transientKey,JSON.stringify({verifier,state,created:Date.now()}));
  const target=new URL('authorize',config.issuer);
  target.searchParams.set('response_type','code');
  target.searchParams.set('client_id',config.clientId);
  target.searchParams.set('redirect_uri',callback());
  target.searchParams.set('scope','openid profile');
  target.searchParams.set('audience',config.audience);
  target.searchParams.set('code_challenge_method','S256');
  target.searchParams.set('code_challenge',codeChallenge);
  target.searchParams.set('state',state);
  location.assign(target.href);
}
function eraseTransient(){sessionStorage.removeItem(transientKey);}
async function exchangeIfCallback(){
  const params=new URLSearchParams(location.search);
  if(!params.has('code')&&!params.has('error'))return false;
  history.replaceState(null,'',location.pathname);
  const stored=sessionStorage.getItem(transientKey);eraseTransient();
  if(params.has('error'))throw new Error('O provedor recusou a autenticação.');
  if(!stored)throw new Error('Sessão de autenticação ausente. Entre novamente.');
  let challengeData;
  try{challengeData=JSON.parse(stored);}catch{throw new Error('Sessão de autenticação inválida.');}
  if(typeof challengeData.verifier!=='string'||challengeData.state!==params.get('state')||
     !Number.isSafeInteger(challengeData.created)||Math.abs(Date.now()-challengeData.created)>600000)
    throw new Error('Estado de autenticação inválido ou expirado.');
  const data=new URLSearchParams({
    grant_type:'authorization_code',client_id:config.clientId,
    redirect_uri:callback(),code:params.get('code')||'',code_verifier:challengeData.verifier
  });
  const response=await fetch(new URL('oauth/token',config.issuer),{
    method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data,cache:'no-store'
  });
  if(!response.ok)throw new Error('Não foi possível concluir o login no Auth0.');
  const result=await response.json();
  if(typeof result.access_token!=='string'||result.token_type!=='Bearer'||!Number.isFinite(result.expires_in)||result.expires_in<1)
    throw new Error('Resposta Auth0 inválida.');
  token=result.access_token;expiresAt=Date.now()+Math.min(result.expires_in,3600)*1000;
  return true;
}
async function api(path,options={}){
  if(!token||Date.now()>expiresAt-30000){signOut(false);throw new Error('Sessão expirada. Entre novamente.');}
  if(!['/api/me','/api/celebrations'].includes(path))throw new Error('Operação não permitida.');
  const response=await fetch(path,{
    method:options.method||'GET',
    headers:{Authorization:'Bearer '+token,...(options.body?{'Content-Type':'application/json'}:{})},
    body:options.body?JSON.stringify(options.body):undefined,cache:'no-store'
  });
  if(response.status===401){signOut(false);throw new Error('Login expirado ou inválido.');}
  if(response.status===403)throw new Error('Acesso negado: usuário sem autorização para esta operação.');
  if(!response.ok)throw new Error('Não foi possível concluir a operação ('+response.status+').');
  return response.json();
}
function signOut(provider){
  token=null;expiresAt=0;role=null;eraseTransient();
  $('celebrations-panel').hidden=true;$('create-panel').hidden=true;
  $('login').hidden=false;$('login').disabled=!config;$('logout').hidden=true;$('refresh').hidden=true;
  $('role').textContent='Não autenticado.';
  if(provider&&config){
    const url=new URL('v2/logout',config.issuer);
    url.searchParams.set('client_id',config.clientId);
    url.searchParams.set('returnTo',callback());
    location.assign(url.href);
  }
}
function td(value){const el=document.createElement('td');el.textContent=String(value??'');return el;}
function renderCelebrations(rows){
  const tbody=$('celebrations');tbody.replaceChildren();
  if(!Array.isArray(rows)||rows.length===0){const tr=document.createElement('tr'),cell=td('Nenhuma celebração cadastrada.');cell.colSpan=5;tr.append(cell);tbody.append(tr);return;}
  for(const item of rows){
    const tr=document.createElement('tr');
    for(const field of ['occurs_on','starts_at','location_code','kind','required_ministers'])tr.append(td(item[field]));
    tbody.append(tr);
  }
}
async function loadCelebrations(){renderCelebrations(await api('/api/celebrations'));}
async function establishSession(){
  const user=await api('/api/me');
  if(user.role!=='COORDINATOR'&&user.role!=='MINISTER')throw new Error('Perfil sem permissão no MESCE.');
  role=user.role;
  $('role').textContent=role==='COORDINATOR'?'Perfil autorizado: Coordenação.':'Perfil autorizado: Ministro.';
  $('login').hidden=true;$('logout').hidden=false;$('refresh').hidden=false;
  $('celebrations-panel').hidden=false;
  $('create-panel').hidden=role!=='COORDINATOR';
  await loadCelebrations();
  status('Login validado e celebrações carregadas do backend.');
}
async function init(){
  // Production: Auth0 Regular Web Application. O segredo e o access token ficam no servidor.
  if(!['localhost','127.0.0.1'].includes(location.hostname)){
    $('login').disabled=false;
    $('login').textContent='Entrar com Auth0';
    $('login').addEventListener('click',()=>location.assign('/api/auth/login'));
    $('logout').addEventListener('click',async()=>{
      try{
        const response=await fetch('/api/auth/logout',{method:'POST',cache:'no-store'});
        if(!response.ok)throw Error('logout_failed');
        $('role').textContent='Não autenticado.';
        $('logout').hidden=true;$('login').hidden=false;
        status('Sessão encerrada.');
      }catch{status('Não foi possível encerrar a sessão.');}
    });
    $('refresh').hidden=true;
    $('celebrations-panel').hidden=true;
    $('create-panel').hidden=true;
    const reason=new URLSearchParams(location.search).get('auth_error');
    if(reason){
      history.replaceState(null,'',location.pathname);
      const messages={
        provider_denied:'O Auth0 negou o acesso. Confira os registros no painel Auth0.',
        exchange_denied:'O Auth0 recusou a troca do código. Confirme Client ID, Client Secret, callback e configuração de autenticação.',
        invalid_callback:'Retorno do Auth0 incompleto. Inicie o login novamente.',
        invalid_state:'A validação de segurança do login falhou. Inicie o login novamente.',
        missing_flow:'A sessão de login expirou ou não foi encontrada. Inicie o login novamente.',
        exchange_unavailable:'Não foi possível contactar o Auth0 para finalizar o login.',
        invalid_token_response:'O Auth0 retornou uma resposta inválida.',
        configuration:'A configuração do Auth0 no servidor está incompleta.'
      };
      status(messages[reason]||'Não foi possível concluir o login.');
    }
    try{
      const response=await fetch('/api/auth/session',{cache:'no-store'});
      if(!response.ok)throw Error('session_unavailable');
      const session=await response.json();
      if(session.authenticated===true){
        $('role').textContent='Sessão Auth0 autenticada. Perfil MESCE ainda não verificado.';
        $('login').hidden=true;$('logout').hidden=false;
        if(!reason)status('Login concluído. Cadastro e consulta aguardam a conexão segura com a API KofLang.');
      }else if(!reason){status('Entre com Auth0 para validar sua identidade.');}
    }catch{if(!reason)status('Serviço de autenticação indisponível no momento.');$('login').disabled=true;}
    return;
  }
  $('login').addEventListener('click',()=>login().catch(e=>status(e.message)));
  $('logout').addEventListener('click',()=>{signOut(true);});
  $('refresh').addEventListener('click',()=>loadCelebrations().then(()=>status('Dados atualizados.')).catch(e=>status(e.message)));
  $('celebration-form').addEventListener('submit',async event=>{
    event.preventDefault();if(role!=='COORDINATOR')return;
    const form=$('celebration-form'),button=$('submit');
    if(!form.reportValidity())return;
    const body={
      occursOn:$('occursOn').value,startsAt:$('startsAt').value,
      locationCode:$('locationCode').value.trim(),kind:$('kind').value.trim(),
      requiredMinisters:Number($('requiredMinisters').value)
    };
    if(!/^\d{4}-\d{2}-\d{2}$/.test(body.occursOn)||!/^\d{2}:\d{2}$/.test(body.startsAt)||
       !body.locationCode||!body.kind||!Number.isInteger(body.requiredMinisters)||body.requiredMinisters<1||body.requiredMinisters>30){
      status('Confira os campos da celebração.');return;
    }
    button.disabled=true;
    try{await api('/api/celebrations',{method:'POST',body});await loadCelebrations();form.reset();status('Celebração salva no ambiente de desenvolvimento.');}
    catch(e){status(e.message);}finally{button.disabled=false;}
  });
  try{
    const local=['localhost','127.0.0.1'].includes(location.hostname);
    const response=await fetch(local?'/dev/auth-config':'/api/auth-config',{cache:'no-store'});
    if(!response.ok){
      const detail=await response.json().catch(()=>({}));
      if(detail.error==='auth0_api_audience_missing')throw new Error('Auth0 cadastrado na Vercel, mas falta AUTH0_AUDIENCE (identificador da API).');
      if(detail.error==='auth0_public_configuration_missing')throw new Error('AUTH0_DOMAIN ou AUTH0_CLIENT_ID indisponível neste ambiente.');
      throw new Error('Não foi possível carregar a configuração Auth0 deste ambiente.');
    }
    config=validateConfig(await response.json());$('login').disabled=false;
    if(await exchangeIfCallback())await establishSession();
    else status('Configuração disponível. Entre com Auth0 para acessar os dados.');
  }catch(e){signOut(false);status(e.message);}
}
if(typeof module!=='undefined'&&module.exports)module.exports={validateConfig};
if(root&&root.document)document.addEventListener('DOMContentLoaded',init);
})(typeof window!=='undefined'?window:undefined);
