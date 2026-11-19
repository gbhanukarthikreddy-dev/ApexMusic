import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  deleteOfflineTrackFile,
  downloadTrackAudio,
  getPlayableOfflineUri,
} from '../services/offlineDownloadService';
import {
  AudioQuality,
  DownloadPlaceholder,
  HistoryEntry,
  HomeFeedResponse,
  OfflinePlaylist,
  Track,
  UserPlaylist,
} from '../types/music';
import { useUIStore } from './uiStore';

const MAX_HISTORY_ITEMS = 100;
const MAX_RECENT_SEARCHES = 15;

interface LibraryState {
  likedSongs: Track[];
  playlists: UserPlaylist[];
  history: HistoryEntry[];
  recentSearches: string[];
  downloads: DownloadPlaceholder[];
  offlinePlaylists: OfflinePlaylist[];
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
  retryOfflineDownload: (track: Track) => void;
  downloadTracksBatch: (
    tracks: Track[],
    playlistMeta?: { id: string; title: string; subtitle?: string; artwork?: string }
  ) => Promise<void>;
  removeOfflinePlaylist: (playlistId: string) => void;
  isDownloadedPlaceholder: (trackId: string) => boolean;
  getOfflineUri: (trackId: string) => string | null;

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
      offlinePlaylists: [],
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
        const existing = get().downloads.find((d) => d.track.id === track.id);
        if (existing) {
          deleteOfflineTrackFile(existing.localUri);
          set((state) => ({
            downloads: state.downloads.filter((d) => d.track.id !== track.id),
          }));
          useUIStore.getState().showToast('Removed from Offline Songs');
          return;
        }

        get().retryOfflineDownload(track);
      },

      retryOfflineDownload: (track) => {
        const quality = get().audioQuality;
        const estimated = Math.max(
          2.4,
          Number(((track.duration || 200) * 0.024).toFixed(1))
        );

        set((state) => {
          const others = state.downloads.filter((d) => d.track.id !== track.id);
          return {
            downloads: [
              {
                track,
                addedAt: Date.now(),
                status: 'downloading',
                estimatedSizeMb: estimated,
              },
              ...others,
            ],
          };
        });
        useUIStore.getState().showToast(`Downloading "${track.title}"...`);

        void downloadTrackAudio(track, quality)
          .then(({ localUri, sizeBytes, sizeMb }) => {
            set((state) => ({
              downloads: state.downloads.map((d) =>
                d.track.id === track.id
                  ? {
                      ...d,
                      status: 'downloaded',
                      localUri,
                      sizeBytes,
                      estimatedSizeMb: sizeMb,
                      error: undefined,
                    }
                  : d
              ),
            }));
            useUIStore.getState().showToast(`Saved "${track.title}" for offline`);
          })
          .catch((err) => {
            const msg = err instanceof Error ? err.message : 'Download failed';
            set((state) => ({
              downloads: state.downloads.map((d) =>
                d.track.id === track.id
                  ? { ...d, status: 'error', error: msg }
                  : d
              ),
            }));
            useUIStore.getState().showToast('Offline download failed');
          });
      },

      isDownloadedPlaceholder: (trackId) => get().downloads.some((d) => d.track.id === trackId),

      downloadTracksBatch: async (tracks, playlistMeta) => {
        if (tracks.length === 0) return;

        if (playlistMeta) {
          set((state) => {
            const others = state.offlinePlaylists.filter((p) => p.id !== playlistMeta.id);
            return {
              offlinePlaylists: [
                {
                  id: playlistMeta.id,
                  title: playlistMeta.title,
                  subtitle: playlistMeta.subtitle,
                  artwork: playlistMeta.artwork || tracks[0]?.artwork,
                  tracks,
                  savedAt: Date.now(),
                },
                ...others,
              ],
            };
          });
        }

        const currentDownloads = get().downloads;
        const pending = tracks.filter((t) => {
          const existing = currentDownloads.find((d) => d.track.id === t.id);
          return !existing || (existing.status !== 'downloaded' && existing.status !== 'downloading');
        });

        if (pending.length === 0) {
          useUIStore.getState().showToast('All playlist tracks are already saved offline');
          return;
        }

        const quality = get().audioQuality;
        useUIStore.getState().showToast(`Downloading ${pending.length} tracks for offline...`);

        set((state) => {
          const pendingIds = new Set(pending.map((t) => t.id));
          const kept = state.downloads.filter((d) => !pendingIds.has(d.track.id));
          const queuedEntries = pending.map((track) => ({
            track,
            addedAt: Date.now(),
            status: 'downloading' as const,
            estimatedSizeMb: Math.max(2.4, Number(((track.duration || 200) * 0.024).toFixed(1))),
          }));
          return { downloads: [...queuedEntries, ...kept] };
        });

        let successCount = 0;
        for (const track of pending) {
          try {
            const { localUri, sizeBytes, sizeMb } = await downloadTrackAudio(track, quality);
            successCount += 1;
            set((state) => ({
              downloads: state.downloads.map((d) =>
                d.track.id === track.id
                  ? {
                      ...d,
                      status: 'downloaded',
                      localUri,
                      sizeBytes,
                      estimatedSizeMb: sizeMb,
                      error: undefined,
                    }
                  : d
              ),
            }));
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Download failed';
            set((state) => ({
              downloads: state.downloads.map((d) =>
                d.track.id === track.id ? { ...d, status: 'error', error: msg } : d
              ),
            }));
          }
        }

        if (successCount > 0) {
          useUIStore
            .getState()
            .showToast(`Saved ${successCount} of ${pending.length} tracks for offline`);
        } else {
          useUIStore.getState().showToast('Playlist download failed');
        }
      },

      removeOfflinePlaylist: (playlistId) => {
        set((state) => ({
          offlinePlaylists: state.offlinePlaylists.filter((p) => p.id !== playlistId),
        }));
        useUIStore.getState().showToast('Removed playlist from Offline');
      },

      getOfflineUri: (trackId) => {
        const item = get().downloads.find((d) => d.track.id === trackId);
        if (!item || item.status !== 'downloaded') return null;
        return getPlayableOfflineUri(item.localUri);
      },

      setAudioQuality: (audioQuality) => set({ audioQuality }),

      setCachedHomeFeed: (cachedHomeFeed) => set({ cachedHomeFeed }),
    }),
    {
      name: 'apex-music-library-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
