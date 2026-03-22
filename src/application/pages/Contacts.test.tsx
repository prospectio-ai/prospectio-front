import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import Contacts from './Contacts';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';

const BASE_URL = 'http://localhost:8000/prospectio/rest/v1';

const mockContacts = [
  {
    id: '1',
    name: 'john doe',
    email: ['john@test.com', 'john2@test.com'],
    title: 'senior developer',
    phone: '+33 1 23 45 67 89',
    company_name: 'techCo',
    job_title: 'frontend developer',
    profile_url: 'https://linkedin.com/in/johndoe',
    short_description: 'Expert frontend developer with 10 years experience',
  },
  {
    id: '2',
    name: 'jane smith',
    email: ['jane@test.com'],
    title: 'project manager',
    company_name: 'acme',
  },
];

describe('Contacts', () => {
  it('should render contacts page with header', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Contacts')).toBeInTheDocument();
    });
  });

  it('should render contact cards when data is loaded', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('John doe')).toBeInTheDocument();
      expect(screen.getByText('Jane smith')).toBeInTheDocument();
    });
  });

  it('should display contact details', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
      expect(screen.getByText('+33 1 23 45 67 89')).toBeInTheDocument();
    });
  });

  it('should display initials in avatar', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  it('should filter contacts by search term', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('John doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search contacts/i);
    await user.type(searchInput, 'john');

    expect(screen.getByText('John doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane smith')).not.toBeInTheDocument();
  });

  it('should show empty state when no contacts found', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [] });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('No contacts found')).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.error();
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Error loading contacts')).toBeInTheDocument();
    });
  });

  it('should show page description', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Connect with key decision makers and industry professionals')).toBeInTheDocument();
    });
  });

  it('should display company badge on contact card', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('TechCo')).toBeInTheDocument();
    });
  });

  it('should display job title badge on contact card', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Frontend developer')).toBeInTheDocument();
    });
  });

  it('should render profile link', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  it('should display title on contact card', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Senior developer')).toBeInTheDocument();
    });
  });

  it('should render short description', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/contacts/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: mockContacts });
      })
    );

    renderWithProviders(<Contacts />);

    await waitFor(() => {
      expect(screen.getByText('Expert frontend developer with 10 years experience')).toBeInTheDocument();
    });
  });
});
