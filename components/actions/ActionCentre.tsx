"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import type { Action, MonitoringEvent } from "@/lib/types";
import { deriveActions } from "@/lib/actions/deriveActions";
import { ActionCard } from "./ActionCard";
import { FilterRow, type FilterSeverity, type FilterType } from "./FilterRow";

const STORAGE_KEY = "actionCentre.v1";

export function ActionCentre() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("all");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [activeTab, setActiveTab] = useState<"active" | "dismissed">("active");

  useEffect(() => {
    // Cold load: Fetch events, derive actions, and merge localStorage purely before opening the Hydration Gate.
    fetch("/monitoring-events.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load events");
        return res.json();
      })
      .then((events: MonitoringEvent[]) => {
        const starterActions = deriveActions(events);

        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as { id: string; status: Action["status"] }[];
            const statusMap = new Map(parsed.map((item) => [item.id, item.status]));

            // 1. localStorage merge (Immutable)
            const mergedActions = starterActions.map((action) => ({
              ...action,
              status: statusMap.get(action.id) || action.status,
            }));
            
            setActions(mergedActions);
            
            // Re-sync back to storage to clean up stale IDs
            const toSave = mergedActions.map((a) => ({ id: a.id, status: a.status }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
          } else {
            setActions(starterActions);
          }
        } catch (e) {
          // 3. Error handling
          console.error("localStorage hydration error:", e);
          setStorageError(true);
          setActions(starterActions);
        } finally {
          // 2. Hydration gate opens ONLY after states are perfectly merged
          setIsHydrated(true);
        }
      })
      .catch((err) => {
        console.error("Error loading events", err);
        // Fallback to open gate so the user isn't stuck on a skeleton, but show empty state
        setIsHydrated(true);
      });
  }, []);

  // Sync actions changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const toSave = actions.map((a) => ({ id: a.id, status: a.status }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [actions, isHydrated]);

  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      if (severityFilter !== "all" && action.severity !== severityFilter) return false;
      if (typeFilter !== "all" && action.type !== typeFilter) return false;
      return true;
    });
  }, [actions, severityFilter, typeFilter]);

  const activeActions = useMemo(() => filteredActions.filter((a) => a.status === "active"), [filteredActions]);
  const dismissedActions = useMemo(() => filteredActions.filter((a) => a.status !== "active"), [filteredActions]);

  const visibleActions = activeTab === "active" ? activeActions : dismissedActions;

  const handleAccept = useCallback((id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a)));
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: "dismissed" } : a)));
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#000000]">
        {/* Banner Skeleton */}
        <div className="w-full bg-[#0A0A0A] border-b border-white/10 px-4 py-2.5 flex justify-between items-center sm:px-6 lg:px-8">
          <div className="h-4 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Skeleton */}
          <div className="mb-10 flex justify-between">
            <div>
              <div className="h-8 w-32 animate-pulse rounded bg-white/10 mb-3" />
              <div className="h-5 w-96 animate-pulse rounded bg-white/10" />
            </div>
          </div>
          {/* Section Skeleton */}
          <div className="h-6 w-40 animate-pulse rounded bg-white/10 mb-2" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/10 mb-8" />
          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-[220px] animate-pulse rounded-xl bg-white/5 border border-white/5" />
            <div className="h-[220px] animate-pulse rounded-xl bg-white/5 border border-white/5" />
            <div className="h-[220px] animate-pulse rounded-xl bg-white/5 border border-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col font-sans selection:bg-[#F97316]/30">
      {/* Plan Banner */}
      <div className="w-full bg-[#000] border-b border-[#222] px-4 py-2 flex flex-wrap justify-between items-center gap-4 sm:px-6 lg:px-8">
        <p className="text-[13px] font-medium text-zinc-400">
          You&apos;re on the Explore plan — tracking 10 prompts with ChatGPT only.
        </p>
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="text-[13px] font-medium text-white transition-colors duration-150 hover:text-zinc-300 focus:outline-none"
        >
          View plans
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1 flex flex-col">
        {storageError && (
          <div className="mb-8 flex items-center justify-between rounded-lg bg-[#111] p-4 border border-[#333]">
            <p className="text-[13px] text-zinc-300 font-medium">
              Couldn&apos;t save your changes locally — they won&apos;t persist on reload.
            </p>
          </div>
        )}

        {/* Page Title & Filter Row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12 border-b border-[#222] pb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#EDEDED]">Actions</h1>
            <p className="mt-2 text-[15px] text-zinc-400">
              Prioritized recommendations to improve AI visibility.
            </p>
          </div>
          <div className="shrink-0">
            <FilterRow
              severity={severityFilter}
              type={typeFilter}
              onSeverityChange={setSeverityFilter}
              onTypeChange={setTypeFilter}
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-[#EDEDED] tracking-tight">AI Suggestions</h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              {activeActions.length} new recommendation{activeActions.length === 1 ? "" : "s"} detected.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-6 border-b border-[#222]" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`relative py-2 text-[14px] font-medium transition-colors duration-150 focus:outline-none ${
                activeTab === "active"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Active <span className="ml-1.5 rounded-full bg-[#111] px-2 py-0.5 text-[11px] text-zinc-400">{activeActions.length}</span>
              {activeTab === "active" && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dismissed")}
              className={`relative py-2 text-[14px] font-medium transition-colors duration-150 focus:outline-none ${
                activeTab === "dismissed"
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Dismissed <span className="ml-1.5 rounded-full bg-[#111] px-2 py-0.5 text-[11px] text-zinc-400">{dismissedActions.length}</span>
              {activeTab === "dismissed" && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-white" />
              )}
            </button>
          </nav>
        </div>

        {/* Card Grid / Empty States */}
        {visibleActions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {visibleActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onAccept={handleAccept}
                onDismiss={handleDismiss}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            {activeTab === "active" ? (
              (severityFilter !== "all" || typeFilter !== "all") && activeActions.length === 0 ? (
                <>
                  <p className="mb-4 text-[14px] font-medium text-zinc-400">No actions match your filters</p>
                  <button 
                    className="text-[13px] font-medium text-white transition-colors hover:text-zinc-300"
                    onClick={() => { setSeverityFilter("all"); setTypeFilter("all"); }}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <p className="text-[14px] font-medium text-zinc-400">All caught up. No active recommendations.</p>
              )
            ) : (
              <p className="text-[14px] font-medium text-zinc-400">No dismissed actions.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
