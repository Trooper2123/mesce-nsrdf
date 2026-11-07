'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const manifest=JSON.parse(read('manifest.webmanifest'));
const html=read('index.html');
const worker=read('sw.js');
const server=read('scripts/dev-server.cjs');
assert.equal(manifest.lang,'pt-BR');
assert.equal(manifest.display,'standalone');
assert(Array.isArray(manifest.icons)&&manifest.icons.length>0,'Manifesto sem icone');
assert(html.includes('rel="manifest"'),'Manifesto nao referenciado');
assert(html.includes('href="/pwa.html"'),'Falta acesso ao guia PWA');
assert(html.includes('href="/app/accessibility.css"'),'Falta folha de acessibilidade');
assert(html.includes('href="/operacional.html"'),'Falta entrada para modo operacional');
assert(fs.existsSync(path.join(root,'operacional.html')),'Tela operacional ausente');
assert(fs.existsSync(path.join(root,'app/operational.js')),'Cliente PKCE ausente');
assert(worker.includes("url.pathname.startsWith('/api/')"),'Service worker não exclui API autenticada');
assert(worker.includes("url.pathname === '/operacional.html'"),'Service worker não exclui tela operacional');
const assets=['/index.html','/pwa.html','/privacidade.html','/app/privacy.js','/app/scheduling.js','/app/visits.js','/app/accessibility.css'];
for(const asset of assets){
  assert(server.includes("'"+asset+"'"),'Asset nao permitido pelo servidor: '+asset);
  assert(fs.existsSync(path.join(root,asset.slice(1))),'Asset ausente: '+asset);
}
assert(worker.includes("'/pwa.html'"),'Guia nao incluido no cache estatico');
assert(!html.includes('localStorage.setItem'),'Dados nao devem ser persistidos na POC');
console.log('PWA: manifesto, arquivos, guia, CSS e seguranca basica OK');
