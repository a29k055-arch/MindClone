# Validation — v0.6

13 Node tests cover evidence provenance, locale keys, safe tab-local fragment import and genuine closed mesh topology. Both resolutions have positive enclosed volume, every edge belongs to two faces, Euler characteristic 2 and all three dimensions exceed 130 model units.

Browser regression covers automatic rotation, hover pause/resume, six module hover/selection, actual mesh raycast click, one connection, unsupported biography refusal, interviews, synthetic fragment generation, MD/JSON exports/imports, invalid/duplicate rejection, cumulative metrics and no percentage UI. Three locales × five routes × five viewport widths (375, 390, 768, 1024, 1440), reduced motion and no external app requests are checked. Rendering is real WebGL; the lower-resolution mesh is used on mobile.

Source and all Git history paths reviewed; recognizable GitHub/OpenAI credential signatures found no matches. No archive, DB, env, Vault or actual interview files are tracked. Screenshots show only fictional specimens.

Live acceptance: https://a29k055-arch.github.io/MindClone/ returns HTTP 200. The full browser regression above also passed against the deployed site in a fresh anonymous browser context. Repository API confirmed private=false; Pages source gh-pages:/, public=true and HTTPS enforced. Main implementation commit a6e5645; deployment commit 8a304c5.

v0.6 adds checks for the restored right-side exploration panel, selected-domain description, inline empty record action, and DOM order: chat before brain; interview before upload before brain. The 13 unit tests and full three-language/five-width browser matrix passed locally. Prior live acceptance above refers to v0.5; v0.6 deployment is verified separately after publication.

Final v0.6 acceptance: the same full browser regression passed against canonical localhost:4173 and the public GitHub Pages URL in a fresh anonymous context. Live app source contains the shared exploration panel; live geometry uses the coarser desktop/mobile grid. Deployment a750928 was confirmed built without errors. Main implementation: 1db7d0a. Only fictional samples were used.

## Builder-first acceptance — 2026-10-20

16 unit tests pass, including unchanged closed brain topology, evidence provenance, three-language dictionary parity, language detection/manual override, independent default-false consent and voice-sample deduplication. Browser capture checks pass with fake microphone audio, actual CPU-int8 faster-whisper, three auto-detected languages and manual en/zh/ja selection. The engine produced original-language text for all fixtures; small-model errors remain and no accuracy score is claimed.

Navigation is Overview → Clone Builder → Persona Progress → My Clone; Settings is outside primary navigation and remains accessible on mobile. Overview's single primary CTA enters Builder. Default free conversation, rule-based adaptive short interviews and upload modes work. UI Japanese + Chinese input yields Chinese replies; manually forcing English works independently. Voice recording, explicit reference consent, revocation, persistent original audio/transcript linking and reload reopening are checked. Uploaded audio is decoded and validated; invalid file types are rejected. Original fragment MD/JSON round-trip and brain hover/selection regressions pass. Layouts cover three UI locales and five viewport widths (375,390,768,1024,1440). Capture-specific checks cover 390,768,1440.

The service rejects foreign origins and direct browser service calls; unauthorized transcription is blocked. Fixtures use built-in Windows TTS for voice-reference tests and a public Google FLEURS Japanese validation sample only for ASR. No user's microphone, real memory or private audio was used by automated tests. Test audio, model files and virtual environments remain outside the repository and deployment.
