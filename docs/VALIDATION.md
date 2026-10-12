# Validation — v0.3, 2026-10-12

## Core and translations
8 Node tests passed: unsupported/compound biography questions, supported queries in all languages, identical complete translation key sets, exact fictional sample extraction, rejection of caller-supplied synthetic promotion, partial-sample behavior, immutable exact raw text and zero real archive counts. The three JSON locale dictionaries have 194 matching keys.

## Browser checks
Real headless Microsoft Edge with the existing Playwright installation passed:
- 3 locales × 5 routes × 5 viewport widths (375, 390, 768, 1024, 1440 pixels), no horizontal document overflow.
- Browser locale detection for Chinese, Japanese and unsupported-language fallback; manual preference survives reload.
- Language changes preserve unsent chat/interview drafts, existing original answers and generated fragments; demo replies and interface text update.
- All 6 brain controls: hover local illumination, keyboard focus + Enter selection, aria-pressed state and region panel updates.
- Desktop parallax, synthetic Memory + Reasoning feedback, unsupported-question no-pulse state.
- Interview starts at 0% with no neural nodes; grows with answered questions, ends at 100% capture completion.
- Exact 5-answer synthetic specimen yields 2/3/2/4/3 Demo candidates with raw-answer provenance and unknown confidence.
- Capsule View, Markdown and JSON downloads, unchanged source text after locale switching.
- Arbitrary HTML-like input stays literal, preserves surrounding whitespace, remains PRIVATE, and yields 0 extracted claims.
- Dashboard counts remain 0 even after a Demo fragment.
- System reduced motion and Settings toggle disable animation; mobile/coarse pointers avoid parallax.
- localStorage contains only mindclone.language. Refresh clears session input.
- No external network requests or browser/console errors.

Desktop and Chinese mobile screenshots show synthetic samples or zero connected records, not user interviews. English/Chinese/Japanese homepage screenshots are included. Visual inspection confirms legible labels, responsive layouts and restrained effects.

## Privacy and publication
Existing repository was changed from Public to Private using the owner's existing Git credentials. Authenticated GitHub audit: a29k055-arch/MindClone = private; only Owner present; 0 pending invitations; GitHub Pages disabled; 0 releases; 0 deployments; fork count 0. Anonymous repository API returned 404.

The previously public history contains only the reviewed application, documentation, tests and fictional screenshots. No archive directories, SQLite, Vault or real interviews were tracked. A common credential-signature check found no API-token/private-key patterns in tracked history. A signature scan does not prove every conceivable secret absent; the reviewed file provenance and independent module boundary are the primary safeguards. We cannot establish whether someone copied the previously public code outside GitHub.

This private code repository still uses a default-deny Git allowlist. Private data and downloaded fragments remain excluded. The Master Archive, its database, path mappings and other projects are unchanged.

## Reproduce
Run node --test. For browser checks, start node server.mjs, set MC_TEST_DEPENDENCIES to an existing Playwright node_modules directory and MC_TEST_URL to http://127.0.0.1:4173, then run node ui-check.mjs. The check uses Windows Edge's standard path and regenerates synthetic screenshots. The development server allows only static application and translation assets and binds to loopback.

## Limits
Viewport checks are browser emulation, not physical-device testing. The brain is abstract SVG, not medical anatomy or full 3D. Source highlighting is a deterministic visual Demo. No real extraction, RAG, LLM, database adapter, login system, authenticated deployment or archive import is implemented. Auth contracts reserve the server boundary without claiming security from a frontend badge.
