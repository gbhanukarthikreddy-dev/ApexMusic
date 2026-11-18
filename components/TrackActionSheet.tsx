import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import { colors, radii, spacing, typography } from '../theme';
import { Track } from '../types/music';
import { getHighResArtwork } from '../utils/format';

interface TrackActionSheetProps {
  track: Track | null;
  visible: boolean;
  onClose: () => void;
  initialMode?: 'menu' | 'playlist';
}

export function TrackActionSheet({
  track,
  visible,
  onClose,
  initialMode = 'menu',
}: TrackActionSheetProps) {
  const router = useRouter();
  const { isDark, colors: themeColors, chromeBlurTint } = useAppTheme();
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(initialMode === 'playlist');
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (visible) {
      setShowPlaylistPicker(initialMode === 'playlist');
      setNewPlaylistName('');
    }
  }, [visible, initialMode, track?.id]);

  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const playNextInQueue = usePlayerStore((s) => s.playNextInQueue);
  const showToast = useUIStore((s) => s.showToast);

  const playlists = useLibraryStore((s) => s.playlists);
  const toggleLike = useLibraryStore((s) => s.toggleLike);
  const isLiked = useLibraryStore((s) =>
    track ? s.likedSongs.some((t) => t.id === track.id) : false
  );
  const addTrackToPlaylist = useLibraryStore((s) => s.addTrackToPlaylist);
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const toggleDownloadPlaceholder = useLibraryStore((s) => s.toggleDownloadPlaceholder);
  const isDownloaded = useLibraryStore((s) =>
    track ? s.downloads.some((d) => d.track.id === track.id) : false
  );

  if (!track) return null;

  const handleClose = () => {
    setShowPlaylistPicker(false);
    setNewPlaylistName('');
    onClose();
  };

  const handleCreateAndAdd = () => {
    const trimmed = newPlaylistName.trim();
    if (!trimmed) return;
    const created = createPlaylist(trimmed);
    addTrackToPlaylist(created.id, track);
    showToast(`Added to "${created.name}"`);
    setNewPlaylistName('');
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? 'rgba(24, 24, 28, 0.78)' : 'rgba(255, 255, 255, 0.88)',
              borderColor: themeColors.glassBorder,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <BlurView
            intensity={80}
            tint={chromeBlurTint}
            blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              styles.handle,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.22)'
                  : 'rgba(60, 60, 67, 0.28)',
              },
            ]}
          />

          <View style={[styles.header, { borderBottomColor: themeColors.borderSubtle }]}>
            <Image
              source={{ uri: getHighResArtwork(track.artwork) }}
              style={styles.artwork}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
            <View style={styles.headerMeta}>
              <Text numberOfLines={1} style={[typography.subtitle, { color: themeColors.textPrimary }]}>
                {track.title}
              </Text>
              <Text numberOfLines={1} style={[typography.caption, { color: themeColors.textSecondary }]}>
                {track.artist}
              </Text>
            </View>
          </View>

          {showPlaylistPicker ? (
            <View style={styles.pickerWrap}>
              <View style={styles.pickerHeader}>
                <Pressable
                  onPress={() => setShowPlaylistPicker(false)}
                  style={styles.backRow}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                  <Text style={typography.subtitle}>Add to Playlist</Text>
                </Pressable>
              </View>

              <View style={styles.createRow}>
                <TextInput
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  placeholder="New playlist name..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  onSubmitEditing={handleCreateAndAdd}
                />
                <Pressable onPress={handleCreateAndAdd} style={styles.createBtn}>
                  <Text style={styles.createBtnText}>Create</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.playlistList}>
                {playlists.length === 0 ? (
                  <Text style={[typography.caption, styles.emptyText]}>
                    No playlists yet. Create one above!
                  </Text>
                ) : (
                  playlists.map((pl) => (
                    <Pressable
                      key={pl.id}
                      onPress={() => {
                        addTrackToPlaylist(pl.id, track);
                        showToast(`Added to "${pl.name}"`);
                        handleClose();
                      }}
                      style={styles.actionRow}
                    >
                      <Ionicons name="list" size={20} color={colors.accentLight} />
                      <Text style={[typography.bodyMedium, styles.actionLabel]}>
                        {pl.name} ({pl.tracks.length})
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.actionsList}>
              <ActionItem
                icon="play-skip-forward-outline"
                label="Play Next"
                onPress={() => {
                  playNextInQueue(track);
                  showToast('Playing next');
                  handleClose();
                }}
              />
              <ActionItem
                icon="add-circle-outline"
                label="Add to Queue"
                onPress={() => {
                  addToQueue(track);
                  showToast('Added to Queue');
                  handleClose();
                }}
              />
              <ActionItem
                icon={isLiked ? 'heart' : 'heart-outline'}
                label={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                accent={isLiked}
                onPress={() => {
                  toggleLike(track);
                  showToast(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs');
                  handleClose();
                }}
              />
              <ActionItem
                icon="albums-outline"
                label="Add to Playlist"
                onPress={() => setShowPlaylistPicker(true)}
              />
              <ActionItem
                icon={isDownloaded ? 'cloud-done' : 'cloud-download-outline'}
                label={isDownloaded ? 'Remove from Offline List' : 'Save to Offline List'}
                accent={isDownloaded}
                onPress={() => {
                  toggleDownloadPlaceholder(track);
                  showToast(isDownloaded ? 'Removed from Offline List' : 'Saved for Offline');
                  handleClose();
                }}
              />
              {track.artistId ? (
                <ActionItem
                  icon="person-outline"
                  label="Go to Artist"
                  onPress={() => {
                    handleClose();
                    router.push(`/artist/${track.artistId}`);
                  }}
                />
              ) : null}
              {track.albumId ? (
                <ActionItem
                  icon="disc-outline"
                  label="Go to Album"
                  onPress={() => {
                    handleClose();
                    router.push(`/album/${track.albumId}`);
                  }}
                />
              ) : null}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ActionItem({
  icon,
  label,
  onPress,
  accent = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed && { backgroundColor: themeColors.surfaceHighlight },
      ]}
    >
      <Ionicons
        name={icon}
        size={21}
        color={accent ? themeColors.accent : themeColors.textSecondary}
      />
      <Text style={[typography.bodyMedium, styles.actionLabel, { color: themeColors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(24, 24, 28, 0.78)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.glassHighlight,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  headerMeta: {
    flex: 1,
    gap: 2,
  },
  actionsList: {
    paddingTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  actionPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  actionLabel: {
    color: colors.textPrimary,
  },
  pickerWrap: {
    paddingTop: spacing.sm,
  },
  pickerHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  createRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  createBtnText: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  playlistList: {
    maxHeight: 240,
  },
  emptyText: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
