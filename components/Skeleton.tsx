import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii, spacing } from '../theme';

interface SkeletonBoxProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({
  width,
  height,
  borderRadius = radii.sm,
  style,
}: SkeletonBoxProps) {
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.9, { duration: 850 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View style={styles.sectionContainer}>
      {[0, 1, 2].map((section) => (
        <View key={section} style={styles.carouselBlock}>
          <SkeletonBox width={160} height={22} style={styles.titleGap} />
          <View style={styles.row}>
            {[0, 1, 2].map((card) => (
              <View key={card} style={styles.card}>
                <SkeletonBox width={148} height={148} borderRadius={radii.md} />
                <SkeletonBox width={120} height={14} style={styles.lineGap} />
                <SkeletonBox width={88} height={12} style={styles.smallGap} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function TrackListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.trackRow}>
          <SkeletonBox width={52} height={52} borderRadius={radii.sm} />
          <View style={styles.trackMeta}>
            <SkeletonBox width="70%" height={15} />
            <SkeletonBox width="45%" height={12} style={styles.smallGap} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function DetailSkeleton() {
  return (
    <View style={styles.detailContainer}>
      <SkeletonBox width={200} height={200} borderRadius={radii.lg} style={styles.centered} />
      <SkeletonBox width={220} height={26} style={styles.centeredGap} />
      <SkeletonBox width={140} height={16} style={styles.centeredSmallGap} />
      <TrackListSkeleton count={5} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.skeletonHighlight,
  },
  sectionContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.xl,
  },
  carouselBlock: {
    gap: spacing.sm,
  },
  titleGap: {
    marginBottom: spacing.xxs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    width: 148,
  },
  lineGap: {
    marginTop: spacing.xs,
  },
  smallGap: {
    marginTop: 6,
  },
  listContainer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  trackMeta: {
    flex: 1,
  },
  detailContainer: {
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  centered: {
    alignSelf: 'center',
  },
  centeredGap: {
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  centeredSmallGap: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
});
