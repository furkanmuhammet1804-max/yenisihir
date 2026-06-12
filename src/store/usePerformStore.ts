import { create } from 'zustand';
import type { PerformValue } from '../types';

/**
 * Runtime-only state for the live performance. Never persisted:
 * a spectator picking up the phone later must find nothing.
 */
interface PerformState {
  values: Record<string, PerformValue>;
  setValue: (v: PerformValue) => void;
  removeValue: (revealId: string) => void;
  reset: () => void;
}

export const usePerformStore = create<PerformState>((set) => ({
  values: {},
  setValue: (v) => set((s) => ({ values: { ...s.values, [v.revealId]: v } })),
  removeValue: (revealId) =>
    set((s) => {
      const values = { ...s.values };
      delete values[revealId];
      return { values };
    }),
  reset: () => set({ values: {} }),
}));
