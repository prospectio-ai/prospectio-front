import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatedInput } from './animated-input';

describe('AnimatedInput', () => {
  it('should render an input element', () => {
    render(<AnimatedInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should accept and display a value', () => {
    render(<AnimatedInput value="hello" readOnly />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('should apply className', () => {
    render(<AnimatedInput className="custom-input" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input.className).toContain('custom-input');
  });

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup();
    render(<AnimatedInput placeholder="Focus me" />);

    const input = screen.getByPlaceholderText('Focus me');
    await user.click(input);
    // Input should be focused
    expect(document.activeElement).toBe(input);

    await user.tab();
    // Input should be blurred
    expect(document.activeElement).not.toBe(input);
  });

  it('should render disabled state', () => {
    render(<AnimatedInput disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('should render with type', () => {
    render(<AnimatedInput type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });
});
