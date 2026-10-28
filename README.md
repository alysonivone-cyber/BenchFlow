# BenchFlow — V1 starter

**Progressive Web App · React + TypeScript + Vite · IndexedDB/Dexie · offline-first**

This repository starts from the existing README, submitted functionality specification, and Balsamiq mockups. It is a **first development iteration**, not a claim that every V1 acceptance criterion has already passed.

## Quick start

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL displayed by Vite (normally http://localhost:5173). Build and test:

```bash
npm run test
npm run build
npm run preview
```

**Important:** The service worker/offline behavior must be tested using `npm run build` then `npm run preview`, after first loading the app online. Vite development mode is not an offline acceptance test.

## Folder guide

| Folder | Purpose / why |
| --- | --- |
| `src/components` | Shared layout/navigation: avoid duplicating the sidebar on every screen. |
| `src/data` | Three deterministic demonstration protocols, separate from UI code. |
| `src/types` | Typed contracts for protocols, sessions, notes and timers. |
| `src/db` | Dexie/IndexedDB schema; one local persistence layer. |
| `src/features/protocols` | Protocol Library and protocol detail screens. |
| `src/features/sessions` | Session creation, progress, step navigation, notes. |
| `src/features/calculator` | Validated dilution/volume calculations and tests. |
| `src/features/timer` | Timestamp-based timers, persistence and tests. |
| `src/components/Layout.tsx` | Shared app shell, sidebar, back button. |
| `src/styles.css` | Responsive design tokens/styles in one place. |
| `public/icons` | Installable PWA icons. |
| `docs` | Original README, Balsamiq, submitted specification, professor instructions. |

## Current implementation

- Protocol Library: 3 built-in demonstration protocols, overview and ordered steps.
- Workflow: create independent local sessions; navigate steps; save notes; resume after reload; progress display.
- Scientific Calculator: dilution C₁V₁ = C₂V₂, µL/mL conversion, validation.
- Step timer: local persistence, start/pause/resume/reset, timestamp-based recovery after reload.
- PWA: install manifest, icons, generated service worker for offline app shell after build.
- Responsive layout: desktop and small-screen navigation.

## Still to implement / validate before final V1 submission

- **NOTIF-01:** explicit in-app completion notification UX, optional sound and permission-based system notification; timer currently shows an in-app completed state but does not implement system alerts.
- **TECH-04:** manual offline acceptance testing in browsers and devices, including first-load / reload and unavailable-resource cases.
- **TECH-01:** robust storage quota/error handling and explicit recovery UX; the initial code shows basic errors.
- **TIME-01:** device/browser testing when backgrounded or fully closed; never promise a notification while fully closed.
- **NOTE-01:** verify note isolation between at least two sessions with integration tests.
- **WORK-01:** verify all navigation/validation edge cases with integration tests.
- **PDF viewer:** Balsamiq shows a placeholder, but the submitted V1 specification commits to structured demo protocols, not PDF import/parsing. No PDF importer is promised in this starter.
- **Safety:** protocol examples are illustrative and must not be used as validated laboratory instructions.

## Architectural decisions

- No backend, account, cloud sync, AI or dashboard in V1. `CHECK-01` is explicitly excluded.
- IndexedDB stores structured sessions/notes/timers. Service worker cache stores the app shell and bundled assets. `localStorage` is not used for experimental data.
- Timers store a deadline (`endsAt`) instead of trusting repeated `setInterval` ticks. The interval only refreshes the display.
- The stand-alone timer on the calculator screen is practice-only; step timers are persisted with `sessionId + stepId`.
- Demo protocol content is bundled in TypeScript rather than fetched remotely; it is available in the offline build.

## AI assistance disclosure (required by CREA)

OpenAI ChatGPT assisted with the initial project scaffolding, data models, demonstration protocols, interface components, timer/calculation utilities, and initial tests. The student must review, understand, test, and be able to explain all submitted code. Subsequent changes should be recorded in regular, focused Git commits.

## Suggested first Git commits

1. `chore: initialize Vite React TypeScript PWA project`
2. `feat: add typed demonstration protocol library`
3. `feat: persist independent experiment sessions with Dexie`
4. `feat: add step notes and timestamp-based timers`
5. `test: cover dilution and timer calculations`

**Do not pretend these commits were made separately if importing the starter in one commit.** Start with `chore: import reviewed BenchFlow starter`, then make small genuine commits as you iterate.

See `CAHIER_DES_FONCTIONNALITES.md` for the submitted scope and acceptance criteria.


## Local improvements

- Four-variable dilution solver with concentration and volume unit conversions.
- Source PDF attachment and viewing in Protocol Library (stored locally in IndexedDB).
- Manual protocol creation with steps and optional source PDF.
- Session and step timers use the shared timestamp-based timer service.

**Note:** PDFs are not parsed automatically; no AI, account or cloud storage is used. Large PDFs may exceed browser storage quota.
