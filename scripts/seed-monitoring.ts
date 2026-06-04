/**
 * seed-monitoring.ts
 *
 * Generates ~200 deterministic raw monitoring events of 4 event types
 * over the 60 days ending 2026-06-03. Writes to
 * /public/monitoring-events.json.
 *
 * Run: npm run seed:monitoring
 *
 * IMPORTANT: this output is the INPUT to the Action Centre. Your job is
 * to write a derivation function that turns this raw event stream into
 * Action cards. See docs/FEATURE_2.md.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import type {
  MonitoringEvent,
  CitationMissedEvent,
  CompetitorCitedInsteadEvent,
  RedditCompetitorMentionEvent,
  ArticlePublishedWithCompetitorsEvent,
  Engine,
} from "../lib/types";

// ─── seeded RNG ──────────────────────────────────────────────────────
const SEED = 0xfeedbeef;
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;

// ─── seed data lookups ───────────────────────────────────────────────
// Plausible-but-fake competitor brand names. Do not impersonate real
// companies; reviewers cross-check against your derivation logic, not
// against real-world market positions.
const COMPETITORS = [
  "Promptwatch",
  "Pulse AI",
  "Athrun",
  "Tellem",
  "Quench AI",
  "Veronia",
  "OrbitalSEO",
];

const ENGINES: readonly Engine[] = ["chatgpt", "claude", "perplexity", "gemini"];

const PROMPTS = [
  "best AI visibility tracking tool",
  "ChatGPT optimization platforms 2026",
  "tools to monitor brand mentions in LLM answers",
  "how to track if my brand shows up in Claude",
  "Perplexity SEO tools",
  "GEO platforms comparison",
  "what is generative engine optimization",
  "AI search analytics 2026",
  "track competitor mentions in ChatGPT",
  "best Reddit monitoring tool for B2B SaaS",
  "AI citation tracker for content marketers",
  "alternatives to Promptwatch",
  "Pulse AI vs Athrun review",
  "how do I get my brand into AI answers",
  "monitor brand presence in Claude and Gemini",
];

const SUBREDDITS = [
  "r/Agent_SEO",
  "r/SEO",
  "r/GenerativeSEO",
  "r/marketing",
  "r/SaaS",
  "r/SaaSMarketing",
  "r/contentmarketing",
  "r/SEOhelp",
];

const REDDIT_THREAD_PATTERNS = [
  "Why are competitors showing up in AI answers instead of me?",
  "Anyone using {comp}? Honest reviews welcome",
  "Comparison: {comp} vs {comp2} vs {comp3}",
  "{comp} got cited in ChatGPT 4× this week — how?",
  "Need a tool like {comp} but cheaper",
  "Has anyone migrated from {comp} to {comp2}?",
  "{comp} just shipped X — game changer?",
  "Looking for {comp} alternatives — what do you use?",
  "Anyone seeing {comp} dominate in Perplexity lately?",
  "Honest take: is {comp} worth the price?",
];

const PUBLICATIONS = [
  "Search Engine Land",
  "The GEO Gazette",
  "SaaS Monthly",
  "Marketing Brew",
  "First Round Review",
  "TechCrunch",
  "Demand Curve",
  "Reforge",
  "GrowthHackers",
  "Ahrefs Blog",
];

const ARTICLE_TITLE_PATTERNS = [
  "The 2026 GEO Playbook",
  "8 Best AI Visibility Tracking Tools, Compared",
  "Why Your Competitors Are Showing Up in AI Answers",
  "How {comp} Built a 10k-Customer Pipeline",
  "The State of Generative Search in 2026",
  "Inside {comp}'s AI-First GTM Strategy",
  "{comp} vs {comp2}: Which AI Monitoring Platform Wins?",
  "How to Get Cited in ChatGPT, Claude, and Perplexity",
  "10 Tools Every B2B Marketer Needs in 2026",
  "Why AI Search Is Replacing Google for B2B Discovery",
];

const REDDIT_THREAD_SLUGS = [
  "ai-answers-instead-of-me",
  "anyone-using-athrun-honest",
  "comparison-promptwatch-pulse-tellem",
  "promptwatch-cited-chatgpt-4x",
  "looking-for-pulse-alternatives",
  "migrated-tellem-quench",
  "veronia-just-shipped-x",
  "promptwatch-alternatives-cheaper",
  "athrun-dominate-perplexity",
  "is-promptwatch-worth-it",
];

const ARTICLE_URL_PATTERNS = [
  "https://example.com/article/{slug}",
  "https://geozine.example.com/{slug}",
  "https://saasmonthly.example.com/2026/06/{slug}",
];

const ARTICLE_SLUGS = [
  "2026-geo-playbook",
  "8-best-ai-visibility-tools",
  "competitors-showing-up-in-ai",
  "10k-customer-pipeline",
  "state-of-generative-search-2026",
  "ai-first-gtm-strategy",
  "monitoring-platform-comparison",
  "cited-in-chatgpt-claude-perplexity",
  "10-tools-b2b-2026",
  "ai-search-replacing-google",
];

// ─── time generation ─────────────────────────────────────────────────
const END_DATE = new Date(Date.UTC(2026, 5, 3, 0, 0, 0));
const DAYS = 60;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const START_DATE = new Date(END_DATE.getTime() - DAYS * MS_PER_DAY);

function pickTimestamp(): string {
  // Gentle upward trend: recent days slightly heavier.
  for (let i = 0; i < 16; i++) {
    const t = START_DATE.getTime() + rand() * DAYS * MS_PER_DAY;
    const dayIndex = Math.floor((t - START_DATE.getTime()) / MS_PER_DAY);
    const trend = 0.7 + (dayIndex / DAYS) * 0.6;
    if (rand() < trend / 1.3) {
      return new Date(t).toISOString();
    }
  }
  return new Date(START_DATE.getTime() + rand() * DAYS * MS_PER_DAY).toISOString();
}

// ─── id generation ───────────────────────────────────────────────────
function shortId(prefix: string): string {
  let s = "";
  for (let i = 0; i < 8; i++) s += Math.floor(rand() * 16).toString(16);
  return `${prefix}_${s}`;
}

// ─── per-type generators ─────────────────────────────────────────────
function fillTemplate(tpl: string): string {
  // Replace {comp}, {comp2}, {comp3} with distinct competitors.
  const used: string[] = [];
  let out = tpl;
  while (/\{comp\d*\}/.test(out)) {
    const candidate = pick(COMPETITORS);
    if (used.includes(candidate)) continue;
    used.push(candidate);
    out = out.replace(/\{comp\d*\}/, candidate);
  }
  return out;
}

function makeCitationMissed(): CitationMissedEvent {
  const competitorCount = randInt(1, 3);
  const brands: string[] = [];
  while (brands.length < competitorCount) {
    const c = pick(COMPETITORS);
    if (!brands.includes(c)) brands.push(c);
  }
  return {
    event_type: "citation_missed",
    id: shortId("cm"),
    created_at: pickTimestamp(),
    prompt: pick(PROMPTS),
    engine: pick(ENGINES),
    competitor_brands: brands,
  };
}

function makeCompetitorCitedInstead(): CompetitorCitedInsteadEvent {
  const source_type = pick(["article", "reddit", "youtube"] as const);
  const competitor = pick(COMPETITORS);
  const title =
    source_type === "reddit"
      ? fillTemplate(pick(REDDIT_THREAD_PATTERNS))
      : source_type === "article"
        ? fillTemplate(pick(ARTICLE_TITLE_PATTERNS))
        : `${competitor} — full product walkthrough`;
  const url =
    source_type === "reddit"
      ? `https://reddit.com/${pick(SUBREDDITS)}/comments/${pick(REDDIT_THREAD_SLUGS)}`
      : source_type === "article"
        ? `https://example.com/article/${pick(ARTICLE_SLUGS)}`
        : `https://youtube.com/watch?v=${shortId("v").slice(2)}`;
  return {
    event_type: "competitor_cited_instead",
    id: shortId("cc"),
    created_at: pickTimestamp(),
    competitor_brand: competitor,
    source_type,
    source_url: url,
    source_title: title,
    position: randInt(1, 5),
  };
}

function makeRedditMention(): RedditCompetitorMentionEvent {
  const competitorCount = randInt(1, 3);
  const competitors: string[] = [];
  while (competitors.length < competitorCount) {
    const c = pick(COMPETITORS);
    if (!competitors.includes(c)) competitors.push(c);
  }
  const subreddit = pick(SUBREDDITS);
  const slug = pick(REDDIT_THREAD_SLUGS);
  return {
    event_type: "reddit_competitor_mention",
    id: shortId("rm"),
    created_at: pickTimestamp(),
    subreddit,
    thread_title: fillTemplate(pick(REDDIT_THREAD_PATTERNS)),
    thread_url: `https://reddit.com/${subreddit}/comments/${slug}`,
    competitors_mentioned: competitors,
    // Long-tailed upvote distribution — most threads small, a few viral.
    upvotes:
      rand() < 0.85 ? randInt(5, 150) : rand() < 0.7 ? randInt(150, 800) : randInt(800, 4000),
    comment_count:
      rand() < 0.85 ? randInt(0, 40) : rand() < 0.7 ? randInt(40, 200) : randInt(200, 800),
  };
}

function makeArticlePublished(): ArticlePublishedWithCompetitorsEvent {
  const competitorCount = randInt(2, 4);
  const competitors: string[] = [];
  while (competitors.length < competitorCount) {
    const c = pick(COMPETITORS);
    if (!competitors.includes(c)) competitors.push(c);
  }
  const slug = pick(ARTICLE_SLUGS);
  return {
    event_type: "article_published_with_competitors",
    id: shortId("ap"),
    created_at: pickTimestamp(),
    publication: pick(PUBLICATIONS),
    article_title: fillTemplate(pick(ARTICLE_TITLE_PATTERNS)),
    article_url: pick(ARTICLE_URL_PATTERNS).replace("{slug}", slug),
    competitors_cited: competitors,
    estimated_monthly_traffic:
      rand() < 0.6 ? randInt(500, 8000) : rand() < 0.85 ? randInt(8000, 50000) : randInt(50000, 250000),
  };
}

// ─── generate ────────────────────────────────────────────────────────
const EVENT_PLAN = [
  { factory: makeRedditMention, count: 80 },
  { factory: makeCitationMissed, count: 50 },
  { factory: makeCompetitorCitedInstead, count: 40 },
  { factory: makeArticlePublished, count: 30 },
];

const events: MonitoringEvent[] = [];
for (const { factory, count } of EVENT_PLAN) {
  for (let i = 0; i < count; i++) {
    events.push(factory());
  }
}
events.sort((a, b) =>
  a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0,
);

// ─── write ───────────────────────────────────────────────────────────
const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "monitoring-events.json");
writeFileSync(outPath, JSON.stringify(events, null, 2));

const byType = new Map<string, number>();
for (const e of events) byType.set(e.event_type, (byType.get(e.event_type) ?? 0) + 1);

console.log(`✓ wrote ${events.length} monitoring events → ${outPath}`);
console.log(`  date range: ${events[0].created_at} → ${events[events.length - 1].created_at}`);
console.log(`  event-type mix:`);
for (const [type, count] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`    ${type.padEnd(40)} ${count.toString().padStart(4)}`);
}
console.log(`  competitor brands in seed: ${COMPETITORS.join(", ")}`);
console.log(`\n  Your job: write deriveActions(events) → Action[]`);
console.log(`  See docs/FEATURE_2.md for the contract.`);
