import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlayerStore } from '../store/playerStore';
import { colors, radii, spacing, typography } from '../theme';
import { formatDuration, getHighResArtwork } from '../utils/format';

export default function QueueScreen() {
  const router = useRouter();
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const playAtIndex = usePlayerStore((s) => s.playAtIndex);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={typography.h3}>Playback Queue</Text>
        <Pressable onPress={clearQueue} disabled={queue.length <= 1}>
          <Text
            style={[
              styles.clearText,
              queue.length <= 1 && styles.clearDisabled,
            ]}
          >
            Clear
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={queue}
        keyExtractor={(item, idx) => `${item.id}_${idx}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isCurrent = index === currentIndex;
          return (
            <Pressable
              onPress={() => void playAtIndex(index)}
              style={[styles.row, isCurrent && styles.currentRow]}
            >
              <Image
                source={{ uri: getHighResArtwork(item.artwork) }}
                style={styles.artwork}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <View style={styles.meta}>
                <Text
                  numberOfLines={1}
                  style={[typography.bodyMedium, isCurrent && styles.currentTitle]}
                >
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={typography.caption}>
                  {item.artist}
                  {item.duration > 0 ? ` • ${formatDuration(item.duration)}` : ''}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => reorderQueue(index, index - 1)}
                  disabled={index === 0}
                  hitSlop={6}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name="arrow-up"
                    size={17}
                    color={index === 0 ? colors.border : colors.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => reorderQueue(index, index + 1)}
                  disabled={index === queue.length - 1}
                  hitSlop={6}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name="arrow-down"
                    size={17}
                    color={index === queue.length - 1 ? colors.border : colors.textSecondary}
                  />
                </Pressable>
                <Pressable
                  onPress={() => removeFromQueue(index)}
                  hitSlop={6}
                  style={styles.iconBtn}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={40} color={colors.textMuted} />
            <Text style={typography.caption}>Your queue is empty.</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  clearText: {
    color: colors.accentLight,
    fontWeight: '600',
    fontSize: 14,
  },
  clearDisabled: {
    color: colors.textMuted,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  currentRow: {
    backgroundColor: colors.accentMuted,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  currentTitle: {
    color: colors.accentLight,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    padding: 6,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    gap: spacing.sm,
  },
});
