import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigRepository } from './configRepository';

describe('ConfigRepository', () => {
  let repo: ConfigRepository;

  beforeEach(() => {
    repo = new ConfigRepository();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch config from /config.json', async () => {
    const mockConfig = {
      chatbotUrl: 'http://chat.test',
      backendUrl: 'http://backend.test',
      logtoUrl: 'http://logto.test',
      logtoAppId: 'test-app',
      redirectUrl: 'http://localhost/callback',
      signOutUrl: 'http://localhost',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConfig),
    } as Response);

    const config = await repo.getConfig();
    expect(config).toEqual(mockConfig);
    expect(global.fetch).toHaveBeenCalledWith('/config.json');
  });

  it('should cache config after first fetch', async () => {
    const mockConfig = {
      chatbotUrl: 'http://chat.test',
      backendUrl: 'http://backend.test',
      logtoUrl: 'http://logto.test',
      logtoAppId: 'test-app',
      redirectUrl: 'http://localhost/callback',
      signOutUrl: 'http://localhost',
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConfig),
    } as Response);

    await repo.getConfig();
    const config2 = await repo.getConfig();
    expect(config2).toEqual(mockConfig);
    // fetch should only be called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should return fallback config when fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const config = await repo.getConfig();
    expect(config.backendUrl).toBe('http://localhost:8000');
    expect(config.chatbotUrl).toBe('http://localhost:3000');
  });

  it('should return fallback config when response is not ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const config = await repo.getConfig();
    expect(config.backendUrl).toBe('http://localhost:8000');
  });

  it('should report isLoaded as false initially', () => {
    expect(repo.isLoaded()).toBe(false);
  });

  it('should report isLoaded as true after loading', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        chatbotUrl: 'http://chat.test',
        backendUrl: 'http://backend.test',
        logtoUrl: 'http://logto.test',
        logtoAppId: 'test-app',
        redirectUrl: 'http://localhost/callback',
        signOutUrl: 'http://localhost',
      }),
    } as Response);

    await repo.getConfig();
    expect(repo.isLoaded()).toBe(true);
  });
});
