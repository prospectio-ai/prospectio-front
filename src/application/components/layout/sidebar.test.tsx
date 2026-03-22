import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('renders all navigation links', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Companies')).toBeInTheDocument();
  });

  it('renders the menu title when expanded', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Prospectio v1.0')).toBeInTheDocument();
  });

  it('collapses the sidebar when toggle button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);

    // Menu title should be visible initially
    expect(screen.getByText('Menu')).toBeInTheDocument();

    // Click the collapse button (the X icon button in the header)
    const collapseButton = screen.getByRole('button');
    await user.click(collapseButton);

    // Menu title and nav labels should be hidden when collapsed
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Prospectio v1.0')).not.toBeInTheDocument();
  });

  it('expands the sidebar when toggle button is clicked again', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);

    const toggleButton = screen.getByRole('button');

    // Collapse
    await user.click(toggleButton);
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();

    // Expand
    await user.click(toggleButton);
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    renderWithProviders(<Sidebar />);

    const profileLink = screen.getByText('Profile').closest('a');
    const contactsLink = screen.getByText('Contacts').closest('a');
    const jobsLink = screen.getByText('Jobs').closest('a');
    const companiesLink = screen.getByText('Companies').closest('a');

    expect(profileLink).toHaveAttribute('href', '/profile');
    expect(contactsLink).toHaveAttribute('href', '/contacts');
    expect(jobsLink).toHaveAttribute('href', '/jobs');
    expect(companiesLink).toHaveAttribute('href', '/companies');
  });
});
