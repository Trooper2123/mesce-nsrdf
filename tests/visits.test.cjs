'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),v=require('../app/visits.js');
const ministers=Array.from('ABCD',id=>({id,name:'Fictício '+id}));
const base={id:1,date:'2026-12-06',assistedId:'demo-1',assistedLabel:'Assistido fictício 01',slots:2};
test('somente domingo',()=>{assert(v.sunday(base.date));assert(!v.sunday('2026-12-07'));assert(!v.sunday('2026-02-29'));});
test('visitas sem endereços e sem ministro de missa do domingo',()=>{
const r=v.generate({visits:[base],ministers,absences:[],celebrationRows:[{date:base.date,ministerId:'A'}]});
assert.equal(r.issues.length,0);assert.equal(r.rows.length,2);
assert(!r.rows.some(x=>x.ministerId==='A'));assert(!r.rows.some(x=>x.address||x.phone));
});
test('dia e período bloqueiam; missa específica não',()=>{
assert(v.blocks({type:'DAY',days:[base.date]},base));
assert(v.blocks({type:'PERIOD',start:base.date,end:base.date},base));
assert(!v.blocks({type:'CELEBRATION',eventId:3},base));
const r=v.generate({visits:[base],ministers,absences:[{minister:'A',type:'DAY',days:[base.date]},{minister:'B',type:'PERIOD',start:base.date,end:base.date}],celebrationRows:[]});
assert.deepEqual(r.rows.map(x=>x.ministerId),['C','D']);
});
test('vagas descobertas impedem aprovação',()=>{
const r=v.generate({visits:[{...base,slots:4}],ministers,absences:[],celebrationRows:[{date:base.date,ministerId:'A'},{date:base.date,ministerId:'B'}]});
assert(r.issues.some(x=>x.code==='SLOTS'));
});
test('não faz visita dupla no mesmo domingo',()=>{
const second={...base,id:2,assistedId:'demo-2'};
const r=v.generate({visits:[base,second],ministers,absences:[],celebrationRows:[]});
assert.equal(r.issues.length,0);assert.equal(new Set(r.rows.map(x=>x.ministerId)).size,4);
});
