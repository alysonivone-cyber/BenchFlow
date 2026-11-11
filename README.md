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
| `src/styles.css` | Tailwind CSS v4 entry: design tokens (`@theme`), breakpoints, base styles. |
| `src/components/ui.ts` | Shared Tailwind class helpers (buttons, cards…). |
| `public/icons` | Installable PWA icons. |
| `docs` | Original README, Balsamiq, submitted specification, professor instructions. |

## Current implementation

- Protocol Library: 3 built-in demonstration protocols, overview and ordered steps.
- Workflow: create independent local sessions; navigate steps; save notes; resume after reload; progress display.
- Scientific Calculator: dilution C₁V₁ = C₂V₂, µL/mL conversion, validation.
- Step timer: local persistence, start/pause/resume/reset, timestamp-based recovery after reload, end-of-timer alerts.
- Delete any protocol (custom or demo) with its sessions, notes and timers; demo protocols can be restored.
- Styling with Tailwind CSS v4.
- PWA: install manifest, icons, generated service worker for offline app shell after build.
- Responsive layout: desktop and small-screen navigation.

## Still to implement / validate before final V1 submission

- **NOTIF-01:** implemented (in-app banner, beeps, permission-based system notification). A fully closed app cannot alert, because there is no backend/push server. Manual test on real devices still to do.
- **TECH-04:** manual offline acceptance testing in browsers and devices, including first-load / reload and unavailable-resource cases.
- **TECH-01:** robust storage quota/error handling and explicit recovery UX.
- **TIME-01:** device/browser testing when backgrounded or fully closed; never promise a notification while fully closed.
- **NOTE-01:** verify note isolation between at least two sessions with integration tests.
- **WORK-01:** verify all navigation/validation edge cases with integration tests.
- **PDF import:** an extra added beyond the submitted V1 scope (which committed to structured demo protocols). Text is extracted locally with pdf.js and always reviewed by the user before saving. It is not a guaranteed reader for every PDF.
- **Safety:** protocol examples are illustrative and must not be used as validated laboratory instructions.

## Architectural decisions

- No backend, account, cloud sync, AI or dashboard in V1. `CHECK-01` is explicitly excluded.
- IndexedDB stores structured sessions/notes/timers. Service worker cache stores the app shell and bundled assets. `localStorage` is not used for experimental data.
- Timers store a deadline (`endsAt`) instead of trusting repeated `setInterval` ticks. The interval only refreshes the display.
- The stand-alone timer on the calculator screen is practice-only; step timers are persisted with `sessionId + stepId`.
- Demo protocol content is bundled in TypeScript rather than fetched remotely; it is available in the offline build.

## AI assistance disclosure (required by CREA)

OpenAI ChatGPT assisted with the initial project scaffolding, data models, demonstration protocols, interface components, timer/calculation utilities, and initial tests.

Anthropic Claude (Claude Sonnet 5.5) assisted on 11 November 2026 with: the fix of the session timer (atomic `ensureTimer` transaction and regression test), the end-of-timer alerts (NOTIF-01), the "Open me" / "Close" step badge, deleting protocols with cascade, lazy-loading pdf.js, the migration of the styles to Tailwind CSS, and the update of the documentation in `specs/`. The commits of that session carry a `Co-Authored-By: Claude` trailer.

The student reviews, tests and must be able to explain all submitted code.

## Suggested first Git commits

1. `chore: initialize Vite React TypeScript PWA project`
2. `feat: add typed demonstration protocol library`
3. `feat: persist independent experiment sessions with Dexie`
4. `feat: add step notes and timestamp-based timers`
5. `test: cover dilution and timer calculations`

**Do not pretend these commits were made separately if importing the starter in one commit.** The real history is described in `specs/03-historique-des-commits.md`, including the commits that were recorded after the fact on 11 November.

See `CAHIER_DES_FONCTIONNALITES.md` for the submitted scope and acceptance criteria.


## Local improvements

- Four-variable dilution solver with concentration and volume unit conversions.
- Source PDF attachment and viewing in Protocol Library (stored locally in IndexedDB).
- Manual protocol creation with steps and optional source PDF, or creation from an imported PDF (reviewed by the user).
- Session and step timers use the shared timestamp-based timer service.

**Note:** PDFs are analysed locally in the browser with rules (no AI, account or cloud storage). Large PDFs may exceed browser storage quota.
