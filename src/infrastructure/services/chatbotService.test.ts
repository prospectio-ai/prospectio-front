import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock ConfigRepository before importing chatbotService
vi.mock('@/infrastructure/services/configRepository', () => ({
  ConfigRepository: class {
    async getConfig() {
      return {
        chatbotUrl: 'http://localhost:3000',
        backendUrl: 'http://localhost:8000',
      };
    }
  },
}));

// Mock use-toast
vi.mock('../../application/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ChatbotService', () => {
  let chatbotService: any;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Re-import to get a fresh instance
    const module = await import('./chatbotService');
    chatbotService = module.chatbotService;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getToken', () => {
    it('should fetch a token successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token', session_id: 'sess-1' }),
      });

      const result = await chatbotService.getToken();
      expect(result).toEqual({ token: 'test-token', session_id: 'sess-1' });
    });

    it('should include correct headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: 'test-token', session_id: 'sess-1' }),
      });

      await chatbotService.getToken();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/auth/token'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Not authorized'),
      });

      await expect(chatbotService.getToken()).rejects.toThrow('Failed to get token');
    });

    it('should throw on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(chatbotService.getToken()).rejects.toThrow('Network failure');
    });
  });

  describe('loadWidget', () => {
    it('should not load script if already loaded', async () => {
      // Manually set isLoaded to true
      (chatbotService as any).isLoaded = true;

      await chatbotService.loadWidget();
      // fetch should NOT be called since widget is already loaded
      expect(mockFetch).not.toHaveBeenCalled();

      // Reset for other tests
      (chatbotService as any).isLoaded = false;
    });

    it('should show toast error when chatbotUrl is empty', async () => {
      vi.resetModules();

      // Mock ConfigRepository with empty chatbotUrl
      vi.doMock('@/infrastructure/services/configRepository', () => ({
        ConfigRepository: class {
          async getConfig() {
            return {
              chatbotUrl: '',
              backendUrl: 'http://localhost:8000',
            };
          }
        },
      }));

      const { toast } = await import('../../application/hooks/use-toast');
      const module = await import('./chatbotService');
      await module.chatbotService.loadWidget();

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive',
          title: 'Configuration Error',
        })
      );
    });
  });
});
