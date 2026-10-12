export type PrivacyLevel = 'PUBLIC' | 'PERSONAL' | 'PRIVATE' | 'VAULT' | 'SEALED';
export type EvidenceKind = 'FACT' | 'SUBJECTIVE_MEMORY' | 'OPINION' | 'AI_ANALYSIS' | 'AI_INFERENCE' | 'UNCONFIRMED';
export type Region = 'memory' | 'personality' | 'values' | 'reasoning' | 'emotion' | 'language';
export type Locale = 'zh' | 'en' | 'ja';
export interface RawAnswer { question: string; answer: string; locale?: Locale }
export interface MemoryEvidence {
  memory_id: string; title: string; event: string; source_session: string;
  confidence: number | null; privacy_level: PrivacyLevel; kind: EvidenceKind; demo: boolean;
}
export interface CandidateEvidence {
  key: string; source_answer: number; kind: EvidenceKind; confidence: number | null; demo: boolean;
}
export interface CloneReply {
  answer: string; answer_key: string; memories: MemoryEvidence[];
  source: string | null; confidence: number | null;
  why: string; why_key: string; regions: Region[];
}
export interface MemoryFragment {
  schema_version: string; demo: boolean; synthetic: boolean; fragment_id: string;
  display_id: string; source_session: string; created_at: string; privacy_level: PrivacyLevel;
  status: 'UNCONFIRMED'; confidence: number | null; raw_answers: RawAnswer[];
  candidate_memories: CandidateEvidence[]; values: CandidateEvidence[];
  reasoning_patterns: CandidateEvidence[]; personality_evidence: CandidateEvidence[];
  language_features: CandidateEvidence[]; note: string;
}
/** Same port serves Clone Builder capture and My Clone evidence read. */
export interface MindCloneCore {
  chat(query: string): Promise<CloneReply>;
  nextQuestion(answers: RawAnswer[]): Promise<string | null>;
  generateFragment(answers: RawAnswer[]): Promise<MemoryFragment>;
  previewCapture(answers: RawAnswer[]): {synthetic:boolean;counts:Record<Exclude<Region,'emotion'>,number>};
  getProgress(): Promise<Record<Region|'sessions'|'fragments'|'memories'|'opinions',number>>;
}
/** Planned server boundary only; never treat a local UI toggle as authentication. */
export interface AuthSession { subject: string; expires_at: string; scopes: string[] }
export interface AuthPort {
  currentSession(): Promise<AuthSession | null>;
  signOut(): Promise<void>;
}
/** Authorization is enforced by the future server for every record and request. */
export interface AccessPolicy {
  authorize(session: AuthSession | null, operation: 'read'|'write', record: {
    owner: string; privacy_level: PrivacyLevel;
  }): Promise<boolean>;
}
