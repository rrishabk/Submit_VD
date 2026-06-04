# Feature 2 — Action Centre

**Route:** `/actions` · **Time budget:** ~3 hours · **Raw data:** `public/monitoring-events.json` (~200 events of 4 types, generate with `npm run seed:monitoring`)

## Goal

Build a triage-queue page that presents a prioritized list of recommended actions and lets the user accept or dismiss each one, with state persisting across reloads. **The recommendations are NOT pre-baked** — you derive them from a stream of raw monitoring events.

## User who will use this

A marketing or growth lead at a B2B SaaS company. Their job-to-be-done when they open this page is to spend 10 minutes triaging: skim the queue, accept the handful they'll act on (these get exported elsewhere in the real product), dismiss the rest. The decision is binary per row: *"yes, I'll do this"* or *"no, not useful."* They need to scan quickly, trust the severity signal, and not lose work when they reload.

## The difficulty bump

**You do NOT render `monitoring-events.json` directly.** The seed produces ~200 raw events of 4 event types — `citation_missed`, `competitor_cited_instead`, `reddit_competitor_mention`, `article_published_with_competitors`. **Your job is to write a derivation function:**

```ts
import type { MonitoringEvent, Action } from "@/lib/types";

function deriveActions(events: MonitoringEvent[]): Action[];
```

…that turns the raw events into **15–30 Action cards** with sensible:
- **`type`** (`reddit` / `outreach` / `content`) — derived from event type
- **`severity`** (`high` / `medium` / `low`) — derived from event metadata (upvotes, estimated traffic, competitor count, etc.)
- **`title`** — short, scannable, human (e.g. *"Engage with 'Why Are Competitors Showing Up in AI Answers Instead of You?'"*)
- **`description`** — 1–2 sentences explaining what to do and why
- **`source_event_ids`** — for transparency / debugging, list the ids of the raw events this Action was derived from

The UI then renders `Action[]`. **The eval signal lives in the cleanliness, extensibility, and product judgment of your derivation** — not in the UI polish.

### Suggested derivation mapping (you can deviate, justify in README)

| Raw event type | Likely Action `type` | Severity heuristic |
|---|---|---|
| `reddit_competitor_mention` | `reddit` (engage with thread) | `upvotes + comment_count` thresholds |
| `article_published_with_competitors` | `outreach` (pitch the author) | `estimated_monthly_traffic` thresholds |
| `citation_missed` | `content` (publish a gap article) | Cluster across similar prompts; frequency drives severity |
| `competitor_cited_instead` | `content` or `outreach` depending on `source_type` | `position` + `competitor_brand` reach |

**You may aggregate multiple raw events into one Action** — e.g. 4 `citation_missed` events on similar prompts could roll up into one "Publish a comparison page for 'best AI visibility tools'" action with `source_event_ids: ["cm_x", "cm_y", "cm_z", "cm_w"]`. Showing you noticed the aggregation opportunity is a positive signal.

**Stable Action ids:** the same set of input events should produce the same set of Action ids across runs. Don't `Math.random()` your way through this — derive ids from the source events (e.g. hash the sorted source_event_ids).

## Page layout

Single scrollable column, max content width ~1280px on desktop, full-bleed on narrow widths.

### Plan banner (topmost element)

Do **not** build a global nav — this banner is the topmost element on the page.
- Slim full-width banner, subtle background tint, slimmer than a typical app bar.
- Left: `You're on the Explore plan — tracking 10 prompts with ChatGPT only`.
- Right: `See plans` button. Use `<button type="button" onClick={(e) => e.preventDefault()}>` — do not use `href="#"` (it scroll-jumps).

### Page title and subtitle

- H1 `Actions`.
- Subtitle: `Prioritized recommendations to improve AI visibility, performance, and coverage.`

### Filter row (right-aligned, below the title)

- **Severity** dropdown: `All` / `High` / `Medium` / `Low`
- **Action type** dropdown: `All` + one option per derived type
- On narrower widths, dropdowns wrap to a new line. Never overflow.

### AI Suggestions section header

- Smaller H2: `AI Suggestions`
- Subtitle: `Promptwatch detected {N} new actions from your recent monitoring data.` Use **`Promptwatch`** verbatim — it's the in-fiction product name.
- `N` **always reflects the filtered Active count**, regardless of which tab is selected. Handle 0/1 grammar (`0 new actions` / `1 new action`).

### Tab strip

- `Active (N)` / `Dismissed (N)` — counts reflect the **filtered** set.
- Selected tab visually distinguished, keyboard-focusable.

### Card list — responsive grid (NO horizontal scroll)

- `<640px`: 1 column · `640–1024px`: 2 columns · `>1024px`: 3 columns.
- **Fixed card min-height ~220px**; titles/descriptions ellipsis-truncate.

Each card:
- **Top-left**: type chip — small pill with **Lucide icon** + label.
- **Top-right**: severity badge — colored background pill **with text label**. High = red/orange + `High`, Medium = amber + `Medium`, Low = neutral gray + `Low`. Badge alone communicates severity (a11y: color + text, never color alone).
- **Title**: bold, 2–3 lines, ellipsis-truncate.
- **Description**: smaller body text, 2–3 lines, ellipsis-truncate.
- **Bottom row**: relative date label on the left — use `today` (<24h) / `yesterday` (24–48h) / `Nd ago` otherwise. Two right-aligned buttons: `Accept` (primary fill) and `Dismiss` (secondary outline).

When a card is in the Dismissed tab, the Accept/Dismiss buttons are replaced by a status pill: `✓ Accepted` (positive color) or `✕ Dismissed` (muted color). The rest of the card body stays the same.

## Required functionality

### Derivation

1. Implement `deriveActions(events: MonitoringEvent[]): Action[]` per the contract above.
2. The derivation must be **pure** (same input → same output). Stable Action ids across runs.
3. Output 15–30 actions across at least 3 `type` values.
4. **Document your derivation rules in the README** — one paragraph per event-type mapping is fine. The README is where you defend your judgment calls.

### Filtering

5. Severity and Action-type dropdowns filter the visible cards in real time — no Apply button.
6. Filters compose: Severity = High AND Type = Reddit shows only cards matching both.
7. `All` in either dropdown means no filter on that dimension.
8. Filters apply to both tabs simultaneously. Counts in `Active (N)` / `Dismissed (N)` and subtitle `N` all reflect the filtered set.
9. Filter state **persists across tab switches within a session** but **does NOT persist across reloads** (resets to `All` / `All` on page load).

### Tabs

10. Clicking a tab switches the visible card list. Only one tab active at a time.
11. Tab counts update live as cards move between Active and Dismissed.

### Accept and Dismiss

12. Clicking `Accept` on an Active card moves it to Dismissed with `status: 'accepted'`. Card disappears from Active, appears in Dismissed with a `✓ Accepted` pill.
13. Clicking `Dismiss` does the same with `status: 'dismissed'` and a `✕ Dismissed` pill.
14. Counters update in the same render — no manual refresh needed.
15. Cards in Dismissed are read-only (no undo required — see Optional).
16. **Do NOT build toast notifications.** Card movement + counter update IS the feedback.

### Persistence

17. State persists to `localStorage` under a single namespaced key (e.g. `actionCentre.v1`). Persisted shape is the actions list with current `status`.
18. On page load:
    - Load events → `deriveActions(events)` → starter Actions.
    - If `localStorage` exists, merge: for each starter Action that matches a persisted Action by `id`, take the persisted `status`. New starter Actions (not in storage) start `active`. Persisted Actions no longer in starters are dropped (the underlying events disappeared).
    - Write merged state back to `localStorage`.
19. **A skeleton during hydration is acceptable. A flash of empty-state or wrong-state is not.** Gate the card-list render on hydration completion.

### Empty states

20. Active empty (filters excluded everything): `No actions match these filters` + `Clear filters` button (resets both dropdowns to `All`).
21. Active empty (no active items): `All caught up — no active actions`.
22. Dismissed empty: `Nothing here yet.`
23. Empty states do not break the layout — banner / title / filters / tabs stay in place.

### Responsiveness and accessibility

24. Works from ~375px to large desktop. Grid collapses to 1 column on narrow.
25. Dropdowns, tabs, and buttons are keyboard-operable (tab focus, enter/space activate). Use semantic elements (real `<button>`, real `<select>` or properly ARIA'd combobox).
26. Severity badge = colored background + text label. Color alone is insufficient.

## Type contract

Already exported from `lib/types.ts`. Do not modify; do consume.

```ts
import type {
  MonitoringEvent,
  Action,
  ActionType,
  Severity,
  Status,
} from "@/lib/types";
```

## User flows

### Flow A — First-time visitor triages the queue

1. User lands on `/actions`. `localStorage` is empty.
2. Events load → `deriveActions(events)` → ~20 Actions with `status: 'active'`. Written to `localStorage`. No flash of empty content.
3. User sees banner, title, filter row (`All` / `All`), section header `AI Suggestions / Promptwatch detected 20 new actions from your recent monitoring data.`, tabs `Active (20)` / `Dismissed (0)`.
4. User skims, finds a High / Reddit card, clicks `Accept`. Card disappears from Active. Counters: `Active (19)` / `Dismissed (1)`. Subtitle: `...detected 19 new actions...`.
5. User clicks `Dismissed (1)` tab. Sees the same card with `✓ Accepted` pill.
6. User clicks back to `Active`. Finds an irrelevant card, clicks `Dismiss`. `Active (18)` / `Dismissed (2)`.
7. User reloads. Filters reset to `All / All`. Active tab is default. Counts persist: `Active (18)` / `Dismissed (2)`.

### Flow B — Power user filtering

1. User lands with a populated queue (returning visit).
2. Severity → `High`. List re-renders to show only high-severity active items. Counters update.
3. Action type → `Reddit`. Filters compose. List shows only High + Reddit.
4. User clicks `Accept` on a visible card. Disappears from Active; counters update; list still respects filters.
5. User clicks `Dismissed`. Sees only the High-Reddit items previously accepted/dismissed (filters apply to both tabs).
6. Severity → `All`. Dismissed list expands to all dismissed Reddit items.
7. Action type → `All`. Both tabs now show everything, segmented only by status.

## States to handle

- **First-time / cold load**: no `localStorage`. Derive Actions from events, write to storage, render populated Active tab. No empty flash.
- **Returning visit**: derive Actions from events, merge persisted statuses, render. Filters reset to `All / All`.
- **Default (Active, no filters, items present)**: card grid renders, counters accurate.
- **Active empty (all dismissed)**: `All caught up — no active actions`.
- **Active empty (filters excluded)**: `No actions match these filters` + `Clear filters` button.
- **Dismissed empty**: `Nothing here yet.`
- **Loading**: brief skeleton or gated render — no empty-then-populated flicker.
- **Error** (`localStorage` unavailable — quota / private browsing): fall back to in-memory state, show inline notice `Couldn't save your changes — they won't persist if you reload.` Don't crash.

## Microcopy

- Plan banner: `You're on the Explore plan — tracking 10 prompts with ChatGPT only` / link: `See plans`
- Page title: `Actions`
- Page subtitle: `Prioritized recommendations to improve AI visibility, performance, and coverage.`
- Section header: `AI Suggestions`
- Section subtitle: `Promptwatch detected {n} new actions from your recent monitoring data.` (handle 0 / 1 grammar)
- Tabs: `Active ({n})` / `Dismissed ({n})`
- Filter labels: `Severity` / `Action type`
- Buttons: `Accept` / `Dismiss`
- Dismissed pills: `✓ Accepted` / `✕ Dismissed`
- Active empty (no items): `All caught up — no active actions`
- Active empty (filtered out): `No actions match these filters` + `Clear filters`
- Dismissed empty: `Nothing here yet`
- Storage-unavailable: `Couldn't save your changes — they won't persist if you reload.`

## Optional / stretch (NO PENALTY absent or rough)

- Undo on accept/dismiss (small inline link returning the card to Active for ~5 seconds).
- Bulk dismiss low-severity (single button in the filter row).
- Card source link (if `source_url` present, make the title or an external-link icon navigate).

**Out of scope** (don't build): toasts, drag-and-drop, kanban, search input, keyboard shortcuts (j/k navigation), animations beyond a CSS opacity transition.

## What we're watching for (eval signal specific to this feature)

- **Derivation cleanliness + extensibility.** Your `deriveActions` function is the load-bearing thing here. Adding a 5th event type should be a configuration change (a row in a rules table), not a refactoring exercise. A giant switch is the "translates from English" tell; a small rules table is the "thinks like an engineer" tell.
- **Severity heuristics are defensible.** README spells out the thresholds. A reviewer reads the rules and goes "yeah, that's reasonable."
- **Stable Action ids across runs.** Re-running the derivation on the same events produces the same Action ids → persistence survives.
- **Clean hydration.** No flash of empty or wrong state. The persistence merge (derivation + localStorage) doesn't lose user state when new events arrive.
- **Composable filters.** Severity AND Type apply together; both tab counters reflect the filtered set.
- **Semantic distinction between Accept and Dismiss** in the Dismissed tab (`✓` vs `✕` pills).
- **Real empty states.** Separate copy for "nothing here" vs "filters excluded everything," with a way out.
- **Single source of truth.** One state holding the actions array; derived counters and visible lists computed from it.

## What we explicitly don't want

- No real backend, no real API.
- No auth.
- No global state library for this scope.
- No drag-and-drop reordering, no kanban columns, no project-management UI.
- No animations longer than ~200ms, no animation libraries.
- No toast library.
- No reading `monitoring-events.json` directly into card rendering (you must go through `deriveActions`).
