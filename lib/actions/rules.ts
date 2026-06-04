import type {
  Action,
  CitationMissedEvent,
  CompetitorCitedInsteadEvent,
  RedditCompetitorMentionEvent,
  ArticlePublishedWithCompetitorsEvent,
  MonitoringEvent,
} from "@/lib/types";
import { generateStableId } from "./idGenerator";
import {
  evaluateArticleSeverity,
  evaluateCitationPositionSeverity,
  evaluateMissedCitationSeverity,
  evaluateRedditSeverity,
} from "./severity";

export interface ActionRule<T extends MonitoringEvent> {
  eventType: T["event_type"];
  /** 
   * If provided, events of this type are grouped by the returned string before evaluation.
   * If omitted, each event is evaluated individually (1:1).
   */
  groupingKey?(event: T): string;
  evaluate(events: T[]): Action | Action[] | null;
}

const redditRule: ActionRule<RedditCompetitorMentionEvent> = {
  eventType: "reddit_competitor_mention",
  evaluate: (events) => {
    const event = events[0]; // 1:1 mapping
    return {
      id: generateStableId([event.id], "reddit"),
      type: "reddit",
      severity: evaluateRedditSeverity(event.upvotes, event.comment_count),
      title: `Engage with Reddit thread in r/${event.subreddit}`,
      description: `Competitors were mentioned in "${event.thread_title}". Join the conversation to highlight your alternative.`,
      created_at: event.created_at,
      source_url: event.thread_url,
      source_event_ids: [event.id],
      status: "active",
    };
  },
};

const articleRule: ActionRule<ArticlePublishedWithCompetitorsEvent> = {
  eventType: "article_published_with_competitors",
  evaluate: (events) => {
    const event = events[0];
    return {
      id: generateStableId([event.id], "outreach"),
      type: "outreach",
      severity: evaluateArticleSeverity(event.estimated_monthly_traffic),
      title: `Pitch author at ${event.publication}`,
      description: `They covered your competitors in "${event.article_title}". Reach out for inclusion.`,
      created_at: event.created_at,
      source_url: event.article_url,
      source_event_ids: [event.id],
      status: "active",
    };
  },
};

const citationMissedRule: ActionRule<CitationMissedEvent> = {
  eventType: "citation_missed",
  // Group by exact prompt (lowercased)
  groupingKey: (event) => event.prompt.toLowerCase().trim(),
  evaluate: (events) => {
    if (events.length === 0) return null;
    
    const eventIds = events.map((e) => e.id);
    // Use the most recent event's date
    const recentDate = events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at;
    const competitors = Array.from(new Set(events.flatMap((e) => e.competitor_brands)));
    const prompt = events[0].prompt;

    const competitorStr = competitors.slice(0, 2).join(', ') + (competitors.length > 2 ? '...' : '');

    return {
      id: generateStableId(eventIds, "content"),
      type: "content",
      severity: evaluateMissedCitationSeverity(events.length),
      title: `Publish gap article for "${prompt}"`,
      description: `You missed citations for this prompt ${events.length} times recently. Competitors cited: ${competitorStr}.`,
      created_at: recentDate,
      source_event_ids: eventIds,
      status: "active",
    };
  },
};

const competitorCitedInsteadRule: ActionRule<CompetitorCitedInsteadEvent> = {
  eventType: "competitor_cited_instead",
  evaluate: (events) => {
    const event = events[0];
    const type = event.source_type === "article" ? "outreach" : "content";

    return {
      id: generateStableId([event.id], type),
      type,
      severity: evaluateCitationPositionSeverity(event.position),
      title: `Reclaim position from ${event.competitor_brand}`,
      description: `${event.competitor_brand} is being cited instead of you (Position ${event.position}). Review their source: "${event.source_title}".`,
      created_at: event.created_at,
      source_url: event.source_url,
      source_event_ids: [event.id],
      status: "active",
    };
  },
};

// The Engine's Configuration
export const RULES: ActionRule<MonitoringEvent>[] = [
  redditRule,
  articleRule,
  citationMissedRule,
  competitorCitedInsteadRule,
];
