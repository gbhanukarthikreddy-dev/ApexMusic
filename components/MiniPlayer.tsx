import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePlayerStore } from '../store/playerStore';
import { colors, layout, radii, spacing, typography } from '../theme';
import { getHighResArtwork } from '../utils/format';
import { triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';
import { EqualizerBars } from './EqualizerBars';

interface MiniPlayerProps {
  bottomOffset?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MiniProgressBar = React.memo(function MiniProgressBar() {
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const progress = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0;

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );
});

export function MiniPlayer({ bottomOffset = 0 }: MiniPlayerProps) {
  const router = useRouter();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoadingStream = usePlayerStore((s) => s.isLoadingStream);
  const togglePlayPause = usePlayerStore((s) => s.togglePlayPause);
  const playNext = usePlayerStore((s) => s.playNext);
  const playPrevious = usePlayerStore((s) => s.playPrevious);

  const scale = useSharedValue(1);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const openFullPlayer = useCallback(() => {
    triggerLightHaptic();
    router.push('/player');
  }, [router]);

  const handleNext = useCallback(() => {
    triggerMediumHaptic();
    void playNext(false);
  }, [playNext]);

  const handlePrev = useCallback(() => {
    triggerMediumHaptic();
    void playPrevious();
  }, [playPrevious]);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-14, 14])
        .activeOffsetY([-14, 14])
        .onUpdate((e) => {
          'worklet';
          dragX.value = Math.max(-72, Math.min(72, e.translationX * 0.65));
          dragY.value = e.translationY < 0 ? Math.max(-44, e.translationY * 0.5) : 0;
        })
        .onEnd((e) => {
          'worklet';
          if (e.translationY < -36 && Math.abs(e.translationY) > Math.abs(e.translationX)) {
            scheduleOnRN(openFullPlayer);
          } else if (e.translationX <= -52 || e.velocityX <= -500) {
            scheduleOnRN(handleNext);
          } else if (e.translationX >= 52 || e.velocityX >= 500) {
            scheduleOnRN(handlePrev);
          }
          dragX.value = withSpring(0, { damping: 20, stiffness: 280, mass: 0.75 });
          dragY.value = withSpring(0, { damping: 20, stiffness: 280, mass: 0.75 });
        })
        .onFinalize(() => {
          'worklet';
          dragX.value = withSpring(0, { damping: 20, stiffness: 280, mass: 0.75 });
          dragY.value = withSpring(0, { damping: 20, stiffness: 280, mass: 0.75 });
        }),
    [dragX, dragY, handleNext, handlePrev, openFullPlayer]
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value },
      { scale: scale.value },
    ],
  }));

  if (!currentTrack) return null;

  const artUri = getHighResArtwork(currentTrack.artwork);

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18)}
      exiting={FadeOutDown.duration(180)}
      style={[styles.wrapper, { bottom: bottomOffset }]}
    >
      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          onPress={() => {
            triggerLightHaptic();
            router.push('/player');
          }}
          onPressIn={() => {
            scale.value = withSpring(0.98, { damping: 18, stiffness: 300 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 16, stiffness: 260 });
          }}
          style={[styles.container, animStyle]}
        >
          <Image
            source={{ uri: artUri }}
            style={styles.ambientBg}
            contentFit="cover"
            blurRadius={45}
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['rgba(24, 24, 32, 0.88)', 'rgba(18, 18, 24, 0.96)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ambientOverlay}
          />

          <View style={styles.content}>
            <Image
              source={{ uri: artUri }}
              style={styles.artwork}
              contentFit="cover"
              cachePolicy="memory-disk"
            />

            <View style={styles.meta}>
              <View style={styles.titleRow}>
                <Text numberOfLines={1} style={[typography.bodyMedium, styles.titleText]}>
                  {currentTrack.title}
                </Text>
                <EqualizerBars active={isPlaying} color={colors.accent} size="sm" />
              </View>
              <Text numberOfLines={1} style={typography.caption}>
                {currentTrack.artist}
              </Text>
            </View>

            <View style={styles.controls}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  triggerLightHaptic();
                  togglePlayPause();
                }}
                hitSlop={10}
                style={styles.playPill}
              >
                {isLoadingStream ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={18}
                    color={colors.textInverse}
                    style={!isPlaying ? styles.playNudge : undefined}
                  />
                )}
              </Pressable>

              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  triggerLightHaptic();
                  void playNext(false);
                }}
                hitSlop={10}
                style={styles.controlBtn}
              >
                <Ionicons name="play-skip-forward" size={19} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          <MiniProgressBar />
        </AnimatedPressable>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 45,
  },
  container: {
    height: layout.miniPlayerHeight,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  ambientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.55,
  },
  ambientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  titleText: {
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  playPill: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playNudge: {
    marginLeft: 2,
  },
  controlBtn: {
    padding: spacing.xs,
  },
  progressTrack: {
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});
