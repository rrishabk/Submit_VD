import type { AiVisit, BotName } from "./types";
import { BOT_NAMES } from "./types";

export interface DailyAggregation {
  date: string; // YYYY-MM-DD
  [key: string]: number | string; // bot names -> counts
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

export function aggregateVisits(visits: AiVisit[]): AggregationResult {
  const dailyMap = new Map<string, Map<BotName, number>>();
  const pageMap = new Map<string, number>();
  const crawlerMap = new Map<BotName, number>();
  
  let totalVisits = 0;

  for (let i = 0; i < visits.length; i++) {
    const visit = visits[i];
    const bot = visit.bot;
    const page = visit.page_path;
    // Extract YYYY-MM-DD from ISO string "2026-06-03T...Z"
    const date = visit.timestamp.split("T")[0];

    // 1. Daily Aggregation
    let dayBots = dailyMap.get(date);
    if (!dayBots) {
      dayBots = new Map<BotName, number>();
      dailyMap.set(date, dayBots);
    }
    dayBots.set(bot, (dayBots.get(bot) || 0) + 1);

    // 2. Page Aggregation
    pageMap.set(page, (pageMap.get(page) || 0) + 1);

    // 3. Crawler Aggregation
    crawlerMap.set(bot, (crawlerMap.get(bot) || 0) + 1);

    totalVisits++;
  }

  // Convert dailyMap to sorted array of objects
  const sortedDates = Array.from(dailyMap.keys()).sort();
  const chartData: DailyAggregation[] = sortedDates.map((date) => {
    const dayBots = dailyMap.get(date)!;
    const row: DailyAggregation = { date, total: 0 };
    let dayTotal = 0;
    
    // Initialize all bots to 0 so Recharts stacks consistently, though Recharts can handle missing keys
    for (const bot of BOT_NAMES) {
      const count = dayBots.get(bot) || 0;
      row[bot] = count;
      dayTotal += count;
    }
    row.total = dayTotal;
    return row;
  });

  // Top Pages
  const topPages = Array.from(pageMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top Crawlers
  const topCrawlers = Array.from(crawlerMap.entries())
    .map(([bot, count]) => ({ bot, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    chartData,
    topPages,
    topCrawlers,
    summary: {
      totalVisits,
      botCount: crawlerMap.size,
      pageCount: pageMap.size,
    },
  };
}
