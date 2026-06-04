import React from "react";
import type { CrawlerCount } from "@/lib/traffic/trafficTypes";
import { BOT_COLORS, BOT_DISPLAY_NAMES } from "@/lib/bot-config";
import { Skeleton } from "../ui/Skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

interface TopCrawlersPanelProps {
  isLoading: boolean;
  crawlers: CrawlerCount[];
}

export const TopCrawlersPanel = React.memo(function TopCrawlersPanel({ isLoading, crawlers }: TopCrawlersPanelProps) {
  if (isLoading) {
    return (
      <Card className="bg-[#0A0A0A] border-white/10 shadow-lg shadow-black/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Top Crawlers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex h-8 items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full bg-white/10" />
                <Skeleton className="h-4 w-32 bg-white/10" />
              </div>
              <Skeleton className="h-4 w-8 bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (crawlers.length === 0) {
    return (
      <Card className="flex h-[380px] flex-col items-center justify-center bg-[#0A0A0A] border-white/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <CardTitle className="mb-2 text-white">Top Crawlers</CardTitle>
        <p className="text-sm text-zinc-400">No crawlers to show.</p>
      </Card>
    );
  }

  const maxCount = crawlers[0]?.count || 1;

  return (
    <Card className="bg-[#0A0A0A] border-white/10 shadow-lg shadow-black/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-white">Top Crawlers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 relative z-10">
        {crawlers.map((crawler) => {
          const widthPct = Math.max(2, (crawler.count / maxCount) * 100);
          const color = BOT_COLORS[crawler.bot];
          const displayName = BOT_DISPLAY_NAMES[crawler.bot];
          const initial = crawler.bot.charAt(0).toUpperCase();

          return (
            <div key={crawler.bot} className="group relative flex h-9 items-center justify-between rounded-md px-2 hover:bg-white/5 transition-colors">
              <div
                className="absolute left-0 top-0 h-full rounded-md bg-white/5 pointer-events-none"
                style={{ width: `${widthPct}%` }}
              />
              <div className="relative z-10 flex items-center gap-3 truncate">
                <div 
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {initial}
                </div>
                <span className="text-sm text-zinc-300 truncate">
                  {displayName}
                </span>
              </div>
              <span className="relative z-10 text-sm font-medium text-white shrink-0 ml-4">
                {crawler.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
