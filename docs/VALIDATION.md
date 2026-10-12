# Validation — v0.4, 2026-10-13

11 Node tests passed, retaining prior evidence/privacy/locale checks and adding local import behavior, invalid/oversized file rejection, duplicate handling, raw-text preservation, untrusted evidence exclusion and cumulative generated/imported totals.

Real headless Microsoft Edge / existing Playwright checks passed:
- The same Canvas XYZ lateral brain renderer on Overview, My Clone and Clone Builder.
- Default slow rotation; pointer entry pauses with unchanged angle; pointer exit resumes.
- Six left-side modules in one vertical column at all tested widths.
- Hover highlighting and folded SVG connector endpoint; module keyboard activation and actual canvas point selection.
- Selection does not change route or create a region record/detail page.
- No visible numeric percentages, progress elements or completion bars on any route.
- Existing evidence-aware chat, no-reliable-memory state, interview, fictional specimen and JSON/Markdown export.
- Round-trip import of both exported formats into local Fragment List and Persona Progress; duplicate and invalid-file handling.
- Counts distinguish generated sessions/fragments and imported pending files from zero verified archive records.
- Three languages × five routes × five viewport widths (375, 390, 768, 1024, 1440 pixels), without horizontal document overflow.
- Draft preservation on language switching; translated upload/error/empty-state copy.
- Mobile DPR capped at 1; reduced-motion system and session settings stop rotation.
- Reload clears imported fragments and session totals. localStorage contains language preference only.
- No browser/console errors or external network requests.

Screenshots show only fictional fixtures and locally re-imported fictional exports. Reference images are not copied into the repository. Visual inspection confirms side-view silhouette, front/back XYZ mesh depth, selected-region lighting, left modules, folded connectors and shared sans-serif typography.

Rendering uses no WebGL or third-party 3D library: Canvas 2D performs perspective projection and depth-sorted faces/edges; SVG handles connectors. Desktop frames are capped around 25/s, mobile around 12/s. DPR is capped at 1.5 desktop / 1 mobile. Offscreen/hidden-tab animation stops; route changes disconnect observers and cancel frames. Shape is abstract, not medical anatomy.

Imports are session-only and PRIVATE/UNREVIEWED. MD stays raw; JSON gets basic syntax/root-object checks only. Imported fields never authorize access or contribute to evidence claims. Lists omit original content and escape filenames/source IDs. Limits bound local memory use; there is no upload server, persistence, database import, RAG or authentication implementation.

Reproduce: node --test. Start node server.mjs; set MC_TEST_DEPENDENCIES to an existing Playwright node_modules directory and MC_TEST_URL to the local server; run node ui-check.mjs. It regenerates only fictional screenshots.

Repository publication checks retain the default-deny code/doc/translation/screenshot allowlist. Real memory, archives, SQLite, Vault, credentials and exported/imported files remain excluded. The Master Archive and other projects are untouched. Before pushing, confirm the existing a29k055-arch/MindClone repository remains Private.

Limits: browser viewports are emulated, not physical-phone testing. Import parsing, review, persistent storage and authoritative ID allocation are reserved future interfaces. Session cumulative counts reset on refresh; they do not claim a durable database.
