/**
 * Unit tests for useCampaignPagination hook.
 *
 * Tests cover:
 * - Initial state
 * - Loading first batch of messages
 * - "Load More" functionality (offset increment, message accumulation)
 * - Campaign change resets state
 * - Display logic (streamed vs paginated messages)
 * - hasMore calculation
 * - Loading state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useCampaignPagination,
  PAGE_SIZE,
  UseCampaignPaginationOptions,
} from '../useCampaignPagination';
import { CampaignMessage } from '@/domain/entities/campaign';

// Helper to create mock messages
function createMockMessage(index: number, campaignId: string = 'camp-1'): CampaignMessage {
  return {
    id: `msg-${index}`,
    campaign_id: campaignId,
    contact_id: `contact-${index}`,
    contact_name: `Contact ${index}`,
    contact_email: [`contact${index}@example.com`],
    company_name: `Company ${index}`,
    subject: `Subject ${index}`,
    message: `Message body ${index}`,
    status: 'success',
    created_at: new Date().toISOString(),
  };
}

// Helper to create an array of mock messages
function createMockMessages(count: number, startIndex: number = 0, campaignId: string = 'camp-1'): CampaignMessage[] {
  return Array.from({ length: count }, (_, i) => createMockMessage(startIndex + i, campaignId));
}

// Default options for testing
function createDefaultOptions(overrides: Partial<UseCampaignPaginationOptions> = {}): UseCampaignPaginationOptions {
  return {
    selectedCampaignId: null,
    campaignMessages: undefined,
    isStreaming: false,
    streamCompleted: false,
    streamedMessages: [],
    totalContacts: 0,
    ...overrides,
  };
}

describe('useCampaignPagination', () => {
  describe('initial state', () => {
    it('should have correct initial state with no campaign selected', () => {
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions())
      );

      expect(result.current.displayMessages).toEqual([]);
      expect(result.current.loadedMessages).toEqual([]);
      expect(result.current.messagesOffset).toBe(0);
      expect(result.current.isLoadingMore).toBe(false);
      expect(result.current.hasMore).toBe(false);
    });

    it('should provide handleLoadMore and resetPagination functions', () => {
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions())
      );

      expect(typeof result.current.handleLoadMore).toBe('function');
      expect(typeof result.current.resetPagination).toBe('function');
    });
  });

  describe('PAGE_SIZE constant', () => {
    it('should export PAGE_SIZE as 25', () => {
      expect(PAGE_SIZE).toBe(25);
    });
  });

  describe('initial load (first batch)', () => {
    it('should load first 25 messages and set them as displayMessages', async () => {
      const firstBatch = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: undefined,
            totalContacts: 50,
          }),
        }
      );

      // Simulate messages being fetched
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: firstBatch,
        totalContacts: 50,
      }));

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
        expect(result.current.displayMessages).toHaveLength(25);
      });

      expect(result.current.loadedMessages[0].id).toBe('msg-0');
      expect(result.current.loadedMessages[24].id).toBe('msg-24');
    });

    it('should replace messages on first batch (offset = 0)', async () => {
      const firstBatch = createMockMessages(10);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            totalContacts: 10,
          }),
        }
      );

      // Load first batch
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: firstBatch,
        totalContacts: 10,
      }));

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(10);
      });

      // Load another "first batch" (simulating re-fetch)
      const newFirstBatch = createMockMessages(5);
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: newFirstBatch,
        totalContacts: 5,
      }));

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(5);
      });
    });
  });

  describe('handleLoadMore', () => {
    it('should increment offset by PAGE_SIZE when called', async () => {
      const firstBatch = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: firstBatch,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      expect(result.current.messagesOffset).toBe(0);

      // Click Load More
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.messagesOffset).toBe(25);
      expect(result.current.isLoadingMore).toBe(true);
    });

    it('should not increment offset when no campaign is selected', () => {
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: null,
        }))
      );

      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.messagesOffset).toBe(0);
      expect(result.current.isLoadingMore).toBe(false);
    });

    it('should not increment offset when already loading', async () => {
      const firstBatch = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: firstBatch,
            totalContacts: 75,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // First click
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.messagesOffset).toBe(25);
      expect(result.current.isLoadingMore).toBe(true);

      // Second click while loading - should be ignored
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.messagesOffset).toBe(25); // Still 25, not 50
    });
  });

  describe('message accumulation', () => {
    it('should append messages after loading more (subsequent batches)', async () => {
      const firstBatch = createMockMessages(25, 0);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: firstBatch,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Trigger load more
      act(() => {
        result.current.handleLoadMore();
      });

      // Simulate second batch arriving
      const secondBatch = createMockMessages(25, 25);
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: secondBatch,
        totalContacts: 50,
      }));

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(50);
        expect(result.current.isLoadingMore).toBe(false);
      });

      // Verify accumulation order
      expect(result.current.loadedMessages[0].id).toBe('msg-0');
      expect(result.current.loadedMessages[24].id).toBe('msg-24');
      expect(result.current.loadedMessages[25].id).toBe('msg-25');
      expect(result.current.loadedMessages[49].id).toBe('msg-49');
    });

    it('should handle partial last page', async () => {
      const firstBatch = createMockMessages(25, 0);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: firstBatch,
            totalContacts: 35,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Trigger load more
      act(() => {
        result.current.handleLoadMore();
      });

      // Simulate partial second batch (only 10 messages)
      const secondBatch = createMockMessages(10, 25);
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: secondBatch,
        totalContacts: 35,
      }));

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(35);
      });
    });
  });

  describe('campaign change reset', () => {
    it('should reset offset to 0 when campaign changes', async () => {
      const firstBatch = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: firstBatch,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Trigger load more
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.messagesOffset).toBe(25);

      // Change campaign
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-2',
        campaignMessages: undefined,
        totalContacts: 30,
      }));

      await waitFor(() => {
        expect(result.current.messagesOffset).toBe(0);
        expect(result.current.loadedMessages).toEqual([]);
        expect(result.current.isLoadingMore).toBe(false);
      });
    });

    it('should clear loaded messages when campaign changes', async () => {
      const messages = createMockMessages(10);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: messages,
            totalContacts: 10,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(10);
      });

      // Change to different campaign
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-2',
        campaignMessages: undefined,
        totalContacts: 20,
      }));

      await waitFor(() => {
        expect(result.current.loadedMessages).toEqual([]);
        expect(result.current.displayMessages).toEqual([]);
      });
    });

    it('should reset isLoadingMore when campaign changes', async () => {
      const messages = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: messages,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Start loading more
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.isLoadingMore).toBe(true);

      // Change campaign mid-load
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-2',
        campaignMessages: undefined,
        totalContacts: 15,
      }));

      await waitFor(() => {
        expect(result.current.isLoadingMore).toBe(false);
      });
    });
  });

  describe('hasMore calculation', () => {
    it('should return false when all messages are loaded', async () => {
      const messages = createMockMessages(10);
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: messages,
          totalContacts: 10,
        }))
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(10);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('should return true when more messages exist', async () => {
      const messages = createMockMessages(25);
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: messages,
          totalContacts: 50,
        }))
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      expect(result.current.hasMore).toBe(true);
    });

    it('should return false when loadedMessages.length equals totalContacts', async () => {
      const messages = createMockMessages(50);
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: messages,
          totalContacts: 50,
        }))
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(50);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('display logic (streamed vs paginated)', () => {
    it('should show streamed messages during streaming', () => {
      const streamedMessages = createMockMessages(5);
      const loadedMessages = createMockMessages(25);

      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: loadedMessages,
          isStreaming: true,
          streamedMessages,
          totalContacts: 50,
        }))
      );

      expect(result.current.displayMessages).toEqual(streamedMessages);
      expect(result.current.displayMessages).toHaveLength(5);
    });

    it('should show streamed messages when stream is completed', async () => {
      const streamedMessages = createMockMessages(10);
      const loadedMessages = createMockMessages(25, 100); // Different IDs

      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: loadedMessages,
            isStreaming: false,
            streamCompleted: true,
            streamedMessages,
            totalContacts: 50,
          }),
        }
      );

      expect(result.current.displayMessages).toEqual(streamedMessages);
    });

    it('should show loaded messages when not streaming and no streamed messages', async () => {
      const loadedMessages = createMockMessages(25);

      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: loadedMessages,
          isStreaming: false,
          streamCompleted: false,
          streamedMessages: [],
          totalContacts: 50,
        }))
      );

      await waitFor(() => {
        expect(result.current.displayMessages).toHaveLength(25);
      });

      expect(result.current.displayMessages).toEqual(result.current.loadedMessages);
    });

    it('should show loaded messages when stream completed but no streamed messages', async () => {
      const loadedMessages = createMockMessages(15);

      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: loadedMessages,
          isStreaming: false,
          streamCompleted: true,
          streamedMessages: [], // Empty despite completion
          totalContacts: 15,
        }))
      );

      await waitFor(() => {
        expect(result.current.displayMessages).toHaveLength(15);
      });

      expect(result.current.displayMessages).toEqual(result.current.loadedMessages);
    });
  });

  describe('loading state', () => {
    it('should set isLoadingMore to true when handleLoadMore is called', async () => {
      const messages = createMockMessages(25);
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: messages,
          totalContacts: 50,
        }))
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      expect(result.current.isLoadingMore).toBe(false);

      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.isLoadingMore).toBe(true);
    });

    it('should set isLoadingMore to false when new messages arrive', async () => {
      const firstBatch = createMockMessages(25, 0);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: firstBatch,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Trigger load more
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.isLoadingMore).toBe(true);

      // New messages arrive
      const secondBatch = createMockMessages(25, 25);
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: secondBatch,
        totalContacts: 50,
      }));

      await waitFor(() => {
        expect(result.current.isLoadingMore).toBe(false);
      });
    });
  });

  describe('resetPagination', () => {
    it('should reset offset and isLoadingMore state', async () => {
      const messages = createMockMessages(25);
      const { result } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: messages,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Trigger load more
      act(() => {
        result.current.handleLoadMore();
      });

      expect(result.current.messagesOffset).toBe(25);
      expect(result.current.isLoadingMore).toBe(true);

      // Reset manually - offset and loading should reset
      act(() => {
        result.current.resetPagination();
      });

      // These should reset immediately
      expect(result.current.messagesOffset).toBe(0);
      expect(result.current.isLoadingMore).toBe(false);
    });

    it('should clear loadedMessages when reset and campaign changes', async () => {
      const messages = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: messages,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Change campaign - this triggers the campaign reset effect
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-2',
        campaignMessages: undefined,
        totalContacts: 30,
      }));

      await waitFor(() => {
        expect(result.current.messagesOffset).toBe(0);
        expect(result.current.loadedMessages).toEqual([]);
        expect(result.current.isLoadingMore).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty messages array', async () => {
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: [],
          totalContacts: 0,
        }))
      );

      expect(result.current.loadedMessages).toEqual([]);
      expect(result.current.displayMessages).toEqual([]);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle undefined campaignMessages', () => {
      const { result } = renderHook(() =>
        useCampaignPagination(createDefaultOptions({
          selectedCampaignId: 'camp-1',
          campaignMessages: undefined,
          totalContacts: 50,
        }))
      );

      expect(result.current.loadedMessages).toEqual([]);
    });

    it('should not accumulate when campaignMessages is empty array', async () => {
      const messages = createMockMessages(25);
      const { result, rerender } = renderHook(
        (props: UseCampaignPaginationOptions) => useCampaignPagination(props),
        {
          initialProps: createDefaultOptions({
            selectedCampaignId: 'camp-1',
            campaignMessages: messages,
            totalContacts: 50,
          }),
        }
      );

      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });

      // Trigger load more
      act(() => {
        result.current.handleLoadMore();
      });

      // Simulate empty response (end of data)
      rerender(createDefaultOptions({
        selectedCampaignId: 'camp-1',
        campaignMessages: [],
        totalContacts: 50,
      }));

      // Should still have the original 25, not accumulate empty
      await waitFor(() => {
        expect(result.current.loadedMessages).toHaveLength(25);
      });
    });
  });
});
