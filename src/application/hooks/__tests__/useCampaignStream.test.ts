/**
 * Unit tests for useCampaignStream hook.
 *
 * NOTE: To run these tests, you need to install testing dependencies:
 *   npm install -D vitest @testing-library/react @testing-library/react-hooks jsdom
 *
 * Add to package.json scripts:
 *   "test": "vitest"
 *
 * Create vitest.config.ts if not exists.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCampaignStream, CampaignProgress, CampaignStreamState } from '../useCampaignStream';
import { CampaignMessage } from '@/domain/entities/campaign';

// Mock ConfigRepository
vi.mock('@/infrastructure/services/configRepository', () => ({
  ConfigRepository: class {
    async getConfig() {
      return { backendUrl: 'http://localhost:8000' };
    }
  },
}));

// Helper to create SSE event strings
function createSSEEvent(eventType: string, data: Record<string, unknown>): string {
  return `event: ${eventType}\ndata: ${JSON.stringify({ event: eventType, data })}\n\n`;
}

// Helper to create a mock readable stream
function createMockReadableStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index < events.length) {
        controller.enqueue(encoder.encode(events[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe('useCampaignStream', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCampaignStream());

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.campaignId).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.result).toBeNull();
    });

    it('should provide startStream, retryStream, stopStream, and reset functions', () => {
      const { result } = renderHook(() => useCampaignStream());

      expect(typeof result.current.startStream).toBe('function');
      expect(typeof result.current.retryStream).toBe('function');
      expect(typeof result.current.stopStream).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('startStream', () => {
    it('should set isStreaming to true when starting', async () => {
      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-123', campaign_name: 'Test' }),
        createSSEEvent('campaign_completed', { successful: 0, failed: 0, total_contacts: 0 }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const { result } = renderHook(() => useCampaignStream());

      act(() => {
        result.current.startStream('Test Campaign');
      });

      expect(result.current.isStreaming).toBe(true);
    });

    it('should reset state when starting a new stream', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream([
          createSSEEvent('campaign_started', { campaign_id: 'camp-123' }),
        ]),
      });

      const { result } = renderHook(() => useCampaignStream());

      // Start first stream
      act(() => {
        result.current.startStream('First Campaign');
      });

      // Start second stream - should reset state
      act(() => {
        result.current.startStream('Second Campaign');
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.progress).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockResolvedValue({ detail: 'Server error occurred' }),
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onError }));

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Server error occurred');
        expect(result.current.isStreaming).toBe(false);
      });

      expect(onError).toHaveBeenCalledWith('Server error occurred');
    });
  });

  describe('event handling', () => {
    it('should handle campaign_started event', async () => {
      const events = [
        createSSEEvent('campaign_started', {
          campaign_id: 'camp-123',
          campaign_name: 'Test Campaign'
        }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const { result } = renderHook(() => useCampaignStream());

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.campaignId).toBe('camp-123');
      });
    });

    it('should handle progress_update event', async () => {
      const progressData = {
        campaign_id: 'camp-123',
        current: 2,
        total: 5,
        percentage: 40.0,
        current_contact_name: 'John Doe',
      };

      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-123' }),
        createSSEEvent('progress_update', progressData),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const onProgressUpdate = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onProgressUpdate }));

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.progress).toEqual({
          campaignId: 'camp-123',
          current: 2,
          total: 5,
          percentage: 40.0,
          currentContactName: 'John Doe',
        });
      });

      expect(onProgressUpdate).toHaveBeenCalled();
    });

    it('should handle message_generated event and accumulate messages', async () => {
      const message1 = {
        message_id: 'msg-001',
        campaign_id: 'camp-123',
        contact_id: 'contact-001',
        contact_name: 'Alice',
        contact_email: ['alice@example.com'],
        company_name: 'Acme Corp',
        subject: 'Hello Alice',
        message: 'Message body 1',
        status: 'success',
        created_at: '2025-01-10T12:00:00Z',
      };

      const message2 = {
        message_id: 'msg-002',
        campaign_id: 'camp-123',
        contact_id: 'contact-002',
        contact_name: 'Bob',
        contact_email: ['bob@example.com'],
        company_name: 'Tech Inc',
        subject: 'Hello Bob',
        message: 'Message body 2',
        status: 'success',
        created_at: '2025-01-10T12:01:00Z',
      };

      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-123' }),
        createSSEEvent('message_generated', message1),
        createSSEEvent('message_generated', message2),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const onMessageGenerated = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onMessageGenerated }));

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(2);
      });

      expect(result.current.messages[0].contact_name).toBe('Alice');
      expect(result.current.messages[1].contact_name).toBe('Bob');
      expect(onMessageGenerated).toHaveBeenCalledTimes(2);
    });

    it('should handle campaign_completed event', async () => {
      const completedData = {
        campaign_id: 'camp-123',
        successful: 8,
        failed: 2,
        total_contacts: 10,
      };

      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-123' }),
        createSSEEvent('campaign_completed', completedData),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const onComplete = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onComplete }));

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
        expect(result.current.isStreaming).toBe(false);
      });

      expect(result.current.result).toEqual({
        campaignId: 'camp-123',
        successful: 8,
        failed: 2,
        totalContacts: 10,
      });

      expect(onComplete).toHaveBeenCalledWith({
        campaignId: 'camp-123',
        successful: 8,
        failed: 2,
        totalContacts: 10,
      });
    });

    it('should handle campaign_failed event', async () => {
      const events = [
        createSSEEvent('campaign_failed', {
          error: 'Profile not found. Please create a profile first.'
        }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onError }));

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Profile not found. Please create a profile first.');
        expect(result.current.isStreaming).toBe(false);
      });

      expect(onError).toHaveBeenCalledWith('Profile not found. Please create a profile first.');
    });

    it('should handle heartbeat events silently', async () => {
      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-123' }),
        createSSEEvent('heartbeat', {}),
        createSSEEvent('heartbeat', {}),
        createSSEEvent('campaign_completed', { successful: 0, failed: 0, total_contacts: 0 }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const { result } = renderHook(() => useCampaignStream());

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      // Heartbeats should not affect state
      expect(result.current.error).toBeNull();
    });
  });

  describe('stopStream', () => {
    it('should abort the stream and set isStreaming to false', async () => {
      // Create a stream that never ends
      const neverEndingStream = new ReadableStream({
        start() {
          // Never calls controller.close()
        },
      });

      mockFetch.mockResolvedValue({
        ok: true,
        body: neverEndingStream,
      });

      const { result } = renderHook(() => useCampaignStream());

      act(() => {
        result.current.startStream('Test Campaign');
      });

      expect(result.current.isStreaming).toBe(true);

      act(() => {
        result.current.stopStream();
      });

      expect(result.current.isStreaming).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-123' }),
        createSSEEvent('progress_update', { current: 1, total: 2, percentage: 50 }),
        createSSEEvent('message_generated', {
          message_id: 'msg-001',
          contact_id: 'c-001',
          subject: 'Test',
          message: 'Body',
          status: 'success',
        }),
        createSSEEvent('campaign_completed', { successful: 1, failed: 0, total_contacts: 1 }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const { result } = renderHook(() => useCampaignStream());

      await act(async () => {
        await result.current.startStream('Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      // Verify state has data
      expect(result.current.messages.length).toBeGreaterThan(0);
      expect(result.current.campaignId).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify all state is reset
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.campaignId).toBeNull();
      expect(result.current.progress).toBeNull();
      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.result).toBeNull();
    });
  });

  describe('retryStream', () => {
    it('should set isStreaming to true when starting retry', async () => {
      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-retry' }),
        createSSEEvent('campaign_completed', { campaign_id: 'camp-retry', successful: 1, failed: 0, total_contacts: 1 }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const { result } = renderHook(() => useCampaignStream());

      act(() => {
        result.current.retryStream('camp-retry');
      });

      expect(result.current.isStreaming).toBe(true);
    });

    it('should call the retry endpoint with POST and no JSON body', async () => {
      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-retry' }),
        createSSEEvent('campaign_completed', { campaign_id: 'camp-retry', successful: 1, failed: 0, total_contacts: 1 }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const { result } = renderHook(() => useCampaignStream());

      await act(async () => {
        await result.current.retryStream('camp-retry');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/prospectio/rest/v1/campaigns/camp-retry/retry/stream',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Accept': 'text/event-stream',
          }),
        })
      );

      // Should NOT have Content-Type or body (no JSON body for retry)
      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
      expect(callArgs.headers['Content-Type']).toBeUndefined();
    });

    it('should process SSE events from retry stream like startStream', async () => {
      const events = [
        createSSEEvent('campaign_started', { campaign_id: 'camp-retry' }),
        createSSEEvent('progress_update', {
          campaign_id: 'camp-retry',
          current: 1,
          total: 2,
          percentage: 50,
          current_contact_name: 'Retry Contact',
        }),
        createSSEEvent('message_generated', {
          message_id: 'msg-retry-001',
          campaign_id: 'camp-retry',
          contact_id: 'c-retry-001',
          contact_name: 'Retry Contact',
          subject: 'Retried Subject',
          message: 'Retried body',
          status: 'success',
          created_at: '2025-01-10T12:00:00Z',
        }),
        createSSEEvent('campaign_completed', {
          campaign_id: 'camp-retry',
          successful: 1,
          failed: 1,
          total_contacts: 2,
        }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const onComplete = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onComplete }));

      await act(async () => {
        await result.current.retryStream('camp-retry');
      });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      expect(result.current.campaignId).toBe('camp-retry');
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].contact_name).toBe('Retry Contact');
      expect(result.current.result).toEqual({
        campaignId: 'camp-retry',
        successful: 1,
        failed: 1,
        totalContacts: 2,
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should handle HTTP errors from retry endpoint', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: vi.fn().mockResolvedValue({ detail: 'Campaign not found' }),
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useCampaignStream({ onError }));

      await act(async () => {
        await result.current.retryStream('nonexistent-id');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Campaign not found');
        expect(result.current.isStreaming).toBe(false);
      });

      expect(onError).toHaveBeenCalledWith('Campaign not found');
    });
  });

  describe('complete campaign flow', () => {
    it('should process a full campaign with multiple messages', async () => {
      const events = [
        createSSEEvent('campaign_started', {
          campaign_id: 'camp-full',
          campaign_name: 'Full Test'
        }),
        createSSEEvent('progress_update', {
          campaign_id: 'camp-full',
          current: 1,
          total: 3,
          percentage: 33.3,
          current_contact_name: 'Contact 1',
        }),
        createSSEEvent('message_generated', {
          message_id: 'msg-001',
          campaign_id: 'camp-full',
          contact_id: 'c-001',
          contact_name: 'Contact 1',
          subject: 'Subject 1',
          message: 'Message 1',
          status: 'success',
          created_at: '2025-01-10T12:00:00Z',
        }),
        createSSEEvent('progress_update', {
          campaign_id: 'camp-full',
          current: 2,
          total: 3,
          percentage: 66.6,
          current_contact_name: 'Contact 2',
        }),
        createSSEEvent('message_generated', {
          message_id: 'msg-002',
          campaign_id: 'camp-full',
          contact_id: 'c-002',
          contact_name: 'Contact 2',
          subject: 'Subject 2',
          message: 'Message 2',
          status: 'failed',
          error: 'Generation failed',
          created_at: '2025-01-10T12:01:00Z',
        }),
        createSSEEvent('progress_update', {
          campaign_id: 'camp-full',
          current: 3,
          total: 3,
          percentage: 100,
          current_contact_name: 'Contact 3',
        }),
        createSSEEvent('message_generated', {
          message_id: 'msg-003',
          campaign_id: 'camp-full',
          contact_id: 'c-003',
          contact_name: 'Contact 3',
          subject: 'Subject 3',
          message: 'Message 3',
          status: 'success',
          created_at: '2025-01-10T12:02:00Z',
        }),
        createSSEEvent('campaign_completed', {
          campaign_id: 'camp-full',
          successful: 2,
          failed: 1,
          total_contacts: 3,
        }),
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        body: createMockReadableStream(events),
      });

      const onMessageGenerated = vi.fn();
      const onProgressUpdate = vi.fn();
      const onComplete = vi.fn();

      const { result } = renderHook(() =>
        useCampaignStream({
          onMessageGenerated,
          onProgressUpdate,
          onComplete
        })
      );

      await act(async () => {
        await result.current.startStream('Full Test Campaign');
      });

      await waitFor(() => {
        expect(result.current.isCompleted).toBe(true);
      });

      // Verify final state
      expect(result.current.campaignId).toBe('camp-full');
      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[0].status).toBe('success');
      expect(result.current.messages[1].status).toBe('failed');
      expect(result.current.messages[1].error).toBe('Generation failed');
      expect(result.current.messages[2].status).toBe('success');
      expect(result.current.result).toEqual({
        campaignId: 'camp-full',
        successful: 2,
        failed: 1,
        totalContacts: 3,
      });

      // Verify callbacks were called correct number of times
      expect(onMessageGenerated).toHaveBeenCalledTimes(3);
      expect(onProgressUpdate).toHaveBeenCalledTimes(3);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
