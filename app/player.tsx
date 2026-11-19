import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedHeartButton } from '../components/AnimatedHeartButton';
import { EqualizerBars } from '../components/EqualizerBars';
import { LyricsView } from '../components/LyricsView';
import { TrackActionSheet } from '../components/TrackActionSheet';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { colors, radii, spacing, typography } from '../theme';
import { formatDuration, getHighResArtwork } from '../utils/format';
import { triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ART_SIZE = Math.min(SCREEN_WIDTH - 52, 344);

const PlayerSeekBar = React.memo(function PlayerSeekBar({
  fallbackDuration,
}: {
  fallbackDuration: number;
}) {
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const seekTo = usePlayerStore((s) => s.seekTo);

  const [seekingPosition, setSeekingPosition] = useState<number | null>(null);
  const barWidthRef = useRef(1);
  const seekBarScaleY = useSharedValue(1);
  const thumbScale = useSharedValue(1);

  const seekTrackStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: seekBarScaleY.value }],
  }));

  const seekThumbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  const effectiveDuration = duration > 0 ? duration : fallbackDuration || 1;
  const displayPosition = seekingPosition !== null ? seekingPosition : position;
  const progress = Math.min(1, Math.max(0, displayPosition / effectiveDuration));

  const computeSeekFromX = useCallback(
    (x: number) => {
      const ratio = Math.min(1, Math.max(0, x / barWidthRef.current));
      return ratio * effectiveDuration;
    },
    [effectiveDuration]
  );

  const commitSeek = useCallback(
    (x: number) => {
      const target = computeSeekFromX(x);
      setSeekingPosition(null);
      void seekTo(target);
    },
    [computeSeekFromX, seekTo]
  );

  const updateDragSeek = useCallback(
    (x: number) => {
      setSeekingPosition(computeSeekFromX(x));
    },
    [computeSeekFromX]
  );

  const handleBarLayout = (e: LayoutChangeEvent) => {
    barWidthRef.current = Math.max(1, e.nativeEvent.layout.width);
  };

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin((e) => {
          'worklet';
          seekBarScaleY.set(withTiming(1.6, { duration: 120 }));
          thumbScale.set(withSpring(1.35, { damping: 14 }));
          scheduleOnRN(triggerLightHaptic);
          scheduleOnRN(updateDragSeek, e.x);
        })
        .onUpdate((e) => {
          'worklet';
          scheduleOnRN(updateDragSeek, e.x);
        })
        .onEnd((e) => {
          'worklet';
          seekBarScaleY.set(withTiming(1, { duration: 150 }));
          thumbScale.set(withSpring(1, { damping: 14 }));
          scheduleOnRN(commitSeek, e.x);
        })
        .onFinalize(() => {
          'worklet';
          seekBarScaleY.set(withTiming(1, { duration: 150 }));
          thumbScale.set(withSpring(1, { damping: 14 }));
        }),
    [commitSeek, seekBarScaleY, thumbScale, updateDragSeek]
  );

  return (
    <View style={styles.seekSection}>
      <GestureDetector gesture={panGesture}>
        <View onLayout={handleBarLayout} style={styles.seekTouchArea}>
          <Animated.View style={[styles.seekTrack, seekTrackStyle]} pointerEvents="none">
            <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.seekThumb,
              { left: `${progress * 100}%` },
              seekThumbStyle,
            ]}
          />
        </View>
      </GestureDetector>
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatDuration(displayPosition)}</Text>
        <Text style={styles.timeText}>{formatDuration(effectiveDuration)}</Text>
      </View>
    </View>
  );
});

export default function PlayerScreen() {
  const router = useRouter();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoadingStream = usePlayerStore((s) => s.isLoadingStream);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const streamError = usePlayerStore((s) => s.streamError);
  const queueLength = usePlayerStore((s) => s.queue.length);

  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrevious = usePlayerStore((s) => s.playPrevious);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((s) => s.cycleRepeatMode);
  const retryCurrentTrack = usePlayerStore((s) => s.retryCurrentTrack);

  const isLiked = useLibraryStore((s) =>
    currentTrack ? s.likedSongs.some((t) => t.id === currentTrack.id) : false
  );
  const toggleLike = useLibraryStore((s) => s.toggleLike);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  const artScale = useSharedValue(isPlaying ? 1 : 0.91);
  const artSwipeX = useSharedValue(0);

  useEffect(() => {
    artScale.value = withSpring(isPlaying ? 1 : 0.91, {
      damping: 15,
      stiffness: 140,
    });
  }, [isPlaying, artScale]);

  const handleSwipeClose = useCallback(() => {
    triggerLightHaptic();
    router.back();
  }, [router]);

  const handleSwipeNext = useCallback(() => {
    triggerMediumHaptic();
    void playNext(false);
  }, [playNext]);

  const handleSwipePrev = useCallback(() => {
    triggerMediumHaptic();
    void playPrevious();
  }, [playPrevious]);

  const artPanGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-14, 14])
        .activeOffsetY([-20, 20])
        .onUpdate((e) => {
          'worklet';
          if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
            artSwipeX.value = Math.max(-120, Math.min(120, e.translationX * 0.78));
          }
        })
        .onEnd((e) => {
          'worklet';
          if (e.translationY > 90 && e.translationY > Math.abs(e.translationX)) {
            scheduleOnRN(handleSwipeClose);
          } else if (e.translationX <= -70 || e.velocityX <= -550) {
            scheduleOnRN(handleSwipeNext);
          } else if (e.translationX >= 70 || e.velocityX >= 550) {
            scheduleOnRN(handleSwipePrev);
          }
          artSwipeX.value = withSpring(0, { damping: 20, stiffness: 280, mass: 0.75 });
        })
        .onFinalize(() => {
          'worklet';
          artSwipeX.value = withSpring(0, { damping: 20, stiffness: 280, mass: 0.75 });
        }),
    [artSwipeX, handleSwipeClose, handleSwipeNext, handleSwipePrev]
  );

  const artAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: artSwipeX.value },
      { rotateZ: `${artSwipeX.value * 0.04}deg` },
      { scale: artScale.value },
    ],
  }));

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Pressable onPress={() => router.back()} style={styles.closeOnlyBtn}>
          <Ionicons name="chevron-down" size={28} color={colors.textPrimary} />
        </Pressable>
        <Ionicons name="musical-notes-outline" size={52} color={colors.textMuted} />
        <Text style={typography.h3}>Nothing playing</Text>
        <Text style={typography.caption}>Pick a track from Home or Search to start listening.</Text>
      </SafeAreaView>
    );
  }

  const artUri = getHighResArtwork(currentTrack.artwork);

  return (
    <View style={styles.root}>
      {/* Dynamic Blurred Album Art Backdrop */}
      <Image
        source={{ uri: artUri }}
        style={styles.backdropImage}
        contentFit="cover"
        blurRadius={85}
        cachePolicy="memory-disk"
      />
      <BlurView
        intensity={50}
        tint="systemThinMaterialDark"
        blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.backdropScrim} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar + Handle */}
        <View style={styles.topSection}>
          <View style={styles.modalHandle} />
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                triggerLightHaptic();
                router.back();
              }}
              hitSlop={12}
              style={styles.headerBtn}
            >
              <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.headerCenter}>
              <View style={styles.nowPlayingRow}>
                <EqualizerBars active={isPlaying} size="sm" />
                <Text style={styles.headerLabel}>NOW PLAYING</Text>
              </View>
              {currentTrack.album ? (
                <Text numberOfLines={1} style={[typography.caption, styles.albumSub]}>
                  {currentTrack.album}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => {
                triggerLightHaptic();
                setSheetVisible(true);
              }}
              hitSlop={12}
              style={styles.headerBtn}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Album Art or Synced Lyrics */}
        <View style={styles.artContainer}>
          {showLyrics ? (
            <LyricsView track={currentTrack} height={ART_SIZE} />
          ) : (
            <GestureDetector gesture={artPanGesture}>
              <Animated.View style={[styles.artShadow, artAnimatedStyle]}>
                <Image
                  source={{ uri: artUri }}
                  style={styles.artwork}
                  contentFit="cover"
                  transition={250}
                  cachePolicy="memory-disk"
                />
              </Animated.View>
            </GestureDetector>
          )}
        </View>

        {/* Track Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaText}>
            <Text numberOfLines={1} style={typography.h1}>
              {currentTrack.title}
            </Text>
            <Pressable
              disabled={!currentTrack.artistId}
              onPress={() => {
                if (currentTrack.artistId) {
                  router.back();
                  router.push(`/artist/${currentTrack.artistId}`);
                }
              }}
            >
              <Text numberOfLines={1} style={[typography.body, styles.artistName]}>
                {currentTrack.artist}
              </Text>
            </Pressable>
          </View>
          <AnimatedHeartButton
            liked={isLiked}
            onPress={() => toggleLike(currentTrack)}
            size={28}
          />
        </View>

        {/* Stream Error Banner */}
        {streamError ? (
          <View style={styles.errorBanner}>
            <Text numberOfLines={2} style={styles.errorText}>
              {streamError}
            </Text>
            <Pressable onPress={() => void retryCurrentTrack()} style={styles.retryPill}>
              <Text style={styles.retryPillText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Interactive Seek Bar */}
        <PlayerSeekBar fallbackDuration={currentTrack.duration || 1} />

        {/* Transport Controls */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={() => {
              triggerLightHaptic();
              toggleShuffle();
            }}
            hitSlop={12}
            style={styles.secondaryControl}
          >
            <Ionicons
              name="shuffle"
              size={24}
              color={shuffle ? colors.accentLight : colors.textSecondary}
            />
            {shuffle ? <View style={styles.activeDot} /> : null}
          </Pressable>

          <Pressable
            onPress={() => {
              triggerLightHaptic();
              void playPrevious();
            }}
            hitSlop={12}
            style={({ pressed }) => [styles.skipBtn, pressed && styles.skipPressed]}
          >
            <Ionicons name="play-skip-back" size={32} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            onPress={() => {
              triggerMediumHaptic();
              togglePlayPause();
            }}
            style={({ pressed }) => [pressed && styles.playButtonPressed]}
          >
            <View style={styles.playButton}>
              {isLoadingStream ? (
                <ActivityIndicator size="large" color={colors.textInverse} />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={34}
                  color={colors.textInverse}
                  style={!isPlaying ? styles.playIconOffset : undefined}
                />
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              triggerLightHaptic();
              void playNext(false);
            }}
            hitSlop={12}
            style={({ pressed }) => [styles.skipBtn, pressed && styles.skipPressed]}
          >
            <Ionicons name="play-skip-forward" size={32} color={colors.textPrimary} />
          </Pressable>

          <Pressable
            onPress={() => {
              triggerLightHaptic();
              cycleRepeatMode();
            }}
            hitSlop={12}
            style={styles.secondaryControl}
          >
            <Ionicons
              name="repeat"
              size={24}
              color={repeatMode !== 'off' ? colors.accentLight : colors.textSecondary}
            />
            {repeatMode === 'one' ? (
              <Text style={styles.repeatOneBadge}>1</Text>
            ) : repeatMode === 'all' ? (
              <View style={styles.activeDot} />
            ) : null}
          </Pressable>
        </View>

        {/* Bottom Utility Dock */}
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => {
              triggerLightHaptic();
              setShowLyrics((prev) => !prev);
            }}
            style={[styles.footerBtn, showLyrics && styles.footerBtnActive]}
          >
            <Ionicons
              name={showLyrics ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
              size={15}
              color={showLyrics ? colors.textInverse : colors.textPrimary}
            />
            <Text style={[styles.footerBtnText, showLyrics && styles.footerBtnTextActive]}>
              Lyrics
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              triggerLightHaptic();
              router.push('/queue');
            }}
            style={styles.footerBtn}
          >
            <Ionicons name="list" size={16} color={colors.textPrimary} />
            <Text style={styles.footerBtnText}>Queue ({queueLength})</Text>
          </Pressable>
        </View>

        <TrackActionSheet
          track={currentTrack}
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
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
  backdropImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.72,
  },
  backdropScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 7, 10, 0.56)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  closeOnlyBtn: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.lg,
  },
  topSection: {
    gap: spacing.xs,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    alignSelf: 'center',
    marginTop: spacing.xxs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  nowPlayingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.textSecondary,
  },
  albumSub: {
    marginTop: 2,
    color: colors.textMuted,
  },
  artContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  artShadow: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: radii.xl,
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  artwork: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceElevated,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaText: {
    flex: 1,
    gap: 4,
  },
  artistName: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.errorMuted,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
  },
  retryPill: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  retryPillText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  seekSection: {
    gap: 2,
  },
  seekTouchArea: {
    height: 30,
    justifyContent: 'center',
  },
  seekTrack: {
    height: 5,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
  },
  seekFill: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.textPrimary,
  },
  seekThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: radii.full,
    backgroundColor: colors.textPrimary,
    marginLeft: -7,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  secondaryControl: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  skipBtn: {
    padding: spacing.xs,
  },
  skipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.92 }],
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accentLight,
    marginTop: 3,
  },
  repeatOneBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentLight,
  },
  playButton: {
    width: 74,
    height: 74,
    borderRadius: radii.full,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  playButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  playIconOffset: {
    marginLeft: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  footerBtnActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  footerBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  footerBtnTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
});
