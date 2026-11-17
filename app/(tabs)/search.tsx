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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorState } from '../../components/ErrorState';
import { TrackListSkeleton } from '../../components/Skeleton';
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
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
  colors: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { label: 'Lo-Fi Chill', query: 'lofi beats chill', colors: ['#4C1D95', '#7C3AED'], icon: 'headset' },
  { label: 'Synthwave', query: 'synthwave retrowave', colors: ['#831843', '#DB2777'], icon: 'planet' },
  { label: 'Hip-Hop', query: 'hip hop hits', colors: ['#7C2D12', '#EA580C'], icon: 'mic' },
  { label: 'Pop Hits', query: 'top pop hits', colors: ['#1E3A8A', '#2563EB'], icon: 'sparkles' },
  { label: 'Workout', query: 'workout gym music', colors: ['#064E3B', '#059669'], icon: 'flash' },
  { label: 'Acoustic', query: 'acoustic indie chill', colors: ['#713F12', '#CA8A04'], icon: 'musical-notes' },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const recentSearches = useLibraryStore((s) => s.recentSearches);
  const addRecentSearch = useLibraryStore((s) => s.addRecentSearch);
  const removeRecentSearch = useLibraryStore((s) => s.removeRecentSearch);
  const clearRecentSearches = useLibraryStore((s) => s.clearRecentSearches);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 200);

  const [activeTab, setActiveTab] = useState<SearchTab>('songs');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
            <Text style={typography.h3}>Recent Searches</Text>
            <Pressable onPress={clearRecentSearches}>
              <Text style={styles.clearAll}>Clear All</Text>
            </Pressable>
          </View>
          {recentSearches.map((term) => (
            <Pressable
              key={term}
              onPress={() => handleSelectSuggestion(term)}
              style={styles.recentRow}
            >
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text numberOfLines={1} style={[typography.body, styles.recentText]}>
                {term}
              </Text>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  removeRecentSearch(term);
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.moodSection}>
        <Text style={typography.h3}>Browse Moods & Genres</Text>
        <View style={styles.moodGrid}>
          {MOOD_CARDS.map((card) => (
            <Pressable
              key={card.label}
              onPress={() => handleSelectSuggestion(card.query)}
              style={({ pressed }) => [styles.moodTile, pressed && styles.moodTilePressed]}
            >
              <LinearGradient
                colors={card.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.moodGradient}
              >
                <Text style={styles.moodLabel}>{card.label}</Text>
                <Ionicons name={card.icon} size={22} color="rgba(255,255,255,0.85)" />
              </LinearGradient>
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
        <Text numberOfLines={1} style={typography.bodyMedium}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={typography.caption}>
          {[item.type || 'Album', item.artist, item.year].filter(Boolean).join(' • ')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
        <Text numberOfLines={1} style={typography.bodyMedium}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={typography.caption}>
          {item.subscribers || 'Artist'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
        <Text numberOfLines={1} style={typography.bodyMedium}>
          {item.title}
        </Text>
        <Text numberOfLines={1} style={typography.caption}>
          {item.subtitle || 'Playlist'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1}>Search</Text>
      </View>

      <View style={styles.searchBarWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
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
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
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
        <View style={styles.suggestionsBox}>
          {suggestions.slice(0, 5).map((item) => (
            <Pressable
              key={item}
              onPress={() => handleSelectSuggestion(item)}
              style={styles.suggestionRow}
            >
              <Ionicons name="search-outline" size={15} color={colors.textSecondary} />
              <Text numberOfLines={1} style={[typography.body, styles.suggestionText]}>
                {item}
              </Text>
              <Ionicons name="arrow-up-outline" size={15} color={colors.textMuted} />
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
    backgroundColor: colors.accent,
    borderColor: colors.accent,
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
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  moodTilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  moodGradient: {
    flex: 1,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  moodLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
