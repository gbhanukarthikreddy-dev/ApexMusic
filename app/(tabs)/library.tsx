import React, { useState } from 'react';
import {
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
import { TrackActionSheet } from '../../components/TrackActionSheet';
import { TrackRow } from '../../components/TrackRow';
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
  const playTrack = usePlayerStore((s) => s.playTrack);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const hasMiniPlayer = usePlayerStore((s) => Boolean(s.currentTrack));

  const likedSongs = useLibraryStore((s) => s.likedSongs);
  const playlists = useLibraryStore((s) => s.playlists);
  const history = useLibraryStore((s) => s.history);
  const downloads = useLibraryStore((s) => s.downloads);

  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const clearHistory = useLibraryStore((s) => s.clearHistory);
  const toggleDownloadPlaceholder = useLibraryStore((s) => s.toggleDownloadPlaceholder);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.h1}>Your Library</Text>
        <Pressable
          onPress={() => setCreateVisible(true)}
          style={styles.newBtn}
        >
          <Ionicons name="add" size={20} color={colors.textInverse} />
          <Text style={styles.newBtnText}>New Playlist</Text>
        </Pressable>
      </View>

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

      {activeTab === 'liked' ? (
        <FlatList
          data={likedSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listPadding}
          ListHeaderComponent={
            likedSongs.length > 0 ? (
              <View style={styles.actionHeader}>
                <Text style={typography.caption}>
                  {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
                </Text>
                <View style={styles.playBtns}>
                  <Pressable
                    onPress={() => playQueue(likedSongs, 0, false)}
                    style={styles.primaryPill}
                  >
                    <Ionicons name="play" size={14} color={colors.textInverse} />
                    <Text style={styles.pillText}>Play</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => playQueue(likedSongs, 0, true)}
                    style={styles.secondaryPill}
                  >
                    <Ionicons name="shuffle" size={15} color={colors.accentLight} />
                    <Text style={styles.secondaryPillText}>Shuffle</Text>
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
                  <Text numberOfLines={1} style={typography.bodyMedium}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} style={typography.caption}>
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
                <Text style={typography.caption}>
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
            <View style={styles.offlineBanner}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accentLight} />
              <Text style={styles.offlineText}>
                Saved tracks are stored in your local library for quick access.
              </Text>
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
                onPress={() => toggleDownloadPlaceholder(item.track)}
                style={styles.sizeBadge}
              >
                <Ionicons name="cloud-done" size={14} color={colors.success} />
                <Text style={styles.sizeText}>{item.estimatedSizeMb} MB</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <EmptyLibrary
              icon="cloud-download-outline"
              title="No offline tracks"
              subtitle='Use the "..." menu on any song and tap "Save to Offline List".'
            />
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
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.accentLight} />
      </View>
      <Text style={typography.h3}>{title}</Text>
      <Text style={[typography.body, styles.emptySub]}>{subtitle}</Text>
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
});
