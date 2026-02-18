import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent-color)]/60 text-[var(--accent-color)] bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20",
        destructive:
          "border-destructive text-destructive hover:bg-destructive/10",
        outline:
          "border-border bg-background hover:border-[var(--accent-color)]/40 hover:text-[var(--accent-color)]",
        secondary:
          "border-border text-foreground hover:border-[var(--accent-color)]/40 hover:text-[var(--accent-color)]",
        ghost:
          "border-transparent hover:border-border hover:text-foreground",
        link: "border-transparent text-[var(--accent-color)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-4 py-1.5",
        sm: "h-7 px-3 text-[10px]",
        lg: "h-9 px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-interactive
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
