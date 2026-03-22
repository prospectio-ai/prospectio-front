import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import { Layout } from './layout';

describe('Layout', () => {
  it('should render the sidebar', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithProviders(<Layout />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
  });
});
