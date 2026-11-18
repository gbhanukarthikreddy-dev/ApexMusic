import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { AudioPlayer, AudioStatus, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Track } from '../types/music';
import { getHighResArtwork } from '../utils/format';

const isExpoGoAndroid =
  Platform.OS === 'android' &&
  (Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.expoGoConfig != null);

class AudioService {
  private player: AudioPlayer | null = null;
  private isConfigured = false;
  private subscription: { remove: () => void } | null = null;
  private onStatusCallback: ((status: AudioStatus) => void) | null = null;

  async configureAudioSession(): Promise<void> {
    if (this.isConfigured) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMixPersistent',
        allowsRecording: false,
        shouldRouteThroughEarpiece: false,
      });
      this.isConfigured = true;
    } catch (err) {
      console.warn('[AudioService] Failed to configure audio mode:', err);
    }
  }

  private ensurePlayer(initialSource: { uri: string } | null = null): AudioPlayer {
    if (!this.player) {
      this.player = createAudioPlayer(initialSource, {
        updateInterval: 250,
        keepAudioSessionActive: true,
      });
      this.subscription = this.player.addListener('playbackStatusUpdate', (status) => {
        this.onStatusCallback?.(status);
      });
    }
    return this.player;
  }

  setOnStatusUpdate(cb: (status: AudioStatus) => void): void {
    this.onStatusCallback = cb;
  }

  async loadAndPlay(url: string, track: Track): Promise<void> {
    await this.configureAudioSession();
    const isNewPlayer = !this.player;
    const player = this.ensurePlayer({ uri: url });
    if (!isNewPlayer) {
      player.replace({ uri: url });
    }

    // Android lock-screen / media notification service binding requires a development build or
    // standalone APK with enableBackgroundPlayback: true in app.json; skip in Expo Go.
    if (!isExpoGoAndroid) {
      try {
        player.setActiveForLockScreen(
          true,
          {
            title: track.title,
            artist: track.artist,
            albumTitle: track.album || 'Apex Music',
            artworkUrl: getHighResArtwork(track.artwork),
          },
          {
            showNextTrack: true,
            showPreviousTrack: true,
            showSeekForward: true,
            showSeekBackward: true,
          }
        );
      } catch (err) {
        console.warn('[AudioService] Lock screen controls unavailable:', err);
      }
    }

    player.play();
  }

  updateLockScreenMetadata(track: Track): void {
    if (!this.player || isExpoGoAndroid) return;
    try {
      this.player.updateLockScreenMetadata({
        title: track.title,
        artist: track.artist,
        albumTitle: track.album || 'Apex Music',
        artworkUrl: getHighResArtwork(track.artwork),
      });
    } catch {
      // Ignore if lock screen controls are not active
    }
  }

  play(): void {
    this.player?.play();
  }

  pause(): void {
    this.player?.pause();
  }

  async seekTo(seconds: number): Promise<void> {
    if (!this.player) return;
    await this.player.seekTo(Math.max(0, seconds));
  }

  setLoop(loop: boolean): void {
    if (this.player) {
      this.player.loop = loop;
    }
  }

  stopAndClear(): void {
    if (!this.player) return;
    this.player.pause();
    if (!isExpoGoAndroid) {
      try {
        this.player.clearLockScreenControls();
      } catch {
        // Ignore if lock screen controls were not active
      }
    }
  }

  destroy(): void {
    this.subscription?.remove();
    this.subscription = null;
    if (this.player) {
      if (!isExpoGoAndroid) {
        try {
          this.player.clearLockScreenControls();
        } catch {
          // Ignore
        }
      }
      this.player.remove();
      this.player = null;
    }
  }
}

export const audioService = new AudioService();
