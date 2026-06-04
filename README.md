# Verseodin

## 1. Setup

The project uses Next.js 15 (App Router) and requires Node.js 20+.

```bash
npm install
npm run dev    # Local development
npm run build  # Production build
npm start      # Start production server
```

## 2. What I built

I focused on building a performant, production-ready interface with a strict, minimal SaaS aesthetic (inspired by Vercel/Linear). 

*   **AI Traffic Dashboard:** Offloaded the heavy lifting. Aggregated 100k raw visit records once during load using a Web Worker to prevent main-thread blocking. The worker builds a per-day × per-bot matrix so that chart legend toggles and panel filters operate instantly (<10ms) on pre-aggregated data without re-processing raw visits.
*   **Action Centre:** Built around a pure, declarative `deriveActions()` rules engine. It generates stable action IDs directly from source events, creating a single source of truth. A strict hydration gate and `localStorage` merge strategy seamlessly preserves user decisions (accept/dismiss) across reloads while preventing Next.js SSR hydration mismatches.
*   **Design System:** Stripped away heavy shadows and glassmorphism. Built a lightweight, custom Tailwind primitive suite utilizing CSS variables for precise control over typography, borders, and micro-interactions.

## 3. What I cut and why

*   **Global State Management:** Skipped Redux/Zustand. Component-local state combined with `useMemo` and `localStorage` was perfectly sufficient. Introducing a global store would have been a premature optimization that bloated the architecture.
*   **Animation Libraries:** Cut Framer Motion. Native CSS transitions (`transition-all duration-150`) hit the `<150ms` response requirement flawlessly without the JS payload penalty.
*   **API Layer / Database:** Data is stubbed via static JSON files. Engineering time was better spent proving out the client-side architecture, Web Worker boundaries, and derivation engine rather than mocking a fragile local API.

## 4. AI tool usage

AI (Antigravity) was utilized as a force multiplier for execution. I drove the high-level architectural decisions—such as mandating the Web Worker pipeline, the rules-based derivation pattern, and the strict zero-mismatch hydration flow. The AI was directed to rapidly scaffold components, enforce the Tailwind design tokens, and aggressively resolve strict TypeScript/ESLint constraints to guarantee a clean production build. 

## 5. What I'd do in week 2

*   **Virtualization:** Implement windowed rendering (`@tanstack/react-virtual`) in the Action Centre to maintain 60fps if the derived action count scales into the thousands.
*   **Test Coverage:** Introduce Jest/Vitest specifically for the `deriveActions()` and Web Worker aggregation logic to prevent rule regressions, alongside Playwright for critical-path UI tests.
*   **Robust Data Fetching:** Replace the raw `useEffect` fetches with React Query (or migrate fully to React Server Components) to leverage built-in caching, automatic retries, and stale-while-revalidate behavior.
*   **Pagination:** Add infinite scrolling or pagination to the Top Pages and Top Crawlers tables on the traffic dashboard to handle unbounded data sets.
