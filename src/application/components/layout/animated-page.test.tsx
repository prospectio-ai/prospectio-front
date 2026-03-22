import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedPage } from './animated-page';

describe('AnimatedPage', () => {
  it('should render children', () => {
    render(
      <AnimatedPage>
        <div>Page content</div>
      </AnimatedPage>
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('should apply className', () => {
    const { container } = render(
      <AnimatedPage className="custom-class">
        <div>Content</div>
      </AnimatedPage>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-class');
    expect(wrapper.className).toContain('h-full');
  });
});
