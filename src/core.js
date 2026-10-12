import { memory, questions, isExactSample, specimen } from './sample-data.js';
import { translate } from './i18n.js';

/** Shared MindClone Core port. Replace with an authenticated server API adapter. */
export class DemoCore {
  async chat(query) {
    const supported = /^(how do you learn\??|你如何学习[？?]?|どのように学びますか[？?]?)$/i.test(query.trim());
    return supported ? {
      answer: translate('clone.replyKnown'), answer_key: 'clone.replyKnown',
      memories: [memory], source: memory.source_session, confidence: null,
      why: translate('clone.whyKnown'), why_key: 'clone.whyKnown', regions: ['memory', 'reasoning'],
    } : {
      answer: translate('clone.replyMissing'), answer_key: 'clone.replyMissing',
      memories: [], source: null, confidence: null,
      why: translate('clone.whyMissing'), why_key: 'clone.whyMissing', regions: [],
    };
  }
  previewCapture(answers) {
    const exact = answers.length > 0 && answers.every(isExactSample);
    const fields = {memory:'candidate_memories', values:'values', reasoning:'reasoning_patterns', personality:'personality_evidence', language:'language_features'};
    return {
      synthetic: exact,
      counts: Object.fromEntries(Object.entries(fields).map(([region, field]) => [region,
        exact ? specimen[field].filter(e => e.source_answer < answers.length).length : 0])),
    };
  }
  async getProgress() {
    return {memory:0, personality:0, values:0, reasoning:0, emotion:0, language:0, sessions:0, fragments:0, memories:0, opinions:0};
  }
  async nextQuestion(answers) { return questions[answers.length] ?? null; }
  async generateFragment(answers) {
    const synthetic = answers.length === 5 && answers.every(isExactSample);
    const evidence = synthetic ? structuredClone(specimen) : {
      candidate_memories: [], values: [], reasoning_patterns: [], personality_evidence: [], language_features: [],
    };
    return {
      schema_version: '0.2-demo', demo: true, synthetic,
      fragment_id: 'DEMO-F0001', display_id: 'MF-000001', source_session: 'DEMO-SESSION',
      created_at: new Date().toISOString(), privacy_level: synthetic ? 'PUBLIC' : 'PRIVATE',
      status: 'UNCONFIRMED', confidence: null,
      raw_answers: answers.map(a => ({...a})), ...evidence,
      note: 'Synthetic specimens only; free-text answers are not analyzed. Review is required before import.',
    };
  }
}
export const core = new DemoCore();
export function fragmentFilename(date, ext) {
  return `MC_FRAGMENT_${date.replaceAll('-', '')}_F0001.${ext}`;
}
export function fragmentMarkdown(fragment, locale = 'en') {
  const t = key => translate(key, locale);
  const raw = fragment.raw_answers.map((a, i) => `### ${t('builder.question')} ${i + 1}\n${a.question}\n\n${a.answer}\n`).join('\n');
  const candidates = ['candidate_memories', 'values', 'reasoning_patterns', 'personality_evidence', 'language_features']
    .flatMap(field => fragment[field] || []).map(e => `- ${t(e.key)} [${e.kind}; ${t('clone.source')}: Q${e.source_answer + 1}; DEMO]`).join('\n');
  return `# ${t('fragment.exportHeading')}\n\nDEMO · UNCONFIRMED · ${fragment.privacy_level}\n\n${t('fragment.id')}: ${fragment.fragment_id}\n${t('fragment.source')}: ${fragment.source_session}\n${t('fragment.date')}: ${fragment.created_at}\n${t('clone.confidence')}: ${t('clone.unknown')}\n\n${t('fragment.exportNote')}\n\n## ${t('fragment.exportRaw')}\n\n${raw}\n## ${t('fragment.exportEvidence')}\n${candidates || t('fragment.raw')}\n`;
}
