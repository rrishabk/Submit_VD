# Ground Rules

Read these before writing any code. They constrain how we evaluate the work.

## How the trial works

1. **You accept** the trial in writing (email reply). The clock starts when you do.
2. **You submit** within 5 calendar days. Coding time should fit in ~8 hours; split however suits you.
3. **We review** within 5 business days of submission and reply with a decision + written feedback. No ghosting.
4. **You get paid USD $300** on submission of a working repo + README. Pay is for the work, not contingent on outcome. You get paid even if we decide not to move forward.
5. **If we move forward**, next step is a paid 1-week trial sprint or a contractor offer — we'll tell you upfront which track.

**IP / portfolio rights:** the work is yours. Put it in your portfolio, open-source it, write about it. We claim no rights. If we hire, we structure a separate contract for product work.

**Primary reviewer:** `<NAME>` (`<EMAIL>`). CC `<EMAIL>` on submissions. Async-first — no required calls during the trial.

## Time and pay

- **Total time cap: 8 hours of coding.** Hard cap. Going over is a fail signal, not extra credit.
- **Recommended split:** ~3h Feature 1, ~3h Feature 2, ~2h polish + README. Adjust if a feature blocks you.
- **Calendar window:** 5 calendar days from acceptance.
- **Pay:** USD $300 flat, on submission. Method: PayPal, Wise, or bank transfer — your preference.

## Stack and tooling

This scaffold is **Next.js 15 (App Router) + TypeScript (strict) + Tailwind 3 + Recharts + Lucide**. You may justify swapping any of these in your README:

- **Chart library:** Recharts, Tremor, or Visx are all fine for AI Traffic. ECharts and Chart.js work. Avoid anything that requires hand-rolling SVG axes for this scope.
- **Icons:** use **Lucide** (`lucide-react`) for everything. Do not source brand logos.
- **Animation:** keep minimal. CSS transitions for fades and height-collapses. **Do not pull in Framer Motion** or similar — bundle cost not worth it.
- **State management:** built-in React state + `useMemo` / `useReducer`. Do not reach for Redux, Zustand, MobX, Jotai for this scope.
- **Persistence:** `localStorage` only. No backend, no IndexedDB, no Service Worker.
- **Auth:** none. One anonymous user.
- **Browser support:** evergreen Chrome / Safari / Firefox / Edge. No IE11. No polyfills required.
- **Node:** 22 (per `.nvmrc`).
- **Linting / formatting:** the scaffold ships ESLint + Prettier defaults. Don't spend trial time on lint config.
- **Commit style:** doesn't matter. Squash, detailed history, single commit — whatever you prefer. We read the diff.

## What you submit

Push the work to a Git repo (your hosting choice — GitHub, GitLab, your own). Public is easier; if private, add the reviewer as collaborator. The repo must contain:

1. **Both features** working end-to-end against seeded mock data.
2. **Working seed scripts** — we'll run `npm install && npm run seed && npm run dev` on a clean checkout. If anything breaks, your trial is incomplete.
3. **A `README.md`** with these five sections, in this order:
   - **Setup** — already mostly handled by the scaffold; add anything you changed.
   - **What I built** — one paragraph per feature, what's working, what's not.
   - **What I cut and why** — explicit list. We expect cuts. This is where you defend them.
   - **AI tool usage** — which tools (Cursor, Claude Code, Copilot, ChatGPT, etc.), where they helped, where they produced output you rewrote, what you reviewed line-by-line vs trusted. Be honest; this is a positive-signal section, not a gotcha.
   - **What I'd do in week 2** — if this were a real product, what's next.

### Optional but small positive signals (zero penalty if absent)

- Deployed demo URL (Vercel / Netlify / Cloudflare Pages — free tier).
- 2-minute Loom walkthrough showing both features running.
- A `PERFORMANCE.md` with how you hit the AI Traffic perf budget.
- 2–3 unit tests covering critical logic (filter composition, derivation, hydration). Test sprawl is a negative signal; selective coverage is a positive one.

### What we'll deduct for

- Spec-sized README, no working code.
- Hidden AI-tool usage. Disclosure costs you nothing; concealment costs you the trial.
- Polishing one feature to perfection and skipping the other.
- Going over the 8-hour cap and submitting more than scope. We'd rather see what you ship in time.
- Adding auth, a real backend, a database, or any of the "what we don't want" items in the feature briefs.

## Evaluation rubric (transparent)

| Signal | Weight | What we're looking for |
|---|---|---|
| **Product judgment** | 30% | Right scope cuts. README defends choices. Ship MVP, not sprawl. |
| **Code quality** | 25% | Readable, idiomatic. Could a teammate merge this PR without confusion? |
| **UI polish** | 15% | Reasonable on a normal laptop. Doesn't have to be beautiful, has to be honest. |
| **AI-tool usage** | 15% | Disclosed honestly. Used as multiplier (reviewed and shaped output) not crutch (pasted slop). |
| **README quality** | 15% | Decisions visible. Cuts explained. Not a marketing pitch. |

Per-feature signals are spelled out at the bottom of each `docs/FEATURE_*.md`.

## Accessibility expectations

- Semantic HTML (`<button>` for buttons, real `<select>` or properly ARIA'd combobox for dropdowns).
- Keyboard-operable interactive controls (tab focus, enter/space activate).
- Severity / state communicated by **color + text**, not color alone.
- Screen-reader optimization beyond that is a bonus, not required.

## Performance expectations

- **AI Traffic** has explicit perf budgets — see `docs/FEATURE_1.md`. These are real numbers we'll measure on a mid-range laptop (M-series Mac or recent x86 with 16GB RAM).
- **Action Centre** has no explicit perf budget but should feel snappy. Filter changes should reflect in <100ms.
- Bundle size is not graded for this scope. Don't bloat unnecessarily, but don't agonize over kilobytes.

## What's explicitly out of scope (do not build)

- No backend, no API server, no database, no Express / Fastify / Prisma / Drizzle / SQLite.
- No auth, no login page, no NextAuth / Clerk.
- No global state library (Redux, Zustand, MobX, Jotai).
- No CSV upload, no "connect your site" wizard.
- No marketing copy, no hero section, no "About this dashboard" panel.
- No drag-and-drop reordering, no kanban columns.
- No animations longer than ~200ms; no animation libraries.
- No real third-party logos (use colored initial circles per `docs/FEATURE_1.md`).
- No toast library (Action Centre — see `docs/FEATURE_2.md`).
