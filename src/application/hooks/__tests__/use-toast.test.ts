import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from '../use-toast';

describe('use-toast reducer', () => {
  const initialState = { toasts: [] };

  it('should handle ADD_TOAST action', () => {
    const newToast = { id: '1', title: 'Test Toast', open: true };
    const result = reducer(initialState, { type: 'ADD_TOAST', toast: newToast as any });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].title).toBe('Test Toast');
  });

  it('should limit toasts to TOAST_LIMIT (1)', () => {
    const toast1 = { id: '1', title: 'First', open: true };
    const toast2 = { id: '2', title: 'Second', open: true };
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 as any });
    state = reducer(state, { type: 'ADD_TOAST', toast: toast2 as any });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].title).toBe('Second');
  });

  it('should handle UPDATE_TOAST action', () => {
    const toast1 = { id: '1', title: 'Original', open: true };
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 as any });
    state = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'Updated' } });
    expect(state.toasts[0].title).toBe('Updated');
  });

  it('should handle DISMISS_TOAST with specific id', () => {
    const toast1 = { id: '1', title: 'Test', open: true };
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 as any });
    state = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(state.toasts[0].open).toBe(false);
  });

  it('should handle DISMISS_TOAST without id (dismiss all)', () => {
    const toast1 = { id: '1', title: 'Test', open: true };
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 as any });
    state = reducer(state, { type: 'DISMISS_TOAST' });
    expect(state.toasts[0].open).toBe(false);
  });

  it('should handle REMOVE_TOAST with specific id', () => {
    const toast1 = { id: '1', title: 'Test', open: true };
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 as any });
    state = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(state.toasts).toHaveLength(0);
  });

  it('should handle REMOVE_TOAST without id (remove all)', () => {
    const toast1 = { id: '1', title: 'Test', open: true };
    let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 as any });
    state = reducer(state, { type: 'REMOVE_TOAST' });
    expect(state.toasts).toHaveLength(0);
  });
});

describe('useToast hook', () => {
  it('should return toast function and dismiss function', () => {
    const { result } = renderHook(() => useToast());
    expect(typeof result.current.toast).toBe('function');
    expect(typeof result.current.dismiss).toBe('function');
    expect(result.current.toasts).toBeDefined();
  });
});

describe('toast function', () => {
  it('should return an object with id, dismiss, and update', () => {
    const result = toast({ title: 'Test' });
    expect(result.id).toBeDefined();
    expect(typeof result.dismiss).toBe('function');
    expect(typeof result.update).toBe('function');
  });
});
