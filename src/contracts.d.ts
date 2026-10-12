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
  importFragment(file: {name:string; content:string}): Promise<{entry:ImportedFragment; duplicate:boolean}>;
  listFragments(): Promise<ImportedFragment[]>;
  getWorkspaceSummary(): Promise<WorkspaceTotals>;
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

/** Session-only staging. Raw content is never returned by the list API. */
export interface ImportedFragment {
  id: string; name: string; source_id: string | null; kind: 'generated' | 'imported';
  format: 'md' | 'json'; imported_at: string; size: number;
  status: 'UNREVIEWED'; privacy_level: 'PRIVATE';
}
export interface WorkspaceTotals {
  sessions: number; fragments: number; imports: number; memories: number;
  values: number; reasoning: number; personality: number; language: number;
}
/** Future ingestion stages require explicit review before any authorized database write. */
export interface FragmentIngestPort {
  stage(file: {name:string; content:string}): Promise<ImportedFragment>;
  review(id:string): Promise<{status:'UNREVIEWED'|'APPROVED'|'REJECTED'}>;
  persistApproved(id:string, session:AuthSession): Promise<void>;
}
