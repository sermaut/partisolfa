import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#1c9189] text-white border border-[#167a73] shadow-md hover:bg-[#167a73] hover:shadow-lg active:scale-[0.98]",
        destructive: "bg-rose-600 text-white border border-rose-700 shadow-sm hover:bg-rose-700 active:scale-[0.98]",
        outline: "border-2 border-[#1c9189] bg-white text-[#17364d] shadow-sm hover:bg-[#e9f7f4] active:scale-[0.98]",
        secondary: "bg-[#e9f7f4] text-[#17364d] border border-[#c9e4dc] shadow-sm hover:bg-[#d8f1e9] active:scale-[0.98]",
        ghost: "bg-transparent text-[#17364d] border border-transparent hover:bg-[#e9f7f4]",
        link: "bg-transparent text-[#168b80] underline-offset-4 hover:underline",
        premium: "bg-[#20c978] text-[#103b32] border border-[#16a960] font-bold shadow-md hover:bg-[#19b96b] hover:shadow-lg active:scale-[0.98]",
        success: "bg-emerald-600 text-white border border-emerald-700 shadow-sm hover:bg-emerald-700 active:scale-[0.98]",
        warning: "bg-amber-500 text-slate-950 border border-amber-600 shadow-sm hover:bg-amber-600 active:scale-[0.98]",
        info: "bg-sky-600 text-white border border-sky-700 shadow-sm hover:bg-sky-700 active:scale-[0.98]",
        finance: "bg-violet-600 text-white border border-violet-700 shadow-sm hover:bg-violet-700 active:scale-[0.98]",
        hero: "bg-[#1c9189] text-white border border-[#167a73] font-bold text-base px-8 py-6 shadow-lg hover:bg-[#167a73] hover:shadow-xl active:scale-[0.98]",
        glass: "bg-white border border-[#c9ded9] text-[#17364d] hover:bg-[#e9f7f4] shadow-sm",
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
