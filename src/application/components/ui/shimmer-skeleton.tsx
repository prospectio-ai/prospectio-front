import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation style: shimmer (sweeping light) or pulse (opacity) */
  variant?: "shimmer" | "pulse";
  /** Border radius preset */
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

/**
 * ShimmerSkeleton - Enhanced skeleton loader with shimmer effect
 *
 * Features:
 * - Sweeping shimmer light effect (golden-tinted)
 * - Pulse fallback option
 * - Respects reduced motion (falls back to subtle pulse)
 * - Consistent with Prospectio's golden design system
 *
 * Usage:
 * ```tsx
 * <ShimmerSkeleton className="h-4 w-[200px]" />
 * <ShimmerSkeleton className="h-12 w-12" rounded="full" />
 * ```
 */
function ShimmerSkeleton({
  className,
  variant = "shimmer",
  rounded = "md",
  ...props
}: ShimmerSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  // Base styles
  const baseStyles = cn(
    "bg-muted overflow-hidden",
    roundedClasses[rounded],
    className
  );

  // For reduced motion, use simple CSS pulse
  if (prefersReducedMotion) {
    return (
      <div
        className={cn(baseStyles, "animate-pulse")}
        {...props}
      />
    );
  }

  // Pulse variant
  if (variant === "pulse") {
    return (
      <motion.div
        className={baseStyles}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 1.8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        {...props}
      />
    );
  }

  // Shimmer variant - sweeping golden light effect
  return (
    <div className={cn(baseStyles, "relative")} {...props}>
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(202, 168, 74, 0.08) 20%, rgba(202, 168, 74, 0.15) 50%, rgba(202, 168, 74, 0.08) 80%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration: 1.8,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </div>
  );
}

/**
 * Pre-built skeleton compositions for common use cases
 */

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

function SkeletonCard({ className, showImage = false, lines = 3 }: SkeletonCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      {showImage && (
        <ShimmerSkeleton className="h-40 w-full" rounded="lg" />
      )}
      <div className="flex items-center space-x-4">
        <ShimmerSkeleton className="h-12 w-12" rounded="full" />
        <div className="space-y-2 flex-1">
          <ShimmerSkeleton className="h-4 w-3/4" />
          <ShimmerSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <ShimmerSkeleton
            key={i}
            className="h-3"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonListItemProps {
  className?: string;
  showAvatar?: boolean;
}

function SkeletonListItem({ className, showAvatar = true }: SkeletonListItemProps) {
  return (
    <div className={cn("flex items-center space-x-4 p-4", className)}>
      {showAvatar && (
        <ShimmerSkeleton className="h-10 w-10" rounded="full" />
      )}
      <div className="space-y-2 flex-1">
        <ShimmerSkeleton className="h-4 w-1/3" />
        <ShimmerSkeleton className="h-3 w-2/3" />
      </div>
      <ShimmerSkeleton className="h-8 w-20" rounded="md" />
    </div>
  );
}

interface SkeletonGridProps {
  className?: string;
  count?: number;
  columns?: 1 | 2 | 3 | 4;
}

function SkeletonGrid({ className, count = 6, columns = 3 }: SkeletonGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export {
  ShimmerSkeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonGrid,
};
