import type { Action, MonitoringEvent } from "@/lib/types";
import { RULES } from "./rules";

/**
 * Derives actionable recommendations from a raw stream of monitoring events
 * using a declarative, rules-based engine.
 */
export function deriveActions(events: MonitoringEvent[]): Action[] {
  const actions: Action[] = [];

  for (const rule of RULES) {
    const matchedEvents = events.filter((e) => e.event_type === rule.eventType);
    
    if (matchedEvents.length === 0) continue;

    if (rule.groupingKey) {
      // Aggregate events before evaluating
      const groups = new Map<string, MonitoringEvent[]>();
      for (const e of matchedEvents) {
        const key = rule.groupingKey(e);
        const group = groups.get(key) || [];
        group.push(e);
        groups.set(key, group);
      }
      
      for (const group of groups.values()) {
        const result = rule.evaluate(group);
        if (result) {
          if (Array.isArray(result)) actions.push(...result);
          else actions.push(result);
        }
      }
    } else {
      // 1:1 evaluation
      for (const e of matchedEvents) {
        const result = rule.evaluate([e]);
        if (result) {
          if (Array.isArray(result)) actions.push(...result);
          else actions.push(result);
        }
      }
    }
  }

  // Sort universally by created_at descending (newest first)
  return actions.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
