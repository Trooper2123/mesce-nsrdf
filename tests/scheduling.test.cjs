'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const domain=require('../app/scheduling.js');
const ministers=Array.from('ABC',x=>({id:x,name:'Fictício '+x}));
const events=[{id:1,date:'2026-12-06',time:'08:00',name:'Missa',slots:2},{id:2,date:'2026-12-06',time:'19:00',name:'Missa extra',slots:1}];
test('impedimento por missa não impede outro horário',()=>{
  const r=domain.generate({ministers,events,absences:[{minister:'A',type:'CELEBRATION',eventId:1}]});
  assert.equal(r.issues.length,0);
  assert(!r.rows.some(x=>x.id===1&&x.ministerId==='A'));
  assert(r.rows.some(x=>x.id===2&&x.ministerId==='A'));
});
test('dia e período bloqueiam inclusive extremidades',()=>{
  assert(domain.blocks({type:'DAY',days:['2026-12-06']},events[0]));
  assert(domain.blocks({type:'PERIOD',start:'2026-12-06',end:'2026-12-09'},events[0]));
  const r=domain.generate({ministers,events,absences:[{minister:'A',type:'DAY',days:['2026-12-06']},{minister:'B',type:'PERIOD',start:'2026-12-06',end:'2026-12-09'}]});
  assert(r.issues.some(x=>x.code==='SLOTS'));
});
test('missa especial pode ter mais vagas, mas não confirma se estiver descoberta',()=>{
  const r=domain.generate({ministers,events:[{...events[0],slots:5}],absences:[]});
  assert.equal(r.rows.length,3);
  assert.equal(r.issues[0].code,'SLOTS');
});
test('substituição manual não permite impedimento nem conflito',()=>{
  const data={ministers,events:[events[0]],absences:[{minister:'C',type:'CELEBRATION',eventId:1}],rows:[
    {id:1,ministerId:'A',minister:'Fictício A',date:events[0].date,time:events[0].time},
    {id:1,ministerId:'B',minister:'Fictício B',date:events[0].date,time:events[0].time}
  ]};
  assert.equal(domain.replace({...data,eventId:1,oldMinisterId:'A',newMinisterId:'C'}).reason,'INELIGIBLE');
  assert.equal(domain.replace({...data,eventId:1,oldMinisterId:'A',newMinisterId:'B'}).reason,'ALREADY_ASSIGNED');
  const good=domain.replace({...data,absences:[],eventId:1,oldMinisterId:'A',newMinisterId:'C'});
  assert(good.ok);
  assert.equal(good.issues.length,0);
});
test('não aprovar escala com ministro desativado ou choque de horário',()=>{
  const bad=domain.validate({ministers:[{id:'A',active:false}],events:[events[0]],absences:[],rows:[{id:1,ministerId:'A',date:events[0].date,time:events[0].time}]});
  assert(bad.some(x=>x.code==='INELIGIBLE'));
});
