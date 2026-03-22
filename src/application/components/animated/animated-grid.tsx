import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import {
  staggerContainerVariants,
  staggerContainerFastVariants,
  staggerItemVariants,
  staggerItemVariantsReduced,
  getVariants,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

type StaggerSpeed = "normal" | "fast";

interface AnimatedGridProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  /** Stagger animation speed */
  speed?: StaggerSpeed;
  /** Grid columns configuration */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between items */
  gap?: "sm" | "md" | "lg";
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const gapClasses = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

/**
 * AnimatedGrid - Grid container with staggered children animation
 *
 * Features:
 * - Automatic stagger animation for child items
 * - Configurable columns and gap
 * - Normal or fast stagger speed
 * - Respects reduced motion preferences
 *
 * Usage:
 * ```tsx
 * <AnimatedGrid columns={3}>
 *   <AnimatedGridItem>Card 1</AnimatedGridItem>
 *   <AnimatedGridItem>Card 2</AnimatedGridItem>
 *   <AnimatedGridItem>Card 3</AnimatedGridItem>
 * </AnimatedGrid>
 * ```
 */
const AnimatedGrid = React.forwardRef<HTMLDivElement, AnimatedGridProps>(
  ({ className, speed = "normal", columns = 3, gap = "md", children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    const containerVariants =
      speed === "fast" ? staggerContainerFastVariants : staggerContainerVariants;

    if (prefersReducedMotion) {
      return (
        <div
          ref={ref}
          className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
        >
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        variants={containerVariants}
        className={cn("grid", columnClasses[columns], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedGrid.displayName = "AnimatedGrid";

interface AnimatedGridItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  /** Custom animation delay (overrides stagger) */
  delay?: number;
}

/**
 * AnimatedGridItem - Item wrapper for staggered grid animation
 *
 * Use as direct children of AnimatedGrid for automatic stagger effect.
 */
const AnimatedGridItem = React.forwardRef<HTMLDivElement, AnimatedGridItemProps>(
  ({ className, delay, children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const variants = getVariants(
      prefersReducedMotion ?? false,
      staggerItemVariants,
      staggerItemVariantsReduced
    );

    if (prefersReducedMotion) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={variants}
        custom={delay}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedGridItem.displayName = "AnimatedGridItem";

/**
 * AnimatedList - Vertical list container with staggered animation
 *
 * Similar to AnimatedGrid but for vertical lists.
 */
interface AnimatedListProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  speed?: StaggerSpeed;
  gap?: "sm" | "md" | "lg";
}

const listGapClasses = {
  sm: "space-y-2",
  md: "space-y-4",
  lg: "space-y-6",
};

const AnimatedList = React.forwardRef<HTMLDivElement, AnimatedListProps>(
  ({ className, speed = "normal", gap = "md", children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();

    const containerVariants =
      speed === "fast" ? staggerContainerFastVariants : staggerContainerVariants;

    if (prefersReducedMotion) {
      return (
        <div ref={ref} className={cn(listGapClasses[gap], className)}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        variants={containerVariants}
        className={cn(listGapClasses[gap], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";

export { AnimatedGrid, AnimatedGridItem, AnimatedList };
