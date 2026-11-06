'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {once}=require('node:events');
const path=require('node:path');

test('servidor local atende apenas arquivos estáticos permitidos',async()=>{
  const child=spawn(process.execPath,[path.join(__dirname,'../scripts/dev-server.cjs')],{
    env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']
  });
  let closed=false;child.on('exit',()=>{closed=true;});
  let output='';
  try{
    const port=await new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>reject(new Error('Servidor não iniciou')),5000);
      child.stdout.on('data',chunk=>{
        output+=String(chunk);
        const m=output.match(/127\.0\.0\.1:(\d+)/);
        if(m){clearTimeout(timeout);resolve(Number(m[1]));}
      });
      child.once('error',error=>{clearTimeout(timeout);reject(error);});
      child.once('exit',code=>{clearTimeout(timeout);reject(new Error('Servidor encerrou '+code));});
    });
    for(const [url,status] of [['/',200],['/privacidade.html',200],['/pwa.html',200],['/app/scheduling.js',200],['/app/visits.js',200],['/docs/TASKS.md',404],['/.env',404],['/tests/scheduling.test.cjs',404]]){
      const response=await fetch('http://127.0.0.1:'+port+url);
      assert.equal(response.status,status,url);
    }
  }finally{
    if(!closed){child.kill();await once(child,'exit');}
  }
});
