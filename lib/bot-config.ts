import type { BotName } from "./types";

export const BOT_COLORS: Record<BotName, string> = {
  GPTBot: "#10a37f", // OpenAI Green
  "ChatGPT-User": "#000000", // Black
  "OAI-SearchBot": "#5c5c5c", // Gray
  ClaudeBot: "#d97757", // Anthropic Orange
  PerplexityBot: "#22d3ee", // Cyan
  "Perplexity-User": "#0891b2", // Darker Cyan
  "Google-Extended": "#4285f4", // Google Blue
};

export const BOT_DISPLAY_NAMES: Record<BotName, string> = {
  GPTBot: "GPTBot (OpenAI)",
  "ChatGPT-User": "ChatGPT-User (OpenAI)",
  "OAI-SearchBot": "OAI-SearchBot (OpenAI)",
  ClaudeBot: "ClaudeBot (Anthropic)",
  PerplexityBot: "PerplexityBot (Perplexity)",
  "Perplexity-User": "Perplexity-User (Perplexity)",
  "Google-Extended": "Google-Extended (Google)",
};
