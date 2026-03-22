import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ChainlitWidget from './chainlitWidget';

vi.mock('../../../infrastructure/services/chatbotService', () => ({
  chatbotService: {
    loadWidget: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('ChainlitWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render null (no visible content)', () => {
    const { container } = render(<ChainlitWidget />);
    expect(container.innerHTML).toBe('');
  });

  it('should call loadWidget on mount', async () => {
    const { chatbotService } = await import('../../../infrastructure/services/chatbotService');
    render(<ChainlitWidget />);
    expect(chatbotService.loadWidget).toHaveBeenCalled();
  });
});
