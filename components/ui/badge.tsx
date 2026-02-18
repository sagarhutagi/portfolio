import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-[10px] font-medium transition-colors duration-75 border",
  {
    variants: {
      variant: {
        default: "border-[var(--accent-color)]/40 text-[var(--accent-color)] bg-[var(--accent-color)]/5",
        secondary: "border-border text-muted-foreground",
        outline: "text-foreground border-border",
        destructive: "border-destructive text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
