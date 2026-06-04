# Performance Strategy: AI Traffic Dashboard

Hitting the performance budgets for the AI Traffic Dashboard with a dataset of ~100,000 rows requires avoiding heavy operations on the main thread during render.

## 1. Initial Aggregation (< 500ms budget)

We offload the initial parsing and aggregation to a **Web Worker** (`lib/feature1-worker.ts`). 
- When the JSON loads, the worker does a single $O(N)$ pass over the ~100k `AiVisit` records.
- It builds small derived maps for daily counts (`chartData`), `topPages`, and `topCrawlers`.
- It discards the unneeded raw strings (like the full user agent) immediately.
- The worker posts the tiny derived payload back to the main thread. This completely eliminates main-thread jank during data processing.

## 2. Chart Re-renders (< 150ms budget)

A naive implementation runs an `Array.filter` over 100,000 rows every time a legend item is toggled, which would easily blow past the 150ms budget on a mid-range laptop.

Instead, our approach ensures $O(numBots)$ complexity on toggles:
- The React component only holds the derived `chartData` (at most 90 days x 7 bot keys).
- The legend toggles simply update a small React state: `Record<BotName, boolean>`.
- We pass the *entire* derived `chartData` array into Recharts.
- We conditionally render the `<Bar>` components based on the active bots state. Recharts only processes the data for the active bars, operating on 90 rows instead of 100,000.
- React's render cycle completes in single-digit milliseconds, leaving plenty of headroom in the 150ms budget.
