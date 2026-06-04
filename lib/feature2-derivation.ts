import type {
  MonitoringEvent,
  Action,
  ActionType,
  Severity,
} from "./types";

/**
 * Deterministic hash function for stable Action IDs.
 */
function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function generateStableId(sourceIds: string[], type: string): string {
  const sorted = [...sourceIds].sort();
  const hash = cyrb53(`${type}:${sorted.join(",")}`);
  return `act_${hash.toString(16)}`;
}

export function deriveActions(events: MonitoringEvent[]): Action[] {
  const actions: Action[] = [];

  // Group citation_missed by prompt
  const missedCitations = new Map<string, MonitoringEvent[]>();

  for (const event of events) {
    if (event.event_type === "citation_missed") {
      const prompt = event.prompt.toLowerCase().trim();
      const group = missedCitations.get(prompt) || [];
      group.push(event);
      missedCitations.set(prompt, group);
      continue;
    }

    // Process non-aggregated events
    if (event.event_type === "reddit_competitor_mention") {
      let severity: Severity = "low";
      if (event.upvotes > 50 || event.comment_count > 20) severity = "high";
      else if (event.upvotes > 10) severity = "medium";

      actions.push({
        id: generateStableId([event.id], "reddit"),
        type: "reddit",
        severity,
        title: `Engage with Reddit thread in r/${event.subreddit}`,
        description: `Competitors were mentioned in "${event.thread_title}". Join the conversation to highlight your alternative.`,
        created_at: event.created_at,
        source_url: event.thread_url,
        source_event_ids: [event.id],
        status: "active",
      });
    } else if (event.event_type === "article_published_with_competitors") {
      let severity: Severity = "low";
      if (event.estimated_monthly_traffic > 50000) severity = "high";
      else if (event.estimated_monthly_traffic > 10000) severity = "medium";

      actions.push({
        id: generateStableId([event.id], "outreach"),
        type: "outreach",
        severity,
        title: `Pitch author at ${event.publication}`,
        description: `They covered your competitors in "${event.article_title}". Reach out for inclusion.`,
        created_at: event.created_at,
        source_url: event.article_url,
        source_event_ids: [event.id],
        status: "active",
      });
    } else if (event.event_type === "competitor_cited_instead") {
      let severity: Severity = "low";
      if (event.position <= 2) severity = "high";
      else if (event.position <= 5) severity = "medium";

      const type: ActionType = event.source_type === "article" ? "outreach" : "content";

      actions.push({
        id: generateStableId([event.id], type),
        type,
        severity,
        title: `Reclaim position from ${event.competitor_brand}`,
        description: `${event.competitor_brand} is being cited instead of you (Position ${event.position}). Review their source: "${event.source_title}".`,
        created_at: event.created_at,
        source_url: event.source_url,
        source_event_ids: [event.id],
        status: "active",
      });
    }
  }

  // Process aggregated citation_missed events
  for (const [prompt, group] of missedCitations.entries()) {
    let severity: Severity = "low";
    if (group.length > 3) severity = "high";
    else if (group.length === 2 || group.length === 3) severity = "medium";

    const eventIds = group.map((e) => e.id);
    const recentDate = group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at;
    const competitors = Array.from(new Set(group.flatMap((e) => (e.event_type === 'citation_missed' ? e.competitor_brands : []))));
    
    actions.push({
      id: generateStableId(eventIds, "content"),
      type: "content",
      severity,
      title: `Publish gap article for "${prompt}"`,
      description: `You missed citations for this prompt ${group.length} times recently. Competitors cited: ${competitors.slice(0, 2).join(', ')}${competitors.length > 2 ? '...' : ''}.`,
      created_at: recentDate,
      source_event_ids: eventIds,
      status: "active",
    });
  }

  return actions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
