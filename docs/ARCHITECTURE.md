# Architecture & integration boundaries

## Implemented
- `index.html`: accessible application shell and hash navigation.
- `styles.css`: responsive layout, system fonts, CSS consciousness visual.
- `src/app.js`: overview, conversation, interview and dashboard views. Untrusted input is escaped before HTML insertion.
- `src/core.js`: shared asynchronous DemoCore port. No network, persistence, or archive reads.
- `src/sample-data.js`: explicitly fictional PUBLIC fixture and scripted questions.
- `src/contracts.d.ts`: evidence, privacy, reply, raw answer and fragment interfaces.
- `server.mjs`: static local development server, public asset allowlist and restrictive CSP.

## Planned Core implementations
The frontend's Core interface will be implemented by an authenticated API client, rather than importing the local archive. Suggested endpoints: POST /v1/clone/replies; POST /v1/interviews; POST /v1/interviews/:id/answers; POST /v1/interviews/:id/close; POST /v1/fragments/:id/review; GET /v1/persona/progress. These are proposals, not running endpoints.

Authentication and authorization run on the server for every operation. A fragment is a candidate package: preserve immutable raw answers, distinguish FACT / SUBJECTIVE_MEMORY / OPINION / AI_ANALYSIS / AI_INFERENCE / UNCONFIRMED, require review, and retain provenance, timestamps, confidence, revisions and privacy. User input defaults PRIVATE. A public demo flag is never authorization to publish user input.

Core services: InterviewService, FragmentReviewService, MemoryRepository, EvidenceRetriever, LLMRouter, AccessPolicy, and transactional IdAllocator. SQLite is the initial repository adapter; PostgreSQL and a vector index are later adapters. Retrieval filters ownership and privacy before selecting evidence. Router credentials stay server-side. Provider failure or absent evidence returns an explicit unavailable/no-record response.

## Archive integration
This Web module lives under `09_CODE/web` with its own Git root. The Master Archive is not a Git root for this public project. No existing scripts, database, paths mapping, Master Index, system status, or archived material is changed.

A future local service resolves the configured MINDCLONE_ROOT from the authoritative root mapping. All entity asset paths are validated relative POSIX paths within that root. No browser-supplied filesystem path is trusted. Root relocation uses the existing migration protocol; a frontend release never migrates a database.

The new fragment download naming convention is an interchange proposal, not a replacement for v0.1 MC_MEM or MC_INT naming and six-digit entity IDs. Demo F0001 is not safe for production allocation. Explicit schema mapping, unique IDs, privacy review and an import transaction are required before any archive write.

## Public/private separation
Public: frontend, interfaces, reviewed docs, synthetic fixtures and screenshots.
Private: identity, persona records, original interviews, archive paths and databases behind access control. `MindClone-Private` is reserved in the architecture only. Vault encryption, short-lived authorization and SEALED exclusion require separate implementation.

No fine-tuning, complete RAG, payments or full account system in this version.
