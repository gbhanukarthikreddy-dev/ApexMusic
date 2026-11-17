import React, { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import { colors, radii, spacing, typography } from '../theme';
import { Track } from '../types/music';
import { formatDuration, getHighResArtwork } from '../utils/format';
import { triggerMediumHaptic, triggerSelectionHaptic } from '../utils/haptics';
import { AnimatedHeartButton } from './AnimatedHeartButton';
import { EqualizerBars } from './EqualizerBars';

interface TrackRowProps {
  track: Track;
  index?: number;
  onPress: () => void;
  onMorePress?: (track: Track) => void;
  showIndex?: boolean;
  showLike?: boolean;
}

const SWIPE_THRESHOLD = -64;
const MAX_SWIPE = -104;
const SPRING_CONFIG = { damping: 20, stiffness: 280, mass: 0.75 };

export const TrackRow = React.memo(function TrackRow({
  track,
  index,
  onPress,
  onMorePress,
  showIndex = false,
  showLike = true,
}: TrackRowProps) {
  const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLiked = useLibraryStore((s) => s.likedSongs.some((t) => t.id === track.id));
  const toggleLike = useLibraryStore((s) => s.toggleLike);

  const isActive = currentTrackId === track.id;
  const translateX = useSharedValue(0);
  const hapticFired = useSharedValue(false);

  const handleAddToQueue = useCallback(() => {
    triggerMediumHaptic();
    usePlayerStore.getState().addToQueue(track);
    useUIStore.getState().showToast('Added to Queue');
  }, [track]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 999])
        .failOffsetY([-10, 10])
        .onStart(() => {
          'worklet';
          hapticFired.value = false;
        })
        .onUpdate((e) => {
          'worklet';
          if (e.translationX >= 0) {
            translateX.value = 0;
            return;
          }
          // Smooth rubber-band damping past threshold
          const raw = e.translationX;
          const clamped =
            raw < SWIPE_THRESHOLD
              ? SWIPE_THRESHOLD + (raw - SWIPE_THRESHOLD) * 0.35
              : raw;
          translateX.value = Math.max(MAX_SWIPE, clamped);

          if (!hapticFired.value && raw <= SWIPE_THRESHOLD) {
            hapticFired.value = true;
            scheduleOnRN(triggerSelectionHaptic);
          } else if (hapticFired.value && raw > SWIPE_THRESHOLD) {
            hapticFired.value = false;
          }
        })
        .onEnd((e) => {
          'worklet';
          if (e.translationX <= SWIPE_THRESHOLD || e.velocityX <= -550) {
            scheduleOnRN(handleAddToQueue);
          }
          translateX.value = withSpring(0, SPRING_CONFIG);
        })
        .onFinalize(() => {
          'worklet';
          translateX.value = withSpring(0, SPRING_CONFIG);
        }),
    [handleAddToQueue, hapticFired, translateX]
  );

  const rowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const queueActionStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [MAX_SWIPE, SWIPE_THRESHOLD, -10, 0],
      [1, 1, 0.25, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [MAX_SWIPE, SWIPE_THRESHOLD, 0],
      [1.12, 1, 0.72],
      Extrapolation.CLAMP
    );
    return {
      opacity: progress,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.swipeWrapper}>
      {/* Right-side reveal when swiping left: Add to Queue */}
      <View style={styles.actionsBackdrop}>
        <Animated.View style={[styles.queueAction, queueActionStyle]}>
          <Text style={styles.queueActionText}>Queue</Text>
          <Ionicons name="add-circle" size={20} color={colors.textInverse} />
        </Animated.View>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowAnimStyle}>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onPress();
            }}
            style={({ pressed }) => [
              styles.container,
              isActive && styles.activeContainer,
              pressed && styles.pressed,
            ]}
          >
            {showIndex && typeof index === 'number' ? (
              <View style={styles.indexCol}>
                {isActive ? (
                  <EqualizerBars active={isPlaying} size="sm" />
                ) : (
                  <Text style={styles.indexText}>{index + 1}</Text>
                )}
              </View>
            ) : null}

            <View style={[styles.artWrap, isActive && styles.activeArtWrap]}>
              <Image
                source={{ uri: getHighResArtwork(track.artwork) }}
                style={styles.artwork}
                contentFit="cover"
                transition={150}
                cachePolicy="memory-disk"
              />
              {!showIndex && isActive ? (
                <View style={styles.activeOverlay}>
                  <EqualizerBars active={isPlaying} color={colors.textPrimary} size="sm" />
                </View>
              ) : null}
            </View>

            <View style={styles.meta}>
              <Text
                numberOfLines={1}
                style={[typography.bodyMedium, isActive && styles.activeTitle]}
              >
                {track.title}
              </Text>
              <View style={styles.subRow}>
                <Text numberOfLines={1} style={[typography.caption, styles.artist]}>
                  {track.artist}
                  {track.duration > 0 ? ` • ${formatDuration(track.duration)}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              {showLike ? (
                <View style={styles.iconBtn}>
                  <AnimatedHeartButton
                    liked={isLiked}
                    onPress={() => toggleLike(track)}
                    size={20}
                  />
                </View>
              ) : null}
              {onMorePress ? (
                <Pressable
                  onPress={() => onMorePress(track)}
                  hitSlop={10}
                  style={styles.iconBtn}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  swipeWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionsBackdrop: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: spacing.sm,
    right: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: spacing.md,
  },
  queueAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  queueActionText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.background,
  },
  activeContainer: {
    backgroundColor: '#191C12',
    borderColor: 'rgba(198, 230, 59, 0.28)',
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  indexCol: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  artWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  activeArtWrap: {
    borderColor: colors.accentLight,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  activeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 7, 11, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 3,
  },
  activeTitle: {
    color: colors.accentLight,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artist: {
    color: colors.textSecondary,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  iconBtn: {
    padding: spacing.xs,
  },
});
