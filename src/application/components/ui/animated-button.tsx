import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { buttonPressVariants, buttonGlowVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type AnimationStyle = "press" | "glow" | "none";

export interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<"button">, "variants">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animationStyle?: AnimationStyle;
}

/**
 * AnimatedButton - Button with press/glow animation effects
 *
 * Features:
 * - Scale down on press (0.97x)
 * - Optional golden glow effect for primary actions
 * - Smooth hover scale effect
 * - Respects reduced motion preferences
 *
 * Animation styles:
 * - "press": Default scale effect on hover/tap
 * - "glow": Adds golden glow shadow on hover (best for primary buttons)
 * - "none": No animation (uses CSS transitions only)
 */
const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      animationStyle = "press",
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    // For asChild, we can't use motion components directly
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...(props as React.ComponentProps<typeof Slot>)}
        />
      );
    }

    // Use CSS-only transitions for reduced motion or no animation
    if (prefersReducedMotion || animationStyle === "none") {
      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        />
      );
    }

    const animationVariants =
      animationStyle === "glow" ? buttonGlowVariants : buttonPressVariants;

    return (
      <motion.button
        ref={ref}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        variants={animationVariants}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, buttonVariants };
