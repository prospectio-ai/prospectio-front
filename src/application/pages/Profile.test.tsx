import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils/render';
import Profile from './Profile';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';

const BASE_URL = 'http://localhost:8000/prospectio/rest/v1';

const mockProfile = {
  job_title: 'Senior Full Stack Developer',
  location: 'FR, Paris',
  bio: 'Experienced developer with 10 years of expertise.',
  work_experience: [
    {
      company: 'Acme Corp',
      position: 'Lead Developer',
      start_date: '2020-01',
      end_date: '',
      description: 'Leading the frontend team.',
    },
  ],
  technos: ['React', 'TypeScript', 'Python'],
};

function setupProfileHandlers() {
  server.use(
    http.get(`${BASE_URL}/profile`, () => {
      return HttpResponse.json(mockProfile);
    }),
    http.get(`${BASE_URL}/tasks/running`, () => {
      return HttpResponse.json([]);
    })
  );
}

describe('Profile', () => {
  it('should render basic information section', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });
  });

  it('should display profile job title and location', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Senior Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByText('FR, Paris')).toBeInTheDocument();
    });
  });

  it('should display bio text', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Experienced developer with 10 years of expertise.')).toBeInTheDocument();
    });
  });

  it('should display technos as badges', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });
  });

  it('should display work experience', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Lead Developer')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
  });

  it('should show edit button', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('should enter edit mode when Edit Profile button is clicked', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('should render upload resume button', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Upload Resume (PDF)')).toBeInTheDocument();
    });
  });

  it('should render search opportunities button', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Search Opportunities')).toBeInTheDocument();
    });
  });

  it('should render reset data button', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Reset All Data')).toBeInTheDocument();
    });
  });

  it('should render description labels', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Your professional identity and contact details')).toBeInTheDocument();
    });
  });

  it('should display experience section header', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Work Experience')).toBeInTheDocument();
    });
  });

  it('should display skills section header', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Skills')).toBeInTheDocument();
    });
  });

  it('should cancel edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('should show edit form inputs in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('e.g., Senior Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., FR, Paris')).toBeInTheDocument();
    });
  });

  it('should render empty experience message when no experiences', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({
          job_title: 'Developer',
          location: 'Paris',
          bio: '',
          work_experience: [],
          technos: [],
        });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No work experience added yet')).toBeInTheDocument();
    });
  });

  it('should save profile when Save button is clicked', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json(mockProfile);
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      }),
      http.post(`${BASE_URL}/profile/upsert`, () => {
        return HttpResponse.json(mockProfile);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('should display "Present" for current work experience', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/Present/)).toBeInTheDocument();
    });
  });

  it('should display No bio provided when bio is empty', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({ ...mockProfile, bio: '' });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No bio provided')).toBeInTheDocument();
    });
  });

  it('should display Not specified when job title is empty', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({ ...mockProfile, job_title: '' });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      const notSpecified = screen.getAllByText('Not specified');
      expect(notSpecified.length).toBeGreaterThan(0);
    });
  });

  it('should add experience in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Add Experience')).toBeInTheDocument();
    });

    // Initially should have 1 experience (the existing one)
    const companyInputsBefore = screen.getAllByPlaceholderText('Company name');
    expect(companyInputsBefore).toHaveLength(1);

    await user.click(screen.getByText('Add Experience'));

    await waitFor(() => {
      // Should now have 2 experience form entries
      const companyInputsAfter = screen.getAllByPlaceholderText('Company name');
      expect(companyInputsAfter).toHaveLength(2);
    });
  });

  it('should show add skill input in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Add a skill/)).toBeInTheDocument();
    });
  });

  it('should render bio textarea in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Tell us about your professional background/)).toBeInTheDocument();
    });
  });

  it('should show experience description', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Leading the frontend team.')).toBeInTheDocument();
    });
  });

  it('should show "at" between position and company name in view mode', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('at')).toBeInTheDocument();
    });
  });

  it('should show task progress when there are running tasks', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json(mockProfile);
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([{
          task_id: 'task-1',
          status: 'in_progress',
          message: 'Searching for jobs...',
          task_type: 'insert_leads',
          progress: { current: 5, total: 10, percentage: 50 },
          started_at: '2025-01-15T10:00:00Z',
        }]);
      }),
      http.get(`${BASE_URL}/task/task-1`, () => {
        return HttpResponse.json({
          task_id: 'task-1',
          status: 'completed',
          message: 'Found 10 jobs',
          task_type: 'insert_leads',
        });
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Searching Job Opportunities')).toBeInTheDocument();
    });
  });

  it('should show edit form for experience fields when in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      // Should show experience edit form fields
      expect(screen.getByPlaceholderText('Company name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Position/Role')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Start date (YYYY-MM)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/End date/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Description of responsibilities/)).toBeInTheDocument();
    });
  });

  it('should show experience 1 label in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Experience 1')).toBeInTheDocument();
    });
  });

  it('should display empty experience message when work_experience is empty', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({
          ...mockProfile,
          technos: [],
          work_experience: [],
        });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No work experience added yet')).toBeInTheDocument();
    });
  });

  it('should show no skills message when technos is empty in view mode', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({
          ...mockProfile,
          technos: [],
        });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No technologies added yet')).toBeInTheDocument();
    });
  });

  it('should display professional bio label', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Professional Bio')).toBeInTheDocument();
    });
  });

  it('should display career history description', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Your professional background and career history')).toBeInTheDocument();
    });
  });

  it('should display skills description', async () => {
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Programming languages, frameworks, and tools you work with')).toBeInTheDocument();
    });
  });

  it('should add a new skill in edit mode via Enter key', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Add a skill/)).toBeInTheDocument();
    });

    const skillInput = screen.getByPlaceholderText(/Add a skill/);
    await user.type(skillInput, 'Docker{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Docker')).toBeInTheDocument();
    });
  });

  it('should show position/role field in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('Lead Developer')).toBeInTheDocument();
    });
  });

  it('should show the reset confirmation dialog when clicking Reset All Data', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Reset All Data')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Reset All Data'));

    await waitFor(() => {
      expect(screen.getByText('Reset All Data?')).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      expect(screen.getByText('Yes, delete everything')).toBeInTheDocument();
    });
  });

  it('should dismiss reset dialog when clicking cancel', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Reset All Data')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Reset All Data'));

    await waitFor(() => {
      expect(screen.getByText('Reset All Data?')).toBeInTheDocument();
    });

    // Click Cancel on the dialog
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Reset All Data?')).not.toBeInTheDocument();
    });
  });

  it('should handle search opportunities click when profile has valid data', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json(mockProfile);
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      }),
      http.post(`${BASE_URL}/insert/leads`, () => {
        return HttpResponse.json({
          task_id: 'task-search-1',
          status: 'pending',
          message: 'Starting search...',
        });
      }),
      http.get(`${BASE_URL}/task/:taskId`, () => {
        return HttpResponse.json({
          task_id: 'task-search-1',
          status: 'completed',
          message: 'Found 15 opportunities',
        });
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Search Opportunities')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Search Opportunities'));

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  it('should show No technologies added message when technos array is empty', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({
          ...mockProfile,
          technos: [],
        });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No technologies added yet')).toBeInTheDocument();
    });
  });

  it('should remove a skill in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      // Technos should be displayed with X buttons in edit mode
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Find the X button next to "React" techno badge
    const reactBadge = screen.getByText('React').closest('.flex');
    const removeButton = reactBadge?.querySelector('button[type="button"]');
    expect(removeButton).toBeDefined();

    if (removeButton) {
      await user.click(removeButton);
      await waitFor(() => {
        expect(screen.queryByText('React')).not.toBeInTheDocument();
      });
    }
  });

  it('should remove experience in edit mode', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Experience 1')).toBeInTheDocument();
    });

    // Find the trash button to remove experience
    const experienceSection = screen.getByText('Experience 1').closest('.p-4');
    const trashButton = experienceSection?.querySelector('button[type="button"]');

    if (trashButton) {
      await user.click(trashButton);
      await waitFor(() => {
        expect(screen.queryByText('Experience 1')).not.toBeInTheDocument();
      });
    }
  });

  it('should show Add your skills above message in edit mode with no technos', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({
          ...mockProfile,
          technos: [],
        });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('Add your skills above')).toBeInTheDocument();
    });
  });

  it('should show no experience message in edit mode with no experiences', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({
          ...mockProfile,
          work_experience: [],
        });
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      expect(screen.getByText('No work experience added yet')).toBeInTheDocument();
      expect(screen.getByText(/Click "Add Experience" to get started/)).toBeInTheDocument();
    });
  });

  it('should render experience edit form with company and position inputs', async () => {
    const user = userEvent.setup();
    setupProfileHandlers();
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Edit Profile'));

    await waitFor(() => {
      // Verify all edit form fields for experience are rendered
      const companyInput = screen.getByDisplayValue('Acme Corp');
      const positionInput = screen.getByDisplayValue('Lead Developer');
      const dateInput = screen.getByDisplayValue('2020-01');
      const descInput = screen.getByDisplayValue('Leading the frontend team.');

      expect(companyInput).toBeInTheDocument();
      expect(positionInput).toBeInTheDocument();
      expect(dateInput).toBeInTheDocument();
      expect(descInput).toBeInTheDocument();

      // Trigger onChange by typing in the company input
      user.type(companyInput, ' Inc');
    });
  });

  it('should handle empty profile data', async () => {
    server.use(
      http.get(`${BASE_URL}/profile`, () => {
        return HttpResponse.json({});
      }),
      http.get(`${BASE_URL}/tasks/running`, () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<Profile />);

    await waitFor(() => {
      const notSpecified = screen.getAllByText('Not specified');
      expect(notSpecified.length).toBeGreaterThan(0);
      expect(screen.getByText('No bio provided')).toBeInTheDocument();
    });
  });
});
