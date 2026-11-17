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
import { usePlayerStore } from '../../store/playerStore';
import { colors, radii, spacing, typography } from '../../theme';
import { AlbumDetail, Track } from '../../types/music';
import { getHighResArtwork } from '../../utils/format';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const loadAlbum = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await musicApi.getAlbum(id);
      setAlbum(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load album.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadAlbum();
  }, [loadAlbum]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} style={[typography.subtitle, styles.navTitle]}>
            {album?.title || 'Album'}
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
            <ErrorState message={error} onRetry={() => void loadAlbum()} />
          ) : album ? (
            <>
              <View style={styles.heroWrap}>
                <Image
                  source={{ uri: getHighResArtwork(album.artwork) }}
                  style={styles.heroBlurBg}
                  contentFit="cover"
                  blurRadius={70}
                  cachePolicy="memory-disk"
                />
                <LinearGradient
                  colors={['rgba(7, 7, 11, 0.35)', colors.background]}
                  style={styles.hero}
                >
                  <Image
                    source={{ uri: getHighResArtwork(album.artwork) }}
                    style={styles.heroArt}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <Text style={[typography.h1, styles.title]}>{album.title}</Text>
                  <Pressable
                    disabled={!album.artistId}
                    onPress={() => {
                      if (album.artistId) {
                        router.push(`/artist/${album.artistId}`);
                      }
                    }}
                  >
                    <Text style={styles.artistLink}>
                      {album.artist}
                      {album.year ? ` • ${album.year}` : ''}
                    </Text>
                  </Pressable>

                  {album.tracks.length > 0 ? (
                    <View style={styles.ctaRow}>
                      <Pressable
                        onPress={() => playQueue(album.tracks, 0, false)}
                        style={styles.playBtn}
                      >
                        <Ionicons name="play" size={18} color={colors.textInverse} />
                        <Text style={styles.playBtnText}>Play</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => playQueue(album.tracks, 0, true)}
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
                {album.tracks.map((track, idx) => (
                  <TrackRow
                    key={`${track.id}_${idx}`}
                    track={track}
                    index={idx}
                    showIndex
                    onPress={() => playTrack(track, album.tracks)}
                    onMorePress={setSelectedTrack}
                  />
                ))}
              </View>
            </>
          ) : null}
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
    width: 210,
    height: 210,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  title: {
    textAlign: 'center',
  },
  artistLink: {
    color: colors.accentLight,
    fontSize: 15,
    fontWeight: '600',
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
});
