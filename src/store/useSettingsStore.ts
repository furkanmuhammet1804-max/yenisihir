import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Settings } from '../types';
import { translate, type StringKey } from '../i18n';

const defaults: Settings = {
  language: 'tr',
  defaultInputMethod: 'gridNoDim',
  gridSize: '3x3',
  gridPractice: false,
  dimLeadSec: 8,
  revealDelaySec: 0,
  fakeMaskInput: true,
  defaultFont: 'system',
  defaultColor: '#F2F0EB',
  share: {
    instagram: '',
    whatsapp: '',
    website: '',
    phone: '',
    caption: '🔮 #mindframe #mentalism',
  },
};

interface SettingsState extends Settings {
  set: (patch: Partial<Settings>) => void;
  setShare: (patch: Partial<Settings['share']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      set: (patch) => set(patch),
      setShare: (patch) => set((s) => ({ share: { ...s.share, ...patch } })),
    }),
    {
      name: 'mindframe.settings.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Translation hook bound to the current language setting. */
export function useT(): (key: StringKey) => string {
  const lang = useSettingsStore((s) => s.language);
  return (key) => translate(lang, key);
}
