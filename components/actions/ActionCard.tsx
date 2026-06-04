import React from "react";
import { MessageSquare, Mail, FileText, Check, X } from "lucide-react";
import type { Action, ActionType, Severity } from "@/lib/types";

interface ActionCardProps {
  action: Action;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
}

const TYPE_ICONS: Record<ActionType, React.ElementType> = {
  reddit: MessageSquare,
  outreach: Mail,
  content: FileText,
};

const TYPE_LABELS: Record<ActionType, string> = {
  reddit: "Reddit",
  outreach: "Outreach",
  content: "Content",
};

const SEVERITY_COLORS: Record<Severity, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-zinc-500",
};

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date("2026-06-03T00:00:00Z");
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) return "today";
  if (diffHours < 48) return "yesterday";
  return `${Math.floor(diffHours / 24)}d ago`;
}

export function ActionCard({ action, onAccept, onDismiss }: ActionCardProps) {
  const Icon = TYPE_ICONS[action.type];
  const typeLabel = TYPE_LABELS[action.type];
  const severityColor = SEVERITY_COLORS[action.severity];
  const severityLabel = action.severity.charAt(0).toUpperCase() + action.severity.slice(1);

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-[#222] bg-[#0A0A0A] p-5 min-h-[220px] transition-colors duration-150 hover:bg-[#111]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-400">{typeLabel}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <div className={`h-1.5 w-1.5 rounded-full ${severityColor}`} />
            {severityLabel}
          </div>
        </div>
        
        <div>
          {action.source_url ? (
            <a href={action.source_url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none rounded-sm">
              <h3 className="line-clamp-2 text-[15px] font-medium text-zinc-100 leading-snug transition-colors duration-150 group-hover:text-[#F97316]">
                {action.title}
              </h3>
            </a>
          ) : (
            <h3 className="line-clamp-2 text-[15px] font-medium text-zinc-100 leading-snug">{action.title}</h3>
          )}
          <p className="mt-2 line-clamp-3 text-[13px] text-zinc-500 leading-relaxed">
            {action.description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-[11px] text-zinc-600 font-medium tracking-wide uppercase">
          {formatRelativeDate(action.created_at)}
        </span>
        <div className="flex gap-2">
          {action.status === "active" ? (
            <>
              <button 
                type="button"
                onClick={() => onDismiss(action.id)}
                className="inline-flex items-center justify-center rounded-md border border-[#333] bg-transparent px-3 h-7 text-[13px] font-medium text-zinc-300 transition-colors duration-150 hover:bg-white/5 hover:text-white focus:outline-none"
              >
                Dismiss
              </button>
              <button 
                type="button"
                onClick={() => onAccept(action.id)}
                className="inline-flex items-center justify-center rounded-md bg-white px-3 h-7 text-[13px] font-medium text-black transition-colors duration-150 hover:bg-zinc-200 focus:outline-none"
              >
                Accept
              </button>
            </>
          ) : action.status === "accepted" ? (
            <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
              <Check className="h-3.5 w-3.5" /> Accepted
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500">
              <X className="h-3.5 w-3.5" /> Dismissed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
