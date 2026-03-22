import type { Variants, Transition } from "framer-motion";

/**
 * Prospectio Animation Library
 *
 * A comprehensive collection of Framer Motion variants and utilities
 * designed for the Prospectio golden-themed design system.
 *
 * All animations respect prefers-reduced-motion via the useReducedMotion hook.
 */

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

export const transitions = {
  /** Smooth spring transition for natural feel */
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,

  /** Quick spring for snappy interactions */
  springFast: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  } as Transition,

  /** Gentle spring for subtle movements */
  springGentle: {
    type: "spring",
    stiffness: 200,
    damping: 35,
  } as Transition,

  /** Smooth ease for elegant transitions */
  smooth: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  /** Fast ease for quick feedback */
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  /** Slow ease for dramatic reveals */
  slow: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,
} as const;

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

/**
 * Page transition variants with fade and slide-up effect
 * Used for route-level animations
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Reduced motion page variants (instant transitions)
 */
export const pageVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

/**
 * Container that staggers its children's animations
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Fast stagger for quick sequences
 */
export const staggerContainerFastVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

/**
 * Items that animate when parent container triggers
 */
export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Reduced motion stagger items
 */
export const staggerItemVariantsReduced: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.01 } },
};

// ============================================================================
// CARD HOVER EFFECTS
// ============================================================================

/**
 * Card hover animation with lift and subtle scale
 * Includes golden glow shadow effect
 */
export const cardHoverVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 20px rgba(202, 168, 74, 0.2)",
    transition: transitions.spring,
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: transitions.fast,
  },
};

/**
 * Subtle card hover for less prominent elements
 */
export const cardHoverSubtleVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.01,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: transitions.smooth,
  },
};

// ============================================================================
// BUTTON ANIMATIONS
// ============================================================================

/**
 * Button press animation with scale feedback
 */
export const buttonPressVariants: Variants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.97,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

/**
 * Primary button with glow effect on hover
 */
export const buttonGlowVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0 0 0 rgba(202, 168, 74, 0)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 0 20px rgba(202, 168, 74, 0.4)",
    transition: transitions.smooth,
  },
  tap: {
    scale: 0.97,
    boxShadow: "0 0 10px rgba(202, 168, 74, 0.6)",
    transition: transitions.fast,
  },
};

// ============================================================================
// INPUT FOCUS ANIMATIONS
// ============================================================================

/**
 * Input focus animation with golden glow ring
 */
export const inputFocusVariants: Variants = {
  initial: {
    boxShadow: "0 0 0 0 rgba(202, 168, 74, 0)",
  },
  focus: {
    boxShadow: "0 0 0 3px rgba(202, 168, 74, 0.3)",
    transition: transitions.smooth,
  },
};

// ============================================================================
// SIDEBAR ANIMATIONS
// ============================================================================

/**
 * Sidebar collapse/expand animation
 */
export const sidebarVariants: Variants = {
  expanded: {
    width: 256, // w-64 = 16rem = 256px
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  collapsed: {
    width: 64, // w-16 = 4rem = 64px
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Sidebar content fade for text when collapsing
 */
export const sidebarContentVariants: Variants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
  hidden: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Navigation indicator animation (sliding background)
 */
export const navIndicatorVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
};

// ============================================================================
// SKELETON / LOADING ANIMATIONS
// ============================================================================

/**
 * Shimmer animation for skeleton loaders
 * Creates a sweeping light effect from left to right
 */
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/**
 * Pulse animation for skeleton (subtle opacity change)
 */
export const pulseVariants: Variants = {
  initial: {
    opacity: 0.4,
  },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    transition: {
      duration: 1.8,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// ============================================================================
// CONTENT TRANSITIONS
// ============================================================================

/**
 * Fade transition for content replacement (loading -> content)
 */
export const contentFadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

/**
 * Scale fade for modal-like content
 */
export const scaleFadeVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ============================================================================
// UTILITY ANIMATIONS
// ============================================================================

/**
 * Slide in from direction
 */
export const slideInVariants = {
  fromLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: transitions.smooth },
    exit: { x: -20, opacity: 0, transition: transitions.fast },
  } as Variants,
  fromRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: transitions.smooth },
    exit: { x: 20, opacity: 0, transition: transitions.fast },
  } as Variants,
  fromTop: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: transitions.smooth },
    exit: { y: -20, opacity: 0, transition: transitions.fast },
  } as Variants,
  fromBottom: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: transitions.smooth },
    exit: { y: 20, opacity: 0, transition: transitions.fast },
  } as Variants,
};

/**
 * List item variants for animated lists
 */
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -10,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: transitions.fast,
  },
};

/**
 * Icon spin animation (for loading states)
 */
export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// ============================================================================
// ACCESSIBILITY HELPER
// ============================================================================

/**
 * Returns reduced motion variants when user prefers reduced motion
 * Usage: const variants = getVariants(prefersReduced, normalVariants, reducedVariants)
 */
export function getVariants(
  prefersReducedMotion: boolean,
  normalVariants: Variants,
  reducedVariants?: Variants
): Variants {
  if (prefersReducedMotion) {
    return reducedVariants || {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    };
  }
  return normalVariants;
}
