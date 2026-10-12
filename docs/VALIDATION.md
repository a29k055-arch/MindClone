# Validation — 2026-10-12

Passed Node's built-in test runner: 4 tests for strict evidence matching, unsupported biography questions, immutable raw fragment capture, unknown confidence, PRIVATE defaults and zero archive counts.

Passed real headless Microsoft Edge / Playwright checks:
- Overview → My Clone entry, fictional learning answer, unsupported biography → No reliable memory found.
- Five fictional interview answers, scripted follow-ups, End Session, fragment generation and JSON download filename.
- All four routes at 375, 390, 768 and 1440 pixel viewport widths; no horizontal document overflow.
- Malicious-looking text remains literal in the fragment, not executable HTML.
- No browser page errors.
- Screenshots captured at 1440 desktop / 390 mobile and visually inspected.

Run `node --test` from this module. To reproduce the browser check, install Playwright in your own development environment and set MC_TEST_DEPENDENCIES to its node_modules directory, then run `node ui-check.mjs` with the local server active. The check uses the standard Windows Edge executable path; adjust it if needed. This test script is optional and not loaded by the application.

Public publication review: repository root is only the web module, fresh independent history; Git uses an explicit public-file allowlist plus archive, database, environment, key and downloaded-fragment exclusions. Inspect `git ls-files` before each publish. Ignoring is not a substitute for checking already tracked files.

Limits: viewport testing is browser emulation, not a physical phone test. No live LLM, auth, RAG, database, archive importer or extraction engine has been tested because none is implemented. Public demo screenshots contain only provided fictional sample answers.
