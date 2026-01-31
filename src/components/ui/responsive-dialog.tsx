import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

const ResponsiveDialog = DialogPrimitive.Root;

const ResponsiveDialogTrigger = DialogPrimitive.Trigger;

const ResponsiveDialogPortal = DialogPrimitive.Portal;

const ResponsiveDialogClose = DialogPrimitive.Close;

const ResponsiveDialogOverlay = React.forwardRef<
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
ResponsiveDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface ResponsiveDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  variant?: "default" | "premium" | "destructive" | "success";
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-[95vw] md:max-w-4xl",
};

const ResponsiveDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResponsiveDialogContentProps
>(({ className, children, variant = "default", size = "lg", ...props }, ref) => {
  const gradientClasses = {
    default: "before:from-primary/20 before:via-primary/5 before:to-transparent",
    premium: "before:from-primary/30 before:via-accent/10 before:to-transparent",
    destructive: "before:from-destructive/20 before:via-destructive/5 before:to-transparent",
    success: "before:from-success/20 before:via-success/5 before:to-transparent",
  };

  return (
    <ResponsiveDialogPortal>
      <ResponsiveDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-[95vw] translate-x-[-50%] translate-y-[-50%] gap-0 border bg-card shadow-2xl duration-300",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "rounded-xl sm:rounded-xl overflow-hidden",
          // Max height for scroll
          "max-h-[90vh] sm:max-h-[85vh]",
          // Top gradient overlay
          "before:absolute before:inset-x-0 before:top-0 before:h-32 before:bg-gradient-to-b before:pointer-events-none before:z-0",
          gradientClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        <div className="relative z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
          {children}
        </div>
        <DialogPrimitive.Close className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-20">
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ResponsiveDialogPortal>
  );
});
ResponsiveDialogContent.displayName = DialogPrimitive.Content.displayName;

interface ResponsiveDialogHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

const ResponsiveDialogHeader = ({ className, children }: ResponsiveDialogHeaderProps) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.3 }}
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left p-4 sm:p-6 pb-2 sm:pb-4 shrink-0", className)} 
  >
    {children}
  </motion.div>
);
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

interface ResponsiveDialogBodyProps {
  className?: string;
  children?: React.ReactNode;
}

const ResponsiveDialogBody = ({ className, children }: ResponsiveDialogBodyProps) => (
  <ScrollArea className={cn("flex-1 px-4 sm:px-6 overflow-y-auto", className)}>
    <div className="pb-4">
      {children}
    </div>
  </ScrollArea>
);
ResponsiveDialogBody.displayName = "ResponsiveDialogBody";

interface ResponsiveDialogFooterProps {
  className?: string;
  children?: React.ReactNode;
}

const ResponsiveDialogFooter = ({ className, children }: ResponsiveDialogFooterProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2, duration: 0.3 }}
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-2 p-4 sm:p-6 pt-2 sm:pt-4 border-t border-border/50 shrink-0", className)} 
  >
    {children}
  </motion.div>
);
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-base sm:text-lg font-semibold leading-none tracking-tight font-display", className)}
    {...props}
  />
));
ResponsiveDialogTitle.displayName = DialogPrimitive.Title.displayName;

const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn("text-sm text-muted-foreground", className)} 
    {...props} 
  />
));
ResponsiveDialogDescription.displayName = DialogPrimitive.Description.displayName;

// Animated content sections for staggered animations
interface ResponsiveDialogSectionProps {
  className?: string;
  delay?: number;
  children?: React.ReactNode;
}

const ResponsiveDialogSection = ({ 
  className, 
  delay = 0.15,
  children
}: ResponsiveDialogSectionProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3, ease: "easeOut" }}
    className={cn("", className)} 
  >
    {children}
  </motion.div>
);
ResponsiveDialogSection.displayName = "ResponsiveDialogSection";

// Fullscreen Image Viewer
interface FullscreenImageProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

const FullscreenImage = ({ src, alt = "Image", isOpen, onClose }: FullscreenImageProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);
FullscreenImage.displayName = "FullscreenImage";

export {
  ResponsiveDialog,
  ResponsiveDialogPortal,
  ResponsiveDialogOverlay,
  ResponsiveDialogClose,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogBody,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogSection,
  FullscreenImage,
};
