import React from "react";

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className = "", title, value, description, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col gap-1 rounded-xl border border-border bg-background p-6 shadow-sm ${className}`}
        {...props}
      >
        <span className="text-sm font-medium text-muted tracking-tight">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {trend === "up" && <span className="text-sm font-medium text-green-600">↑</span>}
          {trend === "down" && <span className="text-sm font-medium text-red-600">↓</span>}
        </div>
        {description && (
          <span className="text-xs text-muted mt-1">{description}</span>
        )}
      </div>
    );
  }
);
Stat.displayName = "Stat";
