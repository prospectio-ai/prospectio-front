import { useState, useCallback, useRef, useEffect } from 'react';
import { CampaignMessage } from '@/domain/entities/campaign';
import { ConfigRepository } from '@/infrastructure/services/configRepository';

export type SSEEventType =
  | 'campaign_started'
  | 'message_generated'
  | 'progress_update'
  | 'campaign_completed'
  | 'campaign_failed'
  | 'heartbeat';

export interface CampaignProgress {
  campaignId: string;
  current: number;
  total: number;
  percentage: number;
  currentContactName?: string;
}

export interface CampaignStreamResult {
  campaignId: string;
  successful: number;
  failed: number;
  totalContacts: number;
}

export interface CampaignStreamState {
  isStreaming: boolean;
  campaignId: string | null;
  progress: CampaignProgress | null;
  messages: CampaignMessage[];
  error: string | null;
  isCompleted: boolean;
  result: CampaignStreamResult | null;
}

interface UseCampaignStreamOptions {
  onMessageGenerated?: (message: CampaignMessage) => void;
  onProgressUpdate?: (progress: CampaignProgress) => void;
  onComplete?: (result: CampaignStreamState['result']) => void;
  onError?: (error: string) => void;
}

const INITIAL_STATE: CampaignStreamState = {
  isStreaming: false,
  campaignId: null,
  progress: null,
  messages: [],
  error: null,
  isCompleted: false,
  result: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

interface ParsedSSEEvent {
  eventType: string;
  eventData: string;
}

function parseSSEEvents(rawBuffer: string): { events: ParsedSSEEvent[]; remaining: string } {
  const chunks = rawBuffer.split('\n\n');
  const remaining = chunks.pop() || '';
  const events: ParsedSSEEvent[] = [];

  for (const eventStr of chunks) {
    if (!eventStr.trim()) continue;

    const lines = eventStr.split('\n');
    let eventType = '';
    let eventData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7);
      } else if (line.startsWith('data: ')) {
        eventData = line.slice(6);
      }
    }

    if (eventType && eventData) {
      events.push({ eventType, eventData });
    }
  }

  return { events, remaining };
}

async function readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (eventType: SSEEventType, data: unknown) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { events, remaining } = parseSSEEvents(buffer);
    buffer = remaining;

    for (const { eventType, eventData } of events) {
      try {
        const parsed = JSON.parse(eventData);
        console.log('[SSE] Received event:', eventType, parsed);
        onEvent(eventType as SSEEventType, parsed.data || parsed);
      } catch (parseError) {
        console.error('Failed to parse SSE event:', parseError, 'Raw data:', eventData);
      }
    }
  }
}

export function useCampaignStream(options: UseCampaignStreamOptions = {}) {
  const [state, setState] = useState<CampaignStreamState>(INITIAL_STATE);

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const configRef = useRef<{ backendUrl: string } | null>(null);

  const cancelReader = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel().catch(() => {
        // Ignore cancel errors
      });
      readerRef.current = null;
    }
  }, []);
  const optionsRef = useRef(options);

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Load config once
  useEffect(() => {
    const loadConfig = async () => {
      const config = await new ConfigRepository().getConfig();
      configRef.current = config;
    };
    loadConfig();
  }, []);

  const handleEvent = useCallback((eventType: SSEEventType, data: Record<string, unknown>) => {
    switch (eventType) {
      case 'campaign_started':
        setState(prev => ({
          ...prev,
          campaignId: data.campaign_id as string,
        }));
        break;

      case 'progress_update': {
        const progress: CampaignProgress = {
          campaignId: data.campaign_id as string,
          current: data.current as number,
          total: data.total as number,
          percentage: data.percentage as number,
          currentContactName: data.current_contact_name as string | undefined,
        };
        setState(prev => ({ ...prev, progress }));
        optionsRef.current.onProgressUpdate?.(progress);
        break;
      }

      case 'message_generated': {
        const message: CampaignMessage = {
          id: data.message_id as string,
          campaign_id: data.campaign_id as string,
          contact_id: data.contact_id as string,
          contact_name: data.contact_name as string | undefined,
          contact_email: data.contact_email as string[] | undefined,
          company_name: data.company_name as string | undefined,
          subject: data.subject as string,
          message: data.message as string,
          status: data.status as 'success' | 'skipped' | 'failed',
          error: data.error as string | undefined,
          created_at: data.created_at as string,
        };
        console.log('[SSE] Adding message to state:', message.contact_name, message.status);
        setState(prev => {
          const newMessages = [...prev.messages, message];
          console.log('[SSE] Messages count:', newMessages.length);
          return {
            ...prev,
            messages: newMessages,
          };
        });
        optionsRef.current.onMessageGenerated?.(message);
        break;
      }

      case 'campaign_completed': {
        const campaignId = data.campaign_id as string;
        const result: CampaignStreamResult = {
          campaignId,
          successful: data.successful as number,
          failed: data.failed as number,
          totalContacts: data.total_contacts as number,
        };
        setState(prev => ({
          ...prev,
          isStreaming: false,
          isCompleted: true,
          result,
          campaignId,
        }));
        optionsRef.current.onComplete?.(result);
        break;
      }

      case 'campaign_failed':
        setState(prev => ({
          ...prev,
          isStreaming: false,
          error: (data.error as string) || 'Campaign generation failed',
        }));
        optionsRef.current.onError?.((data.error as string) || 'Campaign generation failed');
        break;

      case 'heartbeat':
        // Keep-alive, no action needed
        break;
    }
  }, []);

  const startStream = useCallback(async (campaignName: string) => {
    // Cancel existing reader and abort controller
    cancelReader();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset state with streaming flag
    setState({ ...INITIAL_STATE, isStreaming: true });

    // Wait for config if not loaded
    if (!configRef.current) {
      const config = await new ConfigRepository().getConfig();
      configRef.current = config;
    }

    const baseUrl = configRef.current.backendUrl;
    console.log('[SSE] Starting stream to:', `${baseUrl}/prospectio/rest/v1/generate/campaign/stream`);

    try {
      const response = await fetch(
        `${baseUrl}/prospectio/rest/v1/generate/campaign/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({ name: campaignName }),
          signal: abortControllerRef.current.signal,
        }
      );

      console.log('[SSE] Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to start campaign stream' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      // Store reader reference for cleanup
      readerRef.current = reader;

      const processStream = async () => {
        try {
          await readSSEStream(reader, handleEvent);
        } catch (streamError) {
          if (streamError instanceof Error && streamError.name === 'AbortError') {
            return;
          }
          console.error('Stream error:', streamError);
          const errorMsg = getErrorMessage(streamError, 'Stream error');
          setState(prev => ({ ...prev, isStreaming: false, error: errorMsg }));
          optionsRef.current.onError?.(errorMsg);
        } finally {
          readerRef.current = null;
        }
      };

      processStream();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to start campaign stream:', error);
      const errorMsg = getErrorMessage(error, 'Failed to start stream');
      setState(prev => ({ ...prev, isStreaming: false, error: errorMsg }));
      optionsRef.current.onError?.(errorMsg);
    }
  }, [cancelReader, handleEvent]);

  const retryStream = useCallback(async (campaignId: string) => {
    // Cancel existing reader and abort controller
    cancelReader();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset state with streaming flag
    setState({ ...INITIAL_STATE, isStreaming: true });

    // Wait for config if not loaded
    if (!configRef.current) {
      const config = await new ConfigRepository().getConfig();
      configRef.current = config;
    }

    const baseUrl = configRef.current.backendUrl;
    const url = `${baseUrl}/prospectio/rest/v1/campaigns/${campaignId}/retry/stream`;
    console.log('[SSE] Starting retry stream to:', url);

    try {
      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Accept': 'text/event-stream',
          },
          signal: abortControllerRef.current.signal,
        }
      );

      console.log('[SSE] Retry response status:', response.status, response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to start campaign retry stream' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      // Store reader reference for cleanup
      readerRef.current = reader;

      const processStream = async () => {
        try {
          await readSSEStream(reader, handleEvent);
        } catch (streamError) {
          if (streamError instanceof Error && streamError.name === 'AbortError') {
            return;
          }
          console.error('Retry stream error:', streamError);
          const errorMsg = getErrorMessage(streamError, 'Retry stream error');
          setState(prev => ({ ...prev, isStreaming: false, error: errorMsg }));
          optionsRef.current.onError?.(errorMsg);
        } finally {
          readerRef.current = null;
        }
      };

      processStream();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error('Failed to start campaign retry stream:', error);
      const errorMsg = getErrorMessage(error, 'Failed to start retry stream');
      setState(prev => ({ ...prev, isStreaming: false, error: errorMsg }));
      optionsRef.current.onError?.(errorMsg);
    }
  }, [cancelReader, handleEvent]);

  const stopStream = useCallback(() => {
    cancelReader();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({ ...prev, isStreaming: false }));
  }, [cancelReader]);

  const reset = useCallback(() => {
    stopStream();
    setState(INITIAL_STATE);
  }, [stopStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelReader();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [cancelReader]);

  return {
    ...state,
    startStream,
    retryStream,
    stopStream,
    reset,
  };
}
