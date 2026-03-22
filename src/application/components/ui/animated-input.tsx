import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedInputProps extends React.ComponentProps<"input"> {
  /** Show focus glow animation */
  showFocusGlow?: boolean;
  /** Container className */
  containerClassName?: string;
}

/**
 * AnimatedInput - Input component with focus glow effect
 *
 * Features:
 * - Golden glow ring animation on focus
 * - Smooth transition between states
 * - Respects reduced motion preferences
 * - Compatible with react-hook-form
 */
const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, containerClassName, type, showFocusGlow = true, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const [isFocused, setIsFocused] = React.useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    if (prefersReducedMotion || !showFocusGlow) {
      return (
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div className={cn("relative", containerClassName)}>
        {/* Glow effect layer */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-md pointer-events-none"
              style={{
                boxShadow: "0 0 0 3px rgba(202, 168, 74, 0.3), 0 0 20px rgba(202, 168, 74, 0.15)",
              }}
            />
          )}
        </AnimatePresence>

        <input
          type={type}
          className={cn(
            "relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
