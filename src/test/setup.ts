/**
 * Vitest test setup file.
 *
 * This file is executed before each test file.
 */

import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { handlers } from './handlers';

// MSW server setup
export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock @logto/react
vi.mock('@logto/react', () => ({
  useLogto: () => ({
    isAuthenticated: true,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    getIdTokenClaims: vi.fn().mockResolvedValue({ username: 'testuser' }),
  }),
  LogtoProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock pointer capture methods for Radix UI components
Element.prototype.hasPointerCapture = Element.prototype.hasPointerCapture || (() => false);
Element.prototype.setPointerCapture = Element.prototype.setPointerCapture || (() => {});
Element.prototype.releasePointerCapture = Element.prototype.releasePointerCapture || (() => {});

// Mock scrollIntoView for Radix UI components
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};
