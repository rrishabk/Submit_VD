import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "accent" | "outline" | "secondary";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2";

    const variants = {
      default: "border border-transparent bg-background-subtle text-foreground hover:bg-border",
      accent: "border border-transparent bg-accent-subtle text-accent hover:bg-accent/20",
      outline: "border border-border text-foreground",
      secondary: "border border-transparent bg-foreground text-background hover:bg-foreground/80",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
