import React from "react";
import type { ActionType, Severity } from "@/lib/types";
import { ChevronDown } from "lucide-react";

export type FilterSeverity = Severity | "all";
export type FilterType = ActionType | "all";

interface FilterRowProps {
  severity: FilterSeverity;
  type: FilterType;
  onSeverityChange: (s: FilterSeverity) => void;
  onTypeChange: (t: FilterType) => void;
}

export function FilterRow({
  severity,
  type,
  onSeverityChange,
  onTypeChange,
}: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2.5">
        <label htmlFor="severity-filter" className="text-[13px] font-medium text-zinc-500">
          Severity
        </label>
        <div className="relative">
          <select
            id="severity-filter"
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value as FilterSeverity)}
            className="h-8 appearance-none rounded border border-[#333] bg-transparent pl-2.5 pr-7 text-[13px] font-medium text-zinc-300 transition-colors duration-150 hover:bg-[#111] hover:text-white focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <label htmlFor="type-filter" className="text-[13px] font-medium text-zinc-500">
          Type
        </label>
        <div className="relative">
          <select
            id="type-filter"
            value={type}
            onChange={(e) => onTypeChange(e.target.value as FilterType)}
            className="h-8 appearance-none rounded border border-[#333] bg-transparent pl-2.5 pr-7 text-[13px] font-medium text-zinc-300 transition-colors duration-150 hover:bg-[#111] hover:text-white focus:outline-none focus:border-zinc-500 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="reddit">Reddit</option>
            <option value="outreach">Outreach</option>
            <option value="content">Content</option>
          </select>
          <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
