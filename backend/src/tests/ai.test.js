const test = require('node:test');
const assert = require('node:assert/strict');
const { fallbackClassify } = require('../services/aiFallback');
const { jaccard, tokens } = require('../services/duplicate.service');
const { analyzeGrievance } = require('../services/ai.service');

const DEPTS = ['Public Works (PWD)', 'Health & Family Welfare'];

test('fallback classifier is labelled and classifies a road complaint', () => {
  const r = fallbackClassify('Big pothole on the road near the bridge, very dangerous');
  assert.equal(r.category, 'Public Infrastructure');
  assert.equal(r.priority, 'HIGH');
  assert.match(r.reasoning, /fallback/i);
});

test('duplicate similarity ranks related text above unrelated text', () => {
  const a = tokens('pothole on road near bus stand');
  assert.ok(jaccard(a, tokens('big pothole road bus stand')) > jaccard(a, tokens('teacher missing in school')));
});

test('valid LLM output is accepted and not marked as fallback', async () => {
  const llm = async () => JSON.stringify({ department: 'Public Works (PWD)', category: 'Public Infrastructure', priority: 'HIGH', summary: 'Pothole risk.', reasoning: 'Road safety.' });
  const r = await analyzeGrievance('x'.repeat(30), { llm, departments: DEPTS });
  assert.equal(r.isFallback, false);
  assert.equal(r.priority, 'HIGH');
});

test('LLM output outside the allow-list is rejected -> labelled fallback', async () => {
  const llm = async () => JSON.stringify({ department: 'Ministry of Made Up', category: 'Public Infrastructure', priority: 'LOW', summary: 's', reasoning: '' });
  const r = await analyzeGrievance('road pothole on main road', { llm, departments: DEPTS });
  assert.equal(r.isFallback, true);
});

test('LLM failure or garbage output -> labelled fallback', async () => {
  for (const llm of [async () => { throw new Error('timeout'); }, async () => 'not json at all']) {
    const r = await analyzeGrievance('hospital has no medicine', { llm, departments: DEPTS });
    assert.equal(r.isFallback, true);
    assert.equal(r.provider, 'rule-based-fallback');
  }
});
