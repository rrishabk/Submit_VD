import React from "react";
import { LucideIcon } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className = "", icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-8 text-center ${className}`}
        {...props}
      >
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background-subtle">
            <Icon className="h-6 w-6 text-muted" />
          </div>
        )}
        <h3 className="mb-1 text-sm font-medium text-foreground tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="mb-6 max-w-sm text-sm text-muted leading-relaxed">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
