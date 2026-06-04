"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { AiVisit, AggregationResult } from "@/lib/traffic/trafficTypes";
import { StackedBarChart } from "./StackedBarChart";
import { TopPagesPanel } from "./TopPagesPanel";
import { TopCrawlersPanel } from "./TopCrawlersPanel";
import { Button } from "../ui/Button";
import { PageHeader } from "../ui/PageHeader";

export function TrafficDashboard() {
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [result, setResult] = useState<AggregationResult | null>(null);

  const loadData = useCallback(() => {
    setStatus("loading");
    fetch("/visits.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load visits");
        return res.json();
      })
      .then((visits: AiVisit[]) => {
        // Run aggregation in Web Worker for <500ms budget
        const worker = new Worker(new URL("../../lib/traffic/worker.ts", import.meta.url));
        worker.postMessage(visits);
        worker.onmessage = (e) => {
          if (e.data.type === "SUCCESS") {
            setResult(e.data.payload);
            setStatus("success");
          } else {
            console.error(e.data.error);
            setStatus("error");
          }
          worker.terminate();
        };
        worker.onerror = (e) => {
          console.error(e);
          setStatus("error");
          worker.terminate();
        };
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#000000]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0A0A0A] p-12 text-center shadow-2xl">
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-white">Couldn&apos;t load traffic data</h1>
          <p className="mb-6 text-sm text-zinc-400">Please try refreshing the page or checking your connection.</p>
          <Button onClick={loadData} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = status === "loading";
  const isEmpty = status === "success" && result?.summary.totalVisits === 0;

  // Header Summary Line
  let summaryLine = "—";
  if (result) {
    summaryLine = `${result.summary.totalVisits.toLocaleString()} visits from ${result.summary.botCount} bots across ${result.summary.pageCount} pages, last 90 days`;
  }

  return (
    <div className="min-h-screen bg-[#000000] px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#F97316]/30">
      <div className="mx-auto max-w-6xl">
        <PageHeader 
          title="AI Traffic" 
          description={isLoading ? <span className="invisible">Loading...</span> : summaryLine}
          className="text-white border-b border-white/10 mb-8 pb-6"
        />

        <div className="flex flex-col gap-8">
          <StackedBarChart
            isLoading={isLoading}
            isEmpty={isEmpty}
            data={result?.chartData || []}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <TopPagesPanel isLoading={isLoading} pages={result?.topPages || []} />
            <TopCrawlersPanel isLoading={isLoading} crawlers={result?.topCrawlers || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
