import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('should render 404 heading', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should render the error message', () => {
    renderWithProviders(<NotFound />);
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
  });

  it('should render a link to return home', () => {
    renderWithProviders(<NotFound />);
    const homeLink = screen.getByText('Return to Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should log an error for the attempted route', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(<NotFound />, { routerProps: { initialEntries: ['/nonexistent'] } });
    expect(consoleSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/nonexistent'
    );
    consoleSpy.mockRestore();
  });
});
