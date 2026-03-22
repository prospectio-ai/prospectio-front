import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { pageVariants, pageVariantsReduced, getVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * AnimatedPage - Page transition wrapper component
 *
 * Wraps page content with smooth fade-in and slide-up animation.
 * Automatically respects user's prefers-reduced-motion setting.
 *
 * Usage:
 * ```tsx
 * <AnimatedPage>
 *   <YourPageContent />
 * </AnimatedPage>
 * ```
 */
export function AnimatedPage({ children, className }: Readonly<AnimatedPageProps>) {
  const prefersReducedMotion = useReducedMotion();
  const variants = getVariants(
    prefersReducedMotion ?? false,
    pageVariants,
    pageVariantsReduced
  );

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPage;
