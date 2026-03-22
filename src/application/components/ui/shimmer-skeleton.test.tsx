import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShimmerSkeleton, SkeletonCard, SkeletonListItem, SkeletonGrid } from './shimmer-skeleton';

describe('ShimmerSkeleton', () => {
  it('should render a skeleton element', () => {
    const { container } = render(<ShimmerSkeleton data-testid="skeleton" />);
    expect(container.firstChild).toBeDefined();
  });

  it('should apply className', () => {
    const { container } = render(<ShimmerSkeleton className="h-4 w-full" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('w-full');
  });

  it('should apply rounded classes', () => {
    const { container } = render(<ShimmerSkeleton rounded="full" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-full');
  });

  it('should apply default rounded-md', () => {
    const { container } = render(<ShimmerSkeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('rounded-md');
  });
});

describe('SkeletonCard', () => {
  it('should render a skeleton card with lines', () => {
    const { container } = render(<SkeletonCard lines={3} />);
    expect(container.firstChild).toBeDefined();
  });

  it('should render with image placeholder when showImage is true', () => {
    const { container } = render(<SkeletonCard showImage lines={2} />);
    // Should have more children when showImage is true
    expect(container.firstChild?.childNodes.length).toBeGreaterThan(1);
  });

  it('should apply custom className', () => {
    const { container } = render(<SkeletonCard className="custom" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom');
  });
});

describe('SkeletonListItem', () => {
  it('should render a list item skeleton', () => {
    const { container } = render(<SkeletonListItem />);
    expect(container.firstChild).toBeDefined();
  });

  it('should render without avatar when showAvatar is false', () => {
    const { container: withAvatar } = render(<SkeletonListItem showAvatar />);
    const { container: withoutAvatar } = render(<SkeletonListItem showAvatar={false} />);
    // Without avatar should have fewer child nodes
    expect(withoutAvatar.firstChild?.childNodes.length).toBeLessThan(
      withAvatar.firstChild?.childNodes.length || 0
    );
  });
});

describe('SkeletonGrid', () => {
  it('should render the correct number of skeleton cards', () => {
    const { container } = render(<SkeletonGrid count={4} columns={2} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.childNodes).toHaveLength(4);
  });

  it('should default to 6 items', () => {
    const { container } = render(<SkeletonGrid />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.childNodes).toHaveLength(6);
  });
});
