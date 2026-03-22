import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { contentFadeVariants, scaleFadeVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

type ContentFadeVariant = "fade" | "scale";

interface ContentFadeProps {
  /** Content to show when not loading */
  children: React.ReactNode;
  /** Loading state */
  isLoading: boolean;
  /** Skeleton/placeholder to show while loading */
  skeleton: React.ReactNode;
  /** Animation variant */
  variant?: ContentFadeVariant;
  /** Container className */
  className?: string;
  /** Unique key for the content (helps AnimatePresence) */
  contentKey?: string;
}

/**
 * ContentFade - Smooth transition from skeleton to content
 *
 * Features:
 * - Animates the transition from loading skeleton to actual content
 * - Supports fade or scale animation variants
 * - Prevents layout shift during transition
 * - Respects reduced motion preferences
 *
 * Usage:
 * ```tsx
 * <ContentFade
 *   isLoading={isLoading}
 *   skeleton={<SkeletonGrid count={6} />}
 * >
 *   <RealContent />
 * </ContentFade>
 * ```
 */
export function ContentFade({
  children,
  isLoading,
  skeleton,
  variant = "fade",
  className,
  contentKey = "content",
}: ContentFadeProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = variant === "scale" ? scaleFadeVariants : contentFadeVariants;

  // For reduced motion, show content immediately without animation
  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {isLoading ? skeleton : children}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key={contentKey}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * FadeIn - Simple fade-in wrapper for any content
 *
 * Usage:
 * ```tsx
 * <FadeIn delay={0.2}>
 *   <MyComponent />
 * </FadeIn>
 * ```
 */
export function FadeIn({ children, className, delay = 0, duration = 0.3 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * FadeInWhenVisible - Fade in content when it enters the viewport
 *
 * Uses Intersection Observer for performance.
 *
 * Usage:
 * ```tsx
 * <FadeInWhenVisible>
 *   <ExpensiveComponent />
 * </FadeInWhenVisible>
 * ```
 */
export function FadeInWhenVisible({
  children,
  className,
  threshold = 0.1,
  triggerOnce = true,
}: FadeInWhenVisibleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion, threshold, triggerOnce]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ContentFade;
