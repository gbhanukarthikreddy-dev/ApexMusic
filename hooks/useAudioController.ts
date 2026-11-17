import { useEffect } from 'react';
import { audioService } from '../services/audioService';
import { usePlayerStore } from '../store/playerStore';

export function useAudioController(): void {
  useEffect(() => {
    void audioService.configureAudioSession();

    audioService.setOnStatusUpdate((status) => {
      const store = usePlayerStore.getState();

      store.syncPlaybackStatus({
        isPlaying: status.playing,
        isBuffering: status.isBuffering,
        position: status.currentTime ?? 0,
        duration: status.duration ?? 0,
      });

      if (status.didJustFinish) {
        void store.handleTrackFinished();
      }
    });

    return () => {
      audioService.setOnStatusUpdate(() => {});
    };
  }, []);
}
