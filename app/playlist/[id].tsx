import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState } from '../../components/ErrorState';
import { MiniPlayer } from '../../components/MiniPlayer';
import { DetailSkeleton } from '../../components/Skeleton';
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
import { musicApi } from '../../services/musicApi';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { colors, radii, spacing, typography } from '../../theme';
import { PlaylistDetail, Track } from '../../types/music';
import { getHighResArtwork } from '../../utils/format';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const isLocal = Boolean(id?.startsWith('pl_'));
  const localPlaylist = useLibraryStore((s) =>
    isLocal ? s.playlists.find((p) => p.id === id) : undefined
  );
  const removeTrackFromPlaylist = useLibraryStore((s) => s.removeTrackFromPlaylist);

  const [remotePlaylist, setRemotePlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(!isLocal);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const loadRemotePlaylist = useCallback(async () => {
    if (!id || isLocal) return;
    setLoading(true);
    setError(null);
    try {
      const data = await musicApi.getPlaylist(id);
      setRemotePlaylist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist.');
    } finally {
      setLoading(false);
    }
  }, [id, isLocal]);

  useEffect(() => {
    if (!isLocal) {
      void loadRemotePlaylist();
    }
  }, [isLocal, loadRemotePlaylist]);

  const playlist: PlaylistDetail | null = isLocal
    ? localPlaylist
      ? {
          id: localPlaylist.id,
          title: localPlaylist.name,
          subtitle:
            localPlaylist.description ||
            `${localPlaylist.tracks.length} tracks`,
          artwork: localPlaylist.tracks[0]?.artwork || '',
          tracks: localPlaylist.tracks,
        }
      : null
    : remotePlaylist;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} style={[typography.subtitle, styles.navTitle]}>
            {playlist?.title || 'Playlist'}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: hasMiniPlayer ? 96 : 32 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <DetailSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void loadRemotePlaylist()} />
          ) : playlist ? (
            <>
              <View style={styles.heroWrap}>
                {playlist.artwork ? (
                  <Image
                    source={{ uri: getHighResArtwork(playlist.artwork) }}
                    style={styles.heroBlurBg}
                    contentFit="cover"
                    blurRadius={70}
                    cachePolicy="memory-disk"
                  />
                ) : null}
                <LinearGradient
                  colors={['rgba(7, 7, 11, 0.35)', colors.background]}
                  style={styles.hero}
                >
                  {playlist.artwork ? (
                    <Image
                      source={{ uri: getHighResArtwork(playlist.artwork) }}
                      style={styles.heroArt}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.heroArt, styles.fallbackArt]}>
                      <Image
                        source={require('../../assets/logo.png')}
                        style={styles.fallbackLogo}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </View>
                  )}
                  <Text style={[typography.h1, styles.title]}>{playlist.title}</Text>
                  {playlist.subtitle ? (
                    <Text style={[typography.caption, styles.subtitle]}>
                      {playlist.subtitle}
                    </Text>
                  ) : null}

                  {playlist.tracks.length > 0 ? (
                    <View style={styles.ctaRow}>
                      <Pressable
                        onPress={() => playQueue(playlist.tracks, 0, false)}
                        style={styles.playBtn}
                      >
                        <Ionicons name="play" size={18} color={colors.textInverse} />
                        <Text style={styles.playBtnText}>Play</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => playQueue(playlist.tracks, 0, true)}
                        style={styles.shuffleBtn}
                      >
                        <Ionicons name="shuffle" size={18} color={colors.accentLight} />
                        <Text style={styles.shuffleBtnText}>Shuffle</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </LinearGradient>
              </View>

              <View style={styles.trackList}>
                {playlist.tracks.length === 0 ? (
                  <View style={styles.emptyTracks}>
                    <Text style={typography.caption}>
                      This playlist is empty. Add songs from any track menu.
                    </Text>
                  </View>
                ) : (
                  playlist.tracks.map((track, idx) => (
                    <View key={`${track.id}_${idx}`} style={styles.trackRowWrap}>
                      <View style={styles.trackFlex}>
                        <TrackRow
                          track={track}
                          index={idx}
                          showIndex
                          onPress={() => playTrack(track, playlist.tracks)}
                          onMorePress={setSelectedTrack}
                        />
                      </View>
                      {isLocal ? (
                        <Pressable
                          onPress={() => removeTrackFromPlaylist(playlist.id, track.id)}
                          hitSlop={8}
                          style={styles.removeBtn}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={20}
                            color={colors.textMuted}
                          />
                        </Pressable>
                      ) : null}
                    </View>
                  ))
                )}
              </View>
            </>
          ) : (
            <ErrorState title="Playlist not found" message="This playlist may have been deleted." />
          )}
        </ScrollView>
      </SafeAreaView>

      <MiniPlayer bottomOffset={16} />

      <TrackActionSheet
        track={selectedTrack}
        visible={Boolean(selectedTrack)}
        onClose={() => setSelectedTrack(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  heroWrap: {
    overflow: 'hidden',
  },
  heroBlurBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.65,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  heroArt: {
    width: 200,
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.sm,
  },
  fallbackArt: {
    backgroundColor: '#0F0F19',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  fallbackLogo: {
    width: '100%',
    height: '100%',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  playBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  shuffleBtnText: {
    color: colors.accentLight,
    fontWeight: '700',
    fontSize: 15,
  },
  trackList: {
    marginTop: spacing.xs,
  },
  emptyTracks: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  trackRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackFlex: {
    flex: 1,
  },
  removeBtn: {
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
  },
});
