import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './theme-toggle';
import { renderWithProviders } from '@/test/utils/render';
import { ThemeProvider } from '@/application/hooks/use-theme';

// Mock localStorage for ThemeProvider
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

function renderThemeToggle() {
  return renderWithProviders(
    <ThemeProvider defaultTheme="system" storageKey="test-theme">
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should render the toggle button', () => {
    renderThemeToggle();
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('should show theme options when clicked', async () => {
    const user = userEvent.setup();
    renderThemeToggle();

    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    expect(screen.getByText('Clair')).toBeInTheDocument();
    expect(screen.getByText('Sombre')).toBeInTheDocument();
  });
});
