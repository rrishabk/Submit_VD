import React from "react";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className = "", title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between pb-4 ${className}`}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-medium tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";
