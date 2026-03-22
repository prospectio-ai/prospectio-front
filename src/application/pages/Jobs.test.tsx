import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import Jobs from './Jobs';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';

const BASE_URL = 'http://localhost:8000/prospectio/rest/v1';

const mockJobs = [
  {
    id: '1',
    job_title: 'frontend developer',
    company_name: 'techCo',
    location: 'paris',
    salary: '50k',
    job_seniority: 'senior',
    job_type: 'Full-time',
    sectors: 'Technology,Web',
    description: 'Build awesome frontends',
    date_creation: '2025-01-15',
    apply_url: ['https://apply.test/1'],
    compatibility_score: 85,
  },
  {
    id: '2',
    job_title: 'backend developer',
    company_name: 'acme corp',
    location: 'lyon',
    sectors: 'Software',
  },
];

describe('Jobs', () => {
  it('should render jobs page with header', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Job Opportunities')).toBeInTheDocument();
    });
  });

  it('should render job cards when data is loaded', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Frontend developer')).toBeInTheDocument();
      expect(screen.getByText('Backend developer')).toBeInTheDocument();
    });
  });

  it('should display job details like location, company, salary', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('TechCo')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('50k')).toBeInTheDocument();
      expect(screen.getByText('senior')).toBeInTheDocument();
      expect(screen.getByText('Full-time')).toBeInTheDocument();
    });
  });

  it('should display sectors as badges', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('Web')).toBeInTheDocument();
    });
  });

  it('should filter jobs by search term', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Frontend developer')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search jobs/i);
    await user.type(searchInput, 'frontend');

    expect(screen.getByText('Frontend developer')).toBeInTheDocument();
    expect(screen.queryByText('Backend developer')).not.toBeInTheDocument();
  });

  it('should show empty state when no jobs found', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: [] });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('No jobs found')).toBeInTheDocument();
    });
  });

  it('should show error state when API fails', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.error();
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Error loading jobs')).toBeInTheDocument();
    });
  });

  it('should display compatibility score badge', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('85% match')).toBeInTheDocument();
    });
  });

  it('should render job description', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Build awesome frontends')).toBeInTheDocument();
    });
  });

  it('should render page description', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Discover relevant job openings tailored to your profile')).toBeInTheDocument();
    });
  });

  it('should format dates in French format', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      // 2025-01-15 formatted as fr-FR
      expect(screen.getByText('15/01/2025')).toBeInTheDocument();
    });
  });

  it('should show search hint for no results', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Frontend developer')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search jobs/i);
    await user.type(searchInput, 'zzzznonexistent');

    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
  });

  it('should show no jobs available message when no search term and empty data', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: [] });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('No job opportunities available')).toBeInTheDocument();
    });
  });

  it('should render Apply Now button with correct href', async () => {
    server.use(
      http.get(`${BASE_URL}/leads/jobs/:offset/:limit`, () => {
        return HttpResponse.json({ jobs: mockJobs });
      })
    );

    renderWithProviders(<Jobs />);

    await waitFor(() => {
      const applyLink = screen.getByText('Apply Now').closest('a');
      expect(applyLink).toHaveAttribute('href', 'https://apply.test/1');
      expect(applyLink).toHaveAttribute('target', '_blank');
    });
  });
});
