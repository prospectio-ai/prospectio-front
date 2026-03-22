import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (class name utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('should handle undefined values', () => {
    expect(cn('base', undefined, 'extra')).toBe('base extra');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8');
  });

  it('should handle empty arguments', () => {
    expect(cn()).toBe('');
  });

  it('should handle arrays of class names', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle object syntax', () => {
    expect(cn({ 'text-red': true, 'text-blue': false })).toBe('text-red');
  });
});
