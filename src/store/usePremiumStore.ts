import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TrickVideo } from '../types';

/**
 * Entitlement backend seam — same pattern as Transmitter/VideoExporter.
 * Wiring RevenueCat or expo-iap later = implementing this interface and
 * swapping `provider`; screens and stores don't change.
 */
export interface EntitlementProvider {
  /** Starts the purchase flow; resolves true when premium was granted. */
  purchase(): Promise<boolean>;
  /** Re-checks past purchases; resolves true when premium is active. */
  restore(): Promise<boolean>;
}

/** MVP backend: instantly grants premium so the whole flow is testable. */
class MockEntitlementProvider implements EntitlementProvider {
  async purchase(): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 600)); // simulated store round-trip
    return true;
  }
  async restore(): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400));
    return true;
  }
}

const provider: EntitlementProvider = new MockEntitlementProvider();

interface PremiumState {
  isPremium: boolean;
  busy: boolean;
  purchase: () => Promise<boolean>;
  restore: () => Promise<boolean>;
  /** Dev/demo switch in Settings — clears or grants the entitlement directly. */
  setPremium: (value: boolean) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      busy: false,
      purchase: async () => {
        set({ busy: true });
        try {
          const ok = await provider.purchase();
          if (ok) set({ isPremium: true });
          return ok;
        } finally {
          set({ busy: false });
        }
      },
      restore: async () => {
        set({ busy: true });
        try {
          const ok = await provider.restore();
          if (ok) set({ isPremium: true });
          return ok;
        } finally {
          set({ busy: false });
        }
      },
      setPremium: (isPremium) => set({ isPremium }),
    }),
    {
      name: 'mindframe.premium.v1',
      storage: createJSONStorage(() => AsyncStorage),
      // busy is runtime-only; only the entitlement is persisted
      partialize: (s) => ({ isPremium: s.isPremium }),
    },
  ),
);

/** True when this video is gated and the user hasn't unlocked premium. */
export function isLocked(video: TrickVideo, isPremium: boolean): boolean {
  return Boolean(video.premium) && !isPremium;
}
