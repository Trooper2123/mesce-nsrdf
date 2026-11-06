/* MESCE development-only scheduling engine.
 * Pure functions; no persistence, authentication or personal data access.
 * Production domain logic must be implemented/validated in KofLang.
 */
(function (root) {
  'use strict';
  const validId = value => (typeof value === 'string' && value.trim().length > 0) || Number.isInteger(value);
  const equals = (a, b) => String(a) === String(b);

  function blocks(absence, event) {
    if (!absence || !event) return false;
    if (absence.type === 'CELEBRATION') return equals(absence.eventId, event.id);
    if (absence.type === 'DAY') return Array.isArray(absence.days) && absence.days.includes(event.date);
    if (absence.type === 'PERIOD') return !!absence.start && !!absence.end && event.date >= absence.start && event.date <= absence.end;
    return false;
  }

  function allowed(minister, event, absences, rows) {
    if (!minister || minister.active === false) return false;
    if (absences.some(item => equals(item.minister, minister.id) && blocks(item, event))) return false;
    // Conservative development rule: no simultaneous duties in same time slot.
    return !rows.some(row => equals(row.ministerId, minister.id) && row.date === event.date && row.time === event.time);
  }

  function validate(inputs) {
    const ministers = inputs.ministers || [], events = inputs.events || [], absences = inputs.absences || [], rows = inputs.rows || [];
    const issues = [];
    for (const event of events) {
      const expected = Number(event.slots);
      if (!Number.isInteger(expected) || expected <= 0 || expected > 30) {
        issues.push({eventId:event.id,code:'INVALID_SLOTS'}); continue;
      }
      const assigned = rows.filter(row => equals(row.id, event.id));
      if (assigned.length !== expected) issues.push({eventId:event.id,code:'SLOTS',needed:expected,assigned:assigned.length});
      const unique = new Set();
      for (const row of assigned) {
        const member = ministers.find(m => equals(m.id, row.ministerId));
        if (unique.has(String(row.ministerId))) issues.push({eventId:event.id,code:'DUPLICATE'});
        unique.add(String(row.ministerId));
        const elsewhere = rows.filter(item => !equals(item.id, event.id));
        if (!allowed(member, event, absences, elsewhere)) issues.push({eventId:event.id,code:'INELIGIBLE',ministerId:row.ministerId});
      }
    }
    for (const row of rows) if (!events.some(e => equals(e.id,row.id))) issues.push({eventId:row.id,code:'UNKNOWN_EVENT'});
    return issues;
  }

  function generate({ministers,events,absences}) {
    if (!Array.isArray(ministers) || !Array.isArray(events) || !Array.isArray(absences)) throw new TypeError('Listas inválidas.');
    const totals = new Map(ministers.map(m => [String(m.id),0])), rows = [];
    const ordered = [...events].sort((a,b) => (a.date+a.time+String(a.id)).localeCompare(b.date+b.time+String(b.id)));
    for (const event of ordered) {
      if (!validId(event.id) || !Number.isInteger(Number(event.slots)) || event.slots < 1 || event.slots > 30) throw new Error('Quantidade ou identificação inválida.');
      const candidates = ministers.filter(m => allowed(m,event,absences,rows)).sort((a,b) =>
        (totals.get(String(a.id))||0)-(totals.get(String(b.id))||0) || String(a.id).localeCompare(String(b.id)));
      for (const member of candidates.slice(0,event.slots)) {
        rows.push({id:event.id,name:event.name,date:event.date,time:event.time,ministerId:member.id,minister:member.name});
        totals.set(String(member.id),(totals.get(String(member.id))||0)+1);
      }
    }
    return {rows,issues:validate({ministers,events,absences,rows})};
  }

  function replace({ministers,events,absences,rows,eventId,oldMinisterId,newMinisterId}) {
    const event=events.find(e=>equals(e.id,eventId));
    const minister=ministers.find(m=>equals(m.id,newMinisterId));
    if (!event||!minister||!validId(newMinisterId)) return {ok:false,reason:'INVALID_TARGET'};
    if (rows.some(row=>equals(row.id,eventId)&&equals(row.ministerId,newMinisterId))) return {ok:false,reason:'ALREADY_ASSIGNED'};
    const index=rows.findIndex(row=>equals(row.id,eventId)&&equals(row.ministerId,oldMinisterId));
    if (index<0) return {ok:false,reason:'ASSIGNMENT_NOT_FOUND'};
    const remaining=rows.filter((_,i)=>i!==index);
    if (!allowed(minister,event,absences,remaining)) return {ok:false,reason:'INELIGIBLE'};
    const next=[...rows];
    next[index]={id:event.id,name:event.name,date:event.date,time:event.time,ministerId:minister.id,minister:minister.name};
    return {ok:true,rows:next,issues:validate({ministers,events,absences,rows:next})};
  }

  const api=Object.freeze({blocks,validate,generate,replace});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.MesceScheduling=api;
})(typeof window!=='undefined'?window:undefined);
