import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUIStore } from '../store/uiStore';
import { colors, radii, spacing } from '../theme';

export function ToastBanner() {
  const insets = useSafeAreaInsets();
  const message = useUIStore((s) => s.toastMessage);

  if (!message) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(180)}
      pointerEvents="none"
      style={[styles.wrapper, { top: Math.max(16, insets.top + 10) }]}
    >
      <View style={styles.pill}>
        <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
        <Text numberOfLines={1} style={styles.text}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 200,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glassSurface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});
