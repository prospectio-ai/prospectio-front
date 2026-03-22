import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
  AnimatedCardFooter,
} from './animated-card';

describe('AnimatedCard', () => {
  it('should render children', () => {
    render(<AnimatedCard>Card content</AnimatedCard>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render with disableHover', () => {
    render(<AnimatedCard disableHover>No hover card</AnimatedCard>);
    expect(screen.getByText('No hover card')).toBeInTheDocument();
  });

  it('should render with subtle variant', () => {
    render(<AnimatedCard variant="subtle">Subtle card</AnimatedCard>);
    expect(screen.getByText('Subtle card')).toBeInTheDocument();
  });

  it('should apply className', () => {
    const { container } = render(<AnimatedCard className="custom-card">Content</AnimatedCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('custom-card');
  });
});

describe('AnimatedCardHeader', () => {
  it('should render children', () => {
    render(<AnimatedCardHeader>Header content</AnimatedCardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });
});

describe('AnimatedCardTitle', () => {
  it('should render as h3', () => {
    render(<AnimatedCardTitle>Title</AnimatedCardTitle>);
    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H3');
  });
});

describe('AnimatedCardDescription', () => {
  it('should render as p', () => {
    render(<AnimatedCardDescription>Description</AnimatedCardDescription>);
    const desc = screen.getByText('Description');
    expect(desc.tagName).toBe('P');
  });
});

describe('AnimatedCardContent', () => {
  it('should render children', () => {
    render(<AnimatedCardContent>Body content</AnimatedCardContent>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('AnimatedCardFooter', () => {
  it('should render children', () => {
    render(<AnimatedCardFooter>Footer content</AnimatedCardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
