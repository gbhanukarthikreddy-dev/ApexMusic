import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radii, spacing, typography } from '../theme';
import { getHighResArtwork } from '../utils/format';
import { triggerSelectionHaptic } from '../utils/haptics';

interface MediaCardProps {
  title: string;
  subtitle?: string;
  artwork: string;
  onPress: () => void;
  size?: number;
  circular?: boolean;
  badge?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MediaCard = React.memo(function MediaCard({
  title,
  subtitle,
  artwork,
  onPress,
  size = 154,
  circular = false,
  badge,
}: MediaCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        triggerSelectionHaptic();
        onPress();
      }}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 18, stiffness: 280 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 });
      }}
      style={[styles.container, { width: size }, animatedStyle]}
    >
      <View
        style={[
          styles.imageWrap,
          {
            width: size,
            height: size,
            borderRadius: circular ? radii.full : radii.md,
          },
        ]}
      >
        <Image
          source={{ uri: getHighResArtwork(artwork) }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        {!circular ? (
          <LinearGradient
            colors={['transparent', 'rgba(7, 7, 11, 0.45)']}
            style={styles.bottomShade}
          />
        ) : null}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={[typography.bodyMedium, styles.title, circular && styles.centeredText]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          numberOfLines={1}
          style={[typography.caption, styles.subtitle, circular && styles.centeredText]}
        >
          {subtitle}
        </Text>
      ) : null}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.sm + 2,
  },
  imageWrap: {
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
  },
  badge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(7, 7, 11, 0.78)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radii.xs,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  badgeText: {
    color: colors.accentLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    marginTop: spacing.xs + 2,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    color: colors.textSecondary,
  },
  centeredText: {
    textAlign: 'center',
  },
});
