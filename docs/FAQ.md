# FAQ

## Stack and tooling

**Q: Can I use a different stack than Next.js / React?**
Yes, with a one-line justification in the README. Pick something modern (Remix, SvelteKit, Vue/Nuxt, plain Vite + React, plain Vite + Solid, etc.). We'll evaluate the same way.

**Q: Can I skip TypeScript?**
Yes, but explain why. TS is the default expectation for a 2026 senior frontend hire.

**Q: Can I use Tailwind v4 instead of v3?**
Yes. Both work for this scope. Document the swap.

**Q: Can I use a chart library other than Recharts?**
Yes. Tremor, Visx, ECharts, Chart.js — all fine. Avoid anything that requires you to hand-roll SVG axes for this scope.

**Q: Can I use Framer Motion / GSAP / motion libraries?**
**No.** Animations beyond CSS transitions are out of scope. Bundle cost not worth it.

**Q: Can I use a state library (Redux / Zustand / etc.)?**
**No.** Built-in React state is the right tool for this scope.

## AI tools

**Q: Can I use Cursor / Claude Code / Copilot / ChatGPT?**
Yes, expected. Disclose in the README — which tools, where they helped, where they produced output you rewrote, what you reviewed line-by-line vs trusted.

**Q: Will AI-tool usage hurt my evaluation?**
No, the opposite. We evaluate how you USE the tools (multiplier vs crutch). Hidden usage is the only thing that hurts.

## Scope and time

**Q: What if I finish in less than 8 hours?**
Submit. Don't fill the time with polish — the README's "What I cut and why" section is where we look for judgment.

**Q: What if I can't finish both features?**
Submit what you have. The README is where you defend the cut: *"I cut Action Centre filter composition because I prioritized clean hydration."* That's a senior decision.

**Q: What if a feature takes me 5 hours instead of 3?**
Cut scope on the other. We'd rather see one feature done well + an honest README about the other than two half-finished features.

**Q: Can I go over 8 hours?**
We'd prefer you didn't. The cap exists so we can compare submissions fairly. If you go over, say so in the README — honesty is graded; concealment isn't.

## Submission

**Q: Should I deploy it?**
Optional. Vercel / Netlify / Cloudflare Pages free tier is fine. Zero penalty if absent.

**Q: Public or private repo?**
Either. Private is fine if you add the reviewer as a collaborator.

**Q: Do I need to commit the seeded JSON files?**
No — they're `.gitignore`'d. We run `npm run seed` on a clean checkout.

**Q: Do I need tests?**
Not required. 2–3 tests covering critical logic (filter composition, derivation, hydration) is a small positive signal. Test sprawl is a negative signal.

**Q: Should I write a long README?**
No — readability beats length. ~500 words across the 5 required sections is plenty.

**Q: Will you give written feedback even if I'm not selected?**
Yes, within 5 business days of submission.

## What's explicitly out of scope (do not build)

- Real backend / API server / database.
- Auth, login, user accounts.
- Real third-party data — everything is mocked.
- Brand logos for crawler avatars (use colored initial circles).
- Toast notifications in Action Centre.
- CSV upload, "connect your site" wizard, onboarding flow.
- Marketing copy, hero section, "About this dashboard" panel.
- Drag-and-drop reordering, kanban columns, project-management UI.
- Animations longer than ~200ms.
- Per-bot sparklines, click-through on page rows, robots.txt hints (AI Traffic).
- Reading `monitoring-events.json` directly into card rendering (Action Centre — must go through `deriveActions`).

## Direct contradictions with what you've shipped before

**Q: I always build a global nav. Should I add one?**
**No.** Action Centre's plan banner is the topmost element. No global nav.

**Q: I usually wrap everything in animations / page transitions. Should I add them?**
**No.** This is a productivity surface; flashy transitions get in the way.

**Q: I usually use a UI library (Material / Mantine / Chakra / shadcn). Can I?**
shadcn/ui's primitives are fine (they're copy-pasted into your repo, not a runtime library) but discouraged for this scope — Tailwind + your own components is the simplest path. Other UI libraries: skip. The scope is too small to justify the bundle.

## Anything else

Reply to the original email. Genuine ambiguities are rare in this brief — but if you find one, we'd rather clarify than read a guess.
