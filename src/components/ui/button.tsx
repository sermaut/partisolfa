import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#167f79] text-white border border-[#167f79] shadow-sm hover:bg-[#126c68] hover:border-[#126c68] btn-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-[#2b8f88]/40 bg-white text-[#153b49] shadow-sm hover:bg-[#eaf8f5] hover:border-[#2b8f88]",
        secondary: "bg-[#e3f5ef] text-[#17444b] border border-[#b7ded4] hover:bg-[#d2eee5]",
        ghost: "bg-transparent text-[#17444b] border border-transparent hover:bg-[#e8f5f2]",
        link: "bg-transparent text-[#167f79] underline-offset-4 hover:bg-[#e8f5f2]",
        premium: "bg-gradient-to-r from-[#167f79] to-[#54cda9] text-[#083b40] font-semibold border border-[#b9f4df] btn-glow hover:brightness-105 active:scale-[0.98]",
        hero: "bg-gradient-to-r from-[#167f79] to-[#54cda9] text-white font-semibold text-base px-8 py-6 border border-[#b9f4df] btn-glow hover:brightness-105 active:scale-[0.98]",
        glass: "bg-[#17384b] border border-[#4a9d9a] text-white hover:bg-[#204b5d] shadow-sm",
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
