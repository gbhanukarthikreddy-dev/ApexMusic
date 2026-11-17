import { create } from 'zustand';
import { audioService } from '../services/audioService';
import { musicApi } from '../services/musicApi';
import { RepeatMode, Track } from '../types/music';
import { arrayMove, shuffleArray } from '../utils/format';
import { useLibraryStore } from './libraryStore';

interface PlayerState {
  queue: Track[];
  originalQueue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoadingStream: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;
  streamError: string | null;
  streamUrl: string | null;
  activeRequestId: number;

  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  playQueue: (tracks: Track[], startIndex?: number, shuffleStart?: boolean) => Promise<void>;
  playAtIndex: (index: number) => Promise<void>;
  togglePlayPause: () => void;
  playNext: (autoAdvance?: boolean) => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;

  addToQueue: (track: Track) => void;
  playNextInQueue: (track: Track) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  retryCurrentTrack: () => Promise<void>;
  handleTrackFinished: () => Promise<void>;
  syncPlaybackStatus: (patch: {
    isPlaying: boolean;
    isBuffering: boolean;
    position: number;
    duration: number;
  }) => void;
}

async function loadTrackByIndex(
  index: number,
  queue: Track[],
  requestId: number,
  set: (partial: Partial<PlayerState>) => void,
  get: () => PlayerState
): Promise<void> {
  const track = queue[index];
  if (!track) return;

  set({
    currentIndex: index,
    currentTrack: track,
    isLoadingStream: true,
    isBuffering: true,
    streamError: null,
    position: 0,
    duration: track.duration || 0,
    activeRequestId: requestId,
  });

  useLibraryStore.getState().recordPlay(track);

  try {
    const quality = useLibraryStore.getState().audioQuality;
    const stream = await musicApi.getStreamUrl(track.id, quality);

    // Ignore stale request if user already skipped to another track
    if (get().activeRequestId !== requestId) return;

    await audioService.loadAndPlay(stream.url, track);
    if (get().activeRequestId !== requestId) return;

    audioService.setLoop(get().repeatMode === 'one');
    set({
      streamUrl: stream.url,
      isLoadingStream: false,
      isPlaying: true,
      streamError: null,
    });

    // Pre-warm the next track in the queue so skipping is instant
    const nextTrack = queue[index + 1];
    if (nextTrack) {
      musicApi.prefetchStream(nextTrack.id, quality);
    }
  } catch (err) {
    if (get().activeRequestId !== requestId) return;
    set({
      isLoadingStream: false,
      isBuffering: false,
      isPlaying: false,
      streamError: err instanceof Error ? err.message : 'Failed to load audio stream.',
    });
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  currentTrack: null,
  isPlaying: false,
  isLoadingStream: false,
  isBuffering: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeatMode: 'off',
  streamError: null,
  streamUrl: null,
  activeRequestId: 0,

  playTrack: async (track, newQueue) => {
    const baseQueue = newQueue && newQueue.length > 0 ? newQueue : [track];
    const targetIndex = Math.max(
      0,
      baseQueue.findIndex((t) => t.id === track.id)
    );

    const requestId = get().activeRequestId + 1;
    let finalQueue = baseQueue;
    let finalIndex = targetIndex;

    if (get().shuffle && baseQueue.length > 1) {
      const rest = baseQueue.filter((_, i) => i !== targetIndex);
      finalQueue = [baseQueue[targetIndex], ...shuffleArray(rest)];
      finalIndex = 0;
    }

    set({
      queue: finalQueue,
      originalQueue: baseQueue,
    });

    await loadTrackByIndex(finalIndex, finalQueue, requestId, set, get);
  },

  playQueue: async (tracks, startIndex = 0, shuffleStart = false) => {
    if (tracks.length === 0) return;

    const requestId = get().activeRequestId + 1;
    const safeStart = Math.max(0, Math.min(startIndex, tracks.length - 1));
    const shouldShuffle = shuffleStart || get().shuffle;

    let finalQueue = tracks;
    let finalIndex = safeStart;

    if (shouldShuffle) {
      if (shuffleStart) {
        finalQueue = shuffleArray(tracks);
        finalIndex = 0;
      } else {
        const current = tracks[safeStart];
        const rest = tracks.filter((_, i) => i !== safeStart);
        finalQueue = [current, ...shuffleArray(rest)];
        finalIndex = 0;
      }
      set({ shuffle: true });
    }

    set({
      queue: finalQueue,
      originalQueue: tracks,
    });

    await loadTrackByIndex(finalIndex, finalQueue, requestId, set, get);
  },

  playAtIndex: async (index) => {
    const { queue, activeRequestId } = get();
    if (index < 0 || index >= queue.length) return;
    await loadTrackByIndex(index, queue, activeRequestId + 1, set, get);
  },

  togglePlayPause: () => {
    const { isPlaying, currentTrack, streamUrl, isLoadingStream } = get();
    if (!currentTrack || isLoadingStream) return;
    if (!streamUrl) {
      void get().retryCurrentTrack();
      return;
    }
    if (isPlaying) {
      audioService.pause();
      set({ isPlaying: false });
    } else {
      audioService.play();
      set({ isPlaying: true });
    }
  },

  playNext: async (autoAdvance = false) => {
    const { queue, currentIndex, repeatMode, activeRequestId } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all' || !autoAdvance) {
        nextIndex = 0;
      } else {
        audioService.pause();
        set({ isPlaying: false, position: 0 });
        return;
      }
    }

    await loadTrackByIndex(nextIndex, queue, activeRequestId + 1, set, get);
  },

  playPrevious: async () => {
    const { queue, currentIndex, position, activeRequestId, repeatMode } = get();
    if (queue.length === 0) return;

    // Restart current track if past 3 seconds
    if (position > 3) {
      await get().seekTo(0);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
    }

    await loadTrackByIndex(prevIndex, queue, activeRequestId + 1, set, get);
  },

  seekTo: async (seconds) => {
    set({ position: Math.max(0, seconds) });
    await audioService.seekTo(seconds);
  },

  toggleShuffle: () => {
    const { shuffle, queue, originalQueue, currentTrack } = get();
    const nextShuffle = !shuffle;

    if (!currentTrack || queue.length <= 1) {
      set({ shuffle: nextShuffle });
      return;
    }

    if (nextShuffle) {
      const rest = queue.filter((t) => t.id !== currentTrack.id);
      const shuffled = [currentTrack, ...shuffleArray(rest)];
      set({
        shuffle: true,
        queue: shuffled,
        currentIndex: 0,
      });
    } else {
      const restored = originalQueue.length > 0 ? originalQueue : queue;
      const restoredIndex = Math.max(
        0,
        restored.findIndex((t) => t.id === currentTrack.id)
      );
      set({
        shuffle: false,
        queue: restored,
        currentIndex: restoredIndex,
      });
    }
  },

  cycleRepeatMode: () => {
    const order: RepeatMode[] = ['off', 'all', 'one'];
    const current = get().repeatMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    audioService.setLoop(next === 'one');
    set({ repeatMode: next });
  },

  addToQueue: (track) => {
    const { queue, currentTrack } = get();
    if (!currentTrack) {
      void get().playTrack(track);
      return;
    }
    set((state) => ({
      queue: [...state.queue, track],
      originalQueue: [...state.originalQueue, track],
    }));
  },

  playNextInQueue: (track) => {
    const { queue, currentIndex, currentTrack } = get();
    if (!currentTrack || queue.length === 0) {
      void get().playTrack(track);
      return;
    }
    const insertAt = currentIndex + 1;
    const nextQueue = [...queue];
    nextQueue.splice(insertAt, 0, track);
    set((state) => ({
      queue: nextQueue,
      originalQueue: [...state.originalQueue, track],
    }));
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, currentIndex } = get();
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= queue.length ||
      toIndex >= queue.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const updated = arrayMove(queue, fromIndex, toIndex);
    let nextCurrentIndex = currentIndex;
    if (fromIndex === currentIndex) {
      nextCurrentIndex = toIndex;
    } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
      nextCurrentIndex = currentIndex - 1;
    } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
      nextCurrentIndex = currentIndex + 1;
    }

    set({
      queue: updated,
      currentIndex: nextCurrentIndex,
    });
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex, activeRequestId } = get();
    if (index < 0 || index >= queue.length) return;

    const updated = queue.filter((_, i) => i !== index);
    if (updated.length === 0) {
      audioService.stopAndClear();
      set({
        queue: [],
        originalQueue: [],
        currentIndex: -1,
        currentTrack: null,
        isPlaying: false,
        position: 0,
        duration: 0,
        streamUrl: null,
        streamError: null,
      });
      return;
    }

    if (index === currentIndex) {
      const nextIndex = Math.min(index, updated.length - 1);
      set({ queue: updated });
      void loadTrackByIndex(nextIndex, updated, activeRequestId + 1, set, get);
    } else {
      const nextCurrentIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
      set({
        queue: updated,
        currentIndex: nextCurrentIndex,
      });
    }
  },

  clearQueue: () => {
    const { currentTrack } = get();
    if (!currentTrack) return;
    set({
      queue: [currentTrack],
      originalQueue: [currentTrack],
      currentIndex: 0,
    });
  },

  retryCurrentTrack: async () => {
    const { currentIndex, queue, activeRequestId } = get();
    if (currentIndex < 0 || currentIndex >= queue.length) return;
    await loadTrackByIndex(currentIndex, queue, activeRequestId + 1, set, get);
  },

  handleTrackFinished: async () => {
    const { repeatMode } = get();
    if (repeatMode === 'one') {
      await get().seekTo(0);
      audioService.play();
      set({ isPlaying: true });
      return;
    }
    await get().playNext(true);
  },

  syncPlaybackStatus: (patch) => {
    set((state) => ({
      isPlaying: state.isLoadingStream ? state.isPlaying : patch.isPlaying,
      isBuffering: patch.isBuffering,
      position: patch.position,
      duration: patch.duration > 0 ? patch.duration : state.duration,
    }));
  },
}));
