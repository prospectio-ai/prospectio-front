import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentFade, FadeIn, FadeInWhenVisible } from './content-fade';

describe('ContentFade', () => {
  it('should render skeleton when loading', () => {
    render(
      <ContentFade
        isLoading={true}
        skeleton={<div>Loading...</div>}
      >
        <div>Content</div>
      </ContentFade>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('should render children when not loading', () => {
    render(
      <ContentFade
        isLoading={false}
        skeleton={<div>Loading...</div>}
      >
        <div>Content</div>
      </ContentFade>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should apply className', () => {
    const { container } = render(
      <ContentFade
        isLoading={false}
        skeleton={<div>Loading</div>}
        className="custom-fade"
      >
        <div>Content</div>
      </ContentFade>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-fade');
  });
});

describe('FadeIn', () => {
  it('should render children', () => {
    render(
      <FadeIn>
        <div>Fade in content</div>
      </FadeIn>
    );
    expect(screen.getByText('Fade in content')).toBeInTheDocument();
  });

  it('should apply className', () => {
    const { container } = render(
      <FadeIn className="fade-class">
        <div>Content</div>
      </FadeIn>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('fade-class');
  });
});

describe('FadeInWhenVisible', () => {
  it('should render children', () => {
    render(
      <FadeInWhenVisible>
        <div>Visible content</div>
      </FadeInWhenVisible>
    );
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('should apply className', () => {
    const { container } = render(
      <FadeInWhenVisible className="visible-class">
        <div>Content</div>
      </FadeInWhenVisible>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('visible-class');
  });
});
