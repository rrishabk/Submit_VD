import React from "react";
import type { PageCount } from "@/lib/traffic/trafficTypes";
import { Skeleton } from "../ui/Skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";

interface TopPagesPanelProps {
  isLoading: boolean;
  pages: PageCount[];
}

export const TopPagesPanel = React.memo(function TopPagesPanel({ isLoading, pages }: TopPagesPanelProps) {
  if (isLoading) {
    return (
      <Card className="bg-[#0A0A0A] border-white/10 shadow-lg shadow-black/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <CardHeader className="pb-4">
          <CardTitle className="text-white">Top Pages</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex h-8 items-center justify-between">
              <Skeleton className="h-4 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-8 bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card className="flex h-[380px] flex-col items-center justify-center bg-[#0A0A0A] border-white/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <CardTitle className="mb-2 text-white">Top Pages</CardTitle>
        <p className="text-sm text-zinc-400">No pages to show.</p>
      </Card>
    );
  }

  const maxCount = pages[0]?.count || 1;

  return (
    <Card className="bg-[#0A0A0A] border-white/10 shadow-lg shadow-black/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-white">Top Pages</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 relative z-10">
        {pages.map((page) => {
          const widthPct = Math.max(2, (page.count / maxCount) * 100);
          return (
            <div key={page.path} className="group relative flex h-9 items-center justify-between rounded-md px-2 hover:bg-white/5 transition-colors">
              <div
                className="absolute left-0 top-0 h-full rounded-md bg-white/5 pointer-events-none"
                style={{ width: `${widthPct}%` }}
              />
              <span className="relative z-10 font-mono text-sm text-zinc-300 truncate max-w-[80%]">
                {page.path}
              </span>
              <span className="relative z-10 text-sm font-medium text-white">
                {page.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
