import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackendApiService } from './backendApiService';

// Mock ConfigRepository
vi.mock('@/infrastructure/services/configRepository', () => ({
  ConfigRepository: class {
    async getConfig() {
      return { backendUrl: 'http://localhost:8000' };
    }
  },
}));

describe('BackendApiService', () => {
  let api: BackendApiService;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    api = new BackendApiService();
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  describe('getProfile', () => {
    it('should fetch profile successfully', async () => {
      const mockProfile = { job_title: 'Developer', location: 'Paris' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfile),
      });

      const result = await api.getProfile();
      expect(result.data).toEqual(mockProfile);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prospectio/rest/v1/profile'
      );
    });

    it('should throw on error response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
      await expect(api.getProfile()).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('upsertProfile', () => {
    it('should upsert profile successfully', async () => {
      const profile = { job_title: 'Senior Dev', location: 'Lyon' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(profile),
      });

      const result = await api.upsertProfile(profile);
      expect(result.data).toEqual(profile);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prospectio/rest/v1/profile/upsert',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(profile),
        })
      );
    });

    it('should throw on error response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(api.upsertProfile({ job_title: 'Test' })).rejects.toThrow('Failed to update profile');
    });
  });

  describe('getLeads', () => {
    it('should fetch jobs leads', async () => {
      const mockJobs = { jobs: [{ id: '1', job_title: 'Dev' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockJobs),
      });

      const result = await api.getLeads('jobs', 0, 10);
      expect(result).toEqual(mockJobs.jobs);
    });

    it('should fetch companies leads', async () => {
      const mockCompanies = { companies: [{ id: '1', name: 'Acme' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCompanies),
      });

      const result = await api.getLeads('companies', 0, 10);
      expect(result).toEqual(mockCompanies.companies);
    });

    it('should fetch contacts leads', async () => {
      const mockContacts = { contacts: [{ id: '1', name: 'John' }] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContacts),
      });

      const result = await api.getLeads('contacts', 0, 10);
      expect(result).toEqual(mockContacts.contacts);
    });

    it('should throw for invalid type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });
      await expect(api.getLeads('invalid', 0, 10)).rejects.toThrow('Invalid type');
    });

    it('should throw on error response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(api.getLeads('jobs', 0, 10)).rejects.toThrow('Failed to fetch jobs');
    });
  });

  describe('generateMessage', () => {
    it('should generate a message for a contact', async () => {
      const mockMessage = { subject: 'Hello', message: 'Body text' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMessage),
      });

      const result = await api.generateMessage('contact-1');
      expect(result).toEqual(mockMessage);
    });

    it('should throw on error response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      await expect(api.generateMessage('contact-1')).rejects.toThrow('Failed to generate message');
    });
  });

  describe('uploadResume', () => {
    it('should upload resume successfully', async () => {
      const mockResponse = { extracted_profile: { job_title: 'Dev' }, raw_text: 'Resume...' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const file = new File(['dummy'], 'resume.pdf', { type: 'application/pdf' });
      const result = await api.uploadResume(file);
      expect(result).toEqual(mockResponse);
    });

    it('should throw with error detail on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid file format' }),
      });

      const file = new File(['dummy'], 'resume.pdf');
      await expect(api.uploadResume(file)).rejects.toThrow('Invalid file format');
    });

    it('should throw fallback message when error json parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error('parse error')),
      });

      const file = new File(['dummy'], 'resume.pdf');
      await expect(api.uploadResume(file)).rejects.toThrow('Failed to upload resume');
    });
  });

  describe('insertLeads', () => {
    it('should insert leads successfully', async () => {
      const mockTask = { task_id: 'task-1', status: 'pending', message: 'Started' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const request = { source: 'linkedin', location: 'Paris', job_params: ['React'] };
      const result = await api.insertLeads(request);
      expect(result).toEqual(mockTask);
    });

    it('should throw on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Quota exceeded' }),
      });

      const request = { source: 'linkedin', location: 'Paris', job_params: ['React'] };
      await expect(api.insertLeads(request)).rejects.toThrow('Quota exceeded');
    });
  });

  describe('getTaskStatus', () => {
    it('should fetch task status', async () => {
      const mockTask = { task_id: 'task-1', status: 'completed', message: 'Done' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const result = await api.getTaskStatus('task-1');
      expect(result).toEqual(mockTask);
    });

    it('should throw on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.reject(new Error('fail')),
      });
      await expect(api.getTaskStatus('task-1')).rejects.toThrow('Failed to get task status');
    });
  });

  describe('generateCampaign', () => {
    it('should start campaign generation', async () => {
      const mockTask = { task_id: 'task-2', status: 'pending', message: 'Starting' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const result = await api.generateCampaign();
      expect(result).toEqual(mockTask);
    });

    it('should throw on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'No contacts' }),
      });
      await expect(api.generateCampaign()).rejects.toThrow('No contacts');
    });
  });

  describe('getCampaignResult', () => {
    it('should fetch campaign result', async () => {
      const mockResult = { total_contacts: 10, successful: 8, failed: 2, messages: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await api.getCampaignResult('task-1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('resetAllData', () => {
    it('should reset all data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'deleted' }),
      });

      const result = await api.resetAllData();
      expect(result.result).toBe('deleted');
    });

    it('should throw on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Cannot reset' }),
      });
      await expect(api.resetAllData()).rejects.toThrow('Cannot reset');
    });
  });

  describe('getCampaigns', () => {
    it('should fetch campaigns', async () => {
      const mockData = { campaigns: [{ id: '1', name: 'Test Campaign' }], pages: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.getCampaigns(0, 10);
      expect(result).toEqual(mockData);
    });
  });

  describe('getCampaign', () => {
    it('should fetch a single campaign', async () => {
      const mockCampaign = { id: '1', name: 'Test', status: 'completed' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaign),
      });

      const result = await api.getCampaign('1');
      expect(result).toEqual(mockCampaign);
    });

    it('should throw on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Not found' }),
      });
      await expect(api.getCampaign('1')).rejects.toThrow('Not found');
    });
  });

  describe('getCampaignMessages', () => {
    it('should fetch campaign messages', async () => {
      const mockMessages = [{ id: '1', subject: 'Hello', message: 'Body', status: 'success', contact_id: 'c1' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMessages),
      });

      const result = await api.getCampaignMessages('camp-1', 0, 25);
      expect(result).toEqual(mockMessages);
    });
  });

  describe('getNewContacts', () => {
    it('should fetch new contacts', async () => {
      const mockData = { contacts: [{ id: '1', name: 'New Contact' }], pages: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await api.getNewContacts(0, 10);
      expect(result).toEqual(mockData);
    });
  });

  describe('getRunningTasks', () => {
    it('should fetch running tasks without filter', async () => {
      const mockTasks = [{ task_id: 'task-1', status: 'in_progress' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTasks),
      });

      const result = await api.getRunningTasks();
      expect(result).toEqual(mockTasks);
    });

    it('should fetch running tasks with task type filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await api.getRunningTasks('insert_leads');
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('task_type=insert_leads');
    });
  });

  describe('generateCampaignWithName', () => {
    it('should start campaign generation with a name', async () => {
      const mockTask = { task_id: 'task-3', status: 'pending', message: 'Starting' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTask),
      });

      const result = await api.generateCampaignWithName('Q1 Outreach');
      expect(result).toEqual(mockTask);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Q1 Outreach' }),
        })
      );
    });
  });
});
