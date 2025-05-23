import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset status-change",
  {
    variants: {
      variant: {
        default: "bg-background/80 text-foreground ring-border",
        primary: "bg-primary/10 text-primary ring-primary/20",
        secondary: "bg-secondary/10 text-secondary ring-secondary/20",
        accent: "bg-accent/10 text-accent ring-accent/20",
        destructive: "bg-destructive/10 text-destructive ring-destructive/20",
        success: "bg-secondary/10 text-secondary ring-secondary/20",
        warning: "bg-accent/10 text-accent ring-accent/20",
        error: "bg-destructive/10 text-destructive ring-destructive/20",
        outline: "text-foreground",
      },
      size: {
        default: "text-xs",
        sm: "text-xs",
        lg: "text-sm",
      },
      withDot: {
        true: "pl-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  /**
   * Whether to show a status dot
   */
  withDot?: boolean;
  /**
   * Whether to pulse the status dot
   */
  pulseDot?: boolean;
}

/**
 * StatusBadge component for displaying status with smooth color transitions
 */
function StatusBadge({
  className,
  variant,
  size,
  withDot = false,
  pulseDot = false,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ variant, size, withDot, className }))}
      {...props}
    >
      {withDot && (
        <div
          className={cn(
            "mr-1 h-1.5 w-1.5 rounded-full",
            {
              "bg-foreground/70": variant === "default",
              "bg-primary": variant === "primary",
              "bg-secondary": variant === "secondary" || variant === "success",
              "bg-accent": variant === "accent" || variant === "warning",
              "bg-destructive": variant === "destructive" || variant === "error",
            },
            pulseDot && "animate-pulse-subtle"
          )}
        />
      )}
      {children}
    </div>
  );
}

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
