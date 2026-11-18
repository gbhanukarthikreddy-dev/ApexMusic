import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { colors, radii, spacing, typography } from '../theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.surface, borderColor: themeColors.border },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: themeColors.errorMuted }]}>
        <Ionicons name="cloud-offline-outline" size={32} color={themeColors.error} />
      </View>
      <Text style={[typography.h3, styles.title, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.message, { color: themeColors.textSecondary }]}>
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryBtn,
            { backgroundColor: themeColors.textPrimary },
            pressed && styles.retryPressed,
          ]}
        >
          <Ionicons name="refresh" size={16} color={themeColors.textInverse} />
          <Text style={[styles.retryText, { color: themeColors.textInverse }]}>Try Again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.errorMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  message: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
  },
  retryPressed: {
    opacity: 0.85,
  },
  retryText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 14,
  },
});
