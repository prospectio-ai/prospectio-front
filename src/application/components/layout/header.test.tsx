import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { Header } from './header';

describe('Header', () => {
  it('should render the title', async () => {
    renderWithProviders(<Header title="Prospectio" />);
    await waitFor(() => {
      expect(screen.getByText('Prospectio')).toBeInTheDocument();
    });
  });

  it('should render the description when provided', async () => {
    renderWithProviders(<Header title="Prospectio" description="Your assistant" />);
    await waitFor(() => {
      expect(screen.getByText('Your assistant')).toBeInTheDocument();
    });
  });

  it('should render the search input', async () => {
    renderWithProviders(<Header title="Test" />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search leads, tasks...')).toBeInTheDocument();
    });
  });

  it('should render the theme toggle button', async () => {
    renderWithProviders(<Header title="Test" />);
    await waitFor(() => {
      expect(screen.getByText('Toggle theme')).toBeInTheDocument();
    });
  });

  it('should render children when provided', async () => {
    renderWithProviders(
      <Header title="Test">
        <div>Custom content</div>
      </Header>
    );
    await waitFor(() => {
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });
  });
});
