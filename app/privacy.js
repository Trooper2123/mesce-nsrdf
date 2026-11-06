/* MESCE POC — aggregation only; not a formal certification of anonymization.
 * No record identifiers, names, dates, addresses, or contacts are returned.
 * Minimum cohort suppression is a mitigation, not proof of irreversibility.
 */
(function (root) {
  'use strict';
  function aggregateAssignments(rows, settings) {
    if (!Array.isArray(rows)) throw new TypeError('As alocações devem formar uma lista.');
    const opts = settings || {};
    const minimumPeople = Math.max(5, Number.isInteger(opts.minimumPeople) ? opts.minimumPeople : 5);
    const minimumCelebrations = Math.max(3, Number.isInteger(opts.minimumCelebrations) ? opts.minimumCelebrations : 3);
    const people = new Set(), celebrations = new Set(), assignments = new Set();
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const person = row.ministerId;
      const celebration = row.id;
      if ((typeof person !== 'string' || !person.trim()) && !Number.isInteger(person)) continue;
      if ((typeof celebration !== 'string' || !celebration.trim()) && !Number.isInteger(celebration)) continue;
      const personKey = String(person), eventKey = String(celebration);
      const key = JSON.stringify([eventKey, personKey]);
      if (assignments.has(key)) continue;
      assignments.add(key);
      people.add(personKey);
      celebrations.add(eventKey);
    }
    if (people.size < minimumPeople || celebrations.size < minimumCelebrations) {
      return Object.freeze({ published: false, reason: 'small_cohort' });
    }
    return Object.freeze({
      published: true,
      celebrationCount: celebrations.size,
      assignmentCount: assignments.size
    });
  }
  const api = Object.freeze({ aggregateAssignments });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MescePrivacy = api;
})(typeof window !== 'undefined' ? window : undefined);
