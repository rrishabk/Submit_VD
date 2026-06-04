import type { BotName } from "./trafficTypes";

export const BOT_NAMES: readonly BotName[] = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
] as const;

export const BOT_UA_SUBSTRINGS: Record<BotName, readonly string[]> = {
  GPTBot: ["GPTBot"],
  "ChatGPT-User": ["ChatGPT-User"],
  "OAI-SearchBot": ["OAI-SearchBot"],
  ClaudeBot: ["ClaudeBot", "Claude-Web"],
  PerplexityBot: ["PerplexityBot"],
  "Perplexity-User": ["Perplexity-User"],
  "Google-Extended": ["Google-Extended"],
};

export function classifyUserAgent(ua: string): BotName | null {
  for (const bot of BOT_NAMES) {
    const substrings = BOT_UA_SUBSTRINGS[bot];
    for (const sub of substrings) {
      if (ua.includes(sub)) {
        return bot;
      }
    }
  }
  return null;
}
