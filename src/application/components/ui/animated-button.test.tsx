import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnimatedButton } from './animated-button';

describe('AnimatedButton', () => {
  it('should render with children text', () => {
    render(<AnimatedButton>Click me</AnimatedButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render with variant outline', () => {
    render(<AnimatedButton variant="outline">Outline</AnimatedButton>);
    const button = screen.getByText('Outline');
    expect(button).toBeInTheDocument();
  });

  it('should render with glow animation style', () => {
    render(<AnimatedButton animationStyle="glow">Glow</AnimatedButton>);
    expect(screen.getByText('Glow')).toBeInTheDocument();
  });

  it('should render with none animation style', () => {
    render(<AnimatedButton animationStyle="none">No Anim</AnimatedButton>);
    expect(screen.getByText('No Anim')).toBeInTheDocument();
  });

  it('should render disabled state', () => {
    render(<AnimatedButton disabled>Disabled</AnimatedButton>);
    expect(screen.getByText('Disabled').closest('button')).toBeDisabled();
  });

  it('should render different sizes', () => {
    render(<AnimatedButton size="sm">Small</AnimatedButton>);
    expect(screen.getByText('Small')).toBeInTheDocument();
  });

  it('should render with asChild', () => {
    render(
      <AnimatedButton asChild>
        <a href="/test">Link Button</a>
      </AnimatedButton>
    );
    const link = screen.getByText('Link Button');
    expect(link.closest('a')).toHaveAttribute('href', '/test');
  });
});
