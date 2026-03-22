import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../use-theme';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

function createWrapper(defaultTheme: 'light' | 'dark' | 'system' = 'system') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider defaultTheme={defaultTheme} storageKey="test-theme-key">
        {children}
      </ThemeProvider>
    );
  };
}

describe('ThemeProvider and useTheme', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should provide default theme as system', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('system'),
    });
    expect(result.current.theme).toBe('system');
  });

  it('should set theme to light', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('system'),
    });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('should set theme to dark', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('system'),
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should persist theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('system'),
    });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-theme-key', 'dark');
  });

  it('should read theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    const { result } = renderHook(() => useTheme(), {
      wrapper: createWrapper('light'),
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should use default initial state when outside ThemeProvider', () => {
    // When used outside ThemeProvider, context returns default initialState
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('system');
  });
});
