'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const type = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json; charset=utf-8'};
const allowed = new Set(['/','/index.html','/privacidade.html','/manifest.webmanifest','/icon.svg','/sw.js','/app/privacy.js','/app/scheduling.js']);
const port = Number(process.env.PORT||4173);
const server = http.createServer((req,res)=>{
  const pathname = new URL(req.url,'http://localhost').pathname;
  if (req.method !== 'GET' || !allowed.has(pathname)) {
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Não encontrado');return;
  }
  const file = path.join(root,pathname==='/'?'index.html':pathname.slice(1));
  fs.readFile(file,(err,bytes)=>{
    if(err){res.writeHead(404);res.end('Arquivo indisponível');return;}
    res.writeHead(200,{'Content-Type':type[path.extname(file)]||'text/plain; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"});
    res.end(bytes);
  });
});
server.listen(port,'127.0.0.1',()=>process.stdout.write('MESCE DEV: http://127.0.0.1:'+server.address().port+' (somente dados fictícios)\n'));
