(function(root){
'use strict';
const eq=(a,b)=>String(a)===String(b);
function sunday(date){
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const d=new Date(date+'T00:00:00.000Z');
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===date&&d.getUTCDay()===0;
}
function blocks(absence,visit){
 if(absence.type==='DAY')return Array.isArray(absence.days)&&absence.days.includes(visit.date);
 if(absence.type==='PERIOD')return !!absence.start&&!!absence.end&&visit.date>=absence.start&&visit.date<=absence.end;
 return false; // Impedimento exclusivo de celebração não bloqueia uma visita.
}
function validate({visits,ministers,absences,celebrationRows,rows}){
 const issues=[],keys=new Set();
 for(const v of visits){
  if(!sunday(v.date))issues.push({visitId:v.id,code:'NOT_SUNDAY'});
  if(!Number.isInteger(v.slots)||v.slots<1||v.slots>8)issues.push({visitId:v.id,code:'INVALID_SLOTS'});
  const assigned=rows.filter(r=>eq(r.visitId,v.id));
  if(assigned.length!==v.slots)issues.push({visitId:v.id,code:'SLOTS',needed:v.slots,assigned:assigned.length});
  for(const row of assigned){
   const key=JSON.stringify([v.id,row.ministerId]);
   if(keys.has(key))issues.push({visitId:v.id,code:'DUPLICATE'});
   keys.add(key);
   const member=ministers.find(m=>eq(m.id,row.ministerId));
   if(!member||member.active===false||
     absences.some(a=>eq(a.minister,row.ministerId)&&blocks(a,v))||
     celebrationRows.some(c=>eq(c.ministerId,row.ministerId)&&c.date===v.date)||
     rows.some(other=>!eq(other.visitId,v.id)&&eq(other.ministerId,row.ministerId)&&other.date===v.date))
     issues.push({visitId:v.id,code:'INELIGIBLE'});
  }
 }
 for(const row of rows)if(!visits.some(v=>eq(v.id,row.visitId)))issues.push({visitId:row.visitId,code:'UNKNOWN_VISIT'});
 return issues;
}
function generate({visits,ministers,absences,celebrationRows}){
 if(![visits,ministers,absences,celebrationRows].every(Array.isArray))throw new TypeError('Listas de visitas inválidas');
 const rows=[],totals=new Map(ministers.map(m=>[String(m.id),0]));
 for(const v of [...visits].sort((a,b)=>(a.date+String(a.id)).localeCompare(b.date+String(b.id)))){
  if(!sunday(v.date)||!Number.isInteger(v.slots)||v.slots<1||v.slots>8)throw new Error('Visita deve ocorrer no domingo com vagas válidas.');
  const eligible=ministers.filter(m=>m.active!==false&&
    !absences.some(a=>eq(a.minister,m.id)&&blocks(a,v))&&
    !celebrationRows.some(c=>eq(c.ministerId,m.id)&&c.date===v.date)&&
    !rows.some(r=>eq(r.ministerId,m.id)&&r.date===v.date));
  eligible.sort((a,b)=>(totals.get(String(a.id))||0)-(totals.get(String(b.id))||0)||String(a.id).localeCompare(String(b.id)));
  for(const m of eligible.slice(0,v.slots)){
   rows.push({visitId:v.id,date:v.date,assistedId:v.assistedId,assistedLabel:v.assistedLabel,ministerId:m.id,minister:m.name});
   totals.set(String(m.id),(totals.get(String(m.id))||0)+1);
  }
 }
 return {rows,issues:validate({visits,ministers,absences,celebrationRows,rows})};
}
const api=Object.freeze({sunday,blocks,validate,generate});
if(typeof module!=='undefined'&&module.exports)module.exports=api;
if(root)root.MesceVisits=api;
})(typeof window!=='undefined'?window:undefined);
