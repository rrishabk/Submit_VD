"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  type TooltipContentProps,
} from "recharts";
import type { DailyAggregation } from "@/lib/traffic/trafficTypes";
import type { BotName } from "@/lib/traffic/trafficTypes";
import { BOT_NAMES } from "@/lib/traffic/classifier";
import { BOT_COLORS, BOT_DISPLAY_NAMES } from "@/lib/bot-config";
import { Skeleton } from "../ui/Skeleton";
import { Card } from "../ui/Card";

interface StackedBarChartProps {
  isLoading: boolean;
  isEmpty: boolean;
  data: DailyAggregation[];
}

const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
  if (active && payload && payload.length) {
    const dateObj = new Date(label as string);
    const dateStr = isNaN(dateObj.getTime())
      ? label
      : dateObj.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });

    let total = 0;
    const botLines = payload
      .filter((entry) => typeof entry.value === "number" && entry.value > 0)
      .map((entry) => {
        total += entry.value as number;
        return (
          <div key={entry.name} className="flex items-center justify-between gap-6 py-1">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-zinc-300">{BOT_DISPLAY_NAMES[entry.name as BotName]}</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {(entry.value as number).toLocaleString()}
            </span>
          </div>
        );
      });

    if (botLines.length === 0) return null;

    return (
      <div className="rounded-xl border border-white/10 bg-[#111111]/95 backdrop-blur-md p-4 shadow-2xl flex flex-col gap-1 min-w-[220px]">
        <p className="mb-3 text-sm font-medium text-zinc-400 border-b border-white/10 pb-2">{dateStr}</p>
        {botLines}
        <div className="mt-2 flex justify-between border-t border-white/10 pt-3">
          <span className="text-sm font-bold text-white">Total:</span>
          <span className="text-sm font-bold text-[#F97316]">{total.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function StackedBarChart({
  isLoading,
  isEmpty,
  data,
}: StackedBarChartProps) {
  const [activeBots, setActiveBots] = React.useState<Record<BotName, boolean>>(() => {
    const acc: Partial<Record<BotName, boolean>> = {};
    for (const b of BOT_NAMES) acc[b] = true;
    return acc as Record<BotName, boolean>;
  });

  const onToggleBot = React.useCallback((bot: BotName) => {
    setActiveBots((prev) => ({
      ...prev,
      [bot]: !prev[bot],
    }));
  }, []);

  const sortedBots = useMemo(() => {
    if (data.length === 0) return BOT_NAMES;
    const totals: Record<string, number> = {};
    for (const bot of BOT_NAMES) totals[bot] = 0;
    for (const day of data) {
      for (const bot of BOT_NAMES) {
        totals[bot] += (day[bot] as number) || 0;
      }
    }
    return [...BOT_NAMES].sort((a, b) => totals[b] - totals[a]);
  }, [data]);

  const allHidden = useMemo(() => !Object.values(activeBots).some(Boolean), [activeBots]);

  return (
    <Card className="flex flex-col bg-[#0A0A0A] border-white/10 shadow-lg shadow-black/50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Legend Strip */}
      <div className="mb-8 flex flex-wrap gap-2 relative z-10">
        {sortedBots.map((bot) => {
          const isActive = activeBots[bot];
          return (
            <button
              key={bot}
              onClick={() => onToggleBot(bot)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-150 ${
                isActive 
                  ? "border-white/20 bg-white/10 hover:bg-white/15" 
                  : "border-transparent bg-transparent opacity-40 hover:opacity-100 hover:bg-white/5"
              }`}
            >
              <div
                className="h-2.5 w-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: BOT_COLORS[bot] }}
              />
              <span className={`text-xs font-medium tracking-wide ${isActive ? "text-white" : "text-zinc-400"}`}>
                {BOT_DISPLAY_NAMES[bot]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chart Body */}
      <div className="relative min-h-[400px] w-full flex-1 max-h-[600px] z-10">
        {isLoading ? (
          <Skeleton className="absolute inset-0 bg-white/5" />
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-500">No AI traffic yet. Once AI crawlers visit your site, you&apos;ll see them here.</p>
          </div>
        ) : allHidden ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-500">All bots hidden. Click a legend item to show data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#262626" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
                dy={10}
                tickFormatter={(val) => {
                  const d = new Date(val);
                  if (isNaN(d.getTime())) return val;
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
                }}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#737373" }}
                width={60}
                dx={-10}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip
                content={(props) => <CustomTooltip {...props} />}
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
              />
              {sortedBots.map((bot) => (
                activeBots[bot] && (
                  <Bar
                    key={bot}
                    dataKey={bot}
                    stackId="a"
                    fill={BOT_COLORS[bot]}
                    isAnimationActive={false} // <150ms legend toggle requirement
                  />
                )
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
