import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive: "border border-destructive bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-primary bg-secondary text-secondary-foreground shadow-sm hover:bg-primary/10 hover:border-primary",
        secondary: "border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "border border-border bg-card text-foreground hover:bg-muted",
        link: "border border-transparent bg-primary/10 text-primary underline-offset-4 hover:bg-primary/15",
        premium: "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 hover:shadow-md",
        hero: "bg-primary text-primary-foreground font-semibold text-base px-8 py-6 shadow-md hover:bg-primary/90 hover:shadow-lg",
        glass: "border border-primary bg-secondary text-secondary-foreground shadow-sm hover:bg-primary/10",
        success: "border border-success bg-success text-success-foreground shadow-sm hover:bg-success/90",
        warning: "border border-warning bg-warning text-warning-foreground shadow-sm hover:bg-warning/90",
        report: "border border-report bg-report text-report-foreground shadow-sm hover:bg-report/90",
        info: "border border-info bg-info text-info-foreground shadow-sm hover:bg-info/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
