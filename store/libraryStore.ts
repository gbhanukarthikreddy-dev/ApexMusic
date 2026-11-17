import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  AudioQuality,
  DownloadPlaceholder,
  HistoryEntry,
  HomeFeedResponse,
  Track,
  UserPlaylist,
} from '../types/music';

const MAX_HISTORY_ITEMS = 100;
const MAX_RECENT_SEARCHES = 15;

interface LibraryState {
  likedSongs: Track[];
  playlists: UserPlaylist[];
  history: HistoryEntry[];
  recentSearches: string[];
  downloads: DownloadPlaceholder[];
  audioQuality: AudioQuality;
  cachedHomeFeed: HomeFeedResponse | null;

  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;

  createPlaylist: (name: string, description?: string) => UserPlaylist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;

  recordPlay: (track: Track) => void;
  clearHistory: () => void;

  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  toggleDownloadPlaceholder: (track: Track) => void;
  isDownloadedPlaceholder: (trackId: string) => boolean;

  setAudioQuality: (quality: AudioQuality) => void;
  setCachedHomeFeed: (feed: HomeFeedResponse) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      likedSongs: [],
      playlists: [],
      history: [],
      recentSearches: [],
      downloads: [],
      audioQuality: 'high',
      cachedHomeFeed: null,

      toggleLike: (track) => {
        const exists = get().likedSongs.some((t) => t.id === track.id);
        set((state) => ({
          likedSongs: exists
            ? state.likedSongs.filter((t) => t.id !== track.id)
            : [track, ...state.likedSongs],
        }));
      },

      isLiked: (trackId) => get().likedSongs.some((t) => t.id === trackId),

      createPlaylist: (name, description) => {
        const now = Date.now();
        const newPlaylist: UserPlaylist = {
          id: `pl_${now}_${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim(),
          description: description?.trim() || undefined,
          tracks: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          playlists: [newPlaylist, ...state.playlists],
        }));
        return newPlaylist;
      },

      deletePlaylist: (playlistId) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId),
        }));
      },

      addTrackToPlaylist: (playlistId, track) => {
        set((state) => ({
          playlists: state.playlists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            if (pl.tracks.some((t) => t.id === track.id)) return pl;
            return {
              ...pl,
              tracks: [...pl.tracks, track],
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            return {
              ...pl,
              tracks: pl.tracks.filter((t) => t.id !== trackId),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      recordPlay: (track) => {
        set((state) => {
          const filtered = state.history.filter((entry) => entry.track.id !== track.id);
          const next: HistoryEntry[] = [
            { track, playedAt: Date.now() },
            ...filtered,
          ].slice(0, MAX_HISTORY_ITEMS);
          return { history: next };
        });
      },

      clearHistory: () => set({ history: [] }),

      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({
          recentSearches: [
            trimmed,
            ...state.recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
          ].slice(0, MAX_RECENT_SEARCHES),
        }));
      },

      removeRecentSearch: (query) => {
        set((state) => ({
          recentSearches: state.recentSearches.filter((q) => q !== query),
        }));
      },

      clearRecentSearches: () => set({ recentSearches: [] }),

      toggleDownloadPlaceholder: (track) => {
        const exists = get().downloads.some((d) => d.track.id === track.id);
        set((state) => ({
          downloads: exists
            ? state.downloads.filter((d) => d.track.id !== track.id)
            : [
                {
                  track,
                  addedAt: Date.now(),
                  status: 'cached_metadata',
                  estimatedSizeMb: Math.max(2.4, Number(((track.duration || 200) * 0.024).toFixed(1))),
                },
                ...state.downloads,
              ],
        }));
      },

      isDownloadedPlaceholder: (trackId) => get().downloads.some((d) => d.track.id === trackId),

      setAudioQuality: (audioQuality) => set({ audioQuality }),

      setCachedHomeFeed: (cachedHomeFeed) => set({ cachedHomeFeed }),
    }),
    {
      name: 'apex-music-library-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
