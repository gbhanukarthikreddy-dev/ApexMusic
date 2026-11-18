import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../components/ErrorState';
import { FadeOnFocus } from '../../components/FadeOnFocus';
import { TrackListSkeleton } from '../../components/Skeleton';
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useDebounce } from '../../hooks/useDebounce';
import { musicApi } from '../../services/musicApi';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { colors, radii, spacing, typography } from '../../theme';
import { getHighResArtwork } from '../../utils/format';
import {
  AlbumSummary,
  ArtistSummary,
  PlaylistSummary,
  SearchResults,
  SearchTab,
  Track,
} from '../../types/music';

const TABS: Array<{ key: SearchTab; label: string }> = [
  { key: 'songs', label: 'Songs' },
  { key: 'albums', label: 'Albums' },
  { key: 'artists', label: 'Artists' },
  { key: 'playlists', label: 'Playlists' },
];

const MOOD_CARDS: Array<{
  label: string;
  query: string;
  tint: string;
  iconColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
    { label: 'Lo-Fi Chill', query: 'lofi beats chill', tint: 'rgba(100, 210, 255, 0.16)', iconColor: '#64D2FF', icon: 'headset' },
    { label: 'Synthwave', query: 'synthwave retrowave', tint: 'rgba(255, 55, 95, 0.16)', iconColor: '#FF375F', icon: 'planet' },
    { label: 'Hip-Hop', query: 'hip hop hits', tint: 'rgba(255, 159, 10, 0.16)', iconColor: '#FF9F0A', icon: 'mic' },
    { label: 'Pop Hits', query: 'top pop hits', tint: 'rgba(10, 132, 255, 0.16)', iconColor: '#0A84FF', icon: 'sparkles' },
    { label: 'Workout', query: 'workout gym music', tint: 'rgba(48, 209, 88, 0.16)', iconColor: '#30D158', icon: 'flash' },
    { label: 'Acoustic', query: 'acoustic indie chill', tint: 'rgba(255, 214, 10, 0.16)', iconColor: '#FFD60A', icon: 'musical-notes' },
  ];

const LANGUAGE_CARDS: {
  label: string;
  native: string;
  query: string;
  tint: string;
  iconColor: string;
}[] = [
    { label: 'English', native: 'Global Hits', query: 'english top hits', tint: 'rgba(10, 132, 255, 0.16)', iconColor: '#0A84FF' },
    { label: 'Hindi', native: 'हिन्दी', query: 'hindi bollywood top hits', tint: 'rgba(250, 45, 72, 0.16)', iconColor: '#FA2D48' },
    { label: 'Telugu', native: 'తెలుగు', query: 'telugu top hits songs', tint: 'rgba(255, 159, 10, 0.16)', iconColor: '#FF9F0A' },
    { label: 'Tamil', native: 'தமிழ்', query: 'tamil top hits songs', tint: 'rgba(48, 209, 88, 0.16)', iconColor: '#30D158' },
    { label: 'Punjabi', native: 'ਪੰਜਾਬੀ', query: 'punjabi top hits', tint: 'rgba(255, 55, 95, 0.16)', iconColor: '#FF375F' },
    { label: 'Malayalam', native: 'മലയാളം', query: 'malayalam top hits', tint: 'rgba(100, 210, 255, 0.16)', iconColor: '#64D2FF' },
    { label: 'Kannada', native: 'ಕನ್ನಡ', query: 'kannada top hits', tint: 'rgba(255, 214, 10, 0.16)', iconColor: '#FFD60A' },
    { label: 'K-Pop', native: '한국어', query: 'kpop top hits', tint: 'rgba(191, 90, 242, 0.16)', iconColor: '#BF5AF2' },
    { label: 'Spanish', native: 'Español', query: 'latin spanish top hits', tint: 'rgba(255, 105, 97, 0.16)', iconColor: '#FF6961' },
  ];

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const recentSearches = useLibraryStore((s) => s.recentSearches);
  const addRecentSearch = useLibraryStore((s) => s.addRecentSearch);
  const removeRecentSearch = useLibraryStore((s) => s.removeRecentSearch);
  const clearRecentSearches = useLibraryStore((s) => s.clearRecentSearches);

  const [query, setQuery] = useState(typeof q === 'string' ? q : '');
  const debouncedQuery = useDebounce(query.trim(), 200);

  const [activeTab, setActiveTab] = useState<SearchTab>('songs');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (typeof q === 'string' && q.trim().length > 0) {
      setQuery(q);
      setShowSuggestions(false);
    }
  }, [q]);

  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const runSearch = useCallback(
    async (searchText: string) => {
      const cleaned = searchText.trim();
      if (!cleaned) {
        setResults(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await musicApi.search(cleaned);
        setResults(data);
        addRecentSearch(cleaned);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.');
      } finally {
        setLoading(false);
      }
    },
    [addRecentSearch]
  );

  // Fetch suggestions + debounced search
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      setResults(null);
      setError(null);
      return;
    }

    let cancelled = false;
    void musicApi
      .getSearchSuggestions(debouncedQuery)
      .then((list) => {
        if (!cancelled) setSuggestions(list);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });

    void runSearch(debouncedQuery);

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, runSearch]);

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    Keyboard.dismiss();
    void runSearch(text);
  };

  const renderEmptyQuery = () => (
    <ScrollView
      contentContainerStyle={[
        styles.emptyScroll,
        { paddingBottom: insets.bottom + (hasMiniPlayer ? 168 : 98) },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {recentSearches.length > 0 ? (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={[typography.h3, { color: themeColors.textPrimary }]}>
              Recent Searches
            </Text>
            <Pressable onPress={clearRecentSearches}>
              <Text style={[styles.clearAll, { color: themeColors.accent }]}>Clear All</Text>
            </Pressable>
          </View>
          {recentSearches.map((term) => (
            <Pressable
              key={term}
              onPress={() => handleSelectSuggestion(term)}
              style={[styles.recentRow, { borderBottomColor: themeColors.borderSubtle }]}
            >
              <Ionicons name="time-outline" size={18} color={themeColors.textMuted} />
              <Text
                numberOfLines={1}
                style={[typography.body, styles.recentText, { color: themeColors.textPrimary }]}
              >
                {term}
              </Text>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  removeRecentSearch(term);
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={18} color={themeColors.textMuted} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.moodSection}>
        <Text style={[typography.h3, { color: themeColors.textPrimary }]}>
          Browse Moods & Genres
        </Text>
        <View style={styles.moodGrid}>
          {MOOD_CARDS.map((card) => (
            <Pressable
              key={card.label}
              onPress={() => handleSelectSuggestion(card.query)}
              style={({ pressed }) => [
                styles.moodTile,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.glassBorder,
                },
                pressed && styles.moodTilePressed,
              ]}
            >
              <View style={styles.moodGlassInner}>
                <View style={[styles.moodIconBadge, { backgroundColor: card.tint }]}>
                  <Ionicons name={card.icon} size={18} color={card.iconColor} />
                </View>
                <Text style={[styles.moodLabel, { color: themeColors.textPrimary }]}>
                  {card.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.moodSection}>
        <Text style={[typography.h3, { color: themeColors.textPrimary }]}>
          Browse by Language
        </Text>
        <View style={styles.moodGrid}>
          {LANGUAGE_CARDS.map((lang) => (
            <Pressable
              key={lang.label}
              onPress={() => handleSelectSuggestion(lang.query)}
              style={({ pressed }) => [
                styles.moodTile,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.glassBorder,
                },
                pressed && styles.moodTilePressed,
              ]}
            >
              <View style={styles.moodGlassInner}>
                <View style={styles.langTopRow}>
                  <View style={[styles.moodIconBadge, { backgroundColor: lang.tint }]}>
                    <Ionicons name="language" size={17} color={lang.iconColor} />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.langNative, { color: themeColors.textSecondary }]}
                  >
                    {lang.native}
                  </Text>
                </View>
                <Text style={[styles.moodLabel, { color: themeColors.textPrimary }]}>
                  {lang.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderAlbumRow = ({ item }: { item: AlbumSummary }) => (
    <Pressable
      onPress={() => router.push(`/album/${item.id}`)}
      style={({ pressed }) => [styles.entityRow, pressed && styles.rowPressed]}
    >
      <Image
        source={{ uri: getHighResArtwork(item.artwork) }}
        style={styles.squareArt}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.entityMeta}>
        <Text numberOfLines={1} style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[typography.caption, { color: themeColors.textSecondary }]}>
          {[item.type || 'Album', item.artist, item.year].filter(Boolean).join(' • ')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
    </Pressable>
  );

  const renderArtistRow = ({ item }: { item: ArtistSummary }) => (
    <Pressable
      onPress={() => router.push(`/artist/${item.id}`)}
      style={({ pressed }) => [styles.entityRow, pressed && styles.rowPressed]}
    >
      <Image
        source={{ uri: getHighResArtwork(item.artwork) }}
        style={styles.circleArt}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.entityMeta}>
        <Text numberOfLines={1} style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={[typography.caption, { color: themeColors.textSecondary }]}>
          {item.subscribers || 'Artist'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
    </Pressable>
  );

  const renderPlaylistRow = ({ item }: { item: PlaylistSummary }) => (
    <Pressable
      onPress={() => router.push(`/playlist/${item.id}`)}
      style={({ pressed }) => [styles.entityRow, pressed && styles.rowPressed]}
    >
      <Image
        source={{ uri: getHighResArtwork(item.artwork) }}
        style={styles.squareArt}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.entityMeta}>
        <Text numberOfLines={1} style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={[typography.caption, { color: themeColors.textSecondary }]}>
          {item.subtitle || 'Playlist'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={themeColors.textMuted} />
    </Pressable>
  );

  const renderResults = () => {
    if (loading && !results) {
      return (
        <View style={styles.skeletonWrap}>
          <TrackListSkeleton count={7} />
        </View>
      );
    }

    if (error && !results) {
      return (
        <ErrorState
          title="Search failed"
          message={error}
          onRetry={() => void runSearch(query)}
        />
      );
    }

    if (!results) return null;

    const listBottom = { paddingBottom: insets.bottom + (hasMiniPlayer ? 168 : 98) };

    if (activeTab === 'songs') {
      return (
        <FlatList
          data={results.songs}
          keyExtractor={(item, idx) => `${item.id}_${idx}`}
          contentContainerStyle={listBottom}
          renderItem={({ item }) => (
            <TrackRow
              track={item}
              onPress={() => playTrack(item, results.songs)}
              onMorePress={setSelectedTrack}
            />
          )}
          ListEmptyComponent={<EmptyTab label="No songs found." />}
        />
      );
    }

    if (activeTab === 'albums') {
      return (
        <FlatList
          data={results.albums}
          keyExtractor={(item, idx) => `${item.id}_${idx}`}
          contentContainerStyle={listBottom}
          renderItem={renderAlbumRow}
          ListEmptyComponent={<EmptyTab label="No albums found." />}
        />
      );
    }

    if (activeTab === 'artists') {
      return (
        <FlatList
          data={results.artists}
          keyExtractor={(item, idx) => `${item.id}_${idx}`}
          contentContainerStyle={listBottom}
          renderItem={renderArtistRow}
          ListEmptyComponent={<EmptyTab label="No artists found." />}
        />
      );
    }

    return (
      <FlatList
        data={results.playlists}
        keyExtractor={(item, idx) => `${item.id}_${idx}`}
        contentContainerStyle={listBottom}
        renderItem={renderPlaylistRow}
        ListEmptyComponent={<EmptyTab label="No playlists found." />}
      />
    );
  };

  return (
    <FadeOnFocus>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: themeColors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <Text style={[typography.h1, { color: themeColors.textPrimary }]}>Search</Text>
        </View>

        <View
          style={[
            styles.searchBarWrap,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={themeColors.textMuted} />
          <TextInput
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onSubmitEditing={() => {
              setShowSuggestions(false);
              void runSearch(query);
            }}
            placeholder="Songs, artists, albums, playlists..."
            placeholderTextColor={themeColors.textMuted}
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => {
                setQuery('');
                setSuggestions([]);
                setResults(null);
              }}
              hitSlop={10}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {/* Suggestions strip while typing */}
        {showSuggestions && query.trim().length > 0 && suggestions.length > 0 ? (
          <View
            style={[
              styles.suggestionsBox,
              { backgroundColor: themeColors.surface, borderColor: themeColors.border },
            ]}
          >
            {suggestions.slice(0, 5).map((item) => (
              <Pressable
                key={item}
                onPress={() => handleSelectSuggestion(item)}
                style={[styles.suggestionRow, { borderBottomColor: themeColors.borderSubtle }]}
              >
                <Ionicons name="search-outline" size={15} color={themeColors.textSecondary} />
                <Text
                  numberOfLines={1}
                  style={[typography.body, styles.suggestionText, { color: themeColors.textPrimary }]}
                >
                  {item}
                </Text>
                <Ionicons name="arrow-up-outline" size={15} color={themeColors.textMuted} />
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Filter Tabs */}
        {query.trim().length > 0 ? (
          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabPill, active && styles.tabPillActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.body}>
          {query.trim().length === 0 ? renderEmptyQuery() : renderResults()}
        </View>

        <TrackActionSheet
          track={selectedTrack}
          visible={Boolean(selectedTrack)}
          onClose={() => setSelectedTrack(null)}
        />
      </SafeAreaView>
    </FadeOnFocus>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <View style={styles.emptyTab}>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  suggestionsBox: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  suggestionText: {
    flex: 1,
    color: colors.textPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabPillActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  skeletonWrap: {
    paddingTop: spacing.sm,
  },
  emptyScroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
  },
  recentSection: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  clearAll: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  recentText: {
    flex: 1,
  },
  placeholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    gap: spacing.xs,
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  placeholderSub: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  entityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  squareArt: {
    width: 54,
    height: 54,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  circleArt: {
    width: 54,
    height: 54,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
  },
  entityMeta: {
    flex: 1,
    gap: 3,
  },
  emptyTab: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  moodSection: {
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodTile: {
    width: '48%',
    height: 78,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  moodTilePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  moodGlassInner: {
    flex: 1,
    padding: spacing.sm + 2,
    justifyContent: 'space-between',
  },
  moodIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  moodLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  langTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  langNative: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
});
