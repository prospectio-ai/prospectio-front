import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import Companies from './Companies';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';

const BASE_URL = 'http://localhost:8000/prospectio/rest/v1';

const mockCompanies = [
  {
    id: '1',
    name: 'techCo',
    industry: 'Technology',
    location: 'Paris',
    size: '100-500',
    revenue: '$10M',
    website: 'https://techco.test',
    description: 'A leading tech company',
    compatibility: '95%',
    opportunities: ['Frontend', 'Backend', 'DevOps', 'ML'],
  },
  {
    id: '2',
    name: 'acme corp',
    industry: 'Software',
    location: 'Lyon',
  },
];

describe('Companies', () => {
  it('should render companies page with header', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: mockCompanies });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('Companies')).toBeInTheDocument();
    });
  });

  it('should render company cards when data is loaded', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: mockCompanies });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('TechCo')).toBeInTheDocument();
      expect(screen.getByText('Acme corp')).toBeInTheDocument();
    });
  });

  it('should display company details', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: mockCompanies });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('100-500')).toBeInTheDocument();
      expect(screen.getByText('$10M')).toBeInTheDocument();
    });
  });

  it('should display opportunities badges (max 3 + "more" badge)', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: mockCompanies });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('DevOps')).toBeInTheDocument();
      expect(screen.getByText('+1 more')).toBeInTheDocument();
    });
  });

  it('should filter companies by search term', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: mockCompanies });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('TechCo')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search companies/i);
    await user.type(searchInput, 'techco');

    expect(screen.getByText('TechCo')).toBeInTheDocument();
    expect(screen.queryByText('Acme corp')).not.toBeInTheDocument();
  });

  it('should show empty state when no companies found', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: [] });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('No companies found')).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.error();
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      expect(screen.getByText('Error loading companies')).toBeInTheDocument();
    });
  });

  it('should render website link', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/companies/:offset/:limit`, () => {
        return HttpResponse.json({ companies: mockCompanies });
      })
    );

    renderWithProviders(<Companies />);

    await waitFor(() => {
      const websiteLink = screen.getByText('Website').closest('a');
      expect(websiteLink).toHaveAttribute('href', 'https://techco.test');
      expect(websiteLink).toHaveAttribute('target', '_blank');
    });
  });
});
