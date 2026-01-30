import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const AnimatedDialog = DialogPrimitive.Root;

const AnimatedDialogTrigger = DialogPrimitive.Trigger;

const AnimatedDialogPortal = DialogPrimitive.Portal;

const AnimatedDialogClose = DialogPrimitive.Close;

const AnimatedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
AnimatedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface AnimatedDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: "default" | "premium" | "destructive" | "success";
}

const AnimatedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  AnimatedDialogContentProps
>(({ className, children, variant = "default", ...props }, ref) => {
  const gradientClasses = {
    default: "before:from-primary/20 before:via-primary/5 before:to-transparent",
    premium: "before:from-primary/30 before:via-accent/10 before:to-transparent",
    destructive: "before:from-destructive/20 before:via-destructive/5 before:to-transparent",
    success: "before:from-success/20 before:via-success/5 before:to-transparent",
  };

  return (
    <AnimatedDialogPortal>
      <AnimatedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-hidden",
          // Top gradient overlay
          "before:absolute before:inset-x-0 before:top-0 before:h-32 before:bg-gradient-to-b before:pointer-events-none before:z-0",
          gradientClasses[variant],
          className,
        )}
        {...props}
      >
        <div className="relative z-10">
          {children}
        </div>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-20">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </AnimatedDialogPortal>
  );
});
AnimatedDialogContent.displayName = DialogPrimitive.Content.displayName;

interface AnimatedDialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

const AnimatedDialogHeader = ({ className, children }: AnimatedDialogHeaderProps) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.3 }}
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} 
  >
    {children}
  </motion.div>
);
AnimatedDialogHeader.displayName = "AnimatedDialogHeader";

interface AnimatedDialogFooterProps {
  className?: string;
  children?: React.ReactNode;
}

const AnimatedDialogFooter = ({ className, children }: AnimatedDialogFooterProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.3 }}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4", className)} 
  >
    {children}
  </motion.div>
);
AnimatedDialogFooter.displayName = "AnimatedDialogFooter";

const AnimatedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight font-display", className)}
    {...props}
  />
));
AnimatedDialogTitle.displayName = DialogPrimitive.Title.displayName;

const AnimatedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn("text-sm text-muted-foreground", className)} 
    {...props} 
  />
));
AnimatedDialogDescription.displayName = DialogPrimitive.Description.displayName;

// Animated content sections for staggered animations
interface AnimatedDialogSectionProps {
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}

const AnimatedDialogSection = ({ 
  className, 
  delay = 0.15,
  children
}: AnimatedDialogSectionProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3, ease: "easeOut" }}
    className={cn("", className)} 
  >
    {children}
  </motion.div>
);
AnimatedDialogSection.displayName = "AnimatedDialogSection";

export {
  AnimatedDialog,
  AnimatedDialogPortal,
  AnimatedDialogOverlay,
  AnimatedDialogClose,
  AnimatedDialogTrigger,
  AnimatedDialogContent,
  AnimatedDialogHeader,
  AnimatedDialogFooter,
  AnimatedDialogTitle,
  AnimatedDialogDescription,
  AnimatedDialogSection,
};
