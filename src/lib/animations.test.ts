import { describe, it, expect } from 'vitest';
import {
  transitions,
  pageVariants,
  pageVariantsReduced,
  staggerContainerVariants,
  staggerContainerFastVariants,
  staggerItemVariants,
  staggerItemVariantsReduced,
  cardHoverVariants,
  cardHoverSubtleVariants,
  buttonPressVariants,
  buttonGlowVariants,
  inputFocusVariants,
  sidebarVariants,
  sidebarContentVariants,
  navIndicatorVariants,
  shimmerVariants,
  pulseVariants,
  contentFadeVariants,
  scaleFadeVariants,
  slideInVariants,
  listItemVariants,
  spinVariants,
  getVariants,
} from './animations';

describe('transitions', () => {
  it('should export spring transition', () => {
    expect(transitions.spring).toBeDefined();
    expect(transitions.spring.type).toBe('spring');
    expect(transitions.spring.stiffness).toBe(300);
    expect(transitions.spring.damping).toBe(30);
  });

  it('should export springFast transition', () => {
    expect(transitions.springFast).toBeDefined();
    expect(transitions.springFast.stiffness).toBe(400);
  });

  it('should export springGentle transition', () => {
    expect(transitions.springGentle).toBeDefined();
    expect(transitions.springGentle.stiffness).toBe(200);
  });

  it('should export smooth transition', () => {
    expect(transitions.smooth).toBeDefined();
    expect(transitions.smooth.duration).toBe(0.3);
  });

  it('should export fast transition', () => {
    expect(transitions.fast).toBeDefined();
    expect(transitions.fast.duration).toBe(0.15);
  });

  it('should export slow transition', () => {
    expect(transitions.slow).toBeDefined();
    expect(transitions.slow.duration).toBe(0.5);
  });
});

describe('page transition variants', () => {
  it('should export pageVariants with initial, animate, exit states', () => {
    expect(pageVariants.initial).toBeDefined();
    expect(pageVariants.animate).toBeDefined();
    expect(pageVariants.exit).toBeDefined();
  });

  it('should have opacity 0 on initial', () => {
    const initial = pageVariants.initial as Record<string, unknown>;
    expect(initial.opacity).toBe(0);
    expect(initial.y).toBe(20);
  });

  it('should export pageVariantsReduced with minimal animation', () => {
    const initial = pageVariantsReduced.initial as Record<string, unknown>;
    expect(initial.opacity).toBe(0);
  });
});

describe('stagger variants', () => {
  it('should export staggerContainerVariants', () => {
    expect(staggerContainerVariants.initial).toBeDefined();
    expect(staggerContainerVariants.animate).toBeDefined();
  });

  it('should export staggerContainerFastVariants with faster stagger', () => {
    expect(staggerContainerFastVariants.animate).toBeDefined();
  });

  it('should export staggerItemVariants', () => {
    const initial = staggerItemVariants.initial as Record<string, unknown>;
    expect(initial.opacity).toBe(0);
    expect(initial.y).toBe(20);
  });

  it('should export staggerItemVariantsReduced', () => {
    const initial = staggerItemVariantsReduced.initial as Record<string, unknown>;
    expect(initial.opacity).toBe(0);
  });
});

describe('card hover variants', () => {
  it('should export cardHoverVariants with initial, hover, and tap states', () => {
    expect(cardHoverVariants.initial).toBeDefined();
    expect(cardHoverVariants.hover).toBeDefined();
    expect(cardHoverVariants.tap).toBeDefined();
  });

  it('should export cardHoverSubtleVariants', () => {
    expect(cardHoverSubtleVariants.initial).toBeDefined();
    expect(cardHoverSubtleVariants.hover).toBeDefined();
  });
});

describe('button variants', () => {
  it('should export buttonPressVariants', () => {
    expect(buttonPressVariants.initial).toBeDefined();
    expect(buttonPressVariants.hover).toBeDefined();
    expect(buttonPressVariants.tap).toBeDefined();
  });

  it('should export buttonGlowVariants', () => {
    expect(buttonGlowVariants.initial).toBeDefined();
    expect(buttonGlowVariants.hover).toBeDefined();
    expect(buttonGlowVariants.tap).toBeDefined();
  });
});

describe('input focus variants', () => {
  it('should export inputFocusVariants', () => {
    expect(inputFocusVariants.initial).toBeDefined();
    expect(inputFocusVariants.focus).toBeDefined();
  });
});

describe('sidebar variants', () => {
  it('should export sidebarVariants with expanded/collapsed', () => {
    const expanded = sidebarVariants.expanded as Record<string, unknown>;
    const collapsed = sidebarVariants.collapsed as Record<string, unknown>;
    expect(expanded.width).toBe(256);
    expect(collapsed.width).toBe(64);
  });

  it('should export sidebarContentVariants with visible/hidden', () => {
    expect(sidebarContentVariants.visible).toBeDefined();
    expect(sidebarContentVariants.hidden).toBeDefined();
  });

  it('should export navIndicatorVariants', () => {
    expect(navIndicatorVariants.initial).toBeDefined();
    expect(navIndicatorVariants.animate).toBeDefined();
  });
});

describe('skeleton/loading variants', () => {
  it('should export shimmerVariants', () => {
    expect(shimmerVariants.initial).toBeDefined();
    expect(shimmerVariants.animate).toBeDefined();
  });

  it('should export pulseVariants', () => {
    expect(pulseVariants.initial).toBeDefined();
    expect(pulseVariants.animate).toBeDefined();
  });
});

describe('content transition variants', () => {
  it('should export contentFadeVariants', () => {
    expect(contentFadeVariants.initial).toBeDefined();
    expect(contentFadeVariants.animate).toBeDefined();
    expect(contentFadeVariants.exit).toBeDefined();
  });

  it('should export scaleFadeVariants', () => {
    expect(scaleFadeVariants.initial).toBeDefined();
    expect(scaleFadeVariants.animate).toBeDefined();
    expect(scaleFadeVariants.exit).toBeDefined();
  });
});

describe('slide in variants', () => {
  it('should export slideInVariants with all four directions', () => {
    expect(slideInVariants.fromLeft).toBeDefined();
    expect(slideInVariants.fromRight).toBeDefined();
    expect(slideInVariants.fromTop).toBeDefined();
    expect(slideInVariants.fromBottom).toBeDefined();
  });

  it('should have proper initial states for each direction', () => {
    const fromLeft = slideInVariants.fromLeft.initial as Record<string, unknown>;
    expect(fromLeft.x).toBe(-20);

    const fromRight = slideInVariants.fromRight.initial as Record<string, unknown>;
    expect(fromRight.x).toBe(20);
  });
});

describe('utility variants', () => {
  it('should export listItemVariants', () => {
    expect(listItemVariants.initial).toBeDefined();
    expect(listItemVariants.animate).toBeDefined();
    expect(listItemVariants.exit).toBeDefined();
  });

  it('should export spinVariants', () => {
    expect(spinVariants.animate).toBeDefined();
  });
});

describe('getVariants', () => {
  const normalVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  const reducedVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  it('should return normal variants when prefers reduced motion is false', () => {
    expect(getVariants(false, normalVariants, reducedVariants)).toBe(normalVariants);
  });

  it('should return reduced variants when prefers reduced motion is true', () => {
    expect(getVariants(true, normalVariants, reducedVariants)).toBe(reducedVariants);
  });

  it('should return a default reduced variant when no reduced variant is provided', () => {
    const result = getVariants(true, normalVariants);
    expect(result).toBeDefined();
    const initial = result.initial as Record<string, unknown>;
    expect(initial.opacity).toBe(0);
    const animate = result.animate as Record<string, unknown>;
    expect(animate.opacity).toBe(1);
  });

  it('should return normal variants when prefers reduced motion is false and no reduced variant provided', () => {
    expect(getVariants(false, normalVariants)).toBe(normalVariants);
  });
});
