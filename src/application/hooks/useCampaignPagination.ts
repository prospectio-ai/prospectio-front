/**
 * Custom hook for managing campaign messages pagination.
 *
 * Handles:
 * - Loading messages in pages of PAGE_SIZE (25)
 * - Accumulating messages across pages
 * - Resetting state when campaign changes
 * - Managing loading states
 * - Prioritizing streamed messages during streaming
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CampaignMessage } from '@/domain/entities/campaign';

export const PAGE_SIZE = 25;

export interface UseCampaignPaginationOptions {
  /** The currently selected campaign ID */
  selectedCampaignId: string | null;
  /** Messages fetched from the API for the current page */
  campaignMessages: CampaignMessage[] | undefined;
  /** Whether a stream is currently active */
  isStreaming: boolean;
  /** Whether streaming has completed */
  streamCompleted: boolean;
  /** Messages received during streaming */
  streamedMessages: CampaignMessage[];
  /** Total number of contacts in the selected campaign */
  totalContacts: number;
}

export interface UseCampaignPaginationResult {
  /** The messages to display (either streamed or paginated) */
  displayMessages: CampaignMessage[];
  /** All accumulated loaded messages from pagination */
  loadedMessages: CampaignMessage[];
  /** Current offset for pagination */
  messagesOffset: number;
  /** Whether more messages are being loaded */
  isLoadingMore: boolean;
  /** Whether there are more messages to load */
  hasMore: boolean;
  /** Function to load the next page of messages */
  handleLoadMore: () => void;
  /** Reset pagination state manually */
  resetPagination: () => void;
}

export function useCampaignPagination(
  options: UseCampaignPaginationOptions
): UseCampaignPaginationResult {
  const {
    selectedCampaignId,
    campaignMessages,
    isStreaming,
    streamCompleted,
    streamedMessages,
    totalContacts,
  } = options;

  // Pagination state
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [loadedMessages, setLoadedMessages] = useState<CampaignMessage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Track the last processed campaignMessages to avoid double-processing
  const lastProcessedMessagesRef = useRef<CampaignMessage[] | undefined>(undefined);
  // Track the offset at which we last processed messages
  const lastProcessedOffsetRef = useRef<number>(0);

  // Reset pagination when campaign changes
  useEffect(() => {
    setLoadedMessages([]);
    setMessagesOffset(0);
    setIsLoadingMore(false);
    lastProcessedMessagesRef.current = undefined;
    lastProcessedOffsetRef.current = 0;
  }, [selectedCampaignId]);

  // Accumulate messages when new batch is loaded
  useEffect(() => {
    // Skip if no messages or if we already processed this exact batch
    if (!campaignMessages || campaignMessages.length === 0) {
      return;
    }

    // Check if this is a new batch by comparing reference
    if (campaignMessages === lastProcessedMessagesRef.current) {
      return;
    }

    lastProcessedMessagesRef.current = campaignMessages;
    lastProcessedOffsetRef.current = messagesOffset;

    if (messagesOffset === 0) {
      // First batch replaces
      setLoadedMessages(campaignMessages);
    } else {
      // Subsequent batches append
      setLoadedMessages(prev => [...prev, ...campaignMessages]);
    }
    setIsLoadingMore(false);
  }, [campaignMessages, messagesOffset]);

  // Handle loading more messages
  const handleLoadMore = useCallback(() => {
    if (!selectedCampaignId || isLoadingMore) return;
    setIsLoadingMore(true);
    setMessagesOffset(prev => prev + PAGE_SIZE);
  }, [selectedCampaignId, isLoadingMore]);

  // Reset pagination manually
  const resetPagination = useCallback(() => {
    setLoadedMessages([]);
    setMessagesOffset(0);
    setIsLoadingMore(false);
    lastProcessedMessagesRef.current = undefined;
    lastProcessedOffsetRef.current = 0;
  }, []);

  // Determine which messages to display
  const displayMessages = useMemo(() => {
    // During streaming or just after completion: show streamed messages
    if ((isStreaming || streamCompleted) && streamedMessages.length > 0) {
      return streamedMessages;
    }
    // Otherwise: show accumulated messages from pagination
    return loadedMessages;
  }, [isStreaming, streamCompleted, streamedMessages, loadedMessages]);

  // Check if there are more messages to load
  const hasMore = useMemo(() => {
    return loadedMessages.length < totalContacts;
  }, [loadedMessages.length, totalContacts]);

  return {
    displayMessages,
    loadedMessages,
    messagesOffset,
    isLoadingMore,
    hasMore,
    handleLoadMore,
    resetPagination,
  };
}
