import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#142c46] text-white border border-[#142c46] shadow-sm hover:bg-[#203f5e] hover:border-[#203f5e] active:scale-[0.98]",
        destructive: "bg-rose-600 text-white border border-rose-700 shadow-sm hover:bg-rose-700 active:scale-[0.98]",
        outline: "border border-[#142c46] bg-white text-[#142c46] shadow-sm hover:bg-[#f3f5f7] hover:border-[#98733a] active:scale-[0.98]",
        secondary: "bg-[#f3f5f7] text-[#142c46] border border-[#d9dfe6] shadow-sm hover:bg-[#e9edf2] active:scale-[0.98]",
        ghost: "bg-transparent text-[#142c46] border border-transparent hover:bg-[#f3f5f7]",
        link: "bg-transparent text-[#142c46] underline-offset-4 hover:underline",
        premium: "bg-[#98733a] text-white border border-[#876331] font-semibold shadow-md hover:bg-[#876331] hover:shadow-lg active:scale-[0.98]",
        hero: "bg-[#142c46] text-white border border-[#142c46] font-semibold text-base px-8 py-6 shadow-lg hover:bg-[#203f5e] hover:shadow-xl active:scale-[0.98]",
        glass: "bg-white border border-[#d9dfe6] text-[#142c46] hover:bg-[#f3f5f7] shadow-sm",
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
