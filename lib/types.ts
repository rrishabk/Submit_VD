// =====================================================================
// Verseodin trial — shared type contracts.
//
// You MUST consume these types as defined. The seed scripts emit data
// shaped exactly like this; the reviewer will check whether your code
// reads it correctly. You may add derived types of your own (e.g. for
// aggregated chart series) — don't change these.
// =====================================================================

// ---------------------------------------------------------------------
// Feature 1 — AI Traffic Dashboard
// ---------------------------------------------------------------------

export type BotName =
  | "GPTBot"
  | "ChatGPT-User"
  | "OAI-SearchBot"
  | "ClaudeBot"
  | "PerplexityBot"
  | "Perplexity-User"
  | "Google-Extended";

export const BOT_NAMES: readonly BotName[] = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
] as const;

// Canonical user-agent substrings used by the seeder + the classifier.
// "ClaudeBot" classifies both `ClaudeBot/x.x` and `Claude-Web/x.x` UAs.
export const BOT_UA_SUBSTRINGS: Record<BotName, readonly string[]> = {
  GPTBot: ["GPTBot"],
  "ChatGPT-User": ["ChatGPT-User"],
  "OAI-SearchBot": ["OAI-SearchBot"],
  ClaudeBot: ["ClaudeBot", "Claude-Web"],
  PerplexityBot: ["PerplexityBot"],
  "Perplexity-User": ["Perplexity-User"],
  "Google-Extended": ["Google-Extended"],
};

export interface AiVisit {
  /** Stable, sortable id. */
  id: string;
  /** ISO 8601 UTC timestamp. */
  timestamp: string;
  /** Classified bot name; derived from `user_agent` by the seeder. */
  bot: BotName;
  /** Site-relative path, always starts with "/". */
  page_path: string;
  /** Full user-agent string; contains the canonical substring for `bot`. */
  user_agent: string;
}

// ---------------------------------------------------------------------
// Feature 2 — Action Centre (raw monitoring events)
//
// You DO NOT ship Action[] directly. Instead, monitoring-events.json
// contains ~200 raw events of 4 event types. Your job is to write a
// derivation function:
//
//   function deriveActions(events: MonitoringEvent[]): Action[]
//
// …that produces 15–30 Action cards with sensible `type`, `severity`,
// human-friendly `title` and `description`. The eval signal lives in
// the cleanliness + extensibility of that derivation, not in the UI.
// ---------------------------------------------------------------------

export type Engine = "chatgpt" | "claude" | "perplexity" | "gemini";

export interface CitationMissedEvent {
  event_type: "citation_missed";
  id: string;
  created_at: string;
  /** The prompt the engine answered. */
  prompt: string;
  engine: Engine;
  /** Competitor brand names cited in the answer instead of the user. */
  competitor_brands: string[];
}

export interface CompetitorCitedInsteadEvent {
  event_type: "competitor_cited_instead";
  id: string;
  created_at: string;
  competitor_brand: string;
  source_type: "article" | "reddit" | "youtube";
  source_url: string;
  source_title: string;
  /** Citation position in the LLM answer (1 = first). */
  position: number;
}

export interface RedditCompetitorMentionEvent {
  event_type: "reddit_competitor_mention";
  id: string;
  created_at: string;
  subreddit: string;
  thread_title: string;
  thread_url: string;
  competitors_mentioned: string[];
  upvotes: number;
  comment_count: number;
}

export interface ArticlePublishedWithCompetitorsEvent {
  event_type: "article_published_with_competitors";
  id: string;
  created_at: string;
  publication: string;
  article_title: string;
  article_url: string;
  competitors_cited: string[];
  /** Estimated monthly traffic to the article (for severity heuristics). */
  estimated_monthly_traffic: number;
}

export type MonitoringEvent =
  | CitationMissedEvent
  | CompetitorCitedInsteadEvent
  | RedditCompetitorMentionEvent
  | ArticlePublishedWithCompetitorsEvent;

// ---------------------------------------------------------------------
// Action Centre — output of your derivation function
// ---------------------------------------------------------------------

export type ActionType = "reddit" | "outreach" | "content";
export type Severity = "high" | "medium" | "low";
export type Status = "active" | "accepted" | "dismissed";

export interface Action {
  /** Stable id; React key + localStorage merge key. */
  id: string;
  type: ActionType;
  severity: Severity;
  /** Bold headline, 2–3 lines worth. */
  title: string;
  /** Body blurb, 2–3 lines worth. */
  description: string;
  /** ISO 8601; drives the relative date label. */
  created_at: string;
  /** Optional link-out — do NOT build the navigation in v1. */
  source_url?: string;
  /** The raw event ids this Action was derived from (for transparency / debugging). */
  source_event_ids?: string[];
  /** 'active' on derivation; mutated by Accept/Dismiss. */
  status: Status;
}
