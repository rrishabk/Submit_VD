import React from "react";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className = "", title, description, actions, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={`flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-8 ${className}`}
        {...props}
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </header>
    );
  }
);
PageHeader.displayName = "PageHeader";
