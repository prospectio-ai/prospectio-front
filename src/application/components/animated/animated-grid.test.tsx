import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedGrid, AnimatedGridItem, AnimatedList } from './animated-grid';

describe('AnimatedGrid', () => {
  it('should render children', () => {
    render(
      <AnimatedGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </AnimatedGrid>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AnimatedGrid className="custom-grid">
        <div>Item</div>
      </AnimatedGrid>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('custom-grid');
  });

  it('should render with different column configurations', () => {
    const { container } = render(
      <AnimatedGrid columns={2}>
        <div>Item</div>
      </AnimatedGrid>
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid');
  });
});

describe('AnimatedGridItem', () => {
  it('should render children', () => {
    render(
      <AnimatedGridItem>
        <div>Grid item content</div>
      </AnimatedGridItem>
    );
    expect(screen.getByText('Grid item content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AnimatedGridItem className="item-class">
        <div>Content</div>
      </AnimatedGridItem>
    );
    const item = container.firstChild as HTMLElement;
    expect(item.className).toContain('item-class');
  });
});

describe('AnimatedList', () => {
  it('should render children', () => {
    render(
      <AnimatedList>
        <div>List item 1</div>
        <div>List item 2</div>
      </AnimatedList>
    );
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('List item 2')).toBeInTheDocument();
  });

  it('should apply gap classes', () => {
    const { container } = render(
      <AnimatedList gap="lg">
        <div>Item</div>
      </AnimatedList>
    );
    const list = container.firstChild as HTMLElement;
    expect(list.className).toContain('space-y-6');
  });
});
