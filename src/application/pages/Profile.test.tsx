import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import Profile from './Profile';

describe('Profile', () => {
  it('renders the page heading', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument();
    });
    expect(
      screen.getByText(/manage your professional information/i),
    ).toBeInTheDocument();
  });

  it('shows profile data once loaded from the API', async () => {
    renderWithProviders(<Profile />);

    // Wait for the profile data from MSW to load
    await waitFor(() => {
      expect(screen.getByText('Senior Full Stack Developer')).toBeInTheDocument();
    });

    expect(screen.getByText('FR, Paris')).toBeInTheDocument();
    expect(
      screen.getByText('Experienced developer with 10 years of expertise.'),
    ).toBeInTheDocument();
  });

  it('displays work experience', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Lead Developer')).toBeInTheDocument();
    });

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('displays technology badges', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('shows the Edit Profile button in view mode', async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /edit profile/i }),
      ).toBeInTheDocument();
    });
  });

  it('switches to edit mode and shows Save/Cancel buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Profile />);

    // Wait for data to load and then click edit
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /edit profile/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    // Edit mode should show Save and Cancel buttons
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    // Edit Profile button should no longer be visible
    expect(
      screen.queryByRole('button', { name: /edit profile/i }),
    ).not.toBeInTheDocument();
  });

  it('returns to view mode when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /edit profile/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /edit profile/i }));
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should be back to view mode
    expect(
      screen.getByRole('button', { name: /edit profile/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /save/i }),
    ).not.toBeInTheDocument();
  });
});
