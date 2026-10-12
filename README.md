# MindClone
### 思维克隆 · 数字生命计划

**Preserve a human mind as data.**

**Local-first · Cloud-assisted · Model-independent**

![MindClone overview](screenshots/overview-desktop.png)

## What is MindClone?
MindClone is an evidence-first digital persona project: a way to preserve the memories, values, opinions, language, and reasoning that shape a person. Its ambition is a portable archive that can support a digital self over time, with clear sources and honest uncertainty.

思维克隆希望保存一个人如何经历、如何判断、为何改变，而不只是模仿说话语气。这是面向老师、同学和未来使用者的 Web MVP：可以亲自体验对话、采访与记忆片段的流程。

## Why?
A chat history can disappear. A model can change. Our stories and thinking deserve a durable home independent of either. MindClone begins with original words, preserves their context, and treats personality conclusions as revisable evidence. This prototype does not claim to reproduce a consciousness or a real person.

## How it works
**Talk → Capture → Structure → Remember → Clone**

**Raw → Structured → Memory → Persona → Clone**

1. Reflect through a guided interview.
2. Preserve questions and original answers.
3. Review candidate memories, values, and reasoning with sources.
4. Store reviewed evidence in a private persona database.
5. Answer from authorized evidence; admit when it is missing.

Steps 3–5 are the future architecture. Today the public prototype demonstrates the flow using synthetic fixtures and page-memory capture.

## My Clone
An interactive demo conversation with Relevant Memories, Source Session, Confidence, and “Why this answer?”. Try **How do you learn?** to see the fictional supported opinion, then **Where was I born?** to see **No reliable memory found**. Matching is intentionally narrow and deterministic. There is no connected LLM or personal archive. Confidence is unknown, not an invented numeric score.

## Clone Builder
Start Interview → scripted AI question → your answer → follow-up → End Session → Generate Memory Fragment.

The five-question demo keeps exact original answers. The end screen shows Questions answered, Memories discovered, Values discovered, Reasoning patterns, and Personality evidence. Discovery counts stay 0 because no reviewed extraction exists. Each question offers a fictional sample answer.

Markdown and JSON downloads use `MC_FRAGMENT_YYYYMMDD_F####.md` / `.json`. Current demo files use F0001 and internal DEMO identifiers; **they are not production IDs and must not be automatically imported into the archive**. Repeated downloads may share a suggested filename. Production requires a transactional ID allocator and review. Existing v0.1 archive entity IDs and naming conventions remain unchanged.

## Persona Progress
Memory, Personality, Values, Reasoning, and Language coverage; Interview Sessions, Memory Fragments, Recorded Memories, and Opinions. All connected-archive counts are 0. Demo input is not counted as a verified persona.

## Architecture
```text
Clone Builder ── write through review ──┐
                                      ↓
                                MindClone Core
                                      ↕
                                Persona Database
                                      ↑
My Clone ── authorized evidence read ──┘
```
Both interfaces currently call the same `DemoCore` adapter. `src/contracts.d.ts` defines the future shared contract; [architecture](docs/ARCHITECTURE.md) describes SQLite/PostgreSQL, retrieval, model routing, authentication, and Memory API boundaries. Node serves static files only. The public code module is independent of the Local Master Archive.

## Privacy philosophy
Your memories belong to you. The local archive remains the source of truth. Public GitHub contains reviewed code, documentation, and synthetic demo screenshots only. No raw interviews, private memories, `04_PRIVATE`, persona SQLite databases, Vault, passwords, or API keys belong here—even a private Git repository is not a Vault.

This MVP sends no interview or chat text to a server. Input is held in page memory only, without localStorage, cookies, analytics, or external fonts. Refresh clears it; navigation within the same page preserves the session. Downloaded fragments contain your entered text and remain your responsibility to store privately. Use fictional examples for presentations.

Future data access must enforce identity, ownership, privacy level, and consent on the server; private records never enter a public frontend bundle. Cloud model calls require explicit authorization of the necessary records. SEALED is excluded from AI access; Vault requires a separate protected access layer.

## Current progress
- [x] Existing local archive reviewed; directory and migration principles preserved.
- [x] Responsive overview and two core entry points.
- [x] Evidence-aware demo chat and honest no-record state.
- [x] Guided interview, end screen, raw-preserving fragment preview and export.
- [x] Persona dashboard with transparent zero counts.
- [x] Shared Core adapter contract and privacy boundaries.
- [x] Public-only Git allowlist, documentation and demo screenshots.
- [ ] Authenticated Memory API and reviewed archive ingestion.
- [ ] SQLite/PostgreSQL adapter, RAG and LLM Router.
- [ ] Clone similarity and memory accuracy evaluation.

## Roadmap
**Now:** a presentable Web prototype and independently versioned public code module.

**Next:** review fragments, allocate unique IDs, validate the schema, and implement an authenticated local Memory API that resolves `MINDCLONE_ROOT` centrally and stores relative paths.

**Later:** permission-filtered retrieval, model-independent routing, historical persona views, and evidence-based evaluation. Fine-tuning, payment systems, full accounts, and archive migrations are outside this MVP.

`MindClone-Private` is a reserved future separation concept; this iteration does not create it or publish private data.

## Run locally
Requires Node.js 20 or newer; no package installation is needed.
```sh
node server.mjs
```
Open http://127.0.0.1:4173. Routes: `#home`, `#clone`, `#builder`, `#dashboard`. The server binds only to the local machine and serves a fixed public asset allowlist.

```sh
node --test
```
Browser verification uses `ui-check.mjs`, an existing Playwright installation selected through `MC_TEST_DEPENDENCIES`, and Microsoft Edge. See [validation](docs/VALIDATION.md). The production application has no framework or runtime dependencies beyond Node for local serving; static hosting can serve index.html, styles.css, and src/*.js.

## Screenshots
All screenshots use synthetic demo data.

| My Clone | Clone Builder |
|---|---|
| ![My Clone](screenshots/my-clone-desktop.png) | ![Clone Builder](screenshots/clone-builder-desktop.png) |

| Persona Progress | Mobile overview |
|---|---|
| ![Dashboard](screenshots/dashboard-desktop.png) | ![Mobile](screenshots/home-mobile.png) |

## Presentation walkthrough
Open Overview → Talk to My Clone → try the learning sample → ask an unsupported biography question → Clone Builder → answer with fictional samples → End Session → generate a fragment → inspect sources and raw words → Persona Progress. A good demo shows both what the system can do and what it cannot honestly claim.
