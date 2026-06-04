export type BotName =
  | "GPTBot"
  | "ChatGPT-User"
  | "OAI-SearchBot"
  | "ClaudeBot"
  | "PerplexityBot"
  | "Perplexity-User"
  | "Google-Extended";

export interface AiVisit {
  id: string;
  timestamp: string;
  bot: BotName;
  page_path: string;
  user_agent: string;
}

export interface DailyAggregation {
  date: string;
  [key: string]: number | string; // bot name -> count
  total: number;
}

export interface PageCount {
  path: string;
  count: number;
}

export interface CrawlerCount {
  bot: BotName;
  count: number;
}

export interface AggregationResult {
  chartData: DailyAggregation[];
  topPages: PageCount[];
  topCrawlers: CrawlerCount[];
  summary: {
    totalVisits: number;
    botCount: number;
    pageCount: number;
  };
}
