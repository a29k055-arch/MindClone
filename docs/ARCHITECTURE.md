# Architecture & integration boundaries — v0.5

The existing Web module is iterated in place; the Master Archive is unchanged. No database migration, root mapping, indexing or real-data import is performed.

## Shared core
Clone Builder captures original questions and answers through MindClone Core. My Clone reads evidence through the same Core interface. DemoCore currently provides deterministic fixtures only. Neither interface imports archive files.

Modules:
- `src/app.js`: five routes, conversation, capture, fragment state and locale switching. Untrusted input is escaped before HTML insertion.
- `src/i18n.js` and `locales/*.json`: all core UI copy, browser detection and optional language preference persistence.
- `src/sample-data.js`: known fictional interview specimens. Only exact matching full specimens generate illustrative candidates.
- `src/core.js`: shared demo adapter; free text remains unconfirmed raw capture, real archive progress remains zero.
- `src/contracts.d.ts`: evidence, fragment, region, locale and Core contracts; future AuthPort and AccessPolicy.
- `server.mjs`: fixed static asset allowlist, local bind and CSP. Same-origin JSON language imports are allowed; there are no API write endpoints.

All progress is expressed as cumulative counts. No percentage or completion ceiling is displayed. Synthetic candidate counts use source-answer indexes. Brain highlighting represents conceptual domain selection, not a genuine retrieval pipeline. No anatomical accuracy is claimed.

## Auth and deployment
Repository and static demo are Public. No private data service is connected. GitHub Pages serves reviewed runtime files; a separate authenticated service is required before connecting real personas.

A future authenticated API adapter replaces DemoCore. Suggested endpoint boundaries: POST /v1/clone/replies; POST /v1/interviews; POST /v1/interviews/:id/answers; POST /v1/interviews/:id/close; POST /v1/fragments/:id/review; GET /v1/persona/progress. These endpoints do not run yet.

Deploy real private data only after choosing an authentication-capable hosting/access layer. Authenticate identity server-side, authorize each operation and record by owner/privacy/consent, and protect both frontend access and the Memory API. Reject missing/expired sessions before any retrieval or write. Do not embed provider keys, databases or private records in static assets. A UI badge or browser state never establishes security.

Core services remain: InterviewService, FragmentReviewService, MemoryRepository, EvidenceRetriever, LLMRouter, AccessPolicy and transactional IdAllocator. SQLite first; PostgreSQL/vector index later. Filter privacy and ownership before retrieval. SEALED excludes AI access; Vault requires separate protected access and encryption. Model calls need authorization for the minimal selected records.

## Schema and provenance
RawAnswer preserves question, answer and original locale. Locale changes never rewrite stored text. CandidateEvidence distinguishes SUBJECTIVE_MEMORY, AI_ANALYSIS and AI_INFERENCE with source_answer, null confidence and demo:true. All generated fragments are UNCONFIRMED. Any edited or partial specimen receives no extraction. A caller-supplied synthetic flag is ignored.

Fragment interchange naming remains MC_FRAGMENT_YYYYMMDD_F####.md/.json. Demo F0001 and MF-000001 do not replace v0.1 archive IDs or naming. Review, unique transactional allocation, privacy validation, versioning and explicit import are prerequisites for archive writing. Markdown presents labels in the selected language; JSON retains semantic keys plus original text.

## Archive paths
The module retains its own Git root under 09_CODE/web. The future local service resolves MINDCLONE_ROOT from the authoritative mapping and validates relative POSIX paths within it. No browser-provided filesystem path is trusted. Moving the archive follows the existing migration protocol. This release does not change archive system status or path mappings.

## Data boundary
This public code repository contains code, docs, translations and synthetic screenshots. Real persona, identity, interviews, SQLite and Vault remain in a separate protected data layer. Private Git is not a Vault. Git's default-deny allowlist remains active, excluding exported fragments and secrets.

Page memory holds demo input only. Refresh clears it; hash navigation and language changes preserve it for the current session. localStorage holds language preference only, never interviews. Reduce-motion choice is session-only and system preferences are always respected.

## Local fragment staging — v0.4
DemoCore importFragment accepts filename and original text in page memory only. MD is preserved; JSON syntax and root-object shape are checked without trusting evidence arrays. Every imported entry is PRIVATE/UNREVIEWED, even if the file claims PUBLIC or approved evidence. listFragments omits raw content. The UI lists escaped filenames and source IDs, never renders imported HTML or Markdown. Exact file/text duplicates are not re-added. Per-file and session limits bound memory use.

getWorkspaceSummary distinguishes locally generated sessions/fragments/imports and fictional Demo candidate counts from getProgress's zero verified archive metrics. Language changes and hash routes preserve session state; refresh clears it. No upload POST endpoint exists. FragmentIngestPort reserves staging, review and authenticated persistence; it is not implemented. No archive/database/root mapping or other project is changed.


## Volumetric brain — v0.5
Original implicit volume → marching tetrahedra → welded closed indexed mesh → Three.js Mesh / LineSegments / Points. Desktop 1462 vertices / 2920 faces; mobile 968 / 1932. Lazy runtime import, DPR clamp and reduced-motion/offscreen cleanup. hoveredDomain and selectedDomain remain separate; only selection changes point shader attributes. Raycasting picks actual mesh faces, while a projected domain centroid controls the single SVG connector.
