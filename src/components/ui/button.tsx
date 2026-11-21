import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-800 via-green-700 to-yellow-600 text-white hover:brightness-110 btn-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-emerald-800/30 bg-white text-emerald-950 shadow-sm hover:bg-emerald-50",
        secondary: "bg-gradient-to-r from-amber-100 to-emerald-100 text-emerald-950 border border-amber-300 hover:brightness-105",
        ghost: "bg-white text-emerald-950 border border-emerald-900/10 hover:bg-emerald-50",
        link: "bg-emerald-50 text-emerald-900 underline-offset-4 hover:bg-emerald-100",
        premium: "bg-gradient-gold text-primary-foreground font-semibold btn-glow hover:scale-[1.02] active:scale-[0.98]",
        hero: "bg-gradient-gold text-primary-foreground font-semibold text-base px-8 py-6 btn-glow hover:scale-[1.02] active:scale-[0.98]",
        glass: "bg-white border border-emerald-900/20 text-emerald-950 hover:bg-emerald-50 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-lg px-10 text-base",
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
