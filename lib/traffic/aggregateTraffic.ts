import type { AiVisit, BotName, AggregationResult, DailyAggregation } from "./trafficTypes";
import { BOT_NAMES } from "./classifier";

export function aggregateTraffic(visits: AiVisit[]): AggregationResult {
  const dailyMap = new Map<string, Map<BotName, number>>();
  const pageMap = new Map<string, number>();
  const crawlerMap = new Map<BotName, number>();
  
  let totalVisits = 0;

  // Single O(N) pass through all 100,000 visits
  for (let i = 0; i < visits.length; i++) {
    const visit = visits[i];
    const bot = visit.bot;
    const page = visit.page_path;
    // Fast extraction of YYYY-MM-DD from ISO string "2026-06-03T12:00:00Z"
    const date = visit.timestamp.substring(0, 10); 

    // 1. Build the per-day x per-bot matrix
    let dayBots = dailyMap.get(date);
    if (!dayBots) {
      dayBots = new Map<BotName, number>();
      dailyMap.set(date, dayBots);
    }
    dayBots.set(bot, (dayBots.get(bot) || 0) + 1);

    // 2. Build the page totals
    pageMap.set(page, (pageMap.get(page) || 0) + 1);

    // 3. Build the crawler totals
    crawlerMap.set(bot, (crawlerMap.get(bot) || 0) + 1);

    totalVisits++;
  }

  // Convert daily map into a sorted array of objects for Recharts
  const sortedDates = Array.from(dailyMap.keys()).sort();
  const chartData: DailyAggregation[] = sortedDates.map((date) => {
    const dayBots = dailyMap.get(date)!;
    const row: DailyAggregation = { date, total: 0 };
    let dayTotal = 0;
    
    for (const bot of BOT_NAMES) {
      const count = dayBots.get(bot) || 0;
      row[bot] = count;
      dayTotal += count;
    }
    row.total = dayTotal;
    return row;
  });

  // Calculate top 8 pages
  const topPages = Array.from(pageMap.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Calculate top 8 crawlers
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
