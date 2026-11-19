import { PermissionsAndroid, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  AudioPlaylist,
  AudioPlaylistLoopMode,
  AudioPlaylistStatus,
  createAudioPlaylist,
  setAudioModeAsync,
} from 'expo-audio';
import { useUIStore } from '../store/uiStore';
import { Track } from '../types/music';
import { getHighResArtwork } from '../utils/format';

const isExpoGoAndroid =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export interface PlaybackStatusSnapshot {
  playing: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
}

class AudioService {
  private playlist: AudioPlaylist | null = null;
  private isConfigured = false;
  private isLockScreenActive = false;
  private loopMode: AudioPlaylistLoopMode = 'all';
  private queueSignature = '';
  private ignoreTrackChangesUntil = 0;
  private statusSub: { remove: () => void } | null = null;
  private trackSub: { remove: () => void } | null = null;
  private onStatusCallback: ((status: PlaybackStatusSnapshot) => void) | null = null;
  private onTrackIndexChangedCallback: ((index: number) => void) | null = null;
  private notificationPermissionChecked = false;

  async ensureNotificationPermission(): Promise<void> {
    if (
      this.notificationPermissionChecked ||
      Platform.OS !== 'android' ||
      Number(Platform.Version) < 33 ||
      isExpoGoAndroid
    ) {
      return;
    }
    try {
      const hasPerm = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!hasPerm) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          this.notificationPermissionChecked = true;
        } else {
          useUIStore
            .getState()
            .showToast('Enable Notifications in App Settings for player controls');
        }
      } else {
        this.notificationPermissionChecked = true;
      }
    } catch {
      // Activity may not be attached yet; will retry on next play
    }
  }

  async configureAudioSession(): Promise<void> {
    await this.ensureNotificationPermission();
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

  private attachPlaylistListeners(playlist: AudioPlaylist): void {
    this.statusSub?.remove();
    this.trackSub?.remove();

    this.statusSub = playlist.addListener(
      'playlistStatusUpdate',
      (status: AudioPlaylistStatus) => {
        if (this.playlist !== playlist) return;
        this.onStatusCallback?.({
          playing: status.playing,
          isBuffering: status.isBuffering,
          currentTime: status.currentTime ?? 0,
          duration: status.duration ?? 0,
        });
      }
    );

    this.trackSub = playlist.addListener(
      'trackChanged',
      (data: { currentIndex: number; previousIndex: number }) => {
        if (this.playlist !== playlist) return;
        if (Date.now() < this.ignoreTrackChangesUntil) return;
        this.onTrackIndexChangedCallback?.(data.currentIndex);
      }
    );
  }

  setOnStatusUpdate(cb: (status: PlaybackStatusSnapshot) => void): void {
    this.onStatusCallback = cb;
  }

  setOnTrackIndexChanged(cb: ((index: number) => void) | null): void {
    this.onTrackIndexChangedCallback = cb;
  }

  private buildSignature(tracks: Track[]): string {
    return tracks.map((t) => t.id).join('|');
  }

  private toMetadata(track: Track) {
    return {
      title: track.title,
      artist: track.artist,
      albumTitle: track.album || 'Apex Music',
      artworkUrl: getHighResArtwork(track.artwork),
    };
  }

  private applyLockScreen(playlist: AudioPlaylist, track: Track): void {
    if (isExpoGoAndroid) return;
    const metadata = this.toMetadata(track);
    try {
      if (!this.isLockScreenActive) {
        playlist.setActiveForLockScreen(true, metadata, {
          showNextTrack: true,
          showPreviousTrack: true,
          showSeekForward: false,
          showSeekBackward: false,
          isLiveStream: false,
        });
        this.isLockScreenActive = true;
      } else {
        playlist.updateLockScreenMetadata(metadata);
      }
    } catch (err) {
      console.warn('[AudioService] Lock screen controls unavailable:', err);
    }
  }

  async loadQueueAndPlay(
    tracks: Track[],
    startIndex: number,
    getUrl: (track: Track) => string
  ): Promise<void> {
    await this.configureAudioSession();
    const targetTrack = tracks[startIndex];
    if (!targetTrack) return;

    const sig = this.buildSignature(tracks);

    // If the exact same queue is already loaded in ExoPlayer, just jump to startIndex!
    if (this.playlist && this.queueSignature === sig && this.playlist.trackCount === tracks.length) {
      this.ignoreTrackChangesUntil = Date.now() + 350;
      if (this.playlist.currentIndex !== startIndex) {
        this.playlist.skipTo(startIndex);
      }
      this.applyLockScreen(this.playlist, targetTrack);
      this.playlist.play();
      return;
    }

    this.queueSignature = sig;
    this.ignoreTrackChangesUntil = Date.now() + 450;

    const sources = tracks.map((t) => ({ uri: getUrl(t) }));

    if (!this.playlist) {
      const playlist = createAudioPlaylist({
        sources,
        updateInterval: 250,
        loop: this.loopMode,
      });
      this.playlist = playlist;
      this.attachPlaylistListeners(playlist);
      if (startIndex > 0) {
        playlist.skipTo(startIndex);
      }
      this.applyLockScreen(playlist, targetTrack);
      playlist.play();
      return;
    }

    // Reuse the existing AudioPlaylist & MediaSession without unbinding notification controls
    const playlist = this.playlist;
    const oldCount = playlist.trackCount;
    playlist.pause();

    for (let i = 0; i < sources.length; i++) {
      playlist.insert(sources[i], i);
    }
    playlist.skipTo(startIndex);
    for (let i = oldCount + sources.length - 1; i >= sources.length; i--) {
      playlist.remove(i);
    }

    this.applyLockScreen(playlist, targetTrack);
    playlist.play();
  }

  appendToPlaylist(url: string, updatedTracks: Track[]): void {
    if (!this.playlist) return;
    this.queueSignature = this.buildSignature(updatedTracks);
    this.playlist.add({ uri: url });
  }

  insertIntoPlaylist(url: string, index: number, updatedTracks: Track[]): void {
    if (!this.playlist) return;
    this.queueSignature = this.buildSignature(updatedTracks);
    this.playlist.insert({ uri: url }, index);
  }

  removeFromPlaylist(index: number, updatedTracks: Track[]): void {
    if (!this.playlist) return;
    this.ignoreTrackChangesUntil = Date.now() + 250;
    this.queueSignature = this.buildSignature(updatedTracks);
    this.playlist.remove(index);
  }

  invalidateQueueSignature(): void {
    this.queueSignature = '';
  }

  updateLockScreenMetadata(track: Track): void {
    if (!this.playlist || isExpoGoAndroid) return;
    try {
      this.playlist.updateLockScreenMetadata(this.toMetadata(track));
    } catch {
      // Ignore if lock screen controls are not active
    }
  }

  play(): void {
    this.playlist?.play();
  }

  pause(): void {
    this.playlist?.pause();
  }

  async seekTo(seconds: number): Promise<void> {
    if (!this.playlist) return;
    await this.playlist.seekTo(Math.max(0, seconds));
  }

  setLoopMode(mode: AudioPlaylistLoopMode): void {
    this.loopMode = mode;
    if (this.playlist) {
      this.playlist.loop = mode;
    }
  }

  stopAndClear(): void {
    if (!this.playlist) return;
    this.playlist.pause();
    if (!isExpoGoAndroid) {
      try {
        this.playlist.clearLockScreenControls();
      } catch {
        // Ignore if lock screen controls were not active
      }
      this.isLockScreenActive = false;
    }
  }

  destroy(): void {
    this.statusSub?.remove();
    this.statusSub = null;
    this.trackSub?.remove();
    this.trackSub = null;
    this.queueSignature = '';
    if (this.playlist) {
      if (!isExpoGoAndroid) {
        try {
          this.playlist.clearLockScreenControls();
        } catch {
          // Ignore
        }
        this.isLockScreenActive = false;
      }
      this.playlist.destroy();
      this.playlist = null;
    }
  }
}

export const audioService = new AudioService();
