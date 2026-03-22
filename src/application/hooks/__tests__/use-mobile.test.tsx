import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

describe('useIsMobile', () => {
  let changeHandler: (() => void) | null = null;

  beforeEach(() => {
    changeHandler = null;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_: string, handler: () => void) => {
          changeHandler = handler;
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  });

  it('should return false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should return true for mobile width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should update when window width changes', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      changeHandler?.();
    });
    expect(result.current).toBe(true);
  });
});
