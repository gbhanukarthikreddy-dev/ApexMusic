import { create } from 'zustand';
import { Track } from '../types/music';

interface UIState {
  sheetTrack: Track | null;
  sheetMode: 'menu' | 'playlist';
  toastMessage: string | null;
  toastTimerId: ReturnType<typeof setTimeout> | null;

  openTrackMenu: (track: Track) => void;
  openPlaylistPicker: (track: Track) => void;
  closeTrackSheet: () => void;
  showToast: (message: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sheetTrack: null,
  sheetMode: 'menu',
  toastMessage: null,
  toastTimerId: null,

  openTrackMenu: (track) => set({ sheetTrack: track, sheetMode: 'menu' }),

  openPlaylistPicker: (track) => set({ sheetTrack: track, sheetMode: 'playlist' }),

  closeTrackSheet: () => set({ sheetTrack: null, sheetMode: 'menu' }),

  showToast: (message) => {
    const prev = get().toastTimerId;
    if (prev) clearTimeout(prev);

    const timer = setTimeout(() => {
      set({ toastMessage: null, toastTimerId: null });
    }, 2200);

    set({ toastMessage: message, toastTimerId: timer });
  },
}));
