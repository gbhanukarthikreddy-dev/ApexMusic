import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState } from '../../components/ErrorState';
import { MediaCard } from '../../components/MediaCard';
import { MiniPlayer } from '../../components/MiniPlayer';
import { DetailSkeleton } from '../../components/Skeleton';
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
import { musicApi } from '../../services/musicApi';
import { usePlayerStore } from '../../store/playerStore';
import { colors, radii, spacing, typography } from '../../theme';
import { ArtistDetail, Track } from '../../types/music';
import { getHighResArtwork } from '../../utils/format';

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const [artist, setArtist] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const loadArtist = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await musicApi.getArtist(id);
      setArtist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artist.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadArtist();
  }, [loadArtist]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.topNav}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text numberOfLines={1} style={[typography.subtitle, styles.navTitle]}>
            {artist?.name || 'Artist'}
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
            <ErrorState message={error} onRetry={() => void loadArtist()} />
          ) : artist ? (
            <>
              <View style={styles.heroWrap}>
                <Image
                  source={{ uri: getHighResArtwork(artist.artwork) }}
                  style={styles.heroBlurBg}
                  contentFit="cover"
                  blurRadius={70}
                  cachePolicy="memory-disk"
                />
                <BlurView
                  intensity={50}
                  tint="systemThinMaterialDark"
                  blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.heroGlassScrim} pointerEvents="none" />
                <View style={styles.hero}>
                  <Image
                    source={{ uri: getHighResArtwork(artist.artwork) }}
                    style={styles.heroArt}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                  <Text style={[typography.display, styles.artistName]}>{artist.name}</Text>
                  {artist.subscribers ? (
                    <Text style={typography.caption}>{artist.subscribers}</Text>
                  ) : null}

                  {artist.topSongs.length > 0 ? (
                    <View style={styles.ctaRow}>
                      <Pressable
                        onPress={() => playQueue(artist.topSongs, 0, false)}
                        style={styles.playBtn}
                      >
                        <Ionicons name="play" size={18} color={colors.textInverse} />
                        <Text style={styles.playBtnText}>Play</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => playQueue(artist.topSongs, 0, true)}
                        style={styles.shuffleBtn}
                      >
                        <Ionicons name="shuffle" size={18} color={colors.textPrimary} />
                        <Text style={styles.shuffleBtnText}>Shuffle</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>

              {artist.topSongs.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[typography.h2, styles.sectionTitle]}>Top Songs</Text>
                  {artist.topSongs.map((track, idx) => (
                    <TrackRow
                      key={`${track.id}_${idx}`}
                      track={track}
                      index={idx}
                      showIndex
                      onPress={() => playTrack(track, artist.topSongs)}
                      onMorePress={setSelectedTrack}
                    />
                  ))}
                </View>
              ) : null}

              {artist.albums.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[typography.h2, styles.sectionTitle]}>Albums</Text>
                  <FlatList
                    data={artist.albums}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carousel}
                    keyExtractor={(item, idx) => `${item.id}_${idx}`}
                    renderItem={({ item }) => (
                      <MediaCard
                        title={item.title}
                        subtitle={item.year || 'Album'}
                        artwork={item.artwork}
                        onPress={() => router.push(`/album/${item.id}`)}
                      />
                    )}
                  />
                </View>
              ) : null}

              {artist.singles.length > 0 ? (
                <View style={styles.section}>
                  <Text style={[typography.h2, styles.sectionTitle]}>Singles & EPs</Text>
                  <FlatList
                    data={artist.singles}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carousel}
                    keyExtractor={(item, idx) => `${item.id}_${idx}`}
                    renderItem={({ item }) => (
                      <MediaCard
                        title={item.title}
                        subtitle={item.year || 'Single'}
                        artwork={item.artwork}
                        onPress={() => router.push(`/album/${item.id}`)}
                      />
                    )}
                  />
                </View>
              ) : null}
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
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  heroWrap: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  heroBlurBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  heroGlassScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 7, 9, 0.56)',
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
  heroArt: {
    width: 156,
    height: 156,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  artistName: {
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
    backgroundColor: colors.textPrimary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: colors.glassHighlight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  shuffleBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  section: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: spacing.md,
  },
  carousel: {
    paddingHorizontal: spacing.md,
  },
});
