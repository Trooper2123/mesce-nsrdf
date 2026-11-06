'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { aggregateAssignments } = require('../app/privacy.js');

const sample = [
  { id: 1, ministerId: 'a', minister: 'NOME CONFIDENCIAL', date: '2026-11-01', address: 'RUA CONFIDENCIAL', phone: '9999999' },
  { id: 1, ministerId: 'b', minister: 'OUTRA PESSOA' },
  { id: 2, ministerId: 'c' },
  { id: 2, ministerId: 'd' },
  { id: 3, ministerId: 'e' },
  { id: 3, ministerId: 'f' },
];
test('não publica células pequenas', () => {
  assert.deepEqual(aggregateAssignments(sample.slice(0, 4)), { published: false, reason: 'small_cohort' });
});
test('remove identificadores e campos pessoais do resumo', () => {
  const result = aggregateAssignments(sample);
  assert.deepEqual(result, { published: true, celebrationCount: 3, assignmentCount: 6 });
  assert.doesNotMatch(JSON.stringify(result), /NOME CONFIDENCIAL|RUA CONFIDENCIAL|9999999|2026-11-01|ministerId|address|date|phone/);
});
test('duplicidades não aumentam contagem', () => {
  assert.equal(aggregateAssignments([...sample, sample[0]]).assignmentCount, 6);
});
test('não aceita entrada inválida e impede configurar limiar baixo', () => {
  assert.throws(() => aggregateAssignments(null), TypeError);
  assert.deepEqual(aggregateAssignments(sample.slice(0, 2), {minimumPeople: 1, minimumCelebrations: 1}), { published: false, reason: 'small_cohort' });
});
