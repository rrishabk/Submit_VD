# Feature 1 — AI Traffic Dashboard

**Route:** `/traffic` · **Time budget:** ~3 hours · **Mock data:** `public/visits.json` (~100,000 rows, generate with `npm run seed:visits`)

## Goal

Build a single-page dashboard that shows a website owner which AI crawlers and AI-powered assistants visited their site over the last 90 days, on which pages, and at what volume — so they can answer *"is AI traffic real for us, who's driving it, and what content are they reading?"* at a glance.

## User who will use this

A content lead, SEO/GEO manager, or founder of a content-heavy site (docs, blog, product marketing). They already check Google Analytics for human traffic, but bots are filtered out there. They want a dedicated view of AI bot activity because that traffic is now a leading indicator of whether their content surfaces inside ChatGPT, Claude, Perplexity, and Gemini answers. They open the page, scan for 30–60 seconds, and either drill into a trend or close the tab.

## The difficulty bump

**The seed produces ~100,000 visits.** Your dashboard must hit these budgets on a mid-range laptop:

| Metric | Budget |
|---|---|
| Initial aggregation (after data loads) | **< 500 ms** |
| Chart re-render after a legend toggle | **< 150 ms** |
| Time-to-interactive on `/traffic` | **< 2 s** (cold reload, dev mode) |

Naive `Array.filter` inside `useMemo` keyed on legend state will not hit 150ms with 100k rows. You need a structure that supports legend toggles in **O(numBots)**, not O(numVisits). One natural shape is a per-day × per-bot count matrix built once; legend toggle becomes show/hide of an already-aggregated series.

**Document how you hit the budget in your README** (or in `PERFORMANCE.md`). One paragraph is fine.

**Optional but slick:** offload initial aggregation to a Web Worker so the page doesn't jank. Not required.

## Page layout

Single scrollable view. Three regions stacked top-to-bottom on desktop, with the bottom region splitting into two side-by-side panels at ≥1024px viewport width.

### Header (slim, top of page)

- **Page title** `AI Traffic` on the left.
- **Summary line** directly underneath the title, left-aligned. Template: `{total} visits from {botCount} bots across {pageCount} pages, last {N} days`.
- **Right side empty** unless you implement the optional date-range filter, in which case the filter buttons go there.
- Header is not sticky.

### Top region — Stacked bar chart (full width)

- `min-height: 380px`, target ~45% of initial viewport, `max-height: 600px`.
- **Legend strip** across the top: one pill per bot (color swatch + display name), ordered by total visit count descending. Each pill is clickable.
- **Chart body**: stacked vertical bars, one bar per day (90 bars by default). X-axis = date, label every Nth bar where `N = floor(barCount / 12)` (≈ every 7 days at 90 bars). Y-axis = total visits that day.
- **Stack order within each bar**: matches legend order (largest total at the bottom, smallest at the top). Stable across all bars so the eye can track a color band across the timeline.
- **Tooltip on hover**: use your chart library's default positioning — do not customize.

### Bottom-left panel — Top Pages

Card with header `Top Pages` and **exactly 8 rows** (or fewer if fewer unique pages exist). Each row:
- Monospace path string.
- Absolute visit count (right-aligned).
- Thin horizontal bar **running along the row as a background fill** (subtle, low-opacity), width proportional to that row's count / top row's count.

Long paths truncate with **ellipsis at the end** (`/blog/2026/...`). No wrapping.

### Bottom-right panel — Top Crawlers

Mirrors Top Pages in size and structure (right half, exactly 8 rows). Each row:
- **Colored initial circle** as the avatar (e.g. `G` on the GPTBot color). **Do NOT source brand logos** — the colored initial is the spec.
- Display name with parent in parens, e.g. `ChatGPT-User (OpenAI)`.
- Visit count.
- Same background-fill bar treatment.

Skip bots with zero visits.

## Required functionality

### Data load

1. On mount, load `/visits.json` (the seeded file). You may read it lazily / chunked / however you want — that's part of the perf challenge.
2. While loading, render the loading state. Aggregate raw rows into derived structures **once**; do not re-aggregate inside render or on every legend toggle.

### Stacked bar chart

3. Render one stacked bar per day in the dataset's range.
4. **Tooltip on hover** shows: full date (`Wed, 5 Mar 2026`), one line per bot with non-zero visits (color swatch + name + count), and a bold `Total: N` line at the bottom. Bots with zero visits that day are omitted from the tooltip.
5. **Clicking a legend item toggles** that bot's series: segments disappear, remaining bots restack, y-axis rescales. Click again to restore. Toggled-off legend items must show an obvious disabled state (reduced opacity is fine).
6. **Bot-to-color mapping defined once** and used identically in chart, legend, tooltip, and Top Crawlers avatars.

### Top Pages and Top Crawlers

7. Show top 8 by total visit count for the active range, sorted descending.

### Optional date-range filter

8. If you build it: three buttons in the header right side (`7d` / `30d` / `90d`, default `90d`). Clicking refilters chart + panels + summary. **Skipping is fine** — lock to 90d and note in README. **Zero penalty for skipping.**

### Responsiveness

9. ≥1024px: chart on top, two panels side-by-side. <1024px: panels stack vertically (Top Pages above Top Crawlers). <640px: wrap chart in `overflow-x: auto`, call it done. Full mobile polish is not required.

### Bot recognition

The seed produces `user_agent` strings containing the canonical substrings below. The classifier in `lib/types.ts` exports `BOT_UA_SUBSTRINGS` — use it. Visits matching no substring are dropped (the seed shouldn't produce any).

| Display name | Parent | UA substring | Purpose |
|---|---|---|---|
| `GPTBot` | OpenAI | `GPTBot` | Training-data crawler |
| `ChatGPT-User` | OpenAI | `ChatGPT-User` | Fetched when a ChatGPT user reads a page |
| `OAI-SearchBot` | OpenAI | `OAI-SearchBot` | OpenAI search index crawler |
| `ClaudeBot` | Anthropic | `ClaudeBot` **or** `Claude-Web` (both classify as `ClaudeBot`) | Training/search crawler |
| `PerplexityBot` | Perplexity | `PerplexityBot` | Training crawler |
| `Perplexity-User` | Perplexity | `Perplexity-User` | Fetched on user-triggered page reads |
| `Google-Extended` | Google | `Google-Extended` | Gemini training crawler |

## Type contract

Already exported from `lib/types.ts`. Do not modify; do consume.

```ts
import type { AiVisit, BotName } from "@/lib/types";
import { BOT_NAMES, BOT_UA_SUBSTRINGS } from "@/lib/types";
```

## User flows

### Flow A — First-time visit, scanning for "is anything happening"

1. User opens `/traffic`. Loading skeleton renders briefly.
2. Real data appears. Chart fills with 90 stacked bars, legend across top, summary line populated.
3. Eye goes to the chart. GPTBot and ChatGPT-User dominate. Slight upward trend.
4. Glance at Top Pages: `/` #1, `/docs` #2, a blog post #3.
5. Glance at Top Crawlers: confirms OpenAI dominates.
6. Closes the tab. Time on page: ~40 s. Successful session.

### Flow B — Investigating a specific bot

1. User wants Perplexity's footprint isolated.
2. Clicks every legend item except `PerplexityBot` and `Perplexity-User`, toggling them off.
3. Chart re-renders after each click. **Each toggle must complete in <150ms** — that's the perf budget.
4. Hovers a bar mid-chart; tooltip shows date + two Perplexity counts.
5. Optionally toggles items back on, or (if date-range filter is built) clicks `30d` to zoom.

## States to handle

- **Default**: data loaded, chart and both panels populated.
- **Loading**: chart area = grey skeleton at chart dimensions. Each panel = 8 skeleton rows. Header summary hidden or `—`.
- **Empty** (no rows in dataset): chart area replaced by centered message: `No AI traffic yet.` / `Once AI crawlers visit your site, you'll see them here.` Both panels: `No pages to show.` / `No crawlers to show.`
- **Error** (data file failed to load): centered message: `Couldn't load traffic data.` / `Try refreshing the page.` Small `Retry` button.
- **All legend items toggled off**: empty axis with inline note `All bots hidden. Click a legend item to show data.` Do not crash. Do not show full empty state.

## Microcopy

- Page title: `AI Traffic`
- Header summary template: `{total} visits from {botCount} bots across {pageCount} pages, last {N} days`
- Panel headers: `Top Pages` / `Top Crawlers`
- Tooltip total line: `Total: 247`
- Date-range buttons (if included): `7d` / `30d` / `90d`
- Empty: `No AI traffic yet.` / `Once AI crawlers visit your site, you'll see them here.`
- Error: `Couldn't load traffic data.` / `Retry`
- All-hidden: `All bots hidden. Click a legend item to show data.`

## Optional / stretch (NO PENALTY if absent or rough)

- Date-range filter (7d / 30d / 90d).
- Web Worker for initial aggregation.
- Mobile layout below 640px width.

**Out of scope** (don't build): per-bot sparklines, click-through on page rows, robots.txt hints, custom tooltip positioning, animated transitions on legend toggle.

## What we're watching for (eval signal specific to this feature)

- **Perf budget hit.** <150ms legend toggle, <500ms aggregation. README explains how. This is the load-bearing signal here.
- **Aggregation discipline.** Raw 100k rows aggregated once into derived structures. Chart, panels, header all read from those. Re-summing raw rows in render or on toggle is a fail.
- **Working legend toggles.** Chart actually restacks; y-axis rescales; disabled state visible.
- **Color consistency.** GPTBot is the same color in chart, legend, tooltip, and avatar. Single source-of-truth color map.
- **Realistic skeletons.** Shape matches loaded state; no layout jump on data arrival.

## What we explicitly don't want

- No backend, no API server, no database.
- No auth, no login.
- No global state library.
- No CSV upload or "connect your site" wizard.
- No marketing copy, no hero section, no "About this dashboard" panel.
- No real brand logos for crawler avatars.
