import type { Severity } from "@/lib/types";

export function evaluateRedditSeverity(upvotes: number, commentCount: number): Severity {
  if (upvotes > 50 || commentCount > 20) return "high";
  if (upvotes > 10) return "medium";
  return "low";
}

export function evaluateArticleSeverity(monthlyTraffic: number): Severity {
  if (monthlyTraffic > 50000) return "high";
  if (monthlyTraffic > 10000) return "medium";
  return "low";
}

export function evaluateMissedCitationSeverity(missCount: number): Severity {
  if (missCount > 3) return "high";
  if (missCount >= 2) return "medium";
  return "low";
}

export function evaluateCitationPositionSeverity(position: number): Severity {
  if (position <= 2) return "high";
  if (position <= 5) return "medium";
  return "low";
}
