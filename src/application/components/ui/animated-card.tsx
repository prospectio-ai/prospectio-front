import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cardHoverVariants, cardHoverSubtleVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

type AnimatedCardVariant = "default" | "subtle";

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  variant?: AnimatedCardVariant;
  disableHover?: boolean;
}

/**
 * AnimatedCard - Card component with hover lift and glow effect
 *
 * Features:
 * - Smooth lift animation on hover
 * - Scale effect with golden glow shadow
 * - Tap/click feedback
 * - Respects reduced motion preferences
 *
 * Variants:
 * - "default": Full hover effect with lift and glow
 * - "subtle": Lighter hover effect for secondary elements
 */
const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = "default", disableHover = false, children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    const variants = variant === "subtle" ? cardHoverSubtleVariants : cardHoverVariants;

    if (prefersReducedMotion || disableHover) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg",
            className
          )}
        >
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={variants}
        className={cn(
          "rounded-lg border bg-card text-card-foreground cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

// Sub-components matching shadcn/ui Card structure
const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
AnimatedCardHeader.displayName = "AnimatedCardHeader";

const AnimatedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
AnimatedCardTitle.displayName = "AnimatedCardTitle";

const AnimatedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AnimatedCardDescription.displayName = "AnimatedCardDescription";

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
AnimatedCardContent.displayName = "AnimatedCardContent";

const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
AnimatedCardFooter.displayName = "AnimatedCardFooter";

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardFooter,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
};
