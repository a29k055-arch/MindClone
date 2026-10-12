import { dictionaries } from './i18n.js';

/** Fictional fixture only. Never import the Master Archive into the application. */
export const memory = {
  memory_id: 'DEMO-M001', title: 'Learning by making',
  event: dictionaries.en['clone.memoryQuote'], source_session: 'DEMO-S001',
  confidence: null, privacy_level: 'PUBLIC', kind: 'OPINION', demo: true,
};
export const questions = Array.from({length: 5}, (_, i) => dictionaries.en[`question.${i}`]);
export const sampleAnswers = Array.from({length: 5}, (_, i) => dictionaries.en[`sample.${i}`]);
export function isExactSample(answer, index) {
  const d = dictionaries[answer.locale || 'en'];
  return Boolean(d && index < 5 && answer.question === d[`question.${index}`] && answer.answer === d[`sample.${index}`]);
}
// The specimen illustrates extraction; it never runs on arbitrary user text.
export const specimen = {
  candidate_memories: [0, 1].map(i => ({key: `evidence.memory${i}`, source_answer: i === 0 ? 0 : 4, kind: 'SUBJECTIVE_MEMORY', confidence: null, demo: true})),
  values: [0, 1, 2].map(i => ({key: `evidence.values${i}`, source_answer: i, kind: 'AI_ANALYSIS', confidence: null, demo: true})),
  reasoning_patterns: [0, 1].map(i => ({key: `evidence.reasoning${i}`, source_answer: i === 0 ? 2 : 3, kind: 'AI_ANALYSIS', confidence: null, demo: true})),
  personality_evidence: [0, 1, 2, 3].map(i => ({key: `evidence.personality${i}`, source_answer: i, kind: 'AI_INFERENCE', confidence: null, demo: true})),
  language_features: [0, 1, 2].map(i => ({key: `evidence.language${i}`, source_answer: i === 0 ? 0 : i === 1 ? 2 : 4, kind: 'AI_ANALYSIS', confidence: null, demo: true})),
};
