import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FadeOnFocus } from '../../components/FadeOnFocus';
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLibraryStore } from '../../store/libraryStore';
import { usePlayerStore } from '../../store/playerStore';
import { colors, radii, spacing, typography } from '../../theme';
import { Track } from '../../types/music';
import { formatRelativeTime, getHighResArtwork } from '../../utils/format';

type LibraryTab = 'liked' | 'playlists' | 'history' | 'downloads';

const TABS: Array<{ key: LibraryTab; label: string }> = [
  { key: 'liked', label: 'Liked' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'history', label: 'History' },
  { key: 'downloads', label: 'Downloads' },
];

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const likedSongs = useLibraryStore((s) => s.likedSongs);
  const playlists = useLibraryStore((s) => s.playlists);
  const history = useLibraryStore((s) => s.history);
  const downloads = useLibraryStore((s) => s.downloads);
  const offlinePlaylists = useLibraryStore((s) => s.offlinePlaylists);

  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const clearHistory = useLibraryStore((s) => s.clearHistory);
  const toggleDownloadPlaceholder = useLibraryStore((s) => s.toggleDownloadPlaceholder);
  const retryOfflineDownload = useLibraryStore((s) => s.retryOfflineDownload);
  const removeOfflinePlaylist = useLibraryStore((s) => s.removeOfflinePlaylist);

  const [activeTab, setActiveTab] = useState<LibraryTab>('liked');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreatePlaylist = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createPlaylist(trimmed, newDesc);
    setNewName('');
    setNewDesc('');
    setCreateVisible(false);
  };

  const listPadding = { paddingBottom: insets.bottom + (hasMiniPlayer ? 168 : 98) };

  return (
    <FadeOnFocus>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: themeColors.background }]}
        edges={['top']}
      >
        <View style={styles.header}>
          <Text style={[typography.h1, { color: themeColors.textPrimary }]}>Your Library</Text>
          <Pressable
            onPress={() => setCreateVisible(true)}
            style={[styles.newBtn, { backgroundColor: themeColors.textPrimary }]}
          >
            <Ionicons name="add" size={20} color={themeColors.textInverse} />
            <Text style={[styles.newBtnText, { color: themeColors.textInverse }]}>New Playlist</Text>
          </Pressable>
        </View>

        <View style={styles.tabsRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: active ? themeColors.textPrimary : themeColors.surface,
                    borderColor: active ? themeColors.textPrimary : themeColors.borderSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: active ? themeColors.textInverse : themeColors.textSecondary },
                    active && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'liked' ? (
          <FlatList
            data={likedSongs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={listPadding}
            ListHeaderComponent={
              likedSongs.length > 0 ? (
                <View style={styles.actionHeader}>
                  <Text style={[typography.caption, { color: themeColors.textSecondary }]}>
                    {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                  </Text>
                  <View style={styles.playBtns}>
                    <Pressable
                      onPress={() => playQueue(likedSongs, 0, false)}
                      style={[styles.primaryPill, { backgroundColor: themeColors.textPrimary }]}
                    >
                      <Ionicons name="play" size={14} color={themeColors.textInverse} />
                      <Text style={[styles.pillText, { color: themeColors.textInverse }]}>Play</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => playQueue(likedSongs, 0, true)}
                      style={[
                        styles.secondaryPill,
                        {
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                        },
                      ]}
                    >
                      <Ionicons name="shuffle" size={15} color={themeColors.textPrimary} />
                      <Text style={[styles.secondaryPillText, { color: themeColors.textPrimary }]}>
                        Shuffle
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : undefined
            }
            renderItem={({ item }) => (
              <TrackRow
                track={item}
                onPress={() => playTrack(item, likedSongs)}
                onMorePress={setSelectedTrack}
              />
            )}
            ListEmptyComponent={
              <EmptyLibrary
                icon="heart-outline"
                title="No liked songs yet"
                subtitle="Tap the heart icon on any track to save it here."
              />
            }
          />
        ) : null}

        {activeTab === 'playlists' ? (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            contentContainerStyle={listPadding}
            renderItem={({ item }) => {
              const cover = item.tracks[0]?.artwork;
              return (
                <Pressable
                  onPress={() => router.push(`/playlist/${item.id}`)}
                  style={({ pressed }) => [styles.playlistRow, pressed && styles.rowPressed]}
                >
                  {cover ? (
                    <Image
                      source={{ uri: getHighResArtwork(cover) }}
                      style={styles.playlistArt}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.playlistArt, styles.playlistFallback]}>
                      <Image
                        source={require('../../assets/logo.png')}
                        style={styles.playlistFallbackLogo}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    </View>
                  )}
                  <View style={styles.playlistMeta}>
                    <Text numberOfLines={1} style={[typography.bodyMedium, { color: themeColors.textPrimary }]}>
                      {item.name}
                    </Text>
                    <Text numberOfLines={1} style={[typography.caption, { color: themeColors.textSecondary }]}>
                      {item.tracks.length} {item.tracks.length === 1 ? 'track' : 'tracks'}
                      {item.description ? ` • ${item.description}` : ''}
                    </Text>
                  </View>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert('Delete Playlist', `Delete "${item.name}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => deletePlaylist(item.id),
                        },
                      ]);
                    }}
                    hitSlop={10}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                  </Pressable>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <EmptyLibrary
                icon="albums-outline"
                title="No playlists created"
                subtitle="Create custom playlists to organize your favorite tracks."
              />
            }
          />
        ) : null}

        {activeTab === 'history' ? (
          <FlatList
            data={history}
            keyExtractor={(item) => `${item.track.id}_${item.playedAt}`}
            contentContainerStyle={listPadding}
            ListHeaderComponent={
              history.length > 0 ? (
                <View style={styles.actionHeader}>
                  <Text style={[typography.caption, { color: themeColors.textSecondary }]}>
                    Recently played ({history.length})
                  </Text>
                  <Pressable onPress={clearHistory}>
                    <Text style={styles.clearLink}>Clear History</Text>
                  </Pressable>
                </View>
              ) : undefined
            }
            renderItem={({ item }) => (
              <View>
                <TrackRow
                  track={item.track}
                  onPress={() =>
                    playTrack(
                      item.track,
                      history.map((h) => h.track)
                    )
                  }
                  onMorePress={setSelectedTrack}
                />
                <Text style={styles.historyTime}>{formatRelativeTime(item.playedAt)}</Text>
              </View>
            )}
            ListEmptyComponent={
              <EmptyLibrary
                icon="time-outline"
                title="No listening history"
                subtitle="Tracks you play will automatically appear here."
              />
            }
          />
        ) : null}

        {activeTab === 'downloads' ? (
          <FlatList
            data={downloads}
            keyExtractor={(item) => item.track.id}
            contentContainerStyle={listPadding}
            ListHeaderComponent={
              <View>
                <View style={styles.offlineBanner}>
                  <Ionicons name="cloud-done-outline" size={18} color={themeColors.textPrimary} />
                  <Text style={[styles.offlineText, { color: themeColors.textSecondary }]}>
                    Downloaded playlists and songs play offline without internet.
                  </Text>
                </View>

                {/* Section 1: Downloaded Playlists */}
                {offlinePlaylists.length > 0 ? (
                  <View style={styles.offlineSection}>
                    <Text style={[styles.offlineSectionTitle, { color: themeColors.textMuted }]}>
                      DOWNLOADED PLAYLISTS ({offlinePlaylists.length})
                    </Text>
                    {offlinePlaylists.map((pl) => {
                      const readyCount = pl.tracks.filter((t) =>
                        downloads.some((d) => d.track.id === t.id && d.status === 'downloaded')
                      ).length;
                      const cover = pl.artwork || pl.tracks[0]?.artwork;
                      return (
                        <Pressable
                          key={pl.id}
                          onPress={() => router.push(`/playlist/${pl.id}`)}
                          style={({ pressed }) => [
                            styles.playlistRow,
                            pressed && styles.rowPressed,
                          ]}
                        >
                          {cover ? (
                            <Image
                              source={{ uri: getHighResArtwork(cover) }}
                              style={styles.playlistArt}
                              contentFit="cover"
                              cachePolicy="memory-disk"
                            />
                          ) : (
                            <View style={[styles.playlistArt, styles.playlistFallback]}>
                              <Image
                                source={require('../../assets/logo.png')}
                                style={styles.playlistFallbackLogo}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                              />
                            </View>
                          )}
                          <View style={styles.playlistMeta}>
                            <Text
                              numberOfLines={1}
                              style={[typography.bodyMedium, { color: themeColors.textPrimary }]}
                            >
                              {pl.title}
                            </Text>
                            <Text
                              numberOfLines={1}
                              style={[typography.caption, { color: themeColors.textSecondary }]}
                            >
                              {readyCount}/{pl.tracks.length} tracks offline
                            </Text>
                          </View>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              removeOfflinePlaylist(pl.id);
                            }}
                            hitSlop={10}
                            style={styles.deleteBtn}
                          >
                            <Ionicons name="trash-outline" size={18} color={themeColors.textMuted} />
                          </Pressable>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {/* Section 2: Downloaded Songs */}
                {downloads.length > 0 ? (
                  <View>
                    <Text
                      style={[
                        styles.offlineSectionTitle,
                        styles.songsSectionTitle,
                        { color: themeColors.textMuted },
                      ]}
                    >
                      DOWNLOADED SONGS ({downloads.length})
                    </Text>
                    <View style={styles.actionHeader}>
                      <Text style={[typography.caption, { color: themeColors.textSecondary }]}>
                        {downloads.filter((d) => d.status === 'downloaded').length} of {downloads.length} ready offline
                      </Text>
                      <View style={styles.playBtns}>
                        <Pressable
                          onPress={() =>
                            playQueue(
                              downloads.map((d) => d.track),
                              0,
                              false
                            )
                          }
                          style={[styles.primaryPill, { backgroundColor: themeColors.textPrimary }]}
                        >
                          <Ionicons name="play" size={14} color={themeColors.textInverse} />
                          <Text style={[styles.pillText, { color: themeColors.textInverse }]}>Play</Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            playQueue(
                              downloads.map((d) => d.track),
                              0,
                              true
                            )
                          }
                          style={[
                            styles.secondaryPill,
                            {
                              backgroundColor: themeColors.surface,
                              borderColor: themeColors.border,
                            },
                          ]}
                        >
                          <Ionicons name="shuffle" size={15} color={themeColors.textPrimary} />
                          <Text style={[styles.secondaryPillText, { color: themeColors.textPrimary }]}>
                            Shuffle
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.downloadRow}>
                <View style={styles.downloadTrackWrap}>
                  <TrackRow
                    track={item.track}
                    onPress={() =>
                      playTrack(
                        item.track,
                        downloads.map((d) => d.track)
                      )
                    }
                    onMorePress={setSelectedTrack}
                    showLike={false}
                  />
                </View>
                <Pressable
                  onPress={() => {
                    if (item.status === 'error' || item.status === 'cached_metadata') {
                      retryOfflineDownload(item.track);
                    } else if (item.status === 'downloaded') {
                      toggleDownloadPlaceholder(item.track);
                    }
                  }}
                  style={styles.sizeBadge}
                >
                  {item.status === 'downloading' ? (
                    <>
                      <ActivityIndicator size="small" color={themeColors.textPrimary} />
                      <Text style={[styles.sizeText, { color: themeColors.textSecondary }]}>
                        Saving
                      </Text>
                    </>
                  ) : item.status === 'downloaded' ? (
                    <>
                      <Ionicons name="cloud-done" size={14} color={colors.success} />
                      <Text style={styles.sizeText}>{item.estimatedSizeMb} MB</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-download-outline" size={14} color={colors.accent} />
                      <Text style={[styles.sizeText, { color: colors.accent }]}>
                        {item.status === 'error' ? 'Retry' : 'Download'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              offlinePlaylists.length === 0 ? (
                <EmptyLibrary
                  icon="cloud-download-outline"
                  title="No offline tracks"
                  subtitle='Use the "..." menu on any song or tap Download on a playlist.'
                />
              ) : undefined
            }
          />
        ) : null}

        {/* Create Playlist Modal */}
        <Modal
          visible={createVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCreateVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setCreateVisible(false)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Text style={typography.h3}>Create Playlist</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Playlist name"
                placeholderTextColor={colors.textMuted}
                style={styles.modalInput}
                autoFocus
              />
              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Description (optional)"
                placeholderTextColor={colors.textMuted}
                style={styles.modalInput}
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setCreateVisible(false)}
                  style={styles.modalCancel}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleCreatePlaylist} style={styles.modalCreate}>
                  <Text style={styles.modalCreateText}>Create</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <TrackActionSheet
          track={selectedTrack}
          visible={Boolean(selectedTrack)}
          onClose={() => setSelectedTrack(null)}
        />
      </SafeAreaView>
    </FadeOnFocus>
  );
}

function EmptyLibrary({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View style={styles.emptyWrap}>
      <View style={[styles.emptyIcon, { backgroundColor: themeColors.accentMuted }]}>
        <Ionicons name={icon} size={30} color={themeColors.accent} />
      </View>
      <Text style={[typography.h3, { color: themeColors.textPrimary }]}>{title}</Text>
      <Text style={[typography.body, styles.emptySub, { color: themeColors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  newBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  tabPill: {
    paddingHorizontal: spacing.sm + 2,
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
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  playBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  primaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  pillText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  secondaryPillText: {
    color: colors.accentLight,
    fontWeight: '600',
    fontSize: 13,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  playlistArt: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
  },
  playlistFallback: {
    backgroundColor: '#0F0F19',
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  playlistFallbackLogo: {
    width: '100%',
    height: '100%',
  },
  playlistMeta: {
    flex: 1,
    gap: 3,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  clearLink: {
    color: colors.accentLight,
    fontSize: 13,
    fontWeight: '600',
  },
  historyTime: {
    ...typography.micro,
    paddingLeft: 80,
    marginBottom: spacing.xs,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  offlineText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadTrackWrap: {
    flex: 1,
  },
  sizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
  },
  sizeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    gap: spacing.xs,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptySub: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalCancel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  modalCreate: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  modalCreateText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  offlineSection: {
    marginBottom: spacing.md,
  },
  offlineSectionTitle: {
    ...typography.micro,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  songsSectionTitle: {
    paddingTop: spacing.sm,
  },
});
