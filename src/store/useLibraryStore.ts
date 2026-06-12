import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IndexList, TrickVideo } from '../types';
import { demoVideos } from '../services/demoData';
import { builtInLists } from '../services/builtInLists';
import { makeId } from '../utils/id';

interface LibraryState {
  videos: TrickVideo[];
  customLists: IndexList[];
  upsertVideo: (video: TrickVideo) => void;
  removeVideo: (id: string) => void;
  restoreDemos: () => void;
  addList: (name: string, items: string[]) => void;
  updateList: (id: string, patch: Partial<Pick<IndexList, 'name' | 'items'>>) => void;
  removeList: (id: string) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      videos: demoVideos,
      customLists: [],
      upsertVideo: (video) =>
        set((s) => {
          const idx = s.videos.findIndex((v) => v.id === video.id);
          const videos = [...s.videos];
          if (idx >= 0) videos[idx] = video;
          else videos.unshift(video);
          return { videos };
        }),
      removeVideo: (id) => set((s) => ({ videos: s.videos.filter((v) => v.id !== id) })),
      restoreDemos: () =>
        set((s) => ({
          videos: [...s.videos.filter((v) => !v.isDemo), ...demoVideos],
        })),
      addList: (name, items) =>
        set((s) => ({
          customLists: [...s.customLists, { id: makeId('list'), name, items, builtIn: false }],
        })),
      updateList: (id, patch) =>
        set((s) => ({
          customLists: s.customLists.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),
      removeList: (id) => set((s) => ({ customLists: s.customLists.filter((l) => l.id !== id) })),
    }),
    {
      name: 'mindframe.library.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** All lists visible to the editor/perform layers (built-in + custom). */
export function useAllLists(): IndexList[] {
  const custom = useLibraryStore((s) => s.customLists);
  return [...builtInLists, ...custom];
}

export function resolveListItem(listId: string | undefined, n: number, lists: IndexList[]): string | undefined {
  if (!listId) return undefined;
  const list = lists.find((l) => l.id === listId);
  if (!list || list.items.length === 0) return undefined;
  // 1-based index, clamped into range so a bad number never breaks the show
  const idx = Math.min(Math.max(n, 1), list.items.length) - 1;
  return list.items[idx];
}
