import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import ProspectCampaign from './ProspectCampaign';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';

const BASE_URL = 'http://localhost:8000/prospectio/rest/v1';

// Mock useCampaignStream with configurable return values
let mockStreamState = {
  isStreaming: false,
  campaignId: null as string | null,
  progress: null as any,
  messages: [] as any[],
  error: null as string | null,
  isCompleted: false,
  result: null as any,
  startStream: vi.fn(),
  stopStream: vi.fn(),
  reset: vi.fn(),
};

vi.mock('@/application/hooks/useCampaignStream', () => ({
  useCampaignStream: () => mockStreamState,
}));

const mockCampaigns = {
  campaigns: [
    {
      id: 'camp-1',
      name: 'Q1 Outreach',
      status: 'completed',
      created_at: '2025-01-15T10:00:00Z',
      updated_at: '2025-01-15T12:00:00Z',
      total_contacts: 10,
      successful: 8,
      failed: 2,
    },
  ],
  pages: 1,
};

describe('ProspectCampaign', () => {
  beforeEach(() => {
    mockStreamState = {
      isStreaming: false,
      campaignId: null,
      progress: null,
      messages: [],
      error: null,
      isCompleted: false,
      result: null,
      startStream: vi.fn(),
      stopStream: vi.fn(),
      reset: vi.fn(),
    };
  });
  it('should render the page header', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json(mockCampaigns);
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Prospect Campaign')).toBeInTheDocument();
    });
  });

  it('should render the campaign creation section', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json(mockCampaigns);
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Create New Campaign')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter campaign name/)).toBeInTheDocument();
    });
  });

  it('should show new contacts count', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('ready')).toBeInTheDocument();
    });
  });

  it('should show empty state when no campaigns and no contacts', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/Add some contacts first/)).toBeInTheDocument();
    });
  });

  it('should render the campaign selector with existing campaigns', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json(mockCampaigns);
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Select Campaign')).toBeInTheDocument();
    });
  });

  it('should show empty state with campaigns but no contacts', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json(mockCampaigns);
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/Select an existing campaign/)).toBeInTheDocument();
    });
  });

  it('should show empty state for new campaign with contacts available', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 3 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/new contacts ready/)).toBeInTheDocument();
    });
  });

  it('should disable Generate button when no campaign name', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      const generateButton = screen.getByText('Generate Campaign');
      expect(generateButton.closest('button')).toBeDisabled();
    });
  });

  it('should disable Generate button when no contacts', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      const generateButton = screen.getByText('Generate Campaign');
      expect(generateButton.closest('button')).toBeDisabled();
    });
  });

  it('should show description text', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Generate personalized outreach messages at scale')).toBeInTheDocument();
    });
  });

  it('should render new contacts badge section', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('New Contacts')).toBeInTheDocument();
    });
  });

  it('should render campaign name input', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json(mockCampaigns);
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Enter campaign name/);
      expect(input).toBeInTheDocument();
    });
  });

  it('should show streaming progress when streaming', async () => {
    mockStreamState = {
      ...mockStreamState,
      isStreaming: true,
      campaignId: 'camp-stream',
      progress: { campaignId: 'camp-stream', current: 3, total: 10, percentage: 30 },
      messages: [
        {
          id: 'msg-1',
          campaign_id: 'camp-stream',
          contact_id: 'c-1',
          contact_name: 'alice johnson',
          company_name: 'techCo',
          subject: 'Hello Alice',
          message: 'Dear Alice, this is a test message that is long enough to see',
          status: 'success',
          created_at: '2025-01-10T12:00:00Z',
        },
      ],
    };

    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Live Progress')).toBeInTheDocument();
      expect(screen.getByText('1 messages generated')).toBeInTheDocument();
    });
  });

  it('should show completed task with success/fail counts', async () => {
    mockStreamState = {
      ...mockStreamState,
      isStreaming: false,
      isCompleted: true,
      campaignId: 'camp-done',
      result: { campaignId: 'camp-done', successful: 8, failed: 2, totalContacts: 10 },
      messages: [
        {
          id: 'msg-1',
          campaign_id: 'camp-done',
          contact_id: 'c-1',
          contact_name: 'bob smith',
          subject: 'Hello Bob',
          message: 'Dear Bob...',
          status: 'success',
          created_at: '2025-01-10T12:00:00Z',
        },
      ],
    };

    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/Campaign completed/)).toBeInTheDocument();
    });
  });

  it('should show error state in task progress', async () => {
    mockStreamState = {
      ...mockStreamState,
      isStreaming: false,
      error: 'Profile not found',
    };

    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/Error: Profile not found/)).toBeInTheDocument();
    });
  });

  it('should render the campaign page subheading', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json(mockCampaigns);
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [], pages: 0 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Ready to Launch Your Campaign')).toBeInTheDocument();
    });
  });

  it('should show Generating button text during streaming', async () => {
    mockStreamState = {
      ...mockStreamState,
      isStreaming: true,
      campaignId: 'camp-gen',
      progress: null,
      messages: [],
    };

    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });

  it('should display campaign generation info text', async () => {
    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 12 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/generate messages for all 12 new contacts/)).toBeInTheDocument();
    });
  });

  it('should show stream progress message during streaming', async () => {
    mockStreamState = {
      ...mockStreamState,
      isStreaming: true,
      campaignId: 'camp-progress',
      progress: {
        campaignId: 'camp-progress',
        current: 3,
        total: 10,
        percentage: 30,
        currentContactName: 'John Doe',
      },
      messages: [],
    };

    server.use(
      http.get(`${BASE_URL}/campaigns/:offset/:limit`, () => {
        return HttpResponse.json({ campaigns: [], pages: 0 });
      }),
      http.get(`${BASE_URL}/contacts/new/:offset/:limit`, () => {
        return HttpResponse.json({ contacts: [{ id: '1' }], pages: 5 });
      })
    );

    renderWithProviders(<ProspectCampaign />);

    await waitFor(() => {
      expect(screen.getByText(/Generating message 3\/10 for John Doe/)).toBeInTheDocument();
    });
  });
});
