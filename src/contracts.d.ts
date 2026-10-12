export type PrivacyLevel = 'PUBLIC' | 'PERSONAL' | 'PRIVATE' | 'VAULT' | 'SEALED';
export type EvidenceKind = 'FACT' | 'SUBJECTIVE_MEMORY' | 'OPINION' | 'AI_ANALYSIS' | 'AI_INFERENCE' | 'UNCONFIRMED';
export interface RawAnswer { question: string; answer: string }
export interface MemoryEvidence {
 memory_id: string; title: string; event: string; source_session: string;
 confidence: number | null; privacy_level: PrivacyLevel; kind: EvidenceKind; demo: boolean;
}
export interface CloneReply { answer: string; memories: MemoryEvidence[]; source: string | null; confidence: number | null; why: string }
export interface MemoryFragment {
 schema_version: string; demo: boolean; synthetic: boolean; fragment_id: string;
 source_session: string; created_at: string; privacy_level: PrivacyLevel;
 status: 'UNCONFIRMED'; confidence: number | null; raw_answers: RawAnswer[];
 candidate_memories: MemoryEvidence[]; values: unknown[]; reasoning_patterns: unknown[];
 personality_evidence: unknown[]; note: string;
}
/** Future authenticated adapter replaces DemoCore; no archive credentials in browsers. */
export interface MindCloneCore {
 chat(query: string): Promise<CloneReply>;
 nextQuestion(answers: RawAnswer[]): Promise<string | null>;
 generateFragment(answers: RawAnswer[], options?: {synthetic?: boolean}): Promise<MemoryFragment>;
 getProgress(): Promise<Record<'memory'|'personality'|'values'|'reasoning'|'language'|'sessions'|'fragments'|'memories'|'opinions',number>>;
}
