import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Callback from './Callback';

// Mock @logto/react - useHandleSignInCallback
vi.mock('@logto/react', () => ({
  useHandleSignInCallback: (callback: () => void) => {
    // Simulate the callback being called immediately
    callback();
  },
  useLogto: () => ({
    isAuthenticated: false,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    getIdTokenClaims: vi.fn(),
  }),
  LogtoProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Callback', () => {
  it('should render null (no visible content)', () => {
    const { container } = render(<Callback />);
    expect(container.innerHTML).toBe('');
  });
});
