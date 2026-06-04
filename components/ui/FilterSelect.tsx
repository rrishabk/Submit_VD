import React from "react";
import { ChevronDown } from "lucide-react";

export interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className = "", label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="flex items-center gap-2">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`h-9 appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
            {...props}
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    );
  }
);
FilterSelect.displayName = "FilterSelect";
