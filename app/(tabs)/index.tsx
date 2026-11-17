import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApexLogo } from '../../components/ApexLogo';
import { ErrorState } from '../../components/ErrorState';
import { MediaCard } from '../../components/MediaCard';
import { HomeSkeleton } from '../../components/Skeleton';
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
import { musicApi } from '../../services/musicApi';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { colors, radii, spacing, typography } from '../../theme';
import {
  AlbumSummary,
  HomeFeedResponse,
  PlaylistSummary,
  Track,
} from '../../types/music';
import { getHighResArtwork } from '../../utils/format';
import { triggerLightHaptic, triggerSelectionHaptic } from '../../utils/haptics';

type HomeFilter = 'all' | 'releases' | 'trending' | 'playlists';

const FILTERS: Array<{ key: HomeFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'releases', label: 'New Release' },
  { key: 'trending', label: 'Trending' },
  { key: 'playlists', label: 'Top Playlists' },
];

const HERO_CARD_PALETTES = [
  { bg: '#CFA7F8', playBg: '#4A1D7A', text: '#13111C', sub: '#322845' },
  { bg: '#C6E63B', playBg: '#1D2905', text: '#111408', sub: '#323B16' },
  { bg: '#F2B5D4', playBg: '#5C163B', text: '#1A0E16', sub: '#452436' },
  { bg: '#9AD4F5', playBg: '#0E3A5C', text: '#0B1622', sub: '#213B52' },
] as const;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CURATED_CARD_WIDTH = SCREEN_WIDTH - 68;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Hi, Listener';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const likedSongs = useLibraryStore((s) => s.likedSongs);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const downloads = useLibraryStore((s) => s.downloads);
  const toggleDownloadPlaceholder = useLibraryStore((s) => s.toggleDownloadPlaceholder);
  const cachedHomeFeed = useLibraryStore((s) => s.cachedHomeFeed);
  const setCachedHomeFeed = useLibraryStore((s) => s.setCachedHomeFeed);

  const [feed, setFeed] = useState<HomeFeedResponse | null>(cachedHomeFeed);
  const [loading, setLoading] = useState(!cachedHomeFeed);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [activeFilter, setActiveFilter] = useState<HomeFilter>('all');

  useEffect(() => {
    if (cachedHomeFeed && !feed) {
      setFeed(cachedHomeFeed);
      setLoading(false);
    }
  }, [cachedHomeFeed, feed]);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (!useLibraryStore.getState().cachedHomeFeed) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await musicApi.getHomeFeed(isRefresh);
      setFeed(data);
      setCachedHomeFeed(data);
    } catch (err) {
      if (!useLibraryStore.getState().cachedHomeFeed) {
        setError(err instanceof Error ? err.message : 'Failed to load home feed.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setCachedHomeFeed]);

  useEffect(() => {
    void fetchFeed();
  }, [fetchFeed]);

  const handleAlbumPress = useCallback(
    (album: AlbumSummary) => {
      router.push(`/album/${album.id}`);
    },
    [router]
  );

  const handlePlaylistPress = useCallback(
    (playlist: PlaylistSummary) => {
      router.push(`/playlist/${playlist.id}`);
    },
    [router]
  );

  const showCurated = activeFilter === 'all' || activeFilter === 'trending';
  const showPlaylists = activeFilter === 'all' || activeFilter === 'playlists';
  const showReleases = activeFilter === 'all' || activeFilter === 'releases';

  const bottomPad = insets.bottom + (hasMiniPlayer ? 168 : 98);

  return (
    <View style={styles.root}>
      {/* Reference-style soft top-left pink/violet ambient aura */}
      <LinearGradient
        colors={['rgba(236, 72, 153, 0.34)', 'rgba(139, 92, 246, 0.22)', 'rgba(14, 14, 18, 0)']}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.8, y: 0.85 }}
        style={styles.topLeftAura}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchFeed(true)}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header Row */}
          <View style={styles.headerBlock}>
            <View style={styles.topRow}>
              <Pressable
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/queue');
                }}
                style={styles.avatarWrap}
              >
                <ApexLogo size="md" />
              </Pressable>

              <View style={styles.topRightActions}>
                <Pressable
                  onPress={() => {
                    triggerLightHaptic();
                    router.push('/(tabs)/search');
                  }}
                  style={styles.circleIconBtn}
                  hitSlop={8}
                >
                  <Ionicons name="search" size={19} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    triggerLightHaptic();
                    router.push('/(tabs)/library');
                  }}
                  style={styles.circleIconBtn}
                  hitSlop={8}
                >
                  <Ionicons name="heart-outline" size={19} color={colors.textPrimary} />
                </Pressable>
              </View>
            </View>

            <Text style={styles.greetingTitle}>{getGreeting()}</Text>

            {/* Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {FILTERS.map((f) => {
                const active = activeFilter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => {
                      triggerSelectionHaptic();
                      setActiveFilter(f.key);
                    }}
                    style={[styles.filterPill, active && styles.filterPillActive]}
                  >
                    <Text style={[styles.filterText, active && styles.filterTextActive]}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {loading && !feed ? (
            <HomeSkeleton />
          ) : error && !feed ? (
            <ErrorState
              title="Could not load Apex Music"
              message={error}
              onRetry={() => fetchFeed(false)}
            />
          ) : feed ? (
            <>
              {/* Curated & trending wide cards */}
              {showCurated && feed.trending.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={typography.h2}>Curated & trending</Text>
                  </View>

                  <FlatList
                    data={feed.trending.slice(0, 6)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.curatedList}
                    decelerationRate="fast"
                    snapToInterval={CURATED_CARD_WIDTH + 12}
                    initialNumToRender={3}
                    maxToRenderPerBatch={3}
                    removeClippedSubviews
                    keyExtractor={(item) => `curated_${item.id}`}
                    renderItem={({ item, index }) => {
                      const palette = HERO_CARD_PALETTES[index % HERO_CARD_PALETTES.length];
                      const liked = likedSongs.some((t) => t.id === item.id);
                      const saved = downloads.some((d) => d.track.id === item.id);

                      return (
                        <Pressable
                          onPress={() => {
                            triggerLightHaptic();
                            void playTrack(item, feed.trending);
                          }}
                          style={[styles.curatedCard, { backgroundColor: palette.bg }]}
                        >
                          <View style={styles.curatedLeft}>
                            <View style={styles.curatedTextBlock}>
                              <Text
                                numberOfLines={1}
                                style={[styles.curatedTitle, { color: palette.text }]}
                              >
                                {item.title}
                              </Text>
                              <Text
                                numberOfLines={2}
                                style={[styles.curatedSub, { color: palette.sub }]}
                              >
                                {item.artist}
                                {item.album ? ` • ${item.album}` : ''}
                              </Text>
                            </View>

                            <View style={styles.curatedActions}>
                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  triggerLightHaptic();
                                  void playTrack(item, feed.trending);
                                }}
                                style={[styles.curatedPlayBtn, { backgroundColor: palette.playBg }]}
                              >
                                <Ionicons
                                  name="play"
                                  size={18}
                                  color="#FFFFFF"
                                  style={styles.playIconNudge}
                                />
                              </Pressable>

                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  triggerLightHaptic();
                                  toggleLike(item);
                                }}
                                hitSlop={8}
                              >
                                <Ionicons
                                  name={liked ? 'heart' : 'heart-outline'}
                                  size={20}
                                  color={palette.text}
                                />
                              </Pressable>

                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  triggerLightHaptic();
                                  toggleDownloadPlaceholder(item);
                                }}
                                hitSlop={8}
                              >
                                <Ionicons
                                  name={saved ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
                                  size={20}
                                  color={palette.text}
                                />
                              </Pressable>

                              <Pressable
                                onPress={(e) => {
                                  e.stopPropagation();
                                  setSelectedTrack(item);
                                }}
                                hitSlop={8}
                              >
                                <Ionicons
                                  name="ellipsis-horizontal"
                                  size={19}
                                  color={palette.text}
                                />
                              </Pressable>
                            </View>
                          </View>

                          <Image
                            source={{ uri: getHighResArtwork(item.artwork) }}
                            style={styles.curatedArt}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                          />
                        </Pressable>
                      );
                    }}
                  />
                </View>
              ) : null}

              {/* Top daily playlists (vertical reference-style list) */}
              {showPlaylists && feed.recommendedPlaylists.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={typography.h2}>Top daily playlists</Text>
                    <Pressable onPress={() => router.push('/(tabs)/search')}>
                      <Text style={styles.seeAll}>See all</Text>
                    </Pressable>
                  </View>

                  <View style={styles.playlistList}>
                    {feed.recommendedPlaylists.slice(0, 5).map((pl) => (
                      <Pressable
                        key={pl.id}
                        onPress={() => {
                          triggerSelectionHaptic();
                          handlePlaylistPress(pl);
                        }}
                        style={({ pressed }) => [
                          styles.playlistRow,
                          pressed && styles.playlistRowPressed,
                        ]}
                      >
                        <Image
                          source={{ uri: getHighResArtwork(pl.artwork) }}
                          style={styles.playlistThumb}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                        <View style={styles.playlistMeta}>
                          <Text numberOfLines={1} style={styles.playlistTitle}>
                            {pl.title}
                          </Text>
                          <Text numberOfLines={1} style={styles.playlistSub}>
                            {pl.subtitle || 'Apex Curated Mix'}
                          </Text>
                        </View>
                        <View style={styles.playlistPlayCircle}>
                          <Ionicons
                            name="play"
                            size={14}
                            color={colors.textPrimary}
                            style={styles.playIconSmallNudge}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* New Releases Carousel */}
              {showReleases && feed.newReleases.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={typography.h2}>New releases</Text>
                    <Pressable onPress={() => router.push('/(tabs)/search')}>
                      <Text style={styles.seeAll}>See all</Text>
                    </Pressable>
                  </View>
                  <FlatList
                    data={feed.newReleases}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselList}
                    decelerationRate="fast"
                    snapToInterval={166}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    removeClippedSubviews
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <MediaCard
                        title={item.title}
                        subtitle={[item.artist, item.year].filter(Boolean).join(' • ')}
                        artwork={item.artwork}
                        onPress={() => handleAlbumPress(item)}
                        badge={item.type || 'Album'}
                        size={150}
                      />
                    )}
                  />
                </View>
              ) : null}

              {/* Quick Picks Tracks */}
              {showCurated && feed.trending.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={typography.h2}>Quick picks</Text>
                    <Pressable
                      onPress={() => {
                        triggerLightHaptic();
                        void playQueue(feed.trending, 0, true);
                      }}
                    >
                      <Text style={styles.seeAll}>Shuffle all</Text>
                    </Pressable>
                  </View>
                  <View>
                    {feed.trending.slice(0, 8).map((track, idx) => (
                      <TrackRow
                        key={`${track.id}_${idx}`}
                        track={track}
                        onPress={() => void playTrack(track, feed.trending)}
                        onMorePress={setSelectedTrack}
                      />
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        <TrackActionSheet
          track={selectedTrack}
          visible={Boolean(selectedTrack)}
          onClose={() => setSelectedTrack(null)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topLeftAura: {
    position: 'absolute',
    top: -30,
    left: -40,
    width: 300,
    height: 260,
    borderRadius: 150,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
    gap: spacing.xl,
  },
  headerBlock: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarWrap: {
    borderRadius: radii.md,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  circleIconBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  chipsRow: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  filterPill: {
    height: 38,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm + 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  seeAll: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  curatedList: {
    paddingHorizontal: spacing.lg,
  },
  curatedCard: {
    width: CURATED_CARD_WIDTH,
    height: 168,
    borderRadius: radii.xl - 4,
    marginRight: spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  curatedLeft: {
    flex: 1,
    padding: spacing.md + 2,
    justifyContent: 'space-between',
  },
  curatedTextBlock: {
    gap: 5,
  },
  curatedTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  curatedSub: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  curatedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  curatedPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconNudge: {
    marginLeft: 2,
  },
  playIconSmallNudge: {
    marginLeft: 1.5,
  },
  curatedArt: {
    width: 124,
    height: '100%',
  },
  playlistList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  playlistRowPressed: {
    opacity: 0.8,
  },
  playlistThumb: {
    width: 58,
    height: 58,
    borderRadius: radii.md - 2,
    backgroundColor: colors.surfaceElevated,
  },
  playlistMeta: {
    flex: 1,
    gap: 4,
  },
  playlistTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  playlistSub: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  playlistPlayCircle: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselList: {
    paddingHorizontal: spacing.lg,
  },
});
